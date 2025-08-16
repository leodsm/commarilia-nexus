/**
 * ComMarília Frontend Integrado v3.0 - JavaScript Melhorado
 * Sistema completo de notícias, stories e modais com UX otimizada
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        STORY_DURATION: 5000,
        TOAST_DURATION: 3000,
        COMPACT_DELAY: 3000,
        SCROLL_THRESHOLD: 300
    };
    
    // State management
    let appState = {
        currentArticleIndex: -1,
        articles: [],
        isNewsModalOpen: false,
        isStoryModalOpen: false,
        isSearchModalOpen: false,
        currentStoryIndex: 0,
        storyTimer: null,
        touchStartY: null,
        isFloatingCompact: false
    };
    
    // Utility functions
    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Toast notifications
    function showToast(message, type = 'success') {
        const existingToast = $('.cm-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `cm-toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, CONFIG.TOAST_DURATION);
    }
    
    // API helpers
    async function fetchWithTimeout(url, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    async function fetchPost(postId) {
        try {
            const response = await fetchWithTimeout(`${cmData.restUrl}posts/${postId}?_embed`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    }
    
    async function searchPosts(query) {
        try {
            const response = await fetchWithTimeout(`${cmData.siteUrl}wp-json/cm/v1/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error searching posts:', error);
            return [];
        }
    }
    
    async function fetchStories(category = '') {
        try {
            const url = category 
                ? `${cmData.siteUrl}wp-json/cm/v1/stories?category=${encodeURIComponent(category)}`
                : `${cmData.siteUrl}wp-json/cm/v1/stories`;
            const response = await fetchWithTimeout(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching stories:', error);
            return [];
        }
    }
    
    // Content processing
    function removeDuplicateFeaturedImage(content, featuredImageUrl) {
        if (!featuredImageUrl || !content) return content;
        
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const images = doc.querySelectorAll('img, figure');
            
            for (const element of images) {
                const img = element.tagName.toLowerCase() === 'img' ? element : element.querySelector('img');
                if (img && img.src) {
                    const imgSrc = img.src.split('?')[0];
                    const featSrc = featuredImageUrl.split('?')[0];
                    if (imgSrc === featSrc) {
                        element.remove();
                        break;
                    }
                }
            }
            
            return doc.body.innerHTML;
        } catch (error) {
            console.error('Error processing content:', error);
            return content;
        }
    }
    
    function getBadgeClass(categorySlug) {
        const categoryMap = {
            'destaque': 'cm-badge-destaque',
            'marilia': 'cm-badge-marilia',
            'regiao': 'cm-badge-regiao',
            'brasil': 'cm-badge-brasil',
            'mundo': 'cm-badge-mundo',
            'esportes': 'cm-badge-esportes',
            'entretenimento': 'cm-badge-entretenimento'
        };
        
        return categoryMap[categorySlug?.toLowerCase()] || 'cm-badge-marilia';
    }
    
    // News Modal Management
    function createNewsModal() {
        if ($('#cm-news-modal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'cm-news-modal';
        modal.className = 'cm-overlay cm-hidden';
        modal.innerHTML = `
            <div class="cm-modal" onclick="event.stopPropagation()">
                <div class="cm-modal-header">
                    <h2 class="cm-modal-title" id="cm-modal-category"></h2>
                    <button class="cm-modal-close" onclick="cmCloseNews()" aria-label="Fechar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="cm-modal-content" id="cm-article-content">
                    <div class="cm-loading">Carregando...</div>
                </div>
                <div class="cm-actions">
                    <button class="cm-action-btn" onclick="cmToggleLike()" aria-label="Curtir">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"></path>
                        </svg>
                    </button>
                    <button class="cm-action-btn" onclick="cmShareArticle()" aria-label="Compartilhar">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367-2.684z"></path>
                        </svg>
                    </button>
                    <button class="cm-action-btn" onclick="cmSaveArticle()" aria-label="Salvar">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                        </svg>
                    </button>
                    <div class="cm-nav-actions">
                        <button class="cm-action-btn" onclick="cmPreviousArticle()" aria-label="Anterior" id="cm-prev-btn" style="display: none;">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                        </button>
                        <button class="cm-action-btn" onclick="cmNextArticle()" aria-label="Próximo" id="cm-next-btn" style="display: none;">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.addEventListener('click', cmCloseNews);
        
        // Touch gestures
        const content = $('#cm-article-content', modal);
        content.addEventListener('touchstart', handleTouchStart, { passive: true });
        content.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    function handleTouchStart(e) {
        appState.touchStartY = e.touches[0].clientY;
    }
    
    function handleTouchEnd(e) {
        if (appState.touchStartY === null) return;
        
        const content = e.currentTarget;
        const touchEndY = e.changedTouches[0].clientY;
        const delta = touchEndY - appState.touchStartY;
        const isAtTop = content.scrollTop <= 20;
        const isAtBottom = (content.scrollTop + content.clientHeight) >= (content.scrollHeight - 20);
        const isStrongSwipe = Math.abs(delta) > 120;
        
        if (isStrongSwipe) {
            if (delta < 0 && isAtBottom) {
                cmNextArticle();
            } else if (delta > 0 && isAtTop) {
                cmPreviousArticle();
            }
        }
        
        appState.touchStartY = null;
    }
    
    async function openNewsModal(postId) {
        createNewsModal();
        
        try {
            // Update articles list
            appState.articles = $$('[data-post-id]').map(el => parseInt(el.dataset.postId, 10)).filter(Boolean);
            appState.currentArticleIndex = appState.articles.indexOf(parseInt(postId, 10));
            
            // Show modal
            const modal = $('#cm-news-modal');
            const content = $('#cm-article-content');
            
            modal.classList.remove('cm-hidden');
            appState.isNewsModalOpen = true;
            document.body.style.overflow = 'hidden';
            
            // Show loading
            content.innerHTML = '<div class="cm-loading">Carregando...</div>';
            
            // Fetch and display article
            const post = await fetchPost(postId);
            renderArticle(post);
            
            // Update navigation buttons
            updateNavigationButtons();
            
        } catch (error) {
            console.error('Error opening news modal:', error);
            showToast(cmData.strings.error, 'error');
            cmCloseNews();
        }
    }
    
    function renderArticle(post) {
        const content = $('#cm-article-content');
        const categoryTitle = $('#cm-modal-category');
        
        const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                             `${cmData.themeDir}/assets/images/fallback.jpg`;
        const title = post.title?.rendered || '';
        const rawContent = post.content?.rendered || '';
        const cleanContent = removeDuplicateFeaturedImage(rawContent, featuredImage);
        const category = post._embedded?.['wp:term']?.[0]?.[0];
        const categoryName = category?.name || '';
        const badgeClass = getBadgeClass(category?.slug);
        
        categoryTitle.textContent = categoryName;
        
        content.innerHTML = `
            <article class="cm-article">
                <img src="${featuredImage}" alt="${title.replace(/<[^>]+>/g, '')}" />
                <div class="${badgeClass}">${categoryName}</div>
                <h1>${title}</h1>
                <div class="cm-article-content">${cleanContent}</div>
            </article>
        `;
        
        // Scroll to top
        content.scrollTop = 0;
    }
    
    function updateNavigationButtons() {
        const prevBtn = $('#cm-prev-btn');
        const nextBtn = $('#cm-next-btn');
        
        if (prevBtn) {
            prevBtn.style.display = appState.currentArticleIndex > 0 ? 'flex' : 'none';
        }
        
        if (nextBtn) {
            nextBtn.style.display = appState.currentArticleIndex < appState.articles.length - 1 ? 'flex' : 'none';
        }
    }
    
    // Story Modal Management
    function createStoryModal() {
        if ($('#cm-story-modal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'cm-story-modal';
        modal.className = 'cm-overlay cm-hidden';
        modal.innerHTML = `
            <div class="cm-story-modal" onclick="event.stopPropagation()">
                <div class="cm-story-progress" id="cm-story-progress"></div>
                <button class="cm-modal-close" onclick="cmCloseStory()" style="position: absolute; top: 1rem; right: 1rem; z-index: 10;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div class="cm-story-content" id="cm-story-content"></div>
                <div class="cm-story-touch-areas">
                    <button class="cm-story-prev" onclick="cmPreviousStory()" style="position: absolute; left: 0; top: 0; width: 50%; height: 100%; background: transparent; border: none; z-index: 5;"></button>
                    <button class="cm-story-next" onclick="cmNextStory()" style="position: absolute; right: 0; top: 0; width: 50%; height: 100%; background: transparent; border: none; z-index: 5;"></button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.addEventListener('click', cmCloseStory);
    }
    
    async function openStoryModal(storyUrl, categorySlug) {
        createStoryModal();
        
        try {
            const modal = $('#cm-story-modal');
            modal.classList.remove('cm-hidden');
            appState.isStoryModalOpen = true;
            document.body.style.overflow = 'hidden';
            
            // Try to load AMP story first
            await loadAmpStory(storyUrl);
            
            // If AMP fails after 2 seconds, load auto-stories
            setTimeout(async () => {
                const ampContent = $('#cm-story-content amp-story-player');
                if (!ampContent || !ampContent.shadowRoot) {
                    await loadAutoStories(categorySlug);
                }
            }, 2000);
            
        } catch (error) {
            console.error('Error opening story modal:', error);
            cmCloseStory();
        }
    }
    
    async function loadAmpStory(storyUrl) {
        const content = $('#cm-story-content');
        content.innerHTML = '';
        
        const player = document.createElement('amp-story-player');
        player.style.width = '100%';
        player.style.height = '100%';
        player.innerHTML = `<a href="${storyUrl}"></a>`;
        
        content.appendChild(player);
        
        try {
            if (player.load) {
                await player.load();
            }
        } catch (error) {
            console.error('Error loading AMP story:', error);
        }
    }
    
    async function loadAutoStories(categorySlug) {
        try {
            const stories = await fetchStories(categorySlug);
            
            if (!stories.length) {
                $('#cm-story-content').innerHTML = '<div style="color: white; text-align: center; padding: 2rem;">Nenhum story encontrado para esta categoria.</div>';
                return;
            }
            
            renderAutoStories(stories);
            
        } catch (error) {
            console.error('Error loading auto stories:', error);
            $('#cm-story-content').innerHTML = '<div style="color: white; text-align: center; padding: 2rem;">Erro ao carregar stories.</div>';
        }
    }
    
    function renderAutoStories(stories) {
        const content = $('#cm-story-content');
        const progress = $('#cm-story-progress');
        
        // Create progress bars
        progress.innerHTML = stories.map((_, index) => `
            <div class="cm-story-bar">
                <div class="cm-story-bar-fill" id="progress-${index}"></div>
            </div>
        `).join('');
        
        // Create story slides
        content.innerHTML = stories.map((story, index) => `
            <div class="cm-story-slide" id="slide-${index}" style="display: ${index === 0 ? 'block' : 'none'};">
                <img src="${story.image}" alt="${story.title}" class="cm-story-bg" />
                <div class="cm-story-overlay"></div>
                <div class="cm-story-text">
                    <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">${story.category}</div>
                    <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; line-height: 1.3;">${story.title}</h2>
                    <p style="font-size: 0.875rem; opacity: 0.9; line-height: 1.5;">${story.excerpt}</p>
                </div>
            </div>
        `).join('');
        
        // Start story progression
        appState.currentStoryIndex = 0;
        showStory(0, stories);
    }
    
    function showStory(index, stories) {
        if (index >= stories.length) {
            cmCloseStory();
            return;
        }
        
        appState.currentStoryIndex = index;
        
        // Hide all slides
        $$('.cm-story-slide').forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
        
        // Update progress bars
        $$('.cm-story-bar-fill').forEach((bar, i) => {
            const fill = bar;
            if (i < index) {
                fill.style.width = '100%';
                fill.style.transition = 'none';
            } else if (i === index) {
                fill.style.transition = 'none';
                fill.style.width = '0%';
                requestAnimationFrame(() => {
                    fill.style.transition = 'width 5s linear';
                    fill.style.width = '100%';
                });
            } else {
                fill.style.width = '0%';
                fill.style.transition = 'none';
            }
        });
        
        // Clear existing timer
        if (appState.storyTimer) {
            clearTimeout(appState.storyTimer);
        }
        
        // Set timer for next story
        appState.storyTimer = setTimeout(() => {
            showStory(index + 1, stories);
        }, CONFIG.STORY_DURATION);
    }
    
    // Search Modal Management
    function createSearchModal() {
        if ($('#cm-search-modal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'cm-search-modal';
        modal.className = 'cm-overlay cm-hidden';
        modal.innerHTML = `
            <div class="cm-modal" onclick="event.stopPropagation()">
                <div class="cm-modal-header">
                    <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input 
                            type="text" 
                            id="cm-search-input" 
                            placeholder="Buscar notícias..." 
                            style="flex: 1; border: none; background: transparent; font-size: 1.125rem; outline: none;"
                        />
                    </div>
                    <button class="cm-modal-close" onclick="cmCloseSearch()" aria-label="Fechar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="cm-modal-content" id="cm-search-results">
                    <div style="text-align: center; padding: 3rem;">
                        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin: 0 auto 1rem; opacity: 0.5;">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <h3 style="font-size: 1.125rem; font-weight: bold; margin-bottom: 0.5rem;">Buscar notícias</h3>
                        <p style="color: var(--cm-muted-foreground);">Digite algo para começar a busca</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.addEventListener('click', cmCloseSearch);
        
        const searchInput = $('#cm-search-input');
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    async function handleSearch(e) {
        const query = e.target.value.trim();
        const resultsContainer = $('#cm-search-results');
        
        if (!query) {
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin: 0 auto 1rem; opacity: 0.5;">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <h3 style="font-size: 1.125rem; font-weight: bold; margin-bottom: 0.5rem;">Buscar notícias</h3>
                    <p style="color: var(--cm-muted-foreground);">Digite algo para começar a busca</p>
                </div>
            `;
            return;
        }
        
        // Show loading
        resultsContainer.innerHTML = `
            <div style="padding: 1rem;">
                <div style="animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
                    ${Array.from({length: 3}, () => `
                        <div style="margin-bottom: 1rem;">
                            <div style="height: 1rem; background: var(--cm-muted); border-radius: 0.25rem; width: 75%; margin-bottom: 0.5rem;"></div>
                            <div style="height: 0.75rem; background: var(--cm-muted); border-radius: 0.25rem; width: 50%; margin-bottom: 0.25rem;"></div>
                            <div style="height: 0.75rem; background: var(--cm-muted); border-radius: 0.25rem; width: 66%;"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        try {
            const results = await searchPosts(query);
            
            if (results.length === 0) {
                resultsContainer.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin: 0 auto 1rem; opacity: 0.5;">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <h3 style="font-size: 1.125rem; font-weight: bold; margin-bottom: 0.5rem;">Nenhum resultado encontrado</h3>
                        <p style="color: var(--cm-muted-foreground);">Tente buscar com termos diferentes</p>
                    </div>
                `;
                return;
            }
            
            resultsContainer.innerHTML = `
                <div style="padding: 1rem;">
                    ${results.map(result => `
                        <button onclick="cmOpenSearchResult('${result.id}')" style="width: 100%; text-align: left; padding: 1rem; border: none; background: transparent; border-radius: 0.5rem; cursor: pointer; display: block; margin-bottom: 0.5rem;" onmouseover="this.style.background='var(--cm-muted)'" onmouseout="this.style.background='transparent'">
                            <h3 style="font-weight: bold; margin-bottom: 0.5rem; line-height: 1.4;">${result.title}</h3>
                            <p style="color: var(--cm-muted-foreground); font-size: 0.875rem; margin-bottom: 0.5rem; line-height: 1.5;">${result.excerpt}</p>
                            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--cm-muted-foreground);">
                                ${result.category ? `<span class="cm-news-badge ${getBadgeClass(result.category.slug)}">${result.category.name}</span>` : ''}
                                <span>•</span>
                                <span>${result.relative_time}</span>
                            </div>
                        </button>
                    `).join('')}
                </div>
            `;
            
        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <p style="color: var(--cm-destructive);">Erro ao buscar. Tente novamente.</p>
                </div>
            `;
        }
    }
    
    // Floating Actions Management
    function initFloatingActions() {
        setTimeout(() => {
            const floatBtns = $$('.cm-float-btn');
            floatBtns.forEach(btn => {
                btn.classList.add('compact');
                const label = btn.querySelector('.label');
                if (label) label.style.display = 'none';
            });
            appState.isFloatingCompact = true;
        }, CONFIG.COMPACT_DELAY);
    }
    
    // Infinite Scroll
    function initInfiniteScroll() {
        const sentinel = $('#cm-scroll-sentinel');
        if (!sentinel) return;
        
        const observer = new IntersectionObserver(
            throttle((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadMorePosts();
                    }
                });
            }, 1000),
            { rootMargin: `${CONFIG.SCROLL_THRESHOLD}px` }
        );
        
        observer.observe(sentinel);
    }
    
    async function loadMorePosts() {
        // Implementation would depend on WordPress setup
        console.log('Loading more posts...');
    }
    
    // Keyboard Navigation
    function initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (appState.isNewsModalOpen) {
                if (e.key === 'Escape') cmCloseNews();
                if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                    e.preventDefault();
                    cmPreviousArticle();
                }
                if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                    e.preventDefault();
                    cmNextArticle();
                }
            }
            
            if (appState.isStoryModalOpen) {
                if (e.key === 'Escape') cmCloseStory();
                if (e.key === 'ArrowLeft') cmPreviousStory();
                if (e.key === 'ArrowRight') cmNextStory();
            }
            
            if (appState.isSearchModalOpen) {
                if (e.key === 'Escape') cmCloseSearch();
            }
        });
    }
    
    // Global Functions (attached to window for PHP integration)
    window.cmOpenNews = function(postId) {
        openNewsModal(postId);
    };
    
    window.cmCloseNews = function() {
        const modal = $('#cm-news-modal');
        if (modal) {
            modal.classList.add('cm-hidden');
            appState.isNewsModalOpen = false;
            document.body.style.overflow = '';
        }
    };
    
    window.cmNextArticle = function() {
        if (appState.currentArticleIndex < appState.articles.length - 1) {
            const nextIndex = appState.currentArticleIndex + 1;
            const nextPostId = appState.articles[nextIndex];
            openNewsModal(nextPostId);
        }
    };
    
    window.cmPreviousArticle = function() {
        if (appState.currentArticleIndex > 0) {
            const prevIndex = appState.currentArticleIndex - 1;
            const prevPostId = appState.articles[prevIndex];
            openNewsModal(prevPostId);
        }
    };
    
    window.cmOpenStory = function(storyUrl, categorySlug) {
        openStoryModal(storyUrl, categorySlug);
    };
    
    window.cmCloseStory = function() {
        const modal = $('#cm-story-modal');
        if (modal) {
            modal.classList.add('cm-hidden');
            appState.isStoryModalOpen = false;
            document.body.style.overflow = '';
            
            if (appState.storyTimer) {
                clearTimeout(appState.storyTimer);
                appState.storyTimer = null;
            }
        }
    };
    
    window.cmNextStory = function() {
        if (appState.storyTimer) {
            clearTimeout(appState.storyTimer);
        }
        const slides = $$('.cm-story-slide');
        if (appState.currentStoryIndex < slides.length - 1) {
            showStory(appState.currentStoryIndex + 1, []);
        } else {
            cmCloseStory();
        }
    };
    
    window.cmPreviousStory = function() {
        if (appState.storyTimer) {
            clearTimeout(appState.storyTimer);
        }
        if (appState.currentStoryIndex > 0) {
            showStory(appState.currentStoryIndex - 1, []);
        }
    };
    
    window.cmOpenSearch = function() {
        createSearchModal();
        const modal = $('#cm-search-modal');
        modal.classList.remove('cm-hidden');
        appState.isSearchModalOpen = true;
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            const searchInput = $('#cm-search-input');
            if (searchInput) searchInput.focus();
        }, 100);
    };
    
    window.cmCloseSearch = function() {
        const modal = $('#cm-search-modal');
        if (modal) {
            modal.classList.add('cm-hidden');
            appState.isSearchModalOpen = false;
            document.body.style.overflow = '';
        }
    };
    
    window.cmOpenSearchResult = function(postId) {
        cmCloseSearch();
        cmOpenNews(postId);
    };
    
    window.cmToggleLike = function() {
        showToast('Funcionalidade em breve', 'success');
    };
    
    window.cmShareArticle = function() {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                showToast(cmData.strings.shareSuccess, 'success');
            }).catch(() => {
                showToast('Erro ao copiar link', 'error');
            });
        }
    };
    
    window.cmSaveArticle = function() {
        showToast('Funcionalidade em breve', 'success');
    };
    
    window.cmRequestNotifications = function() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                showToast(cmData.strings.notificationEnabled, 'success');
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        showToast(cmData.strings.notificationEnabled, 'success');
                    }
                });
            }
        }
    };
    
    window.cmSubscribeNewsletter = function() {
        showToast('Newsletter: em breve', 'success');
    };
    
    // Initialize everything when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initFloatingActions();
        initInfiniteScroll();
        initKeyboardNavigation();
        
        // Update article data attributes
        $$('.cm-news-card').forEach(card => {
            const onclick = card.getAttribute('onclick');
            if (onclick) {
                const match = onclick.match(/cmOpenNews\((\d+)\)/);
                if (match) {
                    card.setAttribute('data-post-id', match[1]);
                }
            }
        });
        
        console.log('ComMarília v3.0 initialized');
    });
    
})();