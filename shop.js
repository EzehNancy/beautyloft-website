
if (menuToggle && navList) {

  menuToggle.addEventListener('click', function () {
    navList.classList.toggle('show');
  });

  // Close menu after clicking a navigation link
  navList.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navList.classList.remove('show');
    });
  });

}

// =========================
// CART DRAWER
// =========================

const cartToggle = document.getElementById('cartToggle');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');

cartToggle.addEventListener('click', function () {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
});
// Reopen cart drawer after updating a product
if (sessionStorage.getItem('reopenCartDrawer') === 'true') {

  sessionStorage.removeItem('reopenCartDrawer');

  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
}

cartClose.addEventListener('click', function () {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
});

cartOverlay.addEventListener('click', function () {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
});


// =========================
// CART
// =========================

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');


const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

function renderCart() {
  cartCount.textContent = cart.reduce(function(sum, item) { return sum + (item.quantity || 1); }, 0);
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align:center; color:var(--ink-soft); padding:30px 0;">Your cart is empty.</p>';
    cartTotal.textContent = '';
    return;
  }

  let total = 0;

  cart.forEach(function(item, index) {
    const qty = item.quantity || 1;
    const lineTotal = (item.price * qty) / 100;
    total += item.price * qty;

    const optionsText = [
      item.size ? 'Size: ' + item.size : '',
      item.shape ? 'Shape: ' + item.shape : '',
      item.length ? 'Length: ' + item.length : '',
      item.finish ? item.finish : ''
    ].filter(Boolean).join(' · ');

    cartItems.innerHTML += `
      <div class="cart-line">
        <div class="cart-line-top">
          <div class="cart-line-photo">
            ${item.image
              ? `<img src="${item.image}" alt="${item.name}">`
              : `<div class="cart-line-photo-placeholder"></div>`
            }
          </div>
          <div class="cart-line-details">
            <strong>${item.name}</strong>
            <p class="cart-line-options">${optionsText}</p>
          </div>
        </div>
        <div class="cart-line-bottom">
          <div class="cart-qty-wrap">

  <div class="qty-controls">
    <button type="button" class="qty-btn" data-index="${index}" data-action="minus">−</button>
    <span>${qty}</span>
    <button type="button" class="qty-btn" data-index="${index}" data-action="plus">+</button>
  </div>

</div>
          <span class="cart-line-price">₦${lineTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
          <a href="product.html?id=${item.productId}&editIndex=${index}&returnTo=${encodeURIComponent(window.location.href)}&reopenCart=1" class="edit-line-btn">Edit</a>
          <button type="button" class="remove-line-btn" data-index="${index}">Remove</button>
        </div>
      </div>
    `;
  });

const totalItems = cart.reduce(function(sum, item) {
  return sum + (item.quantity || 1);
}, 0);

cartTotal.innerHTML = `
  <span>Total Items (${totalItems}):</span>
  <span>₦${(total / 100).toLocaleString('en-NG')}</span>
`;
  document.querySelectorAll('.qty-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const idx = parseInt(btn.dataset.index, 10);
      const currentQty = cart[idx].quantity || 1;

     if (btn.dataset.action === 'plus') {

  if (currentQty < 3) {

    cart[idx].quantity = currentQty + 1;

  } else {

    const limitMessage =
      document.querySelector(
        `.cart-qty-limit[data-limit-index="${idx}"]`
      );

    if (limitMessage) {
      limitMessage.hidden = false;
    }

    return;
  }

} else if (currentQty > 1) {

  cart[idx].quantity = currentQty - 1;

}

      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    });
  });

  document.querySelectorAll('.remove-line-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const idx = parseInt(btn.dataset.index, 10);
      cart.splice(idx, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    });
  });
}


// =========================
// PRODUCTS
// =========================

let products = [];

const shopSearchInput =
  document.getElementById('shopSearchInput');

const clearShopSearch =
  document.getElementById('clearShopSearch');

  const shopSearchSuggestions =
  document.getElementById('shopSearchSuggestions');

