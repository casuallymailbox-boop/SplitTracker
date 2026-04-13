// Configuration for Supabase (you'll need to replace with your own credentials)
const SUPABASE_URL = 'https://smxompwxxkcvhygordqx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNteG9tcHd4eGtjdmh5Z29yZHF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzYyOTYsImV4cCI6MjA5MTY1MjI5Nn0.9SWSc915b-7bekinx0_RXgWCUSHNezJp8Qyzl7GM5l4';

// For demo purposes, we'll use localStorage if Supabase is not configured
let useSupabase = false;
let supabaseClient = null;

// Initialize Supabase client if credentials are provided
async function initSupabase() {
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            // Dynamic import for Supabase
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            useSupabase = true;
            console.log('Supabase initialized successfully');
        } catch (error) {
            console.warn('Supabase initialization failed, falling back to localStorage:', error);
            useSupabase = false;
        }
    }
}

// Workout types configuration
const workoutTypes = ['push', 'pull', 'shoulder', 'leg', 'upper', 'arms'];

// DOM Elements
const workoutForm = document.getElementById('workout-form');
const workoutTypeSelect = document.getElementById('workout-type');
const workoutNotesInput = document.getElementById('workout-notes');
const workoutDateInput = document.getElementById('workout-date');
const historyContainer = document.getElementById('history-container');
const summaryContainer = document.getElementById('summary-container');
const filterTypeSelect = document.getElementById('filter-type');
const themeToggle = document.getElementById('theme-toggle');
const toast = document.getElementById('toast');

// Set default date to today
workoutDateInput.valueAsDate = new Date();

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Toggle theme
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Show toast notification
function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save workout to storage
async function saveWorkout(workout) {
    if (useSupabase && supabaseClient) {
        const { data, error } = await supabaseClient
            .from('workouts')
            .insert([workout]);
        
        if (error) throw error;
        return data;
    } else {
        // Fallback to localStorage
        const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        workouts.push(workout);
        localStorage.setItem('workouts', JSON.stringify(workouts));
        return workout;
    }
}

// Get all workouts from storage
async function getWorkouts() {
    if (useSupabase && supabaseClient) {
        const { data, error } = await supabaseClient
            .from('workouts')
            .select('*')
            .order('date', { ascending: false });
        
        if (error) throw error;
        return data;
    } else {
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('workouts') || '[]');
    }
}

// Delete workout from storage
async function deleteWorkout(id) {
    if (useSupabase && supabaseClient) {
        const { error } = await supabaseClient
            .from('workouts')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    } else {
        // Fallback to localStorage
        const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        const filtered = workouts.filter(w => w.id !== id);
        localStorage.setItem('workouts', JSON.stringify(filtered));
    }
}

// Render summary cards
function renderSummary(workouts) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentWorkouts = workouts.filter(w => new Date(w.date) >= oneWeekAgo);
    
    const counts = {};
    workoutTypes.forEach(type => {
        counts[type] = recentWorkouts.filter(w => w.type === type).length;
    });
    
    summaryContainer.innerHTML = workoutTypes.map(type => `
        <div class="summary-card ${type}">
            <span class="summary-count">${counts[type]}</span>
            <span class="summary-label">${type}</span>
        </div>
    `).join('');
}

// Render history
function renderHistory(workouts, filter = 'all') {
    const filtered = filter === 'all' 
        ? workouts 
        : workouts.filter(w => w.type === filter);
    
    if (filtered.length === 0) {
        historyContainer.innerHTML = '<div class="no-data">No workouts logged yet. Start tracking your fitness journey!</div>';
        return;
    }
    
    // Group by date
    const grouped = {};
    filtered.forEach(workout => {
        if (!grouped[workout.date]) {
            grouped[workout.date] = [];
        }
        grouped[workout.date].push(workout);
    });
    
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
    
    historyContainer.innerHTML = sortedDates.map(date => {
        const dateWorkouts = grouped[date];
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
            <div class="history-date-group">
                <h3 style="margin: 15px 0 10px; color: var(--text-secondary); font-size: 1rem;">${formattedDate}</h3>
                ${dateWorkouts.map(workout => `
                    <div class="history-item ${workout.type}">
                        <div class="history-date">${new Date(workout.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                        <div class="history-content">
                            <div class="history-type">${workout.type}</div>
                            ${workout.notes ? `<div class="history-notes">${workout.notes}</div>` : ''}
                        </div>
                        <div class="history-actions">
                            <button class="btn-delete" onclick="handleDelete('${workout.id}')">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

// Handle form submission
workoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const workout = {
        id: generateId(),
        type: workoutTypeSelect.value,
        notes: workoutNotesInput.value.trim(),
        date: workoutDateInput.value,
        createdAt: new Date().toISOString()
    };
    
    try {
        await saveWorkout(workout);
        showToast(`✓ ${workout.type} workout logged successfully!`);
        workoutForm.reset();
        workoutDateInput.valueAsDate = new Date();
        await loadAndRenderData();
    } catch (error) {
        console.error('Error saving workout:', error);
        showToast('Error saving workout. Please try again.');
    }
});

// Handle filter change
filterTypeSelect.addEventListener('change', async () => {
    const workouts = await getWorkouts();
    renderHistory(workouts, filterTypeSelect.value);
});

// Handle delete
window.handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this workout?')) {
        try {
            await deleteWorkout(id);
            showToast('Workout deleted successfully');
            await loadAndRenderData();
        } catch (error) {
            console.error('Error deleting workout:', error);
            showToast('Error deleting workout. Please try again.');
        }
    }
};

// Load and render all data
async function loadAndRenderData() {
    try {
        const workouts = await getWorkouts();
        renderSummary(workouts);
        renderHistory(workouts, filterTypeSelect.value);
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data. Please refresh the page.');
    }
}

// Initialize app
async function init() {
    initTheme();
    await initSupabase();
    await loadAndRenderData();
    
    // Auto-refresh every 30 seconds if using Supabase
    if (useSupabase) {
        setInterval(loadAndRenderData, 30000);
    }
}

init();
