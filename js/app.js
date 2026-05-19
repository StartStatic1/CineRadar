document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 CineRadar iniciando...');
    console.log('API_BASE:', CONFIG.API_BASE);
    console.log('TMDB_KEY configurada:', CONFIG.TMDB_API_KEY ? 'SIM' : 'NÃO (usando proxy)');

    Navbar.render();
    FooterNav.render();
    Router.init();

    // Teste rápido de conectividade
    fetch(CONFIG.API_BASE + '/onde-assistir.js?endpoint=trending&type=movie&page=1')
        .then(r => console.log('✅ Proxy OK:', r.status))
        .catch(e => console.log('⚠️ Proxy indisponível:', e.message));
});

window.MovieCard = MovieCard;
window.Router = Router;
window.SearchPage = SearchPage;
window.ExplorePage = ExplorePage;
window.MyListPage = MyListPage;
window.HomePage = HomePage;
window.DetailsPage = DetailsPage;
window.Player = Player;
