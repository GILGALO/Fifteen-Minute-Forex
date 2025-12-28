import { type User, type InsertUser, type Trade, type InsertTrade, type Alert, type InsertAlert } from "@shared/schema";
import crypto from "node:crypto";

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
  createAlert(alert: InsertAlert): Promise<Alert>;
  listAlerts(): Promise<Alert[]>;
  deleteAlert(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private trades: Map<string, Trade>;
  private alerts: Map<string, Alert>;

  constructor() {
    this.users = new Map();
    this.trades = new Map();
    this.alerts = new Map();
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

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = crypto.randomUUID();
    const alert: Alert = {
      ...insertAlert,
      id,
      timestamp: new Date(),
    } as Alert;
    this.alerts.set(id, alert);
    return alert;
  }

  async listAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async deleteAlert(id: string): Promise<boolean> {
    return this.alerts.delete(id);
  }
}

export const storage = new MemStorage();
