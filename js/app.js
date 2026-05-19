document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 CineRadar iniciando...');
    console.log('TMDB_KEY configurada:', CONFIG.TMDB_API_KEY && !CONFIG.TMDB_API_KEY.includes('SUA_') && !CONFIG.TMDB_API_KEY.includes('COLE_') ? 'SIM ✅' : 'NÃO ❌ - Cole em js/config.js');

    Navbar.render();
    FooterNav.render();
    Router.init();
});

window.MovieCard = MovieCard;
window.Router = Router;
window.SearchPage = SearchPage;
window.ExplorePage = ExplorePage;
window.MyListPage = MyListPage;
window.HomePage = HomePage;
window.DetailsPage = DetailsPage;
window.Player = Player;
