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
// Visual Bottle & Streak Update
// --------------------------
let waterTotal = 0;
const waterTarget = 2000; // in ml
let waterHistory = [];

function updateGlass() {
  const fillElement = document.getElementById('water-fill');
  if (fillElement) {
    let percentage = Math.min((waterTotal / waterTarget) * 100, 100);
    fillElement.style.height = percentage + '%';
  }
}

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
  if(streakEl) streakEl.innerText = streak;
}

// --------------------------
// Water Consumption Functions
// --------------------------
function updateWaterDisplay() {
  const totalEl = document.getElementById('water-total');
  if(totalEl) totalEl.innerText = waterTotal;
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
  
  // empty cells for days before first of month
  for (let i = 0; i < firstDay; i++){
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('calendar-day');
    calendarEl.appendChild(emptyCell);
  }
  
  // fill in each day
  for (let day = 1; day <= totalDays; day++){
    const cell = document.createElement('div');
    cell.classList.add('calendar-day');
    
    const daySpan = document.createElement('span');
    daySpan.innerText = day;
    cell.appendChild(daySpan);
    
    const dateKey = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const consumption = localStorage.getItem('consumption-' + dateKey);
    if (consumption && parseInt(consumption) >= waterTarget) {
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
  
  for (let day = 1; day <= totalDays; day++){
    const dateKey = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const consumption = localStorage.getItem('consumption-' + dateKey);
    if (consumption) {
      totalIntake += parseInt(consumption);
      if (parseInt(consumption) >= waterTarget) {
        achievedDays++;
      }
    }
  }
  
  const avgIntake = totalDays > 0 ? Math.round(totalIntake / totalDays) : 0;
  
  const daysAchievedEl = document.getElementById('days-achieved');
  const avgIntakeEl = document.getElementById('avg-intake');
  if (daysAchievedEl) daysAchievedEl.innerText = achievedDays;
  if (avgIntakeEl) avgIntakeEl.innerText = avgIntake;
}

// --------------------------
// Desktop Notification & Reminder
// --------------------------
let reminderInterval;

function requestNotificationPermission() {
  // If permission is default, request it
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
  // Get reminder frequency from settings (default: 60 minutes)
  const frequency = parseInt(localStorage.getItem('reminderFrequency')) || 60;
  if (reminderInterval) clearInterval(reminderInterval);
  reminderInterval = setInterval(() => {
    showNotification();
  }, frequency * 60 * 1000);
}

function showNotification() {
  if (Notification.permission === "granted") {
    new Notification("Time to drink water!", {
      body: "Stay hydrated by drinking a glass of water.",
      icon: "water.png" // QUOTED to avoid syntax error
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
// Settings Save
// --------------------------
function saveSettings() {
  const frequency = document.getElementById('reminder-frequency').value;
  localStorage.setItem('reminderFrequency', frequency);
  startReminders();
  alert("Settings saved! Reminder frequency set to " + frequency + " minutes.");
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
    const frequency = localStorage.getItem('reminderFrequency') || 60;
    document.getElementById('reminder-frequency').value = frequency;
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
  
  // Update display with saved data (if any) for today
  const today = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem('consumption-' + today);
  if (saved) {
    waterTotal = parseInt(saved);
    updateWaterDisplay();
  }
});