fetch('https://beautyloft-backend.onrender.com/products')
  .then(function(response) {
    if (!response.ok) {
      throw new Error('Failed to load products.');
    }
    return response.json();
  })
  .then(function(data) {

  products = data.products || [];

  // Check whether the customer came
  // from the shop-home search
  const urlParams =
    new URLSearchParams(window.location.search);

  const searchFromHome =
    urlParams.get('search');

  if (searchFromHome) {

    const searchTerm =
      searchFromHome
        .trim()
        .toLowerCase();

    // Put the search into the shop search box
    if (shopSearchInput) {
      shopSearchInput.value =
        searchFromHome;
    }

    // Show the clear X
    if (clearShopSearch) {
      clearShopSearch.hidden = false;
    }

    // Search name + collection
    const searchResults =
      products.filter(function(product) {

        const productName =
          (product.name || '')
            .toLowerCase();

        const productCollection =
          (product.collection || '')
            .toLowerCase();

        return (
          productName.includes(searchTerm) ||
          productCollection.includes(searchTerm)
        );

      });

    renderShopGrid(searchResults);

  } else {

    // Normal shop visit
    renderShopGrid();

  }

})
  .catch(function(error) {
    console.error(error);
    const shopGrid = document.getElementById('shopGrid');
    shopGrid.innerHTML = '<p class="activity-empty">Unable to load products.</p>';
  });


// =========================
// RENDER PRODUCTS
// =========================

