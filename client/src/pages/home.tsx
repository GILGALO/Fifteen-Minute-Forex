import { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "wouter";
import { type Signal } from "@/lib/constants";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Activity, Wifi, TrendingUp, Zap, BarChart3, Target, TrendingDown, Award, Clock, Calendar, AlertTriangle, AlertCircle, Settings, LogOut } from "lucide-react";
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
    <div className="min-h-screen text-foreground pb-20">
      <ErrorBoundary fallback={<div className="h-12 bg-card" />}>
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <MarketTicker />
        </Suspense>
      </ErrorBoundary>

      <main className="container mx-auto px-4 py-8 md:px-8 space-y-8">
        {/* Header Section */}
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-1">Trading Dashboard</h1>
              <p className="text-muted-foreground">Professional Signal Intelligence Platform</p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link href="/admin">
                  <a className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-card hover:bg-card/80 border border-white/10 transition-colors" data-testid="link-admin">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Settings</span>
                  </a>
                </Link>
              )}
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-4 px-4 py-3 bg-card/50 border border-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-muted-foreground uppercase">LIVE</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="text-xs text-muted-foreground">
              {currentDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="text-xs font-semibold text-foreground">{totalSignals} Total Signals</div>
          </div>
        </header>

        {/* KPI Cards */}
        {sessionData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-panel bg-card/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Daily Goal</span>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">{sessionData.goalProgress.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Target: {(sessionData.goalThreshold * 100).toFixed(1)}%</p>
                {sessionData.hasReachedGoal && <div className="text-xs text-success font-semibold mt-2">Goal Reached</div>}
              </CardContent>
            </Card>

            <Card className="glass-panel bg-card/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Drawdown</span>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </div>
                <div className={`text-2xl font-bold ${sessionData.hasExceededDrawdown ? 'text-destructive' : 'text-primary'}`}>
                  {Math.abs(sessionData.pnl.basisPoints / 100).toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Max: {(sessionData.drawdownThreshold * 100).toFixed(1)}%</p>
              </CardContent>
            </Card>

            <Card className="glass-panel bg-card/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Won</span>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <div className="text-2xl font-bold text-success">{wonSignals}</div>
                <p className="text-xs text-muted-foreground mt-1">Profitable Trades</p>
              </CardContent>
            </Card>

            <Card className="glass-panel bg-card/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Lost</span>
                  <TrendingDown className="w-4 h-4 text-destructive" />
                </div>
                <div className="text-2xl font-bold text-destructive">{lostSignals}</div>
                <p className="text-xs text-muted-foreground mt-1">Losing Trades</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Recent Signals */}
            <ErrorBoundary>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <RecentSignals signals={signals} />
              </Suspense>
            </ErrorBoundary>

            {/* Analytics */}
            <div>
              <AnalyticsDashboard signals={signals} />
            </div>

            {/* Chart */}
            <ErrorBoundary fallback={<Skeleton className="h-96 w-full" />}>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <TradingChart pair={activePair} />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Signal Generator */}
            <ErrorBoundary>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <SignalGenerator onSignalGenerated={handleSignalGenerated} onPairChange={setActivePair} />
              </Suspense>
            </ErrorBoundary>

            {/* Trading Schedule */}
            <ErrorBoundary>
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <TradingSchedule />
              </Suspense>
            </ErrorBoundary>

            {/* Actions */}
            <Card className="glass-panel bg-card/60">
              <CardContent className="p-4 space-y-2">
                <Button 
                  onClick={generateSampleSignal} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-testid="button-sample-signal"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Signal
                </Button>
                <Button 
                  onClick={() => setSignals([])} 
                  variant="outline"
                  className="w-full"
                  data-testid="button-clear-history"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
