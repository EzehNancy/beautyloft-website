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

let cart = [];

const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

function renderCart() {

  cartCount.textContent = cart.length;

  cartItems.innerHTML = '';

  let total = 0;

  cart.forEach(function(item) {

    const price = item.price / 100;

    cartItems.innerHTML += `
      <p>
        <strong>${item.name}</strong><br>
        Size: ${item.size}<br>
        ₦${price.toLocaleString('en-NG', {
          minimumFractionDigits: 2
        })}
      </p>
    `;

    total += item.price;

  });

  cartTotal.textContent =
    'Total: ₦' +
    (total / 100).toLocaleString('en-NG', {
      minimumFractionDigits: 2
    });

}


// =========================
// PRODUCTS
// =========================

let products = [];

fetch('https://beautyloft-backend.onrender.com/products')
  .then(function(response) {

    if (!response.ok) {
      throw new Error('Failed to load products.');
    }

    return response.json();

  })
  .then(function(data) {

    products = data.products || [];

    renderShopGrid();

  })
  .catch(function(error) {

    console.error(error);

    const shopGrid = document.getElementById('shopGrid');

    shopGrid.innerHTML =
      '<p class="activity-empty">Unable to load products.</p>';

  });


// =========================
// RENDER PRODUCTS
// =========================

function renderShopGrid() {

  const shopGrid = document.getElementById('shopGrid');

  if (!products.length) {

    shopGrid.innerHTML =
      '<p class="activity-empty">No products available right now.</p>';

    return;

  }

  shopGrid.innerHTML = '';

  products.forEach(function(p) {

    let selectedSize = 'M';

    const nairaPrice = (p.price / 100).toLocaleString('en-NG', {
      minimumFractionDigits: 2
    });

    const card = document.createElement('div');

    card.className = 'product-card';

    card.innerHTML = `

  <a href="product.html?id=${p.id}" class="product-photo">

    ${
      p.image_url
        ? `<img
            src="${p.image_url}"
            alt="${p.name}"
            style="width:100%; height:100%; object-fit:cover;">`
        : `<div
            class="ph"
            style="background:linear-gradient(160deg,#C9A876,#98645C);">
            ${p.name}
           </div>`
    }

  </a>

  <div class="product-info">

    <a
      href="product.html?id=${p.id}"
      style="text-decoration:none; color:inherit;"
    >
      <h3>${p.name}</h3>
    </a>

    <p class="product-desc">
      ${p.description || ''}
    </p>

    <p class="product-price">
      ₦${nairaPrice}
    </p>

    <div class="product-size-row">

      <button class="size-btn" data-size="S">
        S
      </button>

      <button class="size-btn active" data-size="M">
        M
      </button>

      <button class="size-btn" data-size="L">
        L
      </button>

    </div>

    <button class="add-cart-btn">
      Add to Cart
    </button>

  </div>

`;

    card.querySelectorAll('.size-btn').forEach(function(btn) {

      btn.addEventListener('click', function() {

        card.querySelectorAll('.size-btn').forEach(function(b) {
          b.classList.remove('active');
        });

        btn.classList.add('active');

        selectedSize = btn.dataset.size;

      });

    });

    const addBtn = card.querySelector('.add-cart-btn');

    addBtn.addEventListener('click', function() {

      cart.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        size: selectedSize
      });

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

renderCart();