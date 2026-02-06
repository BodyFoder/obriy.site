document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.desktop-nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate closing if we add outside click listener later
            nav.classList.toggle('active');
            
            // Toggle icon between bars and times (X)
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (nav.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when clicking a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
                nav.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
    console.log('Script initialized v1.1');



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

    // 3. Logic for Donatello Donations
    if (document.getElementById('patrons-grid')) {
        loadDonations();
    }

    // 4. Interactive Background (Parallax/Glow)
    // 4. Interactive Background (Parallax/Glow)
    // 4. Interactive Background (Canvas Starfield) - High Performance
    initStarfield();

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
    const displayIp = 'play.obriyhytale.pp.ua:25504';
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
                
                // Hide player count if 0 to avoid "scaring off" new players
                if (data.online === 0) {
                    text.innerHTML = `<span style="color: var(--vp-c-brand);">Online</span>`;
                } else {
                    text.innerHTML = `Online: <span style="color: var(--vp-c-brand);">${data.online}</span> / ${data.maxPlayers}`;
                }
            } else {
                dot.classList.add('offline');
                dot.classList.remove('online');
                text.textContent = 'Offline';
            }

            // Copy click handler
            widget.onclick = () => {
                navigator.clipboard.writeText('play.obriyhytale.pp.ua:25504').then(() => {
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

                const tagsHtml = newsItem.tags && newsItem.tags.length > 0 && newsItem.tags[0] !== ""
                    ? `<div class="news-tags">${newsItem.tags.filter(t => t.trim()).map(tag => `<span class="tag" style="font-size:11px; color:var(--vp-c-brand); margin-right:8px;">#${tag.trim()}</span>`).join('')}</div>`
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
                        <p style="margin-bottom: 16px;">${newsItem.summary || (stripHtml(newsItem.fullContent || '').substring(0, 300) + '...')}</p>
                        <a href="article.html?id=${newsItem.id}" class="read-more">Читати далі <i class="fas fa-arrow-right"></i></a>
                    </div>
                `;
                newsContainer.appendChild(article);
            });
        })
        .catch(error => console.error('Error loading news:', error));
}

// Helper to strip HTML tags
function stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
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

                const tagsHtml = newsItem.tags && newsItem.tags.length > 0 && newsItem.tags[0] !== ""
                    ? `<div class="news-tags" style="margin-bottom:8px;">${newsItem.tags.filter(t => t.trim()).map(tag => `<span class="tag" style="font-size:11px; color:var(--vp-c-brand); margin-right:8px;">#${tag.trim()}</span>`).join('')}</div>`
                    : '';

                // Enforce character limit (max 120 chars) AND STRIP HTML
                let rawContent = newsItem.summary || newsItem.fullContent || '';
                let plainText = stripHtml(rawContent);
                
                let summaryText = plainText;
                if (summaryText.length > 500) {
                    summaryText = summaryText.substring(0, 500) + '...';
                }

                article.innerHTML = `
                    <div class="news-image" style="height: 180px;">
                         <img src="${newsItem.image}" alt="${newsItem.title}" onerror="this.src='assets/images/logo_new.png'">
                    </div>
                    <div class="news-content" style="padding: 20px;">
                        <div class="news-meta" style="margin-bottom: 8px;">
                            <span class="news-date" style="font-size: 12px;"><i class="far fa-calendar-alt"></i> ${newsItem.date}</span>
                        </div>
                        ${tagsHtml}
                        <h3 class="home-news-title">${newsItem.title}</h3>
                        <p class="home-news-desc">${summaryText}</p>
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
            <div class="full-article"> <!-- WRAPPER ADDED FOR STYLING -->
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
                <div class="article-content" style="font-size: 18px; line-height: 1.8; color: var(--vp-c-text-1);">
                    ${article.fullContent || article.summary}
                </div>
            </div>
        `;
    } else {
        container.innerHTML = '<p>Статтю не знайдено.</p>';
    }
}

// --- DONATELLO INTEGRATION ---
async function loadDonations() {
    const grid = document.getElementById('patrons-grid');
    const totalAmountEl = document.getElementById('total-amount');
    const totalCountEl = document.getElementById('total-count');
    
    // ⚠️ ВАЖЛИВО: Замініть це посилання на URL вашого Cloudflare Worker
    const WORKER_URL = 'https://solitary-sunset-f786.bodyagavril.workers.dev'; 

    if (!grid) return;

    if (WORKER_URL === 'INSERT_YOUR_WORKER_URL_HERE') {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ffeb3b; padding: 20px; background: rgba(0,0,0,0.5); border-radius: 8px;">⚠️ Потрібно налаштувати Cloudflare Worker (оновіть script.js)</div>';
        return;
    }

    try {
        const response = await fetch(`${WORKER_URL}?t=${Date.now()}`);
        if (!response.ok) throw new Error('Помилка отримання даних: ' + response.status);
        
        const data = await response.json();
        
        // Новий формат відповіді воркера: { stats: {...}, list: {...} }
        // Старий формат (якщо воркер не оновлено): { content: [...] }
        
        const donations = data.list ? (data.list.content || []) : (data.content || []);
        const stats = data.stats || null;

        // Оновлюємо статистику
        if (stats) {
            if (totalAmountEl) totalAmountEl.textContent = `${stats.totalAmount} UAH`;
            if (totalCountEl) totalCountEl.textContent = stats.totalCount;
        } else {
             // Fallback якщо немає статистики
             if (totalAmountEl) totalAmountEl.textContent = '---';
             if (totalCountEl) totalCountEl.textContent = '---';
        }

        grid.innerHTML = '';

        if (donations.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--vp-c-text-2);">Поки що тут пусто. Станьте першим!</div>';
            return;
        }

        donations.forEach(d => {
            const card = document.createElement('div');
            card.className = 'patron-card';

            const amountHtml = d.amount ? `<span class="patron-amount">${d.amount} ${d.currency || 'UAH'}</span>` : '';
            const safeMessage = d.message ? stripHtml(d.message) : '';
            const msgHtml = safeMessage ? `<p class="patron-message">"${safeMessage}"</p>` : '';

            card.innerHTML = `
                <div class="patron-header">
                    <span class="patron-name">${stripHtml(d.clientName || 'Анонім')}</span>
                    ${amountHtml}
                </div>
                ${msgHtml}
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Donatello Error:', error);
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ff4d4d;">Не вдалося завантажити список донатів.</div>';
    }
}

// Helper for Copy IP in How to Start
function copyIp(element) {
    const ip = element.getAttribute('data-ip');
    if (!ip) return;

    navigator.clipboard.writeText(ip).then(() => {
        const originalHtml = element.innerHTML;
        const icon = element.querySelector('.copy-hint i');
        const textElement = element.querySelector('.ip-text');

        if (icon) icon.className = 'fas fa-check';
        if (textElement) textElement.innerText = 'Скопійовано!';

        element.style.borderColor = 'var(--vp-c-success, #10b981)';

        setTimeout(() => {
            element.innerHTML = originalHtml;
            element.style.borderColor = 'var(--vp-c-border)';
        }, 2000);
    }).catch(err => console.error('Failed to copy: ', err));
}

// Add this function to the end of script.js

function initStarfield() {
    // Disable starfield on Map page for performance
    if (document.querySelector('.map-container') || window.location.pathname.includes('map.html')) {
        console.log('Starfield disabled on Map page');
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.id = 'starfield';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    
    // Mouse state
    let mouse = { x: -1000, y: -1000 };
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Resize handler
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initStars();
    }
    window.addEventListener('resize', resize);

    // Star Class
    class Star {
        constructor() {
            this.reset();
            // Start at random positions
            this.x = Math.random() * width;
            this.y = Math.random() * height;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5; // 0.5 to 2.5px
            this.speedX = (Math.random() - 0.5) * 0.5; // Slow drift
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Optional: Parallax Scroll Effect
            // Move stars up slightly when scrolling down to simulate depth?
            // Or just act as a fixed window looking out (User preferred fixed spotlight + moving stars)
            // Let's keep stars drifting naturally.

            // Wrap around screen
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initStars() {
        stars = [];
        const starCount = Math.floor((width * height) / 4000); // Density
        for (let i = 0; i < starCount; i++) {
            stars.push(new Star());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // 1. Draw Spotlight (Radial Gradient)
        if (mouse.x > -100) {
            const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 400); // 400px radius
            gradient.addColorStop(0, 'rgba(252, 165, 13, 0.15)'); // Brand color
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        // 2. Update and Draw Stars
        stars.forEach(star => {
            // Apply scroll offset visually for "moving with scroll" effect if needed
            // But fixing canvas is better performance. 
            // If user wants background to scroll, we can subtract scrollY from star.y during draw.
            // Let's try pure fixed first (smoothest).
            
            star.update();
            
            // Simulating scroll:
            // let screenY = star.y - (window.scrollY * 0.2); // Parallax factor
            // if (screenY < 0) screenY += height; // Wrap logic gets complex with scroll
            
            // Standard draw (Fixed background, chaotic drift)
            star.draw();
        });

        requestAnimationFrame(animate);
    }

    resize();
    initStars();
    animate();
}
