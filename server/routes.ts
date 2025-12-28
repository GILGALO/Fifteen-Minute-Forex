import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  getForexQuote,
  getForexCandles,
  getAllQuotes,
  generateSignalAnalysis,
  analyzeTechnicals,
  type SignalAnalysis,
} from "./forexService";
import { sendToTelegram } from "./telegram";
import { log } from "./index";

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
      const marketStatus = isMarketOpen();
      res.json({ quotes, marketStatus });
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
        FOREX_PAIRS.map(pair => generateSignalAnalysis(pair, tf, apiKey, maxRescans, minConfidenceThreshold))
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
    const now = new Date();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    
    // Valid M5 opens: minute % 5 === 0 AND within first 1 second
    const isM5Open = minute % 5 === 0;
    const isFirstSecond = second <= 1;
    
    if (!isM5Open) {
      return false; // Mid-candle (minutes 1-4 are BLOCKED)
    }
    
    if (!isFirstSecond) {
      return false; // Too late in the candle open
    }
    
    return true;
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

  // AUTO-SCANNER: Run frequently, but ONLY dispatch signals at M5 candle opens
  const AUTO_SCAN_INTERVAL_MS = 30 * 1000; // Check every 30 seconds for candle opens
  let autoScanEnabled = true;
  let lastSignalDispatchTime = 0;
  const MIN_DISPATCH_INTERVAL = 5 * 60 * 1000; // Prevent duplicate signals within 5 minutes

  async function runAutoScan() {
    if (!autoScanEnabled) return;
    
    try {
      const signals = await Promise.all(
        FOREX_PAIRS.map(pair => generateSignalAnalysis(pair, "M15", apiKey, 5, 75))
      );
      
      const validSignals = signals.filter(s => s.confidence >= 75);
      const highProbSignals = signals.filter(s => s.confidence >= 85 && s.signalGrade !== "SKIPPED");
      
      log(`[AUTO-SCAN M15] Scan complete - ${validSignals.length} valid, ${highProbSignals.length} high-prob | Signals queued for dispatch`, "auto-scan");
      
      // ══════════════════════════════════════════════════════════════════════
      // HARD TIMING GATE: Only dispatch at M5 candle opens
      // ══════════════════════════════════════════════════════════════════════
      const now = Date.now();
      const timeSinceLastDispatch = now - lastSignalDispatchTime;
      
      if (!isValidM5CandleOpenTime()) {
        log(`[TIMING GATE] ❌ NOT at M5 candle open - signals BLOCKED (next valid: ${getM5CandleOpenTimeEAT()})`, "timing-gate");
        return; // Do NOT send signals
      }
      
      if (timeSinceLastDispatch < MIN_DISPATCH_INTERVAL) {
        log(`[TIMING GATE] ⚠️ Last dispatch ${Math.floor(timeSinceLastDispatch / 1000)}s ago - prevent duplicates`, "timing-gate");
        return; // Prevent duplicate signals
      }
      
      // Dispatch signals
      log(`[TIMING GATE] ✅ M5 CANDLE OPEN CONFIRMED (${getM5CandleOpenTimeEAT()}) - DISPATCHING SIGNALS`, "timing-gate");
      lastSignalDispatchTime = now;
      
      for (const signal of highProbSignals) {
        const kenyaOffset = 3 * 60 * 60 * 1000;
        const kenyaTime = new Date(now + kenyaOffset);
        const startTime = kenyaTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(kenyaTime.getTime() + 5 * 60 * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        
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
        
        log(`[DISPATCH] ${signal.pair} ${signal.signalType} | Grade ${signal.signalGrade} | Entry: ${signal.entry}`, "dispatch");
        await sendToTelegram(signalData, signal, true);
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

  return httpServer;
}
