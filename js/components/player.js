const Player = {
    currentId: null,
    currentType: null,
    currentTitle: null,
    currentSeason: null,
    currentEpisode: null,
    activePlayerIndex: parseInt(localStorage.getItem('cineradar_player') || '0'),
    playerHistory: JSON.parse(localStorage.getItem('cineradar_player_history') || '[]'),

    ensureModalContainer() {
        let modal = document.getElementById('player-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'player-modal';
            modal.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
            document.body.appendChild(modal);
        }
        return modal;
    },

    // Abre o player. Para series, primeiro mostra seletor de temporada/episodio
    async open(id, type, title, season = null, episode = null) {
        // Se for serie e nao tiver season/episode definidos, mostra seletor primeiro
        if (type === 'tv' && (season === null || episode === null)) {
            await this.showEpisodeSelector(id, title);
            return;
        }

        this.currentId = id;
        this.currentType = type;
        this.currentTitle = title;
        this.currentSeason = season;
        this.currentEpisode = episode;

        const modal = this.ensureModalContainer();
        const player = CONFIG.PLAYERS[this.activePlayerIndex];
        const url = player.getUrl(id, type, season, episode);

        modal.innerHTML = `
            <div id="player-overlay" style="
                position:fixed;
                inset:0;
                background:#000;
                z-index:9999;
                display:flex;
                flex-direction:column;
                opacity:0;
                transition:opacity 0.3s ease;
            ">
                <!-- Header -->
                <div class="player-header-bar">
                    <div class="player-header-left">
                        <button onclick="Player.close()" class="player-header-btn">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div>
                            <div class="player-header-title">${title}</div>
                            ${type === 'tv' && season ? `<div class="player-header-subtitle">T${season} · E${episode}</div>` : ''}
                            <div class="player-header-source" style="color:${player.color}">
                                <i class="fas ${player.icon}"></i> ${player.name}
                            </div>
                        </div>
                    </div>
                    <button onclick="Player.close()" class="player-header-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Body -->
                <div style="flex:1; position:relative; background:#000;">
                    <iframe id="player-iframe" src="${url}" 
                        allowfullscreen 
                        referrerpolicy="no-referrer"
                        style="width:100%; height:100%; border:none; position:absolute; inset:0;"
                    ></iframe>

                    <div id="player-loading" class="player-loading-overlay">
                        <div class="player-spinner" style="border-top-color:${player.color}"></div>
                        <p>Carregando <span style="color:${player.color}; font-weight:700;">${player.name}</span>...</p>
                    </div>

                    <!-- Overlay de erro -->
                    <div id="player-error" style="
                        display:none; position:absolute; inset:0;
                        flex-direction:column; align-items:center; justify-content:center;
                        gap:16px; background:#000; z-index:10; padding:20px; text-align:center;
                    ">
                        <i class="fas fa-exclamation-triangle" style="color:var(--danger); font-size:3rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.9rem;">Erro ao carregar esta fonte.</p>
                        <p style="color:var(--text-muted); font-size:0.8rem;">Tente outra fonte abaixo.</p>
                    </div>
                </div>

                <!-- Sources Bar -->
                <div id="player-sources-bar" class="player-sources-footer">
                    <div class="sources-label"><i class="fas fa-server"></i> Fontes</div>
                    <div class="sources-scroll">
                        ${CONFIG.PLAYERS.map((p, i) => `
                            <button onclick="Player.switchSource(${i})" 
                                class="source-btn ${i === this.activePlayerIndex ? 'active' : ''} source-btn-${i}"
                                style="${i === this.activePlayerIndex ? `background:${p.color}; border-color:${p.color}; color:white; box-shadow:0 4px 16px ${p.color}40;` : ''}">
                                <i class="fas ${p.icon}" style="${i === this.activePlayerIndex ? 'color:white;' : ''}"></i>
                                <span>${p.name}</span>
                                ${i === this.activePlayerIndex ? '<div class="source-pulse"></div>' : ''}
                            </button>
                        `).join('')}
                    </div>
                    ${type === 'tv' ? `
                        <button onclick="Player.showEpisodeSelector(${id}, '${title.replace(/'/g, "\\'")}')" 
                            style="
                                margin-top:10px; width:100%; padding:10px;
                                background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.1);
                                border-radius:10px; color:var(--text-secondary); font-size:0.8rem;
                                cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
                            ">
                            <i class="fas fa-list"></i> T${season} · E${episode} — Mudar episodio
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        modal.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            const overlay = document.getElementById('player-overlay');
            if (overlay) overlay.style.opacity = '1';
        });

        // Setup iframe
        const iframe = document.getElementById('player-iframe');
        const loading = document.getElementById('player-loading');
        const errorDiv = document.getElementById('player-error');

        if (iframe) {
            iframe.onload = () => { 
                if (loading) {
                    loading.style.opacity = '0';
                    setTimeout(() => loading.style.display = 'none', 300);
                }
                if (errorDiv) errorDiv.style.display = 'none';
            };

            iframe.onerror = () => { 
                if (loading) loading.style.display = 'none';
                if (errorDiv) errorDiv.style.display = 'flex';
            };
        }

        // Timeout fallback
        setTimeout(() => {
            if (loading && loading.style.display !== 'none') {
                loading.innerHTML = `
                    <div class="player-spinner" style="border-top-color:var(--warning)"></div>
                    <p style="color:var(--warning)">Demorando? Tente outra fonte.</p>
                `;
            }
        }, 10000);

        // Detect fullscreen para esconder/mostrar barra de fontes
        this.setupFullscreenHandler();

        this.addToHistory(id, type, title);
    },

    // Mostra seletor de temporada/episodio para series
    async showEpisodeSelector(id, title) {
        const modal = this.ensureModalContainer();

        try {
            const data = await API.getTVDetails(id);
            const seasons = (data.seasons || []).filter(s => s.season_number > 0);

            if (!seasons.length) {
                // Se nao tem temporadas, abre direto com S1E1
                this.open(id, 'tv', title, 1, 1);
                return;
            }

            // Busca episodios da primeira temporada por padrao
            let currentSeasonNum = seasons[0].season_number;
            let episodes = [];

            try {
                const seasonData = await API.getTVSeason(id, currentSeasonNum);
                episodes = seasonData.episodes || [];
            } catch(e) {
                episodes = [];
            }

            modal.innerHTML = `
                <div id="episode-selector" style="
                    position:fixed; inset:0; background:var(--bg-primary); z-index:9999;
                    display:flex; flex-direction:column; opacity:0;
                    transition:opacity 0.3s ease;
                ">
                    <div style="
                        display:flex; align-items:center; justify-content:space-between;
                        padding:16px; border-bottom:1px solid rgba(255,255,255,0.05);
                    ">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <button onclick="Player.closeEpisodeSelector()" style="
                                width:36px; height:36px; border-radius:50%;
                                background:var(--bg-tertiary); border:none; color:white;
                                cursor:pointer; display:flex; align-items:center; justify-content:center;
                            "><i class="fas fa-arrow-left"></i></button>
                            <div>
                                <div style="color:white; font-size:1rem; font-weight:700;">${title}</div>
                                <div style="color:var(--text-muted); font-size:0.75rem;">Selecione temporada e episodio</div>
                            </div>
                        </div>
                    </div>

                    <div style="flex:1; overflow-y:auto; padding:16px;">
                        <!-- Tabs de temporadas -->
                        <div style="display:flex; gap:8px; overflow-x:auto; margin-bottom:20px; padding-bottom:4px;">
                            ${seasons.map(s => `
                                <button onclick="Player.selectSeason(${id}, '${title.replace(/'/g, "\\'")}', ${s.season_number})" 
                                    class="season-tab ${s.season_number === currentSeasonNum ? 'active' : ''}"
                                    data-season="${s.season_number}">
                                    T${s.season_number}
                                </button>
                            `).join('')}
                        </div>

                        <!-- Lista de episodios -->
                        <div id="episodes-list" style="display:flex; flex-direction:column; gap:10px;">
                            ${episodes.length ? episodes.map(ep => `
                                <div onclick="Player.selectEpisode(${id}, '${title.replace(/'/g, "\\'")}', ${ep.season_number}, ${ep.episode_number})" 
                                    style="
                                        display:flex; gap:12px; padding:12px;
                                        background:var(--bg-card); border-radius:12px;
                                        border:1px solid rgba(255,255,255,0.03);
                                        cursor:pointer; transition:all 0.2s;
                                    " onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='var(--bg-card)'">
                                    <div style="
                                        width:120px; height:68px; border-radius:8px;
                                        background:var(--bg-tertiary); flex-shrink:0;
                                        display:flex; align-items:center; justify-content:center;
                                        overflow:hidden; position:relative;
                                    ">
                                        ${ep.still_path ? `
                                            <img src="${getImageUrl(ep.still_path, 'w300')}" 
                                                style="width:100%; height:100%; object-fit:cover;"
                                                onerror="this.style.display='none'">
                                        ` : ''}
                                        <div style="
                                            position:absolute; inset:0;
                                            display:flex; align-items:center; justify-content:center;
                                            background:rgba(0,0,0,0.4);
                                        ">
                                            <i class="fas fa-play" style="color:white; font-size:1.2rem;"></i>
                                        </div>
                                    </div>
                                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                                        <div style="color:white; font-size:0.85rem; font-weight:600;">
                                            ${ep.episode_number}. ${ep.name}
                                        </div>
                                        <div style="color:var(--text-muted); font-size:0.75rem; margin-top:4px;">
                                            ${ep.runtime ? ep.runtime + ' min · ' : ''}${ep.air_date || 'Data desconhecida'}
                                        </div>
                                        <div style="color:var(--text-secondary); font-size:0.75rem; margin-top:4px; line-height:1.4;
                                            display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                                            ${ep.overview || 'Sem sinopse'}
                                        </div>
                                    </div>
                                </div>
                            `).join('') : `
                                <div style="text-align:center; padding:40px; color:var(--text-muted);">
                                    <i class="fas fa-film" style="font-size:2rem; margin-bottom:12px;"></i>
                                    <p>Nenhum episodio encontrado</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;

            modal.style.pointerEvents = 'auto';
            document.body.style.overflow = 'hidden';

            requestAnimationFrame(() => {
                const selector = document.getElementById('episode-selector');
                if (selector) selector.style.opacity = '1';
            });

        } catch (err) {
            console.error('Episode selector error:', err);
            // Fallback: abre direto com S1E1
            this.open(id, 'tv', title, 1, 1);
        }
    },

    async selectSeason(id, title, seasonNum) {
        // Atualiza tabs
        document.querySelectorAll('.season-tab').forEach(tab => {
            tab.classList.toggle('active', parseInt(tab.dataset.season) === seasonNum);
        });

        // Busca episodios da temporada
        try {
            const seasonData = await API.getTVSeason(id, seasonNum);
            const episodes = seasonData.episodes || [];
            const list = document.getElementById('episodes-list');

            if (list) {
                list.innerHTML = episodes.length ? episodes.map(ep => `
                    <div onclick="Player.selectEpisode(${id}, '${title.replace(/'/g, "\\'")}', ${ep.season_number}, ${ep.episode_number})" 
                        style="
                            display:flex; gap:12px; padding:12px;
                            background:var(--bg-card); border-radius:12px;
                            border:1px solid rgba(255,255,255,0.03);
                            cursor:pointer; transition:all 0.2s;
                        " onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='var(--bg-card)'">
                        <div style="
                            width:120px; height:68px; border-radius:8px;
                            background:var(--bg-tertiary); flex-shrink:0;
                            display:flex; align-items:center; justify-content:center;
                            overflow:hidden; position:relative;
                        ">
                            ${ep.still_path ? `
                                <img src="${getImageUrl(ep.still_path, 'w300')}" 
                                    style="width:100%; height:100%; object-fit:cover;"
                                    onerror="this.style.display='none'">
                            ` : ''}
                            <div style="
                                position:absolute; inset:0;
                                display:flex; align-items:center; justify-content:center;
                                background:rgba(0,0,0,0.4);
                            ">
                                <i class="fas fa-play" style="color:white; font-size:1.2rem;"></i>
                            </div>
                        </div>
                        <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                            <div style="color:white; font-size:0.85rem; font-weight:600;">
                                ${ep.episode_number}. ${ep.name}
                            </div>
                            <div style="color:var(--text-muted); font-size:0.75rem; margin-top:4px;">
                                ${ep.runtime ? ep.runtime + ' min · ' : ''}${ep.air_date || 'Data desconhecida'}
                            </div>
                            <div style="color:var(--text-secondary); font-size:0.75rem; margin-top:4px; line-height:1.4;
                                display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                                ${ep.overview || 'Sem sinopse'}
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <div style="text-align:center; padding:40px; color:var(--text-muted);">
                        <i class="fas fa-film" style="font-size:2rem; margin-bottom:12px;"></i>
                        <p>Nenhum episodio encontrado</p>
                    </div>
                `;
            }
        } catch (e) {
            console.error('Select season error:', e);
        }
    },

    selectEpisode(id, title, season, episode) {
        this.closeEpisodeSelector();
        setTimeout(() => {
            this.open(id, 'tv', title, season, episode);
        }, 300);
    },

    closeEpisodeSelector() {
        const modal = document.getElementById('player-modal');
        if (modal) {
            const selector = document.getElementById('episode-selector');
            if (selector) {
                selector.style.opacity = '0';
                setTimeout(() => {
                    modal.innerHTML = '';
                    modal.style.pointerEvents = 'none';
                }, 300);
            } else {
                modal.innerHTML = '';
                modal.style.pointerEvents = 'none';
            }
        }
        document.body.style.overflow = '';
    },

    switchSource(index) {
        this.activePlayerIndex = index;
        localStorage.setItem('cineradar_player', index.toString());

        const player = CONFIG.PLAYERS[index];
        const url = player.getUrl(this.currentId, this.currentType, this.currentSeason, this.currentEpisode);

        const iframe = document.getElementById('player-iframe');
        const loading = document.getElementById('player-loading');
        const errorDiv = document.getElementById('player-error');

        if (iframe) {
            iframe.src = url;
            if (loading) {
                loading.style.display = 'flex';
                loading.style.opacity = '1';
                loading.innerHTML = `
                    <div class="player-spinner" style="border-top-color:${player.color}"></div>
                    <p>Carregando <span style="color:${player.color}; font-weight:700;">${player.name}</span>...</p>
                `;
            }
            if (errorDiv) errorDiv.style.display = 'none';
        }

        // Atualiza header
        const sourceLabel = document.querySelector('.player-header-source');
        if (sourceLabel) {
            sourceLabel.style.color = player.color;
            sourceLabel.innerHTML = `<i class="fas ${player.icon}"></i> ${player.name}`;
        }

        // Atualiza botoes
        CONFIG.PLAYERS.forEach((p, i) => {
            const btn = document.querySelector(`.source-btn-${i}`);
            if (btn) {
                const isActive = i === index;
                btn.style.background = isActive ? p.color : 'rgba(255,255,255,0.06)';
                btn.style.borderColor = isActive ? p.color : 'rgba(255,255,255,0.1)';
                btn.style.color = isActive ? 'white' : 'rgba(255,255,255,0.6)';
                btn.style.boxShadow = isActive ? `0 4px 16px ${p.color}40` : 'none';

                const icon = btn.querySelector('i');
                if (icon) icon.style.color = isActive ? 'white' : 'rgba(255,255,255,0.5)';

                const oldPulse = btn.querySelector('.source-pulse');
                if (oldPulse) oldPulse.remove();
                if (isActive) {
                    btn.innerHTML += `<div class="source-pulse"></div>`;
                }
            }
        });

        setTimeout(() => {
            if (loading && loading.style.display !== 'none') {
                loading.innerHTML = `
                    <div class="player-spinner" style="border-top-color:var(--warning)"></div>
                    <p style="color:var(--warning)">Demorando? Tente outra fonte.</p>
                `;
            }
        }, 10000);
    },

    setupFullscreenHandler() {
        const sourcesBar = document.getElementById('player-sources-bar');
        const header = document.querySelector('.player-header-bar');

        if (!sourcesBar || !header) return;

        const onFullscreenChange = () => {
            const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
            if (isFullscreen) {
                sourcesBar.style.display = 'none';
                header.style.display = 'none';
            } else {
                sourcesBar.style.display = 'block';
                header.style.display = 'flex';
            }
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    },

    addToHistory(id, type, title) {
        const entry = { id, type, title, watchedAt: new Date().toISOString() };
        this.playerHistory = this.playerHistory.filter(h => !(h.id === id && h.type === type));
        this.playerHistory.unshift(entry);
        if (this.playerHistory.length > 20) this.playerHistory.pop();
        localStorage.setItem('cineradar_player_history', JSON.stringify(this.playerHistory));
    },

    close() {
        const modal = document.getElementById('player-modal');
        if (modal) {
            const overlay = document.getElementById('player-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    modal.innerHTML = '';
                    modal.style.pointerEvents = 'none';
                }, 300);
            } else {
                modal.innerHTML = '';
                modal.style.pointerEvents = 'none';
            }
        }
        document.body.style.overflow = '';
    }
};
