// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Сайт загружен!');

    // Инициализация модального окна
    initModal();

    // Плавная прокрутка для навигации
    initSmoothScroll();

    // Бургер меню для мобильных устройств
    initBurgerMenu();

    // Обработчики кнопок бронирования
    initBookingButtons();

    // Интерактивные карточки
    initCardSelection();
});

// Модальное окно
function initModal() {
    const modal = document.getElementById('callbackModal');
    const callbackBtn = document.getElementById('callbackBtn');
    const closeBtn = document.querySelector('.modal-close');
    const form = document.getElementById('callbackForm');

    // Открытие модального окна
    if (callbackBtn) {
        callbackBtn.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Блокируем прокрутку фона
        });
    }

    // Закрытие модального окна
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Закрытие при клике вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Восстанавливаем прокрутку
    }

    // Обработка отправки формы
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Получаем данные из формы
            const name = form.querySelector('input[type="text"]').value;
            const phone = form.querySelector('input[type="tel"]').value;
            const comment = form.querySelector('textarea').value;

            // Формируем данные для отправки
            const data = {
                phoneNumber: phone,
                name: name,
                comment: comment || null  // Отправляем null если комментарий пустой
            };

            // Определяем URL API в зависимости от окружения
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const apiUrl = isLocalhost
                ? 'http://localhost:8080/phones'  // Локальная разработка
                : '/api/phones';  // Продакшен (через nginx proxy)

            console.log('Отправка на:', apiUrl);

            try {
                // Отправляем POST запрос
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    // Успешная отправка
                    const result = await response.json();
                    console.log('Успешно отправлено:', result);
                    alert('Спасибо! Мы вам перезвоним в ближайшее время.');
                    closeModal();
                    form.reset();
                } else {
                    // Ошибка от сервера
                    console.error('Ошибка сервера:', response.status);
                    alert('Произошла ошибка при отправке. Попробуйте позже или позвоните нам.');
                }
            } catch (error) {
                // Ошибка сети или CORS
                console.error('Ошибка:', error);

                // Проверяем тип ошибки
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    alert('⚠️ CORS ошибка!\n\nНастройте CORS на backend сервере (localhost:8080).\n\nИли позвоните нам: +7 (999) 123-45-67');
                } else {
                    alert('Не удалось отправить запрос. Проверьте подключение к интернету или позвоните нам: +7 (999) 123-45-67');
                }
            }
        });
    }
}

// Плавная прокрутка к секциям
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');

            if (targetId === '#') return;

            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerOffset = 80; // Высота sticky header
                const elementPosition = targetSection.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Закрываем мобильное меню если открыто
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            }
        });
    });
}

// Бургер меню для мобильных устройств
function initBurgerMenu() {
    const burgerMenu = document.getElementById('burgerMenu');
    const navMenu = document.querySelector('.nav-menu');

    if (burgerMenu && navMenu) {
        burgerMenu.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            burgerMenu.classList.toggle('active');

            // Анимация бургера
            const spans = burgerMenu.querySelectorAll('span');
            if (burgerMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
            }
        });
    }
}

// Обработчики кнопок бронирования
function initBookingButtons() {
    const bookBtn = document.getElementById('bookBtn');
    const pricingButtons = document.querySelectorAll('.pricing-card button');
    const modal = document.getElementById('callbackModal');

    // Кнопка в hero секции
    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Кнопки в карточках тарифов
    pricingButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
}

// Анимация появления элементов при скролле (опционально)
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Наблюдаем за элементами
    const animatedElements = document.querySelectorAll('.advantage-card, .pricing-card, .gallery-item');
    animatedElements.forEach(el => observer.observe(el));
}

// Раскомментируйте для включения анимации при скролле
// initScrollAnimations();

// Интерактивные карточки с выделением при клике
function initCardSelection() {
    // Карточки преимуществ
    const advantageCards = document.querySelectorAll('.advantage-card');
    advantageCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
        });
    });

    // Карточки тарифов (только одна может быть выбрана)
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Если клик был на кнопке, не обрабатываем выделение
            if (e.target.tagName === 'BUTTON') return;

            // Снимаем выделение со всех карточек
            pricingCards.forEach(c => c.classList.remove('selected'));

            // Выделяем текущую карточку
            card.classList.add('selected');
        });
    });
}
