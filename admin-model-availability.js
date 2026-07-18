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
    loadModelAvailability();
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

function loadModelAvailability() {
  fetch('https://beautyloft-backend.onrender.com/admin/model-availability', {
    headers: { 'Authorization': 'Bearer ' + authToken },
    cache: 'no-store'
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      const container = document.getElementById('modelAvailabilityList');

      if (data.availability.length === 0) {
        container.innerHTML = '<p class="activity-empty">No availability marked by any model yet.</p>';
        return;
      }

      let rows = '';
      data.availability.forEach(function(a) {
        rows +=
          '<div style="display:flex; justify-content:space-between; align-items:center; padding:14px 0; border-top:1px solid var(--line);">' +
            '<div><b>' + a.model_name + '</b> — ' + a.available_date + '<br><span style="color:var(--ink-soft); font-size:0.8rem;">' + a.model_email + '</span></div>' +
            '<button class="admin-action-btn assign-btn" data-user-id="' + a.user_id + '" data-model-name="' + a.model_name + '" data-date="' + a.available_date + '">Assign Session</button>' +
          '</div>';
      });

      container.innerHTML = rows;

      document.querySelectorAll('.assign-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          openAssignModal(btn.dataset.userId, btn.dataset.modelName, btn.dataset.date);
        });
      });
    });
}

const assignModal = document.getElementById('assignModal');
const assignModalTitle = document.getElementById('assignModalTitle');
const assignSlotGrid = document.getElementById('assignSlotGrid');
const confirmAssignBtn = document.getElementById('confirmAssignBtn');

let assignUserId = null;
let assignDate = null;
let assignSelectedTime = null;

function openAssignModal(userId, modelName, date) {
  assignUserId = userId;
  assignDate = date;
  assignSelectedTime = null;

  assignModalTitle.textContent = 'Assign ' + modelName + ' — ' + date;
  confirmAssignBtn.disabled = true;
  confirmAssignBtn.textContent = 'Select a time first';
  assignSlotGrid.innerHTML = '<p>Checking availability...</p>';
  assignModal.style.display = 'flex';

  fetch('https://beautyloft-backend.onrender.com/availability?date=' + date + '&bookingType=model')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      assignSlotGrid.innerHTML = '';

      if (data.closed) {
        assignSlotGrid.innerHTML = '<p>This day is not available.</p>';
        return;
      }

      data.slots.forEach(function(slot) {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'slot-pill' + (slot.available ? '' : ' booked');
        pill.textContent = formatHourAssign(slot.hour);
        pill.disabled = !slot.available;

        if (slot.available) {
          pill.addEventListener('click', function() {
            document.querySelectorAll('#assignSlotGrid .slot-pill.selected').forEach(function(p) {
              p.classList.remove('selected');
            });
            pill.classList.add('selected');
            assignSelectedTime = formatHourAssign(slot.hour);
            confirmAssignBtn.disabled = false;
            confirmAssignBtn.textContent = 'Confirm ' + assignSelectedTime;
          });
        }

        assignSlotGrid.appendChild(pill);
      });
    });
}

function formatHourAssign(h) {
  const period = h >= 12 ? 'PM' : 'AM';
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return hour12 + ':00 ' + period;
}

document.getElementById('closeAssignModal').addEventListener('click', function() {
  assignModal.style.display = 'none';
});

confirmAssignBtn.addEventListener('click', function() {
  if (!assignSelectedTime) return;

  fetch('https://beautyloft-backend.onrender.com/admin/model-bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify({ userId: assignUserId, date: assignDate, time: assignSelectedTime })
  })
    .then(function() {
      assignModal.style.display = 'none';
      loadModelAvailability();
    });
});

const rescheduleModal = document.getElementById('rescheduleModal');
let rescheduleBookingId2 = null;
let rescheduleViewDate2 = new Date();
rescheduleViewDate2.setDate(1);
let rescheduleSelectedDate2 = null;
let rescheduleSelectedTime2 = null;

const rescheduleCalGrid2 = document.getElementById('rescheduleCalGrid');
const rescheduleCalMonthLabel2 = document.getElementById('rescheduleCalMonthLabel');
const rescheduleSlotSection2 = document.getElementById('rescheduleSlotSection');
const rescheduleSlotGrid2 = document.getElementById('rescheduleSlotGrid');
const rescheduleSlotDateLabel2 = document.getElementById('rescheduleSlotDateLabel');
const confirmRescheduleBtn2 = document.getElementById('confirmRescheduleBtn');

