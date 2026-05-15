// ========== ДАННЫЕ ==========
const usersData = [
    { id: "RZD-49210", name: "Александр Волков", email: "a.volkov@rzd-logistics.ru", regDate: "12 окт 2023", tickets: 142, initials: "АВ", color: "bg-primary/10 text-primary" },
    { id: "RZD-58321", name: "Елена Соколова", email: "e.sokolova@vtb-mail.ru", regDate: "05 янв 2024", tickets: 89, initials: "ЕС", color: "bg-blue-100 text-blue-700" },
    { id: "RZD-29104", name: "Дмитрий Морозов", email: "dm.morozov@outlook.com", regDate: "22 ноя 2023", tickets: 214, initials: "ДМ", color: "bg-amber-100 text-amber-700" },
    { id: "RZD-10492", name: "Наталья Петрова", email: "n.petrova@gov.ru", regDate: "15 мар 2024", tickets: 56, initials: "НП", color: "bg-emerald-100 text-emerald-700" },
    { id: "RZD-67219", name: "Игорь Козлов", email: "igor.kozlov@mail.ru", regDate: "01 дек 2023", tickets: 312, initials: "ИК", color: "bg-purple-100 text-purple-700" }
];

const loyaltyRules = [
    { tickets: 5, discount: 5, status: "Активно" },
    { tickets: 10, discount: 10, status: "Активно" },
    { tickets: 25, discount: 20, status: "Активно" }
];

//------Предпросмортр новостей-------
function initNewsPreview() {
    // 1. Находим элементы управления (инпуты)
    const titleInput = document.getElementById('newsTitleInput');
    const urlInput = document.getElementById('newsImageUrlInput'); // Поле для ссылки
    const descInput = document.getElementById('newsDescInput');
    const categoryInput = document.getElementById('newsCategoryInput');
    const dateInput = document.getElementById('newsDateInput');

    // 2. Находим элементы предпросмотра (куда выводим данные)
    const pTitle = document.getElementById('previewTitle');
    const pImage = document.getElementById('previewImage');
    const pPlaceholder = document.getElementById('previewPlaceholder');
    const pDesc = document.getElementById('previewDesc');
    const pCategory = document.getElementById('previewCategory');
    const pDate = document.getElementById('previewDate');

    // Проверка: если мы не на странице новостей, выходим из функции
    if (!titleInput || !pTitle) return;

    // --- ЛОГИКА ДЛЯ ТЕКСТОВЫХ ПОЛЕЙ ---

    // Живой заголовок
    titleInput.addEventListener('input', (e) => {
        pTitle.innerText = e.target.value || "Заголовок появится здесь";
    });

    // Живое описание
    descInput.addEventListener('input', (e) => {
        pDesc.innerText = e.target.value || "Описание появится здесь...";
    });

    // Обновление категории
    categoryInput.addEventListener('change', (e) => {
        pCategory.innerText = e.target.value;
    });

    // Красивое форматирование даты
    dateInput.addEventListener('change', (e) => {
        if (e.target.value) {
            const date = new Date(e.target.value);
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            pDate.innerText = date.toLocaleDateString('ru-RU', options).toUpperCase();
        } else {
            pDate.innerText = "ДАТА";
        }
    });

    // --- ЛОГИКА ДЛЯ ИЗОБРАЖЕНИЯ ПО ССЫЛКЕ ---

    if (urlInput && pImage) {
        urlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            
            if (url) {
                pImage.src = url;
                pImage.classList.remove('hidden');
                if (pPlaceholder) pPlaceholder.classList.add('hidden');
                
                // Если ссылка битая или это не картинка
                pImage.onerror = () => {
                    pImage.classList.add('hidden');
                    if (pPlaceholder) pPlaceholder.classList.remove('hidden');
                };
            } else {
                // Если поле пустое
                pImage.src = "";
                pImage.classList.add('hidden');
                if (pPlaceholder) pPlaceholder.classList.remove('hidden');
            }
        });
    }
}
// ========== ФУНКЦИИ РЕНДЕРА ==========

