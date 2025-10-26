/*
  # Add Notification Method to Reminders

  1. Changes
    - Add `notification_method` column (sms, call)
    - Default to 'sms' for backward compatibility
  
  2. Notes
    - Existing reminders will default to SMS
*/

ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS notification_method text NOT NULL DEFAULT 'sms' CHECK (notification_method IN ('sms', 'call'));

CREATE INDEX IF NOT EXISTS reminders_notification_method_idx ON reminders(notification_method);
