const CalendarPage = {
    async render() {
        const main = $('#main-content');
        if (!main) return;
        Loader.render();

        try {
            const [upcoming, airing] = await Promise.all([API.getUpcoming(1), API.getAiringToday(1)]);
            const movies = upcoming.results.slice(0, 12).map(i => ({...i, type: 'movie'}));
            const series = airing.results.slice(0, 8).map(i => ({...i, type: 'tv'}));
            const all = [...movies, ...series].sort((a, b) => new Date(a.release_date || a.first_air_date || 0) - new Date(b.release_date || b.first_air_date || 0));

            main.innerHTML = `
                <div class="calendar-page">
                    <h1><i class="fas fa-calendar-alt" style="color:var(--accent)"></i> Lancamentos</h1>
                    <p>Proximas estreias</p>

                    <div class="filter-pills">
                        <button class="filter-pill active">Proximos 30 dias</button>
                        <button class="filter-pill" onclick="showToast('Em breve', 'info')">Este Mes</button>
                        <button class="filter-pill" onclick="showToast('Em breve', 'info')">Proximo Mes</button>
                    </div>

                    ${all.length === 0 ? '<div class="empty-state"><i class="fas fa-calendar"></i><h3>Sem lancamentos</h3></div>' : `
                        <div>${all.map(item => this.renderItem(item)).join('')}</div>
                    `}
                </div>
            `;
        } catch (err) {
            main.innerHTML = `<div class="empty-state" style="padding-top:120px"><i class="fas fa-exclamation-circle"></i><h3>Erro</h3><p>${err.message}</p></div>`;
        }
    },

    renderItem(item) {
        const title = item.title || item.name;
        const date = item.release_date || item.first_air_date;
        const poster = getImageUrl(item.poster_path, 'w92');
        const relDate = getRelativeDate(date);

        return `
            <div class="calendar-item" onclick="Router.navigate('#/details/${item.type}/${item.id}')">
                <img src="${poster}" alt="${title}">
                <div class="info">
                    <span class="date-badge">${relDate}</span>
                    <h3>${title}</h3>
                    <p>${item.overview ? item.overview.substring(0, 100) + '...' : ''}</p>
                    <div class="meta-row">
                        <span class="badge ${item.type === 'movie' ? 'badge-blue' : 'badge-green'}" style="font-size:0.7rem;padding:2px 8px">${item.type === 'movie' ? 'Filme' : 'Serie'}</span>
                        <span style="color:var(--warning);font-size:0.8rem"><i class="fas fa-star"></i> ${formatRating(item.vote_average)}</span>
                    </div>
                </div>
            </div>
        `;
    }
};
