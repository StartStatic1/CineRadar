const FooterNav = {
    render() {
        const c = document.getElementById('footer-container');
        if (!c) return;
        const route = window.location.hash || '#/home';

        const items = [
            { path: '#/home', icon: 'fa-home', label: 'Inicio' },
            { path: '#/explore', icon: 'fa-compass', label: 'Explorar' },
            { path: '#/iptv', icon: 'fa-tv', label: 'TV' },
            { path: '#/reels', icon: 'fa-film', label: 'Reels' },
            { path: '#/mylist', icon: 'fa-bookmark', label: 'Minha Lista' },
            { path: '#/search', icon: 'fa-search', label: 'Buscar' }
        ];

        c.innerHTML = `
            <nav class="footer-nav">
                ${items.map(item => `
                    <a href="${item.path}" class="footer-nav-item ${route.includes(item.path.replace('#/', '')) ? 'active' : ''}">
                        <div class="footer-nav-icon"><i class="fas ${item.icon}"></i></div>
                        <span class="footer-nav-label">${item.label}</span>
                    </a>
                `).join('')}
            </nav>
        `;

        // === BOTAO DE ADS ===
        const inject = () => {
            if (window.CineAds) {
                window.CineAds.injectSupportButton();
            }
        };
        inject();
        if (!window.CineAds) {
            setTimeout(inject, 500);
        }
    }
};