/* ========================================
   API + AUTH
======================================== */

const API_URL =
  'https://beautyloft-backend.onrender.com';


const authToken =
  localStorage.getItem(
    'authToken'
  );


let currentUser = null;

let currentMeasurements = null;



/* ========================================
   AUTH GUARD
======================================== */

if (!authToken) {

  window.location.href =
    'login.html';

}



/* ========================================
   OVERLAY
======================================== */

const accountOverlay =
  document.getElementById(
    'accountOverlay'
  );


const overlayContent =
  document.getElementById(
    'overlayContent'
  );


const overlayClose =
  document.getElementById(
    'overlayClose'
  );


const overlayBackdrop =
  document.getElementById(
    'overlayBackdrop'
  );


let overlayOriginalParent = null;

let overlayOriginalNextSibling = null;

let activeOverlayElement = null;



function openOverlay(
  element,
  eyebrow,
  title,
  description
) {

  if (!element) {
    return;
  }


  overlayOriginalParent =
    element.parentNode;


  overlayOriginalNextSibling =
    element.nextSibling;


  activeOverlayElement =
    element;


  overlayContent.innerHTML = `

    <p class="overlay-eyebrow">
      ${eyebrow}
    </p>

    <h2 class="overlay-title">
      ${title}
    </h2>

    <p class="overlay-description">
      ${description}
    </p>

  `;


  element.hidden =
    false;


  overlayContent.appendChild(
    element
  );


  accountOverlay.hidden =
    false;


  document.body.classList.add(
    'overlay-open'
  );

}



/* ========================================
   CLOSE OVERLAY
======================================== */

function closeOverlay() {

  if (
    activeOverlayElement &&
    overlayOriginalParent
  ) {

    activeOverlayElement.hidden =
      true;


    if (
      overlayOriginalNextSibling &&
      overlayOriginalNextSibling.parentNode ===
        overlayOriginalParent
    ) {

      overlayOriginalParent.insertBefore(
        activeOverlayElement,
        overlayOriginalNextSibling
      );

    } else {

      overlayOriginalParent.appendChild(
        activeOverlayElement
      );

    }

  }


  activeOverlayElement =
    null;


  overlayOriginalParent =
    null;


  overlayOriginalNextSibling =
    null;


  accountOverlay.hidden =
    true;


  overlayContent.innerHTML =
    '';


  document.body.classList.remove(
    'overlay-open'
  );

}



/* ========================================
   OVERLAY EVENTS
======================================== */

if (overlayClose) {

  overlayClose.addEventListener(
    'click',
    closeOverlay
  );

}


if (overlayBackdrop) {

  overlayBackdrop.addEventListener(
    'click',
    closeOverlay
  );

}


document.addEventListener(
  'keydown',
  function(event) {

    if (
      event.key === 'Escape' &&
      accountOverlay &&
      !accountOverlay.hidden
    ) {

      closeOverlay();

    }

  }
);



/* ========================================
   LOAD USER
======================================== */

async function loadUser() {

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


    currentUser =
      data.user;


    document.getElementById(
      'sidebarUserName'
    ).textContent =
      currentUser.name ||
      'BeautyLoft Customer';


    document.getElementById(
      'accountName'
    ).value =
      currentUser.name || '';


    document.getElementById(
      'accountEmail'
    ).value =
      currentUser.email || '';


  } catch (error) {

    console.error(
      'LOAD USER ERROR:',
      error
    );

  }

}



/* ========================================
   PERSONAL DETAILS
======================================== */

const accountName =
  document.getElementById(
    'accountName'
  );


const accountEmail =
  document.getElementById(
    'accountEmail'
  );


const editDetailsButton =
  document.getElementById(
    'editDetailsButton'
  );


const detailsActions =
  document.getElementById(
    'detailsActions'
  );


const detailsEditor =
  document.getElementById(
    'detailsEditor'
  );



if (editDetailsButton) {

  editDetailsButton.addEventListener(
    'click',
    function() {

      accountName.disabled =
        false;


      accountEmail.disabled =
        false;


      detailsActions.hidden =
        false;


      openOverlay(
        detailsEditor,
        'ACCOUNT DETAILS',
        'Edit your details',
        'Update your name or email address.'
      );


      accountName.focus();

    }
  );

}



/* ========================================
   CANCEL DETAILS
======================================== */

const cancelDetailsButton =
  document.getElementById(
    'cancelDetailsButton'
  );


if (cancelDetailsButton) {

  cancelDetailsButton.addEventListener(
    'click',
    function() {

      accountName.value =
        currentUser?.name || '';


      accountEmail.value =
        currentUser?.email || '';


      accountName.disabled =
        true;


      accountEmail.disabled =
        true;


      closeOverlay();

    }
  );

}



/* ========================================
   ADDRESS
======================================== */

const addressEmpty =
  document.getElementById(
    'addressEmpty'
  );


const addressForm =
  document.getElementById(
    'addressForm'
  );


const addAddressButton =
  document.getElementById(
    'addAddressButton'
  );


