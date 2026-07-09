// ---------- Nav scroll + mobile menu (every page) ----------
const header = document.getElementById('site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });
}
const menuToggle = document.getElementById('menuToggle');
const navList = document.getElementById('navList');
if (menuToggle && navList) {
  menuToggle.addEventListener('click', () => navList.classList.toggle('open'));
  navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navList.classList.remove('open')));
}

// ---------- Reveal on scroll (every page) ----------
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold:0.15 });
  revealEls.forEach(el => io.observe(el));
}

// ---------- Lightbox (home page portfolio) ----------
const lightbox = document.getElementById('lightbox');
const lightboxInner = document.getElementById('lightboxInner');
function openLightbox(item){
  if (!lightbox) return;
  lightboxInner.innerHTML = `<div class="ph" style="background:${item.grad}">${item.label}</div>`;
  lightbox.classList.add('open');
}
function closeLightbox(){ if (lightbox) lightbox.classList.remove('open'); }
if (lightbox) {
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeLightbox(); });
}

// ---------- Gallery (home page only) ----------
// EDIT THIS: replace placeholder gallery with your real photos
const galleryItems = [
  { category:'hair',  label:'Warm balayage',        grad:'linear-gradient(150deg,#B98A82,#5B3A45)' },
  { category:'nails', label:'Milky chrome french',  grad:'linear-gradient(150deg,#C9A876,#98645C)' },
  { category:'hair',  label:'Soft glam blowout',    grad:'linear-gradient(150deg,#6B5F5A,#2E2622)' },
  { category:'nails', label:'Almond gel, nude',     grad:'linear-gradient(150deg,#E4D8D2,#B98A82)' },
  { category:'hair',  label:'Bridal updo',          grad:'linear-gradient(150deg,#98645C,#2E2622)' },
  { category:'nails', label:'Micro floral art',     grad:'linear-gradient(150deg,#B98A82,#C9A876)' },
  { category:'hair',  label:'Root melt color',      grad:'linear-gradient(150deg,#5B3A45,#B98A82)' },
  { category:'nails', label:'Classic red gel',      grad:'linear-gradient(150deg,#98645C,#5B3A45)' },
  { category:'hair',  label:'Beachy waves',         grad:'linear-gradient(150deg,#C9A876,#6B5F5A)' },
];
const gallery = document.getElementById('gallery');
if (gallery) {
  function renderGallery(filter){
    gallery.innerHTML = '';
    galleryItems
      .filter(item => filter === 'all' || item.category === filter)
      .forEach(item => {
        const el = document.createElement('div');
        el.className = 'g-item';
        el.innerHTML = `
          <span class="tag">${item.category}</span>
          <div class="ph" style="background:${item.grad}">${item.label}</div>
        `;
        el.addEventListener('click', () => openLightbox(item));
        gallery.appendChild(el);
      });
  }
  renderGallery('all');
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGallery(btn.dataset.filter);
    });
  });
}

// ---------- Seasonal lookbook (home page only) ----------
// EDIT THIS: swap labels/gradients or add real photos each season
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

// ---------- Before / after (home page only) ----------
// EDIT THIS: swap gradients for real before/after photos
const baItems = [
  { caption:'Balayage refresh — 6 weeks of growth corrected', beforeGrad:'linear-gradient(160deg,#6B5F5A,#2E2622)', afterGrad:'linear-gradient(160deg,#C9A876,#98645C)' },
  { caption:'Full gel-X set with hand-painted nail art', beforeGrad:'linear-gradient(160deg,#8a8078,#4a423d)', afterGrad:'linear-gradient(160deg,#B98A82,#5B3A45)' },
];
const baGrid = document.getElementById('baGrid');
if (baGrid) {
  baItems.forEach((item, i) => {
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="ba-frame">
        <div class="ba-media ba-before" style="background:${item.beforeGrad}"><span>Before</span></div>
        <div class="ba-media ba-after" id="baAfter${i}" style="background:${item.afterGrad}"><span>After</span></div>
        <div class="ba-handle" id="baHandle${i}"></div>
        <input type="range" min="0" max="100" value="50" class="ba-range" id="baRange${i}" aria-label="Drag to compare before and after photo">
      </div>
      <p class="ba-caption">${item.caption}</p>
    `;
    baGrid.appendChild(el);
    const range = el.querySelector(`#baRange${i}`);
    const after = el.querySelector(`#baAfter${i}`);
    const handle = el.querySelector(`#baHandle${i}`);
    range.addEventListener('input', () => {
      after.style.clipPath = `inset(0 ${100 - range.value}% 0 0)`;
      handle.style.left = `${range.value}%`;
    });
  });
}
