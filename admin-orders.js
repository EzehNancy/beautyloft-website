const API_BASE =
  'https://beautyloft-backend.onrender.com';


let orders = [];



/* ========================================
   LOAD ADMIN ORDERS
======================================== */

async function loadOrders() {

  const ordersContainer =
    document.getElementById(
      'ordersAdminTable'
    );


  try {

    const token =
      localStorage.getItem(
        'authToken'
      );


    if (!token) {

      ordersContainer.innerHTML =
        '<p>You are not logged in.</p>';

      return;
    }


    const response =
      await fetch(
        API_BASE + '/admin/orders',
        {
          headers: {
            Authorization:
              'Bearer ' + token
          }
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        'Failed to load orders.'
      );

    }


    orders =
      data.orders || [];


    console.log(
      'ADMIN ORDERS:',
      orders
    );


    renderOrders(orders);

    updateOrderSummary();


  } catch (error) {

    console.error(
      'LOAD ORDERS ERROR:',
      error
    );


    ordersContainer.innerHTML =
      '<p>Failed to load orders.</p>';

  }

}



/* ========================================
   FORMAT MONEY
======================================== */

function formatMoney(amount) {

  const value =
    Number(amount || 0) / 100;


  return new Intl.NumberFormat(
    'en-NG',
    {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }
  ).format(value);

}



/* ========================================
   FORMAT DATE
======================================== */

function formatOrderDate(date) {

  if (!date) {
    return '—';
  }


  return new Date(date)
    .toLocaleString(
      'en-NG',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',

        hour: 'numeric',
        minute: '2-digit'
      }
    );

}



/* ========================================
   FORMAT STATUS
======================================== */

function formatStatus(status) {

  if (!status) {
    return 'Pending';
  }


  return status
    .replace(/_/g, ' ')
    .replace(
      /\b\w/g,
      function(letter) {
        return letter.toUpperCase();
      }
    );

}



/* ========================================
   RENDER ORDERS
======================================== */

function renderOrders(orderList) {

  const container =
    document.getElementById(
      'ordersAdminTable'
    );


  if (!orderList.length) {

    container.innerHTML = `
      <div class="orders-empty-state">
        No paid orders found.
      </div>
    `;

    return;
  }


  let html = `

    <table class="admin-orders-table">

      <thead>

        <tr>

          <th>Order</th>

          <th>Customer</th>

          <th>Date</th>

          <th>Total</th>

          <th>Status</th>

          <th></th>

        </tr>

      </thead>


      <tbody>

  `;



  orderList.forEach(
    function(order) {

      const customerName =
        (
          (order.first_name || '') +
          ' ' +
          (order.last_name || '')
        ).trim() || 'Customer';


      html += `

        <tr>

          <td>

            <strong>
              ${escapeHtml(
                order.order_ref || ''
              )}
            </strong>

          </td>


          <td>

            <div class="order-customer-cell">

              <strong>
                ${escapeHtml(
                  customerName
                )}
              </strong>

              <span>
                ${escapeHtml(
                  order.email || ''
                )}
              </span>

            </div>

          </td>


          <td>
            ${formatOrderDate(
              order.created_at
            )}
          </td>


          <td>

            <strong>
              ${formatMoney(
                order.total
                ||
                order.total_amount
              )}
            </strong>

          </td>


          <td>

            <span
              class="
                order-status-badge
                status-${escapeHtml(
                  order.order_status
                  || 'pending'
                )}
              "
            >

              ${formatStatus(
                order.order_status
              )}

            </span>

          </td>


          <td>

            <button
              type="button"
              class="view-order-btn"
              data-order-id="${order.id}"
            >
              View
            </button>

          </td>

        </tr>

      `;

    }
  );



  html += `

      </tbody>

    </table>

  `;


  container.innerHTML = html;



document
  .querySelectorAll(
    '.view-order-btn'
  )
  .forEach(
    function(button) {

      button.addEventListener(
        'click',
        function() {

          const orderId =
            Number(
              button.dataset.orderId
            );


          openOrderModal(
            orderId
          );

        }
      );

    }
  );

}

/* ========================================
   OPEN ORDER MODAL
======================================== */

