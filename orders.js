const API_URL =
  'https://beautyloft-backend.onrender.com';


let customerOrders = [];

let currentFilter = 'all';



/* ========================================
   AUTH
======================================== */

const authToken =
  localStorage.getItem(
    'authToken'
  );


if (!authToken) {

  window.location.href =
    'login.html';

}



/* ========================================
   HELPERS
======================================== */

function escapeHtml(value) {

  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

}



function formatMoney(value) {

  return (
    '₦' +
    (
      Number(value || 0) / 100
    ).toLocaleString(
      'en-NG'
    )
  );

}



function formatDate(value) {

  if (!value) {
    return '—';
  }


  const date =
    new Date(value);


  return date.toLocaleDateString(
    'en-NG',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  );

}



function formatStatus(value) {

  if (!value) {
    return 'Pending';
  }


  return String(value)
    .replace(/_/g, ' ')
    .replace(
      /\b\w/g,
      function(letter) {
        return letter.toUpperCase();
      }
    );

}



/* ========================================
   LOAD ORDERS
======================================== */

async function loadOrders() {

  const ordersList =
    document.getElementById(
      'ordersList'
    );


  try {

    const response =
      await fetch(
        API_URL + '/my-orders',
        {
          headers: {
            Authorization:
              'Bearer ' +
              authToken
          }
        }
      );


    const data =
      await response.json();


    if (
      response.status === 401
    ) {

      localStorage.removeItem(
        'authToken'
      );

      window.location.href =
        'login.html';

      return;

    }


    if (!response.ok) {

      throw new Error(
        data.error ||
        'Unable to load your orders.'
      );

    }


    customerOrders =
      Array.isArray(data.orders)
        ? data.orders
        : [];


    updateOrderCount();

    renderOrders();


  } catch (error) {

    console.error(
      'LOAD ORDERS ERROR:',
      error
    );


    ordersList.innerHTML = `

      <div class="orders-error">

        <p>
          ${escapeHtml(
            error.message
          )}
        </p>

        <button
          type="button"
          class="view-order-button"
          onclick="loadOrders()"
        >
          Try Again
        </button>

      </div>

    `;

  }

}



/* ========================================
   ORDER COUNT
======================================== */

function updateOrderCount() {

  const count =
    document.getElementById(
      'orderCount'
    );


  const total =
    customerOrders.length;


  count.textContent =
    total === 1
      ? '1 Order'
      : total + ' Orders';

}



/* ========================================
   FILTER ORDERS
======================================== */

function getFilteredOrders() {

  if (
    currentFilter === 'all'
  ) {

    return customerOrders;

  }


  return customerOrders.filter(
    function(order) {

      return (
        String(
          order.order_status || ''
        ).toLowerCase() ===
        currentFilter
      );

    }
  );

}



/* ========================================
   RENDER ORDERS
======================================== */

