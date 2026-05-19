// ==========================================
// FOOTER COMPONENT
// ==========================================

const Footer = {
    render() {
        const container = $('#footer-container');
        if (!container) return;

        container.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-grid">
                        <div class="footer-brand">
                            <div class="logo">
                                <i class="fas fa-play-circle"></i>
                                <span>CineRadar</span>
                            </div>
                            <p>Seu guia definitivo para descobrir onde assistir filmes, séries e animes online. 
                            Dados fornecidos pela TMDB.</p>
                        </div>
                        <div class="footer-links">
                            <h4>Navegação</h4>
                            <ul>
                                <li><a href="#/home">Início</a></li>
                                <li><a href="#/explore">Explorar</a></li>
                                <li><a href="#/calendar">Lançamentos</a></li>
                                <li><a href="#/mylist">Minha Lista</a></li>
                            </ul>
                        </div>
                        <div class="footer-links">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="#">Termos de Uso</a></li>
                                <li><a href="#">Privacidade</a></li>
                                <li><a href="#">DMCA</a></li>
                            </ul>
                        </div>
                        <div class="footer-links">
                            <h4>Tecnologia</h4>
                            <ul>
                                <li><a href="https://www.themoviedb.org/" target="_blank">TMDB API</a></li>
                                <li><a href="#">GitHub</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>© ${new Date().getFullYear()} CineRadar. Todos os direitos reservados.</p>
                        <div class="social-links">
                            <a href="#"><i class="fab fa-github"></i></a>
                            <a href="#"><i class="fab fa-twitter"></i></a>
                            <a href="#"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
};