async function openOrderModal(orderId) {

  const order =
    orders.find(
      function(item) {
        return item.id === orderId;
      }
    );


  if (!order) {
    return;
  }


  const customerName =
    (
      (order.first_name || '') +
      ' ' +
      (order.last_name || '')
    ).trim() || 'Customer';



  /* ----------------------------------------
     ORDER HEADING
  ---------------------------------------- */

  document.getElementById(
    'orderModalReference'
  ).textContent =
    order.order_ref || 'Order';


  document.getElementById(
    'orderModalDate'
  ).textContent =
    formatOrderDate(
      order.created_at
    );



  /* ----------------------------------------
     CUSTOMER
  ---------------------------------------- */

  document.getElementById(
    'orderCustomerDetails'
  ).innerHTML = `

    <p>
      <strong>Name:</strong>
      ${escapeHtml(customerName)}
    </p>

    <p>
      <strong>Email:</strong>
      ${escapeHtml(order.email || '—')}
    </p>

    <p>
      <strong>Phone:</strong>
      ${escapeHtml(order.phone || '—')}
    </p>

  `;



  /* ----------------------------------------
     DELIVERY
  ---------------------------------------- */

  document.getElementById(
    'orderDeliveryDetails'
  ).innerHTML = `

    <p>
      <strong>Address:</strong>
      ${escapeHtml(
        order.delivery_address ||
        order.shipping_address ||
        '—'
      )}
    </p>

    <p>
      <strong>Area:</strong>
      ${escapeHtml(
        order.delivery_area || '—'
      )}
    </p>

    <p>
      <strong>City:</strong>
      ${escapeHtml(
        order.city || '—'
      )}
    </p>

    <p>
      <strong>State:</strong>
      ${escapeHtml(
        order.state || '—'
      )}
    </p>

    <p>
      <strong>Instructions:</strong>
      ${escapeHtml(
        order.delivery_instructions ||
        'None'
      )}
    </p>

  `;



  /* ----------------------------------------
     ORDER ITEMS
  ---------------------------------------- */

  const orderItems =
    Array.isArray(order.items)
      ? order.items
      : [];


  let itemsHtml = '';


  if (!orderItems.length) {

    itemsHtml =
      '<p>No items found.</p>';

  } else {

    orderItems.forEach(
      function(item) {

        itemsHtml += `

          <div class="admin-order-item">

            ${
              item.image_url
                ? `
                  <img
                    src="${escapeHtml(
                      item.image_url
                    )}"
                    alt="${escapeHtml(
                      item.product_name ||
                      'Product'
                    )}"
                  >
                `
                : ''
            }

            <div class="admin-order-item-info">

              <strong>
                ${escapeHtml(
                  item.product_name ||
                  'Product'
                )}
              </strong>

              <p>
                Quantity:
                ${Number(
                  item.quantity || 0
                )}
              </p>

              ${
                item.size
                  ? `
                    <p>
                      Size:
                      ${escapeHtml(
                        item.size
                      )}
                    </p>
                  `
                  : ''
              }

              ${
                item.shape
                  ? `
                    <p>
                      Shape:
                      ${escapeHtml(
                        item.shape
                      )}
                    </p>
                  `
                  : ''
              }

              ${
                item.nail_type
                  ? `
                    <p>
                      Nail Type:
                      ${escapeHtml(
                        item.nail_type
                      )}
                    </p>
                  `
                  : ''
              }

              ${
                item.finish
                  ? `
                    <p>
                      Finish:
                      ${escapeHtml(
                        item.finish
                      )}
                    </p>
                  `
                  : ''
              }

              ${
                item.length
                  ? `
                    <p>
                      Length:
                      ${escapeHtml(
                        item.length
                      )}
                    </p>
                  `
                  : ''
              }

              <p>
                <strong>
                  ${formatMoney(
                    item.unit_price ||
                    item.price
                  )}
                </strong>
              </p>

            </div>

          </div>

        `;

      }
    );

  }


  document.getElementById(
    'orderItems'
  ).innerHTML =
    itemsHtml;

    /* ----------------------------------------
   NAIL MEASUREMENTS
---------------------------------------- */

const measurements =
  order.measurements;


const measurementsSection =
  document.getElementById(
    'orderMeasurementsSection'
  );


const measurementsContainer =
  document.getElementById(
    'orderMeasurements'
  );


