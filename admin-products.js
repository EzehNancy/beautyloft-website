const authToken = localStorage.getItem('authToken');

if (!authToken) {
  window.location.href = 'login.html';
}

fetch('https://beautyloft-backend.onrender.com/me', {
  headers: { 'Authorization': 'Bearer ' + authToken }
})
  .then(function(response) {
    if (!response.ok) {
      window.location.href = 'login.html';
      return null;
    }
    return response.json();
  })
  .then(function(data) {
    if (!data) return;
    if (!data.user.is_admin) {
      window.location.href = 'index.html';
      return;
    }
    loadProducts();
  });

document.getElementById('adminLogoutBtn').addEventListener('click', function() {
  fetch('https://beautyloft-backend.onrender.com/logout', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + authToken }
  }).then(function() {
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
  });
});

document.getElementById('mobileSidebarToggle').addEventListener('click', function() {
  document.querySelector('.admin-sidebar').classList.toggle('open');
});

let allProducts = [];

function loadProducts() {
  fetch('https://beautyloft-backend.onrender.com/admin/products', {
    headers: { 'Authorization': 'Bearer ' + authToken },
    cache: 'no-store'
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      allProducts = data.products;
      const container = document.getElementById('productsAdminTable');

      if (allProducts.length === 0) {
        container.innerHTML = '<p class="activity-empty">No products yet. Click "+ Add Product" to create your first one.</p>';
        return;
      }

      let rows = '';
      allProducts.forEach(function(p) {
        const nairaPrice = (p.price / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 });
        rows +=
          '<tr>' +
            '<td>' + (p.image_url ? '<img src="' + p.image_url + '" style="width:44px; height:44px; object-fit:cover; border-radius:8px;">' : '—') + '</td>' +
            '<td>' + p.name + '</td>' +
            '<td>' + p.category + '</td>' +
            '<td>₦' + nairaPrice + '</td>' +
            '<td>' + p.stock_quantity + '</td>' +
            '<td><span class="status-badge status-' + (p.is_active ? 'confirmed' : 'cancelled') + '">' + (p.is_active ? 'Active' : 'Hidden') + '</span></td>' +
            '<td>' +
              '<button class="admin-action-btn edit-product-btn" data-id="' + p.id + '">Edit</button>' +
              '<button class="admin-action-btn admin-action-cancel delete-product-btn" data-id="' + p.id + '">Delete</button>' +
            '</td>' +
          '</tr>';
      });

      container.innerHTML =
        '<table class="data-table">' +
          '<thead><tr><th>Photo</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>';

      attachProductListeners();
    });
}

function attachProductListeners() {
  document.querySelectorAll('.edit-product-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const product = allProducts.find(function(p) { return String(p.id) === btn.dataset.id; });
      if (product) openProductModal(product);
    });
  });

  document.querySelectorAll('.delete-product-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (!confirm('Delete this product permanently?')) return;

      fetch('https://beautyloft-backend.onrender.com/admin/products/' + btn.dataset.id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + authToken }
      }).then(function() {
        loadProducts();
      });
    });
  });
}

const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const productModalTitle = document.getElementById('productModalTitle');
const activeField = document.getElementById('activeField');

document.getElementById('addProductBtn').addEventListener('click', function() {
  openProductModal(null);
});

document.getElementById('closeProductModal').addEventListener('click', function() {
  productModal.style.display = 'none';
});

function openProductModal(product) {
  productForm.reset();

  if (product) {
    productModalTitle.textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = (product.price / 100).toFixed(2);
    document.getElementById('productImageUrl').value = product.image_url;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productStock').value = product.stock_quantity;
    document.getElementById('productActive').checked = !!product.is_active;
    activeField.style.display = 'block';
  } else {
    productModalTitle.textContent = 'Add Product';
    document.getElementById('productId').value = '';
    activeField.style.display = 'none';
  }

  productModal.style.display = 'flex';
}

productForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const id = document.getElementById('productId').value;
  const payload = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDescription').value,
    price: parseFloat(document.getElementById('productPrice').value),
    imageUrl: document.getElementById('productImageUrl').value,
    category: document.getElementById('productCategory').value,
    stockQuantity: parseInt(document.getElementById('productStock').value, 10) || 0,
    isActive: document.getElementById('productActive').checked
  };

  const url = id
    ? 'https://beautyloft-backend.onrender.com/admin/products/' + id
    : 'https://beautyloft-backend.onrender.com/admin/products';
  const method = id ? 'PATCH' : 'POST';

  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify(payload)
  })
    .then(function() {
      productModal.style.display = 'none';
      loadProducts();
    });
});