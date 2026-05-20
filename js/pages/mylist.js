const MyListPage = {
    render() {
        const main = $('#main-content');
        if (!main) return;

        const list = Storage.getMyList();
        const watched = Storage.getWatched();

        main.innerHTML = `
            <div class="mylist-page">
                <h1><i class="fas fa-bookmark" style="color:var(--accent)"></i> Minha Lista</h1>

                ${list.length === 0 ? `
                    <div class="empty-state" style="padding-top:60px">
                        <i class="fas fa-bookmark"></i>
                        <h3>Sua lista esta vazia</h3>
                        <p>Salve filmes e series para assistir depois</p>
                    </div>
                ` : `
                    <div class="carousel-container" style="flex-wrap:wrap;gap:12px">
                        ${list.map(item => MovieCard.render({
                            id: item.id,
                            media_type: item.type,
                            title: item.title,
                            name: item.title,
                            poster_path: item.poster_path,
                            vote_average: 0
                        })).join('')}
                    </div>
                `}

                <h2 style="margin-top:40px"><i class="fas fa-eye" style="color:var(--accent);margin-right:8px"></i>Assistidos</h2>
                ${watched.length === 0 ? `
                    <div class="empty-state" style="padding-top:40px">
                        <i class="fas fa-eye"></i>
                        <h3>Nenhum assistido</h3>
                    </div>
                ` : `
                    <div class="carousel-container" style="flex-wrap:wrap;gap:12px">
                        ${watched.map(item => MovieCard.render({
                            id: item.id,
                            media_type: item.type,
                            title: item.title,
                            name: item.title,
                            poster_path: item.poster,
                            vote_average: 0
                        })).join('')}
                    </div>
                `}
            </div>
        `;
    }
};