const RESCHEDULE_MONTH_NAMES2 = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const RESCHEDULE_DOW2 = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function attachRescheduleListeners() {
  document.querySelectorAll('.reschedule-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      rescheduleBookingId2 = btn.dataset.id;
      rescheduleSelectedDate2 = null;
      rescheduleSelectedTime2 = null;
      document.getElementById('rescheduleReason').value = '';
      rescheduleSlotSection2.style.display = 'none';
      updateRescheduleConfirmState2();
      rescheduleModal.style.display = 'flex';
      renderRescheduleCalendar2();
    });
  });
}

function toISODateReschedule2(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function formatHourReschedule2(h) {
  const period = h >= 12 ? 'PM' : 'AM';
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return hour12 + ':00 ' + period;
}

function renderRescheduleCalendar2() {
  const year = rescheduleViewDate2.getFullYear();
  const month = rescheduleViewDate2.getMonth();
  rescheduleCalMonthLabel2.textContent = RESCHEDULE_MONTH_NAMES2[month] + ' ' + year;

  rescheduleCalGrid2.innerHTML = '';

  RESCHEDULE_DOW2.forEach(function(d) {
    const el = document.createElement('div');
    el.className = 'cal-dow';
    el.textContent = d;
    rescheduleCalGrid2.appendChild(el);
  });

  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();

  for (let i = 0; i < startOffset; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    rescheduleCalGrid2.appendChild(el);
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
        rescheduleSelectedDate2 = date;
        rescheduleSelectedTime2 = null;
        renderRescheduleSlots2(date);
        updateRescheduleConfirmState2();
      });
    }

    rescheduleCalGrid2.appendChild(el);
  }
}

function renderRescheduleSlots2(date) {
  rescheduleSlotSection2.style.display = 'block';
  rescheduleSlotDateLabel2.textContent = date.toDateString();
  rescheduleSlotGrid2.innerHTML = '<p>Checking availability...</p>';

  const isoDate = toISODateReschedule2(date);

  fetch('https://beautyloft-backend.onrender.com/availability?date=' + isoDate + '&bookingType=model')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      rescheduleSlotGrid2.innerHTML = '';

      if (data.closed) {
        rescheduleSlotGrid2.innerHTML = '<p>This day is not available.</p>';
        return;
      }

      data.slots.forEach(function(slot) {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'slot-pill' + (slot.available ? '' : ' booked');
        pill.textContent = formatHourReschedule2(slot.hour);
        pill.disabled = !slot.available;

        if (slot.available) {
          pill.addEventListener('click', function() {
            document.querySelectorAll('#rescheduleSlotGrid .slot-pill.selected').forEach(function(p) {
              p.classList.remove('selected');
            });
            pill.classList.add('selected');
            rescheduleSelectedTime2 = formatHourReschedule2(slot.hour);
            updateRescheduleConfirmState2();
          });
        }

        rescheduleSlotGrid2.appendChild(pill);
      });
    });
}

function updateRescheduleConfirmState2() {
  if (rescheduleSelectedDate2 && rescheduleSelectedTime2) {
    confirmRescheduleBtn2.disabled = false;
    confirmRescheduleBtn2.textContent = 'Confirm: ' + rescheduleSelectedDate2.toDateString() + ' at ' + rescheduleSelectedTime2;
  } else {
    confirmRescheduleBtn2.disabled = true;
    confirmRescheduleBtn2.textContent = 'Select a new date and time';
  }
}

document.getElementById('rescheduleCalPrev').addEventListener('click', function() {
  rescheduleViewDate2.setMonth(rescheduleViewDate2.getMonth() - 1);
  renderRescheduleCalendar2();
});

document.getElementById('rescheduleCalNext').addEventListener('click', function() {
  rescheduleViewDate2.setMonth(rescheduleViewDate2.getMonth() + 1);
  renderRescheduleCalendar2();
});

document.getElementById('closeRescheduleModal').addEventListener('click', function() {
  rescheduleModal.style.display = 'none';
});

confirmRescheduleBtn2.addEventListener('click', function() {
  if (!rescheduleSelectedDate2 || !rescheduleSelectedTime2) return;

  const isoDate = toISODateReschedule2(rescheduleSelectedDate2);
  const reason = document.getElementById('rescheduleReason').value;

  fetch('https://beautyloft-backend.onrender.com/admin/model-bookings/' + rescheduleBookingId2 + '/reschedule', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify({ date: isoDate, time: rescheduleSelectedTime2, reason: reason })
  })
    .then(function() {
      rescheduleModal.style.display = 'none';
      loadModelBookings();
    });
});