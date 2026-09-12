const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

const editIndex = params.get('editIndex');

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
  'Round',
  'Ballerina',
  'Squoval',
  'Lipstick'
];


const NAIL_LENGTHS = [
  'Short',
  'Medium',
  'Long',
  'Extra Long',
  'XXL'
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


        // SIZE
        '<div class="field">' +

          '<label>Size</label>' +

          '<div class="pill-row" id="sizeOptions">' +

            ['XS', 'S', 'M', 'L', 'XL']

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


        // LENGTH
        '<div class="field">' +

          '<label for="lengthSelect">' +
            'Length' +
          '</label>' +

          '<select id="lengthSelect">' +

            NAIL_LENGTHS
              .map(function(length) {

                return (
                  '<option>' +
                    length +
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
            'style="max-width:100px;">' +

        '</div>' +


        // ADD TO CART BUTTON
        '<button ' +
          'class="submit-btn" ' +
          'id="addToCartBtn" ' +
          'style="margin-top:10px;">' +

          'Add to cart' +

        '</button>' +


      '</div>' +


    '</div>';


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


    // Restore shape
    if (existingItem.shape) {

      document.getElementById(
        'shapeSelect'
      ).value =
        existingItem.shape;

    }


    // Restore length
    if (existingItem.length) {

      document.getElementById(
        'lengthSelect'
      ).value =
        existingItem.length;

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

        price: p.price,

        // Always use first/main image in cart
        image: p.image_url,

        size: selectedSize,

        shape:
          document.getElementById(
            'shapeSelect'
          ).value,

        length:
          document.getElementById(
            'lengthSelect'
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


      // If editing, return to shop
      if (existingItem !== null) {

        window.location.href =
          'shop.html';

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

        item.shape
          ? 'Shape: ' + item.shape
          : '',

        item.length
          ? 'Length: ' + item.length
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
              href="product.html?id=${item.productId}&editIndex=${index}"
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


  cartTotal.textContent =
    'Total: ₦' +
    (total / 100).toLocaleString(
      'en-NG',
      {
        minimumFractionDigits: 2
      }
    );


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