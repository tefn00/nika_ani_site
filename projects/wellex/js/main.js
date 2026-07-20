// ─── WELLEX WEBSITE JAVASCRIPT v2.0 ────────────────────────────

// Cart state
let cart = JSON.parse(localStorage.getItem('wellec-cart')) || [];
const selectionStorageKey = 'wellex-current-selection';
const languageStorageKey = 'wellex-site-language';
const translationCacheStorageKey = 'wellex-translation-cache-v1';
const supportedLanguages = ['en', 'es', 'ru'];
const languageNames = { en: 'EN', es: 'ES', ru: 'RU' };
const uiCopy = {
  en: {
    overview: 'Overview',
    foundation: 'Foundation',
    app: 'App',
    market: 'Market',
    colors: 'Colors',
    social: 'Social',
    cart: 'Cart',
    openCart: 'Open cart',
    getWellex: 'Get Wellex',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    wellexHome: 'Wellex home',
    oneTime: 'One-Time',
    subscription: 'Subscription',
    noWatchSelected: 'No watch selected',
    currentSelection: 'Current selection',
    pickColorPreview: 'Pick a color to see your watch here.',
    inCart: 'In cart',
    viewCart: 'View cart',
    emptyCart: 'Your cart is still empty.',
    languageSwitcher: 'Language switcher'
  },
  es: {
    overview: 'Resumen',
    foundation: 'Fundacion',
    app: 'Aplicacion',
    market: 'Mercado',
    colors: 'Colores',
    social: 'Social',
    cart: 'Carrito',
    openCart: 'Abrir carrito',
    getWellex: 'Comprar Wellex',
    openMenu: 'Abrir menu',
    closeMenu: 'Cerrar menu',
    wellexHome: 'Inicio de Wellex',
    oneTime: 'Pago unico',
    subscription: 'Suscripcion',
    noWatchSelected: 'No hay reloj seleccionado',
    currentSelection: 'Seleccion actual',
    pickColorPreview: 'Elige un color para ver tu reloj aqui.',
    inCart: 'En el carrito',
    viewCart: 'Ver carrito',
    emptyCart: 'Tu carrito sigue vacio.',
    languageSwitcher: 'Selector de idioma'
  },
  ru: {
    overview: 'Obzor',
    foundation: 'Osnova',
    app: 'Prilozhenie',
    market: 'Market',
    colors: 'Tsveta',
    social: 'Sotsial',
    cart: 'Korzina',
    openCart: 'Otkryt korzinu',
    getWellex: 'Kupit Wellex',
    openMenu: 'Otkryt menu',
    closeMenu: 'Zakryt menu',
    wellexHome: 'Glavnaya Wellex',
    oneTime: 'Razovaya pokupka',
    subscription: 'Podpiska',
    noWatchSelected: 'Chasy ne vybrany',
    currentSelection: 'Tekushchiy vybor',
    pickColorPreview: 'Vyberite tsvet, chtoby uvidet svoi chasy.',
    inCart: 'V korzine',
    viewCart: 'Otkryt korzinu',
    emptyCart: 'Vasha korzina poka pusta.',
    languageSwitcher: 'Pereklyuchatel yazyka'
  }
};
const originalTextNodes = new WeakMap();
const originalAttributeValues = new WeakMap();
let translationObserver = null;
let translationDebounceTimer = null;
let isApplyingLanguage = false;

function getCurrentLanguage() {
  const saved = localStorage.getItem(languageStorageKey);
  return supportedLanguages.includes(saved) ? saved : 'en';
}

function getUiCopy(key, lang = getCurrentLanguage()) {
  return uiCopy[lang]?.[key] || uiCopy.en[key] || '';
}

function setCurrentLanguage(lang) {
  const nextLang = supportedLanguages.includes(lang) ? lang : 'en';
  localStorage.setItem(languageStorageKey, nextLang);
  document.documentElement.lang = nextLang;
  return nextLang;
}

function getTranslationCache() {
  try {
    return JSON.parse(localStorage.getItem(translationCacheStorageKey) || '{}');
  } catch (error) {
    return {};
  }
}

function setTranslationCache(cache) {
  try {
    localStorage.setItem(translationCacheStorageKey, JSON.stringify(cache));
  } catch (error) {
    // Ignore cache persistence failures.
  }
}

function getLocalizedSelectionLabel(selection, selectionProduct, lang = getCurrentLanguage()) {
  if (!selectionProduct) return getUiCopy('noWatchSelected', lang);
  return `${selectionProduct.name}${selection.plan === 'one-time' ? ` · ${getUiCopy('oneTime', lang)}` : ` · ${getUiCopy('subscription', lang)}`}`;
}

function createLanguageSwitcherMarkup(currentLanguage) {
  const buttons = supportedLanguages.map((lang) => `
    <button
      class="nav-language-button${lang === currentLanguage ? ' is-active' : ''}"
      type="button"
      data-language-option="${lang}"
      data-no-translate
      aria-pressed="${lang === currentLanguage ? 'true' : 'false'}"
      aria-label="${languageNames[lang]}"
    >${languageNames[lang]}</button>
  `).join('');

  return `
    <div class="nav-language-switcher" data-no-translate aria-label="${getUiCopy('languageSwitcher', currentLanguage)}">
      ${buttons}
    </div>
  `;
}

function shouldTranslateText(text) {
  const value = (text || '').trim();
  if (!value) return false;
  if (!/[A-Za-z]/.test(value)) return false;
  if (/^(https?:\/\/|www\.|#|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i.test(value)) return false;
  if (/^[\d\s.,/%:+-]+$/.test(value)) return false;
  return true;
}

function collectTranslatableItems(root = document.body) {
  const items = [];
  if (!root) return items;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.parentElement) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (parent.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
      if (parent.closest('script, style, noscript, svg, canvas')) return NodeFilter.FILTER_REJECT;
      const source = originalTextNodes.get(node) || node.textContent;
      if (!shouldTranslateText(source)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!originalTextNodes.has(node)) originalTextNodes.set(node, node.textContent);
    items.push({ type: 'text', node, source: originalTextNodes.get(node) });
  }

  const elements = root.matches?.('*') ? [root, ...root.querySelectorAll('*')] : [...root.querySelectorAll('*')];
  elements.forEach((element) => {
    if (element.closest('[data-no-translate]')) return;
    ['placeholder', 'title', 'aria-label'].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!shouldTranslateText(value)) return;
      const stored = originalAttributeValues.get(element) || {};
      if (!stored[attribute]) {
        stored[attribute] = value;
        originalAttributeValues.set(element, stored);
      }
      items.push({ type: 'attribute', element, attribute, source: stored[attribute] });
    });
  });

  return items;
}

function restoreOriginalLanguage() {
  collectTranslatableItems(document.body).forEach((item) => {
    if (item.type === 'text') item.node.textContent = item.source;
    if (item.type === 'attribute') item.element.setAttribute(item.attribute, item.source);
  });

  if (!document.documentElement.dataset.originalTitle) {
    document.documentElement.dataset.originalTitle = document.title;
  }
  document.title = document.documentElement.dataset.originalTitle;
}

