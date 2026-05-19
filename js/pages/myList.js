const MyListPage = {
    tab: 'all',

    render() {
        const main = $('#main-content');
        if (!main) return;

        const myList = Storage.getMyList();
        const watched = Storage.getWatched();
        let items = [];

        if (this.tab === 'all') {
            items = [...myList.map(i => ({...i, listType: 'watchlist'})), ...watched.map(i => ({...i, listType: 'watched'}))];
            items = items.filter((v, i, a) => a.findIndex(t => t.id === v.id && t.type === v.type) === i);
        } else if (this.tab === 'watchlist') {
            items = myList.map(i => ({...i, listType: 'watchlist'}));
        } else {
            items = watched.map(i => ({...i, listType: 'watched'}));
        }

        main.innerHTML = `
            <div class="mylist-page">
                <h1><i class="fas fa-bookmark" style="color:var(--accent)"></i> Minha Lista</h1>
                <p>${myList.length} salvos · ${watched.length} assistidos</p>

                <div class="tabs">
                    <button class="tab ${this.tab === 'all' ? 'active' : ''}" onclick="MyListPage.setTab('all')">Todos</button>
                    <button class="tab ${this.tab === 'watchlist' ? 'active' : ''}" onclick="MyListPage.setTab('watchlist')">Para Ver (${myList.length})</button>
                    <button class="tab ${this.tab === 'watched' ? 'active' : ''}" onclick="MyListPage.setTab('watched')">Assistidos (${watched.length})</button>
                </div>

                ${items.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-bookmark"></i>
                        <h3>Lista vazia</h3>
                        <p>Adicione filmes e séries para vê-los aqui</p>
                        <a href="#/explore" class="btn btn-primary" style="margin-top:16px"><i class="fas fa-compass"></i> Explorar</a>
                    </div>
                ` : `
                    <div class="carousel-container" style="flex-wrap:wrap;gap:12px">
                        ${items.map(item => this.renderCard(item)).join('')}
                    </div>
                `}
            </div>
        `;
    },

    renderCard(item) {
        const poster = getImageUrl(item.poster_path, 'w342');
        const isWatched = item.listType === 'watched' || Storage.isWatched(item.id, item.type);
        return `
            <div class="carousel-item">
                <div class="poster-wrapper" onclick="Router.navigate('#/details/${item.type}/${item.id}')">
                    <img src="${poster}" alt="${item.title}" loading="lazy">
                    <div class="poster-overlay" style="opacity:1">
                        <div class="card-actions" onclick="event.stopPropagation()">
                            <button onclick="MyListPage.remove(${item.id}, '${item.type}')" title="Remover"><i class="fas fa-trash"></i></button>
                            <button class="${isWatched ? 'active' : ''}" onclick="MyListPage.toggleWatched(${item.id}, '${item.type}', '${item.title.replace(/'/g, "\'")}', '${item.poster_path || ''}')" title="Assistido"><i class="fas ${isWatched ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
                        </div>
                    </div>
                    ${isWatched ? '<div style="position:absolute;top:6px;right:6px;background:var(--accent);color:var(--bg-primary);padding:2px 6px;border-radius:4px;font-size:0.65rem;font-weight:700"><i class="fas fa-check"></i></div>' : ''}
                </div>
                <div class="card-info">
                    <div class="card-title">${item.title}</div>
                    <div class="card-meta">
                        <span class="badge ${item.type === 'movie' ? 'badge-blue' : 'badge-green'}" style="font-size:0.65rem;padding:2px 6px">${item.type === 'movie' ? 'Filme' : 'Série'}</span>
                    </div>
                </div>
            </div>
        `;
    },

    setTab(t) { this.tab = t; this.render(); },
    remove(id, type) { Storage.removeFromList(id, type); this.render(); },
    toggleWatched(id, type, title, poster) { Storage.toggleWatched(id, type, title, poster); this.render(); }
};
