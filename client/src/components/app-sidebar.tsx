import { Home, Settings, Users, LogOut, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  isAdmin: boolean;
}

export function AppSidebar({ isAdmin }: AppSidebarProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      navigate("/login");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    ...(isAdmin
      ? [
          {
            title: "Admin Panel",
            url: "/admin",
            icon: Users,
          },
        ]
      : []),
  ];

  return (
    <Sidebar className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-700/50">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-center p-4 mb-4">
            <span className="text-2xl font-bold text-white" data-testid="logo-gilgalo">GILGALO</span>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all hover-elevate"
                      data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-red-400 hover:text-red-300 hover-elevate"
                  data-testid="button-logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
