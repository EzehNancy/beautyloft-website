
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
    if (!data) return;

    if (!data.user.is_admin) {
      window.location.href = 'index.html';
      return;
    }

    loadAppointments();
  });

document.getElementById('adminLogoutBtn').addEventListener('click', function() {
  fetch('http://127.0.0.1:3000/logout', {
    method: 'POST',
    credentials: 'include'
  }).then(function() {
    window.location.href = 'index.html';
  });
});

document.getElementById('mobileSidebarToggle').addEventListener('click', function() {
  document.querySelector('.admin-sidebar').classList.toggle('open');
});

function loadAppointments() {
  fetch('http://127.0.0.1:3000/admin/appointments', {
    credentials: 'include'
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
            '<td>' + appt.customer_name + '<br><span style="color:var(--ink-soft); font-size:0.8rem;">' + appt.customer_email + '</span></td>' +
            '<td>' + appt.service + '</td>' +
            '<td>' + appt.appointment_date + '<br>' + appt.appointment_time + '</td>' +
            '<td><span class="status-badge status-' + appt.status + '">' + appt.status + '</span></td>' +
            '<td>' + actionButtons(appt) + '</td>' +
          '</tr>';
      });

      container.innerHTML =
        '<table class="data-table">' +
          '<thead><tr><th>Customer</th><th>Service</th><th>Date & Time</th><th>Status</th><th>Actions</th></tr></thead>' +
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
  if (appt.status === 'confirmed') {
    buttons += '<button class="admin-action-btn" data-id="' + appt.id + '" data-status="completed">Complete</button>';
  }
  if (appt.status !== 'cancelled' && appt.status !== 'completed') {
    buttons += '<button class="admin-action-btn admin-action-cancel" data-id="' + appt.id + '" data-status="cancelled">Cancel</button>';
  }

  return buttons;
}

function attachActionListeners() {
  document.querySelectorAll('.admin-action-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const id = btn.dataset.id;
      const newStatus = btn.dataset.status;

      fetch('http://127.0.0.1:3000/admin/appointments/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })
        .then(function() {
          loadAppointments();
        });
    });
  });
}