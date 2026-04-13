// Workout Tracker Application
// Uses localStorage for data persistence

const WORKOUT_TYPES = ['push', 'pull', 'shoulder', 'leg', 'upper', 'arms'];
const STORAGE_KEY = 'workoutTrackerData';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeDateField();
    loadWorkouts();
    setupEventListeners();
});

// Set today's date as default
function initializeDateField() {
    const dateInput = document.getElementById('workout-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('workout-form');
    form.addEventListener('submit', handleFormSubmit);

    // Filter change
    const filterSelect = document.getElementById('filter-type');
    filterSelect.addEventListener('change', () => loadWorkouts());
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    const workoutType = document.getElementById('workout-type').value;
    const notes = document.getElementById('workout-notes').value.trim();
    const date = document.getElementById('workout-date').value;

    if (!workoutType || !date) {
        alert('Please select a workout type and date.');
        return;
    }

    const workout = {
        id: Date.now(),
        workoutType: workoutType,
        notes: notes,
        date: date,
        createdAt: new Date().toISOString()
    };

    saveWorkout(workout);
    resetForm();
    loadWorkouts();
    updateSummary();
}

// Save workout to localStorage
function saveWorkout(workout) {
    const workouts = getWorkouts();
    workouts.push(workout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    
    showNotification('Workout logged successfully! ✓');
}

// Get all workouts from localStorage
function getWorkouts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Load and display workouts
function loadWorkouts() {
    const workouts = getWorkouts();
    const filterType = document.getElementById('filter-type').value;
    const historyList = document.getElementById('history-list');

    // Filter workouts
    let filteredWorkouts = workouts;
    if (filterType !== 'all') {
        filteredWorkouts = workouts.filter(w => w.workoutType === filterType);
    }

    // Sort by date (newest first)
    filteredWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display workouts
    if (filteredWorkouts.length === 0) {
        historyList.innerHTML = '<div class="no-workouts">No workouts logged yet. Start tracking your fitness journey!</div>';
        return;
    }

    historyList.innerHTML = '';
    
    // Group by date
    const groupedWorkouts = {};
    filteredWorkouts.forEach(workout => {
        if (!groupedWorkouts[workout.date]) {
            groupedWorkouts[workout.date] = [];
        }
        groupedWorkouts[workout.date].push(workout);
    });

    // Render grouped workouts
    Object.keys(groupedWorkouts).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';
        dateHeader.innerHTML = `<h3 style="margin: 1rem 0 0.5rem 0; color: var(--text-primary);">${formatDate(date)}</h3>`;
        historyList.appendChild(dateHeader);

        groupedWorkouts[date].forEach(workout => {
            const entry = createWorkoutEntry(workout);
            historyList.appendChild(entry);
        });
    });

    updateSummary();
}

// Create workout entry element
function createWorkoutEntry(workout) {
    const entry = document.createElement('div');
    entry.className = `workout-entry ${workout.workoutType}`;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete workout';
    deleteBtn.onclick = () => deleteWorkout(workout.id);

    entry.innerHTML = `
        <div class="workout-header">
            <span class="workout-type">${workout.workoutType}</span>
            <span class="workout-date">${formatDate(workout.date)}</span>
        </div>
    `;

    if (workout.notes) {
        const notesDiv = document.createElement('div');
        notesDiv.className = 'workout-notes';
        notesDiv.textContent = workout.notes;
        entry.appendChild(notesDiv);
    }

    entry.appendChild(deleteBtn);
    return entry;
}

// Delete workout
function deleteWorkout(id) {
    if (!confirm('Are you sure you want to delete this workout?')) {
        return;
    }

    const workouts = getWorkouts();
    const filtered = workouts.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    loadWorkouts();
    showNotification('Workout deleted.');
}

// Update summary statistics
function updateSummary() {
    const workouts = getWorkouts();
    const summaryStats = document.getElementById('summary-stats');

    // Count workouts by type
    const counts = {};
    WORKOUT_TYPES.forEach(type => counts[type] = 0);
    
    workouts.forEach(workout => {
        if (counts[workout.workoutType] !== undefined) {
            counts[workout.workoutType]++;
        }
    });

    // Generate stat cards
    summaryStats.innerHTML = '';
    WORKOUT_TYPES.forEach(type => {
        const statCard = document.createElement('div');
        statCard.className = `stat-card ${type}`;
        statCard.innerHTML = `
            <div class="stat-number">${counts[type]}</div>
            <div class="stat-label">${type}</div>
        `;
        summaryStats.appendChild(statCard);
    });
}

// Reset form after submission
function resetForm() {
    document.getElementById('workout-form').reset();
    initializeDateField();
}

// Format date for display
function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
