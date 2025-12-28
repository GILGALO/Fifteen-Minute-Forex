import { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "wouter";
import { type Signal } from "@/lib/constants";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Activity, Wifi, TrendingUp, Zap, BarChart3, Target, TrendingDown, Award, Clock, Calendar, AlertTriangle, TrendingUp as Goal, AlertCircle, Settings, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBoundary from "@/components/error-boundary";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const MarketTicker = lazy(() => import("@/components/market-ticker"));
const SignalGenerator = lazy(() => import("@/components/signal-generator"));
const RecentSignals = lazy(() => import("@/components/recent-signals"));
const TradingChart = lazy(() => import("@/components/trading-chart"));

interface SessionStats {
  pnl: { profit: number; loss: number; net: number; basisPoints: number };
  goalProgress: number;
  hasReachedGoal: boolean;
  hasExceededDrawdown: boolean;
  goalThreshold: number;
  drawdownThreshold: number;
}

export default function Home({ isAdmin }: { isAdmin?: boolean }) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [activePair, setActivePair] = useState("EUR/USD");
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      window.location.href = "/";
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const { data: quotesData } = useQuery<{ quotes: any; marketStatus: { isOpen: boolean; reason?: string } }>({
    queryKey: ["/api/forex/quotes"],
    refetchInterval: 30000,
  });

  const { data: sessionData } = useQuery<SessionStats>({
    queryKey: ["/api/session/stats"],
    refetchInterval: 5000,
  });

  const marketStatus = quotesData?.marketStatus;

  const totalSignals = signals.length;
  const wonSignals = signals.filter(s => s.status === 'won').length;
  const lostSignals = signals.filter(s => s.status === 'lost').length;
  const activeSignals = signals.filter(s => s.status === 'active').length;
  const winRate = totalSignals > 0 ? ((wonSignals / (wonSignals + lostSignals)) * 100).toFixed(1) : '0.0';
  const avgConfidence = totalSignals > 0 ? (signals.reduce((acc, s) => acc + s.confidence, 0) / totalSignals).toFixed(1) : '0.0';

  useEffect(() => {
    const dateInterval = setInterval(() => {
      setCurrentDate(new Date());
    }, 5000);

    return () => clearInterval(dateInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

      setSignals(prevSignals => 
        prevSignals.map(signal => {
          if (signal.status !== 'active') return signal;

          const [endH, endM] = signal.endTime.split(':').map(Number);
          const [currH, currM] = currentTimeStr.split(':').map(Number);

          const endMinutes = endH * 60 + endM;
          const currMinutes = currH * 60 + currM;

          const isExpired = currMinutes >= endMinutes || (currMinutes < 100 && endMinutes > 1300);

          if (isExpired) {
            return {
              ...signal,
              status: Math.random() > 0.3 ? 'won' : 'lost'
            };
          }
          return signal;
        })
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleSignalGenerated = (signal: Signal) => {
    setSignals(prev => [signal, ...prev]);
    toast({
      title: "New Signal Generated",
      description: `${signal.type} ${signal.pair} @ ${signal.entry.toFixed(5)}`,
      duration: 5000,
    });
  };

  const generateSampleSignal = () => {
    const sample: Signal = {
      id: "sample-" + Date.now(),
      pair: "GBP/USD",
      type: Math.random() > 0.5 ? "CALL" : "PUT",
      timeframe: "M15",
      confidence: 85 + Math.floor(Math.random() * 11),
      entry: 1.26543,
      stopLoss: 1.26321,
      takeProfit: 1.26876,
      startTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      endTime: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      status: "active",
      timestamp: Date.now()
    };
    handleSignalGenerated(sample);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-slate-50 font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="mb-8 relative z-50">
        {marketStatus && !marketStatus.isOpen && (
          <div className="bg-rose-500/10 border-y border-rose-500/20 py-2 px-4 flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]">
              {marketStatus.reason || "MARKETS CLOSED"}
            </span>
          </div>
        )}
        <ErrorBoundary fallback={<div className="h-[52px] bg-background" />}>
          <Suspense fallback={<Skeleton className="h-[52px] w-full" />}>
            <MarketTicker />
          </Suspense>
        </ErrorBoundary>
      </div>

      <main className="container mx-auto px-4 py-4 md:px-8 relative z-10">
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-8 pb-6 md:pb-8 border-b border-white/5 relative">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="relative group shrink-0">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl md:rounded-[2rem] blur-xl md:blur-2xl group-hover:bg-emerald-500/40 transition-all duration-500" />
                <div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center bg-slate-900 border border-white/10 rounded-2xl md:rounded-[2rem] relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                  <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-emerald-400 relative z-10" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter mb-1 leading-none italic flex flex-wrap gap-x-2">
                  <span className="text-white uppercase">GILGALO</span>
                  <span className="text-emerald-500 uppercase">TRADING</span>
                </h1>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-[1px] w-8 md:w-12 bg-emerald-500/50" />
                  <p className="text-slate-400 font-black text-[10px] md:text-sm tracking-[0.1em] md:tracking-[0.2em] uppercase">Professional Signal Intelligence</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-start lg:justify-end">
                {isAdmin && (
                  <Link href="/admin">
                    <a className="h-10 md:h-11 px-4 md:px-6 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all cursor-pointer group" data-testid="link-admin">
                      <Settings className="w-4 h-4 text-slate-400 group-hover:rotate-90 transition-transform duration-500" />
                      <span className="text-xs md:text-sm font-bold text-slate-200">System Config</span>
                    </a>
                  </Link>
                )}
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="h-10 md:h-11 px-4 md:px-6 text-slate-400 hover:text-white hover:bg-rose-500/10 rounded-xl transition-all font-bold text-xs md:text-sm"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Terminal Exit
                </Button>
              </div>

              <div className="flex items-center justify-between lg:justify-start gap-2 md:gap-4 bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                <div className="px-3 md:px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 md:gap-2 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] md:text-[10px] font-black text-emerald-500 tracking-widest uppercase">LIVE</span>
                </div>

                <div className="px-3 md:px-4 py-1.5 md:py-2 flex flex-col shrink-0 border-x border-white/5">
                  <span className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-tighter leading-none mb-0.5 md:mb-1">Network Time</span>
                  <span className="text-[10px] md:text-xs font-black text-slate-200 tabular-nums">
                    {currentDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2 shrink-0">
                  <span className="text-base md:text-lg font-black text-emerald-400 tabular-nums leading-none">{totalSignals}</span>
                  <span className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">Signals</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Goal & Drawdown Alerts */}
          {sessionData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Daily Goal Tracker */}
              <Card className={`glass-panel border overflow-hidden relative group ${sessionData.hasReachedGoal ? 'border-emerald-500/60 bg-emerald-500/5' : 'border-cyan-500/40'}`} data-testid="card-daily-goal">
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <Goal className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Daily Goal</span>
                  </div>
                  <div className="mb-3">
                    <div className="text-2xl font-black text-emerald-400" data-testid="text-goal-progress">
                      {sessionData.goalProgress.toFixed(0)}%
                    </div>
                    <div className="text-xs text-emerald-400/60 mt-1">Target: {(sessionData.goalThreshold * 100).toFixed(1)}% profit</div>
                  </div>
                  <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${Math.min(sessionData.goalProgress, 100)}%` }}
                      data-testid="progress-goal-bar"
                    />
                  </div>
                  {sessionData.hasReachedGoal && (
                    <div className="text-xs text-emerald-400 font-bold mt-2">✅ GOAL REACHED - Stop trading to secure profits</div>
                  )}
                </CardContent>
              </Card>

              {/* Drawdown Protection */}
              <Card className={`glass-panel border overflow-hidden relative group ${sessionData.hasExceededDrawdown ? 'border-rose-500/60 bg-rose-500/5' : 'border-cyan-500/40'}`} data-testid="card-drawdown">
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Drawdown</span>
                  </div>
                  <div className="mb-3">
                    <div className={`text-2xl font-black ${sessionData.hasExceededDrawdown ? 'text-rose-400' : 'text-cyan-400'}`} data-testid="text-drawdown-value">
                      {Math.abs(sessionData.pnl.basisPoints / 100).toFixed(2)}%
                    </div>
                    <div className="text-xs text-cyan-400/60 mt-1">Max allowed: {(sessionData.drawdownThreshold * 100).toFixed(1)}%</div>
                  </div>
                  <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${sessionData.pnl.basisPoints < 0 ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
                      style={{ width: `${Math.min(Math.abs(sessionData.pnl.basisPoints) / (sessionData.drawdownThreshold * 100) * 100, 100)}%` }}
                      data-testid="progress-drawdown-bar"
                    />
                  </div>
                  {sessionData.hasExceededDrawdown && (
                    <div className="text-xs text-rose-400 font-bold mt-2">⚠️ MAX DRAWDOWN - Stop trading to prevent loss</div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* PREMIUM MASSIVE STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8 mb-12 mt-12">
            {/* ACTIVE SIGNALS CARD */}
            <div className="group relative rounded-3xl overflow-hidden" data-testid="card-active-signals">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 opacity-30" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-300" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl -ml-20 -mb-20" />
              
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-emerald-600/25 to-emerald-700/10 border-2 border-emerald-400/70 p-8 md:p-10 rounded-3xl h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-emerald-500/30 rounded-2xl group-hover:scale-110 transition-transform">
                    <Target className="w-8 h-8 text-emerald-200" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-400/80 uppercase tracking-[3px]">ACTIVE</p>
                  </div>
                </div>
                <div className="text-7xl md:text-8xl font-black text-emerald-100 leading-none mb-3" data-testid="text-active-count">{activeSignals}</div>
                <p className="text-emerald-400/80 font-bold text-sm md:text-base uppercase tracking-widest">Signals Running</p>
                <div className="mt-6 h-1 bg-gradient-to-r from-emerald-500/40 to-transparent rounded-full" />
              </div>
            </div>

            {/* WON SIGNALS CARD */}
            <div className="group relative rounded-3xl overflow-hidden" data-testid="card-won-signals">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 opacity-30" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-300" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl -ml-20 -mb-20" />
              
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-emerald-600/25 to-emerald-700/10 border-2 border-emerald-400/70 p-8 md:p-10 rounded-3xl h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-emerald-500/30 rounded-2xl group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-8 h-8 text-emerald-200" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-400/80 uppercase tracking-[3px]">WON</p>
                  </div>
                </div>
                <div className="text-7xl md:text-8xl font-black text-emerald-100 leading-none mb-3" data-testid="text-won-count">{wonSignals}</div>
                <p className="text-emerald-400/80 font-bold text-sm md:text-base uppercase tracking-widest">Profitable Trades</p>
                <div className="mt-6 h-1 bg-gradient-to-r from-emerald-500/40 to-transparent rounded-full" />
              </div>
            </div>

            {/* LOST SIGNALS CARD */}
            <div className="group relative rounded-3xl overflow-hidden" data-testid="card-lost-signals">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 opacity-30" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/30 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-300" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-600/20 rounded-full blur-3xl -ml-20 -mb-20" />
              
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-rose-600/25 to-rose-700/10 border-2 border-rose-400/70 p-8 md:p-10 rounded-3xl h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-rose-500/30 rounded-2xl group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-8 h-8 text-rose-200" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-rose-400/80 uppercase tracking-[3px]">LOST</p>
                  </div>
                </div>
                <div className="text-7xl md:text-8xl font-black text-rose-100 leading-none mb-3" data-testid="text-lost-count">{lostSignals}</div>
                <p className="text-rose-400/80 font-bold text-sm md:text-base uppercase tracking-widest">Failed Trades</p>
                <div className="mt-6 h-1 bg-gradient-to-r from-rose-500/40 to-transparent rounded-full" />
              </div>
            </div>

            {/* TOTAL SIGNALS CARD */}
            <div className="group relative rounded-3xl overflow-hidden" data-testid="card-total-signals">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-cyan-700 to-cyan-800 opacity-30" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/30 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-300" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-600/20 rounded-full blur-3xl -ml-20 -mb-20" />
              
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-cyan-600/25 to-cyan-700/10 border-2 border-cyan-400/70 p-8 md:p-10 rounded-3xl h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-cyan-500/30 rounded-2xl group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-8 h-8 text-cyan-200" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-cyan-400/80 uppercase tracking-[3px]">TOTAL</p>
                  </div>
                </div>
                <div className="text-7xl md:text-8xl font-black text-cyan-100 leading-none mb-3" data-testid="text-total-count">{totalSignals}</div>
                <p className="text-cyan-400/80 font-bold text-sm md:text-base uppercase tracking-widest">All Signals</p>
                <div className="mt-6 h-1 bg-gradient-to-r from-cyan-500/40 to-transparent rounded-full" />
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="mb-8">
            <AnalyticsDashboard signals={signals} />
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button 
              variant="outline" 
              size="sm"
              className="glass-panel border-emerald-500/30 text-emerald-400"
              onClick={generateSampleSignal}
              data-testid="button-sample-signal"
            >
              <Zap className="w-4 h-4 mr-2" />
              Sample Signal
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSignals([])}
              className="glass-panel border-rose-500/30 text-rose-400"
              data-testid="button-clear-history"
            >
              <Activity className="w-4 h-4 mr-2" />
              Clear History
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="glass-panel border-cyan-500/30 text-cyan-400"
              data-testid="button-view-analytics"
            >
              <Clock className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="glass-panel border-emerald-500/30 text-emerald-400"
              data-testid="button-export-data"
            >
              <Target className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-5 xl:col-span-4 space-y-4 sm:space-y-6">
            <ErrorBoundary>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <SignalGenerator 
                  onSignalGenerated={handleSignalGenerated} 
                  onPairChange={setActivePair}
                />
              </Suspense>
            </ErrorBoundary>

            <div className="block lg:hidden">
              <div className="h-[350px] sm:h-[400px] md:h-[450px]">
                <ErrorBoundary fallback={<Skeleton className="h-full w-full" />}>
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <TradingChart pair={activePair} />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>

            <div className="max-h-[300px] sm:max-h-[350px] lg:max-h-[400px]">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                  <RecentSignals signals={signals} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-7 xl:col-span-8">
            <div className="h-[650px] lg:h-[700px] xl:h-[750px] sticky top-4">
              <ErrorBoundary fallback={<Skeleton className="h-full w-full" />}>
                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                  <TradingChart pair={activePair} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
