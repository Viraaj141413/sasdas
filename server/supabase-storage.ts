import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { type Reminder, type InsertReminder } from "@shared/schema";
import { type IStorage } from "./storage";

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables on server');
}

export class SupabaseStorage implements IStorage {
  private userId?: string;
  private supabase: SupabaseClient;

  constructor(userToken?: string) {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: userToken ? {
            Authorization: `Bearer ${userToken}`
          } : {}
        }
      }
    );
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  async getReminders(): Promise<Reminder[]> {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    const { data, error } = await this.supabase
      .from('reminders')
      .select('*')
      .eq('user_id', this.userId)
      .order('scheduled_for', { ascending: true });
    
    if (error) {
      console.error('Error fetching reminders:', error);
      throw new Error(`Failed to fetch reminders: ${error.message}`);
    }
    
    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      phoneNumber: row.phone_number,
      scheduledFor: row.scheduled_for,
      status: row.status as 'pending' | 'sent' | 'failed',
      completed: row.completed,
      recurrenceType: row.recurrence_type || 'none',
      recurrenceEndDate: row.recurrence_end_date || undefined,
      notificationMethod: row.notification_method || 'sms',
    }));
  }

  async getReminder(id: string): Promise<Reminder | undefined> {
    const { data, error } = await this.supabase
      .from('reminders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      console.error('Error fetching reminder:', error);
      throw new Error(`Failed to fetch reminder: ${error.message}`);
    }
    
    if (!data) return undefined;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      phoneNumber: data.phone_number,
      scheduledFor: data.scheduled_for,
      status: data.status as 'pending' | 'sent' | 'failed',
      completed: data.completed,
      recurrenceType: data.recurrence_type || 'none',
      recurrenceEndDate: data.recurrence_end_date || undefined,
      notificationMethod: data.notification_method || 'sms',
    };
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    const { data, error } = await this.supabase
      .from('reminders')
      .insert({
        user_id: this.userId,
        title: insertReminder.title,
        description: insertReminder.description || null,
        phone_number: insertReminder.phoneNumber,
        scheduled_for: insertReminder.scheduledFor,
        status: 'pending',
        completed: false,
        recurrence_type: insertReminder.recurrenceType || 'none',
        recurrence_end_date: insertReminder.recurrenceEndDate || null,
        notification_method: insertReminder.notificationMethod || 'sms',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating reminder:', error);
      throw new Error(`Failed to create reminder: ${error.message}`);
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      phoneNumber: data.phone_number,
      scheduledFor: data.scheduled_for,
      status: data.status as 'pending' | 'sent' | 'failed',
      completed: data.completed,
      recurrenceType: data.recurrence_type || 'none',
      recurrenceEndDate: data.recurrence_end_date || undefined,
      notificationMethod: data.notification_method || 'sms',
    };
  }

  async updateReminder(id: string, updates: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.scheduledFor !== undefined) dbUpdates.scheduled_for = updates.scheduledFor;
    if (updates.recurrenceType !== undefined) dbUpdates.recurrence_type = updates.recurrenceType;
    if (updates.recurrenceEndDate !== undefined) dbUpdates.recurrence_end_date = updates.recurrenceEndDate;
    if (updates.notificationMethod !== undefined) dbUpdates.notification_method = updates.notificationMethod;
    
    const { data, error } = await this.supabase
      .from('reminders')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      console.error('Error updating reminder:', error);
      throw new Error(`Failed to update reminder: ${error.message}`);
    }
    
    if (!data) return undefined;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      phoneNumber: data.phone_number,
      scheduledFor: data.scheduled_for,
      status: data.status as 'pending' | 'sent' | 'failed',
      completed: data.completed,
      recurrenceType: data.recurrence_type || 'none',
      recurrenceEndDate: data.recurrence_end_date || undefined,
      notificationMethod: data.notification_method || 'sms',
    };
  }

  async deleteReminder(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('reminders')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting reminder:', error);
      return false;
    }
    
    return true;
  }

  async completeReminder(id: string): Promise<Reminder | undefined> {
    const { data, error } = await this.supabase
      .from('reminders')
      .update({ completed: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      console.error('Error completing reminder:', error);
      throw new Error(`Failed to complete reminder: ${error.message}`);
    }
    
    if (!data) return undefined;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      phoneNumber: data.phone_number,
      scheduledFor: data.scheduled_for,
      status: data.status as 'pending' | 'sent' | 'failed',
      completed: data.completed,
      recurrenceType: data.recurrence_type || 'none',
      recurrenceEndDate: data.recurrence_end_date || undefined,
      notificationMethod: data.notification_method || 'sms',
    };
  }

  async markReminderAsSent(id: string): Promise<Reminder | undefined> {
    const { data, error } = await this.supabase
      .from('reminders')
      .update({ status: 'sent' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      console.error('Error marking reminder as sent:', error);
      throw new Error(`Failed to mark reminder as sent: ${error.message}`);
    }
    
    if (!data) return undefined;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      phoneNumber: data.phone_number,
      scheduledFor: data.scheduled_for,
      status: data.status as 'pending' | 'sent' | 'failed',
      completed: data.completed,
      recurrenceType: data.recurrence_type || 'none',
      recurrenceEndDate: data.recurrence_end_date || undefined,
      notificationMethod: data.notification_method || 'sms',
    };
  }

  async markReminderAsFailed(id: string): Promise<Reminder | undefined> {
    const { data, error} = await this.supabase
      .from('reminders')
      .update({ status: 'failed' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      console.error('Error marking reminder as failed:', error);
      throw new Error(`Failed to mark reminder as failed: ${error.message}`);
    }
    
    if (!data) return undefined;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      phoneNumber: data.phone_number,
      scheduledFor: data.scheduled_for,
      status: data.status as 'pending' | 'sent' | 'failed',
      completed: data.completed,
      recurrenceType: data.recurrence_type || 'none',
      recurrenceEndDate: data.recurrence_end_date || undefined,
      notificationMethod: data.notification_method || 'sms',
    };
  }
}

