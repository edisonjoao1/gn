class GenUsApp {
    constructor() {
        this.allArticles = [];
        this.articleCache = new Map();
        this.init();
    }

    async init() {
        await this.loadArticles();
        this.setupMobileMenu();
        this.setupScrollToTopButton();
        this.setupSmoothScrolling();
    }

    async loadArticles() {
        try {
            const response = await fetch('articles.json');
            this.allArticles = await response.json();
            this.displayFeaturedArticle(this.allArticles[0]);
            this.displayTrendingArticles(this.allArticles.slice(1, 5));
            this.displayPerspectiveArticles(this.allArticles.slice(5));
        } catch (error) {
            console.error('Error loading articles:', error);
        }
    }

    displayFeaturedArticle(article) {
        const featuredArticle = document.getElementById('featured-article');
        featuredArticle.innerHTML = this.createArticleHTML(article, true);
        this.addHoverEffect(featuredArticle.querySelector('.article'));
    }

    displayTrendingArticles(articles) {
        this.displayArticles('trending-articles', articles);
    }

    displayPerspectiveArticles(articles) {
        this.displayArticles('perspective-articles', articles);
    }

    displayArticles(containerId, articles) {
        const container = document.getElementById(containerId);
        container.innerHTML = articles.map(article => this.createArticleHTML(article)).join('');
        this.addHoverEffects(container);
    }

    createArticleHTML(article, isFeatured = false) {
        return `
            <article class="article ${isFeatured ? 'featured' : ''}" data-id="${article.id}">
                <img src="${article.image}" alt="${article.title}" loading="lazy">
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p>${article.excerpt}</p>
                    ${isFeatured ? '<button class="read-more">Read More</button>' : ''}
                </div>
            </article>
        `;
    }

    addHoverEffects(container) {
        const articles = container.querySelectorAll('.article');
        articles.forEach(article => this.addHoverEffect(article));
    }

    addHoverEffect(article) {
        const content = article.querySelector('.article-content');
        const excerpt = content.querySelector('p');
        const fullText = excerpt.textContent;
        const shortText = this.truncateText(fullText, 100);
        
        excerpt.textContent = shortText;
        
        article.addEventListener('mouseenter', () => this.handleArticleHover(article, excerpt, fullText, content, true));
        article.addEventListener('mouseleave', () => this.handleArticleHover(article, excerpt, shortText, content, false));
    }

    handleArticleHover(article, excerpt, text, content, isEnter) {
        excerpt.textContent = text;
        content.style.transform = isEnter ? 'translateY(-10px)' : 'translateY(0)';
        
        if (isEnter) {
            this.preloadArticleContent(article.dataset.id);
        }
    }

    async preloadArticleContent(articleId) {
        if (!this.articleCache.has(articleId)) {
            try {
                const response = await fetch(`article-${articleId}.json`);
                const fullArticle = await response.json();
                this.articleCache.set(articleId, fullArticle);
            } catch (error) {
                console.error(`Error preloading article ${articleId}:`, error);
            }
        }
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }

    setupMobileMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const nav = document.querySelector('nav');

        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector(anchor.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    }

    setupScrollToTopButton() {
        const scrollToTopButton = document.createElement('button');
        scrollToTopButton.innerHTML = '&uarr;';
        scrollToTopButton.className = 'scroll-to-top';
        document.body.appendChild(scrollToTopButton);

        window.addEventListener('scroll', () => {
            scrollToTopButton.style.display = window.pageYOffset > 100 ? 'block' : 'none';
        });

        scrollToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GenUsApp();
});