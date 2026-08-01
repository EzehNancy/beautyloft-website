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

let cart = JSON.parse(localStorage.getItem('cart') || '[]');

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
          <div class="qty-controls">
            <button type="button" class="qty-btn" data-index="${index}" data-action="minus">−</button>
            <span>${qty}</span>
            <button type="button" class="qty-btn" data-index="${index}" data-action="plus">+</button>
          </div>
          <span class="cart-line-price">₦${lineTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
          <a href="product.html?id=${item.productId}&editIndex=${index}" class="remove-line-btn" style="text-decoration:underline;">Edit</a>
          <button type="button" class="remove-line-btn" data-index="${index}">Remove</button>
        </div>
      </div>
    `;
  });

  cartTotal.textContent = 'Total: ₦' + (total / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 });

  document.querySelectorAll('.qty-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const idx = parseInt(btn.dataset.index, 10);
      const currentQty = cart[idx].quantity || 1;

      if (btn.dataset.action === 'plus') {
        cart[idx].quantity = currentQty + 1;
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
    shopGrid.innerHTML = '<p class="activity-empty">Unable to load products.</p>';
  });


// =========================
// RENDER PRODUCTS
// =========================

function renderShopGrid() {
  const shopGrid = document.getElementById('shopGrid');

  if (!products.length) {
    shopGrid.innerHTML = '<p class="activity-empty">No products available right now.</p>';
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
            ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">`
            : `<div class="ph" style="background:linear-gradient(160deg,#C9A876,#98645C);">${p.name}</div>`
        }
      </a>

      <div class="product-info">
        <a href="product.html?id=${p.id}" style="text-decoration:none; color:inherit;">
          <h3>${p.name}</h3>
        </a>

        <p class="product-desc">${p.description || ''}</p>

        <p class="product-price">₦${nairaPrice}</p>

        <div class="product-size-row">
          <button class="size-btn" data-size="S">S</button>
          <button class="size-btn active" data-size="M">M</button>
          <button class="size-btn" data-size="L">L</button>
        </div>

        <button class="add-cart-btn">Add to Cart</button>
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
        size: selectedSize,
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

renderCart();