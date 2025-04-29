import {
  User,
  InsertUser,
  TaskSheet,
  InsertTaskSheet,
  Priority,
  InsertPriority,
  Todo,
  InsertTodo,
  Note,
  InsertNote,
  Learning,
  InsertLearning,
  Reminder,
  InsertReminder,
  CompleteTaskSheet,
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;

  // Task Sheet operations
  getTaskSheet(id: number): Promise<TaskSheet | undefined>;
  getTaskSheetByDate(userId: number, date: string): Promise<CompleteTaskSheet | undefined>;
  getTaskSheetsByUserId(userId: number): Promise<TaskSheet[]>;
  createTaskSheet(taskSheet: InsertTaskSheet): Promise<TaskSheet>;

  // Priority operations
  getPriority(id: number): Promise<Priority | undefined>;
  getPrioritiesByTaskSheetId(taskSheetId: number): Promise<Priority[]>;
  createPriority(priority: InsertPriority): Promise<Priority>;
  updatePriority(id: number, data: Partial<Priority>): Promise<Priority>;
  deletePriority(id: number): Promise<void>;

  // Todo operations
  getTodo(id: number): Promise<Todo | undefined>;
  getTodosByTaskSheetId(taskSheetId: number): Promise<Todo[]>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, data: Partial<Todo>): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;

  // Note operations
  getNote(id: number): Promise<Note | undefined>;
  getNotesByTaskSheetId(taskSheetId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, data: Partial<Note>): Promise<Note>;

  // Learning operations
  getLearning(id: number): Promise<Learning | undefined>;
  getLearningsByTaskSheetId(taskSheetId: number): Promise<Learning[]>;
  createLearning(learning: InsertLearning): Promise<Learning>;
  updateLearning(id: number, data: Partial<Learning>): Promise<Learning>;

  // Reminder operations
  getReminder(id: number): Promise<Reminder | undefined>;
  getRemindersByTaskSheetId(taskSheetId: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, data: Partial<Reminder>): Promise<Reminder>;
  deleteReminder(id: number): Promise<void>;

  // Session storage
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private taskSheets: Map<number, TaskSheet>;
  private priorities: Map<number, Priority>;
  private todos: Map<number, Todo>;
  private notes: Map<number, Note>;
  private learnings: Map<number, Learning>;
  private reminders: Map<number, Reminder>;
  
  sessionStore: session.SessionStore;
  
  userIdCounter: number;
  taskSheetIdCounter: number;
  priorityIdCounter: number;
  todoIdCounter: number;
  noteIdCounter: number;
  learningIdCounter: number;
  reminderIdCounter: number;

  constructor() {
    this.users = new Map();
    this.taskSheets = new Map();
    this.priorities = new Map();
    this.todos = new Map();
    this.notes = new Map();
    this.learnings = new Map();
    this.reminders = new Map();
    
    this.userIdCounter = 1;
    this.taskSheetIdCounter = 1;
    this.priorityIdCounter = 1;
    this.todoIdCounter = 1;
    this.noteIdCounter = 1;
    this.learningIdCounter = 1;
    this.reminderIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Task Sheet operations
  async getTaskSheet(id: number): Promise<TaskSheet | undefined> {
    return this.taskSheets.get(id);
  }

  async getTaskSheetByDate(userId: number, date: string): Promise<CompleteTaskSheet | undefined> {
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);
    
    const taskSheet = Array.from(this.taskSheets.values()).find(
      (sheet) => 
        sheet.userId === userId && 
        new Date(sheet.date).toISOString().split('T')[0] === formattedDate.toISOString().split('T')[0]
    );
    
    if (!taskSheet) {
      return undefined;
    }
    
    const priorities = await this.getPrioritiesByTaskSheetId(taskSheet.id);
    const todos = await this.getTodosByTaskSheetId(taskSheet.id);
    const notes = await this.getNotesByTaskSheetId(taskSheet.id);
    const learnings = await this.getLearningsByTaskSheetId(taskSheet.id);
    const reminders = await this.getRemindersByTaskSheetId(taskSheet.id);
    
    return {
      ...taskSheet,
      priorities,
      todos,
      notes,
      learnings,
      reminders,
    };
  }

  async getTaskSheetsByUserId(userId: number): Promise<TaskSheet[]> {
    return Array.from(this.taskSheets.values())
      .filter((sheet) => sheet.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTaskSheet(insertTaskSheet: InsertTaskSheet): Promise<TaskSheet> {
    const id = this.taskSheetIdCounter++;
    const taskSheet: TaskSheet = { 
      ...insertTaskSheet, 
      id, 
      createdAt: new Date() 
    };
    this.taskSheets.set(id, taskSheet);
    return taskSheet;
  }

  // Priority operations
  async getPriority(id: number): Promise<Priority | undefined> {
    return this.priorities.get(id);
  }

  async getPrioritiesByTaskSheetId(taskSheetId: number): Promise<Priority[]> {
    return Array.from(this.priorities.values())
      .filter((priority) => priority.taskSheetId === taskSheetId)
      .sort((a, b) => a.order - b.order);
  }

  async createPriority(insertPriority: InsertPriority): Promise<Priority> {
    const id = this.priorityIdCounter++;
    const priority: Priority = { ...insertPriority, id };
    this.priorities.set(id, priority);
    return priority;
  }

  async updatePriority(id: number, data: Partial<Priority>): Promise<Priority> {
    const priority = this.priorities.get(id);
    if (!priority) {
      throw new Error("Priority not found");
    }
    
    const updatedPriority = { ...priority, ...data };
    this.priorities.set(id, updatedPriority);
    return updatedPriority;
  }

  async deletePriority(id: number): Promise<void> {
    this.priorities.delete(id);
  }

  // Todo operations
  async getTodo(id: number): Promise<Todo | undefined> {
    return this.todos.get(id);
  }

  async getTodosByTaskSheetId(taskSheetId: number): Promise<Todo[]> {
    return Array.from(this.todos.values())
      .filter((todo) => todo.taskSheetId === taskSheetId);
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const id = this.todoIdCounter++;
    const todo: Todo = { ...insertTodo, id };
    this.todos.set(id, todo);
    return todo;
  }

  async updateTodo(id: number, data: Partial<Todo>): Promise<Todo> {
    const todo = this.todos.get(id);
    if (!todo) {
      throw new Error("Todo not found");
    }
    
    const updatedTodo = { ...todo, ...data };
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: number): Promise<void> {
    this.todos.delete(id);
  }

  // Note operations
  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async getNotesByTaskSheetId(taskSheetId: number): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter((note) => note.taskSheetId === taskSheetId);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteIdCounter++;
    const note: Note = { ...insertNote, id };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, data: Partial<Note>): Promise<Note> {
    const note = this.notes.get(id);
    if (!note) {
      throw new Error("Note not found");
    }
    
    const updatedNote = { ...note, ...data };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  // Learning operations
  async getLearning(id: number): Promise<Learning | undefined> {
    return this.learnings.get(id);
  }

  async getLearningsByTaskSheetId(taskSheetId: number): Promise<Learning[]> {
    return Array.from(this.learnings.values())
      .filter((learning) => learning.taskSheetId === taskSheetId);
  }

  async createLearning(insertLearning: InsertLearning): Promise<Learning> {
    const id = this.learningIdCounter++;
    const learning: Learning = { ...insertLearning, id };
    this.learnings.set(id, learning);
    return learning;
  }

  async updateLearning(id: number, data: Partial<Learning>): Promise<Learning> {
    const learning = this.learnings.get(id);
    if (!learning) {
      throw new Error("Learning not found");
    }
    
    const updatedLearning = { ...learning, ...data };
    this.learnings.set(id, updatedLearning);
    return updatedLearning;
  }

  // Reminder operations
  async getReminder(id: number): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }

  async getRemindersByTaskSheetId(taskSheetId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values())
      .filter((reminder) => reminder.taskSheetId === taskSheetId);
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.reminderIdCounter++;
    const reminder: Reminder = { ...insertReminder, id };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async updateReminder(id: number, data: Partial<Reminder>): Promise<Reminder> {
    const reminder = this.reminders.get(id);
    if (!reminder) {
      throw new Error("Reminder not found");
    }
    
    const updatedReminder = { ...reminder, ...data };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }

  async deleteReminder(id: number): Promise<void> {
    this.reminders.delete(id);
  }
}

export const storage = new MemStorage();
