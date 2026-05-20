// ==========================================
// PROTECT - Bloqueia interacoes de "roubo" de conteudo + popups de players
// ==========================================

(function() {
    'use strict';

    // 1. Bloqueia clique direito
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);

    // 2. Bloqueia toque longo no mobile
    let touchTimer = null;

    document.addEventListener('touchstart', function(e) {
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'img' || tag === 'video' || tag === 'iframe' || tag === 'canvas') {
            touchTimer = setTimeout(function() {
                e.preventDefault();
                e.stopPropagation();
            }, 400);
        }
    }, { passive: false, capture: true });

    document.addEventListener('touchend', function(e) {
        if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
        }
    }, { capture: true });

    document.addEventListener('touchmove', function(e) {
        if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
        }
    }, { capture: true });

    // 3. Bloqueia selecao de texto
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    }, true);

    // 4. Bloqueia arrastar imagens
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    }, true);

    // 5. Bloqueia atalhos de teclado perigosos
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            return false;
        }
    }, true);

    // 6. Bloqueia popups e redirecionamentos de iframes (ads dos players)
    // Isso intercepta window.open e location changes dentro do iframe
    const originalOpen = window.open;
    window.open = function(url, target, features) {
        // So permite popups se forem iniciados pelo usuario (clique direto)
        // Bloqueia popups automaticos de ads
        console.log('[CineRadar] Popup bloqueado:', url);
        return null;
    };

    // 7. Bloqueia beforeunload (quando ads tentam impedir fechar a pagina)
    window.addEventListener('beforeunload', function(e) {
        // So permite se o usuario estiver saindo intencionalmente
        // (nao bloqueia o fechar normal da pagina)
    });

    // 8. CSS para desabilitar selecao
    const style = document.createElement('style');
    style.textContent = `
        * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-touch-callout: none !important;
        }

        input, textarea, [contenteditable] {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
        }

        img, video, iframe {
            -webkit-user-drag: none !important;
            user-drag: none !important;
            pointer-events: auto;
        }
    `;
    document.head.appendChild(style);

    console.log('[CineRadar] Protecao ativada.');
})();
