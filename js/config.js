// ==========================================
// CONFIG - SEM CHAVES EXPOSTAS!
// ==========================================
// As chaves ficam apenas no servidor Vercel (Environment Variables)
// O frontend chama o proxy /api/onde-assistir.js que faz as requisições

const CONFIG = {
    // SEM API KEYS AQUI! 🛡️
    // As chaves estão seguras no servidor Vercel

    // URL base da API (proxy seguro)
    API_BASE: window.location.origin.includes('localhost') 
        ? 'http://localhost:3000/api'  // Desenvolvimento local
        : '/api',                       // Produção Vercel

    TMDB_IMAGE_URL: 'https://image.tmdb.org/t/p',
    REGION: 'BR',
    LANGUAGE: 'pt-BR',

    // Player embed
    PLAYER_BASE_URL: 'https://myembed.biz',

    // Providers
    PROVIDERS: {
        netflix: { id: 8, name: 'Netflix', color: '#E50914' },
        prime: { id: 119, name: 'Prime Video', color: '#00A8E1' },
        disney: { id: 337, name: 'Disney+', color: '#113CCF' },
        max: { id: 1899, name: 'Max', color: '#002BE7' },
        paramount: { id: 531, name: 'Paramount+', color: '#0064FF' },
        apple: { id: 350, name: 'Apple TV+', color: '#1D1D1F' },
        crunchyroll: { id: 283, name: 'Crunchyroll', color: '#F47521' },
        loke: { id: 73, name: 'Looke', color: '#1E3A8A' }
    }
};
