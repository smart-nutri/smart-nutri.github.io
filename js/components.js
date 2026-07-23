// ===================================================
// SmartNutri Meal Planner — UI Components
// Carousel, Modal, Card Renderers, Notifications
// ===================================================

// ---------- Toast Notification ----------
function showToast(message, icon = '✅') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---------- Modal System ----------
function openModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.classList.remove('active');
  });
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeAllModals();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAllModals();
});

// ---------- Food Card Renderer ----------
function renderFoodCard(menu, options = {}) {
  const { showBadge = false } = options;
  const favorites = getFavorites();
  const isFav = favorites.includes(menu.id);

  const imageHTML = menu.image
    ? `<img src="${menu.image}" alt="${menu.name}" loading="lazy">`
    : `<div class="placeholder-img food-${(menu.id % 6) + 1}">🍳</div>`;

  return `
    <div class="food-card" onclick="showMenuDetail(${menu.id})" data-menu-id="${menu.id}">
      <div class="food-card-image">
        ${imageHTML}
        ${showBadge && menu.isRecommended ? '<span class="food-card-badge">แนะนำ</span>' : ''}
        <button class="food-card-fav ${isFav ? 'active' : ''}" 
                onclick="event.stopPropagation(); toggleFavorite(${menu.id})"
                title="${isFav ? 'เอาออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}">
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="food-card-body">
        <h3 class="food-card-name">${menu.name}</h3>
        <div class="food-card-meta">
          <span><span class="meta-icon">⏱️</span> ${menu.time} นาที</span>
          <span><span class="meta-icon">💰</span> ${menu.cost} บาท</span>
        </div>
        <div class="food-card-nutrition">
          <span class="nut-item">พลังงาน <span>${menu.calories} kcal</span></span>
          <span class="nut-item">โปรตีน <span>${menu.protein} g</span></span>
        </div>
      </div>
    </div>
  `;
}

// ---------- Menu Detail Modal ----------
function showMenuDetail(menuId) {
  const menu = MENU_DATA.find(m => m.id === menuId);
  if (!menu) return;

  const imageHTML = menu.image
    ? `<img src="${menu.image}" alt="${menu.name}">`
    : `<div class="placeholder-img food-${(menu.id % 6) + 1}">🍳</div>`;

  const ingredientsList = menu.ingredients
    .map(i => `<li>${i.name} — ${i.amount}</li>`)
    .join('');

  const instructionsList = menu.instructions
    .map(i => `<li>${i}</li>`)
    .join('');

  const goalTags = menu.goals
    .map(g => `<span class="meta-tag" style="color: var(--primary);">🎯 ${g}</span>`)
    .join('');

  const allergenTags = menu.allergens.length > 0
    ? menu.allergens.map(a => `<span class="meta-tag" style="color: #ef4444; background: #fee2e2;">⚠️ ${a}</span>`).join('')
    : '<span class="meta-tag" style="color: var(--primary);">✅ ไม่มีสารก่อภูมิแพ้</span>';

  const modalBody = document.querySelector('#menuDetailModal .modal-body');
  const modalTitle = document.querySelector('#menuDetailModal .modal-header h2');

  modalTitle.textContent = menu.name;

  modalBody.innerHTML = `
    <div class="menu-detail-image">${imageHTML}</div>

    <div class="menu-detail-meta">
      <span class="meta-tag">⏱️ ${menu.time} นาที</span>
      <span class="meta-tag">💰 ${menu.cost} บาท</span>
      <span class="meta-tag">📂 ${menu.category}</span>
      ${goalTags}
    </div>

    <div class="menu-detail-nutrition">
      <div class="detail-nut-item cal">
        <span class="nut-value">${menu.calories}</span>
        <span class="nut-label">แคลอรี (kcal)</span>
      </div>
      <div class="detail-nut-item protein">
        <span class="nut-value">${menu.protein}g</span>
        <span class="nut-label">โปรตีน</span>
      </div>
      <div class="detail-nut-item carbs">
        <span class="nut-value">${menu.carbs}g</span>
        <span class="nut-label">คาร์โบไฮเดรต</span>
      </div>
      <div class="detail-nut-item fat">
        <span class="nut-value">${menu.fat}g</span>
        <span class="nut-label">ไขมัน</span>
      </div>
      <div class="detail-nut-item fiber">
        <span class="nut-value">${menu.fiber}g</span>
        <span class="nut-label">ใยอาหาร</span>
      </div>
    </div>

    <div class="detail-section">
      <h3><span class="ds-icon">⚠️</span> สารก่อภูมิแพ้</h3>
      <div class="menu-detail-meta">${allergenTags}</div>
    </div>

    <div class="detail-section">
      <h3><span class="ds-icon">🥘</span> วัตถุดิบ</h3>
      <ul>${ingredientsList}</ul>
    </div>

    <div class="detail-section">
      <h3><span class="ds-icon">👨‍🍳</span> วิธีทำ</h3>
      <ol>${instructionsList}</ol>
    </div>

    <div class="detail-tip">
      💡 <strong>เคล็ดลับ:</strong> ${menu.tips}
    </div>

    <div class="detail-section" style="margin-top: 24px;">
      <h3><span class="ds-icon">📍</span> ข้อมูลเพิ่มเติม</h3>
      <div class="detail-info-grid">
        <div class="detail-info-item">
          <h5>🛒 แหล่งซื้อวัตถุดิบ</h5>
          <p>${menu.buyFrom}</p>
        </div>
        <div class="detail-info-item">
          <h5>🔍 วิธีเลือกซื้อ</h5>
          <p>${menu.howToSelect}</p>
        </div>
        <div class="detail-info-item">
          <h5>❄️ วิธีเก็บรักษา</h5>
          <p>${menu.storage}</p>
        </div>
        <div class="detail-info-item">
          <h5>📚 แหล่งอ้างอิง</h5>
          <p>${menu.nutritionRef}</p>
        </div>
      </div>
    </div>

    <div style="margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap;">
      <button class="btn btn-primary btn-sm" onclick="addToShoppingList(${menu.id})">
        🛒 เพิ่มในรายการซื้อ
      </button>
      <button class="btn btn-outline btn-sm" onclick="toggleFavorite(${menu.id}); showMenuDetail(${menu.id});">
        ${getFavorites().includes(menu.id) ? '❤️ เอาออกจากรายการโปรด' : '🤍 เพิ่มในรายการโปรด'}
      </button>
    </div>
  `;

  openModal('menuDetailModal');
}

