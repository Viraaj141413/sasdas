# QA Reminder App

## Overview
A QA reminder application that helps quality assurance teams schedule and manage testing reminders with automated SMS and voice call notifications via Twilio integration.

## Purpose
- Schedule QA reminders with specific dates and times
- Send automated SMS or voice call notifications when reminders are due
- Track reminder status (pending, sent, completed)
- Manage active, overdue, and completed reminders
- Support recurring reminders (daily, weekly, monthly)
- Choose notification method (SMS or Call) per reminder

## Current State
**Status**: Production Ready - Running in Replit Environment

### Recent Changes (October 26, 2025)
- ✅ Successfully imported from GitHub to Replit
- ✅ Installed all npm dependencies (520 packages)
- ✅ Configured Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- ✅ Set up workflow to run on port 5000 (0.0.0.0)
- ✅ Configured deployment for Replit Autoscale (build + run)
- ✅ Created .gitignore file for Node.js project
- ✅ Server running successfully with Vite HMR
- ✅ Frontend loads with authentication page
- ✅ Twilio credentials configured via Replit Secrets (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
- ✅ Supabase database migrations completed (user_profiles and reminders tables with RLS policies)
- ✅ Reminder scheduler active (checking every 60 seconds for due reminders)
- ✅ Twilio SMS and Voice Call tested and working - messages/calls being sent successfully
- ✅ Supabase Service Role Key configured for scheduler to bypass RLS
- ✅ Added notification method selection (SMS, Call) with database schema and UI updates
- ✅ Optimized UI for mobile devices with responsive design
- ✅ Application fully functional and ready to use

## Project Architecture

### Technology Stack
**Frontend**:
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Shadcn UI components
- Tailwind CSS for styling
- date-fns for date formatting

**Backend**:
- Express.js server (runs on port 5000)
- Supabase for database storage with PostgreSQL
- Supabase Auth for user authentication
- Twilio integration for SMS and voice calls (manual credential setup)
- Automated scheduler (checks every 60 seconds for due reminders)
- Row Level Security (RLS) ensures users only see their own reminders

**Data Model**:
```typescript
Reminder {
  id: string
  title: string
  description?: string
  phoneNumber: string
  scheduledFor: timestamp
  status: 'pending' | 'sent' | 'failed'
  completed: boolean
  notificationMethod: 'sms' | 'call'
  recurrenceType: 'none' | 'daily' | 'weekly' | 'monthly'
  recurrenceEndDate?: timestamp
}
```

### File Structure
```
client/
  src/
    pages/
      Home.tsx - Main dashboard with tabbed reminder views
      Auth.tsx - Sign in/sign up page
    components/
      ReminderCard.tsx - Individual reminder display
      ReminderDialog.tsx - Create/edit reminder form with timezone handling
      EmptyState.tsx - Empty state UI
      Analytics.tsx - Stats dashboard
    contexts/
      AuthContext.tsx - Authentication state management
server/
  routes.ts - API endpoints for CRUD operations
  supabase-storage.ts - Supabase database integration with RLS
  auth-middleware.ts - JWT token validation
  twilio.ts - Twilio SMS and voice call integration
  scheduler.ts - Automated reminder checking system
shared/
  schema.ts - TypeScript types and Zod schemas
supabase/
  migrations/ - Database schema migrations
```

## API Routes (To Be Implemented)
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create new reminder
- `PATCH /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder
- `PATCH /api/reminders/:id/complete` - Mark as complete

## Features
### Implemented
- ✅ Beautiful, responsive UI with tabbed navigation
- ✅ Create/edit reminder forms with validation
- ✅ Reminder cards with status badges
- ✅ Empty states for better UX
- ✅ Delete confirmation dialogs
- ✅ Complete data model and types
- ✅ Backend API implementation (all CRUD operations)
- ✅ Twilio SMS and voice call integration
- ✅ Automated scheduling system (60-second intervals)
- ✅ Frontend-backend integration complete

### Features Complete
- ✅ Persistent database storage via Supabase
- ✅ Multi-user authentication with Supabase Auth
- ✅ Row Level Security for data isolation
- ✅ Timezone-aware date/time handling
- ✅ Real-time updates via Supabase subscriptions
- ✅ Recurring reminders (daily, weekly, monthly)
- ✅ Automated SMS and voice call notifications via Twilio
- ✅ Mobile-optimized responsive design

## Design Guidelines
Following modern productivity app patterns inspired by Linear and Asana:
- Clean, professional interface
- Consistent spacing using Tailwind units (3, 4, 6, 8, 12)
- Inter font family for readability
- Status badges for visual clarity
- Responsive design for mobile and desktop
- Beautiful empty states and loading indicators

## User Preferences
None specified yet.

## Integration Details
- **Supabase**: Connected for authentication and database (credentials in Replit Secrets)
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY (for scheduler to bypass RLS)
  - Database tables: user_profiles, reminders (with Row Level Security enabled)
- **Twilio**: Configured for notifications (credentials in Replit Secrets)
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN  
  - TWILIO_PHONE_NUMBER (for SMS and Voice calls)
  - Note: Manual credential setup
  - Supported notification methods: SMS, Voice Call
