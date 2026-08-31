const i18nStore = window.i18n || {
  locale: 'de',
  languages: [],
  translations: { de: {} },
};

const themeToggle = document.getElementById('themeToggle');
const cartCount = document.getElementById('cartCount');
const chips = document.querySelectorAll('.chip');
const cards = document.querySelectorAll('.product-card');
const testimonials = document.querySelectorAll('.testimonial');
const buyButtons = document.querySelectorAll('.buy-btn');
const quickViewButtons = document.querySelectorAll('.quick-view-btn');
const newsletterForm = document.getElementById('newsletterForm');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsList = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const modal = document.getElementById('productModal');
const closeModalButton = document.getElementById('closeModal');
const toast = document.getElementById('toast');
const closeCartButton = document.getElementById('closeCart');
const quickAddButtons = document.querySelectorAll('.quick-add');
const languageSelector = document.getElementById('languageSelector');

let cartItems = 0;
let cart = [];
let currentLocale = 'de';

const supportedLangs = i18nStore.languages.map((lang) => lang.code);
const fallbackBundle = i18nStore.translations.de || {};

function getDefaultLanguage() {
  const hostname = window.location.hostname.toLowerCase().replace(/^www\./, '');
  const domainMap = {
    'asteros-coffee.com': 'de',
    'de.asteros-coffee.com': 'de',
    'en.asteros-coffee.com': 'en',
    'fr.asteros-coffee.com': 'fr',
    'es.asteros-coffee.com': 'es',
    'it.asteros-coffee.com': 'it',
    'nl.asteros-coffee.com': 'nl',
    'pl.asteros-coffee.com': 'pl',
    'pt.asteros-coffee.com': 'pt',
    'sv.asteros-coffee.com': 'sv',
    'da.asteros-coffee.com': 'da',
    'no.asteros-coffee.com': 'no',
    'fi.asteros-coffee.com': 'fi',
    'cs.asteros-coffee.com': 'cs',
    'sk.asteros-coffee.com': 'sk',
    'ro.asteros-coffee.com': 'ro',
    'hu.asteros-coffee.com': 'hu',
    'el.asteros-coffee.com': 'el',
    'tr.asteros-coffee.com': 'tr',
    'hr.asteros-coffee.com': 'hr',
    'sl.asteros-coffee.com': 'sl',
    'et.asteros-coffee.com': 'et',
    'lv.asteros-coffee.com': 'lv',
    'lt.asteros-coffee.com': 'lt',
    'bg.asteros-coffee.com': 'bg',
  };

  if (domainMap[hostname]) return domainMap[hostname];

  const hostMatch = Object.keys(domainMap).find(
    (domain) => hostname.endsWith('.' + domain) || hostname === domain,
  );
  if (hostMatch) return domainMap[hostMatch];

  const browserLocale = (navigator.language || navigator.languages?.[0] || 'de')
    .slice(0, 2)
    .toLowerCase();
  if (supportedLangs.includes(browserLocale)) return browserLocale;

  return 'de';
}

function getTranslation(key, lang = currentLocale) {
  const bundle =
    i18nStore.translations[lang] || i18nStore.translations.de || {};
  return bundle[key] || fallbackBundle[key] || key;
}

function applyTranslations() {
  const nodes = document.querySelectorAll('[data-i18n]');
  nodes.forEach((element) => {
    const key = element.dataset.i18n;
    const value = getTranslation(key, currentLocale);
    if (value) {
      element.textContent = value;
    }
  });

  const placeholderNodes = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderNodes.forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    const value = getTranslation(key, currentLocale);
    if (value) {
      element.placeholder = value;
    }
  });

  const ariaNodes = document.querySelectorAll('[data-i18n-aria]');
  ariaNodes.forEach((element) => {
    const key = element.dataset.i18nAria;
    const value = getTranslation(key, currentLocale);
    if (value) {
      element.setAttribute('aria-label', value);
    }
  });

  const titleNodes = document.querySelectorAll('[data-i18n-title]');
  titleNodes.forEach((element) => {
    const key = element.dataset.i18nTitle;
    const value = getTranslation(key, currentLocale);
    if (value) {
      element.title = value;
    }
  });

  document.documentElement.lang = currentLocale;

  if (languageSelector) {
    languageSelector.value = currentLocale;
  }
}

