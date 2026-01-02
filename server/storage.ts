import { type User, type InsertUser, trades as tradesTable, type ScannerState, type InsertScannerState, type PushSubscription, type InsertPushSubscription } from "@shared/schema";
import crypto from "node:crypto";

export type Trade = typeof tradesTable.$inferSelect;
export type InsertTrade = typeof tradesTable.$inferInsert;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser, isAdmin?: boolean): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  listUsers(): Promise<User[]>;
  updateUserPassword(id: string, hashedPassword: string): Promise<boolean>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  listTrades(): Promise<Trade[]>;
  deleteTrade(id: string): Promise<boolean>;
  getScannerState(): Promise<ScannerState>;
  updateScannerState(state: Partial<InsertScannerState>): Promise<ScannerState>;
  createSignal(signal: any): Promise<any>;
  listSignals(): Promise<any[]>;
  addPushSubscription(sub: InsertPushSubscription): Promise<PushSubscription>;
  getAllPushSubscriptions(): Promise<PushSubscription[]>;
  removePushSubscription(endpoint: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private trades: Map<string, Trade>;
  private scannerState: ScannerState;
  private pushSubscriptions: Map<string, PushSubscription>;

  constructor() {
    this.users = new Map();
    this.trades = new Map();
    this.pushSubscriptions = new Map();
    this.scannerState = {
      id: "current",
      autoMode: "true",
      scanMode: "true",
      nextSignalTime: null,
      scanStatus: "Active: Watching Markets...",
      lastUpdated: new Date()
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser, isAdmin = false): Promise<User> {
    const id = crypto.randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: isAdmin ? "true" : "false" 
    };
    this.users.set(id, user);
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;
    this.users.set(id, { ...user, password: hashedPassword });
    return true;
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = crypto.randomUUID();
    const trade: Trade = {
      ...insertTrade,
      id,
      timestamp: new Date(),
    } as Trade;
    this.trades.set(id, trade);
    return trade;
  }

  async listTrades(): Promise<Trade[]> {
    return Array.from(this.trades.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async deleteTrade(id: string): Promise<boolean> {
    return this.trades.delete(id);
  }

  async getScannerState(): Promise<ScannerState> {
    return this.scannerState;
  }

  async updateScannerState(state: Partial<InsertScannerState>): Promise<ScannerState> {
    this.scannerState = {
      ...this.scannerState,
      ...state,
      lastUpdated: new Date()
    } as ScannerState;
    return this.scannerState;
  }

  async getTrades(): Promise<Trade[]> {
    return Array.from(this.trades.values());
  }

  async createSignal(signal: any): Promise<any> {
    const id = signal.id || crypto.randomUUID();
    const newSignal = { ...signal, id, timestamp: new Date(signal.timestamp || Date.now()) };
    this.trades.set(id, newSignal as any);
    return newSignal;
  }

  async listSignals(): Promise<any[]> {
    return Array.from(this.trades.values())
      .filter((t: any) => t.status === "active")
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async addPushSubscription(insertSub: InsertPushSubscription): Promise<PushSubscription> {
    const id = crypto.randomUUID();
    const sub: PushSubscription = {
      id,
      subscription: insertSub.subscription,
      createdAt: new Date()
    };
    try {
      const parsed = JSON.parse(insertSub.subscription);
      const endpoint = parsed.endpoint;
      this.pushSubscriptions.set(endpoint, sub);
    } catch (e) {
      this.pushSubscriptions.set(id, sub);
    }
    return sub;
  }

  async getAllPushSubscriptions(): Promise<PushSubscription[]> {
    return Array.from(this.pushSubscriptions.values());
  }

  async removePushSubscription(endpoint: string): Promise<void> {
    this.pushSubscriptions.delete(endpoint);
  }
}

export const storage = new MemStorage();
