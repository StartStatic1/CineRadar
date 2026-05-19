// ==========================================
// MY LIST PAGE
// ==========================================

const MyListPage = {
    currentTab: 'all', // all, watchlist, watched

    render() {
        const main = $('#main-content');
        if (!main) return;

        const myList = Storage.getMyList();
        const watched = Storage.getWatched();

        let items = [];
        if (this.currentTab === 'all') {
            items = [...myList.map(i => ({...i, listType: 'watchlist'})), 
                     ...watched.map(i => ({...i, listType: 'watched'}))];
            // Remove duplicados
            items = items.filter((v, i, a) => a.findIndex(t => (t.id === v.id && t.type === v.type)) === i);
        } else if (this.currentTab === 'watchlist') {
            items = myList.map(i => ({...i, listType: 'watchlist'}));
        } else {
            items = watched.map(i => ({...i, listType: 'watched'}));
        }

        main.innerHTML = `
            <div class="container" style="padding-top: calc(var(--header-height) + 40px);">
                <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 8px;">
                    <i class="fas fa-bookmark" style="color: var(--accent);"></i> Minha Lista
                </h1>
                <p style="color: var(--text-secondary); margin-bottom: 32px;">
                    Organize seus filmes e séries favoritos
                </p>

                <div class="list-tabs">
                    <button class="list-tab ${this.currentTab === 'all' ? 'active' : ''}" onclick="MyListPage.setTab('all')">
                        <i class="fas fa-list"></i> Todos
                    </button>
                    <button class="list-tab ${this.currentTab === 'watchlist' ? 'active' : ''}" onclick="MyListPage.setTab('watchlist')">
                        <i class="fas fa-plus"></i> Para Assistir (${myList.length})
                    </button>
                    <button class="list-tab ${this.currentTab === 'watched' ? 'active' : ''}" onclick="MyListPage.setTab('watched')">
                        <i class="fas fa-eye"></i> Assistidos (${watched.length})
                    </button>
                </div>

                ${items.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-bookmark"></i>
                        <h3>Lista vazia</h3>
                        <p>Adicione filmes e séries à sua lista para vê-los aqui.</p>
                        <a href="#/explore" class="btn btn-primary" style="margin-top: 20px;">
                            <i class="fas fa-compass"></i> Explorar Conteúdo
                        </a>
                    </div>
                ` : `
                    <div class="grid-posters-lg">
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
            <div class="movie-card">
                <div class="poster-wrapper" onclick="Router.navigate('#/details/${item.type}/${item.id}')">
                    <img src="${poster}" alt="${item.title}" loading="lazy">
                    <div class="poster-overlay" style="opacity: 1;">
                        <div class="card-actions" onclick="event.stopPropagation()">
                            <button onclick="MyListPage.remove(${item.id}, '${item.type}')" title="Remover">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="${isWatched ? 'active' : ''}" 
                                onclick="MyListPage.toggleWatched(${item.id}, '${item.type}', '${item.title.replace(/'/g, "\'")}', '${item.poster_path || ''}')"
                                title="${isWatched ? 'Marcar não assistido' : 'Marcar assistido'}">
                                <i class="fas ${isWatched ? 'fa-eye-slash' : 'fa-eye'}"></i>
                            </button>
                        </div>
                    </div>
                    ${isWatched ? '<div style="position: absolute; top: 8px; right: 8px; background: var(--accent); color: var(--bg-primary); padding: 4px 8px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 700;"><i class="fas fa-check"></i> Assistido</div>' : ''}
                </div>
                <div class="card-info">
                    <div class="card-title" title="${item.title}">${item.title}</div>
                    <div class="card-meta">
                        <span class="badge ${item.type === 'movie' ? 'badge-blue' : 'badge-green'}">
                            ${item.type === 'movie' ? 'Filme' : 'Série'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    },

    setTab(tab) {
        this.currentTab = tab;
        this.render();
    },

    remove(id, type) {
        Storage.removeFromList(id, type);
        this.render();
    },

    toggleWatched(id, type, title, poster) {
        Storage.toggleWatched(id, type, title, poster);
        this.render();
    }
};
