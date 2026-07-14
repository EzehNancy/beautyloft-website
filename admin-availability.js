const authToken = localStorage.getItem('authToken');

if (!authToken) {
  window.location.href = 'login.html';
}

let viewDate = new Date();
viewDate.setDate(1);
let overridesMap = {};
let selectedDateStr = null;

const calGrid = document.getElementById('calGrid');
const calMonthLabel = document.getElementById('calMonthLabel');
const dayEditor = document.getElementById('dayEditor');
const dayEditorLabel = document.getElementById('dayEditorLabel');

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

fetch('https://beautyloft-backend.onrender.com/me', {
  headers: { 'Authorization': 'Bearer ' + authToken }
})
  .then(function(response) {
    if (!response.ok) {
      window.location.href = 'login.html';
      return null;
    }
    return response.json();
  })
  .then(function(data) {
    if (!data) return;
    if (!data.user.is_admin) {
      window.location.href = 'index.html';
      return;
    }
    loadOverrides();
  });

document.getElementById('adminLogoutBtn').addEventListener('click', function() {
  fetch('https://beautyloft-backend.onrender.com/logout', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + authToken }
  }).then(function() {
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
  });
});

document.getElementById('mobileSidebarToggle').addEventListener('click', function() {
  document.querySelector('.admin-sidebar').classList.toggle('open');
});

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function loadOverrides() {
  fetch('https://beautyloft-backend.onrender.com/admin/availability-overrides', {
    headers: { 'Authorization': 'Bearer ' + authToken }
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      overridesMap = {};
      data.overrides.forEach(function(row) {
        overridesMap[row.override_date] = row.override_type;
      });
      renderCalendar();
    });
}

function renderCalendar() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  calMonthLabel.textContent = MONTH_NAMES[month] + ' ' + year;

  calGrid.innerHTML = '';

  DOW.forEach(function(d) {
    const el = document.createElement('div');
    el.className = 'cal-dow';
    el.textContent = d;
    calGrid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();

  for (let i = 0; i < startOffset; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    calGrid.appendChild(el);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = toISODate(date);
    const el = document.createElement('div');
    el.className = 'cal-day available';
    el.textContent = day;

    const overrideType = overridesMap[dateStr];
    if (overrideType === 'closed') {
      el.style.background = '#E8E8E8';
      el.style.color = '#9A9A9A';
    } else if (overrideType === 'models_only') {
      el.style.background = 'var(--gold)';
      el.style.color = 'var(--plum)';
    }

    el.addEventListener('click', function() {
      openDayEditor(dateStr, date);
    });

    calGrid.appendChild(el);
  }
}

function openDayEditor(dateStr, date) {
  selectedDateStr = dateStr;
  dayEditor.style.display = 'block';
  dayEditorLabel.textContent = date.toDateString() + ' — currently: ' + (overridesMap[dateStr] ? overridesMap[dateStr].replace('_', ' ') : 'open');
}

document.getElementById('setOpenBtn').addEventListener('click', function() {
  fetch('https://beautyloft-backend.onrender.com/admin/availability-overrides/' + selectedDateStr, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + authToken }
  }).then(function() {
    loadOverrides();
    dayEditor.style.display = 'none';
  });
});

document.getElementById('setModelsOnlyBtn').addEventListener('click', function() {
  saveOverride('models_only');
});

document.getElementById('setClosedBtn').addEventListener('click', function() {
  saveOverride('closed');
});

function saveOverride(type) {
  fetch('https://beautyloft-backend.onrender.com/admin/availability-overrides', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify({ date: selectedDateStr, type: type })
  }).then(function() {
    loadOverrides();
    dayEditor.style.display = 'none';
  });
}

document.getElementById('prevMonth').addEventListener('click', function() {
  viewDate.setMonth(viewDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', function() {
  viewDate.setMonth(viewDate.getMonth() + 1);
  renderCalendar();
});