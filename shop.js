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

      <a href="product.html?id=${p.id}" style="text-decoration:none; color:inherit;">
        <h3>${p.name}</h3>
      </a>

      <p class="product-desc">
        ${p.description || ''}
      </p>

      <p class="product-price">
        ₦${nairaPrice}
      </p>

      <div class="product-size-row">
        <button class="size-btn" data-size="S">S</button>
        <button class="size-btn active" data-size="M">M</button>
        <button class="size-btn" data-size="L">L</button>
      </div>

      <button class="add-cart-btn">
        Add to Cart
      </button>

    </div>

  `;

  // Size selection
  card.querySelectorAll('.size-btn').forEach(function(btn) {

    btn.addEventListener('click', function() {

      card.querySelectorAll('.size-btn').forEach(function(b) {
        b.classList.remove('active');
      });

      btn.classList.add('active');
      selectedSize = btn.dataset.size;

    });

  });

  // Add to cart
  const addBtn = card.querySelector('.add-cart-btn');

  addBtn.addEventListener('click', function() {

    cart.push({
      productId: p.id,
      name: p.name,
      price: p.price,
      size: selectedSize
    });

    sessionStorage.setItem('cart', JSON.stringify(cart));

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