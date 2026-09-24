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
            '<td>' + (p.collection || '—') + '</td>' +
            '<td>' + (
  Array.isArray(p.categories) && p.categories.length
    ? p.categories.join(', ')
    : '—'
) + '</td>' +
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
          '<thead><tr>' +
  '<th>Photo</th>' +
  '<th>Name</th>' +
  '<th>Collection</th>' +
  '<th>Category</th>' +
  '<th>Price</th>' +
  '<th>Stock</th>' +
  '<th>Status</th>' +
  '<th>Actions</th>' +
'</tr></thead>'+
          
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

  const imagePreviewWrap =
    document.getElementById('imagePreviewWrap');

  const productImagesInput =
    document.getElementById('productImages');

  // Clear old previews every time modal opens
  imagePreviewWrap.innerHTML = '';
  imagePreviewWrap.style.display = 'none';

  if (product) {
    productModalTitle.textContent = 'Edit Product';

    document.getElementById('productId').value =
      product.id;

    document.getElementById('productName').value =
      product.name || '';

    document.getElementById('productCollection').value =
      product.collection || '';

    document.getElementById('productDisplaySize').value =
  product.display_size || '';

document.getElementById('productDisplayShape').value =
  product.display_shape || '';

    document.getElementById('productDescription').value =
      product.description || '';

    document.getElementById('productPrice').value =
      (product.price / 100).toFixed(2);

    document.getElementById('productImageUrl').value =
      product.image_url || '';

    // Restore selected categories
let savedCategories = [];

if (Array.isArray(product.categories)) {
  savedCategories = product.categories;
} else if (typeof product.categories === 'string') {
  try {
    savedCategories = JSON.parse(product.categories);
  } catch (error) {
    savedCategories = [];
  }
}

document
  .querySelectorAll('input[name="productCategory"]')
  .forEach(function(checkbox) {

    checkbox.checked =
      savedCategories.includes(checkbox.value);

  });

    document.getElementById('productStock').value =
      product.stock_quantity || 0;

    document.getElementById('productActive').checked =
      !!product.is_active;

    

    activeField.style.display = 'block';


    // Get all existing product images
    let existingImages = [];

    if (Array.isArray(product.images)) {
      existingImages = product.images;
    }


    // If old product only has one image,
    // use image_url as fallback
    if (
      existingImages.length === 0 &&
      product.image_url
    ) {
      existingImages = [product.image_url];
    }


    // Save images into hidden input
    productImagesInput.value =
      JSON.stringify(existingImages);


    // Show existing image previews
   renderProductImagePreviews(existingImages);

  } else {

    // ADD PRODUCT
    productModalTitle.textContent = 'Add Product';

    document.getElementById('productId').value = '';

    document.getElementById('productImageUrl').value = '';

    document.getElementById('productDisplaySize').value = '';

    document.getElementById('productDisplayShape').value = '';

    document
  .querySelectorAll('input[name="productCategory"]')
  .forEach(function(checkbox) {
    checkbox.checked = false;
  });

    productImagesInput.value = '[]';

    imagePreviewWrap.innerHTML = '';
    imagePreviewWrap.style.display = 'none';

    activeField.style.display = 'none';
  }

  productModal.style.display = 'flex';
}

productForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const id = document.getElementById('productId').value;

  const selectedCategories = Array.from(
  document.querySelectorAll(
    'input[name="productCategory"]:checked'
  )
).map(function(checkbox) {
  return checkbox.value;
});

