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
        setIsAdmin(true);
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
        <SidebarProvider style={sidebarStyle}>
          <div className="flex h-screen w-full">
            <AppSidebar isAdmin={isAdmin} />
            <div className="flex flex-col flex-1 w-full overflow-hidden">
              <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-card/40 backdrop-blur-sm h-16">
                <SidebarTrigger data-testid="button-sidebar-toggle" className="hover:bg-white/5 rounded-md p-2" />
                <div className="flex-1" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto">
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
