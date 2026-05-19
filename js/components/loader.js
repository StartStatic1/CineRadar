// ==========================================
// LOADER COMPONENT
// ==========================================

const Loader = {
    render(container = '#main-content') {
        const el = $(container);
        if (el) {
            el.innerHTML = `
                <div class="loader">
                    <div class="loader-spinner"></div>
                </div>
            `;
        }
    },

    remove() {
        const loader = $('.loader');
        if (loader) loader.remove();
    }
};
