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

function loadAppointments() {
  fetch('https://beautyloft-backend.onrender.com/admin/appointments', {
    headers: { 'Authorization': 'Bearer ' + authToken },
    cache: 'no-store'
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      const container = document.getElementById('appointmentsAdminTable');

      if (data.appointments.length === 0) {
        container.innerHTML = '<p class="activity-empty">No appointments yet.</p>';
        return;
      }

      let rows = '';
      data.appointments.forEach(function(appt) {
        rows +=
          '<tr>' +
            '<td>' + appt.booking_ref + '</td>' +
            '<td>' + appt.customer_name + '<br><span style="color:var(--ink-soft); font-size:0.8rem;">' + appt.customer_email + '</span></td>' +
            '<td>' + appt.service + '</td>' +
            '<td>' + appt.appointment_date + '<br>' + appt.appointment_time + '</td>' +
            '<td><span class="status-badge status-' + appt.status + '">' + appt.status + '</span></td>' +
            '<td>' + actionButtons(appt) + '</td>' +
          '</tr>';
      });

      container.innerHTML =
        '<table class="data-table">' +
          '<thead><tr><th>Booking ID</th><th>Customer</th><th>Service</th><th>Date & Time</th><th>Status</th><th>Actions</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>';

      attachActionListeners();
    });
}

function actionButtons(appt) {
  let buttons = '';

  if (appt.status === 'pending') {
    buttons += '<button class="admin-action-btn" data-id="' + appt.id + '" data-status="confirmed">Approve</button>';
  }
  if (appt.status === 'confirmed' || appt.status === 'rescheduled') {
    buttons += '<button class="admin-action-btn" data-id="' + appt.id + '" data-status="completed">Complete</button>';
  }
  if (appt.status !== 'cancelled' && appt.status !== 'completed') {
    buttons += '<button class="admin-action-btn admin-action-cancel" data-id="' + appt.id + '" data-status="cancelled">Cancel</button>';
    buttons += '<button class="admin-action-btn reschedule-btn" data-id="' + appt.id + '">Reschedule</button>';
  }

  return buttons;
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

function attachActionListeners() {
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

  attachRescheduleListeners();
}

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
        '<td>' + actionButtons(appt) + '</td>' +
      '</tr>';
  });

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