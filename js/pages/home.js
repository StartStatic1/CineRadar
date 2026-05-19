// ==========================================
// HOME PAGE
// ==========================================

const HomePage = {
    async render() {
        const main = $('#main-content');
        if (!main) return;

        Loader.render();

        try {
            const [trending, upcoming, popularMovies, popularTV] = await Promise.all([
                API.getTrending('all', 'week', 1),
                API.getUpcomingMovies(1),
                API.getPopularMovies(1),
                API.getPopularTV(1)
            ]);

            const heroItem = trending.results[0];

            main.innerHTML = `
                <div class="home-page">
                    ${this.renderHero(heroItem)}

                    <div class="container">
                        ${this.renderTrending(trending.results.slice(1, 11))}

                        <div class="providers-section">
                            <div class="section-header">
                                <h2 class="section-title">
                                    <i class="fas fa-tv"></i>
                                    Onde Assistir
                                </h2>
                                <a href="#/explore" class="section-link">
                                    Ver todos <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                            <div class="provider-grid" style="margin-bottom:0;">
                                ${this.renderProviderShortcuts()}
                            </div>
                        </div>

                        ${this.renderSection('Lançamentos', upcoming.results.slice(0, 10), 'calendar', '#/calendar')}
                        ${this.renderSection('Filmes Populares', popularMovies.results.slice(0, 10), 'film', '#/explore?type=movie')}
                        ${this.renderSection('Séries em Alta', popularTV.results.slice(0, 10), 'tv', '#/explore?type=tv')}
                    </div>
                </div>
            `;
        } catch (error) {
            if (error.message === 'API_KEY_MISSING') {
                main.innerHTML = this.renderApiKeyPrompt();
            } else {
                main.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Erro ao carregar conteúdo</h3>
                        <p>Tente novamente mais tarde.</p>
                    </div>
                `;
            }
        }
    },

    renderHero(item) {
        const type = item.media_type || 'movie';
        const title = item.title || item.name;
        const backdrop = getBackdropUrl(item.backdrop_path, 'w1280');
        const year = (item.release_date || item.first_air_date || '').substring(0, 4);

        return `
            <div class="hero">
                <div class="hero-bg">
                    <img src="${backdrop}" alt="${title}">
                </div>
                <div class="hero-overlay"></div>
                <div class="container hero-content">
                    <h1>${title}</h1>
                    <div class="hero-meta">
                        <span class="rating"><i class="fas fa-star"></i> ${formatRating(item.vote_average)}</span>
                        <span class="year">${year}</span>
                        <span class="badge badge-green">${type === 'movie' ? 'Filme' : 'Série'}</span>
                    </div>
                    <p>${item.overview || ''}</p>
                    <div class="hero-actions">
                        <a href="#/details/${type}/${item.id}" class="btn btn-primary">
                            <i class="fas fa-play"></i> Ver Detalhes
                        </a>
                        <button class="btn btn-secondary" onclick="MovieCard.toggleList(event, ${item.id}, '${type}', '${title.replace(/'/g, "\'")}', '${item.poster_path || ''}')">
                            <i class="fas fa-plus"></i> Minha Lista
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderTrending(items) {
        return `
            <div class="trending-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-fire"></i>
                        Top 10 em Alta
                    </h2>
                    <a href="#/explore?trending=1" class="section-link">
                        Ver todos <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
                <div class="scroll-container">
                    ${items.map((item, index) => `
                        <div class="scroll-item">
                            ${MovieCard.render(item, { showNumber: index + 1 })}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderSection(title, items, icon, link) {
        return `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-${icon}"></i>
                        ${title}
                    </h2>
                    <a href="${link}" class="section-link">
                        Ver todos <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
                <div class="grid-posters">
                    ${items.map(item => MovieCard.render(item)).join('')}
                </div>
            </div>
        `;
    },

    renderProviderShortcuts() {
        const providers = [
            { id: 8, name: 'Netflix', color: '#E50914', icon: 'N' },
            { id: 119, name: 'Prime Video', color: '#00A8E1', icon: 'P' },
            { id: 337, name: 'Disney+', color: '#113CCF', icon: 'D' },
            { id: 1899, name: 'Max', color: '#002BE7', icon: 'M' },
            { id: 531, name: 'Paramount+', color: '#0064FF', icon: 'P+' },
            { id: 350, name: 'Apple TV+', color: '#1D1D1F', icon: 'A' },
            { id: 283, name: 'Crunchyroll', color: '#F47521', icon: 'C' }
        ];

        return providers.map(p => `
            <div class="provider-item" onclick="Router.navigate('#/explore?provider=${p.id}')">
                <div style="width:48px;height:48px;border-radius:12px;background:${p.color};display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:1.2rem;">
                    ${p.icon}
                </div>
                <span>${p.name}</span>
            </div>
        `).join('');
    },

    renderApiKeyPrompt() {
        return `
            <div class="container" style="padding-top: 120px; max-width: 600px;">
                <div class="empty-state">
                    <i class="fas fa-key" style="font-size: 4rem; color: var(--accent);"></i>
                    <h2 style="margin: 20px 0 12px;">Configurar API Key</h2>
                    <p style="margin-bottom: 24px; color: var(--text-secondary);">
                        O CineRadar usa a API do TMDB (The Movie Database) para buscar filmes e séries. 
                        É grátis e leva 2 minutos para obter sua chave.
                    </p>
                    <div style="background: var(--bg-secondary); padding: 24px; border-radius: var(--radius-lg); margin-bottom: 24px;">
                        <ol style="text-align: left; color: var(--text-secondary); line-height: 2;">
                            <li>Crie uma conta em <a href="https://www.themoviedb.org/signup" target="_blank" style="color: var(--accent);">themoviedb.org</a></li>
                            <li>Vá em Configurações → API</li>
                            <li>Crie uma chave de API (Developer)</li>
                            <li>Cole aqui abaixo 👇</li>
                        </ol>
                    </div>
                    <div class="search-bar" style="margin-bottom: 16px;">
                        <i class="fas fa-key"></i>
                        <input type="text" id="api-key-input" placeholder="Cole sua TMDB API Key aqui..." 
                            style="padding-left: 48px;">
                    </div>
                    <button class="btn btn-primary" onclick="HomePage.saveApiKey()" style="width: 100%;">
                        <i class="fas fa-save"></i> Salvar e Começar
                    </button>
                </div>
            </div>
        `;
    },

    saveApiKey() {
        const input = $('#api-key-input');
        if (input && input.value.trim()) {
            setApiKey(input.value.trim());
            showToast('API Key salva! Recarregando...', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast('Digite uma API key válida', 'error');
        }
    }
};
