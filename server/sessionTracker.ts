import { log } from "./index";

export interface SessionStats {
  dailyProfit: number;
  dailyLoss: number;
  tradesWon: number;
  tradesLost: number;
  startOfDayTimestamp: number;
  sessionGoal: number; // 3% = 300 (in basis points)
  maxDrawdown: number; // 5% = 500 (in basis points)
}

class SessionTracker {
  private sessionStats: SessionStats;
  private initialBalance: number = 100; // arbitrary starting balance

  constructor() {
    this.sessionStats = this.initializeSession();
  }

  private initializeSession(): SessionStats {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return {
      dailyProfit: 0,
      dailyLoss: 0,
      tradesWon: 0,
      tradesLost: 0,
      startOfDayTimestamp: now.getTime(),
      sessionGoal: 300, // 3% goal
      maxDrawdown: 500, // 5% max loss
    };
  }

  isNewDay(): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime() > this.sessionStats.startOfDayTimestamp;
  }

  recordTrade(won: boolean, profitLoss: number = 1): void {
    if (this.isNewDay()) {
      this.sessionStats = this.initializeSession();
    }

    if (won) {
      this.sessionStats.tradesWon++;
      this.sessionStats.dailyProfit += profitLoss;
    } else {
      this.sessionStats.tradesLost++;
      this.sessionStats.dailyLoss += profitLoss;
    }
  }

  getDailyPnL(): { profit: number; loss: number; net: number; basisPoints: number } {
    const net = this.sessionStats.dailyProfit - this.sessionStats.dailyLoss;
    const basisPoints = Math.round((net / this.initialBalance) * 10000);
    return {
      profit: this.sessionStats.dailyProfit,
      loss: this.sessionStats.dailyLoss,
      net,
      basisPoints,
    };
  }

  hasReachedDailyGoal(): boolean {
    const pnl = this.getDailyPnL();
    return pnl.basisPoints >= this.sessionStats.sessionGoal;
  }

  hasExceededMaxDrawdown(): boolean {
    const pnl = this.getDailyPnL();
    return Math.abs(pnl.basisPoints) >= this.sessionStats.maxDrawdown && pnl.basisPoints < 0;
  }

  getStats(): SessionStats {
    if (this.isNewDay()) {
      this.sessionStats = this.initializeSession();
    }
    return { ...this.sessionStats };
  }

  getGoalProgress(): number {
    const pnl = this.getDailyPnL();
    return Math.min(100, (pnl.basisPoints / this.sessionStats.sessionGoal) * 100);
  }
}

export const sessionTracker = new SessionTracker();