async function fetchTranslatedBatch(strings, targetLanguage) {
  const joined = strings.map((text, index) => `__WELLEX_SEGMENT_${index}__\n${text}`).join('\n');
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(joined)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Translation request failed with ${response.status}`);
  const data = await response.json();
  const translatedText = Array.isArray(data?.[0]) ? data[0].map((part) => part[0]).join('') : joined;
  const matches = [...translatedText.matchAll(/__WELLEX_SEGMENT_(\d+)__\s*/g)];
  const parsed = {};

  if (!matches.length) {
    strings.forEach((value, index) => {
      parsed[index] = value;
    });
    return parsed;
  }

  matches.forEach((match, index) => {
    const segmentIndex = Number(match[1]);
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : translatedText.length;
    parsed[segmentIndex] = translatedText.slice(start, end).trim();
  });

  return parsed;
}

async function translateStrings(strings, targetLanguage) {
  if (targetLanguage === 'en') {
    return strings.reduce((results, value) => {
      results[value] = value;
      return results;
    }, {});
  }

  const cache = getTranslationCache();
  cache[targetLanguage] = cache[targetLanguage] || {};
  const results = {};
  const missing = [];

  strings.forEach((value) => {
    if (cache[targetLanguage][value]) results[value] = cache[targetLanguage][value];
    else missing.push(value);
  });

  const batchSize = 12;
  for (let index = 0; index < missing.length; index += batchSize) {
    const batch = missing.slice(index, index + batchSize);
    const translatedBatch = await fetchTranslatedBatch(batch, targetLanguage);
    batch.forEach((source, batchIndex) => {
      const translated = translatedBatch[batchIndex] || source;
      cache[targetLanguage][source] = translated;
      results[source] = translated;
    });
  }

  setTranslationCache(cache);
  return results;
}

async function applyLanguageToPage(lang = getCurrentLanguage()) {
  const activeLanguage = setCurrentLanguage(lang);
  if (!document.documentElement.dataset.originalTitle) {
    document.documentElement.dataset.originalTitle = document.title;
  }

  if (activeLanguage === 'en') {
    restoreOriginalLanguage();
    return;
  }

  const items = collectTranslatableItems(document.body);
  const uniqueSources = [...new Set(items.map((item) => item.source))];
  if (!uniqueSources.length) return;

  isApplyingLanguage = true;
  try {
    const translations = await translateStrings(uniqueSources, activeLanguage);
    items.forEach((item) => {
      const translated = translations[item.source] || item.source;
      if (item.type === 'text') item.node.textContent = translated;
      if (item.type === 'attribute') item.element.setAttribute(item.attribute, translated);
    });

    const titleTranslations = await translateStrings([document.documentElement.dataset.originalTitle], activeLanguage);
    document.title = titleTranslations[document.documentElement.dataset.originalTitle] || document.documentElement.dataset.originalTitle;
  } catch (error) {
    console.error('Wellex translation failed:', error);
  } finally {
    isApplyingLanguage = false;
  }
}

function scheduleLanguageRefresh() {
  if (translationDebounceTimer) window.clearTimeout(translationDebounceTimer);
  translationDebounceTimer = window.setTimeout(() => {
    applyLanguageToPage(getCurrentLanguage());
  }, 120);
}

function initLanguageObserver() {
  if (translationObserver || !document.body) return;
  translationObserver = new MutationObserver(() => {
    if (isApplyingLanguage || getCurrentLanguage() === 'en') return;
    scheduleLanguageRefresh();
  });
  translationObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
}

function setLanguageButtonsState(language, isTranslating = false) {
  document.querySelectorAll('[data-language-option]').forEach((button) => {
    const isActive = button.dataset.languageOption === language;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.disabled = isTranslating;
  });
}

async function changeSiteLanguage(nextLanguage) {
  const language = setCurrentLanguage(nextLanguage);
  renderSharedHeader();
  updateCartBadge();
  setLanguageButtonsState(language, true);
  await applyLanguageToPage(language);
  setLanguageButtonsState(language, false);
}

const products = {
  'classic-black': { name: 'Classic Black', bandColor: '#0D0D0D', bandLight: false, price: 279, subPrice: 179, image: 'assets/classic-black.png' },
  'midnight-navy': { name: 'Midnight Navy', bandColor: '#1B2A4A', bandLight: false, price: 279, subPrice: 179, image: 'assets/navy.png' },
  'forest-green':  { name: 'Forest Green',  bandColor: '#1A3D2B', bandLight: false, price: 279, subPrice: 179, image: 'assets/forest-green.png' },
  'crimson-red':   { name: 'Crimson Red',   bandColor: '#7A1515', bandLight: false, price: 279, subPrice: 179, image: 'assets/orange.jpeg' },
};

function renderSharedHeader() {
  const mount = document.querySelector('[data-shared-header]');
  if (!mount) return;

  const activePage = mount.dataset.activePage || 'overview';
  const currentLanguage = getCurrentLanguage();
  const links = [
    { id: 'overview', href: 'index.html', label: getUiCopy('overview', currentLanguage) },
    { id: 'foundation', href: 'foundation.html', label: getUiCopy('foundation', currentLanguage) },
    { id: 'app', href: 'app.html', label: getUiCopy('app', currentLanguage) },
    { id: 'market', href: 'market.html', label: getUiCopy('market', currentLanguage) },
    { id: 'colors', href: 'shop.html', label: getUiCopy('colors', currentLanguage) },
    { id: 'social', href: 'social.html', label: getUiCopy('social', currentLanguage) },
  ];

  const navLinks = links.map((link) => {
    const activeClass = link.id === activePage ? ' class="active"' : '';
    return `<a href="${link.href}"${activeClass}>${link.label}</a>`;
  }).join('');

  const accountHref = 'index.html#join';
  const accountMarkup = getUiCopy('getWellex', currentLanguage);
  const accountClass = 'nav-account';
  const selection = getCurrentSelection();
  const selectionProduct = selection ? products[selection.id] : null;
  const selectionLabel = selectionProduct
    ? `${selectionProduct.name}${selection.plan === 'one-time' ? ' · One-Time' : ' · Subscription'}`
    : 'No watch selected';
  const localizedSelectionLabel = getLocalizedSelectionLabel(selection, selectionProduct, currentLanguage);
  const previewMarkup = getHeaderCartPreviewMarkup(selection);
  const languageSwitcher = createLanguageSwitcherMarkup(currentLanguage);

  mount.innerHTML = `
    <nav class="dashboard-nav">
      <a class="nav-logo nav-logo-media" href="index.html" aria-label="${getUiCopy('wellexHome', currentLanguage)}">
        <span class="nav-logo-mark" aria-hidden="true">
          <img src="assets/wellex-logo-mark.svg" alt="">
        </span>
        <span class="nav-logo-word">WELLEX</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="${getUiCopy('openMenu', currentLanguage)}">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div class="nav-links" id="nav-menu">
        ${navLinks}
        <div class="nav-cart-wrap">
          <a href="cart.html" class="nav-cart-link" aria-label="${getUiCopy('openCart', currentLanguage)}">
            <span class="nav-cart-icon" aria-hidden="true">${getUiCopy('cart', currentLanguage)}</span>
            <span class="nav-cart-copy">
              <strong>${getUiCopy('cart', currentLanguage)}</strong>
              <small class="nav-cart-selection">${localizedSelectionLabel}</small>
            </span>
            <span class="cart-badge" style="display:none">0</span>
          </a>
          <div class="nav-cart-preview">${previewMarkup}</div>
        </div>
        ${languageSwitcher}
        <a href="${accountHref}" class="${accountClass}">🛒 ${accountMarkup}</a>
      </div>
    </nav>`;

  const navCartIcon = mount.querySelector('.nav-cart-icon');
  if (navCartIcon) {
    navCartIcon.innerHTML = '&#128722;';
  }

  const navAccount = mount.querySelector('.nav-account');
  if (navAccount) {
    navAccount.textContent = accountMarkup;
  }

  const nav = mount.querySelector('.dashboard-nav');
  const navToggle = mount.querySelector('.nav-toggle');
  const navMenuLinks = [...mount.querySelectorAll('.nav-links a')];
  const languageButtons = [...mount.querySelectorAll('[data-language-option]')];

  if (nav && navToggle) {
    const setMenuState = (isOpen) => {
      nav.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? getUiCopy('closeMenu', currentLanguage) : getUiCopy('openMenu', currentLanguage));
      document.body.classList.toggle('nav-open', isOpen);
    };

    navToggle.addEventListener('click', () => {
      setMenuState(!nav.classList.contains('is-open'));
    });

    navMenuLinks.forEach((link) => {
      link.addEventListener('click', () => setMenuState(false));
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1180 && nav.classList.contains('is-open')) {
        setMenuState(false);
      }
    });

    document.addEventListener('click', (event) => {
      if (window.innerWidth > 1180 || !nav.classList.contains('is-open')) return;
      if (nav.contains(event.target)) return;
      setMenuState(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenuState(false);
      }
    });
  }

  languageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextLanguage = button.dataset.languageOption;
      if (!supportedLanguages.includes(nextLanguage) || nextLanguage === getCurrentLanguage()) return;
      changeSiteLanguage(nextLanguage);
    });
  });
}

function renderSharedFooter() {
  const mount = document.querySelector('[data-shared-footer]');
  if (!mount) return;

  mount.innerHTML = `
    <div class="footer-inner">
      <div class="footer-top">
        <div>
          <div class="footer-brand-logo">wellex</div>
          <p class="footer-brand-text">Wellex turns daily health data into clear action.</p>
        </div>
        <div>
          <div class="footer-col-title">Support</div>
          <div class="footer-col-links">
            <a href="#">Member Support</a>
            <a href="#">Order Status</a>
            <a href="#">Rejoin Wellex</a>
            <a href="#">Member Login</a>
            <a href="#">Wellex Labs</a>
            <a href="#">Wellex Community</a>
          </div>
        </div>
        <div>
          <div class="footer-col-title">Company</div>
          <div class="footer-col-links">
            <a href="#">Support</a>
            <a href="#">Developers</a>
            <a href="#">Engineering</a>
            <a href="#">Careers</a>
            <a href="#">Our Mission</a>
          </div>
        </div>
        <div>
          <div class="footer-col-title">Legal</div>
          <div class="footer-col-links">
            <a href="#">Terms of Use</a>
            <a href="#">Terms of Sale</a>
            <a href="#">Privacy</a>
            <a href="#">Security</a>
            <a href="#">Patent</a>
          </div>
        </div>
        <div>
          <div class="footer-col-title">Partner</div>
          <div class="footer-col-links">
            <a href="#">Become an Affiliate</a>
            <a href="#">Developers</a>
            <a href="product.html?color=classic-black">Get Wellex</a>
            <a href="#">Refer a Friend</a>
            <a href="#">Gift Wellex</a>
            <a href="#">Corporate Gifting</a>
            <a href="shop.html">Accessories</a>
            <a href="index.html#join">Hero Discounts</a>
          </div>
        </div>
        <div>
          <div class="footer-col-title">The Locker</div>
          <div class="footer-col-links">
            <a href="#">The Locker</a>
            <a href="#">Press Center</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>Our mission is simple: clearer health, better daily choices.</span>
        <span>© 2026 Wellex</span>
      </div>
    </div>`;
}

function renderSharedFitFinder() {
  if (document.getElementById('fit-finder-modal')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div class="fit-finder-modal" id="fit-finder-modal" aria-hidden="true">
      <div class="fit-finder-backdrop" data-fit-close></div>
      <div class="fit-finder-dialog">
        <button class="fit-finder-close" type="button" aria-label="Close fit finder" data-fit-close>x</button>
        <div class="fit-finder-hero">
          <div class="fit-kicker">5-Second Fit Finder</div>
          <h2 id="fit-title">Pick your energy. We will match your watch.</h2>
          <p id="fit-subtitle">
            Four quick picks. No boring form. Just enough personality data to tell you which Wellex color actually feels like you.
          </p>
          <div class="fit-meta-row">
            <div class="fit-chip" id="fit-target-chip">Focus: Open match</div>
            <div class="fit-chip">4 quick rounds</div>
            <div class="fit-chip">Instant result</div>
          </div>
          <button class="fit-skip-btn" type="button" id="fit-skip-btn" aria-label="Skip questions and show colors"><span class="fit-skip-btn-label">Skip</span></button>
          <div class="fit-progress">
            <span class="fit-progress-bar" id="fit-progress-bar"></span>
          </div>
        </div>
        <div class="fit-question-stage" id="fit-question-stage">
          <div class="fit-question-step" id="fit-question-step">Round 1 / 4</div>
          <h3 class="fit-question-title" id="fit-question-title"></h3>
          <div class="fit-options" id="fit-options"></div>
        </div>
        <div class="fit-result hidden" id="fit-result">
          <div class="fit-result-glow" id="fit-result-glow"></div>
          <div class="fit-result-label">Your Match</div>
          <h3 class="fit-result-title" id="fit-result-title"></h3>
          <p class="fit-result-copy" id="fit-result-copy"></p>
          <div class="fit-result-reason" id="fit-result-reason"></div>
          <div class="fit-result-actions">
            <a class="btn-primary" id="fit-result-link" href="product.html?color=classic-black">See My Watch</a>
            <button class="btn-outline" type="button" id="fit-restart-btn">Try Again</button>
          </div>
        </div>
      </div>
    </div>`);
}

