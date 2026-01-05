import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { type Signal } from "@/lib/constants";
import { TrendingUp, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface AnalyticsDashboardProps {
  signals: Signal[];
}

function AnalyticsDashboard({ signals }: AnalyticsDashboardProps) {
  // ... (logic stays same)

  const wonSignals = signals.filter(s => s.status === 'won').length;
  const lostSignals = signals.filter(s => s.status === 'lost').length;
  const totalCompleted = wonSignals + lostSignals;
  const winRate = totalCompleted > 0 ? ((wonSignals / totalCompleted) * 100).toFixed(1) : '0.0';

  const pairPerformance = signals.reduce((acc, signal) => {
    if (!acc[signal.pair]) {
      acc[signal.pair] = { won: 0, lost: 0, total: 0 };
    }
    if (signal.status === 'won') acc[signal.pair].won++;
    else if (signal.status === 'lost') acc[signal.pair].lost++;
    if (signal.status !== 'active') acc[signal.pair].total++;
    return acc;
  }, {} as Record<string, { won: number; lost: number; total: number }>);

  const topPair = Object.entries(pairPerformance).sort((a, b) => {
    const rateA = a[1].total > 0 ? (a[1].won / a[1].total) * 100 : 0;
    const rateB = b[1].total > 0 ? (b[1].won / b[1].total) * 100 : 0;
    return rateB - rateA;
  })[0];

  const avgConfidence = signals.length > 0 ? (signals.reduce((acc, s) => acc + s.confidence, 0) / signals.length).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6">
      {/* Win Rate Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="premium-card p-0 overflow-hidden group border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)] bg-slate-900/50 backdrop-blur-xl">
          <CardContent className="p-4 md:p-6 relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] md:text-xs text-emerald-400 font-bold uppercase tracking-[0.2em]">Success Rate</p>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-4xl md:text-6xl font-black text-white tabular-nums tracking-tighter">{winRate}</p>
              <span className="text-emerald-500 text-xl md:text-2xl font-bold">%</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold uppercase">
                <span>Performance</span>
                <span>{winRate}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${winRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Avg Confidence Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="premium-card p-0 overflow-hidden group border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.1)] bg-slate-900/50 backdrop-blur-xl">
          <CardContent className="p-4 md:p-6 relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] md:text-xs text-cyan-400 font-bold uppercase tracking-[0.2em]">Signal Strength</p>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-4xl md:text-6xl font-black text-white tabular-nums tracking-tighter">{avgConfidence}</p>
              <span className="text-cyan-500 text-xl md:text-2xl font-bold">%</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold uppercase">
                <span>Reliability</span>
                <span>{avgConfidence}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${avgConfidence}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Best Pair Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="col-span-2 md:col-span-1">
        <Card className="premium-card p-0 overflow-hidden group border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)] bg-slate-900/50 backdrop-blur-xl">
          <CardContent className="p-4 md:p-6 relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] md:text-xs text-blue-400 font-bold uppercase tracking-[0.2em]">Top Performer</p>
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl md:text-4xl font-black text-white uppercase truncate leading-none mb-2 tracking-tighter">{topPair ? topPair[0] : 'ANALYZING'}</p>
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold uppercase">
                <span>Pair Win Rate</span>
                <span>{topPair ? ((topPair[1].won / topPair[1].total) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: topPair ? `${(topPair[1].won / topPair[1].total) * 100}%` : '0%' }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default memo(AnalyticsDashboard);
