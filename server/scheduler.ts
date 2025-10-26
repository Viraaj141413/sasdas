import { getAllPendingReminders, markReminderAsSentById, markReminderAsFailedById } from "./supabase-storage";
import { sendReminder } from "./twilio";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function calculateNextOccurrence(scheduledFor: string, recurrenceType: string): string {
  const current = new Date(scheduledFor);
  
  switch (recurrenceType) {
    case 'daily':
      current.setDate(current.getDate() + 1);
      break;
    case 'weekly':
      current.setDate(current.getDate() + 7);
      break;
    case 'monthly':
      current.setMonth(current.getMonth() + 1);
      break;
    default:
      return scheduledFor;
  }
  
  return current.toISOString();
}

async function createNextRecurrence(reminder: any) {
  const nextScheduledFor = calculateNextOccurrence(reminder.scheduledFor, reminder.recurrenceType);
  
  if (reminder.recurrenceEndDate) {
    const endDate = new Date(reminder.recurrenceEndDate);
    const nextDate = new Date(nextScheduledFor);
    
    if (nextDate > endDate) {
      console.log(`[Scheduler] Recurrence ended for: ${reminder.title}`);
      return;
    }
  }
  
  const { error } = await supabase
    .from('reminders')
    .insert({
      user_id: reminder.userId,
      title: reminder.title,
      description: reminder.description,
      phone_number: reminder.phoneNumber,
      scheduled_for: nextScheduledFor,
      status: 'pending',
      completed: false,
      recurrence_type: reminder.recurrenceType,
      recurrence_end_date: reminder.recurrenceEndDate,
      notification_method: reminder.notificationMethod || 'sms',
    });
  
  if (error) {
    console.error(`[Scheduler] Failed to create next recurrence for ${reminder.title}:`, error);
  } else {
    console.log(`[Scheduler] Created next recurrence for ${reminder.title} at ${nextScheduledFor}`);
  }
}

export function startReminderScheduler() {
  setInterval(async () => {
    try {
      const { data: reminders, error } = await supabase
        .from('reminders')
        .select('*, user_id')
        .eq('status', 'pending')
        .eq('completed', false)
        .order('scheduled_for', { ascending: true });
      
      if (error) throw error;
      
      const now = new Date();
      
      console.log(`[Scheduler] Checking ${reminders?.length || 0} pending reminders at ${now.toISOString()}`);

      for (const reminder of reminders || []) {
        const scheduledTime = new Date(reminder.scheduled_for);
        
        if (scheduledTime <= now) {
          const method = reminder.notification_method || 'sms';
          console.log(`[Scheduler] Sending reminder via ${method}: ${reminder.title} to ${reminder.phone_number}`);
          
          const result = await sendReminder(
            reminder.phone_number,
            reminder.title,
            reminder.description || undefined,
            method as 'sms' | 'call' | 'whatsapp'
          );

          if (result.success) {
            await markReminderAsSentById(reminder.id);
            console.log(`✓ Reminder sent successfully: ${reminder.title}`);
            
            if (reminder.recurrence_type && reminder.recurrence_type !== 'none') {
              await createNextRecurrence({
                userId: reminder.user_id,
                title: reminder.title,
                description: reminder.description,
                phoneNumber: reminder.phone_number,
                scheduledFor: reminder.scheduled_for,
                recurrenceType: reminder.recurrence_type,
                recurrenceEndDate: reminder.recurrence_end_date,
                notificationMethod: reminder.notification_method || 'sms',
              });
            }
          } else {
            await markReminderAsFailedById(reminder.id);
            console.error(`✗ Failed to send reminder: ${reminder.title} - ${result.error}`);
          }
        }
      }
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  }, 60000);

  console.log('Reminder scheduler started (checking every 60 seconds)');
}
