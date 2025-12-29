import { Home, Settings, Users, LogOut, BarChart3, Calculator, Bell, BookOpen, Clock, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { lazy, Suspense, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

const MarketTicker = lazy(() => import("@/components/market-ticker"));

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
    {
      title: "Trading Journal",
      url: "/trading-journal",
      icon: BookOpen,
    },
    {
      title: "Trading Schedule",
      url: "/trading-schedule",
      icon: Clock,
    },
    {
      title: "Risk Calculator",
      url: "/risk-calculator",
      icon: Calculator,
    },
    {
      title: "Trade Alerts",
      url: "/trade-alerts",
      icon: Bell,
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
    <Sidebar className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-700/50 z-40">
      <SidebarContent className="flex flex-col h-full">
        <div className="sm:hidden mt-2 px-2">
          <Suspense fallback={<Skeleton className="h-8 w-full" />}>
            <MarketTicker />
          </Suspense>
        </div>

        <SidebarGroup>
          <div className="flex items-center justify-center p-3 mb-2">
            <span className="text-xl sm:text-2xl font-bold text-white text-center" data-testid="logo-gilgalo">GILGALO</span>
          </div>
        </SidebarGroup>

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover-elevate text-sm sm:text-base min-h-12 touch-target"
                      data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium truncate">{item.title}</span>
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
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-400 hover:text-red-300 hover-elevate text-sm sm:text-base min-h-12 touch-target"
                  data-testid="button-logout"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">Logout</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
