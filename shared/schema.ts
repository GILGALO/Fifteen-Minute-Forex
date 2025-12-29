import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: text("is_admin").notNull().default("false"),
});

export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pair: text("pair").notNull(),
  entryPrice: numeric("entry_price").notNull(),
  exitPrice: numeric("exit_price").notNull(),
  positionSize: numeric("position_size").notNull(),
  outcome: text("outcome").notNull(),
  entryReason: text("entry_reason").notNull(),
  exitReason: text("exit_reason").notNull(),
  notes: text("notes"),
  timestamp: timestamp("timestamp").notNull().default(sql`NOW()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export const scannerState = pgTable("scanner_state", {
  id: varchar("id").primaryKey().default("current"),
  autoMode: text("auto_mode").notNull().default("false"),
  scanMode: text("scan_mode").notNull().default("true"),
  nextSignalTime: numeric("next_signal_time"),
  scanStatus: text("scan_status").notNull().default("Initializing..."),
  lastUpdated: timestamp("last_updated").notNull().default(sql`NOW()`),
});

export const insertScannerStateSchema = createInsertSchema(scannerState).omit({
  lastUpdated: true,
});

export type ScannerState = typeof scannerState.$inferSelect;
export type InsertScannerState = z.infer<typeof insertScannerStateSchema>;
