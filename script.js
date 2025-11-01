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

    // Инициализация Яндекс.Карты
    initYandexMap();
});

// Функция показа красивого уведомления
function showNotification(title, message) {
    const notification = document.getElementById('successNotification');
    const titleElement = document.getElementById('notificationTitle');
    const messageElement = document.getElementById('notificationMessage');
    const okBtn = document.getElementById('notificationOkBtn');

    titleElement.textContent = title;
    messageElement.textContent = message;

    notification.classList.add('show');

    // Закрытие по кнопке ОК
    const closeNotification = () => {
        notification.classList.remove('show');
        okBtn.removeEventListener('click', closeNotification);
    };

    okBtn.addEventListener('click', closeNotification);

    // Автоматическое закрытие через 10 секунд (если пользователь не нажал ОК)
    setTimeout(() => {
        notification.classList.remove('show');
        okBtn.removeEventListener('click', closeNotification);
    }, 10000);
}

// Модальное окно
function initModal() {
    const modal = document.getElementById('callbackModal');
    const callbackBtn = document.getElementById('callbackBtn');
    const closeBtn = document.querySelector('.modal-close');
    const form = document.getElementById('callbackForm');

    // Форматирование телефона в форме обратного звонка
    const callbackPhoneInput = form ? form.querySelector('input[type="tel"]') : null;
    if (callbackPhoneInput) {
        callbackPhoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.startsWith('8')) {
                value = '7' + value.slice(1);
            }

            if (!value.startsWith('7')) {
                value = '7' + value;
            }

            value = value.slice(0, 11);

            let formatted = '+7';
            if (value.length > 1) {
                formatted += ' (' + value.slice(1, 4);
            }
            if (value.length >= 5) {
                formatted += ') ' + value.slice(4, 7);
            }
            if (value.length >= 8) {
                formatted += '-' + value.slice(7, 9);
            }
            if (value.length >= 10) {
                formatted += '-' + value.slice(9, 11);
            }

            e.target.value = formatted;
        });

        callbackPhoneInput.addEventListener('focus', function(e) {
            if (!e.target.value) {
                e.target.value = '+7 ';
            }
        });
    }

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
                    showNotification('Спасибо!', 'Мы вам перезвоним в ближайшее время');
                    closeModal();
                    form.reset();
                } else {
                    // Ошибка от сервера
                    console.error('Ошибка сервера:', response.status);
                    showNotification('Ошибка', 'Произошла ошибка при отправке. Попробуйте позже или позвоните нам');
                }
            } catch (error) {
                // Ошибка сети или CORS
                console.error('Ошибка:', error);

                // Проверяем тип ошибки
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    showNotification('Ошибка подключения', 'Не удалось связаться с сервером. Позвоните нам: +7 (999) 123-45-67');
                } else {
                    showNotification('Ошибка', 'Проверьте подключение к интернету или позвоните нам: +7 (999) 123-45-67');
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
    const bookingModal = document.getElementById('bookingModal');
    const bookingForm = document.getElementById('bookingForm');
    const bookingCloseBtn = bookingModal.querySelector('.modal-close');

    // Инициализация Flatpickr для красивого выбора даты
    const dateInput = document.getElementById('desiredDate');
    if (dateInput) {
        flatpickr(dateInput, {
            locale: "ru",
            minDate: "today",
            dateFormat: "d.m.Y",
            disableMobile: true,
            clickOpens: true,
            allowInput: false,
            theme: "material_green",
            monthSelectorType: 'static',
            onReady: function(selectedDates, dateStr, instance) {
                console.log('Flatpickr готов');
            },
            onChange: function(selectedDates, dateStr, instance) {
                console.log('Выбрана дата:', dateStr);
            }
        });
    }

    // Форматирование телефонного номера
    const phoneInput = document.getElementById('clientPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Убираем все нецифровые символы

            // Если пользователь начал вводить с 8, заменяем на 7
            if (value.startsWith('8')) {
                value = '7' + value.slice(1);
            }

            // Если не начинается с 7, добавляем 7 в начало
            if (!value.startsWith('7')) {
                value = '7' + value;
            }

            // Ограничиваем длину (7 + 10 цифр)
            value = value.slice(0, 11);

            // Форматируем: +7 (999) 123-45-67
            let formatted = '+7';
            if (value.length > 1) {
                formatted += ' (' + value.slice(1, 4);
            }
            if (value.length >= 5) {
                formatted += ') ' + value.slice(4, 7);
            }
            if (value.length >= 8) {
                formatted += '-' + value.slice(7, 9);
            }
            if (value.length >= 10) {
                formatted += '-' + value.slice(9, 11);
            }

            e.target.value = formatted;
        });

        // При фокусе, если поле пустое, вставляем +7
        phoneInput.addEventListener('focus', function(e) {
            if (!e.target.value) {
                e.target.value = '+7 ';
            }
        });
    }

    // Кнопка в hero секции
    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            bookingModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Кнопки в карточках тарифов
    pricingButtons.forEach(button => {
        button.addEventListener('click', () => {
            bookingModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Закрытие модального окна бронирования
    if (bookingCloseBtn) {
        bookingCloseBtn.addEventListener('click', closeBookingModal);
    }

    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            closeBookingModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bookingModal.classList.contains('active')) {
            closeBookingModal();
        }
    });

    function closeBookingModal() {
        bookingModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Обработка отправки формы бронирования
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Получаем данные из формы
            const desiredDate = document.getElementById('desiredDate').value;
            const clientName = document.getElementById('clientName').value;
            const clientPhone = document.getElementById('clientPhone').value;
            const comment = document.getElementById('bookingComment').value;

            // Формируем данные для отправки
            const data = {
                desiredDate: desiredDate,
                clientName: clientName,
                clientPhone: clientPhone,
                comment: comment || null
            };

            // Определяем URL API
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const apiUrl = isLocalhost
                ? 'http://localhost:8080/client-booking-requests'
                : '/api/client-booking-requests';

            console.log('Отправка заявки на бронирование:', apiUrl, data);

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Заявка успешно создана:', result);
                    showNotification('Спасибо!', 'Ваша заявка принята. Мы свяжемся с вами в ближайшее время для подтверждения бронирования');
                    closeBookingModal();
                    bookingForm.reset();
                } else {
                    const errorData = await response.json();
                    console.error('Ошибка сервера:', response.status, errorData);
                    showNotification('Ошибка', 'Произошла ошибка при отправке заявки. Попробуйте позже или позвоните нам');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                showNotification('Ошибка', 'Не удалось отправить заявку. Проверьте подключение или позвоните нам: +7 (999) 123-45-67');
            }
        });
    }
}

// Инициализация Яндекс.Карты
function initYandexMap() {
    // Проверяем, загружен ли API Яндекс.Карт
    if (typeof ymaps === 'undefined') {
        console.log('Яндекс.Карты не загружены');
        return;
    }

    ymaps.ready(function () {
        // Точные координаты: Фестивальная улица, 23с2, Сергиев Посад
        const coordinates = [56.292633, 38.165491];

        const myMap = new ymaps.Map('yandex-map', {
            center: coordinates,
            zoom: 17,
            controls: ['zoomControl', 'fullscreenControl']
        });

        // Добавляем метку на карту
        const placemark = new ymaps.Placemark(coordinates, {
            balloonContentHeader: '<strong>Платформа</strong>',
            balloonContentBody: 'Фестивальная улица, 23с2<br>Сергиев Посад',
            balloonContentFooter: 'Современное пространство для мероприятий',
            hintContent: 'Платформа - пространство для ваших событий'
        }, {
            preset: 'islands#greenIcon',
            iconColor: '#587C4A'
        });

        myMap.geoObjects.add(placemark);

        // Отключаем прокрутку карты колесом мыши (чтобы не мешала прокрутке страницы)
        myMap.behaviors.disable('scrollZoom');
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
