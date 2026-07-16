const welcomeHeading = document.getElementById('welcomeHeading');
const profileContent = document.getElementById('profileContent');
const authToken = localStorage.getItem('authToken');

if (!authToken) {
  window.location.href = 'login.html';
}

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

    const user = data.user;
    welcomeHeading.textContent = 'Welcome back, ' + user.name.split(' ')[0] + '.';

    profileContent.innerHTML =
      '<div class="profile-card">' +
        '<h3>Account Info</h3>' +
        '<p><b>Name:</b> ' + user.name + '</p>' +
        '<p><b>Email:</b> ' + user.email + '</p>' +
        '<div id="modelTagSlot"></div>' +
      '</div>' +
      '<div class="profile-card">' +
        '<h3>My Appointments</h3>' +
        '<div id="appointmentsTable">Loading...</div>' +
      '</div>' +
      '<div class="profile-card" id="modelBookingsCard" style="display:none;">' +
        '<h3>My Model Bookings</h3>' +
        '<div id="modelBookingsTable">Loading...</div>' +
      '</div>';

    loadAppointments();
    loadModelStatus();
  });


function loadAppointments() {
  fetch('https://beautyloft-backend.onrender.com/my-appointments', {
    headers: { 'Authorization': 'Bearer ' + authToken },
    cache: 'no-store'
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      const container = document.getElementById('appointmentsTable');

      if (data.appointments.length === 0) {
        container.innerHTML = '<p class="activity-empty">No appointments yet.</p>';
        return;
      }

      let rows = '';
      data.appointments.forEach(function(appt) {
        const canReschedule = appt.status !== 'cancelled' && appt.status !== 'completed';
        rows +=
          '<tr>' +
            '<td>' + appt.appointment_date + '</td>' +
            '<td>' + appt.appointment_time + '</td>' +
            '<td>' + appt.service + '</td>' +
            '<td><span class="status-badge status-' + appt.status + '">' + appt.status + '</span></td>' +
            '<td>' + (canReschedule ? '<button class="admin-action-btn reschedule-btn" data-id="' + appt.id + '">Reschedule</button>' : '—') + '</td>' +
          '</tr>';
      });

      container.innerHTML =
        '<table class="data-table">' +
          '<thead><tr><th>Date</th><th>Time</th><th>Service</th><th>Status</th><th></th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>';

      attachRescheduleListeners();
    });
}

const rescheduleModal = document.getElementById('rescheduleModal');
let rescheduleApptId = null;

function attachRescheduleListeners() {
  document.querySelectorAll('.reschedule-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      rescheduleApptId = btn.dataset.id;
      rescheduleModal.style.display = 'flex';
    });
  });
}

document.getElementById('closeRescheduleModal').addEventListener('click', function() {
  rescheduleModal.style.display = 'none';
});

document.getElementById('confirmRescheduleBtn').addEventListener('click', function() {
  const newDate = document.getElementById('rescheduleDate').value;
  const newTime = document.getElementById('rescheduleTime').value;

  if (!newDate || !newTime) {
    alert('Please pick both a date and a time.');
    return;
  }

  const formattedTime = formatTimeForDisplay(newTime);

  fetch('https://beautyloft-backend.onrender.com/appointments/' + rescheduleApptId + '/reschedule', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify({ date: newDate, time: formattedTime })
  })
    .then(function() {
      rescheduleModal.style.display = 'none';
      loadAppointments();
    });
});

function formatTimeForDisplay(timeValue) {
  const parts = timeValue.split(':');
  let hour = parseInt(parts[0], 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;
  return hour12 + ':00 ' + period;
}

function loadModelStatus() {
  fetch('https://beautyloft-backend.onrender.com/my-model-status', {
    headers: { 'Authorization': 'Bearer ' + authToken }
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      const slot = document.getElementById('modelTagSlot');

      if (data.status === 'accepted') {
        slot.innerHTML = '<span class="status-badge status-confirmed" style="margin-top:10px; display:inline-block;">✓ Approved BeautyLoft Model</span>';
        document.getElementById('modelBookingsCard').style.display = 'block';
        loadModelBookings();
      } else if (data.status === 'pending') {
        slot.innerHTML = '<span class="status-badge status-pending" style="margin-top:10px; display:inline-block;">Model application pending</span>';
      } else if (data.status === 'rejected') {
        slot.innerHTML = '<span class="status-badge status-cancelled" style="margin-top:10px; display:inline-block;">Model application not accepted</span>';
      }
    });
}

function loadModelBookings() {
  fetch('https://beautyloft-backend.onrender.com/my-model-bookings', {
    headers: { 'Authorization': 'Bearer ' + authToken },
    cache: 'no-store'
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      const container = document.getElementById('modelBookingsTable');

      if (data.bookings.length === 0) {
        container.innerHTML = '<p class="activity-empty">No modelling sessions booked yet.</p>';
        return;
      }

      let rows = '';
      data.bookings.forEach(function(b) {
        rows +=
          '<tr>' +
            '<td>' + b.booking_date + '</td>' +
            '<td>' + b.booking_time + '</td>' +
            '<td><span class="status-badge status-' + b.status + '">' + b.status + '</span></td>' +
          '</tr>';
      });

      container.innerHTML =
        '<table class="data-table">' +
          '<thead><tr><th>Date</th><th>Time</th><th>Status</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>';
    });
}

// ---------- Reschedule modal: full calendar + slot picker ----------
let rescheduleViewDate = new Date();
rescheduleViewDate.setDate(1);
let rescheduleSelectedDate = null;
let rescheduleSelectedTime = null;

const rescheduleCalGrid = document.getElementById('rescheduleCalGrid');
const rescheduleCalMonthLabel = document.getElementById('rescheduleCalMonthLabel');
const rescheduleSlotSection = document.getElementById('rescheduleSlotSection');
const rescheduleSlotGrid = document.getElementById('rescheduleSlotGrid');
const rescheduleSlotDateLabel = document.getElementById('rescheduleSlotDateLabel');
const confirmRescheduleBtn = document.getElementById('confirmRescheduleBtn');

const RESCHEDULE_MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const RESCHEDULE_DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function attachRescheduleListeners() {
  document.querySelectorAll('.reschedule-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      rescheduleApptId = btn.dataset.id;
      rescheduleSelectedDate = null;
      rescheduleSelectedTime = null;
      document.getElementById('rescheduleReason').value = '';
      rescheduleSlotSection.style.display = 'none';
      updateRescheduleConfirmState();
      rescheduleModal.style.display = 'flex';
      renderRescheduleCalendar();
    });
  });
}

