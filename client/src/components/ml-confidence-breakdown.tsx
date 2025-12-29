import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Brain, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface PatternScore {
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

interface SentimentScore {
  rsiSentiment: number;
  macdSentiment: number;
  stochasticSentiment: number;
  trendSentiment: number;
  volatilitySentiment: number;
  momentumSentiment: number;
  adxStrength: number;
  overallSentiment: number;
}

interface MLConfidenceBreakdownProps {
  patternScore?: PatternScore;
  sentimentScore?: SentimentScore;
  mlConfidenceBoost?: number;
  signalType: "CALL" | "PUT";
}

export default function MLConfidenceBreakdown({
  patternScore,
  sentimentScore,
  mlConfidenceBoost = 0,
  signalType
}: MLConfidenceBreakdownProps) {
  if (!patternScore || !sentimentScore) return null;

  const getSentimentColor = (value: number) => {
    if (value > 50) return "text-emerald-400";
    if (value > 0) return "text-cyan-400";
    if (value > -50) return "text-orange-400";
    return "text-rose-400";
  };

  const getPatternName = (score: number) => {
    if (score > 50) return "Bullish Pattern";
    if (score < -50) return "Bearish Pattern";
    return "Neutral Pattern";
  };

  const getBoostColor = () => {
    if (mlConfidenceBoost > 15) return "bg-emerald-500/20 border-emerald-500/40";
    if (mlConfidenceBoost > 0) return "bg-cyan-500/20 border-cyan-500/40";
    if (mlConfidenceBoost > -15) return "bg-orange-500/20 border-orange-500/40";
    return "bg-rose-500/20 border-rose-500/40";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {/* ML Confidence Boost */}
      <div className={`rounded-lg border p-3 ${getBoostColor()} backdrop-blur-sm`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
              ML CONFIDENCE BOOST
            </span>
          </div>
          <span className={`text-sm font-black ${mlConfidenceBoost > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {mlConfidenceBoost > 0 ? '+' : ''}{mlConfidenceBoost}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-900/50 rounded-full overflow-hidden border border-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, 50 + mlConfidenceBoost))}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full ${mlConfidenceBoost > 0 ? 'bg-gradient-to-r from-purple-600 to-purple-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`}
          />
        </div>
      </div>

      {/* Pattern Recognition */}
      <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
              Pattern Recognition
            </span>
          </div>
          <span className={`text-xs font-black ${patternScore.direction === 'BULLISH' ? 'text-emerald-400' : patternScore.direction === 'BEARISH' ? 'text-rose-400' : 'text-slate-400'}`}>
            {getPatternName(patternScore.overallScore)}
          </span>
        </div>
        <div className="space-y-1.5 text-[9px]">
          <div className="flex justify-between items-center text-slate-400">
            <span>Score:</span>
            <span className="font-mono text-indigo-400 font-bold">
              {patternScore.overallScore > 0 ? '+' : ''}{patternScore.overallScore.toFixed(1)}
            </span>
          </div>
          {patternScore.bullishEngulfing > 0 && (
            <div className="text-slate-500">• Bullish Engulfing: {patternScore.bullishEngulfing}%</div>
          )}
          {patternScore.bearishEngulfing > 0 && (
            <div className="text-slate-500">• Bearish Engulfing: {patternScore.bearishEngulfing}%</div>
          )}
          {patternScore.threeSoldiers > 0 && (
            <div className="text-slate-500">• Three Soldiers: {patternScore.threeSoldiers}%</div>
          )}
          {patternScore.threeCrows > 0 && (
            <div className="text-slate-500">• Three Crows: {patternScore.threeCrows}%</div>
          )}
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {sentimentScore.overallSentiment > 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
              Market Sentiment
            </span>
          </div>
          <span className={`text-xs font-black ${getSentimentColor(sentimentScore.overallSentiment)}`}>
            {sentimentScore.overallSentiment > 0 ? 'BULLISH' : sentimentScore.overallSentiment < 0 ? 'BEARISH' : 'NEUTRAL'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[8px]">
          <div className="flex justify-between text-slate-500">
            <span>RSI:</span>
            <span className={`font-mono font-bold ${getSentimentColor(sentimentScore.rsiSentiment)}`}>
              {sentimentScore.rsiSentiment > 0 ? '+' : ''}{sentimentScore.rsiSentiment.toFixed(0)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>MACD:</span>
            <span className={`font-mono font-bold ${getSentimentColor(sentimentScore.macdSentiment)}`}>
              {sentimentScore.macdSentiment > 0 ? '+' : ''}{sentimentScore.macdSentiment.toFixed(0)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Trend:</span>
            <span className={`font-mono font-bold ${getSentimentColor(sentimentScore.trendSentiment)}`}>
              {sentimentScore.trendSentiment > 0 ? '+' : ''}{sentimentScore.trendSentiment.toFixed(0)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>ADX:</span>
            <span className="font-mono font-bold text-purple-400">
              {sentimentScore.adxStrength.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