if (addAddressButton) {

  addAddressButton.addEventListener(
    'click',
    function() {

      openOverlay(
        addressForm,
        'DELIVERY DETAILS',
        'Save your address',
        'Add the address you would like to use for future BeautyLoft orders.'
      );

    }
  );

}



/* ========================================
   CANCEL ADDRESS
======================================== */

const cancelAddressButton =
  document.getElementById(
    'cancelAddressButton'
  );


if (cancelAddressButton) {

  cancelAddressButton.addEventListener(
    'click',
    function() {

      closeOverlay();

    }
  );

}



/* ========================================
   LOAD MEASUREMENTS
======================================== */

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


  const editButton =
    document.getElementById(
      'editMeasurementsButton'
    );


  try {

    const response =
      await fetch(
        API_URL +
        '/my-measurements',
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


    loading.hidden =
      true;


    if (
      !response.ok ||
      !data.measurements
    ) {

      empty.hidden =
        false;


      editButton.hidden =
        true;


      return;

    }


    currentMeasurements =
      data.measurements;


    renderMeasurements(
      currentMeasurements
    );


    saved.hidden =
      false;


    empty.hidden =
      true;


    editButton.hidden =
      false;


  } catch (error) {

    console.error(
      'MEASUREMENTS ERROR:',
      error
    );


    loading.hidden =
      true;


    empty.hidden =
      false;

  }

}



/* ========================================
   RENDER MEASUREMENTS
======================================== */

function renderMeasurements(m) {

  const fingers = [

    ['Thumb', 'thumb'],

    ['Index', 'index'],

    ['Middle', 'middle'],

    ['Ring', 'ring'],

    ['Pinky', 'pinky']

  ];


  document.getElementById(
    'leftHandMeasurements'
  ).innerHTML =

    fingers.map(
      function(finger) {

        const name =
          finger[0];


        const key =
          finger[1];


        const value =
          m['left_' + key];


        return `

          <div class="finger-row">

            <span>
              ${name}
            </span>

            <strong>
              ${
                value !== null &&
                value !== undefined &&
                value !== ''
                  ? value + ' mm'
                  : '—'
              }
            </strong>

          </div>

        `;

      }
    ).join('');


  document.getElementById(
    'rightHandMeasurements'
  ).innerHTML =

    fingers.map(
      function(finger) {

        const name =
          finger[0];


        const key =
          finger[1];


        const value =
          m['right_' + key];


        return `

          <div class="finger-row">

            <span>
              ${name}
            </span>

            <strong>
              ${
                value !== null &&
                value !== undefined &&
                value !== ''
                  ? value + ' mm'
                  : '—'
              }
            </strong>

          </div>

        `;

      }
    ).join('');

}



/* ========================================
   MEASUREMENT FORM
======================================== */

const measurementForm =
  document.getElementById(
    'measurementForm'
  );


const savedMeasurements =
  document.getElementById(
    'savedMeasurements'
  );


const noMeasurements =
  document.getElementById(
    'noMeasurements'
  );



function fillMeasurementForm() {

  if (!currentMeasurements) {
    return;
  }


  document.getElementById(
    'leftThumb'
  ).value =
    currentMeasurements.left_thumb || '';


  document.getElementById(
    'leftIndex'
  ).value =
    currentMeasurements.left_index || '';


  document.getElementById(
    'leftMiddle'
  ).value =
    currentMeasurements.left_middle || '';


  document.getElementById(
    'leftRing'
  ).value =
    currentMeasurements.left_ring || '';


  document.getElementById(
    'leftPinky'
  ).value =
    currentMeasurements.left_pinky || '';


  document.getElementById(
    'rightThumb'
  ).value =
    currentMeasurements.right_thumb || '';


  document.getElementById(
    'rightIndex'
  ).value =
    currentMeasurements.right_index || '';


  document.getElementById(
    'rightMiddle'
  ).value =
    currentMeasurements.right_middle || '';


  document.getElementById(
    'rightRing'
  ).value =
    currentMeasurements.right_ring || '';


  document.getElementById(
    'rightPinky'
  ).value =
    currentMeasurements.right_pinky || '';

}



/* ========================================
   EDIT MEASUREMENTS
======================================== */

const editMeasurementsButton =
  document.getElementById(
    'editMeasurementsButton'
  );


if (editMeasurementsButton) {

  editMeasurementsButton.addEventListener(
    'click',
    function() {

      fillMeasurementForm();


      openOverlay(
        measurementForm,
        'NAIL MEASUREMENTS',
        'Edit your measurements',
        'Update your saved nail measurements for future orders.'
      );

    }
  );

}



/* ========================================
   ADD MEASUREMENTS
======================================== */

const addMeasurementsButton =
  document.getElementById(
    'addMeasurementsButton'
  );


if (addMeasurementsButton) {

  addMeasurementsButton.addEventListener(
    'click',
    function() {

      openOverlay(
        measurementForm,
        'NAIL MEASUREMENTS',
        'Add your measurements',
        'Save your nail measurements so they are ready for future orders.'
      );

    }
  );

}



