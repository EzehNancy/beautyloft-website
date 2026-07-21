const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');

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
        '<button class="submit-btn" id="addToCartBtn" style="margin-top:20px;">Add to cart</button>' +
      '</div>' +
    '</div>';

  const addToCartBtn = document.getElementById('addToCartBtn');

  addToCartBtn.addEventListener('click', function() {
    cart.push({ productId: p.id, name: p.name, price: p.price, size: 'M' });
    sessionStorage.setItem('cart', JSON.stringify(cart));
    renderCart();

    addToCartBtn.textContent = 'Added ✓';
    addToCartBtn.classList.add('added');

    setTimeout(function() {
      addToCartBtn.textContent = 'Add to cart';
      addToCartBtn.classList.remove('added');
    }, 1200);
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
  cartCount.textContent = cart.length;
  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach(function(item) {
    const price = item.price / 100;
    cartItems.innerHTML += '<p><strong>' + item.name + '</strong><br>Size: ' + item.size + '<br>₦' + price.toLocaleString('en-NG', { minimumFractionDigits: 2 }) + '</p>';
    total += item.price;
  });

  cartTotal.textContent = 'Total: ₦' + (total / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 });
}

renderCart();