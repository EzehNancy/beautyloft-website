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