// ─── WATCH SVG GENERATOR ────────────────────────────────────────
function generateWatchSVG(bandColor, size = 'medium', isLight = false) {
  const sizes = {
    small:  { w: 80,  h: 190, vb: '0 0 140 320' },
    medium: { w: 140, h: 330, vb: '0 0 140 320' },
    large:  { w: 200, h: 475, vb: '0 0 140 320' },
    xlarge: { w: 260, h: 618, vb: '0 0 140 320' },
  };
  const s = sizes[size] || sizes.medium;
  const bc = bandColor;
  const ribColor = isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.07)';
  const ribDark  = isLight ? 'rgba(0,0,0,0.05)'  : 'rgba(255,255,255,0.04)';
  const edgeColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
  const uid = bandColor.replace('#','') + '_' + size;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="${s.vb}" width="${s.w}" height="${s.h}">
    <defs>
      <linearGradient id="modG_${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2A2A2A"/>
        <stop offset="50%" stop-color="#1C1C1C"/>
        <stop offset="100%" stop-color="#141414"/>
      </linearGradient>
      <linearGradient id="bandG_${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${lightenColor(bc, isLight ? -10 : 20)}"/>
        <stop offset="100%" stop-color="${bc}"/>
      </linearGradient>
      <filter id="shad_${uid}">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.6)"/>
      </filter>
    </defs>

    <!-- Band Top Clasp -->
    <rect x="52" y="2" width="36" height="18" rx="9" fill="${bc}" opacity="0.7"/>

    <!-- Band Top Body -->
    <rect x="33" y="18" width="74" height="92" rx="8" fill="url(#bandG_${uid})"/>
    ${[28,38,48,58,68,78,88,98].map(y =>
      `<line x1="35" y1="${y}" x2="105" y2="${y}" stroke="${ribColor}" stroke-width="1.5"/>`
    ).join('')}
    <rect x="33" y="18" width="74" height="92" rx="8" fill="none" stroke="${edgeColor}" stroke-width="1"/>

    <!-- Module (main body) -->
    <rect x="17" y="108" width="106" height="106" rx="16" fill="url(#modG_${uid})" filter="url(#shad_${uid})"/>
    ${generateCarbonFiber(uid)}
    <rect x="17" y="108" width="106" height="106" rx="16" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>
    <rect x="22" y="113" width="96" height="96" rx="13" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    <rect x="17" y="108" width="106" height="3" rx="2" fill="rgba(255,255,255,0.08)"/>

    <!-- W Logo emboss shadow -->
    <text x="70" y="168" text-anchor="middle" dominant-baseline="middle"
          fill="rgba(255,255,255,0.10)" font-size="36" font-weight="900"
          font-family="'Inter','Arial Black',sans-serif" letter-spacing="-2"
          dy="2" dx="2">W</text>
    <!-- W Logo main -->
    <text x="70" y="168" text-anchor="middle" dominant-baseline="middle"
          fill="rgba(255,255,255,0.88)" font-size="36" font-weight="900"
          font-family="'Inter','Arial Black',sans-serif" letter-spacing="-2">W</text>

    <!-- Sensor bumps -->
    <circle cx="50" cy="202" r="3.5" fill="#0A0A0A" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
    <circle cx="70" cy="202" r="3.5" fill="#0A0A0A" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
    <circle cx="90" cy="202" r="3.5" fill="#0A0A0A" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>

    <!-- Band Bottom Body -->
    <rect x="33" y="214" width="74" height="92" rx="8" fill="url(#bandG_${uid})"/>
    ${[224,234,244,254,264,274,284,294].map(y =>
      `<line x1="35" y1="${y}" x2="105" y2="${y}" stroke="${ribColor}" stroke-width="1.5"/>`
    ).join('')}
    <rect x="33" y="214" width="74" height="92" rx="8" fill="none" stroke="${edgeColor}" stroke-width="1"/>

    <!-- Band Bottom Clasp -->
    <rect x="52" y="304" width="36" height="18" rx="9" fill="${bc}" opacity="0.7"/>
    <circle cx="70" cy="313" r="4" fill="#0A0A0A" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
  </svg>`;
}

function generateCarbonFiber(uid) {
  let p = '';
  for(let row = 0; row < 8; row++) {
    for(let col = 0; col < 7; col++) {
      const x = 22 + col * 15;
      const y = 114 + row * 13;
      const offset = row % 2 === 0 ? 0 : 7;
      p += `<rect x="${x+offset}" y="${y}" width="7" height="6" rx="1" fill="rgba(255,255,255,0.025)"/>`;
    }
  }
  return p;
}

function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return '#' + ((r << 16)|(g << 8)|b).toString(16).padStart(6,'0');
}

function getCurrentSelection() {
  try {
    const raw = localStorage.getItem(selectionStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !products[parsed.id]) return null;
    return {
      id: parsed.id,
      plan: parsed.plan === 'one-time' ? 'one-time' : 'subscription'
    };
  } catch (error) {
    return null;
  }
}

function setCurrentSelection(productId, planType = 'subscription') {
  if (!products[productId]) return;
  localStorage.setItem(selectionStorageKey, JSON.stringify({
    id: productId,
    plan: planType === 'one-time' ? 'one-time' : 'subscription'
  }));
  updateHeaderCartState();
}

function getHeaderCartPreviewMarkup(selection = getCurrentSelection()) {
  const currentLanguage = getCurrentLanguage();
  const selectedProduct = selection ? products[selection.id] : null;
  const selectedLine = selectedProduct
    ? `
      <div class="nav-cart-preview-current">
        <div class="nav-cart-preview-kicker">${getUiCopy('currentSelection', currentLanguage)}</div>
        <div class="nav-cart-preview-item">
          <img src="${selectedProduct.image}" alt="${selectedProduct.name} watch"/>
          <div>
            <strong>${selectedProduct.name}</strong>
            <small>${selection.plan === 'one-time' ? `${getUiCopy('oneTime', currentLanguage)} · $${selectedProduct.price}` : `${getUiCopy('subscription', currentLanguage)} · $${selectedProduct.subPrice}/mo`}</small>
          </div>
        </div>
      </div>`
    : `
      <div class="nav-cart-preview-empty">
        ${getUiCopy('pickColorPreview', currentLanguage)}
      </div>`;

  const cartItems = cart.slice(0, 3).map((item) => `
    <div class="nav-cart-preview-row">
      <span>${item.name}</span>
      <small>${item.qty}x</small>
    </div>`).join('');

  const cartSection = cart.length
    ? `
      <div class="nav-cart-preview-list">
        <div class="nav-cart-preview-kicker">${getUiCopy('inCart', currentLanguage)}</div>
        ${cartItems}
        <a class="nav-cart-preview-link" href="cart.html">${getUiCopy('viewCart', currentLanguage)}</a>
      </div>`
    : `
      <div class="nav-cart-preview-list nav-cart-preview-list-empty">
        <div class="nav-cart-preview-kicker">${getUiCopy('inCart', currentLanguage)}</div>
        <div class="nav-cart-preview-empty">${getUiCopy('emptyCart', currentLanguage)}</div>
      </div>`;

  return `${selectedLine}${cartSection}`;
}

// ─── CART FUNCTIONS ──────────────────────────────────────────────
function addToCart(productId, planType = 'subscription', overridePrice = null, discountPercent = 0) {
  const product = products[productId];
  if (!product) return;
  setCurrentSelection(productId, planType);
  const existing = cart.find(i => i.id === productId && i.plan === planType);
  if (existing) { existing.qty++; }
  else {
    const basePrice = planType === 'subscription' ? product.subPrice : product.price;
    cart.push({
      id: productId,
      name: product.name,
      bandColor: product.bandColor,
      bandLight: product.bandLight,
      price: overridePrice ?? basePrice,
      originalPrice: basePrice,
      discountPercent,
      plan: planType,
      qty: 1
    });
  }
  saveCart(); updateCartBadge();
  showToast(`${product.name} added to cart! 🎉`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart(); updateCartBadge();
  if (document.querySelector('.cart-items-section')) renderCart();
}

function updateQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) removeFromCart(index);
  else { saveCart(); if (document.querySelector('.cart-items-section')) renderCart(); }
}

function saveCart() { localStorage.setItem('wellec-cart', JSON.stringify(cart)); }
function getCartTotal() { return cart.reduce((sum,i) => sum + i.price * i.qty, 0); }
function getCartCount() { return cart.reduce((sum,i) => sum + i.qty, 0); }

function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (badge) { const c = getCartCount(); badge.textContent = c; badge.style.display = c > 0 ? 'flex' : 'none'; }
  updateHeaderCartState();
}

function updateHeaderCartState() {
  const selection = getCurrentSelection();
  const selectionProduct = selection ? products[selection.id] : null;
  const selectionEl = document.querySelector('.nav-cart-selection');
  if (selectionEl) {
    selectionEl.textContent = getLocalizedSelectionLabel(selection, selectionProduct);
  }

  const preview = document.querySelector('.nav-cart-preview');
  if (preview) preview.innerHTML = getHeaderCartPreviewMarkup(selection);
}

// ─── RENDER CART PAGE ────────────────────────────────────────────
function renderCart() {
  const itemsSection = document.querySelector('.cart-items-section');
  const summarySection = document.querySelector('.cart-summary');
  if (!itemsSection) return;

  const itemsHTML = cart.length === 0
    ? `<div style="text-align:center;padding:60px 20px;color:var(--gray)">
        <div style="font-size:3rem;margin-bottom:16px">🛍️</div>
        <p style="font-size:1rem;margin-bottom:24px">Your cart is empty</p>
        <a href="shop.html" class="btn-primary">Shop Now</a>
       </div>`
    : cart.map((item, i) => `
        <div class="cart-item">
          <div class="cart-item-image"><img src="${products[item.id]?.image || ''}" alt="${item.name} watch"/></div>
          <div>
            <div class="cart-item-name">Wellec Band – ${item.name}</div>
            <div class="cart-item-variant">${item.plan === 'subscription'
              ? '📦 Monthly Subscription — $19/mo · Band included FREE'
              : '🔁 One-Time Purchase — Band Only · $249'}</div>
            <div class="cart-quantity">
              <button class="qty-btn" onclick="updateQty(${i},-1)">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" onclick="updateQty(${i},1)">+</button>
            </div>
          </div>
          <div class="cart-item-price">
            <div class="cart-item-price-main">$${(item.price * item.qty).toFixed(2)}<span style="font-size:0.7rem;font-weight:400;color:var(--light-gray)">${item.plan==='subscription'?'/mo':''}</span></div>
            <button class="cart-item-remove" onclick="removeFromCart(${i})">Remove</button>
          </div>
        </div>`).join('');

  itemsSection.innerHTML = `
    <div class="cart-page-title">Your Cart</div>
    <div class="cart-count">${getCartCount()} item${getCartCount()!==1?'s':''}</div>
    ${itemsHTML}`;

  const subtotal = getCartTotal();
  if (summarySection) {
    summarySection.querySelector('.summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    summarySection.querySelector('.summary-shipping').textContent = subtotal > 0 ? 'FREE' : '$0.00';
    summarySection.querySelector('.summary-total-val').textContent = `$${subtotal.toFixed(2)}`;
  }
}

// ─── RENDER CHECKOUT ITEMS ───────────────────────────────────────
function renderCheckoutItems() {
  const container = document.querySelector('.checkout-items-list');
  if (!container) return;
  const subtotal = getCartTotal();
  container.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <div class="checkout-item-img"><img src="${products[item.id]?.image || ''}" alt="${item.name} watch"/></div>
      <div>
        <div class="checkout-item-name">Wellec Band – ${item.name}</div>
        <div class="checkout-item-variant">Qty: ${item.qty} · ${item.plan==='subscription'?'$19/mo Subscription':'$249 One-Time'}</div>
      </div>
      <div class="checkout-item-price">$${(item.price*item.qty).toFixed(2)}</div>
    </div>`).join('');
  document.querySelectorAll('.checkout-subtotal').forEach(el => el.textContent=`$${subtotal.toFixed(2)}`);
  document.querySelectorAll('.checkout-total').forEach(el => el.textContent=`$${subtotal.toFixed(2)}`);
}

