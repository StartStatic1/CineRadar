export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint, ...params } = req.query;
  const key = process.env.TMDB_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'TMDB_API_KEY não configurada nas Environment Variables da Vercel' });
  }

  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint é obrigatório' });
  }

  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  url.searchParams.set('api_key', key);
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('region', 'BR');

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `TMDB API error: ${response.status}`, 
        details: errorText 
      });
    }

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
}
