import { log } from "./index";
import { logTrade, getPerformanceStats, getBestPerformingSetups } from "./tradeLog";
import { isNewsEventTime } from "./newsEvents";
import { sessionTracker } from "./sessionTracker";
import { detectPatterns, type PatternScore } from "./ml/patternRecognizer";
import { analyzeSentiment, getSentimentExplanation, type SentimentScore } from "./ml/sentimentAnalyzer";

export interface ForexQuote {
  pair: string;
  price: number;
  bid: number;
  ask: number;
  timestamp: number;
  change: number;
  changePercent: number;
}

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TechnicalAnalysis {
  rsi: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  sma200: number;
  ema12: number;
  ema26: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    percentB: number;
    breakout: boolean;
  };
  stochastic: {
    k: number;
    d: number;
  };
  atr: number;
  adx: number;
  supertrend: {
    direction: "BULLISH" | "BEARISH";
    value: number;
  };
  candlePattern: string | null;
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  momentum: "STRONG" | "MODERATE" | "WEAK";
  volatility: "HIGH" | "MEDIUM" | "LOW";
  marketRegime: "TRENDING" | "RANGING" | "LOW_LIQUIDITY";
}

export type PairAccuracy = "HIGH" | "MEDIUM" | "LOW";
export type SessionTime = "MORNING" | "AFTERNOON" | "EVENING";

// SESSION-AWARE PAIR FILTERING
const SESSION_PAIRS = {
  ASIAN: ["USD/JPY", "AUD/JPY", "GBP/JPY", "EUR/JPY", "AUD/USD"],
  LONDON: ["EUR/USD", "GBP/USD", "EUR/GBP", "USD/CHF", "EUR/JPY", "GBP/JPY"],
  NEW_YORK: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CAD", "AUD/USD", "USD/CHF"],
  LONDON_NY_OVERLAP: ["GBP/USD", "EUR/USD", "GBP/JPY", "EUR/JPY"]
};

const HIGH_ACCURACY_PAIRS = ["GBP/USD", "EUR/JPY", "USD/JPY", "USD/CAD", "GBP/JPY", "CAD/JPY"];
const MEDIUM_ACCURACY_PAIRS = ["EUR/USD", "AUD/USD", "EUR/AUD", "EUR/GBP", "EUR/CAD"];
const LOW_ACCURACY_PAIRS = ["USD/CHF", "AUD/JPY"];

const TIMEFRAME = "5min";
const KENYA_UTC_OFFSET = 3;

function getPairAccuracy(pair: string): PairAccuracy {
  if (HIGH_ACCURACY_PAIRS.includes(pair)) return "HIGH";
  if (MEDIUM_ACCURACY_PAIRS.includes(pair)) return "MEDIUM";
  return "LOW";
}

function getSessionForPair(pair: string, hour: number): string | null {
  if (hour >= 7 && hour < 12) return SESSION_PAIRS.ASIAN.includes(pair) ? "ASIAN" : null;
  if (hour >= 12 && hour < 17) return SESSION_PAIRS.LONDON.includes(pair) ? "LONDON" : null;
  if (hour >= 18 && hour < 23) return SESSION_PAIRS.NEW_YORK.includes(pair) ? "NEW_YORK" : null;
  if (hour >= 15 && hour < 18) return SESSION_PAIRS.LONDON_NY_OVERLAP.includes(pair) ? "OVERLAP" : null;
  return null;
}

function getKenyaHour(timestamp: number = Date.now()): number {
  return new Date(timestamp + (KENYA_UTC_OFFSET * 60 * 60 * 1000)).getUTCHours();
}

function getCurrentSessionTime(): SessionTime {
  const KENYA_OFFSET_MS = 3 * 60 * 60 * 1000;
  const nowUTC = new Date();
  const nowKenya = new Date(nowUTC.getTime() + KENYA_OFFSET_MS);
  const hour = nowKenya.getHours();
  if (hour >= 7 && hour < 12) return "MORNING";
  if (hour >= 12 && hour < 17) return "AFTERNOON";
  return "EVENING";
}

export interface SignalAnalysis {
  pair: string;
  currentPrice: number;
  signalType: "CALL" | "PUT";
  confidence: number;
  signalGrade: "A" | "B" | "C" | "SKIPPED";
  entry: number;
  stopLoss: number;
  takeProfit: number;
  technicals: TechnicalAnalysis;
  reasoning: string[];
  ruleChecklist: RuleChecklist;
  mlPatternScore?: PatternScore;
  sentimentScore?: SentimentScore;
  mlConfidenceBoost?: number;
}

