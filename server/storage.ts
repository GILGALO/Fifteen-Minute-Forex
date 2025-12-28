import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser, isAdmin?: boolean): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  listUsers(): Promise<User[]>;
  updateUserPassword(id: string, hashedPassword: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
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
    const id = randomUUID();
    const user: User = { ...insertUser, id, isAdmin: isAdmin ? "true" : "false" };
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
    user.password = hashedPassword;
    this.users.set(id, user);
    return true;
  }
}

export const storage = new MemStorage();
