const Player = {
    currentId: null,
    currentType: null,
    currentTitle: null,
    currentSeason: null,
    currentEpisode: null,
    activePlayerIndex: parseInt(localStorage.getItem('cineradar_player') || '0'),
    playerHistory: JSON.parse(localStorage.getItem('cineradar_player_history') || '[]'),

    // Configurações de iframe por player (crítico para compatibilidade)
    PLAYER_CONFIG: {
        betterflix: {
            referrerpolicy: 'origin',
            sandbox: null,
            allow: 'fullscreen; autoplay; encrypted-media; picture-in-picture; clipboard-read; clipboard-write'
        },
        myembed: {
            referrerpolicy: 'no-referrer',
            sandbox: 'allow-scripts allow-same-origin allow-popups allow-forms allow-presentation',
            allow: 'fullscreen; autoplay; encrypted-media; picture-in-picture'
        },
        superflix: {
            referrerpolicy: 'no-referrer',
            sandbox: 'allow-scripts allow-same-origin allow-popups allow-forms allow-presentation',
            allow: 'fullscreen; autoplay; encrypted-media; picture-in-picture'
        },
        megaembed: {
            referrerpolicy: 'origin',
            sandbox: null,
            allow: 'fullscreen; autoplay; encrypted-media; picture-in-picture'
        }
    },

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

    open(id, type, title, season = null, episode = null) {
        this.currentId = id;
        this.currentType = type;
        this.currentTitle = title;
        this.currentSeason = season;
        this.currentEpisode = episode;

        const modal = this.ensureModalContainer();
        const player = CONFIG.PLAYERS[this.activePlayerIndex];
        const url = player.getUrl(id, type, season, episode);
        const playerId = player.id;
        const pConfig = this.PLAYER_CONFIG[playerId] || this.PLAYER_CONFIG.superflix;

        // Monta atributos do iframe dinamicamente por player
        let iframeAttrs = `id="player-iframe" src="${url}"`;
        iframeAttrs += ` allow="${pConfig.allow}"`;
        iframeAttrs += ` allowfullscreen`;
        if (pConfig.referrerpolicy) iframeAttrs += ` referrerpolicy="${pConfig.referrerpolicy}"`;
        if (pConfig.sandbox) iframeAttrs += ` sandbox="${pConfig.sandbox}"`;

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
                    <div style="display:flex; gap:8px; align-items:center;">
                        <!-- Botão Abrir no Navegador (fallback) -->
                        <button onclick="Player.openInBrowser()" class="player-header-btn" title="Abrir no navegador" style="font-size:0.75rem; padding:6px 10px;">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                        <button onclick="Player.close()" class="player-header-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- Body -->
                <div style="flex:1; position:relative; background:#000;">
                    <iframe ${iframeAttrs}
                        style="width:100%; height:100%; border:none; position:absolute; inset:0;"
                    ></iframe>

                    <div id="player-loading" class="player-loading-overlay">
                        <div class="player-spinner" style="border-top-color:${player.color}"></div>
                        <p>Carregando <span style="color:${player.color}; font-weight:700;">${player.name}</span>...</p>
                    </div>

                    <div id="player-error" style="
                        display:none; position:absolute; inset:0;
                        flex-direction:column; align-items:center; justify-content:center;
                        gap:16px; background:#000; z-index:10; padding:20px; text-align:center;
                    ">
                        <i class="fas fa-exclamation-triangle" style="color:var(--danger); font-size:3rem;"></i>
                        <p style="color:var(--text-secondary); font-size:0.9rem;">Erro ao carregar esta fonte.</p>
                        <p style="color:var(--text-muted); font-size:0.8rem;">Tente outra fonte abaixo ou abra no navegador.</p>
                        <button onclick="Player.openInBrowser()" style="
                            padding:12px 24px; background:${player.color}; color:#fff;
                            border:none; border-radius:10px; font-weight:700; cursor:pointer;
                            display:flex; align-items:center; gap:8px;
                        ">
                            <i class="fas fa-external-link-alt"></i> Abrir no navegador
                        </button>
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
                        <button onclick="Player.goBackToDetails()"
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

        // Timeout de segurança: se não carregar em 12s, mostra erro
        this._loadTimeout = setTimeout(() => {
            if (loading && loading.style.display !== 'none') {
                loading.style.display = 'none';
                if (errorDiv) errorDiv.style.display = 'flex';
            }
        }, 12000);

        // Timeout de aviso: após 8s mostra "demorando"
        this._warnTimeout = setTimeout(() => {
            if (loading && loading.style.display !== 'none') {
                loading.innerHTML = `
                    <div class="player-spinner" style="border-top-color:var(--warning)"></div>
                    <p style="color:var(--warning)">Demorando? Tente outra fonte.</p>
                `;
            }
        }, 8000);

        // === FORÇA LANDSCAPE NO MOBILE ===
        this.lockOrientation();

        this.setupFullscreenHandler();
        this.addToHistory(id, type, title);
    },

    // === NOVO: Abrir player no navegador externo ===
    openInBrowser() {
        const player = CONFIG.PLAYERS[this.activePlayerIndex];
        if (!player || !this.currentId) return;
        const url = player.getUrl(this.currentId, this.currentType, this.currentSeason, this.currentEpisode);
        window.open(url, '_blank');
    },

    goBackToDetails() {
        this.close();
        if (this.currentId && this.currentType) {
            setTimeout(() => {
                Router.navigate(`#/details/${this.currentType}/${this.currentId}`);
            }, 300);
        }
    },

    switchSource(index) {
        // Limpa timeouts antigos
        if (this._loadTimeout) clearTimeout(this._loadTimeout);
        if (this._warnTimeout) clearTimeout(this._warnTimeout);

        this.activePlayerIndex = index;
        localStorage.setItem('cineradar_player', index.toString());

        const player = CONFIG.PLAYERS[index];
        const url = player.getUrl(this.currentId, this.currentType, this.currentSeason, this.currentEpisode);
        const playerId = player.id;
        const pConfig = this.PLAYER_CONFIG[playerId] || this.PLAYER_CONFIG.superflix;

        const iframe = document.getElementById('player-iframe');
        const loading = document.getElementById('player-loading');
        const errorDiv = document.getElementById('player-error');

        if (iframe) {
            // Reaplica atributos dinamicamente
            iframe.src = url;
            iframe.setAttribute('allow', pConfig.allow);
            iframe.setAttribute('referrerpolicy', pConfig.referrerpolicy || '');
            if (pConfig.sandbox) {
                iframe.setAttribute('sandbox', pConfig.sandbox);
            } else {
                iframe.removeAttribute('sandbox');
            }

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

        const sourceLabel = document.querySelector('.player-header-source');
        if (sourceLabel) {
            sourceLabel.style.color = player.color;
            sourceLabel.innerHTML = `<i class="fas ${player.icon}"></i> ${player.name}`;
        }

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

        // Reconfigura timeouts
        this._warnTimeout = setTimeout(() => {
            if (loading && loading.style.display !== 'none') {
                loading.innerHTML = `
                    <div class="player-spinner" style="border-top-color:var(--warning)"></div>
                    <p style="color:var(--warning)">Demorando? Tente outra fonte.</p>
                `;
            }
        }, 8000);

        this._loadTimeout = setTimeout(() => {
            if (loading && loading.style.display !== 'none') {
                loading.style.display = 'none';
                if (errorDiv) errorDiv.style.display = 'flex';
            }
        }, 12000);
    },

    setupFullscreenHandler() {
        const sourcesBar = document.getElementById('player-sources-bar');
        const header = document.querySelector('.player-header-bar');
        if (!sourcesBar || !header) return;

        // Remove handler anterior se existir (evita memory leak)
        if (this._fsHandler) {
            document.removeEventListener('fullscreenchange', this._fsHandler);
            document.removeEventListener('webkitfullscreenchange', this._fsHandler);
        }

        this._fsHandler = () => {
            const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
            if (isFullscreen) {
                sourcesBar.style.display = 'none';
                header.style.display = 'none';
            } else {
                sourcesBar.style.display = 'block';
                header.style.display = 'flex';
            }
        };

        document.addEventListener('fullscreenchange', this._fsHandler);
        document.addEventListener('webkitfullscreenchange', this._fsHandler);
    },

    // === BLOQUEIA ORIENTAÇÃO EM LANDSCAPE ===
    lockOrientation() {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {
                // Fallback silencioso se não suportado
            });
        }
    },

    // === LIBERA ORIENTAÇÃO ===
    unlockOrientation() {
        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
    },

    addToHistory(id, type, title) {
        const entry = { id, type, title, watchedAt: new Date().toISOString() };
        this.playerHistory = this.playerHistory.filter(h => !(h.id === id && h.type === type));
        this.playerHistory.unshift(entry);
        if (this.playerHistory.length > 20) this.playerHistory.pop();
        localStorage.setItem('cineradar_player_history', JSON.stringify(this.playerHistory));
    },

    close() {
        // Limpa timeouts pendentes
        if (this._loadTimeout) clearTimeout(this._loadTimeout);
        if (this._warnTimeout) clearTimeout(this._warnTimeout);

        // Libera orientação
        this.unlockOrientation();

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