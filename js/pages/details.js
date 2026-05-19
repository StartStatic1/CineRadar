const DetailsPage = {
    async render(type, id) {
        const main = $('#main-content');
        if (!main) return;
        Loader.render();

        try {
            const data = type === 'tv' ? await API.getTVDetails(id) : await API.getMovieDetails(id);
            const title = data.title || data.name;
            const backdrop = getBackdropUrl(data.backdrop_path, 'w1280');
            const poster = getImageUrl(data.poster_path, 'w500');
            const year = (data.release_date || data.first_air_date || '').substring(0, 4);
            const runtime = type === 'movie' ? formatRuntime(data.runtime) : `${data.number_of_seasons || 0} temp.`;
            const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
            const cast = data.credits?.cast?.slice(0, 12) || [];

            // Providers from TMDB
            const tmdbProviders = data['watch/providers']?.results?.[CONFIG.REGION];

            Storage.addToHistory(id, type, title, data.poster_path);

            main.innerHTML = `
                <div class="details-page">
                    <div class="detail-hero">
                        <img src="${backdrop}" alt="${title}">
                        <div class="overlay"></div>
                    </div>

                    <div class="detail-content">
                        <div class="detail-poster-row">
                            <div class="detail-poster"><img src="${poster}" alt="${title}"></div>
                            <div class="detail-info">
                                <h1>${title}</h1>
                                <div class="detail-meta">
                                    <span class="rating-box"><i class="fas fa-star"></i> ${formatRating(data.vote_average)}</span>
                                    <span class="meta-text">${year}</span>
                                    <span class="meta-text">${runtime}</span>
                                    ${data.adult ? '<span class="badge badge-red" style="font-size:0.75rem">18+</span>' : ''}
                                </div>
                            </div>
                        </div>

                        <div class="detail-actions">
                            <button class="btn-play" onclick="Player.open(${id}, '${type}', '${title.replace(/'/g, "\'")}')">
                                <i class="fas fa-play"></i> Assistir
                            </button>
                            <button class="btn btn-secondary" onclick="MovieCard.toggleList(event, ${id}, '${type}', '${title.replace(/'/g, "\'")}', '${data.poster_path || ''}')">
                                <i class="fas ${Storage.isInList(id, type) ? 'fa-check' : 'fa-plus'}"></i>
                                ${Storage.isInList(id, type) ? 'Salvo' : 'Salvar'}
                            </button>
                            <button class="btn btn-secondary" onclick="MovieCard.toggleWatched(event, ${id}, '${type}', '${title.replace(/'/g, "\'")}', '${data.poster_path || ''}')">
                                <i class="fas ${Storage.isWatched(id, type) ? 'fa-eye-slash' : 'fa-eye'}"></i>
                            </button>
                            ${trailer ? `<button class="btn btn-secondary" onclick="window.open('https://youtube.com/watch?v=${trailer.key}', '_blank')"><i class="fas fa-film"></i> Trailer</button>` : ''}
                        </div>

                        <div class="genres-row">
                            ${data.genres?.map(g => `<span class="genre-tag">${g.name}</span>`).join('') || ''}
                        </div>

                        ${this.renderProviders(tmdbProviders)}

                        <div class="sinopse-section">
                            <h3>Sinopse</h3>
                            <p>${data.overview || 'Sinopse não disponível.'}</p>
                        </div>

                        ${cast.length > 0 ? `
                            <div class="sinopse-section">
                                <h3>Elenco</h3>
                                <div class="cast-carousel">
                                    ${cast.map(a => `
                                        <div class="cast-item">
                                            <img src="${getImageUrl(a.profile_path, 'w185')}" alt="${a.name}" loading="lazy">
                                            <div class="name">${a.name}</div>
                                            <div class="character">${a.character}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } catch (err) {
            main.innerHTML = `<div class="empty-state" style="padding-top:120px"><i class="fas fa-film"></i><h3>Erro ao carregar</h3><p>${err.message}</p><a href="#/home" class="btn btn-primary" style="margin-top:16px"><i class="fas fa-arrow-left"></i> Voltar</a></div>`;
        }
    },

    renderProviders(providers) {
        if (!providers) return '';
        const all = [];
        if (providers.flatrate) all.push(...providers.flatrate.map(p => ({...p, type: 'stream'})));
        if (providers.ads) all.push(...providers.ads.map(p => ({...p, type: 'ads'})));
        if (providers.rent) all.push(...providers.rent.map(p => ({...p, type: 'rent'})));
        if (providers.buy) all.push(...providers.buy.map(p => ({...p, type: 'buy'})));

        if (!all.length) return '';

        const typeLabels = { stream: 'Streaming', ads: 'Grátis com Ads', rent: 'Alugar', buy: 'Comprar' };

        return `
            <div class="providers-section">
                <h3><i class="fas fa-tv"></i> Onde Assistir</h3>
                <div class="providers-grid">
                    ${all.map(p => `
                        <div class="provider-badge">
                            <img src="https://image.tmdb.org/t/p/original${p.logo_path}" alt="${p.provider_name}" onerror="this.style.display='none'">
                            <span>${p.provider_name}</span>
                            <span style="color:var(--text-muted);font-size:0.7rem;margin-left:4px">(${typeLabels[p.type]})</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};
