const SearchPage = {
    query: '', page: 1, totalPages: 1,

    render() {
        const main = $('#main-content');
        if (!main) return;

        main.innerHTML = `
            <div class="search-page">
                <h1><i class="fas fa-search" style="color:var(--accent)"></i> Buscar</h1>
                <p>Encontre filmes e séries</p>

                <div class="search-bar">
                    <i class="fas fa-search"></i>
                    <input type="text" id="search-input" placeholder="Digite o nome..." value="${this.query}" autocomplete="off">
                </div>

                <div class="filter-pills">
                    <button class="filter-pill active" onclick="SearchPage.setFilter('all')">Todos</button>
                    <button class="filter-pill" onclick="SearchPage.setFilter('movie')">Filmes</button>
                    <button class="filter-pill" onclick="SearchPage.setFilter('tv')">Séries</button>
                </div>

                <div id="search-results"></div>
                <div id="search-pagination"></div>
            </div>
        `;

        const input = $('#search-input');
        input.focus();
        input.addEventListener('input', debounce(e => {
            this.query = e.target.value.trim();
            this.page = 1;
            if (this.query.length > 2) this.search();
            else if (!this.query) this.showEmpty();
        }, 400));

        if (this.query) this.search();
        else this.showEmpty();
    },

    async search() {
        const rc = $('#search-results');
        rc.innerHTML = '<div class="loader"><div class="loader-spinner"></div></div>';

        try {
            const data = await API.search(this.query, this.page);
            this.totalPages = data.total_pages;
            const results = data.results.filter(r => r.media_type !== 'person');

            if (!results.length) {
                rc.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h3>Nenhum resultado</h3></div>';
            } else {
                rc.innerHTML = `<div class="carousel-container" style="flex-wrap:wrap;gap:12px">${results.map(r => MovieCard.render(r)).join('')}</div>`;
            }
            this.renderPagination();
        } catch (err) {
            rc.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><h3>Erro</h3><p>${err.message}</p></div>`;
        }
    },

    renderPagination() {
        const c = $('#search-pagination');
        if (!c || this.totalPages <= 1) return;
        c.innerHTML = `
            <div style="display:flex;justify-content:center;gap:8px;margin-top:24px">
                ${this.page > 1 ? `<button class="btn btn-secondary" onclick="SearchPage.goPage(${this.page - 1})"><i class="fas fa-chevron-left"></i></button>` : ''}
                <button class="btn btn-primary" style="min-width:40px">${this.page}</button>
                ${this.page < this.totalPages ? `<button class="btn btn-secondary" onclick="SearchPage.goPage(${this.page + 1})"><i class="fas fa-chevron-right"></i></button>` : ''}
            </div>
        `;
    },

    goPage(p) { this.page = p; this.search(); window.scrollTo({top:0, behavior:'smooth'}); },
    setFilter(f) { $$('.filter-pill').forEach(b => b.classList.remove('active')); event.target.classList.add('active'); },
    showEmpty() { $('#search-results').innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h3>Busque algo</h3><p>Digite pelo menos 3 caracteres</p></div>'; $('#search-pagination').innerHTML = ''; }
};
