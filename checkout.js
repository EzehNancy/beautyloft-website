const API_URL =
  'https://beautyloft-backend.onrender.com';


let checkoutCart =
  JSON.parse(
    localStorage.getItem('cart') || '[]'
  );


let currentCheckoutStep = 1;

let currentPendingOrder = null;

let selectedPaymentMethod = 'paystack';

/* ========================================
   HELPERS
======================================== */

function formatNaira(kobo) {

  const naira =
    Number(kobo || 0) / 100;

  return new Intl.NumberFormat(
    'en-NG',
    {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }
  ).format(naira);

}


function escapeHTML(value) {

  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

}


function getCartQuantity() {

  return checkoutCart.reduce(
    function(total, item) {

      return (
        total +
        Number(item.quantity || 1)
      );

    },
    0
  );

}


function getSubtotal() {

  return checkoutCart.reduce(
    function(total, item) {

      return (
        total +
        Number(item.price || 0) *
        Number(item.quantity || 1)
      );

    },
    0
  );

}


/* ========================================
   PRODUCT OPTIONS
======================================== */

function getItemOptions(item) {

  const options = [];

  if (item.size) {
    options.push(
      'Size: ' + escapeHTML(item.size)
    );
  }

  if (item.nailType) {
    options.push(
      escapeHTML(item.nailType)
    );
  }

  if (item.shape) {
    options.push(
      escapeHTML(item.shape)
    );
  }

  if (item.finish) {
    options.push(
      escapeHTML(item.finish)
    );
  }

  if (item.length) {
    options.push(
      'Length: ' + escapeHTML(item.length)
    );
  }

  return options.join(' · ');
}


/* ========================================
   SUMMARY
======================================== */

function renderCheckoutSummary() {

  const container =
    document.getElementById(
      'summaryProducts'
    );

  const count =
    getCartQuantity();

  const subtotal =
    getSubtotal();


  if (!checkoutCart.length) {

    window.location.href =
      'cart.html';

    return;

  }


  container.innerHTML =
    checkoutCart
      .map(function(item) {

        const quantity =
          Number(item.quantity || 1);

        const lineTotal =
          Number(item.price || 0) *
          quantity;

        return `
          <div class="summary-product">

            <div class="summary-product-image">

              ${
                item.image
                  ? `
                    <img
                      src="${escapeHTML(item.image)}"
                      alt="${escapeHTML(item.name)}"
                    >
                  `
                  : ''
              }

              <span
                class="summary-product-quantity"
              >
                ${quantity}
              </span>

            </div>


            <div>

              <h3>
                ${escapeHTML(item.name)}
              </h3>

              <p>
                ${
                  getItemOptions(item) ||
                  'BeautyLoft item'
                }
              </p>

            </div>


            <strong>
              ${formatNaira(lineTotal)}
            </strong>

          </div>
        `;

      })
      .join('');


  document.getElementById(
    'summaryItemCount'
  ).textContent =
    count +
    (count === 1 ? ' item' : ' items');


  document.getElementById(
    'checkoutSubtotal'
  ).textContent =
    formatNaira(subtotal);

    updateCheckoutTotal();

}


/* ========================================
   STEP NAVIGATION
======================================== */

function showCheckoutStep(step) {

  const steps =
    document.querySelectorAll(
      '.checkout-step'
    );

  const progress =
    document.querySelectorAll(
      '.progress-step'
    );


  steps.forEach(function(section) {

    section.classList.toggle(
      'active',
      Number(section.dataset.step) === step
    );

  });


  progress.forEach(function(button) {

    const number =
      Number(button.dataset.progress);

    button.classList.remove(
      'active',
      'completed'
    );

    if (number === step) {
      button.classList.add('active');
    }

    if (number < step) {
      button.classList.add('completed');
    }

  });


  currentCheckoutStep = step;


  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

}


/* ========================================
   ERROR
======================================== */

function showError(elementId, message) {

  const element =
    document.getElementById(elementId);

  element.textContent = message;

  element.classList.add('show');

}


function clearError(elementId) {

  const element =
    document.getElementById(elementId);

  element.textContent = '';

  element.classList.remove('show');

}


