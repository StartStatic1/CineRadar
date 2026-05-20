// ===== AD HELPER - CineRadar =====
// Use manualmente em botoes/links. Nao injeta automaticamente.

window.CineAds = {
    // Abre popunder manualmente (chame num click handler)
    openPopunder: function() {
        // Evita multiplos disparos
        if (this._fired) return;
        this._fired = true;

        // Abre o link de ad em nova aba
        var win = window.open('https://omg10.com/4/11031110', '_blank');
        if (win) win.focus();

        // Libera para futuros clicks apos 30s
        setTimeout(function() {
            window.CineAds._fired = false;
        }, 30000);
    },

    // Injeta botao "Apoiar" no footer (chame apos renderizar footer)
    injectSupportButton: function() {
        var footer = document.getElementById('footer-container');
        if (!footer) return;

        // Evita duplicar
        if (footer.querySelector('.cine-support-btn')) return;

        var btn = document.createElement('button');
        btn.className = 'cine-support-btn';
        btn.innerHTML = '<i class="fas fa-heart"></i>';
        btn.title = 'Apoiar o app';
        btn.style.cssText = '
            position: absolute;
            top: -24px;
            right: 16px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e50914;
            color: #fff;
            border: none;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(229,9,20,0.4);
            z-index: 100;
            cursor: pointer;
        ';

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            window.CineAds.openPopunder();
        });

        footer.style.position = 'relative';
        footer.appendChild(btn);
    }
};
