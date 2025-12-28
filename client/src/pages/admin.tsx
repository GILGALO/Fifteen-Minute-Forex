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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 relative overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-20 w-[350px] h-[350px] bg-cyan-500/15 rounded-full blur-[90px]" />
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[110px]" />
      </div>

      <main className="container mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 relative z-10">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-primary/20">
            <div className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent" />
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border-2 border-emerald-400/60 rounded-2xl">
                <Shield className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">ADMIN</span>
                  <span className="text-white ml-2">PANEL</span>
                </h1>
                <p className="text-sm text-emerald-400/80 font-semibold tracking-wider uppercase mt-1">User Management</p>
              </div>
            </div>

            <Button
              data-testid="button-logout"
              variant="outline"
              onClick={handleLogout}
              className="glass-panel border-rose-500/30 text-rose-400 w-full md:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Password Card */}
          <Card className="glass-panel border-cyan-500/40 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="w-5 h-5 text-cyan-400" />
                Change Password
              </CardTitle>
              <CardDescription>Update your admin account credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Input
                  data-testid="input-current-password"
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-background/50"
                />
                <Input
                  data-testid="input-new-admin-password"
                  type="password"
                  placeholder="New password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="bg-background/50"
                />
                <Input
                  data-testid="input-confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background/50"
                />
                <Button
                  data-testid="button-change-password"
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  className="w-full"
                >
                  {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add User Card */}
          <Card className="glass-panel border-emerald-500/40 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="w-5 h-5 text-emerald-400" />
                Create User
              </CardTitle>
              <CardDescription>Add a new account to the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Input
                  data-testid="input-new-username"
                  placeholder="Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-background/50"
                />
                <Input
                  data-testid="input-new-password"
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-background/50"
                />
                <Button
                  data-testid="button-create-user"
                  onClick={handleCreateUser}
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card className="glass-panel border-primary/40 overflow-hidden mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-primary" />
              Registered Users ({users.length})
            </CardTitle>
            <CardDescription>All accounts in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No users found</div>
            ) : (
              <div className="divide-y divide-border/50">
                {users.map((user: User) => (
                  <div
                    key={user.id}
                    data-testid={`user-row-${user.id}`}
                    className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground" data-testid={`text-username-${user.id}`}>
                        {user.username}
                      </p>
                      {user.isAdmin && (
                        <p className="text-xs text-emerald-400 font-semibold mt-1 uppercase tracking-wide">Admin Account</p>
                      )}
                    </div>
                    {!user.isAdmin && (
                      <Button
                        data-testid={`button-delete-${user.id}`}
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(user.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