/* ========================================
   MEASUREMENTS
======================================== */

const measurementFields = [
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


function getMeasurements() {

  const measurements = {};

  measurementFields.forEach(
    function(field) {

      const input =
        document.getElementById(field);

      measurements[field] =
        input.value
          ? Number(input.value)
          : null;

    }
  );

  return measurements;

}


function validateMeasurements() {

  clearError('measurementError');

  const measurements =
    getMeasurements();


  const missing =
    measurementFields.some(
      function(field) {

        return (
          !measurements[field] ||
          measurements[field] <= 0
        );

      }
    );


  if (missing) {

    showError(
      'measurementError',
      'Please enter all ten nail measurements before continuing.'
    );

    return false;

  }


  return true;

}


/* ========================================
   DELIVERY
======================================== */

function getDeliveryDetails() {

  return {

    firstName:
      document.getElementById(
        'firstName'
      ).value.trim(),

    lastName:
      document.getElementById(
        'lastName'
      ).value.trim(),

    email:
      document.getElementById(
        'email'
      ).value.trim(),

    phone:
      document.getElementById(
        'phone'
      ).value.trim(),

    address:
      document.getElementById(
        'address'
      ).value.trim(),

    city:
      document.getElementById(
        'city'
      ).value.trim(),

    state:
  document.getElementById(
    'state'
  ).value,

area:
  document.getElementById(
    'deliveryArea'
  ).value,

instructions:
  document.getElementById(
    'deliveryInstructions'
  ).value.trim()

  };

}


function validateDelivery() {

  clearError('deliveryError');

  const delivery =
    getDeliveryDetails();


 if (
  !delivery.firstName ||
  !delivery.lastName ||
  !delivery.email ||
  !delivery.phone ||
  !delivery.address ||
  !delivery.city ||
  !delivery.state ||
  !delivery.area
) {

    showError(
      'deliveryError',
      'Please complete all required delivery fields.'
    );

    return false;

  }

  if (
  delivery.area === 'Other Lagos Area'
) {

  showError(
    'deliveryError',
    'Please contact BeautyLoft to confirm delivery availability and price for your area.'
  );

  return false;
}


  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  if (
    !emailPattern.test(
      delivery.email
    )
  ) {

    showError(
      'deliveryError',
      'Please enter a valid email address.'
    );

    return false;

  }


  return true;

}


/* ========================================
   REVIEW
======================================== */

function renderReview() {

  const productContainer =
    document.getElementById(
      'reviewProducts'
    );


  productContainer.innerHTML =
    checkoutCart
      .map(function(item) {

        const quantity =
          Number(item.quantity || 1);

        return `
          <div class="review-product">

            ${
              item.image
                ? `
                  <img
                    src="${escapeHTML(item.image)}"
                    alt="${escapeHTML(item.name)}"
                  >
                `
                : '<div></div>'
            }

            <div>

              <h4>
                ${escapeHTML(item.name)}
              </h4>

              <p>
                ${
                  getItemOptions(item) ||
                  'BeautyLoft item'
                }
              </p>

              <p>
                Quantity: ${quantity}
              </p>

            </div>

            <strong>
              ${
                formatNaira(
                  Number(item.price || 0) *
                  quantity
                )
              }
            </strong>

          </div>
        `;

      })
      .join('');


  const measurements =
    getMeasurements();


  document.getElementById(
    'reviewMeasurements'
  ).innerHTML = `

    <p>
      <strong>Left:</strong>
      Thumb ${measurements.leftThumb}mm ·
      Index ${measurements.leftIndex}mm ·
      Middle ${measurements.leftMiddle}mm ·
      Ring ${measurements.leftRing}mm ·
      Pinky ${measurements.leftPinky}mm
    </p>

    <p>
      <strong>Right:</strong>
      Thumb ${measurements.rightThumb}mm ·
      Index ${measurements.rightIndex}mm ·
      Middle ${measurements.rightMiddle}mm ·
      Ring ${measurements.rightRing}mm ·
      Pinky ${measurements.rightPinky}mm
    </p>

  `;


  const delivery =
    getDeliveryDetails();


  document.getElementById(
    'reviewDelivery'
  ).innerHTML = `

    <p>
      ${escapeHTML(delivery.firstName)}
      ${escapeHTML(delivery.lastName)}
    </p>

    <p>
      ${escapeHTML(delivery.phone)}
    </p>

    <p>
      ${escapeHTML(delivery.email)}
    </p>

   <p>
  ${escapeHTML(delivery.address)}
</p>

<p>
  ${escapeHTML(delivery.area)},
  ${escapeHTML(delivery.city)},
  ${escapeHTML(delivery.state)}
</p>
    ${
      delivery.instructions
        ? `
          <p>
            ${escapeHTML(
              delivery.instructions
            )}
          </p>
        `
        : ''
    }

  `;

}


/* ========================================
   BUTTONS
======================================== */

document.getElementById(
  'measurementContinue'
).addEventListener(
  'click',
  function() {

    if (!validateMeasurements()) {
      return;
    }

    showCheckoutStep(2);

  }
);


document.getElementById(
  'deliveryContinue'
).addEventListener(
  'click',
  function() {

    if (!validateDelivery()) {
      return;
    }

    renderReview();

    showCheckoutStep(3);

  }
);


document.getElementById(
  'reviewContinue'
).addEventListener(
  'click',
  async function() {

    clearError('paymentError');

    const button =
      document.getElementById(
        'reviewContinue'
      );

    const originalHTML =
      button.innerHTML;

    try {

      button.disabled = true;

      button.textContent =
        'Preparing Order...';


      /*
        Only create the order once.
      */

      if (!currentPendingOrder) {

        const result =
          await createPendingOrder();

        currentPendingOrder =
          result.order;

        localStorage.setItem(
          'pendingBeautyLoftOrder',
          JSON.stringify(result)
        );


        console.log(
          'ORDER CREATED:',
          currentPendingOrder
        );

        document.getElementById(
  'paymentOrderReference'
).textContent =
  currentPendingOrder.reference;
      }


      showCheckoutStep(4);


    } catch (error) {

      console.error(
        'CREATE ORDER ERROR:',
        error
      );

      showError(
        'paymentError',
        error.message ||
        'Unable to prepare your order.'
      );


    } finally {

      button.disabled = false;

      button.innerHTML =
        originalHTML;

    }

  }
);


/* BACK BUTTONS */

document.querySelectorAll(
  '[data-back]'
).forEach(function(button) {

  button.addEventListener(
    'click',
    function() {

      showCheckoutStep(
        Number(button.dataset.back)
      );

    }
  );

});


/* EDIT REVIEW */

document.querySelectorAll(
  '[data-edit-step]'
).forEach(function(button) {

  button.addEventListener(
    'click',
    function() {

      showCheckoutStep(
        Number(
          button.dataset.editStep
        )
      );

    }
  );

});


/* ========================================
   CREATE ORDER
======================================== */

async function createPendingOrder() {

  const payload = {

    cart:
      checkoutCart.map(function(item) {

        return {

          productId:
            item.productId,

          quantity:
            Number(item.quantity || 1),

          size:
            item.size || null,

          nailType:
            item.nailType || null,

          shape:
            item.shape || null,

          finish:
            item.finish || null,

          length:
            item.length || null

        };

      }),

    measurements:
      getMeasurements(),

    saveMeasurements:
      document.getElementById(
        'saveMeasurements'
      ).checked,

    delivery:
      getDeliveryDetails()

  };


  const token =
    localStorage.getItem(
      'authToken'
    );


  const headers = {
    'Content-Type':
      'application/json'
  };


  if (token) {

    headers.Authorization =
      'Bearer ' + token;

  }


  const response =
    await fetch(
      API_URL + '/checkout/create-order',
      {
        method: 'POST',

        headers: headers,


        body:
          JSON.stringify(payload)
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.error ||
      'Unable to create your order.'
    );

  }


  return data;

}

async function initializePaystackPayment(
  orderId
) {

  const token =
    localStorage.getItem(
      'authToken'
    );


  if (!token) {

    throw new Error(
      'Please log in before making payment.'
    );

  }


  const response =
    await fetch(
      API_URL + '/payment/initialize',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            'Bearer ' + token
        },

        body:
          JSON.stringify({
            orderId: orderId
          })
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.error ||
      'Unable to initialize payment.'
    );

  }


  return data;

}

