const MovieCard = {
    render(item, opts = {}) {
        const { showNumber, big = false } = opts;
        const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        const title = item.title || item.name || 'Sem título';
        const rating = formatRating(item.vote_average);
        const year = (item.release_date || item.first_air_date || '').substring(0, 4);
        const poster = getImageUrl(item.poster_path, big ? 'w500' : 'w342');
        const isList = Storage.isInList(item.id, type);
        const isWatched = Storage.isWatched(item.id, type);

        if (big) {
            return `
                <div class="big-card" onclick="Router.navigate('#/details/${type}/${item.id}')">
                    <img src="${getImageUrl(item.backdrop_path || item.poster_path, 'w780')}" alt="${title}" loading="lazy">
                    <div class="big-card-info">
                        <div class="big-card-title">${title}</div>
                        <div class="big-card-meta">
                            <span style="color:var(--warning)"><i class="fas fa-star"></i> ${rating}</span>
                            <span>${year}</span>
                            <span class="badge badge-blue" style="font-size:0.7rem;padding:2px 8px">${type === 'movie' ? 'Filme' : 'Série'}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="carousel-item" onclick="Router.navigate('#/details/${type}/${item.id}')">
                <div class="poster-wrapper">
                    <img src="${poster}" alt="${title}" loading="lazy">
                    ${year ? `<span class="year-badge">${year}</span>` : ''}
                    <div class="poster-overlay">
                        <div class="card-actions" onclick="event.stopPropagation()">
                            <button class="${isList ? 'active' : ''}" onclick="MovieCard.toggleList(event, ${item.id}, '${type}', '${title.replace(/'/g, "\'")}', '${item.poster_path || ''}')" title="${isList ? 'Remover' : 'Salvar'}">
                                <i class="fas ${isList ? 'fa-check' : 'fa-plus'}"></i>
                            </button>
                            <button class="${isWatched ? 'active' : ''}" onclick="MovieCard.toggleWatched(event, ${item.id}, '${type}', '${title.replace(/'/g, "\'")}', '${item.poster_path || ''}')" title="${isWatched ? 'Não assistido' : 'Assistido'}">
                                <i class="fas ${isWatched ? 'fa-eye-slash' : 'fa-eye'}"></i>
                            </button>
                        </div>
                    </div>
                    ${showNumber ? `<div class="top-number">${showNumber}</div>` : ''}
                </div>
                <div class="card-info">
                    <div class="card-title" title="${title}">${title}</div>
                    <div class="card-meta">
                        <span class="card-rating"><i class="fas fa-star"></i> ${rating}</span>
                        <span>${year}</span>
                    </div>
                </div>
            </div>
        `;
    },

    toggleList(e, id, type, title, poster) {
        e.stopPropagation();
        if (Storage.isInList(id, type)) Storage.removeFromList(id, type);
        else Storage.addToList({ id, type, title, poster_path: poster });
        Router.refresh();
    },

    toggleWatched(e, id, type, title, poster) {
        e.stopPropagation();
        Storage.toggleWatched(id, type, title, poster);
        Router.refresh();
    }
};
