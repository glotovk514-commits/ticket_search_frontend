// ========== ДОБАВЛЕННЫЕ ФУНКЦИИ АНИМАЦИИ ЗАГРУЗКИ ==========

// Функция для отображения скелетона (каркаса) загрузки
function showSkeletonLoading() {
    const ticketsList = document.getElementById('ticketsList');
    if (!ticketsList) return;
    
    const skeletonHTML = `
        <div class="skeleton-card">
            <div class="skeleton-header">
                <div class="skeleton-title"></div>
                <div class="skeleton-price"></div>
            </div>
            <div class="skeleton-body">
                <div class="skeleton-info">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line short"></div>
                </div>
                <div class="skeleton-info">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line short"></div>
                </div>
            </div>
            <div class="skeleton-footer">
                <div class="skeleton-button"></div>
                <div class="skeleton-button"></div>
            </div>
        </div>
        <div class="skeleton-card">
            <div class="skeleton-header">
                <div class="skeleton-title"></div>
                <div class="skeleton-price"></div>
            </div>
            <div class="skeleton-body">
                <div class="skeleton-info">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line short"></div>
                </div>
                <div class="skeleton-info">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line short"></div>
                </div>
            </div>
            <div class="skeleton-footer">
                <div class="skeleton-button"></div>
                <div class="skeleton-button"></div>
            </div>
        </div>
        <div class="skeleton-card">
            <div class="skeleton-header">
                <div class="skeleton-title"></div>
                <div class="skeleton-price"></div>
            </div>
            <div class="skeleton-body">
                <div class="skeleton-info">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line short"></div>
                </div>
                <div class="skeleton-info">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line short"></div>
                </div>
            </div>
            <div class="skeleton-footer">
                <div class="skeleton-button"></div>
                <div class="skeleton-button"></div>
            </div>
        </div>
    `;
    
    ticketsList.innerHTML = skeletonHTML;
}

