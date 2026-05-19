const Carousel = {
    render(title, items, opts = {}) {
        const { icon = 'film', link = null, big = false, showNumbers = false } = opts;
        if (!items || !items.length) return '';

        const cards = items.map((item, i) => MovieCard.render(item, { 
            showNumber: showNumbers ? i + 1 : null, 
            big 
        })).join('');

        return `
            <div class="carousel-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-${icon}"></i> ${title}</h2>
                    ${link ? `<a href="${link}" class="section-link">Ver todos <i class="fas fa-chevron-right"></i></a>` : ''}
                </div>
                <div class="carousel-container">
                    ${cards}
                </div>
            </div>
        `;
    }
};
