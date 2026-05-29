// ==========================================
// IPTV - Player de Listas M3U/M3U8
// ==========================================
// SOLUÇÃO: Proxy via Service Worker para contornar HTTP bloqueado em PWA
// Fallback: Abre stream em nova aba se proxy falhar

const IPTV = {
    // URL da lista M3U (pode ser HTTP!) — editável apenas no código
    // Troque aqui quando uma lista cair. NÃO expõe input pro usuário.
    DEFAULT_LIST_URL: 'http://kavru.com/get.php?username=558396043519&password=64537505&type=m3u_plus&output=ts',

    // URL alternativa (fallback interno)
    FALLBACK_LIST_URL: '',  // Deixe vazio ou preencha outra lista

    channels: [],
    currentChannel: null,
    hls: null,
    favorites: JSON.parse(localStorage.getItem('cineradar_iptv_favs') || '[]'),
    lastListUrl: localStorage.getItem('cineradar_iptv_lasturl') || '',

    // ==========================================
    // RENDER — Página principal IPTV
    // ==========================================
    render(container) {
        const listUrl = this.lastListUrl || this.DEFAULT_LIST_URL;

        container.innerHTML = `
            <div class="iptv-page">
                <!-- Header -->
                <div class="iptv-header">
                    <h1><i class="fas fa-tv"></i> TV Ao Vivo</h1>
                    <p class="iptv-subtitle">Canais via IPTV — Lista interna</p>
                </div>

                <!-- Player Nativo (HLS.js) -->
                <div class="iptv-player-container" id="iptv-player-box" style="display:none;">
                    <video id="iptv-video" controls autoplay playsinline
                        style="width:100%; height:100%; background:#000;">
                    </video>
                    <div class="iptv-player-info">
                        <span id="iptv-now-playing">Selecione um canal</span>
                        <button onclick="IPTV.closePlayer()" class="iptv-close-btn">
                            <i class="fas fa-times"></i> Fechar
                        </button>
                    </div>
                </div>

                <!-- Fallback externo (iframe/nova aba) -->
                <div class="iptv-fallback-box" id="iptv-fallback-box" style="display:none;">
                    <div class="iptv-fallback-msg">
                        <i class="fas fa-external-link-alt" style="font-size:2rem; color:var(--primary);"></i>
                        <p>Stream aberto em player externo</p>
                        <p style="font-size:0.8rem; color:var(--text-muted);">
                            O navegador bloqueou HTTP no app.<br>
                            Abrimos em nova aba automaticamente.
                        </p>
                        <button onclick="IPTV.closeFallback()" class="btn-primary" style="margin-top:12px;">
                            <i class="fas fa-arrow-left"></i> Voltar aos canais
                        </button>
                    </div>
                </div>

                <!-- Controles -->
                <div class="iptv-controls">
                    <div class="iptv-search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="iptv-search" placeholder="Buscar canal..." 
                            oninput="IPTV.filterChannels(this.value)">
                    </div>
                    <button onclick="IPTV.reloadList()" class="iptv-reload-btn" title="Recarregar lista">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>

                <!-- Categorias -->
                <div class="iptv-categories" id="iptv-categories"></div>

                <!-- Grid de Canais -->
                <div class="iptv-grid" id="iptv-grid">
                    <div class="iptv-loading">
                        <div class="spinner" style="border-top-color:var(--primary);"></div>
                        <p>Carregando canais...</p>
                    </div>
                </div>

                <!-- Stats -->
                <div class="iptv-stats" id="iptv-stats"></div>
            </div>
        `;

        // Carrega HLS.js dinamicamente se não estiver presente
        this.loadHlsJs(() => {
            this.loadChannels(listUrl);
        });
    },

    // ==========================================
    // CARREGA HLS.JS (CDN)
    // ==========================================
    loadHlsJs(callback) {
        if (window.Hls) { callback(); return; }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.onload = callback;
        script.onerror = () => {
            console.warn('HLS.js falhou ao carregar');
            callback(); // Continua mesmo sem HLS
        };
        document.head.appendChild(script);
    },

    // ==========================================
    // CARREGA CANAIS — COM PROXY VIA SERVICE WORKER
    // ==========================================
    async loadChannels(url) {
        const grid = document.getElementById('iptv-grid');
        const stats = document.getElementById('iptv-stats');

        if (grid) grid.innerHTML = `
            <div class="iptv-loading">
                <div class="spinner" style="border-top-color:var(--primary);"></div>
                <p>Carregando canais...</p>
            </div>
        `;

        try {
            // TENTATIVA 1: Proxy via Service Worker (se registrado)
            let text = await this.fetchViaProxy(url);

            // TENTATIVA 2: Fetch direto (se for HTTPS ou mixed content permitido)
            if (!text) {
                try {
                    const res = await fetch(url, { 
                        method: 'GET',
                        mode: 'cors',
                        cache: 'no-cache'
                    });
                    if (res.ok) text = await res.text();
                } catch(e) {
                    console.log('Fetch direto falhou:', e.message);
                }
            }

            // TENTATIVA 3: Fallback URL
            if (!text && this.FALLBACK_LIST_URL) {
                text = await this.fetchViaProxy(this.FALLBACK_LIST_URL);
            }

            if (!text) {
                throw new Error('Não foi possível carregar a lista. Verifique sua conexão.');
            }

            this.channels = this.parseM3U(text);
            this.renderCategories();
            this.renderGrid(this.channels);

            if (stats) stats.innerHTML = `
                <i class="fas fa-broadcast-tower"></i> ${this.channels.length} canais carregados
            `;

            // Salva URL usada
            this.lastListUrl = url;
            localStorage.setItem('cineradar_iptv_lasturl', url);

        } catch (err) {
            if (grid) grid.innerHTML = `
                <div class="iptv-error">
                    <i class="fas fa-wifi-slash" style="font-size:3rem; color:var(--danger);"></i>
                    <p>Erro ao carregar lista IPTV</p>
                    <p style="font-size:0.85rem; color:var(--text-muted);">${err.message}</p>
                    <button onclick="IPTV.reloadList()" class="btn-primary" style="margin-top:16px;">
                        <i class="fas fa-redo"></i> Tentar novamente
                    </button>
                </div>
            `;
        }
    },

    // ==========================================
    // PROXY VIA SERVICE WORKER
    // ==========================================
    async fetchViaProxy(url) {
        // Se tem service worker registrado, ele pode interceptar e proxy
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            try {
                // Envia mensagem pro SW para fazer fetch
                const msg = new Promise((resolve, reject) => {
                    const channel = new MessageChannel();
                    channel.port1.onmessage = (event) => {
                        if (event.data.error) reject(new Error(event.data.error));
                        else resolve(event.data.response);
                    };
                    navigator.serviceWorker.controller.postMessage(
                        { type: 'PROXY_FETCH', url: url },
                        [channel.port2]
                    );
                });

                // Timeout de 10s
                const timeout = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Proxy timeout')), 10000)
                );

                return await Promise.race([msg, timeout]);
            } catch(e) {
                console.log('Proxy SW falhou:', e.message);
                return null;
            }
        }
        return null;
    },

    // ==========================================
    // PARSE M3U
    // ==========================================
    parseM3U(text) {
        const channels = [];
        const lines = text.split('\n');
        let current = null;
        let id = 0;

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            if (line.startsWith('#EXTINF:')) {
                current = { id: id++, group: '', name: '', logo: '', url: '' };

                // Extrai atributos
                const groupMatch = line.match(/group-title="([^"]*)"/i);
                if (groupMatch) current.group = groupMatch[1].trim() || 'Sem categoria';
                else current.group = 'Sem categoria';

                const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
                if (logoMatch) current.logo = logoMatch[1].trim();

                const nameMatch = line.match(/,(.*)$/);
                if (nameMatch) current.name = nameMatch[1].trim();
                else current.name = `Canal ${id}`;

            } else if (line.startsWith('http') && current) {
                current.url = line;
                channels.push(current);
                current = null;
            }
        }

        return channels;
    },

    // ==========================================
    // RENDER CATEGORIAS
    // ==========================================
    renderCategories() {
        const container = document.getElementById('iptv-categories');
        if (!container) return;

        const groups = [...new Set(this.channels.map(c => c.group))].sort();

        container.innerHTML = `
            <button class="iptv-cat-btn active" onclick="IPTV.filterByGroup('all')">Todos</button>
            ${groups.map(g => `
                <button class="iptv-cat-btn" onclick="IPTV.filterByGroup('${g.replace(/'/g, "\'")}')">
                    ${g}
                </button>
            `).join('')}
        `;
    },

    // ==========================================
    // RENDER GRID DE CANAIS
    // ==========================================
    renderGrid(channels) {
        const grid = document.getElementById('iptv-grid');
        if (!grid) return;

        if (!channels.length) {
            grid.innerHTML = `<div class="iptv-empty">Nenhum canal encontrado</div>`;
            return;
        }

        grid.innerHTML = channels.map(ch => {
            const isFav = this.favorites.includes(ch.id);
            return `
                <div class="iptv-channel-card" onclick="IPTV.playChannel(${ch.id})">
                    <div class="iptv-channel-logo">
                        ${ch.logo ? `<img src="${ch.logo}" alt="${ch.name}" loading="lazy" 
                            onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\'fas fa-tv\'></i>';">` 
                            : '<i class="fas fa-tv"></i>'}
                    </div>
                    <div class="iptv-channel-info">
                        <div class="iptv-channel-name">${ch.name}</div>
                        <div class="iptv-channel-group">${ch.group}</div>
                    </div>
                    <button class="iptv-fav-btn ${isFav ? 'active' : ''}" 
                        onclick="event.stopPropagation(); IPTV.toggleFav(${ch.id})"
                        title="${isFav ? 'Remover favorito' : 'Adicionar favorito'}">
                        <i class="fas ${isFav ? 'fa-heart' : 'fa-heart-o'}"></i>
                    </button>
                </div>
            `;
        }).join('');
    },

    // ==========================================
    // TOCAR CANAL — HLS.JS NATIVO OU FALLBACK
    // ==========================================
    playChannel(id) {
        const ch = this.channels.find(c => c.id === id);
        if (!ch || !ch.url) return;

        this.currentChannel = ch;
        const video = document.getElementById('iptv-video');
        const playerBox = document.getElementById('iptv-player-box');
        const fallbackBox = document.getElementById('iptv-fallback-box');
        const nowPlaying = document.getElementById('iptv-now-playing');

        if (nowPlaying) nowPlaying.textContent = ch.name;

        // Verifica se URL é HTTP (vai ser bloqueada no PWA)
        const isHttp = ch.url.startsWith('http:');
        const isHls = ch.url.includes('.m3u') || ch.url.includes('.m3u8');

        // ESTRATÉGIA 1: HLS.js nativo (funciona se for HTTPS ou proxy SW ativo)
        if (window.Hls && isHls && !isHttp) {
            if (playerBox) playerBox.style.display = 'block';
            if (fallbackBox) fallbackBox.style.display = 'none';

            if (this.hls) {
                this.hls.destroy();
                this.hls = null;
            }

            if (Hls.isSupported()) {
                this.hls = new Hls({
                    maxBufferLength: 30,
                    maxMaxBufferLength: 60,
                    enableWorker: true
                });
                this.hls.loadSource(ch.url);
                this.hls.attachMedia(video);
                this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(() => {});
                });
                this.hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        this.hls.destroy();
                        this.fallbackToExternal(ch); // Erro fatal → fallback
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = ch.url;
                video.play().catch(() => {});
            } else {
                this.fallbackToExternal(ch);
            }
        } 
        // ESTRATÉGIA 2: HTTP ou não-HLS → abre em nova aba (única forma segura)
        else {
            this.fallbackToExternal(ch);
        }
    },

    // ==========================================
    // FALLBACK: Abre stream em nova aba
    // ==========================================
    fallbackToExternal(ch) {
        const playerBox = document.getElementById('iptv-player-box');
        const fallbackBox = document.getElementById('iptv-fallback-box');

        if (playerBox) playerBox.style.display = 'none';
        if (fallbackBox) fallbackBox.style.display = 'block';

        // Abre em nova aba após 1.5s (tempo de ler a mensagem)
        setTimeout(() => {
            window.open(ch.url, '_blank');
        }, 1500);
    },

    closePlayer() {
        const video = document.getElementById('iptv-video');
        const playerBox = document.getElementById('iptv-player-box');

        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
        if (video) {
            video.pause();
            video.src = '';
        }
        if (playerBox) playerBox.style.display = 'none';
        this.currentChannel = null;
    },

    closeFallback() {
        const fallbackBox = document.getElementById('iptv-fallback-box');
        if (fallbackBox) fallbackBox.style.display = 'none';
    },

    // ==========================================
    // FILTROS
    // ==========================================
    filterChannels(query) {
        const q = query.toLowerCase().trim();
        if (!q) {
            this.renderGrid(this.channels);
            return;
        }
        const filtered = this.channels.filter(c => 
            c.name.toLowerCase().includes(q) || 
            c.group.toLowerCase().includes(q)
        );
        this.renderGrid(filtered);
    },

    filterByGroup(group) {
        document.querySelectorAll('.iptv-cat-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        if (group === 'all') {
            this.renderGrid(this.channels);
        } else {
            const filtered = this.channels.filter(c => c.group === group);
            this.renderGrid(filtered);
        }
    },

    // ==========================================
    // FAVORITOS
    // ==========================================
    toggleFav(id) {
        const idx = this.favorites.indexOf(id);
        if (idx > -1) this.favorites.splice(idx, 1);
        else this.favorites.push(id);

        localStorage.setItem('cineradar_iptv_favs', JSON.stringify(this.favorites));

        // Re-renderiza o card específico
        const card = document.querySelector(`.iptv-channel-card[onclick*="${id}"]`);
        if (card) {
            const btn = card.querySelector('.iptv-fav-btn');
            const isFav = this.favorites.includes(id);
            btn.className = `iptv-fav-btn ${isFav ? 'active' : ''}`;
            btn.innerHTML = `<i class="fas ${isFav ? 'fa-heart' : 'fa-heart-o'}"></i>`;
            btn.title = isFav ? 'Remover favorito' : 'Adicionar favorito';
        }
    },

    // ==========================================
    // RECARREGAR LISTA
    // ==========================================
    reloadList() {
        const url = this.lastListUrl || this.DEFAULT_LIST_URL;
        this.loadChannels(url);
    }
};

// ==========================================
// CSS INLINE PARA IPTV (adicione ao seu CSS principal)
// ==========================================
const iptvStyles = `
.iptv-page { padding: 16px; max-width: 1200px; margin: 0 auto; }
.iptv-header { margin-bottom: 20px; }
.iptv-header h1 { font-size: 1.5rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.iptv-subtitle { color: var(--text-muted); font-size: 0.85rem; margin-top: 4px; }

.iptv-player-container {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: #000; z-index: 10000;
    display: flex; flex-direction: column;
}
.iptv-player-container video { flex: 1; }
.iptv-player-info {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
    padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;
    z-index: 2;
}
.iptv-close-btn {
    background: rgba(255,255,255,0.1); border: none; color: #fff;
    padding: 8px 16px; border-radius: 8px; cursor: pointer;
    font-size: 0.85rem; display: flex; align-items: center; gap: 6px;
}

.iptv-fallback-box {
    position: fixed; inset: 0; background: var(--bg-primary);
    z-index: 10000; display: flex; align-items: center; justify-content: center;
    text-align: center; padding: 20px;
}
.iptv-fallback-msg { max-width: 320px; }

.iptv-controls {
    display: flex; gap: 10px; margin-bottom: 16px;
    position: sticky; top: 0; z-index: 10; background: var(--bg-primary); padding: 8px 0;
}
.iptv-search-box {
    flex: 1; display: flex; align-items: center; gap: 10px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 12px; padding: 10px 14px;
}
.iptv-search-box input {
    flex: 1; background: none; border: none; color: var(--text-primary);
    font-size: 0.95rem; outline: none;
}
.iptv-reload-btn {
    background: var(--bg-card); border: 1px solid var(--border);
    color: var(--text-secondary); border-radius: 12px;
    width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
    cursor: pointer;
}

.iptv-categories {
    display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 12px;
    scrollbar-width: none;
}
.iptv-categories::-webkit-scrollbar { display: none; }
.iptv-cat-btn {
    background: var(--bg-card); border: 1px solid var(--border);
    color: var(--text-secondary); padding: 6px 14px; border-radius: 20px;
    white-space: nowrap; cursor: pointer; font-size: 0.8rem; transition: all 0.2s;
}
.iptv-cat-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.iptv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
}
.iptv-channel-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px; cursor: pointer;
    position: relative; transition: transform 0.15s, box-shadow 0.15s;
    display: flex; flex-direction: column; align-items: center; text-align: center;
}
.iptv-channel-card:active { transform: scale(0.96); }
.iptv-channel-logo {
    width: 60px; height: 60px; border-radius: 50%;
    background: var(--bg-elevated); display: flex; align-items: center; justify-content: center;
    margin-bottom: 8px; overflow: hidden;
}
.iptv-channel-logo img { width: 100%; height: 100%; object-fit: cover; }
.iptv-channel-logo i { font-size: 1.5rem; color: var(--text-muted); }
.iptv-channel-name { font-size: 0.8rem; font-weight: 600; line-height: 1.2; }
.iptv-channel-group { font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; }
.iptv-fav-btn {
    position: absolute; top: 6px; right: 6px;
    background: none; border: none; color: var(--text-muted);
    cursor: pointer; font-size: 0.9rem; padding: 4px;
}
.iptv-fav-btn.active { color: #e50914; }

.iptv-loading, .iptv-error, .iptv-empty {
    grid-column: 1 / -1; text-align: center; padding: 40px;
    color: var(--text-muted);
}
.iptv-stats {
    text-align: center; padding: 16px; font-size: 0.8rem; color: var(--text-muted);
}
`;

// Injeta CSS se ainda não estiver no CSS principal
if (!document.getElementById('iptv-dynamic-styles')) {
    const style = document.createElement('style');
    style.id = 'iptv-dynamic-styles';
    style.textContent = iptvStyles;
    document.head.appendChild(style);
}