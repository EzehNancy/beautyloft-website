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

    loadApplications();
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

function loadApplications() {
  fetch('https://beautyloft-backend.onrender.com/admin/model-applications', {
    headers: { 'Authorization': 'Bearer ' + authToken }
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      const container = document.getElementById('applicationsAdminTable');

      if (data.applications.length === 0) {
        container.innerHTML = '<p class="activity-empty">No applications yet.</p>';
        return;
      }

      let rows = '';
      data.applications.forEach(function(app) {
        rows +=
          '<tr>' +
            '<td>' + app.customer_name + '<br><span style="color:var(--ink-soft); font-size:0.8rem;">' + app.customer_email + '</span></td>' +
            '<td>' + app.interest + '</td>' +
            '<td>' + app.age + '</td>' +
            '<td>' + (app.portfolio_link ? '<a href="' + app.portfolio_link + '" target="_blank">View</a>' : '—') + '</td>' +
            '<td><span class="status-badge status-' + statusClass(app.status) + '">' + app.status + '</span></td>' +
            '<td>' + actionButtons(app) + '</td>' +
          '</tr>';
      });

      container.innerHTML =
        '<table class="data-table">' +
          '<thead><tr><th>Applicant</th><th>Interest</th><th>Age</th><th>Portfolio</th><th>Status</th><th>Actions</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>';

      attachActionListeners();
    });
}

function statusClass(status) {
  if (status === 'accepted') return 'confirmed';
  if (status === 'rejected') return 'cancelled';
  return 'pending';
}

function actionButtons(app) {
  let buttons = '';

  if (app.status !== 'accepted') {
    buttons += '<button class="admin-action-btn" data-id="' + app.id + '" data-status="accepted">Accept</button>';
  }
  if (app.status !== 'rejected') {
    buttons += '<button class="admin-action-btn admin-action-cancel" data-id="' + app.id + '" data-status="rejected">Reject</button>';
  }
  if (app.status === 'accepted' && app.phone) {
    buttons += '<a class="admin-action-btn" style="text-decoration:none; display:inline-block;" href="' + buildWhatsAppLink(app) + '" target="_blank">Message on WhatsApp</a>';
  }

  return buttons;
}

function buildWhatsAppLink(app) {
  const digitsOnly = app.phone.replace(/\D/g, '');
  const message = "Congratulations! You've been accepted as a model for The BeautyLoft 🎉 Book your modelling session here: https://beautyloft.vercel.app/model-booking.html";
  return 'https://wa.me/' + digitsOnly + '?text=' + encodeURIComponent(message);
}

function attachActionListeners() {
  document.querySelectorAll('.admin-action-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const id = btn.dataset.id;
      const newStatus = btn.dataset.status;

      fetch('https://beautyloft-backend.onrender.com/admin/model-applications/' + id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({ status: newStatus })
      })
        .then(function() {
          loadApplications();
        });
    });
  });
}