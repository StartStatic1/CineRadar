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

    // Providers - logos oficiais via TMDB (mais confiáveis)
    PROVIDERS: {
        netflix:   { id: 8,   name: 'Netflix',      color: '#E50914', logo: 'https://image.tmdb.org/t/p/original/9A1JSVm8s3gXGq0wJ7hA0EM4Nzo.png' },
        prime:     { id: 119, name: 'Prime Video',  color: '#00A8E1', logo: 'https://image.tmdb.org/t/p/original/68MNrwlkpF7WnmNPXLah69CR5cb.png' },
        disney:    { id: 337, name: 'Disney+',      color: '#113CCF', logo: 'https://image.tmdb.org/t/p/original/dgPueyEdOwpQ10fjuhL2WYFQwQs.png' },
        max:       { id: 1899,name: 'Max',          color: '#002BE7', logo: 'https://image.tmdb.org/t/p/original/aS2zvJWn9mBPyGJ75gNqJsT5Lg1.png' },
        paramount: { id: 531, name: 'Paramount+',   color: '#0064FF', logo: 'https://image.tmdb.org/t/p/original/h5DcR0a1hxNhP9IlOeVZIo6rH9U.png' },
        apple:     { id: 350, name: 'Apple TV+',    color: '#1D1D1F', logo: 'https://image.tmdb.org/t/p/original/2E03IAJd4e3l8PYCJ1qKLVg1dkX.png' },
        crunchyroll:{id: 283, name: 'Crunchyroll',  color: '#F47521', logo: 'https://image.tmdb.org/t/p/original/8aRrW5j4qKjL8e1y3p6qW8s5dX2.png' },
        loke:      { id: 73,  name: 'Looke',        color: '#1E3A8A', logo: 'https://image.tmdb.org/t/p/original/3VxDqUk15KM4O6gK7E5Ygk5Vf8A.png' }
    },

    TMDB_TO_KEY: {
        8: 'netflix', 119: 'prime', 337: 'disney', 1899: 'max',
        531: 'paramount', 350: 'apple', 283: 'crunchyroll', 73: 'loke'
    }
};
