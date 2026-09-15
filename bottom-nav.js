// ========================================
// MOBILE BOTTOM NAV - ACTIVE PAGE
// ========================================

function setActiveBottomNav() {
  const currentPage =
    window.location.pathname.split('/').pop() || 'index.html';

  const navItems =
    document.querySelectorAll(
      '.mobile-bottom-nav .bottom-nav-item'
    );

  navItems.forEach(function(item) {

    const href = item.getAttribute('href');

    item.classList.remove('active');

    if (href === currentPage) {
      item.classList.add('active');
    }

  });
}

setActiveBottomNav();
// ----------------------------------------
// CART BADGE
// ----------------------------------------

function updateBottomCartBadge() {

  const badge =
    document.getElementById('bottomCartBadge');

  if (!badge) return;

  const cart =
    JSON.parse(
      localStorage.getItem('cart') || '[]'
    );

  const totalItems =
    cart.reduce(function(total, item) {
      return total + (item.quantity || 1);
    }, 0);

  badge.textContent = totalItems;

  if (totalItems === 0) {
    badge.style.display = 'none';
  } else {
    badge.style.display = 'flex';
  }
}

updateBottomCartBadge();

// ----------------------------------------
// PROFILE ROUTING
// ----------------------------------------

function setupBottomProfileLink() {

  const profileLink =
    document.getElementById('bottomProfileLink');

  if (!profileLink) return;

  const token =
    localStorage.getItem('authToken');

  // Not logged in
  if (!token) {
    profileLink.href = 'login.html';
    return;
  }

  // Logged in - check customer/admin
  fetch(
    'https://beautyloft-backend.onrender.com/me',
    {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }
  )
    .then(function(response) {

      if (!response.ok) {
        return null;
      }

      return response.json();
    })
    .then(function(data) {

      if (!data || !data.user) {
        profileLink.href = 'login.html';
        return;
      }

      if (data.user.is_admin) {
        profileLink.href =
          'admin-dashboard.html';
      } else {
        profileLink.href =
          'profile.html';
      }

    })
    .catch(function(error) {

      console.error(
        'Bottom nav profile error:',
        error
      );

      profileLink.href = 'login.html';

    });
}

setupBottomProfileLink();