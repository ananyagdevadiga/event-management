# EventSphere - Event Management Platform

A full-stack event management application built with **React** and **Supabase**.

## Features

### User Module
- View event list with search & filter
- View event details
- Register/unregister for events
- View my registrations

### Admin Module
- Create events
- Edit events
- Delete events
- View all registrations with export to CSV

---

## Supabase Setup

### 1. Create a Supabase Project
- Go to [https://supabase.com](https://supabase.com)
- Create a new project
- Note your **Project URL** and **Anon/Public Key** from Settings → API

### 2. Run the SQL (in Supabase SQL Editor)

Go to **SQL Editor** in your Supabase dashboard and run the following:

```sql
-- =============================================
-- 1. CREATE TABLES
-- =============================================

-- Profiles table (linked to auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  max_attendees INTEGER,
  image_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registrations table
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- =============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. RLS POLICIES - PROFILES
-- =============================================

-- Anyone authenticated can read profiles
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- =============================================
-- 4. RLS POLICIES - EVENTS
-- =============================================

-- Anyone authenticated can view events
CREATE POLICY "Events are viewable by authenticated users"
  ON events FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can create events
CREATE POLICY "Admins can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update their own events
CREATE POLICY "Admins can update their own events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete their own events
CREATE POLICY "Admins can delete their own events"
  ON events FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- 5. RLS POLICIES - REGISTRATIONS
-- =============================================

-- Users can view their own registrations; admins can view registrations for their events
CREATE POLICY "Users can view own registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM events
      WHERE events.id = registrations.event_id
      AND events.created_by = auth.uid()
    )
  );

-- Users can register for events
CREATE POLICY "Users can register for events"
  ON registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own registrations
CREATE POLICY "Users can cancel own registrations"
  ON registrations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can delete registrations for their events (when deleting an event)
CREATE POLICY "Admins can delete registrations for their events"
  ON registrations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = registrations.event_id
      AND events.created_by = auth.uid()
    )
  );

-- =============================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
```

### 3. Disable Email Confirmation (for development)

In your Supabase dashboard:
- Go to **Authentication** → **Providers** → **Email**
- Toggle **OFF** "Confirm email"

This lets users sign up and immediately sign in without email verification.

### 4. Add Supabase Keys

Edit the `.env` file in the project root:

```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will run at **http://localhost:3000**

## How It Works

1. **Open the app** → You see the Login/Create Account page
2. **Create Account** → Choose **User** or **Admin** role
3. **Admin login** → Redirected to Admin Dashboard (create events, edit, view registrations)
4. **User login** → Redirected to User Dashboard (browse events, register, view registrations)

## Tech Stack

- **Frontend**: React 18, React Router v6
- **Backend/Database**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: Custom CSS (no framework)
- **Icons**: React Icons (Feather Icons)
