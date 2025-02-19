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
    daySpan.innerText = da
