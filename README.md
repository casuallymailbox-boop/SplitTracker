# Workout Tracker

A web application to track your workouts using Supabase for data storage.

## Features

- **Log Workouts**: Record your exercises with split type, sets, reps, weight, and notes
- **View History**: Filter workouts by time period (days, weeks, months, years) and split type
- **Statistics**: View workout analytics including total volume, most used splits, and timeline charts
- **Split Types**: Push, Pull, Shoulder, Legs, Upper, Arms

## Setup Instructions

### 1. Supabase Database Setup

You need to create a table in your Supabase database. Run the following SQL in your Supabase SQL Editor:

```sql
-- Create the workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    split TEXT NOT NULL,
    exercise TEXT NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight NUMERIC NOT NULL,
    notes TEXT,
    volume NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON workouts(created_at);
CREATE INDEX IF NOT EXISTS idx_workouts_split ON workouts(split);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for development)
-- In production, you should implement proper authentication
CREATE POLICY "Allow all operations" ON workouts
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

### 2. Configuration

The application is already configured with your Supabase URL: `https://smxompwxxkcvhygordqx.supabase.co`

**Important**: You need to generate an anon key from your Supabase project and update it in `app.js`:

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the `anon` public key
4. Replace the `SUPABASE_ANON_KEY` value in `app.js` with your actual key

### 3. Running the Application

Simply open `index.html` in a web browser, or serve it using a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then navigate to `http://localhost:8000` in your browser.

## File Structure

```
/workspace
├── index.html      # Main HTML file
├── styles.css      # Stylesheet
├── app.js          # JavaScript application logic
└── README.md       # This file
```

## Usage

1. **Log a Workout**: 
   - Select the split type (Push, Pull, Shoulder, Legs, Upper, Arms)
   - Enter exercise name, sets, reps, and weight
   - Add optional notes
   - Click "Save Workout"

2. **View History**:
   - Use the filter dropdowns to view workouts by time period and split type
   - Delete workouts using the delete button

3. **View Statistics**:
   - See total workouts, volume, most used split, and average workouts per week
   - View distribution charts by split and timeline

## Technologies Used

- HTML5
- CSS3 (with Flexbox and Grid)
- Vanilla JavaScript (ES6+)
- Supabase (Backend as a Service)

## License

MIT License
