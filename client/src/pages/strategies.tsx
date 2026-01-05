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

interface CandleProps {
  type: 'bull' | 'bear';
  height: number;
  wickTop?: number;
  wickBottom?: number;
  label?: string;
  highlight?: boolean;
}

const Candle = ({ type, height, wickTop = 0, wickBottom = 0, label, highlight = false }: CandleProps) => (
  <div className="flex flex-col items-center relative group min-w-[24px]">
    {label && (
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
        <span className="text-[9px] font-black text-white uppercase whitespace-nowrap bg-slate-900 border border-white/10 px-2 py-0.5 rounded shadow-lg">
          {label}
        </span>
        <div className="w-px h-2 bg-white/20 mx-auto" />
      </div>
    )}
    <div className="w-px bg-slate-500/30 absolute" style={{ height: `${wickTop + height + wickBottom}px`, top: `-${wickTop}px` }} />
    <div 
      className={`w-4 sm:w-6 rounded-sm border-2 transition-all duration-300 ${
        type === 'bull' 
          ? 'bg-emerald-500/90 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
          : 'bg-rose-500/90 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
      } ${highlight ? 'ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-110 z-10' : 'opacity-80'}`} 
      style={{ height: `${height}px` }} 
    />
  </div>
);

const StrategyChart = ({ title, type, candles, emaPath, signalIndex }: { 
  title: string, 
  type: 'BUY' | 'SELL', 
  candles: CandleProps[], 
  emaPath: string,
  signalIndex: number 
}) => (
  <Card className="bg-slate-950 border-white/5 overflow-hidden">
    <div className="p-4 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
      <h3 className="text-sm font-black text-white uppercase italic tracking-wider flex items-center gap-2">
        {type === 'BUY' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
        {title}
      </h3>
      <div className="flex gap-2">
        <Badge variant="outline" className="text-[8px] border-white/10">EMA 50 ACTIVE</Badge>
        <Badge variant="outline" className="text-[8px] border-white/10">M1 TIMEFRAME</Badge>
      </div>
    </div>
    <div className="p-8 bg-[#0a0a0f] relative min-h-[450px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-12 opacity-5 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => <div key={i} className="border-r border-white" />)}
      </div>
      <div className="absolute inset-0 grid grid-rows-8 opacity-5 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="border-b border-white" />)}
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d={emaPath} fill="none" stroke="#d946ef" strokeWidth="3" filter="url(#glow)" className="opacity-80" />
      </svg>

      <div className="flex items-end gap-1.5 sm:gap-2 relative z-20">
        {candles.map((candle, idx) => (
          <div key={idx} className="relative">
            <Candle {...candle} />
            {idx === signalIndex && (
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <Badge className={`${type === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'} text-white font-black animate-bounce shadow-xl whitespace-nowrap px-4 py-1 text-xs border-2 border-white/20`}>
                  {type} 4-MIN NOW
                </Badge>
                <div className={`w-0.5 h-8 ${type === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${type === 'BUY' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'} animate-pulse`} />
            <p className="text-[11px] font-bold text-slate-200 uppercase tracking-tight leading-relaxed">
              {type === 'BUY' 
                ? "BULLISH TREND DETECTED: Price bounced off Magenta EMA line with a clear Lower Wick rejection. Momentum confirmed."
                : "BEARISH TREND DETECTED: Price rejected at Magenta EMA line with a clear Upper Wick. Downward pressure confirmed."}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

export default function Strategies() {
  const sellCandles: CandleProps[] = [
    { type: 'bear', height: 80, label: "Strong Trend" },
    { type: 'bear', height: 60 },
    { type: 'bear', height: 40 },
    { type: 'bull', height: 25, label: "Correction" },
    { type: 'bull', height: 35 },
    { type: 'bull', height: 50, wickTop: 10, label: "Approaching EMA" },
    { type: 'bear', height: 45, wickTop: 55, highlight: true, label: "EMA REJECTION" },
    { type: 'bear', height: 75, label: "Confirm Move" },
    { type: 'bear', height: 90 },
    { type: 'bear', height: 65, label: "Target 1" },
    { type: 'bear', height: 40 },
    { type: 'bear', height: 85, label: "Target 2" },
  ];

  const buyCandles: CandleProps[] = [
    { type: 'bull', height: 70, label: "Upward Push" },
    { type: 'bull', height: 90 },
    { type: 'bull', height: 60 },
    { type: 'bear', height: 30, label: "Profit Taking" },
    { type: 'bear', height: 45 },
    { type: 'bear', height: 35, wickBottom: 15, label: "Testing EMA" },
    { type: 'bull', height: 55, wickBottom: 60, highlight: true, label: "BOUNCE OFF EMA" },
    { type: 'bull', height: 80, label: "Trend Resumes" },
    { type: 'bull', height: 100 },
    { type: 'bull', height: 75, label: "Target 1" },
    { type: 'bull', height: 95 },
    { type: 'bull', height: 110, label: "Target 2" },
  ];

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-6xl h-full flex flex-col gap-6 bg-[#020617]">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_20px_rgba(217,70,239,0.1)]">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
            M1 → <span className="text-primary">4-MINUTE</span> BINARY MASTER
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-colors uppercase text-[10px] tracking-widest px-3">Master Strategy</Badge>
          <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
            <Timer className="w-3 h-3" />
            <span>4 MIN EXPIRY</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <Clock className="w-3 h-3" />
            <span>M1 TIMEFRAME</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="flex flex-col gap-12 pb-12">
          
          <section className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/40 border-emerald-500/20 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp className="w-24 h-24 text-emerald-500" />
              </div>
              <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  </div>
                  <CardTitle className="text-xl font-black uppercase italic text-white tracking-tight">The Bullish Entry (BUY)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  {[
                    "Price must be ABOVE the Magenta EMA 50 line.",
                    "Wait for a pullback (The Dip) down to the Magenta line.",
                    "Look for a Bullish Candle to touch or bounce off the line.",
                    "CRITICAL: Must show a visible LOWER WICK rejection.",
                    "ENTRY: Call/Buy for 4 Minutes on candle close."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 items-start group/item">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-black text-emerald-400 shrink-0 mt-0.5 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-rose-500/20 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingDown className="w-24 h-24 text-rose-500" />
              </div>
              <CardHeader className="bg-rose-500/10 border-b border-rose-500/20 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/30">
                    <TrendingDown className="h-6 w-6 text-rose-400" />
                  </div>
                  <CardTitle className="text-xl font-black uppercase italic text-white tracking-tight">The Bearish Entry (SELL)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  {[
                    "Price must be BELOW the Magenta EMA 50 line.",
                    "Wait for a rally (The Retest) up to the Magenta line.",
                    "Look for a Bearish Candle to touch or hit the line.",
                    "CRITICAL: Must show a visible UPPER WICK rejection.",
                    "ENTRY: Put/Sell for 4 Minutes on candle close."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 items-start group/item">
                      <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-[10px] font-black text-rose-400 shrink-0 mt-0.5 group-hover/item:bg-rose-500 group-hover/item:text-white transition-all">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Visual Breakdown: The Signal</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Mastering the wick rejection at the EMA 50</p>
            </div>
            
            <div className="grid gap-12">
              <StrategyChart 
                title="Master SELL Setup (Bearish Dominance)"
                type="SELL"
                candles={sellCandles}
                emaPath="M 0 50 C 150 70, 300 120, 600 180, 900 220"
                signalIndex={6}
              />

              <StrategyChart 
                title="Master BUY Setup (Bullish Dominance)"
                type="BUY"
                candles={buyCandles}
                emaPath="M 0 380 C 150 350, 300 280, 600 220, 900 180"
                signalIndex={6}
              />
            </div>
          </section>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-primary/5 border-primary/20 p-6 rounded-2xl border-2 flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40 shadow-lg">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase italic mb-2 tracking-tight">Wait For Close</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  NEVER enter before the candle finishes. The wick must be confirmed on the close of the 1-minute candle.
                </p>
              </div>
            </Card>

            <Card className="bg-emerald-500/5 border-emerald-500/20 p-6 rounded-2xl border-2 flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 shadow-lg">
                <Target className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase italic mb-2 tracking-tight">4-Min Expiry</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  The strategy is optimized for 4 minutes. This allows enough time for the market to move away from the EMA line.
                </p>
              </div>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/20 p-6 rounded-2xl border-2 flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40 shadow-lg">
                <AlertCircle className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase italic mb-2 tracking-tight">Risk Note</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  If price crosses and closes on the opposite side of the EMA, the trend has changed. Do not enter.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}


