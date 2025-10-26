# Supabase Database Setup

## Step 1: Run the SQL Migrations

Go to your Supabase project dashboard at https://supabase.com/dashboard

1. Click on your project
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL from **both migration files** below, in order:

### Migration 1: Auth Setup
```sql
-- Copy the contents of: supabase/migrations/20251025212121_create_auth_setup.sql
```

Run this first, then:

### Migration 2: Reminders Table
```sql
-- Copy the contents of: supabase/migrations/20251025220000_create_reminders_table.sql
```

## Step 2: Verify Tables Created

In the Supabase dashboard:
1. Go to **Table Editor** in the left sidebar
2. You should see two tables:
   - `user_profiles`
   - `reminders`

## Step 3: Test the Application

Your app is now configured to:
- Use Supabase for authentication (sign up/sign in)
- Store all reminders in Supabase database
- Each user can only see their own reminders (Row Level Security)
- Send SMS notifications via Twilio when reminders are due

## Database Schema

### Reminders Table
- Each reminder is linked to a user (user_id)
- Users can only access their own reminders
- Status tracking: pending → sent/failed
- Completion tracking

### Security Features
- Row Level Security (RLS) enabled
- Users can only CRUD their own data
- All operations require authentication
