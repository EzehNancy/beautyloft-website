const cartToggle = document.getElementById('cartToggle');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');

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

let cart = [];

const addButtons = document.querySelectorAll('.add-cart-btn');

addButtons.forEach(function(btn) {
  btn.addEventListener('click', function() {
    const item = {
      name: btn.dataset.name,
      price: Number(btn.dataset.price)
    };
    cart.push(item);
    renderCart();
  });
});

const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

function renderCart() {
  cartCount.textContent = cart.length;

  cartItems.innerHTML = '';
  cart.forEach(function(item) {
    cartItems.innerHTML += '<p>' + item.name + ' — $' + item.price + '</p>';
  });

  let total = 0;
  cart.forEach(function(item) {
    total = total + item.price;
  });
  cartTotal.textContent = 'Total: $' + total;
}

renderCart();