// ─── TOAST ───────────────────────────────────────────────────────
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">✅</span><span class="toast-text"></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-text').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ─── COLOR SWITCHER (product.html) ──────────────────────────────
function initColorSwitcher() {
  const options = document.querySelectorAll('.color-option');
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      updateDisplay(opt.dataset.product);
    });
  });
}

function updateDisplay(pid) {
  const p = products[pid];
  if (!p) return;
  const display = document.getElementById('main-watch-display');
  if (display) {
    display.style.opacity = '0'; display.style.transform = 'scale(0.95)';
    display.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      display.innerHTML = generateWatchSVG(p.bandColor, 'xlarge', p.bandLight);
      display.style.opacity = '1'; display.style.transform = 'scale(1)';
    }, 200);
  }
  const t = document.getElementById('product-title');
  if (t) t.textContent = `Wellec Band – ${p.name}`;
  const cn = document.getElementById('selected-color-name');
  if (cn) cn.textContent = p.name;
  const bn = document.getElementById('breadcrumb-name');
  if (bn) bn.textContent = p.name;
  document.querySelectorAll('[data-product-bind]').forEach(el => el.dataset.product = pid);
  document.querySelectorAll('.product-thumb').forEach(t2 => {
    t2.classList.toggle('active', t2.dataset.product === pid);
  });
}

// ─── HERO WATCH ANIMATION ────────────────────────────────────────
function initHeroWatch() {
  const heroWatch = document.getElementById('hero-watch');
  if (!heroWatch) return;
  const seq = [
    {c:'#0D0D0D',l:false},{c:'#D8D8D8',l:true},{c:'#1B3A5C',l:false},{c:'#1A3D2B',l:false}
  ];
  let idx = 0;
  heroWatch.innerHTML = generateWatchSVG(seq[0].c,'xlarge',seq[0].l);
  heroWatch.style.transition = 'all 0.4s ease';
  setInterval(() => {
    idx = (idx+1) % seq.length;
    heroWatch.style.opacity='0'; heroWatch.style.transform='translateY(10px)';
    setTimeout(() => {
      heroWatch.innerHTML = generateWatchSVG(seq[idx].c,'xlarge',seq[idx].l);
      heroWatch.style.opacity='1'; heroWatch.style.transform='translateY(0)';
    }, 400);
  }, 3000);
}

// ─── SHOP / CART PAGE WATCH RENDERS ─────────────────────────────
function initShopWatches() {
  document.querySelectorAll('[data-watch-color]').forEach(el => {
    const color = el.dataset.watchColor;
    const size  = el.dataset.watchSize || 'medium';
    const light = el.dataset.watchLight === 'true';
    el.innerHTML = generateWatchSVG(color, size, light);
  });
}

// ─── NAV HIGHLIGHT ───────────────────────────────────────────────
function initNav() {
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if (!links.length) return;

  const linkMap = new Map();
  links.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (section) linkMap.set(link, section);
    link.addEventListener('click', () => {
      links.forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
    });
  });

  const activateLink = (id) => {
    links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target?.id) activateLink(visible.target.id);
  }, { rootMargin: '-25% 0px -55% 0px', threshold: [0.2, 0.45, 0.7] });

  linkMap.forEach((section) => observer.observe(section));

  const currentHash = window.location.hash?.replace('#', '') || 'overview';
  activateLink(currentHash);
}

function initWearPointSwitcher() {
  const container = document.querySelector('.wear-all-day-points');
  const cards = [...document.querySelectorAll('[data-wear-point]')];
  const originalCards = cards.filter((card) => card.closest('.wear-all-day-points') === container);
  if (!cards.length || !originalCards.length || !container) return;

  const scrollToCard = (card, behavior = 'smooth') => {
    const maxScroll = Math.max(container.scrollHeight - container.clientHeight, 0);
    const targetTop = Math.min(Math.max(card.offsetTop - container.offsetTop, 0), maxScroll);
    container.scrollTo({ top: targetTop, behavior });
  };

  const setGlowCard = (card) => {
    cards.forEach((item) => item.classList.remove('is-glowing'));
    if (card) card.classList.add('is-glowing');
  };

  const activate = (card) => {
    cards.forEach((item) => item.classList.remove('is-active'));
    card.classList.add('is-active');
    setGlowCard(card);
    scrollToCard(card, 'smooth');
  };

  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => activate(card));
    card.addEventListener('click', () => activate(card));
  });

  let currentIndex = 0;
  let autoTimer = 0;
  let resumeTimer = 0;
  let isAutoScrolling = false;
  const autoStepDelay = 820;

  const scheduleNextStep = (delay = autoStepDelay) => {
    window.clearTimeout(autoTimer);
    autoTimer = window.setTimeout(runAutoStep, delay);
  };

  const pauseAutoScroll = (delay = 1700) => {
    window.clearTimeout(autoTimer);
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => scheduleNextStep(250), delay);
  };

  const jumpToOriginal = (index) => {
    const normalizedIndex = ((index % originalCards.length) + originalCards.length) % originalCards.length;
    const target = originalCards[normalizedIndex];
    if (!target) return;
    cards.forEach((item) => item.classList.remove('is-active'));
    target.classList.add('is-active');
    setGlowCard(target);
    scrollToCard(target, 'auto');
  };

  const runAutoStep = () => {
    const nextIndex = currentIndex + 1;
    const target = originalCards[nextIndex];
    if (!target) {
      currentIndex = 0;
      jumpToOriginal(0);
      scheduleNextStep(autoStepDelay);
      return;
    }

    isAutoScrolling = true;
    cards.forEach((item) => item.classList.remove('is-active'));
    target.classList.add('is-active');
    setGlowCard(null);
    scrollToCard(target, 'smooth');
    currentIndex = nextIndex;

    window.setTimeout(() => {
      isAutoScrolling = false;
      setGlowCard(target);
      scheduleNextStep(autoStepDelay);
    }, 420);
  };

  ['wheel', 'touchstart', 'pointerdown', 'mouseenter'].forEach((eventName) => {
    container.addEventListener(eventName, () => pauseAutoScroll(), { passive: true });
  });
  container.addEventListener('mouseleave', () => pauseAutoScroll(650), { passive: true });
  container.addEventListener('scroll', () => {
    if (!isAutoScrolling) pauseAutoScroll(1400);
  }, { passive: true });

  jumpToOriginal(0);
  scheduleNextStep(autoStepDelay);
}

function initHealthPictureScroller() {
  const rail = document.querySelector('.whoop-health-picture-showcase');
  if (!rail) return;
  const cards = [...rail.querySelectorAll('.whoop-health-feature')];
  const quickItems = [...document.querySelectorAll('.whoop-health-quickitem[data-health-jump]')];
  if (!cards.length) return;
  const section = document.querySelector('.whoop-health-picture-section');
  let autoTimer = null;
  let resumeTimer = null;
  let isAutoScrolling = false;
  const autoStepDelay = 2400;

  if (section && !section.querySelector('.whoop-health-carousel-controls')) {
    const controls = document.createElement('div');
    controls.className = 'whoop-health-carousel-controls';
    controls.innerHTML = `
      <button class="whoop-health-carousel-btn prev" type="button" aria-label="Previous health card">&larr;</button>
      <button class="whoop-health-carousel-btn next" type="button" aria-label="Next health card">&rarr;</button>
    `;
    const head = section.querySelector('.whoop-health-picture-head');
    if (head) head.appendChild(controls);
  }

  const prevButton = section?.querySelector('.whoop-health-carousel-btn.prev');
  const nextButton = section?.querySelector('.whoop-health-carousel-btn.next');

  const setActiveCard = (card) => {
    cards.forEach((item) => item.classList.toggle('is-active', item === card));
    const activeIndex = Math.max(cards.indexOf(card), 0);
    quickItems.forEach((item, index) => item.classList.toggle('is-active', index === activeIndex));
  };

  const getActiveIndex = () => Math.max(cards.findIndex((card) => card.classList.contains('is-active')), 0);

  const scrollToCard = (index, behavior = 'smooth') => {
    const target = cards[index];
    if (!target) return;
    const maxLeft = Math.max(rail.scrollWidth - rail.clientWidth, 0);
    const rawLeft = target.offsetLeft - rail.offsetLeft;
    const targetLeft = Math.min(Math.max(rawLeft, 0), maxLeft);
    isAutoScrolling = true;
    rail.scrollTo({ left: targetLeft, behavior });
    setActiveCard(target);
    window.setTimeout(() => {
      isAutoScrolling = false;
    }, behavior === 'smooth' ? 420 : 0);
  };

  const syncActiveCard = () => {
    const viewportStart = rail.scrollLeft;
    const viewportEnd = viewportStart + rail.clientWidth;
    let activeCard = cards[0];
    let maxVisibleWidth = -1;

    cards.forEach((card) => {
      const cardStart = card.offsetLeft - rail.offsetLeft;
      const cardEnd = cardStart + card.offsetWidth;
      const visibleStart = Math.max(cardStart, viewportStart);
      const visibleEnd = Math.min(cardEnd, viewportEnd);
      const visibleWidth = Math.max(0, visibleEnd - visibleStart);

      if (visibleWidth > maxVisibleWidth) {
        maxVisibleWidth = visibleWidth;
        activeCard = card;
      }
    });

    setActiveCard(activeCard);
  };

  const stopAuto = (resumeDelay = 2400) => {
    if (autoTimer) window.clearTimeout(autoTimer);
    if (resumeTimer) window.clearTimeout(resumeTimer);
    autoTimer = null;
    isAutoScrolling = false;
    resumeTimer = window.setTimeout(startAuto, resumeDelay);
  };

  const advanceTo = (direction) => {
    const activeIndex = getActiveIndex();
    const nextIndex = (activeIndex + direction + cards.length) % cards.length;
    scrollToCard(nextIndex);
  };

  const startAuto = () => {
    if (autoTimer) window.clearTimeout(autoTimer);
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = null;
    autoTimer = window.setTimeout(() => {
      advanceTo(1);
      startAuto();
    }, autoStepDelay);
  };

  ['mouseenter', 'pointerdown', 'touchstart', 'wheel'].forEach((eventName) => {
    rail.addEventListener(eventName, () => stopAuto(), { passive: true });
  });

  rail.addEventListener('scroll', () => {
    syncActiveCard();
    if (!isAutoScrolling) stopAuto(1800);
  }, { passive: true });
  rail.addEventListener('mouseleave', () => stopAuto(900), { passive: true });

  quickItems.forEach((item) => {
    item.addEventListener('click', () => {
      const index = Number(item.dataset.healthJump || 0);
      scrollToCard(index);
      stopAuto(2600);
    });
  });

  prevButton?.addEventListener('click', () => {
    advanceTo(-1);
    stopAuto(2600);
  });

  nextButton?.addEventListener('click', () => {
    advanceTo(1);
    stopAuto(2600);
  });

  syncActiveCard();
  scrollToCard(0, 'auto');
  startAuto();
}

