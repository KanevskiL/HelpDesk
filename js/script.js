/**
 * HelpDesk — главная страница центра поддержки
 */

document.addEventListener('DOMContentLoaded', initHelpDesk);

function initHelpDesk() {
  initSearch();
  initBurgerMenu();
  initFaqAccordion();
  animateCategoryCards();
  animateFaqItems();
}

function initFaqAccordion() {
  document.querySelectorAll('.faq-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const item = link.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      document.querySelectorAll('.faq-link').forEach((l) => l.setAttribute('aria-expanded', 'false'));
      if (!isOpen) {
        item.classList.add('open');
        link.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function initBurgerMenu() {
  const burgerBtn = document.getElementById('burgerBtn');
  const navbarMenu = document.getElementById('navbarMenu');
  if (!burgerBtn || !navbarMenu) return;

  burgerBtn.addEventListener('click', () => {
    const isOpen = navbarMenu.classList.contains('open');
    navbarMenu.classList.toggle('open');
    burgerBtn.classList.toggle('active');
    burgerBtn.setAttribute('aria-expanded', !isOpen);
    burgerBtn.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 767 && navbarMenu.classList.contains('open')) {
      if (!burgerBtn.contains(e.target) && !navbarMenu.contains(e.target)) {
        navbarMenu.classList.remove('open');
        burgerBtn.classList.remove('active');
        burgerBtn.setAttribute('aria-expanded', 'false');
        burgerBtn.setAttribute('aria-label', 'Открыть меню');
      }
    }
  });
}

function initSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  if (!searchBtn || !searchInput) return;

  const performSearch = () => {
    const query = searchInput.value.trim();
    if (query) {
      console.log('Поиск:', query);
      alert(`Ищем ответ на: "${query}"...`);
      searchInput.classList.remove('is-invalid');
    } else {
      searchInput.classList.add('is-invalid');
      setTimeout(() => searchInput.classList.remove('is-invalid'), 1000);
    }
  };

  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });
}

function animateCategoryCards() {
  const cards = document.querySelectorAll('.category-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 150);
  });
}

function animateFaqItems() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    setTimeout(() => {
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    }, 400 + i * 100);
  });
}