/* ========================================
   PAYMENT METHOD SELECTION
======================================== */

const paystackMethod =
  document.getElementById(
    'paystackMethod'
  );

const bankTransferMethod =
  document.getElementById(
    'bankTransferMethod'
  );


/* ========================================
   PAYSTACK METHOD
======================================== */

paystackMethod.addEventListener(
  'click',
  function() {

    selectedPaymentMethod =
      'paystack';

    paystackMethod.classList.add(
      'active'
    );

    bankTransferMethod.classList.remove(
      'active'
    );


    const bankTransferPanel =
      document.getElementById(
        'bankTransferPanel'
      );

    if (bankTransferPanel) {

      bankTransferPanel.classList.remove(
        'show'
      );

    }


    document.getElementById(
      'payButton'
    ).innerHTML = `
      Pay
      <span id="payButtonTotal">
        ${formatNaira(
          getSubtotal() +
          selectedDeliveryFee
        )}
      </span>
    `;

  }
);


/* ========================================
   BANK TRANSFER METHOD
======================================== */

bankTransferMethod.addEventListener(
  'click',
  function() {

    selectedPaymentMethod =
      'bank-transfer';

    bankTransferMethod.classList.add(
      'active'
    );

    paystackMethod.classList.remove(
      'active'
    );


    const bankTransferPanel =
      document.getElementById(
        'bankTransferPanel'
      );


    if (bankTransferPanel) {

      bankTransferPanel.classList.add(
        'show'
      );

    }


    const bankTransferAmount =
      document.getElementById(
        'bankTransferAmount'
      );


    if (bankTransferAmount) {

      bankTransferAmount.textContent =
        formatNaira(
          getSubtotal() +
          selectedDeliveryFee
        );

    }


    const bankTransferReference =
      document.getElementById(
        'bankTransferReference'
      );


    if (
      bankTransferReference &&
      currentPendingOrder
    ) {

      bankTransferReference.textContent =
  currentPendingOrder.reference;

    }


    document.getElementById(
      'payButton'
    ).innerHTML = `
      Continue with Bank Transfer
    `;

  }
);

