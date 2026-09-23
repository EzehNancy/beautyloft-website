const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

const editIndex = params.get('editIndex');
const returnTo = params.get('returnTo');

const reopenCart = params.get('reopenCart');

let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

let cart = JSON.parse(localStorage.getItem('cart') || '[]');

console.log('Cart:', cart);


// ========================================
// LOAD PRODUCT
// ========================================

if (!productId) {

  document.getElementById('productDetail').innerHTML =
    '<p>No product selected.</p>';

} else {

  fetch(
    'https://beautyloft-backend.onrender.com/products/' + productId
  )

    .then(function(response) {

      if (!response.ok) {
        throw new Error('Not found');
      }

      return response.json();
    })

    .then(function(data) {

      renderProduct(data.product);

    })

    .catch(function(error) {

      console.error('PRODUCT LOAD ERROR:', error);

      document.getElementById('productDetail').innerHTML =
        '<p>Sorry, this product could not be found.</p>';

    });

}


// ========================================
// PRODUCT OPTIONS
// ========================================

const NAIL_SHAPES = [
  'Almond',
  'Coffin',
  'Stiletto',
  'Square',
  'Oval',
  'Almond Stiletto',
];




// ========================================
// RENDER PRODUCT
// ========================================

function renderProduct(p) {
  function optimizeCloudinaryImage(url, width) {
  if (!url) return '';

  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  return url.replace(
    '/upload/',
    '/upload/f_auto,q_auto,w_' + width + ',c_limit/'
  );
}

  const nairaPrice =
    (p.price / 100).toLocaleString(
      'en-NG',
      {
        minimumFractionDigits: 2
      }
    );


  // ========================================
  // GET PRODUCT IMAGES
  // ========================================

  let productImages = [];


  // PostgreSQL JSONB may already arrive as an array
  if (Array.isArray(p.images)) {

    productImages = p.images;

  }

  // Just in case it arrives as a JSON string
  else if (typeof p.images === 'string') {

    try {

      productImages = JSON.parse(p.images);

    } catch (error) {

      productImages = [];

    }

  }


  // Old products may only have image_url
  if (
    productImages.length === 0 &&
    p.image_url
  ) {

    productImages = [p.image_url];

  }


  const mainImage = productImages.length > 0
  ? optimizeCloudinaryImage(productImages[0], 900)
  : '';


  // ========================================
  // PRODUCT HTML
  // ========================================

  document.getElementById('productDetail').innerHTML =

    '<div class="product-detail-grid">' +


      // ====================================
      // IMAGE GALLERY
      // ====================================

      '<div class="product-gallery">' +


        '<div class="product-detail-photo product-carousel-main">' +


          (
            mainImage

              ? '<img id="productMainImage" src="' + mainImage + '" alt="' + p.name + '" fetchpriority="high">'

              : '<div class="ph" style="' +
                  'background:linear-gradient(160deg,#C9A876,#98645C);' +
                  'width:100%;' +
                  'height:100%;' +
                  'display:flex;' +
                  'align-items:center;' +
                  'justify-content:center;' +
                  'color:white;' +
                  '">' +
                  p.name +
                  '</div>'
          ) +

          '<button ' +
            'type="button" ' +
            'class="wishlist-btn product-wishlist-btn" ' +
            'data-product-id="' + p.id + '" ' +
            'aria-label="Add ' + p.name + ' to wishlist">' +
            '♡' +
          '</button>' +


          // Only show arrows if there is more than one image
(
            productImages.length > 1

              ? '<button type="button" ' +
                  'class="carousel-arrow carousel-prev" ' +
                  'id="carouselPrev">' +
                  '&#10094;' +
                '</button>' +

                '<button type="button" ' +
                  'class="carousel-arrow carousel-next" ' +
                  'id="carouselNext">' +
                  '&#10095;' +
                '</button>'

              : ''
          ) +


        '</div>' +


        // THUMBNAILS
        (
          productImages.length > 1

            ? '<div class="product-thumbnails" id="productThumbnails">' +

                productImages
                  .map(function(imageUrl, index) {

                    return (

                      '<button ' +
                        'type="button" ' +
                        'class="product-thumbnail' +
                        (index === 0 ? ' active' : '') +
                        '" ' +
                        'data-index="' +
                        index +
                        '">' +

                          '<img src="' +
                          optimizeCloudinaryImage(imageUrl, 160) +
                          '" alt="' +
                          p.name +
                          ' image ' +
                          (index + 1) +
                          '" loading="lazy">' +

                      '</button>'

                    );

                  })

                  .join('') +

              '</div>'

            : ''
        ) +


      '</div>' +


      // ====================================
      // PRODUCT INFORMATION
      // ====================================

      '<div class="product-detail-info">' +


        '<span class="eyebrow">' +
          (p.category || 'Press-on Nails') +
        '</span>' +


        '<h1>' +
          p.name +
        '</h1>' +


        '<p class="product-detail-price">' +
          '₦' +
          nairaPrice +
        '</p>' +


        '<p class="product-detail-desc">' +
          (p.description || '') +
        '</p>' +

(
  p.display_size || p.display_shape
    ? '<p class="product-display-details">' +
        '<strong>Display:</strong> ' +
        [p.display_size, p.display_shape]
          .filter(Boolean)
          .join(', ') +
      '</p>'
    : ''
) +

        // SIZE
        '<div class="field">' +

          '<label>Size</label>' +

          '<div class="pill-row" id="sizeOptions">' +

            ['XS', 'S', 'M', 'L', 'XL', 'XXL',]

              .map(function(s, i) {

                return (

                  '<button ' +
                    'type="button" ' +
                    'class="pill-option' +
                    (i === 2 ? ' active' : '') +
                    '" ' +
                    'data-value="' +
                    s +
                    '">' +

                    s +

                  '</button>'

                );

              })

              .join('') +

          '</div>' +

              '<a ' +
  'href="index.html#nail-sizing" ' +
  'class="size-guide-link">' +
  'Not sure of your size? View Size Guide →' +
'</a>' +

        '</div>' +


        // NAIL TYPE
'<div class="field">' +

  '<label>Nail Type</label>' +

  '<div class="pill-row" id="nailTypeOptions">' +

    '<button ' +
      'type="button" ' +
      'class="pill-option active" ' +
      'data-value="Rubber Gel">' +
      'Rubber Gel' +
    '</button>' +

    '<button ' +
      'type="button" ' +
      'class="pill-option" ' +
      'data-value="Builder Gel">' +
      'Builder Gel' +
    '</button>' +

    '<button ' +
      'type="button" ' +
      'class="pill-option" ' +
      'data-value="Polygel">' +
      'Polygel' +
    '</button>' +

    '<button ' +
      'type="button" ' +
      'class="pill-option" ' +
      'data-value="Acrylic">' +
      'Acrylic' +
    '</button>' +

  '</div>' +

'</div>' +


        // SHAPE
        '<div class="field">' +

          '<label for="shapeSelect">' +
            'Shape' +
          '</label>' +

          '<select id="shapeSelect">' +

            NAIL_SHAPES
              .map(function(shape) {

                return (
                  '<option>' +
                    shape +
                  '</option>'
                );

              })
              .join('') +

          '</select>' +

        '</div>' +




        // FINISH
        '<div class="field">' +

          '<label>Finish</label>' +

          '<div class="pill-row" id="finishOptions">' +

            '<button ' +
              'type="button" ' +
              'class="pill-option active" ' +
              'data-value="Glossy">' +
              'Glossy' +
            '</button>' +

            '<button ' +
              'type="button" ' +
              'class="pill-option" ' +
              'data-value="Matte">' +
              'Matte' +
            '</button>' +

          '</div>' +

        '</div>' +


        // QUANTITY
        '<div class="field">' +

          '<label for="quantityInput">' +
            'Quantity' +
          '</label>' +

          '<input ' +
  'type="number" ' +
  'id="quantityInput" ' +
  'value="1" ' +
  'min="1" ' +
  'max="3 ' +
  'style="max-width:100px;">' +

'<p id="quantityMessage" ' +
  'style="display:none; margin-top:8px; font-size:12px; color:#98645c;">' +
'</p>' +

        '</div>' +

  '<div class="product-accordion">' +

  '<button ' +
    'type="button" ' +
    'class="product-accordion-btn">' +

    '<span>What’s inside the box</span>' +

    '<span class="product-accordion-icon">+</span>' +

  '</button>' +

  '<div class="product-accordion-content">' +

    '<ul>' +
      '<li>10 press-on nails</li>' +
      '<li>Nail glue</li>' +
      '<li>Adhesive tabs</li>' +
      '<li>Nail file</li>' +
      '<li>Cuticle stick</li>' +
      '<li>Alcohol wipe</li>' +
    '</ul>' +

  '</div>' +

'</div>' +


              '<div class="product-accordion">' +

  '<button ' +
    'type="button" ' +
    'class="product-accordion-btn">' +

    '<span>Shipping & Returns</span>' +

    '<span class="product-accordion-icon">+</span>' +

  '</button>' +

  '<div class="product-accordion-content">' +

    '<p>' +
      'Shipping and delivery times vary depending on your location. ' +
      'Please ensure your nail size and customization details are correct before placing your order.' +
    '</p>' +

  '</div>' +

'</div>' +




              
        // ADD TO CART BUTTON
        '<button ' +
          'class="submit-btn" ' +
          'id="addToCartBtn" ' +
          'style="margin-top:10px;">' +

          'Add to cart' +

        '</button>' +


     '</div>' +
'</div>' +

'<section class="related-products-section">' +
  '<h2>You May Also Like</h2>' +
  '<div id="relatedProductsGrid" class="related-products-grid">' +
    '<p>Loading recommendations...</p>' +
  '</div>' +
'</section>';

// ========================================
// PRODUCT WISHLIST
// ========================================

const productWishlistBtn =
  document.querySelector('.product-wishlist-btn');

if (productWishlistBtn) {

  const alreadyWishlisted = wishlist.some(function(item) {
    return String(item.productId) === String(p.id);
  });

  if (alreadyWishlisted) {
    productWishlistBtn.textContent = '♥';
    productWishlistBtn.classList.add('active');

    productWishlistBtn.setAttribute(
      'aria-label',
      'Remove ' + p.name + ' from wishlist'
    );
  }

  productWishlistBtn.addEventListener('click', function() {

    const wishlistIndex = wishlist.findIndex(function(item) {
      return String(item.productId) === String(p.id);
    });

    if (wishlistIndex !== -1) {

      wishlist.splice(wishlistIndex, 1);

      productWishlistBtn.textContent = '♡';
      productWishlistBtn.classList.remove('active');

      productWishlistBtn.setAttribute(
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

      productWishlistBtn.textContent = '♥';
      productWishlistBtn.classList.add('active');

      productWishlistBtn.setAttribute(
        'aria-label',
        'Remove ' + p.name + ' from wishlist'
      );
    }

    localStorage.setItem(
      'wishlist',
      JSON.stringify(wishlist)
    );

  });
}
loadRelatedProducts(p);

  // ========================================
  // IMAGE CAROUSEL
  // ========================================

  if (productImages.length > 1) {

    let currentImageIndex = 0;


    const mainImageElement =
      document.getElementById('productMainImage');


    const previousButton =
      document.getElementById('carouselPrev');


    const nextButton =
      document.getElementById('carouselNext');


    const thumbnailButtons =
      document.querySelectorAll('.product-thumbnail');


    function showProductImage(index) {

      // Go from first image to last
      if (index < 0) {

        index = productImages.length - 1;

      }


      // Go from last image back to first
      if (index >= productImages.length) {

        index = 0;

      }


      currentImageIndex = index;


      mainImageElement.src =
  optimizeCloudinaryImage(
    productImages[currentImageIndex],
    900
  );


      // Update active thumbnail
      thumbnailButtons.forEach(
        function(button) {

          button.classList.toggle(

            'active',

            parseInt(
              button.dataset.index,
              10
            ) === currentImageIndex

          );

        }
      );

    }


    // PREVIOUS
    previousButton.addEventListener(
      'click',
      function() {

        showProductImage(
          currentImageIndex - 1
        );

      }
    );


    // NEXT
    nextButton.addEventListener(
      'click',
      function() {

        showProductImage(
          currentImageIndex + 1
        );

      }
    );


    // THUMBNAILS
    thumbnailButtons.forEach(
      function(button) {

        button.addEventListener(
          'click',
          function() {

            const index =
              parseInt(
                button.dataset.index,
                10
              );

            showProductImage(index);

          }
        );

      }
    );

  }


  // ========================================
  // SIZE
  // ========================================

  let selectedSize = 'M';

  function getSizePrice(size) {

  if (size === 'L') {
    return 1500 * 100;
  }

  if (size === 'XL') {
    return 2000 * 100;
  }

  if (size === 'XXL') {
    return 2500 * 100;
  }

  return 0;
}

let selectedNailType = 'Rubber Gel';

function getNailTypePrice(nailType) {

  if (nailType === 'Builder Gel') {
    return 1000 * 100;
  }

  if (nailType === 'Polygel') {
    return 1500 * 100;
  }

  if (nailType === 'Acrylic') {
    return 2500 * 100;
  }

  return 0;
}

function updateDisplayedPrice() {

  const finalPrice =
  p.price +
  getSizePrice(selectedSize) +
  getNailTypePrice(selectedNailType);

  const formattedPrice =
    (finalPrice / 100).toLocaleString(
      'en-NG',
      {
        minimumFractionDigits: 2
      }
    );

  document.querySelector(
    '.product-detail-price'
  ).textContent =
    '₦' + formattedPrice;
}


  document
    .querySelectorAll(
      '#sizeOptions .pill-option'
    )
    .forEach(function(btn) {

      btn.addEventListener(
        'click',
        function() {

          document
            .querySelectorAll(
              '#sizeOptions .pill-option'
            )
            .forEach(function(button) {

              button.classList.remove(
                'active'
              );

            });


          btn.classList.add('active');

          selectedSize =
            btn.dataset.value;

            updateDisplayedPrice();

        }
      );

    });


    // ========================================
// NAIL TYPE
// ========================================

document
  .querySelectorAll(
    '#nailTypeOptions .pill-option'
  )
  .forEach(function(btn) {

    btn.addEventListener(
      'click',
      function() {

        document
          .querySelectorAll(
            '#nailTypeOptions .pill-option'
          )
          .forEach(function(button) {

            button.classList.remove(
              'active'
            );

          });

        btn.classList.add('active');

        selectedNailType =
          btn.dataset.value;

        updateDisplayedPrice();

      }
    );

  });

  // ========================================
  // FINISH
  // ========================================

  let selectedFinish = 'Glossy';


  document
    .querySelectorAll(
      '#finishOptions .pill-option'
    )
    .forEach(function(btn) {

      btn.addEventListener(
        'click',
        function() {

          document
            .querySelectorAll(
              '#finishOptions .pill-option'
            )
            .forEach(function(button) {

              button.classList.remove(
                'active'
              );

            });


          btn.classList.add('active');

          selectedFinish =
            btn.dataset.value;

        }
      );

    });

      // ========================================
// QUANTITY LIMIT
// ========================================

const quantityInput =
  document.getElementById('quantityInput');

const quantityMessage =
  document.getElementById('quantityMessage');

const MAX_QUANTITY = 3;


quantityInput.addEventListener(
  'input',
  function() {

    let quantity =
      parseInt(quantityInput.value, 10);


    // Allow empty field while typing
    if (quantityInput.value === '') {

      quantityMessage.style.display =
        'none';

      return;
    }


    // Prevent less than 1
    if (quantity < 1) {

      quantityInput.value = 1;

      quantityMessage.textContent =
        'Quantity must be at least 1.';

      quantityMessage.style.display =
        'block';

      return;
    }


    // Prevent more than 10
    if (quantity > MAX_QUANTITY) {

      quantityInput.value =
        MAX_QUANTITY;

      quantityMessage.textContent =
        'Maximum quantity is 3 sets per product. For larger orders, please contact us.';

      quantityMessage.style.display =
        'block';

      return;
    }


    // Valid quantity
    quantityMessage.style.display =
      'none';

  }
);

// ========================================
// PRODUCT ACCORDION
// ========================================

const accordionButtons =
  document.querySelectorAll(
    '.product-accordion-btn'
  );

accordionButtons.forEach(function(button) {

  button.addEventListener(
    'click',
    function() {

      const content =
        button.nextElementSibling;

      const icon =
        button.querySelector(
          '.product-accordion-icon'
        );

      const isOpen =
        content.classList.contains('open');

      content.classList.toggle('open');

      icon.textContent =
        isOpen ? '+' : '−';

    }
  );

});

  // ========================================
  // ADD / UPDATE CART
  // ========================================

  const addToCartBtn =
    document.getElementById(
      'addToCartBtn'
    );


  let existingItem = null;


  // Check if user clicked Edit from cart
  if (
    editIndex !== null &&
    cart[editIndex]
  ) {

    existingItem =
      cart[editIndex];


    // Restore size
    document
      .querySelectorAll(
        '#sizeOptions .pill-option'
      )
      .forEach(function(btn) {

        btn.classList.toggle(
          'active',
          btn.dataset.value ===
            existingItem.size
        );

      });


    selectedSize =
      existingItem.size ||
      selectedSize;

      updateDisplayedPrice();

      // Restore nail type
if (existingItem.nailType) {

  document
    .querySelectorAll(
      '#nailTypeOptions .pill-option'
    )
    .forEach(function(btn) {

      btn.classList.toggle(
        'active',
        btn.dataset.value ===
          existingItem.nailType
      );

    });


  selectedNailType =
    existingItem.nailType;


  updateDisplayedPrice();

}


    // Restore shape
    if (existingItem.shape) {

      document.getElementById(
        'shapeSelect'
      ).value =
        existingItem.shape;

    }

    // Restore finish
    if (existingItem.finish) {

      document
        .querySelectorAll(
          '#finishOptions .pill-option'
        )
        .forEach(function(btn) {

          btn.classList.toggle(
            'active',
            btn.dataset.value ===
              existingItem.finish
          );

        });


      selectedFinish =
        existingItem.finish;

    }


    // Restore quantity
    document.getElementById(
      'quantityInput'
    ).value =
      existingItem.quantity || 1;


    addToCartBtn.textContent =
      'Update Cart';

  }


  // ========================================
  // CART BUTTON CLICK
  // ========================================

  addToCartBtn.addEventListener(
    'click',
    function() {

      const quantity =
        parseInt(
          document.getElementById(
            'quantityInput'
          ).value,
          10
        ) || 1;


      const itemData = {

        productId: p.id,

        name: p.name,

        price:
  p.price +
  getSizePrice(selectedSize) +
  getNailTypePrice(selectedNailType),

        // Always use first/main image in cart
        image: p.image_url,

        size: selectedSize,
        nailType: selectedNailType,

        shape:
          document.getElementById(
            'shapeSelect'
          ).value,


        finish:
          selectedFinish,

        quantity:
          quantity

      };


      // UPDATE EXISTING CART ITEM
      if (existingItem !== null) {

        cart[editIndex] =
          itemData;

      }

      // ADD NEW CART ITEM
      else {

        cart.push(itemData);

      }


      localStorage.setItem(
        'cart',
        JSON.stringify(cart)
      );


      renderCart();


      // If editing
if (existingItem !== null) {

  if (reopenCart === '1') {

    // Stay on the product page and open the updated cart drawer
    renderCart();

    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');

  } else {

    // Edit came from the full cart page
    window.location.href = 'cart.html';

  }

}

      // New item
      else {

        addToCartBtn.textContent =
          'Added ✓';

        addToCartBtn.classList.add(
          'added'
        );


        setTimeout(function() {

          addToCartBtn.textContent =
            'Add to cart';

          addToCartBtn.classList.remove(
            'added'
          );

        }, 1200);

      }

    }
  );

}

function loadRelatedProducts(currentProduct) {

  const relatedGrid =
    document.getElementById('relatedProductsGrid');

  if (!relatedGrid) return;


  // If this product doesn't have a collection
  if (!currentProduct.collection) {

    relatedGrid.innerHTML =
      '<p>No related products yet.</p>';

    return;
  }

  fetch('https://beautyloft-backend.onrender.com/products')

    .then(function(response) {

      if (!response.ok) {
        throw new Error('Could not load products');
      }

      return response.json();

    })

    .then(function(data) {

      // Works whether backend returns:
      // [...]
      // or { products: [...] }

      const products =
        Array.isArray(data)
          ? data
          : data.products || [];


      const relatedProducts =
        products.filter(function(product) {

          return (
            String(product.id) !==
              String(currentProduct.id) &&

            product.collection &&
            product.collection.toLowerCase() ===
              currentProduct.collection.toLowerCase()
          );

        });


      if (relatedProducts.length === 0) {

        relatedGrid.innerHTML =
          '<p>No other products in this collection yet.</p>';

        return;
      }


      relatedGrid.innerHTML = '';


      // Show up to 10 products
      relatedProducts
        .slice(0, 10)
        .forEach(function(product) {

          const price =
            (product.price / 100)
              .toLocaleString(
                'en-NG',
                {
                  minimumFractionDigits: 2
                }
              );


          relatedGrid.innerHTML += `

            <a
              href="product.html?id=${product.id}"
              class="related-product-card"
            >

              <div class="related-product-image">

                ${
                  product.image_url

                    ? `<img
                        src="${product.image_url}"
                        alt="${product.name}"
                        loading="lazy"
                      >`

                    : `<div class="ph">
                        ${product.name}
                      </div>`
                }

              </div>


              <p class="related-product-collection">
                ${product.collection || ''}
              </p>


              <h3>
                ${product.name}
              </h3>


              <p class="related-product-price">
                ₦${price}
              </p>

            </a>

          `;

        });

    })

    .catch(function(error) {

      console.error(
        'RELATED PRODUCTS ERROR:',
        error
      );

      relatedGrid.innerHTML =
        '<p>Could not load recommendations.</p>';

    });

}

// ========================================
// CART DRAWER
// ========================================

const cartToggle =
  document.getElementById(
    'cartToggle'
  );


const cartDrawer =
  document.getElementById(
    'cartDrawer'
  );


const cartOverlay =
  document.getElementById(
    'cartOverlay'
  );


const cartClose =
  document.getElementById(
    'cartClose'
  );


const cartCount =
  document.getElementById(
    'cartCount'
  );


const cartItems =
  document.getElementById(
    'cartItems'
  );


const cartTotal =
  document.getElementById(
    'cartTotal'
  );


// OPEN CART
cartToggle.addEventListener(
  'click',
  function() {

    cartDrawer.classList.add(
      'open'
    );

    cartOverlay.classList.add(
      'open'
    );

  }
);


// CLOSE CART
cartClose.addEventListener(
  'click',
  function() {

    cartDrawer.classList.remove(
      'open'
    );

    cartOverlay.classList.remove(
      'open'
    );

  }
);


// CLOSE BY CLICKING OVERLAY
cartOverlay.addEventListener(
  'click',
  function() {

    cartDrawer.classList.remove(
      'open'
    );

    cartOverlay.classList.remove(
      'open'
    );

  }
);


// ========================================
// RENDER CART
// ========================================

function renderCart() {

  cartCount.textContent =
    cart.reduce(
      function(sum, item) {

        return (
          sum +
          (item.quantity || 1)
        );

      },
      0
    );


  cartItems.innerHTML = '';


  // Empty cart
  if (cart.length === 0) {

    cartItems.innerHTML =
      '<p style="' +
        'text-align:center;' +
        'color:var(--ink-soft);' +
        'padding:30px 0;' +
        '">' +
        'Your cart is empty.' +
      '</p>';


    cartTotal.textContent = '';

    return;
  }


  let total = 0;


  cart.forEach(
    function(item, index) {

      const qty =
        item.quantity || 1;


      const lineTotal =
        (item.price * qty) / 100;


      total +=
        item.price * qty;


      const optionsText = [

  item.size
    ? 'Size: ' + item.size
    : '',

  item.nailType
    ? 'Nail Type: ' + item.nailType
    : '',

  item.shape
    ? 'Shape: ' + item.shape
    : '',

  item.finish
    ? item.finish
    : ''

]

        .filter(Boolean)

        .join(' · ');


      cartItems.innerHTML += `

        <div class="cart-line">

          <div class="cart-line-top">

            <div class="cart-line-photo">

              ${
                item.image

                  ? `<img
                      src="${item.image}"
                      alt="${item.name}"
                    >`

                  : `<div
                      class="cart-line-photo-placeholder"
                    ></div>`
              }

            </div>


            <div class="cart-line-details">

              <strong>
                ${item.name}
              </strong>

              <p class="cart-line-options">
                ${optionsText}
              </p>

            </div>

          </div>


          <div class="cart-line-bottom">

            <div class="qty-controls">

              <button
                type="button"
                class="qty-btn"
                data-index="${index}"
                data-action="minus"
              >
                −
              </button>


              <span>
                ${qty}
              </span>


              <button
                type="button"
                class="qty-btn"
                data-index="${index}"
                data-action="plus"
              >
                +
              </button>

            </div>


            <span class="cart-line-price">

              ₦${lineTotal.toLocaleString(
                'en-NG',
                {
                  minimumFractionDigits: 2
                }
              )}

            </span>


            <a
             href="product.html?id=${item.productId}&editIndex=${index}&returnTo=${encodeURIComponent(window.location.href)}&reopenCart=1"
              class="edit-line-btn"
              style="text-decoration:underline;"
            >
              Edit
            </a>


            <button
              type="button"
              class="remove-line-btn"
              data-index="${index}"
            >
              Remove
            </button>

          </div>

        </div>

      `;

    }
  );


  const totalItems = cart.reduce(
  (sum, item) => sum + item.quantity,
  0
);

cartTotal.innerHTML = `
  <span>Total (${totalItems})</span>
  <span>
    ₦${(total / 100).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}
  </span>
`;


  // ========================================
  // QUANTITY BUTTONS
  // ========================================

  document
    .querySelectorAll('.qty-btn')
    .forEach(function(btn) {

      btn.addEventListener(
        'click',
        function() {

          const idx =
            parseInt(
              btn.dataset.index,
              10
            );


          const currentQty =
            cart[idx].quantity || 1;


          if (
            btn.dataset.action ===
            'plus'
          ) {

            cart[idx].quantity =
              currentQty + 1;

          }

          else if (
            currentQty > 1
          ) {

            cart[idx].quantity =
              currentQty - 1;

          }


          localStorage.setItem(
            'cart',
            JSON.stringify(cart)
          );


          renderCart();

        }
      );

    });


  // ========================================
  // REMOVE BUTTONS
  // ========================================

  document
    .querySelectorAll(
      '.remove-line-btn'
    )
    .forEach(function(btn) {

      btn.addEventListener(
        'click',
        function() {

          const idx =
            parseInt(
              btn.dataset.index,
              10
            );


          cart.splice(
            idx,
            1
          );


          localStorage.setItem(
            'cart',
            JSON.stringify(cart)
          );


          renderCart();

        }
      );

    });

}


// INITIAL CART RENDER
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