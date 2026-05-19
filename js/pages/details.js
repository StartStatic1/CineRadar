const DetailsPage = {
    async render(type, id) {
        const main = $('#main-content');
        if (!main) return;
        Loader.render();

        try {
            // Busca paralela: TMDB detalhes + Watchmode sources
            const data = type === 'tv' ? await API.getTVDetails(id) : await API.getMovieDetails(id);

            // Watchmode em paralelo (não bloqueia se falhar)
            let watchmodeSources = null;
            try {
                const wmId = await API.getWatchmodeId(id, type);
                if (wmId) {
                    watchmodeSources = await API.getWatchmodeSources(wmId, 'BR');
                }
            } catch (e) {
                console.log('Watchmode fallback:', e.message);
            }

            const title = data.title || data.name;
            const backdrop = getBackdropUrl(data.backdrop_path, 'w1280');
            const poster = getImageUrl(data.poster_path, 'w500');
            const year = (data.release_date || data.first_air_date || '').substring(0, 4);
            const runtime = type === 'movie' ? formatRuntime(data.runtime) : `${data.number_of_seasons || 0} temp.`;
            const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
            const cast = data.credits?.cast?.slice(0, 12) || [];
            const tmdbProviders = data['watch/providers']?.results?.[CONFIG.REGION];

            Storage.addToHistory(id, type, title, data.poster_path);

            main.innerHTML = `
                <div class="details-page">
                    <div class="detail-hero">
                        <img src="${backdrop}" alt="${title}" onerror="this.style.display='none'">
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

                        ${this.renderProviders(tmdbProviders, watchmodeSources)}

                        <div class="sinopse-section">
                            <h3>Sinopse</h3>
                            <p>${data.overview || 'Sinopse não disponível.'}</p>
                        </div>

                        ${cast.length > 0 ? `
                            <div class="sinopse-section">
                                <h3>Elenco</h3>
                                <div class="cast-carousel">
                                    ${cast.map(a => `
                                        <div class="cast-item" style="position:relative">
                                            <img src="${getImageUrl(a.profile_path, 'w185')}" alt="${a.name}" loading="lazy" 
                                                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                                            <div class="cast-fallback" style="display:none;width:90px;height:90px;border-radius:50%;background:var(--bg-tertiary);align-items:center;justify-content:center;color:var(--text-muted);font-size:1.5rem;border:2px solid var(--bg-tertiary)">
                                                <i class="fas fa-user"></i>
                                            </div>
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

    renderProviders(tmdbProviders, watchmodeSources) {
        // Merge TMDB + Watchmode
        const merged = new Map();

        // TMDB providers
        if (tmdbProviders) {
            const cats = [
                ['flatrate', 'stream'],
                ['ads', 'ads'],
                ['rent', 'rent'],
                ['buy', 'buy']
            ];
            cats.forEach(([key, type]) => {
                tmdbProviders[key]?.forEach(p => {
                    const id = p.provider_id;
                    if (!merged.has(id)) {
                        merged.set(id, {
                            name: p.provider_name,
                            logo: `https://image.tmdb.org/t/p/original${p.logo_path}`,
                            types: new Set([type]),
                            tmdbId: id
                        });
                    } else {
                        merged.get(id).types.add(type);
                    }
                });
            });
        }

        // Watchmode sources enriquece com preços e links
        if (watchmodeSources && Array.isArray(watchmodeSources)) {
            watchmodeSources.forEach(s => {
                // Tenta mapear pelo nome do provider
                const nameLower = s.name?.toLowerCase() || '';
                let found = null;

                for (const [key, p] of Object.entries(CONFIG.PROVIDERS)) {
                    if (nameLower.includes(p.name.toLowerCase()) || 
                        p.name.toLowerCase().includes(nameLower)) {
                        found = p;
                        break;
                    }
                }

                if (found && merged.has(found.id)) {
                    const entry = merged.get(found.id);
                    entry.price = s.price;
                    entry.webUrl = s.web_url;
                    entry.format = s.format;
                }
            });
        }

        if (!merged.size) return '';

        const typeLabels = { stream: 'Streaming', ads: 'Grátis com Ads', rent: 'Alugar', buy: 'Comprar' };
        const items = Array.from(merged.values());

        return `
            <div class="providers-section">
                <h3><i class="fas fa-tv"></i> Onde Assistir</h3>
                <div class="providers-grid">
                    ${items.map(p => `
                        <div class="provider-badge" ${p.webUrl ? `onclick="window.open('${p.webUrl}', '_blank')" style="cursor:pointer"` : ''}>
                            <img src="${p.logo}" alt="${p.name}" onerror="this.style.display='none'" loading="lazy">
                            <span>${p.name}</span>
                            <span style="color:var(--text-muted);font-size:0.7rem;margin-left:4px">
                                (${Array.from(p.types).map(t => typeLabels[t]).join(', ')})
                            </span>
                            ${p.price ? `<span style="color:var(--accent);font-size:0.75rem;font-weight:700;margin-left:auto">${formatPrice(p.price)}</span>` : ''}
                            ${p.webUrl ? '<i class="fas fa-external-link-alt" style="font-size:0.65rem;color:var(--text-muted);margin-left:4px"></i>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};
