import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Target, 
  ArrowRightCircle,
  Activity,
  AlertCircle,
  Info
} from "lucide-react";

export default function Strategies() {
  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-6xl h-full flex flex-col gap-6 bg-slate-950/50">
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
          M1 → <span className="text-primary">4-MINUTE</span> BINARY MASTER
        </h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-primary/20">Educational Framework</Badge>
          <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Mechanical Strategy v11.4</span>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="flex flex-col gap-12 pb-12">
          
          {/* THE MASTER LOGIC */}
          <section className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/40 border-emerald-500/20 backdrop-blur-md">
                <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    <CardTitle className="text-lg font-black uppercase italic text-white">The Buy Setup (Above EMA 50)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Buy Conditions:</p>
                    <ul className="text-xs text-slate-300 space-y-3">
                      <li className="flex gap-2"><span className="text-emerald-500 font-bold">01.</span><span>Price strictly ABOVE angled Magenta EMA 50.</span></li>
                      <li className="flex gap-2"><span className="text-emerald-500 font-bold">02.</span><span>Wait for a "Pullback" to touch or get near EMA.</span></li>
                      <li className="flex gap-2"><span className="text-emerald-500 font-bold">03.</span><span>Rejection Wick must form on the touch.</span></li>
                      <li className="flex gap-2"><span className="text-emerald-500 font-bold">04.</span><span>MACD must be Bullish (Green).</span></li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/40 border-rose-500/20 backdrop-blur-md">
                <CardHeader className="bg-rose-500/10 border-b border-rose-500/20">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-rose-400" />
                    <CardTitle className="text-lg font-black uppercase italic text-white">The Sell Setup (Below EMA 50)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest">Sell Conditions:</p>
                    <ul className="text-xs text-slate-300 space-y-3">
                      <li className="flex gap-2"><span className="text-rose-500 font-bold">01.</span><span>Price strictly BELOW angled Magenta EMA 50.</span></li>
                      <li className="flex gap-2"><span className="text-rose-500 font-bold">02.</span><span>Wait for a "Retest" upward to the EMA line.</span></li>
                      <li className="flex gap-2"><span className="text-rose-500 font-bold">03.</span><span>Upper Wick Rejection must form at EMA.</span></li>
                      <li className="flex gap-2"><span className="text-rose-500 font-bold">04.</span><span>MACD must be Bearish (Red).</span></li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CANDLE SCENARIOS - BATCH 1 (SELL TRAPS) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-400" />
              <h2 className="text-xl font-black text-white uppercase italic">Sell Scenarios (Below EMA 50)</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* SCENARIO A: THE PERFECT REJECTION */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <CardHeader className="bg-slate-900/40 p-4 border-b border-white/5 flex flex-row justify-between items-center">
                   <CardTitle className="text-xs font-black uppercase text-rose-400">Scenario A: The Perfect Rejection</CardTitle>
                   <Badge variant="outline" className="text-[8px] bg-rose-500/10 text-rose-500 border-rose-500/20">HIGH PROBABILITY</Badge>
                </CardHeader>
                <div className="p-8 bg-black relative min-h-[300px] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20"><path d="M 0 120 Q 250 140, 500 180" fill="none" stroke="#d946ef" strokeWidth="3" /></svg>
                  <div className="flex items-end gap-3 pt-12">
                    <div className="w-5 h-20 bg-green-500/20 border border-green-500/30 rounded-sm" /> {/* Pullback */}
                    <div className="relative">
                      <div className="w-6 h-32 bg-rose-600 border-2 border-white rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-pulse" />
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-px h-24 bg-white" /> {/* LONG UPPER WICK */}
                      <Badge className="absolute -top-16 left-1/2 -translate-x-1/2 bg-rose-500 text-[8px] font-black uppercase">SELL NOW</Badge>
                    </div>
                    <div className="w-5 h-24 bg-rose-700/60 border border-rose-500/40 rounded-sm" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-[10px] text-slate-500 font-bold italic">"Candle pokes ABOVE EMA but CLOSES BELOW with a long wick."</p>
                  </div>
                </div>
              </Card>

              {/* SCENARIO B: THE MOMENTUM BREAK */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <CardHeader className="bg-slate-900/40 p-4 border-b border-white/5 flex flex-row justify-between items-center">
                   <CardTitle className="text-xs font-black uppercase text-rose-400">Scenario B: Momentum Break</CardTitle>
                   <Badge variant="outline" className="text-[8px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">WAIT FOR RE-TEST</Badge>
                </CardHeader>
                <div className="p-8 bg-black relative min-h-[300px] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20"><path d="M 0 80 Q 250 100, 500 140" fill="none" stroke="#d946ef" strokeWidth="3" /></svg>
                  <div className="flex items-end gap-3 pt-12">
                    <div className="w-6 h-40 bg-green-500 border-2 border-green-400 rounded-sm" /> {/* STRONG BREAK UP */}
                    <div className="flex flex-col items-center">
                       <div className="w-5 h-28 bg-rose-500/30 border border-rose-400/30 rounded-sm" />
                       <Badge variant="outline" className="mt-2 text-[8px] font-black text-yellow-500">NO TRADE (Broken Trend)</Badge>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-[10px] text-slate-500 font-bold italic">"Full body candle closes ABOVE EMA. Wait for re-break below."</p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* CANDLE SCENARIOS - BATCH 2 (BUY OPPORTUNITIES) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-black text-white uppercase italic">Buy Scenarios (Above EMA 50)</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* SCENARIO C: THE BOUNCE */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <CardHeader className="bg-slate-900/40 p-4 border-b border-white/5 flex flex-row justify-between items-center">
                   <CardTitle className="text-xs font-black uppercase text-emerald-400">Scenario C: The EMA Bounce</CardTitle>
                   <Badge variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">HIGH PROBABILITY</Badge>
                </CardHeader>
                <div className="p-8 bg-black relative min-h-[300px] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20"><path d="M 0 180 Q 250 160, 500 120" fill="none" stroke="#d946ef" strokeWidth="3" /></svg>
                  <div className="flex items-end gap-3 pb-12">
                    <div className="w-5 h-20 bg-rose-500/20 border border-rose-500/30 rounded-sm" /> {/* Pullback */}
                    <div className="relative">
                      <div className="w-6 h-32 bg-green-600 border-2 border-white rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-pulse" />
                      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-px h-24 bg-white" /> {/* LONG LOWER WICK */}
                      <Badge className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-[8px] font-black uppercase">BUY NOW</Badge>
                    </div>
                    <div className="w-5 h-24 bg-green-700/60 border border-green-500/40 rounded-sm" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-[10px] text-slate-500 font-bold italic">"Lower wick touches EMA line. Candle closes GREEN."</p>
                  </div>
                </div>
              </Card>

              {/* SCENARIO D: THE PIN BAR TRAP */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <CardHeader className="bg-slate-900/40 p-4 border-b border-white/5 flex flex-row justify-between items-center">
                   <CardTitle className="text-xs font-black uppercase text-emerald-400">Scenario D: Institutional Pin Bar</CardTitle>
                   <Badge variant="outline" className="text-[8px] bg-cyan-500/10 text-cyan-500 border-cyan-500/20">ULTRA SNIPER</Badge>
                </CardHeader>
                <div className="p-8 bg-black relative min-h-[300px] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20"><path d="M 0 200 Q 250 180, 500 140" fill="none" stroke="#d946ef" strokeWidth="3" /></svg>
                  <div className="flex items-end gap-3 pb-12">
                    <div className="w-5 h-16 bg-rose-500/20 rounded-sm" />
                    <div className="w-5 h-12 bg-rose-500/40 rounded-sm" />
                    <div className="relative">
                      <div className="w-6 h-8 bg-white border-2 border-green-500 rounded-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-bounce" />
                      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-px h-32 bg-white" /> {/* MASSIVE LOWER WICK */}
                      <Badge className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-600 text-[8px] font-black uppercase">MASTER ENTRY</Badge>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-[10px] text-slate-500 font-bold italic">"Massive lower wick rejection. Institutions are BUYING the dip."</p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* MACD CROSSOVER CHEATSHEET */}
          <section className="bg-slate-900/40 border border-white/5 p-6 rounded-xl">
             <div className="flex items-center gap-3 mb-6">
                <Activity className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-black text-white uppercase italic">MACD Crossover Confirmation</h2>
             </div>
             <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" /> Bullish Confirm
                   </h4>
                   <div className="h-20 flex items-end gap-1 px-4 bg-slate-950 rounded border border-emerald-500/10">
                      {[0.2, 0.4, 0.6, 0.8, 1.0, 1.1].map((v, i) => (
                        <div key={i} style={{ height: `${v*80}%` }} className="flex-1 bg-emerald-500 animate-pulse" />
                      ))}
                   </div>
                   <p className="text-[10px] text-slate-400">Histogram bars grow <span className="text-emerald-400 font-bold uppercase">Green</span> and expand upward. This is your green light for Buy trades.</p>
                </div>
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                      <TrendingDown className="h-3 w-3" /> Bearish Confirm
                   </h4>
                   <div className="h-20 flex items-end gap-1 px-4 bg-slate-950 rounded border border-rose-500/10">
                      {[0.2, 0.4, 0.6, 0.8, 1.0, 1.1].map((v, i) => (
                        <div key={i} style={{ height: `${v*80}%` }} className="flex-1 bg-rose-500 animate-pulse" />
                      ))}
                   </div>
                   <p className="text-[10px] text-slate-400">Histogram bars grow <span className="text-rose-400 font-bold uppercase">Red</span> and expand downward. This is your green light for Sell trades.</p>
                </div>
             </div>
          </section>

          {/* FINAL TRADING RULE */}
          <Card className="bg-primary/10 border-primary/30 p-6 rounded-xl flex items-center gap-6">
             <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 shrink-0">
                <Info className="h-6 w-6 text-primary" />
             </div>
             <div>
                <h3 className="text-lg font-black text-white uppercase italic leading-none mb-2">The 4-Minute Gold Rule</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                   Never enter mid-candle. Always wait for the <span className="text-white font-bold underline">M1 Candle to CLOSE</span>. If it closes as a rejection wick at the EMA 50, you enter for exactly <span className="text-primary font-black uppercase tracking-widest underline">4-Minute Expiration</span>.
                </p>
             </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
