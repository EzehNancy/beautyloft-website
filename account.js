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
   DOM ELEMENTS
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


const cancelDetailsButton =
  document.getElementById(
    'cancelDetailsButton'
  );


const saveDetailsButton =
  document.getElementById(
    'saveDetailsButton'
  );


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


const cancelAddressButton =
  document.getElementById(
    'cancelAddressButton'
  );


const saveAddressButton =
  document.getElementById(
    'saveAddressButton'
  );


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


const editMeasurementsButton =
  document.getElementById(
    'editMeasurementsButton'
  );


const addMeasurementsButton =
  document.getElementById(
    'addMeasurementsButton'
  );


const cancelMeasurementsButton =
  document.getElementById(
    'cancelMeasurementsButton'
  );


const saveMeasurementsButton =
  document.getElementById(
    'saveMeasurementsButton'
  );


const passwordForm =
  document.getElementById(
    'passwordForm'
  );


const changePasswordButton =
  document.getElementById(
    'changePasswordButton'
  );


const cancelPasswordButton =
  document.getElementById(
    'cancelPasswordButton'
  );


const savePasswordButton =
  document.getElementById(
    'savePasswordButton'
  );


const logoutButton =
  document.getElementById(
    'logoutButton'
  );



/* ========================================
   OVERLAY
======================================== */

let overlayOriginalParent = null;

let overlayOriginalNextSibling = null;

let activeOverlayElement = null;


