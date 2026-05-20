const DetailsPage = {
    currentTVData: null,
    currentSeasonEpisodes: {},

    async render(type, id) {
        const main = $('#main-content');
        if (!main) return;
        Loader.render();

        try {
            const data = type === 'tv'
                ? await API.getTVDetails(id)
                : await API.getMovieDetails(id);

            this.currentTVData = type === 'tv' ? data : null;

            let watchmodeSources = null;
            try {
                const wmId = await API.getWatchmodeId(id, type);
                if (wmId) {
                    watchmodeSources = await API.getWatchmodeSources(wmId, 'BR');
                }
            } catch (e) {
                console.log('Watchmode fallback:', e.message);
            }

            let omdbData = null;
            try {
                const imdbId = data.external_ids?.imdb_id || data.imdb_id;
                if (imdbId) {
                    omdbData = await API.omdb({ i: imdbId, plot: 'full' });
                }
            } catch (e) {
                console.log('OMDb fallback:', e.message);
            }

            let relatedData = null;
            try {
                relatedData = await API.getSimilar(id, type);
            } catch (e) {
                console.log('Related fallback:', e.message);
            }

            const title = data.title || data.name;
            const backdrop = getBackdropUrl(data.backdrop_path, 'w1280');
            const poster = getImageUrl(data.poster_path, 'w500');
            const year = (data.release_date || data.first_air_date || '').substring(0, 4);
            const runtime = type === 'movie'
                ? formatRuntime(data.runtime)
                : `${data.number_of_seasons || 0} temp. · ${data.number_of_episodes || 0} eps`;
            const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
            const cast = data.credits?.cast?.slice(0, 12) || [];
            const crew = data.credits?.crew?.filter(c => c.job === 'Director' || c.job === 'Creator').slice(0, 4) || [];
            const tmdbProviders = data['watch/providers']?.results?.[CONFIG.REGION];
            const overview = data.overview || omdbData?.Plot || 'Sinopse nao disponivel.';

            Storage.addToHistory(id, type, title, data.poster_path);

            // Para series, busca episodios da primeira temporada
            let seasonsHTML = '';
            if (type === 'tv' && data.seasons) {
                seasonsHTML = await this.renderSeasonsSection(id, title, data.seasons);
            }

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
                                    ${omdbData?.Rated ? `<span class="badge badge-blue" style="font-size:0.75rem">${omdbData.Rated}</span>` : ''}
                                </div>
                                ${crew.length ? `<div class="detail-director">${crew.map(c => `<span>${c.job}: ${c.name}</span>`).join(' · ')}</div>` : ''}
                            </div>
                        </div>

                        <div class="detail-actions">
                            <button class="btn-play" onclick="DetailsPage.openPlayerSheet(${id}, '${type}', '${title.replace(/'/g, "\'")}')">
                                <i class="fas fa-play"></i> Assistir
                            </button>
                            <button class="btn btn-secondary ${Storage.isInList(id, type) ? 'active' : ''}" onclick="MovieCard.toggleList(event, ${id}, '${type}', '${title.replace(/'/g, "\'")}', '${data.poster_path || ''}')">
                                <i class="fas ${Storage.isInList(id, type) ? 'fa-check' : 'fa-plus'}"></i>
                                ${Storage.isInList(id, type) ? 'Salvo' : 'Salvar'}
                            </button>
                            <button class="btn btn-secondary ${Storage.isWatched(id, type) ? 'active watched' : ''}" onclick="MovieCard.toggleWatched(event, ${id}, '${type}', '${title.replace(/'/g, "\'")}', '${data.poster_path || ''}')">
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
                            <p>${overview}</p>
                            ${omdbData?.Awards && omdbData.Awards !== 'N/A' ? `<p style="margin-top:8px;color:var(--warning);font-size:0.85rem"><i class="fas fa-trophy"></i> ${omdbData.Awards}</p>` : ''}
                        </div>

                        ${cast.length > 0 ? `
                            <div class="sinopse-section">
                                <h3>Elenco</h3>
                                <div class="cast-carousel">
                                    ${cast.map(a => `
                                        <div class="cast-item" onclick="Router.navigate('#/actor/${a.id}')" style="cursor:pointer">
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

                        ${seasonsHTML}

                        ${this.renderRelated(relatedData)}
                    </div>
                </div>

                <!-- Bottom Sheet de Players -->
                <div id="player-sheet" class="player-sheet">
                    <div class="player-sheet-overlay" onclick="DetailsPage.closePlayerSheet()"></div>
                    <div class="player-sheet-content">
                        <div class="player-sheet-handle"></div>
                        <div class="player-sheet-header">
                            <div>
                                <div class="player-sheet-title" id="sheet-title">${title}</div>
                                <div class="player-sheet-subtitle" id="sheet-subtitle"></div>
                            </div>
                            <button class="player-sheet-close" onclick="DetailsPage.closePlayerSheet()"><i class="fas fa-times"></i></button>
                        </div>

                        <div class="player-sheet-audio" id="sheet-audio" style="display:none">
                            <div class="audio-tabs">
                                <button class="audio-tab active" data-audio="dub" onclick="DetailsPage.setAudio('dub')">Dublado</button>
                                <button class="audio-tab" data-audio="leg" onclick="DetailsPage.setAudio('leg')">Legendado</button>
                            </div>
                        </div>

                        <div class="player-sheet-sources" id="sheet-sources"></div>

                        <div class="player-sheet-iframe-wrap">
                            <iframe id="sheet-iframe" allowfullscreen referrerpolicy="no-referrer"></iframe>
                            <div id="sheet-loading" class="sheet-loading">
                                <div class="sheet-spinner"></div>
                                <p>Carregando player...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (err) {
            main.innerHTML = `<div class="empty-state" style="padding-top:120px"><i class="fas fa-film"></i><h3>Erro ao carregar</h3><p>${err.message}</p><a href="#/home" class="btn btn-primary" style="margin-top:16px"><i class="fas fa-arrow-left"></i> Voltar</a></div>`;
        }
    },

    // ===== SELETOR DE TEMPORADAS/EPISODIOS =====
    async renderSeasonsSection(tvId, title, seasons) {
        const validSeasons = seasons.filter(s => s.season_number > 0);
        if (!validSeasons.length) return '';

        // Busca episodios da primeira temporada por padrao
        const firstSeason = validSeasons[0].season_number;
        let episodes = [];
        try {
            const seasonData = await API.getTVSeason(tvId, firstSeason);
            episodes = seasonData.episodes || [];
            this.currentSeasonEpisodes[firstSeason] = episodes;
        } catch(e) {
            console.log('Season load error:', e);
        }

        return `
            <div class="sinopse-section seasons-section">
                <h3><i class="fas fa-tv" style="color:var(--accent);margin-right:8px"></i>Temporadas & Episodios</h3>

                <!-- Tabs de Temporadas -->
                <div class="season-tabs-scroll">
                    ${validSeasons.map(s => `
                        <button class="season-tab ${s.season_number === firstSeason ? 'active' : ''}" 
                            onclick="DetailsPage.selectSeason(${tvId}, '${title.replace(/'/g, "\'")}', ${s.season_number}, this)">
                            T${s.season_number}
                        </button>
                    `).join('')}
                </div>

                <!-- Lista de Episodios -->
                <div class="episodes-list" id="episodes-list">
                    ${this.renderEpisodesList(tvId, title, episodes)}
                </div>
            </div>
        `;
    },

    renderEpisodesList(tvId, title, episodes) {
        if (!episodes || !episodes.length) {
            return `<div class="episodes-empty"><i class="fas fa-film"></i><p>Nenhum episodio encontrado</p></div>`;
        }

        return episodes.map(ep => `
            <div class="episode-row" onclick="DetailsPage.openPlayerSheet(${tvId}, 'tv', '${title.replace(/'/g, "\'")}', ${ep.season_number}, ${ep.episode_number}, '${ep.name.replace(/'/g, "\'")}')">
                <div class="episode-thumb">
                    ${ep.still_path ? `
                        <img src="${getImageUrl(ep.still_path, 'w300')}" alt="${ep.name}" loading="lazy"
                            onerror="this.style.display='none'; this.parentElement.querySelector('.ep-fallback').style.display='flex'">
                    ` : ''}
                    <div class="ep-fallback" style="${ep.still_path ? 'display:none' : 'display:flex'}">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="ep-play-overlay"><i class="fas fa-play"></i></div>
                </div>
                <div class="episode-info">
                    <div class="episode-number">E${ep.episode_number}</div>
                    <div class="episode-name">${ep.name}</div>
                    <div class="episode-meta">
                        ${ep.runtime ? `<span>${ep.runtime} min</span>` : ''}
                        ${ep.air_date ? `<span>${ep.air_date.substring(0,4)}</span>` : ''}
                    </div>
                    <div class="episode-overview">${ep.overview || 'Sem sinopse disponivel.'}</div>
                </div>
            </div>
        `).join('');
    },

    async selectSeason(tvId, title, seasonNum, btnEl) {
        // Atualiza tabs visuais
        document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
        if (btnEl) btnEl.classList.add('active');

        const list = document.getElementById('episodes-list');
        if (list) {
            list.innerHTML = `<div class="episodes-loading"><div class="sheet-spinner"></div><p>Carregando episodios...</p></div>`;
        }

        // Usa cache se ja temos
        let episodes = this.currentSeasonEpisodes[seasonNum];
        if (!episodes) {
            try {
                const seasonData = await API.getTVSeason(tvId, seasonNum);
                episodes = seasonData.episodes || [];
                this.currentSeasonEpisodes[seasonNum] = episodes;
            } catch(e) {
                episodes = [];
            }
        }

        if (list) {
            list.innerHTML = this.renderEpisodesList(tvId, title, episodes);
        }
    },

    // ===== BOTTOM SHEET DE PLAYERS =====
    openPlayerSheet(id, type, title, season = null, episode = null, episodeName = '') {
        const sheet = document.getElementById('player-sheet');
        const sheetTitle = document.getElementById('sheet-title');
        const sheetSubtitle = document.getElementById('sheet-subtitle');
        const sheetAudio = document.getElementById('sheet-audio');
        const sheetSources = document.getElementById('sheet-sources');
        const iframe = document.getElementById('sheet-iframe');
        const loading = document.getElementById('sheet-loading');

        if (!sheet) return;

        // Atualiza titulos
        sheetTitle.textContent = title;
        if (type === 'tv' && season && episode) {
            sheetSubtitle.textContent = `T${season} · E${episode}${episodeName ? ' — ' + episodeName : ''}`;
            sheetAudio.style.display = 'block';
        } else {
            sheetSubtitle.textContent = type === 'movie' ? 'Filme' : 'Serie';
            sheetAudio.style.display = 'none';
        }

        // Renderiza fontes
        const activeIndex = parseInt(localStorage.getItem('cineradar_player') || '0');
        sheetSources.innerHTML = CONFIG.PLAYERS.map((p, i) => `
            <button class="source-chip ${i === activeIndex ? 'active' : ''}" 
                onclick="DetailsPage.switchPlayer(${i}, ${id}, '${type}', ${season || 'null'}, ${episode || 'null'})"
                style="${i === activeIndex ? `border-color:${p.color};color:${p.color};` : ''}">
                <i class="fas ${p.icon}"></i>
                <span>${p.name}</span>
                ${i === activeIndex ? '<div class="chip-pulse"></div>' : ''}
            </button>
        `).join('');

        // Abre sheet
        sheet.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Carrega player ativo
        this.switchPlayer(activeIndex, id, type, season, episode);
    },

    closePlayerSheet() {
        const sheet = document.getElementById('player-sheet');
        const iframe = document.getElementById('sheet-iframe');
        if (sheet) sheet.classList.remove('open');
        if (iframe) iframe.src = '';
        document.body.style.overflow = '';
    },

    switchPlayer(index, id, type, season, episode) {
        localStorage.setItem('cineradar_player', index.toString());
        const player = CONFIG.PLAYERS[index];
        const url = player.getUrl(id, type, season, episode);

        const iframe = document.getElementById('sheet-iframe');
        const loading = document.getElementById('sheet-loading');

        // Atualiza chips visuais
        document.querySelectorAll('.source-chip').forEach((chip, i) => {
            const p = CONFIG.PLAYERS[i];
            chip.classList.toggle('active', i === index);
            chip.style.borderColor = i === index ? p.color : 'rgba(255,255,255,0.08)';
            chip.style.color = i === index ? p.color : 'rgba(255,255,255,0.7)';
            const oldPulse = chip.querySelector('.chip-pulse');
            if (oldPulse) oldPulse.remove();
            if (i === index) {
                chip.innerHTML += `<div class="chip-pulse"></div>`;
            }
        });

        if (iframe) {
            iframe.src = url;
            if (loading) {
                loading.style.display = 'flex';
                loading.style.opacity = '1';
            }

            iframe.onload = () => {
                if (loading) {
                    loading.style.opacity = '0';
                    setTimeout(() => loading.style.display = 'none', 300);
                }
            };

            iframe.onerror = () => {
                if (loading) loading.style.display = 'none';
            };
        }

        // Timeout fallback
        setTimeout(() => {
            const ld = document.getElementById('sheet-loading');
            if (ld && ld.style.display !== 'none') {
                ld.innerHTML = `<div class="sheet-spinner" style="border-top-color:var(--warning)"></div><p style="color:var(--warning)">Demorando? Tente outra fonte.</p>`;
            }
        }, 8000);
    },

    setAudio(mode) {
        document.querySelectorAll('.audio-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.audio === mode);
        });
    },

    renderRelated(relatedData) {
        if (!relatedData || !relatedData.results || relatedData.results.length === 0) return '';

        const items = relatedData.results.slice(0, 10);
        return `
            <div class="sinopse-section">
                <h3><i class="fas fa-photo-video" style="color:var(--accent); margin-right:8px;"></i>Relacionados</h3>
                <div class="carousel-container">
                    ${items.map(i => MovieCard.render(i)).join('')}
                </div>
            </div>
        `;
    },

    renderProviders(tmdbProviders, watchmodeSources) {
        const merged = new Map();

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

        if (watchmodeSources && Array.isArray(watchmodeSources)) {
            watchmodeSources.forEach(s => {
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

        const typeLabels = { stream: 'Streaming', ads: 'Gratis com Ads', rent: 'Alugar', buy: 'Comprar' };
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
