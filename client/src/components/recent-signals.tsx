
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-slate-800/80 border-2 border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="space-y-3 font-mono">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                    <span className="text-emerald-400 font-black tracking-tighter uppercase text-sm">NEW SIGNAL ALERT 🚀</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-bold tabular-nums">{signal.confidence}%</span>
                      {getStatusIcon(signal.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-slate-500 w-24 tracking-tight">📊 Pair:</span>
                      <span className="font-black uppercase tracking-wider">{signal.pair}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-slate-500 w-24 tracking-tight">⚡ Type:</span>
                      <span className={`font-black flex items-center gap-1.5 ${
                        signal.type === "CALL" ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {signal.type === "CALL" ? "🟢 BUY/CALL" : "🔴 SELL/PUT"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-slate-500 w-24 tracking-tight">⏱ Timeframe:</span>
                      <span className="font-bold">{signal.timeframe}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-slate-500 w-24 tracking-tight">⏰ Start Time:</span>
                      <span className="font-bold tabular-nums">{signal.startTime}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-slate-500 w-24 tracking-tight">🏁 End Time:</span>
                      <span className="font-bold tabular-nums">{signal.endTime}</span>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-white/5 flex justify-between items-center opacity-60">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">System Confirmed</span>
                    <span className="text-[9px] text-emerald-500/70 font-black uppercase tracking-widest">Verified ⚡</span>
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
