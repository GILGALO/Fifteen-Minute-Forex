import { type User, type InsertUser, users as usersTable } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser, isAdmin = false): Promise<User> {
    const result = await db
      .insert(usersTable)
      .values({
        ...insertUser,
        isAdmin: isAdmin ? "true" : "false",
      })
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(usersTable).where(eq(usersTable.id, id));
    return result.length > 0;
  }

  async listUsers(): Promise<User[]> {
    return db.select().from(usersTable);
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<boolean> {
    const result = await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.id, id));
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
