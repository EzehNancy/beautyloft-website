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