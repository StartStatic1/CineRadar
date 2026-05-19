function $(s) { return document.querySelector(s); }
function $$(s) { return document.querySelectorAll(s); }

function formatDate(dateStr) {
    if (!dateStr) return 'Data desconhecida';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatRuntime(min) {
    if (!min) return '';
    const h = Math.floor(min / 60), m = min % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function formatRating(r) {
    return r ? r.toFixed(1) : 'N/A';
}

function getImageUrl(path, size = 'w342') {
    return path ? `${CONFIG.TMDB_IMAGE_URL}/${size}${path}` : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="342" height="513"><rect fill="%23181818" width="342" height="513"/><text fill="%23666" x="50%" y="50%" text-anchor="middle" font-size="16">Sem Imagem</text></svg>';
}

function getBackdropUrl(path, size = 'w1280') {
    return path ? `${CONFIG.TMDB_IMAGE_URL}/${size}${path}` : '';
}

function showToast(msg, type = 'info') {
    const c = $('#toast-container');
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fas ${icons[type]}"></i><span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.style.animation = 'fadeOut 0.3s forwards'; setTimeout(() => t.remove(), 300); }, 3000);
}

function debounce(fn, wait) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

function getRelativeDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((d - now) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    if (diff === -1) return 'Ontem';
    if (diff > 1 && diff <= 7) return `Em ${diff} dias`;
    if (diff < -1 && diff >= -7) return `Há ${Math.abs(diff)} dias`;
    return formatDate(dateStr);
}
