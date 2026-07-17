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
    if (!data.user.is_admin) {
      window.location.href = 'index.html';
      return;
    }
    loadAppointments();
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

let allAppointments = [];

function loadAppointments() {
  fetch('https://beautyloft-backend.onrender.com/admin/appointments', {
    headers: { 'Authorization': 'Bearer ' + authToken },
    cache: 'no-store'
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      allAppointments = data.appointments;
      renderAppointmentsTable(allAppointments);
    });
}

function renderAppointmentsTable(appointments) {
  const container = document.getElementById('appointmentsAdminTable');

  if (appointments.length === 0) {
    container.innerHTML = '<p class="activity-empty">No appointments found.</p>';
    return;
  }

  let rows = '';
  appointments.forEach(function(appt) {
    rows +=
      '<tr>' +
        '<td>' + appt.booking_ref + '</td>' +
        '<td>' + appt.customer_name + '<br><span style="color:var(--ink-soft); font-size:0.8rem;">' + appt.customer_email + '</span></td>' +
        '<td>' + appt.service + '</td>' +
        '<td>' + appt.appointment_date + '<br>' + appt.appointment_time + '</td>' +
        '<td><span class="status-badge status-' + appt.status + '">' + appt.status + '</span></td>' +
        '<td>' + (appt.reschedule_reason || '—') + '</td>' +
        '<td>' + actionButtons(appt) + '</td>' +
      '</tr>';
  });

  container.innerHTML =
    '<table class="data-table">' +
      '<thead><tr><th>Booking ID</th><th>Customer</th><th>Service</th><th>Date & Time</th><th>Status</th><th>Reschedule Reason</th><th>Actions</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>';

  container.innerHTML =
    '<table class="data-table">' +
      '<thead><tr><th>Booking ID</th><th>Customer</th><th>Service</th><th>Date & Time</th><th>Status</th><th>Actions</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>';

  attachActionListeners();
}

document.getElementById('searchBookingId').addEventListener('input', function() {
  const query = this.value.trim().toLowerCase();
  const filtered = allAppointments.filter(function(appt) {
    return appt.booking_ref.toLowerCase().includes(query);
  });
  renderAppointmentsTable(filtered);
});

function actionButtons(appt) {
  let buttons = '';

  if (appt.status === 'pending') {
    buttons += '<button class="admin-action-btn" data-id="' + appt.id + '" data-status="confirmed">Approve</button>';
  }
  if (appt.status === 'confirmed' || appt.status === 'rescheduled') {
    buttons += '<button class="admin-action-btn" data-id="' + appt.id + '" data-status="completed">Complete</button>';
    buttons += '<button class="admin-action-btn calendar-btn" data-id="' + appt.id + '">Add to Calendar</button>';
  }
  if (appt.status !== 'cancelled' && appt.status !== 'completed') {
    buttons += '<button class="admin-action-btn admin-action-cancel" data-id="' + appt.id + '" data-status="cancelled">Cancel</button>';
    buttons += '<button class="admin-action-btn reschedule-btn" data-id="' + appt.id + '">Reschedule</button>';
  }

  return buttons;
}

function attachActionListeners() {

  // Status change buttons
  document.querySelectorAll('.admin-action-btn[data-status]').forEach(function(btn) {
    btn.addEventListener('click', function() {

      const id = btn.dataset.id;
      const newStatus = btn.dataset.status;

      fetch('https://beautyloft-backend.onrender.com/admin/appointments/' + id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({ status: newStatus })
      })
      .then(function() {
        loadAppointments();
      });

    });
  });

  // Download calendar (.ics)
  document.querySelectorAll('.calendar-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {

      const appt = allAppointments.find(function(a) {
        return String(a.id) === btn.dataset.id;
      });

      if (appt) {
        downloadAppointmentICS(appt);
      }

    });
  });

  // Reschedule buttons
  attachRescheduleListeners();

}

// ---------- Reschedule modal: full calendar + slot picker ----------
const rescheduleModal = document.getElementById('rescheduleModal');
let rescheduleApptId = null;
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

function downloadAppointmentICS(appt) {
  const match = appt.appointment_time.match(/(\d+):00 (AM|PM)/);
  let hour = parseInt(match[1], 10);
  if (match[2] === 'PM' && hour !== 12) hour += 12;
  if (match[2] === 'AM' && hour === 12) hour = 0;

  const dateParts = appt.appointment_date.split('-');
  const start = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hour, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  function pad(n) { return String(n).padStart(2, '0'); }
  function formatICS(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'DTSTART:' + formatICS(start),
    'DTEND:' + formatICS(end),
    'SUMMARY:' + appt.service + ' — ' + appt.customer_name,
    'DESCRIPTION:Booking ' + appt.booking_ref + '. Customer: ' + appt.customer_name + ', ' + appt.customer_email,
    'LOCATION:The BeautyLoft',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'appointment-' + appt.booking_ref + '.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}