# 🎬 CineRadar

App de streaming guide brasileiro — descubra onde assistir filmes e séries. Inspirado no **IndicaAí**.

---

## ✨ Funcionalidades

| Feature | Descrição |
|---------|-----------|
| 🏠 **Home** | Hero dinâmico, seções por streaming (Netflix, Prime, Disney+...), trending, lançamentos |
| 🔍 **Busca** | Busca multi (filmes, séries, atores) com filtros |
| 📺 **Detalhes** | Sinopse, elenco clicável, onde assistir (TMDB + Watchmode), trailers, temporadas |
| 👤 **Ator** | Perfil completo com biografia e filmografia (TMDB `movie_credits,tv_credits`) |
| 🎞️ **Reels** | Trailers oficiais do YouTube em scroll vertical (estilo TikTok/Reels) |
| 📅 **Lançamentos** | Próximas estreias de filmes e séries |
| 📑 **Minha Lista** | Salvos + assistidos, organizados por data |
| ▶️ **Player** | 6 fontes de embed no rodapé (BetterFlix, EmbedPlay, MyEmbed, SuperFlix, VidSrc, Embed.Su) |
| 🌐 **OMDb** | Enriquecimento de dados (Awards, Rated, sinopse completa) |

---

## 🚀 Deploy na Vercel

### 1. Fork / Clone

```bash
git clone https://github.com/seu-user/cineradar.git
cd cineradar
```

### 2. Environment Variables

No **Vercel Dashboard → Settings → Environment Variables**, adicione:

| Variable | Onde Pegar |
|----------|-----------|
| `TMDB_API_KEY` | [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) |
| `WATCHMODE_API_KEY` | [watchmode.com](https://www.watchmode.com/) |
| `OMDB_API_KEY` | [omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx) |

### 3. Deploy

```bash
npm i -g vercel
vercel --prod
```

Ou conecte o repo no [Vercel Dashboard](https://vercel.com/dashboard).

---

## 📁 Estrutura de Arquivos

```
/
├── api/
│   ├── tmdb.js          # Proxy TMDB (seguro)
│   ├── watchmode.js     # Proxy Watchmode (seguro)
│   └── omdb.js          # Proxy OMDb (seguro)
├── css/
│   ├── base.css         # Variáveis, reset
│   ├── layout.css       # Navbar, footer, hero
│   ├── components.css   # Cards, carousels, botões
│   ├── pages.css        # Páginas específicas
│   ├── responsive.css   # Media queries
│   ├── player.css       # Player modal + sources bar
│   └── fixes.css        # Correções de UI
├── js/
│   ├── config.js        # Config + providers + players
│   ├── api.js           # Métodos de API
│   ├── utils.js         # Helpers (formatDate, getImageUrl...)
│   ├── storage.js       # localStorage (lista, histórico)
│   ├── router.js        # Hash router SPA
│   ├── app.js           # Bootstrap
│   ├── loader.js        # Loading spinner
│   ├── navbar.js        # Header
│   ├── footerNav.js     # Bottom nav
│   ├── movieCard.js     # Card de filme/série
│   ├── carousel.js      # Componente carousel
│   ├── player.js        # Modal player + 6 fontes
│   ├── home.js          # Página inicial
│   ├── explore.js       # Explorar por gênero/provider
│   ├── search.js        # Busca
│   ├── details.js       # Página de detalhes
│   ├── calendar.js      # Lançamentos
│   ├── myList.js        # Minha lista
│   ├── actor.js         # Perfil do ator
│   └── reels.js         # Trailers verticais
├── index.html           # Entry point
├── vercel.json          # Rewrites + headers
└── manifest.json        # PWA manifest
```

---

## 🔌 APIs Utilizadas

| API | Uso |
|-----|-----|
| **TMDB** | Dados de filmes, séries, atores, imagens, providers |
| **Watchmode** | Onde assistir, preços, links oficiais |
| **OMDb** | Sinopse extendida, classificação, prêmios |
| **YouTube (embed)** | Trailers e teasers para Reels |

---

## 🎮 Players Embed (6 fontes)

Quando clica em **Assistir**, abre modal com barra no rodapé para escolher:

1. **BetterFlix** — `betterflix.click`
2. **EmbedPlay** — `embedplayapi.top`
3. **MyEmbed** — `myembed.biz`
4. **SuperFlix** — `superflixapi.best`
5. **VidSrc** — `vidsrc.cc`
6. **Embed.Su** — `embed.su`

A última fonte usada é salva no `localStorage`.

---

## 🛡️ Segurança

- **Nenhuma API key exposta no frontend**
- Todas as chamadas passam por proxies serverless na Vercel
- Keys ficam apenas em **Environment Variables**

---

## 📝 TODO / Melhorias Futuras

- [ ] PWA offline (service worker + cache)
- [ ] Notificações push de lançamentos
- [ ] Autenticação (Supabase/Firebase) para lista na nuvem
- [ ] Dark/light mode toggle
- [ ] Filtros avançados (ano, nota, duração)
- [ ] Reviews do TMDB/IMDb
- [ ] Similar titles mais inteligente

---

## 📄 Licença

MIT — uso livre para fins educacionais.

> ⚠️ Este app é um **guia de streaming** (onde assistir legalmente). Os players embed são de terceiros e não hospedamos conteúdo.