function setLanguage(lang) {
  if (!supportedLangs.includes(lang)) {
    currentLocale = 'de';
  } else {
    currentLocale = lang;
  }

  i18nStore.locale = currentLocale;
  localStorage.setItem('asteros-language', currentLocale);
  applyTranslations();
  updateRecommendation();
}

currentLocale =
  localStorage.getItem('asteros-language') || getDefaultLanguage();
if (!supportedLangs.includes(currentLocale)) {
  currentLocale = 'de';
}

if (languageSelector) {
  languageSelector.addEventListener('change', (event) => {
    setLanguage(event.target.value);
  });
}

function setTheme(mode) {
  const isDark = mode === 'dark';
  document.body.classList.toggle('dark', isDark);
  if (themeToggle) {
    themeToggle.textContent = isDark ? '☾' : '☼';
  }
  localStorage.setItem('asteros-theme', mode);
}

const savedTheme = localStorage.getItem('asteros-theme');
if (savedTheme === 'dark') {
  setTheme('dark');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextMode = document.body.classList.contains('dark')
      ? 'light'
      : 'dark';
    setTheme(nextMode);
  });
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((item) => item.classList.remove('active'));
    chip.classList.add('active');

    const filter = chip.dataset.filter;
    cards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !matches);
    });
  });
});

function addToCart(productName, priceText) {
  cartItems += 1;
  if (cartCount) {
    cartCount.textContent = cartItems;
  }

  cart.push({ name: productName, price: priceText });
  renderCart();
  showToast(`${productName} ${getTranslation('toast.added', currentLocale)}`);
}

function renderCart() {
  if (!cartItemsList) return;

  cartItemsList.innerHTML = '';

  if (cart.length === 0) {
    cartItemsList.innerHTML = `<p class="empty-cart">${getTranslation('cart.empty', currentLocale)}</p>`;
    if (cartTotal) cartTotal.textContent = '€ 0,00';
    return;
  }

  cart.forEach((item) => {
    const element = document.createElement('div');
    element.className = 'cart-item';
    element.innerHTML = `
      <div class="cart-thumb" style="background-image:url('https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=500&q=80')"></div>
      <div>
        <h4>${item.name}</h4>
        <p>${item.price}</p>
      </div>
    `;
    cartItemsList.appendChild(element);
  });

  const total = cart.reduce((sum, item) => {
    const numeric =
      Number(
        String(item.price)
          .replace(/[^0-9,.-]/g, '')
          .replace('.', '')
          .replace(',', '.'),
      ) || 0;
    return sum + numeric;
  }, 0);

  if (cartTotal)
    cartTotal.textContent = `€ ${total.toFixed(2).replace('.', ',')}`;
}

buyButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.product-card');
    const productName =
      button.dataset.product ||
      card?.querySelector('h3')?.textContent ||
      'Produkt';
    const priceText = card?.querySelector('strong')?.textContent || '€ 0,00';
    addToCart(productName, priceText);

    const originalText = button.dataset.originalText || button.textContent;
    button.dataset.originalText = originalText;
    button.textContent = `${productName} · ${getTranslation('product.added', currentLocale)}`;
    setTimeout(() => {
      button.textContent = originalText;
    }, 1200);

    if (cartDrawer) {
      cartDrawer.classList.add('open');
      if (cartOverlay) cartOverlay.classList.add('open');
    }
  });
});

quickViewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const productName = button.dataset.product || 'Produkt';
    const priceText = button.dataset.price || '€ 0,00';
    const description =
      button.dataset.description || 'Premium Kaffee aus Äthiopien.';
    const imageName = button.dataset.image || 'image-1';

    if (!modal) return;

    const modalTitle = modal.querySelector('#modalProductTitle');
    const modalPrice = modal.querySelector('#modalProductPrice');
    const modalDescription = modal.querySelector('#modalProductDescription');
    const modalImage = modal.querySelector('#modalProductImage');

    if (modalTitle) modalTitle.textContent = productName;
    if (modalPrice) modalPrice.textContent = priceText;
    if (modalDescription) modalDescription.textContent = description;
    if (modalImage) {
      const imageUrlMap = {
        'image-1':
          'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80',
        'image-2':
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
        'image-3':
          'https://images.unsplash.com/photo-1461988091159-192b6df7054f?auto=format&fit=crop&w=900&q=80',
        'image-4':
          'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80',
      };
      modalImage.style.backgroundImage = `url('${imageUrlMap[imageName] || imageUrlMap['image-1']}')`;
    }

    modal.classList.add('open');
  });
});

