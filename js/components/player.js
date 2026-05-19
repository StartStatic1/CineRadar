const Player = {
    open(id, type, title) {
        const modal = $('#player-modal');
        const url = type === 'movie' 
            ? `${CONFIG.PLAYER_BASE_URL}/filme/${id}`
            : `${CONFIG.PLAYER_BASE_URL}/serie/${id}`;

        modal.innerHTML = `
            <div class="player-modal-overlay active" onclick="Player.close(event)">
                <div class="player-modal-header" onclick="event.stopPropagation()">
                    <h3><i class="fas fa-play-circle" style="color:var(--accent)"></i> ${title}</h3>
                    <button onclick="Player.close(event)"><i class="fas fa-times"></i></button>
                </div>
                <div class="player-modal-body" onclick="event.stopPropagation()">
                    <iframe src="${url}" allowfullscreen loading="lazy"></iframe>
                </div>
            </div>
        `;
        document.body.style.overflow = 'hidden';
    },

    close(e) {
        if (e.target.classList.contains('player-modal-overlay') || e.target.closest('button')) {
            $('#player-modal').innerHTML = '';
            document.body.style.overflow = '';
        }
    }
};
