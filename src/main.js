// ==========================================================================
// MODERN VILLAGE OS - MAIN CONTROLLER
// Empowering Sustainable Rural Communities through Next-Gen Technology
// ==========================================================================

import confetti from 'canvas-confetti';
import { villageAudio } from './sound.js';
import {
  VILLAGE_ZONES,
  TELEMETRY_NODES,
  INITIAL_GRIEVANCES,
  MANDI_RATES,
  EQUIPMENT_POOL,
  PRODUCTS_CATALOG,
  CITIZEN_PROPOSALS,
  TRANSLATIONS
} from './data.js';

// Application State
const state = {
  activeTab: 'overview',
  theme: localStorage.getItem('mv_theme') || 'dark',
  language: 'en',
  cart: [],
  grievances: [...INITIAL_GRIEVANCES],
  proposals: [...CITIZEN_PROPOSALS],
  selectedZone: 'solar',
  activeGrievanceFilter: 'all',
  activeProductCategory: 'all',
  telemetry: {
    solarKw: 428.4,
    batteryPct: 96.2,
    waterLiters: 142500,
    aqi: 18
  }
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initSchematicMap();
  initEnergyChart();
  initTelemetryTable();
  initCivicDesk();
  initAgriTech();
  initMarketplace();
  initPanchayat();
  initSoundControls();
  initLanguageSwitcher();
  initEmergencyBanner();
});

// ==========================================================================
// THEME & LOCALIZATION
// ==========================================================================

function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcons();

  const themeBtn = document.getElementById('theme-toggle-btn');
  themeBtn.addEventListener('click', () => {
    villageAudio.playClick();
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('mv_theme', state.theme);
    updateThemeIcons();
    initEnergyChart(); // Redraw chart with theme colors
    showToast(`Switched to ${state.theme === 'dark' ? 'Night/Forest' : 'Daylight'} mode`, 'info');
  });
}

function updateThemeIcons() {
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  if (state.theme === 'dark') {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  } else {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  }
}

function initLanguageSwitcher() {
  const langSelect = document.getElementById('language-switcher');
  langSelect.addEventListener('change', (e) => {
    villageAudio.playClick();
    state.language = e.target.value;
    applyTranslations();
    showToast(`Language set to ${langSelect.options[langSelect.selectedIndex].text}`, 'info');
  });
}

function applyTranslations() {
  const dict = TRANSLATIONS[state.language] || TRANSLATIONS.en;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
}

// ==========================================================================
// NAVIGATION CONTROLLER
// ==========================================================================

function initNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      switchTab(target);
    });
  });

  // Brand button returns to overview
  document.getElementById('brand-home-btn').addEventListener('click', () => {
    switchTab('overview');
  });

  // Hero Buttons
  document.getElementById('explore-map-btn')?.addEventListener('click', () => {
    document.getElementById('digital-twin-map')?.scrollIntoView({ behavior: 'smooth' });
    villageAudio.playClick();
  });

  document.getElementById('hero-quick-report-btn')?.addEventListener('click', () => {
    switchTab('civic');
    document.getElementById('open-new-grievance-modal')?.click();
  });

  document.getElementById('open-artisan-market-btn')?.addEventListener('click', () => {
    switchTab('market');
  });

  // Highlight Cards click target
  document.querySelectorAll('.highlight-card').forEach((card) => {
    card.addEventListener('click', () => {
      const target = card.getAttribute('data-tab-target');
      if (target) switchTab(target);
    });
  });
}

