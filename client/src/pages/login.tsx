import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!username || !password) {
      toast({ title: "Error", description: "Please enter username and password", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const response = await res.json() as any;
      if (response?.success) {
        toast({ title: "Success", description: "Logged in successfully" });
        window.location.href = "/";
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Login failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-20 w-[350px] h-[350px] bg-cyan-500/15 rounded-full blur-[90px]" />
      </div>

      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border-2 border-emerald-400/60 rounded-2xl">
              <TrendingUp className="w-9 h-9 text-emerald-400" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">GILGALO TRADING</CardTitle>
            <CardDescription>Admin Login</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              data-testid="input-username"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              data-testid="input-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <Button
            data-testid="button-login"
            onClick={handleLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