const payload = {
  name: document.getElementById('productName').value,

  collection: document.getElementById('productCollection').value,

  categories: selectedCategories,

  displaySize: document.getElementById('productDisplaySize').value,

  displayShape: document.getElementById('productDisplayShape').value,

  description: document.getElementById('productDescription').value,

  price: parseFloat(
    document.getElementById('productPrice').value
  ),

  imageUrl:
    document.getElementById('productImageUrl').value,

  images: JSON.parse(
    document.getElementById('productImages').value || '[]'
  ),

  stockQuantity:
    parseInt(
      document.getElementById('productStock').value,
      10
    ) || 0,

  isActive:
    document.getElementById('productActive').checked
};

  console.log('Product ID:', id);
  console.log('Payload:', payload);

  const url = id
    ? 'https://beautyloft-backend.onrender.com/admin/products/' + id
    : 'https://beautyloft-backend.onrender.com/admin/products';

  const method = id ? 'PATCH' : 'POST';

  console.log('Method:', method);
  console.log('URL:', url);

  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify(payload)
  })
    .then(async function(response) {
      const data = await response.json();

      console.log('Status:', response.status);
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product.');
      }

      return data;
    })
    .then(function() {
      productModal.style.display = 'none';
      loadProducts();
    })
    .catch(function(error) {
      console.error('PRODUCT SAVE ERROR:', error);
      alert(error.message);
    });
});

document
  .getElementById('productImageFile')
  .addEventListener('change', async function (e) {

    const files = Array.from(e.target.files);

    if (!files.length) return;

    // Get images already saved for this product
    let allImages = [];

    try {
      allImages = JSON.parse(
        document.getElementById('productImages').value || '[]'
      );
    } catch (error) {
      allImages = [];
    }

    // Upload each newly selected image
    for (const file of files) {

      const formData = new FormData();
      formData.append('image', file);

      try {

        const response = await fetch(
          'https://beautyloft-backend.onrender.com/admin/upload-image',
          {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + authToken
            },
            body: formData
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Image upload failed.'
          );
        }

        if (data.imageUrl) {
          allImages.push(data.imageUrl);
        }

      } catch (error) {

        console.error('IMAGE UPLOAD ERROR:', error);

        alert(
          'One of the images failed to upload.'
        );
      }
    }

    // Save all images
    document.getElementById('productImages').value =
      JSON.stringify(allImages);

    // First image is always the main/shop image
    document.getElementById('productImageUrl').value =
      allImages.length > 0 ? allImages[0] : '';

    // Refresh previews
    renderProductImagePreviews(allImages);

    // Clear file input so another image can be selected
    e.target.value = '';
  });

  function renderProductImagePreviews(images) {

  const previewWrap =
    document.getElementById('imagePreviewWrap');

  previewWrap.innerHTML = '';

  if (!images || images.length === 0) {
    previewWrap.style.display = 'none';
    return;
  }

  previewWrap.style.display = 'flex';

  images.forEach(function(imageUrl, index) {

    // Wrapper for image + remove button
    const imageBox = document.createElement('div');

    imageBox.style.position = 'relative';
    imageBox.style.width = '80px';
    imageBox.style.height = '80px';


    // Image
    const img = document.createElement('img');

    img.src = imageUrl;
    img.style.width = '80px';
    img.style.height = '80px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '8px';

    imageBox.appendChild(img);


    // Remove button
    const removeBtn = document.createElement('button');

    removeBtn.type = 'button';
    removeBtn.innerHTML = '&times;';

    removeBtn.style.position = 'absolute';
    removeBtn.style.top = '-6px';
    removeBtn.style.right = '-6px';
    removeBtn.style.width = '22px';
    removeBtn.style.height = '22px';
    removeBtn.style.border = 'none';
    removeBtn.style.borderRadius = '50%';
    removeBtn.style.background = '#2e2622';
    removeBtn.style.color = '#fff';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.fontSize = '16px';
    removeBtn.style.lineHeight = '20px';
    removeBtn.style.padding = '0';


    // Remove this image
    removeBtn.addEventListener('click', function() {

      const currentImages = JSON.parse(
        document.getElementById('productImages').value || '[]'
      );

      currentImages.splice(index, 1);

      document.getElementById('productImages').value =
        JSON.stringify(currentImages);


      // Update main image
      document.getElementById('productImageUrl').value =
        currentImages.length > 0
          ? currentImages[0]
          : '';


      // Refresh previews
      renderProductImagePreviews(currentImages);
    });


    imageBox.appendChild(removeBtn);

    previewWrap.appendChild(imageBox);
  });
}

