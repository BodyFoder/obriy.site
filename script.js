document.addEventListener('DOMContentLoaded', () => {
    // 1. Logic for News Feed (Home / News Page)
    if (document.getElementById('news-container')) {
        loadNews();
    }

    // 2. Logic for Single Article (Article Page)
    if (window.location.pathname.endsWith('article.html') || document.getElementById('article-content')) {
        // Load data first, then find article
        fetch('news.json')
            .then(res => res.json())
            .then(data => {
                const newsData = data.map((item, index) => ({ ...item, id: item.id || `post-${index}` }));
                loadFullArticle(newsData);
            })
            .catch(e => console.error(e));
    }

    // 3. Logic for Patrons (Donate Page)
    if (document.getElementById('patrons-grid')) {
        loadPatrons();
    }

    // 4. Interactive Background (Parallax/Glow)
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        // Update CSS variables for spotlight effect
        document.body.style.setProperty('--mouse-x', `${x}px`);
        document.body.style.setProperty('--mouse-y', `${y}px`);

        // Optional: Parallax effect for patterns
        // const paramX = (window.innerWidth - x) / 50;
        // const paramY = (window.innerHeight - y) / 50;
        // document.body.style.backgroundPosition = `${paramX}px ${paramY}px, 0 0`;
    });
});

// --- NEWS LOGIC ---
function loadNews() {
    fetch('news.json')
        .then(response => response.json())
        .then(data => {
            const newsContainer = document.getElementById('news-container');
            if (!newsContainer) return;
            newsContainer.innerHTML = '';

            const newsWithIds = data.map((item, index) => ({
                ...item,
                id: item.id || `post-${index}`
            }));

            newsWithIds.reverse().forEach(newsItem => {
                const article = document.createElement('article');
                article.className = 'news-card fade-in-item';

                const tagsHtml = newsItem.tags
                    ? `<div class="news-tags">${newsItem.tags.map(tag => `<span class="tag" style="font-size:11px; color:var(--vp-c-brand); margin-right:8px;">#${tag}</span>`).join('')}</div>`
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
                        <p style="margin-bottom: 16px;">${newsItem.summary || (newsItem.fullContent ? newsItem.fullContent.substring(0, 100) + '...' : '')}</p>
                        <a href="article.html?id=${newsItem.id}" class="read-more">Читати далі <i class="fas fa-arrow-right"></i></a>
                    </div>
                `;
                newsContainer.appendChild(article);
            });
        })
        .catch(error => console.error('Error loading news:', error));
}

function loadFullArticle(newsData) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('article-content');

    if (!id || !container) return;

    const article = newsData.find(item => item.id == id);

    if (article) {
        document.title = `${article.title} - ОБРІЙ`;

        container.innerHTML = `
            <div class="article-header" style="margin-bottom: 32px;">
                 <a href="news.html" class="back-link"><i class="fas fa-arrow-left"></i> До списку новин</a>
                 <h1 style="font-size: 36px; margin-top:16px; margin-bottom:16px;">${article.title}</h1>
                 <div class="news-meta" style="margin-bottom: 16px; color: var(--vp-c-text-2);">
                    <span><i class="far fa-calendar-alt"></i> ${article.date}</span>
                    ${article.tags ? article.tags.map(tag => `<span class="tag" style="margin-left:12px; color: var(--vp-c-brand); font-weight:600;">#${tag}</span>`).join('') : ''}
                </div>
                 <div class="news-image" style="height: 400px; border-radius: 12px; margin-bottom: 24px; overflow:hidden;">
                    <img src="${article.image}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </div>
            <div class="article-body" style="font-size: 18px; line-height: 1.8; color: var(--vp-c-text-1);">
                ${article.fullContent || article.content}
            </div>
        `;
    } else {
        container.innerHTML = '<p>Статтю не знайдено.</p>';
    }
}

// --- PATRONS LOGIC ---
async function loadPatrons() {
    const grid = document.getElementById('patrons-grid');
    if (!grid) return;

    try {
        const response = await fetch('patrons.json');
        if (!response.ok) throw new Error('Failed to load patrons');
        const patrons = await response.json();

        grid.innerHTML = '';

        if (patrons.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--vp-c-text-2);">Поки що тут пусто. Станьте першим!</div>';
            return;
        }

        patrons.reverse().forEach(p => {
            const card = document.createElement('div');
            card.className = 'patron-card';

            const amountHtml = p.amount ? `<span class="patron-amount">${p.amount}</span>` : '';
            const msgHtml = p.message ? `<p class="patron-message">"${p.message}"</p>` : '';

            card.innerHTML = `
                <div class="patron-header">
                    <span class="patron-name">${p.name}</span>
                    ${amountHtml}
                </div>
                ${msgHtml}
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ff4d4d;">Не вдалося завантажити список меценатів :(</div>';
    }
}
