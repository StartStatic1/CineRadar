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

    async omdb(params = {}) {
        const qp = new URLSearchParams(params);
        const res = await fetch(`${CONFIG.PROXY_OMDB}?${qp}`);
        if (!res.ok) throw new Error(`OMDb Proxy ${res.status}`);
        const data = await res.json();
        if (data.Error) throw new Error(data.Error);
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

    // ===== NOVOS MÉTODOS =====

    // Detalhes do ator + filmografia
    getPersonDetails(id) {
        return this.tmdb(`/person/${id}`, {
            append_to_response: 'movie_credits,tv_credits,images'
        });
    },

    // Vídeos de um título (para Reels)
    getVideos(id, type = 'movie') {
        const ep = type === 'tv' ? `/tv/${id}/videos` : `/movie/${id}/videos`;
        return this.tmdb(ep);
    },

    // Descobrir por provider (para seções na home)
    discoverByProvider(provider, type = 'movie', page = 1) {
        const ep = type === 'tv' ? '/discover/tv' : '/discover/movie';
        return this.tmdb(ep, { 
            with_watch_providers: provider, 
            watch_region: 'BR', 
            sort_by: 'popularity.desc', 
            page 
        });
    },

    // Descobrir por gênero
    discoverByGenre(genreId, type = 'movie', page = 1, sort = 'popularity.desc') {
        const ep = type === 'tv' ? '/discover/tv' : '/discover/movie';
        return this.tmdb(ep, {
            with_genres: genreId,
            watch_region: 'BR',
            sort_by: sort,
            page
        });
    },

    // Busca de atores
    searchPeople(query, page = 1) {
        return this.tmdb('/search/person', { query, page });
    },

    getTrending(type = 'all', page = 1) { 
        return this.tmdb(`/trending/${type}/week`, { page }); 
    },
    getMovieDetails(id) { 
        return this.tmdb(`/movie/${id}`, { 
            append_to_response: 'credits,videos,watch/providers,release_dates' 
        }); 
    },
    getTVDetails(id) { 
        return this.tmdb(`/tv/${id}`, { 
            append_to_response: 'credits,videos,watch/providers,content_ratings' 
        }); 
    },
    getUpcoming(page = 1) { 
        return this.tmdb('/movie/upcoming', { page, region: 'BR' }); 
    },
    getNowPlaying(page = 1) { 
        return this.tmdb('/movie/now_playing', { page, region: 'BR' }); 
    },
    getPopularMovies(page = 1) { 
        return this.tmdb('/movie/popular', { page, region: 'BR' }); 
    },
    getPopularTV(page = 1) { 
        return this.tmdb('/tv/popular', { page }); 
    },
    getAiringToday(page = 1) { 
        return this.tmdb('/tv/airing_today', { page }); 
    },
    getTopRated(type = 'movie', page = 1) {
        const ep = type === 'tv' ? '/tv/top_rated' : '/movie/top_rated';
        return this.tmdb(ep, { page, region: 'BR' });
    },
    search(query, page = 1) { 
        return this.tmdb('/search/multi', { 
            query, page, include_adult: false 
        }); 
    }
};
