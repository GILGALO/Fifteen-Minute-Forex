import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, RefreshCcw, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

export default function LogsPage() {
  const { data: logs, isLoading, refetch } = useQuery<string[]>({
    queryKey: ["/api/logs"],
    refetchInterval: 5000,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-8 h-8 text-emerald-400" />
          <h1 className="text-3xl font-black uppercase tracking-widest text-white italic">
            System <span className="text-emerald-500">Logs</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="glass-panel border-emerald-500/30 text-emerald-400"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="glass-panel border-white/10 overflow-hidden bg-slate-950/50 backdrop-blur-xl">
        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Backend Stream
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div 
            ref={scrollRef}
            className="h-[600px] overflow-y-auto p-4 font-mono text-xs sm:text-sm selection:bg-emerald-500/30 no-scrollbar"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-slate-500 italic">
                Connecting to stream...
              </div>
            ) : !logs || logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 italic">
                No logs available for this session.
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4 group hover:bg-white/[0.02] py-0.5 px-2 rounded transition-colors">
                    <span className="text-slate-600 select-none w-12 shrink-0 text-right">{i + 1}</span>
                    <span className={`break-all ${
                      log.includes("ERROR") ? "text-rose-400" : 
                      log.includes("WARN") ? "text-amber-400" : 
                      log.includes("SUCCESS") ? "text-emerald-400" : 
                      "text-slate-300"
                    }`}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3">
        <Terminal className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed italic">
          System logs are ephemeral and reset when the server restarts. They provide real-time visibility into signal generation, market scanning, and execution errors. Use this panel to debug scanner performance and verify indicator alignment.
        </p>
      </div>
    </div>
  );
}
