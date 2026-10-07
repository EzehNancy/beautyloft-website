const API_URL =
  'https://beautyloft-backend.onrender.com';


async function verifyPayment() {

  const title =
    document.getElementById(
      'paymentTitle'
    );

  const message =
    document.getElementById(
      'paymentMessage'
    );

  const icon =
    document.getElementById(
      'paymentIcon'
    );

  const actions =
    document.getElementById(
      'paymentActions'
    );


  /* ========================================
     VERIFYING STATE
  ======================================== */

  if (icon) {
    icon.textContent = '…';
    icon.className =
      'payment-status-icon verifying';
  }

  title.textContent =
    'Verifying Payment';

  message.textContent =
    'Please wait while we confirm your payment with Paystack.';

  if (actions) {
    actions.innerHTML = '';
  }


  /* ========================================
     GET PAYMENT REFERENCE
  ======================================== */

  const params =
    new URLSearchParams(
      window.location.search
    );

  const reference =
    params.get('reference');


  if (!reference) {

    showFailure(
      'Unable to verify payment',
      'No payment reference was provided.'
    );

    return;
  }


  /* ========================================
     AUTHENTICATION
  ======================================== */

  const token =
    localStorage.getItem(
      'authToken'
    );


  if (!token) {

    showFailure(
      'Please log in',
      'Your payment may still have been received. Log in to view the latest status of your order.'
    );

    return;
  }


  try {

    /* ========================================
       ASK BEAUTYLOFT BACKEND TO VERIFY
    ======================================== */

    const response =
      await fetch(
        API_URL +
        '/payment/verify/' +
        encodeURIComponent(reference),
        {
          method: 'GET',

          headers: {
            Authorization:
              'Bearer ' + token
          }
        }
      );


    let data = {};

    try {

      data =
        await response.json();

    } catch (jsonError) {

      throw new Error(
        'We could not read the payment verification response.'
      );

    }


    /* ========================================
       PAYMENT SUCCESS
    ======================================== */

   if (
  response.ok &&
  data.success &&
  data.paid
) {

  if (data.stockIssue) {

    showStockIssue(
      data.orderReference,
      data.unavailableProduct
    );

    return;

  }


  showSuccess(
    data.orderReference
  );

  return;
}


    /* ========================================
       PAYMENT NOT COMPLETED
    ======================================== */

    if (
      data.paid === false
    ) {

      showPendingOrFailed(
        data.error ||
        'Payment has not been completed.'
      );

      return;
    }


    /* ========================================
       OTHER SERVER ERROR
    ======================================== */

    throw new Error(
      data.error ||
      'Payment could not be verified.'
    );


  } catch (error) {

    console.error(
      'PAYMENT VERIFY ERROR:',
      error
    );


    /*
     * IMPORTANT:
     *
     * A network error does NOT prove
     * that payment failed.
     *
     * Paystack's webhook may still
     * confirm the payment on the server.
     */

    showPending(
      'We could not confirm your payment right now. If you completed payment, your order may still be confirmed automatically.'
    );

  }


  /* ========================================
     SUCCESS
  ======================================== */

  function showSuccess(
    orderReference
  ) {

    if (icon) {

      icon.textContent = '✓';

      icon.className =
        'payment-status-icon success';

    }


    title.textContent =
      'Payment Successful!';


    message.textContent =
      'Your order ' +
      orderReference +
      ' has been confirmed.';


    /*
     * Only clear the cart after the
     * BACKEND confirms payment.
     */

    localStorage.removeItem(
      'cart'
    );

    localStorage.removeItem(
      'pendingBeautyLoftOrder'
    );


    if (actions) {

      actions.innerHTML = `
        <a
          href="orders.html"
          class="payment-primary-button"
        >
          View Order
        </a>

        <a
          href="shop.html"
          class="payment-secondary-button"
        >
          Continue Shopping
        </a>
      `;

    }

  }


  /* ========================================
     PAYMENT PENDING
  ======================================== */

  function showPending(
    text
  ) {

    if (icon) {

      icon.textContent = '…';

      icon.className =
        'payment-status-icon pending';

    }


    title.textContent =
      'Payment Confirmation Pending';


    message.textContent =
      text;


   if (actions) {

  actions.innerHTML = `
    <button
      type="button"
      class="payment-primary-button"
      id="retryPaymentButton"
    >
      Try Payment Again
    </button>

    <a
      href="orders.html"
      class="payment-secondary-button"
    >
      View My Orders
    </a>
  `;


  const retryButton =
    document.getElementById(
      'retryPaymentButton'
    );


  if (retryButton) {

    retryButton.addEventListener(
      'click',
      retryPayment
    );

  }

}

  }


  /* ========================================
     FAILED / NOT COMPLETED
  ======================================== */

  function showPendingOrFailed(
    text
  ) {

    if (icon) {

      icon.textContent = '×';

      icon.className =
        'payment-status-icon failed';

    }


    title.textContent =
      'Payment Not Completed';


    message.textContent =
      text;


    if (actions) {

      actions.innerHTML = `
        <a
          href="orders.html"
          class="payment-primary-button"
        >
          View Order
        </a>

        <a
          href="checkout.html"
          class="payment-secondary-button"
        >
          Return to Checkout
        </a>
      `;

    }

  }

  function showStockIssue(
  orderReference,
  productName
) {

  if (icon) {

    icon.textContent = '!';

    icon.className =
      'payment-status-icon attention';

  }


  title.textContent =
    'Payment Received';


  message.textContent =
    'Your payment for order ' +
    orderReference +
    ' was received successfully, but ' +
    (
      productName ||
      'one of the products in your order'
    ) +
    ' became unavailable before we could confirm the order. BeautyLoft will contact you regarding the next step.';


  /*
   * PAYMENT WAS SUCCESSFUL.
   *
   * The customer should not accidentally
   * submit this cart/payment again.
   */

  localStorage.removeItem(
    'cart'
  );

  localStorage.removeItem(
    'pendingBeautyLoftOrder'
  );


  if (actions) {

    actions.innerHTML = `
      <a
        href="orders.html"
        class="payment-primary-button"
      >
        View Order
      </a>

      <a
        href="shop.html"
        class="payment-secondary-button"
      >
        Continue Shopping
      </a>
    `;

  }

}

  /* ========================================
     FAILURE
  ======================================== */

  function showFailure(
    heading,
    text
  ) {

    if (icon) {

      icon.textContent = '×';

      icon.className =
        'payment-status-icon failed';

    }


    title.textContent =
      heading;


    message.textContent =
      text;


    if (actions) {

      actions.innerHTML = `
        <a
          href="orders.html"
          class="payment-primary-button"
        >
          View My Orders
        </a>

        <a
          href="shop.html"
          class="payment-secondary-button"
        >
          Continue Shopping
        </a>
      `;

    }

  }

}

