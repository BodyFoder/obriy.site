document.addEventListener('DOMContentLoaded', () => {
    // News loading logic
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

        newsData.reverse().forEach(newsItem => {
            const article = document.createElement('article');
            article.className = 'news-card fade-in-item'; // Clean class

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

        // Trigger observer for new elements
        observeAnimations();
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

        // Select all elements to animate
        const animatedElements = document.querySelectorAll('.animate, .fade-in-item');
        animatedElements.forEach(el => {
            // Set initial state via JS to ensure graceful degradation if JS fails
            el.style.opacity = 0;
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        });
    }

    // Initial call
    observeAnimations();
});
