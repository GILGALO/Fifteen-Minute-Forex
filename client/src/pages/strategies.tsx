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
  Info,
  Clock,
  CheckCircle2
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

          {/* NEW: EXPIRY & TIMING ENGINE */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-black text-white uppercase italic">Expiration & Timing Engine</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "M1 Chart Only", desc: "Analysis happens on the 1-minute time-frame exclusively.", icon: Activity },
                { title: "4-Minute Expiry", desc: "Set your broker timer to exactly 4:00 minutes for every trade.", icon: Timer },
                { title: "Candle Close Rule", desc: "Never enter mid-candle. The signal is only valid on the close.", icon: ShieldCheck },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/40 border border-white/5 p-4 rounded-xl space-y-2 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-primary" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{item.title}</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SELL SEQUENCE EXAMPLES */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-400" />
              <h2 className="text-xl font-black text-white uppercase italic text-rose-400">Sell Sequences (Institutional Traps)</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* THE GRADUAL PULLBACK SELL */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <CardHeader className="bg-slate-900/40 p-4 border-b border-white/5 flex flex-row justify-between items-center">
                   <CardTitle className="text-xs font-black uppercase text-rose-400">Gradual Pullback Sequence</CardTitle>
                   <Badge variant="outline" className="text-[8px] bg-rose-500/10 text-rose-500 border-rose-500/20">CONSERVATIVE ENTRY</Badge>
                </CardHeader>
                <div className="p-8 bg-black relative min-h-[350px] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20"><path d="M 0 100 Q 250 120, 500 160" fill="none" stroke="#d946ef" strokeWidth="3" /></svg>
                  <div className="flex items-end gap-2 pt-12">
                    <div className="w-4 h-32 bg-rose-600/40 rounded-sm" />
                    <div className="w-4 h-24 bg-rose-600/30 rounded-sm" />
                    <div className="w-4 h-12 bg-green-500/20 rounded-sm translate-y-2" />
                    <div className="w-4 h-16 bg-green-500/30 rounded-sm translate-y-1" />
                    <div className="w-4 h-20 bg-green-500/40 rounded-sm" />
                    <div className="relative">
                      <div className="w-6 h-36 bg-rose-600 border-2 border-white rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-pulse" />
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-px h-28 bg-white" />
                      <Badge className="absolute -top-16 left-1/2 -translate-x-1/2 bg-rose-500 text-[8px] font-black uppercase">REJECTION</Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* THE FAST SPIKE TRAP */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <CardHeader className="bg-slate-900/40 p-4 border-b border-white/5 flex flex-row justify-between items-center">
                   <CardTitle className="text-xs font-black uppercase text-rose-400">The Fast Spike Trap</CardTitle>
                   <Badge variant="outline" className="text-[8px] bg-rose-500/10 text-rose-500 border-rose-500/20">AGGRESSIVE ENTRY</Badge>
                </CardHeader>
                <div className="p-8 bg-black relative min-h-[350px] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20"><path d="M 0 140 Q 250 160, 500 200" fill="none" stroke="#d946ef" strokeWidth="3" /></svg>
                  <div className="flex items-end gap-3 pt-12">
                    <div className="w-5 h-40 bg-rose-700/80 rounded-sm" />
                    <div className="w-8 h-12 bg-green-500/60 border border-green-400 rounded-sm relative">
                       <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-px h-16 bg-white" />
                    </div>
                    <div className="relative">
                      <div className="w-7 h-44 bg-rose-600 border-2 border-white rounded-sm animate-pulse" />
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-px h-20 bg-white" />
                      <Badge className="absolute -top-14 left-1/2 -translate-x-1/2 bg-rose-500 text-[8px] font-black uppercase">SELL NOW</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* BUY SEQUENCE EXAMPLES */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-black text-white uppercase italic text-emerald-400">Buy Sequences (Institutional Support)</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* THE DIP & BOUNCE */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <CardHeader className="bg-slate-900/40 p-4 border-b border-white/5 flex flex-row justify-between items-center">
                   <CardTitle className="text-xs font-black uppercase text-emerald-400">The Dip & Bounce</CardTitle>
                   <Badge variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">TREND CONTINUATION</Badge>
                </CardHeader>
                <div className="p-8 bg-black relative min-h-[350px] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20"><path d="M 0 200 Q 250 180, 500 140" fill="none" stroke="#d946ef" strokeWidth="3" /></svg>
                  <div className="flex items-end gap-2 pb-12">
                    <div className="w-4 h-28 bg-green-500/40 rounded-sm" />
                    <div className="w-4 h-32 bg-green-500/50 rounded-sm" />
                    <div className="w-4 h-16 bg-rose-500/30 rounded-sm translate-y-1" />
                    <div className="w-4 h-12 bg-rose-500/40 rounded-sm translate-y-2" />
                    <div className="relative">
                      <div className="w-6 h-36 bg-green-600 border-2 border-white rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-pulse" />
                      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-px h-28 bg-white" />
                      <Badge className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-[8px] font-black uppercase">BOUNCE ENTRY</Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* THE VOLATILITY REJECTION */}
              <Card className="bg-slate-950 border-white/5 overflow-hidden">
                <CardHeader className="bg-slate-900/40 p-4 border-b border-white/5 flex flex-row justify-between items-center">
                   <CardTitle className="text-xs font-black uppercase text-emerald-400">Volatility Rejection</CardTitle>
                   <Badge variant="outline" className="text-[8px] bg-cyan-500/10 text-cyan-500 border-cyan-500/20">HIGH VOLATILITY SNIPER</Badge>
                </CardHeader>
                <div className="p-8 bg-black relative min-h-[350px] flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20"><path d="M 0 240 Q 250 220, 500 180" fill="none" stroke="#d946ef" strokeWidth="3" /></svg>
                  <div className="flex items-end gap-3 pb-12">
                    <div className="w-5 h-36 bg-green-700/60 rounded-sm" />
                    <div className="relative">
                      <div className="w-7 h-10 bg-white border-2 border-green-500 rounded-sm animate-bounce" />
                      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-px h-40 bg-white" />
                      <Badge className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-600 text-[8px] font-black uppercase">ULTRA SNIPER</Badge>
                    </div>
                    <div className="w-5 h-44 bg-green-600 rounded-sm" />
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* NEW: RISK MANAGEMENT PROTOCOL */}
          <section className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-rose-500" />
              <h2 className="text-xl font-black text-white uppercase italic">Risk Management Protocol</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Fixed Investment</h4>
                <p className="text-[10px] text-slate-400 italic leading-relaxed">"Never risk more than 1-2% of your total balance per trade. Compounding is better than gambling."</p>
              </div>
              <div className="space-y-2 border-l border-white/5 pl-6">
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">3-Loss Halt</h4>
                <p className="text-[10px] text-slate-400 italic leading-relaxed">"If you lose 3 trades in a row, close the broker. Market conditions have shifted. Stop for the day."</p>
              </div>
            </div>
          </section>

          {/* THE 4-MINUTE GOLD RULE */}
          <Card className="bg-primary/10 border-primary/30 p-6 rounded-xl flex items-center gap-6">
             <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 shrink-0">
                <Info className="h-6 w-6 text-primary" />
             </div>
             <div>
                <h3 className="text-lg font-black text-white uppercase italic leading-none mb-2">The Golden Mechanical Rule</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                   Analysis is useless without discipline. Observe the <span className="text-white font-bold underline">PREVIOUS 3 CANDLES</span>. If they show a gradual move toward the EMA followed by a rejection, your win rate increases. Always wait for the <span className="text-primary font-bold">M1 CLOSE</span>.
                </p>
             </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
