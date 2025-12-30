import type { Signal } from "../client/src/lib/constants";
import type { SignalAnalysis } from "./forexService";

// Helper function to get current time in Kenya (UTC+3)
function getKenyaTime(): Date {
  const KENYA_OFFSET_MS = 3 * 60 * 60 * 1000; // +3 hours in milliseconds
  const nowUTC = new Date();
  return new Date(nowUTC.getTime() + KENYA_OFFSET_MS);
}

// Helper function to format time in Kenya (EAT)
function formatKenyaTime(date: Date): string {
  const KENYA_OFFSET_MS = 3 * 60 * 60 * 1000; // +3 hours in milliseconds
  const kenyaTime = new Date(date.getTime() + KENYA_OFFSET_MS);
  const hours = kenyaTime.getUTCHours().toString().padStart(2, '0');
  const minutes = kenyaTime.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getConfidenceEmoji(confidence: number): string {
  if (confidence >= 90) return "🔥";
  if (confidence >= 70) return "⚡";
  return "⚠";
}

function getRSIStatus(rsi: number): string {
  if (rsi < 30) return "Oversold";
  if (rsi > 70) return "Overbought";
  if (rsi < 45) return "Slightly Oversold";
  if (rsi > 55) return "Slightly Overbought";
  return "Neutral";
}

function getBollingerStatus(breakout: boolean, percentB: number): string {
  if (breakout && percentB > 1) return "Upper breakout (bullish)";
  if (breakout && percentB < 0) return "Lower breakout (bearish)";
  if (percentB > 0.8) return "Near upper band";
  if (percentB < 0.2) return "Near lower band";
  return "Mid-range";
}

function getSMAStatus(price: number, sma20: number, sma50: number, sma200: number): string {
  if (price > sma20 && price > sma50 && price > sma200) return "Above all SMAs (bullish)";
  if (price < sma20 && price < sma50 && price < sma200) return "Below all SMAs (bearish)";
  if (price > sma20 && price > sma50) return "Above SMA20/50";
  if (price < sma20 && price < sma50) return "Below SMA20/50";
  return "Mixed";
}

function isSessionHotZone(): { isHotZone: boolean; session: string } {
  const kenyaTime = getKenyaTime();
  const hour = kenyaTime.getHours();
  let session = "EVENING";
  let isHotZone = false;

  if (hour >= 7 && hour < 12) {
    session = "MORNING";
    isHotZone = true; // London session
  } else if (hour >= 12 && hour < 17) {
    session = "AFTERNOON";
    isHotZone = true; // London + New York overlap
  } else {
    session = "EVENING";
    isHotZone = false; // Asian session - lower volume
  }

  return { isHotZone, session };
}

export async function sendToTelegram(
  signal: Signal,
  analysis?: SignalAnalysis,
  isAuto: boolean = false
): Promise<boolean> {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("[telegram] Telegram credentials not configured");
    return false;
  }

  // CRITICAL FILTER: Skip sending if confidence is 0 (trade was skipped by risk filters)
  if (signal.confidence === 0 || signal.confidence <= 0) {
    console.log(`[TELEGRAM BLOCKED] ${signal.pair} - Confidence is ${signal.confidence}% (risk filter triggered)`);
    console.log(`[TELEGRAM BLOCKED] Reason: Signal failed strict safety filters and should not be traded`);
    return false;
  }

  // Additional safety check: verify signal has valid reasoning
  if (analysis?.reasoning && analysis.reasoning.some(r => r.includes("BLOCKED") || r.includes("SKIP"))) {
    console.log(`[TELEGRAM BLOCKED] ${signal.pair} - Analysis contains blocking reason`);
    return false;
  }

  console.log(`[TELEGRAM SENDING] ${signal.pair} ${signal.type} - Confidence: ${signal.confidence}% ✅`);

  try {
    const confidenceEmoji = getConfidenceEmoji(signal.confidence);
    const modeLabel = isAuto ? "AUTO" : "MANUAL";
    const { isHotZone, session } = isSessionHotZone();

    // Extract advanced metrics from reasoning
    let confluenceScore = 70;
    let htfAlignment = "Unknown";
    let candleStrength = 0;
    let scoreDiff = 0;
    let riskReward = "1:2";
    
    if (analysis?.reasoning) {
      const confluenceMatch = analysis.reasoning.find(r => r.includes("Final Confluence:"));
      if (confluenceMatch) {
        const match = confluenceMatch.match(/Final Confluence: (\d+)%/);
        if (match) confluenceScore = parseInt(match[1]);
        
        const scoreMatch = confluenceMatch.match(/Score diff: (\d+)/);
        if (scoreMatch) scoreDiff = parseInt(scoreMatch[1]);
        
        const rrMatch = confluenceMatch.match(/R\/R: ([\d:.]+)/);
        if (rrMatch) riskReward = rrMatch[1];
      }
      
      const htfMatch = analysis.reasoning.find(r => r.includes("HTF Alignment:"));
      if (htfMatch) {
        const alignmentPart = htfMatch.split('|')[0].replace('HTF Alignment:', '').trim();
        htfAlignment = alignmentPart;
        
        const candleMatch = htfMatch.match(/Candle Strength: (\d+)/);
        if (candleMatch) candleStrength = parseInt(candleMatch[1]);
      }
    }

    // Build simplified message
    let message = `NEW SIGNAL ALERT 🚀\n`;
    message += `📊 Pair:\n${signal.pair}\n`;
    message += `⚡ Type:\n${signal.type === "CALL" ? "🟢 BUY/CALL" : "🔴 SELL/PUT"}\n`;
    message += `⏱ Timeframe:\n${signal.timeframe}\n`;
    message += `⏰ Start Time:\n${signal.startTime}\n`;
    message += `🏁 End Time:\n${signal.endTime}\n`;
    message += `Confidence: ${signal.confidence}%\n\n`;
    message += `SIGNAL PASSED TRADE`;

    console.log(`[TELEGRAM] Sending simplified message to chat_id: ${TELEGRAM_CHAT_ID}`);
    console.log(`[TELEGRAM] Bot token (first 10 chars): ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
    
    let result: any = { ok: false };
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries && !result.ok) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: message,
              parse_mode: "HTML",
            }),
          }
        );

        result = await response.json();
        console.log(`[TELEGRAM] Attempt ${retryCount + 1} - Response status: ${response.status}`);
        
        if (result.ok) break;

        if (result.error_code === 429) { // Rate limited
          const retryAfter = (result.parameters?.retry_after || 5) * 1000;
          console.warn(`[TELEGRAM] Rate limited. Retrying after ${retryAfter}ms`);
          await new Promise(resolve => setTimeout(resolve, retryAfter));
        } else {
          console.error(`[TELEGRAM ERROR] ${result.description}`);
          break; // Don't retry for other errors (like 400 Bad Request)
        }
      } catch (err) {
        console.error(`[TELEGRAM EXCEPTION] Attempt ${retryCount + 1}:`, err);
      }
      retryCount++;
      if (!result.ok && retryCount < maxRetries) await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return result.ok;
  } catch (error: any) {
    console.error("[TELEGRAM EXCEPTION]", error.message);
    console.error("[TELEGRAM EXCEPTION STACK]", error.stack);
    return false;
  }
}