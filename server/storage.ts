import { type User, type InsertUser, trades as tradesTable, type ScannerState, type InsertScannerState } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private trades: Map<string, Trade>;
  private scannerState: ScannerState;

  constructor() {
    this.users = new Map();
    this.trades = new Map();
    this.scannerState = {
      id: "current",
      autoMode: "false",
      scanMode: "true",
      nextSignalTime: null,
      scanStatus: "Initializing...",
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
}

export const storage = new MemStorage();
