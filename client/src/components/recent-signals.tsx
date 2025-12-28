
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Signal } from "@/lib/constants";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, Timer, Activity, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface RecentSignalsProps {
  signals: Signal[];
}

function RecentSignals({ signals }: RecentSignalsProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'won' | 'lost'>('all');

  const filteredSignals = signals.filter(signal => {
    if (filter === 'all') return true;
    return signal.status === filter;
  });

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
    <Card className="h-full bg-slate-900/40 border-white/5 overflow-hidden flex flex-col backdrop-blur-md">
      <CardHeader className="py-4 md:py-5 px-4 md:px-6 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <CardTitle className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-1.5 md:gap-2">
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500" />
            Live Intel
          </CardTitle>
          {signals.length > 0 && (
            <div className="text-[9px] md:text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 md:px-2 py-0.5 rounded border border-emerald-500/20 tracking-widest tabular-nums">
              {filteredSignals.length} / {signals.length}
            </div>
          )}
        </div>
        
        {/* Filter Buttons */}
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
          <div className="p-3 md:p-4 space-y-2 md:space-y-3">
            {filteredSignals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-slate-800/50 border border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 hover:bg-slate-800 transition-all duration-300"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center border ${
                    signal.type === "CALL" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                  }`}>
                    {signal.type === "CALL" ? (
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5 md:mb-1">
                      <span className="text-xs md:text-sm font-black text-white italic tracking-tighter uppercase truncate mr-2">{signal.pair}</span>
                      <span className="text-[8px] md:text-[10px] font-black text-slate-500 tabular-nums uppercase tracking-widest shrink-0">{signal.startTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span className={`text-[8px] md:text-[9px] font-black px-1 md:px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                        signal.type === "CALL" ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                      }`}>
                        {signal.type === "CALL" ? "Buy" : "Sell"}
                      </span>
                      <span className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest italic truncate">{signal.timeframe}</span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 text-right">
                    <div className="text-sm md:text-lg font-black text-white italic leading-none mb-0.5 md:mb-1">{signal.confidence}%</div>
                    <div className="flex justify-end scale-75 md:scale-100">{getStatusIcon(signal.status)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentSignals;
