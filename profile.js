const welcomeHeading = document.getElementById('welcomeHeading');
const profileContent = document.getElementById('profileContent');

fetch('https://beautyloft-backend.onrender.com/me', {
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
    if (!data) return;

    const user = data.user;
    welcomeHeading.textContent = 'Welcome back, ' + user.name.split(' ')[0] + '.';

    profileContent.innerHTML =
      '<div class="profile-card">' +
        '<h3>Account Info</h3>' +
        '<p><b>Name:</b> ' + user.name + '</p>' +
        '<p><b>Email:</b> ' + user.email + '</p>' +
      '</div>' +
      '<div class="profile-card">' +
        '<h3>My Appointments</h3>' +
        '<div id="appointmentsTable">Loading...</div>' +
      '</div>';

    loadAppointments();
  });

function loadAppointments() {
  fetch('https://beautyloft-backend.onrender.com/my-appointments', {
    credentials: 'include'
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