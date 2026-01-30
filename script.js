document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');

    if (newsContainer) {
        fetch('news.json')
            .then(response => response.json())
            .then(data => {
                renderNews(data);
            })
            .catch(error => {
                console.error('Error loading news:', error);
                newsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Не вдалося завантажити новини. Спробуйте пізніше.</p>';
            });
    }

    function renderNews(newsData) {
        newsContainer.innerHTML = '';
        
        // Sort by id descending (assuming newer IDs are newer news) or date parsing
        // For simplicity, showing as is, or can reverse
        newsData.reverse().forEach(newsItem => {
            const article = document.createElement('article');
            article.className = 'news-card';
            
            const tagsHtml = newsItem.tags 
                ? `<div class="news-tags">${newsItem.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
                : '';

            article.innerHTML = `
                <div class="news-image">
                    <img src="${newsItem.image}" alt="${newsItem.title}" onerror="this.src='assets/images/logo.png'">
                </div>
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-date"><i class="far fa-calendar-alt"></i> ${newsItem.date}</span>
                    </div>
                    ${tagsHtml}
                    <h3>${newsItem.title}</h3>
                    <p>${newsItem.content}</p>
                    <a href="#" class="read-more">Читати далі <i class="fas fa-arrow-right"></i></a>
                </div>
            `;
            
            newsContainer.appendChild(article);
        });
    }
});