export function switchTab(tabId) {
  state.activeTab = tabId;
  villageAudio.playClick();

  // Update nav tabs
  document.querySelectorAll('.nav-tab').forEach((tab) => {
    if (tab.getAttribute('data-tab') === tabId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Update views
  document.querySelectorAll('.view-panel').forEach((panel) => {
    panel.classList.remove('active');
  });

  const activePanel = document.getElementById(`view-${tabId}`);
  if (activePanel) {
    activePanel.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Redraw energy chart if telemetry view
  if (tabId === 'telemetry') {
    setTimeout(initEnergyChart, 100);
  }
}

// ==========================================================================
// DIGITAL TWIN SCHEMATIC MAP & HOTSPOTS
// ==========================================================================

function initSchematicMap() {
  const hotspots = document.querySelectorAll('.map-hotspot');
  hotspots.forEach((spot) => {
    spot.addEventListener('click', () => {
      const zoneKey = spot.getAttribute('data-zone');
      selectZone(zoneKey);
    });
  });

  // Close zone card
  document.getElementById('close-zone-card')?.addEventListener('click', () => {
    document.getElementById('zone-details-card').style.display = 'none';
  });

  // Deep dive button
  document.getElementById('zone-deep-dive-btn')?.addEventListener('click', () => {
    const zone = VILLAGE_ZONES[state.selectedZone];
    if (zone && zone.targetTab) {
      switchTab(zone.targetTab);
    }
  });

  // Render initial zone
  selectZone('solar', false);
}

function selectZone(zoneKey, playAudio = true) {
  state.selectedZone = zoneKey;
  if (playAudio) villageAudio.playClick();

  const zone = VILLAGE_ZONES[zoneKey];
  if (!zone) return;

  const card = document.getElementById('zone-details-card');
  card.style.display = 'block';

  document.getElementById('zone-badge-tag').textContent = zone.badge;
  document.getElementById('zone-card-name').textContent = zone.name;
  document.getElementById('zone-preview-image').src = zone.image;
  document.getElementById('zone-card-description').textContent = zone.desc;

  const statsList = document.getElementById('zone-stats-list');
  statsList.innerHTML = zone.stats
    .map(
      (s) => `
    <div class="stat-row">
      <span>${s.label}</span>
      <strong>${s.value}</strong>
    </div>
  `
    )
    .join('');
}

// ==========================================================================
// TELEMETRY & 24-HOUR ENERGY CANVAS CHART
// ==========================================================================

function initEnergyChart() {
  const canvas = document.getElementById('energyChartCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Handle high-DPI crisp rendering
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = (rect.width || 920) * dpr;
  canvas.height = 260 * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width || 920;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };

  // Data series (24 hours: 00:00 to 23:00)
  const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '23:59'];
  const solarGen = [0, 0, 45, 290, 430, 360, 95, 0, 0];
  const villageDemand = [140, 110, 160, 210, 240, 220, 280, 260, 180];

  const maxVal = 480;

  ctx.clearRect(0, 0, width, height);

  // Draw Horizontal Gridlines
  ctx.strokeStyle = state.theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
  ctx.lineWidth = 1;
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const y = padding.top + ((height - padding.top - padding.bottom) / steps) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    // Y Axis labels
    const val = Math.round(maxVal - (maxVal / steps) * i);
    ctx.fillStyle = state.theme === 'dark' ? '#64748b' : '#94a3b8';
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${val} kW`, padding.left - 8, y + 4);
  }

  // Draw X Axis Time Labels
  const chartWidth = width - padding.left - padding.right;
  hours.forEach((hour, i) => {
    const x = padding.left + (chartWidth / (hours.length - 1)) * i;
    ctx.fillStyle = state.theme === 'dark' ? '#64748b' : '#94a3b8';
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(hour, x, height - 12);
  });

  // 1. Draw Solar Generation Area & Line
  drawSmoothCurve(ctx, solarGen, padding, chartWidth, height - padding.top - padding.bottom, maxVal, {
    strokeColor: '#f59e0b',
    fillGradStart: 'rgba(245, 158, 11, 0.35)',
    fillGradEnd: 'rgba(245, 158, 11, 0.0)'
  });

  // 2. Draw Village Demand Line
  drawSmoothCurve(ctx, villageDemand, padding, chartWidth, height - padding.top - padding.bottom, maxVal, {
    strokeColor: '#38bdf8',
    fillGradStart: 'rgba(56, 189, 248, 0.2)',
    fillGradEnd: 'rgba(56, 189, 248, 0.0)'
  });
}

function drawSmoothCurve(ctx, data, padding, chartWidth, chartHeight, maxVal, style) {
  const points = data.map((val, i) => ({
    x: padding.left + (chartWidth / (data.length - 1)) * i,
    y: padding.top + chartHeight - (val / maxVal) * chartHeight
  }));

  // Path for gradient fill
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  ctx.quadraticCurveTo(
    points[points.length - 1].x,
    points[points.length - 1].y,
    points[points.length - 1].x,
    points[points.length - 1].y
  );

  // Fill Gradient
  const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
  grad.addColorStop(0, style.fillGradStart);
  grad.addColorStop(1, style.fillGradEnd);

  ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
  ctx.lineTo(points[0].x, padding.top + chartHeight);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Stroke Outline
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  ctx.quadraticCurveTo(
    points[points.length - 1].x,
    points[points.length - 1].y,
    points[points.length - 1].x,
    points[points.length - 1].y
  );
  ctx.strokeStyle = style.strokeColor;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw dots
  points.forEach((pt) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function initTelemetryTable() {
  const tbody = document.getElementById('telemetry-node-rows');
  if (!tbody) return;

  tbody.innerHTML = TELEMETRY_NODES.map(
    (node) => `
    <tr>
      <td><code>${node.id}</code></td>
      <td><strong>${node.name}</strong></td>
      <td><span class="badge badge-emerald">${node.subsystem}</span></td>
      <td>${node.param}</td>
      <td><span class="status-badge status-online">● Optimal</span></td>
      <td>${node.signal}</td>
      <td><button class="btn btn-glass btn-sm" onclick="window.pingNode('${node.id}')">Ping</button></td>
    </tr>
  `
  ).join('');

  window.pingNode = (id) => {
    villageAudio.playClick();
    showToast(`Sensor probe ${id} responded with latency 14ms (Health: 100%)`, 'success');
  };

  // Simulate pulse button
  document.getElementById('refresh-telemetry-btn')?.addEventListener('click', () => {
    villageAudio.playClick();
    simulateTelemetryPulse();
  });
}

function simulateTelemetryPulse() {
  // Add realistic micro-variations
  const deltaSolar = (Math.random() * 4 - 2).toFixed(1);
  state.telemetry.solarKw = (parseFloat(state.telemetry.solarKw) + parseFloat(deltaSolar)).toFixed(1);
  document.getElementById('val-solar-kw').innerHTML = `${state.telemetry.solarKw} <small>kW</small>`;

  const now = new Date();
  document.getElementById('last-telemetry-sync').textContent = `Synchronized at ${now.toLocaleTimeString()}`;
  showToast('LoRaWAN field telemetry updated across 64 sensor nodes', 'success');
}

// ==========================================================================
// CIVIC DESK & GRIEVANCES ENGINE
// ==========================================================================

function initCivicDesk() {
  renderGrievances();

  // Filter Pills
  document.querySelectorAll('.filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      villageAudio.playClick();
      document.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeGrievanceFilter = pill.getAttribute('data-filter');
      renderGrievances();
    });
  });

  // Search filter
  document.getElementById('grievance-search-input')?.addEventListener('input', (e) => {
    renderGrievances(e.target.value.toLowerCase());
  });

  // Modal handlers
  const modal = document.getElementById('grievance-modal');
  document.getElementById('open-new-grievance-modal')?.addEventListener('click', () => {
    villageAudio.playClick();
    modal.showModal();
  });

  document.getElementById('close-grievance-modal')?.addEventListener('click', () => {
    modal.close();
  });

  document.getElementById('cancel-grievance-btn')?.addEventListener('click', () => {
    modal.close();
  });

  // Form submission
  document.getElementById('grievance-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newId = `MV-CIVIC-${Math.floor(2050 + Math.random() * 900)}`;
    const category = document.getElementById('grievance-category').value;
    const location = document.getElementById('grievance-location').value;
    const urgency = document.getElementById('grievance-urgency').value;
    const contact = document.getElementById('grievance-contact').value;
    const desc = document.getElementById('grievance-desc').value;

    const newTicket = {
      id: newId,
      category,
      title: `${category} Issue at ${location}`,
      location,
      urgency,
      contact,
      desc,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      assignedTo: 'Municipal Triage AI'
    };

    state.grievances.unshift(newTicket);
    modal.close();
    document.getElementById('grievance-form').reset();

    // Trigger celebration & audio
    villageAudio.playSuccess();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    renderGrievances();
    updateBadgeCounts();
    showToast(`Civic Ticket #${newId} logged successfully. Ward Engineer notified.`, 'success');
  });
}

function renderGrievances(searchQuery = '') {
  const container = document.getElementById('grievances-cards-container');
  if (!container) return;

  const filtered = state.grievances.filter((g) => {
    const matchesFilter =
      state.activeGrievanceFilter === 'all' || g.status === state.activeGrievanceFilter;
    const matchesSearch =
      !searchQuery ||
      g.id.toLowerCase().includes(searchQuery) ||
      g.location.toLowerCase().includes(searchQuery) ||
      g.category.toLowerCase().includes(searchQuery) ||
      g.title.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="glass-panel" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
        <p>No civic tickets match the selected criteria.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map((g) => {
      const step1 = 'filled';
      const step2 = g.status === 'in_progress' || g.status === 'resolved' ? 'filled' : '';
      const step3 = g.status === 'resolved' ? 'filled' : '';

      return `
      <div class="grievance-card glass-panel">
        <div class="ticket-header">
          <span class="ticket-id">${g.id}</span>
          <span class="urgency-badge urgency-${g.urgency}">${g.urgency} Urgency</span>
        </div>
        <div class="ticket-category">${g.category}</div>
        <h4 class="ticket-title">${g.title}</h4>
        <p class="ticket-desc">${g.desc}</p>
        
        <div class="ticket-pipeline">
          <div class="pipe-step ${step1}" title="Submitted & Verified"></div>
          <div class="pipe-step ${step2}" title="Assigned & Dispatched"></div>
          <div class="pipe-step ${step3}" title="Resolution Complete"></div>
        </div>

        <div class="ticket-meta">
          <span>📍 ${g.location}</span>
          <span>👷 ${g.assignedTo}</span>
        </div>
      </div>
    `;
    })
    .join('');
}

function updateBadgeCounts() {
  const openCount = state.grievances.filter((g) => g.status !== 'resolved').length;
  const badge = document.getElementById('open-tickets-badge');
  if (badge) badge.textContent = openCount;
}

// ==========================================================================
// AGRI-TECH CENTER & KISAN PORTAL
// ==========================================================================

function initAgriTech() {
  // Mandi Spot Rates
  const mandiRow = document.getElementById('mandi-rates-row');
  if (mandiRow) {
    mandiRow.innerHTML = MANDI_RATES.map(
      (m) => `
      <div class="mandi-item-card">
        <div class="mandi-crop-name">${m.crop}</div>
        <div class="mandi-price-box">
          <span class="mandi-price">${m.price}</span>
          <span class="mandi-unit">${m.unit}</span>
        </div>
        <div class="mandi-trend ${m.isUp ? 'trend-up' : 'trend-down'}">
          ${m.isUp ? '▲' : '▼'} ${m.trend} • ${m.state}
        </div>
      </div>
    `
    ).join('');
  }

  // Equipment Pool
  const equipList = document.getElementById('equipment-items-list');
  if (equipList) {
    equipList.innerHTML = EQUIPMENT_POOL.map(
      (eq) => `
      <div class="equipment-card">
        <div class="equip-info">
          <h5>${eq.name}</h5>
          <p>Status: <strong class="text-emerald">${eq.status}</strong> (${eq.charge}) • ${eq.operator}</p>
        </div>
        <button class="btn btn-glass btn-sm" onclick="window.bookEquipment('${eq.id}', '${eq.name}')">
          ${eq.action}
        </button>
      </div>
    `
    ).join('');
  }

  window.bookEquipment = (id, name) => {
    villageAudio.playSuccess();
    showToast(`Reservation requested for ${name}. Slot assigned for tomorrow 07:00 AM.`, 'success');
  };
}

// ==========================================================================
// MARKETPLACE & SHOPPING CART
// ==========================================================================

function initMarketplace() {
  renderProducts();

  // Category Filter
  document.querySelectorAll('.cat-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      villageAudio.playClick();
      document.querySelectorAll('.cat-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeProductCategory = pill.getAttribute('data-cat');
      renderProducts();
    });
  });

  // Drawer handlers
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');

  const openDrawer = () => {
    villageAudio.playClick();
    cartDrawer.classList.add('open');
    cartBackdrop.classList.add('open');
  };

  const closeDrawer = () => {
    cartDrawer.classList.remove('open');
    cartBackdrop.classList.remove('open');
  };

  document.getElementById('cart-drawer-trigger')?.addEventListener('click', openDrawer);
  document.getElementById('view-cart-direct-btn')?.addEventListener('click', openDrawer);
  document.getElementById('close-cart-drawer')?.addEventListener('click', closeDrawer);
  cartBackdrop?.addEventListener('click', closeDrawer);

  document.getElementById('shop-now-btn')?.addEventListener('click', () => {
    closeDrawer();
    switchTab('market');
  });

  // Checkout button
  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    closeDrawer();
    villageAudio.playSuccess();
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });

    const successModal = document.getElementById('success-modal');
    successModal.showModal();

    state.cart = [];
    updateCartUI();
  });

  document.getElementById('close-success-modal-btn')?.addEventListener('click', () => {
    document.getElementById('success-modal').close();
  });
}

