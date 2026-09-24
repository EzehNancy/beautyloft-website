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


  const params =
    new URLSearchParams(
      window.location.search
    );


  const reference =
    params.get('reference');


  if (!reference) {

    title.textContent =
      'Unable to verify payment';

    message.textContent =
      'No payment reference was provided.';

    return;

  }


  const token =
    localStorage.getItem(
      'authToken'
    );


  if (!token) {

    title.textContent =
      'Please log in';

    message.textContent =
      'We could not verify this order because your login session was not found.';

    return;

  }


  try {

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


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success ||
      !data.paid
    ) {

      throw new Error(
        data.error ||
        'Payment could not be verified.'
      );

    }


    /*
     * Backend has now confirmed payment
     * directly with Paystack.
     */

    title.textContent =
      'Payment Successful!';

    message.textContent =
      'Your order ' +
      data.orderReference +
      ' has been confirmed.';


    /*
     * Clear cart only AFTER the backend
     * confirms payment.
     */

    localStorage.removeItem(
      'cart'
    );

    localStorage.removeItem(
      'pendingBeautyLoftOrder'
    );


  } catch (error) {

    console.error(error);

    title.textContent =
      'Payment Verification Failed';

    message.textContent =
      error.message;

  }

}


verifyPayment();