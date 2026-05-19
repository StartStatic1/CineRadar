// ==========================================
// MOVIE CARD COMPONENT
// ==========================================

const MovieCard = {
    render(item, options = {}) {
        const { showNumber, lazy = true } = options;
        const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        const title = item.title || item.name || 'Título desconhecido';
        const rating = formatRating(item.vote_average);
        const year = (item.release_date || item.first_air_date || '').substring(0, 4);
        const poster = getImageUrl(item.poster_path, 'w342');
        const isList = Storage.isInList(item.id, type);
        const isWatched = Storage.isWatched(item.id, type);

        const numberBadge = showNumber ? `<div class="top-number">${showNumber}</div>` : '';

        return `
            <div class="movie-card" onclick="Router.navigate('#/details/${type}/${item.id}')">
                <div class="poster-wrapper">
                    <img src="${poster}" alt="${title}" ${lazy ? 'loading="lazy"' : ''}>
                    <div class="poster-overlay">
                        <div class="card-actions" onclick="event.stopPropagation()">
                            <button class="${isList ? 'active' : ''}" 
                                onclick="MovieCard.toggleList(event, ${item.id}, '${type}', '${title.replace(/'/g, "\'")}', '${item.poster_path || ''}')"
                                title="${isList ? 'Remover da lista' : 'Adicionar à lista'}">
                                <i class="fas ${isList ? 'fa-check' : 'fa-plus'}"></i>
                            </button>
                            <button class="${isWatched ? 'active' : ''}"
                                onclick="MovieCard.toggleWatched(event, ${item.id}, '${type}', '${title.replace(/'/g, "\'")}', '${item.poster_path || ''}')"
                                title="${isWatched ? 'Marcar como não assistido' : 'Marcar como assistido'}">
                                <i class="fas ${isWatched ? 'fa-eye-slash' : 'fa-eye'}"></i>
                            </button>
                        </div>
                    </div>
                    ${numberBadge}
                </div>
                <div class="card-info">
                    <div class="card-title" title="${title}">${title}</div>
                    <div class="card-meta">
                        <span class="card-rating">
                            <i class="fas fa-star"></i> ${rating}
                        </span>
                        <span class="card-year">${year}</span>
                    </div>
                </div>
            </div>
        `;
    },

    toggleList(event, id, type, title, posterPath) {
        event.stopPropagation();
        if (Storage.isInList(id, type)) {
            Storage.removeFromList(id, type);
        } else {
            Storage.addToList({ id, type, title, poster_path: posterPath });
        }
        Router.refresh();
    },

    toggleWatched(event, id, type, title, posterPath) {
        event.stopPropagation();
        Storage.toggleWatched(id, type, title, posterPath);
        Router.refresh();
    }
};
