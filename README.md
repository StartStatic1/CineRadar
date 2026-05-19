# 🎬 CineRadar - Guia de Streaming

> O seu Guia de Streaming definitivo para saber onde assistir filmes, séries e animes online.

![TMDB](https://img.shields.io/badge/Powered%20by-TMDB-01b4e4?logo=themoviedatabase)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Funcionalidades

- 🎬 **Catálogo Completo** - Explore milhares de filmes e séries via API do TMDB
- 🔥 **Trending & Top 10** - Veja o que está em alta mundialmente
- 📅 **Calendário de Lançamentos** - Fique por dentro das próximas estreias
- 📺 **Onde Assistir** - Descubra em qual streaming o título está disponível (Netflix, Prime Video, Disney+, Max, Paramount+, etc)
- ⭐ **Minha Lista** - Organize seus favoritos e marque o que já assistiu
- 🔍 **Busca Avançada** - Encontre filmes e séries por nome
- 📱 **Responsivo** - Interface adaptada para mobile, tablet e desktop
- ⚡ **SPA (Single Page Application)** - Navegação rápida sem recarregar a página

## 🚀 Como usar

### 1. Obtenha uma API Key do TMDB (Grátis)

1. Acesse [themoviedb.org](https://www.themoviedb.org/)
2. Crie uma conta gratuita
3. Vá em **Configurações → API**
4. Solicite uma chave de API (tipo "Developer")
5. Copie a chave

### 2. Configure o App

Ao abrir o app pela primeira vez, cole sua API Key no campo solicitado. Ela será salva no `localStorage` do seu navegador.

Alternativamente, edite o arquivo `js/config.js`:

```javascript
const CONFIG = {
    TMDB_API_KEY: 'sua_api_key_aqui',
    // ...
};
```

### 3. Execute localmente

Como é um app frontend puro (HTML/CSS/JS), você pode abrir diretamente:

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/cineradar-app.git
cd cineradar-app

# Abra no navegador (ou use um servidor local)
# Opção 1: Abrir index.html diretamente
open index.html

# Opção 2: Servidor local (recomendado)
npx serve .
# ou
python3 -m http.server 8000
```

> ⚠️ **Recomendação**: Use um servidor local para evitar problemas de CORS ao carregar imagens em alguns navegadores.

## 📁 Estrutura do Projeto

```
cineradar-app/
├── index.html              # Ponto de entrada
├── README.md               # Este arquivo
├── css/
│   ├── base.css            # Variáveis, reset, utilitários
│   ├── layout.css          # Navbar, footer, grids, sections
│   ├── components.css      # Buttons, cards, badges, loaders
│   ├── pages.css           # Estilos específicos de cada página
│   └── responsive.css      # Media queries
└── js/
    ├── config.js           # Configurações e mapeamento de providers
    ├── utils.js            # Helpers e formatação
    ├── storage.js          # LocalStorage (Minha Lista, Assistidos)
    ├── api.js              # Cliente da API TMDB
    ├── router.js           # Roteamento SPA
    ├── app.js              # Inicialização
    ├── components/
    │   ├── navbar.js       # Componente de navegação
    │   ├── movieCard.js    # Card de filme/série
    │   ├── providerBadge.js# Badge de streaming
    │   ├── footer.js       # Rodapé
    │   └── loader.js       # Loading spinner
    └── pages/
        ├── home.js         # Página inicial (hero, trending)
        ├── details.js      # Página de detalhes
        ├── search.js       # Busca com paginação
        ├── myList.js       # Minha lista pessoal
        ├── calendar.js     # Calendário de lançamentos
        └── explore.js      # Explorar por provider/tipo
```

## 🔌 APIs Utilizadas

- **[TMDB API v3](https://developer.themoviedb.org/)** - Dados de filmes, séries, elenco, trailers e provedores de streaming
- **YouTube Embed** - Exibição de trailers

## 🛠️ Tecnologias

- HTML5 Semântico
- CSS3 (Grid, Flexbox, Custom Properties, Scroll-snap)
- JavaScript Vanilla (ES6+)
- Font Awesome (ícones)
- Google Fonts (Inter)

## 📱 Screenshots

*(Adicione screenshots aqui)*

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto é open source sob licença MIT.

---

**Disclaimer**: Este produto usa a API do TMDB mas não é endossado ou certificado pelo TMDB. 
O CineRadar é apenas um guia/organizador e não hospeda nem transmite nenhum conteúdo audiovisual.