// Функция для отображения спиннера с текстом
function showSpinnerLoading() {
    const ticketsList = document.getElementById('ticketsList');
    if (!ticketsList) return;
    
    ticketsList.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">Загрузка билетов</div>
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="loading-subtext">Пожалуйста, подождите...</div>
        </div>
    `;
}

// Функция для отображения пульсирующей анимации (более красивая)
function showPulseLoading() {
    const ticketsList = document.getElementById('ticketsList');
    if (!ticketsList) return;
    
    ticketsList.innerHTML = `
        <div class="loading-container">
            <div class="loading-pulse">
                <div class="pulse-ring"></div>
                <div class="pulse-ring"></div>
                <div class="pulse-ring"></div>
                <div class="pulse-inner">
                    <i class="fas fa-train"></i>
                </div>
            </div>
            <div class="loading-text">Загрузка ваших билетов</div>
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="loading-subtext">Это может занять несколько секунд</div>
        </div>
    `;
}

// ========== ОРИГИНАЛЬНЫЙ КОД (НЕ ТРОГАТЬ) ==========

document.addEventListener('DOMContentLoaded', function() {
    loadUserTickets();
    
    // Используем делегирование событий
    const ticketsList = document.getElementById('ticketsList');
    if (ticketsList) {
        ticketsList.addEventListener('click', function(event) {
            const button = event.target.closest('.download-btn-dynamic');
            
            if (button) {
                event.preventDefault();
                event.stopPropagation();
                
                const ticketId = button.getAttribute('data-id');
                if (ticketId) {
                    downloadTicket(ticketId);
                }
            }
        });
    }
});

async function loadUserTickets() {
    const ticketsList = document.getElementById('ticketsList');
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (!userData || !userData.id) {
        ticketsList.innerHTML = '<div class="no-tickets"><h3>Пожалуйста, войдите в систему</h3></div>';
        return;
    }

    // ПОКАЗЫВАЕМ АНИМАЦИЮ ЗАГРУЗКИ ПЕРЕД ЗАПРОСОМ
    showPulseLoading(); // Можно заменить на showSpinnerLoading() или showSkeletonLoading()

    try {
        const response = await fetch(`https://ticket-search-bakend.onrender.com/my-tickets/${userData.id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tickets = await response.json();

        if (tickets.length === 0) {
            ticketsList.innerHTML = '<div class="no-tickets" style="text-align:center; padding: 40px;"><i class="fas fa-ticket-alt" style="font-size: 48px; color: #ccc;"></i><h3 style="margin-top: 15px;">У вас пока нет купленных билетов</h3><p style="color: #666;">Найдите и купите билеты на поезд</p><a href="seacrh.html" class="btn-find-tickets" style="display: inline-block; margin-top: 15px; background: #1a237e; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Найти билеты</a></div>';
            return;
        }

        ticketsList.innerHTML = ''; 

        tickets.forEach((ticket, index) => {
            const ticketCard = document.createElement('div');
            ticketCard.className = 'ticket-card';
            ticketCard.style = "background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-left: 5px solid #1a237e;";
            // Добавляем анимацию появления с задержкой
            ticketCard.style.animation = "fadeInUp 0.4s ease-out forwards";
            ticketCard.style.opacity = "0";
            ticketCard.style.animationDelay = `${index * 0.05}s`;

            ticketCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <h3 style="margin: 0; color: #1a237e;">${ticket.destination}</h3>
                        <p style="margin: 5px 0; color: #666;">
                            <i class="fas fa-calendar-alt"></i> ${ticket.departure_date} | 
                            <i class="fas fa-train"></i> №${ticket.train_number}
                        </p>
                        <p style="margin: 5px 0; font-size: 0.9em;">Тип вагона: <strong>${ticket.carriage_type}</strong></p>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 1.2em; font-weight: bold; color: #2c3e50;">${ticket.price} ₽</span>
                        <div style="color: green; font-size: 0.8em; margin-top: 5px;"><i class="fas fa-check-circle"></i> Оплачено</div>
                        
                        <button type="button" class="download-btn-dynamic" 
                            data-id="${ticket.id}"
                            style="margin-top:10px;padding:6px 12px;
                                   background:#1a237e;color:white;
                                   border:none;border-radius:6px;cursor:pointer;
                                   transition: all 0.3s;">
                            <i class="fas fa-download"></i> Скачать билет
                        </button>   
                    </div>
                </div>
            `;
            
            ticketsList.appendChild(ticketCard);
        });

    } catch (error) {
        console.error('Ошибка загрузки билетов:', error);
        ticketsList.innerHTML = '<div class="no-tickets" style="text-align:center; padding: 40px;"><i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e74c3c;"></i><h3 style="margin-top: 15px; color: #e74c3c;">Ошибка загрузки</h3><p style="color: #666;">Не удалось загрузить билеты. Попробуйте позже.</p></div>';
    }
}

// Исправленная функция скачивания билета
function downloadTicket(ticketId) {
    console.log("Скачивание билета ID:", ticketId);
    
    // Простой способ - открыть ссылку в новом окне
    window.open(`https://ticket-search-bakend.onrender.com/download-ticket/${ticketId}`, '_blank');
    
    // ИЛИ более сложный способ с fetch (раскомментируйте если нужен)
    /*
    fetch(`https://fatapi-zw3o.onrender.com/download-ticket/${ticketId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            // Создаем ссылку на blob объект
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ticket_${ticketId}.pdf`;
            
            // Добавляем, кликаем, удаляем
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Очищаем URL объект
            window.URL.revokeObjectURL(url);
            
            console.log("Билет успешно скачан");
        })
        .catch(error => {
            console.error('Ошибка при скачивании:', error);
            alert('Не удалось скачать билет. Попробуйте позже.');
        });
    */
}

// Альтернативный простой способ без fetch
function downloadTicketSimple(ticketId) {
    // Создаем невидимую ссылку
    const link = document.createElement('a');
    link.href = `https://ticket-search-bakend.onrender.com/${ticketId}`;
    link.target = '_blank';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}