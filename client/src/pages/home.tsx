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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-foreground font-sans selection:bg-primary/20 relative overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-500/25 via-emerald-500/0 to-transparent rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/25 via-cyan-500/0 to-transparent rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/15 via-blue-500/0 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="mb-8">
        {marketStatus && !marketStatus.isOpen && (
          <div className="bg-rose-500/20 border-y border-rose-500/50 py-3 px-4 flex items-center justify-center gap-3 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span className="text-sm font-black text-rose-400 uppercase tracking-widest">
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

      <main className="container mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 relative z-10">
        <header className="mb-8 md:mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-primary/20 relative">
            <div className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent" />

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border-2 border-emerald-400/60 rounded-2xl relative overflow-hidden">
                <TrendingUp className="w-9 h-9 md:w-11 md:h-11 text-emerald-400 relative z-10" />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-1">
                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">GILGALO</span>
                  <span className="text-white ml-2">TRADING</span>
                </h1>
                <p className="text-xs md:text-sm text-emerald-400/80 font-semibold tracking-wider uppercase flex items-center gap-2">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>Professional Signal Intelligence</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isAdmin && (
                <Link href="/admin">
                  <a className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 border border-primary/30 hover-elevate cursor-pointer" data-testid="link-admin">
                    <Settings className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">Admin</span>
                  </a>
                </Link>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="glass-panel border-rose-500/30 text-rose-400"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <div className="glass-panel px-5 py-2.5 rounded-xl flex items-center gap-3 border border-emerald-400/30">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400 tracking-wide">LIVE</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 border border-primary/30">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-xs font-bold text-cyan-400">
                    {currentDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="glass-panel px-5 py-2.5 rounded-xl flex items-center gap-3 border border-primary/30">
                <BarChart3 className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium uppercase">Signals</span>
                  <span className="text-base font-bold text-primary">{totalSignals}</span>
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

          {/* Premium Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 mt-8">
            <div className="group relative rounded-2xl bg-gradient-to-br from-emerald-600/15 to-emerald-500/5 border border-emerald-400/50 p-7 overflow-hidden backdrop-blur-md hover:border-emerald-400/80 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20" data-testid="card-active-signals">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <Target className="w-6 h-6 text-emerald-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs text-emerald-400/80 font-bold uppercase tracking-widest">Active</span>
                </div>
                <div className="text-4xl font-black text-emerald-200 mb-2" data-testid="text-active-count">{activeSignals}</div>
                <div className="text-sm text-emerald-400/70">Running signals</div>
              </div>
            </div>

            <div className="group relative rounded-2xl bg-gradient-to-br from-emerald-600/15 to-emerald-500/5 border border-emerald-400/50 p-7 overflow-hidden backdrop-blur-md hover:border-emerald-400/80 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20" data-testid="card-won-signals">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-emerald-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs text-emerald-400/80 font-bold uppercase tracking-widest">Won</span>
                </div>
                <div className="text-4xl font-black text-emerald-200 mb-2" data-testid="text-won-count">{wonSignals}</div>
                <div className="text-sm text-emerald-400/70">Profitable trades</div>
              </div>
            </div>

            <div className="group relative rounded-2xl bg-gradient-to-br from-rose-600/15 to-rose-500/5 border border-rose-400/50 p-7 overflow-hidden backdrop-blur-md hover:border-rose-400/80 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/20" data-testid="card-lost-signals">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-rose-500/20 rounded-xl">
                    <TrendingDown className="w-6 h-6 text-rose-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs text-rose-400/80 font-bold uppercase tracking-widest">Lost</span>
                </div>
                <div className="text-4xl font-black text-rose-200 mb-2" data-testid="text-lost-count">{lostSignals}</div>
                <div className="text-sm text-rose-400/70">Failed trades</div>
              </div>
            </div>

            <div className="group relative rounded-2xl bg-gradient-to-br from-cyan-600/15 to-cyan-500/5 border border-cyan-400/50 p-7 overflow-hidden backdrop-blur-md hover:border-cyan-400/80 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20" data-testid="card-total-signals">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-cyan-500/20 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-cyan-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs text-cyan-400/80 font-bold uppercase tracking-widest">Total</span>
                </div>
                <div className="text-4xl font-black text-cyan-200 mb-2" data-testid="text-total-count">{totalSignals}</div>
                <div className="text-sm text-cyan-400/70">All signals</div>
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
