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
let waterTotal = 0;
let waterHistory = [];
// We store the daily target in localStorage, but default to 2000 if not set
let waterTarget = parseInt(localStorage.getItem('dailyTarget')) || 2000;

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

// Streak for the last 7 days
// Note the condition for counting a day as achieved is > waterTarget
function updateStreak() {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = 'consumption-' + date.toISOString().split('T')[0];
    const consumption = localStorage.getItem(key);
    if (consumption && parseInt(consumption) > waterTarget) {
      streak++;
    } else {
      break;
    }
  }
  const streakEl = document.getElementById('streak-count');
  if (streakEl) streakEl.innerText = streak;
}

// --------------------------
// Water Consumption Functions
// --------------------------
function updateWaterDisplay() {
  const totalEl = document.getElementById('water-total');
  if (totalEl) totalEl.innerText = waterTotal;
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

// No longer logs "achieved" if consumption === waterTarget
function checkTarget() {
  if (waterTotal > waterTarget) {
    console.log("Daily water target exceeded!");
  }
}

function undoWater() {
  if (waterHistory.length > 0) {
    const lastAmount = waterHistory.pop();
    waterTotal -= lastAmount;
    if (waterTotal < 0) waterTotal = 0;
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
  
  // empty cells for days before first of month
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
    
    // For a day to be "achieved", consumption must be > waterTarget
    if (consumption > waterTarget) {
      cell.classList.add('achieved');
    }
    
    calendarEl.appendChild(cell);
  }
}

// We also adjust the summary so that a day is "achieved" only if > waterTarget
function updateCalendarSummary() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  let achievedDays = 0;
  let totalIntake = 0;
  let personalBest = 0; // track the highest single-day consumption
  let longestStreak = 0;
  let currentStreak = 0;
  
  for (let day = 1; day <= totalDays; day++) {
    const dateKey = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const consumption = parseInt(localStorage.getItem('consumption-' + dateKey.replace('consumption-', 'consumption-'))) || 0;
    
    totalIntake += consumption;
    
    // personal best
    if (consumption > personalBest) {
      personalBest = consumption;
    }
    // streak logic: day is "achieved" if consumption > waterTarget
    if (consumption > waterTarget) {
      achievedDays++;
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }
  
  // Update summary elements
  const daysAchievedEl = document.getElementById('days-achieved');
  const totalMonthEl = document.getElementById('month-total');
  const bestDayEl = document.getElementById('best-day');
  const longestStreakEl = document.getElementById('longest-streak');
  
  if (daysAchievedEl) daysAchievedEl.innerText = achievedDays;
  if (totalMonthEl) totalMonthEl.innerText = totalIntake;
  if (bestDayEl) bestDayEl.innerText = personalBest;
  if (longestStreakEl) longestStreakEl.innerText = longestStreak;
}

// --------------------------
// Desktop Notification & Reminder
// --------------------------
let reminderInterval;

function requestNotificationPermission() {
  if (typeof Notification === "undefined") {
    console.log("Notifications are not supported in this browser.");
    return;
  }
  
  if (Notification.permission === "default") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
        startReminders();
      } else {
        console.log("Notification permission denied.");
      }
    });
  } else if (Notification.permission === "granted") {
    startReminders();
  } else {
    console.log("Notification permission denied.");
  }
}

function startReminders() {
  const frequency = parseInt(localStorage.getItem('reminderFrequency')) || 60;
  if (reminderInterval) clearInterval(reminderInterval);
  reminderInterval = setInterval(() => {
    showNotification();
  }, frequency * 60 * 1000);
}

function showNotification() {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification("Time to drink water!", {
      body: "Stay hydrated by drinking a glass of water.",
      icon: "water.png"
    });
  }
}

function snoozeReminder() {
  const snoozeTime = parseInt(document.getElementById('snooze-time').value) || 15;
  if (reminderInterval) clearInterval(reminderInterval);
  setTimeout(startReminders, snoozeTime * 60 * 1000);
  alert(`Reminders snoozed for ${snoozeTime} minutes.`);
}

// --------------------------
// Settings Save (Daily Target, Dark Mode, etc.)
// --------------------------
function saveSettings() {
  // Reminder Frequency
  const frequency = document.getElementById('reminder-frequency').value;
  localStorage.setItem('reminderFrequency', frequency);
  
  // Daily Target
  const dailyTargetInput = document.getElementById('daily-target');
  if (dailyTargetInput) {
    const newTarget = parseInt(dailyTargetInput.value);
    if (!isNaN(newTarget) && newTarget > 0) {
      localStorage.setItem('dailyTarget', newTarget);
      waterTarget = newTarget; // update the global variable
      updateWaterDisplay();
      updateCalendarSummary();
    }
  }
  
  // Dark Mode
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    const isDark = darkModeToggle.checked;
    localStorage.setItem('darkModeEnabled', isDark ? 'true' : 'false');
    applyDarkMode(isDark);
  }
  
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
  // Request notification permission on load
  requestNotificationPermission();
  
  // Water intake buttons
  const waterButtons = document.querySelectorAll('.water-btn');
  waterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const amount = parseInt(this.getAttribute('data-amount'));
      addWater(amount);
    });
  });
  
  // Custom water amount button
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
  
  // Undo and clear buttons
  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) {
    undoBtn.addEventListener('click', undoWater);
  }
  
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearWater);
  }
  
  // Tip generation button
  const newTipBtn = document.getElementById('new-tip-btn');
  if (newTipBtn) {
    newTipBtn.addEventListener('click', generateTip);
  }
  
  // Save settings button on settings page
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Load existing frequency setting if available
    const frequency = localStorage.getItem('reminderFrequency') || 60;
    document.getElementById('reminder-frequency').value = frequency;
    
    // Load daily target
    const dailyTargetVal = parseInt(localStorage.getItem('dailyTarget')) || 2000;
    document.getElementById('daily-target').value = dailyTargetVal;
    
    // Load dark mode preference
    const darkModePref = localStorage.getItem('darkModeEnabled');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModePref === 'true') {
      darkModeToggle.checked = true;
      applyDarkMode(true);
    }
  }
  
  // Snooze listener on settings page
  const snoozeInput = document.getElementById('snooze-time');
  if (snoozeInput) {
    snoozeInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        snoozeReminder();
      }
    });
  }
  
  // Generate calendar if on calendar page
  generateCalendar();
  updateCalendarSummary();
  
  // Load today's consumption
  const today = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem('consumption-' + today);
  if (saved) {
    waterTotal = parseInt(saved);
  }
  updateWaterDisplay();
});
