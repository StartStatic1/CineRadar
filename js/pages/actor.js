const ActorPage = {
    async render(id) {
        const main = $('#main-content');
        if (!main) return;
        Loader.render();

        try {
            const data = await API.getPersonDetails(id);

            const name = data.name || 'Ator';
            const photo = getImageUrl(data.profile_path, 'w500');
            const backdrop = getBackdropUrl(data.movie_credits?.cast?.[0]?.backdrop_path, 'w1280');
            const birthday = data.birthday ? formatDate(data.birthday) : '';
            const age = data.birthday ? Math.floor((new Date() - new Date(data.birthday)) / (365.25 * 24 * 60 * 60 * 1000)) : null;
            const place = data.place_of_birth || '';
            const bio = data.biography || 'Biografia não disponível.';

            // Filmografia: combina filmes e séries, ordena por popularidade
            const movies = (data.movie_credits?.cast || []).map(m => ({...m, media_type: 'movie'}));
            const tvs = (data.tv_credits?.cast || []).map(t => ({...t, media_type: 'tv'}));
            const filmography = [...movies, ...tvs]
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 50);

            // Únicos por ID
            const uniqueFilmography = filmography.filter((v, i, a) => a.findIndex(t => t.id === v.id && t.media_type === v.media_type) === i);

            main.innerHTML = `
                <div class="actor-page">
                    <div class="detail-hero" style="height:35vh;min-height:250px">
                        <img src="${backdrop}" alt="${name}" onerror="this.style.display='none'">
                        <div class="overlay"></div>
                    </div>

                    <div class="detail-content">
                        <div class="detail-poster-row">
                            <div class="detail-poster" style="width:140px;margin-top:-80px">
                                <img src="${photo}" alt="${name}" style="border-radius:50%;aspect-ratio:1;object-fit:cover">
                            </div>
                            <div class="detail-info" style="padding-top:20px">
                                <h1>${name}</h1>
                                <div class="detail-meta">
                                    ${data.known_for_department ? `<span class="meta-text">${data.known_for_department}</span>` : ''}
                                    ${birthday ? `<span class="meta-text">${birthday}${age ? ` (${age} anos)` : ''}</span>` : ''}
                                    ${place ? `<span class="meta-text"><i class="fas fa-map-marker-alt"></i> ${place}</span>` : ''}
                                </div>
                            </div>
                        </div>

                        <div class="sinopse-section">
                            <h3>Biografia</h3>
                            <p id="actor-bio" style="display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden">${bio}</p>
                            ${bio.length > 200 ? `<button class="btn btn-secondary" style="margin-top:8px;font-size:0.8rem;padding:6px 12px" onclick="ActorPage.toggleBio()">Ver mais</button>` : ''}
                        </div>

                        ${uniqueFilmography.length > 0 ? `
                            <div class="carousel-section">
                                <div class="section-header">
                                    <h2 class="section-title"><i class="fas fa-film"></i> Filmografia (${uniqueFilmography.length})</h2>
                                </div>
                                <div class="carousel-container" style="flex-wrap:wrap;gap:12px">
                                    ${uniqueFilmography.map(item => MovieCard.render(item)).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } catch (err) {
            main.innerHTML = `<div class="empty-state" style="padding-top:120px"><i class="fas fa-user"></i><h3>Erro ao carregar ator</h3><p>${err.message}</p><a href="#/home" class="btn btn-primary" style="margin-top:16px"><i class="fas fa-arrow-left"></i> Voltar</a></div>`;
        }
    },

    toggleBio() {
        const p = $('#actor-bio');
        const btn = event.target;
        if (p.style.webkitLineClamp === 'unset') {
            p.style.webkitLineClamp = '4';
            btn.textContent = 'Ver mais';
        } else {
            p.style.webkitLineClamp = 'unset';
            btn.textContent = 'Ver menos';
        }
    }
};
