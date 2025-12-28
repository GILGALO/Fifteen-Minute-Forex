import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Signal } from "@/lib/constants";
import { PieChart, TrendingUp, Target, Clock, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface AnalyticsDashboardProps {
  signals: Signal[];
}

export default function AnalyticsDashboard({ signals }: AnalyticsDashboardProps) {
  const wonSignals = signals.filter(s => s.status === 'won').length;
  const lostSignals = signals.filter(s => s.status === 'lost').length;
  const totalCompleted = wonSignals + lostSignals;
  const winRate = totalCompleted > 0 ? ((wonSignals / totalCompleted) * 100).toFixed(1) : '0.0';

  // Calculate pair performance
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
  const highConfidenceSignals = signals.filter(s => s.confidence >= 85).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
      {/* Win Rate Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="premium-card p-0 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <CardContent className="p-8 md:p-10 relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[10px] md:text-xs text-emerald-400/70 uppercase tracking-[0.3em] mb-2 font-black">Accuracy Rating</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none">{winRate}</p>
                  <span className="text-emerald-500 text-2xl md:text-4xl font-black italic">%</span>
                </div>
              </div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${winRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                />
              </div>
              <span className="text-xs font-black text-slate-400 tabular-nums">{winRate}%</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 tracking-widest uppercase">{wonSignals} Wins</div>
              <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-400 tracking-widest uppercase">{lostSignals} Losses</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Avg Confidence Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="premium-card p-0 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <CardContent className="p-8 md:p-10 relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[10px] md:text-xs text-cyan-400/70 uppercase tracking-[0.3em] mb-2 font-black">System Conviction</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none">{avgConfidence}</p>
                  <span className="text-cyan-500 text-2xl md:text-4xl font-black italic">%</span>
                </div>
              </div>
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${avgConfidence}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                />
              </div>
              <span className="text-xs font-black text-slate-400 tabular-nums">{avgConfidence}%</span>
            </div>
            
            <p className="text-[10px] text-cyan-400/60 font-black uppercase tracking-wider">{highConfidenceSignals} Ultra-High-Prob Signals Processed</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Best Pair Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="premium-card p-0 overflow-hidden group sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <CardContent className="p-8 md:p-10 relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[10px] md:text-xs text-blue-400/70 uppercase tracking-[0.3em] mb-2 font-black">Dominant Asset</p>
                <p className="text-3xl md:text-5xl font-black text-white italic tracking-tighter mb-1 uppercase truncate leading-none">{topPair ? topPair[0] : 'SCANNING'}</p>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl group-hover:scale-110 transition-all duration-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: topPair ? `${(topPair[1].won / topPair[1].total) * 100}%` : '0%' }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                />
              </div>
              <span className="text-xs font-black text-slate-400 tabular-nums">{topPair ? ((topPair[1].won / topPair[1].total) * 100).toFixed(0) : 0}%</span>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] text-blue-400/60 font-black uppercase tracking-[0.2em]">Asset Alpha Stability Verified</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
