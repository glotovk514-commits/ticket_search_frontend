document.addEventListener('DOMContentLoaded', () => {
    loadNews();
});

async function loadNews() {
    const container = document.getElementById('newsContainer');
    if (!container) return; // Защита, если элемента нет на странице

    try {
        // Если запускаешь локально — http://127.0.0.1:8000/news
        // Если на Render — используй свой URL
        const response = await fetch('https://ticket-search-bakend.onrender.com/news');
        const newsData = await response.json();

        if (newsData.length === 0) {
            container.innerHTML = '<p>Новостей пока нет.</p>';
            return;
        }

        // Очищаем контейнер перед загрузкой (на случай, если там был текст "Загрузка")
        container.innerHTML = '';

        newsData.forEach(item => {
            const article = document.createElement('article');
            article.className = 'news-card';
            
            // Используем твои названия полей из БД: title, article_link, image_url и т.д.
            article.innerHTML = `
                <a href="${item.article_link}">
                    <div class="news-image">
                        <img src="${item.image_url}" alt="${item.title}">
                        <div class="news-badge">${item.category}</div>
                    </div>
                    <div class="news-content">
                        <h3>${item.title}</h3>
                        <p class="news-excerpt">${item.excerpt}</p>
                        <div class="news-meta">
                            <span class="news-date"><i class="far fa-calendar"></i> ${item.news_date}</span>
                            <span class="news-views"><i class="far fa-eye"></i> ${item.views_count}</span>
                        </div>
                        <span class="read-more">Читать далее <i class="fas fa-arrow-right"></i></span>
                    </div>
                </a>
            `;
            container.appendChild(article);
        });

    } catch (error) {
        console.error('Ошибка загрузки:', error);
        container.innerHTML = '<p style="color: red;">Ошибка при загрузке новостей</p>';
    }
}