/* ========================================
   CANCEL MEASUREMENTS
======================================== */

const cancelMeasurementsButton =
  document.getElementById(
    'cancelMeasurementsButton'
  );


if (cancelMeasurementsButton) {

  cancelMeasurementsButton.addEventListener(
    'click',
    function() {

      closeOverlay();

    }
  );

}



/* ========================================
   PASSWORD
======================================== */

const passwordForm =
  document.getElementById(
    'passwordForm'
  );


const changePasswordButton =
  document.getElementById(
    'changePasswordButton'
  );


if (changePasswordButton) {

  changePasswordButton.addEventListener(
    'click',
    function() {

      openOverlay(
        passwordForm,
        'ACCOUNT SECURITY',
        'Change your password',
        'Enter your current password and choose a new one.'
      );

    }
  );

}



/* ========================================
   CANCEL PASSWORD
======================================== */

const cancelPasswordButton =
  document.getElementById(
    'cancelPasswordButton'
  );


if (cancelPasswordButton) {

  cancelPasswordButton.addEventListener(
    'click',
    function() {

      document.getElementById(
        'currentPassword'
      ).value = '';


      document.getElementById(
        'newPassword'
      ).value = '';


      document.getElementById(
        'confirmPassword'
      ).value = '';


      document.getElementById(
        'passwordMessage'
      ).textContent = '';


      closeOverlay();

    }
  );

}



/* ========================================
   SAVE DETAILS

   Backend connection comes next.
======================================== */

const saveDetailsButton =
  document.getElementById(
    'saveDetailsButton'
  );


if (saveDetailsButton) {

  saveDetailsButton.addEventListener(
    'click',
    function() {

      const message =
        document.getElementById(
          'detailsMessage'
        );


      if (
        !accountName.value.trim() ||
        !accountEmail.value.trim()
      ) {

        message.textContent =
          'Please complete your details.';


        return;

      }


      message.textContent =
        'Ready to save.';

    }
  );

}



/* ========================================
   SAVE ADDRESS

   Backend connection comes next.
======================================== */

const saveAddressButton =
  document.getElementById(
    'saveAddressButton'
  );


if (saveAddressButton) {

  saveAddressButton.addEventListener(
    'click',
    function() {

      document.getElementById(
        'addressMessage'
      ).textContent =
        'Ready to save.';

    }
  );

}



/* ========================================
   SAVE MEASUREMENTS

   Backend connection comes next.
======================================== */

const saveMeasurementsButton =
  document.getElementById(
    'saveMeasurementsButton'
  );


if (saveMeasurementsButton) {

  saveMeasurementsButton.addEventListener(
    'click',
    function() {

      document.getElementById(
        'measurementsMessage'
      ).textContent =
        'Ready to save.';

    }
  );

}



/* ========================================
   SAVE PASSWORD

   Backend connection comes next.
======================================== */

const savePasswordButton =
  document.getElementById(
    'savePasswordButton'
  );


if (savePasswordButton) {

  savePasswordButton.addEventListener(
    'click',
    function() {

      const currentPassword =
        document.getElementById(
          'currentPassword'
        ).value;


      const newPassword =
        document.getElementById(
          'newPassword'
        ).value;


      const confirmPassword =
        document.getElementById(
          'confirmPassword'
        ).value;


      const message =
        document.getElementById(
          'passwordMessage'
        );


      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {

        message.textContent =
          'Please complete all password fields.';


        return;

      }


      if (
        newPassword !==
        confirmPassword
      ) {

        message.textContent =
          'The new passwords do not match.';


        return;

      }


      message.textContent =
        'Ready to update password.';

    }
  );

}



/* ========================================
   LOG OUT
======================================== */

const logoutButton =
  document.getElementById(
    'logoutButton'
  );


if (logoutButton) {

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

}



/* ========================================
   MOBILE NAVBAR
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


const scrollThreshold =
  8;


if (siteHeader) {

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

}

/* ========================================
   SHOW / HIDE PASSWORD
======================================== */

const passwordToggles =
  document.querySelectorAll(
    '.password-toggle'
  );


passwordToggles.forEach(
  function(toggle) {

    toggle.addEventListener(
      'click',
      function() {

        const passwordWrap =
          toggle.closest(
            '.password-input-wrap'
          );


        const input =
          passwordWrap.querySelector(
            'input'
          );


        const passwordIsHidden =
          input.type === 'password';


        if (passwordIsHidden) {

          input.type =
            'text';

          toggle.textContent =
            'Hide';

          toggle.setAttribute(
            'aria-label',
            'Hide password'
          );

        } else {

          input.type =
            'password';

          toggle.textContent =
            'Show';

          toggle.setAttribute(
            'aria-label',
            'Show password'
          );

        }

      }
    );

  }
);

/* ========================================
   INITIALIZE
======================================== */

loadUser();

loadMeasurements();