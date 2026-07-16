const authToken = localStorage.getItem('authToken');

if (!authToken) {
  window.location.href = 'login.html';
}

let viewDate = new Date();
viewDate.setDate(1);
let selectedDate = null;
let selectedTime = null;

const calGrid = document.getElementById('calGrid');
const calMonthLabel = document.getElementById('calMonthLabel');
const slotSection = document.getElementById('slotSection');
const slotGrid = document.getElementById('slotGrid');
const slotDateLabel = document.getElementById('slotDateLabel');
const confirmBtn = document.getElementById('confirmBtn');
const modelBookingForm = document.getElementById('modelBookingForm');
const confirmPanel = document.getElementById('confirmPanel');
const bookSummary = document.getElementById('bookSummary');
const accessMessage = document.getElementById('accessMessage');
const bookingSection = document.getElementById('bookingSection');

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ---------- Step 1: check model status before showing anything ----------
fetch('https://beautyloft-backend.onrender.com/my-model-status', {
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

  if (data.status === 'accepted') {
    accessMessage.textContent = 'You\'re an approved BeautyLoft model — pick a day and time below.';
    bookingSection.style.display = 'block';

    document.getElementById('availabilitySection').style.display = 'block';

    renderCalendar();
    renderAvailabilityCalendar();
    loadMyAvailability();

  } else if (data.status === 'pending') {
    accessMessage.textContent = 'Your model application is still pending review. Once accepted, you\'ll be able to book a session here.';
  } else if (data.status === 'rejected') {
    accessMessage.textContent = 'This page is only available to approved BeautyLoft models.';
  } else {
    accessMessage.textContent = 'You haven\'t applied to model yet. Visit the Models page to apply.';
  }
});

// ---------- Calendar rendering (same pattern as booking.js) ----------
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = day;

    const isPast = date < today;

    if (isPast) {
      el.classList.add('disabled');
    } else {
      el.classList.add('available');
      el.addEventListener('click', function() {
        selectDate(date, el);
      });
    }

    calGrid.appendChild(el);
  }
}

function selectDate(date, el) {
  const previouslySelected = document.querySelector('.cal-day.selected');
  if (previouslySelected) {
    previouslySelected.classList.remove('selected');
  }

  el.classList.add('selected');
  selectedDate = date;
  selectedTime = null;
  renderSlots(date);
  updateConfirmState();
}

function formatHour(h) {
  const period = h >= 12 ? 'PM' : 'AM';
  let hour12 = h % 12;
  if (hour12 === 0) {
    hour12 = 12;
  }
  return hour12 + ':00 ' + period;
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

// ---------- Real availability check, same route booking.js uses, but as a model ----------
function renderSlots(date) {
  slotSection.style.display = 'block';
  slotDateLabel.textContent = date.toDateString();
  slotGrid.innerHTML = '<p>Checking availability...</p>';

  const isoDate = toISODate(date);

  fetch('https://beautyloft-backend.onrender.com/availability?date=' + isoDate + '&bookingType=model')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      slotGrid.innerHTML = '';

      if (data.closed) {
        slotGrid.innerHTML = '<p>Sorry, this day is not available for booking.</p>';
        return;
      }

      data.slots.forEach(function(slot) {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'slot-pill' + (slot.available ? '' : ' booked');
        pill.textContent = formatHour(slot.hour);
        pill.disabled = !slot.available;

        if (slot.available) {
          pill.addEventListener('click', function() {
            const previouslySelected = document.querySelector('.slot-pill.selected');
            if (previouslySelected) {
              previouslySelected.classList.remove('selected');
            }
            pill.classList.add('selected');
            selectedTime = formatHour(slot.hour);
            updateConfirmState();
          });
        }

        slotGrid.appendChild(pill);
      });
    });
}

