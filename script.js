const menuToggle = document.getElementById('menuToggle');
const navList = document.getElementById('navList');

menuToggle.addEventListener('click', function() {
  navList.classList.toggle('open');
});

const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.g-item');

filterButtons.forEach(function(btn) {
  btn.addEventListener('click', function() {

    filterButtons.forEach(function(b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    const selected = btn.dataset.filter;

    galleryItems.forEach(function(item) {
      if (selected === 'all' || item.dataset.category === selected) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });

  });
});

const lightbox = document.getElementById('lightbox');
const lightboxInner = document.getElementById('lightboxInner');
const lightboxClose = document.getElementById('lightboxClose');

if (lightbox) {
  galleryItems.forEach(function(item) {
    item.addEventListener('click', function() {
      const caption = item.querySelector('p').textContent;
      lightboxInner.innerHTML = '<p>' + caption + '</p>';
      lightbox.classList.add('open');
    });
  });

  lightboxClose.addEventListener('click', function() {
    lightbox.classList.remove('open');
  });

  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      lightbox.classList.remove('open');
    }
  });
}

