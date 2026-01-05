import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Target, 
  AlertCircle, 
  Info,
  Clock,
  Activity,
  Timer,
  ChevronRight,
  ChevronLeft
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
  <div className="flex flex-col items-center relative group min-w-[64px] sm:min-w-[80px]">
    {label && (
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <span className="text-[8px] sm:text-[10px] font-black text-white uppercase whitespace-nowrap bg-slate-950 border-2 border-white/40 px-3 py-1.5 rounded-md shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          {label}
        </span>
        <div className="w-[2px] h-8 bg-white/50 mx-auto" />
      </div>
    )}
    <div className="w-[3px] bg-white absolute opacity-80 z-0 shadow-[0_0_10px_rgba(255,255,255,0.3)]" style={{ height: `${wickTop + height + wickBottom}px`, top: `-${wickTop}px` }} />
    <div 
      className={`w-6 sm:w-8 rounded-sm border-2 transition-all duration-300 relative z-10 ${
        type === 'bull' 
          ? 'bg-emerald-500 border-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
          : 'bg-rose-500 border-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
      } ${highlight ? 'ring-2 ring-white shadow-[0_0_40px_rgba(255,255,255,0.8)] scale-110 z-20' : 'opacity-100'}`} 
      style={{ height: `${height}px` }} 
    />
  </div>
);