function openOverlay(
  element,
  eyebrow,
  title,
  description
) {

  if (
    !element ||
    !accountOverlay ||
    !overlayContent
  ) {

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


  if (accountOverlay) {

    accountOverlay.hidden =
      true;

  }


  if (overlayContent) {

    overlayContent.innerHTML =
      '';

  }


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


    /* SAVE USER DATA */

    currentUser =
      data.user;


    /* SIDEBAR NAME */

    const sidebarUserName =
      document.getElementById(
        'sidebarUserName'
      );


    if (sidebarUserName) {

      sidebarUserName.textContent =
        currentUser.name ||
        'BeautyLoft Customer';

    }

    const accountUserAvatar =
  document.getElementById(
    'accountUserAvatar'
  );


if (accountUserAvatar) {

  const displayName =
    currentUser.name ||
    'BeautyLoft Customer';


  accountUserAvatar.textContent =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase();

}


    /* PERSONAL DETAILS */

    if (accountName) {

      accountName.value =
        currentUser.name || '';

    }


    if (accountEmail) {

      accountEmail.value =
        currentUser.email || '';

    }


    /* SAVED ADDRESS */

    populateAddress(
      currentUser
    );


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

if (editDetailsButton) {

  editDetailsButton.addEventListener(
    'click',
    function() {

      accountName.disabled =
        false;


      accountEmail.disabled =
        false;


      if (detailsActions) {

        detailsActions.hidden =
          false;

      }


      const detailsMessage =
        document.getElementById(
          'detailsMessage'
        );


      if (detailsMessage) {

        detailsMessage.textContent =
          '';

      }


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
   SAVE DETAILS
======================================== */

if (saveDetailsButton) {

  saveDetailsButton.addEventListener(
    'click',
    async function() {

      const message =
        document.getElementById(
          'detailsMessage'
        );


      const name =
        accountName.value.trim();


      const email =
        accountEmail.value
          .trim()
          .toLowerCase();


      if (
        !name ||
        !email
      ) {

        message.textContent =
          'Please complete your details.';

        return;

      }


      saveDetailsButton.disabled =
        true;


      saveDetailsButton.textContent =
        'Saving...';


      message.textContent =
        '';


      try {

        const response =
          await fetch(
            API_URL + '/me',
            {
              method: 'PATCH',

              headers: {

                'Content-Type':
                  'application/json',

                Authorization:
                  'Bearer ' +
                  authToken

              },

              body:
                JSON.stringify({
                  name: name,
                  email: email
                })
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            'Unable to save details.'
          );

        }


        currentUser = {
          ...currentUser,
          ...data.user
        };


        accountName.value =
          currentUser.name;


        accountEmail.value =
          currentUser.email;


        const sidebarUserName =
          document.getElementById(
            'sidebarUserName'
          );


        if (sidebarUserName) {

          sidebarUserName.textContent =
            currentUser.name;

        }


        accountName.disabled =
          true;


        accountEmail.disabled =
          true;


        message.textContent =
          'Details updated successfully.';


        setTimeout(
          function() {

            closeOverlay();

          },
          700
        );


      } catch (error) {

        console.error(
          'SAVE DETAILS ERROR:',
          error
        );


        message.textContent =
          error.message;


      } finally {

        saveDetailsButton.disabled =
          false;


        saveDetailsButton.textContent =
          'Save Changes';

      }

    }
  );

}



/* ========================================
   POPULATE SAVED ADDRESS
======================================== */

function populateAddress(user) {

  if (!user) {

    return;

  }


  const firstNameInput =
    document.getElementById(
      'addressFirstName'
    );


  const lastNameInput =
    document.getElementById(
      'addressLastName'
    );


  const phoneInput =
    document.getElementById(
      'addressPhone'
    );


  const areaInput =
    document.getElementById(
      'addressArea'
    );


  const streetInput =
    document.getElementById(
      'addressStreet'
    );


  const cityInput =
    document.getElementById(
      'addressCity'
    );


  const stateInput =
    document.getElementById(
      'addressState'
    );


  if (firstNameInput) {

    firstNameInput.value =
      user.address_first_name || '';

  }


  if (lastNameInput) {

    lastNameInput.value =
      user.address_last_name || '';

  }


  if (phoneInput) {

    phoneInput.value =
      user.phone || '';

  }


  if (areaInput) {

    areaInput.value =
      user.delivery_area || '';

  }


  if (streetInput) {

    streetInput.value =
      user.delivery_address || '';

  }


  if (cityInput) {

    cityInput.value =
      user.city || 'Lagos';

  }


  if (stateInput) {

    stateInput.value =
      user.state || 'Lagos';

  }


  const hasAddress =
    Boolean(
      user.delivery_address
    );


  if (
    hasAddress &&
    addressEmpty
  ) {

    addressEmpty.innerHTML = `

      <div class="saved-address-preview">

        <p>
          ${user.address_first_name || ''}
          ${user.address_last_name || ''}
        </p>

        <p>
          ${user.delivery_address || ''}
        </p>

        <p>
          ${user.delivery_area || ''},
          ${user.city || 'Lagos'}
        </p>

        <p>
          ${user.phone || ''}
        </p>

        <button
          type="button"
          class="text-button"
          id="editAddressButton"
        >
          Edit Address →
        </button>

      </div>

    `;


    const editAddressButton =
      document.getElementById(
        'editAddressButton'
      );


    if (editAddressButton) {

      editAddressButton.addEventListener(
        'click',
        openAddressOverlay
      );

    }

  }

}



/* ========================================
   OPEN ADDRESS
======================================== */

function openAddressOverlay() {

  const addressMessage =
    document.getElementById(
      'addressMessage'
    );


  if (addressMessage) {

    addressMessage.textContent =
      '';

  }


  openOverlay(
    addressForm,
    'DELIVERY DETAILS',

    currentUser?.delivery_address
      ? 'Edit your address'
      : 'Save your address',

    'Keep your delivery details ready for future BeautyLoft orders.'
  );

}



/* ========================================
   ADD ADDRESS
======================================== */

if (addAddressButton) {

  addAddressButton.addEventListener(
    'click',
    openAddressOverlay
  );

}



/* ========================================
   CANCEL ADDRESS
======================================== */

if (cancelAddressButton) {

  cancelAddressButton.addEventListener(
    'click',
    function() {

      /*
        Restore saved data if the user
        changed fields and then cancelled.
      */

      populateAddress(
        currentUser
      );


      closeOverlay();

    }
  );

}



/* ========================================
   SAVE ADDRESS
======================================== */

if (saveAddressButton) {

  saveAddressButton.addEventListener(
    'click',
    async function() {

      const message =
        document.getElementById(
          'addressMessage'
        );


      const addressData = {

        firstName:
          document.getElementById(
            'addressFirstName'
          ).value.trim(),

        lastName:
          document.getElementById(
            'addressLastName'
          ).value.trim(),

        phone:
          document.getElementById(
            'addressPhone'
          ).value.trim(),

        deliveryArea:
          document.getElementById(
            'addressArea'
          ).value.trim(),

        address:
          document.getElementById(
            'addressStreet'
          ).value.trim(),

        city:
          document.getElementById(
            'addressCity'
          ).value.trim(),

        state:
          document.getElementById(
            'addressState'
          ).value.trim()

      };


      if (
        !addressData.firstName ||
        !addressData.lastName ||
        !addressData.phone ||
        !addressData.deliveryArea ||
        !addressData.address
      ) {

        message.textContent =
          'Please complete your delivery details.';

        return;

      }


      saveAddressButton.disabled =
        true;


      saveAddressButton.textContent =
        'Saving...';


      message.textContent =
        '';


      try {

        const response =
          await fetch(
            API_URL +
            '/my-address',
            {
              method: 'PATCH',

              headers: {

                'Content-Type':
                  'application/json',

                Authorization:
                  'Bearer ' +
                  authToken

              },

              body:
                JSON.stringify(
                  addressData
                )
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            'Unable to save address.'
          );

        }


        currentUser = {
          ...currentUser,
          ...data.address
        };


        populateAddress(
          currentUser
        );


        message.textContent =
          'Address saved successfully.';


        setTimeout(
          function() {

            closeOverlay();

          },
          700
        );


      } catch (error) {

        console.error(
          'SAVE ADDRESS ERROR:',
          error
        );


        message.textContent =
          error.message;


      } finally {

        saveAddressButton.disabled =
          false;


        saveAddressButton.textContent =
          'Save Address';

      }

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


    if (loading) {

      loading.hidden =
        true;

    }


    if (
      !response.ok ||
      !data.measurements
    ) {

      if (saved) {

        saved.hidden =
          true;

      }


      if (empty) {

        empty.hidden =
          false;

      }


      if (editButton) {

        editButton.hidden =
          true;

      }


      return;

    }


    currentMeasurements =
      data.measurements;


    renderMeasurements(
      currentMeasurements
    );


    if (saved) {

      saved.hidden =
        false;

    }


    if (empty) {

      empty.hidden =
        true;

    }


    if (editButton) {

      editButton.hidden =
        false;

    }


  } catch (error) {

    console.error(
      'MEASUREMENTS ERROR:',
      error
    );


    if (loading) {

      loading.hidden =
        true;

    }


    if (empty) {

      empty.hidden =
        false;

    }

  }

}



/* ========================================
   RENDER MEASUREMENTS
======================================== */

function renderMeasurements(m) {

  if (!m) {

    return;

  }


  const fingers = [

    ['Thumb', 'thumb'],

    ['Index', 'index'],

    ['Middle', 'middle'],

    ['Ring', 'ring'],

    ['Pinky', 'pinky']

  ];


  const leftHand =
    document.getElementById(
      'leftHandMeasurements'
    );


  const rightHand =
    document.getElementById(
      'rightHandMeasurements'
    );


  if (leftHand) {

    leftHand.innerHTML =

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

  }


  if (rightHand) {

    rightHand.innerHTML =

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

}



/* ========================================
   FILL MEASUREMENT FORM
======================================== */

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
   CLEAR MEASUREMENT FORM
======================================== */

function clearMeasurementForm() {

  const ids = [

    'leftThumb',
    'leftIndex',
    'leftMiddle',
    'leftRing',
    'leftPinky',

    'rightThumb',
    'rightIndex',
    'rightMiddle',
    'rightRing',
    'rightPinky'

  ];


  ids.forEach(
    function(id) {

      const input =
        document.getElementById(
          id
        );


      if (input) {

        input.value =
          '';

      }

    }
  );

}



/* ========================================
   EDIT MEASUREMENTS
======================================== */

if (editMeasurementsButton) {

  editMeasurementsButton.addEventListener(
    'click',
    function() {

      fillMeasurementForm();


      const message =
        document.getElementById(
          'measurementsMessage'
        );


      if (message) {

        message.textContent =
          '';

      }


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

if (addMeasurementsButton) {

  addMeasurementsButton.addEventListener(
    'click',
    function() {

      clearMeasurementForm();


      const message =
        document.getElementById(
          'measurementsMessage'
        );


      if (message) {

        message.textContent =
          '';

      }


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

if (cancelMeasurementsButton) {

  cancelMeasurementsButton.addEventListener(
    'click',
    function() {

      if (currentMeasurements) {

        fillMeasurementForm();

      } else {

        clearMeasurementForm();

      }


      closeOverlay();

    }
  );

}



/* ========================================
   SAVE MEASUREMENTS
======================================== */

if (saveMeasurementsButton) {

  saveMeasurementsButton.addEventListener(
    'click',
    async function() {

      const message =
        document.getElementById(
          'measurementsMessage'
        );


      const measurements = {

        leftThumb:
          document.getElementById(
            'leftThumb'
          ).value,

        leftIndex:
          document.getElementById(
            'leftIndex'
          ).value,

        leftMiddle:
          document.getElementById(
            'leftMiddle'
          ).value,

        leftRing:
          document.getElementById(
            'leftRing'
          ).value,

        leftPinky:
          document.getElementById(
            'leftPinky'
          ).value,

        rightThumb:
          document.getElementById(
            'rightThumb'
          ).value,

        rightIndex:
          document.getElementById(
            'rightIndex'
          ).value,

        rightMiddle:
          document.getElementById(
            'rightMiddle'
          ).value,

        rightRing:
          document.getElementById(
            'rightRing'
          ).value,

        rightPinky:
          document.getElementById(
            'rightPinky'
          ).value

      };


      const hasInvalidField =
        Object.values(
          measurements
        ).some(
          function(value) {

            return (
              value === '' ||
              Number.isNaN(
                Number(value)
              ) ||
              Number(value) <= 0
            );

          }
        );


      if (hasInvalidField) {

        message.textContent =
          'Please enter all nail measurements.';

        return;

      }


      saveMeasurementsButton.disabled =
        true;


      saveMeasurementsButton.textContent =
        'Saving...';


      message.textContent =
        '';


      try {

        const response =
          await fetch(
            API_URL +
            '/my-measurements',
            {
              method: 'PUT',

              headers: {

                'Content-Type':
                  'application/json',

                Authorization:
                  'Bearer ' +
                  authToken

              },

              body:
                JSON.stringify(
                  measurements
                )
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            'Unable to save measurements.'
          );

        }


        currentMeasurements =
          data.measurements;


        renderMeasurements(
          currentMeasurements
        );


        if (savedMeasurements) {

          savedMeasurements.hidden =
            false;

        }


        if (noMeasurements) {

          noMeasurements.hidden =
            true;

        }


        if (editMeasurementsButton) {

          editMeasurementsButton.hidden =
            false;

        }


        message.textContent =
          'Measurements saved successfully.';


        setTimeout(
          function() {

            closeOverlay();

          },
          700
        );


      } catch (error) {

        console.error(
          'SAVE MEASUREMENTS ERROR:',
          error
        );


        message.textContent =
          error.message;


      } finally {

        saveMeasurementsButton.disabled =
          false;


        saveMeasurementsButton.textContent =
          'Save Measurements';

      }

    }
  );

}



/* ========================================
   PASSWORD
======================================== */

if (changePasswordButton) {

  changePasswordButton.addEventListener(
    'click',
    function() {

      const message =
        document.getElementById(
          'passwordMessage'
        );


      if (message) {

        message.textContent =
          '';

      }


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
   RESET PASSWORD FORM
======================================== */

function resetPasswordForm() {

  const currentPassword =
    document.getElementById(
      'currentPassword'
    );


  const newPassword =
    document.getElementById(
      'newPassword'
    );


  const confirmPassword =
    document.getElementById(
      'confirmPassword'
    );


  if (currentPassword) {

    currentPassword.value =
      '';

    currentPassword.type =
      'password';

  }


  if (newPassword) {

    newPassword.value =
      '';

    newPassword.type =
      'password';

  }


  if (confirmPassword) {

    confirmPassword.value =
      '';

    confirmPassword.type =
      'password';

  }


  document.querySelectorAll(
    '.password-toggle'
  ).forEach(
    function(toggle) {

      toggle.textContent =
        'Show';


      toggle.setAttribute(
        'aria-label',
        'Show password'
      );

    }
  );


  const message =
    document.getElementById(
      'passwordMessage'
    );


  if (message) {

    message.textContent =
      '';

  }

}



/* ========================================
   CANCEL PASSWORD
======================================== */

if (cancelPasswordButton) {

  cancelPasswordButton.addEventListener(
    'click',
    function() {

      resetPasswordForm();

      closeOverlay();

    }
  );

}



/* ========================================
   SAVE PASSWORD
======================================== */

if (savePasswordButton) {

  savePasswordButton.addEventListener(
    'click',
    async function() {

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
        newPassword.length < 8
      ) {

        message.textContent =
          'Your new password must be at least 8 characters.';

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


      savePasswordButton.disabled =
        true;


      savePasswordButton.textContent =
        'Updating...';


      message.textContent =
        '';


      try {

        const response =
          await fetch(
            API_URL +
            '/change-password',
            {
              method: 'PATCH',

              headers: {

                'Content-Type':
                  'application/json',

                Authorization:
                  'Bearer ' +
                  authToken

              },

              body:
                JSON.stringify({

                  currentPassword:
                    currentPassword,

                  newPassword:
                    newPassword

                })
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            'Unable to update password.'
          );

        }


        message.textContent =
          'Password updated successfully.';


        /*
          Wait briefly so the user sees
          the success message.
        */

        setTimeout(
          function() {

            resetPasswordForm();

            closeOverlay();

          },
          900
        );


      } catch (error) {

        console.error(
          'PASSWORD UPDATE ERROR:',
          error
        );


        message.textContent =
          error.message;


      } finally {

        savePasswordButton.disabled =
          false;


        savePasswordButton.textContent =
          'Update Password';

      }

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


        if (!passwordWrap) {

          return;

        }


        const input =
          passwordWrap.querySelector(
            'input'
          );


        if (!input) {

          return;

        }


        const passwordIsHidden =
          input.type ===
          'password';


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
   LOG OUT
======================================== */

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
   INITIALIZE
======================================== */

loadUser();

loadMeasurements();