// ==========================================
// NAVBAR COMPONENT
// ==========================================

const Navbar = {
    render() {
        const container = $('#navbar-container');
        if (!container) return;

        const currentRoute = window.location.hash || '#/home';

        container.innerHTML = `
            <nav class="navbar">
                <div class="container">
                    <a href="#/home" class="logo">
                        <i class="fas fa-play-circle"></i>
                        <span>CineRadar</span>
                    </a>

                    <ul class="nav-links" id="nav-links">
                        <li><a href="#/home" class="${currentRoute.includes('home') ? 'active' : ''}">
                            <i class="fas fa-home"></i> Início
                        </a></li>
                        <li><a href="#/explore" class="${currentRoute.includes('explore') ? 'active' : ''}">
                            <i class="fas fa-compass"></i> Explorar
                        </a></li>
                        <li><a href="#/calendar" class="${currentRoute.includes('calendar') ? 'active' : ''}">
                            <i class="fas fa-calendar-alt"></i> Lançamentos
                        </a></li>
                        <li><a href="#/mylist" class="${currentRoute.includes('mylist') ? 'active' : ''}">
                            <i class="fas fa-bookmark"></i> Minha Lista
                        </a></li>
                    </ul>

                    <div class="nav-actions">
                        <a href="#/search" class="search-trigger">
                            <i class="fas fa-search"></i>
                        </a>
                        <button class="mobile-toggle" onclick="Navbar.toggleMobile()">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </nav>
        `;

        // Scroll effect
        window.addEventListener('scroll', () => {
            const navbar = $('.navbar');
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });
    },

    toggleMobile() {
        const navLinks = $('#nav-links');
        if (navLinks) {
            navLinks.classList.toggle('active');
        }
    },

    updateActive() {
        const currentRoute = window.location.hash || '#/home';
        $$('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentRoute) {
                link.classList.add('active');
            }
        });
    }
};
