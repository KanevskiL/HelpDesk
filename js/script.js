/**
 * HelpDesk — главная страница центра поддержки
 * Обработка поиска и анимация карточек категорий
 */

document.addEventListener('DOMContentLoaded', initHelpDesk);

function initHelpDesk() {
    initSearch();
    animateCategoryCards();
    initFAQToggles();
}

/**
 * Инициализация поиска
 */
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (!searchBtn || !searchInput) return;

    const performSearch = () => {
        const query = searchInput.value.trim();

        if (query) {
            console.log('Поиск:', query);
            // пока простая имитация поиска — в дальнейшем можно подключить локальный FAQ/JSON
            searchInput.classList.remove('is-invalid');
            const searchResult = document.getElementById('searchResult');
            if (searchResult) {
                searchResult.innerHTML = `<div class="alert alert-info">Поиск по запросу «${query}» выполнен (демо).</div>`;
            } else {
                alert(`Ищем ответ на: "${query}"...`);
            }
        } else {
            searchInput.classList.add('is-invalid');
            setTimeout(() => {
                searchInput.classList.remove('is-invalid');
            }, 1000);
        }
    };

    searchBtn.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            performSearch();
        }
    });
}

/**
 * Анимация появления карточек категорий
 */
function animateCategoryCards() {
    const cards = document.querySelectorAll('.categories__card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

/**
 * Инициализация всплывающих ответов для секции FAQ
 */
/**
 * Показывает/скрывает ответ внизу страницы. При открытии другого — закрывает предыдущий.
 */
function initFAQToggles(){
    const links = document.querySelectorAll('.faq__link');
    if(!links.length) return;

    links.forEach((link) => {
        link.setAttribute('role','button');
        link.setAttribute('aria-expanded','false');

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const li = link.closest('.faq__item');
            if(!li) return;
            const answer = li.querySelector('.faq__answer');
            if(!answer) return;

            const isOpen = !answer.hasAttribute('hidden');

            // Close all other answers
            document.querySelectorAll('.faq__item--open').forEach(openLi => {
                if(openLi !== li){
                    openLi.classList.remove('faq-item--open');
                    const openAnswer = openLi.querySelector('.faq__answer');
                    const openLink = openLi.querySelector('.faq__link');
                    if(openAnswer) openAnswer.setAttribute('hidden','');
                    if(openLink) openLink.setAttribute('aria-expanded','false');
                }
            });

            if(isOpen){
                answer.setAttribute('hidden','');
                li.classList.remove('faq__item--open');
                link.setAttribute('aria-expanded','false');
            } else {
                answer.removeAttribute('hidden');
                li.classList.add('faq__item--open');
                link.setAttribute('aria-expanded','true');
                // ensure answer is visible below the question
                answer.scrollIntoView({behavior: 'smooth', block: 'nearest'});
            }
        });

        link.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); link.click(); } });
    });
}
