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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Win Rate Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-panel border-emerald-500/50 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Win Rate</p>
                <p className="text-4xl font-black text-emerald-400">{winRate}%</p>
                <p className="text-xs text-muted-foreground mt-2">{wonSignals}W / {lostSignals}L</p>
              </div>
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Avg Confidence Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-panel border-cyan-500/50 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Avg Confidence</p>
                <p className="text-4xl font-black text-cyan-400">{avgConfidence}%</p>
                <p className="text-xs text-muted-foreground mt-2">{highConfidenceSignals} high-prob signals</p>
              </div>
              <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Best Pair Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass-panel border-blue-500/50 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Best Pair</p>
                <p className="text-3xl font-black text-blue-400">{topPair ? topPair[0] : 'N/A'}</p>
                {topPair && <p className="text-xs text-muted-foreground mt-2">{((topPair[1].won / topPair[1].total) * 100).toFixed(0)}% win rate</p>}
              </div>
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
