// ==========================================
// EXPLORE PAGE
// ==========================================

const ExplorePage = {
    currentType: 'movie',
    currentProvider: null,
    currentPage: 1,
    totalPages: 1,
    isLoading: false,

    async render(params = {}) {
        const main = $('#main-content');
        if (!main) return;

        // Parse params from URL
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        this.currentType = urlParams.get('type') || 'movie';
        this.currentProvider = urlParams.get('provider') ? parseInt(urlParams.get('provider')) : null;
        this.currentPage = parseInt(urlParams.get('page')) || 1;

        Loader.render();

        try {
            let items = [];
            let title = 'Explorar';

            if (this.currentProvider) {
                const providerName = Object.values(CONFIG.PROVIDERS).find(p => p.id === this.currentProvider)?.name || 'Streaming';
                title = `Disponível na ${providerName}`;
                const data = await API.discoverByProvider(this.currentProvider, this.currentType, this.currentPage);
                items = data.results;
                this.totalPages = data.total_pages;
            } else if (urlParams.get('trending')) {
                title = 'Trending';
                const data = await API.getTrending(this.currentType, 'week', this.currentPage);
                items = data.results;
                this.totalPages = data.total_pages;
            } else {
                title = this.currentType === 'movie' ? 'Filmes Populares' : 'Séries Populares';
                const data = this.currentType === 'movie' 
                    ? await API.getPopularMovies(this.currentPage)
                    : await API.getPopularTV(this.currentPage);
                items = data.results;
                this.totalPages = data.total_pages;
            }

            main.innerHTML = `
                <div class="container" style="padding-top: calc(var(--header-height) + 40px);">
                    <div class="explore-hero">
                        <h1>${title}</h1>
                        <p>Descubra novos conteúdos para maratonar</p>
                    </div>

                    <div class="search-filters" style="margin-bottom: 24px;">
                        <button class="filter-pill ${this.currentType === 'movie' ? 'active' : ''}" 
                            onclick="ExplorePage.setType('movie')">Filmes</button>
                        <button class="filter-pill ${this.currentType === 'tv' ? 'active' : ''}" 
                            onclick="ExplorePage.setType('tv')">Séries</button>
                    </div>

                    <div class="provider-grid" style="margin-bottom: 32px;">
                        ${this.renderProviderFilters()}
                    </div>

                    ${items.length === 0 ? `
                        <div class="empty-state">
                            <i class="fas fa-film"></i>
                            <h3>Nenhum conteúdo encontrado</h3>
                        </div>
                    ` : `
                        <div class="grid-posters-lg">
                            ${items.map(item => MovieCard.render(item)).join('')}
                        </div>
                    `}

                    ${this.renderPagination()}
                </div>
            `;
        } catch (error) {
            if (error.message === 'API_KEY_MISSING') {
                main.innerHTML = HomePage.renderApiKeyPrompt();
            } else {
                main.innerHTML = `
                    <div class="empty-state" style="padding-top: 120px;">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Erro ao carregar conteúdo</h3>
                    </div>
                `;
            }
        }
    },

    renderProviderFilters() {
        const providers = [
            { id: 8, name: 'Netflix', color: '#E50914', icon: 'N' },
            { id: 119, name: 'Prime Video', color: '#00A8E1', icon: 'P' },
            { id: 337, name: 'Disney+', color: '#113CCF', icon: 'D' },
            { id: 1899, name: 'Max', color: '#002BE7', icon: 'M' },
            { id: 531, name: 'Paramount+', color: '#0064FF', icon: 'P+' },
            { id: 350, name: 'Apple TV+', color: '#1D1D1F', icon: 'A' },
            { id: 283, name: 'Crunchyroll', color: '#F47521', icon: 'C' }
        ];

        return `
            <div class="provider-item ${!this.currentProvider ? 'active' : ''}" onclick="ExplorePage.setProvider(null)">
                <div style="width:48px;height:48px;border-radius:12px;background:var(--bg-hover);border:2px dashed var(--text-muted);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:1.2rem;">
                    <i class="fas fa-globe"></i>
                </div>
                <span>Todos</span>
            </div>
            ${providers.map(p => `
                <div class="provider-item ${this.currentProvider === p.id ? 'active' : ''}" onclick="ExplorePage.setProvider(${p.id})">
                    <div style="width:48px;height:48px;border-radius:12px;background:${p.color};display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:1.1rem;">
                        ${p.icon}
                    </div>
                    <span>${p.name}</span>
                </div>
            `).join('')}
        `;
    },

    renderPagination() {
        if (this.totalPages <= 1) return '';

        let pages = [];
        const maxVisible = 5;
        let start = Math.max(1, this.currentPage - 2);
        let end = Math.min(this.totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) pages.push(i);

        return `
            <div style="display: flex; justify-content: center; gap: 8px; margin-top: 40px; flex-wrap: wrap;">
                ${this.currentPage > 1 ? `
                    <button class="btn btn-secondary" onclick="ExplorePage.goToPage(${this.currentPage - 1})">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                ` : ''}

                ${pages.map(p => `
                    <button class="btn ${p === this.currentPage ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="ExplorePage.goToPage(${p})" style="min-width: 40px;">
                        ${p}
                    </button>
                `).join('')}

                ${this.currentPage < this.totalPages ? `
                    <button class="btn btn-secondary" onclick="ExplorePage.goToPage(${this.currentPage + 1})">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                ` : ''}
            </div>
        `;
    },

    setType(type) {
        this.currentType = type;
        this.currentPage = 1;
        this.updateUrl();
    },

    setProvider(providerId) {
        this.currentProvider = providerId;
        this.currentPage = 1;
        this.updateUrl();
    },

    goToPage(page) {
        this.currentPage = page;
        this.updateUrl();
    },

    updateUrl() {
        let hash = `#/explore?type=${this.currentType}`;
        if (this.currentProvider) hash += `&provider=${this.currentProvider}`;
        if (this.currentPage > 1) hash += `&page=${this.currentPage}`;
        Router.navigate(hash);
    }
};