async function loadCollections() {
  const token = localStorage.getItem('authToken');
  const collectionsList =
    document.getElementById('collectionsList');

  try {
    const response = await fetch(
      'https://beautyloft-backend.onrender.com/admin/collections',
      {
        headers: {
          Authorization: 'Bearer ' + token
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'Could not load collections.'
      );
    }

    collectionsList.innerHTML = '';
    const productCollectionSelect =
  document.getElementById('productCollection');

productCollectionSelect.innerHTML =
  '<option value="">Select collection</option>';

    if (data.collections.length === 0) {
      collectionsList.innerHTML =
        '<p>No collections yet.</p>';
      return;
    }

    
    data.collections.forEach(function(collection) {
      const option = document.createElement('option');

option.value = collection.name;
option.textContent = collection.name;

productCollectionSelect.appendChild(option);
const item =
  document.createElement('div');

item.className = 'collection-item';

item.dataset.id = collection.id;


item.innerHTML = `

  <div class="collection-admin-image">

    ${
      collection.image_url
        ? `
          <img
            src="${collection.image_url}"
            alt="${collection.name}"
          >
        `
        : `
          <div class="collection-image-empty">
            No cover image
          </div>
        `
    }

  </div>


  <div class="collection-admin-details">

    <input
      type="text"
      class="collection-name-input"
      value="${collection.name}"
    >


    <div class="collection-image-field">

      <label>
        Collection Cover
      </label>

      <input
        type="file"
        class="collection-image-input"
        accept="image/*"
      >

      <input
        type="hidden"
        class="collection-image-url"
        value="${collection.image_url || ''}"
      >

    </div>


    <label class="collection-setting">

      <input
        type="checkbox"
        class="collection-featured-input"
        ${
          Number(collection.is_featured) === 1
            ? 'checked'
            : ''
        }
      >

      Featured on Shop Home

    </label>


    <label class="collection-setting">

      <input
        type="checkbox"
        class="collection-active-input"
        ${
          Number(collection.is_active) === 1
            ? 'checked'
            : ''
        }
      >

      Visible to customers

    </label>


    <div class="collection-admin-actions">

      <button
        type="button"
        class="collection-save-btn"
        data-id="${collection.id}"
      >
        Save
      </button>


      <button
        type="button"
        class="collection-delete-btn"
        data-id="${collection.id}"
      >
        Delete
      </button>

    </div>

  </div>

`;

collectionsList.appendChild(item);
    });

  } catch (error) {
    console.error('LOAD COLLECTIONS ERROR:', error);

    collectionsList.innerHTML =
      '<p>Could not load collections.</p>';
  }
}

/* ========================================
   COLLECTION COVER IMAGE UPLOAD
======================================== */

document
  .getElementById('collectionsList')
  .addEventListener(
    'change',
    async function(event) {

      if (
        !event.target.classList.contains(
          'collection-image-input'
        )
      ) {
        return;
      }


      const file =
        event.target.files[0];

      if (!file) {
        return;
      }


      const collectionItem =
        event.target.closest(
          '.collection-item'
        );


      const imageUrlInput =
        collectionItem.querySelector(
          '.collection-image-url'
        );


      const imageArea =
        collectionItem.querySelector(
          '.collection-admin-image'
        );


      const formData =
        new FormData();

      formData.append(
        'image',
        file
      );


      try {

        event.target.disabled = true;


        const response =
          await fetch(
            'https://beautyloft-backend.onrender.com/admin/upload-image',
            {
              method: 'POST',

              headers: {
                Authorization:
                  'Bearer ' + authToken
              },

              body: formData
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            'Collection image upload failed.'
          );

        }


        if (!data.imageUrl) {

          throw new Error(
            'No image URL was returned.'
          );

        }


        // Store Cloudinary URL
        imageUrlInput.value =
          data.imageUrl;


        // Immediately show preview
        imageArea.innerHTML = `
          <img
            src="${data.imageUrl}"
            alt="Collection cover"
          >
        `;


      } catch (error) {

        console.error(
          'COLLECTION IMAGE UPLOAD ERROR:',
          error
        );

        alert(error.message);


      } finally {

        event.target.disabled = false;

        event.target.value = '';

      }

    }
  );

document
  .getElementById('addCollectionBtn')
  .addEventListener('click', async function() {

    const input =
      document.getElementById('newCollectionName');

    const name = input.value.trim();

    if (!name) {
      alert('Enter a collection name.');
      return;
    }

    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(
        'https://beautyloft-backend.onrender.com/admin/collections',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },

          body: JSON.stringify({
            name: name
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not add collection.'
        );
      }

      input.value = '';

      loadCollections();

    } catch (error) {
      alert(error.message);
    }
  });

  /* ========================================
   SAVE COLLECTION
======================================== */

