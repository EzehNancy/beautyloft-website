/* ========================================
   BEAUTYLOFT GLOBAL AUTH NAV
======================================== */

document.addEventListener(
  'DOMContentLoaded',
  function() {

    const authToken =
      localStorage.getItem(
        'authToken'
      );


    /* ========================================
       TOP NAV
    ======================================== */

    const authNavItem =
      document.getElementById(
        'authNavItem'
      );


    if (authNavItem) {

      if (authToken) {

        authNavItem.innerHTML = `
          <a
            href="account.html"
            class="nav-profile-link"
            aria-label="My Account"
            title="My Account"
          >
            <span class="nav-profile-icon">
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="8"
      r="4"
    ></circle>

    <path
      d="M4.5 20c.8-4.2 3.3-6.3 7.5-6.3s6.7 2.1 7.5 6.3"
    ></path>
  </svg>
</span>

            <span class="nav-profile-text">
              Account
            </span>
          </a>
        `;

      } else {

        authNavItem.innerHTML = `
          <a href="login.html">
            Log In
          </a>
        `;

      }

    }


    /* ========================================
       MOBILE BOTTOM NAV
    ======================================== */

    const bottomAuthItem =
      document.getElementById(
        'bottomAuthItem'
      );


    if (bottomAuthItem) {

      if (authToken) {

        bottomAuthItem.innerHTML = `
          <a
            href="account.html"
            class="bottom-profile-link"
            aria-label="My Account"
          >
            <span class="bottom-profile-icon">
              ♡
            </span>

            <span>
              Account
            </span>
          </a>
        `;

      } else {

        bottomAuthItem.innerHTML = `
          <a href="login.html">

            <span class="bottom-login-icon">
              ♡
            </span>

            <span>
              Log In
            </span>

          </a>
        `;

      }

    }


    /* ========================================
       REMOVE OLD NAV LOGOUT BUTTONS
    ======================================== */

    const oldLogoutSelectors = [

      '#navLogoutButton',
      '#logoutNavItem',
      '.nav-logout',
      '.navbar-logout',
      '.top-nav-logout',
      '.bottom-nav-logout'

    ];


    oldLogoutSelectors.forEach(
      function(selector) {

        document
          .querySelectorAll(selector)
          .forEach(
            function(element) {

              element.remove();

            }
          );

      }
    );

  }
);