/* ========================================
   PAYMENT
======================================== */

document.getElementById(
  'payButton'
).addEventListener(
  'click',
  async function() {

    clearError('paymentError');


    if (
      !document.getElementById(
        'confirmOrder'
      ).checked
    ) {

      showError(
        'paymentError',
        'Please confirm your order details before paying.'
      );

      return;

    }


    const button =
      document.getElementById(
        'payButton'
      );


    const originalHTML =
      button.innerHTML;


    try {

      button.disabled = true;

      button.textContent =
        'Preparing Payment...';


     if (!currentPendingOrder) {

  throw new Error(
    'Your order could not be found. Please return to Review and try again.'
  );

}


/* PAYSTACK */

if (
  selectedPaymentMethod ===
  'paystack'
) {

  const payment =
    await initializePaystackPayment(
      currentPendingOrder.id
    );

  window.location.href =
    payment.authorizationUrl;

  return;

}


/* DIRECT BANK TRANSFER */

if (
  selectedPaymentMethod ===
  'bank-transfer'
) {

  button.textContent =
    'Submitting Transfer...';

 const response = await fetch(
  API_URL + '/payment/bank-transfer',
      {
        method: 'PATCH',

        headers: {
          'Content-Type':
            'application/json',

          'Authorization':
            `Bearer ${localStorage.getItem(
              'authToken'
            )}`
        },

        body: JSON.stringify({
          orderId:
            currentPendingOrder.id
        })
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.error ||
      'Unable to submit your transfer.'
    );

  }


  localStorage.setItem(
    'pendingBeautyLoftOrder',
    JSON.stringify({
      order: data.order
    })
  );


  console.log(
    'BANK TRANSFER SUBMITTED:',
    data.order
  );


  window.location.href =
    'payment-pending.html';

  return;

}

    } catch (error) {

      console.error(error);

      showError(
        'paymentError',
        error.message
      );

    } finally {

      button.disabled = false;

      button.innerHTML =
        originalHTML;

    }

  }
);

