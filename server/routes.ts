import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTradeSchema } from "@shared/schema";
import { getForexQuote, getForexCandles, getAllQuotes, generateSignalAnalysis, analyzeTechnicals, isMarketOpen, type SignalAnalysis } from "./forexService";
import { isNewsEventTime } from "./newsEvents";
import { sendToTelegram } from "./telegram";
import { log } from "./index";
import crypto from "crypto";
import { sendPushNotification } from "./pushService";

const FOREX_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF",
  "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP",
  "EUR/JPY", "GBP/JPY", "AUD/JPY", "EUR/AUD",
  "CAD/JPY", "EUR/CAD"
];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  app.post("/api/push/subscribe", async (req, res) => {
    try {
      const { subscription } = req.body;
      if (!subscription) return res.status(400).json({ error: "Missing subscription" });
      await storage.addPushSubscription({ subscription });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/forex/quote/:pair", async (req, res) => {
    try {
      const pair = decodeURIComponent(req.params.pair);
      const quote = await getForexQuote(pair, apiKey);
      res.json(quote);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/forex/quotes", async (req, res) => {
    try {
      const quotes = await getAllQuotes(FOREX_PAIRS, apiKey);
      const { isOpen, nextAction } = isMarketOpen();
      const newsStatus = isNewsEventTime();
      res.json({ 
        quotes, 
        marketStatus: { 
          isOpen, 
          reason: isOpen ? "MARKETS OPEN" : `MARKETS CLOSED (REOPENS: ${nextAction})` 
        },
        newsStatus
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/forex/candles/:pair", async (req, res) => {
    try {
      const pair = decodeURIComponent(req.params.pair);
      const interval = (req.query.interval as string) || "15min";
      const candles = await getForexCandles(pair, interval, apiKey);
      res.json(candles);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/forex/analysis/:pair", async (req, res) => {
    try {
      const pair = decodeURIComponent(req.params.pair);
      const interval = (req.query.interval as string) || "15min";
      const candles = await getForexCandles(pair, interval, apiKey);
      const technicals = analyzeTechnicals(candles);
      res.json({
        pair,
        currentPrice: candles[candles.length - 1].close,
        technicals,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/scanner/state", async (req, res) => {
    try {
      const state = await storage.getScannerState();
      res.json(state);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/scanner/state", async (req, res) => {
    try {
      const state = await storage.updateScannerState(req.body);
      res.json(state);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/forex/signals", async (req, res) => {
    try {
      const signals = await storage.listSignals();
      res.json(signals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/forex/signal", async (req, res) => {
    try {
      const { pair, timeframe } = req.body;
      if (!pair || !timeframe) {
        return res.status(400).json({ error: "Missing pair or timeframe" });
      }
      const signal = await generateSignalAnalysis(pair, timeframe, apiKey);
      res.json(signal);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/forex/scan", async (req, res) => {
    try {
      const { timeframe, maxRescans = 5, minConfidenceThreshold = 70 } = req.body;
      const tf = timeframe || "M15";
      
      // Check scanner state - respect auto/manual mode toggle
      const scannerState = await storage.getScannerState();
      if (scannerState.autoMode !== "true" && scannerState.scanMode !== "true") {
        return res.json({
          timestamp: Date.now(),
          timeframe: tf,
          signals: [],
          bestSignal: null,
          stats: {
            total: 0,
            valid: 0,
            blocked: 0,
            maxRescans,
            minConfidenceThreshold
          },
          scanPaused: true
        });
      }
      
      log(`[SCAN] Starting smart rescan for ${FOREX_PAIRS.length} pairs (maxRescans: ${maxRescans}, minThreshold: ${minConfidenceThreshold}%)`, "scan");
      
      const signals = await Promise.all(
        FOREX_PAIRS.map(pair => generateSignalAnalysis(pair, "M5", apiKey))
      );
      
      const sortedSignals = signals.sort((a, b) => b.confidence - a.confidence);
      // Filter out signals that are unconfirmed (SKIPPED) or have 0 confidence
      const validSignals = sortedSignals.filter(s => s.confidence > 0 && s.signalGrade !== "SKIPPED");
      
      // Send only the BEST signal per turn (one signal at a time)
      const bestSignal = validSignals[0] || null;
      const signalsToReturn = bestSignal ? [bestSignal] : [];
      
      log(`[SCAN] Complete - Found ${validSignals.length}/${signals.length} valid signals. Best: ${bestSignal?.confidence || 0}%`, "scan");
      
      res.json({
        timestamp: Date.now(),
        timeframe: tf,
        signals: signalsToReturn,
        bestSignal: bestSignal,
        stats: {
          total: signals.length,
          valid: validSignals.length,
          blocked: signals.length - validSignals.length,
          maxRescans,
          minConfidenceThreshold,
          availableSignals: validSignals.length
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/telegram/send", async (req, res) => {
    try {
      const { signal, analysis, isAuto } = req.body;
      if (!signal) {
        return res.status(400).json({ error: "Missing signal data" });
      }

      if (signal.confidence <= 0) {
        log(`[TELEGRAM BLOCKED] ${signal.pair} - Confidence ${signal.confidence}% (filtered out)`, "telegram");
        return res.json({ 
          success: false, 
          message: "Signal blocked by safety filters (confidence 0%)",
          blocked: true,
          reason: "Risk filters prevented this signal from being sent"
        });
      }

      if (analysis?.reasoning) {
        const hasBlockingReason = analysis.reasoning.some((r: string) => 
          r.includes("BLOCKED") || r.includes("SKIP:") || r.includes("🚫") || r.includes("TRADE BLOCKED")
        );
        if (hasBlockingReason) {
          log(`[TELEGRAM BLOCKED] ${signal.pair} - Contains blocking reason in analysis`, "telegram");
          return res.json({ 
            success: false, 
            message: "Signal blocked by analysis filters",
            blocked: true,
            reason: analysis.reasoning.find((r: string) => r.includes("BLOCKED") || r.includes("SKIP"))
          });
        }
      }

      const sent = await sendToTelegram(signal, analysis, isAuto);
      res.json({ 
        success: sent, 
        blocked: false,
        message: sent ? "Signal sent to Telegram ✅" : "Telegram not configured or failed" 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message, success: false });
    }
  });

  app.get("/api/telegram/status", (req, res) => {
    const configured = !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
    res.json({ configured });
  });

  app.get("/api/session/stats", async (req, res) => {
    try {
      const { sessionTracker } = await import("./sessionTracker");
      const stats = sessionTracker.getStats();
      const pnl = sessionTracker.getDailyPnL();
      const goalProgress = sessionTracker.getGoalProgress();
      const hasReachedGoal = sessionTracker.hasReachedDailyGoal();
      const hasExceededDrawdown = sessionTracker.hasExceededMaxDrawdown();
      
      res.json({
        stats,
        pnl,
        goalProgress,
        hasReachedGoal,
        hasExceededDrawdown,
        goalThreshold: stats.sessionGoal / 100,
        drawdownThreshold: stats.maxDrawdown / 100
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/telegram/verify", async (req, res) => {
    try {
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

      if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        return res.json({
          success: false,
          error: "Missing credentials",
          botToken: !!TELEGRAM_BOT_TOKEN,
          chatId: !!TELEGRAM_CHAT_ID
        });
      }

      const botInfoResponse = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
      );
      const botInfo = await botInfoResponse.json();

      if (!botInfo.ok) {
        return res.json({
          success: false,
          error: "Invalid bot token",
          details: botInfo
        });
      }

      const chatInfoResponse = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChat?chat_id=${TELEGRAM_CHAT_ID}`
      );
      const chatInfo = await chatInfoResponse.json();

      res.json({
        success: true,
        bot: {
          id: botInfo.result.id,
          username: botInfo.result.username,
          name: botInfo.result.first_name
        },
        chat: chatInfo.ok ? {
          id: chatInfo.result.id,
          title: chatInfo.result.title || chatInfo.result.username,
          type: chatInfo.result.type
        } : {
          error: chatInfo.description,
          chatId: TELEGRAM_CHAT_ID
        },
        credentials: {
          botToken: `${TELEGRAM_BOT_TOKEN.substring(0, 10)}...`,
          chatId: TELEGRAM_CHAT_ID
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  app.get("/api/auth/me", async (req: any, res: Response) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          isAdmin: user.isAdmin === "true" 
        } 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req: any, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
      if (user.password !== hashedPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      (req.session as any).userId = user.id;
      (req.session as any).isAdmin = user.isAdmin === "true";

      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          isAdmin: user.isAdmin === "true" 
        } 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req: any, res: Response) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Could not logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/admin/users", async (req: any, res: Response) => {
    try {
      const isAdmin = (req.session as any)?.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const users = await storage.listUsers();
      res.json({ 
        users: users.map(u => ({ 
          id: u.id, 
          username: u.username, 
          isAdmin: u.isAdmin === "true" 
        })) 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/users", async (req: any, res: Response) => {
    try {
      const isAdmin = (req.session as any)?.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { username, password } = req.body;
      const validation = insertUserSchema.safeParse({ username, password });
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid input" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
      const user = await storage.createUser({ username, password: hashedPassword });

      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          isAdmin: user.isAdmin === "true" 
        } 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/users/:id", async (req: any, res: Response) => {
    try {
      const isAdmin = (req.session as any)?.isAdmin;
      if (!isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.isAdmin === "true") {
        return res.status(400).json({ error: "Cannot delete admin users" });
      }

      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/change-password", async (req: any, res: Response) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const currentHashedPassword = crypto.createHash("sha256").update(currentPassword).digest("hex");
      if (user.password !== currentHashedPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const newHashedPassword = crypto.createHash("sha256").update(newPassword).digest("hex");
      await storage.updateUserPassword(userId, newHashedPassword);

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AUTO-SCANNER
  const AUTO_SCAN_INTERVAL_MS = 30 * 1000;
  let lastSignalDispatchTime = 0;
  const MIN_DISPATCH_INTERVAL = 4 * 60 * 1000; // Increased to 4m to ensure current signal finishes (5m duration)
  let lastSignalEndTime: number = 0;

  async function runAutoScan() {
    try {
      const now = Date.now();
      
      // Strict Timing Lock: Don't scan if a signal is currently active (within its 5m window)
      if (now < lastSignalEndTime) {
        return;
      }

      // Check scanner state - respect autoMode toggle
      const scannerState = await storage.getScannerState();
      if (scannerState.autoMode !== "true") return;

      const kenyaOffset = 3 * 60 * 60 * 1000;
      const nowKenya = new Date(now + kenyaOffset);
      const currentMinutes = nowKenya.getMinutes();
      const candleInterval = 5;
      const minutesIntoCandle = currentMinutes % candleInterval;
      
      // We scan at the 2-minute mark of the current candle to prepare for the NEXT candle
      if (minutesIntoCandle !== 2) return;

      const signals = await Promise.all(
        FOREX_PAIRS.map(pair => generateSignalAnalysis(pair, "M5", apiKey))
      );
      
      const highProbSignals = signals.filter(s => s.confidence >= 65 && s.signalGrade !== "SKIPPED");
      
      if (now - lastSignalDispatchTime < MIN_DISPATCH_INTERVAL) return;
      
      if (highProbSignals.length > 0) {
        // Dispatch only the single best signal from this turn
        const bestAutoSignal = highProbSignals.sort((a, b) => b.confidence - a.confidence)[0];
        
        const minutesToNext = candleInterval - minutesIntoCandle;
        const startTimeDate = new Date(nowKenya.getTime() + (minutesToNext * 60000));
        startTimeDate.setSeconds(0, 0);
        const startTime = startTimeDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        
        const endTimeDate = new Date(startTimeDate.getTime() + (5 * 60000));
        const endTime = endTimeDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        
        // Set the global lock for the end time of this signal
        lastSignalEndTime = endTimeDate.getTime();
        lastSignalDispatchTime = now;

        const signalData = {
          id: `auto-${Date.now()}-${bestAutoSignal.pair.replace('/', '')}`,
          pair: bestAutoSignal.pair,
          timeframe: "M5",
          type: bestAutoSignal.signalType,
          entry: bestAutoSignal.entry,
          stopLoss: bestAutoSignal.stopLoss,
          takeProfit: bestAutoSignal.takeProfit,
          confidence: bestAutoSignal.confidence,
          timestamp: Date.now(),
          startTime,
          endTime,
          status: "active" as const
        };
        
        // PERSIST the signal so it shows up in the App Dashboard
        await storage.createSignal(signalData);
        
        await sendToTelegram(signalData, bestAutoSignal, true);
        await sendPushNotification(
          `🚀 SIGNAL: ${bestAutoSignal.pair} ${bestAutoSignal.signalType}`,
          `Confidence: ${bestAutoSignal.confidence}% | Entry: ${startTime} EAT`
        );
      }
    } catch (error: any) {
      log(`[AUTO-SCAN ERROR] ${error.message}`, "auto-scan");
    }
  }

  setInterval(runAutoScan, AUTO_SCAN_INTERVAL_MS);

  return httpServer;
}