if (closeModalButton && modal) {
  closeModalButton.addEventListener('click', () =>
    modal.classList.remove('open'),
  );
}

if (modal) {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.classList.remove('open');
    }
  });
}

if (closeCartButton) {
  closeCartButton.addEventListener('click', () => {
    cartDrawer?.classList.remove('open');
    cartOverlay?.classList.remove('open');
  });
}

const cartToggle = document.querySelector('.cart-pill');
if (cartToggle) {
  cartToggle.addEventListener('click', () => {
    if (cartDrawer) {
      cartDrawer.classList.toggle('open');
      if (cartOverlay) cartOverlay.classList.toggle('open');
    }
  });
}

if (cartOverlay) {
  cartOverlay.addEventListener('click', () => {
    cartDrawer?.classList.remove('open');
    cartOverlay.classList.remove('open');
  });
}

const quickAddButtonsList = document.querySelectorAll('.quick-add');
quickAddButtonsList.forEach((button) => {
  button.addEventListener('click', () => {
    const productName =
      button.dataset.product ||
      document.getElementById('modalProductTitle')?.textContent ||
      'Produkt';
    const productPrice =
      document.getElementById('modalProductPrice')?.textContent || '€ 0,00';
    addToCart(productName, productPrice);
    modal?.classList.remove('open');
    cartDrawer?.classList.add('open');
    cartOverlay?.classList.add('open');
  });
});

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

const optionGroups = document.querySelectorAll('.option-btn');
const recommendationTitle = document.getElementById('recommendationTitle');
const recommendationText = document.getElementById('recommendationText');

const selected = {
  profile: 'blumig',
  brew: 'filter',
};

function updateRecommendation() {
  const profile = selected.profile;
  const brew = selected.brew;

  let title = 'Yirgacheffe';
  let text =
    'Blumig, süß und äußerst aromatisch – perfekt für ruhige Morgenrituale.';

  if (profile === 'süss' && brew === 'espresso') {
    title = 'Akosua Espresso';
    text =
      'Sanft süß, vollmundig und wunderbar ausgewogen – ideal für die perfekte Espresso-Routine.';
  } else if (profile === 'kräftig' && brew === 'crema') {
    title = 'Dishttaginaa';
    text =
      'Kraftvoll, cremig und tiefgründig – für alle, die einen intensiven, satten Genuss mögen.';
  } else if (profile === 'blumig' && brew === 'filter') {
    title = 'Yirgacheffe';
    text =
      'Blumig, zart und elegant – ideal für den ruhigen Filterkaffee-Moment am Morgen.';
  } else if (profile === 'süss' && brew === 'filter') {
    title = 'Gorahgorah';
    text =
      'Honigartig, weich und lichtvoll – ein wunderbarer Kaffee für entspannte Brühmomente.';
  } else if (profile === 'kräftig' && brew === 'espresso') {
    title = 'Akosua Espresso';
    text =
      'Kraftvoll mit Körper und einem langen, würzigen Finish – perfekt für starke Espresso-Momente.';
  }

  if (recommendationTitle) recommendationTitle.textContent = title;
  if (recommendationText) recommendationText.textContent = text;
}

optionGroups.forEach((button) => {
  button.addEventListener('click', () => {
    const group = button.closest('.option-group');
    const question = group?.dataset.question;

    group
      ?.querySelectorAll('.option-btn')
      .forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    if (question) {
      selected[question] = button.dataset.value;
    }

    updateRecommendation();
  });
});

let testimonialIndex = 0;
setInterval(() => {
  testimonials.forEach((slide, index) => {
    slide.classList.toggle('active', index === testimonialIndex);
  });
  testimonialIndex = (testimonialIndex + 1) % testimonials.length;
}, 3500);

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = newsletterForm.querySelector('button');
    if (button) {
      button.textContent = getTranslation('newsletter.success', currentLocale);
      button.disabled = true;
    }

    setTimeout(() => {
      if (button) {
        button.textContent = getTranslation('newsletter.button', currentLocale);
        button.disabled = false;
      }
      newsletterForm.reset();
    }, 1800);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.15 },
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

setLanguage(currentLocale);
renderCart();