function renderProducts() {
  const grid = document.getElementById('products-catalog-grid');
  if (!grid) return;

  const filtered = PRODUCTS_CATALOG.filter(
    (p) => state.activeProductCategory === 'all' || p.category === state.activeProductCategory
  );

  grid.innerHTML = filtered
    .map(
      (p) => `
    <div class="product-card glass-panel">
      <div class="product-img-box">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
        <span class="farmer-badge">🌱 ${p.farmer}</span>
      </div>
      <div class="product-info">
        <h4>${p.name}</h4>
        <p>${p.desc}</p>
        <div class="product-footer-row">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          <button class="add-cart-btn" onclick="window.addToCart('${p.id}')">
            <span>+ Add to Basket</span>
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join('');

  window.addToCart = (prodId) => {
    const prod = PRODUCTS_CATALOG.find((p) => p.id === prodId);
    if (!prod) return;

    villageAudio.playClick();
    const existing = state.cart.find((item) => item.id === prodId);
    if (existing) {
      existing.qty++;
    } else {
      state.cart.push({ ...prod, qty: 1 });
    }

    updateCartUI();
    showToast(`Added "${prod.name}" to artisan basket`, 'success');
  };
}

function updateCartUI() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const totalCost = state.cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  // Update badges
  document.getElementById('cart-counter').textContent = totalCount;
  document.getElementById('cart-bubble').textContent = totalCount;
  document.getElementById('cart-item-count-text').textContent = `${totalCount} item${
    totalCount === 1 ? '' : 's'
  }`;
  document.getElementById('cart-total-amount').textContent = `$${totalCost.toFixed(2)}`;

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.disabled = totalCount === 0;
  }

  // Render items in drawer
  const container = document.getElementById('cart-items-list');
  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-state">
        <span class="empty-cart-icon">🛒</span>
        <p>Your basket is currently empty.</p>
        <button class="btn btn-primary btn-sm" id="shop-now-btn" onclick="document.getElementById('close-cart-drawer').click(); window.switchTab('market');">Browse Village Goods</button>
      </div>
    `;
    return;
  }

  container.innerHTML = state.cart
    .map(
      (item) => `
    <div class="cart-item-row">
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
      </div>
      <div class="cart-qty-ctrls">
        <button class="qty-btn" onclick="window.changeCartQty('${item.id}', -1)">-</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="window.changeCartQty('${item.id}', 1)">+</button>
      </div>
    </div>
  `
    )
    .join('');

  window.changeCartQty = (id, delta) => {
    villageAudio.playClick();
    const item = state.cart.find((i) => i.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      state.cart = state.cart.filter((i) => i.id !== id);
    }
    updateCartUI();
  };
}