function updateConfirmState() {
  if (selectedDate && selectedTime) {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Request ' + selectedDate.toDateString() + ' at ' + selectedTime;
    bookSummary.style.display = 'block';
    bookSummary.innerHTML = 'You\'re booking <b>' + selectedDate.toDateString() + '</b> at <b>' + selectedTime + '</b>.';
  } else {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Select a date and time first';
    bookSummary.style.display = 'none';
  }
}

document.getElementById('prevMonth').addEventListener('click', function() {
  viewDate.setMonth(viewDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', function() {
  viewDate.setMonth(viewDate.getMonth() + 1);
  renderCalendar();
});

// ---------- Submit the model booking ----------
modelBookingForm.addEventListener('submit', function(e) {
  e.preventDefault();

  if (!selectedDate || !selectedTime) return;

  const isoDate = toISODate(selectedDate);
  const notes = document.getElementById('notes').value;

  fetch('https://beautyloft-backend.onrender.com/model-bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify({
      date: isoDate,
      time: selectedTime,
      notes: notes
    })
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(result) {
      confirmPanel.classList.add('show');
      confirmPanel.innerHTML =
        '<p><strong>Session booked ✓</strong></p>' +
        '<p>Your modelling session for ' + selectedDate.toDateString() + ' at ' + selectedTime + ' has been requested. We\'ll confirm shortly.</p>';
      modelBookingForm.reset();
      selectedDate = null;
      selectedTime = null;
      slotSection.style.display = 'none';
      updateConfirmState();
      document.querySelectorAll('.cal-day.selected').forEach(function(el) {
        el.classList.remove('selected');
      });
    });
});

let selectedAvailDates = [];

function renderAvailabilityCalendar() {
  const availCalGrid = document.getElementById('availCalGrid');
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  availCalGrid.innerHTML = '';

  DOW.forEach(function(d) {
    const el = document.createElement('div');
    el.className = 'cal-dow';
    el.textContent = d;
    availCalGrid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();

  for (let i = 0; i < startOffset; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    availCalGrid.appendChild(el);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = toISODate(date);
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = day;

    if (date < today) {
      el.classList.add('disabled');
    } else {
      el.classList.add('available');
      el.addEventListener('click', function() {
        el.classList.toggle('selected');
        const index = selectedAvailDates.indexOf(dateStr);
        if (index === -1) {
          selectedAvailDates.push(dateStr);
        } else {
          selectedAvailDates.splice(index, 1);
        }
      });
    }

    availCalGrid.appendChild(el);
  }
}

document.getElementById('saveAvailabilityBtn').addEventListener('click', function() {
  if (selectedAvailDates.length === 0) {
    alert('Click at least one day first.');
    return;
  }

  fetch('https://beautyloft-backend.onrender.com/model-availability', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify({ dates: selectedAvailDates })
  })
    .then(function() {
      selectedAvailDates = [];
      loadMyAvailability();
      renderAvailabilityCalendar();
    });
});

function loadMyAvailability() {
  fetch('https://beautyloft-backend.onrender.com/my-availability', {
    headers: { 'Authorization': 'Bearer ' + authToken },
    cache: 'no-store'
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      const list = document.getElementById('myAvailabilityList');

      if (data.availability.length === 0) {
        list.innerHTML = '<p class="activity-empty">No availability marked yet.</p>';
        return;
      }

      list.innerHTML = data.availability.map(function(a) {
        return '<span class="slot-pill" style="margin:4px; display:inline-flex; align-items:center; gap:8px;">' +
          a.available_date +
          ' <button data-date="' + a.available_date + '" class="remove-avail-btn" style="background:none; border:none; color:var(--rose-deep); cursor:pointer; font-weight:700;">×</button>' +
        '</span>';
      }).join('');

      document.querySelectorAll('.remove-avail-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          fetch('https://beautyloft-backend.onrender.com/model-availability/' + btn.dataset.date, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + authToken }
          }).then(function() {
            loadMyAvailability();
          });
        });
      });
    });
}