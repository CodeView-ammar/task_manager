import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import {
  insertTaskSheetSchema,
  insertPrioritySchema,
  insertTodoSchema,
  insertNoteSchema,
  insertLearningSchema,
  insertReminderSchema
} from "@shared/schema";

function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Task Sheets API
  app.get("/api/task-sheets", ensureAuthenticated, async (req, res) => {
    try {
      const taskSheets = await storage.getTaskSheetsByUserId(req.user.id);
      res.json(taskSheets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task sheets" });
    }
  });

  app.get("/api/task-sheets/:date", ensureAuthenticated, async (req, res) => {
    try {
      const { date } = req.params;
      const taskSheet = await storage.getTaskSheetByDate(req.user.id, date);
      
      if (!taskSheet) {
        const newTaskSheet = await storage.createTaskSheet({
          userId: req.user.id,
          date: new Date(date),
        });
        
        return res.json({
          ...newTaskSheet,
          priorities: [],
          todos: [],
          notes: [],
          learnings: [],
          reminders: [],
        });
      }
      
      res.json(taskSheet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task sheet" });
    }
  });

  // Priorities API
  app.post("/api/priorities", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPrioritySchema.parse(req.body);
      const taskSheet = await storage.getTaskSheet(validatedData.taskSheetId);
      
      if (!taskSheet || taskSheet.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const priority = await storage.createPriority(validatedData);
      res.status(201).json(priority);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create priority" });
    }
  });

  app.patch("/api/priorities/:id", ensureAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const priority = await storage.getPriority(parseInt(id));
      
      if (!priority) {
        return res.status(404).json({ message: "Priority not found" });
      }
      
      const taskSheet = await storage.getTaskSheet(priority.taskSheetId);
      
      if (!taskSheet || taskSheet.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedPriority = await storage.updatePriority(parseInt(id), req.body);
      res.json(updatedPriority);
    } catch (error) {
      res.status(500).json({ message: "Failed to update priority" });
    }
  });

  app.delete("/api/priorities/:id", ensureAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const priority = await storage.getPriority(parseInt(id));
      
      if (!priority) {
        return res.status(404).json({ message: "Priority not found" });
      }
      
      const taskSheet = await storage.getTaskSheet(priority.taskSheetId);
      
      if (!taskSheet || taskSheet.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deletePriority(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete priority" });
    }
  });

  // Todos API
  app.post("/api/todos", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTodoSchema.parse(req.body);
      const taskSheet = await storage.getTaskSheet(validatedData.taskSheetId);
      
      if (!taskSheet || taskSheet.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const todo = await storage.createTodo(validatedData);
      res.status(201).json(todo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create todo" });
    }
  });

  app.patch("/api/todos/:id", ensureAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const todo = await storage.getTodo(parseInt(id));
      
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      const taskSheet = await storage.getTaskSheet(todo.taskSheetId);
      
      if (!taskSheet || taskSheet.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedTodo = await storage.updateTodo(parseInt(id), req.body);
      res.json(updatedTodo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update todo" });
    }
  });

  app.delete("/api/todos/:id", ensureAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const todo = await storage.getTodo(parseInt(id));
      
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      const taskSheet = await storage.getTaskSheet(todo.taskSheetId);
      
      if (!taskSheet || taskSheet.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTodo(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });

  // Notes API
  app.post("/api/notes", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const taskSheet = await storage.getTaskSheet(validatedData.taskSheetId);
      
      if (!taskSheet || taskSheet.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.patch("/api/notes/:id", ensureAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const note = await storage.getNote(parseInt(id));
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      const taskSheet = await storage.getTaskSheet(note.taskSheetId);
      
      if (!taskSheet || taskSheet.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedNote = await storage.updateNote(parseInt(id), req.body);
      res.json(updatedNote);
    } catch (error) {
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  // Learnings API
  app.post("/api/learnings", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLearningSchema.parse(req.body);
      const taskSheet = await storage.getTaskSheet(validatedData.taskSheetId);
      
      if (!taskSheet || taskSheet.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const learning = await storage.createLearning(validatedData);
      res.status(201).json(learning);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create learning" });
    }
  });

  app.patch("/api/learnings/:id", ensureAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const learning = await storage.getLearning(parseInt(id));
      
      if (!learning) {
        return res.status(404).json({ message: "Learning not found" });
      }
      
      const taskSheet = await storage.getTaskSheet(learning.taskSheetId);
      
      if (!taskSheet || taskSheet.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedLearning = await storage.updateLearning(parseInt(id), req.body);
      res.json(updatedLearning);
    } catch (error) {
      res.status(500).json({ message: "Failed to update learning" });
    }
  });

  // Reminders API
  app.post("/api/reminders", ensureAuthenticated, async (req, res) => {
    try {
      const validatedData = insertReminderSchema.parse(req.body);
      const taskSheet = await storage.getTaskSheet(validatedData.taskSheetId);
      
      if (!taskSheet || taskSheet.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const reminder = await storage.createReminder(validatedData);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  app.patch("/api/reminders/:id", ensureAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const reminder = await storage.getReminder(parseInt(id));
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      const taskSheet = await storage.getTaskSheet(reminder.taskSheetId);
      
      if (!taskSheet || taskSheet.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedReminder = await storage.updateReminder(parseInt(id), req.body);
      res.json(updatedReminder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });

  app.delete("/api/reminders/:id", ensureAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const reminder = await storage.getReminder(parseInt(id));
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      const taskSheet = await storage.getTaskSheet(reminder.taskSheetId);
      
      if (!taskSheet || taskSheet.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteReminder(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
