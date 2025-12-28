import { Clock } from "lucide-react";
import TradingScheduleComponent from "@/components/trading-schedule";

export default function TradingSchedulePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">Trading Schedule</h1>
          </div>
          <p className="text-slate-400 text-sm sm:text-base">View forex trading sessions in EAT (East Africa Time)</p>
        </div>

        <TradingScheduleComponent />
      </div>
    </div>
  );
}
