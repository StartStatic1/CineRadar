document.addEventListener('DOMContentLoaded', () => {
    console.log('CineRadar iniciando...');
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
window.CalendarPage = CalendarPage;
window.ReelsPage = ReelsPage;
window.ActorPage = ActorPage;
