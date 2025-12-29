import { CandleData } from "../forexService";

export interface PatternScore {
  bullishEngulfing: number;
  bearishEngulfing: number;
  morningDoji: number;
  eveningDoji: number;
  hammerPattern: number;
  hangingMan: number;
  threeSoldiers: number;
  threeCrows: number;
  overallScore: number;
  direction: "BULLISH" | "BEARISH" | "NEUTRAL";
}

/**
 * Detect candlestick patterns across multiple timeframes
 * Scores patterns from -100 (strong bearish) to +100 (strong bullish)
 */
export function detectPatterns(candles: CandleData[]): PatternScore {
  if (candles.length < 3) {
    return {
      bullishEngulfing: 0,
      bearishEngulfing: 0,
      morningDoji: 0,
      eveningDoji: 0,
      hammerPattern: 0,
      hangingMan: 0,
      threeSoldiers: 0,
      threeCrows: 0,
      overallScore: 0,
      direction: "NEUTRAL",
    };
  }

  const scores = {
    bullishEngulfing: detectBullishEngulfing(candles),
    bearishEngulfing: detectBearishEngulfing(candles),
    morningDoji: detectMorningDoji(candles),
    eveningDoji: detectEveningDoji(candles),
    hammerPattern: detectHammer(candles),
    hangingMan: detectHangingMan(candles),
    threeSoldiers: detectThreeSoldiers(candles),
    threeCrows: detectThreeCrows(candles),
  };

  // Calculate weighted overall score
  const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / 8;
  const direction =
    overallScore > 10
      ? "BULLISH"
      : overallScore < -10
        ? "BEARISH"
        : "NEUTRAL";

  return {
    ...scores,
    overallScore: Math.round(overallScore * 10) / 10,
    direction,
  };
}

function getBodySize(candle: CandleData): number {
  return Math.abs(candle.close - candle.open);
}

function getWickSize(candle: CandleData): number {
  const upper = candle.high - Math.max(candle.open, candle.close);
  const lower = Math.min(candle.open, candle.close) - candle.low;
  return Math.max(upper, lower);
}

function detectBullishEngulfing(candles: CandleData[]): number {
  const current = candles[candles.length - 1];
  const previous = candles[candles.length - 2];

  if (
    previous.close < previous.open &&
    current.close > current.open &&
    current.close > previous.open &&
    current.open < previous.close &&
    getBodySize(current) > getBodySize(previous) * 0.8
  ) {
    return 75;
  }
  return 0;
}

function detectBearishEngulfing(candles: CandleData[]): number {
  const current = candles[candles.length - 1];
  const previous = candles[candles.length - 2];

  if (
    previous.close > previous.open &&
    current.close < current.open &&
    current.open > previous.close &&
    current.close < previous.open &&
    getBodySize(current) > getBodySize(previous) * 0.8
  ) {
    return -75;
  }
  return 0;
}

function detectMorningDoji(candles: CandleData[]): number {
  if (candles.length < 3) return 0;
  const c1 = candles[candles.length - 3];
  const c2 = candles[candles.length - 2];
  const c3 = candles[candles.length - 1];

  const isDoji = getBodySize(c2) < (c2.high - c2.low) * 0.1;
  if (
    c1.close < c1.open &&
    isDoji &&
    c3.close > c3.open &&
    c3.close > c1.open
  ) {
    return 60;
  }
  return 0;
}

function detectEveningDoji(candles: CandleData[]): number {
  if (candles.length < 3) return 0;
  const c1 = candles[candles.length - 3];
  const c2 = candles[candles.length - 2];
  const c3 = candles[candles.length - 1];

  const isDoji = getBodySize(c2) < (c2.high - c2.low) * 0.1;
  if (
    c1.close > c1.open &&
    isDoji &&
    c3.close < c3.open &&
    c3.close < c1.open
  ) {
    return -60;
  }
  return 0;
}

function detectHammer(candles: CandleData[]): number {
  const current = candles[candles.length - 1];
  const bodySize = getBodySize(current);
  const range = current.high - current.low;

  if (bodySize > 0 && range > 0) {
    const lowerWick = Math.min(current.open, current.close) - current.low;
    const upperWick = current.high - Math.max(current.open, current.close);

    if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5) {
      return 50;
    }
  }
  return 0;
}

function detectHangingMan(candles: CandleData[]): number {
  const current = candles[candles.length - 1];
  const bodySize = getBodySize(current);
  const range = current.high - current.low;

  if (bodySize > 0 && range > 0) {
    const lowerWick = Math.min(current.open, current.close) - current.low;
    const upperWick = current.high - Math.max(current.open, current.close);

    if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5) {
      return -50;
    }
  }
  return 0;
}

function detectThreeSoldiers(candles: CandleData[]): number {
  if (candles.length < 3) return 0;
  const c1 = candles[candles.length - 3];
  const c2 = candles[candles.length - 2];
  const c3 = candles[candles.length - 1];

  if (
    c1.close > c1.open &&
    c2.close > c2.open &&
    c3.close > c3.open &&
    c2.close > c1.close &&
    c3.close > c2.close &&
    c2.open > c1.open &&
    c3.open > c2.open
  ) {
    return 65;
  }
  return 0;
}

function detectThreeCrows(candles: CandleData[]): number {
  if (candles.length < 3) return 0;
  const c1 = candles[candles.length - 3];
  const c2 = candles[candles.length - 2];
  const c3 = candles[candles.length - 1];

  if (
    c1.close < c1.open &&
    c2.close < c2.open &&
    c3.close < c3.open &&
    c2.close < c1.close &&
    c3.close < c2.close &&
    c2.open < c1.open &&
    c3.open < c2.open
  ) {
    return -65;
  }
  return 0;
}
