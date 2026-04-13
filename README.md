# Workout Tracker - Setup Guide

## Features
- ✅ **Dark Mode Toggle** - Switch between light and dark themes
- ✅ **Real-time Sync** - Share data across devices using Supabase
- ✅ **Local Storage Fallback** - Works offline without configuration
- ✅ **6 Workout Types** - Push, Pull, Shoulder, Leg, Upper, Arms
- ✅ **Historical Data** - View all past workouts with filtering
- ✅ **Weekly Summary** - Stats for each workout type

## Quick Start (No Setup Required)
1. Open `index.html` in your browser
2. Start logging workouts immediately
3. Data is saved to your browser's localStorage

*Note: Without Supabase setup, data is only visible on the device/browser where it was entered.*

## Enable Real-time Sync (Supabase)

To allow everyone to see the same data, you need to set up a free Supabase database:

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Fill in project details and create

### Step 2: Create the Database Table
1. In your Supabase dashboard, go to **SQL Editor**
2. Run this SQL:

```sql
CREATE TABLE workouts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    notes TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write (for simple shared access)
CREATE POLICY "Allow public access" ON workouts
    FOR ALL USING (true) WITH CHECK (true);
```

### Step 3: Get Your Credentials
1. Go to **Settings** → **API**
2. Copy the **Project URL**
3. Copy the **anon/public** key

### Step 4: Update app.js
Open `app.js` and replace these lines at the top:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual credentials:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Step 5: Deploy (Optional)
To make the website accessible to everyone:
- Upload files to Netlify, Vercel, or GitHub Pages
- Or use any static hosting service

## Usage
1. **Log a Workout**: Select type, add optional notes, pick date, click "Log Workout"
2. **View History**: See all workouts grouped by date
3. **Filter**: Use dropdown to filter by workout type
4. **Dark Mode**: Click sun/moon icon in header
5. **Delete**: Click delete button on any workout entry

## File Structure
```
/workspace
├── index.html      # Main HTML file
├── styles.css      # Styles with dark mode support
├── app.js          # JavaScript with Supabase integration
└── README.md       # This file
```
