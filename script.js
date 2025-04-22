// DOM Elements
const currentDateEl = document.getElementById('current-date');
const weatherContainer = document.getElementById('weather-container');
const locationEl = document.getElementById('location');
const weatherIconEl = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const weatherDescEl = document.getElementById('weather-description');
const moodBtns = document.querySelectorAll('.mood-btn');
const dailyNotesEl = document.getElementById('daily-notes');
const saveBtn = document.getElementById('save-btn');
const entriesContainer = document.getElementById('entries-container');
const noEntriesEl = document.getElementById('no-entries');
const moodFilter = document.getElementById('mood-filter');
const toast = document.getElementById('toast');
const isNoteEmpty = document.getElementById('daily-notes');

// State
let selectedMood = null;
let entries = JSON.parse(localStorage.getItem('moodEntries')) || [];
// const weatherIcons = {
//     '01d': '☀️', '01n': '🌙',
//     '02d': '⛅', '02n': '⛅',
//     '03d': '☁️', '03n': '☁️',
//     '04d': '☁️', '04n': '☁️',
//     '09d': '🌧️', '09n': '🌧️',
//     '10d': '🌦️', '10n': '🌦️',
//     '11d': '⛈️', '11n': '⛈️',
//     '13d': '❄️', '13n': '❄️',
//     '50d': '🌫️', '50n': '🌫️'
// };

// Initialize
function init() {
    setCurrentDate();
    loadEntries();
    setupEventListeners();
    getLocation();
    setupDarkMode();         
    setupDownloadButton();
}

// Set current date
function setCurrentDate() {
    const now = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
}

// Get user location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => fetchWeather(position.coords.latitude, position.coords.longitude),
            error => console.error('Geolocation error:', error)
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

// Fetch weather data
async function fetchWeather(lat, lon) {
    try {
        const apiKey = `https://api.weatherapi.com/v1/current.json?key=a0c21d3e2d2840a8b8062716231912&q=${lat},${lon}`; // Replace with your API key
        console.log(apiKey);
        
        const response = await fetch(apiKey);
        // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        console.log(data);
        
        weatherContainer.classList.remove('hidden');
        locationEl.textContent = `${data.location.name}, ${data.location.country}`;
        weatherIconEl.src = data.current.condition.icon;
        temperatureEl.textContent = `${Math.round(data.current.temp_c)}°C`;
        weatherDescEl.textContent = data.current.condition.text;
    } catch (error) {
        console.error('Error fetching weather:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            moodBtns.forEach(b => b.classList.remove('mood-selected', 'bg-yellow-100', 'bg-blue-100', 'bg-red-100', 'bg-green-100', 'bg-gray-200'));
            
            selectedMood = btn.dataset.mood;
            btn.classList.add('mood-selected');
            
            // Add background color based on mood
            switch(selectedMood) {
                case 'happy': btn.classList.add('bg-yellow-100'); break;
                case 'sad': btn.classList.add('bg-blue-100'); break;
                case 'angry': btn.classList.add('bg-red-100'); break;
                case 'calm': btn.classList.add('bg-green-100'); break;
                case 'tired': btn.classList.add('bg-gray-200'); break;
            }
            
            saveBtn.disabled = false;
        });
    });

    saveBtn.addEventListener('click', saveEntry);
    moodFilter.addEventListener('change', loadEntries);
}

// Save entry
function saveEntry() {

    if (isNoteEmpty.value.trim().length === 0){
        isNoteEmpty.value = '';
        alert(`Write Something here, it can't be empty...!`)
        return;
    }
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    
    const entry = {
        id: Date.now(),
        date: dateStr,
        time: timeStr,
        mood: selectedMood,
        notes: dailyNotesEl.value,
        weather: {
            location: locationEl.textContent,
            temperature: temperatureEl.textContent,
            description: weatherDescEl.textContent,
            icon: weatherIconEl.src
        }
    };
    
    entries.unshift(entry);
    localStorage.setItem('moodEntries', JSON.stringify(entries));
    
    // Reset form
    moodBtns.forEach(b => b.classList.remove('mood-selected', 'bg-yellow-100', 'bg-blue-100', 'bg-red-100', 'bg-green-100', 'bg-gray-200'));
    selectedMood = null;
    dailyNotesEl.value = '';
    saveBtn.disabled = true;
    
    // Show notification
    showToast();
    
    // Reload entries
    loadEntries();
}

// Show toast notification
function showToast() {
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Load entries
function loadEntries() {
    const filter = moodFilter.value;
    let filteredEntries = entries;
    
    if (filter !== 'all') {
        filteredEntries = entries.filter(entry => entry.mood === filter);
    }
    
    if (filteredEntries.length === 0) {
        noEntriesEl.classList.remove('hidden');
        entriesContainer.innerHTML = '';
        entriesContainer.appendChild(noEntriesEl);
        return;
    }
    
    noEntriesEl.classList.add('hidden');
    entriesContainer.innerHTML = '';
    
    filteredEntries.forEach(entry => {
        const entryEl = document.createElement('div');
        entryEl.className = 'border rounded-lg p-4 hover:shadow-md transition-shadow';
        
        // Mood color mapping
        const moodColors = {
            happy: 'bg-yellow-100',
            sad: 'bg-blue-100',
            angry: 'bg-red-100',
            calm: 'bg-green-100',
            tired: 'bg-gray-200'
        };
        
        entryEl.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="text-lg font-semibold">${formatDate(entry.date)}</span>
                    <span class="text-gray-500 text-sm ml-2">${entry.time}</span>
                </div>
                <span class="text-2xl">${getMoodEmoji(entry.mood)}</span>
            </div>
            <div class="flex items-center mb-2">
            <img id="weather-icon" class="w-10 h-10 mr-2" src="${entry.weather.icon}" alt="Weather icon">
                <span class="text-sm">${entry.weather.temperature}, ${entry.weather.description}</span>
            </div>
            ${entry.notes ? `<p class="text-gray-700 mt-2">${entry.notes}</p>` : ''}
            <div class="mt-3 flex justify-end">
                <button data-id="${entry.id}" class="delete-btn text-red-500 hover:text-red-700 text-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add mood-specific background
        entryEl.classList.add(moodColors[entry.mood]);
        
        entriesContainer.appendChild(entryEl);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            deleteEntry(id);
        });
    });
}

