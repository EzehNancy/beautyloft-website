// ========================================
// BEAUTYLOFT SHOP — HERO CAROUSEL
// ========================================

const heroSlides =
  document.querySelectorAll('.shop-hero-slide');

const heroDots =
  document.querySelectorAll('.shop-hero-dot');

const heroPrev =
  document.getElementById('shopHeroPrev');

const heroNext =
  document.getElementById('shopHeroNext');

const heroCurrent =
  document.getElementById('shopHeroCurrent');

let currentHeroSlide = 0;

let heroCarouselTimer;


// ========================================
// SHOW SLIDE
// ========================================

function showHeroSlide(index) {

  if (!heroSlides.length) {
    return;
  }

  // Go back to first slide
  if (index >= heroSlides.length) {
    index = 0;
  }

  // Go to last slide
  if (index < 0) {
    index = heroSlides.length - 1;
  }


  // Hide all slides
  heroSlides.forEach(function(slide) {
    slide.classList.remove('active');
  });


  // Reset all dots
  heroDots.forEach(function(dot) {
    dot.classList.remove('active');
  });


  // Show selected slide
  heroSlides[index].classList.add('active');


  // Activate selected dot
  if (heroDots[index]) {
    heroDots[index].classList.add('active');
  }


  // Update counter
  if (heroCurrent) {
    heroCurrent.textContent =
      String(index + 1).padStart(2, '0');
  }


  currentHeroSlide = index;
}


// ========================================
// NEXT / PREVIOUS
// ========================================

function nextHeroSlide() {

  showHeroSlide(
    currentHeroSlide + 1
  );

}


function previousHeroSlide() {

  showHeroSlide(
    currentHeroSlide - 1
  );

}


// ========================================
// AUTO PLAY — 5 SECONDS
// ========================================

function startHeroCarousel() {

  clearInterval(heroCarouselTimer);

  heroCarouselTimer =
    setInterval(function() {

      nextHeroSlide();

    }, 5000);

}


// ========================================
// NEXT ARROW
// ========================================

if (heroNext) {

  heroNext.addEventListener(
    'click',
    function() {

      nextHeroSlide();

      startHeroCarousel();

    }
  );

}


// ========================================
// PREVIOUS ARROW
// ========================================

if (heroPrev) {

  heroPrev.addEventListener(
    'click',
    function() {

      previousHeroSlide();

      startHeroCarousel();

    }
  );

}


// ========================================
// DOT NAVIGATION
// ========================================

heroDots.forEach(function(dot) {

  dot.addEventListener(
    'click',
    function() {

      const slideIndex =
        Number(
          dot.dataset.slide
        );

      showHeroSlide(
        slideIndex
      );

      startHeroCarousel();

    }
  );

});


// ========================================
// START CAROUSEL
// ========================================

showHeroSlide(0);

startHeroCarousel();

// ========================================
// SHOP HOME — NAV SEARCH
// ========================================

// ========================================
// SHOP HOME — NAV SEARCH + AUTOCOMPLETE
// ========================================

const shopHomeSearchForm =
  document.getElementById('shopHomeSearchForm');

const shopHomeSearchInput =
  document.getElementById('shopHomeSearchInput');

const shopHomeSearchSuggestions =
  document.getElementById('shopHomeSearchSuggestions');

let shopHomeProducts = [];


// LOAD PRODUCTS FOR AUTOCOMPLETE

fetch('https://beautyloft-backend.onrender.com/products')
  .then(function(response) {

    if (!response.ok) {
      throw new Error('Failed to load products.');
    }

    return response.json();

  })
  .then(function(data) {

    shopHomeProducts =
      data.products || [];

  })
  .catch(function(error) {

    console.error(
      'Shop home search error:',
      error
    );

  });


// AUTOCOMPLETE WHILE TYPING

if (
  shopHomeSearchInput &&
  shopHomeSearchSuggestions
) {

  shopHomeSearchInput.addEventListener(
    'input',
    function() {

      const searchTerm =
        shopHomeSearchInput.value
          .trim()
          .toLowerCase();


      // Empty input = close dropdown

      if (!searchTerm) {

        shopHomeSearchSuggestions.innerHTML = '';
        shopHomeSearchSuggestions.hidden = true;

        return;
      }


      // FIND MATCHES

      const matches =
        shopHomeProducts
          .filter(function(product) {

            const name =
              (product.name || '')
                .toLowerCase();

            const collection =
              (product.collection || '')
                .toLowerCase();

            return (
              name.includes(searchTerm) ||
              collection.includes(searchTerm)
            );

          })
          .slice(0, 5);


      // NO RESULTS

      if (!matches.length) {

        shopHomeSearchSuggestions.innerHTML = `
          <div class="shop-home-search-empty">
            No products found
          </div>
        `;

        shopHomeSearchSuggestions.hidden = false;

        return;
      }


      // BUILD DROPDOWN

      shopHomeSearchSuggestions.innerHTML =
        matches.map(function(product) {

          return `
            <a
              href="product.html?id=${product.id}"
              class="shop-home-search-result"
            >

              <div class="shop-home-result-image">

                ${
                  product.image_url
                    ? `
                      <img
                        src="${product.image_url}"
                        alt="${product.name}"
                      >
                    `
                    : ''
                }

              </div>

              <div class="shop-home-result-info">

                <strong>
                  ${product.name}
                </strong>

                <span>
                  ${
                    product.collection ||
                    'BeautyLoft Collection'
                  }
                </span>

              </div>

            </a>
          `;

        })
        .join('');


      shopHomeSearchSuggestions.hidden = false;

    }
  );

}


