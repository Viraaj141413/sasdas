import { type Reminder, type InsertReminder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getReminders(): Promise<Reminder[]>;
  getReminder(id: string): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: string, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: string): Promise<boolean>;
  completeReminder(id: string): Promise<Reminder | undefined>;
  markReminderAsSent(id: string): Promise<Reminder | undefined>;
  markReminderAsFailed(id: string): Promise<Reminder | undefined>;
}

export class MemStorage implements IStorage {
  private reminders: Map<string, Reminder>;

  constructor() {
    this.reminders = new Map();
  }

  async getReminders(): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).sort((a, b) => 
      new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
    );
  }

  async getReminder(id: string): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = randomUUID();
    const reminder: Reminder = {
      ...insertReminder,
      id,
      description: insertReminder.description || null,
      status: "pending",
      completed: false,
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async updateReminder(id: string, updates: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const existing = this.reminders.get(id);
    if (!existing) return undefined;

    const updated: Reminder = {
      ...existing,
      ...updates,
    };
    this.reminders.set(id, updated);
    return updated;
  }

  async deleteReminder(id: string): Promise<boolean> {
    return this.reminders.delete(id);
  }

  async completeReminder(id: string): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;

    const updated: Reminder = {
      ...reminder,
      completed: true,
    };
    this.reminders.set(id, updated);
    return updated;
  }

  async markReminderAsSent(id: string): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;

    const updated: Reminder = {
      ...reminder,
      status: "sent",
    };
    this.reminders.set(id, updated);
    return updated;
  }

  async markReminderAsFailed(id: string): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;

    const updated: Reminder = {
      ...reminder,
      status: "failed",
    };
    this.reminders.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
