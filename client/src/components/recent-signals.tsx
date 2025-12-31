
import { memo, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Signal } from "@/lib/constants";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, Timer, Activity, Filter, Zap, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import MLConfidenceBreakdown from "./ml-confidence-breakdown";

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

interface SignalWithML extends Signal {
  mlPatternScore?: PatternScore;
  sentimentScore?: SentimentScore;
  mlConfidenceBoost?: number;
  stakeAdvice?: {
    recommendation: "HIGH" | "MEDIUM" | "LOW" | "CAUTION";
    reason: string;
    size: string;
  };
}

const SignalItem = memo(({ signal, isExpanded, onToggle }: { signal: SignalWithML, isExpanded: boolean, onToggle: () => void }) => {
  const getStatusIcon = (status: Signal["status"]) => {
    switch (status) {
      case "won":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "lost":
        return <XCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Timer className="w-4 h-4 text-primary animate-pulse" />;
    }
  };

  return (
    <div className="group relative bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
      <div className="space-y-4 font-mono relative z-10">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
          <div className="flex flex-col">
            <span className="text-emerald-400 font-black tracking-tighter uppercase text-[11px] sm:text-sm flex items-center gap-2">
              🚀 GILGALO PRO SIGNAL
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:border-emerald-500/30 transition-colors">
              {getStatusIcon(signal.status)}
            </div>
          </div>
        </div>
        
        <div className="space-y-1 text-[13px] sm:text-base leading-tight">
          <div className="flex items-baseline gap-2 text-white">
            <span className="text-slate-500 w-14 shrink-0">Pair:</span>
            <span className="font-black uppercase tracking-wider">{signal.pair}</span>
          </div>
          
          <div className="flex items-baseline gap-2 text-white">
            <span className="text-slate-500 w-14 shrink-0">Action:</span>
            <span className={`font-black flex items-center gap-1.5 ${
              signal.type === "CALL" ? "text-emerald-400" : "text-rose-400"
            }`}>
              {signal.type === "CALL" ? "BUY/CALL 📈" : "SELL/PUT 📉"}
            </span>
          </div>

          {signal.stakeAdvice && (
            <div className="my-1.5 py-1.5 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-black">
                <span>{signal.stakeAdvice.recommendation === "HIGH" ? "💎" : (signal.stakeAdvice.recommendation === "MEDIUM" ? "✨" : "⚖️")}</span>
                <span className="uppercase tracking-widest text-[10px] sm:text-xs">STAKE: {signal.stakeAdvice.recommendation} ({signal.stakeAdvice.size})</span>
              </div>
            </div>
          )}
          
          <div className="flex items-baseline gap-2 text-white pt-1">
            <span className="text-slate-500 w-14 shrink-0">Entry:</span>
            <span className="font-bold tabular-nums">{signal.entry.toFixed(5)}</span>
          </div>
          
          <div className="flex items-baseline gap-2 text-white">
            <span className="text-slate-500 w-14 shrink-0">Start:</span>
            <span className="font-bold tabular-nums text-emerald-400">{signal.startTime} EAT</span>
          </div>
          
          <div className="flex items-baseline gap-2 text-white">
            <span className="text-slate-500 w-14 shrink-0">End:</span>
            <span className="font-bold tabular-nums text-rose-400">{signal.endTime} EAT</span>
          </div>
        </div>

        <div className="pt-3 mt-2 border-t border-white/5 flex flex-col gap-2">
          {signal.mlPatternScore && signal.sentimentScore && (
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-between text-[9px] font-black text-purple-400 uppercase tracking-wider hover:text-purple-300 transition-colors pt-1"
            >
              <span>ML Analysis Breakdown</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-3 h-3" />
              </motion.div>
            </button>
          )}
          <div className="flex justify-center italic text-[10px] text-slate-500">
            Trust the system. Trade the plan.
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && signal.mlPatternScore && signal.sentimentScore && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-3 mt-3 border-t border-white/10"
            >
              <MLConfidenceBreakdown
                patternScore={signal.mlPatternScore}
                sentimentScore={signal.sentimentScore}
                mlConfidenceBoost={signal.mlConfidenceBoost}
                signalType={signal.type}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

SignalItem.displayName = "SignalItem";

interface RecentSignalsProps {
  signals: SignalWithML[];
}

function RecentSignals({ signals }: RecentSignalsProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'won' | 'lost'>('all');
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  const filteredSignals = useMemo(() => signals.filter(signal => {
    if (filter === 'all') return true;
    return signal.status === filter;
  }), [signals, filter]);

  return (
    <Card className="h-full bg-slate-950/40 border-emerald-500/10 overflow-hidden flex flex-col backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.3)] ring-1 ring-white/5">
      <CardHeader className="py-5 md:py-6 px-5 md:px-8 border-b border-white/5 shrink-0 bg-white/5">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <CardTitle className="text-[10px] md:text-xs font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-2 md:gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
            Live Intel Signal Feed
          </CardTitle>
          {signals.length > 0 && (
            <div className="text-[9px] md:text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 md:px-2 py-0.5 rounded border border-emerald-500/20 tracking-widest tabular-nums">
              {filteredSignals.length} / {signals.length}
            </div>
          )}
        </div>
        
        <div className="flex gap-1.5 md:gap-2 overflow-x-auto no-scrollbar pb-1">
          {['all', 'active', 'won', 'lost'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-2.5 md:px-3 py-1 rounded md:rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                filter === f 
                  ? 'bg-emerald-500 text-slate-900 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                  : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
        {filteredSignals.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-2xl md:rounded-[2rem] bg-slate-800 flex items-center justify-center border border-white/5">
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-slate-600" />
            </div>
            <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">Idle System</p>
          </div>
        ) : (
          <div className="p-3 md:p-4 space-y-2 md:space-y-3 signal-list-container">
            {filteredSignals.map((signal) => (
              <SignalItem
                key={signal.id}
                signal={signal}
                isExpanded={expandedSignal === signal.id}
                onToggle={() => setExpandedSignal(expandedSignal === signal.id ? null : signal.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(RecentSignals);
