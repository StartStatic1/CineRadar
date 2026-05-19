// ==========================================
// UTILITÁRIOS
// ==========================================

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function formatDate(dateStr) {
    if (!dateStr) return 'Data desconhecida';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatRuntime(minutes) {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}min`;
}

function formatRating(rating) {
    if (!rating) return 'N/A';
    return rating.toFixed(1);
}

function getImageUrl(path, size = 'w500') {
    if (!path) return 'https://via.placeholder.com/500x750/1f1f1f/666?text=Sem+Imagem';
    return `${CONFIG.TMDB_IMAGE_URL}/${size}${path}`;
}

function getBackdropUrl(path, size = 'w1280') {
    if (!path) return '';
    return `${CONFIG.TMDB_IMAGE_URL}/${size}${path}`;
}

function showToast(message, type = 'info') {
    const container = $('#toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function slugify(text) {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}
