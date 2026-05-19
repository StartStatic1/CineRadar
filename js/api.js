// ==========================================
// API TMDB
// ==========================================

const API = {
    async request(endpoint, params = {}) {
        if (!CONFIG.TMDB_API_KEY) {
            throw new Error('API_KEY_MISSING');
        }

        const queryParams = new URLSearchParams({
            api_key: CONFIG.TMDB_API_KEY,
            language: CONFIG.LANGUAGE,
            region: CONFIG.REGION,
            ...params
        });

        const url = `${CONFIG.TMDB_BASE_URL}${endpoint}?${queryParams}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 401) throw new Error('API_KEY_INVALID');
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Trending
    getTrending(mediaType = 'all', timeWindow = 'week', page = 1) {
        return this.request(`/trending/${mediaType}/${timeWindow}`, { page });
    },

    // Movies
    getMovieDetails(id) {
        return this.request(`/movie/${id}`, {
            append_to_response: 'credits,videos,watch/providers'
        });
    },

    getUpcomingMovies(page = 1) {
        return this.request('/movie/upcoming', { page });
    },

    getNowPlaying(page = 1) {
        return this.request('/movie/now_playing', { page });
    },

    getPopularMovies(page = 1) {
        return this.request('/movie/popular', { page });
    },

    // TV Shows
    getTVDetails(id) {
        return this.request(`/tv/${id}`, {
            append_to_response: 'credits,videos,watch/providers'
        });
    },

    getPopularTV(page = 1) {
        return this.request('/tv/popular', { page });
    },

    getAiringToday(page = 1) {
        return this.request('/tv/airing_today', { page });
    },

    // Search
    search(query, page = 1) {
        return this.request('/search/multi', { query, page, include_adult: false });
    },

    // Discover by provider
    discoverByProvider(providerId, type = 'movie', page = 1) {
        const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv';
        return this.request(endpoint, {
            with_watch_providers: providerId,
            watch_region: CONFIG.REGION,
            sort_by: 'popularity.desc',
            page
        });
    },

    // Providers
    getWatchProviders(type = 'movie') {
        return this.request(`/watch/providers/${type}`);
    },

    // Genres
    getGenres(type = 'movie') {
        return this.request(`/genre/${type}/list`);
    }
};