/* ========================================
   COPY ORDER REFERENCE
======================================== */

document.getElementById(
  'copyOrderReference'
).addEventListener(
  'click',
  async function() {

    if (
      !currentPendingOrder ||
      !currentPendingOrder.reference
    ) {
      return;
    }

    try {

      await navigator.clipboard.writeText(
        currentPendingOrder.reference
      );

      const button = this;

      button.textContent = 'Copied';

      setTimeout(function() {

        button.textContent = 'Copy';

      }, 1500);

    } catch (error) {

      console.error(
        'COPY REFERENCE ERROR:',
        error
      );

    }

  }
);
/* ========================================
   INITIALIZE
======================================== */


const LAGOS_DELIVERY_ZONES = {

  zone1: {
    name: 'Central Mainland',
    areas: [
      'Ikeja',
      'Allen Avenue',
      'Opebi',
      'Alausa',
      'Maryland',
      'Anthony',
      'Ogba',
      'Ojodu',
      'Berger',
      'Omole',
      'Magodo',
      'GRA Ikeja',
      'Computer Village'
    ],
    price: 1 * 100
  },


  zone2: {
    name: 'Mainland',
    areas: [
      'Yaba',
      'Sabo Yaba',
      'Akoka',
      'Onike',
      'Surulere',
      'Aguda',
      'Ijesha',
      'Mushin',
      'Palmgrove',
      'Onipanu',
      'Shomolu',
      'Bariga',
      'Gbagada',
      'Ifako-Gbagada',
      'Pedro',
      'Fadeyi',
      'Jibowu',
      'Ebute Metta'
    ],
    price: 3000 * 100
  },


  zone3: {
    name: 'East Mainland',
    areas: [
      'Ketu',
      'Mile 12',
      'Ojota',
      'Kosofe',
      'Ikosi',
      'Alapere',
      'Ogudu',
      'Oworonshoki',
      'Ifako-Ijaiye',
      'Agege',
      'Dopemu',
      'Iju',
      'Fagba',
      'Abule Egba'
    ],
    price: 3000 * 100
  },


  zone4: {
    name: 'Victoria Island & Ikoyi',
    areas: [
      'Victoria Island',
      'Oniru',
      'Ikoyi',
      'Banana Island'
    ],
    price: 4000 * 100
  },


  zone5: {
    name: 'Lekki',
    areas: [
      'Lekki Phase 1',
      'Ikate',
      'Osapa London',
      'Agungi',
      'Chevron',
      'Igbo Efon',
      'Jakande',
      'Chisco',
      'VGC'
    ],
    price: 4000 * 100
  },


  zone6: {
    name: 'Ajah Axis',
    areas: [
      'Ajah',
      'Abraham Adesanya',
      'Sangotedo',
      'Badore',
      'Addo',
      'Langbasa',
      'Thomas Estate',
      'Ogombo'
    ],
    price: 4500 * 100
  },


  zone7: {
    name: 'Lagos Island',
    areas: [
      'Lagos Island',
      'Marina',
      'CMS',
      'Obalende',
      'Adeniji Adele'
    ],
    price: 3500 * 100
  },


  zone8: {
    name: 'Apapa Axis',
    areas: [
      'Apapa',
      'GRA Apapa',
      'Ajegunle',
      'Ijora',
      'Orile',
      'Amukoko'
    ],
    price: 4000 * 100
  },


  zone9: {
    name: 'Festac & Amuwo',
    areas: [
      'Festac',
      'Amuwo Odofin',
      'Satellite Town',
      'Mile 2',
      'Apple Junction',
      'Ago Palace',
      'Okota',
      'Isolo',
      'Oshodi',
      'Ajao Estate'
    ],
    price: 4000 * 100
  },


  zone10: {
    name: 'Alimosho',
    areas: [
      'Egbeda',
      'Idimu',
      'Ikotun',
      'Igando',
      'Iyana Ipaja',
      'Ayobo',
      'Ipaja',
      'Akowonjo',
      'Gowon Estate',
      'Command',
      'Abesan Estate'
    ],
    price: 3500 * 100
  },


  zone11: {
    name: 'Ikorodu Axis',
    areas: [
      'Ikorodu',
      'Agric Ikorodu',
      'Igbogbo',
      'Ebute Ikorodu',
      'Owode',
      'Bayeku'
    ],
    price: 5000 * 100
  },


  zone12: {
    name: 'Badagry Axis',
    areas: [
      'Badagry',
      'Ojo',
      'Alaba',
      'Okokomaiko',
      'Ijanikin',
      'Trade Fair',
      'Volkswagen'
    ],
    price: 5500 * 100
  },


  zone13: {
    name: 'Epe & Ibeju-Lekki',
    areas: [
      'Ibeju-Lekki',
      'Lakowe',
      'Awoyaya',
      'Abijo',
      'Bogije',
      'Eleko',
      'Epe'
    ],
    price: 5500 * 100
  }

};

