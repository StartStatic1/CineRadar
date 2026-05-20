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

        // Cria o overlay do modal
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
                <!-- Header fixo no topo -->
                <div style="
                    position:absolute;
                    top:0; left:0; right:0;
                    z-index:100;
                    padding:12px 16px;
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    background:linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%);
                    pointer-events:none;
                ">
                    <div style="display:flex;align-items:center;gap:10px;pointer-events:auto;">
                        <button onclick="Player.close()" style="
                            width:36px; height:36px; border-radius:50%;
                            background:rgba(255,255,255,0.15); border:none;
                            color:white; cursor:pointer; display:flex;
                            align-items:center; justify-content:center;
                            backdrop-filter:blur(10px);
                        ">
                            <i class="fas fa-arrow-left" style="font-size:1rem"></i>
                        </button>
                        <div>
                            <div style="color:white; font-size:0.85rem; font-weight:600;">${title}</div>
                            <div style="color:${player.color}; font-size:0.7rem; font-weight:700;">
                                <i class="fas ${player.icon}" style="margin-right:4px"></i>${player.name}
                            </div>
                        </div>
                    </div>
                    <div style="pointer-events:auto;">
                        <button onclick="Player.close()" style="
                            width:36px; height:36px; border-radius:50%;
                            background:rgba(255,255,255,0.15); border:none;
                            color:white; cursor:pointer; display:flex;
                            align-items:center; justify-content:center;
                            backdrop-filter:blur(10px);
                        ">
                            <i class="fas fa-times" style="font-size:1rem"></i>
                        </button>
                    </div>
                </div>

                <!-- Area do iframe (ocupa tudo) -->
                <div style="flex:1; position:relative; background:#000;">
                    <iframe id="player-iframe" src="${url}" 
                        allowfullscreen 
                        style="width:100%; height:100%; border:none; position:absolute; inset:0;"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation">
                    </iframe>

                    <!-- Loading overlay -->
                    <div id="player-loading" style="
                        position:absolute; inset:0;
                        display:flex; flex-direction:column;
                        align-items:center; justify-content:center;
                        gap:16px; background:#000; z-index:5;
                        transition:opacity 0.3s ease;
                    ">
                        <div style="
                            width:48px; height:48px;
                            border:3px solid rgba(255,255,255,0.1);
                            border-top-color:${player.color};
                            border-radius:50%;
                            animation:spin 1s linear infinite;
                        "></div>
                        <p style="color:rgba(255,255,255,0.6); font-size:0.85rem;">
                            Carregando <span style="color:${player.color}; font-weight:700;">${player.name}</span>...
                        </p>
                    </div>
                </div>

                <!-- Barra de fontes no rodape (estilo Netflix) -->
                <div style="
                    position:absolute;
                    bottom:0; left:0; right:0;
                    z-index:100;
                    background:linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 60%, transparent 100%);
                    backdrop-filter:blur(20px);
                    padding:16px 12px 28px;
                    border-top:1px solid rgba(255,255,255,0.05);
                    pointer-events:auto;
                ">
                    <div style="
                        font-size:0.65rem; font-weight:700;
                        color:rgba(255,255,255,0.4);
                        text-transform:uppercase;
                        letter-spacing:1.2px;
                        margin-bottom:10px;
                        display:flex; align-items:center; gap:6px;
                    ">
                        <i class="fas fa-server"></i> Fontes
                    </div>
                    <div style="
                        display:flex; gap:8px;
                        overflow-x:auto;
                        scroll-snap-type:x mandatory;
                        padding-bottom:4px;
                        -webkit-overflow-scrolling:touch;
                    " class="sources-scroll">
                        ${CONFIG.PLAYERS.map((p, i) => `
                            <button onclick="Player.switchSource(${i})" style="
                                flex:0 0 auto;
                                scroll-snap-align:start;
                                display:flex; flex-direction:column;
                                align-items:center; gap:4px;
                                padding:10px 14px;
                                background:${i === this.activePlayerIndex ? p.color : 'rgba(255,255,255,0.06)'};
                                border:1.5px solid ${i === this.activePlayerIndex ? p.color : 'rgba(255,255,255,0.1)'};
                                border-radius:12px;
                                color:${i === this.activePlayerIndex ? 'white' : 'rgba(255,255,255,0.6)'};
                                font-size:0.65rem; font-weight:600;
                                min-width:64px; cursor:pointer;
                                transition:all 0.2s ease;
                                position:relative;
                                box-shadow:${i === this.activePlayerIndex ? `0 4px 16px ${p.color}40` : 'none'};
                            " class="source-btn-${i}">
                                <i class="fas ${p.icon}" style="font-size:1.1rem; color:${i === this.activePlayerIndex ? 'white' : 'rgba(255,255,255,0.5)'};"></i>
                                <span>${p.name}</span>
                                ${i === this.activePlayerIndex ? `
                                    <div style="
                                        position:absolute; top:-4px; right:-4px;
                                        width:10px; height:10px;
                                        background:var(--accent, #00d084);
                                        border-radius:50%;
                                        animation:pulse-dot 1.5s ease infinite;
                                        border:2px solid #000;
                                    "></div>
                                ` : ''}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Forca pointer-events
        modal.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden';

        // Anima entrada
        requestAnimationFrame(() => {
            const overlay = document.getElementById('player-overlay');
            if (overlay) overlay.style.opacity = '1';
        });

        // Loading handler
        const iframe = document.getElementById('player-iframe');
        const loading = document.getElementById('player-loading');

        if (iframe) {
            iframe.onload = () => { 
                if (loading) {
                    loading.style.opacity = '0';
                    setTimeout(() => loading.style.display = 'none', 300);
                }
            };
            iframe.onerror = () => { 
                if (loading) {
                    loading.innerHTML = `
                        <i class="fas fa-exclamation-circle" style="color:var(--danger); font-size:2rem;"></i>
                        <p style="color:var(--danger);">Erro ao carregar. Tente outra fonte.</p>
                    `;
                }
            };
        }

        // Timeout fallback
        setTimeout(() => {
            if (loading && loading.style.display !== 'none') {
                loading.innerHTML = `
                    <div style="width:48px; height:48px; border:3px solid rgba(255,255,255,0.1); border-top-color:var(--warning); border-radius:50%; animation:spin 1s linear infinite;"></div>
                    <p style="color:var(--warning);">Demorando? Tente outra fonte abaixo.</p>
                `;
            }
        }, 8000);

        // Salva no historico
        this.addToHistory(id, type, title);
    },

    switchSource(index) {
        this.activePlayerIndex = index;
        localStorage.setItem('cineradar_player', index.toString());

        const player = CONFIG.PLAYERS[index];
        const url = player.getUrl(this.currentId, this.currentType, this.currentSeason, this.currentEpisode);

        const iframe = document.getElementById('player-iframe');
        const loading = document.getElementById('player-loading');

        // Atualiza iframe
        if (iframe) {
            iframe.src = url;
            if (loading) {
                loading.style.display = 'flex';
                loading.style.opacity = '1';
                loading.innerHTML = `
                    <div style="width:48px; height:48px; border:3px solid rgba(255,255,255,0.1); border-top-color:${player.color}; border-radius:50%; animation:spin 1s linear infinite;"></div>
                    <p style="color:rgba(255,255,255,0.6); font-size:0.85rem;">
                        Carregando <span style="color:${player.color}; font-weight:700;">${player.name}</span>...
                    </p>
                `;
            }
        }

        // Atualiza header
        const headerTitle = document.querySelector('#player-overlay > div:first-child > div > div:last-child');
        if (headerTitle) {
            headerTitle.innerHTML = `
                <div style="color:white; font-size:0.85rem; font-weight:600;">${this.currentTitle}</div>
                <div style="color:${player.color}; font-size:0.7rem; font-weight:700;">
                    <i class="fas ${player.icon}" style="margin-right:4px"></i>${player.name}
                </div>
            `;
        }

        // Atualiza botoes ativos
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

                // Remove/add pulse
                const oldPulse = btn.querySelector('div[style*="animation:pulse-dot"]');
                if (oldPulse) oldPulse.remove();
                if (isActive) {
                    btn.innerHTML += `
                        <div style="position:absolute; top:-4px; right:-4px; width:10px; height:10px; background:var(--accent, #00d084); border-radius:50%; animation:pulse-dot 1.5s ease infinite; border:2px solid #000;"></div>
                    `;
                }
            }
        });

        // Timeout fallback
        setTimeout(() => {
            if (loading && loading.style.display !== 'none') {
                loading.innerHTML = `
                    <div style="width:48px; height:48px; border:3px solid rgba(255,255,255,0.1); border-top-color:var(--warning); border-radius:50%; animation:spin 1s linear infinite;"></div>
                    <p style="color:var(--warning);">Demorando? Tente outra fonte.</p>
                `;
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

// CSS inline para animacoes (adiciona se nao existir)
if (!document.getElementById('player-animations')) {
    const style = document.createElement('style');
    style.id = 'player-animations';
    style.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.4); opacity: 0.5; }
        }
        .sources-scroll::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(style);
}
