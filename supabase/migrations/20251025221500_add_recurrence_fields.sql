/*
  # Add Recurrence Fields to Reminders

  1. Changes
    - Add `recurrence_type` column (none, daily, weekly, monthly)
    - Add `recurrence_end_date` column (optional, for when to stop recurring)
  
  2. Notes
    - Default recurrence_type is 'none' for existing reminders
    - recurrence_end_date is nullable (null means indefinite recurrence)
*/

ALTER TABLE reminders 
ADD COLUMN recurrence_type text NOT NULL DEFAULT 'none' CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly')),
ADD COLUMN recurrence_end_date timestamptz;

CREATE INDEX IF NOT EXISTS reminders_recurrence_type_idx ON reminders(recurrence_type);
