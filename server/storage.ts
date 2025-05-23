import { users, pastPapers, type User, type InsertUser, type PastPaper, type InsertPastPaper } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Past Papers methods
  getAllPastPapers(): Promise<PastPaper[]>;
  getPastPaper(id: number): Promise<PastPaper | undefined>;
  createPastPaper(paper: InsertPastPaper): Promise<PastPaper>;
  updatePastPaper(id: number, paper: Partial<InsertPastPaper>): Promise<PastPaper | undefined>;
  deletePastPaper(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllPastPapers(): Promise<PastPaper[]> {
    const papers = await db.select().from(pastPapers).orderBy(pastPapers.dateCompleted);
    return papers.reverse(); // Most recent first
  }

  async getPastPaper(id: number): Promise<PastPaper | undefined> {
    const [paper] = await db.select().from(pastPapers).where(eq(pastPapers.id, id));
    return paper || undefined;
  }

  async createPastPaper(insertPaper: InsertPastPaper): Promise<PastPaper> {
    const [paper] = await db
      .insert(pastPapers)
      .values(insertPaper)
      .returning();
    return paper;
  }

  async updatePastPaper(id: number, updateData: Partial<InsertPastPaper>): Promise<PastPaper | undefined> {
    const [paper] = await db
      .update(pastPapers)
      .set(updateData)
      .where(eq(pastPapers.id, id))
      .returning();
    return paper || undefined;
  }

  async deletePastPaper(id: number): Promise<boolean> {
    const result = await db
      .delete(pastPapers)
      .where(eq(pastPapers.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
