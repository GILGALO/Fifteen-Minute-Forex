import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FOREX_PAIRS, TIMEFRAMES, type Signal, getCurrentSession } from "@/lib/constants";
import { Loader2, Zap, Clock, Send, Activity, TrendingUp, TrendingDown, Target, Globe, Sparkles, Shield, RefreshCw, Settings, Download, Share2 } from "lucide-react";
import { format, addMinutes } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface SignalGeneratorProps {
  onSignalGenerated: (signal: Signal) => void;
  onPairChange: (pair: string) => void;
}

interface TechnicalAnalysis {
  rsi: number;
  macd: { macdLine: number; signalLine: number; histogram: number };
  sma20: number;
  sma50: number;
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  momentum: "STRONG" | "MODERATE" | "WEAK";
}

interface SignalAnalysisResponse {
  pair: string;
  currentPrice: number;
  signalType: "CALL" | "PUT";
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  technicals: TechnicalAnalysis;
  reasoning: string[];
}

export default function SignalGenerator({ onSignalGenerated, onPairChange }: SignalGeneratorProps) {
  const [currentSession, setCurrentSession] = useState(getCurrentSession());
  const [availablePairs, setAvailablePairs] = useState<string[]>(currentSession.pairs);
  const [selectedPair, setSelectedPair] = useState<string>(currentSession.pairs[0]);
  const [timeframe, setTimeframe] = useState<string>("M5");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastSignal, setLastSignal] = useState<Signal | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<SignalAnalysisResponse | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const [scanMode, setScanMode] = useState(true);
  const [manualMode, setManualMode] = useState(true);
  const [nextSignalTime, setNextSignalTime] = useState<number | null>(null);
  const [telegramConfigured, setTelegramConfigured] = useState(false);
  const { toast } = useToast();

  const MIN_CONFIDENCE_THRESHOLD = 50; // Minimum required confidence percentage
  const MAX_RESCAN_ATTEMPTS = 3; // Maximum number of rescans allowed

  useEffect(() => {
    fetch('/api/telegram/status')
      .then(res => res.json())
      .then(data => setTelegramConfigured(data.configured))
      .catch(() => setTelegramConfigured(false));
  }, []);

  useEffect(() => {
    const updateSession = () => {
      const session = getCurrentSession();
      setCurrentSession(session);
      setAvailablePairs(session.pairs);

      if (!session.pairs.includes(selectedPair)) {
        setSelectedPair(session.pairs[0]);
        onPairChange(session.pairs[0]);
      }
    };

    updateSession();
    const interval = setInterval(updateSession, 300000);
    return () => clearInterval(interval);
  }, [selectedPair, onPairChange]);

  const sendToTelegram = async (signal: Signal, analysis?: SignalAnalysisResponse) => {
    try {
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal, analysis, isAuto: autoMode }),
      });
      const result = await response.json();
      if (result.success) {
        toast({ title: "Telegram", description: "Signal sent successfully" });
      } else {
        toast({ title: "Telegram Error", description: result.message || "Failed to send signal", variant: "destructive" });
      }
    } catch (error) {
      console.error('Telegram send error', error);
      toast({ title: "Telegram Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const [scanStatus, setScanStatus] = useState<string>("Initializing...");
  const [scanAttempts, setScanAttempts] = useState(0);

  const generateSignal = async (isAuto = false) => {
    setIsAnalyzing(true);
    setLastSignal(null);
    setLastAnalysis(null);
    setScanAttempts(0);
    setScanStatus("Scanning markets...");

    try {
      let analysisResult: SignalAnalysisResponse | undefined;
      let currentPair = selectedPair;
      let localScanAttempts = 0;
      let foundGoodSignal = false;

      const shouldScan = isAuto ? scanMode : !manualMode;

      while (localScanAttempts < MAX_RESCAN_ATTEMPTS && !foundGoodSignal) {
        localScanAttempts++;
        setScanAttempts(localScanAttempts);
        setScanStatus(`Scanning Round ${localScanAttempts}/${MAX_RESCAN_ATTEMPTS}...`);
        console.log(`Scan attempt: ${localScanAttempts}`);

        if (shouldScan) {
          const scanResponse = await fetch('/api/forex/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeframe }),
          });
          if (!scanResponse.ok) throw new Error('Scan failed');
          const scanData = await scanResponse.json();
          
          // Check if we got any valid signals
          if (!scanData.bestSignal || scanData.bestSignal.confidence === 0) {
            setScanStatus(`Round ${localScanAttempts} Complete: No signal found`);
            console.log(`Rescan ${localScanAttempts}/${MAX_RESCAN_ATTEMPTS}: No valid signals found`);
            
            if (localScanAttempts >= MAX_RESCAN_ATTEMPTS) {
              setScanStatus("Scan finished: No high-probability setups");
              console.log('Max rescans reached, scheduling next attempt');
              // Keep timer running
              if (isAuto) {
                const nextScan = Date.now() + (7 * 60 * 1000);
                setNextSignalTime(nextScan);
              }
              setIsAnalyzing(false);
              return; // Exit gracefully
            }
            
            // Wait before next rescan
            setScanStatus(`Rescanning markets (${localScanAttempts + 1}/${MAX_RESCAN_ATTEMPTS})...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          
          analysisResult = scanData.bestSignal as SignalAnalysisResponse;
          currentPair = analysisResult.pair;
          setSelectedPair(currentPair);
          onPairChange(currentPair);
        } else {
          setScanStatus(`Analyzing ${currentPair}...`);
          const response = await fetch('/api/forex/signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pair: currentPair, timeframe }),
          });
          if (!response.ok) throw new Error('Signal generation failed');
          analysisResult = await response.json();
        }

        if (analysisResult) {
          setLastAnalysis(analysisResult);
        }

        if (analysisResult && analysisResult.confidence >= MIN_CONFIDENCE_THRESHOLD) {
          foundGoodSignal = true;
          setScanStatus("Signal Verified!");
        } else {
          setScanStatus(`Low confidence (${analysisResult?.confidence || 0}%), retrying...`);
          console.log(`Low confidence (${analysisResult?.confidence || 0}%), rescanning...`);
          if (localScanAttempts >= MAX_RESCAN_ATTEMPTS) {
            setScanStatus("Scan finished: No high-probability setups");
            // Keep timer running instead of exiting
            if (isAuto) {
              const nextScan = Date.now() + (7 * 60 * 1000);
              setNextSignalTime(nextScan);
            }
            break; // Exit rescan loop but continue execution
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!foundGoodSignal || !analysisResult) {
        console.log("No valid signal found after all rescan attempts");
        
        // Keep timer running in auto mode
        if (isAuto) {
          const nextScan = Date.now() + (7 * 60 * 1000);
          setNextSignalTime(nextScan);
        }
        
        setIsAnalyzing(false);
        return; // Exit signal generation loop only
      }

      const KENYA_OFFSET_MS = 3 * 60 * 60 * 1000;
      const nowUTC = new Date();
      const nowKenya = new Date(nowUTC.getTime() + KENYA_OFFSET_MS);

      let intervalMinutes = 5;
      if (timeframe.startsWith('M')) intervalMinutes = parseInt(timeframe.substring(1));
      else if (timeframe.startsWith('H')) intervalMinutes = parseInt(timeframe.substring(1)) * 60;

      // Calculate the next proper candle start time aligned to 5-minute intervals (00, 05, 10, ...)
      const currentMinutes = nowKenya.getMinutes();
      const currentSeconds = nowKenya.getSeconds();
      
      // Fixed 5-minute interval
      const candleInterval = 5;
      
      // Calculate minutes to the start of the next 5-minute candle
      // If we are at 22:02, minutesSinceLast = 2, minutesToNext = 3 (Next is 22:05)
      // If we are at 22:04:45, we should probably wait for the one after (22:10) to give the user time
      const minutesSinceLastCandle = currentMinutes % candleInterval;
      let minutesToNextCandle = candleInterval - minutesSinceLastCandle;
      
      // Buffer: If less than 90 seconds to the next candle, skip to the one after
      // This ensures the user has time to see the signal and prepare
      if (minutesToNextCandle < 1 || (minutesToNextCandle === 1 && currentSeconds > 30)) {
        minutesToNextCandle += candleInterval;
      }

      const startTimeDate = addMinutes(nowKenya, minutesToNextCandle);
      startTimeDate.setSeconds(0, 0);
      
      // End time is exactly 5 minutes after start time
      const endTimeDate = addMinutes(startTimeDate, candleInterval);
      endTimeDate.setSeconds(0, 0);
      
      const kenyaTime = new Date(startTimeDate.getTime());
    const dayName = format(kenyaTime, "eee");

    const signal: Signal = {
      id: Math.random().toString(36).substring(7),
      pair: analysisResult.pair,
      timeframe,
      type: analysisResult.signalType,
      entry: analysisResult.entry,
      stopLoss: analysisResult.stopLoss,
      takeProfit: analysisResult.takeProfit,
      confidence: analysisResult.confidence,
      timestamp: Date.now(),
      startTime: format(startTimeDate, "HH:mm"),
      endTime: format(endTimeDate, "HH:mm"),
      dayName: dayName,
      status: "active"
    };

      setLastSignal(signal);
      onSignalGenerated(signal);

      if (signal.confidence >= MIN_CONFIDENCE_THRESHOLD) {
        sendToTelegram(signal, analysisResult);
      } else {
        console.log("Skipping Telegram for low confidence signal.");
      }

      if (isAuto) {
        // Set next scan to 7 minutes from now
        const nextScan = Date.now() + (7 * 60 * 1000);
        setNextSignalTime(nextScan);
      }
    } catch (error) {
      // Safely log error without causing additional crashes
      if (error instanceof Error) {
        console.error('Signal generation error:', error.message);
      } else {
        console.error('Signal generation error: Unknown error type');
      }
      
      // Keep timer running even on error
      if (isAuto) {
        const nextScan = Date.now() + (7 * 60 * 1000);
        setNextSignalTime(nextScan);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (autoMode) {
      if (!nextSignalTime) {
        generateSignal(true);
      }
      const checkInterval = setInterval(() => {
        if (nextSignalTime && Date.now() >= nextSignalTime && !isAnalyzing) {
          generateSignal(true);
        }
      }, 5000);
      return () => clearInterval(checkInterval);
    } else {
      setNextSignalTime(null);
    }
  }, [autoMode, nextSignalTime, isAnalyzing]);

  const handlePairChange = (val: string) => {
    setSelectedPair(val);
    onPairChange(val);
  };

  const Countdown = () => {
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
      if (!nextSignalTime) {
        setTimeLeft("");
        return;
      }
      const updateTime = () => {
        const diff = Math.max(0, nextSignalTime - Date.now());
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
      };
      updateTime(); // Initial update
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }, [nextSignalTime]);
    if (!nextSignalTime || !timeLeft) return null;
    return <span className="font-mono text-sm text-primary font-bold">{timeLeft}</span>;
  };

  return (
    <div className="space-y-6">
      <Card className="premium-card overflow-hidden relative group border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <CardContent className="p-6 md:p-8 space-y-8 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl animate-pulse" />
              <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl relative">
                <Zap className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Signal Engine</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Neural Network Analysis v11</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="glass-panel p-5 rounded-[1.5rem] border border-emerald-500/20 shadow-xl relative overflow-hidden group/item"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${autoMode ? "bg-emerald-500/20 border-2 border-emerald-500/50" : "bg-white/5"} border transition-all duration-500`}>
                    <Activity className={`w-6 h-6 ${autoMode ? "text-emerald-400" : "text-slate-500"}`} />
                  </div>
                  <div>
                    <Label htmlFor="auto-mode" className="text-sm font-black cursor-pointer flex items-center gap-2 uppercase tracking-wider text-slate-200">
                      Auto-Pilot
                      {autoMode && <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />}
                    </Label>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Continuous scan mode</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {autoMode && <Countdown />}
                  <Switch id="auto-mode" checked={autoMode} onCheckedChange={setAutoMode} className="data-[state=checked]:bg-emerald-500" />
                </div>
              </div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {autoMode && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="glass-panel px-6 py-4 rounded-[1.25rem] border border-emerald-500/30 flex items-center justify-between bg-emerald-500/5 group/scan"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <Label htmlFor="scan-mode" className="text-[11px] text-emerald-400 cursor-pointer font-black uppercase tracking-widest flex items-center gap-2">
                    Global Asset Scanner
                  </Label>
                </div>
                <Switch id="scan-mode" checked={scanMode} onCheckedChange={setScanMode} className="scale-90 data-[state=checked]:bg-emerald-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {!autoMode && (
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="glass-panel p-5 rounded-[1.5rem] border border-white/10 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${!manualMode ? "bg-emerald-500/20 border-2 border-emerald-500/50" : "bg-white/5"} border transition-all duration-500`}>
                    <Target className={`w-6 h-6 ${!manualMode ? "text-emerald-400" : "text-slate-500"}`} />
                  </div>
                  <div>
                    <Label htmlFor="signal-mode" className="text-sm font-black text-slate-200 uppercase tracking-wider">Analysis Bias</Label>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{manualMode ? "Target: Locked" : "Target: dynamic"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg transition-colors ${manualMode ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500"}`}>Manual</span>
                  <Switch id="signal-mode" checked={!manualMode} onCheckedChange={(checked) => setManualMode(!checked)} className="data-[state=checked]:bg-emerald-500" />
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg transition-colors ${!manualMode ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500"}`}>Best</span>
                </div>
              </div>
            </motion.div>
          )}

          <div className="glass-panel p-4 rounded-[1.25rem] border border-emerald-500/30 flex items-center justify-between shadow-xl bg-gradient-to-r from-emerald-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Globe className="w-4 h-4 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em]">{currentSession.name} MARKET ACTIVE</span>
            </div>
            <div className="text-[10px] text-slate-300 font-black uppercase tracking-widest bg-emerald-500/20 px-4 py-1.5 rounded-full border border-emerald-500/30">
              {availablePairs.length} ASSETS ONLINE
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                Select Asset
              </label>
              <Select value={selectedPair} onValueChange={handlePairChange} disabled={!autoMode && !manualMode}>
                <SelectTrigger className="h-14 glass-panel border-white/10 font-mono text-sm font-black tracking-wider hover:border-emerald-500/40 transition-all rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-panel border-emerald-500/30 rounded-2xl">
                  {availablePairs.map(pair => (
                    <SelectItem key={pair} value={pair} className="font-mono font-black py-3 focus:bg-emerald-500/20 focus:text-emerald-400">{pair}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Interval
              </label>
              <div className="h-14 glass-panel border border-emerald-500/40 rounded-2xl flex items-center justify-center shadow-xl bg-gradient-to-br from-emerald-500/10 to-transparent">
                <span className="font-mono text-sm font-black text-emerald-400 tracking-[0.2em] drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">M15 PREMIUM</span>
              </div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full h-16 font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.3)] relative overflow-hidden group rounded-[1.5rem] text-sm uppercase tracking-[0.2em]"
              onClick={() => generateSignal(false)}
              disabled={isAnalyzing || autoMode}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isAnalyzing ? (
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <span className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    ANALYZING...
                  </span>
                  <span className="text-[9px] font-bold text-slate-950/70 tracking-tighter">
                    {scanStatus}
                  </span>
                </div>
              ) : autoMode ? (
                <span className="flex items-center gap-3 relative z-10">
                  <Zap className="w-6 h-6 fill-slate-950" />
                  PILOT ENGAGED
                </span>
              ) : (
                <span className="flex items-center gap-3 relative z-10">
                  <Sparkles className="w-6 h-6" />
                  EXECUTE ANALYSIS
                </span>
              )}
            </Button>
          </motion.div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                className="w-full glass-panel border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400 hover:text-cyan-300 h-10"
                disabled={isAnalyzing || autoMode}
                onClick={() => generateSignal(false)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Quick Rescan
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                className="w-full glass-panel border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 hover:text-emerald-300 h-10"
                disabled={!lastSignal}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Signal
              </Button>
            </motion.div>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span className="font-medium">Live Market Analysis</span>
            {telegramConfigured && (
              <>
                <span className="text-border">•</span>
                <Send className="w-3 h-3 text-primary" />
                <span className="font-medium">Telegram Connected</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SignalCard({ lastSignal, lastAnalysis, telegramConfigured, MIN_CONFIDENCE_THRESHOLD }: { lastSignal: Signal, lastAnalysis: any, telegramConfigured: boolean, MIN_CONFIDENCE_THRESHOLD: number }) {
    const { toast } = useToast();
    const copyToClipboard = () => {
      const text = `NEW SIGNAL 🤖
━━━━━━━━━━━━━━━━━━━━━

📊 PAIR: ${lastSignal?.pair}
${lastSignal?.type === "CALL" ? "🟢" : "🔴"} DIRECTION: ${lastSignal?.type === "CALL" ? "BUY/CALL 📈" : "SELL/PUT 📉"}
⏱ TIMEFRAME: ${lastSignal?.timeframe}✅

🕐 START TIME: ${lastSignal?.startTime} EAT (${lastSignal?.dayName || "Today"})
🏁 EXPIRY TIME: ${lastSignal?.endTime} EAT`;

      navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Signal text copied to clipboard",
      });
    };

    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
    useEffect(() => {
      if (!lastSignal || lastSignal.status !== 'active') return;
      
      const updateTimer = () => {
        const [hours, minutes] = lastSignal.endTime.split(':').map(Number);
        const now = new Date();
        const KENYA_OFFSET_MS = 3 * 60 * 60 * 1000;
        const nowKenya = new Date(now.getTime() + KENYA_OFFSET_MS);
        
        const expiryDate = new Date(nowKenya);
        expiryDate.setHours(hours, minutes, 0, 0);
        
        const diff = Math.floor((expiryDate.getTime() - nowKenya.getTime()) / 1000);
        setSecondsLeft(diff > 0 ? diff : 0);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }, [lastSignal]);

    return (
      <AnimatePresence mode="wait">
        {lastSignal && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            <Card className={`border-2 overflow-hidden shadow-2xl relative ${lastSignal.type === "CALL" ? "border-emerald-500/60 bg-gradient-to-br from-emerald-950/30 to-emerald-900/10" : "border-rose-500/60 bg-gradient-to-br from-rose-950/30 to-rose-900/10"}`}>
              {lastSignal.confidence >= 85 && (
                <div className="absolute top-4 right-4 z-20">
                  <div className="bg-yellow-500 text-black font-black animate-pulse border-none shadow-lg px-3 py-1 text-[10px] uppercase tracking-tighter rounded-md flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    High Probability 🔥
                  </div>
                </div>
              )}
              <div className={`absolute top-0 left-0 w-full h-1 ${lastSignal.type === "CALL" ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-rose-500 to-rose-600"}`} />
              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`p-3 rounded-2xl shadow-lg ${lastSignal.type === "CALL" ? "bg-emerald-500/20 border-2 border-emerald-500/40" : "bg-rose-500/20 border-2 border-rose-500/40"}`}
                    >
                      {lastSignal.type === "CALL" ? (
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-rose-500" />
                      )}
                    </motion.div>
                    <div>
                      <div className={`text-3xl font-black ${lastSignal.type === "CALL" ? "text-emerald-500 neon-text" : "text-rose-500 neon-text"}`}>
                        {lastSignal.type}
                      </div>
                      <div className="text-sm font-mono text-muted-foreground font-semibold">{lastSignal.pair}</div>
                    </div>
                  </div>
                  <div className="text-right glass-panel px-4 py-2 rounded-xl border border-primary/30">
                    <div className="text-3xl font-black text-primary neon-text">{lastSignal.confidence}%</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                      Confidence {lastSignal.confidence >= MIN_CONFIDENCE_THRESHOLD ? "✓" : ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 text-xs font-mono text-muted-foreground glass-panel p-3 rounded-xl">
                  <Clock className="w-3 h-3 text-primary" />
                  <span className="font-semibold">{lastSignal.startTime} - {lastSignal.endTime}</span>
                  {secondsLeft !== null && secondsLeft > 0 && (
                    <>
                      <span className="text-border">|</span>
                      <span className="text-primary font-bold animate-pulse">
                        Expires in: {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
                      </span>
                    </>
                  )}
                  <span className="text-border">|</span>
                  <span className="font-semibold">{lastSignal.timeframe}</span>
                  <span className="text-border">|</span>
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">FIXED STAKE</span>
                  {telegramConfigured && (
                    <>
                      <span className="text-border">|</span>
                      <Send className="w-3 h-3 text-emerald-500" />
                    </>
                  )}
                </div>

                {/* Telegram Mini Style */}
                <div className="glass-panel p-4 rounded-xl border border-primary/20 bg-background/40 font-mono text-sm space-y-1 mb-5 relative group/mini">
                  <div className="text-foreground/90 font-bold">📊 PAIR: {lastSignal.pair}</div>
                  <div className="flex items-center gap-1 text-foreground/90 font-bold">
                    {lastSignal.type === "CALL" ? "🟢" : "🔴"} DIRECTION: {lastSignal.type === "CALL" ? "BUY/CALL 📈" : "SELL/PUT 📉"}
                  </div>
                  <div className="text-foreground/90 font-bold">⏱ TIMEFRAME: {lastSignal.timeframe}✅</div>
                  <div className="mt-2 text-foreground/90 font-bold">🕐 START TIME: {lastSignal.startTime} EAT ({lastSignal.dayName || "Today"})</div>
                  <div className="text-foreground/90 font-bold">🏁 EXPIRY TIME: {lastSignal.endTime} EAT</div>

                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="absolute bottom-2 right-2 h-7 text-[10px] gap-1 opacity-0 group-hover/mini:opacity-100 transition-opacity"
                    onClick={copyToClipboard}
                  >
                    <Download className="w-3 h-3" />
                    Copy Text
                  </Button>
                </div>

                {lastAnalysis && (
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="grid grid-cols-3 gap-3 col-span-2 mb-2 p-4 glass-panel rounded-xl text-center border border-primary/20">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">RSI</div>
                        <div className={`font-mono font-black text-base ${lastAnalysis.technicals.rsi < 30 ? "text-emerald-400" : lastAnalysis.technicals.rsi > 70 ? "text-rose-400" : "text-foreground"}`}>
                          {lastAnalysis.technicals.rsi.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">SMA 20/50</div>
                        <div className="font-bold text-xs text-primary flex flex-col">
                          <span>{lastAnalysis.technicals.sma20.toFixed(5)}</span>
                          <span className="opacity-50">{lastAnalysis.technicals.sma50.toFixed(5)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">Momentum</div>
                        <div className="font-bold text-xs text-primary">{lastAnalysis.technicals.momentum}</div>
                      </div>
                    </div>
                    <div className="col-span-2 p-3 glass-panel rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase text-emerald-400">Trend Status</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        lastAnalysis.technicals.trend === "BULLISH" ? "bg-emerald-500 text-slate-950" : 
                        lastAnalysis.technicals.trend === "BEARISH" ? "bg-rose-500 text-white" : "bg-yellow-500 text-black"
                      }`}>
                        {lastAnalysis.technicals.trend}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} className="glass-panel p-4 rounded-xl text-center border border-primary/30">
                    <div className="text-xs text-muted-foreground uppercase mb-2 font-bold">Entry</div>
                    <div className="font-mono font-black text-base">{lastSignal.entry.toFixed(5)}</div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="glass-panel p-4 bg-rose-500/10 rounded-xl text-center border-2 border-rose-500/40">
                    <div className="text-xs text-rose-400 uppercase mb-2 font-bold">Stop Loss</div>
                    <div className="font-mono font-black text-base text-rose-400">{lastSignal.stopLoss.toFixed(5)}</div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="glass-panel p-4 bg-emerald-500/10 rounded-xl text-center border-2 border-emerald-500/40">
                    <div className="text-xs text-emerald-400 uppercase mb-2 font-bold">Take Profit</div>
                    <div className="font-mono font-black text-base text-emerald-400">{lastSignal.takeProfit.toFixed(5)}</div>
                  </motion.div>
                </div>

                {lastAnalysis && lastAnalysis.reasoning.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-border/30">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-bold flex items-center gap-2">
                      <Activity className="w-3 h-3 text-primary" />
                      Analysis Breakdown
                    </div>
                    <div className="space-y-2">
                      {lastAnalysis.reasoning.slice(0, 3).map((reason: string, i: number) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={i}
                          className="text-xs text-muted-foreground flex items-start gap-2 glass-panel p-2 rounded-lg"
                        >
                          <span className="text-primary mt-0.5 font-bold">•</span>
                          <span className="font-medium">{reason}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4 glass-panel border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 to-transparent shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 mt-0.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      Fixed Stake Trading Protocol
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      • <strong className="text-primary">M5 Timeframe:</strong> 5-minute precision trades<br/>
                      • <strong className="text-primary">Kenya Time (EAT):</strong> All times in UTC+3<br/>
                      • <strong className="text-primary">Entry Window:</strong> {lastSignal.startTime} - {lastSignal.endTime}<br/>
                      • <strong className="text-primary">Risk Management:</strong> Single entry per signal
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    );
}