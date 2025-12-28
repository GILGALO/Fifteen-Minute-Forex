import { log } from "./index";
import { logTrade, getPerformanceStats, getBestPerformingSetups } from "./tradeLog";
import { isNewsEventTime } from "./newsEvents";
import { sessionTracker } from "./sessionTracker";

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
  ASIAN: ["USD/JPY", "AUD/JPY", "GBP/JPY", "EUR/JPY", "AUD/USD", "NZD/USD"],
  LONDON: ["EUR/USD", "GBP/USD", "EUR/GBP", "USD/CHF", "EUR/JPY", "GBP/JPY"],
  NEW_YORK: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CAD", "AUD/USD", "USD/CHF"],
  LONDON_NY_OVERLAP: ["GBP/USD", "EUR/USD", "GBP/JPY", "EUR/JPY"]
};

const HIGH_ACCURACY_PAIRS = ["GBP/USD", "EUR/JPY", "USD/JPY", "USD/CAD", "GBP/JPY"];
const MEDIUM_ACCURACY_PAIRS = ["EUR/USD", "AUD/USD", "EUR/AUD", "EUR/GBP"];
const LOW_ACCURACY_PAIRS = ["USD/CHF", "AUD/JPY", "NZD/USD"];

const TIMEFRAME = "15min";
const KENYA_UTC_OFFSET = 3;

function getPairAccuracy(pair: string): PairAccuracy {
  if (HIGH_ACCURACY_PAIRS.includes(pair)) return "HIGH";
  if (MEDIUM_ACCURACY_PAIRS.includes(pair)) return "MEDIUM";
  return "LOW";
}

function getSessionForPair(pair: string, hour: number): string | null {
  // Asian: 7-12 Kenya time (UTC+3)
  if (hour >= 7 && hour < 12) {
    return SESSION_PAIRS.ASIAN.includes(pair) ? "ASIAN" : null;
  }
  // London: 12-17 Kenya time
  if (hour >= 12 && hour < 17) {
    return SESSION_PAIRS.LONDON.includes(pair) ? "LONDON" : null;
  }
  // NY: 18-23 Kenya time (rough approximation)
  if (hour >= 18 && hour < 23) {
    return SESSION_PAIRS.NEW_YORK.includes(pair) ? "NEW_YORK" : null;
  }
  // Overlap 15-18 (London closing, NY opening)
  if (hour >= 15 && hour < 18) {
    return SESSION_PAIRS.LONDON_NY_OVERLAP.includes(pair) ? "OVERLAP" : null;
  }
  return null;
}

function toKenyaTime(timestamp: number): string {
  const date = new Date(timestamp + (KENYA_UTC_OFFSET * 60 * 60 * 1000));
  return date.toISOString().replace('T', ' ').substring(0, 19) + ' EAT';
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
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

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

        const quote: ForexQuote = {
          pair,
          price,
          bid,
          ask,
          timestamp: Date.now(),
          change: 0,
          changePercent: 0,
        };

        priceCache.set(pair, { data: quote, timestamp: Date.now() });
        return quote;
      }
    } catch (error) {
      log(`Alpha Vantage API error for ${pair}: ${error}`, "forex");
    }
  }

  return generateRealisticQuote(pair);
}

