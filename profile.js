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
    headers: { 'Authorization': 'Bearer ' + authToken }
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
        rows +=
          '<tr>' +
            '<td>' + appt.appointment_date + '</td>' +
            '<td>' + appt.appointment_time + '</td>' +
            '<td>' + appt.service + '</td>' +
            '<td><span class="status-badge status-' + appt.status + '">' + appt.status + '</span></td>' +
          '</tr>';
      });

      container.innerHTML =
        '<table class="data-table">' +
          '<thead><tr><th>Date</th><th>Time</th><th>Service</th><th>Status</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>';
    });
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