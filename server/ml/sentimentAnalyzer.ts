import { TechnicalAnalysis } from "../forexService";

export interface SentimentScore {
  rsiSentiment: number; // -100 to +100
  macdSentiment: number; // -100 to +100
  stochasticSentiment: number; // -100 to +100
  trendSentiment: number; // -100 to +100
  volatilitySentiment: number; // -100 to +100
  momentumSentiment: number; // -100 to +100
  adxStrength: number; // 0 to +100 (trend strength)
  overallSentiment: number; // -100 to +100
}

/**
 * Analyze market sentiment from technical indicators
 * Generates sentiment scores and overall market bias
 */
export function analyzeSentiment(technicals: TechnicalAnalysis): SentimentScore {
  const rsiSentiment = scoreRSI(technicals.rsi);
  const macdSentiment = scoreMACD(technicals.macd);
  const stochasticSentiment = scoreStochastic(technicals.stochastic);
  const trendSentiment = scoreTrend(technicals.trend);
  const volatilitySentiment = scoreVolatility(technicals.volatility);
  const momentumSentiment = scoreMomentum(technicals.momentum);
  const adxStrength = scoreADX(technicals.adx);

  // Calculate weighted overall sentiment
  const scores = [
    rsiSentiment * 0.15,
    macdSentiment * 0.2,
    stochasticSentiment * 0.15,
    trendSentiment * 0.3,
    volatilitySentiment * 0.05,
    momentumSentiment * 0.15,
  ];

  const overallSentiment = scores.reduce((a, b) => a + b, 0);

  return {
    rsiSentiment,
    macdSentiment,
    stochasticSentiment,
    trendSentiment,
    volatilitySentiment,
    momentumSentiment,
    adxStrength,
    overallSentiment: Math.round(overallSentiment),
  };
}

function scoreRSI(rsi: number): number {
  // RSI: 30-70 is neutral, <30 oversold (bearish), >70 overbought (bullish)
  // REDUCED: More aggressive scoring to prevent excessive neutrality
  if (rsi < 30) return -40; // Lowered from -60
  if (rsi < 40) return -20; // Lowered from -30
  if (rsi < 50) return -10; // Lowered from -15
  if (rsi < 60) return 10;  // Lowered from 15
  if (rsi < 70) return 20;  // Lowered from 30
  if (rsi <= 85) return 40; // Lowered from 60
  return 20; // Lowered from 30
}

function scoreMACD(macd: { macdLine: number; signalLine: number; histogram: number }): number {
  const histStrength = Math.min(Math.abs(macd.histogram) * 1000, 100);
  if (macd.histogram > 0) {
    return macd.macdLine > macd.signalLine ? histStrength : histStrength * 0.5;
  } else {
    return macd.macdLine < macd.signalLine ? -histStrength : -histStrength * 0.5;
  }
}

function scoreStochastic(stochastic: { k: number; d: number }): number {
  // Stochastic: <20 oversold, >80 overbought
  if (stochastic.k < 20) return -75;
  if (stochastic.k < 40) return -40;
  if (stochastic.k < 60) return 0;
  if (stochastic.k < 80) return 40;
  return 75;
}

function scoreTrend(trend: "BULLISH" | "BEARISH" | "NEUTRAL"): number {
  return trend === "BULLISH" ? 80 : trend === "BEARISH" ? -80 : 0;
}

function scoreVolatility(volatility: "HIGH" | "MEDIUM" | "LOW"): number {
  // High volatility = risk, but also opportunity
  return volatility === "HIGH" ? 30 : volatility === "MEDIUM" ? 0 : -20;
}

function scoreMomentum(momentum: "STRONG" | "MODERATE" | "WEAK"): number {
  return momentum === "STRONG" ? 70 : momentum === "MODERATE" ? 30 : -30;
}

function scoreADX(adx: number): number {
  // ADX: 0-25 weak trend, 25-50 strong, 50+ very strong
  if (adx < 20) return 20; // Weak trend (caution)
  if (adx < 40) return 60; // Strong trend
  return 100; // Very strong trend
}

/**
 * Generate explanation for sentiment
 */
export function getSentimentExplanation(sentiment: SentimentScore): string {
  const score = sentiment.overallSentiment;
  if (score > 70) return "🟢 VERY BULLISH - Strong upside momentum";
  if (score > 40) return "🟢 BULLISH - Moderate bullish bias";
  if (score > 10) return "🟢 MILDLY BULLISH - Slight upside advantage";
  if (score > -10) return "⚪ NEUTRAL - Mixed signals";
  if (score > -40) return "🔴 MILDLY BEARISH - Slight downside pressure";
  if (score > -70) return "🔴 BEARISH - Moderate bearish bias";
  return "🔴 VERY BEARISH - Strong downside momentum";
}