/* ========================================
   DELIVERY AREA
======================================== */

let selectedDeliveryFee = 0;


function populateDeliveryAreas() {

  const deliveryAreaSelect =
    document.getElementById('deliveryArea');

  if (!deliveryAreaSelect) {
    return;
  }


  deliveryAreaSelect.innerHTML = `
    <option value="">
      Select your area
    </option>
  `;


  Object.entries(
    LAGOS_DELIVERY_ZONES
  ).forEach(function([zoneKey, zone]) {

    const group =
      document.createElement('optgroup');

    group.label = zone.name;


    zone.areas.forEach(function(area) {

      const option =
        document.createElement('option');

      option.value = area;

      option.textContent = area;

      option.dataset.zone = zoneKey;

      group.appendChild(option);

    });


    deliveryAreaSelect.appendChild(group);

  });


  const otherOption =
    document.createElement('option');

  otherOption.value =
    'Other Lagos Area';

  otherOption.textContent =
    'Other Lagos Area';

  deliveryAreaSelect.appendChild(
    otherOption
  );

}

function getSelectedDeliveryFee() {

  const deliveryAreaSelect =
    document.getElementById('deliveryArea');

  if (!deliveryAreaSelect) {
    return 0;
  }

  const selectedOption =
    deliveryAreaSelect.options[
      deliveryAreaSelect.selectedIndex
    ];

  if (
    !selectedOption ||
    !selectedOption.dataset.zone
  ) {
    return 0;
  }

  const zone =
    LAGOS_DELIVERY_ZONES[
      selectedOption.dataset.zone
    ];

  return zone ? zone.price : 0;
}


function updateCheckoutTotal() {

  const subtotal =
    getSubtotal();

  const total =
    subtotal + selectedDeliveryFee;


  const deliveryElement =
    document.getElementById(
      'checkoutDelivery'
    );

  const totalElement =
    document.getElementById(
      'checkoutTotal'
    );

  const payTotal =
    document.getElementById(
      'payButtonTotal'
    );


  if (selectedDeliveryFee > 0) {

    deliveryElement.textContent =
      formatNaira(
        selectedDeliveryFee
      );

  } else {

    deliveryElement.textContent =
      'Select delivery area';

  }


  totalElement.textContent =
    formatNaira(total);


  payTotal.textContent =
    formatNaira(total);

}

const deliveryAreaSelect =
  document.getElementById(
    'deliveryArea'
  );


if (deliveryAreaSelect) {

  deliveryAreaSelect.addEventListener(
    'change',
    function() {

      const selectedArea =
        deliveryAreaSelect.value;


      if (
        selectedArea ===
        'Other Lagos Area'
      ) {

        selectedDeliveryFee = 0;

        document.getElementById(
          'checkoutDelivery'
        ).textContent =
          'Contact BeautyLoft';

        document.getElementById(
          'checkoutTotal'
        ).textContent =
          formatNaira(
            getSubtotal()
          );

        document.getElementById(
          'payButtonTotal'
        ).textContent =
          formatNaira(
            getSubtotal()
          );

        return;

      }


      selectedDeliveryFee =
        getSelectedDeliveryFee();


      updateCheckoutTotal();

    }
  );

}

populateDeliveryAreas();

renderCheckoutSummary();

showCheckoutStep(1);

