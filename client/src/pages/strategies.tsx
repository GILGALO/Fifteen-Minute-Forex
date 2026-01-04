import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Target, 
  AlertTriangle, 
  ArrowRightCircle,
  Activity,
  Maximize2,
  Timer
} from "lucide-react";

export default function Strategies() {
  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-6xl h-full flex flex-col gap-6 bg-slate-950/50">
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
          THE <span className="text-primary">TRADING</span> VAULT
        </h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-primary/20">Institutional Grade</Badge>
          <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Mechanical Framework v11.4</span>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="flex flex-col gap-12 pb-12">
          
          {/* M1 MECHANICAL STRATEGY - HIGH FIDELITY SECTION */}
          <section id="m1-strategy" className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">M1 → 4-Minute Binary Master</h2>
                  <p className="text-[10px] text-accent font-black uppercase tracking-tighter">Reading Material Only • Educational Framework</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: SETUP & RULES */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md overflow-hidden">
                  <CardHeader className="py-3 border-b border-white/5 bg-white/5">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">01. Indicator Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                        <span className="text-xs font-bold text-slate-200">EMA 50</span>
                      </div>
                      <Badge variant="secondary" className="text-[9px] bg-slate-800">Trend Bias Line</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                        <span className="text-xs font-bold text-slate-200">MACD (12, 26, 9)</span>
                      </div>
                      <Badge variant="secondary" className="text-[9px] bg-slate-800">Momentum Timing</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md">
                  <CardHeader className="py-3 border-b border-white/5 bg-white/5">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">02. Rule-Based Execution</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {[
                      { step: "A", title: "Trend Alignment", desc: "Price must be below EMA (Sell) or Above EMA (Buy). EMA must be clearly angled.", icon: TrendingDown },
                      { step: "B", title: "The Pullback", desc: "Price must 'breathe' back towards the EMA/Trendline without breaking it.", icon: Zap },
                      { step: "C", title: "Rejection", desc: "Wait for a clear upper/lower wick rejection candle at the confluence zone.", icon: Target },
                      { step: "D", title: "MACD Confirm", desc: "Histogram must show momentum fading (shrinking bars) before entry.", icon: Activity },
                    ].map((rule, i) => (
                      <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-black group-hover:bg-primary transition-colors">{rule.step}</div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-white uppercase">{rule.title}</p>
                          <p className="text-[10px] text-slate-500 leading-tight">{rule.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT COLUMN: VISUAL SIMULATION (SELL) */}
              <div className="lg:col-span-7">
                <Card className="bg-slate-950 border-white/5 h-full relative overflow-hidden flex flex-col">
                  {/* CHART HEADER */}
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 font-black">SELL SETUP</Badge>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BHD/CNY OTC • M1</span>
                    </div>
                  </div>

                  {/* CHART CONTENT - RECREATING SCREENSHOT LOGIC (SELL) */}
                  <div className="flex-1 p-8 flex flex-col gap-12 relative min-h-[300px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:24px_24px]" />
                    <div className="relative h-48 flex items-end gap-1.5 px-4">
                      <div className="w-5 h-20 bg-red-500/30 border border-red-500/50 rounded-sm" />
                      <div className="w-5 h-28 bg-red-500 border border-red-400 rounded-sm" />
                      <div className="w-5 h-16 bg-blue-500/20 border border-blue-400/30 rounded-sm ml-2" />
                      <div className="w-5 h-24 bg-blue-500/60 border border-blue-400/80 rounded-sm relative group">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 bg-blue-400/50" />
                      </div>
                      <div className="w-6 h-28 bg-red-600 border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] rounded-sm relative animate-pulse">
                         <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <ArrowRightCircle className="h-6 w-6 text-white rotate-90 mb-1" />
                            <span className="text-[9px] font-black text-white uppercase bg-red-600 px-2 py-0.5 rounded shadow-lg">SELL ENTRY</span>
                         </div>
                      </div>
                      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <path d="M 0 40 Q 150 50, 250 120 T 450 130" fill="none" stroke="#ec4899" strokeWidth="2.5" className="opacity-80" />
                        <line x1="100" y1="20" x2="350" y2="120" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 4" />
                      </svg>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-lg p-3 space-y-2">
                      <div className="h-12 flex items-end gap-1 px-2">
                        {[0.2, 0.4, 0.7, 0.9, 1.0, 0.8].map((val, i) => (
                          <div key={i} style={{ height: `${val * 100}%` }} className="flex-1 bg-green-500/50 rounded-t-sm" />
                        ))}
                        <div className="w-px h-full bg-white/10 mx-1" />
                        {[0.2, 0.5, 0.8, 0.6].map((val, i) => (
                          <div key={i} style={{ height: `${val * 100}%` }} className="flex-1 bg-red-500/40 rounded-t-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* NEW VISUAL SIMULATION (BUY) */}
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 hidden lg:block" />
              <div className="lg:col-span-7">
                <Card className="bg-slate-950 border-white/5 h-full relative overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-black">BUY SETUP</Badge>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BHD/CNY OTC • M1</span>
                    </div>
                  </div>

                  <div className="flex-1 p-8 flex flex-col gap-12 relative min-h-[300px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:24px_24px]" />
                    <div className="relative h-48 flex items-end gap-1.5 px-4">
                      <div className="w-5 h-28 bg-green-500/30 border border-green-500/50 rounded-sm" />
                      <div className="w-5 h-20 bg-green-500 border border-green-400 rounded-sm" />
                      <div className="w-5 h-24 bg-red-500/20 border border-red-400/30 rounded-sm ml-2" />
                      <div className="w-5 h-20 bg-red-500/60 border border-red-400/80 rounded-sm relative group">
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-px h-6 bg-red-400/50" />
                      </div>
                      <div className="w-6 h-32 bg-green-600 border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] rounded-sm relative animate-pulse">
                         <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <ArrowRightCircle className="h-6 w-6 text-white -rotate-90 mb-1" />
                            <span className="text-[9px] font-black text-white uppercase bg-green-600 px-2 py-0.5 rounded shadow-lg">BUY ENTRY</span>
                         </div>
                      </div>
                      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <path d="M 0 130 Q 150 120, 250 50 T 450 40" fill="none" stroke="#ec4899" strokeWidth="2.5" className="opacity-80" />
                        <line x1="100" y1="130" x2="350" y2="30" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 4" />
                      </svg>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-lg p-3 space-y-2">
                      <div className="h-12 flex items-end gap-1 px-2">
                        {[0.2, 0.5, 0.8, 0.6].map((val, i) => (
                          <div key={i} style={{ height: `${val * 100}%` }} className="flex-1 bg-red-500/50 rounded-t-sm" />
                        ))}
                        <div className="w-px h-full bg-white/10 mx-1" />
                        {[0.2, 0.4, 0.7, 0.9, 1.0, 0.8].map((val, i) => (
                          <div key={i} style={{ height: `${val * 100}%` }} className="flex-1 bg-green-500/40 rounded-t-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* ACTIVE EDGE SECTION - STREAMLINED */}
          <section id="active-edge">
             <Card className="bg-slate-900/40 border-primary/20 backdrop-blur-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
               <CardHeader className="bg-primary/10 border-b border-primary/20 py-4 flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Current M15 Live Engine</CardTitle>
                  </div>
                  <Badge variant="default" className="bg-primary hover:bg-primary no-default-hover-elevate">SYSTEM ACTIVE</Badge>
               </CardHeader>
               <CardContent className="p-8 grid md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                     <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        3-Check Safety
                     </h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed">Every signal is hard-filtered through <strong>Trend</strong> (3-Candle), <strong>Momentum</strong> (RSI/Stoch), and <strong>Volatility</strong> (ATR) before Telegram dispatch.</p>
                  </div>
                  <div className="space-y-3 border-x border-white/5 px-8">
                     <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        M15/H1 Sync
                     </h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed">Signals only generated when the Micro-trend (M15) aligns with Institutional direction (H1) for maximum win probability.</p>
                  </div>
                  <div className="space-y-3">
                     <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        News Blackout
                     </h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed">The auto-scanner monitors economic calendars and halts all scanning +/- 30 minutes from high-impact events.</p>
                  </div>
               </CardContent>
             </Card>
          </section>

          {/* NEW: FAKE BREAKOUT TRAP (OTC KILLER) */}
          <section id="fake-breakout" className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-yellow-500 pl-4">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                <ShieldCheck className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">🧠 The Fake Breakout Trap</h2>
                <p className="text-[10px] text-yellow-500 font-black uppercase tracking-tighter">OTC KILLER • INSTITUTIONAL BAIT DETECTION</p>
              </div>
            </div>

            <Card className="bg-slate-900/40 border-yellow-500/20 backdrop-blur-md overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      What is a "Trap"?
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      In OTC and high-volatility markets, institutions often push price above a trendline or resistance level to trigger <span className="text-white">"Breakout Buy"</span> orders. 
                      Once liquidity is grabbed, they immediately reverse the price. This is where most retail traders lose.
                    </p>
                    <div className="bg-slate-950 p-4 rounded-md border border-white/5 space-y-3">
                      <p className="text-[10px] font-black text-yellow-500 uppercase">Mechanical Trap Identification:</p>
                      <ul className="text-[10px] space-y-2 text-slate-500 font-medium">
                        <li>• <span className="text-white font-bold tracking-tight uppercase">01. The Liquidity Grab</span>: Price hits a major resistance level and pierces it by only <span className="text-yellow-500">2-5 pips</span>. This is bait for breakout algorithms.</li>
                        <li>• <span className="text-white font-bold tracking-tight uppercase">02. Volume Divergence</span>: The breakout candle has <span className="text-red-400">Lower Volume</span> than the previous 3 candles. True breakouts require institutional volume spikes.</li>
                        <li>• <span className="text-white font-bold tracking-tight uppercase">03. The Wick Return</span>: If the candle closes back <span className="text-red-400">BELOW</span> the breakout level, it is 100% a fakeout. Retail is trapped; Institutions are selling.</li>
                        <li>• <span className="text-white font-bold tracking-tight uppercase">04. EMA Gap (The Rubber Band)</span>: If price is {">"} 10 pips from EMA 50, the "Rubber Band" is stretched. It will snap back to the EMA regardless of the breakout.</li>
                      </ul>
                    </div>
                  </div>

                  {/* VISUAL TRAP SIMULATION */}
                  <div className="bg-black rounded-xl border border-yellow-500/20 p-6 relative flex flex-col justify-end min-h-[300px]">
                    <div className="absolute top-4 left-4 flex flex-col gap-1">
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px] uppercase font-black">Institutional Bait Detection</Badge>
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Resistance Zone • 18.83185</span>
                    </div>

                    {/* CHART VISUAL */}
                    <div className="relative h-40 flex items-end gap-1.5 pb-4">
                      {/* PRE-TRAP MOMENTUM */}
                      <div className="w-5 h-20 bg-green-500/20 border border-green-500/20 rounded-sm" />
                      <div className="w-5 h-24 bg-green-500/40 border border-green-500/30 rounded-sm" />
                      
                      {/* THE TRAP CANDLE (LIQUIDITY GRAB) */}
                      <div className="w-6 h-40 bg-green-500/80 border-2 border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.4)] rounded-sm relative group z-10">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-20 bg-white/70" />
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center">
                           <div className="bg-yellow-500 text-black text-[8px] font-black px-2 py-0.5 rounded animate-pulse shadow-xl">LIQUIDITY GRAB</div>
                           <div className="h-4 w-px bg-yellow-500" />
                        </div>
                        {/* LIQUIDITY PARTICLES ANIMATION */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-yellow-400/50 blur-[2px] animate-ping" />
                        </div>
                      </div>

                      {/* THE TRAP REVERSAL (INSTITUTIONAL SELL) */}
                      <div className="w-6 h-32 bg-red-600 border border-red-400 rounded-sm relative group animate-in fade-in slide-in-from-top-4 duration-1000 delay-500">
                         <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-black text-red-500 uppercase">Smart Money Sell</span>
                            <ArrowRightCircle className="h-4 w-4 text-red-500 rotate-90" />
                         </div>
                      </div>
                      
                      {/* RESISTANCE LEVEL */}
                      <div className="absolute top-[25%] left-0 w-full h-px bg-yellow-500/40 border-t border-dashed border-yellow-500/60 z-0">
                         <span className="absolute -right-12 top-[-6px] text-[8px] text-yellow-500/60 font-black">BAIT LEVEL</span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="p-2 bg-slate-950 rounded border border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Retail Sentiment</p>
                        <p className="text-[10px] text-green-400 font-bold italic">"Breakout! Buy now!"</p>
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Institutional Reality</p>
                        <p className="text-[10px] text-red-400 font-bold italic">"Generating Liquidity to Sell"</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-6 rounded-xl border border-white/5 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                      Volume-Price Exhaustion Guide
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-black/40 rounded-lg border border-white/5 space-y-2">
                        <p className="text-[10px] font-black text-red-500 uppercase flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3" />
                          Type A: Climax Exhaustion
                        </p>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Massive volume spike with a small candle body. Indicates institutions are absorbing all buy orders. <span className="text-white font-bold underline">Reversal Imminent.</span>
                        </p>
                      </div>
                      <div className="p-4 bg-black/40 rounded-lg border border-white/5 space-y-2">
                        <p className="text-[10px] font-black text-yellow-500 uppercase flex items-center gap-2">
                          <Activity className="h-3 w-3" />
                          Type B: No Demand Breakout
                        </p>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Price breaks level with <span className="text-white font-bold">Falling Volume</span>. There is no fuel behind the move. It will fall back into the range (The Trap).
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/60 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-4 tracking-widest text-center">Volume Profile Breakdown</p>
                      <div className="flex items-end justify-center gap-2 h-24">
                        <div className="w-4 h-[40%] bg-slate-700/30 rounded-t-sm" />
                        <div className="w-4 h-[60%] bg-slate-700/50 rounded-t-sm" />
                        <div className="w-4 h-[100%] bg-primary/80 rounded-t-sm animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-primary uppercase">Spike</div>
                        </div>
                        <div className="w-4 h-[20%] bg-red-500/80 rounded-t-sm">
                           <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-red-500 uppercase">Drop</div>
                        </div>
                      </div>
                      <p className="text-[9px] text-center text-slate-500 mt-4 italic">"Volume is the fuel. Price is the car."</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-6 rounded-xl border border-white/5 space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    The mechanical solution (THE RE-ENTRY)
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-primary uppercase">01. Wait for Closure</p>
                      <p className="text-[10px] text-slate-500">Never trade a candle until it finishes. A 1-minute breakout candle can become a rejection wick in the last 5 seconds.</p>
                    </div>
                    <div className="space-y-2 border-x border-white/5 px-6">
                      <p className="text-[10px] font-black text-primary uppercase">02. Confirm the Slope</p>
                      <p className="text-[10px] text-slate-500">Is the EMA 50 actually curving up? If it's horizontal, the 'breakout' is just a range expansion (No Trade).</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-primary uppercase">03. High-Confidence Entry</p>
                      <p className="text-[10px] text-slate-500">The safest entry is the <strong>First Pullback</strong> AFTER a successful, high-volume breakout and retest.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

        </div>
      </ScrollArea>
    </div>
  );
}
