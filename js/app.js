// ===================================================
// SmartNutri Meal Planner — Application Logic
// Navigation, User Settings, Random Menu, Filters
// ===================================================

let menuCarousel = null;
let userProfile = null;

// ---------- Initialize App ----------
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  renderHomePage();
  setupNavigation();
  setupScrollEffects();
  updateNutritionPanel();
  renderShoppingList();
  setupSettingsForm();
  setupScrollReveal();
});

// ---------- User Profile Management ----------
function loadUserProfile() {
  const saved = localStorage.getItem('smartnutri_profile');
  if (saved) {
    userProfile = JSON.parse(saved);
  } else {
    userProfile = {
      name: '',
      age: 25,
      gender: 'female',
      weight: 55,
      height: 160,
      diseases: [],
      allergens: [],
      dislikedFoods: '',
      budget: 100,
      cookingTime: 30,
      equipment: ['เตาแก๊ส', 'กระทะ', 'หม้อ'],
      goal: 'healthy'
    };
  }
  updateProfileDisplay();
}

function saveUserProfile() {
  const form = document.getElementById('settingsForm');
  if (!form) return;

  userProfile.name = document.getElementById('userName')?.value || '';
  userProfile.age = parseInt(document.getElementById('userAge')?.value) || 25;
  userProfile.gender = document.getElementById('userGender')?.value || 'female';
  userProfile.weight = parseInt(document.getElementById('userWeight')?.value) || 55;
  userProfile.height = parseInt(document.getElementById('userHeight')?.value) || 160;
  userProfile.dislikedFoods = document.getElementById('dislikedFoods')?.value || '';
  userProfile.budget = parseInt(document.getElementById('budgetRange')?.value) || 100;
  userProfile.cookingTime = parseInt(document.getElementById('timeRange')?.value) || 30;

  // Get selected diseases
  userProfile.diseases = [];
  document.querySelectorAll('#diseasesChips .form-chip.active').forEach(chip => {
    userProfile.diseases.push(chip.textContent.trim());
  });

  // Get selected allergens
  userProfile.allergens = [];
  document.querySelectorAll('#allergensChips .form-chip.active').forEach(chip => {
    userProfile.allergens.push(chip.textContent.trim());
  });

  // Get selected equipment
  userProfile.equipment = [];
  document.querySelectorAll('#equipmentChips .form-chip.active').forEach(chip => {
    userProfile.equipment.push(chip.textContent.trim());
  });

  localStorage.setItem('smartnutri_profile', JSON.stringify(userProfile));
  updateProfileDisplay();
  updateNutritionPanel();
  renderRecommendedMenus();
  renderShoppingList();
  closeModal('settingsModal');
  showToast('บันทึกข้อมูลเรียบร้อยแล้ว! 🎉');
}

function updateProfileDisplay() {
  // Update greeting
  const greeting = document.querySelector('.nav-profile-text .greeting');
  const action = document.querySelector('.nav-profile-text .action');
  if (greeting && userProfile.name) {
    greeting.textContent = `สวัสดี, ${userProfile.name}`;
    action.textContent = 'ดูโปรไฟล์';
  }

  // Update quick settings display
  const qsInfo = document.querySelector('.qs-info-text');
  if (qsInfo && userProfile.name) {
    qsInfo.textContent = `${userProfile.gender === 'male' ? 'ชาย' : 'หญิง'} อายุ ${userProfile.age} ปี น้ำหนัก ${userProfile.weight} กก.`;
  }

  const qsBudget = document.querySelector('.qs-budget-text');
  if (qsBudget) {
    qsBudget.textContent = `ประมาณต่อมื้อ ${userProfile.budget} บาท`;
  }

  const qsTime = document.querySelector('.qs-time-text');
  if (qsTime) {
    qsTime.textContent = `เวลาที่มี ${userProfile.cookingTime} นาที`;
  }

  const qsEquip = document.querySelector('.qs-equip-text');
  if (qsEquip) {
    qsEquip.textContent = userProfile.equipment.slice(0, 3).join(', ');
  }

  const qsRestrict = document.querySelector('.qs-restrict-text');
  if (qsRestrict) {
    const restrictions = [...userProfile.allergens, ...userProfile.diseases].filter(r => !r.includes('ไม่มี'));
    qsRestrict.textContent = restrictions.length > 0 ? restrictions.slice(0, 2).join(', ') : 'ยังไม่ได้ตั้งค่า';
  }
}