function renderOrders() {

  const ordersList =
    document.getElementById(
      'ordersList'
    );


  const orders =
    getFilteredOrders();


  if (!orders.length) {

    if (
      currentFilter !== 'all'
    ) {

      ordersList.innerHTML = `

        <div class="orders-empty">

          <h3>
            No ${escapeHtml(
              formatStatus(
                currentFilter
              )
            )} orders
          </h3>

          <p>
            You don't currently have
            any orders with this status.
          </p>

        </div>

      `;

      return;

    }


    ordersList.innerHTML = `

      <div class="orders-empty">

        <h3>
          No orders yet
        </h3>

        <p>
          When you place your first
          BeautyLoft order, you'll be
          able to follow it here.
        </p>

        <a
          href="shop.html"
          class="shop-button"
        >
          Start Shopping
        </a>

      </div>

    `;

    return;

  }


  ordersList.innerHTML = '';


  orders.forEach(
    function(order) {

      const card =
        document.createElement(
          'article'
        );


      card.className =
        'order-card';


      const items =
        Array.isArray(order.items)
          ? order.items
          : [];


      const previewItems =
        items.slice(0, 3);


      let productImages = '';


      previewItems.forEach(
        function(item) {

          if (item.image_url) {

            productImages += `

              <img
                src="${escapeHtml(
                  item.image_url
                )}"
                alt="${escapeHtml(
                  item.product_name
                )}"
                class="order-product-image"
              >

            `;

          } else {

            productImages += `

              <div
                class="order-product-image"
              ></div>

            `;

          }

        }
      );


      if (items.length > 3) {

        productImages += `

          <div class="more-products">
            +${items.length - 3}
          </div>

        `;

      }


      const status =
        String(
          order.order_status ||
          'pending'
        ).toLowerCase();


      card.innerHTML = `

        <div class="order-card-top">

          <div>

            <h3 class="order-reference">
              ${escapeHtml(
                order.order_ref
              )}
            </h3>

            <p class="order-date">
              ${formatDate(
                order.created_at
              )}
            </p>

          </div>


          <span
            class="order-status ${escapeHtml(
              status
            )}"
          >
            ${escapeHtml(
              formatStatus(status)
            )}
          </span>

        </div>


        <div class="order-card-body">


          <div class="order-products">

            ${productImages}

          </div>


          <div class="order-summary">

            <div>

              <span
                class="order-total-label"
              >
                Total
              </span>

              <strong
                class="order-total"
              >
                ${formatMoney(
                  order.total
                )}
              </strong>

            </div>


            <button
              type="button"
              class="view-order-button"
              data-order-id="${order.id}"
            >
              View Order
            </button>

          </div>

        </div>

      `;


      ordersList.appendChild(
        card
      );

    }
  );


  /*
    View order buttons
  */

  document
    .querySelectorAll(
      '.view-order-button[data-order-id]'
    )
    .forEach(
      function(button) {

        button.addEventListener(
          'click',
          function() {

            openOrderModal(
              Number(
                button.dataset.orderId
              )
            );

          }
        );

      }
    );

}



/* ========================================
   FILTER BUTTONS
======================================== */

document
  .querySelectorAll(
    '.order-filter'
  )
  .forEach(
    function(button) {

      button.addEventListener(
        'click',
        function() {

          currentFilter =
            button.dataset.filter;


          document
            .querySelectorAll(
              '.order-filter'
            )
            .forEach(
              function(filterButton) {

                filterButton
                  .classList
                  .remove(
                    'active'
                  );

              }
            );


          button.classList.add(
            'active'
          );


          renderOrders();

        }
      );

    }
  );



/* ========================================
   OPEN ORDER MODAL
======================================== */

