import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Admin from "@/pages/admin";
import { apiRequest } from "@/lib/queryClient";

function Router({ isAuthenticated, isAdmin }: { isAuthenticated: boolean; isAdmin: boolean }) {
  if (!isAuthenticated) {
    return <Route path="*" component={Login} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <Home isAdmin={isAdmin} />} />
      {isAdmin && <Route path="/admin" component={Admin} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/me");
        const response = await res.json() as any;
        if (response?.user) {
          setIsAuthenticated(true);
          setIsAdmin(response.user.isAdmin);
        }
      } catch {
        setIsAuthenticated(false);
        setIsAdmin(false);
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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
