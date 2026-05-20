// ===== AD HELPER v3 - CineRadar =====
// Com logs de debug e fallback garantido

(function() {
    'use strict';

    window.CineAds = {
        _fired: false,
        _injected: false,

        log: function(msg) {
            console.log('[CineAds] ' + msg);
        },

        openPopunder: function() {
            if (this._fired) {
                this.log('Popunder ja disparado, aguarde 30s');
                return;
            }
            this._fired = true;
            this.log('Abrindo popunder...');

            var win = window.open('https://omg10.com/4/11031110', '_blank');
            if (win) {
                win.focus();
                this.log('Popunder aberto com sucesso');
            } else {
                this.log('Popunder BLOQUEADO pelo navegador');
            }

            setTimeout(function() {
                window.CineAds._fired = false;
                window.CineAds.log('Pronto para novo popunder');
            }, 30000);
        },

        injectSupportButton: function() {
            if (this._injected) {
                this.log('Botao ja existe, pulando');
                return;
            }

            var existing = document.getElementById('cine-support-btn');
            if (existing) {
                this._injected = true;
                this.log('Botao ja existe no DOM');
                return;
            }

            this.log('Criando botao...');

            var btn = document.createElement('button');
            btn.id = 'cine-support-btn';
            btn.innerHTML = '<i class="fas fa-heart" style="pointer-events:none"></i>';
            btn.title = 'Apoiar o app';
            btn.style.cssText = '
                position: fixed !important;
                bottom: 90px !important;
                right: 16px !important;
                width: 50px !important;
                height: 50px !important;
                border-radius: 50% !important;
                background: #e50914 !important;
                color: #fff !important;
                border: 2px solid rgba(255,255,255,0.2) !important;
                font-size: 20px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                box-shadow: 0 4px 20px rgba(229,9,20,0.6) !important;
                z-index: 99999 !important;
                cursor: pointer !important;
                -webkit-tap-highlight-color: transparent !important;
                outline: none !important;
                padding: 0 !important;
                margin: 0 !important;
            ';

            // Touch feedback
            btn.addEventListener('touchstart', function(e) {
                e.stopPropagation();
                this.style.transform = 'scale(0.9)';
            }, {passive: true});

            btn.addEventListener('touchend', function(e) {
                e.stopPropagation();
                this.style.transform = 'scale(1)';
            }, {passive: true});

            // Click handler
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.CineAds.openPopunder();
            });

            document.body.appendChild(btn);
            this._injected = true;
            this.log('Botao criado e adicionado ao body!');
        }
    };

    // ===== INICIALIZACAO =====
    function init() {
        window.CineAds.log('Inicializando...');
        if (!document.body) {
            window.CineAds.log('Body ainda nao existe, aguardando...');
            setTimeout(init, 100);
            return;
        }
        window.CineAds.injectSupportButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Fallback: tenta de novo apos 1s e 3s
    setTimeout(function() {
        if (!window.CineAds._injected) {
            window.CineAds.log('Fallback 1s...');
            window.CineAds.injectSupportButton();
        }
    }, 1000);

    setTimeout(function() {
        if (!window.CineAds._injected) {
            window.CineAds.log('Fallback 3s...');
            window.CineAds.injectSupportButton();
        }
    }, 3000);

})();
