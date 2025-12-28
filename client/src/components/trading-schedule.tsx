import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Coffee, Zap, Moon, Sun, Sunrise } from "lucide-react";

interface SessionInfo {
  name: string;
  timeEAT: string;
  description: string;
  icon: React.ElementType;
  status: 'active' | 'upcoming' | 'closed' | 'break';
  color: string;
}

const sessions: SessionInfo[] = [
  {
    name: "ASIAN SESSION",
    timeEAT: "07:00 - 12:00",
    description: "Best for JPY, AUD, NZD pairs. Stable trends.",
    icon: Sunrise,
    status: 'upcoming',
    color: "text-blue-400"
  },
  {
    name: "LONDON SESSION",
    timeEAT: "12:00 - 17:00",
    description: "High volatility. Best for EUR, GBP pairs.",
    icon: Sun,
    status: 'closed',
    color: "text-emerald-400"
  },
  {
    name: "LUNCH BREAK",
    timeEAT: "17:00 - 18:00",
    description: "Low liquidity. Recommended rest period.",
    icon: Coffee,
    status: 'break',
    color: "text-amber-400"
  },
  {
    name: "NEW YORK SESSION",
    timeEAT: "18:00 - 23:00",
    description: "Overlap with London. Institutional moves.",
    icon: Zap,
    status: 'closed',
    color: "text-indigo-400"
  },
  {
    name: "NIGHT BREAK",
    timeEAT: "23:00 - 07:00",
    description: "Low volume. Blocked for safety.",
    icon: Moon,
    status: 'closed',
    color: "text-slate-500"
  }
];

export default function TradingSchedule() {
  const currentHour = new Date().getHours() + 3; // EAT Offset

  const getStatus = (timeRange: string): 'active' | 'upcoming' | 'closed' | 'break' => {
    const [start, end] = timeRange.split(' - ').map(t => parseInt(t.split(':')[0]));
    const hour = currentHour % 24;
    
    if (hour >= start && hour < end) return 'active';
    if (hour < start) return 'upcoming';
    return 'closed';
  };

  return (
    <Card className="glass-panel border-white/10 bg-slate-950/40 overflow-hidden">
      <CardHeader className="pb-2 border-b border-white/5 bg-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            Trading Schedule (EAT)
          </CardTitle>
          <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            Kenya Time (UTC+3)
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/5">
          {sessions.map((session, index) => {
            const status = getStatus(session.timeEAT);
            const isActive = status === 'active';
            
            return (
              <div 
                key={index} 
                className={`p-4 flex items-center gap-4 transition-all duration-300 ${isActive ? 'bg-emerald-500/5' : 'hover:bg-white/5'}`}
              >
                <div className={`p-2 rounded-lg bg-slate-950 border ${isActive ? 'border-emerald-500/30' : 'border-white/5'}`}>
                  <session.icon className={`w-5 h-5 ${isActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={`text-xs font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {session.name}
                    </h4>
                    <span className={`text-[10px] font-black tabular-nums ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {session.timeEAT}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    {session.description}
                  </p>
                </div>

                {isActive && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Active</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
