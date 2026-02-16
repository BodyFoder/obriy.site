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
    console.log('Script initialized v1.2');

    window.VIEWS_WORKER_URL = 'https://viewsworker.bodyagavril.workers.dev/';



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

            // Player List Tooltip Logic
            const players = data.worlds && data.worlds[0] && data.worlds[0].players ? data.worlds[0].players : [];
            if (players.length > 0) {
                // Check if tooltip already exists, if not create it
                let tooltip = widget.querySelector('.player-list-tooltip');
                if (!tooltip) {
                    tooltip = document.createElement('div');
                    tooltip.className = 'player-list-tooltip';
                    widget.appendChild(tooltip); // Append to widget for relative positioning
                    
                    // Add Click Handler to toggle tooltip
                    widget.style.cursor = 'pointer';
                    widget.onclick = (e) => {
                        e.stopPropagation();
                        // Close other tooltips if any (for future proofing)
                        document.querySelectorAll('.player-list-tooltip.active').forEach(t => {
                            if (t !== tooltip) t.classList.remove('active');
                        });
                        tooltip.classList.toggle('active');
                        if (tooltip.classList.contains('active')) {
                            loadTooltipImages(tooltip);
                        }
                    };
                }

                // Check visibility state to decide whether to load images immediately
                const isVisible = tooltip.classList.contains('active');
                
                // Check if player list has changed to avoid unnecessary DOM updates
                const currentPlayersJson = JSON.stringify(players);
                if (tooltip.dataset.lastPlayers !== currentPlayersJson) {
                    tooltip.dataset.lastPlayers = currentPlayersJson;
                    
                    // Update Tooltip Content
                    // Uses Hyvatar Proxy with correct endpoint
                    tooltip.innerHTML = `
                        <div class="player-list-header">Гравці онлайн (${data.online})</div>
                        <div class="player-list-grid">
                            ${players.map(player => `
                                <div class="player-item">
                                    <div class="player-avatar">
                                        <img 
                                            src="${isVisible ? `https://hyvatar-worker.bodyagavril.workers.dev/?username=${player}` : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}" 
                                            data-src="https://hyvatar-worker.bodyagavril.workers.dev/?username=${player}" 
                                            alt="${player}" 
                                            loading="lazy"
                                            crossorigin="anonymous"
                                        >
                                    </div>
                                    <span>${player}</span>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else {
                    // If list hasn't changed, but tooltip became active, make sure images are loaded
                    if (isVisible) {
                        loadTooltipImages(tooltip);
                    }
                }

                // If existing tooltip was active, we need to ensure images are loaded (handled by src=${isVisible...} above)
                // But if we just created it or it was closed, we rely on the click handler.

            } else {
                // Remove tooltip if no players or offline
                const tooltip = widget.querySelector('.player-list-tooltip');
                if (tooltip) tooltip.remove();
                widget.onclick = null; // Remove click handler
                widget.style.cursor = 'default';
            }
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

// Helper to load images in a specific tooltip
function loadTooltipImages(tooltip) {
    const images = tooltip.querySelectorAll('img[data-src]');
    images.forEach(img => {
        if (img.dataset.src) {
            img.onload = () => smartAlignAvatar(img);
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
    });
}

// Smart Avatar Alignment: scans PNG for non-transparent pixels and zooms into face
function smartAlignAvatar(img) {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        let topY = canvas.height;
        let bottomY = 0;
        let leftX = canvas.width;
        let rightX = 0;

        // Find bounding box of non-transparent pixels
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const alpha = pixels[(y * canvas.width + x) * 4 + 3];
                if (alpha > 10) {
                    if (y < topY) topY = y;
                    if (y > bottomY) bottomY = y;
                    if (x < leftX) leftX = x;
                    if (x > rightX) rightX = x;
                }
            }
        }

        if (topY >= bottomY) return;

        const charHeight = bottomY - topY;
        const charWidth = rightX - leftX;
        const charCenterX = leftX + charWidth / 2;

        // Head area: top ~35% of character
        const headTop = topY;
        const headBottom = topY + charHeight * 0.35;
        const headHeight = headBottom - headTop;
        const headCenterY = headTop + headHeight / 2;

        // Calculate scale: container is 40px, we want the head (~35% of char) to fill it
        const container = img.parentElement;
        const containerSize = container.offsetWidth; // 40px square
        
        // Scale so head fills ~80% of container
        const targetHeadSize = containerSize * 0.8;
        const currentHeadDisplaySize = headHeight * (containerSize / canvas.width);
        const zoomScale = targetHeadSize / currentHeadDisplaySize;
        
        // Clamp scale to reasonable range
        const scale = Math.min(Math.max(zoomScale, 1.2), 3.0);

        // Calculate offset to center the head in the container
        const scaledHeadCenterY = headCenterY * (containerSize / canvas.width) * scale;
        const scaledHeadCenterX = charCenterX * (containerSize / canvas.width) * scale;
        
        const offsetY = (containerSize / 2) - scaledHeadCenterY;
        const offsetX = (containerSize / 2) - scaledHeadCenterX;

        img.style.transform = `scale(${scale.toFixed(2)}) translate(${(offsetX / scale).toFixed(1)}px, ${(offsetY / scale).toFixed(1)}px)`;
        img.style.transformOrigin = 'top left';
        
        console.log(`Avatar aligned: ${img.alt}, scale=${scale.toFixed(2)}, topY=${topY}, charH=${charHeight}`);
    } catch (e) {
        // CORS or other error — apply fallback zoom
        console.warn('Smart avatar alignment failed:', e);
        img.style.transform = 'scale(1.3)';
        img.style.transformOrigin = 'top center';
    }
}

