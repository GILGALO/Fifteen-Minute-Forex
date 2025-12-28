import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Trash2, Plus, LogOut, Lock, Users, Key, Shield } from "lucide-react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";

export default function Admin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: response, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) =>
      apiRequest("POST", "/api/admin/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setNewUsername("");
      setNewPassword("");
      toast({ title: "Success", description: "User created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) =>
      apiRequest("POST", "/api/auth/change-password", data),
    onSuccess: () => {
      setCurrentPassword("");
      setNewAdminPassword("");
      setConfirmPassword("");
      toast({ title: "Success", description: "Password changed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      navigate("/login");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    createMutation.mutate({ username: newUsername, password: newPassword });
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newAdminPassword || !confirmPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (newAdminPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword: newAdminPassword });
  };

  const users = (response as any)?.users || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-foreground font-sans selection:bg-primary/20 relative overflow-x-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-500/20 via-emerald-500/0 to-transparent rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/20 via-cyan-500/0 to-transparent rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/15 via-blue-500/0 to-transparent rounded-full blur-[100px]" />
      </div>

      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8 relative z-10">
        {/* Header */}
        <header className="mb-12 md:mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-emerald-500/30">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-emerald-500/30 via-cyan-500/20 to-blue-500/20 border-2 border-emerald-400/70 rounded-3xl shadow-lg shadow-emerald-500/20">
                <Shield className="w-8 h-8 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                  <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">ADMIN</span>
                </h1>
                <p className="text-emerald-400/90 font-bold tracking-wider uppercase text-sm mt-2">Control Center</p>
              </div>
            </div>

            <Button
              data-testid="button-logout"
              onClick={handleLogout}
              className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all duration-200 w-full md:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-400/30 backdrop-blur-sm">
            <p className="text-emerald-400/80 text-sm font-semibold uppercase tracking-wide">Total Users</p>
            <p className="text-4xl font-black text-emerald-300 mt-2">{users.length}</p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-400/30 backdrop-blur-sm">
            <p className="text-cyan-400/80 text-sm font-semibold uppercase tracking-wide">Admin Accounts</p>
            <p className="text-4xl font-black text-cyan-300 mt-2">{users.filter((u: any) => u.isAdmin).length}</p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-400/30 backdrop-blur-sm">
            <p className="text-blue-400/80 text-sm font-semibold uppercase tracking-wide">Regular Users</p>
            <p className="text-4xl font-black text-blue-300 mt-2">{users.filter((u: any) => !u.isAdmin).length}</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Change Password */}
          <div className="group relative rounded-2xl bg-gradient-to-br from-cyan-600/10 to-cyan-500/5 border border-cyan-400/40 overflow-hidden p-8 backdrop-blur-md hover:border-cyan-400/60 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Key className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-cyan-300">Secure Access</h2>
                  <p className="text-cyan-400/70 text-sm">Update admin password</p>
                </div>
              </div>
              <div className="space-y-3">
                <Input
                  data-testid="input-current-password"
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-background/40 border-cyan-400/30 focus:border-cyan-400/60"
                />
                <Input
                  data-testid="input-new-admin-password"
                  type="password"
                  placeholder="New password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="bg-background/40 border-cyan-400/30 focus:border-cyan-400/60"
                />
                <Input
                  data-testid="input-confirm-password"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background/40 border-cyan-400/30 focus:border-cyan-400/60"
                />
                <Button
                  data-testid="button-change-password"
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-bold mt-4"
                >
                  {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>
          </div>

          {/* Add User */}
          <div className="group relative rounded-2xl bg-gradient-to-br from-emerald-600/10 to-emerald-500/5 border border-emerald-400/40 overflow-hidden p-8 backdrop-blur-md hover:border-emerald-400/60 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <Plus className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-emerald-300">New Account</h2>
                  <p className="text-emerald-400/70 text-sm">Create user account</p>
                </div>
              </div>
              <div className="space-y-3">
                <Input
                  data-testid="input-new-username"
                  placeholder="Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-background/40 border-emerald-400/30 focus:border-emerald-400/60"
                />
                <Input
                  data-testid="input-new-password"
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-background/40 border-emerald-400/30 focus:border-emerald-400/60"
                />
                <Button
                  data-testid="button-create-user"
                  onClick={handleCreateUser}
                  disabled={createMutation.isPending}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-primary/20 overflow-hidden backdrop-blur-md">
          <div className="p-8 border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-primary">User Directory</h2>
                <p className="text-primary/60 text-sm">{users.length} account(s) in system</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-16 text-center text-muted-foreground">Loading accounts...</div>
          ) : users.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">No accounts found</div>
          ) : (
            <div className="divide-y divide-border/30">
              {users.map((user: User, idx: number) => (
                <div
                  key={user.id}
                  data-testid={`user-row-${user.id}`}
                  className="flex items-center justify-between p-6 hover:bg-primary/5 transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg" data-testid={`text-username-${user.id}`}>
                        {user.username}
                      </p>
                      {user.isAdmin && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Admin</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {!user.isAdmin && (
                    <Button
                      data-testid={`button-delete-${user.id}`}
                      size="sm"
                      onClick={() => deleteMutation.mutate(user.id)}
                      disabled={deleteMutation.isPending}
                      className="bg-rose-600/80 hover:bg-rose-600 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
