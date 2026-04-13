# Supabase Database Setup

## Step 1: Create the workouts table

Go to your Supabase dashboard: https://supabase.com/dashboard/project/smxompwxxkcvhygordqx

Navigate to **SQL Editor** and run this SQL command:

```sql
CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  notes TEXT,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 2: Enable Row Level Security (RLS)

Run this SQL to enable RLS and add policies for anonymous access:

```sql
-- Enable RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read workouts
CREATE POLICY "Allow public read access" ON workouts
  FOR SELECT USING (true);

-- Allow anyone to insert workouts
CREATE POLICY "Allow public insert access" ON workouts
  FOR INSERT WITH CHECK (true);

-- Allow anyone to delete workouts
CREATE POLICY "Allow public delete access" ON workouts
  FOR DELETE USING (true);
```

## Step 3: Test the connection

1. Open `index.html` in your browser
2. Open the browser console (F12)
3. You should see: "Supabase initialized successfully" and "Supabase connection verified"

## Step 4: Share with others

Once the table is set up, anyone who opens the website will:
- See all workouts logged by anyone
- Be able to add new workouts that everyone can see
- Have data sync automatically every 30 seconds

Your API credentials are already configured in `app.js`:
- URL: https://smxompwxxkcvhygordqx.supabase.co
- Project ID: smxompwxxkcvhygordqx
