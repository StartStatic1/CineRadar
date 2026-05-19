export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { i, t, plot, ...params } = req.query;
  const key = process.env.OMDB_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'OMDB_API_KEY não configurada nas Environment Variables da Vercel' });
  }

  const url = new URL('https://www.omdbapi.com/');
  url.searchParams.set('apikey', key);
  if (i) url.searchParams.set('i', i);
  if (t) url.searchParams.set('t', t);
  if (plot) url.searchParams.set('plot', plot);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