// ---------- Settings Form ----------
function setupSettingsForm() {
  // Render disease chips
  const diseasesContainer = document.getElementById('diseasesChips');
  if (diseasesContainer) {
    diseasesContainer.innerHTML = DISEASES_LIST.map(d =>
      `<span class="form-chip ${userProfile.diseases.includes(d) ? 'active' : ''}" 
            onclick="toggleChip(this)">${d}</span>`
    ).join('');
  }

  // Render allergen chips
  const allergensContainer = document.getElementById('allergensChips');
  if (allergensContainer) {
    allergensContainer.innerHTML = ALLERGENS_LIST.map(a =>
      `<span class="form-chip ${userProfile.allergens.includes(a) ? 'active' : ''}" 
            onclick="toggleChip(this)">${a}</span>`
    ).join('');
  }

  // Render equipment chips
  const equipmentContainer = document.getElementById('equipmentChips');
  if (equipmentContainer) {
    equipmentContainer.innerHTML = EQUIPMENT_LIST.map(e =>
      `<span class="form-chip ${userProfile.equipment.includes(e) ? 'active' : ''}" 
            onclick="toggleChip(this)">${e}</span>`
    ).join('');
  }

  // Fill form values
  if (document.getElementById('userName')) {
    document.getElementById('userName').value = userProfile.name;
    document.getElementById('userAge').value = userProfile.age;
    document.getElementById('userGender').value = userProfile.gender;
    document.getElementById('userWeight').value = userProfile.weight;
    document.getElementById('userHeight').value = userProfile.height;
    document.getElementById('dislikedFoods').value = userProfile.dislikedFoods;
    document.getElementById('budgetRange').value = userProfile.budget;
    document.getElementById('budgetValue').textContent = userProfile.budget + ' บาท';
    document.getElementById('timeRange').value = userProfile.cookingTime;
    document.getElementById('timeValue').textContent = userProfile.cookingTime + ' นาที';
  }
}

function toggleChip(el) {
  el.classList.toggle('active');
}

function openSettings() {
  setupSettingsForm();
  openModal('settingsModal');
}

// ---------- Nutrition Panel ----------
function calculateTDEE() {
  const { gender, weight, height, age } = userProfile;
  let bmr;
  if (gender === 'male') {
    bmr = 66.5 + (13.75 * weight) + (5.003 * height) - (6.75 * age);
  } else {
    bmr = 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
  }
  return Math.round(bmr * 1.55); // moderate activity
}

function getDailyRequirements() {
  const tdee = calculateTDEE();
  const genderReqs = DAILY_REQUIREMENTS[userProfile.gender] || DAILY_REQUIREMENTS.female;
  return {
    calories: tdee,
    protein: Math.round(userProfile.weight * 0.8 * 1.2),
    carbs: genderReqs.carbs,
    fat: genderReqs.fat,
    fiber: genderReqs.fiber
  };
}

function updateNutritionPanel() {
  const reqs = getDailyRequirements();
  
  // Simulate consumed today (65-85% of daily)
  const consumed = {
    calories: Math.round(reqs.calories * (0.65 + Math.random() * 0.2)),
    protein: Math.round(reqs.protein * (0.6 + Math.random() * 0.2)),
    carbs: Math.round(reqs.carbs * (0.55 + Math.random() * 0.2)),
    fat: Math.round(reqs.fat * (0.65 + Math.random() * 0.15)),
    fiber: Math.round(reqs.fiber * (0.6 + Math.random() * 0.2))
  };

  const nutrients = [
    { key: 'calories', label: 'พลังงาน', consumed: consumed.calories, total: reqs.calories, unit: 'kcal', cls: 'calories' },
    { key: 'protein', label: 'โปรตีน', consumed: consumed.protein, total: reqs.protein, unit: 'g', cls: 'protein' },
    { key: 'carbs', label: 'คาร์โบไฮเดรต', consumed: consumed.carbs, total: reqs.carbs, unit: 'g', cls: 'carbs' },
    { key: 'fat', label: 'ไขมันดี', consumed: consumed.fat, total: reqs.fat, unit: 'g', cls: 'fat' },
    { key: 'fiber', label: 'ใยอาหาร', consumed: consumed.fiber, total: reqs.fiber, unit: 'g', cls: 'fiber' }
  ];

  const panelContent = document.getElementById('nutritionBars');
  if (!panelContent) return;

  panelContent.innerHTML = nutrients.map(n => {
    const percent = Math.min(100, Math.round((n.consumed / n.total) * 100));
    return `
      <div class="nutrition-bar">
        <div class="nutrition-bar-header">
          <span class="nutrition-bar-label">${n.label}</span>
          <span class="nutrition-bar-value">${n.consumed} / ${n.total} ${n.unit}</span>
          <span class="nutrition-bar-percent">${percent}%</span>
        </div>
        <div class="nutrition-bar-track">
          <div class="nutrition-bar-fill ${n.cls}" data-width="${percent}"></div>
        </div>
      </div>
    `;
  }).join('');

  // Animate bars
  setTimeout(animateNutritionBars, 100);
}