// Close tooltip when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.server-status')) {
        document.querySelectorAll('.player-list-tooltip.active').forEach(t => {
            t.classList.remove('active');
        });
    }
});

// --- NEWS LOGIC ---
async function loadNews() {
    try {
        const response = await fetch('news.json?t=' + Date.now());
        const data = await response.json();
        
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) return;
        newsContainer.innerHTML = '';

        const newsWithIds = data.map((item, index) => ({
            ...item,
            id: item.id || `post-${index}`
        }));

        const reversedNews = newsWithIds.slice().reverse();

        reversedNews.forEach(newsItem => {
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
                    <div class="news-card-footer" style="display: flex; justify-content: space-between; align-items: center;">
                        <a href="article.html?id=${newsItem.id}" class="read-more">Читати далі <i class="fas fa-arrow-right"></i></a>
                        <span class="view-count" data-slug="${newsItem.id}"><i class="far fa-eye"></i> <span>—</span></span>
                    </div>
                </div>
            `;
            newsContainer.appendChild(article);
        });

        // Fetch view counts for all articles
        const slugs = reversedNews.map(n => n.id);
        const viewCounts = await getViewCounts(slugs);
        
        // Update view counts in cards
        document.querySelectorAll('.news-card .view-count[data-slug]').forEach(el => {
            const slug = el.dataset.slug;
            if (viewCounts[slug] !== undefined) {
                el.querySelector('span').textContent = formatViewCount(viewCounts[slug]);
            }
        });

    } catch (error) {
        console.error('Error loading news:', error);
    }
}

// Helper to strip HTML tags
function stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

async function loadHomeNews() {
    try {
        const response = await fetch('news.json?t=' + Date.now());
        const data = await response.json();
        
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
                    <div class="news-meta" style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <span class="news-date" style="font-size: 12px;"><i class="far fa-calendar-alt"></i> ${newsItem.date}</span>
                        <span class="view-count" data-slug="${newsItem.id}" style="font-size: 12px;"><i class="far fa-eye"></i> <span>—</span></span>
                    </div>
                    ${tagsHtml}
                    <h3 class="home-news-title">${newsItem.title}</h3>
                    <p class="home-news-desc">${summaryText}</p>
                    <span class="read-more" style="margin-top:auto;">Читати далі <i class="fas fa-arrow-right"></i></span>
                </div>
            `;
            container.appendChild(article);
        });

        // Fetch view counts for homepage cards
        const slugs = latest.map(n => n.id);
        const viewCounts = await getViewCounts(slugs);
        
        container.querySelectorAll('.view-count[data-slug]').forEach(el => {
            const slug = el.dataset.slug;
            if (viewCounts[slug] !== undefined) {
                el.querySelector('span').textContent = formatViewCount(viewCounts[slug]);
            }
        });

    } catch (error) {
        console.error('Error loading home news:', error);
    }
}

function loadFullArticle(newsData) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('article-content');

    if (!id || !container) return;

    const article = newsData.find(item => item.id == id);

    if (article) {
        document.title = `${article.title} - ОБРІЙ`;

        // Track view
        trackArticleView(article.id);

        // Generate gradient style from accent color (background glow)
        const accentColor = article.accentColor || '';
        const headerStyle = accentColor 
            ? `background: linear-gradient(135deg, ${accentColor}33 0%, transparent 60%); border-radius: 16px; padding: 24px; margin: -24px -24px 0 -24px;`
            : '';

        container.innerHTML = `
            <div class="full-article"> <!-- WRAPPER ADDED FOR STYLING -->
                <div class="article-header" style="margin-bottom: 32px; ${headerStyle}">
                     <a href="news.html" class="back-link"><i class="fas fa-arrow-left"></i> До списку новин</a>
                     <h1 style="font-size: 36px; margin-top:16px; margin-bottom:16px;">${article.title}</h1>
                     <div class="news-meta" style="margin-bottom: 16px; color: var(--vp-c-text-2);">
                        <span><i class="far fa-calendar-alt"></i> ${article.date}</span>
                        <span class="view-count" id="article-views" style="margin-left: 16px;"><i class="far fa-eye"></i> <span>—</span></span>
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

// --- VIEW COUNTER ---
async function trackArticleView(slug) {
    if (!slug || window.VIEWS_WORKER_URL === 'INSERT_YOUR_VIEWS_WORKER_URL_HERE') {
        console.log('Views worker not configured');
        return;
    }

    try {
        const response = await fetch(`${window.VIEWS_WORKER_URL}?slug=${encodeURIComponent(slug)}`, {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();
            const viewsEl = document.getElementById('article-views');
            if (viewsEl) {
                viewsEl.querySelector('span').textContent = formatViewCount(data.views);
            }
            console.log(`View tracked: ${slug} = ${data.views} (cached: ${data.cached})`);
        }
    } catch (err) {
        console.error('Failed to track view:', err);
    }
}

async function getViewCounts(slugs) {
    if (!slugs.length || window.VIEWS_WORKER_URL === 'INSERT_YOUR_VIEWS_WORKER_URL_HERE') {
        return {};
    }

    try {
        const response = await fetch(`${window.VIEWS_WORKER_URL}?slugs=${slugs.join(',')}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (err) {
        console.error('Failed to get view counts:', err);
    }
    return {};
}

function formatViewCount(count) {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
}