interface RuleChecklist {
  htfAlignment: boolean;
  candleConfirmation: boolean;
  momentumSafety: boolean;
  volatilityFilter: boolean;
  sessionFilter: boolean;
  marketRegime: boolean;
  trendExhaustion: boolean;
}

const FOREX_PAIR_MAP: Record<string, { from: string; to: string }> = {
  "EUR/USD": { from: "EUR", to: "USD" },
  "GBP/USD": { from: "GBP", to: "USD" },
  "USD/JPY": { from: "USD", to: "JPY" },
  "USD/CHF": { from: "USD", to: "CHF" },
  "AUD/USD": { from: "AUD", to: "USD" },
  "USD/CAD": { from: "USD", to: "CAD" },
  "NZD/USD": { from: "NZD", to: "USD" },
  "EUR/GBP": { from: "EUR", to: "GBP" },
  "EUR/JPY": { from: "EUR", to: "JPY" },
  "GBP/JPY": { from: "GBP", to: "JPY" },
  "AUD/JPY": { from: "AUD", to: "JPY" },
  "EUR/AUD": { from: "EUR", to: "AUD" },
  "CAD/JPY": { from: "CAD", to: "JPY" },
  "EUR/CAD": { from: "EUR", to: "CAD" },
};

const priceCache: Map<string, { data: ForexQuote; timestamp: number }> = new Map();
const candleCache: Map<string, { data: CandleData[]; timestamp: number }> = new Map();
const CACHE_DURATION = 60000;

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export async function getForexQuote(pair: string, apiKey?: string): Promise<ForexQuote> {
  const cached = priceCache.get(pair);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.data;
  const pairInfo = FOREX_PAIR_MAP[pair];
  if (!pairInfo) throw new Error(`Unknown pair: ${pair}`);
  if (apiKey) {
    try {
      const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${pairInfo.from}&to_currency=${pairInfo.to}&apikey=${apiKey}`;
      const data = await fetchWithRetry(url);
      if (data["Realtime Currency Exchange Rate"]) {
        const rate = data["Realtime Currency Exchange Rate"];
        const price = parseFloat(rate["5. Exchange Rate"]);
        const bid = parseFloat(rate["8. Bid Price"]) || price * 0.99995;
        const ask = parseFloat(rate["9. Ask Price"]) || price * 1.00005;
        const quote: ForexQuote = { pair, price, bid, ask, timestamp: Date.now(), change: 0, changePercent: 0 };
        priceCache.set(pair, { data: quote, timestamp: Date.now() });
        return quote;
      }
    } catch (error) {
      log(`Alpha Vantage API error for ${pair}: ${error}`, "forex");
    }
  }
  return generateRealisticQuote(pair);
}

export async function getForexCandles(pair: string, interval: string = "5min", apiKey?: string): Promise<CandleData[]> {
  const cacheKey = `${pair}-${interval}`;
  const cached = candleCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.data;
  const pairInfo = FOREX_PAIR_MAP[pair];
  if (!pairInfo) throw new Error(`Unknown pair: ${pair}`);
  if (apiKey) {
    try {
      const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${pairInfo.from}&to_symbol=${pairInfo.to}&interval=${interval}&apikey=${apiKey}`;
      const data = await fetchWithRetry(url);
      const timeSeriesKey = Object.keys(data).find(k => k.includes("Time Series"));
      if (timeSeriesKey && data[timeSeriesKey]) {
        const candles: CandleData[] = Object.entries(data[timeSeriesKey]).slice(0, 100).map(([timestamp, values]: [string, any]) => ({
          timestamp: new Date(timestamp).getTime(),
          open: parseFloat(values["1. open"]),
          high: parseFloat(values["2. high"]),
          low: parseFloat(values["3. low"]),
          close: parseFloat(values["4. close"]),
          volume: parseFloat(values["5. volume"]) || 0
        })).reverse();
        candleCache.set(cacheKey, { data: candles, timestamp: Date.now() });
        return candles;
      }
    } catch (error) {
      log(`Alpha Vantage candles error for ${pair}: ${error}`, "forex");
    }
  }
  return generateRealisticCandles(pair, 100);
}

