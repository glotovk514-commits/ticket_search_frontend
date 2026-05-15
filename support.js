document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы чата
    const chatBtn = document.getElementById('chatButton');
    const chatWin = document.getElementById('chatWindow');
    const closeBtn = document.getElementById('closeChat');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessage');
    const chatMsgs = document.getElementById('chatMessages');

    // Открытие/закрытие окна
    if (chatBtn) {
        chatBtn.addEventListener('click', () => {
            chatWin.classList.toggle('active');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            chatWin.classList.remove('active');
        });
    }

    // Функция отправки
    async function sendMsg() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Отображаем сообщение пользователя
        const uMsg = document.createElement('div');
        uMsg.className = 'message user';
        uMsg.textContent = text;
        chatMsgs.appendChild(uMsg);
        
        chatInput.value = '';
        chatMsgs.scrollTop = chatMsgs.scrollHeight;

        // 2. Создаем временное сообщение "Печатает..."
        const typingMsg = document.createElement('div');
        typingMsg.className = 'message bot';
        typingMsg.textContent = 'Печатает...';
        chatMsgs.appendChild(typingMsg);
        chatMsgs.scrollTop = chatMsgs.scrollHeight;

        try {
            // 3. Отправляем запрос на ваш FastAPI бэкенд
            const response = await fetch('https://ticket-search-bakend.onrender.com/gigaChat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text }) 
            });

            const data = await response.json();

            // 4. Заменяем "Печатает..." на реальный ответ
            typingMsg.textContent = data.reply; 

        } catch (error) {
            typingMsg.textContent = "Ошибка: не удалось связаться с сервером.";
            console.error("Ошибка запроса:", error);
        }

        chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    // --- ПРИВЯЗКА СОБЫТИЙ ЧАТА (Этого не хватало) ---
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMsg);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMsg();
        });
    }

    // --- Функционал для FAQ ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const toggle = item.querySelector('.faq-toggle');

        const toggleFaq = () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        };

        if (question) question.addEventListener('click', toggleFaq);
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFaq();
            });
        }
    });

    // --- Обработчик формы обратной связи ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.style.cssText = `
                background: #e8f5e9;
                color: #2e7d32;
                padding: 15px;
                border-radius: 4px;
                margin-top: 20px;
                text-align: center;
                border: 1px solid #c8e6c9;
            `;
            successMessage.textContent = 'Спасибо! Ваше сообщение отправлено.';
            contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);
            contactForm.reset();
            setTimeout(() => successMessage.remove(), 5000);
        });
    }

    // --- Обработчик поиска ---
    const helpSearchInput = document.querySelector('.help-search-input');
    const helpSearchBtn = document.querySelector('.help-search-btn');

    function performHelpSearch() {
        const searchTerm = helpSearchInput.value.trim();
        if (searchTerm) {
            alert(`Поиск по запросу: "${searchTerm}".`);
            const faqSection = document.querySelector('.faq-section');
            if (faqSection) faqSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    if (helpSearchBtn) helpSearchBtn.addEventListener('click', performHelpSearch);
    if (helpSearchInput) {
        helpSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performHelpSearch();
        });
    }
});