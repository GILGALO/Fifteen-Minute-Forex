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
  AlertCircle
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
          
          {/* CORE LOGIC SECTION */}
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
                    <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">When to Buy:</p>
                    <ul className="text-xs text-slate-300 space-y-3">
                      <li className="flex gap-2">
                        <span className="text-emerald-500 font-bold">01.</span>
                        <span>Price is strictly <span className="text-white font-bold underline decoration-emerald-500">ABOVE</span> the Magenta EMA 50 line. The line must be angled upward.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-emerald-500 font-bold">02.</span>
                        <span>Wait for a <span className="text-white font-bold italic underline">Pullback</span>. Candles must move back toward the EMA without breaking below it.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-emerald-500 font-bold">03.</span>
                        <span>Look for <span className="text-emerald-400 font-bold underline">Rejection Wicks</span>. Long wicks touching the EMA show buyers are stepping in.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-emerald-500 font-bold">04.</span>
                        <span>MACD Confirmation: MACD Histogram must be <span className="text-emerald-400 font-bold underline">GREEN</span> and crossover must be Bullish.</span>
                      </li>
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
                    <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest">When to Sell:</p>
                    <ul className="text-xs text-slate-300 space-y-3">
                      <li className="flex gap-2">
                        <span className="text-rose-500 font-bold">01.</span>
                        <span>Price is strictly <span className="text-white font-bold underline decoration-rose-500">BELOW</span> the Magenta EMA 50 line. The line must be angled downward.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-rose-500 font-bold">02.</span>
                        <span>Wait for a <span className="text-white font-bold italic underline">Retest</span>. Candles must "breathe" back up toward the EMA line.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-rose-500 font-bold">03.</span>
                        <span>Look for <span className="text-rose-400 font-bold underline">Upper Wick Rejection</span>. Candles that poke through the EMA but close below it are prime signals.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-rose-500 font-bold">04.</span>
                        <span>MACD Confirmation: MACD Histogram must be <span className="text-rose-400 font-bold underline">RED</span> and crossover must be Bearish.</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* DETAILED CHART ANALYSIS (SELL SCENARIO FROM SCREENSHOT) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-black text-white uppercase italic">Mechanical Chart Analysis (As per Screenshot)</h2>
            </div>
            
            <Card className="bg-slate-950 border-white/5 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2">
                  <div className="p-8 space-y-6 bg-slate-900/20 border-r border-white/5">
                    <div className="space-y-2">
                      <Badge className="bg-rose-500 text-white font-black">SELL VERDICT</Badge>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Why we Sell in your Screenshot:</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-slate-950 p-4 rounded-lg border border-rose-500/20 space-y-3">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            <p className="text-[11px] font-black text-white uppercase">The EMA Trap</p>
                            <p className="text-[10px] text-slate-400">In your screenshot, notice how price tried to break ABOVE the Magenta line but immediately produced a <span className="text-rose-400 font-bold italic underline">long upper wick</span> and closed back below. This is a rejection.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Activity className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            <p className="text-[11px] font-black text-white uppercase">MACD Convergence</p>
                            <p className="text-[10px] text-slate-400">The MACD histogram (the bars at the bottom) is turning <span className="text-rose-400 font-bold">RED</span>. The green momentum is dying, and the fast line is crossing below the slow line.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <p className="text-[10px] font-black text-primary uppercase mb-2 tracking-tighter">Pro Tip for 4-Min Expiry:</p>
                        <p className="text-[10px] text-slate-300 leading-relaxed italic">"Do not enter the moment it touches the line. Wait for the candle to CLOSE. If it closes below the line with a wick poking through, enter for 4 minutes."</p>
                      </div>
                    </div>
                  </div>

                  {/* VISUAL RECREATION OF SCREENSHOT LOGIC */}
                  <div className="p-8 relative flex flex-col justify-center min-h-[400px] bg-black">
                    <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:32px_32px]" />
                    </div>
                    
                    {/* EMA LINE RECREATION */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                       <path d="M 0 150 Q 200 140, 400 180 T 600 200" fill="none" stroke="#d946ef" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]" />
                    </svg>

                    <div className="relative flex items-center justify-center gap-4">
                      {/* BULLISH PULLBACK */}
                      <div className="flex flex-col items-center gap-1 opacity-40">
                         <div className="w-5 h-24 bg-green-500/50 border border-green-400/50 rounded-sm" />
                         <span className="text-[8px] text-slate-500 font-black uppercase">Pullback</span>
                      </div>

                      {/* THE REJECTION CANDLE */}
                      <div className="relative group">
                        <div className="w-6 h-32 bg-rose-600 border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-sm animate-pulse z-10 relative">
                           <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
                              <Badge className="bg-rose-500 text-white border-none text-[10px] font-black px-2 shadow-xl animate-bounce">SELL ENTRY</Badge>
                              <div className="h-6 w-px bg-white" />
                              <ArrowRightCircle className="h-5 w-5 text-white rotate-90" />
                           </div>
                           <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-px h-24 bg-white/60" /> {/* THE WICK */}
                        </div>
                        <div className="absolute inset-0 bg-rose-500/20 blur-xl animate-pulse" />
                      </div>

                      {/* RESULT CANDLES */}
                      <div className="flex flex-col items-center gap-1 mt-12 opacity-80">
                         <div className="w-5 h-20 bg-rose-700/60 border border-rose-500/40 rounded-sm" />
                         <div className="w-5 h-24 bg-rose-700/60 border border-rose-500/40 rounded-sm" />
                         <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest">Profit Zone</span>
                      </div>
                    </div>

                    <div className="mt-12 space-y-4">
                       <div className="h-12 flex items-end gap-1 px-4 bg-slate-900/50 rounded border border-white/5 overflow-hidden">
                          {[0.8, 0.6, 0.4, 0.2].map((v, i) => (
                            <div key={i} style={{ height: `${v*100}%` }} className="flex-1 bg-green-500/30" />
                          ))}
                          <div className="w-1 h-full bg-white/20 mx-1" />
                          {[0.3, 0.6, 0.9, 1.0].map((v, i) => (
                            <div key={i} style={{ height: `${v*100}%` }} className="flex-1 bg-rose-500/80" />
                          ))}
                       </div>
                       <p className="text-[9px] text-slate-500 text-center font-bold uppercase tracking-widest">MACD Timing Confirmation (Sell Bias)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FINAL SUMMARY */}
          <section className="bg-primary/5 border border-primary/20 p-6 rounded-xl">
             <div className="flex items-center gap-3 mb-4">
                <Zap className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-black text-white uppercase italic">Execution Summary</h2>
             </div>
             <div className="grid sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-primary uppercase">Trend Filter</p>
                   <p className="text-[11px] text-slate-400 italic">"Magenta Line is your Compass."</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-primary uppercase">Entry Trigger</p>
                   <p className="text-[11px] text-slate-400 italic">"Wait for the Rejection Wick."</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-primary uppercase">Confirmation</p>
                   <p className="text-[11px] text-slate-400 italic">"MACD Histogram color match."</p>
                </div>
             </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
