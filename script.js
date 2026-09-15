const menuToggle = document.getElementById('menuToggle');
const navList = document.getElementById('navList');

menuToggle.addEventListener('click', function() {
  navList.classList.toggle('open');
});

const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.g-item');

filterButtons.forEach(function(btn) {
  btn.addEventListener('click', function() {

    filterButtons.forEach(function(b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    const selected = btn.dataset.filter;

    galleryItems.forEach(function(item) {
      if (selected === 'all' || item.dataset.category === selected) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });

  });
});

const lookbookItems = [
  { label: 'Cinnamon balayage', img: 'images/lookbook-1.jpeg' },
  { label: 'Espresso chrome', img: 'images/lookbook-2.jpeg' },
  { label: 'Copper glow blowout', img: 'images/lookbook-3.jpeg' },
  { label: 'Terracotta nail art', img: 'images/lookbook-6.jpeg' },
  { label: 'Soft caramel roots', img: 'images/lookbook-5.jpeg' },
  { label: 'Soft caramel roots', img: 'images/lookbook-4.jpeg' },
];
const lookbookStrip = document.getElementById('lookbookStrip');
if (lookbookStrip) {
  lookbookItems.forEach(function(item) {
    const el = document.createElement('div');
    el.className = 'lookbook-card';
    el.innerHTML =
      '<span class="lookbook-badge">Trending</span>' +
      '<img src="' + item.img + '" alt="' + item.label + '">' +
      '<p class="lookbook-caption">' + item.label + '</p>';
    lookbookStrip.appendChild(el);
  });
}

const lightbox = document.getElementById('lightbox');
const lightboxInner = document.getElementById('lightboxInner');
const lightboxClose = document.getElementById('lightboxClose');

if (lightbox) {
  galleryItems.forEach(function(item) {
    item.addEventListener('click', function() {
      const caption = item.querySelector('p').textContent;
      lightboxInner.innerHTML = '<p>' + caption + '</p>';
      lightbox.classList.add('open');
    });
  });

  lightboxClose.addEventListener('click', function() {
    lightbox.classList.remove('open');
  });

  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      lightbox.classList.remove('open');
    }
  });
}

const authNavItem = document.getElementById('authNavItem');

if (authNavItem) {
  const token = localStorage.getItem('authToken');

  if (token) {
    fetch('https://beautyloft-backend.onrender.com/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        return null;
      })
      .then(function(data) {
       if (data && data.user) {

  // ========================================
  // BOTTOM NAV PROFILE LINK
  // ========================================

  const bottomProfileLink =
    document.getElementById('bottomProfileLink');

  if (bottomProfileLink) {

    if (data.user.is_admin) {
      bottomProfileLink.href =
        'admin-dashboard.html';
    } else {
      bottomProfileLink.href =
        'profile.html';
    }

  }


  // ========================================
  // DESKTOP PROFILE ICON
  // ========================================

  let profileLink = 'profile.html';

if (data.user.is_admin) {
  profileLink = 'admin-dashboard.html';
}

let navHtml = `
  <a
    href="${profileLink}"
    class="desktop-profile-link"
    aria-label="Profile"
    title="Profile"
  >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle
          cx="12"
          cy="8"
          r="3.5"
        ></circle>

        <path
          d="M5 20.5c.7-4 3.2-6 7-6s6.3 2 7 6"
        ></path>
      </svg>
    </a>
  `;


  // LOGOUT BUTTON

  navHtml += `
    <button id="logoutBtn">
      Log out
    </button>
  `;


  authNavItem.innerHTML = navHtml;


  // ========================================
  // LOGOUT
  // ========================================

  document
    .getElementById('logoutBtn')
    .addEventListener(
      'click',
      function() {

        fetch(
          'https://beautyloft-backend.onrender.com/logout',
          {
            method: 'POST',

            headers: {
              'Authorization':
                'Bearer ' + token
            }
          }
        )
          .then(function() {

            localStorage.removeItem(
              'authToken'
            );

            window.location.href =
              'index.html';

          });

      }
    );


  // ========================================
  // MODEL STATUS
  // ========================================

  fetch(
    'https://beautyloft-backend.onrender.com/my-model-status',
    {
      headers: {
        'Authorization':
          'Bearer ' + token
      }
    }
  )
    .then(function(response) {
      return response.json();
    })
    .then(function(statusData) {

      const modelsLink =
        document.getElementById(
          'modelsNavLink'
        );

      if (
        modelsLink &&
        statusData.status === 'accepted'
      ) {

        modelsLink.href =
          'model-booking.html';

      }

    });

}
      });
  }
}

// ========================================
// MOBILE BOTTOM NAV CART BADGE
// ========================================

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

const fanNav =
  document.getElementById('homeFanNav');

const fanToggle =
  document.getElementById('fanNavToggle');

if (fanNav && fanToggle) {

  // Open / close when main button is clicked
  fanToggle.addEventListener('click', function(event) {

    // Prevent this click from reaching the page
    event.stopPropagation();

    fanNav.classList.toggle('open');

    const isOpen =
      fanNav.classList.contains('open');

    fanToggle.setAttribute(
      'aria-expanded',
      isOpen
    );

    fanToggle.setAttribute(
      'aria-label',
      isOpen
        ? 'Close navigation'
        : 'Open navigation'
    );

  });


  // Prevent clicks on the fan itself
  // from immediately closing it
  fanNav.addEventListener('click', function(event) {
    event.stopPropagation();
  });


  // Tap anywhere outside the fan to close it
  document.addEventListener('click', function() {

    if (fanNav.classList.contains('open')) {

      fanNav.classList.remove('open');

      fanToggle.setAttribute(
        'aria-expanded',
        'false'
      );

      fanToggle.setAttribute(
        'aria-label',
        'Open navigation'
      );

    }

  });

}

  // ========================================
  // HIDE HEADER DOWN / SHOW HEADER UP
  // ========================================

  const siteHeader =
    document.querySelector('header');

  let lastScrollY =
    window.scrollY;

  const scrollThreshold = 8;

  window.addEventListener('scroll', function() {

    const currentScrollY =
      window.scrollY;


    // Always show header near top of page
    if (currentScrollY <= 40) {

      siteHeader.classList.remove(
        'header-hidden'
      );

      siteHeader.classList.add(
        'header-visible'
      );

      lastScrollY = currentScrollY;

      return;
    }


    // Ignore tiny scroll movements
    if (
      Math.abs(
        currentScrollY - lastScrollY
      ) < scrollThreshold
    ) {
      return;
    }



    // SCROLLING DOWN
if (currentScrollY > lastScrollY) {

  // Close mobile/tablet hamburger menu
  const navList =
    document.getElementById('navList');

  if (
    navList &&
    navList.classList.contains('open')
  ) {
    navList.classList.remove('open');
  }


  // Hide header
  siteHeader.classList.add(
    'header-hidden'
  );

  siteHeader.classList.remove(
    'header-visible'
  );

}

    // SCROLLING UP
    else {

      siteHeader.classList.remove(
        'header-hidden'
      );

      siteHeader.classList.add(
        'header-visible'
      );

    }


    lastScrollY = currentScrollY;

  });