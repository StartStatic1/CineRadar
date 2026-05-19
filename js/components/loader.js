const Loader = {
    render(c = '#main-content') { const el = $(c); if (el) el.innerHTML = '<div class="loader"><div class="loader-spinner"></div></div>'; },
    remove() { const l = $('.loader'); if (l) l.remove(); }
};
