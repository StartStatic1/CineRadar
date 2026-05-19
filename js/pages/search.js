// ==========================================
// SEARCH PAGE
// ==========================================

const SearchPage = {
    currentQuery: '',
    currentPage: 1,
    totalPages: 1,

    render() {
        const main = $('#main-content');
        if (!main) return;

        main.innerHTML = `
            <div class="search-page">
                <div class="container">
                    <div class="search-header">
                        <h1><i class="fas fa-search"></i> Buscar</h1>
                        <p>Encontre filmes, séries e animes</p>
                    </div>

                    <div class="search-bar" style="max-width: 600px; margin: 0 auto 32px;">
                        <i class="fas fa-search"></i>
                        <input type="text" id="search-input" 
                            placeholder="Digite o nome de um filme ou série..." 
                            value="${this.currentQuery}" autocomplete="off">
                        <button class="clear-btn" onclick="SearchPage.clear()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="search-filters">
                        <button class="filter-pill active" data-filter="all" onclick="SearchPage.setFilter('all')">Todos</button>
                        <button class="filter-pill" data-filter="movie" onclick="SearchPage.setFilter('movie')">Filmes</button>
                        <button class="filter-pill" data-filter="tv" onclick="SearchPage.setFilter('tv')">Séries</button>
                    </div>

                    <div id="search-results"></div>
                    <div id="search-pagination"></div>
                </div>
            </div>
        `;

        const input = $('#search-input');
        if (input) {
            input.focus();
            input.addEventListener('input', debounce((e) => {
                this.currentQuery = e.target.value.trim();
                this.currentPage = 1;
                if (this.currentQuery.length > 2) {
                    this.search();
                } else if (this.currentQuery.length === 0) {
                    this.showEmpty();
                }
            }, 500));

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.currentQuery = input.value.trim();
                    this.search();
                }
            });
        }

        if (this.currentQuery) {
            this.search();
        } else {
            this.showEmpty();
        }
    },

    async search() {
        if (!this.currentQuery) return;

        const resultsContainer = $('#search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="loader" style="padding: 40px;">
                    <div class="loader-spinner"></div>
                </div>
            `;
        }

        try {
            const data = await API.search(this.currentQuery, this.currentPage);
            this.totalPages = data.total_pages;

            const results = data.results.filter(item => item.media_type !== 'person');

            if (results.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>Nenhum resultado encontrado</h3>
                        <p>Tente buscar com outros termos.</p>
                    </div>
                `;
            } else {
                resultsContainer.innerHTML = `
                    <div class="grid-posters-lg">
                        ${results.map(item => MovieCard.render(item)).join('')}
                    </div>
                `;
            }

            this.renderPagination();
        } catch (error) {
            if (error.message === 'API_KEY_MISSING') {
                resultsContainer.innerHTML = HomePage.renderApiKeyPrompt();
            } else {
                resultsContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Erro na busca</h3>
                        <p>Verifique sua conexão e API Key.</p>
                    </div>
                `;
            }
        }
    },

    renderPagination() {
        const container = $('#search-pagination');
        if (!container || this.totalPages <= 1) return;

        let pages = [];
        const maxVisible = 5;
        let start = Math.max(1, this.currentPage - 2);
        let end = Math.min(this.totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        container.innerHTML = `
            <div style="display: flex; justify-content: center; gap: 8px; margin-top: 40px; flex-wrap: wrap;">
                ${this.currentPage > 1 ? `
                    <button class="btn btn-secondary" onclick="SearchPage.goToPage(${this.currentPage - 1})">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                ` : ''}

                ${pages.map(p => `
                    <button class="btn ${p === this.currentPage ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="SearchPage.goToPage(${p})" style="min-width: 40px;">
                        ${p}
                    </button>
                `).join('')}

                ${this.currentPage < this.totalPages ? `
                    <button class="btn btn-secondary" onclick="SearchPage.goToPage(${this.currentPage + 1})">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                ` : ''}
            </div>
        `;
    },

    goToPage(page) {
        this.currentPage = page;
        this.search();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    setFilter(filter) {
        $$('.filter-pill').forEach(p => p.classList.remove('active'));
        $(`[data-filter="${filter}"]`)?.classList.add('active');
        // Em uma implementação completa, filtraria por tipo
        this.search();
    },

    clear() {
        const input = $('#search-input');
        if (input) {
            input.value = '';
            this.currentQuery = '';
            this.showEmpty();
        }
    },

    showEmpty() {
        const container = $('#search-results');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Busque seus favoritos</h3>
                    <p>Digite pelo menos 3 caracteres para começar.</p>
                </div>
            `;
        }
        $('#search-pagination').innerHTML = '';
    }
};