function initHealthTopicPopups() {
  const topics = {
    sleep: {
      kicker: 'Night Recovery',
      title: 'Optimize your sleep.',
      body: 'See sleep duration, consistency, and overnight recovery in one place so the next day starts with better context.',
      points: ['Sleep score and trend view', 'Recovery signal after each night', 'Bedtime rhythm that is easy to follow'],
      stats: [
        { label: 'Sleep score', value: '92%' },
        { label: 'Deep sleep', value: '2h 18m' },
        { label: 'Consistency', value: 'High' }
      ],
      visual: {
        type: 'bars',
        values: [48, 72, 60, 84, 94, 88]
      }
    },
    readiness: {
      kicker: 'Daily Readiness',
      title: 'Know your readiness.',
      body: 'Bring recovery, HRV, resting heart rate, and strain together before training, working hard, or taking it lighter.',
      points: ['One clearer readiness view', 'Daily strain matched to recovery', 'Fast check before exercise or work'],
      stats: [
        { label: 'Readiness', value: '78' },
        { label: 'HRV', value: '+11%' },
        { label: 'Strain target', value: '12.4' }
      ],
      visual: {
        type: 'line',
        values: [28, 42, 36, 58, 54, 71, 78]
      }
    },
    heart: {
      kicker: 'Heart Context',
      title: 'Stay close to heart health.',
      body: 'Track resting heart rate and daily patterns over time so changes are easier to notice and discuss.',
      points: ['Daily heart-rate context', 'Resting trend over time', 'A calmer view of signal changes'],
      stats: [
        { label: 'Resting HR', value: '58 bpm' },
        { label: 'Range', value: '54-128' },
        { label: 'Trend', value: 'Stable' }
      ],
      visual: {
        type: 'pulse',
        values: [18, 62, 28, 76, 34, 58, 22, 70]
      }
    },
    longevity: {
      kicker: 'Long-Term Health',
      title: 'Build long-term health.',
      body: 'Turn better sleep, strain balance, and recovery habits into a more sustainable routine over months, not just days.',
      points: ['Habits that compound over time', 'Weekly and monthly pattern view', 'Focus on consistency, not noise'],
      stats: [
        { label: 'Recovery trend', value: '+14%' },
        { label: 'Habit streak', value: '26 days' },
        { label: 'Monthly balance', value: 'Strong' }
      ],
      visual: {
        type: 'steps',
        values: [22, 34, 34, 48, 48, 66, 66, 84]
      }
    },
    shared: {
      kicker: 'Shared Wellness',
      title: 'Healthy living. Shared.',
      body: 'Use Wellex as a simple shared check-in across generations so healthy routines, activity, and heart context stay visible together.',
      points: ['Sync your wellness journey', 'Share progress across generations', 'Make healthy routines easier to sustain together'],
      stats: [
        { label: 'Dad HR', value: '65 bpm' },
        { label: 'Son activity', value: '15,000 steps' },
        { label: 'Shared focus', value: 'Daily routine' }
      ],
      visual: {
        type: 'bars',
        values: [42, 58, 74, 68, 84, 92]
      }
    }
  };

  const arrows = [...document.querySelectorAll('.whoop-health-feature-arrow')];
  if (!arrows.length) return;

  arrows.forEach((arrow, index) => {
    if (arrow.tagName === 'SPAN') {
      const topicKeys = ['sleep', 'readiness', 'heart', 'longevity', 'shared'];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = arrow.className;
      button.dataset.healthTopic = topicKeys[index] || 'sleep';
      button.setAttribute('aria-label', `Open ${button.dataset.healthTopic} details`);
      button.innerHTML = '&rarr;';
      arrow.replaceWith(button);
    }
  });

  if (!document.getElementById('health-topic-modal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="health-topic-modal" id="health-topic-modal" aria-hidden="true">
        <div class="health-topic-backdrop" data-health-topic-close></div>
        <div class="health-topic-dialog" role="dialog" aria-modal="true" aria-labelledby="health-topic-title">
          <button class="health-topic-close" type="button" data-health-topic-close aria-label="Close topic details">&times;</button>
          <div class="health-topic-kicker" id="health-topic-kicker"></div>
          <h3 id="health-topic-title"></h3>
          <p id="health-topic-body"></p>
          <div class="health-topic-visual" id="health-topic-visual"></div>
          <div class="health-topic-stats" id="health-topic-stats"></div>
          <div class="health-topic-points" id="health-topic-points"></div>
        </div>
      </div>`);
  }

  const modal = document.getElementById('health-topic-modal');
  const kickerEl = document.getElementById('health-topic-kicker');
  const titleEl = document.getElementById('health-topic-title');
  const bodyEl = document.getElementById('health-topic-body');
  const visualEl = document.getElementById('health-topic-visual');
  const statsEl = document.getElementById('health-topic-stats');
  const pointsEl = document.getElementById('health-topic-points');
  if (!modal || !kickerEl || !titleEl || !bodyEl || !visualEl || !statsEl || !pointsEl) return;

  const renderVisual = (visual) => {
    if (!visual) return '';

    if (visual.type === 'bars') {
      return `
        <div class="health-visual-bars">
          ${visual.values.map((value) => `<span style="height:${value}%"></span>`).join('')}
        </div>`;
    }

    if (visual.type === 'line') {
      return `
        <div class="health-visual-line">
          ${visual.values.map((value) => `<span style="height:${value}%"></span>`).join('')}
        </div>`;
    }

    if (visual.type === 'pulse') {
      return `
        <div class="health-visual-pulse">
          ${visual.values.map((value) => `<span style="height:${value}%"></span>`).join('')}
        </div>`;
    }

    if (visual.type === 'steps') {
      return `
        <div class="health-visual-steps">
          ${visual.values.map((value) => `<span style="height:${value}%"></span>`).join('')}
        </div>`;
    }

    return '';
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const openModal = (topicName) => {
    const topic = topics[topicName];
    if (!topic) return;
    kickerEl.textContent = topic.kicker;
    titleEl.textContent = topic.title;
    bodyEl.textContent = topic.body;
    visualEl.innerHTML = renderVisual(topic.visual);
    statsEl.innerHTML = topic.stats.map((stat) => `
      <div class="health-topic-stat">
        <span>${stat.label}</span>
        <strong>${stat.value}</strong>
      </div>`).join('');
    pointsEl.innerHTML = topic.points.map((point) => `<span>${point}</span>`).join('');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  document.querySelectorAll('.whoop-health-feature-arrow[data-health-topic]').forEach((button) => {
    button.addEventListener('click', () => openModal(button.dataset.healthTopic));
  });

  modal.querySelectorAll('[data-health-topic-close]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
}

function initHowItWorksStepsScroller() {
  const container = document.querySelector('.how-it-works-steps');
  const cards = [...document.querySelectorAll('.how-it-works-steps .how-step-card')];
  if (!container || cards.length < 2) return;

  let autoTimer = 0;
  let resumeTimer = 0;
  let isAutoScrolling = false;
  let currentIndex = 0;
  const autoStepDelay = 1150;

  const setActiveCard = (card) => {
    cards.forEach((item) => item.classList.toggle('is-active', item === card));
  };

  const scrollToCard = (card, behavior = 'smooth') => {
    const maxScroll = Math.max(container.scrollHeight - container.clientHeight, 0);
    const targetTop = Math.min(Math.max(card.offsetTop - container.offsetTop, 0), maxScroll);
    container.scrollTo({ top: targetTop, behavior });
  };

  const scheduleNextStep = (delay = autoStepDelay) => {
    window.clearTimeout(autoTimer);
    autoTimer = window.setTimeout(runAutoStep, delay);
  };

  const pauseAutoScroll = (delay = 1700) => {
    window.clearTimeout(autoTimer);
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => scheduleNextStep(250), delay);
  };

  const jumpToIndex = (index) => {
    const normalizedIndex = ((index % cards.length) + cards.length) % cards.length;
    const target = cards[normalizedIndex];
    if (!target) return;
    currentIndex = normalizedIndex;
    setActiveCard(target);
    scrollToCard(target, 'auto');
  };

  const runAutoStep = () => {
    const nextIndex = currentIndex + 1;
    const target = cards[nextIndex];
    if (!target) {
      currentIndex = 0;
      jumpToIndex(0);
      scheduleNextStep(autoStepDelay);
      return;
    }

    isAutoScrolling = true;
    setActiveCard(target);
    scrollToCard(target, 'smooth');
    currentIndex = nextIndex;

    window.setTimeout(() => {
      isAutoScrolling = false;
      scheduleNextStep(autoStepDelay);
    }, 420);
  };

  ['wheel', 'touchstart', 'pointerdown', 'mouseenter'].forEach((eventName) => {
    container.addEventListener(eventName, () => pauseAutoScroll(), { passive: true });
  });
  container.addEventListener('mouseleave', () => pauseAutoScroll(650), { passive: true });
  container.addEventListener('scroll', () => {
    const containerCenter = container.getBoundingClientRect().top + (container.clientHeight / 2);
    let closestCard = cards[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.top + (rect.height / 2);
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestCard = card;
      }
    });

    if (closestCard) {
      currentIndex = Math.max(cards.indexOf(closestCard), 0);
      setActiveCard(closestCard);
    }

    if (!isAutoScrolling) pauseAutoScroll(1400);
  }, { passive: true });

  jumpToIndex(0);
  scheduleNextStep(autoStepDelay);
}

function initGuidanceTabs() {
  const tabs = [...document.querySelectorAll('[data-guidance-tab], [data-guidance-target]')];
  const panels = [...document.querySelectorAll('[data-guidance-panel]')];
  if (!tabs.length || !panels.length) return;

  const activate = (name) => {
    tabs.forEach((tab) => {
      const tabName = tab.dataset.guidanceTab || tab.dataset.guidanceTarget;
      const isActive = tabName === name;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.guidancePanel === name));
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab.dataset.guidanceTab || tab.dataset.guidanceTarget));
  });
}

function initInsightTabs() {
  const items = [...document.querySelectorAll('[data-insight], [data-insight-target]')];
  const panels = [...document.querySelectorAll('[data-insight-panel]')];
  if (!items.length || !panels.length) return;

  const activate = (name) => {
    items.forEach((item) => {
      const itemName = item.dataset.insight || item.dataset.insightTarget;
      const isActive = itemName === name;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.insightPanel === name));
  };

  items.forEach((item) => {
    item.addEventListener('click', () => activate(item.dataset.insight || item.dataset.insightTarget));
  });
}

function initDayPhaseTheme() {
  const shell = document.querySelector('.watch-story-media-shell');
  const items = [...document.querySelectorAll('.watch-story-day[data-day-phase]')];
  const storageKey = 'wellexDayPhaseOverride';

  const getAutoPhase = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const getInitialPhase = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && items.some((item) => item.dataset.dayPhase === saved)) return saved;
    } catch (error) {
      // Ignore storage access issues and fall back to automatic phase detection.
    }

    return getAutoPhase();
  };

  const activate = (phase) => {
    document.body.dataset.dayPhase = phase;
    if (!shell || !items.length) return;
    shell.dataset.phase = phase;
    items.forEach((item) => {
      const isActive = item.dataset.dayPhase === phase;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const initial = getInitialPhase();
  activate(initial);
  if (!shell || !items.length) return;

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const phase = item.dataset.dayPhase;
      activate(phase);
      try {
        localStorage.setItem(storageKey, phase);
      } catch (error) {
        // Ignore storage access issues and keep the in-memory selection.
      }
    });
  });
}

function initStoryCards() {
  const stage = document.querySelector('.watch-story-stage');
  const cards = [...document.querySelectorAll('.watch-story-card[data-story-index]')];
  if (!stage || !cards.length) return;

  const isMobile = () => window.innerWidth <= 720;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const easeInOut = (value) => 0.5 - (Math.cos(Math.PI * value) / 2);

  const applyDesktopStory = () => {
    const rect = stage.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;
    const totalScroll = Math.max(stage.offsetHeight - viewportHeight, 1);
    const traveled = Math.min(Math.max(-rect.top, 0), totalScroll);
    const progress = traveled / totalScroll;
    const hasStarted = progress > 0.13;
    const easedProgress = easeInOut(progress);
    const spin = easedProgress * (cards.length - 1);
    const activeIndex = Math.min(cards.length - 1, Math.max(0, Math.round(spin)));

    cards.forEach((card, index) => {
      const delta = index - spin;
      const distance = Math.abs(delta);
      const proximity = clamp(1 - distance, 0, 1);
      const isActive = hasStarted && distance < 0.5;
      const y = delta * 168;
      const z = -Math.min(distance * 250, 420);
      const rotate = delta * -20;
      const scale = 0.84 + (proximity * 0.16);
      const opacity = proximity > 0.04 ? Math.pow(proximity, 1.45) : 0;

      card.style.setProperty('--story-card-y', `${y}px`);
      card.style.setProperty('--story-card-z', `${z}px`);
      card.style.setProperty('--story-card-rotate', `${rotate}deg`);
      card.style.setProperty('--story-card-scale', `${scale}`);
      card.style.setProperty('--story-card-opacity', `${hasStarted ? opacity : 0}`);
      card.classList.toggle('is-visible', hasStarted);
      card.classList.toggle('is-active', isActive && index === activeIndex);
    });
  };

  const applyMobileStory = () => {
    cards.forEach((card, index) => {
      card.classList.add('is-visible');
      card.classList.toggle('is-active', index === 0);
      card.style.removeProperty('--story-card-y');
      card.style.removeProperty('--story-card-z');
      card.style.removeProperty('--story-card-rotate');
      card.style.removeProperty('--story-card-scale');
      card.style.removeProperty('--story-card-opacity');
    });
  };

  let ticking = false;
  const updateStory = () => {
    if (isMobile()) applyMobileStory();
    else applyDesktopStory();
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateStory);
  };

  updateStory();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
}

// ─── WVI GAUGE ANIMATION ─────────────────────────────────────────
function animateWVI(targetId, targetValue) {
  const el = document.getElementById(targetId);
  if (!el) return;
  let current = 0;
  const interval = setInterval(() => {
    current += 2;
    if (current >= targetValue) { current = targetValue; clearInterval(interval); }
    el.textContent = current;
  }, 20);
}

const fitFinderConfig = {
  colorMeta: {
    'classic-black': {
      name: 'Classic Black',
      aura: 'Business',
      glow: 'radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(46,116,181,0.22) 44%, rgba(13,13,13,0) 76%)',
      copy: 'You read strongest as composed, focused, and sharp. Black fits the version of you that wants clean signal, quiet authority, and daily versatility.',
      reason: 'Best for disciplined routines, polished settings, and people who prefer precision over noise.'
    },
    'midnight-navy': {
      name: 'Midnight Navy',
      aura: 'Mansion',
      glow: 'radial-gradient(circle, rgba(88,160,255,0.42) 0%, rgba(27,42,74,0.18) 48%, rgba(13,13,13,0) 80%)',
      copy: 'You lean refined, elevated, and a little more curated. Midnight Navy matches people who want premium presence without going obvious.',
      reason: 'Best for evening energy, luxury taste, and a cooler, more architectural style.'
    },
    'forest-green': {
      name: 'Forest Green',
      aura: 'Forest',
      glow: 'radial-gradient(circle, rgba(86,214,135,0.34) 0%, rgba(26,61,43,0.22) 46%, rgba(13,13,13,0) 80%)',
      copy: 'You come through as grounded, wellness-aware, and balanced. Green fits a calmer identity with a natural premium edge.',
      reason: 'Best for recovery-minded users, outdoor energy, and people who want softness with distinction.'
    },
    'crimson-red': {
      name: 'Original Orange',
      aura: 'Marathon',
      glow: 'radial-gradient(circle, rgba(255,154,76,0.42) 0%, rgba(216,89,22,0.20) 46%, rgba(13,13,13,0) 80%)',
      copy: 'You score as energetic, visible, and action-led. The orange Wellec look suits people who want movement, attention, and momentum.',
      reason: 'Best for outgoing personalities, sport-minded routines, and high-energy first impressions.'
    }
  },
  questions: [
    {
      title: 'What kind of room do you naturally take over?',
      options: [
        { title: 'Boardroom', copy: 'Structured, direct, polished.', color: 'classic-black' },
        { title: 'Penthouse dinner', copy: 'Refined, exclusive, curated.', color: 'midnight-navy' },
        { title: 'Cabin retreat', copy: 'Calm, restorative, natural.', color: 'forest-green' },
        { title: 'Race day crowd', copy: 'Fast, visible, energetic.', color: 'crimson-red' }
      ]
    },
    {
      title: 'Which compliment sounds most like you?',
      options: [
        { title: 'You are sharp', copy: 'Focused and always put together.', color: 'classic-black' },
        { title: 'You have taste', copy: 'Luxury without screaming.', color: 'midnight-navy' },
        { title: 'You feel grounded', copy: 'Easy energy people trust.', color: 'forest-green' },
        { title: 'You bring energy', copy: 'People notice your momentum.', color: 'crimson-red' }
      ]
    },
    {
      title: 'Pick the pace that feels right on your wrist.',
      options: [
        { title: 'Controlled', copy: 'Minimal, consistent, exact.', color: 'classic-black' },
        { title: 'Curated', copy: 'Smooth, premium, intentional.', color: 'midnight-navy' },
        { title: 'Balanced', copy: 'Breathable, calm, restorative.', color: 'forest-green' },
        { title: 'Explosive', copy: 'Visible, athletic, driven.', color: 'crimson-red' }
      ]
    },
    {
      title: 'What do you want your watch to say before you speak?',
      options: [
        { title: 'I am in control', copy: 'Clean authority.', color: 'classic-black' },
        { title: 'I move elegantly', copy: 'Exclusive confidence.', color: 'midnight-navy' },
        { title: 'I live well', copy: 'Recovery and rhythm.', color: 'forest-green' },
        { title: 'I move now', copy: 'Action and fire.', color: 'crimson-red' }
      ]
    }
  ]
};

function initFitFinder() {
  const modal = document.getElementById('fit-finder-modal');
  if (!modal) return;

  const launchers = document.querySelectorAll('[data-fit-launch]');
  const closeButtons = modal.querySelectorAll('[data-fit-close]');
  const targetChip = document.getElementById('fit-target-chip');
  const questionStage = document.getElementById('fit-question-stage');
  const resultStage = document.getElementById('fit-result');
  const progressBar = document.getElementById('fit-progress-bar');
  const skipBtn = document.getElementById('fit-skip-btn');
  const questionStep = document.getElementById('fit-question-step');
  const questionTitle = document.getElementById('fit-question-title');
  const optionsWrap = document.getElementById('fit-options');
  const resultTitle = document.getElementById('fit-result-title');
  const resultCopy = document.getElementById('fit-result-copy');
  const resultReason = document.getElementById('fit-result-reason');
  const resultGlow = document.getElementById('fit-result-glow');
  const resultLink = document.getElementById('fit-result-link');
  const restartBtn = document.getElementById('fit-restart-btn');

  let preferredColor = null;
  let currentQuestion = 0;
  let scores = {};
  const isColorsLandingPage = /(^|[\\/])shop\.html$/i.test(window.location.pathname)
    || (!window.location.pathname.split('/').pop() && document.querySelector('.collection-header'));

  const resetGame = () => {
    currentQuestion = 0;
    scores = {
      'classic-black': 0,
      'midnight-navy': 0,
      'forest-green': 0,
      'crimson-red': 0
    };
    questionStage.classList.remove('hidden');
    resultStage.classList.add('hidden');
    renderQuestion();
  };

  const openModal = (targetColor) => {
    preferredColor = targetColor;
    const meta = fitFinderConfig.colorMeta[targetColor];
    targetChip.textContent = meta ? `Focus: ${meta.aura}` : 'Focus: Open match';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    resetGame();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const skipToColors = () => {
    const fallback = preferredColor || 'classic-black';
    window.location.href = `product.html?color=${fallback}`;
  };

  const renderQuestion = () => {
    const total = fitFinderConfig.questions.length;
    const question = fitFinderConfig.questions[currentQuestion];
    questionStep.textContent = `Round ${currentQuestion + 1} / ${total}`;
    questionTitle.textContent = question.title;
    progressBar.style.width = `${((currentQuestion + 1) / total) * 100}%`;
    optionsWrap.innerHTML = question.options.map((option) => `
      <button class="fit-option" type="button" data-fit-color="${option.color}">
        <strong>${option.title}</strong>
        <span>${option.copy}</span>
      </button>
    `).join('');

    optionsWrap.querySelectorAll('.fit-option').forEach((button) => {
      button.addEventListener('click', () => {
        const picked = button.dataset.fitColor;
        scores[picked] += 2;
        if (preferredColor === picked) scores[picked] += 1;
        currentQuestion += 1;
        if (currentQuestion >= total) {
          renderResult();
        } else {
          renderQuestion();
        }
      });
    });
  };

  const renderResult = () => {
    const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    const meta = fitFinderConfig.colorMeta[winner];
    questionStage.classList.add('hidden');
    resultStage.classList.remove('hidden');
    progressBar.style.width = '100%';
    resultTitle.textContent = `${meta.name} / ${meta.aura}`;
    resultCopy.textContent = meta.copy;
    resultReason.textContent = meta.reason;
    resultGlow.style.background = meta.glow;
    resultLink.href = `product.html?color=${winner}`;
    resultLink.textContent = `See ${meta.name}`;
    targetChip.textContent = preferredColor === winner ? 'Direct hit: your pick matched' : `Better match found: ${meta.aura}`;
  };

  launchers.forEach((launcher) => {
    launcher.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(launcher.dataset.fitLaunch);
    });
  });

  closeButtons.forEach((button) => button.addEventListener('click', closeModal));
  skipBtn.addEventListener('click', skipToColors);
  restartBtn.addEventListener('click', resetGame);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  if (isColorsLandingPage) {
    openModal('classic-black');
  }
}

function initCollectionZoom() {
  const zoomCards = document.querySelectorAll('.zoom-card');
  if (!zoomCards.length) return;

  zoomCards.forEach((card) => {
    const pane = card.querySelector('.zoom-pane');
    const toggle = card.querySelector('.zoom-toggle');
    const source = card.dataset.zoomImage;
    if (!pane || !source || !toggle) return;

    pane.style.backgroundImage = `url('${source}')`;

    const setZoomState = (enabled) => {
      card.classList.toggle('zoom-enabled', enabled);
      toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      toggle.textContent = enabled ? 'Zoom on' : 'Enable zoom';
      if (!enabled) card.classList.remove('is-zooming');
    };

    setZoomState(false);

    const updateZoom = (event) => {
      if (!card.classList.contains('zoom-enabled')) return;
      const rect = card.getBoundingClientRect();
      const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
      const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
      pane.style.backgroundPosition = `${x * 100}% ${y * 100}%`;
      card.classList.add('is-zooming');
    };

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setZoomState(!card.classList.contains('zoom-enabled'));
    });

    card.addEventListener('mouseenter', (event) => updateZoom(event));
    card.addEventListener('mousemove', (event) => updateZoom(event));
    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-zooming');
    });
  });
}

const healthDealConfig = {
  questions: [
    {
      title: 'How often do you wake up feeling actually recovered?',
      options: [
        { title: 'Almost always', copy: 'I usually wake up ready to go.', score: 4 },
        { title: 'Pretty often', copy: 'Most days are solid.', score: 3 },
        { title: 'Sometimes', copy: 'It depends on the week.', score: 2 },
        { title: 'Rarely', copy: 'Recovery is a struggle.', score: 1 }
      ]
    },
    {
      title: 'Which habit sounds most like your current routine?',
      options: [
        { title: 'Structured sleep and hydration', copy: 'I protect the basics first.', score: 4 },
        { title: 'Workout rhythm with some discipline', copy: 'Not perfect, but real.', score: 3 },
        { title: 'I am trying to improve', copy: 'Some good days, some chaos.', score: 2 },
        { title: 'Mostly reactive', copy: 'I know I need a reset.', score: 1 }
      ]
    },
    {
      title: 'How aware are you of your body signals during the day?',
      options: [
        { title: 'Very aware', copy: 'I notice stress, strain, and energy shifts fast.', score: 4 },
        { title: 'Fairly aware', copy: 'I pick up the obvious changes.', score: 3 },
        { title: 'Not much', copy: 'I usually realize it late.', score: 2 },
        { title: 'Almost never', copy: 'I mostly push through blindly.', score: 1 }
      ]
    }
  ],
  discounts: [0.3, 0.8, 1.2, 1.8, 2.4, 3.1, 4.0, 5.0]
};

let activeHealthDeal = null;

function openHealthDeal(productId, planType) {
  const modal = document.getElementById('health-deal-modal');
  if (!modal) {
    addToCart(productId, planType);
    return;
  }

  const product = products[productId];
  if (!product) return;

  const planPrice = planType === 'subscription' ? product.subPrice : product.price;
  const planChip = document.getElementById('health-plan-chip');
  const progressBar = document.getElementById('health-progress-bar');
  const quizStage = document.getElementById('health-quiz-stage');
  const wheelStage = document.getElementById('health-wheel-stage');
  const resultStage = document.getElementById('health-result-stage');
  const stepEl = document.getElementById('health-step');
  const questionEl = document.getElementById('health-question');
  const optionsEl = document.getElementById('health-options');
  const wheelEl = document.getElementById('health-wheel');
  const wheelCopy = document.getElementById('health-wheel-copy');
  const winningBadge = document.getElementById('health-winning-badge');
  const resultTitle = document.getElementById('health-result-title');
  const resultCopy = document.getElementById('health-result-copy');
  const originalPrice = document.getElementById('health-original-price');
  const discountPercentEl = document.getElementById('health-discount-percent');
  const finalPriceEl = document.getElementById('health-final-price');
  const spinBtn = document.getElementById('health-spin-btn');
  const claimBtn = document.getElementById('health-claim-btn');

  activeHealthDeal = {
    productId,
    planType,
    planPrice,
    score: 0,
    questionIndex: 0,
    discount: 0
  };

  planChip.textContent = `Plan: ${planType === 'subscription' ? 'Subscription' : 'One-Time'}`;
  progressBar.style.width = '20%';
  quizStage.classList.remove('hidden');
  wheelStage.classList.add('hidden');
  resultStage.classList.add('hidden');
  wheelEl.style.transform = 'rotate(0deg)';
  winningBadge.classList.remove('is-visible');
  winningBadge.textContent = '0.0%';
  originalPrice.textContent = `$${planPrice.toFixed(2)}`;
  discountPercentEl.textContent = '0.0%';
  finalPriceEl.textContent = `$${planPrice.toFixed(2)}`;
  wheelEl.innerHTML = `
    <div class="health-wheel-labels">
      ${healthDealConfig.discounts.map((discount, index) => {
        const angle = (360 / healthDealConfig.discounts.length) * index;
        return `<span class="health-wheel-label" data-discount="${discount.toFixed(1)}" style="transform: translate(-50%, -50%) rotate(${angle}deg) translateY(-118px) rotate(${-angle}deg);"><span class="health-wheel-label-text">${discount.toFixed(1)}%</span></span>`;
      }).join('')}
    </div>
  `;

  const renderQuestion = () => {
    const q = healthDealConfig.questions[activeHealthDeal.questionIndex];
    stepEl.textContent = `Round ${activeHealthDeal.questionIndex + 1} / ${healthDealConfig.questions.length}`;
    questionEl.textContent = q.title;
    progressBar.style.width = `${20 + ((activeHealthDeal.questionIndex) / healthDealConfig.questions.length) * 40}%`;
    optionsEl.innerHTML = q.options.map((option) => `
      <button class="health-option" type="button" data-health-score="${option.score}">
        <strong>${option.title}</strong>
        <span>${option.copy}</span>
      </button>
    `).join('');
    optionsEl.querySelectorAll('.health-option').forEach((button) => {
      button.addEventListener('click', () => {
        activeHealthDeal.score += Number(button.dataset.healthScore || 0);
        activeHealthDeal.questionIndex += 1;
        if (activeHealthDeal.questionIndex >= healthDealConfig.questions.length) {
          quizStage.classList.add('hidden');
          wheelStage.classList.remove('hidden');
          progressBar.style.width = '72%';
          const quality = activeHealthDeal.score >= 10 ? 'Elite' : activeHealthDeal.score >= 7 ? 'Strong' : activeHealthDeal.score >= 5 ? 'Improving' : 'Starter';
          const calculatedDiscount = getDiscountByScore(activeHealthDeal.score);
          wheelCopy.textContent = `${quality} health profile detected. Your answers already calculated a ${calculatedDiscount.toFixed(1)}% discount, and the wheel will now reveal that exact number.`;
        } else {
          renderQuestion();
        }
      });
    });
  };

  const getDiscountByScore = (score) => {
    const minScore = healthDealConfig.questions.length;
    const maxScore = healthDealConfig.questions.length * 4;
    const normalizedScore = (score - minScore) / (maxScore - minScore);
    const clampedScore = Math.min(Math.max(normalizedScore, 0), 1);
    const discountIndex = Math.round(clampedScore * (healthDealConfig.discounts.length - 1));
    return healthDealConfig.discounts[discountIndex];
  };

  const spinWheel = () => {
    if (spinBtn.dataset.spinning === 'true') return;
    spinBtn.dataset.spinning = 'true';
    wheelEl.querySelectorAll('.health-wheel-label').forEach((label) => label.classList.remove('is-winner'));
    activeHealthDeal.discount = getDiscountByScore(activeHealthDeal.score);
    const slotIndex = healthDealConfig.discounts.indexOf(activeHealthDeal.discount);
    const segmentAngle = 360 / healthDealConfig.discounts.length;
    const fullSpins = 4;
    const landingAngle = (fullSpins * 360) - (slotIndex * segmentAngle);
    wheelEl.style.transform = `rotate(${landingAngle}deg)`;

    window.setTimeout(() => {
      const discountedPrice = activeHealthDeal.planPrice * (1 - activeHealthDeal.discount / 100);
      const winnerLabel = wheelEl.querySelector(`.health-wheel-label[data-discount="${activeHealthDeal.discount.toFixed(1)}"]`);
      if (winnerLabel) {
        winnerLabel.classList.add('is-winner');
      }
      wheelStage.classList.add('hidden');
      resultStage.classList.remove('hidden');
      progressBar.style.width = '100%';
      resultTitle.textContent = `${activeHealthDeal.discount.toFixed(1)}% healthy-lifestyle discount`;
      resultCopy.textContent = `Your recovery, rhythm, and body-awareness answers directly calculated this ${activeHealthDeal.discount.toFixed(1)}% discount for ${products[activeHealthDeal.productId].name}, and the wheel has revealed that exact earned result.`;
      winningBadge.textContent = `${activeHealthDeal.discount.toFixed(1)}%`;
      winningBadge.classList.add('is-visible');
      discountPercentEl.textContent = `${activeHealthDeal.discount.toFixed(1)}%`;
      finalPriceEl.textContent = `$${discountedPrice.toFixed(2)}`;
      spinBtn.dataset.spinning = 'false';
    }, 4500);
  };

  const claimDiscount = () => {
    const discountedPrice = activeHealthDeal.planPrice * (1 - activeHealthDeal.discount / 100);
    addToCart(activeHealthDeal.productId, activeHealthDeal.planType, Number(discountedPrice.toFixed(2)), activeHealthDeal.discount);
    closeHealthDeal();
  };

  spinBtn.onclick = spinWheel;
  claimBtn.onclick = claimDiscount;

  renderQuestion();
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeHealthDeal() {
  const modal = document.getElementById('health-deal-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function initHealthDealModal() {
  const modal = document.getElementById('health-deal-modal');
  if (!modal) return;
  modal.querySelectorAll('[data-health-close]').forEach((el) => {
    el.addEventListener('click', closeHealthDeal);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeHealthDeal();
  });
}

function initSiteReviewForm() {
  const form = document.getElementById('site-review-form');
  const starsInput = document.getElementById('review-stars-input');
  const ratingInput = document.getElementById('review-rating');
  const reviewsGrid = document.getElementById('reviews-grid');
  const modal = document.getElementById('review-modal');
  const openBtn = document.getElementById('open-review-modal');
  const useCaseSelect = document.getElementById('review-use-case');
  const useCaseOtherField = document.getElementById('review-use-case-other-field');
  const useCaseOtherInput = document.getElementById('review-use-case-other');
  if (!form || !starsInput || !ratingInput || !reviewsGrid || !modal || !openBtn || !useCaseSelect || !useCaseOtherField || !useCaseOtherInput) return;

  const starButtons = [...starsInput.querySelectorAll('.review-star-button')];

  const closeReviewModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const openReviewModal = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const paintStars = (rating) => {
    starButtons.forEach((button) => {
      const isActive = Number(button.dataset.rating) <= rating;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const syncUseCaseField = () => {
    const isOther = useCaseSelect.value === 'Other';
    useCaseOtherField.classList.toggle('hidden', !isOther);
    useCaseOtherInput.required = isOther;
    if (!isOther) useCaseOtherInput.value = '';
  };

  paintStars(Number(ratingInput.value || 5));
  syncUseCaseField();
  openBtn.addEventListener('click', openReviewModal);
  modal.querySelectorAll('[data-review-close]').forEach((el) => {
    el.addEventListener('click', closeReviewModal);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeReviewModal();
  });
  useCaseSelect.addEventListener('change', syncUseCaseField);

  starButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const rating = Number(button.dataset.rating || 5);
      ratingInput.value = String(rating);
      paintStars(rating);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = (document.getElementById('review-name')?.value || '').trim();
    const message = (document.getElementById('review-message')?.value || '').trim();
    const selectedUseCase = (document.getElementById('review-use-case')?.value || '').trim();
    const customUseCase = (document.getElementById('review-use-case-other')?.value || '').trim();
    const useCase = selectedUseCase === 'Other' ? customUseCase : selectedUseCase;
    const rating = Number(ratingInput.value || 5);
    if (!name || !message || !useCase) return;

    const article = document.createElement('article');
    article.className = 'review-card';

    const tag = document.createElement('span');
    tag.className = 'review-tag';
    tag.textContent = 'Fresh Review';

    const topline = document.createElement('div');
    topline.className = 'review-card-topline';

    const useCasePill = document.createElement('span');
    useCasePill.className = 'review-usecase-pill';
    useCasePill.textContent = useCase;

    const body = document.createElement('p');
    body.textContent = `"${message}"`;

    const meta = document.createElement('div');
    meta.className = 'review-card-meta';

    const author = document.createElement('strong');
    author.textContent = `${name}, site visitor`;

    const stars = document.createElement('span');
    stars.className = 'review-card-stars';
    stars.textContent = `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;

    topline.append(tag, useCasePill);
    meta.append(author, stars);
    article.append(topline, body, meta);

    reviewsGrid.prepend(article);
    form.reset();
    ratingInput.value = '5';
    paintStars(5);
    syncUseCaseField();
    closeReviewModal();
    showToast('Review submitted. It is now visible in the feedback section.');
  });
}

