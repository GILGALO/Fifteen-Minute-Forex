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

const Candle = ({ type, height, wickTop = 0, wickBottom = 0, label, highlight = false }: { 
  type: 'bull' | 'bear', 
  height: number, 
  wickTop?: number, 
  wickBottom?: number,
  label?: string,
  highlight?: boolean
}) => (
  <div className="flex flex-col items-center relative group">
    {label && (
      <span className="absolute -top-10 text-[8px] font-black text-slate-500 uppercase whitespace-nowrap bg-slate-900/80 px-1 rounded">
        {label}
      </span>
    )}
    <div className={`w-px bg-slate-500/50 absolute`} style={{ height: `${wickTop + height + wickBottom}px`, top: `-${wickTop}px` }} />
    <div 
      className={`w-4 sm:w-6 rounded-sm border transition-all duration-300 ${
        type === 'bull' 
          ? 'bg-emerald-500/80 border-emerald-400' 
          : 'bg-rose-500/80 border-rose-400'
      } ${highlight ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-110 z-10' : 'opacity-60'}`} 
      style={{ height: `${height}px` }} 
    />
  </div>
);

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
                    <CardTitle className="text-lg font-black uppercase italic text-white">When to BUY (Above EMA 50)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <ul className="text-xs text-slate-300 space-y-3">
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /><span>Price is ABOVE Magenta line (Trend is UP)</span></li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /><span>Wait for price to drop back to the line (The Dip)</span></li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /><span>Wait for a candle to bounce off the line with a <span className="text-white font-bold underline">Lower Wick</span></span></li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /><span>Enter 4-Min BUY when the bounce candle closes</span></li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/40 border-rose-500/20 backdrop-blur-md">
                <CardHeader className="bg-rose-500/10 border-b border-rose-500/20">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-rose-400" />
                    <CardTitle className="text-lg font-black uppercase italic text-white">When to SELL (Below EMA 50)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <ul className="text-xs text-slate-300 space-y-3">
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" /><span>Price is BELOW Magenta line (Trend is DOWN)</span></li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" /><span>Wait for price to rise back to the line (The Retest)</span></li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" /><span>Wait for a candle to hit the line and produce an <span className="text-white font-bold underline">Upper Wick</span></span></li>
                    <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" /><span>Enter 4-Min SELL when the rejection candle closes</span></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* SIMPLIFIED SELL EXAMPLE */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-rose-500 pl-4">
              <h2 className="text-2xl font-black text-white uppercase italic">Perfect SELL Example</h2>
            </div>
            
            <Card className="bg-slate-950 border-white/5 overflow-hidden">
              <div className="p-8 bg-black relative min-h-[400px] flex items-center justify-center">
                {/* EMA LINE */}
                <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                  <path d="M 0 120 C 150 130, 300 150, 600 200" fill="none" stroke="#d946ef" strokeWidth="4" />
                </svg>

                <div className="flex items-end gap-2 sm:gap-4 relative z-10">
                  {/* PRE-SEQUENCE */}
                  <Candle type="bear" height={60} label="Initial Drop" />
                  <Candle type="bear" height={40} />
                  
                  {/* PULLBACK */}
                  <Candle type="bull" height={20} label="Pullback Starts" />
                  <Candle type="bull" height={30} />
                  <Candle type="bull" height={45} label="Hitting EMA" />

                  {/* THE SIGNAL */}
                  <div className="relative">
                    <Candle type="bear" height={50} wickTop={40} highlight={true} label="THE SIGNAL" />
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2">
                      <Badge className="bg-rose-500 text-white font-black animate-bounce shadow-lg shadow-rose-500/50">SELL 4-MIN NOW</Badge>
                    </div>
                  </div>

                  {/* RESULT */}
                  <Candle type="bear" height={70} label="Profit Target" />
                  <Candle type="bear" height={50} />
                </div>

                <div className="absolute bottom-6 left-10 right-10 flex justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Logic: Price hit EMA → Long Upper Wick formed → Entry on Close</span>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* SIMPLIFIED BUY EXAMPLE */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
              <h2 className="text-2xl font-black text-white uppercase italic">Perfect BUY Example</h2>
            </div>
            
            <Card className="bg-slate-950 border-white/5 overflow-hidden">
              <div className="p-8 bg-black relative min-h-[400px] flex items-center justify-center">
                {/* EMA LINE */}
                <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                  <path d="M 0 280 C 150 260, 300 240, 600 180" fill="none" stroke="#d946ef" strokeWidth="4" />
                </svg>

                <div className="flex items-end gap-2 sm:gap-4 relative z-10">
                  {/* PRE-SEQUENCE */}
                  <Candle type="bull" height={50} label="Up Trend" />
                  <Candle type="bull" height={70} />
                  
                  {/* THE DIP */}
                  <Candle type="bear" height={30} label="The Dip" />
                  <Candle type="bear" height={40} />
                  <Candle type="bear" height={25} label="EMA Touch" />

                  {/* THE SIGNAL */}
                  <div className="relative">
                    <Candle type="bull" height={60} wickBottom={40} highlight={true} label="THE SIGNAL" />
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                      <Badge className="bg-emerald-500 text-white font-black animate-bounce shadow-lg shadow-emerald-500/50">BUY 4-MIN NOW</Badge>
                    </div>
                  </div>

                  {/* RESULT */}
                  <Candle type="bull" height={80} label="Profit Target" />
                  <Candle type="bull" height={60} />
                </div>

                <div className="absolute bottom-6 left-10 right-10 flex justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Logic: Price hit EMA → Long Lower Wick formed → Entry on Close</span>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* FINAL SUMMARY RULE */}
          <Card className="bg-primary/10 border-primary/30 p-6 rounded-xl flex items-center gap-6">
             <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 shrink-0">
                <Info className="h-6 w-6 text-primary" />
             </div>
             <div>
                <h3 className="text-lg font-black text-white uppercase italic leading-none mb-2">The Golden Rule</h3>
                <p className="text-xs text-slate-300 leading-relaxed uppercase tracking-tighter">
                   Always wait for the candle to <span className="text-white font-bold underline">COMPLETELY FINISH</span>. If the wick is touching the Magenta line and the color matches the trend, enter for exactly <span className="text-primary font-black underline">4 MINUTES</span>.
                </p>
             </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