if (measurements) {

  measurementsSection.style.display =
    'block';


  measurementsContainer.innerHTML = `

    <div class="admin-measurements-grid">


      <div class="admin-hand-measurements">

        <h4>
          Left Hand
        </h4>

        <div class="measurement-row">
          <span>Thumb</span>
          <strong>
            ${escapeHtml(
              measurements.left_thumb ?? '—'
            )}
          </strong>
        </div>

        <div class="measurement-row">
          <span>Index</span>
          <strong>
            ${escapeHtml(
              measurements.left_index ?? '—'
            )}
          </strong>
        </div>

        <div class="measurement-row">
          <span>Middle</span>
          <strong>
            ${escapeHtml(
              measurements.left_middle ?? '—'
            )}
          </strong>
        </div>

        <div class="measurement-row">
          <span>Ring</span>
          <strong>
            ${escapeHtml(
              measurements.left_ring ?? '—'
            )}
          </strong>
        </div>

        <div class="measurement-row">
          <span>Pinky</span>
          <strong>
            ${escapeHtml(
              measurements.left_pinky ?? '—'
            )}
          </strong>
        </div>

      </div>



      <div class="admin-hand-measurements">

        <h4>
          Right Hand
        </h4>

        <div class="measurement-row">
          <span>Thumb</span>
          <strong>
            ${escapeHtml(
              measurements.right_thumb ?? '—'
            )}
          </strong>
        </div>

        <div class="measurement-row">
          <span>Index</span>
          <strong>
            ${escapeHtml(
              measurements.right_index ?? '—'
            )}
          </strong>
        </div>

        <div class="measurement-row">
          <span>Middle</span>
          <strong>
            ${escapeHtml(
              measurements.right_middle ?? '—'
            )}
          </strong>
        </div>

        <div class="measurement-row">
          <span>Ring</span>
          <strong>
            ${escapeHtml(
              measurements.right_ring ?? '—'
            )}
          </strong>
        </div>

        <div class="measurement-row">
          <span>Pinky</span>
          <strong>
            ${escapeHtml(
              measurements.right_pinky ?? '—'
            )}
          </strong>
        </div>

      </div>


    </div>

  `;

} else {

  measurementsSection.style.display =
    'none';

}


  /* ----------------------------------------
     PAYMENT
  ---------------------------------------- */

  document.getElementById(
    'orderPaymentDetails'
  ).innerHTML = `

    <p>
      <strong>Payment:</strong>
      ${escapeHtml(
        formatStatus(
          order.payment_status
        )
      )}
    </p>

    <p>
      <strong>Reference:</strong>
      ${escapeHtml(
        order.payment_reference ||
        '—'
      )}
    </p>

  `;



  /* ----------------------------------------
     TOTALS
  ---------------------------------------- */

  document.getElementById(
    'orderTotals'
  ).innerHTML = `

    <p>
      <span>Subtotal</span>

      <strong>
        ${formatMoney(
          order.subtotal
        )}
      </strong>
    </p>


    <p>
      <span>Delivery</span>

      <strong>
        ${formatMoney(
          order.delivery_fee
        )}
      </strong>
    </p>


    <p>
      <span>Total</span>

      <strong>
        ${formatMoney(
          order.total ||
          order.total_amount
        )}
      </strong>
    </p>

  `;



  /* ----------------------------------------
     CURRENT STATUS
  ---------------------------------------- */

  const statusSelect =
    document.getElementById(
      'orderStatusSelect'
    );


  if (
    order.order_status &&
    order.order_status !== 'pending'
  ) {

    statusSelect.value =
      order.order_status;

  } else {

    statusSelect.value =
      'confirmed';

  }



  /* ----------------------------------------
     STORE CURRENT ORDER
  ---------------------------------------- */

  document.getElementById(
    'orderModal'
  ).dataset.orderId =
    order.id;



  document.getElementById(
    'orderStatusMessage'
  ).textContent = '';



  /* ----------------------------------------
     SHOW MODAL
  ---------------------------------------- */

document.getElementById(
  'orderModal'
).style.display =
  'flex';


/* ----------------------------------------
   MARK ORDER AS ATTENDED
---------------------------------------- */

try {

  const response =
    await fetch(
      API_BASE +
      '/admin/orders/' +
      orderId +
      '/seen',
      {
        method: 'PATCH',

        headers: {
          Authorization:
            'Bearer ' +
            localStorage.getItem(
              'authToken'
            )
        }
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.error ||
      'Failed to mark order as attended.'
    );

  }


  /* Update local order */

  order.admin_seen = 1;


  console.log(
    'ORDER MARKED AS ATTENDED:',
    data.order
  );


} catch (error) {

  console.error(
    'MARK ORDER SEEN ERROR:',
    error
  );

}

}

/* ----------------------------------------
   MARK ORDER AS ATTENDED
---------------------------------------- */


/* ========================================
   CLOSE ORDER MODAL
======================================== */

document.getElementById(
  'closeOrderModal'
).addEventListener(
  'click',
  function() {

    document.getElementById(
      'orderModal'
    ).style.display =
      'none';

  }
);



document.getElementById(
  'orderModal'
).addEventListener(
  'click',
  function(event) {

    if (
      event.target ===
      document.getElementById(
        'orderModal'
      )
    ) {

      document.getElementById(
        'orderModal'
      ).style.display =
        'none';

    }

  }
);

