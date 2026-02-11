/**
 * HelpDesk — главная страница центра поддержки
 * Обработка поиска и анимация карточек категорий
 */

document.addEventListener('DOMContentLoaded', initHelpDesk);

function initHelpDesk() {
    initSearch();
    animateCategoryCards();
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
            alert(`Ищем ответ на: "${query}"...`);
            searchInput.classList.remove('is-invalid');
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
    const cards = document.querySelectorAll('.category-card');
    
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
