const API = {
    async tmdb(endpoint, params = {}) {
        const qp = new URLSearchParams({ endpoint, ...params });
        const res = await fetch(`${CONFIG.PROXY_TMDB}?${qp}`);
        if (!res.ok) throw new Error(`TMDB Proxy ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data;
    },

    async watchmode(endpoint, params = {}) {
        const qp = new URLSearchParams({ endpoint, ...params });
        const res = await fetch(`${CONFIG.PROXY_WATCHMODE}?${qp}`);
        if (!res.ok) throw new Error(`Watchmode Proxy ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data;
    },

    // Busca Watchmode ID via TMDB ID
    async getWatchmodeId(tmdbId, type) {
        const tmdbType = type === 'tv' ? 'tmdb_tv_id' : 'tmdb_movie_id';
        const data = await this.watchmode('/search', {
            search_field: tmdbType,
            search_value: tmdbId
        });
        return data.title_results?.[0]?.id || null;
    },

    // Busca sources enriquecidos do Watchmode
    async getWatchmodeSources(watchmodeId, regions = 'BR') {
        if (!watchmodeId) return null;
        return this.watchmode(`/title/${watchmodeId}/sources`, { regions });
    },

    getTrending(type = 'all', page = 1) { 
        return this.tmdb(`/trending/${type}/week`, { page }); 
    },
    getMovieDetails(id) { 
        return this.tmdb(`/movie/${id}`, { 
            append_to_response: 'credits,videos,watch/providers' 
        }); 
    },
    getTVDetails(id) { 
        return this.tmdb(`/tv/${id}`, { 
            append_to_response: 'credits,videos,watch/providers' 
        }); 
    },
    getUpcoming(page = 1) { 
        return this.tmdb('/movie/upcoming', { page }); 
    },
    getNowPlaying(page = 1) { 
        return this.tmdb('/movie/now_playing', { page }); 
    },
    getPopularMovies(page = 1) { 
        return this.tmdb('/movie/popular', { page }); 
    },
    getPopularTV(page = 1) { 
        return this.tmdb('/tv/popular', { page }); 
    },
    getAiringToday(page = 1) { 
        return this.tmdb('/tv/airing_today', { page }); 
    },
    search(query, page = 1) { 
        return this.tmdb('/search/multi', { 
            query, page, include_adult: false 
        }); 
    },
    discoverByProvider(provider, type = 'movie', page = 1) {
        const ep = type === 'tv' ? '/discover/tv' : '/discover/movie';
        return this.tmdb(ep, { 
            with_watch_providers: provider, 
            watch_region: 'BR', 
            sort_by: 'popularity.desc', 
            page 
        });
    }
};
