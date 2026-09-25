const API_URL =
  'https://beautyloft-backend.onrender.com';


/* ========================================
   CART COUNT
======================================== */

let cart =
  JSON.parse(
    localStorage.getItem('cart')
  ) || [];


function updateCartCount() {

  const cartCount =
    document.getElementById(
      'cartCount'
    );

  if (!cartCount) {
    return;
  }


  const totalQuantity =
    cart.reduce(
      function(total, item) {

        return (
          total +
          Number(item.quantity || 1)
        );

      },
      0
    );


  cartCount.textContent =
    totalQuantity;

}


updateCartCount();



/* ========================================
   MOBILE MENU
======================================== */

const menuToggle =
  document.getElementById(
    'menuToggle'
  );

const navList =
  document.getElementById(
    'navList'
  );


if (
  menuToggle &&
  navList
) {

  menuToggle.addEventListener(
    'click',
    function() {

      navList.classList.toggle(
        'show'
      );

    }
  );

}



/* ========================================
   ESCAPE HTML
======================================== */

function escapeHtml(value) {

  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

}


// ========================================
// HIDE HEADER DOWN / SHOW HEADER UP
// ========================================

const siteHeader =
  document.querySelector('header');

let lastScrollY =
  window.scrollY;

const scrollThreshold = 8;


window.addEventListener(
  'scroll',
  function() {

    const currentScrollY =
      window.scrollY;


    // Always show header near top
    if (currentScrollY <= 40) {

      siteHeader.classList.remove(
        'header-hidden'
      );

      siteHeader.classList.add(
        'header-visible'
      );

      lastScrollY =
        currentScrollY;

      return;
    }


    // Ignore tiny scroll movements
    if (
      Math.abs(
        currentScrollY -
        lastScrollY
      ) < scrollThreshold
    ) {
      return;
    }


    // SCROLLING DOWN
    if (
      currentScrollY >
      lastScrollY
    ) {

      // Close hamburger menu
      const navList =
        document.getElementById(
          'navList'
        );

      if (
        navList &&
        navList.classList.contains(
          'open'
        )
      ) {

        navList.classList.remove(
          'open'
        );

      }


      // Hide header
      siteHeader.classList.add(
        'header-hidden'
      );

      siteHeader.classList.remove(
        'header-visible'
      );

    }


    // SCROLLING UP
    else {

      siteHeader.classList.remove(
        'header-hidden'
      );

      siteHeader.classList.add(
        'header-visible'
      );

    }


    lastScrollY =
      currentScrollY;

  }
);
/* ========================================
   LOAD COLLECTIONS
======================================== */

async function loadCollections() {

  const grid =
    document.getElementById(
      'collectionsGrid'
    );


  try {

    const response =
      await fetch(
        API_URL + '/collections'
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        'Unable to load collections.'
      );

    }


    /*
      Supports either:

      { collections: [...] }

      OR

      [...]
    */

    const collections =
      Array.isArray(data)
        ? data
        : (
            Array.isArray(
              data.collections
            )
              ? data.collections
              : []
          );


    renderCollections(
      collections
    );


  } catch (error) {

    console.error(
      'COLLECTIONS ERROR:',
      error
    );


    grid.innerHTML = `

      <div class="collections-empty">

        <p>
          We couldn't load the
          collections right now.
        </p>

        <a
          href="shop.html"
          class="view-all-link"
        >
          Shop All Nails →
        </a>

      </div>

    `;

  }

}



/* ========================================
   RENDER COLLECTIONS
======================================== */

function renderCollections(
  collections
) {

  const grid =
    document.getElementById(
      'collectionsGrid'
    );


  if (!collections.length) {

    grid.innerHTML = `

      <div class="collections-empty">

        <p>
          No collections are
          available right now.
        </p>

        <a
          href="shop.html"
          class="view-all-link"
        >
          Shop All Nails →
        </a>

      </div>

    `;

    return;

  }


  grid.innerHTML = '';


  collections.forEach(
    function(collection, index) {

      const card =
        document.createElement(
          'a'
        );


      card.className =
        'collection-card';


      card.href =
        'shop.html?collection=' +
        encodeURIComponent(
          collection.name
        );


      const number =
        String(index + 1)
          .padStart(2, '0');


      const image =
        collection.image_url
          ? `
              <img
                class="collection-card-image"
                src="${escapeHtml(
                  collection.image_url
                )}"
                alt="${escapeHtml(
                  collection.name
                )}"
                loading="lazy"
              >
            `
          : `
              <div
                class="collection-card-placeholder"
              >
                ${escapeHtml(
                  collection.name
                )}
              </div>
            `;


      card.innerHTML = `

        ${image}

        <div
          class="collection-card-overlay"
        ></div>


        <div
          class="collection-card-content"
        >

          <span
            class="collection-number"
          >
            ${number}
          </span>


          <h3>
            ${escapeHtml(
              collection.name
            )}
          </h3>


          <span
            class="collection-shop-link"
          >
            Shop Collection
            <span>→</span>
          </span>

        </div>

      `;


      grid.appendChild(card);

    }
  );

}



/* ========================================
   INITIALIZE
======================================== */

loadCollections();