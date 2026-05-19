export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=43200, stale-while-revalidate=86400');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint, ...params } = req.query;
  const key = process.env.WATCHMODE_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'WATCHMODE_API_KEY não configurada nas Environment Variables da Vercel' });
  }

  const url = new URL(`https://api.watchmode.com/v1${endpoint}`);
  url.searchParams.set('apiKey', key);

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
