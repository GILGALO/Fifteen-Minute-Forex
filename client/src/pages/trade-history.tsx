import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Signal } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBoundary from "@/components/error-boundary";
import { Suspense } from "react";

export default function TradeHistory() {
  const { data: signals = [] } = useQuery<Signal[]>({
    queryKey: ["/api/forex/signals"], // Assuming there is an endpoint or we use the home logic
    enabled: false, // For now we'll just show the UI as the requirement is to move it
  });

  // Note: In a real app, this would fetch from the database
  // For this quick edit, we'll keep the same UI structure but in its own page
  const trades = signals.filter(s => s.status !== 'active');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-widest bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent">
            Trade History
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mt-2">
            Performance & Signal Analytics
          </p>
        </header>

        <ErrorBoundary>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <Card className="glass-panel border-white/10 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-black uppercase tracking-widest">Completed Trades</h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Pair</th>
                        <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                        <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</th>
                        <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                        <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {trades.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                            No trades recorded yet
                          </td>
                        </tr>
                      ) : (
                        trades.map((trade) => (
                          <tr key={trade.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 font-black text-xs text-slate-200">{trade.pair}</td>
                            <td className="py-4 font-black text-xs">
                              <span className={trade.type === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}>
                                {trade.type}
                              </span>
                            </td>
                            <td className="py-4 text-xs text-slate-400 font-mono">{trade.startTime}</td>
                            <td className="py-4 uppercase tracking-tighter text-[10px] font-black text-slate-500">
                              Completed
                            </td>
                            <td className="py-4">
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                trade.status === 'won' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {trade.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
