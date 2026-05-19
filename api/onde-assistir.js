// Vercel Serverless Function - Proxy seguro para APIs
// As chaves ficam apenas no servidor Vercel, NUNCA no frontend!

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  const { endpoint, id, type, query, page, provider } = req.query;

  try {
    // Chaves do servidor (Environment Variables do Vercel)
    const TMDB_KEY = process.env.TMDB_API_KEY;
    const WATCHMODE_KEY = process.env.WATCHMODE_API_KEY;

    if (!TMDB_KEY) {
      return res.status(500).json({ error: 'TMDB_API_KEY não configurada no servidor' });
    }

    let data;

    switch(endpoint) {
      case 'trending':
        data = await fetch(`https://api.themoviedb.org/3/trending/${type || 'all'}/week?api_key=${TMDB_KEY}&language=pt-BR&region=BR&page=${page || 1}`).then(r => r.json());
        break;

      case 'movie-details':
        data = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=pt-BR&append_to_response=credits,videos,watch/providers`).then(r => r.json());
        break;

      case 'tv-details':
        data = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=pt-BR&append_to_response=credits,videos,watch/providers`).then(r => r.json());
        break;

      case 'upcoming':
        data = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_KEY}&language=pt-BR&region=BR&page=${page || 1}`).then(r => r.json());
        break;

      case 'now-playing':
        data = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_KEY}&language=pt-BR&region=BR&page=${page || 1}`).then(r => r.json());
        break;

      case 'popular-movies':
        data = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&language=pt-BR&region=BR&page=${page || 1}`).then(r => r.json());
        break;

      case 'popular-tv':
        data = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_KEY}&language=pt-BR&page=${page || 1}`).then(r => r.json());
        break;

      case 'airing-today':
        data = await fetch(`https://api.themoviedb.org/3/tv/airing_today?api_key=${TMDB_KEY}&language=pt-BR&page=${page || 1}`).then(r => r.json());
        break;

      case 'search':
        data = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=${page || 1}&include_adult=false`).then(r => r.json());
        break;

      case 'discover':
        const mediaType = type === 'tv' ? 'tv' : 'movie';
        data = await fetch(`https://api.themoviedb.org/3/discover/${mediaType}?api_key=${TMDB_KEY}&language=pt-BR&region=BR&with_watch_providers=${provider}&watch_region=BR&sort_by=popularity.desc&page=${page || 1}`).then(r => r.json());
        break;

      case 'watchmode-sources':
        if (!WATCHMODE_KEY) {
          return res.status(500).json({ error: 'WATCHMODE_API_KEY não configurada' });
        }
        // Busca ID do Watchmode
        const searchRes = await fetch(`https://api.watchmode.com/v1/search/?apiKey=${WATCHMODE_KEY}&search_field=name&search_value=${id}&types=${type === 'tv' ? 'tv_series' : 'movie'}`).then(r => r.json());
        if (!searchRes.title_results?.length) {
          return res.json({ sources: [] });
        }
        const wmId = searchRes.title_results[0].id;
        data = await fetch(`https://api.watchmode.com/v1/title/${wmId}/sources/?apiKey=${WATCHMODE_KEY}`).then(r => r.json());
        break;

      default:
        return res.status(400).json({ error: 'Endpoint inválido' });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
