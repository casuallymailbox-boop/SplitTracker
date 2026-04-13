// Supabase Configuration
const SUPABASE_URL = 'https://smxompwxxkcvhygordqx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNteG9tcHd4eGtjdmh5Z29yZHF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MTQ1NzEsImV4cCI6MjA1OTE5MDU3MX0.qXv5bTEW7DTHqTczGLnKqgJ8f8L_0rPvCqN9BqJqJqE';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const workoutForm = document.getElementById('workout-form');
const historyList = document.getElementById('history-list');
const historyFilter = document.getElementById('history-filter');
const splitFilter = document.getElementById('split-filter');
const statsFilter = document.getElementById('stats-filter');

// Tab Navigation
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === targetTab) {
                content.classList.add('active');
            }
        });
        
        // Load data when switching to history or stats tabs
        if (targetTab === 'history') {
            loadWorkouts();
        } else if (targetTab === 'stats') {
            loadStats();
        }
    });
});

// Form Submission
workoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const split = document.getElementById('split').value;
    const exercise = document.getElementById('exercise').value;
    const sets = parseInt(document.getElementById('sets').value);
    const reps = parseInt(document.getElementById('reps').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const notes = document.getElementById('notes').value;
    
    const workoutData = {
        split,
        exercise,
        sets,
        reps,
        weight,
        notes,
        volume: sets * reps * weight,
        created_at: new Date().toISOString()
    };
    
    try {
        const { data, error } = await supabase
            .from('workouts')
            .insert([workoutData]);
        
        if (error) throw error;
        
        showSuccessMessage('Workout logged successfully!');
        workoutForm.reset();
        
        // Reload history if on that tab
        if (document.getElementById('history').classList.contains('active')) {
            loadWorkouts();
        }
    } catch (error) {
        console.error('Error saving workout:', error);
        showErrorMessage('Failed to save workout. Please try again.');
    }
});

// Load Workouts
async function loadWorkouts() {
    historyList.innerHTML = '<p class="loading">Loading workouts...</p>';
    
    const filterValue = historyFilter.value;
    const splitValue = splitFilter.value;
    
    let query = supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false });
    
    // Apply date filter
    const now = new Date();
    let startDate;
    
    switch (filterValue) {
        case 'days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            query = query.gte('created_at', startDate.toISOString());
            break;
        case 'weeks':
            startDate = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);
            query = query.gte('created_at', startDate.toISOString());
            break;
        case 'months':
            startDate = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
            query = query.gte('created_at', startDate.toISOString());
            break;
        case 'years':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            query = query.gte('created_at', startDate.toISOString());
            break;
    }
    
    // Apply split filter
    if (splitValue !== 'all') {
        query = query.eq('split', splitValue);
    }
    
    try {
        const { data, error } = await query;
        
        if (error) throw error;
        
        displayWorkouts(data || []);
    } catch (error) {
        console.error('Error loading workouts:', error);
        historyList.innerHTML = '<p class="error-message">Failed to load workouts. Please try again.</p>';
    }
}

