const API_URL =
  'https://beautyloft-backend.onrender.com';


const authToken =
  localStorage.getItem(
    'authToken'
  );


/* ========================================
   AUTH GUARD
======================================== */

if (!authToken) {

  window.location.href =
    'login.html';

}



/* ========================================
   LOAD CUSTOMER
======================================== */

async function loadCustomer() {

  try {

    const response =
      await fetch(
        API_URL + '/me',
        {
          headers: {
            Authorization:
              'Bearer ' +
              authToken
          }
        }
      );


    const data =
      await response.json();


    if (
      response.status === 401
    ) {

      localStorage.removeItem(
        'authToken'
      );

      window.location.href =
        'login.html';

      return;

    }


    if (!response.ok) {

      throw new Error(
        data.error ||
        'Unable to load account.'
      );

    }


    const user =
      data.user;


    document.getElementById(
      'customerName'
    ).textContent =
      user.name || '—';


    document.getElementById(
      'customerEmail'
    ).textContent =
      user.email || '—';


    /*
      Use first name in hero
    */

    const firstName =
      String(
        user.name || ''
      )
        .trim()
        .split(/\s+/)[0];


    document.getElementById(
      'welcomeName'
    ).textContent =
      firstName
        ? firstName + '.'
        : 'beautiful.';


  } catch (error) {

    console.error(
      'ACCOUNT ERROR:',
      error
    );

  }

}



/* ========================================
   LOG OUT
======================================== */

const logoutButton =
  document.getElementById(
    'logoutButton'
  );


logoutButton.addEventListener(
  'click',
  function() {

    localStorage.removeItem(
      'authToken'
    );


    localStorage.removeItem(
      'pendingBeautyLoftOrder'
    );


    window.location.href =
      'login.html';

  }
);



/* ========================================
   MOBILE MENU
======================================== */

const menuToggle =
  document.getElementById(
    'menuToggle'
  );


const navList =
  document.getElementById(
    'navList'
  );


if (
  menuToggle &&
  navList
) {

  menuToggle.addEventListener(
    'click',
    function() {

      navList.classList.toggle(
        'open'
      );

    }
  );

}



/* ========================================
   HEADER SCROLL
======================================== */

const siteHeader =
  document.querySelector(
    'header'
  );


let lastScrollY =
  window.scrollY;


const scrollThreshold = 8;


window.addEventListener(
  'scroll',
  function() {

    const currentScrollY =
      window.scrollY;


    if (
      currentScrollY <= 40
    ) {

      siteHeader.classList.remove(
        'header-hidden'
      );

      siteHeader.classList.add(
        'header-visible'
      );

      lastScrollY =
        currentScrollY;

      return;

    }


    if (
      Math.abs(
        currentScrollY -
        lastScrollY
      ) < scrollThreshold
    ) {

      return;

    }


    if (
      currentScrollY >
      lastScrollY
    ) {

      if (
        navList &&
        navList.classList.contains(
          'open'
        )
      ) {

        navList.classList.remove(
          'open'
        );

      }


      siteHeader.classList.add(
        'header-hidden'
      );

      siteHeader.classList.remove(
        'header-visible'
      );

    } else {

      siteHeader.classList.remove(
        'header-hidden'
      );

      siteHeader.classList.add(
        'header-visible'
      );

    }


    lastScrollY =
      currentScrollY;

  }
);

async function loadMeasurements() {

  const loading =
    document.getElementById(
      'measurementsLoading'
    );

  const saved =
    document.getElementById(
      'savedMeasurements'
    );

  const empty =
    document.getElementById(
      'noMeasurements'
    );


  try {

    const response =
      await fetch(
        API_URL + '/my-measurements',
        {
          headers: {
            Authorization:
              'Bearer ' + authToken
          }
        }
      );


    const data =
      await response.json();


    loading.hidden = true;


    if (
      !response.ok ||
      !data.measurements
    ) {

      empty.hidden = false;

      return;

    }


    const m =
      data.measurements;


    const fingers = [
      ['Thumb', 'thumb'],
      ['Index', 'index'],
      ['Middle', 'middle'],
      ['Ring', 'ring'],
      ['Pinky', 'pinky']
    ];


    const leftHTML =
      fingers.map(function(finger) {

        const name = finger[0];
        const key = finger[1];

        return `
          <div class="finger-row">
            <span>${name}</span>
            <strong>
              ${m['left_' + key]} mm
            </strong>
          </div>
        `;

      }).join('');


    const rightHTML =
      fingers.map(function(finger) {

        const name = finger[0];
        const key = finger[1];

        return `
          <div class="finger-row">
            <span>${name}</span>
            <strong>
              ${m['right_' + key]} mm
            </strong>
          </div>
        `;

      }).join('');


    document.getElementById(
      'leftHandMeasurements'
    ).innerHTML =
      leftHTML;


    document.getElementById(
      'rightHandMeasurements'
    ).innerHTML =
      rightHTML;


    saved.hidden = false;


  } catch (error) {

    console.error(
      'MEASUREMENTS ERROR:',
      error
    );


    loading.hidden = true;

    empty.hidden = false;

  }

}

/* ========================================
   INITIALIZE
======================================== */

loadCustomer();
loadMeasurements();