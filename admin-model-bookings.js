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
    loadModelBookings();
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

let allModelBookings = [];

function loadModelBookings() {
  fetch('https://beautyloft-backend.onrender.com/admin/model-bookings', {
    headers: { 'Authorization': 'Bearer ' + authToken },
    cache: 'no-store'
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      allModelBookings = data.bookings;
      const container = document.getElementById('modelBookingsAdminTable');

      if (data.bookings.length === 0) {
        container.innerHTML = '<p class="activity-empty">No model bookings yet.</p>';
        return;
      }

      let rows = '';
      data.bookings.forEach(function(b) {
        rows +=
          '<tr>' +
            '<td>' + b.model_name + '<br><span style="color:var(--ink-soft); font-size:0.8rem;">' + b.model_email + '</span></td>' +
            '<td>' + b.booking_date + '<br>' + b.booking_time + '</td>' +
            '<td><span class="status-badge status-' + b.status + '">' + b.status + '</span></td>' +
            '<td>' + (b.reschedule_reason || '—') + '</td>' +
            '<td>' + (b.notes || '—') + '</td>' +
            '<td>' + actionButtons(b) + '</td>' +
          '</tr>';
      });

      container.innerHTML =
        '<table class="data-table">' +
          '<thead><tr><th>Model</th><th>Date & Time</th><th>Status</th><th>Reschedule Reason</th><th>Notes</th><th>Actions</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>';

      attachActionListeners();
    });
}

function actionButtons(b) {
  let buttons = '';

  if (b.status === 'pending') {
    buttons += '<button class="admin-action-btn" data-id="' + b.id + '" data-status="confirmed">Accept</button>';
  }
  if (b.status !== 'cancelled' && b.status !== 'completed') {
    buttons += '<button class="admin-action-btn admin-action-cancel" data-id="' + b.id + '" data-status="cancelled">Cancel</button>';
    buttons += '<button class="admin-action-btn reschedule-btn" data-id="' + b.id + '">Reschedule</button>';
    buttons += '<button class="admin-action-btn calendar-btn" data-id="' + b.id + '">Add to Calendar</button>';
  }
  if (b.model_phone) {
    buttons += '<a class="admin-action-btn" style="text-decoration:none; display:inline-block;" href="' + buildReminderLink(b) + '" target="_blank">Remind on WhatsApp</a>';
  }

  return buttons;
}

function buildReminderLink(b) {
  let digitsOnly = b.model_phone.replace(/\D/g, '');
  if (digitsOnly.startsWith('0')) {
    digitsOnly = '234' + digitsOnly.slice(1);
  }
  const message = 'Hi ' + b.model_name.split(' ')[0] + '! Just a reminder about your modelling session at The BeautyLoft on ' + b.booking_date + ' at ' + b.booking_time + '. See you then! 💕';
  return 'https://wa.me/' + digitsOnly + '?text=' + encodeURIComponent(message);
}

function attachActionListeners() {
  document.querySelectorAll('.admin-action-btn[data-status]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const id = btn.dataset.id;
      const newStatus = btn.dataset.status;

      fetch('https://beautyloft-backend.onrender.com/admin/model-bookings/' + id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({ status: newStatus })
      })
        .then(function() {
          loadModelBookings();
        });
    });
  });

  document.querySelectorAll('.calendar-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const booking = allModelBookings.find(function(b) { return String(b.id) === btn.dataset.id; });
      if (booking) addToCalendar(buildModelBookingCalendarDetails(booking));
    });
  });

  attachRescheduleListeners();
}

function buildModelBookingCalendarDetails(b) {
  const match = b.booking_time.match(/(\d+):00 (AM|PM)/);
  let hour = parseInt(match[1], 10);
  if (match[2] === 'PM' && hour !== 12) hour += 12;
  if (match[2] === 'AM' && hour === 12) hour = 0;

  const dateParts = b.booking_date.split('-');
  const start = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hour, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  return {
    title: 'Modelling session — ' + b.model_name,
    description: b.notes || 'Modelling session at The BeautyLoft',
    location: 'The BeautyLoft',
    start: start,
    end: end
  };
}

function addToCalendar(details) {
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isMac = /Macintosh/.test(ua) && !isIOS;

  function pad(n) { return String(n).padStart(2, '0'); }
  function toCalDate(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  }

  if (isIOS || isMac) {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'DTSTART:' + toCalDate(details.start),
      'DTEND:' + toCalDate(details.end),
      'SUMMARY:' + details.title,
      'DESCRIPTION:' + details.description,
      'LOCATION:' + details.location,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  const googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(details.title) +
    '&dates=' + toCalDate(details.start) + '/' + toCalDate(details.end) +
    '&details=' + encodeURIComponent(details.description) +
    '&location=' + encodeURIComponent(details.location);

  window.open(googleUrl, '_blank');
}

// ---------- Reschedule modal: full calendar + slot picker ----------
const rescheduleModal = document.getElementById('rescheduleModal');
let rescheduleBookingId = null;
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
      rescheduleBookingId = btn.dataset.id;
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

  fetch('https://beautyloft-backend.onrender.com/availability?date=' + isoDate + '&bookingType=model')
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

  fetch('https://beautyloft-backend.onrender.com/admin/model-bookings/' + rescheduleBookingId + '/reschedule', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify({ date: isoDate, time: rescheduleSelectedTime, reason: reason })
  })
    .then(function() {
      rescheduleModal.style.display = 'none';
      loadModelBookings();
    });
});