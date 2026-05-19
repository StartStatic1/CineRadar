const Navbar = {
    render() {
        const c = $('#navbar-container');
        if (!c) return;
        c.innerHTML = `
            <nav class="navbar">
                <a href="#/home" class="logo"><i class="fas fa-radar"></i><span>CineRadar</span></a>
                <div class="nav-actions">
                    <a href="#/search" class="search-trigger"><i class="fas fa-search"></i></a>
                </div>
            </nav>
        `;
    }
};
