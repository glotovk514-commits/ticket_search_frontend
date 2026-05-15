// Класс для управления личным кабинетом
class ProfileManager {
    constructor() {
        this.user = null;
        this.apiUrl = 'https://ticket-search-bakend.onrender.com'; // Базовый URL вашего API
        this.init();
    }

    async init() { // Сделали init асинхронным
        this.checkAuth();
        if (this.user) {
            await this.loadUserData(); // Ждем загрузки данных из БД
            this.setupEventListeners();
            this.setupTabs();
        }
    }

    checkAuth() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        this.user = user;
    }

    // НОВЫЙ МЕТОД: Получение актуальных данных пользователя из БД
    async fetchUserFromDb() {
        try {
            const response = await fetch(`${this.apiUrl}/users/${this.user.id}`);
            if (!response.ok) throw new Error('Ошибка получения данных профиля');
            const dbData = await response.json();
            // Обновляем локальный объект пользователя данными из базы
            this.user = { ...this.user, ...dbData };
            localStorage.setItem('user', JSON.stringify(this.user));
            return dbData;
        } catch (error) {
            console.error("Не удалось синхронизироваться с БД:", error);
            return null;
        }
    }

    async loadUserData() {
        // Сначала пробуем получить свежие данные из БД
        await this.fetchUserFromDb();

        const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
        
        // Только существующие поля
        if (document.getElementById('firstName')) {
            document.getElementById('firstName').value = this.user.name || savedProfile.firstName || '';
        }
        if (document.getElementById('lastName')) {
            document.getElementById('lastName').value = this.user.last_name || savedProfile.lastName || '';
        }
        if (document.getElementById('email')) {
            document.getElementById('email').value = this.user.email || '';
        }
        
        // Обновляем боковую панель
        if (document.getElementById('userName')) {
            document.getElementById('userName').textContent = `${this.user.name || ''} ${this.user.last_name || ''}`.trim() || 'Пользователь';
        }
        if (document.getElementById('userEmail')) {
            document.getElementById('userEmail').textContent = this.user.email || '-';
        }
        
        // Настройки (без языка)
        const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
        if (document.getElementById('emailNotifications')) {
            document.getElementById('emailNotifications').checked = settings.emailNotifications !== false;
        }
        if (document.getElementById('smsNotifications')) {
            document.getElementById('smsNotifications').checked = settings.smsNotifications || false;
        }
        if (document.getElementById('promoNotifications')) {
            document.getElementById('promoNotifications').checked = settings.promoNotifications || false;
        }
        
        await this.loadStats(); // Ждем загрузки статистики
    }

    async loadStats() {
        let tickets = [];
        try {
            // ПОДГРУЗКА БИЛЕТОВ ИЗ БД
            const response = await fetch(`${this.apiUrl}/my-tickets/${this.user.id}`);
            if (response.ok) {
                tickets = await response.json();
                // Синхронизируем локальное хранилище
                localStorage.setItem('userTickets', JSON.stringify(tickets));
            } else {
                tickets = JSON.parse(localStorage.getItem('userTickets')) || [];
            }
        } catch (e) {
            console.error("Ошибка запроса статистики из БД:", e);
            tickets = JSON.parse(localStorage.getItem('userTickets')) || [];
        }

        const totalTickets = tickets.length;
        let totalSpent = 0;
        
        tickets.forEach(ticket => {
            totalSpent += Number(ticket.price) || 0;
        });
        
        // Берем дату регистрации из данных пользователя (если есть в БД) или из localStorage
        const regDate = this.user.created_at || localStorage.getItem('userRegDate');
        let memberDays = 0;
        if (regDate) {
            const days = Math.floor((new Date() - new Date(regDate)) / (1000 * 60 * 60 * 24));
            memberDays = days > 0 ? days : 1;
        } else {
            memberDays = Math.floor(Math.random() * 365) + 1;
        }
        
        if (document.getElementById('totalTickets')) {
            document.getElementById('totalTickets').textContent = totalTickets;
        }
        if (document.getElementById('totalSpent')) {
            document.getElementById('totalSpent').textContent = totalSpent.toLocaleString();
        }
        if (document.getElementById('memberDays')) {
            document.getElementById('memberDays').textContent = memberDays;
        }
    }

    async saveProfile(data) {
        try {
            // ОТПРАВКА ОБНОВЛЕНИЙ НА СЕРВЕР (БД)
            const response = await fetch(`${this.apiUrl}/users/${this.user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.firstName,
                    last_name: data.lastName
                })
            });

            if (!response.ok) throw new Error('Ошибка при сохранении на сервере');
            
            const updatedUserFromDb = await response.json();
            
            this.user = { ...this.user, ...updatedUserFromDb };
            localStorage.setItem('user', JSON.stringify(this.user));
            
            const profileData = {
                firstName: data.firstName,
                lastName: data.lastName
            };
            localStorage.setItem('userProfile', JSON.stringify(profileData));
            
            this.showNotification('Профиль успешно обновлен!', 'success');
            await this.loadUserData(); // Перезагружаем интерфейс
            return true;
        } catch (error) {
            console.error(error);
            this.showNotification('Ошибка при сохранении профиля в БД', 'error');
            return false;
        }
    }

    async changePassword(currentPassword, newPassword, confirmPassword) {
        if (newPassword !== confirmPassword) {
            this.showNotification('Пароли не совпадают!', 'error');
            return false;
        }
        
        if (newPassword.length < 6) {
            this.showNotification('Пароль должен содержать минимум 6 символов!', 'error');
            return false;
        }
        
        if (!/[A-Z]/.test(newPassword)) {
            this.showNotification('Пароль должен содержать хотя бы одну заглавную букву!', 'error');
            return false;
        }
        
        if (!/[0-9]/.test(newPassword)) {
            this.showNotification('Пароль должен содержать хотя бы одну цифру!', 'error');
            return false;
        }
        
        // В реальном приложении здесь должен быть fetch запрос к /change-password
        const savedPassword = localStorage.getItem('userPassword');
        if (currentPassword !== 'password' && currentPassword !== savedPassword) {
            this.showNotification('Неверный текущий пароль!', 'error');
            return false;
        }
        
        try {
            localStorage.setItem('userPassword', newPassword);
            this.showNotification('Пароль успешно изменен!', 'success');
            if (document.getElementById('passwordForm')) {
                document.getElementById('passwordForm').reset();
            }
            return true;
        } catch (error) {
            this.showNotification('Ошибка при смене пароля', 'error');
            return false;
        }
    }

    saveSettings(settings) {
        localStorage.setItem('userSettings', JSON.stringify(settings));
        this.showNotification('Настройки сохранены!', 'success');
    }

    deleteAccount() {
        const confirm = window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо!');
        if (confirm) {
            const confirm2 = window.confirm('ВНИМАНИЕ! Все ваши данные будут удалены навсегда. Удалить аккаунт?');
            if (confirm2) {
                // В идеале: fetch(`${this.apiUrl}/users/${this.user.id}`, { method: 'DELETE' })
                localStorage.clear(); 
                
                this.showNotification('Аккаунт удален. Перенаправление...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        }
    }

    setupEventListeners() {
        // Форма профиля
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = {
                    firstName: document.getElementById('firstName')?.value || '',
                    lastName: document.getElementById('lastName')?.value || ''
                };
                await this.saveProfile(formData);
            });
        }
        
        // Кнопка отмены
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.loadUserData();
                this.showNotification('Изменения отменены', 'info');
            });
        }
        
        // Форма пароля
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const currentPassword = document.getElementById('currentPassword')?.value || '';
                const newPassword = document.getElementById('newPassword')?.value || '';
                const confirmPassword = document.getElementById('confirmPassword')?.value || '';
                await this.changePassword(currentPassword, newPassword, confirmPassword);
            });
        }
        
        // Форма настроек
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const settings = {
                    emailNotifications: document.getElementById('emailNotifications')?.checked || false,
                    smsNotifications: document.getElementById('smsNotifications')?.checked || false,
                    promoNotifications: document.getElementById('promoNotifications')?.checked || false
                };
                this.saveSettings(settings);
            });
        }
        
        // Кнопка удаления аккаунта
        const deleteBtn = document.getElementById('deleteAccountBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteAccount();
            });
        }
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.sidebar-menu li');
        const contents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Убираем активные классы
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                // Добавляем активный класс текущей вкладке
                tab.classList.add('active');
                
                // Показываем соответствующий контент
                const tabName = tab.getAttribute('data-tab');
                const activeContent = document.getElementById(`${tabName}-tab`);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            });
        });
    }

    showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span style="margin-left: 10px;">${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Запуск после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ProfileManager();
    });
} else {
    new ProfileManager();
}