function initScrollMotion() {
  if (!document.querySelector('.dashboard-hero')) return;

  const revealTargets = [
    ...document.querySelectorAll('.dashboard-hero-copy, .dashboard-preview-main, .floating-note, .watch-photo-card'),
    ...document.querySelectorAll('.home-colors-section, .architecture-strip, .module-showcase, .desirability-strip, .operations-band, .intelligence-grid, .trust-section, .closing-banner'),
    ...document.querySelectorAll('.home-color-card, .architecture-card, .module-card, .desirability-shot, .ops-card, .intelligence-card, .trust-step, .aura-card-watch, .aura-card-content')
  ];

  const seen = new Set();
  revealTargets.forEach((el, index) => {
    if (seen.has(el)) return;
    seen.add(el);
    el.classList.add('scroll-reveal');
    el.style.setProperty('--reveal-delay', `${Math.min((index % 6) * 90, 450)}ms`);
  });

  document.querySelectorAll('.watch-photo-card-side, .floating-note-left').forEach((el) => {
    el.classList.add('reveal-side-left');
  });

  document.querySelectorAll('.watch-photo-card-main, .floating-note-right, .desirability-shot.large').forEach((el) => {
    el.classList.add('reveal-side-right');
  });

  document.querySelectorAll('.aura-card').forEach((el, index) => {
    el.classList.add(index % 2 === 0 ? 'reveal-side-left' : 'reveal-side-right');
  });

  document.querySelectorAll('.watch-photo-card, .desirability-shot, .floating-note, .aura-card-watch, .aura-card-bg img').forEach((el, index) => {
    el.setAttribute('data-parallax', '');
    el.dataset.parallaxSpeed = String(22 + (index % 4) * 14);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  seen.forEach((el) => revealObserver.observe(el));

  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  if (!parallaxItems.length) return;

  let ticking = false;
  const updateParallax = () => {
    const viewportHeight = window.innerHeight || 1;
    parallaxItems.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = Number(el.dataset.parallaxSpeed || 20);
      const progress = (rect.top + rect.height * 0.5 - viewportHeight * 0.5) / viewportHeight;
      el.style.setProperty('--parallax-shift', `${progress * speed * -1}px`);
    });
    ticking = false;
  };

  const requestParallax = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateParallax);
  };

  updateParallax();
  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', requestParallax);
}

