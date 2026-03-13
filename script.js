/* ============================================================
   HIJABI BADDIE — script.js
   Shared utilities: product loading, cart helpers, UI init
   ============================================================ */

/* ------------------------------------------------------------------
   PRODUCTS — fetch products.json and cache the result
   ------------------------------------------------------------------ */
let _productsCache = null;

async function loadProducts() {
  if (_productsCache) return _productsCache;
  const res = await fetch('products.json');
  const raw = await res.json();
  // Filter out comment entries (they start with "_comment")
  _productsCache = raw.filter(p => p.id);
  return _productsCache;
}

async function getProduct(id) {
  const products = await loadProducts();
  return products.find(p => p.id === id) || null;
}

/* ------------------------------------------------------------------
   IMAGES — resolve a filename to the /images/ path
   ------------------------------------------------------------------ */
function imgSrc(filename) {
  if (!filename) return 'images/placeholder.png';
  return 'images/' + filename;
}

/* ------------------------------------------------------------------
   PRICE — format a price to "$XX.00"
   ------------------------------------------------------------------ */
function formatPrice(n) {
  return '$' + Number(n).toFixed(2);
}

/* ------------------------------------------------------------------
   PRODUCT CARD — generate HTML for a product card
   Used on index.html to build the grid dynamically
   ------------------------------------------------------------------ */
function buildProductCard(product, large = false) {
  const priceHTML = product.salePrice
    ? `<span class="sale">${formatPrice(product.price)}</span>${formatPrice(product.salePrice)}`
    : formatPrice(product.price);

  const actualPrice = product.salePrice || product.price;

  // If product has a back image, set up front/back swap
  const imgHTML = product.imageBack
    ? `<span class="img-spacer" style="padding-top:133%;display:block;"></span>
       <img class="img-front" src="${imgSrc(product.imageFront)}" alt="${product.name}" loading="lazy">
       <img class="img-back" src="${imgSrc(product.imageBack)}" alt="${product.name} — back" loading="lazy">`
    : `<img class="img-front" src="${imgSrc(product.imageFront)}" alt="${product.name}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;">
       <span class="img-spacer" style="padding-top:133%;display:block;"></span>`;

  return `
    <div class="product-card${large ? ' large' : ''}">
      <a href="product.html?id=${product.id}" style="display:block;height:100%;">
        <div class="product-img-wrap" style="position:relative;overflow:hidden;${large ? 'min-height:500px;' : 'aspect-ratio:3/4;'}">
          ${imgHTML}
          <div class="product-overlay">
            <div class="product-tag">${product.tag || ''}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">${priceHTML}</div>
          </div>
        </div>
      </a>
      <div class="product-info">
        <div class="product-tag">${product.tag || product.category}</div>
        <div class="product-name">
          <a href="product.html?id=${product.id}">${product.name}</a>
        </div>
        <div class="product-price">${priceHTML}</div>
      </div>
      <button
        class="quick-add snipcart-add-item"
        data-item-id="${product.id}"
        data-item-price="${actualPrice}"
        data-item-name="${product.name}"
        data-item-description="${product.description || ''}"
        data-item-image="${imgSrc(product.imageFront)}"
        data-item-url="/products.json"
      >Add to Bag</button>
    </div>`;
}

/* ------------------------------------------------------------------
   SIZE BUTTONS — render interactive size row
   ------------------------------------------------------------------ */
function buildSizeRow(sizes) {
  if (!sizes || sizes.length === 0) return '';
  return `
    <div class="size-label">Select Size</div>
    <div class="size-row">
      ${sizes.map((s, i) => `
        <button class="size-btn${i === 0 ? ' active' : ''}"
          onclick="selectSize(this)">${s}</button>
      `).join('')}
    </div>`;
}

function selectSize(btn) {
  const row = btn.closest('.size-row');
  row.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Update the Snipcart add-to-cart button custom option
  const cartBtn = row.closest('.product-detail-info, .product-card')?.querySelector('.snipcart-add-item');
  if (cartBtn) {
    cartBtn.dataset.itemCustom1Name = 'Size';
    cartBtn.dataset.itemCustom1Value = btn.textContent.trim();
  }
}

/* ------------------------------------------------------------------
   NEWSLETTER
   ------------------------------------------------------------------ */
function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.display = 'none';
    const confirm = document.querySelector('.newsletter-confirm');
    if (confirm) confirm.style.display = 'block';
  });
}

/* ------------------------------------------------------------------
   NAV — hide announcement bar on scroll
   ------------------------------------------------------------------ */
function initNav() {
  const bar = document.querySelector('.announce-bar');
  if (!bar) return;
  const navEl = document.querySelector('nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80) {
      bar.style.display = 'none';
      if (navEl) navEl.style.top = '0';
    } else {
      bar.style.display = '';
      if (navEl) navEl.style.top = '';
    }
    lastScroll = y;
  }, { passive: true });
}

/* ------------------------------------------------------------------
   HERO PARALLAX
   ------------------------------------------------------------------ */
function initParallax() {
  const heroImg = document.querySelector('.hero-img-container img');
  if (!heroImg) return;
  window.addEventListener('scroll', () => {
    heroImg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
  }, { passive: true });
}

/* ------------------------------------------------------------------
   COLOR BAR — interactive hover on homepage
   ------------------------------------------------------------------ */
function initColorBar() {
  const bar = document.querySelector('.color-bar');
  if (!bar) return;
  const colors = [
    '#aaff00','#7b2ff7','#080808','#f0f0f0','#a855f7',
    '#ff2d55','#aaff00','#4c1d95','#7b2ff7','#080808'
  ];
  bar.innerHTML = colors.map(c =>
    `<div class="color-slab" style="background:${c};"></div>`
  ).join('');
}

/* ------------------------------------------------------------------
   INIT — run on DOMContentLoaded
   ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initParallax();
  initNewsletter();
  initColorBar();
});
