import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BookOpen, ShieldCheck, Zap } from "lucide-react";

export default function Strategies() {
  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-5xl h-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Trading Strategies & Edge</h1>
        <p className="text-muted-foreground">Comprehensive documentation of our technical edge and methodology.</p>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="flex flex-col gap-8 pb-8">
          {/* M15 STRATEGY - THE EDGE */}
          <section id="m15-edge">
            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">GILGALO M15 Edge (Active)</CardTitle>
                  </div>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">Currently Implementing</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">The 3-Check Rule System</h3>
                  <p className="text-muted-foreground mb-4">Our system uses a mechanical filtering process where 100% of rules must pass before a signal is generated.</p>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-lg bg-card border">
                      <TrendingUp className="h-5 w-5 mb-2 text-blue-500" />
                      <h4 className="font-medium">1. Trend Check</h4>
                      <p className="text-xs text-muted-foreground">3+ consecutive strong candles in direction. Price relative to SMA 20/50/200.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-card border">
                      <Zap className="h-5 w-5 mb-2 text-yellow-500" />
                      <h4 className="font-medium">2. Momentum Check</h4>
                      <p className="text-xs text-muted-foreground">RSI BUY: 30-85, RSI SELL: 15-70. Stochastic exclusion zones (90+ / 10-).</p>
                    </div>
                    <div className="p-4 rounded-lg bg-card border">
                      <ShieldCheck className="h-5 w-5 mb-2 text-green-500" />
                      <h4 className="font-medium">3. Volatility Check</h4>
                      <p className="text-xs text-muted-foreground">ATR-based spike detection. Signals blocked if volatility is &gt; 2.5x average.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Visual Examples</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Perfect CALL Setup (Buy)</p>
                      <div className="aspect-video bg-zinc-900 rounded-md border flex flex-col p-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.tradingview.com/static/images/free-charting-software/hero-light.png')] bg-cover" />
                        <div className="flex-1 flex items-end gap-1">
                          <div className="w-4 h-12 bg-green-500 rounded-sm" />
                          <div className="w-4 h-16 bg-green-500 rounded-sm" />
                          <div className="w-4 h-24 bg-green-500 rounded-sm" />
                          <div className="w-4 h-4 bg-zinc-700 rounded-sm animate-pulse" />
                        </div>
                        <div className="mt-2 text-[10px] text-green-400 font-mono">CONFIRMED: RSI 45 | STOCH 22 | VOL NORMAL</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Perfect PUT Setup (Sell)</p>
                      <div className="aspect-video bg-zinc-900 rounded-md border flex flex-col p-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.tradingview.com/static/images/free-charting-software/hero-light.png')] bg-cover" />
                        <div className="flex-1 flex items-start gap-1">
                          <div className="w-4 h-24 bg-red-500 rounded-sm" />
                          <div className="w-4 h-20 bg-red-500 rounded-sm" />
                          <div className="w-4 h-16 bg-red-500 rounded-sm" />
                          <div className="w-4 h-4 bg-zinc-700 rounded-sm animate-pulse" />
                        </div>
                        <div className="mt-2 text-[10px] text-red-400 font-mono">CONFIRMED: RSI 55 | STOCH 78 | VOL NORMAL</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* M1 STRATEGY - READING MATERIAL */}
          <section id="m1-reading">
            <Card className="border-muted">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                    <CardTitle className="text-2xl">Mechanical M1 Strategy (Reference Only)</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-red-500 border-red-500/50">DO NOT IMPLEMENT</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 prose dark:prose-invert max-w-none text-sm space-y-4">
                <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20 text-destructive font-medium mb-6">
                  Warning: This strategy is for educational purposes only. It is not currently implemented in the Gilgalo scanner.
                </div>
                
                <h3 className="text-lg font-semibold">1. Setup (M1 Timeframe)</h3>
                <ul className="list-disc pl-5">
                  <li><strong>EMA 50:</strong> Acting as the Market Bias Line.</li>
                  <li><strong>MACD (12, 26, 9):</strong> Momentum and Timing filter.</li>
                  <li><strong>Trendline:</strong> Used for rejection and breakout confirmation.</li>
                </ul>

                <h3 className="text-lg font-semibold">2. Market Bias Rules</h3>
                <p>Price ABOVE EMA 50 = BUY Bias (Angled Up). Price BELOW EMA 50 = SELL Bias (Angled Down). Avoid flat EMA.</p>

                <h3 className="text-lg font-semibold">3. Entry Steps (SELL Setup)</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="font-bold">Conditions:</p>
                    <ol className="list-decimal pl-5 text-xs space-y-1">
                      <li>Price below EMA 50 (Sloping down).</li>
                      <li>Pullback towards EMA 50 (Let it breathe).</li>
                      <li>Draw trendline connecting lower highs.</li>
                      <li>Wait for Rejection Candle (Upper wick).</li>
                      <li>MACD Histogram starts shrinking (Momentum loss).</li>
                    </ol>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md">
                    <p className="font-bold">Execution:</p>
                    <p className="text-xs">Enter on the open of the next candle after all 5 rules match. Expiry: 4 Minutes.</p>
                  </div>
                </div>

                <div className="p-4 border-l-4 border-primary bg-primary/5 italic">
                  \"On M1, trend continuation usually lasts 3–5 candles. You enter at candle 1, and expiry ends around candle 4. This gives price time to complete the move.\"
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
