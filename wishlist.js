// ========================================
// WISHLIST
// ========================================

let wishlist = JSON.parse(
  localStorage.getItem('wishlist') || '[]'
);

const wishlistGrid =
  document.getElementById('wishlistGrid');

  const wishlistCount =
  document.getElementById('wishlistCount');


// ========================================
// RENDER WISHLIST
// ========================================

function renderWishlist() {

    wishlistCount.textContent = wishlist.length;

  wishlistGrid.innerHTML = '';

  // Empty wishlist
  if (wishlist.length === 0) {

    wishlistGrid.innerHTML = `
      <div class="wishlist-empty">

        <h2>Your wishlist is empty</h2>

        <p>
          Save your favourite BeautyLoft sets
          and find them here later.
        </p>

        <a href="shop.html" class="wishlist-shop-btn">
          Shop Nails
        </a>

      </div>
    `;

    return;
  }


  // Show saved products
  wishlist.forEach(function(item, index) {

    const price =
      (item.price / 100).toLocaleString(
        'en-NG',
        {
          minimumFractionDigits: 2
        }
      );

    const card =
      document.createElement('div');

    card.className = 'wishlist-card';

    card.innerHTML = `

      <div class="wishlist-card-image">

        <a href="product.html?id=${item.productId}">

          ${
            item.image

              ? `
                <img
                  src="${item.image}"
                  alt="${item.name}"
                >
              `

              : `
                <div class="wishlist-image-placeholder">
                  ${item.name}
                </div>
              `
          }

        </a>


        <button
          type="button"
          class="wishlist-remove-btn"
          data-index="${index}"
          aria-label="Remove ${item.name} from wishlist"
        >
          ♥
        </button>

      </div>


      <div class="wishlist-card-info">

  <p class="wishlist-product-collection">
    ${item.collection || 'BeautyLoft Collection'}
  </p>

  <a
    href="product.html?id=${item.productId}"
    class="wishlist-product-name"
  >
    ${item.name}
  </a>

  <div class="wishlist-card-footer">

    <p class="wishlist-product-price">
      ₦${price}
    </p>

    <a
      href="product.html?id=${item.productId}"
      class="wishlist-view-link"
    >
      View Set →
    </a>

  </div>

</div>

    `;

    wishlistGrid.appendChild(card);

  });


  // ========================================
  // REMOVE FROM WISHLIST
  // ========================================

  document
    .querySelectorAll('.wishlist-remove-btn')
    .forEach(function(button) {

      button.addEventListener(
        'click',
        function() {

          const index =
            parseInt(
              button.dataset.index,
              10
            );

          wishlist.splice(index, 1);

          localStorage.setItem(
            'wishlist',
            JSON.stringify(wishlist)
          );

          renderWishlist();

        }
      );

    });

}


// ========================================
// INITIAL RENDER
// ========================================

renderWishlist();