// ==========================================
// CALENDAR PAGE
// ==========================================

const CalendarPage = {
    async render() {
        const main = $('#main-content');
        if (!main) return;

        Loader.render();

        try {
            const [upcomingMovies, airingToday] = await Promise.all([
                API.getUpcomingMovies(1),
                API.getAiringToday(1)
            ]);

            const movies = upcomingMovies.results.slice(0, 15).map(i => ({...i, type: 'movie'}));
            const series = airingToday.results.slice(0, 10).map(i => ({...i, type: 'tv'}));
            const allItems = [...movies, ...series].sort((a, b) => {
                const dateA = new Date(a.release_date || a.first_air_date || 0);
                const dateB = new Date(b.release_date || b.first_air_date || 0);
                return dateA - dateB;
            });

            main.innerHTML = `
                <div class="container" style="padding-top: calc(var(--header-height) + 40px);">
                    <div class="calendar-header">
                        <div>
                            <h1 style="font-size: 2rem; font-weight: 700;">
                                <i class="fas fa-calendar-alt" style="color: var(--accent);"></i> 
                                Calendário de Lançamentos
                            </h1>
                            <p style="color: var(--text-secondary); margin-top: 8px;">
                                Fique por dentro das próximas estreias
                            </p>
                        </div>
                    </div>

                    <div class="filter-pills" style="margin-bottom: 32px;">
                        <button class="filter-pill active">Próximos 30 dias</button>
                        <button class="filter-pill" onclick="showToast('Em breve: filtros por mês', 'info')">Este Mês</button>
                        <button class="filter-pill" onclick="showToast('Em breve: filtros por mês', 'info')">Próximo Mês</button>
                    </div>

                    ${allItems.length === 0 ? `
                        <div class="empty-state">
                            <i class="fas fa-calendar"></i>
                            <h3>Nenhum lançamento encontrado</h3>
                        </div>
                    ` : `
                        <div class="calendar-grid">
                            ${allItems.map(item => this.renderItem(item)).join('')}
                        </div>
                    `}
                </div>
            `;
        } catch (error) {
            if (error.message === 'API_KEY_MISSING') {
                main.innerHTML = HomePage.renderApiKeyPrompt();
            } else {
                main.innerHTML = `
                    <div class="empty-state" style="padding-top: 120px;">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Erro ao carregar calendário</h3>
                    </div>
                `;
            }
        }
    },

    renderItem(item) {
        const title = item.title || item.name;
        const date = item.release_date || item.first_air_date;
        const poster = getImageUrl(item.poster_path, 'w92');
        const daysUntil = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

        let dateLabel = formatDate(date);
        if (daysUntil === 0) dateLabel += ' (Hoje!)';
        else if (daysUntil === 1) dateLabel += ' (Amanhã)';
        else if (daysUntil > 1 && daysUntil <= 7) dateLabel += ` (Em ${daysUntil} dias)`;

        return `
            <div class="calendar-item" onclick="Router.navigate('#/details/${item.type}/${item.id}')">
                <img src="${poster}" alt="${title}">
                <div class="info">
                    <span class="date-badge">${dateLabel}</span>
                    <h3>${title}</h3>
                    <p>${item.overview ? item.overview.substring(0, 120) + '...' : 'Sinopse não disponível.'}</p>
                    <div style="margin-top: 8px;">
                        <span class="badge ${item.type === 'movie' ? 'badge-blue' : 'badge-green'}">
                            ${item.type === 'movie' ? '🎬 Filme' : '📺 Série'}
                        </span>
                        <span class="badge badge-yellow" style="margin-left: 8px;">
                            <i class="fas fa-star"></i> ${formatRating(item.vote_average)}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
};
