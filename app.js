// --------------------------
// Tip Section
// --------------------------
const waterTips = [
  "Drinking water boosts your metabolism.",
  "Stay hydrated to maintain energy levels.",
  "Water helps to flush out toxins.",
  "Keeping hydrated improves skin health.",
  "Drinking water can help control calories.",
  "Water aids in digestion.",
  "Hydration improves cognitive performance.",
  "Water is essential for kidney health.",
  "Drinking water can help prevent headaches.",
  "Water supports healthy weight loss.",
  "Staying hydrated boosts your immune system.",
  "Water can help with joint lubrication.",
  "Proper hydration improves muscle performance.",
  "Water helps regulate body temperature.",
  "Hydration is key for healthy hair.",
  "Drinking water keeps your energy levels steady.",
  "Water consumption can reduce fatigue.",
  "Hydration aids in nutrient absorption.",
  "Water keeps your mind clear and focused.",
  "Regular water intake can improve mood."
];

function generateTip() {
  const tipIndex = Math.floor(Math.random() * waterTips.length);
  document.getElementById('water-tip').innerText = waterTips[tipIndex];
}

// --------------------------
// Global Variables
// --------------------------
// We'll store daily target in localStorage under 'dailyTarget'.
// Default to 2000 ml if not found.
let waterTarget = parseInt(localStorage.getItem('dailyTarget')) || 2000;
let waterTotal = 0; 
let waterHistory = [];

// --------------------------
// Visual Bottle & Streak Update
// --------------------------
function updateGlass() {
  const fillElement = document.getElementById('water-fill');
  if (fillElement) {
    const percentage = Math.min((waterTotal / waterTarget) * 100, 100);
    fillElement.style.height = percentage + '%';
  }
}

// Hydration streak: day is counted if consumption >= waterTarget
function updateStreak() {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = 'consumption-' + date.toISOString().split('T')[0];
    const consumption = localStorage.getItem(key);
    if (consumption && parseInt(consumption) >= waterTarget) {
      streak++;
    } else {
      break;
    }
  }
  const streakEl = document.getElementById('streak-count');
  if (streakEl) {
    streakEl.innerText = streak;
  }
}

// --------------------------
// Water Consumption Functions
// --------------------------
function updateWaterDisplay() {
  const totalEl = document.getElementById('water-total');
  if (totalEl) {
    totalEl.innerText = waterTotal;
  }
  updateGlass();
  updateStreak();
}

function addWater(amount) {
  waterTotal += amount;
  waterHistory.push(amount);
  updateWaterDisplay();
  checkTarget();
  saveDailyConsumption();
}

function undoWater() {
  if (waterHistory.length > 0) {
    const lastAmount = waterHistory.pop();
    waterTotal -= lastAmount;
    if (waterTotal < 0) {
      waterTotal = 0;
    }
    updateWaterDisplay();
    saveDailyConsumption();
  }
}

function clearWater() {
  waterTotal = 0;
  waterHistory = [];
  updateWaterDisplay();
  saveDailyConsumption();
}

function saveDailyConsumption() {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('consumption-' + today, waterTotal);
  updateCalendarSummary();
}

function checkTarget() {
  if (waterTotal >= waterTarget) {
    console.log("Daily water target achieved!");
  }
}

// --------------------------
// Calendar Generation & Summary
// --------------------------
function generateCalendar() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;
  
  calendarEl.innerHTML = ''; // clear previous calendar
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  // empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('calendar-day');
    calendarEl.appendChild(emptyCell);
  }
  
  // fill in each day
  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement('div');
    cell.classList.add('calendar-day');
    
    const daySpan = document.createElement('span');
    daySpan.innerText = day;
    cell.appendChild(daySpan);
    
    const dateKey = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const consumption = parseInt(localStorage.getItem('consumption-' + dateKey)) || 0;
    if (consumption >= waterTarget) {
      cell.classList.add('achieved');
    }
    
    calendarEl.appendChild(cell);
  }
}

function updateCalendarSummary() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  let achievedDays = 0;
  let totalIntake = 0;
  
  for (let day = 1; day <= totalDays; day++) {
    const dateKey = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const consumption = parseInt(localStorage.getItem('consumption-' + dateKey)) || 0;
    totalIntake += consumption;
    if (consumption >= waterTarget) {
      achievedDays++;
    }
  }
  
  // If you have an element for days achieved, update it:
  const daysAchievedEl = document.getElementById('days-achieved');
  if (daysAchievedEl) {
    daysAchievedEl.innerText = achievedDays;
  }
  
  // If you want to display total intake or something else, you can do so here
}

// --------------------------
// Desktop Notification & Reminder
// --------------------------
let reminderInterval;

