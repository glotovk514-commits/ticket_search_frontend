let currentTickets = [];
let selectedClass = null;

// Конфигурация типов вагонов
const WAGON_SEATS_CONFIG = {
    'KYPE': { rows: 9, seatsPerRow: 4, totalSeats: 36 },
    'PLAZKART': { rows: 9, seatsPerRow: 6, totalSeats: 54 },
    'SV': { rows: 9, seatsPerRow: 2, totalSeats: 18 },
    'EKONOM': { rows: 12, seatsPerRow: 4, totalSeats: 48 },
    'EKONOM_PLUS': { rows: 15, seatsPerRow: 4, totalSeats: 60 },
    'BUZNES': { rows: 8, seatsPerRow: 2, totalSeats: 16 },
    'BUSTRO': { rows: 9, seatsPerRow: 4, totalSeats: 36 }
};

// --- БЛОК ПОДСКАЗОК ГОРОДОВ ---
const popularCities = [
    "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань", 
    "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону", 
    "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград", "Тюмень", 
    "Саратов", "Тольятти", "Ижевск", "Барнаул", "Ульяновск", "Иркутск", 
    "Хабаровск", "Махачкала", "Оренбург", "Томск", "Кемерово", "Астрахань",
    "Сочи", "Адлер", "Анапа", "Новороссийск", "Туапсе", "Геленджик", 
    "Краснодар", "Ставрополь", "Кисловодск", "Пятигорск", "Ессентуки", 
    "Минеральные Воды", "Севастополь", "Симферополь", "Феодосия", "Евпатория",
    "Мурманск", "Архангельск", "Петрозаводск", "Вологда", "Череповец", 
    "Псков", "Великий Новгород", "Калининград", "Сыктывкар", "Воркута",
    "Владивосток", "Улан-Удэ", "Чита", "Благовещенск", "Южно-Сахалинск", 
    "Сургут", "Нижневартовск", "Ханты-Мансийск", "Магнитогорск", "Нижний Тагил", 
    "Курган", "Абакан", "Братск", "Находка", "Уссурийск",
    "Ярославль", "Рязань", "Липецк", "Тула", "Курск", "Брянск", "Орел", 
    "Тамбов", "Кострома", "Иваново", "Владимир", "Смоленск", "Калуга", 
    "Пенза", "Саранск", "Киров", "Чебоксары", "Йошкар-Ола", "Белгород",
    "Бологое", "Лиски", "Ртищево", "Грязи", "Барабинск", "Тайшет"
];

const WAGON_MAP = {
    'Плацкарт': 'PLAZKART',
    'Купе': 'KYPE',
    'СВ': 'SV',
    'Эконом': 'EKONOM',
    'Эконом+': 'EKONOM_PLUS',
    'Бизнес': 'BUZNES',
    'Бистро': 'BUSTRO',
    'Сидячий': 'EKONOM'
};

const WAGON_CONFIG = {
    'PLAZKART': 'plazkart.svg',
    'KYPE': 'kype.svg',
    'SV': 'sv.svg',
    'EKONOM': 'ekonom.svg',
    'EKONOM_PLUS': 'ekonomplus.svg',
    'BUZNES': 'buznes.svg',
    'SUD': 'sud.svg',
    'BUSTRO': 'bustro.svg'
};

