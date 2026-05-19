const HomePage = {
    async render() {
        const main = $('#main-content');
        if (!main) return;
        Loader.render();

        try {
            const [trending, upcoming, popularMovies, popularTV, nowPlaying] = await Promise.all([
                API.getTrending('all', 'week', 1),
                API.getUpcoming(1),
                API.getPopularMovies(1),
                API.getPopularTV(1),
                API.getNowPlaying(1)
            ]);

            const heroItem = trending.results[0];
            const heroType = heroItem.media_type || 'movie';

            main.innerHTML = `
                <div class="home-page">
                    ${this.renderHero(heroItem, heroType)}

                    <div class="container">
                        ${this.renderProviderStrip()}

                        ${Carousel.render('Top 10 em Alta', trending.results.slice(1, 11), { icon: 'fire', link: '#/explore?trending=1', showNumbers: true })}

                        ${Carousel.render('Nos Cinemas', nowPlaying.results.slice(0, 10), { icon: 'ticket-alt', link: '#/explore?type=movie' })}

                        ${Carousel.render('Lançamentos', upcoming.results.slice(0, 10), { icon: 'calendar', link: '#/calendar' })}

                        ${Carousel.render('Filmes Populares', popularMovies.results.slice(0, 10), { icon: 'film', link: '#/explore?type=movie', big: true })}

                        ${Carousel.render('Séries em Alta', popularTV.results.slice(0, 10), { icon: 'tv', link: '#/explore?type=tv', big: true })}
                    </div>
                </div>
            `;
        } catch (err) {
            main.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Erro ao carregar</h3><p>${err.message}</p></div>`;
        }
    },

    renderHero(item, type) {
        const title = item.title || item.name;
        const backdrop = getBackdropUrl(item.backdrop_path, 'w1280');
        const year = (item.release_date || item.first_air_date || '').substring(0, 4);

        return `
            <div class="hero">
                <div class="hero-bg"><img src="${backdrop}" alt="${title}"></div>
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h1>${title}</h1>
                    <div class="hero-meta">
                        <span class="rating"><i class="fas fa-star"></i> ${formatRating(item.vote_average)}</span>
                        <span class="year">${year}</span>
                        <span class="badge badge-green" style="font-size:0.75rem;padding:3px 10px">${type === 'movie' ? 'Filme' : 'Série'}</span>
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
                        <div class="provider-icon" style="background:${p.color}">${p.name.substring(0, 2)}</div>
                        <span>${p.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
};