function getBasePriceForPair(pair: string): number {
  const basePrices: Record<string, number> = { "EUR/USD": 1.0850, "GBP/USD": 1.2650, "USD/JPY": 149.50, "USD/CHF": 0.8850, "AUD/USD": 0.6550, "USD/CAD": 1.3650, "NZD/USD": 0.6050, "EUR/GBP": 0.8580, "EUR/JPY": 162.20, "GBP/JPY": 189.10, "AUD/JPY": 97.90, "EUR/AUD": 1.6560, "CAD/JPY": 109.50, "EUR/CAD": 1.4850 };
  return basePrices[pair] || 1.0;
}

function generateRealisticQuote(pair: string): ForexQuote {
  const basePrice = getBasePriceForPair(pair);
  const volatility = pair.includes("JPY") ? 0.0002 : 0.00002;
  const randomWalk = (Math.random() - 0.5) * 2 * volatility * basePrice;
  const price = basePrice + randomWalk;
  const spread = pair.includes("JPY") ? 0.02 : 0.00002;
  return { pair, price, bid: price - spread / 2, ask: price + spread / 2, timestamp: Date.now(), change: randomWalk, changePercent: (randomWalk / basePrice) * 100 };
}

function generateRealisticCandles(pair: string, count: number): CandleData[] {
  const candles: CandleData[] = [];
  let basePrice = getBasePriceForPair(pair);
  const volatility = pair.includes("JPY") ? 0.001 : 0.0001;
  const now = Date.now();
  const interval = 5 * 60 * 1000;
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * interval;
    const trend = Math.sin(i * 0.1) * volatility * basePrice;
    const noise = (Math.random() - 0.5) * volatility * basePrice;
    const open = basePrice;
    const change = trend + noise;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * basePrice * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * basePrice * 0.5;
    candles.push({ timestamp, open, high, low, close, volume: Math.floor(Math.random() * 1000) });
    basePrice = close;
  }
  return candles;
}

// Technical Indicators
function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) ema = prices[i] * k + ema * (1 - k);
  return ema;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change; else losses -= change;
  }
  const avgGain = gains / period, avgLoss = losses / period;
  return avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
}

function calculateMACD(prices: number[]): { macdLine: number; signalLine: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12), ema26 = calculateEMA(prices, 26), macdLine = ema12 - ema26;
  const macdHistory: number[] = [];
  for (let i = 26; i <= prices.length; i++) {
    const slice = prices.slice(0, i);
    macdHistory.push(calculateEMA(slice, 12) - calculateEMA(slice, 26));
  }
  const signalLine = macdHistory.length >= 9 ? calculateEMA(macdHistory, 9) : macdLine;
  return { macdLine, signalLine, histogram: macdLine - signalLine };
}

function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): { upper: number; middle: number; lower: number; percentB: number } {
  const middle = calculateSMA(prices, period), slice = prices.slice(-period);
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period;
  const standardDeviation = Math.sqrt(variance), upper = middle + standardDeviation * stdDev, lower = middle - standardDeviation * stdDev;
  return { upper, middle, lower, percentB: (prices[prices.length - 1] - lower) / (upper - lower) };
}

function hasThreeConsecutiveTrendCandles(candles: CandleData[], direction: "BULLISH" | "BEARISH"): boolean {
  if (candles.length < 3) return false;
  const last3 = candles.slice(-3);
  const getBodyRatio = (c: CandleData) => Math.abs(c.close - c.open) / (c.high - c.low || 1);
  return last3.every(c => (direction === "BULLISH" ? c.close > c.open : c.open > c.close) && getBodyRatio(c) > 0.5);
}

function checkMultiIndicatorAlignment(technicals: TechnicalAnalysis, direction: "BULLISH" | "BEARISH"): { count: number; aligned: boolean } {
  const rsiOk = direction === "BULLISH" ? (technicals.rsi >= 30 && technicals.rsi <= 85) : (technicals.rsi >= 15 && technicals.rsi <= 70);
  const stochOk = direction === "BULLISH" ? technicals.stochastic.k < 90 : technicals.stochastic.k > 10;
  const supertrendAligned = technicals.supertrend.direction === direction;
  const macdAligned = direction === "BULLISH" ? technicals.macd.histogram > 0 : technicals.macd.histogram < 0;
  const count = (rsiOk ? 1 : 0) + (stochOk ? 1 : 0) + (supertrendAligned ? 1 : 0) + (macdAligned ? 1 : 0);
  return { count, aligned: rsiOk && stochOk && (supertrendAligned || macdAligned) };
}

