// ==========================================
// CONFIG - API Keys
// ==========================================
// 
// MODO VERCEL (recomendado):
// 1. Vá em Project Settings > Environment Variables
// 2. Adicione: TMDB_API_KEY = sua_chave
// 3. A Vercel injeta automaticamente no servidor
//
// MODO LOCAL/DESENVOLVIMENTO:
// Se quiser testar local sem o proxy, descomente e preencha:
// const LOCAL_TMDB_KEY = 'sua_chave_aqui';

const LOCAL_TMDB_KEY = ''; // Deixe vazio para usar proxy

const CONFIG = {
    // TMDB API Key - usa local se preenchido, senão espera do servidor
    TMDB_API_KEY: LOCAL_TMDB_KEY || (typeof process !== 'undefined' && process.env?.TMDB_API_KEY) || '',

    // URLs
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_URL: 'https://image.tmdb.org/t/p',
    API_BASE: window.location.origin.includes('localhost') ? 'http://localhost:3000/api' : '/api',
    REGION: 'BR',
    LANGUAGE: 'pt-BR',

    // Player
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
