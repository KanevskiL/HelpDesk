let currentEditingItem = null;
let currentEditingOriginalQuestion = null;

document.addEventListener('DOMContentLoaded', initHelpDesk);

async function initHelpDesk() {
  initBurgerMenu();
  initSearch();
  initFaqAccordion();
  initAddQuestionForm();
  animateCategoryCards();
  await loadFaqApiAndRender();
  loadFaqsFromStorage();
  animateFaqItems();
}

function getFaqListEl() {
  return document.getElementById('faqList');
}

function removeApiFaqItems(faqList) {
  faqList.querySelectorAll('.faq-item--api').forEach((node) => node.remove());
}

function setFaqStatus(message, isError) {
  const el = document.getElementById('faq-status');
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('faq-status--error', Boolean(isError));
  el.classList.toggle('visually-hidden', !message);
  el.setAttribute('aria-live', 'polite');
}

async function loadFaqApiAndRender() {
  const faqList = getFaqListEl();
  if (!faqList) return;

  const cacheKey = HelpDeskConfig.FAQ_CACHE_KEY;
  setFaqStatus('Loading…', false);

  try {
    let raw = getFromCache(cacheKey);

    if (raw === null) {
      raw = await fetchFAQ();
      saveToCache(cacheKey, raw);
    }

    let items = parseFAQData(raw);
    const max = HelpDeskConfig.FAQ_MAX_ITEMS;
    if (typeof max === 'number' && max > 0) {
      items = items.slice(0, max);
    }
    removeApiFaqItems(faqList);
    items.forEach((faq) => {
      faqList.appendChild(createApiFaqListItem(faq));
    });

    setFaqStatus('', false);
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Не удалось загрузить вопросы. Проверьте соединение.';
    setFaqStatus(`Ошибка: ${msg}`, true);
    removeApiFaqItems(faqList);
  }
}

function createApiFaqListItem(faq) {
  const safeId = String(faq.id).replace(/\W/g, '-');
  const li = document.createElement('li');
  li.className = 'faq-item faq-item--api';
  li.dataset.source = 'api';
  li.setAttribute('itemprop', 'mainEntity');
  li.setAttribute('itemscope', '');
  li.setAttribute('itemtype', 'https://schema.org/Question');

  li.innerHTML = `
    <a href="#" class="faq-link" aria-expanded="false" aria-controls="faq-answer-api-${safeId}" id="faq-link-api-${safeId}">
      <span class="faq-link-text" itemprop="name"></span>
      <img src="images/icon-chevron.svg" alt="" class="faq-link-icon">
    </a>
    <div class="faq-answer" id="faq-answer-api-${safeId}" itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
      <div itemprop="text"></div>
    </div>
  `;

  li.querySelector('.faq-link-text').textContent = faq.question;
  li.querySelector('.faq-answer [itemprop="text"]').textContent = faq.answer;

  return li;
}

function initFaqAccordion() {
  const faqContainer = document.getElementById('faq-container');
  if (!faqContainer) return;

  faqContainer.addEventListener('click', (e) => {
    const link = e.target.closest('.faq-link');
    if (!link) return;

    e.preventDefault();
    const item = link.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    faqContainer.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
    faqContainer.querySelectorAll('.faq-link').forEach((l) => l.setAttribute('aria-expanded', 'false'));

    if (!isOpen) {
      item.classList.add('open');
      link.setAttribute('aria-expanded', 'true');
    }
  });
}

function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const form = document.getElementById('faqSearchForm');
  if (!searchInput) return;

  const performSearch = () => {
    const query = searchInput.value.trim().toLowerCase();
    const faqItems = document.querySelectorAll('#faqList .faq-item');

    faqItems.forEach((item) => {
      const questionEl = item.querySelector('.faq-link-text');
      const questionText = questionEl ? questionEl.textContent.toLowerCase() : '';
      const answerEl = item.querySelector('.faq-answer [itemprop="text"]');
      const answerText = answerEl ? answerEl.textContent.toLowerCase() : '';

      const match = !query || questionText.includes(query) || answerText.includes(query);
      item.style.display = match ? '' : 'none';
    });
  };

  searchInput.addEventListener('input', performSearch);
  if (searchBtn) searchBtn.addEventListener('click', (e) => e.preventDefault());
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      performSearch();
    });
  }
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });
}

