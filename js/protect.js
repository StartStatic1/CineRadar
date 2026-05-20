// ==========================================
// PROTECT - Bloqueia interacoes de "roubo" de conteudo
// Incluir no index.html: <script src="js/protect.js"></script>
// ==========================================

(function() {
    'use strict';

    // 1. Bloqueia clique direito (desktop)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);

    // 2. Bloqueia toque longo no mobile (segurar dedo)
    let touchTimer = null;

    document.addEventListener('touchstart', function(e) {
        // Se for em imagem ou video, bloqueia toque longo
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

    // 3. Bloqueia selecao de texto (evita copiar)
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    }, true);

    // 4. Bloqueia arrastar imagens
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    }, true);

    // 5. Bloqueia atalhos de teclado (Ctrl+S, Ctrl+U, F12, etc)
    document.addEventListener('keydown', function(e) {
        // F12 (DevTools)
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (Ver fonte)
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S (Salvar pagina)
        if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            return false;
        }
        // Ctrl+P (Imprimir)
        if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            return false;
        }
    }, true);

    // 6. CSS inline para desabilitar selecao e arrasto em elementos sensiveis
    const style = document.createElement('style');
    style.textContent = `
        /* Desabilita selecao em todo o app */
        * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-touch-callout: none !important;
        }

        /* Permite selecao em inputs e textareas (pra digitar) */
        input, textarea, [contenteditable] {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
        }

        /* Desabilita arrastar imagens */
        img, video, iframe {
            -webkit-user-drag: none !important;
            user-drag: none !important;
            pointer-events: auto;
        }

        /* Desabilita menu de contexto no mobile */
        * {
            -webkit-touch-callout: none !important;
        }
    `;
    document.head.appendChild(style);

    console.log('[CineRadar] Protecao ativada: clique direito, toque longo, selecao e atalhos bloqueados.');
})();
