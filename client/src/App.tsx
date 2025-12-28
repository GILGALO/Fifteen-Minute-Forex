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
import { apiRequest } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";

function Router({ isAdmin }: { isAuthenticated: boolean; isAdmin: boolean }) {
  return (
    <Switch>
      <Route path="/" component={() => <Home isAdmin={isAdmin} />} />
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
              <header className="flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm flex-shrink-0 z-50">
                <SidebarTrigger data-testid="button-sidebar-toggle" className="hover-elevate h-9 w-9 flex items-center justify-center" />
                <div className="flex-1" />
                <ThemeToggle />
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
