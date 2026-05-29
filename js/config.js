// ==========================================
// CONFIG - Chaves vem do servidor (Vercel)
// ==========================================
// NAO cole chaves aqui. Configure em:
// Vercel Dashboard -> Settings -> Environment Variables

const CONFIG = {
    PROXY_TMDB: '/api/tmdb',
    PROXY_WATCHMODE: '/api/watchmode',
    PROXY_OMDB: '/api/omdb',

    TMDB_IMAGE_URL: 'https://image.tmdb.org/t/p',
    REGION: 'BR',
    LANGUAGE: 'pt-BR',

    // ===== PLAYERS FUNCIONAIS (4 fontes) =====
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
            id: 'megaembed',
            name: 'MegaEmbed',
            icon: 'fa-play-circle',
            color: '#00ff88',
            getUrl: (id, type, season, episode) => {
                if (type === 'movie') return `https://megaembedapi.site/embed/${id}`;
                if (season && episode) return `https://megaembedapi.site/embed/${id}/${season}/${episode}`;
                return `https://megaembedapi.site/embed/${id}`;
            }
        }
    ],

    FALLBACKS: {
        netflix:    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0U1MDkxNCIgcng9IjEyIi8+PHRleHQgeD0iNTAiIHk9IjY4IiBmb250LXNpemU9IjQyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIj5ORjwvdGV4dD48L3N2Zz4=",
        prime:      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwQThFMSIgcng9IjEyIi8+PHRleHQgeD0iNTAiIHk9IjY4IiBmb250LXNpemU9IjQyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIj5QVjwvdGV4dD48L3N2Zz4=",
        disney:     "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzExM0NDRiIgcng9IjEyIi8+PHRleHQgeD0iNTAiIHk9IjY4IiBmb250LXNpemU9IjQyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIj5EKzwvdGV4dD48L3N2Zz4=",
        max:        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMkJFNyIgcng9IjEyIi8+PHRleHQgeD0iNTAiIHk9IjY4IiBmb250LXNpemU9IjQyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIj5NWDwvdGV4dD48L3N2Zz4=",
        paramount:  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwNjRGRiIgcng9IjEyIi8+PHRleHQgeD0iNTAiIHk9IjY4IiBmb250LXNpemU9IjQyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIj5QKzwvdGV4dD48L3N2Zz4=",
        apple:      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFEMUQxRiIgcng9IjEyIi8+PHRleHQgeD0iNTAiIHk9IjY4IiBmb250LXNpemU9IjQyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIj5BKzwvdGV4dD48L3N2Zz4=",
        crunchyroll:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0Y0NzUyMSIgcng9IjEyIi8+PHRleHQgeD0iNTAiIHk9IjY4IiBmb250LXNpemU9IjQyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIj5DUjwvdGV4dD48L3N2Zz4=",
        loke:       "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFFM0E4QSIgcng9IjEyIi8+PHRleHQgeD0iNTAiIHk9IjY4IiBmb250LXNpemU9IjQyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIj5MSzwvdGV4dD48L3N2Zz4=",
        globoplay:  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0VEM0I4NSIgcng9IjEyIi8+PHRleHQgeD0iNTAiIHk9IjY4IiBmb250LXNpemU9IjQyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIj5HTDwvdGV4dD48L3N2Zz4=",
        youtube:    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0ZGMDAwMCIgcng9IjEyIi8+PHRleHQgeD0iNTAiIHk9IjY4IiBmb250LXNpemU9IjQyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIj5ZVDwvdGV4dD48L3N2Zz4="
    },

    PROVIDERS: {
        netflix:   { id: 8,   name: 'Netflix',      color: '#E50914', logo: 'https://cdn.watchmode.com/logos/203_logo_100px.jpg', fallbackKey: 'netflix' },
        prime:     { id: 119, name: 'Prime Video',  color: '#00A8E1', logo: 'https://cdn.watchmode.com/logos/26_logo_100px.jpg', fallbackKey: 'prime' },
        disney:    { id: 337, name: 'Disney+',      color: '#113CCF', logo: 'https://cdn.watchmode.com/logos/372_logo_100px.jpg', fallbackKey: 'disney' },
        max:       { id: 1899,name: 'Max',          color: '#002BE7', logo: 'https://cdn.watchmode.com/logos/387_logo_100px.jpg', fallbackKey: 'max' },
        paramount: { id: 531, name: 'Paramount+',   color: '#0064FF', logo: 'https://cdn.watchmode.com/logos/531_logo_100px.jpg', fallbackKey: 'paramount' },
        apple:     { id: 350, name: 'Apple TV+',    color: '#1D1D1F', logo: 'https://cdn.watchmode.com/logos/371_logo_100px.jpg', fallbackKey: 'apple' },
        crunchyroll:{id: 283, name: 'Crunchyroll',  color: '#F47521', logo: 'https://cdn.watchmode.com/logos/283_logo_100px.jpg', fallbackKey: 'crunchyroll' },
        loke:      { id: 73,  name: 'Looke',        color: '#1E3A8A', logo: 'https://cdn.watchmode.com/logos/73_logo_100px.jpg', fallbackKey: 'loke' },
        globoplay: { id: 307, name: 'Globoplay',    color: '#ED3B85', logo: 'https://cdn.watchmode.com/logos/307_logo_100px.jpg', fallbackKey: 'globoplay' },
        youtube:   { id: 192, name: 'YouTube',      color: '#FF0000', logo: 'https://cdn.watchmode.com/logos/192_logo_100px.jpg', fallbackKey: 'youtube' }
    },

    TMDB_TO_KEY: {
        8: 'netflix', 119: 'prime', 337: 'disney', 1899: 'max',
        531: 'paramount', 350: 'apple', 283: 'crunchyroll', 73: 'loke',
        307: 'globoplay', 192: 'youtube'
    },

    GENRES: {
        ACTION: 28, ADVENTURE: 12, ANIMATION: 16, COMEDY: 35, CRIME: 80,
        DOCUMENTARY: 99, DRAMA: 18, FAMILY: 10751, FANTASY: 14, HISTORY: 36,
        HORROR: 27, MUSIC: 10402, MYSTERY: 9648, ROMANCE: 10749, SCIFI: 878,
        THRILLER: 53, WAR: 10752, WESTERN: 37
    }
};

function getProviderFallback(key) {
    const p = CONFIG.PROVIDERS[key];
    if (!p) return '';
    return CONFIG.FALLBACKS[p.fallbackKey] || '';
}