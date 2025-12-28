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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

const MarketTicker = lazy(() => import("@/components/market-ticker"));
const SignalGenerator = lazy(() => import("@/components/signal-generator"));
const RecentSignals = lazy(() => import("@/components/recent-signals"));
const TradingChart = lazy(() => import("@/components/trading-chart"));
const TradingSchedule = lazy(() => import("@/components/trading-schedule"));

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
      timeframe: "M5",
      confidence: 85 + Math.floor(Math.random() * 11),
      entry: 1.26543,
      stopLoss: 1.26321,
      takeProfit: 1.26876,
      startTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      endTime: new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      status: "active",
      timestamp: Date.now()
    };
    handleSignalGenerated(sample);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-emerald-500/30 relative overflow-x-hidden pb-12 sm:pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-40%] sm:top-[-20%] right-[-30%] sm:right-[-10%] w-[600px] sm:w-[1200px] h-[600px] sm:h-[1200px] bg-emerald-600/5 rounded-full blur-[100px] sm:blur-[180px] animate-pulse opacity-40" />
        <div className="absolute bottom-[-40%] sm:bottom-[-20%] left-[-30%] sm:left-[-10%] w-[600px] sm:w-[1200px] h-[600px] sm:h-[1200px] bg-blue-600/5 rounded-full blur-[100px] sm:blur-[180px] animate-pulse delay-1000 opacity-40" />
        <div className="hidden sm:block absolute top-[40%] left-[30%] w-[800px] h-[800px] bg-indigo-600/3 rounded-full blur-[150px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.01] to-transparent bg-[length:100%_4px] animate-scanline pointer-events-none" />
      </div>

      <div className="mb-2 sm:mb-4 md:mb-8 relative z-50">
        {marketStatus && !marketStatus.isOpen && (
          <div className="bg-rose-500/10 border-y border-rose-500/20 py-1.5 sm:py-2 px-2 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
            <span className="text-[7px] sm:text-[8px] md:text-[10px] font-black text-rose-400 uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.3em] text-center">
              {marketStatus.reason || "MARKETS CLOSED"}
            </span>
          </div>
        )}
        <ErrorBoundary fallback={<div className="h-[32px] sm:h-[40px] md:h-[52px] bg-background" />}>
          <Suspense fallback={<Skeleton className="h-[32px] sm:h-[40px] md:h-[52px] w-full" />}>
            <MarketTicker />
          </Suspense>
        </ErrorBoundary>
      </div>

      <main className="w-full px-2 sm:px-4 md:px-8 py-2 sm:py-4 relative z-10">
        <header className="mb-4 sm:mb-8 md:mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 pb-4 sm:pb-6 md:pb-8 lg:pb-10 border-b border-white/10 relative">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full">
              <div className="relative group shrink-0 hidden sm:block">
                <div className="absolute inset-0 bg-emerald-500/30 rounded-[1.5rem] sm:rounded-[2.5rem] blur-lg sm:blur-3xl group-hover:bg-emerald-500/50 transition-all duration-700 animate-pulse" />
                <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 flex items-center justify-center bg-slate-950 border border-emerald-500/30 rounded-[1.5rem] sm:rounded-[2.5rem] relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)] sm:shadow-[0_0_50px_rgba(16,185,129,0.2)] group-hover:border-emerald-500/60 transition-colors duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent" />
                  <TrendingUp className="w-6 h-6 sm:w-10 sm:h-10 md:w-14 md:h-14 text-emerald-400 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-2xl md:text-4xl lg:text-6xl xl:text-8xl font-black tracking-wide mb-0.5 sm:mb-1 leading-snug sm:leading-snug italic">
                  <span className="block bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent uppercase">GILGALO</span>
                  <span className="block bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 bg-clip-text text-transparent uppercase">TRADING</span>
                </h1>
                <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                  <div className="h-[1px] w-3 sm:w-6 md:w-12 bg-emerald-500/50" />
                  <p className="text-slate-400 font-black text-[6px] sm:text-[8px] md:text-sm tracking-[0.02em] sm:tracking-[0.05em] md:tracking-[0.2em] uppercase">Pro Signal</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 w-full lg:w-auto">
              <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
                <SidebarTrigger data-testid="button-sidebar-toggle" className="hover-elevate min-h-11 px-4 rounded-md sm:rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all cursor-pointer flex-shrink-0 text-sm" />
                <ThemeToggle />
                {isAdmin && (
                  <Link 
                    href="/admin"
                    className="min-h-11 px-4 rounded-md sm:rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all cursor-pointer group text-sm sm:text-xs"
                    data-testid="link-admin"
                  >
                    <Settings className="w-5 h-5 text-slate-400 group-hover:rotate-90 transition-transform duration-500 flex-shrink-0" />
                    <span className="font-bold text-slate-200 hidden sm:inline whitespace-nowrap">System Config</span>
                  </Link>
                )}
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="min-h-11 px-4 text-slate-400 hover:text-white hover:bg-rose-500/10 rounded-md sm:rounded-lg transition-all font-bold text-sm sm:text-xs"
                  data-testid="button-logout"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden sm:inline ml-2 whitespace-nowrap">Exit</span>
                </Button>
              </div>

              <div className="flex items-center justify-start sm:justify-between gap-1 sm:gap-2 md:gap-3 bg-white/5 p-1 sm:p-1.5 rounded-md sm:rounded-lg md:rounded-2xl border border-white/5 overflow-x-auto no-scrollbar w-full">
                <div className="px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-0.5 sm:gap-1 md:gap-1.5 shrink-0">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[6px] sm:text-[8px] md:text-[9px] font-black text-emerald-500 tracking-widest uppercase">LIVE</span>
                </div>

                <div className="px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 flex flex-col shrink-0 border-x border-white/5">
                  <span className="text-[5px] sm:text-[7px] md:text-[9px] text-slate-500 font-bold uppercase tracking-tighter leading-none">TIME</span>
                  <span className="text-[6px] sm:text-[9px] md:text-xs font-black text-slate-200 tabular-nums">
                    {currentDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 bg-white/5 rounded-md flex items-center gap-0.5 sm:gap-1 md:gap-1.5 shrink-0 border border-white/5">
                  <span className="text-xs sm:text-base md:text-lg font-black text-emerald-400 tabular-nums leading-none">{totalSignals}</span>
                  <span className="text-[5px] sm:text-[7px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest">SIG</span>
                </div>
              </div>
            </div>
          </div>

          {sessionData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
              <Card className={`glass-panel border overflow-hidden relative group ${sessionData.hasReachedGoal ? 'border-emerald-500/60 bg-emerald-500/5' : 'border-cyan-500/40'}`} data-testid="card-daily-goal">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <CardContent className="p-3 sm:p-4 md:p-5 relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <Goal className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Daily Goal</span>
                  </div>
                  <div className="mb-2 sm:mb-3">
                    <div className="text-lg sm:text-2xl font-black text-emerald-400" data-testid="text-goal-progress">
                      {sessionData.goalProgress.toFixed(0)}%
                    </div>
                    <div className="text-[9px] sm:text-xs text-emerald-400/60 mt-0.5 sm:mt-1">Target: {(sessionData.goalThreshold * 100).toFixed(1)}%</div>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${Math.min(sessionData.goalProgress, 100)}%` }}
                      data-testid="progress-goal-bar"
                    />
                  </div>
                  {sessionData.hasReachedGoal && (
                    <div className="text-[9px] sm:text-xs text-emerald-400 font-bold mt-1.5 sm:mt-2">GOAL REACHED</div>
                  )}
                </CardContent>
              </Card>

              <Card className={`glass-panel border overflow-hidden relative group ${sessionData.hasExceededDrawdown ? 'border-rose-500/60 bg-rose-500/5' : 'border-cyan-500/40'}`} data-testid="card-drawdown">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <CardContent className="p-3 sm:p-4 md:p-5 relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-rose-400" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Drawdown</span>
                  </div>
                  <div className="mb-2 sm:mb-3">
                    <div className={`text-lg sm:text-2xl font-black ${sessionData.hasExceededDrawdown ? 'text-rose-400' : 'text-cyan-400'}`} data-testid="text-drawdown-value">
                      {Math.abs(sessionData.pnl.basisPoints / 100).toFixed(2)}%
                    </div>
                    <div className="text-[9px] sm:text-xs text-cyan-400/60 mt-0.5 sm:mt-1">Max: {(sessionData.drawdownThreshold * 100).toFixed(1)}%</div>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${sessionData.pnl.basisPoints < 0 ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
                      style={{ width: `${Math.min(Math.abs(sessionData.pnl.basisPoints) / (sessionData.drawdownThreshold * 100) * 100, 100)}%` }}
                      data-testid="progress-drawdown-bar"
                    />
                  </div>
                  {sessionData.hasExceededDrawdown && (
                    <div className="text-[9px] sm:text-xs text-rose-400 font-bold mt-1.5 sm:mt-2">MAX DRAWDOWN</div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-4 mb-4 sm:mb-6 mt-4 sm:mt-6 md:mt-8">
            <div className="group relative rounded-lg sm:rounded-xl overflow-hidden" data-testid="card-active-signals">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative backdrop-blur-xl bg-slate-950/40 border border-emerald-500/30 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl h-full flex flex-col justify-between hover:border-emerald-500/60 transition-all duration-300">
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                  <span className="text-[7px] sm:text-[8px] font-black text-emerald-400/80 uppercase tracking-widest">Active</span>
                </div>
                <div>
                  <div className="text-base sm:text-xl md:text-3xl font-black text-white leading-none mb-0.5 sm:mb-1" data-testid="text-active-count">{activeSignals}</div>
                  <p className="text-[6px] sm:text-[7px] text-slate-500 font-bold uppercase tracking-tighter">Current</p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-lg sm:rounded-xl overflow-hidden" data-testid="card-won-signals">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative backdrop-blur-xl bg-slate-950/40 border border-emerald-500/30 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl h-full flex flex-col justify-between hover:border-emerald-500/60 transition-all duration-300">
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                  <span className="text-[7px] sm:text-[8px] font-black text-emerald-400/80 uppercase tracking-widest">Won</span>
                </div>
                <div>
                  <div className="text-base sm:text-xl md:text-3xl font-black text-white leading-none mb-0.5 sm:mb-1" data-testid="text-won-count">{wonSignals}</div>
                  <p className="text-[6px] sm:text-[7px] text-slate-500 font-bold uppercase tracking-tighter">Profit</p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-lg sm:rounded-xl overflow-hidden" data-testid="card-lost-signals">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative backdrop-blur-xl bg-slate-950/40 border border-rose-500/30 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl h-full flex flex-col justify-between hover:border-rose-500/60 transition-all duration-300">
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-rose-400" />
                  <span className="text-[7px] sm:text-[8px] font-black text-rose-400/80 uppercase tracking-widest">Lost</span>
                </div>
                <div>
                  <div className="text-base sm:text-xl md:text-3xl font-black text-white leading-none mb-0.5 sm:mb-1" data-testid="text-lost-count">{lostSignals}</div>
                  <p className="text-[6px] sm:text-[7px] text-slate-500 font-bold uppercase tracking-tighter">Loss</p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-lg sm:rounded-xl overflow-hidden" data-testid="card-total-signals">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-cyan-700 to-cyan-800 opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative backdrop-blur-xl bg-slate-950/40 border border-cyan-500/30 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl h-full flex flex-col justify-between hover:border-cyan-500/60 transition-all duration-300">
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                  <span className="text-[7px] sm:text-[8px] font-black text-cyan-400/80 uppercase tracking-widest">Total</span>
                </div>
                <div>
                  <div className="text-base sm:text-xl md:text-3xl font-black text-white leading-none mb-0.5 sm:mb-1" data-testid="text-total-count">{totalSignals}</div>
                  <p className="text-[6px] sm:text-[7px] text-slate-500 font-bold uppercase tracking-tighter">All</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 sm:mb-6 md:mb-8">
            <AnalyticsDashboard signals={signals} />
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 mt-4 sm:mt-6">
            <Button variant="outline" size="sm" className="glass-panel border-emerald-500/30 text-emerald-400 text-[11px] sm:text-sm px-2 sm:px-4" onClick={generateSampleSignal} data-testid="button-sample-signal">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Sample Signal</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSignals([])} className="glass-panel border-rose-500/30 text-rose-400 text-[11px] sm:text-sm px-2 sm:px-4" data-testid="button-clear-history">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            <Button variant="outline" size="sm" className="glass-panel border-cyan-500/30 text-cyan-400 text-[11px] sm:text-sm px-2 sm:px-4" data-testid="button-view-analytics">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
            <Button variant="outline" size="sm" className="glass-panel border-emerald-500/30 text-emerald-400 text-[11px] sm:text-sm px-2 sm:px-4" data-testid="button-export-data">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-12 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8">
                <ErrorBoundary>
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <RecentSignals signals={signals} />
                  </Suspense>
                </ErrorBoundary>
              </div>
              <div className="xl:col-span-4">
                <ErrorBoundary>
                  <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                    <TradingSchedule />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 space-y-4 sm:space-y-6">
            <ErrorBoundary>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <SignalGenerator onSignalGenerated={handleSignalGenerated} onPairChange={setActivePair} />
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