// ---------- Article Modal ----------
function showArticleDetail(articleId) {
  const article = ARTICLES_DATA.find(a => a.id === articleId);
  if (!article) return;

  const modalTitle = document.querySelector('#articleModal .modal-header h2');
  const modalBody = document.querySelector('#articleModal .modal-body');

  modalTitle.textContent = article.title;
  modalBody.innerHTML = `
    <div class="article-modal-content">
      ${article.content}
    </div>
    <div class="article-modal-ref">
      📚 แหล่งอ้างอิง: ${article.ref}
    </div>
  `;

  openModal('articleModal');
}

// ---------- Carousel Controller ----------
class Carousel {
  constructor(trackEl, options = {}) {
    this.track = trackEl;
    this.wrapper = trackEl.parentElement;
    this.currentIndex = 0;
    this.cardWidth = options.cardWidth || 300;
    this.gap = options.gap || 20;
    this.autoPlay = options.autoPlay || false;
    this.autoPlayInterval = options.autoPlayInterval || 4000;
    this.dotsEl = options.dotsEl;
    this.timer = null;

    this.init();
  }

  init() {
    this.totalCards = this.track.children.length;
    this.visibleCards = Math.floor(this.wrapper.offsetWidth / (this.cardWidth + this.gap)) || 1;
    this.maxIndex = Math.max(0, this.totalCards - this.visibleCards);

    this.updateDots();
    if (this.autoPlay) this.startAutoPlay();

    // Recalculate on resize
    window.addEventListener('resize', () => {
      this.visibleCards = Math.floor(this.wrapper.offsetWidth / (this.cardWidth + this.gap)) || 1;
      this.maxIndex = Math.max(0, this.totalCards - this.visibleCards);
      if (this.currentIndex > this.maxIndex) {
        this.currentIndex = this.maxIndex;
        this.slide();
      }
      this.updateDots();
    });
  }

  slide() {
    const offset = this.currentIndex * (this.cardWidth + this.gap);
    this.track.style.transform = `translateX(-${offset}px)`;
    this.updateDots();
  }

  next() {
    this.currentIndex = this.currentIndex >= this.maxIndex ? 0 : this.currentIndex + 1;
    this.slide();
  }

  prev() {
    this.currentIndex = this.currentIndex <= 0 ? this.maxIndex : this.currentIndex - 1;
    this.slide();
  }

  goTo(index) {
    this.currentIndex = Math.min(index, this.maxIndex);
    this.slide();
  }

  updateDots() {
    if (!this.dotsEl) return;
    const totalDots = this.maxIndex + 1;
    let dotsHTML = '';
    for (let i = 0; i < totalDots; i++) {
      dotsHTML += `<span class="carousel-dot ${i === this.currentIndex ? 'active' : ''}" 
                         onclick="menuCarousel.goTo(${i})"></span>`;
    }
    this.dotsEl.innerHTML = dotsHTML;
  }

  startAutoPlay() {
    this.timer = setInterval(() => this.next(), this.autoPlayInterval);
    this.wrapper.addEventListener('mouseenter', () => clearInterval(this.timer));
    this.wrapper.addEventListener('mouseleave', () => {
      this.timer = setInterval(() => this.next(), this.autoPlayInterval);
    });
  }
}

// ---------- Confetti Effect ----------
function launchConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti';
  document.body.appendChild(container);

  const colors = ['#FF6B6B', '#4ECDC4', '#FFB347', '#66BB6A', '#7C6BFF', '#FF69B4', '#FFD700'];
  const shapes = ['■', '●', '▲', '★'];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    piece.style.left = Math.random() * 100 + '%';
    piece.style.color = colors[Math.floor(Math.random() * colors.length)];
    piece.style.fontSize = (Math.random() * 12 + 8) + 'px';
    piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
    piece.style.animationDelay = Math.random() * 0.5 + 's';
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 4000);
}

// ---------- Nutrition Bar Animator ----------
function animateNutritionBars() {
  const bars = document.querySelectorAll('.nutrition-bar-fill');
  bars.forEach(bar => {
    const target = bar.getAttribute('data-width');
    setTimeout(() => {
      bar.style.width = target + '%';
    }, 300);
  });
}

// ---------- Scroll Reveal ----------
function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.food-card, .goal-card, .article-card, .about-feature').forEach(el => {
    observer.observe(el);
  });
}
