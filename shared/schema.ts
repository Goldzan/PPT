import { pgTable, text, serial, integer, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const pastPapers = pgTable("past_papers", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  year: integer("year").notNull(),
  paperNumber: text("paper_number").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  dateCompleted: date("date_completed").notNull(),
  timeSpent: integer("time_spent"), // in minutes
  notes: text("notes"),
});

export const insertPastPaperSchema = createInsertSchema(pastPapers).omit({
  id: true,
});

export type InsertPastPaper = z.infer<typeof insertPastPaperSchema>;
export type PastPaper = typeof pastPapers.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
