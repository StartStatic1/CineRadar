const Player = {
    currentId: null,
    currentType: null,
    currentTitle: null,
    currentSeason: null,
    currentEpisode: null,
    activePlayerIndex: parseInt(localStorage.getItem('cineradar_player') || '0'),
    playerHistory: JSON.parse(localStorage.getItem('cineradar_player_history') || '[]'),

    open(id, type, title, season = null, episode = null) {
        this.currentId = id;
        this.currentType = type;
        this.currentTitle = title;
        this.currentSeason = season;
        this.currentEpisode = episode;

        const modal = $('#player-modal');
        const player = CONFIG.PLAYERS[this.activePlayerIndex];
        const url = player.getUrl(id, type, season, episode);

        modal.innerHTML = `
            <div class="player-modal-overlay active" onclick="Player.close(event)">
                <div class="player-modal-header" onclick="event.stopPropagation()">
                    <div class="player-header-left">
                        <h3><i class="fas ${player.icon}" style="color:${player.color}"></i> ${title}</h3>
                        <span class="player-source-badge" style="background:${player.color}20;color:${player.color}">
                            ${player.name}
                        </span>
                    </div>
                    <button onclick="Player.close(event)"><i class="fas fa-times"></i></button>
                </div>

                <div class="player-modal-body" onclick="event.stopPropagation()">
                    <iframe id="player-iframe" src="${url}" allowfullscreen loading="lazy" 
                        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation">
                    </iframe>
                    <div class="player-loading" id="player-loading">
                        <div class="loader-spinner"></div>
                        <p>Carregando ${player.name}...</p>
                    </div>
                </div>

                <!-- ===== RODAPÉ DE SELEÇÃO DE PLAYERS (estilo IndicaAí) ===== -->
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

        // Loading handler
        const iframe = $('#player-iframe');
        const loading = $('#player-loading');
        iframe.onload = () => { if (loading) loading.style.display = 'none'; };
        iframe.onerror = () => { if (loading) loading.innerHTML = '<p style="color:var(--danger)">Erro ao carregar. Tente outra fonte.</p>'; };

        // Timeout de fallback
        setTimeout(() => {
            if (loading && loading.style.display !== 'none') {
                loading.innerHTML = '<p style="color:var(--warning)">Demorando? Tente outra fonte abaixo.</p>';
            }
        }, 8000);

        document.body.style.overflow = 'hidden';

        // Salva no histórico
        this.addToHistory(id, type, title);
    },

    switchSource(index) {
        this.activePlayerIndex = index;
        localStorage.setItem('cineradar_player', index.toString());

        const player = CONFIG.PLAYERS[index];
        const url = player.getUrl(this.currentId, this.currentType, this.currentSeason, this.currentEpisode);

        const iframe = $('#player-iframe');
        const loading = $('#player-loading');
        const header = $('.player-modal-header h3');
        const badge = $('.player-source-badge');

        if (iframe) {
            iframe.src = url;
            if (loading) {
                loading.style.display = 'flex';
                loading.innerHTML = `<div class="loader-spinner"></div><p>Carregando ${player.name}...</p>`;
            }
        }

        if (header) header.innerHTML = `<i class="fas ${player.icon}" style="color:${player.color}"></i> ${this.currentTitle}`;
        if (badge) {
            badge.style.background = player.color + '20';
            badge.style.color = player.color;
            badge.textContent = player.name;
        }

        // Atualiza botões ativos
        document.querySelectorAll('.source-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
            const pulse = btn.querySelector('.source-pulse');
            if (pulse) pulse.remove();
            if (i === index) {
                btn.innerHTML += '<div class="source-pulse"></div>';
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
        if (e.target.classList.contains('player-modal-overlay') || e.target.closest('button')) {
            $('#player-modal').innerHTML = '';
            document.body.style.overflow = '';
        }
    }
};
