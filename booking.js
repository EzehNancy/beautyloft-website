let viewDate = new Date();
viewDate.setDate(1);
let selectedDate = null;
let selectedTime = null;

const calGrid = document.getElementById('calGrid');
const calMonthLabel = document.getElementById('calMonthLabel');
const slotSection = document.getElementById('slotSection');
const slotGrid = document.getElementById('slotGrid');
const slotDateLabel = document.getElementById('slotDateLabel');

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

let currentUser = null;

fetch('http://127.0.0.1:3000/me', {
  credentials: 'include'
})
  .then(function(response) {
    if (!response.ok) {
      window.location.href = 'login.html';
      return null;
    }
    return response.json();
  })
  .then(function(data) {
    if (data) {
      currentUser = data.user;
    }
  });

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
    const isClosed = date.getDay() === 0;

    if (isPast || isClosed) {
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
  renderSlots(date);
  function selectDate(date, el) {
  const previouslySelected = document.querySelector('.cal-day.selected');
  if (previouslySelected) {
    previouslySelected.classList.remove('selected');
  }

  el.classList.add('selected');
  selectedDate = date;
  renderSlots(date);
  updateConfirmState();
}
}

function hoursForDay(weekday) {
  if (weekday === 6) {
    return [12, 13, 14, 15, 16];
  }
  return [10, 11, 12, 13, 14, 15, 16];
}

function formatHour(h) {
  const period = h >= 12 ? 'PM' : 'AM';
  let hour12 = h % 12;
  if (hour12 === 0) {
    hour12 = 12;
  }
  return hour12 + ':00 ' + period;
}

function renderSlots(date) {
  slotSection.style.display = 'block';
  slotDateLabel.textContent = date.toDateString();

  const hours = hoursForDay(date.getDay());
  slotGrid.innerHTML = '';

  hours.forEach(function(h) {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'slot-pill';
    pill.textContent = formatHour(h);

    pill.addEventListener('click', function() {
      const previouslySelected = document.querySelector('.slot-pill.selected');
      if (previouslySelected) {
        previouslySelected.classList.remove('selected');
      }
      pill.classList.add('selected');
      selectedTime = formatHour(h);
      updateConfirmState();
    });

    slotGrid.appendChild(pill);
  });
}

renderCalendar();

document.getElementById('prevMonth').addEventListener('click', function() {
  viewDate.setMonth(viewDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', function() {
  viewDate.setMonth(viewDate.getMonth() + 1);
  renderCalendar();
});

const confirmBtn = document.getElementById('confirmBtn');

function updateConfirmState() {
  if (selectedDate && selectedTime) {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Request ' + selectedDate.toDateString() + ' at ' + selectedTime;
  } else {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Select a date and time first';
  }
}

const BUSINESS_EMAIL = 'hello@thebeautyloft.com';
const bookingForm = document.getElementById('bookingForm');
const confirmPanel = document.getElementById('confirmPanel');

bookingForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const data = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    service: document.getElementById('service').value,
    notes: document.getElementById('notes').value
  };

  const dateLabel = selectedDate.toDateString();
  const bookingId = generateBookingId();

  const subject = encodeURIComponent('Appointment request ' + bookingId + ' — ' + data.service);
  const body = encodeURIComponent(
    'New appointment request:\n\n' +
    'Booking ID: ' + bookingId + '\n' +
    'Name: ' + data.name + '\n' +
    'Phone: ' + data.phone + '\n' +
    'Email: ' + data.email + '\n' +
    'Service: ' + data.service + '\n' +
    'Date: ' + dateLabel + '\n' +
    'Time: ' + selectedTime + '\n' +
    'Notes: ' + data.notes
  );

  const bookingDetails = {
    id: bookingId,
    name: data.name,
    phone: data.phone,
    email: data.email,
    service: data.service,
    date: dateLabel,
    time: selectedTime,
    notes: data.notes,
    subject: subject,
    body: body
  };

  fetch('http://127.0.0.1:3000/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      service: data.service,
      date: dateLabel,
      time: selectedTime,
      notes: data.notes,
      bookingRef: bookingId
    })
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(result) {
      sessionStorage.setItem('lastBooking', JSON.stringify(bookingDetails));
      window.location.href = 'confirmation.html';
    });
});


function generateBookingId() {
  const number = Math.floor(100000 + Math.random() * 900000);
  return 'BL-' + number;
}