// Create a factory function instead of a singleton
export function createStorage(userId?: string, userToken?: string): IStorage {
  const storage = new SupabaseStorage(userToken);
  if (userId) {
    storage.setUserId(userId);
  }
  return storage;
}

// For scheduler - use service role key to bypass RLS
const schedulerSupabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getAllPendingReminders(): Promise<Reminder[]> {
  const { data, error } = await schedulerSupabase
    .from('reminders')
    .select('*')
    .eq('status', 'pending')
    .eq('completed', false)
    .order('scheduled_for', { ascending: true });
  
  if (error) {
    console.error('Error fetching all pending reminders:', error);
    throw new Error(`Failed to fetch all pending reminders: ${error.message}`);
  }
  
  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    phoneNumber: row.phone_number,
    scheduledFor: row.scheduled_for,
    status: row.status as 'pending' | 'sent' | 'failed',
    completed: row.completed,
    recurrenceType: row.recurrence_type || 'none',
    recurrenceEndDate: row.recurrence_end_date || undefined,
    notificationMethod: row.notification_method || 'sms',
  }));
}

export async function markReminderAsSentById(id: string): Promise<void> {
  const { error } = await schedulerSupabase
    .from('reminders')
    .update({ status: 'sent' })
    .eq('id', id);
  
  if (error) {
    console.error('Error marking reminder as sent:', error);
    throw new Error(`Failed to mark reminder as sent: ${error.message}`);
  }
}

export async function markReminderAsFailedById(id: string): Promise<void> {
  const { error } = await schedulerSupabase
    .from('reminders')
    .update({ status: 'failed' })
    .eq('id', id);
  
  if (error) {
    console.error('Error marking reminder as failed:', error);
    throw new Error(`Failed to mark reminder as failed: ${error.message}`);
  }
}