// ==========================================================================
// E-GRAM PANCHAYAT & CITIZEN PROPOSALS
// ==========================================================================

function initPanchayat() {
  renderProposals();
}

function renderProposals() {
  const container = document.getElementById('proposals-list-container');
  if (!container) return;

  container.innerHTML = state.proposals
    .map((prop) => {
      const totalVotes = prop.yesVotes + prop.noVotes;
      const yesPercent = Math.round((prop.yesVotes / (totalVotes || 1)) * 100);

      return `
      <div class="proposal-card glass-panel" id="proposal-${prop.id}">
        <div class="prop-header">
          <div>
            <span class="prop-id-tag">${prop.id}</span>
            <h4 class="prop-title">${prop.title}</h4>
            <span class="text-sm text-dim">Sponsor: ${prop.sponsor} • Est. Budget: ${prop.budget}</span>
          </div>
          <span class="badge badge-gold">Voting Closes in ${prop.daysLeft} Days</span>
        </div>

        <p class="prop-desc">${prop.desc}</p>

        <div class="voting-progress-wrap">
          <div class="voting-bar-track">
            <div class="voting-bar-fill" style="width: ${yesPercent}%;"></div>
          </div>
          <div class="voting-stats-row">
            <span class="text-emerald">Yes: ${prop.yesVotes} votes (${yesPercent}%)</span>
            <span class="text-rose">No: ${prop.noVotes} votes (${100 - yesPercent}%)</span>
            <span class="text-dim">Quorum: ${totalVotes} / ${prop.totalQuorum}</span>
          </div>
        </div>

        <div class="voting-actions-row">
          ${
            prop.hasVoted
              ? `<span class="badge badge-emerald">✓ Your Citizen Ballot Recorded</span>`
              : `
              <span>Cast your democratic vote as an authenticated resident:</span>
              <div class="vote-btns-group">
                <button class="vote-btn-yes" onclick="window.castVote('${prop.id}', true)">
                  <span>👍 Vote YES</span>
                </button>
                <button class="vote-btn-no" onclick="window.castVote('${prop.id}', false)">
                  <span>👎 Vote NO</span>
                </button>
              </div>
            `
          }
        </div>
      </div>
    `;
    })
    .join('');

  window.castVote = (id, isYes) => {
    const prop = state.proposals.find((p) => p.id === id);
    if (!prop || prop.hasVoted) return;

    if (isYes) prop.yesVotes++;
    else prop.noVotes++;
    prop.hasVoted = true;

    villageAudio.playSuccess();
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });

    renderProposals();
    showToast(`Ballot cast on ${prop.id}. Decentralized ledger signed.`, 'success');
  };
}