function requestNotificationPermission() {
  // Check if Notification is supported
  if (typeof Notification === 'undefined') {
    console.log("Browser doesn't support notifications.");
    return;
  }
  
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log("Notification permission granted.");
        startReminders();
      } else {
        console.log("Notification permission denied.");
      }
    });
  } else if (Notification.permission === 'granted') {
    startReminders();
  } else {
    console.log("Notification permission denied.");
  }
}

function startReminders() {
  const frequency = parseInt(localStorage.getItem('reminderFrequency')) || 60;
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }
  reminderInterval = setInterval(() => {
    showNotification();
  }, frequency * 60 * 1000);
}

function showNotification() {
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification("Time to drink water!", {
      body: "Stay hydrated by drinking a glass of water.",
      // icon: "water.png" // uncomment or adjust path if you have a custom icon
    });
  }
}

function snoozeReminder() {
  const snoozeInput = document.getElementById('snooze-time');
  const snoozeTime = snoozeInput ? parseInt(snoozeInput.value) : 15;
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }
  setTimeout(startReminders, (isNaN(snoozeTime) ? 15 : snoozeTime) * 60 * 1000);
  alert(`Reminders snoozed for ${snoozeTime} minutes.`);
}

// --------------------------
// Settings Save (Frequency, Daily Target, Dark Mode, etc.)
// --------------------------
function saveSettings() {
  // Save frequency
  const freqInput = document.getElementById('reminder-frequency');
  if (freqInput) {
    const frequency = parseInt(freqInput.value);
    localStorage.setItem('reminderFrequency', frequency);
  }
  
  // Save daily target
  const dailyTargetInput = document.getElementById('daily-target');
  if (dailyTargetInput) {
    const newTarget = parseInt(dailyTargetInput.value);
    if (!isNaN(newTarget) && newTarget > 0) {
      localStorage.setItem('dailyTarget', newTarget);
      waterTarget = newTarget; // update global variable
      updateWaterDisplay();
      updateCalendarSummary();
    }
  }
  
  // Save dark mode
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    const isDarkMode = darkModeToggle.checked;
    localStorage.setItem('darkModeEnabled', isDarkMode ? 'true' : 'false');
    applyDarkMode(isDarkMode);
  }
  
  // Start reminders again with new settings
  startReminders();
  alert("Settings saved!");
}

function applyDarkMode(enable) {
  if (enable) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// --------------------------
// DOMContentLoaded Initialization
// --------------------------
document.addEventListener('DOMContentLoaded', function() {
  // 1. Request Notification Permission
  requestNotificationPermission();
  
  // 2. Load existing daily target (if any)
  const storedTarget = localStorage.getItem('dailyTarget');
  if (storedTarget) {
    waterTarget = parseInt(storedTarget);
  }
  
  // 3. Water intake buttons
  const waterButtons = document.querySelectorAll('.water-btn');
  waterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const amount = parseInt(this.getAttribute('data-amount'));
      addWater(amount);
    });
  });
  
  // 4. Custom water amount button
  const addCustomBtn = document.getElementById('add-custom');
  if (addCustomBtn) {
    addCustomBtn.addEventListener('click', () => {
      const customInput = document.getElementById('custom-amount');
      const amount = parseInt(customInput.value);
      if (!isNaN(amount) && amount > 0) {
        addWater(amount);
        customInput.value = '';
      }
    });
  }
  
  // 5. Undo and Clear
  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) {
    undoBtn.addEventListener('click', undoWater);
  }
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearWater);
  }
  
  // 6. Tips
  const newTipBtn = document.getElementById('new-tip-btn');
  if (newTipBtn) {
    newTipBtn.addEventListener('click', generateTip);
  }
  
  // 7. Settings
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Load frequency
    const freqVal = localStorage.getItem('reminderFrequency') || 60;
    const freqInput = document.getElementById('reminder-frequency');
    if (freqInput) {
      freqInput.value = freqVal;
    }
    
    // Load daily target
    const dailyTargetVal = parseInt(localStorage.getItem('dailyTarget')) || 2000;
    const dailyTargetInput = document.getElementById('daily-target');
    if (dailyTargetInput) {
      dailyTargetInput.value = dailyTargetVal;
    }
    
    // Load dark mode
    const darkPref = localStorage.getItem('darkModeEnabled');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      const isDark = (darkPref === 'true');
      darkModeToggle.checked = isDark;
      applyDarkMode(isDark);
    }
  }
  
  // 8. Snooze
  const snoozeInput = document.getElementById('snooze-time');
  if (snoozeInput) {
    snoozeInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        snoozeReminder();
      }
    });
  }
  
  // 9. Calendar
  generateCalendar();
  updateCalendarSummary();
  
  // 10. Load today's consumption
  const today = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem('consumption-' + today);
  if (saved) {
    waterTotal = parseInt(saved);
  }
  updateWaterDisplay();
});
