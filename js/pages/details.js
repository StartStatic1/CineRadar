// ==========================================
// DETAILS PAGE
// ==========================================

const DetailsPage = {
    async render(type, id) {
        const main = $('#main-content');
        if (!main) return;

        Loader.render();

        try {
            const data = type === 'tv' 
                ? await API.getTVDetails(id) 
                : await API.getMovieDetails(id);

            const title = data.title || data.name;
            const backdrop = getBackdropUrl(data.backdrop_path, 'w1280');
            const poster = getImageUrl(data.poster_path, 'w500');
            const year = (data.release_date || data.first_air_date || '').substring(0, 4);
            const runtime = type === 'movie' ? formatRuntime(data.runtime) : `${data.number_of_seasons || 0} temporada(s)`;
            const providers = data['watch/providers']?.results?.[CONFIG.REGION];

            // Trailer
            const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

            // Cast
            const cast = data.credits?.cast?.slice(0, 12) || [];

            // Similar recommendations via trending or search fallback
            let similar = [];
            try {
                const recs = await API.getTrending(type === 'movie' ? 'movie' : 'tv', 'week', 1);
                similar = recs.results.filter(r => r.id !== data.id).slice(0, 6);
            } catch(e) { similar = []; }

            main.innerHTML = `
                <div class="details-page">
                    <div class="backdrop-header">
                        <img src="${backdrop}" alt="${title}">
                        <div class="overlay"></div>
                    </div>

                    <div class="container">
                        <div class="details-content">
                            <div class="details-poster">
                                <img src="${poster}" alt="${title}">
                            </div>

                            <div class="details-info">
                                <h1>${title}</h1>
                                ${data.tagline ? `<p class="tagline">"${data.tagline}"</p>` : ''}

                                <div class="meta-row">
                                    <span class="meta-item rating" style="color: var(--warning);">
                                        <i class="fas fa-star"></i>
                                        <strong>${formatRating(data.vote_average)}</strong>/10
                                    </span>
                                    <span class="meta-item">
                                        <i class="far fa-calendar"></i> ${year}
                                    </span>
                                    <span class="meta-item">
                                        <i class="far fa-clock"></i> ${runtime}
                                    </span>
                                    ${data.adult ? '<span class="badge badge-red">18+</span>' : ''}
                                </div>

                                <div class="genres-list">
                                    ${data.genres?.map(g => `<span class="genre-tag">${g.name}</span>`).join('') || ''}
                                </div>

                                <div class="hero-actions" style="margin-bottom: 24px;">
                                    ${trailer ? `
                                        <button class="trailer-btn" onclick="DetailsPage.openTrailer('${trailer.key}')">
                                            <i class="fas fa-play"></i> Assistir Trailer
                                        </button>
                                    ` : ''}
                                    <button class="btn btn-secondary" onclick="MovieCard.toggleList(event, ${data.id}, '${type}', '${title.replace(/'/g, "\'")}', '${data.poster_path || ''}')">
                                        <i class="fas ${Storage.isInList(data.id, type) ? 'fa-check' : 'fa-plus'}"></i>
                                        ${Storage.isInList(data.id, type) ? 'Na Lista' : 'Minha Lista'}
                                    </button>
                                    <button class="btn btn-secondary" onclick="MovieCard.toggleWatched(event, ${data.id}, '${type}', '${title.replace(/'/g, "\'")}', '${data.poster_path || ''}')">
                                        <i class="fas ${Storage.isWatched(data.id, type) ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                        ${Storage.isWatched(data.id, type) ? 'Assistido' : 'Marcar Assistido'}
                                    </button>
                                </div>

                                <h3 style="font-size: 1.2rem; font-weight: 700; margin: 24px 0 12px;">Sinopse</h3>
                                <p class="overview">${data.overview || 'Sinopse não disponível.'}</p>

                                <h3 class="section-subtitle">
                                    <i class="fas fa-tv"></i> Onde Assistir
                                </h3>
                                <div class="providers-list">
                                    ${ProviderBadge.renderList(providers, 'flatrate')}
                                    ${ProviderBadge.renderList(providers, 'ads')}
                                    ${!providers?.flatrate && !providers?.ads ? '<p style="color: var(--text-muted);">Disponível apenas para compra/aluguel ou não disponível no Brasil.</p>' : ''}
                                </div>

                                ${cast.length > 0 ? `
                                    <h3 class="section-subtitle">
                                        <i class="fas fa-users"></i> Elenco Principal
                                    </h3>
                                    <div class="grid-cast">
                                        ${cast.map(actor => `
                                            <div class="cast-card">
                                                <img src="${getImageUrl(actor.profile_path, 'w185')}" alt="${actor.name}" loading="lazy">
                                                <div class="name">${actor.name}</div>
                                                <div class="character">${actor.character}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}

                                ${similar.length > 0 ? `
                                    <h3 class="section-subtitle">
                                        <i class="fas fa-thumbs-up"></i> Recomendados
                                    </h3>
                                    <div class="grid-posters-lg">
                                        ${similar.map(item => MovieCard.render(item)).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-overlay" id="trailer-modal" onclick="DetailsPage.closeTrailer(event)">
                    <div class="modal-content" style="aspect-ratio: 16/9; max-width: 900px; padding: 0; overflow: hidden;">
                        <button class="modal-close" onclick="DetailsPage.closeTrailer(event)">
                            <i class="fas fa-times"></i>
                        </button>
                        <div id="trailer-container" style="width:100%; height:100%;"></div>
                    </div>
                </div>
            `;
        } catch (error) {
            main.innerHTML = `
                <div class="empty-state" style="padding-top: 120px;">
                    <i class="fas fa-film"></i>
                    <h3>Conteúdo não encontrado</h3>
                    <p>Não foi possível carregar os detalhes.</p>
                    <a href="#/home" class="btn btn-primary" style="margin-top: 20px;">
                        <i class="fas fa-arrow-left"></i> Voltar ao Início
                    </a>
                </div>
            `;
        }
    },

    openTrailer(key) {
        const modal = $('#trailer-modal');
        const container = $('#trailer-container');
        if (modal && container) {
            container.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${key}?autoplay=1" frameborder="0" allowfullscreen></iframe>`;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    closeTrailer(event) {
        if (event.target.classList.contains('modal-overlay') || event.target.closest('.modal-close')) {
            const modal = $('#trailer-modal');
            const container = $('#trailer-container');
            if (modal) modal.classList.remove('active');
            if (container) container.innerHTML = '';
            document.body.style.overflow = '';
        }
    }
};
