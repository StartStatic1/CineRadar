// ==========================================
// PROVIDER BADGE COMPONENT
// ==========================================

const ProviderBadge = {
    render(provider) {
        const logoUrl = provider.logo_path 
            ? getImageUrl(provider.logo_path, 'w45') 
            : '';

        return `
            <div class="provider-badge" title="${provider.provider_name}">
                ${logoUrl ? `<img src="${logoUrl}" alt="${provider.provider_name}">` : ''}
                <span>${provider.provider_name}</span>
            </div>
        `;
    },

    renderList(providers, type = 'flatrate') {
        if (!providers || !providers[type]) {
            return '<p style="color: var(--text-muted); font-size: 0.9rem;">Não disponível em streaming no momento.</p>';
        }

        return providers[type].map(p => this.render(p)).join('');
    },

    // Renderiza os provedores brasileiros conhecidos para filtros
    renderProviderFilters(activeProvider, onClick) {
        const providers = Object.entries(CONFIG.PROVIDERS);

        return `
            <div class="provider-grid">
                ${providers.map(([key, provider]) => `
                    <div class="provider-item ${activeProvider === provider.id ? 'active' : ''}" 
                         onclick="${onClick}(${provider.id})">
                        <img src="https://image.tmdb.org/t/p/original/..." 
                             alt="${provider.name}" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                        <div style="width:48px;height:48px;border-radius:8px;background:${provider.color};display:none;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.7rem;text-align:center;padding:4px;">
                            ${provider.name.substring(0, 3)}
                        </div>
                        <span>${provider.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
};
