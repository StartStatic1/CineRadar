const HomePage = {
    async render() {
        const main = $('#main-content');
        if (!main) return;
        Loader.render();

        try {
            const [trending, upcoming, popularMovies, popularTV, nowPlaying] = await Promise.all([
                API.getTrending('all', 1).catch(() => ({ results: [] })),
                API.getUpcoming(1).catch(() => ({ results: [] })),
                API.getPopularMovies(1).catch(() => ({ results: [] })),
                API.getPopularTV(1).catch(() => ({ results: [] })),
                API.getNowPlaying(1).catch(() => ({ results: [] }))
            ]);

            if (!trending.results || !trending.results.length) {
                throw new Error('Sem dados - verifique sua API Key nas Environment Variables');
            }

            const heroItem = trending.results[0];
            const heroType = heroItem.media_type || 'movie';

            main.innerHTML = `
                <div class="home-page">
                    ${this.renderHero(heroItem, heroType)}

                    <div class="container">
                        ${this.renderProviderStrip()}

                        ${Carousel.render('Top 10 em Alta', trending.results.slice(1, 11), { 
                            icon: 'fire', 
                            link: '#/explore?trending=1', 
                            showNumbers: true 
                        })}

                        ${nowPlaying.results.length ? Carousel.render('Nos Cinemas', nowPlaying.results.slice(0, 10), { 
                            icon: 'ticket-alt', 
                            link: '#/explore?type=movie' 
                        }) : ''}

                        ${upcoming.results.length ? Carousel.render('Lançamentos', upcoming.results.slice(0, 10), { 
                            icon: 'calendar', 
                            link: '#/calendar' 
                        }) : ''}

                        ${popularMovies.results.length ? Carousel.render('Filmes Populares', popularMovies.results.slice(0, 10), { 
                            icon: 'film', 
                            link: '#/explore?type=movie', 
                            big: true 
                        }) : ''}

                        ${popularTV.results.length ? Carousel.render('Séries em Alta', popularTV.results.slice(0, 10), { 
                            icon: 'tv', 
                            link: '#/explore?type=tv', 
                            big: true 
                        }) : ''}
                    </div>
                </div>
            `;
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

    renderHero(item, type) {
        const title = item.title || item.name || 'Sem título';
        const backdrop = getBackdropUrl(item.backdrop_path, 'w1280');
        const year = (item.release_date || item.first_air_date || '').substring(0, 4);

        return `
            <div class="hero">
                <div class="hero-bg">
                    <img src="${backdrop}" alt="${title}" 
                        onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgwIiBoZWlnaHQ9IjcyMCI+PHJlY3QgZmlsbD0iIzEyMTIxMiIgd2lkdGg9IjEyODAiIGhlaWdodD0iNzIwIi8+PC9zdmc+'">
                </div>
                <div class="hero-overlay"></div>
                <div class="hero-content">
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
                        <button class="btn-play" onclick="Player.open(${item.id}, '${type}', '${title.replace(/'/g, "\'")}')">
                            <i class="fas fa-play"></i> Assistir Agora
                        </button>
                        <button class="btn btn-secondary" onclick="MovieCard.toggleList(event, ${item.id}, '${type}', '${title.replace(/'/g, "\'")}', '${item.poster_path || ''}')">
                            <i class="fas fa-plus"></i> Minha Lista
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderProviderStrip() {
        const providers = Object.values(CONFIG.PROVIDERS).slice(0, 8);
        return `
            <div class="provider-strip">
                ${providers.map(p => `
                    <div class="provider-item" onclick="Router.navigate('#/explore?provider=${p.id}')">
                        <div class="provider-icon" style="background:transparent;border:1.5px solid rgba(255,255,255,0.1);overflow:hidden">
                            <img src="${p.logo}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:4px" onerror="this.style.display='none'; this.parentElement.style.background='${p.color}'; this.parentElement.innerHTML='<span style=\'color:white;font-weight:800;font-size:0.75rem\'>${p.name.substring(0,2)}</span>'">
                        </div>
                        <span>${p.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
};