function renderDashboard(data) {
    if (!data) return `<div class="p-20 text-center animate-pulse text-slate-400">Синхронизация с сервером...</div>`;

    return `
        <div class="max-w-[1440px] mx-auto space-y-6">
            <h1 class="text-2xl font-black text-primary">Обзор продаж</h1>
            
            <div class="grid md:grid-cols-3 gap-5">
                <div class="bg-white p-5 rounded-xl shadow-sm border border-outline-variant">
                    <p class="text-[10px] font-bold text-slate-400 tracking-widest uppercase">ВЫРУЧКА</p>
                    <p class="text-3xl font-black text-on-surface">₽${data.revenue.toLocaleString()}</p>
                </div>
                <div class="bg-white p-5 rounded-xl shadow-sm border border-outline-variant">
                    <p class="text-[10px] font-bold text-slate-400 tracking-widest uppercase">БИЛЕТОВ</p>
                    <p class="text-3xl font-black text-on-surface">${data.tickets_sold}</p>
                </div>
                <div class="bg-white p-5 rounded-xl shadow-sm border border-outline-variant">
                    <p class="text-[10px] font-bold text-slate-400 tracking-widest uppercase">КЛИЕНТОВ</p>
                    <p class="text-3xl font-black text-on-surface">${data.users_count}</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
                <h3 class="text-sm font-bold mb-4">Динамика выручки</h3>
                <div class="h-[300px] w-full">
                    <canvas id="salesChart"></canvas>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                <div class="px-5 py-4 border-b border-outline-variant bg-slate-50">
                    <h3 class="text-sm font-bold">Последние покупки</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
                            <tr>
                                <th class="px-6 py-3">ID Билета</th>
                                <th class="px-6 py-3">Пассажир</th>
                                <th class="px-6 py-3">Маршрут</th>
                                <th class="px-6 py-3 text-right">Цена</th>
                                <th class="px-6 py-3 text-center">Дата</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-outline-variant">
                            ${data.transactions.map(t => `
                                <tr class="hover:bg-blue-50/30 transition-colors">
                                    <td class="px-6 py-4 font-mono text-primary font-bold">${t.id}</td>
                                    <td class="px-6 py-4 font-medium">${t.passenger_name}</td>
                                    <td class="px-6 py-4 text-slate-600">${t.route}</td>
                                    <td class="px-6 py-4 text-right font-bold text-on-surface">₽${t.price.toLocaleString()}</td>
                                    <td class="px-6 py-4 text-center text-slate-400">${t.date}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function initChart(data) {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    let labels = data.transactions.map(t => t.date).reverse();
    let prices = data.transactions.map(t => t.price).reverse();

    if (prices.length === 1) {
        labels.unshift("Начало");
        prices.unshift(0);
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Выручка (₽)',
                data: prices,
                borderColor: '#e21a1a',
                backgroundColor: 'rgba(226, 26, 26, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: (v) => '₽' + v }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderUsers() {
    return `
        <div class="max-w-[1440px] mx-auto space-y-5">
            <div class="flex flex-wrap justify-between items-end gap-3">
                <div><h1 class="headline-md">Реестр зарегистрированных пользователей</h1><p class="text-secondary text-sm">Управление и мониторинг активных пользователей.</p></div>
                <div class="flex gap-3"><button class="btn-secondary flex gap-1 items-center"><span class="material-symbols-outlined text-[18px]">filter_list</span>Фильтры</button><button class="btn-primary flex gap-1 items-center"><span class="material-symbols-outlined text-[18px] text-white">person_add</span>Новый пользователь</button></div>
            </div>
            <div class="card overflow-hidden">
                <div class="overflow-x-auto"><table class="data-table"><thead class="bg-primary text-white"><tr><th class="text-white">ID</th><th class="text-white">ФИО</th><th class="text-white">ПОЧТА</th><th class="text-white text-center">БИЛЕТОВ</th><th class="text-white text-center">ДЕЙСТВИЯ</th></tr></thead><tbody>${usersData.map(user => `<tr><td class="data-mono">${user.id}</td><td><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full ${user.color.split(' ')[0]} flex items-center justify-center text-xs font-bold">${user.initials}</div><span class="font-medium">${user.name}</span></div></td><td class="text-secondary text-sm">${user.email}</td><td class="text-center font-bold text-primary">${user.tickets}</td><td class="text-center"><div class="flex justify-center gap-2"><button class="view-user text-secondary hover:text-primary"><span class="material-symbols-outlined text-[20px]">visibility</span></button></div></td></tr>`).join('')}</tbody></table></div>
            </div>
        </div>
    `;
}

function renderNews() {
    return `
        <div class="max-w-[1440px] mx-auto space-y-6">
            <div class="flex flex-wrap justify-between items-end">
                <div>
                    <h1 class="headline-md">Редактор новостей</h1>
                    <p class="text-secondary">Управление публичными объявлениями.</p>
                </div>
                <div class="flex gap-3">
                    <button class="btn-primary" id="saveNewsBtn">Опубликовать новость</button>
                </div>
            </div>
            <div class="grid lg:grid-cols-12 gap-6">
                <div class="lg:col-span-7 card p-6">
                    <h2 class="title-sm flex gap-2 items-center mb-4">
                        <span class="material-symbols-outlined text-primary">add_circle</span>Добавить новость
                    </h2>
                    <form id="newsForm" class="space-y-4">
                        <div>
                            <label class="input-label">Заголовок</label>
                            <input type="text" id="newsTitleInput" class="input-field" placeholder="Введите заголовок...">
                        </div>
                        
                        <div>
                            <label class="input-label">Ссылка на изображение (URL)</label>
                            <input type="text" id="newsImageUrlInput" class="input-field" placeholder="https://example.com/image.jpg">
                        </div>

                        <div>
                            <label class="input-label">Краткое описание</label>
                            <textarea id="newsDescInput" rows="3" class="input-field" placeholder="Краткое содержание..."></textarea>
                        </div>
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="input-label">Категория</label>
                                <select id="newsCategoryInput" class="input-field">
                                    <option value="Внутренние рейсы">Внутренние рейсы</option>
                                    <option value="Корпоративные">Корпоративные</option>
                                </select>
                            </div>
                            <div>
                                <label class="input-label">Дата</label>
                                <input type="date" id="newsDateInput" class="input-field">
                            </div>
                        </div>
                    </form>
                </div>

                <div class="lg:col-span-5">
                    <div class="sticky top-24">
                        <div class="flex justify-between mb-3">
                            <h2 class="title-sm">Область предпросмотра</h2>
                            <span class="badge badge-active">Живой предпросмотр</span>
                        </div>
                        <div class="card overflow-hidden">
                            <div class="h-48 bg-surface-container-highest relative overflow-hidden flex items-center justify-center">
                                <img src="" id="previewImage" class="w-full h-full object-cover hidden" alt="Предпросмотр">
                                
                                <div id="previewPlaceholder" class="absolute inset-0 bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center">
                                     <span class="material-symbols-outlined text-5xl text-white/50">image</span>
                                </div>

                                <div class="absolute top-3 left-3">
                                    <span class="badge bg-primary text-white" id="previewCategory">Категория</span>
                                </div>
                            </div>
                            <div class="p-4">
                                <span class="label-caps text-secondary" id="previewDate">ДАТА</span>
                                <h3 class="headline-md text-lg mt-1" id="previewTitle">Заголовок появится здесь</h3>
                                <p class="text-secondary text-sm mt-1" id="previewDesc">Описание появится здесь...</p>
                                <div class="text-primary font-bold mt-3 inline-flex gap-1">Читать далее →</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
function renderLoyalty() {
    return `
        <div class="max-w-[1440px] mx-auto space-y-6">
            <h1 class="headline-md">Лояльность</h1>
            <div class="grid lg:grid-cols-12 gap-6">
                <div class="lg:col-span-8 card overflow-hidden">
                    <table class="data-table">
                        <thead><tr><th>Условие</th><th>Скидка</th><th>Статус</th></tr></thead>
                        <tbody>${loyaltyRules.map(rule => `<tr><td>${rule.tickets} билетов</td><td class="font-bold text-primary">${rule.discount}%</td><td><span class="badge badge-active">${rule.status}</span></td></tr>`).join('')}</tbody>
                    </table>
                </div>
                <div class="lg:col-span-4 card p-5">
                    <h3 class="font-bold mb-4">Новое правило</h3>
                    <form id="loyaltyForm" class="space-y-4">
                        <input type="number" id="ticketThreshold" class="input-field" placeholder="Билетов">
                        <input type="number" id="discountPercent" class="input-field" placeholder="Скидка %">
                        <button type="submit" class="btn-primary w-full">Добавить</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// ========== НАВИГАЦИЯ ==========
let currentPage = "dashboard";

function setActiveNavItem(pageId) {
    document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
        if (btn.getAttribute('data-page') === pageId) {
            btn.classList.add('sidebar-nav-item-active');
        } else {
            btn.classList.remove('sidebar-nav-item-active');
        }
    });
}

async function loadPage(page) {
    currentPage = page;
    const root = document.getElementById('app-root');
    if (!root) return;

    setActiveNavItem(page);

    if (page === 'dashboard') {
        root.innerHTML = renderDashboard(null);
        try {
            const response = await fetch('https://ticket-search-bakend.onrender.com/api/dashboard-stats');
            const data = await response.json();
            root.innerHTML = renderDashboard(data);
            // Важно: Инициализируем график сразу после отрисовки
            setTimeout(() => initChart(data), 50);
        } catch (err) {
            console.error(err);
            root.innerHTML = `<div class="p-10 text-error text-center">Ошибка загрузки данных API. Проверьте сервер.</div>`;
        }
    } 
    else if (page === 'users') root.innerHTML = renderUsers();
    else if (page === 'news') {
        root.innerHTML = renderNews();
        initNewsPreview();
    }
    else if (page === 'loyalty') root.innerHTML = renderLoyalty();

    attachEvents();
}

function attachEvents() {
    const loyaltyForm = document.getElementById('loyaltyForm');
    if (loyaltyForm) {
        loyaltyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('✅ Правило добавлено');
        });
    }
    const newsForm = document.getElementById('newsForm');
    if (newsForm) {
        newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('📰 Новость опубликована');
            newsForm.reset();
        });
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    loadPage('dashboard');
    document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');
            if (page) loadPage(page);
        });
    });
});