// ---------- Menu Filtering ----------
function getFilteredMenus(options = {}) {
  let menus = [...MENU_DATA];
  const { goal, category, maxCost, maxTime, excludeAllergens, excludeDiseases } = options;

  // Filter by user's allergens
  const userAllergens = userProfile.allergens.filter(a => !a.includes('ไม่มี'));
  if (userAllergens.length > 0) {
    menus = menus.filter(m => !m.allergens.some(a => userAllergens.includes(a)));
  }

  // Filter by budget
  menus = menus.filter(m => m.cost <= (maxCost || userProfile.budget));

  // Filter by cooking time
  menus = menus.filter(m => m.time <= (maxTime || userProfile.cookingTime));

  // Filter by goal
  if (goal && goal !== 'all') {
    const goalData = GOALS_DATA.find(g => g.id === goal);
    if (goalData) {
      menus = menus.filter(m => m.goals.includes(goalData.name));
    }
  }

  // Filter by category
  if (category && category !== 'ทั้งหมด') {
    menus = menus.filter(m => m.category === category);
  }

  // Filter by equipment
  if (userProfile.equipment.length > 0) {
    menus = menus.filter(m =>
      m.equipment.every(e => userProfile.equipment.includes(e))
    );
  }

  return menus;
}

// ---------- Render Home Page Sections ----------
function renderHomePage() {
  renderRecommendedMenus();
  renderGoals();
  renderArticles();
}

function renderRecommendedMenus() {
  const track = document.getElementById('recommendedTrack');
  if (!track) return;

  const filteredMenus = getFilteredMenus();
  // Sort recommended first, then by calories
  filteredMenus.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));

  track.innerHTML = filteredMenus.map(menu =>
    renderFoodCard(menu, { showBadge: true })
  ).join('');

  // Initialize carousel
  const dotsEl = document.getElementById('recommendedDots');
  menuCarousel = new Carousel(track, {
    cardWidth: 280,
    gap: 20,
    autoPlay: true,
    autoPlayInterval: 5000,
    dotsEl: dotsEl
  });
}

function renderGoals() {
  const container = document.getElementById('goalsGrid');
  if (!container) return;

  container.innerHTML = GOALS_DATA.map(goal => `
    <div class="goal-card" onclick="navigateTo('menus'); filterByGoal('${goal.id}')">
      <div class="goal-icon" style="background: ${goal.color}15;">
        <span>${goal.icon}</span>
      </div>
      <div class="goal-text">
        <h4 style="color: ${goal.color};">${goal.name}</h4>
        <p>${goal.description}</p>
      </div>
    </div>
  `).join('');
}

function renderArticles() {
  const container = document.getElementById('articlesGrid');
  if (!container) return;

  const articleBgs = ['article-1', 'article-2', 'article-3', 'article-4'];
  const articleEmojis = ['📊', '🥩', '🧂', '🥬'];

  container.innerHTML = ARTICLES_DATA.map((article, index) => `
    <div class="article-card" onclick="showArticleDetail(${article.id})">
      <div class="article-card-image">
        <div class="placeholder-img ${articleBgs[index % 4]}">${articleEmojis[index % 4]}</div>
      </div>
      <div class="article-card-body">
        <div class="article-card-category">${article.category}</div>
        <h3 class="article-card-title">${article.title}</h3>
        <p class="article-card-summary">${article.summary}</p>
      </div>
    </div>
  `).join('');
}

// ---------- Shopping List ----------
function getShoppingList() {
  const saved = localStorage.getItem('smartnutri_shopping');
  return saved ? JSON.parse(saved) : [];
}

function saveShoppingList(list) {
  localStorage.setItem('smartnutri_shopping', JSON.stringify(list));
}

function addToShoppingList(menuId) {
  const menu = MENU_DATA.find(m => m.id === menuId);
  if (!menu) return;

  let list = getShoppingList();

  menu.ingredients.forEach(ing => {
    const exists = list.find(item => item.name === ing.name);
    if (!exists) {
      list.push({ name: ing.name, amount: ing.amount, checked: false, menuName: menu.name });
    }
  });

  saveShoppingList(list);
  renderShoppingList();
  showToast(`เพิ่มวัตถุดิบของ "${menu.name}" ในรายการซื้อแล้ว 🛒`);
}

