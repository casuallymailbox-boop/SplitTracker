#!/usr/bin/env python3
"""
Simple Workout Tracker
Tracks daily workouts with a Push, Pull, Shoulder, Leg, Upper, Arms, Leg split.
Stores data in SQLite and allows viewing historical workout data.
"""

import sqlite3
from datetime import datetime
from typing import Optional

# Valid workout types based on your split
WORKOUT_TYPES = ["push", "pull", "shoulder", "leg", "upper", "arms"]

DATABASE_FILE = "workout_tracker.db"


def init_database():
    """Initialize the SQLite database and create the workouts table."""
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_type TEXT NOT NULL,
            notes TEXT,
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()


def log_workout(workout_type: str, notes: Optional[str] = None, date: Optional[str] = None):
    """
    Log a workout to the database.
    
    Args:
        workout_type: Type of workout (push, pull, shoulder, leg, upper, arms)
        notes: Optional notes about the workout
        date: Optional date (defaults to today)
    """
    workout_type = workout_type.lower()
    
    if workout_type not in WORKOUT_TYPES:
        print(f"Error: Invalid workout type '{workout_type}'")
        print(f"Valid types are: {', '.join(WORKOUT_TYPES)}")
        return False
    
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")
    
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO workouts (workout_type, notes, date) VALUES (?, ?, ?)",
            (workout_type, notes, date)
        )
        
        conn.commit()
        conn.close()
        
        print(f"✓ Workout logged: {workout_type.upper()} on {date}")
        if notes:
            print(f"  Notes: {notes}")
        return True
        
    except Exception as e:
        print(f"Error logging workout: {e}")
        return False


def view_history(days: int = 30, workout_type: Optional[str] = None):
    """
    View workout history.
    
    Args:
        days: Number of days to look back (default: 30)
        workout_type: Filter by specific workout type (optional)
    """
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    if workout_type:
        workout_type = workout_type.lower()
        cursor.execute("""
            SELECT id, workout_type, notes, date, created_at 
            FROM workouts 
            WHERE workout_type = ? AND date >= date('now', ?)
            ORDER BY date DESC, created_at DESC
        """, (workout_type, f"-{days} days"))
    else:
        cursor.execute("""
            SELECT id, workout_type, notes, date, created_at 
            FROM workouts 
            WHERE date >= date('now', ?)
            ORDER BY date DESC, created_at DESC
        """, (f"-{days} days",))
    
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        print("No workouts found in the specified period.")
        return
    
    print(f"\n{'='*60}")
    print(f"WORKOUT HISTORY (Last {days} days)")
    if workout_type:
        print(f"Filter: {workout_type.upper()}")
    print(f"{'='*60}\n")
    
    current_date = None
    for row in rows:
        workout_id, w_type, notes, date, created_at = row
        
        # Print date header when date changes
        if date != current_date:
            current_date = date
            print(f"\n📅 {date}")
            print("-" * 40)
        
        print(f"  • {w_type.upper()}")
        if notes:
            print(f"    Notes: {notes}")
    
    print(f"\n{'='*60}")
    print(f"Total workouts: {len(rows)}")
    print(f"{'='*60}\n")


def view_summary():
    """View a summary of workouts by type."""
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT workout_type, COUNT(*) as count, 
               MAX(date) as last_done,
               MIN(date) as first_done
        FROM workouts 
        GROUP BY workout_type 
        ORDER BY count DESC
    """)
    
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        print("No workouts logged yet.")
        return
    
    print(f"\n{'='*60}")
    print("WORKOUT SUMMARY")
    print(f"{'='*60}\n")
    print(f"{'Workout Type':<12} {'Count':<8} {'Last Done':<12} {'First Done':<12}")
    print("-" * 60)
    
    for row in rows:
        w_type, count, last_done, first_done = row
        print(f"{w_type.upper():<12} {count:<8} {last_done or 'N/A':<12} {first_done or 'N/A':<12}")
    
    print(f"\n{'='*60}\n")


def delete_workout(workout_id: int):
    """Delete a workout by ID."""
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM workouts WHERE id = ?", (workout_id,))
    
    if cursor.rowcount > 0:
        conn.commit()
        print(f"✓ Workout #{workout_id} deleted.")
    else:
        print(f"Workout #{workout_id} not found.")
    
    conn.close()


def show_help():
    """Display help information."""
    print(f"""
{'='*60}
WORKOUT TRACKER - HELP
{'='*60}

Available Commands:
  log <type> [notes] [--date YYYY-MM-DD]  - Log a workout
  history [days] [--type TYPE]            - View workout history
  summary                                 - View workout summary by type
  delete <id>                             - Delete a workout by ID
  help                                    - Show this help message
  quit/exit                               - Exit the application

Workout Types:
  {', '.join(w.upper() for w in WORKOUT_TYPES)}

Examples:
  log push "Chest day - felt strong"
  log pull --date 2024-01-15
  history 7
  history --type leg
  summary
  delete 5

{'='*60}
""")


def parse_command(command: str):
    """Parse and execute a command."""
    parts = command.strip().split()
    
    if not parts:
        return True
    
    cmd = parts[0].lower()
    
    if cmd in ["quit", "exit", "q"]:
        return False
    
    elif cmd == "help":
        show_help()
    
    elif cmd == "log":
        if len(parts) < 2:
            print("Error: Please specify a workout type")
            print(f"Valid types: {', '.join(WORKOUT_TYPES)}")
            return True
        
        workout_type = parts[1]
        notes = None
        date = None
        
        # Parse remaining arguments
        i = 2
        while i < len(parts):
            if parts[i] == "--date" and i + 1 < len(parts):
                date = parts[i + 1]
                i += 2
            elif not parts[i].startswith("--"):
                # Collect notes
                if notes is None:
                    notes = parts[i]
                else:
                    notes += " " + parts[i]
                i += 1
            else:
                i += 1
        
        log_workout(workout_type, notes, date)
    
    elif cmd == "history":
        days = 30
        workout_type = None
        
        i = 1
        while i < len(parts):
            if parts[i] == "--type" and i + 1 < len(parts):
                workout_type = parts[i + 1]
                i += 2
            elif parts[i].isdigit():
                days = int(parts[i])
                i += 1
            else:
                i += 1
        
        view_history(days, workout_type)
    
    elif cmd == "summary":
        view_summary()
    
    elif cmd == "delete":
        if len(parts) < 2 or not parts[1].isdigit():
            print("Error: Please specify a valid workout ID")
            return True
        
        delete_workout(int(parts[1]))
    
    else:
        print(f"Unknown command: {cmd}")
        print("Type 'help' for available commands.")
    
    return True


def main():
    """Main application loop."""
    print(f"""
{'='*60}
🏋️  WORKOUT TRACKER
{'='*60}
Tracking your Push, Pull, Shoulder, Leg, Upper, Arms, Leg split

Type 'help' for available commands or 'quit' to exit.
{'='*60}
""")
    
    # Initialize database
    init_database()
    
    # Main loop
    while True:
        try:
            command = input("\n> ").strip()
            if not parse_command(command):
                break
        except KeyboardInterrupt:
            print("\n\nGoodbye! Keep crushing those workouts! 💪")
            break
        except EOFError:
            break
    
    print("\nGoodbye! Keep crushing those workouts! 💪\n")


if __name__ == "__main__":
    main()
