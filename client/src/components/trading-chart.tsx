import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface TradingChartProps {
  pair: string;
  theme?: "light" | "dark";
}

function TradingChart({ pair, theme = "dark" }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const symbol = pair.replace("/", "");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mounted = true;
    container.innerHTML = '';

    const loadWidget = () => {
      if (!mounted || !container) return;

      setIsLoading(true);
      setHasError(false);

      try {
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'tradingview-widget-container';
        widgetContainer.style.cssText = 'height: 100%; width: 100%;';

        const widgetInner = document.createElement('div');
        widgetInner.id = `tradingview_${symbol}_${Math.random().toString(36).substr(2, 9)}`;
        widgetInner.className = 'tradingview-widget-container__widget';
        widgetInner.style.cssText = 'height: 100%; width: 100%;';
        widgetContainer.appendChild(widgetInner);

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        script.type = 'text/javascript';

        script.innerHTML = JSON.stringify({
          autosize: true,
          symbol: `FX:${symbol}`,
          interval: "5",
          timezone: "Etc/UTC",
          theme: theme,
          style: "1",
          locale: "en",
          enable_publishing: false,
          allow_symbol_change: true,
          hide_side_toolbar: false,
          hide_top_toolbar: false,
          save_image: true,
          container_id: widgetInner.id,
          studies: [
            "RSI@tv-basicstudies",
            "MASimple@tv-basicstudies"
          ],
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
          support_host: "https://www.tradingview.com"
        });

        script.onload = () => {
          if (mounted) setIsLoading(false);
        };

        script.onerror = () => {
          if (mounted) {
            setIsLoading(false);
            setHasError(true);
          }
        };

        widgetContainer.appendChild(script);
        container.appendChild(widgetContainer);
      } catch (error) {
        console.error('TradingView widget error:', error);
        if (mounted) {
          setIsLoading(false);
          setHasError(true);
        }
      }
    };

    const timeoutId = setTimeout(loadWidget, 300);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol, theme]); // Added theme to dependencies

  return (
    <Card className="glass-panel border-primary/40 h-full rounded-2xl overflow-hidden flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.5)]" data-testid="card-trading-chart">
      <CardHeader className="border-b border-primary/30 py-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 z-10 relative flex-shrink-0 shadow-lg">
        <div className="flex justify-between items-center gap-4">
          <CardTitle className="font-mono text-sm font-bold flex items-center gap-4 uppercase tracking-[0.2em] flex-wrap">
            <div className="flex items-center gap-3 bg-primary/20 px-4 py-2 rounded-xl border border-primary/30 backdrop-blur-md">
              <BarChart3 className="w-5 h-5 text-primary animate-pulse" />
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent font-black">ADVANCED ANALYTICS</span>
            </div>
            <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
              <span className="text-emerald-400 font-black text-lg">{pair}</span>
            </div>
          </CardTitle>
          <div className="hidden md:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>5M Interval</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>Real-time Data</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative bg-gradient-to-br from-black via-background to-black min-h-0">
        <div ref={containerRef} className="absolute inset-0" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading chart...</p>
            </div>
          </div>
        )}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Chart unavailable</p>
              <p className="text-xs text-muted-foreground mt-1">Market data will load shortly</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TradingChart;
