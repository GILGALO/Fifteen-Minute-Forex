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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Win Rate Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-slate-900/50 border-white/5 overflow-hidden relative group hover:border-emerald-500/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1 font-black">Success Probability</p>
                <p className="text-5xl font-black text-white italic tracking-tighter">{winRate}<span className="text-emerald-500 text-2xl ml-1">%</span></p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500">{wonSignals}W</div>
                  <div className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-500">{lostSignals}L</div>
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Avg Confidence Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-slate-900/50 border-white/5 overflow-hidden relative group hover:border-cyan-500/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1 font-black">System Confidence</p>
                <p className="text-5xl font-black text-white italic tracking-tighter">{avgConfidence}<span className="text-cyan-500 text-2xl ml-1">%</span></p>
                <p className="text-[10px] text-cyan-400/60 mt-3 font-bold uppercase tracking-wider">{highConfidenceSignals} High-Prob detected</p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform duration-500">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Best Pair Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-slate-900/50 border-white/5 overflow-hidden relative group hover:border-blue-500/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1 font-black">Optimal Asset</p>
                <p className="text-4xl font-black text-white italic tracking-tighter">{topPair ? topPair[0] : 'Scanning...'}</p>
                {topPair && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1 w-12 bg-blue-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${(topPair[1].won / topPair[1].total) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{((topPair[1].won / topPair[1].total) * 100).toFixed(0)}% Eff</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
