const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const navLinks = navigation ? Array.from(navigation.querySelectorAll('a')) : [];

const closeMenu = () => {
  navigation?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  if (menuButton) menuButton.querySelector('i').className = 'fa-solid fa-bars';
};

const getCurrentNavTarget = () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  if (page === 'about.html') {
    return './about.html';
  }

  return window.location.hash || '#home';
};

const setActiveNavLink = (target = getCurrentNavTarget()) => {
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const isHomeLink = target === '#home' && (href === '#home' || href === './index.html#home');
    link.classList.toggle('is-active', href === target || isHomeLink);
  });
};

menuButton?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', isOpen);
  menuButton.querySelector('i').className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    setActiveNavLink(link.getAttribute('href'));
    closeMenu();
  });
});

document.addEventListener('click', (event) => {
  if (!navigation?.classList.contains('is-open')) return;
  if (navigation.contains(event.target) || menuButton?.contains(event.target)) return;
  closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 800) closeMenu();
});

window.addEventListener('hashchange', () => setActiveNavLink());
setActiveNavLink();

document.querySelector('#year').textContent = new Date().getFullYear();