// ─── CHECKOUT FORM ───────────────────────────────────────────────
function initCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  form.addEventListener('submit', e => { e.preventDefault(); placeOrderAction(); });
}

function placeOrderAction() {
  cart = []; saveCart(); updateCartBadge();
  const inner = document.querySelector('.checkout-inner');
  if (inner) inner.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:80px 20px">
      <div style="font-size:5rem;margin-bottom:24px">🎉</div>
      <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);color:#ffffff;padding:8px 20px;border-radius:20px;font-size:0.8rem;font-weight:700;letter-spacing:1px;margin-bottom:24px;text-transform:uppercase">Order Confirmed</div>
      <h2 style="font-size:2.5rem;font-weight:900;letter-spacing:-1.5px;margin-bottom:16px">Order Placed!</h2>
      <p style="color:var(--light-gray);margin-bottom:8px;font-size:1rem;max-width:480px;margin-left:auto;margin-right:auto;line-height:1.7">
        Your Wellec Band is on its way. Activate your subscription in the app and start earning DeFi yield through Emotional Mining.
      </p>
      <p style="color:var(--gray);font-size:0.85rem;margin-bottom:40px">Estimated delivery: 5–7 business days · App setup guide sent to your email.</p>
      <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
        <a href="index.html" class="btn-primary">Back to Home</a>
        <a href="shop.html" class="btn-outline">Keep Shopping</a>
      </div>
    </div>`;
}

// ─── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setCurrentLanguage(getCurrentLanguage());
  renderSharedHeader();
  renderSharedFooter();
  renderSharedFitFinder();
  updateCartBadge();
  initNav();
  initStoryCards();
  initWearPointSwitcher();
  initHealthPictureScroller();
  initHealthTopicPopups();
  initHowItWorksStepsScroller();
  initGuidanceTabs();
  initInsightTabs();
  initDayPhaseTheme();
  initHeroWatch();
  initShopWatches();
  initColorSwitcher();
  renderCart();
  renderCheckoutItems();
  initCheckoutForm();
  initHealthDealModal();
  initFitFinder();
  initSiteReviewForm();
  initCollectionZoom();
  initScrollMotion();
  // Animate WVI scores on scroll
  const wviEls = document.querySelectorAll('[data-wvi-animate]');
  if (wviEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateWVI(e.target.id, parseInt(e.target.dataset.wviAnimate)); obs.unobserve(e.target); }
      });
    }, {threshold: 0.5});
    wviEls.forEach(el => obs.observe(el));
  }

  initLanguageObserver();
  applyLanguageToPage(getCurrentLanguage());
});
