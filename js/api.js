const API = {
    // Proxy seguro - chaves ficam no servidor!
    async proxy(endpoint, params = {}) {
        const query = new URLSearchParams({ endpoint, ...params }).toString();
        const res = await fetch(`${CONFIG.API_BASE}/onde-assistir.js?${query}`);
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || `HTTP ${res.status}`);
        }
        return res.json();
    },

    // TMDB via proxy
    getTrending(type = 'all', page = 1) { return this.proxy('trending', { type, page }); },
    getMovieDetails(id) { return this.proxy('movie-details', { id }); },
    getTVDetails(id) { return this.proxy('tv-details', { id }); },
    getUpcoming(page = 1) { return this.proxy('upcoming', { page }); },
    getNowPlaying(page = 1) { return this.proxy('now-playing', { page }); },
    getPopularMovies(page = 1) { return this.proxy('popular-movies', { page }); },
    getPopularTV(page = 1) { return this.proxy('popular-tv', { page }); },
    getAiringToday(page = 1) { return this.proxy('airing-today', { page }); },
    search(query, page = 1) { return this.proxy('search', { query, page }); },
    discoverByProvider(provider, type = 'movie', page = 1) { return this.proxy('discover', { provider, type, page }); },

    // Watchmode via proxy
    getWatchmodeSources(id, type = 'movie') { return this.proxy('watchmode-sources', { id, type }); }
};