// Display Workouts
function displayWorkouts(workouts) {
    if (!workouts || workouts.length === 0) {
        historyList.innerHTML = '<p class="no-data">No workouts found. Start logging your workouts!</p>';
        return;
    }
    
    historyList.innerHTML = workouts.map(workout => `
        <div class="workout-item">
            <div class="workout-header">
                <span class="workout-split">${workout.split}</span>
                <span class="workout-date">${formatDate(workout.created_at)}</span>
            </div>
            <div class="workout-exercise">${workout.exercise}</div>
            <div class="workout-details">
                <div class="workout-detail">
                    <strong>${workout.sets}</strong> sets × <strong>${workout.reps}</strong> reps
                </div>
                <div class="workout-detail">
                    <strong>${workout.weight}</strong> kg
                </div>
                <div class="workout-detail">
                    Volume: <strong>${workout.volume.toFixed(1)}</strong> kg
                </div>
            </div>
            ${workout.notes ? `<div class="workout-notes">${workout.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteWorkout('${workout.id}')">Delete</button>
        </div>
    `).join('');
}

// Delete Workout
async function deleteWorkout(id) {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    
    try {
        const { error } = await supabase
            .from('workouts')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showSuccessMessage('Workout deleted successfully!');
        loadWorkouts();
    } catch (error) {
        console.error('Error deleting workout:', error);
        showErrorMessage('Failed to delete workout. Please try again.');
    }
}

// Load Statistics
async function loadStats() {
    const filterValue = statsFilter.value;
    
    try {
        let query = supabase
            .from('workouts')
            .select('*')
            .order('created_at', { ascending: true });
        
        // Apply date filter for stats
        const now = new Date();
        let startDate;
        
        switch (filterValue) {
            case 'days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                query = query.gte('created_at', startDate.toISOString());
                break;
            case 'weeks':
                startDate = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);
                query = query.gte('created_at', startDate.toISOString());
                break;
            case 'months':
                startDate = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
                query = query.gte('created_at', startDate.toISOString());
                break;
            case 'years':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                query = query.gte('created_at', startDate.toISOString());
                break;
        }
        
        const { data: allWorkouts, error } = await query;
        
        if (error) throw error;
        
        const workouts = allWorkouts || [];
        
        // Calculate basic stats
        const totalWorkouts = workouts.length;
        const totalVolume = workouts.reduce((sum, w) => sum + (w.volume || 0), 0);
        
        // Most used split
        const splitCounts = {};
        workouts.forEach(w => {
            splitCounts[w.split] = (splitCounts[w.split] || 0) + 1;
        });
        
        let mostSplit = '-';
        let maxCount = 0;
        for (const [split, count] of Object.entries(splitCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostSplit = split;
            }
        }
        
        // Average workouts per week
        let avgPerWeek = 0;
        if (workouts.length > 0) {
            const firstDate = new Date(workouts[0].created_at);
            const lastDate = new Date(workouts[workouts.length - 1].created_at);
            const weeksDiff = Math.max(1, Math.ceil((lastDate - firstDate) / (7 * 24 * 60 * 60 * 1000)));
            avgPerWeek = (totalWorkouts / weeksDiff).toFixed(1);
        }
        
        // Update stat cards
        document.getElementById('total-workouts').textContent = totalWorkouts;
        document.getElementById('total-volume').textContent = totalVolume.toLocaleString(undefined, { maximumFractionDigits: 1 });
        document.getElementById('most-split').textContent = mostSplit !== '-' ? mostSplit.charAt(0).toUpperCase() + mostSplit.slice(1) : '-';
        document.getElementById('avg-per-week').textContent = avgPerWeek;
        
        // Render split distribution chart
        renderSplitChart(splitCounts);
        
        // Render timeline chart based on filter
        renderTimelineChart(workouts, filterValue);
        
    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('split-chart').innerHTML = '<p class="error-message">Failed to load statistics</p>';
        document.getElementById('timeline-chart').innerHTML = '<p class="error-message">Failed to load statistics</p>';
    }
}

// Render Split Chart
function renderSplitChart(splitCounts) {
    const splits = ['push', 'pull', 'shoulder', 'legs', 'upper', 'arms'];
    const maxCount = Math.max(...Object.values(splitCounts), 1);
    
    const chartHtml = splits.map(split => {
        const count = splitCounts[split] || 0;
        const percentage = (count / maxCount) * 100;
        
        return `
            <div class="split-bar">
                <div class="split-bar-label">${split}</div>
                <div class="split-bar-container">
                    <div class="split-bar-fill" style="height: ${percentage}%"></div>
                    <div class="split-bar-value">${count}</div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('split-chart').innerHTML = chartHtml;
}

// Render Timeline Chart
function renderTimelineChart(workouts, filterValue) {
    if (workouts.length === 0) {
        document.getElementById('timeline-chart').innerHTML = '<p class="no-data">No data available</p>';
        return;
    }
    
    const groupedData = groupWorkoutsByTime(workouts, filterValue);
    const maxValue = Math.max(...Object.values(groupedData), 1);
    
    const chartHtml = Object.entries(groupedData).map(([label, count]) => {
        const percentage = (count / maxValue) * 100;
        
        return `
            <div class="timeline-item">
                <div class="timeline-label">${label}</div>
                <div class="timeline-bar-container">
                    <div class="timeline-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="timeline-value">${count}</div>
            </div>
        `;
    }).join('');
    
    document.getElementById('timeline-chart').innerHTML = chartHtml;
}

// Group Workouts by Time Period
function groupWorkoutsByTime(workouts, filterValue) {
    const groups = {};
    const now = new Date();
    
    workouts.forEach(workout => {
        const date = new Date(workout.created_at);
        let key;
        
        switch (filterValue) {
            case 'days':
                key = formatDateShort(date);
                break;
            case 'weeks':
                key = getWeekLabel(date);
                break;
            case 'months':
                key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                break;
            case 'years':
                key = date.getFullYear().toString();
                break;
            default:
                key = formatDateShort(date);
        }
        
        groups[key] = (groups[key] || 0) + 1;
    });
    
    // Sort by date
    const sortedKeys = Object.keys(groups).sort((a, b) => {
        const dateA = parseGroupKey(a, filterValue);
        const dateB = parseGroupKey(b, filterValue);
        return dateA - dateB;
    });
    
    const sortedGroups = {};
    sortedKeys.forEach(key => {
        sortedGroups[key] = groups[key];
    });
    
    return sortedGroups;
}

// Helper Functions
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateShort(date) {
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
    });
}

function getWeekLabel(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date - firstDayOfYear) / (24 * 60 * 60 * 1000);
    const weekNum = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
    return `Week ${weekNum}`;
}

function parseGroupKey(key, filterValue) {
    const now = new Date();
    
    switch (filterValue) {
        case 'days':
            // Parse "Mon 15" format
            const parts = key.split(' ');
            const day = parseInt(parts[1]);
            const month = new Date(Date.parse(`${parts[0]} 1, 2024`)).getMonth();
            return new Date(now.getFullYear(), month, day);
        case 'weeks':
            const weekNum = parseInt(key.replace('Week ', ''));
            const firstDay = new Date(now.getFullYear(), 0, 1);
            return new Date(firstDay.getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1000);
        case 'months':
            return new Date(Date.parse(`01 ${key}, 2024`));
        case 'years':
            return new Date(parseInt(key), 0, 1);
        default:
            return new Date();
    }
}

// Show Messages
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    
    workoutForm.insertBefore(messageDiv, workoutForm.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function showErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.textContent = message;
    
    workoutForm.insertBefore(messageDiv, workoutForm.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Event Listeners for Filters
historyFilter.addEventListener('change', loadWorkouts);
splitFilter.addEventListener('change', loadWorkouts);
statsFilter.addEventListener('change', loadStats);

// Initial load
loadWorkouts();