// Delete entry
function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        entries = entries.filter(entry => entry.id !== id);
        localStorage.setItem('moodEntries', JSON.stringify(entries));
        loadEntries();
    }
}

// Helper functions
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

function getMoodEmoji(mood) {
    const emojis = {
        happy: '😊',
        sad: '😢',
        angry: '😠',
        calm: '😌',
        tired: '😴'
    };
    return emojis[mood];
}

// Dark Mode Toggle
function setupDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved preference or use system preference
    if (localStorage.getItem('darkMode') === 'enabled' || 
        (localStorage.getItem('darkMode') === null && prefersDarkScheme.matches)) {
        document.documentElement.classList.add('dark');
    }
    
    darkModeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', document.documentElement.classList.contains('dark') ? 'enabled' : 'disabled');
    });
}

// Download Data Functionality
function setupDownloadButton() {
    const downloadBtn = document.getElementById('download-btn');
    
    downloadBtn.addEventListener('click', () => {
        if (entries.length === 0) {
            alert('No entries to download');
            return;
        }
        
        // Create a menu for download options
        const menu = document.createElement('div');
        menu.className = 'absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700';
        menu.innerHTML = `
            <button id="download-csv" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                Download as CSV
            </button>
            <button id="download-json" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                Download as JSON
            </button>
            <button id="download-pdf" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                Download as PDF
            </button>
        `;
        
        // Position and show menu
        menu.style.position = 'absolute';
        menu.style.top = `${downloadBtn.offsetTop + downloadBtn.offsetHeight}px`;
        menu.style.left = `${downloadBtn.offsetLeft - menu.offsetWidth + downloadBtn.offsetWidth}px`;
        downloadBtn.parentNode.appendChild(menu);
        
        // Handle CSV download
        document.getElementById('download-csv').addEventListener('click', () => {
            downloadEntries('csv');
            menu.remove();
        });
        
        // Handle JSON download
        document.getElementById('download-json').addEventListener('click', () => {
            downloadEntries('json');
            menu.remove();
        });

        // Handle PDF download
        document.getElementById('download-pdf').addEventListener('click', () => {
            downloadEntries('pdf');
            menu.remove();
        });
        
        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    });
}

function downloadEntries(format) {
    if (entries.length === 0) {
        alert('No entries to download');
        return;
    }
    
    if (format === 'csv') {
        // Convert to CSV
        const headers = ['Date', 'Time', 'Mood', 'Notes', 'Location', 'Temperature', 'Weather'];
        const rows = entries.map(entry => [
            entry.date,
            entry.time,
            entry.mood,
            entry.notes.replace(/"/g, '""'), // Escape quotes
            entry.weather.location,
            entry.weather.temperature,
            entry.weather.description
        ]);
        
        // Format as CSV
        const content = [
            headers.join(','),
            ...rows.map(row => `"${row.join('","')}"`)
        ].join('\n');
        
        // Create download link
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mood-journal-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
    } else if (format === 'pdf') {
        // Load jsPDF library dynamically
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = function() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(20);
            doc.text('Mood Journal Entries', 105, 15, { align: 'center', text: 'underlined'});
            
            // Add date
            doc.setFontSize(12);
            const d = new Date();
            doc.text(`Generated on: ${new Date()}`, 105, 25, { align: 'center' });
            
            let y = 40;
            entries.forEach((entry, index) => {
                if (y > 280) { // Add new page if running out of space
                    doc.addPage();
                    y = 20;
                }
                
                // Entry header
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 255); // Blue for date
                doc.text(`TimeStamp : ${entry.date} ${entry.time} - Mood Status : ${entry.mood.toUpperCase()}`, 15, y);
                
                // Weather info
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0); // Black for content
                doc.text(`Weather: ${entry.weather.description} (${entry.weather.temperature})`, 15, y + 10);
                
                // Notes
                if (entry.notes) {
                    const splitNotes = doc.splitTextToSize(entry.notes, 180);
                    doc.text(`Note : ${splitNotes}`, 15, y + 20);
                    y += 10 + (splitNotes.length * 7);
                }
                
                y += 30;
                
                // Add separator if not last entry
                if (index < entries.length - 1) {
                    doc.setDrawColor(200);
                    doc.line(15, y - 5, 195, y - 5);
                }
            });
            
            // Save the PDF - moved outside the forEach loop
            doc.save(`mood-journal-${new Date().toISOString().slice(0,10)}.pdf`);
        };
        document.head.appendChild(script);
        
    } else {
        // Convert to JSON
        const content = JSON.stringify(entries, null, 2);
        const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mood-journal-entries.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
// Initialize app
document.addEventListener('DOMContentLoaded', init);