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

function loadModelBookings() {
  fetch('https://beautyloft-backend.onrender.com/admin/model-bookings', {
    headers: { 'Authorization': 'Bearer ' + authToken },
    cache: 'no-store'
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
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
            '<td>' + (b.notes || '—') + '</td>' +
            '<td>' + actionButtons(b) + '</td>' +
          '</tr>';
      });

      container.innerHTML =
        '<table class="data-table">' +
          '<thead><tr><th>Model</th><th>Date & Time</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>';

      attachActionListeners(data.bookings);
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

  attachRescheduleListeners();
}

const rescheduleModal = document.getElementById('rescheduleModal');
let rescheduleBookingId = null;

function attachRescheduleListeners() {
  document.querySelectorAll('.reschedule-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      rescheduleBookingId = btn.dataset.id;
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

  fetch('https://beautyloft-backend.onrender.com/admin/model-bookings/' + rescheduleBookingId + '/reschedule', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify({ date: newDate, time: formattedTime })
  })
    .then(function() {
      rescheduleModal.style.display = 'none';
      loadModelBookings();
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