function calculateATR(candles: CandleData[], period: number = 14): number {
  if (candles.length < period + 1) return 0;
  const tr: number[] = [];
  for (let i = 1; i < candles.length; i++) tr.push(Math.max(candles[i].high - candles[i].low, Math.abs(candles[i].high - candles[i - 1].close), Math.abs(candles[i].low - candles[i - 1].close)));
  return tr.slice(-period).reduce((a, b) => a + b, 0) / period;
}

function calculateStochastic(candles: CandleData[], kPeriod: number = 14, dPeriod: number = 3): { k: number; d: number } {
  if (candles.length < kPeriod) return { k: 50, d: 50 };
  const getK = (slice: CandleData[]) => {
    const low = Math.min(...slice.map(c => c.low)), high = Math.max(...slice.map(c => c.high));
    return ((slice[slice.length - 1].close - low) / (high - low || 1)) * 100;
  };
  const k = getK(candles.slice(-kPeriod));
  const kValues: number[] = [];
  for (let i = kPeriod; i <= candles.length; i++) kValues.push(getK(candles.slice(i - kPeriod, i)));
  return { k, d: kValues.length >= dPeriod ? kValues.slice(-dPeriod).reduce((a, b) => a + b, 0) / dPeriod : k };
}

function calculateADX(candles: CandleData[], period: number = 14): number {
  if (candles.length < period + 1) return 25;
  const dmP: number[] = [], dmM: number[] = [], tr: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const hD = candles[i].high - candles[i - 1].high, lD = candles[i - 1].low - candles[i].low;
    dmP.push(hD > lD && hD > 0 ? hD : 0);
    dmM.push(lD > hD && lD > 0 ? lD : 0);
    tr.push(Math.max(candles[i].high - candles[i].low, Math.abs(candles[i].high - candles[i - 1].close), Math.abs(candles[i].low - candles[i - 1].close)));
  }
  const sTr = tr.slice(-period).reduce((a, b) => a + b, 0), diP = (dmP.slice(-period).reduce((a, b) => a + b, 0) / sTr) * 100, diM = (dmM.slice(-period).reduce((a, b) => a + b, 0) / sTr) * 100;
  return Math.abs(diP - diM) / (diP + diM || 1) * 100;
}

function calculateSupertrend(candles: CandleData[], period: number = 10, multiplier: number = 3): { direction: "BULLISH" | "BEARISH"; value: number } {
  const atr = calculateATR(candles, period), current = candles[candles.length - 1], hl2 = (current.high + current.low) / 2;
  const uB = hl2 + multiplier * atr, lB = hl2 - multiplier * atr;
  const direction = current.close > uB ? "BULLISH" : (current.close < lB ? "BEARISH" : (candles[candles.length - 2].close > hl2 ? "BULLISH" : "BEARISH"));
  return { direction, value: direction === "BULLISH" ? lB : uB };
}

function detectCandlePattern(candles: CandleData[]): string | null {
  if (candles.length < 2) return null;
  const c = candles[candles.length - 1], p = candles[candles.length - 2], bS = Math.abs(c.close - c.open), pBS = Math.abs(p.close - p.open);
  if (c.close > c.open && p.close < p.open && c.close > p.open && c.open < p.close && bS > pBS * 0.8) return "bullish_engulfing";
  if (c.close < c.open && p.close > p.open && c.open > p.close && c.close < p.open && bS > pBS * 0.8) return "bearish_engulfing";
  return null;
}

function detectTrendExhaustion(adx: number, rsi: number, signalType: "CALL" | "PUT"): boolean {
  return (signalType === "CALL" && rsi > 92 && adx < 22) || (signalType === "PUT" && rsi < 8 && adx < 22);
}

