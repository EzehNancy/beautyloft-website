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

function openAssignModal(userId, modelName, date) {
  const time = prompt('Assign ' + modelName + ' a session on ' + date + '. Enter a time (e.g. 2:00 PM):');
  if (!time) return;

  fetch('https://beautyloft-backend.onrender.com/admin/model-bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify({ userId: userId, date: date, time: time })
  })
    .then(function() {
      loadModelAvailability();
    });
}