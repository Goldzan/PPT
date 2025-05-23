import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPastPaperSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all past papers
  app.get("/api/papers", async (req, res) => {
    try {
      const papers = await storage.getAllPastPapers();
      res.json(papers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch papers" });
    }
  });

  // Get single past paper
  app.get("/api/papers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid paper ID" });
      }

      const paper = await storage.getPastPaper(id);
      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      res.json(paper);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch paper" });
    }
  });

  // Create new past paper
  app.post("/api/papers", async (req, res) => {
    try {
      const validatedData = insertPastPaperSchema.parse(req.body);
      const paper = await storage.createPastPaper(validatedData);
      res.status(201).json(paper);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create paper" });
    }
  });

  // Update past paper
  app.patch("/api/papers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid paper ID" });
      }

      const validatedData = insertPastPaperSchema.partial().parse(req.body);
      const paper = await storage.updatePastPaper(id, validatedData);
      
      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      res.json(paper);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update paper" });
    }
  });

  // Delete past paper
  app.delete("/api/papers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid paper ID" });
      }

      const deleted = await storage.deletePastPaper(id);
      if (!deleted) {
        return res.status(404).json({ message: "Paper not found" });
      }

      res.json({ message: "Paper deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete paper" });
    }
  });

  // Get unique subjects for filtering
  app.get("/api/subjects", async (req, res) => {
    try {
      const papers = await storage.getAllPastPapers();
      const uniqueSubjects = new Set(papers.map(paper => paper.subject));
      const subjects = Array.from(uniqueSubjects).sort();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Get statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const papers = await storage.getAllPastPapers();
      
      if (papers.length === 0) {
        return res.json({
          totalPapers: 0,
          averageScore: 0,
          bestSubject: null,
          bestSubjectScore: 0,
          weeklyCount: 0,
          recentIncrease: 0
        });
      }

      // Calculate average score
      const totalScore = papers.reduce((sum, paper) => sum + parseFloat(paper.score), 0);
      const averageScore = totalScore / papers.length;

      // Find best subject
      const subjectScores = papers.reduce((acc, paper) => {
        if (!acc[paper.subject]) {
          acc[paper.subject] = { scores: [], count: 0 };
        }
        acc[paper.subject].scores.push(parseFloat(paper.score));
        acc[paper.subject].count++;
        return acc;
      }, {} as Record<string, { scores: number[], count: number }>);

      let bestSubject = null;
      let bestSubjectScore = 0;
      
      Object.entries(subjectScores).forEach(([subject, data]) => {
        const avg = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
        if (avg > bestSubjectScore) {
          bestSubject = subject;
          bestSubjectScore = avg;
        }
      });

      // Count papers from this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyCount = papers.filter(paper => 
        new Date(paper.dateCompleted) >= oneWeekAgo
      ).length;

      // Count papers from this month for recent increase
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const recentIncrease = papers.filter(paper => 
        new Date(paper.dateCompleted) >= oneMonthAgo
      ).length;

      // Additional performance statistics
      const totalTimeSpent = papers.reduce((sum, paper) => sum + (paper.timeSpent || 0), 0);
      const averageTimePerPaper = papers.length > 0 ? Math.round(totalTimeSpent / papers.length) : 0;
      
      // Score distribution
      const scoreRanges = {
        excellent: papers.filter(p => parseFloat(p.score) >= 80).length,
        good: papers.filter(p => parseFloat(p.score) >= 70 && parseFloat(p.score) < 80).length,
        average: papers.filter(p => parseFloat(p.score) >= 60 && parseFloat(p.score) < 70).length,
        needsWork: papers.filter(p => parseFloat(p.score) < 60).length
      };

      // Subject performance details
      const subjectPerformance = Object.entries(subjectScores).map(([subject, data]) => ({
        subject,
        averageScore: Math.round((data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length) * 10) / 10,
        paperCount: data.count,
        bestScore: Math.max(...data.scores),
        latestScore: data.scores[data.scores.length - 1]
      })).sort((a, b) => b.averageScore - a.averageScore);

      res.json({
        totalPapers: papers.length,
        averageScore: Math.round(averageScore * 10) / 10,
        bestSubject,
        bestSubjectScore: Math.round(bestSubjectScore * 10) / 10,
        weeklyCount,
        recentIncrease,
        totalTimeSpent,
        averageTimePerPaper,
        scoreDistribution: scoreRanges,
        subjectPerformance
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
