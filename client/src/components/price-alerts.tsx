
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Trash2, Plus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PriceAlert {
  id: string;
  pair: string;
  targetPrice: number;
  condition: "ABOVE" | "BELOW";
  createdAt: number;
}

export function PriceAlerts({ currentQuotes }: { currentQuotes: any[] }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [pair, setPair] = useState("EUR/USD");
  const [price, setPrice] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("price_alerts");
    if (saved) setAlerts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("price_alerts", JSON.stringify(alerts));
  }, [alerts]);

  // Alert check logic
  useEffect(() => {
    if (!currentQuotes || alerts.length === 0) return;

    alerts.forEach(alert => {
      const quote = currentQuotes.find(q => q.pair === alert.pair);
      if (!quote) return;

      const triggered = alert.condition === "ABOVE" 
        ? quote.price >= alert.targetPrice 
        : quote.price <= alert.targetPrice;

      if (triggered) {
        toast({
          title: `Price Alert: ${alert.pair}`,
          description: `Price reached ${quote.price.toFixed(5)} (${alert.condition} ${alert.targetPrice})`,
          duration: 10000,
        });
        setAlerts(prev => prev.filter(a => a.id !== alert.id));
      }
    });
  }, [currentQuotes, alerts, toast]);

  const addAlert = () => {
    if (!price || isNaN(parseFloat(price))) return;
    
    const quote = currentQuotes.find(q => q.pair === pair);
    const condition = quote && parseFloat(price) > quote.price ? "ABOVE" : "BELOW";

    const newAlert: PriceAlert = {
      id: Math.random().toString(36).substr(2, 9),
      pair,
      targetPrice: parseFloat(price),
      condition,
      createdAt: Date.now(),
    };

    setAlerts(prev => [newAlert, ...prev]);
    setPrice("");
    toast({ title: "Alert Added", description: `Notifying when ${pair} is ${condition} ${price}` });
  };

  return (
    <Card className="glass-panel border-white/10">
      <CardHeader className="py-4 px-6 border-b border-white/5">
        <CardTitle className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Price Watchtower
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex gap-2">
          <Input 
            value={price} 
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Target Price"
            className="h-10 bg-white/5 border-white/10 text-xs font-mono"
          />
          <Button onClick={addAlert} size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {alerts.length === 0 ? (
            <p className="text-[10px] text-slate-500 text-center py-4 uppercase font-bold tracking-widest">No active watches</p>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-200">{alert.pair}</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {alert.condition} {alert.targetPrice.toFixed(5)}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PriceAlerts;
