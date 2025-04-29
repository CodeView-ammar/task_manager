import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  language: text("language").notNull().default("en"),
  rtl: boolean("rtl").notNull().default(false),
});

export const taskSheets = pgTable("task_sheets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const priorities = pgTable("priorities", {
  id: serial("id").primaryKey(),
  taskSheetId: integer("task_sheet_id").notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  order: integer("order").notNull(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  taskSheetId: integer("task_sheet_id").notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  taskSheetId: integer("task_sheet_id").notNull(),
  content: text("content").notNull(),
});

export const learnings = pgTable("learnings", {
  id: serial("id").primaryKey(),
  taskSheetId: integer("task_sheet_id").notNull(),
  content: text("content").notNull(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  taskSheetId: integer("task_sheet_id").notNull(),
  content: text("content").notNull(),
  time: text("time"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  language: true,
  rtl: true,
});

export const insertTaskSheetSchema = createInsertSchema(taskSheets).pick({
  userId: true,
  date: true,
});

export const insertPrioritySchema = createInsertSchema(priorities).pick({
  taskSheetId: true,
  title: true,
  completed: true,
  order: true,
});

export const insertTodoSchema = createInsertSchema(todos).pick({
  taskSheetId: true,
  title: true,
  completed: true,
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  taskSheetId: true,
  content: true,
});

export const insertLearningSchema = createInsertSchema(learnings).pick({
  taskSheetId: true,
  content: true,
});

export const insertReminderSchema = createInsertSchema(reminders).pick({
  taskSheetId: true,
  content: true,
  time: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTaskSheet = z.infer<typeof insertTaskSheetSchema>;
export type TaskSheet = typeof taskSheets.$inferSelect;

export type InsertPriority = z.infer<typeof insertPrioritySchema>;
export type Priority = typeof priorities.$inferSelect;

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export type InsertLearning = z.infer<typeof insertLearningSchema>;
export type Learning = typeof learnings.$inferSelect;

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

// Complete task sheet with all related data
export type CompleteTaskSheet = TaskSheet & {
  priorities: Priority[];
  todos: Todo[];
  notes: Note[];
  learnings: Learning[];
  reminders: Reminder[];
};
