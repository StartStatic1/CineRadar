// ==========================================
// ROUTER - SPA Navigation
// ==========================================

const Router = {
    routes: {
        '#/home': () => HomePage.render(),
        '#/explore': () => {
            const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
            ExplorePage.render(params);
        },
        '#/search': () => SearchPage.render(),
        '#/mylist': () => MyListPage.render(),
        '#/calendar': () => CalendarPage.render(),
        '#/details/:type/:id': (params) => DetailsPage.render(params.type, params.id)
    },

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());

        // Handle links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#/"]');
            if (link) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    },

    handleRoute() {
        const hash = window.location.hash || '#/home';
        const [path, queryString] = hash.split('?');

        // Match dynamic routes
        let matched = false;

        for (const route in this.routes) {
            if (route.includes(':')) {
                const routeParts = route.split('/');
                const pathParts = path.split('/');

                if (routeParts.length === pathParts.length) {
                    const params = {};
                    let match = true;

                    for (let i = 0; i < routeParts.length; i++) {
                        if (routeParts[i].startsWith(':')) {
                            params[routeParts[i].substring(1)] = pathParts[i];
                        } else if (routeParts[i] !== pathParts[i]) {
                            match = false;
                            break;
                        }
                    }

                    if (match) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        this.routes[route](params);
                        Navbar.updateActive();
                        matched = true;
                        break;
                    }
                }
            } else if (path === route || (route === '#/home' && path === '')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                this.routes[route]();
                Navbar.updateActive();
                matched = true;
                break;
            }
        }

        if (!matched) {
            HomePage.render();
        }
    },

    navigate(hash) {
        if (window.location.hash !== hash) {
            window.location.hash = hash;
        } else {
            this.handleRoute();
        }
    },

    refresh() {
        this.handleRoute();
    }
};
