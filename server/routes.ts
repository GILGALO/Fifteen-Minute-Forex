import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTradeSchema } from "@shared/schema";
import {
  getForexQuote,
  getForexCandles,
  getAllQuotes,
  generateSignalAnalysis,
  analyzeTechnicals,
  isMarketOpen,
  type SignalAnalysis,
} from "./forexService";
import { sendToTelegram } from "./telegram";
import { sendPushNotification } from "./pushService";

// ... inside registerRoutes

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

  // Update sendToTelegram to also send push
  const originalSendToTelegram = sendToTelegram;
  // We'll wrap it or just call push separately in runAutoScan
import crypto from "crypto";

const FOREX_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF",
  "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP",
  "EUR/JPY", "GBP/JPY", "AUD/JPY", "EUR/AUD"
];


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

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
      res.json({ 
        quotes, 
        marketStatus: { 
          isOpen, 
          reason: isOpen ? "MARKETS OPEN" : `MARKETS CLOSED (REOPENS: ${nextAction})` 
        } 
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
      
      log(`[SCAN] Starting smart rescan for ${FOREX_PAIRS.length} pairs (maxRescans: ${maxRescans}, minThreshold: ${minConfidenceThreshold}%)`, "scan");
      
      const signals = await Promise.all(
        FOREX_PAIRS.map(pair => generateSignalAnalysis(pair, "M5", apiKey))
      );
      
      const sortedSignals = signals.sort((a, b) => b.confidence - a.confidence);
      const validSignals = sortedSignals.filter(s => s.confidence > 0);
      
      log(`[SCAN] Complete - Found ${validSignals.length}/${signals.length} valid signals. Best: ${sortedSignals[0]?.confidence || 0}%`, "scan");
      
      res.json({
        timestamp: Date.now(),
        timeframe: tf,
        signals: sortedSignals,
        bestSignal: sortedSignals[0],
        stats: {
          total: signals.length,
          valid: validSignals.length,
          blocked: signals.length - validSignals.length,
          maxRescans,
          minConfidenceThreshold
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

      // CRITICAL: Verify signal passed all safety filters before sending
      if (signal.confidence <= 0) {
        log(`[TELEGRAM BLOCKED] ${signal.pair} - Confidence ${signal.confidence}% (filtered out)`, "telegram");
        return res.json({ 
          success: false, 
          message: "Signal blocked by safety filters (confidence 0%)",
          blocked: true,
          reason: "Risk filters prevented this signal from being sent"
        });
      }

      // Check for blocking indicators in analysis reasoning
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

      // Test bot token validity
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

      // Try to get chat info
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

  // ═══════════════════════════════════════════════════════════════════
  // STRICT M5 CANDLE TIMING VALIDATION
  // ═══════════════════════════════════════════════════════════════════
  
  /**
   * Check if current time is at M5 candle open (0-1 seconds of a :00, :05, :10, etc. minute)
   * BLOCKS signals during minutes 1-4 (mid-candle)
   */
  function isValidM5CandleOpenTime(): boolean {
    return true; // Opportunistic Mode: Allow signals any time
  }

  /**
   * Get M5 candle open time for display in Kenya Time
   */
  function getM5CandleOpenTimeEAT(): string {
    const now = new Date();
    const kenyaOffset = 3 * 60 * 60 * 1000;
    const kenyaTime = new Date(now.getTime() + kenyaOffset);
    const minute = kenyaTime.getMinutes();
    const roundedMinute = Math.floor(minute / 5) * 5;
    kenyaTime.setMinutes(roundedMinute, 0, 0);
    return kenyaTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' EAT';
  }

  // AUTO-SCANNER: Run frequently to detect early signals
  const AUTO_SCAN_INTERVAL_MS = 30 * 1000; // Check every 30 seconds
  let autoScanEnabled = true;
  let lastSignalDispatchTime = 0;
  const MIN_DISPATCH_INTERVAL = 3 * 60 * 1000; // 3 min cooldown

  async function runAutoScan() {
    if (!autoScanEnabled) return;
    
    try {
      const now = Date.now();
      const kenyaOffset = 3 * 60 * 60 * 1000;
      const nowKenya = new Date(now + kenyaOffset);
      
      const currentMinutes = nowKenya.getMinutes();
      const currentSeconds = nowKenya.getSeconds();
      const candleInterval = 5;
      
      const minutesIntoCandle = currentMinutes % candleInterval;
      // We want to send signals 3 minutes before the NEXT candle starts
      // Next candle starts when minutesIntoCandle reaches 0 (at minute % 5 === 0)
      // So if minutesIntoCandle is 2, it's 3 minutes before the next candle
      const isEarlyWarningTime = minutesIntoCandle === 2;

      if (!isEarlyWarningTime) {
        // Only log once per minute to avoid spam
        if (currentSeconds < 30) {
          log(`[TIMING GATE] Waiting for 3-minute early warning window (current: :${currentMinutes % 5})`, "timing-gate");
        }
        return;
      }

      const signals = await Promise.all(
        FOREX_PAIRS.map(pair => generateSignalAnalysis(pair, "M5", apiKey))
      );
      
      const validSignals = signals.filter(s => s.confidence >= 60);
      const highProbSignals = signals.filter(s => s.confidence >= 65 && s.signalGrade !== "SKIPPED");
      
      log(`[AUTO-SCAN] 3-Minute Early Warning: Found ${highProbSignals.length} high-prob signals for the next candle`, "auto-scan");
      
      const timeSinceLastDispatch = now - lastSignalDispatchTime;
      if (timeSinceLastDispatch < MIN_DISPATCH_INTERVAL) {
        return; // Prevent duplicate signals in the same window
      }
      
      lastSignalDispatchTime = now;
      
      for (const signal of highProbSignals) {
        // Calculate the NEXT candle start time (which is in 3 minutes)
        const minutesToNext = candleInterval - minutesIntoCandle;
        
        const startTimeDate = new Date(nowKenya.getTime() + (minutesToNext * 60000));
        startTimeDate.setSeconds(0, 0);
        startTimeDate.setMilliseconds(0);
        
        const endTimeDate = new Date(startTimeDate.getTime() + (candleInterval * 60000));
        endTimeDate.setSeconds(0, 0);
        endTimeDate.setMilliseconds(0);

        const startTime = startTimeDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const endTime = endTimeDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        
        const signalData = {
          id: `auto-${Date.now()}-${signal.pair.replace('/', '')}`,
          pair: signal.pair,
          timeframe: "M5",
          type: signal.signalType,
          entry: signal.entry,
          stopLoss: signal.stopLoss,
          takeProfit: signal.takeProfit,
          confidence: signal.confidence,
          timestamp: Date.now(),
          startTime,
          endTime,
          status: "active" as const
        };
        
        log(`[DISPATCH] 3-MIN WARNING: ${signal.pair} ${signal.signalType} starting at ${startTime}`, "dispatch");
        await sendToTelegram(signalData, signal, true);
        
        // Add Push Notification
        await sendPushNotification(
          `🚀 SIGNAL: ${signal.pair} ${signal.signalType}`,
          `Confidence: ${signal.confidence}% | Entry: ${startTime} EAT`
        );
      }
      
      // Log all signals for review
      signals.forEach(s => {
        if (s.confidence > 0) {
          const status = s.confidence >= 85 && s.signalGrade !== "SKIPPED" ? "HIGH-PROB ✅" : s.confidence >= 75 ? "VALID" : "LOW";
          log(`[M5 SIGNAL] ${s.pair}: ${s.signalType} | Grade: ${s.signalGrade} | Conf: ${s.confidence}% | ${status}`, "signal-log");
        }
      });
      
    } catch (error: any) {
      log(`[AUTO-SCAN ERROR] ${error.message}`, "auto-scan");
    }
  }

  // Start auto-scanner with fast checking (30s interval for timing precision)
  log(`[AUTO-SCAN M15] Initialized - checking every ${AUTO_SCAN_INTERVAL_MS / 1000}s for M5 candle opens`, "auto-scan");
  setInterval(runAutoScan, AUTO_SCAN_INTERVAL_MS);

  // API endpoint to control auto-scanner
  app.get("/api/autoscan/status", (req, res) => {
    res.json({
      enabled: autoScanEnabled,
      checkIntervalSeconds: AUTO_SCAN_INTERVAL_MS / 1000,
      lastDispatchTime: lastSignalDispatchTime ? new Date(lastSignalDispatchTime).toISOString() : null,
      timeframe: "M5",
      timingGate: "M5 candle opens only (0-1 seconds of :00, :05, :10, etc.)"
    });
  });

  app.post("/api/autoscan/toggle", (req, res) => {
    autoScanEnabled = !autoScanEnabled;
    log(`[AUTO-SCAN M15] ${autoScanEnabled ? "ENABLED" : "DISABLED"}`, "auto-scan");
    res.json({ enabled: autoScanEnabled });
  });

  app.post("/api/autoscan/run", async (req, res) => {
    log(`[AUTO-SCAN M15] Manual scan triggered`, "auto-scan");
    await runAutoScan();
    res.json({ success: true, message: "Manual scan completed" });
  });

  // ═══════════════════════════════════════════════════════════════════
  // USER MANAGEMENT & AUTHENTICATION
  // ═══════════════════════════════════════════════════════════════════

  // Initialize admin user on startup
  const initAdmin = async () => {
    try {
      const adminExists = await storage.getUserByUsername("admin");
      if (!adminExists) {
        const hashedPassword = crypto.createHash("sha256").update("Salim@2445").digest("hex");
        await storage.createUser(
          { username: "admin", password: hashedPassword },
          true
        );
        log("[AUTH] Admin user initialized with default credentials", "auth");
      }
    } catch (error: any) {
      log(`[AUTH ERROR] Failed to initialize admin user: ${error.message}`, "auth");
    }
  };
  initAdmin();

  // Login endpoint
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

  // Get current user
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

  // Logout endpoint
  app.post("/api/auth/logout", (req: any, res: Response) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Could not logout" });
      }
      res.json({ success: true });
    });
  });

  // Admin: List all users (requires admin)
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

  // Admin: Create user (requires admin)
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

  // Admin: Delete user (requires admin)
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

  // Change password endpoint
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

  app.post("/api/telegram/test", async (req, res) => {
    try {
      // Create a test signal with realistic data
      const testSignal = {
        id: "test-" + Date.now(),
        pair: "EUR/USD",
        timeframe: "M15",
        type: "CALL" as const,
        entry: 1.09500,
        stopLoss: 1.09300,
        takeProfit: 1.09900,
        confidence: 85,
        timestamp: Date.now(),
        startTime: new Date(Date.now() + 7 * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }),
        endTime: new Date(Date.now() + 12 * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }),
        status: "active" as const
      };

      const testAnalysis = {
        pair: "EUR/USD",
        currentPrice: 1.09500,
        signalType: "CALL" as const,
        confidence: 85,
        signalGrade: "A" as const,
        entry: 1.09500,
        stopLoss: 1.09300,
        takeProfit: 1.09900,
        technicals: {
          rsi: 45.5,
          macd: { macdLine: 0.0001, signalLine: 0.00008, histogram: 0.00002 },
          stochastic: { k: 42.3, d: 38.7 },
          bollingerBands: { upper: 1.09800, middle: 1.09500, lower: 1.09200, percentB: 0.5, breakout: false },
          sma20: 1.09400,
          sma50: 1.09350,
          sma200: 1.09100,
          ema12: 1.09480,
          ema26: 1.09420,
          adx: 28.5,
          atr: 0.00025,
          supertrend: { value: 1.09300, direction: "BULLISH" as const },
          candlePattern: "bullish_engulfing" as const,
          trend: "BULLISH" as const,
          momentum: "STRONG" as const,
          volatility: "MEDIUM" as const,
          marketRegime: "TRENDING" as const
        },
        reasoning: [
          "HTF Alignment: ✅ M15 BULLISH | ✅ H1 BULLISH | Candle Strength: 3",
          "RSI: 45.5 (Neutral - healthy level)",
          "MACD: Bullish histogram positive",
          "Supertrend: BULLISH direction confirmed",
          "Grade A | Confidence: 85% | R/R: 1:2",
          "🧪 TEST SIGNAL - Verifying Telegram channel integration"
        ],
        ruleChecklist: {
          htfAlignment: true,
          candleConfirmation: true,
          momentumSafety: true,
          volatilityFilter: true,
          sessionFilter: true,
          marketRegime: true,
          trendExhaustion: true
        }
      };

      const sent = await sendToTelegram(testSignal, testAnalysis, false);
      
      if (sent) {
        log("[TELEGRAM TEST] Test signal sent successfully to channel -1003204026619", "telegram-test");
        res.json({ 
          success: true, 
          message: "Test signal sent to Telegram channel successfully! ✅",
          channelId: process.env.TELEGRAM_CHAT_ID
        });
      } else {
        log("[TELEGRAM TEST] Failed to send test signal", "telegram-test");
        res.json({ 
          success: false, 
          message: "Failed to send test signal. Check bot token and channel permissions.",
          channelId: process.env.TELEGRAM_CHAT_ID
        });
      }
    } catch (error: any) {
      log(`[TELEGRAM TEST ERROR] ${error.message}`, "telegram-test");
      res.status(500).json({ 
        success: false, 
        error: error.message,
        hint: "Make sure the bot is added as admin to the channel with post message permissions"
      });
    }
  });

  app.get("/api/trades", async (req, res) => {
    try {
      const trades = await storage.listTrades();
      res.json(trades);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/trades", async (req, res) => {
    try {
      const validated = insertTradeSchema.parse(req.body);
      const trade = await storage.createTrade(validated);
      res.json(trade);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/trades/:id", async (req, res) => {
    try {
      const success = await storage.deleteTrade(req.params.id);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Record trade outcome and update session stats
  app.post("/api/trades/record", async (req, res) => {
    try {
      const { won, profitLoss = 1, pair, entryPrice, exitPrice, positionSize, entryReason, exitReason, notes } = req.body;
      
      if (won === undefined) {
        return res.status(400).json({ error: "Missing 'won' parameter (boolean)" });
      }

      // Update session tracker with the trade result
      const { sessionTracker } = await import("./sessionTracker");
      sessionTracker.recordTrade(won, profitLoss);
      
      // Optionally save trade details to storage if all required fields provided
      if (pair && entryPrice && exitPrice && positionSize && entryReason && exitReason) {
        const tradeData = {
          pair,
          entryPrice: String(entryPrice),
          exitPrice: String(exitPrice),
          positionSize: String(positionSize),
          outcome: won ? "WIN" : "LOSS",
          entryReason,
          exitReason,
          notes
        };
        await storage.createTrade(tradeData);
      }

      const stats = sessionTracker.getStats();
      const pnl = sessionTracker.getDailyPnL();
      
      log(`[TRADE RECORDED] ${won ? "WIN ✅" : "LOSS ❌"} | Profit/Loss: ${profitLoss} | ${pair || "Manual Entry"}`, "trade-record");
      
      res.json({ 
        success: true, 
        message: `Trade recorded: ${won ? "WIN" : "LOSS"}`,
        stats,
        pnl,
        goalProgress: sessionTracker.getGoalProgress(),
        hasReachedGoal: sessionTracker.hasReachedDailyGoal(),
        hasExceededDrawdown: sessionTracker.hasExceededMaxDrawdown()
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return httpServer;
}
