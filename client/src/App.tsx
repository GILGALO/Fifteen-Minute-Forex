import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Admin from "@/pages/admin";
import RiskCalculator from "@/pages/risk-calculator";
import TradeAlerts from "@/pages/trade-alerts";
import TradingJournal from "@/pages/trading-journal";
import TradingSchedulePage from "@/pages/trading-schedule";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";
import { PushNotificationToggle } from "@/components/push-notification-toggle";
import { AlertCircle, Clock } from "lucide-react";

function NewsCountdown() {
  const { data } = useQuery<any>({
    queryKey: ["/api/forex/quotes"],
    refetchInterval: 30000,
  });

  if (!data?.newsStatus?.blocked) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 border border-destructive/20 rounded-full animate-pulse">
      <AlertCircle className="w-3.5 h-3.5 text-destructive" />
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-destructive uppercase tracking-tighter leading-none">
          News Block: {data.newsStatus.event?.name}
        </span>
        <span className="text-[9px] font-bold text-destructive/80 tabular-nums">
          {data.newsStatus.remainingMinutes}m remaining
        </span>
      </div>
    </div>
  );
}

function Router({ isAdmin }: { isAuthenticated: boolean; isAdmin: boolean }) {
  return (
    <Switch>
      <Route path="/" component={() => <Home isAdmin={isAdmin} />} />
      <Route path="/trading-journal" component={TradingJournal} />
      <Route path="/trading-schedule" component={TradingSchedulePage} />
      <Route path="/risk-calculator" component={RiskCalculator} />
      <Route path="/trade-alerts" component={TradeAlerts} />
      {isAdmin && <Route path="/admin" component={Admin} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/me");
        const response = await res.json() as any;
        if (response?.user) {
          setIsAdmin(response.user.isAdmin);
        }
      } catch {
        setIsAdmin(true); // Default to true if bypass is active
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={sidebarStyle} defaultOpen={false}>
          <div className="flex h-screen w-full overflow-hidden">
            <AppSidebar isAdmin={isAdmin} />
            <div className="flex flex-col flex-1 w-full overflow-hidden">
              <header className="flex flex-col p-2 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <span className="text-xl font-black tracking-tighter uppercase text-primary">
                      gilgalo
                    </span>
                  </div>
                  <NewsCountdown />
                </div>
                
                {/* Mobile-optimized secondary bar for controls */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <PushNotificationToggle />
                    <ThemeToggle />
                  </div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                    Trading Dashboard
                  </div>
                </div>
              </header>
              <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <Router isAuthenticated={true} isAdmin={isAdmin} />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