function toggleShoppingItem(index) {
  const list = getShoppingList();
  if (list[index]) {
    list[index].checked = !list[index].checked;
    saveShoppingList(list);
    renderShoppingList();
  }
}

function clearShoppingList() {
  saveShoppingList([]);
  renderShoppingList();
  showToast('ล้างรายการซื้อเรียบร้อย');
}

function renderShoppingList() {
  const container = document.getElementById('shoppingList');
  if (!container) return;

  const list = getShoppingList();

  if (list.length === 0) {
    container.innerHTML = `
      <div class="shopping-empty">
        <div class="empty-icon">🛒</div>
        <p>ยังไม่มีรายการ</p>
        <p style="font-size: 0.8rem; color: var(--text-muted);">เลือกเมนูแล้วกด "เพิ่มในรายการซื้อ"</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((item, index) => `
    <div class="shopping-item">
      <input type="checkbox" id="shop-${index}" 
             ${item.checked ? 'checked' : ''} 
             onchange="toggleShoppingItem(${index})">
      <label for="shop-${index}" class="${item.checked ? 'checked' : ''}">${item.name}</label>
      <span class="amount">${item.amount}</span>
    </div>
  `).join('');
}

// ---------- Favorites ----------
function getFavorites() {
  const saved = localStorage.getItem('smartnutri_favorites');
  return saved ? JSON.parse(saved) : [];
}

function toggleFavorite(menuId) {
  let favorites = getFavorites();
  const index = favorites.indexOf(menuId);

  if (index === -1) {
    favorites.push(menuId);
    showToast('เพิ่มในรายการโปรดแล้ว ❤️');
  } else {
    favorites.splice(index, 1);
    showToast('เอาออกจากรายการโปรดแล้ว');
  }

  localStorage.setItem('smartnutri_favorites', JSON.stringify(favorites));

  // Update all food cards with this menu id
  document.querySelectorAll(`[data-menu-id="${menuId}"] .food-card-fav`).forEach(btn => {
    const isFav = favorites.includes(menuId);
    btn.classList.toggle('active', isFav);
    btn.innerHTML = isFav ? '❤️' : '🤍';
  });
}

// ---------- Random Menu ----------
function startRandomMenu() {
  openModal('randomModal');

  const filteredMenus = getFilteredMenus();
  if (filteredMenus.length === 0) {
    document.getElementById('randomSlot').innerHTML = '<div class="placeholder-img food-1">😅</div>';
    document.getElementById('randomName').textContent = 'ไม่พบเมนูที่เหมาะสม';
    document.getElementById('randomMeta').textContent = 'ลองปรับการตั้งค่าใหม่';
    return;
  }

  const slot = document.getElementById('randomSlot');
  const nameEl = document.getElementById('randomName');
  const metaEl = document.getElementById('randomMeta');
  const btnEl = document.getElementById('randomBtn');

  slot.classList.add('spinning');
  btnEl.disabled = true;
  btnEl.textContent = '🎰 กำลังสุ่ม...';

  let spinCount = 0;
  const maxSpins = 20;
  const spinInterval = setInterval(() => {
    const randomMenu = filteredMenus[Math.floor(Math.random() * filteredMenus.length)];
    const imgHTML = randomMenu.image
      ? `<img src="${randomMenu.image}" alt="${randomMenu.name}">`
      : `<div class="placeholder-img food-${(randomMenu.id % 6) + 1}">🍳</div>`;
    slot.innerHTML = imgHTML;
    nameEl.textContent = randomMenu.name;
    metaEl.textContent = `${randomMenu.calories} kcal · ${randomMenu.time} นาที · ${randomMenu.cost} บาท`;

    spinCount++;
    if (spinCount >= maxSpins) {
      clearInterval(spinInterval);
      slot.classList.remove('spinning');
      btnEl.disabled = false;
      btnEl.textContent = '🎲 สุ่มใหม่';

      // Final selection
      const finalMenu = filteredMenus[Math.floor(Math.random() * filteredMenus.length)];
      const finalImg = finalMenu.image
        ? `<img src="${finalMenu.image}" alt="${finalMenu.name}">`
        : `<div class="placeholder-img food-${(finalMenu.id % 6) + 1}">🍳</div>`;
      slot.innerHTML = finalImg;
      nameEl.textContent = finalMenu.name;
      metaEl.textContent = `${finalMenu.calories} kcal · ${finalMenu.time} นาที · ${finalMenu.cost} บาท`;

      // Store selected menu for detail view
      slot.setAttribute('data-selected', finalMenu.id);

      launchConfetti();
    }
  }, 100);
}

function viewRandomResult() {
  const slot = document.getElementById('randomSlot');
  const menuId = parseInt(slot.getAttribute('data-selected'));
  if (menuId) {
    closeModal('randomModal');
    setTimeout(() => showMenuDetail(menuId), 300);
  }
}

// ---------- SPA Navigation ----------
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const page = link.getAttribute('data-page');
      if (page) {
        e.preventDefault();
        navigateTo(page);
      }
    });
  });
}

function navigateTo(page) {
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-page="${page}"]`)?.classList.add('active');

  // Show/hide sections
  if (page === 'home') {
    document.getElementById('homeContent').style.display = 'block';
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    document.getElementById('homeContent').style.display = 'none';
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
      targetPage.classList.add('active');
      renderPageContent(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Close mobile menu
  document.querySelector('.nav-links')?.classList.remove('mobile-open');
}

function renderPageContent(page) {
  switch (page) {
    case 'random':
      // Random page just has a button
      break;
    case 'menus':
      renderMenusPage();
      break;
    case 'knowledge':
      renderKnowledgePage();
      break;
    case 'about':
      // Static content
      break;
  }
}

function renderMenusPage() {
  const grid = document.getElementById('menusPageGrid');
  if (!grid) return;

  const activeFilter = document.querySelector('#menusFilterBar .filter-chip.active');
  const category = activeFilter ? activeFilter.textContent.trim() : 'ทั้งหมด';

  let menus = [...MENU_DATA];
  if (category !== 'ทั้งหมด') {
    menus = menus.filter(m => m.category === category);
  }

  grid.innerHTML = menus.map(menu =>
    renderFoodCard(menu, { showBadge: true })
  ).join('');
}

function filterMenusPage(chip) {
  document.querySelectorAll('#menusFilterBar .filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  renderMenusPage();
}

function filterByGoal(goalId) {
  const grid = document.getElementById('menusPageGrid');
  if (!grid) return;

  const goalData = GOALS_DATA.find(g => g.id === goalId);
  if (!goalData) return;

  const menus = MENU_DATA.filter(m => m.goals.includes(goalData.name));

  // Reset filter chips
  document.querySelectorAll('#menusFilterBar .filter-chip').forEach(c => c.classList.remove('active'));
  document.querySelector('#menusFilterBar .filter-chip')?.classList.add('active');

  grid.innerHTML = menus.map(menu =>
    renderFoodCard(menu, { showBadge: true })
  ).join('');

  // Update page title
  const pageTitle = document.querySelector('#page-menus .page-hero h2');
  if (pageTitle) pageTitle.textContent = `เมนู${goalData.name}`;
}

function renderKnowledgePage() {
  const grid = document.getElementById('knowledgePageGrid');
  if (!grid) return;

  const articleBgs = ['article-1', 'article-2', 'article-3', 'article-4'];
  const articleEmojis = ['📊', '🥩', '🧂', '🥬'];

  grid.innerHTML = ARTICLES_DATA.map((article, index) => `
    <div class="article-card" onclick="showArticleDetail(${article.id})" style="cursor:pointer;">
      <div class="article-card-image">
        <div class="placeholder-img ${articleBgs[index % 4]}">${articleEmojis[index % 4]}</div>
      </div>
      <div class="article-card-body">
        <div class="article-card-category">${article.category}</div>
        <h3 class="article-card-title">${article.title}</h3>
        <p class="article-card-summary">${article.summary}</p>
      </div>
    </div>
  `).join('');
}

// ---------- Scroll Effects ----------
function setupScrollEffects() {
  const navbar = document.querySelector('.navbar');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  window.addEventListener('scroll', () => {
    // Navbar shadow
    if (window.scrollY > 10) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Scroll to top button
    if (window.scrollY > 400) {
      scrollTopBtn?.classList.add('visible');
    } else {
      scrollTopBtn?.classList.remove('visible');
    }
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Mobile Menu ----------
function toggleMobileMenu() {
  document.querySelector('.nav-links')?.classList.toggle('mobile-open');
}

// ---------- Budget & Time Range Handlers ----------
function updateBudgetDisplay(value) {
  const el = document.getElementById('budgetValue');
  if (el) el.textContent = value + ' บาท';
}

function updateTimeDisplay(value) {
  const el = document.getElementById('timeValue');
  if (el) el.textContent = value + ' นาที';
}