function setupSuggestions(inputId, containerId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);
    if (!input || !container) return;

    input.addEventListener('input', () => {
        const val = input.value.trim().toLowerCase();
        container.innerHTML = '';
        if (val.length < 1) { container.style.display = 'none'; return; }

        const filtered = popularCities.filter(city => 
            city.toLowerCase().includes(val)
        ).slice(0, 6);

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

function transliterate(word) {
    const converter = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z',
        'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
        'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ь': '', 'ы': 'y', 'ъ': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    return word.toLowerCase().split('').map(char => converter[char] || char).join('').replace(/\s+/g, '-');
}

document.addEventListener('DOMContentLoaded', () => {
    setupSuggestions('from', 'from-suggestions');
    setupSuggestions('to', 'to-suggestions');

   const dateInput = document.getElementById('date');
    if (dateInput) {
        flatpickr(dateInput, {
            "locale": "ru",
            dateFormat: "Y-m-d",
            minDate: "today",
            disableMobile: "true",
            defaultDate: localStorage.getItem('searchDate') || null,
            onChange: function(selectedDates, dateStr) {
                localStorage.setItem('searchDate', dateStr);
            }
        });
    }
    
    const savedFrom = localStorage.getItem('searchFrom');
    const savedTo = localStorage.getItem('searchTo');
    const savedDate = localStorage.getItem('searchDate');

    if (savedFrom) document.getElementById('from').value = savedFrom;
    if (savedTo) document.getElementById('to').value = savedTo;
    if (savedDate) document.getElementById('date').value = savedDate;

    if (savedFrom && savedTo && savedDate) findTickets();
});

async function findTickets() {
    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader-overlay'); 
    
    if(!resultsDiv) return;

    const rawFrom = document.getElementById('from').value;
    const rawTo = document.getElementById('to').value;
    const rawDate = document.getElementById('date').value; 

    if (!rawFrom || !rawTo || !rawDate) {
        alert("Пожалуйста, заполните все поля.");
        return;
    }

    resultsDiv.style.minHeight = '500px'; 

    const oldCards = resultsDiv.querySelectorAll('.ticket-card, .error-message, .no-results');
    oldCards.forEach(card => card.remove());

    if (loader) loader.style.display = 'flex';

    localStorage.setItem('searchFrom', rawFrom);
    localStorage.setItem('searchTo', rawTo);
    localStorage.setItem('searchDate', rawDate);

    const formattedDate = rawDate.split('-').reverse().join('.'); 
    const data = {
        departure: transliterate(rawFrom),
        arrival: transliterate(rawTo),
        date: formattedDate
    };

    try {
        const response = await fetch('https://ticket-search-bakend.onrender.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Ошибка сети');
        
        currentTickets = await response.json();
        
        if (currentTickets.length === 0) {
            resultsDiv.insertAdjacentHTML('beforeend', '<p class="no-results" style="text-align:center; padding:20px;">Билетов не найдено.</p>');
        } else {
            applySortAndRender();
        }

    } catch (error) {
        resultsDiv.insertAdjacentHTML('beforeend', '<p class="error-message" style="color:red; text-align:center; padding:20px;">Ошибка при подключении к серверу.</p>');
    } finally {
        if (loader) {
            setTimeout(() => {
                loader.style.display = 'none';
                resultsDiv.style.minHeight = 'auto'; 
            }, 600);
        }
    }
}

function applySortAndRender() {
    const sortSelect = document.getElementById('sortTickets');
    if (!sortSelect || currentTickets.length === 0) return;
    
    const sortType = sortSelect.value;
    let sorted = [...currentTickets];
    
    sorted.sort((a, b) => {
        const priceA = (a.price === "Н/Д" || !a.price) ? 0 : parseInt(a.price);
        const priceB = (b.price === "Н/Д" || !b.price) ? 0 : parseInt(b.price);
        if (sortType === 'cheap') return (priceA || Infinity) - (priceB || Infinity);
        if (sortType === 'expensive') return priceB - priceA;
        return 0;
    });
    
    renderTickets(sorted);
}

function renderTickets(tickets) {
    const resultsDiv = document.getElementById('results');
    const oldCards = resultsDiv.querySelectorAll('.ticket-card, .no-results, .error-message');
    oldCards.forEach(card => card.remove());

    tickets.forEach((t, index) => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        
        let pricesHtml = '';
        const types = [
            { key: 'Базовый', label: 'Базовый' }, { key: 'Эконом', label: 'Эконом' },
            { key: 'Эконом+', label: 'Эконом+' }, { key: 'Семейный', label: 'Семейный' },
            { key: 'Бистро', label: 'Бистро' }, { key: 'Бизнес', label: 'Бизнес' },
            { key: 'Первый', label: 'Первый' }, { key: 'Купе-Сьют', label: 'Сьют' },
            { key: 'Сидячий', label: 'Сидячий' }, { key: 'Плацкарт', label: 'Плацкарт' },
            { key: 'Купе', label: 'Купе' }, { key: 'СВ', label: 'СВ' },
            { key: 'Люкс', label: 'Люкс' }
        ];

        types.forEach(type => {
            const info = t.prices_all[type.key];
            if (info && typeof info === 'object' && info.price !== '—') {
                const formattedPrice = Math.floor(Number(info.price)).toLocaleString('ru-RU');
                
                pricesHtml += `
                    <div class="price-item" onclick="selectVagon(this, '${type.label}', '${info.price}', ${index})">
                        <div class="price-row-main">
                            <span class="p-label">${type.label}</span>
                            <span class="p-seats">мест: ${info.seats}</span>
                        </div>
                        <div class="p-price-block">
                            <span class="p-value">${formattedPrice} ₽</span>
                        </div>
                    </div>`;
            }
        });

        card.innerHTML = `
            <div class="ticket-grid">
                <div class="ticket-main-info">
                    <div class="train-header">
                        <div class="train-number">Поезд ${t.train}</div>
                        <div class="train-route-text" style="color: #007bff; font-size: 0.9em; margin-top: 5px; cursor: default;">
                            ${t.route}
                        </div>
                    </div>
                    
                    <div class="path-visualization">
                        <div class="time-point">
                            <span class="t-date" style="display: block; font-size: 0.85em; color: #666; margin-bottom: 2px;">${t.departure_date || ''}</span>
                            <span class="t-time">${t.departure_time}</span>
                            <div class="location-details">
                                <div class="t-city">${t.dep_city}</div>
                                ${t.dep_station ? `<div class="t-station">${t.dep_station}</div>` : ''}
                            </div>
                        </div>

                        <div class="path-line-wrapper">
                            <div class="path-line"></div>
                            <i class="fas fa-train"></i>
                            <div class="path-line"></div>
                        </div>

                        <div class="time-point">
                            <span class="t-date" style="display: block; font-size: 0.85em; color: #666; margin-bottom: 2px;">${t.arrival_date || ''}</span>
                            <span class="t-time">${t.arrival_time}</span>
                            <div class="location-details">
                                <div class="t-city">${t.arr_city}</div>
                                ${t.arr_station ? `<div class="t-station">${t.arr_station}</div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ticket-price-side">
                    <div class="price-list" id="price-list-${index}">
                        ${pricesHtml || '<div class="no-seats">Мест нет</div>'}
                    </div>
                    <div class="action-area">
                         <button class="btn-buy" onclick="openBookingModal(${index})">Оформить</button>
                    </div>
                </div>
            </div>`;
        resultsDiv.appendChild(card);
    });
}


// Функция для преобразования формата даты
function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return null;
    
    // Если дата уже в формате DD.MM.YYYY
    if (dateString.includes('.')) return dateString;
    
    // Если дата в формате YYYY-MM-DD
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    
    return dateString;
}

async function selectVagon(element, label, price, ticketIndex) {
    const parent = document.getElementById(`price-list-${ticketIndex}`);
    const card = element.closest('.ticket-card');
    const ticket = currentTickets[ticketIndex]; 

    let wagonsDiv = card.querySelector('.wagons-container');

    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
        if (wagonsDiv) wagonsDiv.style.display = 'none';
        return;
    }

    if (!wagonsDiv) {
        wagonsDiv = document.createElement('div');
        wagonsDiv.className = 'wagons-container';
        wagonsDiv.style.cssText = 'background: #fff; border-radius: 0 0 12px 12px; border-top: 1px solid #eee;';
        card.appendChild(wagonsDiv);
    }

    parent.querySelectorAll('.price-item').forEach(item => item.classList.remove('selected'));
    element.classList.add('selected');

    wagonsDiv.style.display = 'block';
    
    wagonsDiv.innerHTML = `
        <div class="loader-wrapper" style="text-align:center; padding: 20px;">
            <div style="font-size: 50px; display: inline-block; animation: trainChug 0.6s ease-in-out infinite;">🚂</div>
            <p style="font-size: 0.9em; color: #666; margin-top: 10px;">Ищем вагоны...</p>
        </div>
    `;

    try {
        const rawDate = localStorage.getItem('searchDate');
        const formattedDate = rawDate ? rawDate.split('-').reverse().join('.') : null;
        
        console.log('Отправляем дату:', formattedDate); // Для отладки

        const response = await fetch('https://ticket-search-bakend.onrender.com/get-wagons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from_city: transliterate(ticket.dep_city).toLowerCase(),
                to_city: transliterate(ticket.arr_city).toLowerCase(),
                date: formattedDate,
                type: label,
                target_time: ticket.departure_time
            })
        });
        
        const result = await response.json();
        
        if (result.status !== "success" || !result.data.length) {
            wagonsDiv.innerHTML = `<p style="padding:20px; text-align:center;">Мест нет</p>`;
            return;
        }

        const internalWagonType = WAGON_MAP[label] || 'PLAZKART';

        wagonsDiv.innerHTML = `
            <div style="padding: 15px 20px; font-weight: 600;">Выберите вагон:</div>
            <div class="wagons-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; padding: 0 20px 15px 20px;">
                ${result.data.map(w => `
                    <div class="wagon-mini-card" 
                         id="wagon-card-${ticketIndex}-${w.wagon_number}"
                         style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 10px; cursor: pointer; text-align:center;"
                         onclick="handleWagonClick(this, '${w.wagon_number}', '${w.seats.join(',')}', ${ticketIndex}, '${internalWagonType}')">
                        <div style="font-weight: bold; color: #1a2e7a;">№${w.wagon_number}</div>
                        <div style="font-size: 0.75em; color: #666;">${w.count} мест</div>
                    </div>
                `).join('')}
            </div>
            <div id="scheme-viewport-${ticketIndex}" style="display:none; padding: 20px; border-top: 1px solid #eee;"></div>
        `;

        selectedClass = { label, price, train: ticket.train, route: ticket.route, wagon_num: null, seat_num: null };

    } catch (e) {
        wagonsDiv.innerHTML = '<p style="padding:20px; text-align:center; color:red;">❌ Ошибка загрузки вагонов</p>';
    }
}

function handleWagonClick(element, wagonNumber, seatsStr, ticketIndex, wagonType) {
    const container = element.closest('.wagons-grid');
    container.querySelectorAll('.wagon-mini-card').forEach(card => {
        card.style.background = '#f8f9fa';
        card.style.borderColor = '#e9ecef';
    });

    element.style.background = '#e3f2fd';
    element.style.borderColor = '#1a237e';

    drawWagonScheme(wagonNumber, seatsStr, ticketIndex, wagonType);
}

async function drawWagonScheme(wagonNumber, seatsStr, ticketIndex, wagonType) {
    const viewport = document.getElementById(`scheme-viewport-${ticketIndex}`);
    const availableSeats = seatsStr.split(',').map(s => s.trim()).filter(s => s !== "");

    viewport.style.display = 'block';
    viewport.innerHTML = `
        <div style="padding:12px 20px; background:#1a2e7a; color:white; border-radius:10px 10px 0 0; font-weight:600;">
            Вагон №${wagonNumber} — ${availableSeats.length} свободных мест
        </div>
        <div class="svg-container" style="padding:15px; background:#fff; border:1px solid #ddd; border-radius:0 0 12px 12px;">
            <div class="loader-wrapper">Загрузка схемы...</div>
        </div>
    `;

    try {
        const fileName = WAGON_CONFIG[wagonType] || 'plazkart.svg';
        const res = await fetch(`./${fileName}`);
        let svgText = await res.text();

        svgText = svgText.replace(/<\?xml[^>]*\?>/i, '').replace(/<!DOCTYPE[^>]*>/i, '');

        const container = viewport.querySelector('.svg-container');
        container.innerHTML = svgText;

        const svg = container.querySelector('svg');
        if (svg) {
            svg.style.width = '100%';
            svg.style.height = 'auto';
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        }

        setTimeout(() => {
            makeSeatsInteractive(viewport, availableSeats, wagonNumber);
        }, 400);

    } catch (e) {
        console.error(e);
        const container = viewport.querySelector('.svg-container');
        container.innerHTML = generateSeatsGrid(availableSeats, 60, wagonNumber);
    }
}

// ========== ИСПРАВЛЕННАЯ ФУНКЦИЯ ПОДСВЕТКИ МЕСТ ==========
function makeSeatsInteractive(viewport, availableSeats, wagonNumber) {
    const availableSet = new Set(availableSeats.map(String));
    const svg = viewport.querySelector('svg');
    if (!svg) return;

    // Добавляем CSS анимации для мест
    const styleId = 'seat-styles';
    if (!document.getElementById(styleId)) {
        const seatStyles = document.createElement('style');
        seatStyles.id = styleId;
        seatStyles.textContent = `
            @keyframes seatGlow {
                0% { filter: drop-shadow(0 0 0px rgba(26, 35, 126, 0)); }
                50% { filter: drop-shadow(0 0 8px rgba(26, 35, 126, 0.6)); }
                100% { filter: drop-shadow(0 0 0px rgba(26, 35, 126, 0)); }
            }
            @keyframes seatSelect {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            .seat-free {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
            }
            .seat-free:hover {
                filter: brightness(0.95);
                stroke-width: 3 !important;
                transform: scale(1.02);
            }
            .seat-selected-animation {
                animation: seatSelect 0.3s ease-out, seatGlow 0.5s ease-out;
            }
        `;
        document.head.appendChild(seatStyles);
    }

    // Получаем все элементы с ID начинающимся на Seat
    const seatElements = svg.querySelectorAll('[id^="Seat"]');
    
    seatElements.forEach(element => {
        const match = element.id.match(/Seat(\d+)/i);
        if (match) {
            const seatNum = match[1];
            
            // Находим графический элемент
            let graphicEl = element.querySelector('path');
            if (!graphicEl) graphicEl = element.querySelector('rect');
            if (!graphicEl) graphicEl = element;
            
            // Сохраняем данные
            graphicEl.setAttribute('data-seat-num', seatNum);
            graphicEl.setAttribute('data-wagon', wagonNumber);
            
            if (availableSet.has(seatNum)) {
                // СВОБОДНОЕ МЕСТО - ГРАДИЕНТНЫЙ СВЕТЛО-СИНИЙ
                graphicEl.setAttribute('fill', '#81d4fa');
                graphicEl.setAttribute('stroke', '#0288d1');
                graphicEl.setAttribute('stroke-width', '2.5');
                graphicEl.style.cursor = 'pointer';
                graphicEl.style.transition = 'all 0.3s ease';
                graphicEl.classList.add('seat-free');
                
                // Добавляем мягкую тень
                graphicEl.setAttribute('filter', 'url(#drop-shadow)');
                
                // Создаем обработчик клика
                const handleClick = function(e) {
                    e.stopPropagation();
                    
                    // Анимация пульсации при клике
                    this.style.animation = 'none';
                    this.offsetHeight; // trigger reflow
                    this.style.animation = 'seatSelect 0.3s ease-out';
                    
                    // Снимаем выделение со всех мест
                    document.querySelectorAll('[data-selected="true"]').forEach(seat => {
                        seat.setAttribute('data-selected', 'false');
                        if (seat._originalFill) {
                            seat.setAttribute('fill', seat._originalFill);
                            seat.setAttribute('stroke', seat._originalStroke);
                        } else {
                            seat.setAttribute('fill', '#81d4fa');
                            seat.setAttribute('stroke', '#0288d1');
                        }
                        seat.classList.remove('seat-selected');
                        seat.style.filter = '';
                    });
                    
                    // Выделяем текущее место - ТЕМНО-СИНИЙ С ЗОЛОТОЙ ОБВОДКОЙ
                    this.setAttribute('data-selected', 'true');
                    this._originalFill = this.getAttribute('fill');
                    this._originalStroke = this.getAttribute('stroke');
                    this.setAttribute('fill', '#1a237e');
                    this.setAttribute('stroke', '#ffd700');
                    this.setAttribute('stroke-width', '4');
                    this.classList.add('seat-selected');
                    this.style.filter = 'drop-shadow(0 0 6px rgba(26, 35, 126, 0.5))';
                    
                    // Сохраняем выбранное место
                    selectedClass.seat_num = parseInt(seatNum);
                    selectedClass.wagon_num = wagonNumber;
                    
                    // Показываем красивое уведомление
                    showFancyNotification(seatNum);
                };
                
                graphicEl.removeEventListener('click', graphicEl._clickHandler);
                graphicEl._clickHandler = handleClick;
                graphicEl.addEventListener('click', graphicEl._clickHandler);
                
            } else {
                // ЗАНЯТОЕ МЕСТО - СЕРЫЙ С ПОЛОСКАМИ
                graphicEl.setAttribute('fill', '#bdbdbd');
                graphicEl.setAttribute('stroke', '#757575');
                graphicEl.setAttribute('stroke-width', '1.5');
                graphicEl.style.cursor = 'not-allowed';
                graphicEl.style.opacity = '0.5';
                graphicEl.classList.add('seat-taken');
            }
        }
    });
    
    // Добавляем красивый тултип при наведении
    svg.querySelectorAll('[data-seat-num]').forEach(seat => {
        const seatNum = seat.getAttribute('data-seat-num');
        const isFree = availableSet.has(seatNum);
        
        if (isFree) {
            seat.setAttribute('title', `Место ${seatNum} - свободно ✓`);
        } else {
            seat.setAttribute('title', `Место ${seatNum} - занято ✗`);
        }
    });
}

function makeSeatClickable(element, seatNum, wagonNumber, originalElement) {
    if (!element) return;
    
    // Сохраняем оригинальные цвета для светлого фона
    const originalFill = '#e3f2fd';
    const originalStroke = '#1976d2';
    
    const clickHandler = () => {
        // Снимаем выделение с других мест
        document.querySelectorAll('.seat-selected').forEach(seat => {
            seat.classList.remove('seat-selected');
            // Возвращаем свободным местам светло-синий цвет
            if (seat.getAttribute('data-seat') && seat.getAttribute('data-wagon')) {
                seat.setAttribute('fill', '#e3f2fd');
                seat.setAttribute('stroke', '#1976d2');
                seat.setAttribute('stroke-width', '3');
            }
        });
        
        // Выделяем текущее место (темно-синий)
        element.classList.add('seat-selected');
        element.setAttribute('fill', '#1a237e');
        element.setAttribute('stroke', '#ffc107');
        element.setAttribute('stroke-width', '4');
        
        // Сохраняем выбранное место
        selectedClass.seat_num = parseInt(seatNum);
        selectedClass.wagon_num = wagonNumber;
        
        // Показываем уведомление
        showToastMessage(`✅ Выбрано место ${seatNum}`);
    };
    
    // Удаляем старый обработчик и добавляем новый
    element.removeEventListener('click', clickHandler);
    element.addEventListener('click', clickHandler);
    element.setAttribute('data-seat', seatNum);
    element.setAttribute('data-wagon', wagonNumber);
}

function disableSeat(element) {
    // Эта функция теперь не вызывается для свободных мест, только для занятых
    if (!element) return;
    
    if (element.tagName === 'path' || element.tagName === 'rect') {
        element.setAttribute('fill', '#e0e0e0');
        element.setAttribute('stroke', '#bdbdbd');
        element.setAttribute('stroke-width', '1');
    }
    element.style.cursor = 'not-allowed';
    element.style.opacity = '0.6';
}

function showFancyNotification(seatNum) {
    // Удаляем старые уведомления
    const oldNotify = document.querySelector('.fancy-notification');
    if (oldNotify) oldNotify.remove();
    
    const notification = document.createElement('div');
    notification.className = 'fancy-notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: #1a237e; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 20px;">✓</span>
            </div>
            <div>
                <div style="font-weight: bold; font-size: 16px; color: #1a237e;">Место ${seatNum} выбрано!</div>
                <div style="font-size: 12px; color: #666;">Продолжите оформление билета</div>
            </div>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: white;
        border-radius: 12px;
        padding: 16px 24px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        border-left: 4px solid #1a237e;
        font-family: 'Segoe UI', sans-serif;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Добавляем стили для уведомлений в существующий style
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .seat-selected {
        animation: pulse 0.3s ease-out;
    }
`;
document.head.appendChild(additionalStyles);

function showToastMessage(message) {
    // Удаляем старый тост если есть
    const oldToast = document.querySelector('.custom-toast');
    if (oldToast) oldToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Функция генерации сетки мест (запасной вариант)
function generateSeatsGrid(availableSeats, totalSeats, wagonNumber) {
    const seatsPerRow = 4;
    const rows = Math.ceil(totalSeats / seatsPerRow);
    
    let html = `
        <style>
            .seats-grid-custom { display: inline-block; background: white; border-radius: 12px; padding: 20px; width: 100%; }
            .seat-row-custom { display: flex; justify-content: center; margin-bottom: 10px; gap: 8px; flex-wrap: wrap; }
            .seat-custom {
                width: 60px; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center;
                border-radius: 8px; cursor: pointer; transition: all 0.2s ease; font-weight: bold; font-size: 14px; margin: 4px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .seat-free-custom { background: #e3f2fd; border: 2px solid #64b5f6; color: #1565c0; }
            .seat-free-custom:hover { background: #90caf9; transform: scale(1.05); }
            .seat-selected-custom { background: #1a237e; border: 2px solid #ffc107; color: white; }
            .seat-taken-custom { background: #e0e0e0; border: 2px solid #bdbdbd; color: #999; cursor: not-allowed; text-decoration: line-through; }
        </style>
        
        <div style="margin-bottom:15px; padding:12px; background:linear-gradient(135deg, #1a2e7a 0%, #2c3e6d 100%); border-radius:10px; color:white; display:flex; justify-content:space-between;">
            <div style="font-weight:bold; font-size:1.1em;">🚂 Схема вагона №${wagonNumber}</div>
            <div>🟢 Свободно: ${availableSeats.length} мест</div>
        </div>
        
        <div class="seats-grid-custom">`;

    for (let row = 0; row < rows; row++) {
        html += `<div class="seat-row-custom">`;
        for (let col = 1; col <= seatsPerRow; col++) {
            const seatNum = row * seatsPerRow + col;
            if (seatNum <= totalSeats) {
                const isFree = availableSeats.includes(seatNum.toString());
                const isSelected = selectedClass?.seat_num === seatNum && selectedClass?.wagon_num === wagonNumber;
                
                let seatClass = 'seat-custom ' + (isFree ? (isSelected ? 'seat-selected-custom' : 'seat-free-custom') : 'seat-taken-custom');
                const status = isSelected ? '✓' : (isFree ? 'свободно' : 'занято');
                
                html += `
                    <div class="${seatClass}" data-seat="${seatNum}" data-wagon="${wagonNumber}" 
                         onclick="${isFree && !isSelected ? `selectSeatFromGrid(${seatNum}, '${wagonNumber}')` : ''}">
                        <div style="font-size:16px; font-weight:bold;">${seatNum}</div>
                        <div style="font-size:9px;">${status}</div>
                    </div>`;
            }
        }
        html += `</div>`;
    }
    html += `</div>`;
    return html;
}

function selectSeatFromGrid(seatNum, wagonNumber) {
    if (!selectedClass) {
        alert("Ошибка: Сначала выберите категорию вагона");
        return;
    }
    
    document.querySelectorAll('.seat-selected-custom, .seat-selected').forEach(seat => {
        seat.classList.remove('seat-selected-custom', 'seat-selected');
    });
    
    const seatElement = document.querySelector(`[data-seat="${seatNum}"][data-wagon="${wagonNumber}"]`);
    if (seatElement) {
        seatElement.classList.add('seat-selected-custom', 'seat-selected');
    }
    
    selectedClass.seat_num = seatNum;
    selectedClass.wagon_num = wagonNumber;
    
    showToastMessage(`✅ Выбрано место ${seatNum}`);
}

// Стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {0%{opacity:1}100%{opacity:0;transform:translateY(-20px);visibility:hidden}}
    @keyframes slideInRight {from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes trainChug {0%,100%{transform:translateX(0)}50%{transform:translateX(15px)}}
`;
document.head.appendChild(style);

function openBookingModal(index) {
    if (!selectedClass || !selectedClass.wagon_num || !selectedClass.seat_num) {
        alert("Пожалуйста, сначала выберите вагон и конкретное место на схеме");
        return;
    }

    const modal = document.getElementById('bookingModal');
    const infoDiv = document.getElementById('modalTicketInfo');
    
    if (!modal) return;

    const ticket = currentTickets[index];
    const modalFormattedPrice = Math.floor(Number(selectedClass.price)).toLocaleString('ru-RU');
    
    if (infoDiv) {
        infoDiv.innerHTML = `
            <div style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <p style="margin: 5px 0; color: #000;"><strong>Поезд:</strong> ${ticket.train}</p>
                <p style="margin: 5px 0; color: #000;"><strong>Маршрут:</strong> ${ticket.route}</p>
                <div style="margin: 10px 0; padding: 10px 0;">
                    <p style="margin: 0; color: #000;"><strong>Вагон №${selectedClass.wagon_num}</strong> (${selectedClass.label})</p>
                    <p style="margin: 5px 0 0 0; color: #000;"><strong>Место №${selectedClass.seat_num}</strong></p>
                </div>
                <p style="color: #333; font-size: 1.2em; margin-top: 10px;"><strong>К оплате:</strong> ${modalFormattedPrice} ₽</p>
            </div>
        `;
    }

    const userJson = localStorage.getItem('user');
    if (userJson) {
        const userData = JSON.parse(userJson);
        const fioInput = document.getElementById('pass-fio');
        const emailInput = document.getElementById('pass-email');
        if (fioInput) fioInput.value = `${userData.last_name || ''} ${userData.name || ''}`.trim();
        if (emailInput) emailInput.value = userData.email || '';
    }

    modal.style.display = "flex";
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none";
}

function confirmBooking(event) {
    event.preventDefault();
    
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const searchTo = localStorage.getItem('searchTo') || "Не указано";
    const searchDate = localStorage.getItem('searchDate');

    const fioElem = document.getElementById('pass-fio');
    const emailElem = document.getElementById('pass-email');
    const docElemSeries = document.getElementById('pass-series');
    const docElemNumber = document.getElementById('pass-doc');

    if (!selectedClass) {
        alert("Ошибка: данные о билете не найдены");
        return;
    }

    const bookingData = {
        user_id: user ? user.id : null,
        destination: searchTo,
        departure_date: searchDate,
        train_number: selectedClass.train,
        carriage_type: selectedClass.label,
        price: Number(selectedClass.price),
        email: emailElem ? emailElem.value : null,
        passenger_fio: fioElem ? fioElem.value : null,
        passport_serias: docElemSeries ? docElemSeries.value : null,
        passport_number: docElemNumber ? docElemNumber.value : null,
        route: selectedClass.route
    };

    sessionStorage.setItem('pendingOrder', JSON.stringify(bookingData));
    window.location.href = 'kassa.html';
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'flex' || modal.style.display === 'block') {
                modal.style.display = "none";
            }
        });
    }
});

function swapCities() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    [fromInput.value, toInput.value] = [toInput.value, fromInput.value];
    document.querySelectorAll('.suggestions-container').forEach(s => s.style.display = 'none');
}

document.addEventListener('DOMContentLoaded', () => {
    const swapBtn = document.getElementById('swapCities');
    if (swapBtn) {
        swapBtn.addEventListener('click', swapCities);
    }
});

window.swapCities = swapCities;
window.selectSeatFromGrid = selectSeatFromGrid;