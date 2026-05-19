const API = {
    // Tenta proxy primeiro, se falhar usa TMDB direto (fallback)
    async proxy(endpoint, params = {}) {
        const query = new URLSearchParams({ endpoint, ...params }).toString();
        try {
            const res = await fetch(`${CONFIG.API_BASE}/onde-assistir.js?${query}`);
            if (!res.ok) throw new Error(`Proxy ${res.status}`);
            return res.json();
        } catch (e) {
            console.log('Proxy falhou, usando fallback TMDB:', e.message);
            return this.fallback(endpoint, params);
        }
    },

    // Fallback direto para TMDB (funciona se chave estiver no config)
    async fallback(endpoint, params = {}) {
        const TMDB_KEY = CONFIG.TMDB_API_KEY || '';
        if (!TMDB_KEY || TMDB_KEY.includes('SUA_')) {
            throw new Error('API_KEY não configurada. Adicione TMDB_API_KEY nas Environment Variables do Vercel.');
        }

        const qp = new URLSearchParams({ api_key: TMDB_KEY, language: CONFIG.LANGUAGE, region: CONFIG.REGION, ...params });
        let url;

        switch(endpoint) {
            case 'trending': url = `${CONFIG.TMDB_BASE_URL}/trending/${params.type || 'all'}/week?${qp}`; break;
            case 'movie-details': url = `${CONFIG.TMDB_BASE_URL}/movie/${params.id}?${qp}&append_to_response=credits,videos,watch/providers`; break;
            case 'tv-details': url = `${CONFIG.TMDB_BASE_URL}/tv/${params.id}?${qp}&append_to_response=credits,videos,watch/providers`; break;
            case 'upcoming': url = `${CONFIG.TMDB_BASE_URL}/movie/upcoming?${qp}`; break;
            case 'now-playing': url = `${CONFIG.TMDB_BASE_URL}/movie/now_playing?${qp}`; break;
            case 'popular-movies': url = `${CONFIG.TMDB_BASE_URL}/movie/popular?${qp}`; break;
            case 'popular-tv': url = `${CONFIG.TMDB_BASE_URL}/tv/popular?${qp}`; break;
            case 'airing-today': url = `${CONFIG.TMDB_BASE_URL}/tv/airing_today?${qp}`; break;
            case 'search': url = `${CONFIG.TMDB_BASE_URL}/search/multi?${qp}&query=${encodeURIComponent(params.query)}&include_adult=false`; break;
            case 'discover': {
                const mt = params.type === 'tv' ? 'tv' : 'movie';
                url = `${CONFIG.TMDB_BASE_URL}/discover/${mt}?${qp}&with_watch_providers=${params.provider}&watch_region=BR&sort_by=popularity.desc`;
                break;
            }
            default: throw new Error('Endpoint desconhecido');
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error(`TMDB ${res.status}`);
        return res.json();
    },

    getTrending(type = 'all', page = 1) { return this.proxy('trending', { type, page }); },
    getMovieDetails(id) { return this.proxy('movie-details', { id }); },
    getTVDetails(id) { return this.proxy('tv-details', { id }); },
    getUpcoming(page = 1) { return this.proxy('upcoming', { page }); },
    getNowPlaying(page = 1) { return this.proxy('now-playing', { page }); },
    getPopularMovies(page = 1) { return this.proxy('popular-movies', { page }); },
    getPopularTV(page = 1) { return this.proxy('popular-tv', { page }); },
    getAiringToday(page = 1) { return this.proxy('airing-today', { page }); },
    search(query, page = 1) { return this.proxy('search', { query, page }); },
    discoverByProvider(provider, type = 'movie', page = 1) { return this.proxy('discover', { provider, type, page }); }
};
