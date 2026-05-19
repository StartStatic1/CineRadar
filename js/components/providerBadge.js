const ProviderBadge = {
    render(provider) {
        const p = CONFIG.PROVIDERS[provider];
        if (!p) return '';
        return `
            <div class="provider-badge" style="--provider-color: ${p.color}">
                <img src="${p.logo}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
                <span>${p.name}</span>
            </div>
        `;
    }
};
