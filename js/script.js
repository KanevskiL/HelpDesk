
let currentEditingItem = null; 
let currentEditingOriginalQuestion = null; 
document.addEventListener('DOMContentLoaded', initHelpDesk);

function initHelpDesk() {
  initSearch();
  initBurgerMenu();
  initFaqAccordion();
  initAddQuestionForm(); 
  loadFaqsFromStorage(); 
  animateCategoryCards();
  animateFaqItems();
}

function initFaqAccordion() {
  const faqList = document.querySelector('.faq-list');
  if (!faqList) return;

  faqList.addEventListener('click', (e) => {
    const link = e.target.closest('.faq-link');
    if (!link) return;

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
}

function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  if (!searchInput) return;

  const performSearch = () => {
    const query = searchInput.value.trim().toLowerCase();
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const questionText = item.querySelector('.faq-link-text').textContent.toLowerCase();
      
      if (questionText.includes(query)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
    
    console.log('Поиск выполнен по запросу:', query);
  };

  searchInput.addEventListener('input', performSearch);
  
  if(searchBtn) searchBtn.addEventListener('click', performSearch);
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
      answer: answerInput.value.trim()
    };

    if (newFaq.question && newFaq.answer) {
      if (currentEditingItem) {
        currentEditingItem.querySelector('.faq-link-text').textContent = newFaq.question;
        currentEditingItem.querySelector('.faq-answer div[itemprop="text"]').textContent = newFaq.answer;
        
        editFaqInStorage(currentEditingOriginalQuestion, newFaq);
        console.log('Вопрос отредактирован:', newFaq);

        currentEditingItem = null;
        currentEditingOriginalQuestion = null;
        submitBtn.textContent = 'Сохранить вопрос'; 
      } else {
        addFaqToDOM(newFaq); 
        saveFaqToStorage(newFaq); 
        console.log('Новый вопрос успешно добавлен:', newFaq);
      }
      
      form.reset(); 
    }
  });
}

function addFaqToDOM(faq) {
  const faqList = document.querySelector('.faq-list');
  const newId = Date.now(); 

  const li = document.createElement('li');
  li.className = 'faq-item';
  li.setAttribute('itemprop', 'mainEntity');
  li.setAttribute('itemscope', '');
  li.setAttribute('itemtype', 'https://schema.org/Question');

  li.innerHTML = `
    <a href="#" class="faq-link" aria-expanded="false" aria-controls="faq-answer-${newId}" id="faq-link-${newId}">
      <span class="faq-link-text" itemprop="name">${faq.question}</span>
      <img src="images/icon-chevron.svg" alt="" class="faq-link-icon">
    </a>
    <div class="faq-answer" id="faq-answer-${newId}" itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
      <div itemprop="text">${faq.answer}</div>
      <div style="margin-top: 15px; display: flex; gap: 10px;">
        <button class="edit-btn" style="color: #0056b3; cursor: pointer; border: none; background: none; font-size: 14px; text-decoration: underline; padding: 0;">Редактировать</button>
        <button class="delete-btn" style="color: red; cursor: pointer; border: none; background: none; font-size: 14px; text-decoration: underline; padding: 0;">Удалить</button>
      </div>
    </div>
  `;

  const deleteBtn = li.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', function(e) {
    e.preventDefault(); 
    li.remove(); 
    removeFaqFromStorage(faq.question); 
    console.log('Вопрос удален:', faq.question);
  });

  const editBtn = li.querySelector('.edit-btn');
  editBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    const questionInput = document.getElementById('newQuestion');
    const answerInput = document.getElementById('newAnswer');
    questionInput.value = li.querySelector('.faq-link-text').textContent;
    answerInput.value = li.querySelector('.faq-answer div[itemprop="text"]').textContent;

    currentEditingItem = li;
    currentEditingOriginalQuestion = questionInput.value;

    const form = document.getElementById('addFaqForm');
    form.querySelector('button[type="submit"]').textContent = 'Сохранить изменения';
    
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  faqList.appendChild(li);
}

function saveFaqToStorage(faq) {
  let faqs = JSON.parse(localStorage.getItem('helpdesk_faqs')) || [];
  faqs.push(faq);
  localStorage.setItem('helpdesk_faqs', JSON.stringify(faqs));
}

function loadFaqsFromStorage() {
  let faqs = JSON.parse(localStorage.getItem('helpdesk_faqs')) || [];
  faqs.forEach(faq => addFaqToDOM(faq));
}

function removeFaqFromStorage(questionText) {
  let faqs = JSON.parse(localStorage.getItem('helpdesk_faqs')) || [];
  faqs = faqs.filter(faq => faq.question !== questionText);
  localStorage.setItem('helpdesk_faqs', JSON.stringify(faqs));
}

function editFaqInStorage(oldQuestionText, newFaqData) {
  let faqs = JSON.parse(localStorage.getItem('helpdesk_faqs')) || [];
  const index = faqs.findIndex(faq => faq.question === oldQuestionText);
  if (index !== -1) {
    faqs[index] = newFaqData; 
    localStorage.setItem('helpdesk_faqs', JSON.stringify(faqs));
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