document.addEventListener('DOMContentLoaded', () => {
    // News loading logic
    const newsContainer = document.getElementById('news-container');

    // Fetch news data
    fetch('news.json')
        .then(response => response.json())
        .then(data => {
            handleNewsData(data);
        })
        .catch(error => {
            console.error('Error loading news:', error);
            if (newsContainer) newsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Не вдалося завантажити новини. Спробуйте пізніше.</p>';
            const articleContainer = document.getElementById('article-content');
            if (articleContainer) articleContainer.innerHTML = '<p>Не вдалося завантажити статтю.</p>';
        });

    function handleNewsData(newsData) {
        // Generate dynamic IDs if missing
        const newsWithIds = newsData.map((item, index) => ({
            ...item,
            id: item.id || `post-${index}`
        }));

        // Check if we are on article.html
        if (window.location.pathname.endsWith('article.html')) {
            loadFullArticle(newsWithIds);
            return;
        }

        // Otherwise render news feed
        if (newsContainer) {
            renderNews(newsWithIds);
        }
    }

    function renderNews(newsData) {
        newsContainer.innerHTML = '';

        newsData.reverse().forEach(newsItem => {
            const article = document.createElement('article');
            article.className = 'news-card fade-in-item';

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
                    <p style="margin-bottom: 16px;">${newsItem.summary || newsItem.content.substring(0, 100) + '...'}</p>
                    <a href="article.html?id=${newsItem.id}" class="read-more">Читати далі <i class="fas fa-arrow-right"></i></a>
                </div>
            `;

            newsContainer.appendChild(article);
        });

        observeAnimations();
    }

    // Function to load single article on article.html
    function loadFullArticle(newsData) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const container = document.getElementById('article-content');

        if (!id || !container) return;

        const article = newsData.find(item => item.id == id);

        if (article) {
            const content = article.fullContent || article.content || '<p>Текст статті відсутній.</p>';

            container.innerHTML = `
                <div class="article-header" style="margin-bottom: 32px;">
                     <div class="news-image" style="height: 400px; border-radius: 12px; margin-bottom: 24px; overflow:hidden;">
                        <img src="${article.image}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="news-meta" style="margin-bottom: 16px; color: var(--vp-c-text-2);">
                        <span><i class="far fa-calendar-alt"></i> ${article.date}</span>
                        ${article.tags ? article.tags.map(tag => `<span class="tag" style="margin-left:12px; color: var(--vp-c-brand); font-weight:600;">${tag}</span>`).join('') : ''}
                    </div>
                    <h1 style="font-size: 40px; line-height: 1.2; margin-bottom: 24px;">${article.title}</h1>
                </div>
                <div class="article-body" style="font-size: 18px; color: var(--vp-c-text-1); line-height: 1.8;">
                    ${content} 
                </div>
            `;
        } else {
            container.innerHTML = '<h2>Статтю не знайдено</h2><p>Можливо, за посиланням стара адреса.</p>';
        }
    }

    // Animation Intersect Observer
    function observeAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const animatedElements = document.querySelectorAll('.animate, .fade-in-item');
        animatedElements.forEach(el => {
            el.style.opacity = 0;
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        });
    }

    // Initial call
    observeAnimations();
});
