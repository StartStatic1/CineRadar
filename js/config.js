// ==========================================
// CONFIGURAÇÃO - COLOQUE SUA API KEY AQUI
// ==========================================
const CONFIG = {
    // Obtenha sua API Key gratuita em: https://www.themoviedb.org/settings/api
    TMDB_API_KEY: localStorage.getItem('tmdb_api_key') || '',
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_URL: 'https://image.tmdb.org/t/p',
    REGION: 'BR',
    LANGUAGE: 'pt-BR',

    // Mapeamento de provedores de streaming no Brasil (IDs TMDB)
    PROVIDERS: {
        netflix: { id: 8, name: 'Netflix', color: '#E50914' },
        prime: { id: 119, name: 'Prime Video', color: '#00A8E1' },
        disney: { id: 337, name: 'Disney+', color: '#113CCF' },
        max: { id: 1899, name: 'Max', color: '#002BE7' },
        paramount: { id: 531, name: 'Paramount+', color: '#0064FF' },
        apple: { id: 350, name: 'Apple TV+', color: '#1D1D1F' },
        globoplay: { id: 1293, name: 'Globoplay', color: '#FC363B' },
        crunchyroll: { id: 283, name: 'Crunchyroll', color: '#F47521' },
        starplus: { id: 619, name: 'Star+', color: '#FF0066' }
    }
};

// Helper para atualizar API key
function setApiKey(key) {
    CONFIG.TMDB_API_KEY = key;
    localStorage.setItem('tmdb_api_key', key);
}
