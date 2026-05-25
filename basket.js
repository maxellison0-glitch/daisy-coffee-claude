// Daisy Coffee — shared basket logic
const BASKET_KEY = 'daisy_coffee_basket';

function getBasket() {
  try { return JSON.parse(localStorage.getItem(BASKET_KEY)) || []; } catch { return []; }
}

function saveBasket(basket) {
  localStorage.setItem(BASKET_KEY, JSON.stringify(basket));
}

function addToBasket(name, price, size) {
  const basket = getBasket();
  const key = name + '|' + size;
  const existing = basket.find(i => i.key === key);
  if (existing) { existing.qty++; } else { basket.push({ key, name, price, size, qty: 1 }); }
  saveBasket(basket);
  updateBasketUI();
  showToast(name);
  openDrawer();
}

function removeFromBasket(key) {
  const basket = getBasket().filter(i => i.key !== key);
  saveBasket(basket);
  updateBasketUI();
}

function changeQty(key, delta) {
  const basket = getBasket();
  const item = basket.find(i => i.key === key);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) { removeFromBasket(key); return; }
  }
  saveBasket(basket);
  updateBasketUI();
}

function getTotal() {
  return getBasket().reduce((s, i) => s + i.price * i.qty, 0);
}

function getCount() {
  return getBasket().reduce((s, i) => s + i.qty, 0);
}

function updateBasketUI() {
  const basket = getBasket();
  const count = getCount();
  const total = getTotal();

  // nav count
  const countEl = document.getElementById('basket-count');
  if (countEl) { countEl.textContent = count; countEl.style.display = count > 0 ? 'flex' : 'none'; }

  // drawer items
  const itemsEl = document.getElementById('basket-items');
  if (itemsEl) {
    if (basket.length === 0) {
      itemsEl.innerHTML = '<p class="basket-empty">Your basket is empty.</p>';
    } else {
      itemsEl.innerHTML = basket.map(i => `
        <div class="basket-item">
          <div class="basket-item-info">
            <div class="basket-item-name">${i.name}</div>
            <div class="basket-item-size">${i.size}</div>
          </div>
          <div class="basket-item-controls">
            <button onclick="changeQty('${i.key}', -1)">−</button>
            <span>${i.qty}</span>
            <button onclick="changeQty('${i.key}', 1)">+</button>
          </div>
          <div class="basket-item-price">£${(i.price * i.qty).toFixed(2)}</div>
          <button class="basket-item-remove" onclick="removeFromBasket('${i.key}')">✕</button>
        </div>
      `).join('');
    }
  }

  // total
  const totalEl = document.getElementById('basket-total');
  if (totalEl) totalEl.textContent = '£' + total.toFixed(2);

  // sticky bar
  const sticky = document.getElementById('sticky-basket');
  if (sticky) sticky.classList.toggle('visible', count > 0);
  const stickyTotal = document.getElementById('sticky-total');
  if (stickyTotal) stickyTotal.textContent = '£' + total.toFixed(2);
  const stickyCount = document.getElementById('sticky-count');
  if (stickyCount) stickyCount.textContent = count + (count === 1 ? ' item' : ' items');
}

function openDrawer() {
  document.getElementById('basket-drawer')?.classList.add('active');
  document.getElementById('basket-overlay')?.classList.add('active');
}

function closeDrawer() {
  document.getElementById('basket-drawer')?.classList.remove('active');
  document.getElementById('basket-overlay')?.classList.remove('active');
}

let toastTimer;
function showToast(name) {
  const t = document.getElementById('toast');
  const n = document.getElementById('toast-name');
  if (!t || !n) return;
  n.textContent = name;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

function goToCheckout() {
  closeDrawer();
  window.location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', () => {
  updateBasketUI();

  // nav scroll
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // hamburger
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      document.getElementById('nav-mobile')?.classList.toggle('open');
    });
  }

  // overlay click
  document.getElementById('basket-overlay')?.addEventListener('click', closeDrawer);
});
