const Player = {
    currentId: null,
    currentType: null,
    currentTitle: null,
    currentSeason: null,
    currentEpisode: null,
    activePlayerIndex: parseInt(localStorage.getItem('cineradar_player') || '0'),
    playerHistory: JSON.parse(localStorage.getItem('cineradar_player_history') || '[]'),

    // Garante que o container do modal existe no DOM
    ensureModalContainer() {
        let modal = $('#player-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'player-modal';
            modal.style.cssText = 'position:fixed;inset:0;z-index:3000;pointer-events:none;';
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

        modal.innerHTML = `
            <div class="player-modal-overlay active" onclick="Player.close(event)">
                <!-- Header -->
                <div class="player-modal-header" onclick="event.stopPropagation()">
                    <div class="player-header-left">
                        <h3><i class="fas ${player.icon}" style="color:${player.color}"></i> <span class="player-title-text">${title}</span></h3>
                        <span class="player-source-badge" style="background:${player.color}20;color:${player.color}">
                            ${player.name}
                        </span>
                    </div>
                    <button class="player-close-btn" onclick="Player.close(event)"><i class="fas fa-times"></i></button>
                </div>

                <!-- Body com iframe -->
                <div class="player-modal-body" onclick="event.stopPropagation()">
                    <iframe id="player-iframe" src="${url}" allowfullscreen loading="lazy" 
                        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation">
                    </iframe>
                    <div class="player-loading" id="player-loading">
                        <div class="loader-spinner"></div>
                        <p>Carregando ${player.name}...</p>
                    </div>
                </div>

                <!-- RODAPE DE SELECAO DE PLAYERS -->
                <div class="player-sources-bar" onclick="event.stopPropagation()">
                    <div class="sources-label"><i class="fas fa-server"></i> Fontes</div>
                    <div class="sources-list">
                        ${CONFIG.PLAYERS.map((p, i) => `
                            <button class="source-btn ${i === this.activePlayerIndex ? 'active' : ''}" 
                                onclick="Player.switchSource(${i})"
                                style="--source-color: ${p.color}">
                                <i class="fas ${p.icon}"></i>
                                <span>${p.name}</span>
                                ${i === this.activePlayerIndex ? '<div class="source-pulse"></div>' : ''}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Forca pointer-events no modal para receber cliques
        modal.style.pointerEvents = 'auto';

        // Loading handler
        const iframe = $('#player-iframe');
        const loading = $('#player-loading');

        if (iframe) {
            iframe.onload = () => { 
                if (loading) loading.style.display = 'none'; 
            };
            iframe.onerror = () => { 
                if (loading) loading.innerHTML = '<p style="color:var(--danger)">Erro ao carregar. Tente outra fonte.</p>'; 
            };
        }

        // Timeout de fallback
        setTimeout(() => {
            if (loading && loading.style.display !== 'none') {
                loading.innerHTML = '<p style="color:var(--warning)">Demorando? Tente outra fonte abaixo.</p>';
            }
        }, 8000);

        document.body.style.overflow = 'hidden';

        // Salva no historico
        this.addToHistory(id, type, title);
    },

    switchSource(index) {
        this.activePlayerIndex = index;
        localStorage.setItem('cineradar_player', index.toString());

        const player = CONFIG.PLAYERS[index];
        const url = player.getUrl(this.currentId, this.currentType, this.currentSeason, this.currentEpisode);

        const iframe = $('#player-iframe');
        const loading = $('#player-loading');
        const titleText = $('.player-title-text');
        const badge = $('.player-source-badge');

        if (iframe) {
            iframe.src = url;
            if (loading) {
                loading.style.display = 'flex';
                loading.innerHTML = `<div class="loader-spinner"></div><p>Carregando ${player.name}...</p>`;
            }
        }

        if (titleText) titleText.textContent = this.currentTitle;
        if (badge) {
            badge.style.background = player.color + '20';
            badge.style.color = player.color;
            badge.textContent = player.name;
        }

        // Atualiza botoes ativos
        document.querySelectorAll('.source-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
            const pulse = btn.querySelector('.source-pulse');
            if (pulse) pulse.remove();
            if (i === index) {
                const newPulse = document.createElement('div');
                newPulse.className = 'source-pulse';
                btn.appendChild(newPulse);
            }
        });

        // Timeout fallback
        setTimeout(() => {
            if (loading && loading.style.display !== 'none') {
                loading.innerHTML = '<p style="color:var(--warning)">Demorando? Tente outra fonte.</p>';
            }
        }, 8000);
    },

    addToHistory(id, type, title) {
        const entry = { id, type, title, watchedAt: new Date().toISOString() };
        this.playerHistory = this.playerHistory.filter(h => !(h.id === id && h.type === type));
        this.playerHistory.unshift(entry);
        if (this.playerHistory.length > 20) this.playerHistory.pop();
        localStorage.setItem('cineradar_player_history', JSON.stringify(this.playerHistory));
    },

    close(e) {
        const overlay = e.target.closest('.player-modal-overlay');
        const closeBtn = e.target.closest('.player-close-btn');

        if (overlay || closeBtn) {
            const modal = $('#player-modal');
            if (modal) {
                modal.innerHTML = '';
                modal.style.pointerEvents = 'none';
            }
            document.body.style.overflow = '';
        }
    }
};
