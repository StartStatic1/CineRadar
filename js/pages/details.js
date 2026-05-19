const DetailsPage = {
    async render(type, id) {
        const main = $('#main-content');
        if (!main) return;
        Loader.render();

        try {
            // Busca paralela: TMDB detalhes + similares + clips + Watchmode
            const data = type === 'tv' ? await API.getTVDetails(id) : await API.getMovieDetails(id);

            let watchmodeSources = null;
            let clips = [];
            let similar = { results: [] };

            try {
                const [wmId, clipsData, similarData] = await Promise.all([
                    API.getWatchmodeId(id, type).catch(() => null),
                    API.getClips(id, type).catch(() => []),
                    API.getSimilar(id, type).catch(() => ({ results: [] }))
                ]);
                if (wmId) watchmodeSources = await API.getWatchmodeSources(wmId, 'BR');
                clips = clipsData;
                similar = similarData;
            } catch (e) {
                console.log('Watchmode/Clips fallback:', e.message);
            }

            const title = data.title || data.name;
            const backdrop = getBackdropUrl(data.backdrop_path, 'w1280');
            const poster = getImageUrl(data.poster_path, 'w500');
            const year = (data.release_date || data.first_air_date || '').substring(0, 4);
            const runtime = type === 'movie' ? formatRuntime(data.runtime) : `${data.number_of_seasons || 0} temp.`;
            const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
            const cast = data.credits?.cast?.slice(0, 12) || [];
            const tmdbProviders = data['watch/providers']?.results?.[CONFIG.REGION];
            const recommendations = data.recommendations?.results?.slice(0, 10) || similar.results?.slice(0, 10) || [];

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
                            <button class="btn btn-secondary ${Storage.isWatched(id, type) ? 'btn-watched-active' : ''}" onclick="MovieCard.toggleWatched(event, ${id}, '${type}', '${title.replace(/'/g, "\'")}', '${data.poster_path || ''}')">
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

                        ${clips.length > 0 ? this.renderClips(clips, title) : ''}

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

                        ${recommendations.length > 0 ? `
                            <div class="sinopse-section" style="margin-bottom:80px">
                                <h3><i class="fas fa-thumbs-up" style="color:var(--accent)"></i> Você também pode gostar</h3>
                                <div class="carousel-container">
                                    ${recommendations.map(r => MovieCard.render({...r, media_type: r.media_type || type})).join('')}
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
        const merged = new Map();

        if (tmdbProviders) {
            const cats = [['flatrate', 'stream'], ['ads', 'ads'], ['rent', 'rent'], ['buy', 'buy']];
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

        if (watchmodeSources && Array.isArray(watchmodeSources)) {
            watchmodeSources.forEach(s => {
                const nameLower = s.name?.toLowerCase() || '';
                let found = null;
                for (const [key, p] of Object.entries(CONFIG.PROVIDERS)) {
                    if (nameLower.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(nameLower)) {
                        found = p; break;
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
    },

    renderClips(clips, title) {
        return `
            <div class="sinopse-section">
                <h3><i class="fas fa-video" style="color:var(--accent)"></i> Cenas & Bastidores</h3>
                <div class="clips-carousel" style="display:flex;gap:12px;overflow-x:auto;padding-bottom:12px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch">
                    ${clips.slice(0, 6).map(c => `
                        <div class="clip-card" onclick="window.open('https://youtube.com/watch?v=${c.key}', '_blank')" style="flex:0 0 auto;scroll-snap-align:start;width:160px;cursor:pointer">
                            <div style="position:relative;width:160px;height:240px;border-radius:12px;overflow:hidden;background:var(--bg-card)">
                                <img src="https://img.youtube.com/vi/${c.key}/mqdefault.jpg" alt="${c.name}" style="width:100%;height:100%;object-fit:cover" loading="lazy">
                                <div style="position:absolute;inset:0;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
                                    <div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center">
                                        <i class="fas fa-play" style="color:var(--bg-primary);font-size:0.9rem;margin-left:2px"></i>
                                    </div>
                                </div>
                                <div style="position:absolute;bottom:0;left:0;right:0;padding:8px;background:linear-gradient(transparent,rgba(0,0,0,0.8))">
                                    <span style="font-size:0.7rem;font-weight:600;color:white">${c.type}</span>
                                </div>
                            </div>
                            <p style="font-size:0.75rem;margin-top:6px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};