// ENTER = SEARCH FULL SHOP

if (
  shopHomeSearchForm &&
  shopHomeSearchInput
) {

  shopHomeSearchForm.addEventListener(
    'submit',
    function(event) {

      event.preventDefault();

      const searchTerm =
        shopHomeSearchInput.value.trim();

      if (!searchTerm) {
        return;
      }

      window.location.href =
        'shop.html?search=' +
        encodeURIComponent(searchTerm);

    }
  );

}


// CLOSE DROPDOWN WHEN CLICKING OUTSIDE

document.addEventListener(
  'click',
  function(event) {

    const searchWrap =
      document.querySelector(
        '.shop-home-search-wrap'
      );

    if (
      searchWrap &&
      !searchWrap.contains(event.target)
    ) {

      shopHomeSearchSuggestions.hidden = true;

    }

  }
);

/* ========================================
   SHOP HOME — NEW ARRIVALS
======================================== */

async function loadNewArrivals() {
  const grid =
    document.getElementById(
      'newArrivalsGrid'
    );

  if (!grid) return;

  try {
    const response = await fetch(
      'https://beautyloft-backend.onrender.com/products'
    );

    if (!response.ok) {
      throw new Error(
        'Could not load products.'
      );
    }

    const data =
      await response.json();

    /*
      Support either:
      [product, product, ...]
      
      OR
      
      {
        products: [...]
      }
    */

    const products =
      Array.isArray(data)
        ? data
        : data.products || [];


    /*
      Keep active products only,
      newest first,
      maximum 5.
    */

    const newestProducts =
      products
        .filter(product => {
          return (
            product.is_active === 1 ||
            product.is_active === true
          );
        })
        .sort((a, b) => {
          return (
            Number(b.id) -
            Number(a.id)
          );
        })
        .slice(0, 5);


    if (!newestProducts.length) {
      grid.innerHTML = `
        <p class="home-products-empty">
          New sets are coming soon ♡
        </p>
      `;

      return;
    }


    grid.innerHTML =
      newestProducts
        .map(product => {

          const image =
            product.images &&
            Array.isArray(product.images) &&
            product.images.length
              ? product.images[0]
              : product.image_url ||
                'images/product-placeholder.jpg';


          const price =
            Number(product.price || 0) /
            100;


          const collection =
            product.collection ||
            'The BeautyLoft';


          return `
            <a
              href="product.html?id=${product.id}"
              class="home-product-card"
            >

              <div class="home-product-image">

                <img
                  src="${image}"
                  alt="${product.name}"
                  loading="lazy"
                >

                <span class="home-product-badge">
                  NEW
                </span>

                <span class="home-product-arrow">
                  ↗
                </span>

              </div>


              <div class="home-product-info">

                <p class="home-product-collection">
                  ${collection}
                </p>

                <h3>
                  ${product.name}
                </h3>

                <p class="home-product-price">
                  ₦${price.toLocaleString()}
                </p>

              </div>

            </a>
          `;

        })
        .join('');

  } catch (error) {

    console.error(
      'New arrivals error:',
      error
    );

    grid.innerHTML = `
      <p class="home-products-empty">
        We couldn't load the latest sets
        right now.
      </p>
    `;

  }
}


loadNewArrivals();

/* ========================================
   SHOP HOME — BEAUTYLOFT FAVOURITES
======================================== */

async function loadBeautyLoftFavourites() {
  const grid =
    document.getElementById(
      'bestSellersGrid'
    );

  if (!grid) return;

  try {
    const response = await fetch(
      'https://beautyloft-backend.onrender.com/products'
    );

    if (!response.ok) {
      throw new Error(
        'Could not load BeautyLoft favourites.'
      );
    }

    const data =
      await response.json();

    const products =
      Array.isArray(data)
        ? data
        : data.products || [];

    const activeProducts =
      products.filter(product => {
        return (
          product.is_active === 1 ||
          product.is_active === true ||
          product.is_active === '1'
        );
      });


    /*
      For now, BeautyLoft Favourites
      are curated from the available
      live products.

      Later we can replace this with
      real sales-based ranking.
    */

    const favourites =
      activeProducts
        .slice(0, 5);


    if (!favourites.length) {
      grid.innerHTML = `
        <p class="home-products-empty">
          BeautyLoft favourites
          are coming soon ♡
        </p>
      `;

      return;
    }


    grid.innerHTML =
      favourites
        .map(product => {

          const image =
            product.images &&
            Array.isArray(product.images) &&
            product.images.length
              ? product.images[0]
              : product.image_url ||
                'images/product-placeholder.jpg';


          const price =
            Number(product.price || 0) /
            100;


          const collection =
            product.collection ||
            'The BeautyLoft';


          return `
            <a
              href="product.html?id=${product.id}"
              class="home-product-card"
            >

              <div class="home-product-image">

                <img
                  src="${image}"
                  alt="${product.name}"
                  loading="lazy"
                >

                <span class="home-product-badge">
                  ♡ LOVED
                </span>

                <span class="home-product-arrow">
                  ↗
                </span>

              </div>


              <div class="home-product-info">

                <p class="home-product-collection">
                  ${collection}
                </p>

                <h3>
                  ${product.name}
                </h3>

                <p class="home-product-price">
                  ₦${price.toLocaleString()}
                </p>

              </div>

            </a>
          `;
        })
        .join('');


  } catch (error) {

    console.error(
      'BeautyLoft favourites error:',
      error
    );


    grid.innerHTML = `
      <p class="home-products-empty">
        We couldn't load our favourites
        right now.
      </p>
    `;

  }
}


loadBeautyLoftFavourites();