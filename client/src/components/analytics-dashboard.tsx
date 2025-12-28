import { Card, CardContent } from "@/components/ui/card";
import { type Signal } from "@/lib/constants";
import { TrendingUp, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface AnalyticsDashboardProps {
  signals: Signal[];
}

export default function AnalyticsDashboard({ signals }: AnalyticsDashboardProps) {
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-4">
      {/* Win Rate Card */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <Card className="premium-card p-0 overflow-hidden group border-emerald-500/20">
          <CardContent className="p-3 md:p-4 relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-1">
              <p className="text-[8px] md:text-[10px] text-emerald-400/70 uppercase tracking-widest font-black">Accuracy</p>
              <TrendingUp className="w-3 h-3 text-emerald-400 opacity-50" />
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-xl md:text-3xl font-black text-white italic leading-none">{winRate}</p>
              <span className="text-emerald-500 text-xs md:text-sm font-black italic">%</span>
            </div>
            <div className="mt-2 h-1 bg-slate-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${winRate}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Avg Confidence Card */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <Card className="premium-card p-0 overflow-hidden group border-cyan-500/20">
          <CardContent className="p-3 md:p-4 relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-1">
              <p className="text-[8px] md:text-[10px] text-cyan-400/70 uppercase tracking-widest font-black">Conviction</p>
              <Zap className="w-3 h-3 text-cyan-400 opacity-50" />
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-xl md:text-3xl font-black text-white italic leading-none">{avgConfidence}</p>
              <span className="text-cyan-500 text-xs md:text-sm font-black italic">%</span>
            </div>
            <div className="mt-2 h-1 bg-slate-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${avgConfidence}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Best Pair Card */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="col-span-2 md:col-span-1">
        <Card className="premium-card p-0 overflow-hidden group border-blue-500/20">
          <CardContent className="p-3 md:p-4 relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-1">
              <p className="text-[8px] md:text-[10px] text-blue-400/70 uppercase tracking-widest font-black">Dominant</p>
              <Target className="w-3 h-3 text-blue-400 opacity-50" />
            </div>
            <p className="text-lg md:text-xl font-black text-white italic uppercase truncate leading-none">{topPair ? topPair[0] : 'SCANNING'}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: topPair ? `${(topPair[1].won / topPair[1].total) * 100}%` : '0%' }}
                  className="h-full bg-blue-500"
                />
              </div>
              <span className="text-[10px] font-black text-slate-400">{topPair ? ((topPair[1].won / topPair[1].total) * 100).toFixed(0) : 0}%</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