function initAddQuestionForm() {
  const form = document.getElementById('addFaqForm');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const questionInput = document.getElementById('newQuestion');
    const answerInput = document.getElementById('newAnswer');

    const newFaq = {
      question: questionInput.value.trim(),
      answer: answerInput.value.trim(),
    };

    if (newFaq.question && newFaq.answer) {
      if (currentEditingItem) {
        currentEditingItem.querySelector('.faq-link-text').textContent = newFaq.question;
        currentEditingItem.querySelector('.faq-answer div[itemprop="text"]').textContent = newFaq.answer;

        editFaqInStorage(currentEditingOriginalQuestion, newFaq);

        currentEditingItem = null;
        currentEditingOriginalQuestion = null;
        submitBtn.textContent = 'Сохранить вопрос';
      } else {
        addFaqToDOM(newFaq);
        saveFaqToStorage(newFaq);
      }

      form.reset();
    }
  });
}

function addFaqToDOM(faq) {
  const faqList = getFaqListEl();
  if (!faqList) return;

  const newId = Date.now();

  const li = document.createElement('li');
  li.className = 'faq-item faq-item--user';
  li.setAttribute('itemprop', 'mainEntity');
  li.setAttribute('itemscope', '');
  li.setAttribute('itemtype', 'https://schema.org/Question');

  li.innerHTML = `
    <a href="#" class="faq-link" aria-expanded="false" aria-controls="faq-answer-${newId}" id="faq-link-${newId}">
      <span class="faq-link-text" itemprop="name">${escapeHtml(faq.question)}</span>
      <img src="images/icon-chevron.svg" alt="" class="faq-link-icon">
    </a>
    <div class="faq-answer" id="faq-answer-${newId}" itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
      <div itemprop="text">${escapeHtml(faq.answer)}</div>
      <div class="faq-item-actions">
        <button type="button" class="faq-action-btn faq-action-btn--edit">Редактировать</button>
        <button type="button" class="faq-action-btn faq-action-btn--delete">Удалить</button>
      </div>
    </div>
  `;

  const deleteBtn = li.querySelector('.faq-action-btn--delete');
  deleteBtn.addEventListener('click', function (e) {
    e.preventDefault();
    li.remove();
    removeFaqFromStorage(faq.question);
  });

  const editBtn = li.querySelector('.faq-action-btn--edit');
  editBtn.addEventListener('click', function (e) {
    e.preventDefault();

    const addForm = document.getElementById('addFaqForm');
    const questionInput = document.getElementById('newQuestion');
    const answerInput = document.getElementById('newAnswer');
    questionInput.value = li.querySelector('.faq-link-text').textContent;
    answerInput.value = li.querySelector('.faq-answer div[itemprop="text"]').textContent;

    currentEditingItem = li;
    currentEditingOriginalQuestion = questionInput.value;

    if (addForm) {
      addForm.querySelector('button[type="submit"]').textContent = 'Сохранить изменения';
      addForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  faqList.appendChild(li);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function userFaqsKey() {
  return HelpDeskConfig.USER_FAQS_KEY;
}

function saveFaqToStorage(faq) {
  let faqs = JSON.parse(localStorage.getItem(userFaqsKey())) || [];
  faqs.push(faq);
  localStorage.setItem(userFaqsKey(), JSON.stringify(faqs));
}

function loadFaqsFromStorage() {
  let faqs = JSON.parse(localStorage.getItem(userFaqsKey())) || [];
  faqs.forEach((faq) => addFaqToDOM(faq));
}

function removeFaqFromStorage(questionText) {
  let faqs = JSON.parse(localStorage.getItem(userFaqsKey())) || [];
  faqs = faqs.filter((faq) => faq.question !== questionText);
  localStorage.setItem(userFaqsKey(), JSON.stringify(faqs));
}

function editFaqInStorage(oldQuestionText, newFaqData) {
  let faqs = JSON.parse(localStorage.getItem(userFaqsKey())) || [];
  const index = faqs.findIndex((faq) => faq.question === oldQuestionText);
  if (index !== -1) {
    faqs[index] = newFaqData;
    localStorage.setItem(userFaqsKey(), JSON.stringify(faqs));
  }
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
    if (window.innerWidth < 768 && navbarMenu.classList.contains('open')) {
      if (!burgerBtn.contains(e.target) && !navbarMenu.contains(e.target)) {
        navbarMenu.classList.remove('open');
        burgerBtn.classList.remove('active');
        burgerBtn.setAttribute('aria-expanded', 'false');
        burgerBtn.setAttribute('aria-label', 'Открыть меню');
      }
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
  const items = document.querySelectorAll('#faqList .faq-item');
  items.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    setTimeout(() => {
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    }, 400 + i * 50);
  });
}
