import type { Express } from "express";
import { createServer, type Server } from "http";
import { createStorage } from "./supabase-storage";
import { insertReminderSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { startReminderScheduler } from "./scheduler";
import { authMiddleware } from "./auth-middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply auth middleware to all /api routes
  app.use('/api', authMiddleware);

  app.get("/api/reminders", async (req, res) => {
    try {
      const storage = createStorage(req.userId, req.userToken);
      const reminders = await storage.getReminders();
      res.json(reminders);
    } catch (error: any) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      const result = insertReminderSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const storage = createStorage(req.userId, req.userToken);
      const reminder = await storage.createReminder(result.data);
      res.status(201).json(reminder);
    } catch (error: any) {
      console.error("Error creating reminder:", error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  app.patch("/api/reminders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = insertReminderSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const storage = createStorage(req.userId, req.userToken);
      const updated = await storage.updateReminder(id, result.data);
      
      if (!updated) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating reminder:", error);
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });

  app.patch("/api/reminders/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const storage = createStorage(req.userId, req.userToken);
      const updated = await storage.completeReminder(id);
      
      if (!updated) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Error completing reminder:", error);
      res.status(500).json({ message: "Failed to complete reminder" });
    }
  });

  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const storage = createStorage(req.userId, req.userToken);
      const deleted = await storage.deleteReminder(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting reminder:", error);
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  startReminderScheduler();

  const httpServer = createServer(app);
  return httpServer;
}