const StrategyChart = ({ title, type, candles, emaPath, signalIndex, trendlinePath }: { 
  title: string, 
  type: 'BUY' | 'SELL', 
  candles: CandleProps[], 
  emaPath: string,
  signalIndex: number,
  trendlinePath?: string
}) => (
  <Card className="bg-slate-950 border-white/5 overflow-hidden">
    <div className="p-4 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
      <h3 className="text-sm font-black text-white uppercase italic tracking-wider flex items-center gap-2">
        {type === 'BUY' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
        {title}
      </h3>
      <div className="flex gap-2">
        <Badge variant="outline" className="text-[8px] border-white/10">EMA 50 ACTIVE</Badge>
        <Badge variant="outline" className="text-[8px] border-white/10">MACD ALIGNED</Badge>
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
        {trendlinePath && (
          <path d={trendlinePath} fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="4 4" className="opacity-60" />
        )}
      </svg>

      <div className="flex items-end gap-1.5 sm:gap-2 relative z-20">
        {candles.map((candle, idx) => (
          <div key={idx} className="relative">
            <Candle {...candle} />
            {idx === signalIndex && (
              <div className="absolute inset-0 -m-2 border-4 border-white/40 rounded-xl animate-pulse pointer-events-none z-30" />
            )}
            {idx === signalIndex + 1 && (
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 flex flex-col items-center z-40">
                <div className="absolute inset-0 -m-4 border-4 border-yellow-400 rounded-full animate-ping opacity-20" />
                <div className="absolute inset-0 -m-4 border-4 border-yellow-400 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
                <Badge className={`${type === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'} text-white font-black animate-bounce shadow-xl whitespace-nowrap px-4 py-1 text-xs border-2 border-white/20 relative`}>
                  ENTER {type} HERE
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
            <div className={`w-3 h-3 rounded-full ${type === 'BUY' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'} animate-pulse`} />
            <p className="text-[11px] font-bold text-slate-200 uppercase tracking-tight leading-relaxed">
              <span className="text-yellow-400 font-black">ACTION:</span> {type === 'BUY' 
                ? "BULLISH TREND DETECTED: Price bounced off Magenta EMA line and broke the Yellow Trendline Resistance. Confirm MACD is Green, then ENTER BUY."
                : "BEARISH TREND DETECTED: Price rejected at Magenta EMA line and broke the Yellow Trendline Support. Confirm MACD is Red, then ENTER SELL."}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

export default function Strategies() {
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);

  const strategies = [
    {
      id: 1,
      title: "M1 → 5-Minute Binary Master",
      description: "EMA 50 Bounce with MACD Momentum & Trendline Breakout",
      difficulty: "Intermediate",
      expiry: "5 Minutes",
      timeframe: "M1"
    },
    {
      id: 2,
      title: "RSI & Bollinger Band Reversion",
      description: "Counter-trend scalp at extreme volatility levels",
      difficulty: "Simple",
      expiry: "2-3 Minutes",
      timeframe: "M1/M5"
    }
  ];

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

  const rsiSellCandles: CandleProps[] = [
    { type: 'bull', height: 80 },
    { type: 'bull', height: 90 },
    { type: 'bull', height: 100, label: "Overbought RSI > 70" },
    { type: 'bull', height: 70, wickTop: 30, label: "Upper BB Touch" },
    { type: 'bear', height: 50, highlight: true, label: "REVERSION START" },
    { type: 'bear', height: 70 },
    { type: 'bear', height: 80, label: "Target" },
  ];

  const rsiBuyCandles: CandleProps[] = [
    { type: 'bear', height: 80 },
    { type: 'bear', height: 90 },
    { type: 'bear', height: 100, label: "Oversold RSI < 30" },
    { type: 'bear', height: 70, wickBottom: 30, label: "Lower BB Touch" },
    { type: 'bull', height: 50, highlight: true, label: "REVERSION START" },
    { type: 'bull', height: 70 },
    { type: 'bull', height: 80, label: "Target" },
  ];

  if (selectedStrategy === null) {
    return (
      <div className="container mx-auto p-4 lg:p-6 max-w-6xl h-full flex flex-col gap-6 bg-[#020617]">
        <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_20px_rgba(217,70,239,0.1)]">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
              TRADING <span className="text-primary">STRATEGIES</span>
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Professional setups for binary options mastery</p>
        </div>

        <div className="grid gap-4">
          {strategies.map((strategy) => (
            <Card 
              key={strategy.id} 
              className="bg-slate-900/40 border-white/5 hover:border-primary/40 transition-all cursor-pointer group overflow-hidden"
              onClick={() => setSelectedStrategy(strategy.id)}
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-all shadow-inner">
                    {strategy.id === 1 ? <Zap className="w-6 h-6 text-primary" /> : <Activity className="w-6 h-6 text-amber-400" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight group-hover:text-primary transition-colors">
                      {strategy.id}. {strategy.title}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">{strategy.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-[10px] border-white/10 uppercase tracking-widest">{strategy.difficulty}</Badge>
                    <div className="flex gap-2 items-center text-[10px] text-slate-500 uppercase font-black">
                      <Timer className="w-3 h-3" /> {strategy.expiry}
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <Clock className="w-3 h-3" /> {strategy.timeframe}
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-6xl h-full flex flex-col gap-6 bg-[#020617]">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-fit text-slate-500 hover:text-white gap-2 uppercase text-[10px] font-black tracking-widest"
          onClick={() => setSelectedStrategy(null)}
        >
          <ChevronLeft className="w-4 h-4" /> Back to Strategies
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_20px_rgba(217,70,239,0.1)]">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
            {selectedStrategy === 1 ? (
              <>M1 → <span className="text-primary">5-MINUTE</span> BINARY MASTER</>
            ) : (
              <><span className="text-amber-400">RSI & BB</span> REVERSION SCALP</>
            )}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[10px] tracking-widest px-3">
            {strategies.find(s => s.id === selectedStrategy)?.difficulty} Setup
          </Badge>
          <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
            <Timer className="w-3 h-3" />
            <span>{strategies.find(s => s.id === selectedStrategy)?.expiry} EXPIRY</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <Clock className="w-3 h-3" />
            <span>{strategies.find(s => s.id === selectedStrategy)?.timeframe} TIMEFRAME</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        {selectedStrategy === 1 ? (
          <div className="flex flex-col gap-12 pb-12">
            <section className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/40 border-emerald-500/20 backdrop-blur-xl relative overflow-hidden group">
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
                      "CRITICAL: Must show a visible LOWER WICK rejection (Price Rejection).",
                      "MACD MOMENTUM: MACD Histogram must be GREEN (Bullish Momentum) on M1.",
                      "TRENDLINE CHECK: Price must be breaking ABOVE any local resistance trendlines.",
                      "NEW: Check M5 Trend Alignment - Ensure M5 EMA 50 & M5 MACD are also Bullish for a safer 5-min ride.",
                      "ENTRY: Buy for 5 Minutes ON THE OPEN of the very next candle."
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
                      "CRITICAL: Must show a visible UPPER WICK rejection (Price Rejection).",
                      "MACD MOMENTUM: MACD Histogram must be RED (Bearish Momentum) on M1.",
                      "TRENDLINE CHECK: Price must be breaking BELOW any local support trendlines.",
                      "NEW: Check M5 Trend Alignment - Ensure M5 EMA 50 & M5 MACD are also Bearish for a safer 5-min ride.",
                      "ENTRY: Sell for 5 Minutes ON THE OPEN of the very next candle."
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
                  trendlinePath="M 300 180 L 600 240"
                  signalIndex={6}
                />

                <StrategyChart 
                  title="Master BUY Setup (Bullish Dominance)"
                  type="BUY"
                  candles={buyCandles}
                  emaPath="M 0 380 C 150 350, 300 280, 600 220, 900 180"
                  trendlinePath="M 300 260 L 600 200"
                  signalIndex={6}
                />
              </div>
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-12 pb-12">
            <section className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/40 border-emerald-500/20 backdrop-blur-xl relative overflow-hidden group">
                <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 p-6">
                  <CardTitle className="text-xl font-black uppercase italic text-white">RSI Oversold (CALL Entry)</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {[
                    "Wait for price to touch or pierce the LOWER Bollinger Band.",
                    "Check RSI (14) - It must be BELOW 30 (Oversold).",
                    "Wait for the FIRST Bullish reversal candle to close.",
                    "ENTRY: 2-3 Minute CALL on the next candle open."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-black text-emerald-400 shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">{text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-slate-900/40 border-rose-500/20 backdrop-blur-xl relative overflow-hidden group">
                <CardHeader className="bg-rose-500/10 border-b border-rose-500/20 p-6">
                  <CardTitle className="text-xl font-black uppercase italic text-white">RSI Overbought (PUT Entry)</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {[
                    "Wait for price to touch or pierce the UPPER Bollinger Band.",
                    "Check RSI (14) - It must be ABOVE 70 (Overbought).",
                    "Wait for the FIRST Bearish reversal candle to close.",
                    "ENTRY: 2-3 Minute PUT on the next candle open."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-[10px] font-black text-rose-400 shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">{text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section className="space-y-8">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Bollinger Band Visuals</h2>
              <div className="grid gap-12">
                <StrategyChart 
                  title="Overbought Reversion (SELL)"
                  type="SELL"
                  candles={rsiSellCandles}
                  emaPath="M 0 250 L 900 250"
                  signalIndex={4}
                />
                <StrategyChart 
                  title="Oversold Reversion (BUY)"
                  type="BUY"
                  candles={rsiBuyCandles}
                  emaPath="M 0 250 L 900 250"
                  signalIndex={4}
                />
              </div>
            </section>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