function toISODateReschedule(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function formatHourReschedule(h) {
  const period = h >= 12 ? 'PM' : 'AM';
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return hour12 + ':00 ' + period;
}

function renderRescheduleCalendar() {
  const year = rescheduleViewDate.getFullYear();
  const month = rescheduleViewDate.getMonth();
  rescheduleCalMonthLabel.textContent = RESCHEDULE_MONTH_NAMES[month] + ' ' + year;

  rescheduleCalGrid.innerHTML = '';

  RESCHEDULE_DOW.forEach(function(d) {
    const el = document.createElement('div');
    el.className = 'cal-dow';
    el.textContent = d;
    rescheduleCalGrid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();

  for (let i = 0; i < startOffset; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    rescheduleCalGrid.appendChild(el);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = day;

    if (date < today) {
      el.classList.add('disabled');
    } else {
      el.classList.add('available');
      el.addEventListener('click', function() {
        document.querySelectorAll('#rescheduleCalGrid .cal-day.selected').forEach(function(d) {
          d.classList.remove('selected');
        });
        el.classList.add('selected');
        rescheduleSelectedDate = date;
        rescheduleSelectedTime = null;
        renderRescheduleSlots(date);
        updateRescheduleConfirmState();
      });
    }

    rescheduleCalGrid.appendChild(el);
  }
}

function renderRescheduleSlots(date) {
  rescheduleSlotSection.style.display = 'block';
  rescheduleSlotDateLabel.textContent = date.toDateString();
  rescheduleSlotGrid.innerHTML = '<p>Checking availability...</p>';

  const isoDate = toISODateReschedule(date);

  fetch('https://beautyloft-backend.onrender.com/availability?date=' + isoDate + '&bookingType=customer')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      rescheduleSlotGrid.innerHTML = '';

      if (data.closed) {
        rescheduleSlotGrid.innerHTML = '<p>This day is not available.</p>';
        return;
      }

      data.slots.forEach(function(slot) {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'slot-pill' + (slot.available ? '' : ' booked');
        pill.textContent = formatHourReschedule(slot.hour);
        pill.disabled = !slot.available;

        if (slot.available) {
          pill.addEventListener('click', function() {
            document.querySelectorAll('#rescheduleSlotGrid .slot-pill.selected').forEach(function(p) {
              p.classList.remove('selected');
            });
            pill.classList.add('selected');
            rescheduleSelectedTime = formatHourReschedule(slot.hour);
            updateRescheduleConfirmState();
          });
        }

        rescheduleSlotGrid.appendChild(pill);
      });
    });
}

function updateRescheduleConfirmState() {
  if (rescheduleSelectedDate && rescheduleSelectedTime) {
    confirmRescheduleBtn.disabled = false;
    confirmRescheduleBtn.textContent = 'Confirm: ' + rescheduleSelectedDate.toDateString() + ' at ' + rescheduleSelectedTime;
  } else {
    confirmRescheduleBtn.disabled = true;
    confirmRescheduleBtn.textContent = 'Select a new date and time';
  }
}

document.getElementById('rescheduleCalPrev').addEventListener('click', function() {
  rescheduleViewDate.setMonth(rescheduleViewDate.getMonth() - 1);
  renderRescheduleCalendar();
});

document.getElementById('rescheduleCalNext').addEventListener('click', function() {
  rescheduleViewDate.setMonth(rescheduleViewDate.getMonth() + 1);
  renderRescheduleCalendar();
});

document.getElementById('closeRescheduleModal').addEventListener('click', function() {
  rescheduleModal.style.display = 'none';
});

confirmRescheduleBtn.addEventListener('click', function() {
  if (!rescheduleSelectedDate || !rescheduleSelectedTime) return;

  const isoDate = toISODateReschedule(rescheduleSelectedDate);
  const reason = document.getElementById('rescheduleReason').value;

  fetch('https://beautyloft-backend.onrender.com/appointments/' + rescheduleApptId + '/reschedule', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify({ date: isoDate, time: rescheduleSelectedTime, reason: reason })
  })
    .then(function() {
      rescheduleModal.style.display = 'none';
      loadAppointments();
    });
});