document
  .getElementById('collectionsList')
  .addEventListener(
    'click',
    async function(event) {

      if (
        !event.target.classList.contains(
          'collection-save-btn'
        )
      ) {
        return;
      }


      const saveButton =
        event.target;

      const collectionId =
        saveButton.dataset.id;


      const collectionItem =
        saveButton.closest(
          '.collection-item'
        );


      const name =
        collectionItem
          .querySelector(
            '.collection-name-input'
          )
          .value
          .trim();


      const imageUrl =
        collectionItem
          .querySelector(
            '.collection-image-url'
          )
          .value;


      const isFeatured =
        collectionItem
          .querySelector(
            '.collection-featured-input'
          )
          .checked;


      const isActive =
        collectionItem
          .querySelector(
            '.collection-active-input'
          )
          .checked;


      if (!name) {

        alert(
          'Collection name is required.'
        );

        return;

      }


      const payload = {
        name: name,
        image_url: imageUrl,
        is_featured: isFeatured,
        is_active: isActive
      };


      try {

        saveButton.disabled = true;

        saveButton.textContent =
          'Saving...';


        const response =
          await fetch(
            'https://beautyloft-backend.onrender.com/admin/collections/' +
            collectionId,
            {
              method: 'PATCH',

              headers: {
                'Content-Type':
                  'application/json',

                Authorization:
                  'Bearer ' +
                  authToken
              },

              body:
                JSON.stringify(
                  payload
                )
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            'Could not save collection.'
          );

        }


        saveButton.textContent =
          'Saved ✓';


        setTimeout(
          function() {

            saveButton.textContent =
              'Save';

          },
          1500
        );


        // Refresh products' collection
        // dropdown with any renamed collection
        loadCollections();


      } catch (error) {

        console.error(
          'SAVE COLLECTION ERROR:',
          error
        );

        alert(error.message);

        saveButton.textContent =
          'Save';


      } finally {

        saveButton.disabled =
          false;

      }

    }
  );

  document
  .getElementById('collectionsList')
  .addEventListener('click', async function(event) {

    if (
      !event.target.classList.contains(
        'collection-delete-btn'
      )
    ) {
      return;
    }

    const collectionId =
      event.target.dataset.id;

    const confirmed = confirm(
      'Delete this collection?'
    );

    if (!confirmed) return;

    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(
        'https://beautyloft-backend.onrender.com/admin/collections/' +
        collectionId,
        {
          method: 'DELETE',

          headers: {
            Authorization: 'Bearer ' + token
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not delete collection.'
        );
      }

      loadCollections();

    } catch (error) {
      alert(error.message);
    }
  });

  loadCollections();

  const toggleCollectionsBtn =
  document.getElementById('toggleCollectionsBtn');

const collectionsList =
  document.getElementById('collectionsList');

toggleCollectionsBtn.addEventListener(
  'click',
  function() {

    const isHidden =
      collectionsList.classList.contains('hidden');

    if (isHidden) {
      collectionsList.classList.remove('hidden');
      collectionsList.classList.add('visible');

      toggleCollectionsBtn.textContent =
        'Hide Collections';

    } else {
      collectionsList.classList.remove('visible');
      collectionsList.classList.add('hidden');

      toggleCollectionsBtn.textContent =
        'Show Collections';
    }

  }
);

document
  .getElementById('newCollectionName')
  .addEventListener('keydown', function(event) {

    if (event.key === 'Enter') {
      event.preventDefault();

      document
        .getElementById('addCollectionBtn')
        .click();
    }

  });