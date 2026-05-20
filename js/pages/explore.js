const ExplorePage = {
    type: 'movie', provider: null, page: 1, totalPages: 1,
    topProviderData: null,

    async render(params = {}) {
        const main = $('#main-content');
        if (!main) return;

        const up = new URLSearchParams(window.location.hash.split('?')[1] || '');
        this.type = up.get('type') || 'movie';
        this.provider = up.get('provider') ? parseInt(up.get('provider')) : null;
        this.page = parseInt(up.get('page')) || 1;

        Loader.render();

        try {
            let data, title;

            // Se tem provider selecionado, busca tambem o "Top" dele (primeira pagina sem paginar)
            if (this.provider) {
                const pName = Object.values(CONFIG.PROVIDERS).find(p => p.id === this.provider)?.name || 'Streaming';
                title = `Disponivel na ${pName}`;

                // Busca em paralelo: grid paginada + top do provider
                const [gridData, topData] = await Promise.all([
                    API.discoverByProvider(this.provider, this.type, this.page),
                    API.discoverByProvider(this.provider, this.type, 1).catch(() => null)
                ]);

                data = gridData;
                this.topProviderData = topData;
            } else if (up.get('trending')) {
                title = 'Trending';
                data = await API.getTrending(this.type, this.page);
                this.topProviderData = null;
            } else {
                title = this.type === 'movie' ? 'Filmes Populares' : 'Series Populares';
                data = this.type === 'movie' ? await API.getPopularMovies(this.page) : await API.getPopularTV(this.page);
                this.topProviderData = null;
            }

            this.totalPages = data.total_pages || 1;

            main.innerHTML = `
                <div class="explore-page">
                    <h1>${title}</h1>
                    <p>Descubra novos conteudos</p>

                    <div class="filter-pills">
                        <button class="filter-pill ${this.type === 'movie' ? 'active' : ''}" onclick="ExplorePage.setType('movie')">Filmes</button>
                        <button class="filter-pill ${this.type === 'tv' ? 'active' : ''}" onclick="ExplorePage.setType('tv')">Series</button>
                    </div>

                    <div class="provider-strip" style="margin-bottom:20px">
                        <div class="provider-item ${!this.provider ? 'active' : ''}" onclick="ExplorePage.setProvider(null)">
                            <div class="provider-icon" style="background:var(--bg-hover);border:2px dashed var(--text-muted);color:var(--text-muted)"><i class="fas fa-globe"></i></div>
                            <span>Todos</span>
                        </div>
                        ${Object.values(CONFIG.PROVIDERS).map(p => `
                            <div class="provider-item ${this.provider === p.id ? 'active' : ''}" onclick="ExplorePage.setProvider(${p.id})">
                                <div class="provider-icon" style="background:transparent;border:1.5px solid rgba(255,255,255,0.1);overflow:hidden">
                                    <img src="${p.logo}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:4px" 
                                        onerror="this.onerror=null; this.src='${getProviderFallback(p.fallbackKey)}'; 
                                            if(!this.src){this.style.display='none'; this.parentElement.style.background='${p.color}'; this.parentElement.innerHTML='<span style=color:white;font-weight:800;font-size:0.75rem>${p.name.substring(0,2)}</span>'}">
                                </div>
                                <span>${p.name}</span>
                            </div>
                        `).join('')}
                    </div>

                    ${this.renderTopProviderSection()}

                    ${!data.results || !data.results.length ? '<div class="empty-state"><i class="fas fa-film"></i><h3>Sem resultados</h3></div>' : `
                        <div class="carousel-container" style="flex-wrap:wrap;gap:12px">
                            ${data.results.map(i => MovieCard.render(i)).join('')}
                        </div>
                    `}

                    ${this.renderPagination()}
                </div>
            `;
        } catch (err) {
            main.innerHTML = `<div class="empty-state" style="padding-top:120px"><i class="fas fa-exclamation-circle"></i><h3>Erro</h3><p>${err.message}</p></div>`;
        }
    },

    // Renderiza carrossel "Top [Provider]" quando um provider esta selecionado
    renderTopProviderSection() {
        if (!this.provider || !this.topProviderData || !this.topProviderData.results || !this.topProviderData.results.length) {
            return '';
        }

        const pName = Object.values(CONFIG.PROVIDERS).find(p => p.id === this.provider)?.name || 'Streaming';
        const topItems = this.topProviderData.results.slice(0, 8);

        return `
            <div class="provider-section" style="margin-bottom:28px">
                <div class="provider-section-header">
                    <h2 class="provider-section-title">
                        <i class="fas fa-crown" style="color:var(--warning)"></i>
                        Top ${pName}
                    </h2>
                </div>
                <div class="carousel-container">
                    ${topItems.map(i => MovieCard.render(i)).join('')}
                </div>
            </div>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.05);margin:24px 0">
        `;
    },

    renderPagination() {
        if (this.totalPages <= 1) return '';
        return `
            <div style="display:flex;justify-content:center;gap:8px;margin-top:24px">
                ${this.page > 1 ? `<button class="btn btn-secondary" onclick="ExplorePage.goPage(${this.page - 1})"><i class="fas fa-chevron-left"></i></button>` : ''}
                <button class="btn btn-primary" style="min-width:40px">${this.page}</button>
                ${this.page < this.totalPages ? `<button class="btn btn-secondary" onclick="ExplorePage.goPage(${this.page + 1})"><i class="fas fa-chevron-right"></i></button>` : ''}
            </div>
        `;
    },

    setType(t) { this.type = t; this.page = 1; this.updateUrl(); },
    setProvider(p) { this.provider = p; this.page = 1; this.updateUrl(); },
    goPage(p) { this.page = p; this.updateUrl(); },
    updateUrl() {
        let h = `#/explore?type=${this.type}`;
        if (this.provider) h += `&provider=${this.provider}`;
        if (this.page > 1) h += `&page=${this.page}`;
        Router.navigate(h);
    }
};