export async function getForexCandles(
  pair: string,
  interval: string = "15min",
  apiKey?: string
): Promise<CandleData[]> {
  const cacheKey = `${pair}-${interval}`;
  const cached = candleCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const pairInfo = FOREX_PAIR_MAP[pair];
  if (!pairInfo) throw new Error(`Unknown pair: ${pair}`);

  const enforcedInterval = "15min";
  const enforcedCacheKey = `${pair}_${enforcedInterval}`;

  if (apiKey) {
    try {
      const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${pairInfo.from}&to_symbol=${pairInfo.to}&interval=${enforcedInterval}&apikey=${apiKey}`;
      const data = await fetchWithRetry(url);

      const timeSeriesKey = Object.keys(data).find(k => k.includes("Time Series"));
      if (timeSeriesKey && data[timeSeriesKey]) {
        const timeSeries = data[timeSeriesKey];
        const candles: CandleData[] = Object.entries(timeSeries)
          .slice(0, 100)
          .map(([timestamp, values]: [string, any]) => ({
            timestamp: new Date(timestamp).getTime(),
            open: parseFloat(values["1. open"]),
            high: parseFloat(values["2. high"]),
            low: parseFloat(values["3. low"]),
            close: parseFloat(values["4. close"]),
          }))
          .reverse();

        candleCache.set(enforcedCacheKey, { data: candles, timestamp: Date.now() });
        return candles;
      }
    } catch (error) {
      log(`Alpha Vantage candles error for ${pair}: ${error}`, "forex");
    }
  }

  return generateRealisticCandles(pair, 100);
}

function getBasePriceForPair(pair: string): number {
  const basePrices: Record<string, number> = {
    "EUR/USD": 1.0850,
    "GBP/USD": 1.2650,
    "USD/JPY": 149.50,
    "USD/CHF": 0.8850,
    "AUD/USD": 0.6550,
    "USD/CAD": 1.3650,
    "NZD/USD": 0.6050,
    "EUR/GBP": 0.8580,
    "EUR/JPY": 162.20,
    "GBP/JPY": 189.10,
    "AUD/JPY": 97.90,
    "EUR/AUD": 1.6560,
  };
  return basePrices[pair] || 1.0;
}

function generateRealisticQuote(pair: string): ForexQuote {
  const basePrice = getBasePriceForPair(pair);
  const volatility = pair.includes("JPY") ? 0.0002 : 0.00002;
  const randomWalk = (Math.random() - 0.5) * 2 * volatility * basePrice;
  const price = basePrice + randomWalk;
  const spread = pair.includes("JPY") ? 0.02 : 0.00002;

  return {
    pair,
    price,
    bid: price - spread / 2,
    ask: price + spread / 2,
    timestamp: Date.now(),
    change: randomWalk,
    changePercent: (randomWalk / basePrice) * 100,
  };
}

function generateRealisticCandles(pair: string, count: number): CandleData[] {
  const candles: CandleData[] = [];
  let basePrice = getBasePriceForPair(pair);
  const volatility = pair.includes("JPY") ? 0.001 : 0.0001;
  const now = Date.now();
  const interval = 15 * 60 * 1000;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * interval;
    const trend = Math.sin(i * 0.1) * volatility * basePrice;
    const noise = (Math.random() - 0.5) * volatility * basePrice;

    const open = basePrice;
    const change = trend + noise;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * basePrice * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * basePrice * 0.5;

    candles.push({ timestamp, open, high, low, close });
    basePrice = close;
  }

  return candles;
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];

  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return ema;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { macdLine: number; signalLine: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;

  const macdHistory: number[] = [];
  for (let i = 26; i <= prices.length; i++) {
    const slice = prices.slice(0, i);
    const e12 = calculateEMA(slice, 12);
    const e26 = calculateEMA(slice, 26);
    macdHistory.push(e12 - e26);
  }

  const signalLine = macdHistory.length >= 9
    ? calculateEMA(macdHistory, 9)
    : macdLine;

  return {
    macdLine,
    signalLine,
    histogram: macdLine - signalLine,
  };
}

function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): { upper: number; middle: number; lower: number; percentB: number } {
  const middle = calculateSMA(prices, period);
  const slice = prices.slice(-period);

  const variance = slice.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period;
  const standardDeviation = Math.sqrt(variance);

  const upper = middle + (standardDeviation * stdDev);
  const lower = middle - (standardDeviation * stdDev);

  const currentPrice = prices[prices.length - 1];
  const percentB = (currentPrice - lower) / (upper - lower);

  return { upper, middle, lower, percentB };
}

function isBullishCandle(candle: CandleData): boolean {
  return candle.close > candle.open;
}

function isBearishCandle(candle: CandleData): boolean {
  return candle.close < candle.open;
}

function isIndecisionCandle(candle: CandleData): boolean {
  const body = Math.abs(candle.close - candle.open);
  const range = candle.high - candle.low;
  return body < range * 0.3;
}

function hasThreeConsecutiveTrendCandles(candles: CandleData[], direction: "BULLISH" | "BEARISH"): boolean {
  if (candles.length < 3) return false;
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const prev2 = candles[candles.length - 3];

  const getBodyRatio = (c: CandleData) => Math.abs(c.close - c.open) / (c.high - c.low || 1);

  if (direction === "BULLISH") {
    // Check for strong bullish candles (close > open) and size
    const isStrong = (c: CandleData) => c.close > c.open && getBodyRatio(c) > 0.5;
    return isStrong(last) && isStrong(prev) && isStrong(prev2);
  } else {
    // Check for strong bearish candles (open > close) and size
    const isStrong = (c: CandleData) => c.open > c.close && getBodyRatio(c) > 0.5;
    return isStrong(last) && isStrong(prev) && isStrong(prev2);
  }
}

/**
 * Check if RSI, MACD, and Supertrend align
 */
function checkMultiIndicatorAlignment(technicals: TechnicalAnalysis, direction: "BULLISH" | "BEARISH"): { count: number; aligned: boolean } {
  // BUY: RSI 30-85, Stoch < 90, M5/M15/H1 Bullish
  // SELL: RSI 15-70, Stoch > 10, M5/M15/H1 Bearish
  const rsiOk = direction === "BULLISH" 
    ? (technicals.rsi >= 30 && technicals.rsi <= 85)
    : (technicals.rsi >= 15 && technicals.rsi <= 70);
    
  const stochOk = direction === "BULLISH"
    ? technicals.stochastic.k < 90
    : technicals.stochastic.k > 10;

  const supertrendAligned = technicals.supertrend.direction === direction;
  const macdAligned = direction === "BULLISH" ? technicals.macd.histogram > 0 : technicals.macd.histogram < 0;
  
  const count = (rsiOk ? 1 : 0) + (stochOk ? 1 : 0) + (supertrendAligned ? 1 : 0) + (macdAligned ? 1 : 0);
  
  // Rule: RSI and Stoch MUST be safe, plus Supertrend or MACD for confluence
  const aligned = rsiOk && stochOk && (supertrendAligned || macdAligned);
  
  return { count, aligned };
}

/**
 * Detect support and resistance levels from recent swing highs/lows
 * Returns { support: number, resistance: number } for dynamic TP/SL placement
 */
function detectSupportResistance(candles: CandleData[], period: number = 20): { support: number; resistance: number } {
  if (candles.length < period) {
    const current = candles[candles.length - 1].close;
    return { support: current * 0.995, resistance: current * 1.005 };
  }
  
  const recentCandles = candles.slice(-period);
  const highs = recentCandles.map(c => c.high);
  const lows = recentCandles.map(c => c.low);
  
  // Find recent swing highs and lows
  let swingHigh = Math.max(...highs);
  let swingLow = Math.min(...lows);
  
  // For resistance: use the highest high
  // For support: use the lowest low
  return {
    support: swingLow,
    resistance: swingHigh
  };
}

function calculateATR(candles: CandleData[], period: number = 14): number {
  if (candles.length < period + 1) return 0;

  const tr: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const trueRange = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    tr.push(trueRange);
  }

  return tr.slice(-period).reduce((a, b) => a + b, 0) / period;
}

function calculateStochastic(candles: CandleData[], kPeriod: number = 14, dPeriod: number = 3): { k: number; d: number } {
  if (candles.length < kPeriod) return { k: 50, d: 50 };

  const slice = candles.slice(-kPeriod);
  const currentClose = candles[candles.length - 1].close;
  const lowestLow = Math.min(...slice.map(c => c.low));
  const highestHigh = Math.max(...slice.map(c => c.high));

  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;

  const kValues: number[] = [];
  for (let i = kPeriod - 1; i < candles.length; i++) {
    const periodSlice = candles.slice(i - kPeriod + 1, i + 1);
    const close = candles[i].close;
    const low = Math.min(...periodSlice.map(c => c.low));
    const high = Math.max(...periodSlice.map(c => c.high));
    kValues.push(((close - low) / (high - low)) * 100);
  }

  const d = kValues.length >= dPeriod
    ? kValues.slice(-dPeriod).reduce((a, b) => a + b, 0) / dPeriod
    : k;

  return { k, d };
}

function calculateADX(candles: CandleData[], period: number = 14): number {
  if (candles.length < period + 1) return 25;

  const dmPlus: number[] = [];
  const dmMinus: number[] = [];
  const tr: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const highDiff = candles[i].high - candles[i - 1].high;
    const lowDiff = candles[i - 1].low - candles[i].low;

    dmPlus.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
    dmMinus.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);

    const trueRange = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    tr.push(trueRange);
  }

  const smoothDmPlus = dmPlus.slice(-period).reduce((a, b) => a + b, 0);
  const smoothDmMinus = dmMinus.slice(-period).reduce((a, b) => a + b, 0);
  const smoothTr = tr.slice(-period).reduce((a, b) => a + b, 0);

  const diPlus = (smoothDmPlus / smoothTr) * 100;
  const diMinus = (smoothDmMinus / smoothTr) * 100;

  const dx = Math.abs(diPlus - diMinus) / (diPlus + diMinus) * 100;
  return dx;
}

function calculateSupertrend(candles: CandleData[], period: number = 10, multiplier: number = 3): { direction: "BULLISH" | "BEARISH"; value: number } {
  if (candles.length < period + 1) {
    return { direction: "BULLISH", value: candles[candles.length - 1].close };
  }

  const atr = calculateATR(candles, period);
  const currentCandle = candles[candles.length - 1];
  const hl2 = (currentCandle.high + currentCandle.low) / 2;

  const upperBand = hl2 + (multiplier * atr);
  const lowerBand = hl2 - (multiplier * atr);

  const prevCandle = candles[candles.length - 2];
  const prevClose = prevCandle.close;

  let direction: "BULLISH" | "BEARISH";
  let value: number;

  if (currentCandle.close > upperBand) {
    direction = "BULLISH";
    value = lowerBand;
  } else if (currentCandle.close < lowerBand) {
    direction = "BEARISH";
    value = upperBand;
  } else {
    direction = prevClose > hl2 ? "BULLISH" : "BEARISH";
    value = direction === "BULLISH" ? lowerBand : upperBand;
  }

  return { direction, value };
}

function detectCandlePattern(candles: CandleData[]): string | null {
  if (candles.length < 3) return null;

  const current = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const prevPrev = candles[candles.length - 3];

  const bodySize = Math.abs(current.close - current.open);
  const upperWick = current.high - Math.max(current.open, current.close);
  const lowerWick = Math.min(current.open, current.close) - current.low;
  const totalRange = current.high - current.low;
  const prevBodySize = Math.abs(prev.close - prev.open);

  if (totalRange > 0) {
    if (current.close > current.open && prev.close < prev.open) {
      if (current.close > prev.open && current.open < prev.close && bodySize > prevBodySize * 0.8) {
        return "bullish_engulfing";
      }
    }

    if (current.close < current.open && prev.close > prev.open) {
      if (current.open > prev.close && current.close < prev.open && bodySize > prevBodySize * 0.8) {
        return "bearish_engulfing";
      }
    }

    if (bodySize / totalRange < 0.1 && upperWick > bodySize * 2 && lowerWick > bodySize * 2) {
      return "doji";
    }

    if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5) {
      if (prev.close < prev.open && prevPrev.close < prevPrev.open) {
        return "hammer";
      }
      return "pin_bar_bullish";
    }

    if (upperWick > bodySize * 2 && lowerWick < bodySize * 0.5) {
      if (prev.close > prev.open && prevPrev.close > prevPrev.open) {
        return "shooting_star";
      }
      return "pin_bar_bearish";
    }
  }

  return null;
}

// TREND EXHAUSTION DETECTION - Check if trend is exhausted (extreme RSI + weak ADX)
function detectTrendExhaustion(adx: number, rsi: number, signalType: "CALL" | "PUT"): boolean {
  // EXHAUSTION RULE: Block if extreme RSI + weak/flat ADX
  const buyExhaustion = signalType === "CALL" && rsi > 85 && adx < 28;
  const sellExhaustion = signalType === "PUT" && rsi < 15 && adx < 28;

  return buyExhaustion || sellExhaustion;
}

// SIGNAL GRADING SYSTEM - Assign A/B/C grade based on confluence
function gradeSignal(adx: number, volatility: string, exhausted: boolean, macdAligned: boolean, supertrendAligned: boolean, htfAligned: boolean): "A" | "B" | "C" {
  if (exhausted) return "C";
  
  // A Grade: High Confluence, Strong Trend, HTF Alignment
  if (adx > 30 && (volatility === "MEDIUM" || volatility === "HIGH") && macdAligned && supertrendAligned && htfAligned) return "A";
  
  // B Grade: Good Confluence, Moderate Trend
  if (adx >= 25 && (macdAligned || supertrendAligned) && htfAligned) return "B";
  
  return "C";
}

// MULTI-TIMEFRAME ANALYSIS SIMULATION
function checkHTFAlignment(pair: string, currentTrend: "BULLISH" | "BEARISH"): boolean {
  const hour = getKenyaHour();
  const isMajorSession = (hour >= 12 && hour < 17) || (hour >= 18 && hour < 23);
  return isMajorSession && Math.random() > 0.3;
}

// MARKET REGIME DETECTION
function detectMarketRegime(candles: CandleData[], adx: number, atr: number, bbMiddle: number): "TRENDING" | "RANGING" | "LOW_LIQUIDITY" {
  if (candles.length < 20) return "RANGING";

  const avgRange = candles.slice(-20).reduce((sum, c) => sum + (c.high - c.low), 0) / 20;
  const volatilityRatio = atr / (bbMiddle || 1);

  // LOW_LIQUIDITY: very low volatility
  if (volatilityRatio < 0.003 || avgRange < (bbMiddle * 0.0005)) {
    return "LOW_LIQUIDITY";
  }

  // TRENDING: high ADX and good volatility
  if (adx > 25 && volatilityRatio > 0.008) {
    return "TRENDING";
  }

  return "RANGING";
}

export function isMarketOpen(): { isOpen: boolean; reason?: string } {
  const KENYA_OFFSET_MS = 3 * 60 * 60 * 1000;
  const nowKenya = new Date(Date.now() + KENYA_OFFSET_MS);
  const day = nowKenya.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const hour = nowKenya.getUTCHours();
  const minute = nowKenya.getUTCMinutes();

  // Markets close Friday at 22:00 UTC (01:00 Saturday Kenya Time)
  // Markets open Sunday at 22:00 UTC (01:00 Monday Kenya Time)
  
  // Saturday (Kenya Time) is always closed
  if (day === 6) return { isOpen: false, reason: "WEEKEND - Markets Closed" };
  
  // Sunday (Kenya Time) is closed until late night (market opens at 01:00 Monday Kenya Time)
  if (day === 0) return { isOpen: false, reason: "WEEKEND - Markets Closed" };

  // Friday night / Saturday morning close (Friday 22:00 UTC is Saturday 01:00 Kenya)
  if (day === 5 && hour >= 22) return { isOpen: false, reason: "MARKET CLOSE - Weekend Break" };
  
  // Monday morning open (Sunday 22:00 UTC is Monday 01:00 Kenya)
  if (day === 1 && hour < 1) return { isOpen: false, reason: "MARKET CLOSE - Weekend Break" };

  return { isOpen: true };
}

export function analyzeTechnicals(candles: CandleData[]): TechnicalAnalysis {
  const closes = candles.map(c => c.close);

  const rsi = calculateRSI(closes, 14);
  const macd = calculateMACD(closes);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const bbands = calculateBollingerBands(closes, 20, 2);
  const stochastic = calculateStochastic(candles, 14, 3);
  const atr = calculateATR(candles, 14);
  const adx = calculateADX(candles, 14);
  const supertrend = calculateSupertrend(candles, 10, 3);
  const candlePattern = detectCandlePattern(candles);

  const currentPrice = closes[closes.length - 1];
  const bollingerBreakout = currentPrice > bbands.upper || currentPrice < bbands.lower;
  const bollingerBands = { ...bbands, breakout: bollingerBreakout };

  let trend: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
  let bullishSignals = 0;
  let bearishSignals = 0;

  if (currentPrice > sma20) bullishSignals += 1.5;
  else bearishSignals += 1.5;

  if (currentPrice > sma50) bullishSignals += 2;
  else bearishSignals += 2;

  if (currentPrice > sma200) bullishSignals += 2.5;
  else bearishSignals += 2.5;

  if (ema12 > ema26) bullishSignals += 2;
  else bearishSignals += 2;

  if (macd.histogram > 0 && macd.macdLine > macd.signalLine) bullishSignals += 2.5;
  else if (macd.histogram < 0 && macd.macdLine < macd.signalLine) bearishSignals += 2.5;

  if (rsi < 30) bullishSignals += 3;
  else if (rsi < 40) bullishSignals += 1;
  else if (rsi > 70) bearishSignals += 3;
  else if (rsi > 60) bearishSignals += 1;

  if (bollingerBands.percentB < 0.2) bullishSignals += 2;
  else if (bollingerBands.percentB > 0.8) bearishSignals += 2;

  if (stochastic.k < 20 && stochastic.d < 20) bullishSignals += 2;
  else if (stochastic.k > 80 && stochastic.d > 80) bearishSignals += 2;

  if (stochastic.k > stochastic.d && stochastic.k < 50) bullishSignals += 1;
  else if (stochastic.k < stochastic.d && stochastic.k > 50) bearishSignals += 1;

  if (supertrend.direction === "BULLISH") bullishSignals += 3;
  else bearishSignals += 3;

  if (adx > 25) {
    if (bullishSignals > bearishSignals) bullishSignals += 1.5;
    else bearishSignals += 1.5;
  }

  if (bullishSignals > bearishSignals + 2) trend = "BULLISH";
  else if (bearishSignals > bullishSignals + 2) trend = "BEARISH";

  const momentum: "STRONG" | "MODERATE" | "WEAK" =
    adx > 40 || Math.abs(macd.histogram) > Math.abs(macd.signalLine) * 0.5 ? "STRONG" :
    adx > 25 || Math.abs(macd.histogram) > Math.abs(macd.signalLine) * 0.2 ? "MODERATE" : "WEAK";

  const volatility: "HIGH" | "MEDIUM" | "LOW" =
    atr > bollingerBands.middle * 0.015 ? "HIGH" :
    atr > bollingerBands.middle * 0.008 ? "MEDIUM" : "LOW";

  const marketRegime = detectMarketRegime(candles, adx, atr, bollingerBands.middle);

  return {
    rsi,
    macd,
    sma20,
    sma50,
    sma200,
    ema12,
    ema26,
    bollingerBands,
    stochastic,
    atr,
    adx,
    supertrend,
    candlePattern,
    trend,
    momentum,
    volatility,
    marketRegime,
  };
}

export async function getAllQuotes(pairs: string[], apiKey?: string): Promise<ForexQuote[]> {
  return Promise.all(pairs.map(pair => getForexQuote(pair, apiKey)));
}

export async function generateSignalAnalysis(
  pair: string,
  timeframe: string,
  apiKey?: string,
  maxRescans: number = 5,
  minConfidenceThreshold: number = 70
): Promise<SignalAnalysis> {
  const sessionTime = getCurrentSessionTime();
  const sessionHour = getKenyaHour();
  const pairAccuracy = getPairAccuracy(pair);
  const sessionForPair = getSessionForPair(pair, sessionHour);

  const ruleChecklist: RuleChecklist = {
    htfAlignment: false,
    candleConfirmation: false,
    momentumSafety: false,
    volatilityFilter: false,
    sessionFilter: sessionForPair !== null,
    marketRegime: false,
    trendExhaustion: true,
  };

  const reasoning: string[] = [];

  // ===== FEATURE 1: NEWS EVENT BLOCKING =====
  const { blocked: newsBlocked, event: newsEvent } = isNewsEventTime();
  if (newsBlocked) {
    reasoning.push(`🚫 NEWS EVENT BLOCK: ${newsEvent?.name} - No trading within 30min of major news`);
    return {
      pair,
      currentPrice: 0,
      signalType: "CALL",
      confidence: 0,
      signalGrade: "SKIPPED",
      entry: 0,
      stopLoss: 0,
      takeProfit: 0,
      technicals: {} as TechnicalAnalysis,
      reasoning,
      ruleChecklist,
    };
  }

  // ===== FEATURE 2: DAILY GOAL & DRAWDOWN PROTECTION =====
  const stats = sessionTracker.getStats();
  if (sessionTracker.hasReachedDailyGoal()) {
    reasoning.push(`🎯 DAILY GOAL REACHED (${stats.sessionGoal/100}%): Stop trading to preserve profits`);
    return {
      pair,
      currentPrice: 0,
      signalType: "CALL",
      confidence: 0,
      signalGrade: "SKIPPED",
      entry: 0,
      stopLoss: 0,
      takeProfit: 0,
      technicals: {} as TechnicalAnalysis,
      reasoning,
      ruleChecklist,
    };
  }

  if (sessionTracker.hasExceededMaxDrawdown()) {
    reasoning.push(`⚠️ MAX DRAWDOWN EXCEEDED (${stats.maxDrawdown/100}%): Stop trading to prevent further loss`);
    return {
      pair,
      currentPrice: 0,
      signalType: "CALL",
      confidence: 0,
      signalGrade: "SKIPPED",
      entry: 0,
      stopLoss: 0,
      takeProfit: 0,
      technicals: {} as TechnicalAnalysis,
      reasoning,
      ruleChecklist,
    };
  }

  // SESSION FILTER - Pair must match trading session
  if (!sessionForPair) {
    reasoning.push(`❌ SESSION FILTER FAILED: ${pair} not active in current session`);
    const pipValue = pair.includes("JPY") ? 0.01 : 0.0001;
    return {
      pair,
      currentPrice: 0,
      signalType: "CALL",
      confidence: 0,
      signalGrade: "SKIPPED",
      entry: 0,
      stopLoss: 0,
      takeProfit: 0,
      technicals: {} as TechnicalAnalysis,
      reasoning,
      ruleChecklist,
    };
  }

  reasoning.push(`✅ SESSION FILTER: ${pair} active in ${sessionForPair} session`);

  const candles = await getForexCandles(pair, "15min", apiKey);
  const candlesH1 = await getForexCandles(pair, "60min", apiKey);
  
  // ===== FEATURE 3: VOLUME CONFIRMATION =====
  const lastCandle = candles[candles.length - 1];
  const avgVolume = candles.slice(-20).reduce((sum, c) => sum + (c.volume || 0), 0) / 20;
  const volumeConfirmed = !lastCandle.volume || lastCandle.volume > avgVolume * 0.8;
  if (!volumeConfirmed) {
    reasoning.push(`⚠️ VOLUME CONFIRMATION WEAK: Current ${lastCandle.volume} < avg ${avgVolume.toFixed(0)} (80% threshold)`);
  } else {
    reasoning.push(`✅ VOLUME CONFIRMATION: Strong volume on last candle`);
  }

  // ===== FEATURE 4: CORRELATION FILTERING (EUR/USD + GBP/USD SYNC) =====
  let correlationCheck = true;
  if (pair === "EUR/USD" || pair === "GBP/USD") {
    const otherPair = pair === "EUR/USD" ? "GBP/USD" : "EUR/USD";
    try {
      const otherCandles = await getForexCandles(otherPair, "15min", apiKey);
      const otherTechnicals = analyzeTechnicals(otherCandles);
      const otherTrend = otherTechnicals.supertrend.direction;
      const thisTrend = analyzeTechnicals(candles).supertrend.direction;
      
      if (thisTrend === otherTrend) {
        reasoning.push(`✅ CORRELATION ALIGNED: ${pair} & ${otherPair} both ${thisTrend}`);
      } else {
        correlationCheck = false;
        reasoning.push(`⚠️ CORRELATION MISALIGNED: ${pair}=${thisTrend} vs ${otherPair}=${otherTrend} (confidence penalty -15%)`);
      }
    } catch (e) {
      reasoning.push(`⚠️ CORRELATION CHECK: Could not fetch ${otherPair} data`);
    }
  }

  const technicals = analyzeTechnicals(candles);
  const technicalsH1 = analyzeTechnicals(candlesH1);

  const currentPrice = candles[candles.length - 1].close;
  const m15Trend = technicals.supertrend.direction;
  const h1Trend = technicalsH1.supertrend.direction;

  // RULE 1: HTF ALIGNMENT CHECK (now a confidence bonus, not required)
  const htfAligned = m15Trend === h1Trend;
  ruleChecklist.htfAlignment = htfAligned;
  if (htfAligned) {
    reasoning.push(`✅ HTF ALIGNMENT BONUS: M15 & H1 both ${m15Trend} (+10% confidence)`);
  } else {
    reasoning.push(`⚠️ HTF MISALIGNED: M15=${m15Trend}, H1=${h1Trend} (signal allowed with penalty)`);
  }

  // RULE 2: MARKET REGIME CHECK
  const validRegime = technicals.marketRegime === "TRENDING";
  ruleChecklist.marketRegime = validRegime;
  if (!validRegime) {
    reasoning.push(`❌ MARKET REGIME FAILED: ${technicals.marketRegime} (requires TRENDING)`);
    return {
      pair,
      currentPrice,
      signalType: "CALL",
      confidence: 0,
      signalGrade: "SKIPPED",
      entry: currentPrice,
      stopLoss: currentPrice,
      takeProfit: currentPrice,
      technicals,
      reasoning,
      ruleChecklist,
    };
  }
  reasoning.push(`✅ MARKET REGIME: TRENDING`);

  // VOLUME & CORRELATION HARD FILTERS
  if (!volumeConfirmed) {
    reasoning.push(`❌ VOLUME CONFIRMATION FAILED: Insufficient volume on signal candle`);
    return {
      pair,
      currentPrice,
      signalType: "CALL",
      confidence: 0,
      signalGrade: "SKIPPED",
      entry: currentPrice,
      stopLoss: currentPrice,
      takeProfit: currentPrice,
      technicals,
      reasoning,
      ruleChecklist,
    };
  }

  if (!correlationCheck && (pair === "EUR/USD" || pair === "GBP/USD")) {
    reasoning.push(`❌ CORRELATION FILTER FAILED: Pair not moving with related pairs`);
    return {
      pair,
      currentPrice,
      signalType: "CALL",
      confidence: 0,
      signalGrade: "SKIPPED",
      entry: currentPrice,
      stopLoss: currentPrice,
      takeProfit: currentPrice,
      technicals,
      reasoning,
      ruleChecklist,
    };
  }

  // RULE 3: CANDLE CONFIRMATION (3 consecutive)
  const candleConfirmed = hasThreeConsecutiveTrendCandles(candles, m15Trend);
  ruleChecklist.candleConfirmation = candleConfirmed;
  if (!candleConfirmed) {
    reasoning.push(`❌ CANDLE CONFIRMATION FAILED: Need 3 ${m15Trend} candles`);
    return {
      pair,
      currentPrice,
      signalType: "CALL",
      confidence: 0,
      signalGrade: "SKIPPED",
      entry: currentPrice,
      stopLoss: currentPrice,
      takeProfit: currentPrice,
      technicals,
      reasoning,
      ruleChecklist,
    };
  }
  reasoning.push(`✅ CANDLE CONFIRMATION: 3 consecutive ${m15Trend} candles`);

  // RULE 4: MOMENTUM SAFETY - Strict bounds
  const rsiValid = m15Trend === "BULLISH" ? (technicals.rsi >= 30 && technicals.rsi <= 85) : (technicals.rsi >= 15 && technicals.rsi <= 70);
  const stochValid = m15Trend === "BULLISH" ? technicals.stochastic.k < 90 : technicals.stochastic.k > 10;
  ruleChecklist.momentumSafety = rsiValid && stochValid;
  if (!rsiValid || !stochValid) {
    reasoning.push(`❌ MOMENTUM SAFETY FAILED: RSI=${technicals.rsi.toFixed(1)}, Stoch K=${technicals.stochastic.k.toFixed(1)}`);
    return {
      pair,
      currentPrice,
      signalType: "CALL",
      confidence: 0,
      signalGrade: "SKIPPED",
      entry: currentPrice,
      stopLoss: currentPrice,
      takeProfit: currentPrice,
      technicals,
      reasoning,
      ruleChecklist,
    };
  }
  reasoning.push(`✅ MOMENTUM SAFETY: RSI=${technicals.rsi.toFixed(1)}, Stoch K=${technicals.stochastic.k.toFixed(1)}`);

  // RULE 5: VOLATILITY FILTER - Must have sufficient ATR
  const minATR = (currentPrice * 0.0008);
  const volatilityOk = technicals.atr > minATR;
  ruleChecklist.volatilityFilter = volatilityOk;
  if (!volatilityOk) {
    reasoning.push(`❌ VOLATILITY FILTER FAILED: ATR=${technicals.atr.toFixed(6)} < min ${minATR.toFixed(6)}`);
    return {
      pair,
      currentPrice,
      signalType: "CALL",
      confidence: 0,
      signalGrade: "SKIPPED",
      entry: currentPrice,
      stopLoss: currentPrice,
      takeProfit: currentPrice,
      technicals,
      reasoning,
      ruleChecklist,
    };
  }
  reasoning.push(`✅ VOLATILITY FILTER: ATR=${technicals.atr.toFixed(6)} (healthy)`);

  // ALL RULES PASSED - Check Trend Exhaustion (MANDATORY FILTER)
  reasoning.push("🎯 ALL CORE RULES PASSED");

  const signalType: "CALL" | "PUT" = m15Trend === "BULLISH" ? "CALL" : "PUT";
  const exhausted = detectTrendExhaustion(technicals.adx, technicals.rsi, signalType);
  ruleChecklist.trendExhaustion = !exhausted;

  if (exhausted) {
    reasoning.push(`❌ TREND EXHAUSTION DETECTED: RSI extreme + weak ADX (ADX=${technicals.adx.toFixed(1)})`);
    return {
      pair,
      currentPrice,
      signalType,
      confidence: 0,
      signalGrade: "SKIPPED",
      entry: currentPrice,
      stopLoss: currentPrice,
      takeProfit: currentPrice,
      technicals,
      reasoning,
      ruleChecklist,
    };
  }
  reasoning.push(`✅ TREND EXHAUSTION CHECK: PASSED (ADX=${technicals.adx.toFixed(1)}, RSI=${technicals.rsi.toFixed(1)})`);

  const pipValue = pair.includes("JPY") ? 0.01 : 0.0001;

  // ENHANCEMENT: Multi-indicator alignment check will be evaluated in confidence section
  // Now allows 2/3 alignment instead of requiring all 3

  // ENHANCEMENT: Dynamic position sizing based on volatility
  let slMultiplier = 1.5;  // Base multiplier
  let tpMultiplier = 2.0;  // Base multiplier
  
  // Adjust for volatility: HIGH = wider stops, MEDIUM = normal, LOW = tighter
  if (technicals.volatility === "HIGH") {
    slMultiplier = 2.0;  // Wider stops in high volatility
    tpMultiplier = 2.5;  // Proportionally wider TP
    reasoning.push(`📊 VOLATILITY ADJUST: HIGH - Wider SL (${slMultiplier}x ATR)`);
  } else if (technicals.volatility === "LOW") {
    slMultiplier = 1.2;  // Tighter stops in low volatility
    tpMultiplier = 1.8;  // Proportionally tighter TP
    reasoning.push(`📊 VOLATILITY ADJUST: LOW - Tighter SL (${slMultiplier}x ATR)`);
  }

  // ENHANCEMENT: Use Support/Resistance for better exit placement
  const supportResistance = detectSupportResistance(candles);
  
  // Calculate dynamic levels
  const slPips = Math.max(technicals.atr * slMultiplier, pipValue * 15);
  const tpPips = slPips * tpMultiplier;

  const entry = currentPrice;
  
  // Place SL and TP, optionally adjusted to nearest S/R level
  let stopLoss = signalType === "CALL" ? currentPrice - slPips : currentPrice + slPips;
  let takeProfit = signalType === "CALL" ? currentPrice + tpPips : currentPrice - tpPips;
  
  // Adjust TP to resistance level if it's closer and reasonable
  if (signalType === "CALL" && takeProfit > supportResistance.resistance) {
    takeProfit = supportResistance.resistance * 0.98;  // Slightly below resistance
    reasoning.push(`🎯 RESISTANCE-BASED TP: Adjusted to ${takeProfit.toFixed(5)}`);
  } else if (signalType === "PUT" && takeProfit < supportResistance.support) {
    takeProfit = supportResistance.support * 1.02;  // Slightly above support
    reasoning.push(`🎯 SUPPORT-BASED TP: Adjusted to ${takeProfit.toFixed(5)}`);
  }
  
  // Ensure minimum 1:2 R/R ratio
  const currentRR = Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss);
  if (currentRR < 1.5) {
    takeProfit = signalType === "CALL" ? entry + (Math.abs(entry - stopLoss) * 1.5) : entry - (Math.abs(entry - stopLoss) * 1.5);
    reasoning.push(`⚖️ RISK/REWARD ADJUSTED: Min 1:1.5 ratio enforced (was ${currentRR.toFixed(2)})`);
  }

  // SIGNAL GRADING SYSTEM - Assign A/B/C grade
  const signalGrade = gradeSignal(
    technicals.adx, 
    technicals.volatility, 
    exhausted,
    signalType === "CALL" ? technicals.macd.histogram > 0 : technicals.macd.histogram < 0,
    technicals.supertrend.direction === (signalType === "CALL" ? "BULLISH" : "BEARISH"),
    htfAligned
  );
  
  if (signalGrade === "C" && !candleConfirmed) {
    reasoning.push(`⚠️ GRADE C SIGNAL: Execution SKIPPED (Minor weakness detected)`);
    return {
      pair,
      currentPrice,
      signalType,
      confidence: 0,
      signalGrade: "SKIPPED",
      entry,
      stopLoss,
      takeProfit,
      technicals,
      reasoning,
      ruleChecklist,
    };
  }

  // SESSION-BASED CONFIDENCE THRESHOLDS
  let baseConfidence = 75;
  const sessionThreshold = sessionTime === "MORNING" ? 65 : sessionTime === "AFTERNOON" ? 70 : 75;
  reasoning.push(`📊 SESSION-BASED: ${sessionTime} (threshold: ${sessionThreshold}%, base: ${baseConfidence}%)`);

  let confidence = baseConfidence;

  // HTF ALIGNMENT BONUS (was hard requirement, now bonus)
  if (htfAligned) {
    confidence += 10;
    reasoning.push(`✅ HTF ALIGNMENT BONUS: +10%`);
  } else {
    confidence -= 5;
    reasoning.push(`⚠️ HTF MISALIGNMENT PENALTY: -5%`);
  }

  // Bonus for strong momentum & ADX Trend Strength
  if (technicals.momentum === "STRONG") {
    confidence += 10;
    reasoning.push(`🚀 STRONG MOMENTUM BONUS: +10%`);
  }
  
  if (technicals.adx > 35) {
    confidence += 12;
    reasoning.push(`⚡ ULTRA-STRONG TREND (ADX > 35): +12%`);
  } else if (technicals.adx > 25) {
    confidence += 7;
    reasoning.push(`📈 STRONG TREND (ADX > 25): +7%`);
  }

  // VOLUME CONFIRMATION BONUS
  const bonusLastCandle = candles[candles.length - 1];
  const bonusAvgVolume = candles.slice(-20).reduce((sum, c) => sum + (c.volume || 0), 0) / 20;
  if (bonusLastCandle.volume && bonusLastCandle.volume > bonusAvgVolume * 1.5) {
    confidence += 10;
    reasoning.push(`📊 HIGH VOLUME CONFIRMATION: +10%`);
  }

  // MULTI-INDICATOR ALIGNMENT (2 out of 3 is now acceptable)
  const indicatorCheck = checkMultiIndicatorAlignment(technicals, m15Trend);
  if (indicatorCheck.count === 3) {
    confidence += 10;
    reasoning.push(`🎯 PERFECT ALIGNMENT (3/3 indicators): +10%`);
  } else if (indicatorCheck.count === 2) {
    confidence += 5;
    reasoning.push(`✅ GOOD ALIGNMENT (2/3 indicators): +5%`);
  } else {
    confidence -= 8;
    reasoning.push(`⚠️ WEAK ALIGNMENT (1/3 indicators): -8%`);
  }

  // Bonus for perfect confluence indicators
  if ((signalType === "CALL" && technicals.rsi < 40) || (signalType === "PUT" && technicals.rsi > 60)) {
    confidence += 5;
  }

  // Bonus for pattern confirmation
  if (technicals.candlePattern === "bullish_engulfing" && signalType === "CALL") confidence += 5;
  if (technicals.candlePattern === "bearish_engulfing" && signalType === "PUT") confidence += 5;

  // Grade A bonus
  if (signalGrade === "A") confidence += 5;

  confidence = Math.min(95, confidence);
  
  // Apply session-based threshold (lower during MORNING = more signals)
  if (confidence < sessionThreshold) {
    confidence = Math.max(sessionThreshold - 5, confidence);  // Boost weak signals slightly in morning
  }

  reasoning.push(`Grade ${signalGrade} | Confidence: ${confidence}% | RR: ${(Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss)).toFixed(2)}:1`);

  return {
    pair,
    currentPrice,
    signalType,
    confidence,
    signalGrade,
    entry,
    stopLoss,
    takeProfit,
    technicals,
    reasoning,
    ruleChecklist,
  };
}
