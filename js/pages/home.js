const HomePage = {
    heroInterval: null,
    heroItems: [],
    currentHeroIndex: 0,

    async render() {
        const main = $('#main-content');
        if (!main) return;
        Loader.render();

        try {
            // Busca paralela de todos os dados
            const [trending, upcoming, popularMovies, popularTV, nowPlaying, topRatedMovies] = await Promise.all([
                API.getTrending('all', 1).catch(e => { console.log('Trending error:', e); return { results: [] }; }),
                API.getUpcoming(1).catch(e => { console.log('Upcoming error:', e); return { results: [] }; }),
                API.getPopularMovies(1).catch(e => { console.log('Popular movies error:', e); return { results: [] }; }),
                API.getPopularTV(1).catch(e => { console.log('Popular TV error:', e); return { results: [] }; }),
                API.getNowPlaying(1).catch(e => { console.log('Now playing error:', e); return { results: [] }; }),
                API.getTopRated('movie', 1).catch(e => { console.log('Top rated error:', e); return { results: [] }; })
            ]);

            // Coleta hero items de várias fontes para rotação
            this.heroItems = [];

            // Prioridade 1: Now Playing (filmes em cartaz)
            if (nowPlaying.results && nowPlaying.results.length) {
                this.heroItems.push(...nowPlaying.results.slice(0, 3).map(i => ({...i, media_type: 'movie', heroTag: 'Nos Cinemas'})));
            }

            // Prioridade 2: Trending
            if (trending.results && trending.results.length) {
                const trendingItems = trending.results
                    .filter(i => i.media_type !== 'person')
                    .slice(0, 3)
                    .map(i => ({...i, heroTag: 'Top da Semana'}));
                this.heroItems.push(...trendingItems);
            }

            // Prioridade 3: Upcoming
            if (upcoming.results && upcoming.results.length) {
                this.heroItems.push(...upcoming.results.slice(0, 2).map(i => ({...i, media_type: 'movie', heroTag: 'Em Breve'})));
            }

            // Remove duplicados por ID
            this.heroItems = this.heroItems.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

            if (!this.heroItems.length) {
                throw new Error('Sem dados - verifique sua API Key nas Environment Variables');
            }

            // Busca seções por provider em paralelo (silencioso, não bloqueia)
            const providerSections = await this.loadProviderSections();

            main.innerHTML = `
                <div class="home-page">
                    <div id="hero-container">
                        ${this.renderHero(this.heroItems[0], this.heroItems[0].media_type || 'movie')}
                    </div>

                    <div class="container">
                        ${this.renderProviderStrip()}

                        ${Carousel.render('Top 10 em Alta', trending.results ? trending.results.slice(1, 11) : [], { 
                            icon: 'fire', 
                            link: '#/explore?trending=1', 
                            showNumbers: true 
                        })}

                        ${providerSections}

                        ${nowPlaying.results && nowPlaying.results.length ? Carousel.render('Nos Cinemas', nowPlaying.results.slice(0, 10), { 
                            icon: 'ticket-alt', 
                            link: '#/explore?type=movie' 
                        }) : ''}

                        ${upcoming.results && upcoming.results.length ? Carousel.render('Lançamentos', upcoming.results.slice(0, 10), { 
                            icon: 'calendar', 
                            link: '#/calendar' 
                        }) : ''}

                        ${popularMovies.results && popularMovies.results.length ? Carousel.render('Filmes Populares', popularMovies.results.slice(0, 10), { 
                            icon: 'film', 
                            link: '#/explore?type=movie', 
                            big: true 
                        }) : ''}

                        ${popularTV.results && popularTV.results.length ? Carousel.render('Séries em Alta', popularTV.results.slice(0, 10), { 
                            icon: 'tv', 
                            link: '#/explore?type=tv', 
                            big: true 
                        }) : ''}

                        ${topRatedMovies.results && topRatedMovies.results.length ? Carousel.render('Melhores Avaliados', topRatedMovies.results.slice(0, 10), { 
                            icon: 'star', 
                            link: '#/explore?type=movie' 
                        }) : ''}
                    </div>
                </div>
            `;

            // Inicia rotação do hero
            this.startHeroRotation();

        } catch (err) {
            console.error('HomePage error:', err);
            main.innerHTML = `
                <div class="empty-state" style="padding-top:120px">
                    <i class="fas fa-exclamation-triangle" style="color:var(--danger);font-size:3rem"></i>
                    <h3 style="margin-top:16px">Erro ao carregar</h3>
                    <p style="margin:8px 0 20px">${err.message}</p>
                    <div style="background:var(--bg-secondary);padding:16px;border-radius:12px;margin:0 16px 20px;text-align:left">
                        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px">
                            <strong style="color:var(--text-primary)">Como corrigir:</strong>
                        </p>
                        <ol style="font-size:0.8rem;color:var(--text-secondary);padding-left:16px;line-height:1.8">
                            <li>Vá no Dashboard da Vercel</li>
                            <li>Settings → Environment Variables</li>
                            <li>Adicione <code style="background:var(--bg-tertiary);padding:2px 6px;border-radius:4px">TMDB_API_KEY</code> e <code style="background:var(--bg-tertiary);padding:2px 6px;border-radius:4px">WATCHMODE_API_KEY</code></li>
                            <li>Faça <strong>Redeploy</strong> do projeto</li>
                        </ol>
                    </div>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Tentar novamente
                    </button>
                </div>
            `;
        }
    },

    startHeroRotation() {
        // Limpa interval anterior
        if (this.heroInterval) clearInterval(this.heroInterval);

        if (this.heroItems.length <= 1) return;

        this.heroInterval = setInterval(() => {
            this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroItems.length;
            const item = this.heroItems[this.currentHeroIndex];
            const type = item.media_type || 'movie';

            const heroContainer = $('#hero-container');
            if (heroContainer) {
                heroContainer.innerHTML = this.renderHero(item, type);
                // Re-aplica event listeners
                this.attachHeroEvents(item, type);
            }
        }, 8000); // Muda a cada 8 segundos
    },

    attachHeroEvents(item, type) {
        // Event listeners são inline no HTML
    },

    renderHero(item, type) {
        const title = item.title || item.name || 'Sem título';
        const backdrop = getBackdropUrl(item.backdrop_path, 'w1280');
        const year = (item.release_date || item.first_air_date || '').substring(0, 4);
        const heroTag = item.heroTag || (type === 'movie' ? 'Filme' : 'Série');

        return `
            <div class="hero" id="active-hero">
                <div class="hero-bg">
                    <img src="${backdrop}" alt="${title}" 
                        onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgwIiBoZWlnaHQ9IjcyMCI+PHJlY3QgZmlsbD0iIzEyMTIxMiIgd2lkdGg9IjEyODAiIGhlaWdodD0iNzIwIi8+PC9zdmc+'">
                </div>
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <div class="hero-badge">${heroTag}</div>
                    <h1>${title}</h1>
                    <div class="hero-meta">
                        <span class="rating">
                            <i class="fas fa-star"></i> ${formatRating(item.vote_average)}
                        </span>
                        <span class="year">${year}</span>
                        <span class="badge badge-green" style="font-size:0.75rem;padding:3px 10px">
                            ${type === 'movie' ? 'Filme' : 'Série'}
                        </span>
                    </div>
                    <p>${item.overview || ''}</p>
                    <div class="hero-actions">
                        <button class="btn btn-secondary" onclick="MovieCard.toggleList(event, ${item.id}, '${type}', '${title.replace(/'/g, "\'")}', '${item.poster_path || ''}')">
                            <i class="fas ${Storage.isInList(item.id, type) ? 'fa-check' : 'fa-plus'}"></i> 
                            ${Storage.isInList(item.id, type) ? 'Salvo' : 'Minha Lista'}
                        </button>
                        <button class="btn btn-primary" onclick="Router.navigate('#/details/${type}/${item.id}')">
                            <i class="fas fa-info-circle"></i> Info
                        </button>
                    </div>
                </div>
                ${this.heroItems.length > 1 ? `
                <div class="hero-dots">
                    ${this.heroItems.map((_, i) => `
                        <div class="hero-dot ${i === this.currentHeroIndex ? 'active' : ''}" onclick="HomePage.goToHero(${i})"></div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
    },

    goToHero(index) {
        this.currentHeroIndex = index;
        const item = this.heroItems[index];
        const type = item.media_type || 'movie';

        const heroContainer = $('#hero-container');
        if (heroContainer) {
            heroContainer.innerHTML = this.renderHero(item, type);
        }

        // Reinicia o timer
        if (this.heroInterval) clearInterval(this.heroInterval);
        this.startHeroRotation();
    },

    renderProviderStrip() {
        const providers = Object.values(CONFIG.PROVIDERS).slice(0, 8);
        return `
            <div class="provider-strip">
                ${providers.map(p => `
                    <div class="provider-item" onclick="Router.navigate('#/explore?provider=${p.id}')">
                        <div class="provider-icon" style="background:transparent;border:1.5px solid rgba(255,255,255,0.1);overflow:hidden">
                            <img src="${p.logo}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:4px" 
                                onerror="this.onerror=null; this.src='${p.fallbackLogo || ''}'; 
                                    if(!this.src||this.src==='null'){this.style.display='none'; this.parentElement.style.background='${p.color}'; this.parentElement.innerHTML='<span style=color:white;font-weight:800;font-size:0.75rem>${p.name.substring(0,2)}</span>'}">
                        </div>
                        <span>${p.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Carrega seções por streaming (Netflix Top, Prime Top, etc)
    async loadProviderSections() {
        const providers = [
            { key: 'netflix', type: 'movie' },
            { key: 'prime', type: 'movie' },
            { key: 'disney', type: 'movie' },
            { key: 'max', type: 'tv' }
        ];

        const sections = [];

        for (const p of providers) {
            try {
                const provider = CONFIG.PROVIDERS[p.key];
                const data = await API.discoverByProvider(provider.id, p.type, 1);
                if (data.results && data.results.length > 0) {
                    sections.push(`
                        <div class="provider-section">
                            <div class="provider-section-header">
                                <h2 class="provider-section-title">
                                    <img src="${provider.logo}" alt="${provider.name}" 
                                        onerror="this.onerror=null; this.src='${provider.fallbackLogo || ''}'; 
                                            if(!this.src||this.src==='null'){this.style.display='none';this.parentElement.innerHTML='<i class=\'fas fa-tv\'></i> ${provider.name}'}">
                                    Top ${provider.name}
                                </h2>
                                <a href="#/explore?provider=${provider.id}&type=${p.type}" class="section-link">Ver todos <i class="fas fa-chevron-right"></i></a>
                            </div>
                            <div class="carousel-container">
                                ${data.results.slice(0, 8).map(i => MovieCard.render(i)).join('')}
                            </div>
                        </div>
                    `);
                }
            } catch (e) {
                console.log(`Provider ${p.key} error:`, e.message);
            }
        }

        return sections.join('');
    }
};
