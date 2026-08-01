const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

const editIndex = params.get('editIndex');

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
console.log("Cart:", cart);

if (!productId) {
  document.getElementById('productDetail').innerHTML = '<p>No product selected.</p>';
} else {
  fetch('https://beautyloft-backend.onrender.com/products/' + productId)
    .then(function(response) {
      if (!response.ok) throw new Error('Not found');
      return response.json();
    })
    .then(function(data) {
      renderProduct(data.product);
    })
    .catch(function() {
      document.getElementById('productDetail').innerHTML = '<p>Sorry, this product could not be found.</p>';
    });
}

const NAIL_SHAPES = ['Almond', 'Coffin', 'Stiletto', 'Square', 'Oval', 'Round', 'Ballerina', 'Squoval', 'Lipstick'];
const NAIL_LENGTHS = ['Short', 'Medium', 'Long', 'Extra Long', 'XXL'];

function renderProduct(p) {
  const nairaPrice = (p.price / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 });

  document.getElementById('productDetail').innerHTML =
    '<div class="product-detail-grid">' +
      '<div class="product-detail-photo">' +
        (p.image_url
          ? '<img src="' + p.image_url + '">'
          : '<div class="ph" style="background:linear-gradient(160deg,#C9A876,#98645C); width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:white;">' + p.name + '</div>') +
      '</div>' +
      '<div class="product-detail-info">' +
        '<span class="eyebrow">' + (p.category || 'Press-on Nails') + '</span>' +
        '<h1>' + p.name + '</h1>' +
        '<p class="product-detail-price">₦' + nairaPrice + '</p>' +
        '<p class="product-detail-desc">' + (p.description || '') + '</p>' +

        '<div class="field">' +
          '<label>Size</label>' +
          '<div class="pill-row" id="sizeOptions">' +
            ['XS', 'S', 'M', 'L', 'XL'].map(function(s, i) {
              return '<button type="button" class="pill-option' + (i === 2 ? ' active' : '') + '" data-value="' + s + '">' + s + '</button>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div class="field">' +
          '<label for="shapeSelect">Shape</label>' +
          '<select id="shapeSelect">' +
            NAIL_SHAPES.map(function(s) { return '<option>' + s + '</option>'; }).join('') +
          '</select>' +
        '</div>' +

        '<div class="field">' +
          '<label for="lengthSelect">Length</label>' +
          '<select id="lengthSelect">' +
            NAIL_LENGTHS.map(function(l) { return '<option>' + l + '</option>'; }).join('') +
          '</select>' +
        '</div>' +

        '<div class="field">' +
          '<label>Finish</label>' +
          '<div class="pill-row" id="finishOptions">' +
            '<button type="button" class="pill-option active" data-value="Glossy">Glossy</button>' +
            '<button type="button" class="pill-option" data-value="Matte">Matte</button>' +
          '</div>' +
        '</div>' +

        '<div class="field">' +
          '<label for="quantityInput">Quantity</label>' +
          '<input type="number" id="quantityInput" value="1" min="1" style="max-width:100px;">' +
        '</div>' +

        '<button class="submit-btn" id="addToCartBtn" style="margin-top:10px;">Add to cart</button>' +
      '</div>' +
    '</div>';

  let selectedSize = 'M';
  document.querySelectorAll('#sizeOptions .pill-option').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#sizeOptions .pill-option').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selectedSize = btn.dataset.value;
    });
  });

  let selectedFinish = 'Glossy';
  document.querySelectorAll('#finishOptions .pill-option').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#finishOptions .pill-option').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selectedFinish = btn.dataset.value;
    });
  });

  const addToCartBtn = document.getElementById('addToCartBtn');
 

  let existingItem = null;
  if (editIndex !== null && cart[editIndex]) {
    existingItem = cart[editIndex];

    document.querySelectorAll('#sizeOptions .pill-option').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.value === existingItem.size);
    });
    selectedSize = existingItem.size || selectedSize;

    if (existingItem.shape) document.getElementById('shapeSelect').value = existingItem.shape;
    if (existingItem.length) document.getElementById('lengthSelect').value = existingItem.length;

    if (existingItem.finish) {
      document.querySelectorAll('#finishOptions .pill-option').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.value === existingItem.finish);
      });
      selectedFinish = existingItem.finish;
    }

    document.getElementById('quantityInput').value = existingItem.quantity || 1;
    addToCartBtn.textContent = 'Update Cart';
  }

  addToCartBtn.addEventListener('click', function () {

  const quantity = parseInt(document.getElementById('quantityInput').value, 10) || 1;

  const itemData = {
    productId: p.id,
    name: p.name,
    price: p.price,
    image: p.image_url,
    size: selectedSize,
    shape: document.getElementById('shapeSelect').value,
    length: document.getElementById('lengthSelect').value,
    finish: selectedFinish,
    quantity: quantity
  };

  if (existingItem !== null) {
    cart[editIndex] = itemData;
  } else {
    cart.push(itemData);
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  renderCart();

  if (existingItem !== null) {

    window.location.href = 'shop.html';

  } else {

    addToCartBtn.textContent = 'Added ✓';
    addToCartBtn.classList.add('added');

    setTimeout(function () {
      addToCartBtn.textContent = 'Add to cart';
      addToCartBtn.classList.remove('added');
    }, 1200);

  }

});

}

const cartToggle = document.getElementById('cartToggle');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

cartToggle.addEventListener('click', function() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
});

cartClose.addEventListener('click', function() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
});

cartOverlay.addEventListener('click', function() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
});

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

renderCart();