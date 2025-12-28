import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Trade } from "@shared/schema";

export default function TradingJournal() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    pair: "EUR/USD",
    entryPrice: "",
    exitPrice: "",
    positionSize: "",
    outcome: "won" as "won" | "lost",
    entryReason: "",
    exitReason: "",
    notes: "",
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/trades", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      setFormData({
        pair: "EUR/USD",
        entryPrice: "",
        exitPrice: "",
        positionSize: "",
        outcome: "won",
        entryReason: "",
        exitReason: "",
        notes: "",
      });
      setShowForm(false);
      toast({ title: "Trade logged successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/trades/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      toast({ title: "Trade deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD"];
  const wonTrades = trades.filter(t => t.outcome === "won").length;
  const lostTrades = trades.filter(t => t.outcome === "lost").length;
  const winRate = trades.length > 0 ? ((wonTrades / trades.length) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">Trading Journal</h1>
          </div>
          <p className="text-slate-400 text-sm sm:text-base">Track your trades and learn from each one</p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-black text-white">{trades.length}</div>
              <div className="text-xs sm:text-sm text-slate-400 font-semibold">Total Trades</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-black text-emerald-400">{winRate}%</div>
              <div className="text-xs sm:text-sm text-slate-400 font-semibold">Win Rate</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-black text-slate-300">{wonTrades}W / {lostTrades}L</div>
              <div className="text-xs sm:text-sm text-slate-400 font-semibold">Record</div>
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-blue-600 hover:bg-blue-700"
          data-testid="button-add-trade"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Trade
        </Button>

        {showForm && (
          <Card className="bg-slate-900/60 border-slate-700/50 mb-6">
            <CardHeader className="border-b border-slate-700/30">
              <CardTitle className="text-white">Log New Trade</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">Pair</label>
                    <select
                      value={formData.pair}
                      onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
                      data-testid="select-trade-pair"
                    >
                      {pairs.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">Outcome</label>
                    <select
                      value={formData.outcome}
                      onChange={(e) => setFormData({ ...formData, outcome: e.target.value as "won" | "lost" })}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
                      data-testid="select-trade-outcome"
                    >
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                  <Input
                    type="number"
                    step="0.00001"
                    placeholder="Entry Price"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                    className="bg-slate-800/50 border-slate-600 text-white"
                    data-testid="input-entry-price"
                  />
                  <Input
                    type="number"
                    step="0.00001"
                    placeholder="Exit Price"
                    value={formData.exitPrice}
                    onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                    className="bg-slate-800/50 border-slate-600 text-white"
                    data-testid="input-exit-price"
                  />
                  <Input
                    type="number"
                    placeholder="Position Size"
                    value={formData.positionSize}
                    onChange={(e) => setFormData({ ...formData, positionSize: e.target.value })}
                    className="bg-slate-800/50 border-slate-600 text-white"
                    data-testid="input-position-size"
                  />
                </div>
                <textarea
                  placeholder="Why did you enter this trade?"
                  value={formData.entryReason}
                  onChange={(e) => setFormData({ ...formData, entryReason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
                  rows={2}
                  data-testid="textarea-entry-reason"
                />
                <textarea
                  placeholder="Why did you exit?"
                  value={formData.exitReason}
                  onChange={(e) => setFormData({ ...formData, exitReason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
                  rows={2}
                  data-testid="textarea-exit-reason"
                />
                <textarea
                  placeholder="Additional notes (optional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
                  rows={2}
                  data-testid="textarea-notes"
                />
                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending} data-testid="button-submit-trade">
                    {createMutation.isPending ? "Logging..." : "Log Trade"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)} data-testid="button-cancel-trade">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {trades.map((trade) => (
            <Card key={trade.id} className="bg-slate-900/60 border-slate-700/50 hover:border-slate-700">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xl font-black text-white">{trade.pair}</div>
                    <div className={`text-sm font-semibold ${trade.outcome === "won" ? "text-emerald-400" : "text-rose-400"}`}>
                      {trade.outcome === "won" ? "✓ Won" : "✗ Lost"}
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    {new Date(trade.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Entry → Exit</div>
                    <div className="text-white font-semibold">{Number(trade.entryPrice).toFixed(5)} → {Number(trade.exitPrice).toFixed(5)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Size</div>
                    <div className="text-white font-semibold">{trade.positionSize}</div>
                  </div>
                </div>
                <div className="text-sm text-slate-300 mb-3">
                  <div className="text-xs text-slate-500 uppercase mb-1">Why Entry?</div>
                  <div className="bg-slate-800/30 p-2 rounded text-xs">{trade.entryReason}</div>
                </div>
                <div className="text-sm text-slate-300 mb-3">
                  <div className="text-xs text-slate-500 uppercase mb-1">Why Exit?</div>
                  <div className="bg-slate-800/30 p-2 rounded text-xs">{trade.exitReason}</div>
                </div>
                {trade.notes && (
                  <div className="text-sm text-slate-300 mb-3">
                    <div className="text-xs text-slate-500 uppercase mb-1">Notes</div>
                    <div className="bg-slate-800/30 p-2 rounded text-xs">{trade.notes}</div>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(trade.id)}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  data-testid={`button-delete-trade-${trade.id}`}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {trades.length === 0 && !showForm && (
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="pt-6">
              <div className="text-center text-slate-400">No trades logged yet. Start tracking to improve!</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
