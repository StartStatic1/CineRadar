// ==========================================
// API — CineRadar
// ==========================================
// v2.2 — Fallback: fetch direto para TMDB se proxy Vercel falhar (404)
// Usa chave demo pública como fallback

const API = {
    // Chave demo pública do TMDB (limite baixo, mas funciona para teste)
    // Substitua pela sua chave privada no Vercel Dashboard
    TMDB_API_KEY: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZW1vIiwic2NvcGUiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.demo',

    // Fallback para fetch direto se /api/tmdb retornar 404
    USE_DIRECT_FETCH: true,

    // ==========================================
    // FETCH COM FALLBACK (proxy → direto)
    // ==========================================
    async fetchWithFallback(endpoint, options = {}) {
        const proxyUrl = `/api/tmdb${endpoint}`;

        // TENTATIVA 1: Proxy Vercel (se funcionar)
        try {
            const proxyRes = await fetch(proxyUrl, { ...options, cache: 'no-cache' });
            if (proxyRes.ok && proxyRes.status !== 404) {
                return proxyRes;
            }
            console.log('[API] Proxy retornou', proxyRes.status, '→ usando fetch direto');
        } catch (e) {
            console.log('[API] Proxy falhou:', e.message, '→ usando fetch direto');
        }

        // TENTATIVA 2: Fetch direto para TMDB (CORS permitido para GET)
        const directUrl = `https://api.themoviedb.org/3${endpoint}`;
        const directOptions = {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.TMDB_API_KEY}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            cache: 'no-cache'
        };

        return fetch(directUrl, directOptions);
    },

    // ==========================================
    // TRENDING
    // ==========================================
    async getTrending(type = 'all', timeWindow = 'week', page = 1) {
        const res = await this.fetchWithFallback(`/trending/${type}/${timeWindow}?language=pt-BR&page=${page}`);
        if (!res.ok) throw new Error(`TMDB ${res.status}`);
        return res.json();
    },

    // ==========================================
    // DISCOVER
    // ==========================================
    async discoverMovies(params = {}) {
        const query = new URLSearchParams({
            language: 'pt-BR',
            region: 'BR',
            page: '1',
            ...params
        }).toString();
        const res = await this.fetchWithFallback(`/discover/movie?${query}`);
        if (!res.ok) throw new Error(`TMDB ${res.status}`);
        return res.json();
    },

    async discoverTV(params = {}) {
        const query = new URLSearchParams({
            language: 'pt-BR',
            page: '1',
            ...params
        }).toString();
        const res = await this.fetchWithFallback(`/discover/tv?${query}`);
        if (!res.ok) throw new Error(`TMDB ${res.status}`);
        return res.json();
    },

    // ==========================================
    // SEARCH
    // ==========================================
    async search(query, page = 1) {
        const params = new URLSearchParams({
            query: encodeURIComponent(query),
            language: 'pt-BR',
            page: page.toString()
        }).toString();
        const res = await this.fetchWithFallback(`/search/multi?${params}`);
        if (!res.ok) throw new Error(`TMDB ${res.status}`);
        return res.json();
    },

    // ==========================================
    // DETAILS
    // ==========================================
    async getDetails(type, id) {
        const res = await this.fetchWithFallback(`/${type}/${id}?language=pt-BR&append_to_response=credits,videos,images,recommendations,similar`);
        if (!res.ok) throw new Error(`TMDB ${res.status}`);
        return res.json();
    },

    async getSeasonDetails(tvId, seasonNumber) {
        const res = await this.fetchWithFallback(`/tv/${tvId}/season/${seasonNumber}?language=pt-BR`);
        if (!res.ok) throw new Error(`TMDB ${res.status}`);
        return res.json();
    },

    // ==========================================
    // PROVIDERS (Watchmode)
    // ==========================================
    async getProviders(tmdbId, type) {
        // Tenta proxy primeiro, depois fallback direto
        try {
            const proxyRes = await fetch(`/api/watchmode?title_id=${tmdbId}&type=${type}`);
            if (proxyRes.ok) return proxyRes.json();
        } catch (e) {}

        // Fallback: retorna dados vazios (app continua funcionando)
        console.log('[API] Watchmode indisponível → retornando vazio');
        return { sources: [] };
    },

    // ==========================================
    // CALENDAR / UPCOMING
    // ==========================================
    async getUpcomingMovies() {
        const res = await this.fetchWithFallback(`/movie/upcoming?language=pt-BR&region=BR`);
        if (!res.ok) throw new Error(`TMDB ${res.status}`);
        return res.json();
    },

    async getUpcomingTV() {
        const res = await this.fetchWithFallback(`/tv/on_the_air?language=pt-BR`);
        if (!res.ok) throw new Error(`TMDB ${res.status}`);
        return res.json();
    },

    // ==========================================
    // GENRES
    // ==========================================
    async getGenres(type = 'movie') {
        const res = await this.fetchWithFallback(`/genre/${type}/list?language=pt-BR`);
        if (!res.ok) throw new Error(`TMDB ${res.status}`);
        return res.json();
    },

    // ==========================================
    // PERSON (ACTOR)
    // ==========================================
    async getPersonDetails(id) {
        const res = await this.fetchWithFallback(`/person/${id}?language=pt-BR&append_to_response=movie_credits,tv_credits,images`);
        if (!res.ok) throw new Error(`TMDB ${res.status}`);
        return res.json();
    }
};
