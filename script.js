document.addEventListener('DOMContentLoaded', () => {
    console.log('Script initialized v1.1');

    // 0. Mobile Menu Logic
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.desktop-nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // 1. Logic for News Feed (Home / News Page)
    if (document.getElementById('news-container')) {
        loadNews();
    }
    // Logic for Home Latest News
    if (document.getElementById('home-news-grid')) {
        loadHomeNews();
    }

    // 2. Logic for Single Article (Article Page)
    if (window.location.pathname.endsWith('article.html') || document.getElementById('article-content')) {
        // Load data first, then find article
        fetch('news.json?t=' + Date.now())
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
    });

    // 5. Server Status Widget
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        fetchServerStatus();
    } else {
        fetchServerStatus();
    }
    // Auto-update every 60 seconds
    setInterval(fetchServerStatus, 60000);
});

async function fetchServerStatus() {
    console.log('Starting Server Status Fetch...');
    const statusWidgets = document.querySelectorAll('.server-status');
    if (!statusWidgets.length) return;

    // Use local JSON file containing status
    const displayIp = 'play.obriyhytale.pp.ua';
    const statusUrl = 'server-status.json';

    try {
        // 5 second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${statusUrl}?t=${new Date().getTime()}`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Server Status Data:', data);

        statusWidgets.forEach(widget => {
            const dot = widget.querySelector('.status-dot');
            const text = widget.querySelector('.status-text');

            if (data && typeof data.online !== 'undefined') {
                dot.classList.add('online');
                dot.classList.remove('offline');
                text.innerHTML = `Online: <span style="color: var(--vp-c-brand);">${data.online}</span> / ${data.maxPlayers}`;
            } else {
                dot.classList.add('offline');
                dot.classList.remove('online');
                text.textContent = 'Offline';
            }

            // Copy click handler
            widget.onclick = () => {
                navigator.clipboard.writeText(displayIp).then(() => {
                    const originalText = text.innerHTML;
                    if (!text.textContent.includes('Copied')) {
                        const oldContent = text.innerHTML;
                        text.textContent = 'IP Copied!';
                        setTimeout(() => text.innerHTML = oldContent, 2000);
                    }
                });
            };
        });

    } catch (error) {
        console.error('Error fetching server status:', error);
        statusWidgets.forEach(widget => {
            const dot = widget.querySelector('.status-dot');
            const text = widget.querySelector('.status-text');
            dot.classList.add('offline');
            dot.classList.remove('online');
            // If error, show Offline instead of Loading
            if (text) text.textContent = 'Offline';
        });
    }
}

// --- NEWS LOGIC ---
function loadNews() {
    fetch('news.json?t=' + Date.now())
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
                        <img src="${newsItem.image}" alt="${newsItem.title}" onerror="this.src='assets/images/logo_new.png'">
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

function loadHomeNews() {
    fetch('news.json?t=' + Date.now())
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('home-news-grid');
            if (!container) return;
            container.innerHTML = '';

            const newsWithIds = data.map((item, index) => ({
                ...item,
                id: item.id || `post-${index}`
            }));

            // Take last 3 items (latest) and reverse them to show newest first
            const latest = newsWithIds.slice(-3).reverse();

            latest.forEach(newsItem => {
                const article = document.createElement('a'); // Make the whole card a link
                article.href = `article.html?id=${newsItem.id}`;
                article.className = 'news-card';
                article.style.textDecoration = 'none';
                article.style.color = 'inherit';

                const tagsHtml = newsItem.tags
                    ? `<div class="news-tags" style="margin-bottom:8px;">${newsItem.tags.map(tag => `<span class="tag" style="font-size:11px; color:var(--vp-c-brand); margin-right:8px;">#${tag}</span>`).join('')}</div>`
                    : '';

                // Shorter summary for home cards
                const summaryText = newsItem.summary || (newsItem.fullContent ? newsItem.fullContent.substring(0, 80) + '...' : '');

                article.innerHTML = `
                    <div class="news-image" style="height: 180px;">
                         <img src="${newsItem.image}" alt="${newsItem.title}" onerror="this.src='assets/images/logo_new.png'">
                    </div>
                    <div class="news-content" style="padding: 20px;">
                        <div class="news-meta" style="margin-bottom: 8px;">
                            <span class="news-date" style="font-size: 12px;"><i class="far fa-calendar-alt"></i> ${newsItem.date}</span>
                        </div>
                        ${tagsHtml}
                        <h3 style="font-size: 18px; margin-bottom: 8px;">${newsItem.title}</h3>
                        <p style="font-size: 14px; margin-bottom: 16px; color: var(--vp-c-text-2); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${summaryText}</p>
                        <span class="read-more" style="margin-top:auto;">Читати далі <i class="fas fa-arrow-right"></i></span>
                    </div>
                `;
                container.appendChild(article);
            });
        })
        .catch(error => console.error('Error loading home news:', error));
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
        const response = await fetch('patrons.json?t=' + Date.now());
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
