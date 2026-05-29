// ==========================================
// ROUTER — CineRadar
// ==========================================
// Rotas: #/, #/explore, #/search, #/details/:type/:id, #/calendar, 
//        #/mylist, #/actor/:id, #/reels, #/iptv

const Router = {
    routes: {
        '/': () => HomePage.render(document.getElementById('main-content')),
        '/explore': () => ExplorePage.render(document.getElementById('main-content')),
        '/search': () => SearchPage.render(document.getElementById('main-content')),
        '/calendar': () => CalendarPage.render(document.getElementById('main-content')),
        '/mylist': () => MyListPage.render(document.getElementById('main-content')),
        '/reels': () => ReelsPage.render(document.getElementById('main-content')),
        '/iptv': () => IPTV.render(document.getElementById('main-content')),
        '/details/:type/:id': (params) => DetailsPage.render(document.getElementById('main-content'), params.type, params.id),
        '/actor/:id': (params) => ActorPage.render(document.getElementById('main-content'), params.id),
    },

    currentPath: '',

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
    },

    navigate(path) {
        window.location.hash = path;
    },

    handleRoute() {
        const hash = window.location.hash.replace('#', '') || '/';
        const path = hash.split('?')[0];

        // Fecha player se estiver aberto
        Player.close();

        // Match de rota
        let matched = false;
        for (const [route, handler] of Object.entries(this.routes)) {
            const match = this.matchRoute(path, route);
            if (match) {
                this.currentPath = path;
                this.beforeRoute();
                handler(match);
                this.afterRoute();
                matched = true;
                break;
            }
        }

        if (!matched) {
            // 404 → Home
            this.navigate('#/');
        }
    },

    matchRoute(path, route) {
        // Rota exata
        if (route === path) return {};

        // Rota com parâmetros
        const routeParts = route.split('/');
        const pathParts = path.split('/');

        if (routeParts.length !== pathParts.length) return null;

        const params = {};
        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                params[routeParts[i].slice(1)] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
                return null;
            }
        }

        return params;
    },

    beforeRoute() {
        window.scrollTo(0, 0);
        // Esconde gate se estiver aberto
        const gate = document.getElementById('cine-gate-overlay');
        if (gate && gate.classList.contains('active')) {
            // Não esconde — gate tem prioridade
        }
    },

    afterRoute() {
        // Atualiza footer nav active state
        const footer = document.getElementById('footer-container');
        if (footer) {
            const links = footer.querySelectorAll('a');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && window.location.hash.includes(href.replace('#', ''))) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }
};

// Inicializa quando DOM pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Router.init());
} else {
    Router.init();
}