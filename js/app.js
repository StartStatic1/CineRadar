// ==========================================
// APP INIT
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    Navbar.render();
    Footer.render();
    Router.init();

    // Check API Key
    if (!CONFIG.TMDB_API_KEY) {
        console.log('CineRadar: API Key não configurada. Aguardando configuração do usuário.');
    }
});

// Expose functions globally for onclick handlers
window.MovieCard = MovieCard;
window.Router = Router;
window.SearchPage = SearchPage;
window.ExplorePage = ExplorePage;
window.MyListPage = MyListPage;
window.HomePage = HomePage;
window.DetailsPage = DetailsPage;
window.Navbar = Navbar;
