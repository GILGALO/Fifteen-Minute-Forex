import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Plus, Trash2, CheckCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, InsertAlert } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function TradeAlerts() {
  const { toast } = useToast();
  const [pair, setPair] = useState("EUR/USD");
  const [targetPrice, setTargetPrice] = useState("");
  const [type, setType] = useState<"above" | "below">("above");

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const createAlertMutation = useMutation({
    mutationFn: async (newAlert: InsertAlert) => {
      const res = await apiRequest("POST", "/api/alerts", newAlert);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({ title: "Alert Created", description: "You will be notified when the price hits your target." });
      setTargetPrice("");
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({ title: "Alert Deleted" });
    },
  });

  const addAlert = () => {
    if (!targetPrice) return;
    createAlertMutation.mutate({
      pair,
      targetPrice: targetPrice,
      type,
      triggered: "false",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Trade Alerts
            </h1>
          </div>
          <p className="text-slate-400 text-sm sm:text-base">Get notified when prices hit your targets</p>
        </div>

        <Card className="bg-slate-900/60 border-slate-700/50 mb-6">
          <CardHeader className="border-b border-slate-700/30">
            <CardTitle className="text-lg sm:text-xl text-white">Create New Alert</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                  Currency Pair
                </label>
                <select
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white text-sm sm:text-base focus:outline-none focus:border-emerald-500"
                  data-testid="select-pair"
                >
                  {pairs.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                  Target Price
                </label>
                <Input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="1.0850"
                  step="0.0001"
                  className="bg-slate-800/50 border-slate-600 text-white text-sm sm:text-base"
                  data-testid="input-target-price"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                  Alert Type
                </label>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setType("above")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      type === "above"
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                    }`}
                    data-testid="btn-above"
                  >
                    Price Goes Above
                  </button>
                  <button
                    onClick={() => setType("below")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      type === "below"
                        ? "bg-rose-500 text-white"
                        : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                    }`}
                    data-testid="btn-below"
                  >
                    Price Goes Below
                  </button>
                </div>
              </div>
            </div>

            <Button
              onClick={addAlert}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-9 sm:h-10"
              data-testid="btn-add-alert"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Active Alerts ({alerts.length})</h2>

          {alerts.length === 0 ? (
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="pt-8 pb-8 text-center">
                <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm sm:text-base">No alerts yet. Create one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className="bg-slate-900/60 border-slate-700/50 hover:border-slate-600/50 transition-all">
                <CardContent className="pt-4 sm:pt-5 pb-4 sm:pb-5">
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {alert.type === "above" ? (
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-[10px] sm:text-xs font-bold">
                            ↗ ABOVE
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded text-[10px] sm:text-xs font-bold">
                            ↘ BELOW
                          </span>
                        )}
                      </div>
                      <p className="text-white font-bold text-sm sm:text-base">{alert.pair}</p>
                      <p className="text-slate-400 text-xs sm:text-sm">Target: {alert.targetPrice}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAlertMutation.mutate(alert.id)}
                        className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                        data-testid={`btn-delete-${alert.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-6 sm:mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-400">
            📧 <strong>Coming Soon:</strong> Email notifications when price targets are reached!
          </p>
        </div>
      </div>
    </div>
  );
}
