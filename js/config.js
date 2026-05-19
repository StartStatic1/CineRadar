// ==========================================
// CONFIG - Chaves vem do servidor (Vercel)
// ==========================================
// NÃO cole chaves aqui. Configure em:
// Vercel Dashboard → Settings → Environment Variables

const CONFIG = {
    PROXY_TMDB: '/api/tmdb',
    PROXY_WATCHMODE: '/api/watchmode',

    TMDB_IMAGE_URL: 'https://image.tmdb.org/t/p',
    REGION: 'BR',
    LANGUAGE: 'pt-BR',

    // Player embed
    PLAYER_BASE_URL: 'https://myembed.biz',

    // Providers com logos oficiais (CDN JustWatch/Watchmode)
    PROVIDERS: {
        netflix:   { id: 8,   name: 'Netflix',      color: '#E50914', logo: 'https://cdn.watchmode.com/logos/203_logo_100px.jpg' },
        prime:     { id: 119, name: 'Prime Video',  color: '#00A8E1', logo: 'https://cdn.watchmode.com/logos/26_logo_100px.jpg' },
        disney:    { id: 337, name: 'Disney+',      color: '#113CCF', logo: 'https://cdn.watchmode.com/logos/372_logo_100px.jpg' },
        max:       { id: 1899,name: 'Max',          color: '#002BE7', logo: 'https://cdn.watchmode.com/logos/387_logo_100px.jpg' },
        paramount: { id: 531, name: 'Paramount+',   color: '#0064FF', logo: 'https://cdn.watchmode.com/logos/531_logo_100px.jpg' },
        apple:     { id: 350, name: 'Apple TV+',    color: '#1D1D1F', logo: 'https://cdn.watchmode.com/logos/371_logo_100px.jpg' },
        crunchyroll:{id: 283, name: 'Crunchyroll',  color: '#F47521', logo: 'https://cdn.watchmode.com/logos/283_logo_100px.jpg' },
        loke:      { id: 73,  name: 'Looke',        color: '#1E3A8A', logo: 'https://cdn.watchmode.com/logos/73_logo_100px.jpg' }
    },

    // Mapeamento TMDB provider_id → nossa chave (para linkar com Watchmode)
    TMDB_TO_KEY: {
        8: 'netflix', 119: 'prime', 337: 'disney', 1899: 'max',
        531: 'paramount', 350: 'apple', 283: 'crunchyroll', 73: 'loke'
    }
};