function openOrderModal(
  orderId
) {

  const order =
    customerOrders.find(
      function(item) {

        return (
          Number(item.id) ===
          Number(orderId)
        );

      }
    );


  if (!order) {
    return;
  }


  const modal =
    document.getElementById(
      'orderModal'
    );


  const modalReference =
    document.getElementById(
      'modalOrderReference'
    );


  const modalContent =
    document.getElementById(
      'modalOrderContent'
    );


  modalReference.textContent =
    order.order_ref ||
    'Order';


  const items =
    Array.isArray(order.items)
      ? order.items
      : [];


  let itemsHTML = '';


  items.forEach(
    function(item) {

      const options = [];


      if (item.size) {
        options.push(
          'Size: ' +
          escapeHtml(item.size)
        );
      }


      if (item.shape) {
        options.push(
          'Shape: ' +
          escapeHtml(item.shape)
        );
      }


      if (item.length) {
        options.push(
          'Length: ' +
          escapeHtml(item.length)
        );
      }


      if (item.nail_type) {
        options.push(
          'Type: ' +
          escapeHtml(
            item.nail_type
          )
        );
      }


      if (item.finish) {
        options.push(
          'Finish: ' +
          escapeHtml(
            item.finish
          )
        );
      }


      const imageHTML =
        item.image_url
          ? `
              <img
                src="${escapeHtml(
                  item.image_url
                )}"
                alt="${escapeHtml(
                  item.product_name
                )}"
              >
            `
          : `
              <div
                class="order-product-image"
              ></div>
            `;


      itemsHTML += `

        <div class="modal-item">

          ${imageHTML}


          <div>

            <p class="modal-item-name">

              ${escapeHtml(
                item.product_name
              )}

              ×
              ${Number(
                item.quantity || 1
              )}

            </p>


            <p class="modal-item-options">
              ${options.join('<br>')}
            </p>

          </div>


          <div class="modal-item-price">

            ${formatMoney(
              Number(
                item.unit_price || 0
              ) *
              Number(
                item.quantity || 1
              )
            )}

          </div>

        </div>

      `;

    }
  );


  const status =
    String(
      order.order_status ||
      'pending'
    ).toLowerCase();


  modalContent.innerHTML = `


    <div class="modal-status-row">

      <div>

        <span class="modal-label">
          Order Date
        </span>

        <strong>
          ${formatDate(
            order.created_at
          )}
        </strong>

      </div>


      <span
        class="order-status ${escapeHtml(
          status
        )}"
      >
        ${escapeHtml(
          formatStatus(status)
        )}
      </span>

    </div>



    <div class="modal-status-row">

      <div>

        <span class="modal-label">
          Payment
        </span>

        <strong>
          ${escapeHtml(
            order.payment_method ===
            'bank_transfer'
              ? 'Bank Transfer'
              : 'Paystack'
          )}
        </strong>

      </div>


      <div>

        <span class="modal-label">
          Payment Status
        </span>

        <strong>
          ${escapeHtml(
            formatStatus(
              order.payment_status
            )
          )}
        </strong>

      </div>

    </div>



    <div class="modal-items">

      <h3>
        Items
      </h3>

      ${itemsHTML}

    </div>



    <div class="modal-totals">

      <h3>
        Order Summary
      </h3>


      <div class="modal-total-row">

        <span>
          Subtotal
        </span>

        <span>
          ${formatMoney(
            order.subtotal
          )}
        </span>

      </div>


      <div class="modal-total-row">

        <span>
          Delivery
        </span>

        <span>
          ${formatMoney(
            order.delivery_fee
          )}
        </span>

      </div>


      <div
        class="modal-total-row final"
      >

        <strong>
          Total
        </strong>

        <strong>
          ${formatMoney(
            order.total
          )}
        </strong>

      </div>

    </div>

  `;


  modal.classList.add(
    'open'
  );


  document.body.style.overflow =
    'hidden';

}



/* ========================================
   CLOSE ORDER MODAL
======================================== */

function closeOrderModal() {

  const modal =
    document.getElementById(
      'orderModal'
    );


  modal.classList.remove(
    'open'
  );


  document.body.style.overflow =
    '';

}



document
  .getElementById(
    'closeOrderModal'
  )
  .addEventListener(
    'click',
    closeOrderModal
  );


document
  .getElementById(
    'orderModalOverlay'
  )
  .addEventListener(
    'click',
    closeOrderModal
  );


document.addEventListener(
  'keydown',
  function(event) {

    if (
      event.key ===
      'Escape'
    ) {

      closeOrderModal();

    }

  }
);



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
        'open'
      );

    }
  );

}



/* ========================================
   HEADER SCROLL
======================================== */

const siteHeader =
  document.querySelector(
    'header'
  );


let lastScrollY =
  window.scrollY;


const scrollThreshold = 8;


window.addEventListener(
  'scroll',
  function() {

    const currentScrollY =
      window.scrollY;


    if (
      currentScrollY <= 40
    ) {

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


    if (
      Math.abs(
        currentScrollY -
        lastScrollY
      ) < scrollThreshold
    ) {

      return;

    }


    if (
      currentScrollY >
      lastScrollY
    ) {

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


      siteHeader.classList.add(
        'header-hidden'
      );

      siteHeader.classList.remove(
        'header-visible'
      );

    } else {

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
   LOG OUT
======================================== */

const logoutButton =
  document.getElementById(
    'logoutButton'
  );


logoutButton.addEventListener(
  'click',
  function() {

    localStorage.removeItem(
      'authToken'
    );


    localStorage.removeItem(
      'pendingBeautyLoftOrder'
    );


    window.location.href =
      'login.html';

  }
);



/* ========================================
   INITIALIZE
======================================== */

loadOrders();