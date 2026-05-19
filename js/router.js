const Router = {
    routes: {
        '#/home': () => HomePage.render(),
        '#/explore': () => ExplorePage.render(),
        '#/search': () => SearchPage.render(),
        '#/mylist': () => MyListPage.render(),
        '#/calendar': () => CalendarPage.render(),
        '#/reels': () => ReelsPage.render(),
        '#/actor/:id': (p) => ActorPage.render(p.id),
        '#/details/:type/:id': (p) => DetailsPage.render(p.type, p.id)
    },

    init() {
        window.addEventListener('hashchange', () => this.handle());
        window.addEventListener('load', () => this.handle());
        document.addEventListener('click', e => {
            const link = e.target.closest('a[href^="#/"]');
            if (link) { e.preventDefault(); this.navigate(link.getAttribute('href')); }
        });
    },

    handle() {
        const hash = window.location.hash || '#/home';
        const [path] = hash.split('?');
        let matched = false;

        for (const route in this.routes) {
            if (route.includes(':')) {
                const rp = route.split('/'), pp = path.split('/');
                if (rp.length === pp.length) {
                    const params = {}; let ok = true;
                    for (let i = 0; i < rp.length; i++) {
                        if (rp[i].startsWith(':')) params[rp[i].slice(1)] = pp[i];
                        else if (rp[i] !== pp[i]) { ok = false; break; }
                    }
                    if (ok) { window.scrollTo(0, 0); this.routes[route](params); FooterNav.render(); matched = true; break; }
                }
            } else if (path === route || (route === '#/home' && path === '')) {
                window.scrollTo(0, 0); this.routes[route](); FooterNav.render(); matched = true; break;
            }
        }
        if (!matched) { HomePage.render(); FooterNav.render(); }
    },

    navigate(h) {
        if (window.location.hash !== h) window.location.hash = h;
        else this.handle();
    },

    refresh() { this.handle(); }
};
