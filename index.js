// --- БЛОК ДАННЫХ ---
let popularCities = [];

// --- ЗАГРУЗКА ГОРОДОВ ИЗ JSON ---
async function loadCities() {
    try {
        const response = await fetch("cities.json"); // путь к json
        if (!response.ok) throw new Error("Ошибка загрузки JSON");

        popularCities = await response.json();

        console.log("Города загружены:", popularCities.length);
    } catch (error) {
        console.error("Не удалось загрузить cities.json:", error);
    }
}


// Функция с плавной сменой направлений
function swapCities() {
    const fromInput = document.getElementById('fromCity');
    const toInput = document.getElementById('toCity');
    
    // Сохраняем значения
    const fromValue = fromInput.value;
    const toValue = toInput.value;
    
    // Плавно очищаем поля
    fromInput.style.transition = 'opacity 0.2s';
    toInput.style.transition = 'opacity 0.2s';
    fromInput.style.opacity = '0.5';
    toInput.style.opacity = '0.5';
    
    // Небольшая задержка перед сменой
    setTimeout(() => {
        // Меняем значения
        fromInput.value = toValue;
        toInput.value = fromValue;
        
        // Плавно возвращаем opacity
        fromInput.style.opacity = '1';
        toInput.style.opacity = '1';
        
        // Скрываем подсказки
        document.querySelectorAll('.suggestions-container').forEach(s => s.style.display = 'none');
        
        // Убираем transition через небольшое время
        setTimeout(() => {
            fromInput.style.transition = '';
            toInput.style.transition = '';
        }, 200);
    }, 150); // Задержка 150ms для плавности
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const swapBtn = document.getElementById('swapCities');
    if (swapBtn) {
        swapBtn.addEventListener('click', swapCities);
        swapBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                swapCities();
            }
        });
    }
});

// Глобальная функция
window.swapCities = swapCities;

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function setupSuggestions(inputId, containerId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);
    if (!input || !container) return;

    input.addEventListener('input', () => {
        const val = input.value.trim().toLowerCase();
        container.innerHTML = '';

        if (val.length < 1) {
            container.style.display = 'none';
            return;
        }

        const filtered = popularCities
            .filter(city => city.toLowerCase().includes(val))
            .slice(0, 6);

        if (filtered.length > 0) {
            filtered.forEach(city => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = city;

                item.onclick = () => {
                    input.value = city;
                    container.style.display = 'none';
                };

                container.appendChild(item);
            });

            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target !== input) container.style.display = 'none';
    });
}

// --- СОХРАНЕНИЕ И ПЕРЕХОД ---
function saveAndRedirect() {
    const fromInput = document.getElementById('fromCity');
    const toInput = document.getElementById('toCity');
    const dateInput = document.getElementById('travelDate');

    const fromValue = fromInput.value.trim();
    const toValue = toInput.value.trim();
    const dateValue = dateInput.value;

    [fromInput, toInput, dateInput].forEach(el => el.style.borderColor = "");

    if (!fromValue || !toValue || !dateValue) {
        alert("Пожалуйста, заполните все поля.");
        if (!fromValue) fromInput.style.borderColor = "red";
        if (!toValue) toInput.style.borderColor = "red";
        if (!dateValue) dateInput.style.borderColor = "red";
        return;
    }

    if (fromValue.toLowerCase() === toValue.toLowerCase()) {
        alert("Город отправления и прибытия не могут совпадать.");
        return;
    }

    localStorage.setItem('searchFrom', fromValue);
    localStorage.setItem('searchTo', toValue);
    localStorage.setItem('searchDate', dateValue);

    window.location.href = "seacrh.html";
}

// --- ОСНОВНОЙ ОБРАБОТЧИК DOM ---
document.addEventListener('DOMContentLoaded', async function () {

    // 🔥 ЖДЁМ загрузку JSON
    await loadCities();

    setupSuggestions('fromCity', 'from-suggestions');
    setupSuggestions('toCity', 'to-suggestions');

    const dateInput = document.getElementById('travelDate');
    if (dateInput) {
        flatpickr(dateInput, {
            locale: "ru",
            dateFormat: "Y-m-d",
            minDate: "today",
            disableMobile: true,
            defaultDate: localStorage.getItem('searchDate') || null,
        });
    }

    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            faqItems.forEach(other => {
                if (other !== item) other.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });

    const travelDate = document.getElementById('travelDate');
    if (travelDate) {
        travelDate.min = new Date().toISOString().split("T")[0];
    }

    const popularButtons = document.querySelectorAll('.select-popular');
    popularButtons.forEach(button => {
        button.addEventListener('click', () => {

            const fromCity = button.getAttribute('data-from');
            const toCity = button.getAttribute('data-to');
            const today = new Date().toISOString().split('T')[0];

            const fromInput = document.getElementById('fromCity');
            const toInput = document.getElementById('toCity');
            const dateInput = document.getElementById('travelDate');

            if (fromInput && toInput && dateInput) {
                fromInput.value = fromCity;
                toInput.value = toCity;
                dateInput.value = today;
                saveAndRedirect();
            }
        });
    });
});
