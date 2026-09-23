const cartPageItems = document.getElementById('cartPageItems');
const cartPageItemCount = document.getElementById('cartPageItemCount');
const cartPageSubtotal = document.getElementById('cartPageSubtotal');
const cartPageTotal = document.getElementById('cartPageTotal');

let cart = JSON.parse(localStorage.getItem('cart')) || [];

console.log('Cart page cart:', cart);

function formatNaira(amountInKobo) {
  return '₦' + (amountInKobo / 100).toLocaleString('en-NG');
}


function renderCartPage() {

  cartPageItems.innerHTML = '';


  // -------------------------
  // EMPTY CART
  // -------------------------

  if (cart.length === 0) {

    cartPageItems.innerHTML = `
      <div class="cart-empty-state">

        <div class="cart-empty-icon">

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M6 7h12l-1 13H7L6 7Z"></path>
            <path d="M9 7V5a3 3 0 0 1 6 0v2"></path>
          </svg>

        </div>

        <h3>Your bag is empty</h3>

        <p>
          Add a few BeautyLoft favourites to get started.
        </p>

      </div>
    `;

    cartPageItemCount.textContent = '0 items';
    cartPageSubtotal.textContent = '₦0';
    cartPageTotal.textContent = '₦0';

    return;
  }


  // -------------------------
  // CART ITEMS
  // -------------------------

  cart.forEach(function(item, index) {

    const quantity = item.quantity || 1;

    const itemTotal =
      item.price * quantity;


    const cartItem =
      document.createElement('div');

    cartItem.className =
      'cart-page-item';


    cartItem.innerHTML = `

      <div class="cart-page-item-image">

        <img
          src="${item.image || ''}"
          alt="${item.name || 'BeautyLoft product'}"
        >

      </div>


      <div class="cart-page-item-details">

        <h3>
          ${item.name || 'BeautyLoft Product'}
        </h3>


       <p class="cart-page-options">
  ${[
    item.size,
    item.shape,
    item.finish,
    item.nailType
  ]
    .filter(Boolean)
    .join(' · ')}
</p>


        <p class="cart-page-item-price">
          ${formatNaira(itemTotal)}
        </p>

      </div>


      <div class="cart-page-item-controls">

       <div class="cart-quantity-wrap">

  <div class="cart-page-quantity">

    <button
      type="button"
      class="cart-qty-minus"
      data-index="${index}"
      aria-label="Decrease quantity"
    >
      −
    </button>

    <span>
      ${quantity}
    </span>

    <button
      type="button"
      class="cart-qty-plus"
      data-index="${index}"
      aria-label="Increase quantity"
    >
      +
    </button>

  </div>

  <p
    class="cart-quantity-limit"
    ${quantity >= 3 ? '' : 'hidden'}
  >
    Maximum of 3 sets per product.
  </p>

</div>


      <div class="cart-page-actions">

  <button
    type="button"
    class="cart-page-action cart-page-edit"
    data-index="${index}"
    data-product-id="${item.productId}"
  >
    Edit
  </button>

  <button
    type="button"
    class="cart-page-action cart-page-remove"
    data-index="${index}"
  >
    Remove
  </button>

</div>

      </div>

    `;


    cartPageItems.appendChild(
      cartItem
    );

  });


  // -------------------------
  // TOTALS
  // -------------------------

  const totalQuantity =
    cart.reduce(function(total, item) {

      return total +
        (item.quantity || 1);

    }, 0);


  const subtotal =
    cart.reduce(function(total, item) {

      return total +
        (
          item.price *
          (item.quantity || 1)
        );

    }, 0);


  cartPageItemCount.textContent =
    totalQuantity +
    (totalQuantity === 1
      ? ' item'
      : ' items');


  cartPageSubtotal.textContent =
    formatNaira(subtotal);


  cartPageTotal.textContent =
    formatNaira(subtotal);

}


// Run when page opens

renderCartPage();

// =====================================================
// CART QUANTITY + REMOVE
// =====================================================

cartPageItems.addEventListener('click', function(event) {

      // -------------------------
  // EDIT CART ITEM
  // -------------------------

  const editButton =
    event.target.closest('.cart-page-edit');

  if (editButton) {

    const index =
      Number(editButton.dataset.index);

    const productId =
      editButton.dataset.productId;


    window.location.href =
  'product.html?id=' +
  productId +
  '&editIndex=' +
  index;

    return;
  }

  // -------------------------
  // INCREASE QUANTITY
  // -------------------------

  const plusButton =
    event.target.closest('.cart-qty-plus');

    if (plusButton) {

  const index =
    Number(plusButton.dataset.index);

  const currentQuantity =
    cart[index].quantity || 1;


  if (currentQuantity >= 3) {

    const cartItem =
      plusButton.closest('.cart-page-item');

    const limitMessage =
      cartItem.querySelector(
        '.cart-quantity-limit'
      );

    if (limitMessage) {
      limitMessage.style.display =
        'block';
    }

    return;
  }


  cart[index].quantity =
    currentQuantity + 1;

  saveCart();

  return;
}


  // -------------------------
  // DECREASE QUANTITY
  // -------------------------

  const minusButton =
    event.target.closest('.cart-qty-minus');

  if (minusButton) {

    const index =
      Number(minusButton.dataset.index);

    const currentQuantity =
      cart[index].quantity || 1;


    if (currentQuantity > 1) {

      cart[index].quantity =
        currentQuantity - 1;

      saveCart();

    }

    return;
  }


  // -------------------------
  // REMOVE ITEM
  // -------------------------

  const removeButton =
    event.target.closest('.cart-page-remove');

  if (removeButton) {

    const index =
      Number(removeButton.dataset.index);

    cart.splice(index, 1);

    saveCart();

  }

});


// =====================================================
// SAVE CART
// =====================================================

function saveCart() {

  localStorage.setItem(
    'cart',
    JSON.stringify(cart)
  );


  // Redraw cart page

  renderCartPage();


  // Tell other cart UI that
  // localStorage has changed

  window.dispatchEvent(
    new Event('cartUpdated')
  );

}

const checkoutBtn =
  document.getElementById('checkoutBtn');

if (checkoutBtn) {
  checkoutBtn.addEventListener(
    'click',
    function () {

      if (cart.length === 0) {
        return;
      }

      window.location.href =
        'checkout.html';
    }
  );
}