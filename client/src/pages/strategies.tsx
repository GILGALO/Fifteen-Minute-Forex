import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Target, 
  AlertCircle, 
  Info,
  Clock,
  CheckCircle2,
  Activity,
  Timer
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

          {/* ADVANCED SELL SCENARIOS */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-400" />
              <h2 className="text-xl font-black text-white uppercase italic text-rose-400">Institutional Sell Patterns</h2>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-4">
              {/* THE LIQUIDITY GRAB */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <div className="p-4 bg-slate-900/40 border-b border-white/5 flex justify-between items-center">
                   <span className="text-[9px] font-black text-rose-400 uppercase">A: Liquidity Grab</span>
                   <Badge className="text-[7px] bg-rose-500/10">TRAP</Badge>
                </div>
                <div className="h-48 bg-black relative flex items-center justify-center p-4">
                  <svg className="absolute inset-0 w-full h-full opacity-20"><path d="M 0 100 Q 150 110, 300 130" fill="none" stroke="#d946ef" strokeWidth="2" /></svg>
                  <div className="flex items-end gap-1 pt-8">
                    <div className="w-3 h-20 bg-green-500/20" />
                    <div className="w-3 h-24 bg-green-500/30" />
                    <div className="relative">
                      <div className="w-4 h-32 bg-rose-600 border border-white" />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-24 bg-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 text-[8px] text-slate-500 uppercase font-black">Spike Above → Close Below</div>
                </div>
              </Card>

              {/* THE EMA SLIDE */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <div className="p-4 bg-slate-900/40 border-b border-white/5 flex justify-between items-center">
                   <span className="text-[9px] font-black text-rose-400 uppercase">B: The EMA Slide</span>
                   <Badge className="text-[7px] bg-rose-500/10">TREND</Badge>
                </div>
                <div className="h-48 bg-black relative flex items-center justify-center p-4">
                  <svg className="absolute inset-0 w-full h-full opacity-20"><path d="M 0 80 L 300 160" fill="none" stroke="#d946ef" strokeWidth="2" /></svg>
                  <div className="flex items-end gap-1 pt-8">
                    <div className="w-3 h-12 bg-green-500/20 translate-y-2" />
                    <div className="w-3 h-12 bg-rose-600 border border-white" />
                    <div className="w-3 h-16 bg-rose-600/60" />
                  </div>
                  <div className="absolute bottom-2 text-[8px] text-slate-500 uppercase font-black">Clean Rejection → Slide</div>
                </div>
              </Card>

              {/* THE DOUBLE TOUCH */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <div className="p-4 bg-slate-900/40 border-b border-white/5 flex justify-between items-center">
                   <span className="text-[9px] font-black text-rose-400 uppercase">C: Double Touch</span>
                   <Badge className="text-[7px] bg-rose-500/10">CONFIRM</Badge>
                </div>
                <div className="h-48 bg-black relative flex items-center justify-center p-4">
                  <svg className="absolute inset-0 w-full h-full opacity-20"><path d="M 0 120 H 300" fill="none" stroke="#d946ef" strokeWidth="2" /></svg>
                  <div className="flex items-end gap-1 pt-8">
                    <div className="w-3 h-20 bg-rose-600/20" />
                    <div className="w-3 h-20 bg-rose-600 border border-white" />
                    <div className="w-3 h-20 bg-rose-600/80" />
                  </div>
                  <div className="absolute bottom-2 text-[8px] text-slate-500 uppercase font-black">Resistance Confirmed</div>
                </div>
              </Card>
            </div>
          </section>

          {/* ADVANCED BUY SCENARIOS */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-black text-white uppercase italic text-emerald-400">Institutional Buy Patterns</h2>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-4">
              {/* THE SNIPER BOUNCE */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <div className="p-4 bg-slate-900/40 border-b border-white/5 flex justify-between items-center">
                   <span className="text-[9px] font-black text-emerald-400 uppercase">D: Sniper Bounce</span>
                   <Badge className="text-[7px] bg-emerald-500/10">PERFECT</Badge>
                </div>
                <div className="h-48 bg-black relative flex items-center justify-center p-4">
                  <svg className="absolute inset-0 w-full h-full opacity-20"><path d="M 0 160 Q 150 140, 300 120" fill="none" stroke="#d946ef" strokeWidth="2" /></svg>
                  <div className="flex items-end gap-1 pb-8">
                    <div className="w-3 h-16 bg-rose-500/20" />
                    <div className="relative">
                      <div className="w-4 h-32 bg-green-600 border border-white" />
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-px h-24 bg-white" />
                    </div>
                    <div className="w-3 h-36 bg-green-600/80" />
                  </div>
                  <div className="absolute bottom-2 text-[8px] text-slate-500 uppercase font-black">Touch EMA → Rocket</div>
                </div>
              </Card>

              {/* THE PULLBACK CLAIRTY */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <div className="p-4 bg-slate-900/40 border-b border-white/5 flex justify-between items-center">
                   <span className="text-[9px] font-black text-emerald-400 uppercase">E: Pullback Clarity</span>
                   <Badge className="text-[7px] bg-emerald-500/10">STAIRS</Badge>
                </div>
                <div className="h-48 bg-black relative flex items-center justify-center p-4">
                  <svg className="absolute inset-0 w-full h-full opacity-20"><path d="M 0 180 L 300 100" fill="none" stroke="#d946ef" strokeWidth="2" /></svg>
                  <div className="flex items-end gap-1 pb-8">
                    <div className="w-3 h-8 bg-rose-500/20 translate-y-2" />
                    <div className="w-3 h-10 bg-rose-500/30 translate-y-1" />
                    <div className="w-4 h-32 bg-green-600 border border-white" />
                  </div>
                  <div className="absolute bottom-2 text-[8px] text-slate-500 uppercase font-black">Controlled Dip → Expansion</div>
                </div>
              </Card>

              {/* THE V-REJECTION */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <div className="p-4 bg-slate-900/40 border-b border-white/5 flex justify-between items-center">
                   <span className="text-[9px] font-black text-emerald-400 uppercase">F: V-Rejection</span>
                   <Badge className="text-[7px] bg-emerald-500/10">STRONG</Badge>
                </div>
                <div className="h-48 bg-black relative flex items-center justify-center p-4">
                  <svg className="absolute inset-0 w-full h-full opacity-20"><path d="M 0 140 H 300" fill="none" stroke="#d946ef" strokeWidth="2" /></svg>
                  <div className="flex items-end gap-1 pb-8">
                    <div className="w-3 h-40 bg-rose-500/40" />
                    <div className="w-4 h-12 bg-white border-2 border-green-500 animate-bounce" />
                    <div className="w-3 h-44 bg-green-600" />
                  </div>
                  <div className="absolute bottom-2 text-[8px] text-slate-500 uppercase font-black">Absorption → Reversal</div>
                </div>
              </Card>
            </div>
          </section>

          {/* RISK & TIMING MODULES */}
          <section className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/40 border-white/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-black text-white uppercase italic">Timing Engine</h3>
              </div>
              <ul className="text-[10px] text-slate-400 space-y-2">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> M1 Timeframe Only</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> 4-Minute Expiration</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> Candle Close Verification</li>
              </ul>
            </Card>

            <Card className="bg-rose-500/5 border border-rose-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="h-5 w-5 text-rose-500" />
                <h3 className="text-sm font-black text-white uppercase italic">Risk Protocol</h3>
              </div>
              <ul className="text-[10px] text-slate-400 space-y-2">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-rose-500 rounded-full" /> 1-2% Max Per Trade</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-rose-500 rounded-full" /> Stop Loss: 3 Daily</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-rose-500 rounded-full" /> No News Trading (+/- 30m)</li>
              </ul>
            </Card>
          </section>

          {/* FINAL TRADING RULE */}
          <Card className="bg-primary/10 border-primary/30 p-6 rounded-xl flex items-center gap-6">
             <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 shrink-0">
                <Info className="h-6 w-6 text-primary" />
             </div>
             <div>
                <h3 className="text-lg font-black text-white uppercase italic leading-none mb-2">The Golden Mechanical Rule</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                   Analysis is useless without discipline. Observe the <span className="text-white font-bold underline">PREVIOUS 3 CANDLES</span>. If they show a controlled move toward the EMA followed by a rejection, your win rate increases. Always wait for the <span className="text-primary font-bold">M1 CLOSE</span>.
                </p>
             </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
