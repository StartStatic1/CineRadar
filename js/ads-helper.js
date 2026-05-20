// ===== AD HELPER v2 - CineRadar =====
// Botao fixo na tela, nao depende do footer

window.CineAds = {
    _fired: false,

    openPopunder: function() {
        if (this._fired) return;
        this._fired = true;

        var win = window.open('https://omg10.com/4/11031110', '_blank');
        if (win) win.focus();

        setTimeout(function() {
            window.CineAds._fired = false;
        }, 30000);
    },

    injectSupportButton: function() {
        // Evita duplicar
        if (document.getElementById('cine-support-btn')) return;

        var btn = document.createElement('button');
        btn.id = 'cine-support-btn';
        btn.innerHTML = '<i class="fas fa-heart"></i>';
        btn.title = 'Apoiar o app';
        btn.style.cssText = '
            position: fixed;
            bottom: 80px;
            right: 16px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #e50914;
            color: #fff;
            border: 2px solid rgba(255,255,255,0.15);
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(229,9,20,0.5);
            z-index: 9999;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            -webkit-tap-highlight-color: transparent;
        ';

        // Efeito hover/active
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.92)';
        });
        btn.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.CineAds.openPopunder();
        });

        document.body.appendChild(btn);
    }
};

// Auto-inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.CineAds.injectSupportButton();
    });
} else {
    window.CineAds.injectSupportButton();
}
