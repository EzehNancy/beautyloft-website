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

    if (!data.user.is_admin) {
      window.location.href = 'index.html';
      return;
    }

    document.querySelector('.admin-main h1').textContent = 'Welcome back, ' + data.user.name.split(' ')[0] + '.';
    loadStats();
    loadStats();
    loadActivity();
    function loadActivity() {
  fetch('https://beautyloft-backend.onrender.com/admin/recent-activity', {
    credentials: 'include'
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      const activityList = document.getElementById('activityList');

      if (data.activity.length === 0) {
        activityList.innerHTML = '<p class="activity-empty">No recent activity yet.</p>';
        return;
      }

      activityList.innerHTML = data.activity.map(function(item) {
        return '<div class="activity-item"><p>' + item.message + '</p><span>' + new Date(item.time).toLocaleString() + '</span></div>';
      }).join('');
    });
}
  });   


document.getElementById('adminLogoutBtn').addEventListener('click', function() {
  fetch('https://beautyloft-backend.onrender.com/logout', {
    method: 'POST',
    credentials: 'include'
  }).then(function() {
    window.location.href = 'index.html';
  });
});

document.getElementById('mobileSidebarToggle').addEventListener('click', function() {
  document.querySelector('.admin-sidebar').classList.toggle('open');
});

function loadStats() {
  fetch('https://beautyloft-backend.onrender.com/admin/stats', {
    credentials: 'include'
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(stats) {
      const statsGrid = document.getElementById('statsGrid');

      statsGrid.innerHTML =
        statCard('Total Customers', stats.totalCustomers) +
        statCard("Today's Appointments", stats.todaysAppointments) +
        statCard('Pending Orders', stats.pendingOrders) +
        statCard('Total Products', stats.totalProducts) +
        statCard('Pending Model Applications', stats.pendingModelApplications);
    });
}

function statCard(label, value) {
  return '<div class="stat-card"><p class="stat-label">' + label + '</p><p class="stat-value">' + value + '</p></div>';
}