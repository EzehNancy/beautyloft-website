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

const lookbookItems = [
  { label:'Cinnamon balayage',  grad:'linear-gradient(160deg,#B98A82,#5B3A45)' },
  { label:'Espresso chrome',    grad:'linear-gradient(160deg,#6B5F5A,#2E2622)' },
  { label:'Copper glow blowout',grad:'linear-gradient(160deg,#C9A876,#98645C)' },
  { label:'Terracotta nail art',grad:'linear-gradient(160deg,#98645C,#C9A876)' },
  { label:'Soft caramel roots', grad:'linear-gradient(160deg,#E4D8D2,#B98A82)' },
];
const lookbookStrip = document.getElementById('lookbookStrip');
if (lookbookStrip) {
  lookbookItems.forEach(item => {
    const el = document.createElement('div');
    el.className = 'lookbook-card';
    el.innerHTML = `<span class="lookbook-badge">Trending</span><div class="ph" style="background:${item.grad}">${item.label}</div>`;
    lookbookStrip.appendChild(el);
  });
}

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

