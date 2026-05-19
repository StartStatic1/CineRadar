const ReelsPage = {
    items: [],
    current: 0,

    async render() {
        const main = $('#main-content');
        if (!main) return;
        Loader.render();

        try {
            // Busca trending e pega vídeos dos top 20
            const trending = await API.getTrending('all', 1);
            const withVideos = [];

            for (const item of trending.results.slice(0, 15)) {
                if (item.media_type === 'person') continue;
                try {
                    const vids = await API.getVideos(item.id, item.media_type || 'movie');
                    const trailer = vids.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
                    const teaser = vids.results?.find(v => v.type === 'Teaser' && v.site === 'YouTube');
                    const any = vids.results?.[0];
                    const video = trailer || teaser || any;

                    if (video) {
                        withVideos.push({
                            ...item,
                            media_type: item.media_type || 'movie',
                            videoKey: video.key,
                            videoName: video.name
                        });
                    }
                } catch(e) {}
            }

            this.items = withVideos;

            if (!withVideos.length) {
                main.innerHTML = `
                    <div class="reels-page">
                        <h1><i class="fas fa-film" style="color:var(--accent)"></i> Reels</h1>
                        <div class="empty-state" style="padding-top:60px">
                            <i class="fas fa-video"></i>
                            <h3>Sem vídeos no momento</h3>
                            <p>Trailers e teasers aparecerão aqui</p>
                        </div>
                    </div>
                `;
                return;
            }

            main.innerHTML = `
                <div class="reels-page">
                    <div class="reels-container">
                        ${withVideos.map((item, i) => this.renderReel(item, i)).join('')}
                    </div>
                </div>
            `;

            // Lazy load iframe on scroll
            this.setupIntersectionObserver();
        } catch (err) {
            main.innerHTML = `<div class="empty-state" style="padding-top:120px"><i class="fas fa-exclamation-circle"></i><h3>Erro</h3><p>${err.message}</p></div>`;
        }
    },

    renderReel(item, index) {
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').substring(0, 4);
        const typeLabel = item.media_type === 'movie' ? 'Filme' : 'Série';
        const poster = getImageUrl(item.backdrop_path || item.poster_path, 'w780');

        return `
            <div class="reel-item" data-index="${index}" onclick="ReelsPage.goToDetails(${item.id}, '${item.media_type}')">
                <div class="reel-media">
                    <img src="${poster}" alt="${title}" loading="lazy" class="reel-poster">
                    <div class="reel-play-btn" onclick="event.stopPropagation(); ReelsPage.playVideo('${item.videoKey}', this)">
                        <i class="fas fa-play"></i>
                    </div>
                    <iframe class="reel-iframe" data-src="https://www.youtube.com/embed/${item.videoKey}?autoplay=1&mute=1&rel=0" 
                        frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen style="display:none"></iframe>
                </div>
                <div class="reel-info">
                    <h3>${title}</h3>
                    <div class="reel-meta">
                        <span class="badge badge-blue" style="font-size:0.7rem;padding:2px 8px">${typeLabel}</span>
                        <span style="color:var(--warning);font-size:0.8rem"><i class="fas fa-star"></i> ${formatRating(item.vote_average)}</span>
                        ${year ? `<span style="color:var(--text-muted);font-size:0.8rem">${year}</span>` : ''}
                    </div>
                    <p>${item.overview ? item.overview.substring(0, 120) + '...' : ''}</p>
                    <div class="reel-actions" onclick="event.stopPropagation()">
                        <button onclick="MovieCard.toggleList(event, ${item.id}, '${item.media_type}', '${title.replace(/'/g, "\'")}', '${item.poster_path || ''}')">
                            <i class="fas ${Storage.isInList(item.id, item.media_type) ? 'fa-check' : 'fa-plus'}"></i>
                        </button>
                        <button onclick="MovieCard.toggleWatched(event, ${item.id}, '${item.media_type}', '${title.replace(/'/g, "\'")}', '${item.poster_path || ''}')">
                            <i class="fas ${Storage.isWatched(item.id, item.media_type) ? 'fa-eye-slash' : 'fa-eye'}"></i>
                        </button>
                        <button onclick="Router.navigate('#/details/${item.media_type}/${item.id}')">
                            <i class="fas fa-info-circle"></i> Detalhes
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    playVideo(key, btn) {
        const container = btn.closest('.reel-media');
        const img = container.querySelector('.reel-poster');
        const iframe = container.querySelector('.reel-iframe');

        img.style.display = 'none';
        btn.style.display = 'none';
        iframe.style.display = 'block';
        iframe.src = iframe.dataset.src;
    },

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const iframe = entry.target.querySelector('.reel-iframe');
                if (iframe && iframe.src) {
                    // Pausa vídeos fora da tela (recarrega para parar)
                    if (!entry.isIntersecting) {
                        iframe.src = iframe.src; // hack para parar
                        iframe.style.display = 'none';
                        entry.target.querySelector('.reel-poster').style.display = 'block';
                        entry.target.querySelector('.reel-play-btn').style.display = 'flex';
                    }
                }
            });
        }, { threshold: 0.6 });

        document.querySelectorAll('.reel-item').forEach(el => observer.observe(el));
    },

    goToDetails(id, type) {
        Router.navigate(`#/details/${type}/${id}`);
    }
};
