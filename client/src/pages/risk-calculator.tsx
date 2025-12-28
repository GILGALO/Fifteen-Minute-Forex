import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, TrendingDown, DollarSign } from "lucide-react";

export default function RiskCalculator() {
  const [accountBalance, setAccountBalance] = useState("10000");
  const [riskPercent, setRiskPercent] = useState("1");
  const [entryPrice, setEntryPrice] = useState("1.08");
  const [stopLoss, setStopLoss] = useState("1.07");
  const [leverage, setLeverage] = useState("1");

  const calculate = () => {
    const balance = parseFloat(accountBalance);
    const risk = parseFloat(riskPercent) / 100;
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    const lev = parseFloat(leverage);

    const riskAmount = balance * risk;
    const pipsRisk = Math.abs(entry - stop) * 10000;
    const positionSize = (riskAmount / pipsRisk) * lev;
    const maxLoss = Math.abs(entry - stop) * positionSize;

    return {
      riskAmount: riskAmount.toFixed(2),
      positionSize: positionSize.toFixed(2),
      maxLoss: maxLoss.toFixed(2),
      pipsRisk: pipsRisk.toFixed(0),
    };
  };

  const result = calculate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Risk Calculator
            </h1>
          </div>
          <p className="text-slate-400 text-sm sm:text-base">Calculate proper position size for safe trading</p>
        </div>

        <Card className="bg-slate-900/60 border-slate-700/50 mb-6">
          <CardHeader className="border-b border-slate-700/30">
            <CardTitle className="text-lg sm:text-xl text-white">Input Parameters</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                  Account Balance ($)
                </label>
                <Input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(e.target.value)}
                  placeholder="10000"
                  className="bg-slate-800/50 border-slate-600 text-white text-sm sm:text-base"
                  data-testid="input-balance"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                  Risk Per Trade (%)
                </label>
                <Input
                  type="number"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  placeholder="1"
                  step="0.1"
                  className="bg-slate-800/50 border-slate-600 text-white text-sm sm:text-base"
                  data-testid="input-risk"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                  Entry Price
                </label>
                <Input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="1.08"
                  step="0.0001"
                  className="bg-slate-800/50 border-slate-600 text-white text-sm sm:text-base"
                  data-testid="input-entry"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                  Stop Loss Price
                </label>
                <Input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="1.07"
                  step="0.0001"
                  className="bg-slate-800/50 border-slate-600 text-white text-sm sm:text-base"
                  data-testid="input-stoploss"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                  Leverage
                </label>
                <Input
                  type="number"
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  placeholder="1"
                  step="0.1"
                  className="bg-slate-800/50 border-slate-600 text-white text-sm sm:text-base"
                  data-testid="input-leverage"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-xs sm:text-sm text-emerald-400/80 font-semibold uppercase">Risk Amount</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400" data-testid="text-risk-amount">
                ${result.riskAmount}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Maximum you can lose</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-blue-400" />
                <span className="text-xs sm:text-sm text-blue-400/80 font-semibold uppercase">Position Size</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-blue-400" data-testid="text-position-size">
                {result.positionSize}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Lot/Units to trade</p>
            </CardContent>
          </Card>

          <Card className="bg-rose-500/10 border-rose-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span className="text-xs sm:text-sm text-rose-400/80 font-semibold uppercase">Pips Risk</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-rose-400" data-testid="text-pips-risk">
                {result.pipsRisk}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Distance to stop loss</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-500/10 border-orange-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-orange-400" />
                <span className="text-xs sm:text-sm text-orange-400/80 font-semibold uppercase">Max Loss</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-orange-400" data-testid="text-max-loss">
                ${result.maxLoss}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Loss at stop loss</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 sm:mt-8 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
          <p className="text-xs sm:text-sm text-emerald-400">
            ✅ <strong>Pro Tip:</strong> Never risk more than 1-2% per trade. This calculator helps you stay safe!
          </p>
        </div>
      </div>
    </div>
  );
}