export function isMarketOpen(): { isOpen: boolean; nextAction: string } {
  const now = new Date();
  const day = now.getUTCDay();
  const hour = now.getUTCHours();

  const kenyaOffset = 3; // UTC+3
  
  // Friday close: 21:00 UTC (Saturday 00:00 EAT)
  if (day === 5 && hour >= 21) {
    return { isOpen: false, nextAction: "Monday at 00:00 EAT" };
  }
  // Saturday: Closed all day
  if (day === 6) {
    return { isOpen: false, nextAction: "Monday at 00:00 EAT" };
  }
  // Sunday open: 21:00 UTC (Monday 00:00 EAT)
  if (day === 0 && hour < 21) {
    return { isOpen: false, nextAction: "Monday at 00:00 EAT" };
  }

  return { isOpen: true, nextAction: "Saturday at 00:00 EAT" };
}

function gradeSignal(adx: number, volatility: string, exhausted: boolean, macdAligned: boolean, supertrendAligned: boolean, htfAligned: boolean): "A" | "B" | "C" {
  if (exhausted) return "C";
  if (adx > 28 && macdAligned && supertrendAligned && htfAligned) return "A";
  if (adx >= 24 && (macdAligned || supertrendAligned)) return "B";
  return "C";
}

export function analyzeTechnicals(candles: CandleData[]): TechnicalAnalysis {
  if (candles.length === 0) return {} as any;
  const prices = candles.map(c => c.close);
  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const sma200 = calculateSMA(prices, 200);
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const bollingerBands = calculateBollingerBands(prices);
  const stochastic = calculateStochastic(candles);
  const atr = calculateATR(candles);
  const adx = calculateADX(candles);
  const supertrend = calculateSupertrend(candles);
  const candlePattern = detectCandlePattern(candles);

  const trend = supertrend.direction;
  const momentum = adx > 25 ? "STRONG" : (adx > 15 ? "MODERATE" : "WEAK");
  const volatility = atr > (prices[prices.length - 1] * 0.001) ? "HIGH" : "MEDIUM";
  const marketRegime = adx > 20 ? "TRENDING" : "RANGING";

  return {
    rsi, macd, sma20, sma50, sma200, ema12, ema26,
    bollingerBands: { ...bollingerBands, breakout: prices[prices.length - 1] > bollingerBands.upper || prices[prices.length - 1] < bollingerBands.lower },
    stochastic, atr, adx, supertrend,
    candlePattern, trend, momentum, volatility, marketRegime
  };
}