function renderShopGrid(productsToRender = products) {
  const shopGrid = document.getElementById('shopGrid');

  if (!productsToRender.length) {
    shopGrid.innerHTML =
      '<p class="activity-empty">No products available right now.</p>';
    return;
  }

  shopGrid.innerHTML = '';

  productsToRender.forEach(function(p) {

    const nairaPrice = (p.price / 100).toLocaleString('en-NG', {
      minimumFractionDigits: 2
    });

    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
      <div class="product-photo-wrap">

  <a href="product.html?id=${p.id}" class="product-photo">
    ${
      p.image_url
        ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">`
        : `<div class="ph" style="background:linear-gradient(160deg,#C9A876,#98645C);">${p.name}</div>`
    }
  </a>

  <button
    type="button"
    class="wishlist-btn"
    data-product-id="${p.id}"
    aria-label="Add ${p.name} to wishlist">
    ♡
  </button>

</div>

      <div class="product-info">

        <p class="product-collection">
          ${p.collection || 'BeautyLoft Collection'}
        </p>

        <a href="product.html?id=${p.id}" class="product-name-link">
          <h3>${p.name}</h3>
        </a>

        <p class="product-price">₦${nairaPrice}</p>

        <button class="add-cart-btn">Add to Cart</button>

      </div>
    `;

    const wishlistBtn = card.querySelector('.wishlist-btn');

const alreadyWishlisted = wishlist.some(function(item) {
  return String(item.productId) === String(p.id);
});

if (alreadyWishlisted) {
  wishlistBtn.textContent = '♥';
  wishlistBtn.classList.add('active');
  wishlistBtn.setAttribute(
    'aria-label',
    'Remove ' + p.name + ' from wishlist'
  );
}

wishlistBtn.addEventListener('click', function() {

  const wishlistIndex = wishlist.findIndex(function(item) {
    return String(item.productId) === String(p.id);
  });

  if (wishlistIndex !== -1) {

    wishlist.splice(wishlistIndex, 1);

    wishlistBtn.textContent = '♡';
    wishlistBtn.classList.remove('active');

    wishlistBtn.setAttribute(
      'aria-label',
      'Add ' + p.name + ' to wishlist'
    );

  } else {

    wishlist.push({
      productId: p.id,
      name: p.name,
      collection: p.collection,
      price: p.price,
      image: p.image_url
    });

    wishlistBtn.textContent = '♥';
    wishlistBtn.classList.add('active');

    wishlistBtn.setAttribute(
      'aria-label',
      'Remove ' + p.name + ' from wishlist'
    );
  }

  localStorage.setItem(
    'wishlist',
    JSON.stringify(wishlist)
  );

});

    const addBtn = card.querySelector('.add-cart-btn');

    addBtn.addEventListener('click', function() {
      cart.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: 1,
        image: p.image_url
      });

      localStorage.setItem('cart', JSON.stringify(cart));

      renderCart();

      addBtn.textContent = 'Added ✓';
      addBtn.classList.add('added');

      setTimeout(function() {
        addBtn.textContent = 'Add to Cart';
        addBtn.classList.remove('added');
      }, 1200);
    });

    shopGrid.appendChild(card);
  });
}

// =========================
// SHOP SEARCH AUTOCOMPLETE
// =========================

if (shopSearchInput && shopSearchSuggestions) {

  shopSearchInput.addEventListener('input', function() {

    const searchTerm =
      shopSearchInput.value
        .trim()
        .toLowerCase();

    // Show/hide clear button
    if (clearShopSearch) {
      clearShopSearch.hidden =
        searchTerm.length === 0;
    }

    // Nothing typed — close suggestions
    if (!searchTerm) {
      shopSearchSuggestions.innerHTML = '';
      shopSearchSuggestions.hidden = true;
      return;
    }

    // Find matching products
    const matches = products.filter(function(p) {

      const name =
        (p.name || '').toLowerCase();

      const collection =
        (p.collection || '').toLowerCase();

      return (
        name.includes(searchTerm) ||
        collection.includes(searchTerm)
      );

    }).slice(0, 6);


    // No matches
    if (!matches.length) {

      shopSearchSuggestions.innerHTML = `
        <div class="shop-search-no-results">
          No sets found for "${shopSearchInput.value.trim()}"
        </div>
      `;

      shopSearchSuggestions.hidden = false;

      return;
    }


    // Build suggestions
    shopSearchSuggestions.innerHTML =
      matches.map(function(p) {

        return `
          <a
            href="product.html?id=${p.id}"
            class="shop-search-suggestion"
          >

            <div class="shop-suggestion-image">

              ${
                p.image_url
                  ? `
                    <img
                      src="${p.image_url}"
                      alt="${p.name}"
                    >
                  `
                  : ''
              }

            </div>

            <div class="shop-suggestion-info">

              <span class="shop-suggestion-name">
                ${p.name}
              </span>

              <span class="shop-suggestion-collection">
                ${p.collection || 'BeautyLoft Collection'}
              </span>

            </div>

          </a>
        `;

      }).join('');

    shopSearchSuggestions.hidden = false;

  });

}

// =========================
// SEARCH ON ENTER
// =========================

if (shopSearchInput) {

  shopSearchInput.addEventListener('keydown', function(event) {

    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    const searchTerm =
      shopSearchInput.value
        .trim()
        .toLowerCase();

    // Empty search = show everything
    if (!searchTerm) {
      renderShopGrid(products);

      shopSearchSuggestions.innerHTML = '';
      shopSearchSuggestions.hidden = true;

      return;
    }

    // Find ALL matching products
    const searchResults =
      products.filter(function(p) {

        const name =
          (p.name || '').toLowerCase();

        const collection =
          (p.collection || '').toLowerCase();

        return (
          name.includes(searchTerm) ||
          collection.includes(searchTerm)
        );

      });

    // Put matching products on main grid
    renderShopGrid(searchResults);

    // Close autocomplete dropdown
    shopSearchSuggestions.innerHTML = '';
    shopSearchSuggestions.hidden = true;

  });

}

/* =========================
   CLEAR SEARCH
========================= */

if (clearShopSearch) {

  clearShopSearch.addEventListener('click', function() {

    shopSearchInput.value = '';

    clearShopSearch.hidden = true;

    shopSearchSuggestions.innerHTML = '';
    shopSearchSuggestions.hidden = true;

    shopSearchInput.focus();

    renderShopGrid(products);

  });

}


/* =========================
   CLOSE SEARCH WHEN CLICKING
   OUTSIDE
========================= */

document.addEventListener('click', function(event) {

  const searchWrap =
    document.querySelector('.shop-search');

  if (
    searchWrap &&
    !searchWrap.contains(event.target)
  ) {

    shopSearchSuggestions.hidden = true;

  }

});
renderCart();

const drawerCheckoutBtn =
  document.getElementById(
    'drawerCheckoutBtn'
  );

if (drawerCheckoutBtn) {

  drawerCheckoutBtn.addEventListener(
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