async function retryPayment() {

  const retryButton =
    document.getElementById(
      'retryPaymentButton'
    );


  const savedOrder =
    JSON.parse(
      localStorage.getItem(
        'pendingBeautyLoftOrder'
      ) || 'null'
    );


  /* ========================================
     CHECK SAVED ORDER
  ======================================== */

  if (
    !savedOrder ||
    !savedOrder.order ||
    !savedOrder.order.id
  ) {

    alert(
      'We could not find the pending order. Please view your orders and try again.'
    );

    window.location.href =
      'orders.html';

    return;
  }


  const orderId =
    savedOrder.order.id;


  /* ========================================
     CHECK LOGIN
  ======================================== */

  const token =
    localStorage.getItem(
      'authToken'
    );


  if (!token) {

    alert(
      'Please log in before trying payment again.'
    );

    window.location.href =
      'login.html';

    return;
  }


  try {

    /* ========================================
       PREVENT DOUBLE CLICK
    ======================================== */

    if (retryButton) {

      retryButton.disabled = true;

      retryButton.textContent =
        'Preparing Payment...';

    }


    /* ========================================
       REINITIALIZE EXISTING ORDER
    ======================================== */

    const response =
      await fetch(
        API_URL +
        '/payment/initialize',
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


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.error ||
        'Unable to restart payment.'
      );

    }


    /* ========================================
       SAVE UPDATED PAYMENT REFERENCE
    ======================================== */

    savedOrder.paymentReference =
      data.reference;


    localStorage.setItem(
      'pendingBeautyLoftOrder',
      JSON.stringify(savedOrder)
    );


    /* ========================================
       RETURN CUSTOMER TO PAYSTACK
    ======================================== */

    window.location.href =
      data.authorizationUrl;


  } catch (error) {

    console.error(
      'RETRY PAYMENT ERROR:',
      error
    );


    alert(
      error.message ||
      'Unable to restart payment. Please try again.'
    );


    if (retryButton) {

      retryButton.disabled = false;

      retryButton.textContent =
        'Try Payment Again';

    }

  }

}

verifyPayment();