document
  .querySelectorAll(
    '.view-order-btn'
  )
  .forEach(
    function(button) {

      button.addEventListener(
        'click',
        function() {

          const orderId =
            Number(
              button.dataset.orderId
            );


          console.log(
            'VIEW ORDER:',
            orderId
          );

        }
      );

    }
  );


/* ========================================
   ORDER SUMMARY
======================================== */

function updateOrderSummary() {

  document.getElementById(
    'paidOrdersCount'
  ).textContent =
    orders.length;


    

  document.getElementById(
    'preparingOrdersCount'
  ).textContent =
    orders.filter(
      function(order) {
        return (
          order.order_status ===
          'preparing'
        );
      }
    ).length;


  document.getElementById(
    'readyOrdersCount'
  ).textContent =
    orders.filter(
      function(order) {
        return (
          order.order_status ===
          'ready'
        );
      }
    ).length;


  document.getElementById(
    'dispatchedOrdersCount'
  ).textContent =
    orders.filter(
      function(order) {
        return (
          order.order_status ===
          'dispatched'
        );
      }
    ).length;

    document.getElementById(
  'pendingOrdersCount'
).textContent =
    orders.filter(
      function(order) {
        return (
          order.order_status ===
          'confirmed'
        );
      }
    ).length;

}



/* ========================================
   SAFE HTML
======================================== */

function escapeHtml(value) {

  return String(value ?? '')
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );

}
/* ========================================
   FILTER ORDERS
======================================== */

function filterOrders() {

  const searchTerm =
    document.getElementById(
      'orderSearch'
    )
    .value
    .trim()
    .toLowerCase();


  const selectedStatus =
    document.getElementById(
      'orderStatusFilter'
    ).value;


  const filteredOrders =
    orders.filter(
      function(order) {

        const customerName =
          (
            (order.first_name || '') +
            ' ' +
            (order.last_name || '')
          )
          .trim()
          .toLowerCase();


        const orderReference =
          String(
            order.order_ref || ''
          ).toLowerCase();


        const email =
          String(
            order.email || ''
          ).toLowerCase();


        const phone =
          String(
            order.phone || ''
          ).toLowerCase();


        const matchesSearch =
          !searchTerm ||
          customerName.includes(searchTerm) ||
          orderReference.includes(searchTerm) ||
          email.includes(searchTerm) ||
          phone.includes(searchTerm);


        const matchesStatus =
          !selectedStatus ||
          order.order_status ===
            selectedStatus;


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );


  renderOrders(
    filteredOrders
  );

}



/* ========================================
   SEARCH ORDERS
======================================== */

document.getElementById(
  'orderSearch'
).addEventListener(
  'input',
  filterOrders
);



/* ========================================
   FILTER BY STATUS
======================================== */

document.getElementById(
  'orderStatusFilter'
).addEventListener(
  'change',
  filterOrders
);


/* ========================================
   START PAGE
======================================== */

/* ========================================
   UPDATE ORDER STATUS
======================================== */

document.getElementById(
  'saveOrderStatusBtn'
).addEventListener(
  'click',
  async function() {

    const modal =
      document.getElementById(
        'orderModal'
      );

    const orderId =
      Number(
        modal.dataset.orderId
      );


    const status =
      document.getElementById(
        'orderStatusSelect'
      ).value;


    const message =
      document.getElementById(
        'orderStatusMessage'
      );


    const button =
      document.getElementById(
        'saveOrderStatusBtn'
      );


    if (!orderId) {
      return;
    }


    try {

      button.disabled = true;

      button.textContent =
        'Updating...';


      message.textContent = '';


      const token =
        localStorage.getItem(
          'authToken'
        );


      const response =
        await fetch(
          API_BASE +
          '/admin/orders/' +
          orderId +
          '/status',
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                'Bearer ' + token
            },

            body: JSON.stringify({
              status: status
            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          'Failed to update status.'
        );

      }



      /* ----------------------------------------
         UPDATE LOCAL ORDER
      ---------------------------------------- */

      const order =
        orders.find(
          function(item) {
            return item.id === orderId;
          }
        );


      if (order) {

        order.order_status =
          data.order.order_status;

      }



      /* ----------------------------------------
         UPDATE PAGE
      ---------------------------------------- */

      renderOrders(orders);

      updateOrderSummary();



      /* ----------------------------------------
         SUCCESS MESSAGE
      ---------------------------------------- */

      message.textContent =
        'Order status updated successfully.';


      console.log(
        'ORDER STATUS UPDATED:',
        data.order
      );


    } catch (error) {

      console.error(
        'UPDATE ORDER STATUS ERROR:',
        error
      );


      message.textContent =
        error.message;

    } finally {

      button.disabled = false;

      button.textContent =
        'Update Status';

    }

  }
);

loadOrders();