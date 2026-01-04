import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  BarChart3,
  Waves
} from "lucide-react";

export default function Strategies() {
  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-5xl h-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tighter uppercase text-white">
          GILGALO <span className="text-accent">TRADING</span> EDGE
        </h1>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
          The Professional Mechanical Framework for 2026 Trading Success
        </p>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="flex flex-col gap-10 pb-12">
          
          {/* M15 CORE EDGE SECTION */}
          <section id="m15-edge" className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
              <Zap className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white uppercase">Active M15 Institutional Framework</h2>
                <p className="text-xs text-muted-foreground font-bold">CURRENT LIVE SYSTEM SPECIFICATIONS</p>
              </div>
            </div>

            <Card className="bg-slate-900/50 border-primary/20 overflow-hidden">
              <CardHeader className="bg-primary/10 border-b border-primary/10 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Mechanical Entry Rules (100% PASS REQUIRED)</CardTitle>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">LOCKED SYSTEM</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                
                {/* RULE 1: TREND CONFLUENCE */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-5 w-5" />
                    <h3 className="font-black uppercase tracking-wider text-sm">Step 1: Structural Alignment</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-4 rounded-md border border-slate-800">
                      <p className="text-sm font-bold text-slate-300 mb-2">The "3-Candle Confirmation"</p>
                      <ul className="text-xs space-y-2 text-slate-400">
                        <li>• System requires <span className="text-white">3 consecutive candles</span> closing in trend direction.</li>
                        <li>• Candles must show <span className="text-white">expanding body size</span> (increasing momentum).</li>
                        <li>• Price must be trading <span className="text-white">above SMA 20/50/200</span> for CALL signals.</li>
                      </ul>
                    </div>
                    <div className="aspect-video bg-black rounded-md border border-slate-800 flex items-center justify-center relative p-4">
                      <div className="flex flex-col items-center gap-1 w-full">
                         <div className="flex items-end gap-1 mb-4 h-24">
                            <div className="w-4 h-8 bg-green-900/50 border border-green-500/50" />
                            <div className="w-4 h-12 bg-green-500/70 border border-green-400" />
                            <div className="w-4 h-20 bg-green-500 border border-green-300 animate-pulse" />
                            <div className="w-8 h-px bg-primary absolute bottom-[50%] right-10" />
                         </div>
                         <p className="text-[10px] font-black text-primary uppercase">Valid Bullish Sequence</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RULE 2: MOMENTUM OSCILLATION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-accent">
                    <Layers className="h-5 w-5" />
                    <h3 className="font-black uppercase tracking-wider text-sm">Step 2: Momentum Exclusion Zones</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-4 rounded-md border border-slate-800 order-2 md:order-1">
                      <div className="flex flex-col gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-black text-blue-400">CALL SETTINGS</p>
                          <p className="text-[11px] text-slate-400">RSI between <span className="text-white">30-85</span>. STOCHASTIC must be <span className="text-white">Rising</span> and below <span className="text-white">90</span> to avoid overbought exhaustion.</p>
                        </div>
                        <div className="space-y-1 border-t border-slate-800 pt-2">
                          <p className="text-xs font-black text-red-400">PUT SETTINGS</p>
                          <p className="text-[11px] text-slate-400">RSI between <span className="text-white">15-70</span>. STOCHASTIC must be <span className="text-white">Falling</span> and above <span className="text-white">10</span> to avoid oversold trap.</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-md border border-slate-800 flex flex-col justify-between order-1 md:order-2 h-32">
                      <div className="h-px w-full bg-slate-800 relative">
                        <span className="absolute -top-3 right-0 text-[8px] text-slate-600">80 LEVEL</span>
                      </div>
                      <div className="w-full h-8 overflow-hidden relative">
                         <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-full h-full text-blue-500/30" viewBox="0 0 100 20">
                               <path d="M0 20 Q 25 0, 50 10 T 100 0" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                         </div>
                         <div className="absolute right-10 top-0 h-4 w-4 rounded-full bg-blue-500 animate-ping" />
                      </div>
                      <div className="h-px w-full bg-slate-800 relative">
                        <span className="absolute -top-3 right-0 text-[8px] text-slate-600">20 LEVEL</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RULE 3: VOLATILITY FILTER */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <Waves className="h-5 w-5" />
                    <h3 className="font-black uppercase tracking-wider text-sm">Step 3: ATR Volatility Shield</h3>
                  </div>
                  <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-md">
                    <p className="text-xs text-slate-300">
                      The system monitors the <span className="text-white font-bold">Average True Range (ATR)</span>. 
                      If the current signal candle is <span className="text-red-400 font-bold">2.5x larger</span> than the previous 14-period average, 
                      it is flagged as a "Volatile Spike" and <span className="text-red-400 font-bold underline italic">AUTO-REJECTED</span>. 
                      This prevents entering at the end of an exhausted move.
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </section>

          {/* M1 REFERENCE SECTION */}
          <section id="m1-reference" className="space-y-6 opacity-80">
            <div className="flex items-center gap-3 border-l-4 border-slate-600 pl-4">
              <BookOpen className="h-8 w-8 text-slate-400" />
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-300 uppercase italic">M1 Binary Reference System</h2>
                <p className="text-[10px] text-red-400 font-black uppercase tracking-tighter">Educational Reading Material Only • Do Not Implement</p>
              </div>
            </div>

            <Card className="bg-slate-900/30 border-slate-800">
              <CardContent className="pt-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-base font-black text-white flex items-center gap-2 uppercase">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      The EMA 50 Bias Line
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      On the M1 timeframe, the 50 EMA acts as the "Floor" or "Ceiling". 
                      We never trade against the slope. If the EMA is flat, the market is ranging 
                      and we <span className="text-white font-bold">STAY OUT</span>.
                    </p>
                    <div className="h-24 bg-slate-950 rounded border border-slate-800 relative overflow-hidden flex items-center px-8">
                       <div className="w-full h-px bg-primary/40 -rotate-12 blur-[1px]" />
                       <div className="absolute top-10 right-10 text-[10px] text-primary/60 font-bold">UPWARD BIAS</div>
                       <div className="flex gap-1 items-end mt-4">
                          <div className="w-2 h-4 bg-green-500/20" />
                          <div className="w-2 h-6 bg-green-500/40" />
                          <div className="w-2 h-8 bg-green-500/60" />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-black text-white flex items-center gap-2 uppercase">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      MACD Momentum Timing
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      We use the MACD histogram to see if a pullback is finished. 
                      For a <span className="text-red-400">SELL</span>, we wait for the 
                      histogram to turn from Green to Red, or for green bars to start 
                      shrinking towards the zero line.
                    </p>
                    <div className="bg-slate-950 p-2 rounded-md border border-slate-800 flex flex-col gap-1">
                       <div className="flex items-end gap-0.5 h-12">
                          <div className="flex-1 bg-green-900/30 h-[20%]" />
                          <div className="flex-1 bg-green-900/40 h-[40%]" />
                          <div className="flex-1 bg-green-900/60 h-[70%]" />
                          <div className="flex-1 bg-green-500 h-[60%]" />
                          <div className="flex-1 bg-green-400 h-[30%] animate-pulse" />
                       </div>
                       <div className="w-full h-px bg-slate-700" />
                       <p className="text-[8px] text-center text-slate-500 font-bold">MOMENTUM LOSS (EXITING PULLBACK)</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-6">
                  <h3 className="text-base font-black text-white uppercase mb-4">4-Minute Expiry Logic</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { t: "Candle 1", d: "Entry on Rejection", c: "border-primary" },
                      { t: "Candle 2", d: "Trend Confirmation", c: "border-slate-800" },
                      { t: "Candle 3", d: "Impulse Move", c: "border-slate-800" },
                      { t: "Candle 4", d: "Expiry (ITM)", c: "border-accent" },
                    ].map((step, i) => (
                      <div key={i} className={`p-3 rounded-md border bg-slate-950/50 ${step.c}`}>
                        <p className="text-[10px] font-black text-slate-500 mb-1">{step.t}</p>
                        <p className="text-[11px] font-bold text-slate-200 leading-tight">{step.d}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-md flex items-start gap-3">
                   <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                   <div>
                     <p className="text-xs font-black text-amber-500 uppercase">Pro Rule: London & NY Only</p>
                     <p className="text-[11px] text-slate-400">Never trade this M1 strategy during Asian session. Liquidity is too low for M1 price action to be mechanical.</p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FINAL TRADING CHECKLIST */}
          <section className="bg-slate-900 rounded-xl p-8 border border-primary/10 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-4 mb-8">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">The Gilgalo Trader's Creed</h2>
              <p className="text-sm text-slate-400 max-w-lg">I will only click if 100% of the mechanical rules match. I will respect the 6-minute scan. I will manage my risk like an institution.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs text-primary font-black">01</div>
                    <span className="text-xs font-bold uppercase tracking-tight">Wait for the System Scan</span>
                 </div>
                 <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs text-primary font-black">02</div>
                    <span className="text-xs font-bold uppercase tracking-tight">Verify M15/H1 Trend Alignment</span>
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs text-primary font-black">03</div>
                    <span className="text-xs font-bold uppercase tracking-tight">No News within +/- 30 Minutes</span>
                 </div>
                 <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs text-primary font-black">04</div>
                    <span className="text-xs font-bold uppercase tracking-tight">Accept the outcome - No Revenge Trading</span>
                 </div>
              </div>
            </div>
          </section>

        </div>
      </ScrollArea>
    </div>
  );
}