// ==========================================================================
// SOUND ENGINE & AUDIO VISUALIZER
// ==========================================================================

function initSoundControls() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  const iconOff = document.getElementById('sound-icon-off');
  const iconOn = document.getElementById('sound-icon-on');
  const indicator = document.getElementById('ambient-indicator');

  soundBtn.addEventListener('click', () => {
    const isPlaying = villageAudio.toggleAmbience();
    if (isPlaying) {
      iconOff.classList.add('hidden');
      iconOn.classList.remove('hidden');
      indicator.classList.remove('hidden');
      showToast('Serene village eco-soundscape active (gentle breeze & birdsong)', 'info');
    } else {
      iconOff.classList.remove('hidden');
      iconOn.classList.add('hidden');
      indicator.classList.add('hidden');
      showToast('Soundscape paused', 'info');
    }
  });

  // Emergency SOS Broadcast desk
  document.getElementById('emergency-alert-btn')?.addEventListener('click', () => {
    villageAudio.playAlertPing();
    const banner = document.getElementById('emergency-banner');
    banner.classList.remove('hidden');
    banner.scrollIntoView({ behavior: 'smooth' });
    showToast('Village Emergency Broadcast Desk Alert Triggered', 'alert');
  });
}

function initEmergencyBanner() {
  document.getElementById('close-banner-btn')?.addEventListener('click', () => {
    villageAudio.playClick();
    document.getElementById('emergency-banner').classList.add('hidden');
  });
}

// ==========================================================================
// ACCESSIBLE TOAST NOTIFICATIONS
// ==========================================================================

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✓' : type === 'alert' ? '⚠️' : 'ℹ';
  toast.innerHTML = `
    <span style="font-weight: 800;">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3800);
}

// Attach switchTab globally for inline onclick handlers
window.switchTab = switchTab;
