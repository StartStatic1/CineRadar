// ==========================================
// CONFIG - Chaves vem do servidor (Vercel)
// ==========================================
// NÃO cole chaves aqui. Configure em:
// Vercel Dashboard → Settings → Environment Variables

const CONFIG = {
    PROXY_TMDB: '/api/tmdb',
    PROXY_WATCHMODE: '/api/watchmode',
    PROXY_OMDB: '/api/omdb',

    TMDB_IMAGE_URL: 'https://image.tmdb.org/t/p',
    REGION: 'BR',
    LANGUAGE: 'pt-BR',

    // ===== PLAYERS (múltiplas fontes como IndicaAí) =====
    PLAYERS: [
        {
            id: 'betterflix',
            name: 'BetterFlix',
            icon: 'fa-bolt',
            color: '#E50914',
            getUrl: (id, type, season, episode) => {
                if (type === 'movie') return `https://betterflix.click/api/player?id=${id}&type=movie`;
                if (season && episode) return `https://betterflix.click/api/player?id=${id}&type=tv&season=${season}&episode=${episode}`;
                return `https://betterflix.click/api/player?id=${id}&type=tv`;
            }
        },
        {
            id: 'embedplay',
            name: 'EmbedPlay',
            icon: 'fa-play-circle',
            color: '#00A8E1',
            getUrl: (id, type, season, episode) => {
                if (type === 'movie') return `https://embedplayapi.top/embed/${id}`;
                if (season && episode) return `https://embedplayapi.top/embed/${id}/${season}/${episode}`;
                return `https://embedplayapi.top/embed/${id}`;
            }
        },
        {
            id: 'myembed',
            name: 'MyEmbed',
            icon: 'fa-film',
            color: '#F47521',
            getUrl: (id, type, season, episode) => {
                if (type === 'movie') return `https://myembed.biz/filme/${id}`;
                if (season && episode) return `https://myembed.biz/serie/${id}/${season}/${episode}`;
                return `https://myembed.biz/serie/${id}`;
            }
        },
        {
            id: 'superflix',
            name: 'SuperFlix',
            icon: 'fa-star',
            color: '#6366f1',
            getUrl: (id, type, season, episode) => {
                if (type === 'movie') return `https://superflixapi.best/filme/${id}`;
                if (season && episode) return `https://superflixapi.best/serie/${id}/${season}/${episode}`;
                return `https://superflixapi.best/serie/${id}`;
            }
        },
        {
            id: 'vidsrc',
            name: 'VidSrc',
            icon: 'fa-tv',
            color: '#10b981',
            getUrl: (id, type, season, episode) => {
                const t = type === 'movie' ? 'movie' : 'tv';
                if (type === 'movie') return `https://vidsrc.cc/v2/embed/${t}/${id}`;
                if (season && episode) return `https://vidsrc.cc/v2/embed/${t}/${id}/${season}/${episode}`;
                return `https://vidsrc.cc/v2/embed/${t}/${id}`;
            }
        },
        {
            id: 'embedsu',
            name: 'Embed.Su',
            icon: 'fa-globe',
            color: '#8b5cf6',
            getUrl: (id, type, season, episode) => {
                const t = type === 'movie' ? 'movie' : 'tv';
                if (type === 'movie') return `https://embed.su/embed/${t}/${id}`;
                if (season && episode) return `https://embed.su/embed/${t}/${id}/${season}/${episode}`;
                return `https://embed.su/embed/${t}/${id}`;
            }
        }
    ],

    // Providers com logos oficiais (CDN JustWatch/Watchmode) + fallbacks
    PROVIDERS: {
        netflix:   { id: 8,   name: 'Netflix',      color: '#E50914', logo: 'https://cdn.watchmode.com/logos/203_logo_100px.jpg', fallbackLogo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
        prime:     { id: 119, name: 'Prime Video',  color: '#00A8E1', logo: 'https://cdn.watchmode.com/logos/26_logo_100px.jpg', fallbackLogo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png' },
        disney:    { id: 337, name: 'Disney+',      color: '#113CCF', logo: 'https://cdn.watchmode.com/logos/372_logo_100px.jpg', fallbackLogo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg' },
        max:       { id: 1899,name: 'Max',          color: '#002BE7', logo: 'https://cdn.watchmode.com/logos/387_logo_100px.jpg', fallbackLogo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg' },
        paramount: { id: 531, name: 'Paramount+',   color: '#0064FF', logo: 'https://cdn.watchmode.com/logos/531_logo_100px.jpg', fallbackLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Paramount%2B_logo.svg' },
        apple:     { id: 350, name: 'Apple TV+',    color: '#1D1D1F', logo: 'https://cdn.watchmode.com/logos/371_logo_100px.jpg', fallbackLogo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg' },
        crunchyroll:{id: 283, name: 'Crunchyroll',  color: '#F47521', logo: 'https://cdn.watchmode.com/logos/283_logo_100px.jpg', fallbackLogo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_logo.svg' },
        loke:      { id: 73,  name: 'Looke',        color: '#1E3A8A', logo: 'https://cdn.watchmode.com/logos/73_logo_100px.jpg', fallbackLogo: '' },
        globoplay: { id: 307, name: 'Globoplay',    color: '#ED3B85', logo: 'https://cdn.watchmode.com/logos/307_logo_100px.jpg', fallbackLogo: '' },
        youtube:   { id: 192, name: 'YouTube',      color: '#FF0000', logo: 'https://cdn.watchmode.com/logos/192_logo_100px.jpg', fallbackLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png' }
    },

    // Mapeamento TMDB provider_id → nossa chave
    TMDB_TO_KEY: {
        8: 'netflix', 119: 'prime', 337: 'disney', 1899: 'max',
        531: 'paramount', 350: 'apple', 283: 'crunchyroll', 73: 'loke',
        307: 'globoplay', 192: 'youtube'
    }
};