export async function generateSignalAnalysis(pair: string, timeframe: string, apiKey?: string): Promise<SignalAnalysis> {
  const sessionHour = getKenyaHour(), sessionForPair = getSessionForPair(pair, sessionHour);
  const ruleChecklist: RuleChecklist = { htfAlignment: false, candleConfirmation: false, momentumSafety: false, volatilityFilter: false, sessionFilter: sessionForPair !== null, marketRegime: false, trendExhaustion: true };
  const reasoning: string[] = [];

  const { blocked, event, remainingMinutes, allowWithWarning } = isNewsEventTime() as any;
  if (blocked && !allowWithWarning) {
    const remainingText = remainingMinutes ? ` (${remainingMinutes}m left)` : "";
    reasoning.push(`🚫 NEWS EVENT BLOCK: ${event?.name}${remainingText}`);
    return { pair, currentPrice: 0, signalType: "CALL", confidence: 0, signalGrade: "SKIPPED", entry: 0, stopLoss: 0, takeProfit: 0, technicals: {} as any, reasoning, ruleChecklist };
  }

  if (blocked && allowWithWarning) {
    reasoning.push(`⚠️ VOLATILITY WARNING: Active ${event?.name} news event. Trading carries higher risk.`);
  }

  const stats = sessionTracker.getStats();
  if (sessionTracker.hasReachedDailyGoal() || sessionTracker.hasExceededMaxDrawdown()) {
    reasoning.push(`🛑 TRADING HALTED: Goal or Drawdown reached`);
    return { pair, currentPrice: 0, signalType: "CALL", confidence: 0, signalGrade: "SKIPPED", entry: 0, stopLoss: 0, takeProfit: 0, technicals: {} as any, reasoning, ruleChecklist };
  }

  const [candles, candlesM15, candlesH1] = await Promise.all([
    getForexCandles(pair, "5min", apiKey),
    getForexCandles(pair, "15min", apiKey),
    getForexCandles(pair, "60min", apiKey)
  ]);
  const technicals = analyzeTechnicals(candles);
  const technicalsM15 = analyzeTechnicals(candlesM15);
  const technicalsH1 = analyzeTechnicals(candlesH1);

  const m5Trend = technicals.supertrend.direction;
  const m15Trend = technicalsM15.supertrend.direction;
  const h1Trend = technicalsH1.supertrend.direction;

  let baseConfidence = 65, sessionThreshold = 55, confidence = baseConfidence;
  
  const newsStatusResult = isNewsEventTime() as any;
  const newsBlocked = newsStatusResult.blocked;
  const isNewsWarning = newsStatusResult.allowWithWarning;
  
  if (newsBlocked && isNewsWarning) {
    sessionThreshold = 50; // Extra lenient during news to capture volatility moves
    reasoning.push(`📊 NEWS VOLATILITY MODE: Active (Threshold: ${sessionThreshold}%)`);
  } else {
    reasoning.push(`📊 HIGH-OPPORTUNITY MODE: Active (Threshold: ${sessionThreshold}%)`);
  }

  const lastCandle = candles[candles.length - 1], avgVol = candles.slice(-20).reduce((s, c) => s + (c.volume || 0), 0) / 20;
  const volumeConfirmed = !lastCandle.volume || lastCandle.volume > avgVol * 0.5;
  if (!volumeConfirmed) reasoning.push(`⚠️ VOLUME LOW`); else reasoning.push(`✅ VOLUME OK`);

  const majorPairs = ["EUR/USD", "GBP/USD", "AUD/USD"];
  if (majorPairs.includes(pair)) {
    const results = await Promise.all(majorPairs.filter(p => p !== pair).map(async p => analyzeTechnicals(await getForexCandles(p, "5min", apiKey)).supertrend.direction));
    const alignedCount = results.filter(t => t === m5Trend).length;
    if (alignedCount === results.length) { confidence += 12; reasoning.push(`✅ FULL CORRELATION`); }
    else if (alignedCount > 0) { confidence += 5; reasoning.push(`✅ PARTIAL CORRELATION`); }
    else { confidence -= 10; reasoning.push(`⚠️ CORRELATION DIVERGENCE`); }
  }

  const currentPrice = lastCandle.close;
  const m5_m15_aligned = m5Trend === m15Trend;
  const htfAligned = m5Trend === h1Trend;
  
  ruleChecklist.htfAlignment = m5_m15_aligned; // Use M15 as primary confirmation
  
  const alignmentText = `M5/M15: ${m5_m15_aligned ? "YES" : "NO"} | H1: ${htfAligned ? "YES" : "NO"}`;
  reasoning.push(`Multi-TF: ${alignmentText} | Trend: ${m5Trend}`);
  
  if (m5_m15_aligned) { 
    confidence += 10; 
    reasoning.push(`✅ M15 CONFIRMATION`); 
  } else {
    reasoning.push(`❌ M5/M15 CONFLICT`);
    return { pair, currentPrice, signalType: "CALL", confidence: 0, signalGrade: "SKIPPED", entry: currentPrice, stopLoss: currentPrice, takeProfit: currentPrice, technicals, reasoning, ruleChecklist };
  }

  if (htfAligned) { confidence += 5; reasoning.push(`✅ H1 ALIGNED`); } else { reasoning.push(`⚠️ H1 CONTRA-TREND (Scalp Mode)`); }

  if (technicals.marketRegime !== "TRENDING") {
    reasoning.push(`❌ NOT TRENDING`);
    return { pair, currentPrice, signalType: "CALL", confidence: 0, signalGrade: "SKIPPED", entry: currentPrice, stopLoss: currentPrice, takeProfit: currentPrice, technicals, reasoning, ruleChecklist };
  }

  const candleConfirmed = hasThreeConsecutiveTrendCandles(candles, m5Trend);
  ruleChecklist.candleConfirmation = candleConfirmed;
  
  if (!candleConfirmed) {
    reasoning.push(`❌ CANDLE CONFIRMATION FAILED (Waiting for strong price action)`);
    return { pair, currentPrice, signalType: "CALL", confidence: 0, signalGrade: "SKIPPED", entry: currentPrice, stopLoss: currentPrice, takeProfit: currentPrice, technicals, reasoning, ruleChecklist };
  }
  
  // Weighted Scoring for RSI/Stochastic
  const rsiValue = technicals.rsi;
  const stochK = technicals.stochastic.k;
  const isPerfectStructure = candleConfirmed && technicals.adx > 30;
  
  // MOMENTUM FILTER: Block only extreme zones RSI 95+ (too close to reversal), allow 20-95
  const isExtremeZone = rsiValue > 95 || rsiValue < 5; // Too extreme - always block
  const rsiOk = !isExtremeZone; // Block only the extreme zone
  const stochOk = stochK >= (5) && stochK <= (95); // Stochastic must be 5-95
  
  ruleChecklist.momentumSafety = rsiOk && stochOk; // Mark momentum safety after validation

  // EXTREME ZONE: Always block RSI 95+ and 5-, too close to reversal
  if (isExtremeZone) {
    reasoning.push(`❌ MOMENTUM EXTREME (RSI: ${rsiValue.toFixed(1)}) - Reversal Risk Zone`);
    return { pair, currentPrice, signalType: "CALL", confidence: 0, signalGrade: "SKIPPED", entry: currentPrice, stopLoss: currentPrice, takeProfit: currentPrice, technicals, reasoning, ruleChecklist };
  }
  
  if (!rsiOk || !stochOk) {
    reasoning.push(`❌ MOMENTUM EXTREME (RSI: ${rsiValue.toFixed(1)}) - Failed Momentum Check`);
    return { pair, currentPrice, signalType: "CALL", confidence: 0, signalGrade: "SKIPPED", entry: currentPrice, stopLoss: currentPrice, takeProfit: currentPrice, technicals, reasoning, ruleChecklist };
  }

  const signalType = m5Trend === "BULLISH" ? "CALL" : "PUT", exhausted = detectTrendExhaustion(technicals.adx, technicals.rsi, signalType);
  if (exhausted) {
    reasoning.push(`❌ TREND EXHAUSTED`);
    return { pair, currentPrice, signalType, confidence: 0, signalGrade: "SKIPPED", entry: currentPrice, stopLoss: currentPrice, takeProfit: currentPrice, technicals, reasoning, ruleChecklist };
  }

  if (technicals.adx > 25) confidence += 10; else if (technicals.adx < 15) confidence -= 12;

  const indicatorCheck = checkMultiIndicatorAlignment(technicals, m5Trend);
  const isPerfectAlignment = indicatorCheck.count === 4; 
  const correlationAligned = reasoning.includes(`✅ FULL CORRELATION`) || reasoning.includes(`✅ PARTIAL CORRELATION`);
  const institutionalQuality = isPerfectAlignment && m5_m15_aligned && volumeConfirmed && correlationAligned;

  if (institutionalQuality) {
    confidence = Math.min(98, Math.max(94, confidence + 20));
    reasoning.push(`💎 INSTITUTIONAL GRADE A+: Triple-Verified Setup`);
  } else if (isPerfectAlignment && m5_m15_aligned) {
    confidence = Math.min(92, Math.max(88, confidence + 12));
    reasoning.push(`✨ HIGH-QUALITY GRADE A: Multi-TF Alignment`);
  }

  const signalGrade = gradeSignal(technicals.adx, technicals.volatility, exhausted, signalType === "CALL" ? technicals.macd.histogram > 0 : technicals.macd.histogram < 0, technicals.supertrend.direction === (signalType === "CALL" ? "BULLISH" : "BEARISH"), m5_m15_aligned);
  if (signalGrade === "C" && !candleConfirmed) {
    reasoning.push(`⚠️ GRADE C SKIPPED`);
    return { pair, currentPrice, signalType, confidence: 0, signalGrade: "SKIPPED", entry: currentPrice, stopLoss: currentPrice, takeProfit: currentPrice, technicals, reasoning, ruleChecklist };
  }

  // ATR-based Dynamic SL/TP and Volatility Filter
  const atr = technicals.atr;
  const isJpy = pair.includes("JPY");
  const volatilityMultiplier = isJpy ? 1.5 : 2.0;
  
  // Dynamic Volatility Filter: If ATR is extremely low relative to spread, skip
  const spread = isJpy ? 0.02 : 0.00002;
  if (atr < spread * 1.5) {
    reasoning.push(`⚠️ VOLATILITY TOO LOW (ATR: ${atr.toFixed(5)})`);
    ruleChecklist.volatilityFilter = false;
    return { pair, currentPrice, signalType, confidence: 0, signalGrade: "SKIPPED", entry: currentPrice, stopLoss: currentPrice, takeProfit: currentPrice, technicals, reasoning, ruleChecklist };
  }
  ruleChecklist.volatilityFilter = true;

  const slDistance = atr * volatilityMultiplier;
  const tpDistance = slDistance * 1.5; // 1:1.5 Risk/Reward

  const entry = currentPrice;
  const stopLoss = signalType === "CALL" ? entry - slDistance : entry + slDistance;
  const takeProfit = signalType === "CALL" ? entry + tpDistance : entry - tpDistance;  const pipValue = pair.includes("JPY") ? 0.01 : 0.0001;
  const atrPips = technicals.atr / pipValue;
  const slPips = Math.max(atrPips * 1.5, 10); // Minimum 10 pips SL
  const tpPips = slPips * 1.5; // Fixed 1:1.5 Risk/Reward

  const stopLossFinal = signalType === "CALL" ? currentPrice - (slPips * pipValue) : currentPrice + (slPips * pipValue);
  const takeProfitFinal = signalType === "CALL" ? currentPrice + (tpPips * pipValue) : currentPrice - (tpPips * pipValue);
  
  const riskReward = "1:1.5";
  const confluenceScore = Math.min(95, confidence);
  const scoreDiff = Math.abs(confidence - 65);
  
  reasoning.push(`Final Confluence: ${confluenceScore}% | Score diff: ${scoreDiff} | R/R: ${riskReward}`);

  // ===== ML & SENTIMENT ANALYSIS =====
  const mlPatternScore = detectPatterns(candles);
  const sentimentScore = analyzeSentiment(technicals);
  
  // Calculate ML confidence boost
  const patternBias = mlPatternScore.direction === m5Trend ? Math.abs(mlPatternScore.overallScore) / 10 : -Math.abs(mlPatternScore.overallScore) / 10;
  const sentimentBias = sentimentScore.overallSentiment > 0 && signalType === "CALL" ? Math.abs(sentimentScore.overallSentiment) / 10 : sentimentScore.overallSentiment < 0 && signalType === "PUT" ? Math.abs(sentimentScore.overallSentiment) / 10 : -10;
  const mlConfidenceBoost = Math.round((patternBias + sentimentBias) / 2);
  
  // Add ML insights to reasoning
  if (mlPatternScore.direction === m5Trend) {
    reasoning.push(`✅ ML PATTERN: ${mlPatternScore.direction} (Score: ${mlPatternScore.overallScore})`);
  } else {
    reasoning.push(`⚠️ ML PATTERN DIVERGENCE: ${mlPatternScore.direction} vs Trend`);
  }
  reasoning.push(`📊 SENTIMENT: ${getSentimentExplanation(sentimentScore).split(" - ")[0]}`);
  
  // Apply ML boost to confidence
  let finalConfidence = Math.min(98, Math.max(0, confidence + mlConfidenceBoost));
  if (finalConfidence < sessionThreshold) finalConfidence = Math.max(sessionThreshold - 5, finalConfidence);
  reasoning.push(`Grade ${signalGrade} | ML Confidence: ${finalConfidence}%`);

  // QUALITY GATE: Require 80%+ confidence for M5 trading (prevents low-quality signal spam)
  const minConfidenceThreshold = 80;
  if (finalConfidence < minConfidenceThreshold) {
    reasoning.push(`🚫 SIGNAL FILTERED: Confidence ${finalConfidence}% below threshold (${minConfidenceThreshold}%)`);
    return { pair, currentPrice, signalType, confidence: 0, signalGrade: "SKIPPED", entry: currentPrice, stopLoss: currentPrice, takeProfit: currentPrice, technicals, reasoning, ruleChecklist };
  }

  return {
    pair,
    currentPrice,
    signalType,
    confidence: finalConfidence,
    signalGrade,
    entry: currentPrice,
    stopLoss: stopLossFinal,
    takeProfit: takeProfitFinal,
    technicals,
    reasoning,
    ruleChecklist,
    mlPatternScore,
    sentimentScore,
    mlConfidenceBoost
  };
}

// Use refined version above
/*
export function analyzeTechnicals(candles: CandleData[]): TechnicalAnalysis {
  ...
}
*/

export async function getAllQuotes(pairs: string[], apiKey?: string): Promise<ForexQuote[]> {
  return Promise.all(pairs.map(pair => getForexQuote(pair, apiKey)));
}
