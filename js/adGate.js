/**
 * CineRadar AdGate Modal System
 * Modal de desbloqueio por ação - Monetag Direct Link
 * Versão: 1.0.0
 */

(function() {
    'use strict';

    // ===== CONFIGURAÇÕES =====
    const CONFIG = {
        LINK: 'https://omg10.com/4/11031110',
        COOLDOWN: 20 * 60 * 1000,      // 20 minutos entre modais
        SESSION_KEY: 'cr_adgate_unlock',
        LAST_ACTION_KEY: 'cr_adgate_last_action',
        ANIMATION_DURATION: 400,
        AUTO_CLOSE_DELAY: 1800         // ms para fechar após clique no anúncio
    };

    // ===== ESTADO =====
    let modalEl = null;
    let pendingAction = null;
    let isOpen = false;

    // ===== UTILS =====
    function getUnlockTime() {
        const raw = localStorage.getItem(CONFIG.SESSION_KEY);
        return raw ? parseInt(raw, 10) : 0;
    }

    function setUnlockTime() {
        localStorage.setItem(CONFIG.SESSION_KEY, Date.now().toString());
    }

    function isUnlocked() {
        const unlockedAt = getUnlockTime();
        if (!unlockedAt) return false;
        return (Date.now() - unlockedAt) < CONFIG.COOLDOWN;
    }

    function getRemainingCooldown() {
        const unlockedAt = getUnlockTime();
        if (!unlockedAt) return 0;
        const remaining = CONFIG.COOLDOWN - (Date.now() - unlockedAt);
        return Math.max(0, remaining);
    }

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    function canShowForAction(actionType) {
        // Só mostra se passou o cooldown OU se é ação diferente da última
        if (isUnlocked()) return false;

        const lastAction = localStorage.getItem(CONFIG.LAST_ACTION_KEY);
        const now = Date.now();

        // Se for mesma ação em menos de 5 min, ignora (evita spam)
        if (lastAction === actionType) {
            const lastTime = parseInt(localStorage.getItem('cr_adgate_last_time') || '0');
            if (now - lastTime < 5 * 60 * 1000) return false;
        }

        return true;
    }

    function registerAction(actionType) {
        localStorage.setItem(CONFIG.LAST_ACTION_KEY, actionType);
        localStorage.setItem('cr_adgate_last_time', Date.now().toString());
    }

    // ===== CONSTRUÇÃO DO MODAL =====
    function buildModal() {
        if (modalEl) return modalEl;

        const div = document.createElement('div');
        div.id = 'cr-adgate-modal';
        div.innerHTML = `
            <div class="cr-adgate-backdrop"></div>
            <div class="cr-adgate-card">
                <button class="cr-adgate-close" aria-label="Fechar">
                    <i class="fas fa-times"></i>
                </button>

                <div class="cr-adgate-icon">
                    <i class="fas fa-lock"></i>
                </div>

                <h3 class="cr-adgate-title">Continue Assistindo</h3>
                <p class="cr-adgate-desc">
                    Desbloqueie acesso completo ao catálogo.<br>
                    <span class="cr-adgate-highlight">Sem anúncios por 20 minutos.</span>
                </p>

                <div class="cr-adgate-timer" style="display:none">
                    <i class="fas fa-check-circle"></i>
                    <span>Liberado! Fechando em <b class="cr-adgate-countdown">3</b>s...</span>
                </div>

                <a href="${CONFIG.LINK}" target="_blank" class="cr-adgate-btn" rel="noopener noreferrer">
                    <i class="fas fa-play"></i>
                    <span>Desbloquear Agora</span>
                </a>

                <p class="cr-adgate-footer">CineRadar • Streaming Guide</p>
            </div>
        `;

        // Estilos inline (não depende de CSS externo)
        const style = document.createElement('style');
        style.textContent = `
            #cr-adgate-modal {
                position: fixed;
                inset: 0;
                z-index: 999999;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 16px;
                font-family: 'Inter', -apple-system, sans-serif;
            }
            #cr-adgate-modal.active {
                display: flex;
            }
            .cr-adgate-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(10,10,10,0.82);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                animation: crGateFadeIn 0.3s ease;
            }
            .cr-adgate-card {
                position: relative;
                background: #141414;
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 24px;
                padding: 32px 24px 24px;
                max-width: 320px;
                width: 100%;
                text-align: center;
                box-shadow: 0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(229,9,20,0.08);
                animation: crGateSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1);
                transform-origin: center;
            }
            .cr-adgate-close {
                position: absolute;
                top: 14px;
                right: 14px;
                width: 32px;
                height: 32px;
                border-radius: 10px;
                border: none;
                background: rgba(255,255,255,0.04);
                color: #666;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                transition: all 0.2s;
            }
            .cr-adgate-close:hover {
                background: rgba(255,255,255,0.08);
                color: #fff;
            }
            .cr-adgate-icon {
                width: 64px;
                height: 64px;
                border-radius: 20px;
                background: rgba(229,9,20,0.08);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 18px;
                font-size: 26px;
                color: #e50914;
                animation: crGatePulse 2.5s ease infinite;
            }
            .cr-adgate-title {
                margin: 0 0 8px;
                font-size: 20px;
                font-weight: 800;
                color: #fff;
                letter-spacing: -0.4px;
            }
            .cr-adgate-desc {
                margin: 0 0 22px;
                font-size: 13.5px;
                color: #888;
                line-height: 1.55;
            }
            .cr-adgate-highlight {
                color: #00ff88;
                font-weight: 600;
            }
            .cr-adgate-timer {
                margin-bottom: 16px;
                padding: 10px 14px;
                background: rgba(0,255,136,0.05);
                border: 1px solid rgba(0,255,136,0.1);
                border-radius: 12px;
                font-size: 13px;
                color: #00ff88;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                animation: crGateFadeIn 0.3s ease;
            }
            .cr-adgate-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                width: 100%;
                padding: 14px 20px;
                background: #e50914;
                color: #fff;
                border: none;
                border-radius: 14px;
                font-size: 14px;
                font-weight: 700;
                font-family: inherit;
                text-decoration: none;
                cursor: pointer;
                box-shadow: 0 4px 24px rgba(229,9,20,0.35);
                transition: transform 0.15s, box-shadow 0.15s;
            }
            .cr-adgate-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 28px rgba(229,9,20,0.45);
            }
            .cr-adgate-btn:active {
                transform: scale(0.97);
            }
            .cr-adgate-btn i {
                font-size: 12px;
            }
            .cr-adgate-footer {
                margin: 16px 0 0;
                font-size: 10px;
                color: #333;
            }
            @keyframes crGateFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes crGateSlideUp {
                from { opacity: 0; transform: translateY(30px) scale(0.92); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes crGatePulse {
                0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229,9,20,0.15); }
                50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(229,9,20,0); }
            }
            @media (max-width: 360px) {
                .cr-adgate-card { padding: 28px 18px 20px; }
                .cr-adgate-title { font-size: 18px; }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(div);
        modalEl = div;

        // Eventos
        modalEl.querySelector('.cr-adgate-close').addEventListener('click', closeModal);
        modalEl.querySelector('.cr-adgate-backdrop').addEventListener('click', closeModal);

        // Botão principal: registra unlock e agenda fechamento
        const btn = modalEl.querySelector('.cr-adgate-btn');
        btn.addEventListener('click', function(e) {
            // Não previne default — deixa abrir o link normalmente
            setUnlockTime();
            showSuccessAndClose();
        });

        // Tecla ESC fecha
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) closeModal();
        });

        return modalEl;
    }

    // ===== CONTROLE DO MODAL =====
    function openModal(actionType, callback) {
        if (!canShowForAction(actionType)) {
            if (callback) callback();
            return;
        }

        buildModal();
        pendingAction = callback;
        registerAction(actionType);

        // Reset visual
        const timer = modalEl.querySelector('.cr-adgate-timer');
        const btn = modalEl.querySelector('.cr-adgate-btn');
        timer.style.display = 'none';
        btn.style.display = 'flex';
        btn.innerHTML = '<i class="fas fa-play"></i><span>Desbloquear Agora</span>';
        btn.style.background = '#e50914';
        btn.style.pointerEvents = 'auto';

        modalEl.classList.add('active');
        isOpen = true;

        // Foco acessibilidade
        setTimeout(() => btn.focus(), 100);
    }

    function closeModal() {
        if (!modalEl) return;
        modalEl.classList.remove('active');
        isOpen = false;

        // Executa ação pendente se existir (mesmo sem clique no anúncio)
        if (pendingAction) {
            const fn = pendingAction;
            pendingAction = null;
            // Pequeno delay para animação fechar
            setTimeout(fn, 300);
        }
    }

    function showSuccessAndClose() {
        const timer = modalEl.querySelector('.cr-adgate-timer');
        const btn = modalEl.querySelector('.cr-adgate-btn');
        const countdown = modalEl.querySelector('.cr-adgate-countdown');

        btn.style.display = 'none';
        timer.style.display = 'flex';

        let seconds = 3;
        countdown.textContent = seconds;

        const interval = setInterval(() => {
            seconds--;
            countdown.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(interval);
                closeModal();
            }
        }, 1000);
    }

    // ===== API PÚBLICA =====
    window.AdGate = {
        /**
         * Abre modal para uma ação específica.
         * @param {string} action - Tipo da ação: 'play', 'navigate', 'search', 'details', etc.
         * @param {Function} onUnlock - Callback executado após desbloqueio (ou imediatamente se já liberado)
         * @returns {boolean} - true se o modal foi aberto, false se já estava liberado
         */
        request: function(action, onUnlock) {
            if (typeof action !== 'string') action = 'generic';

            if (isUnlocked()) {
                if (onUnlock) onUnlock();
                return false;
            }

            openModal(action, onUnlock);
            return true;
        },

        /**
         * Verifica se está liberado
         */
        isUnlocked: isUnlocked,

        /**
         * Tempo restante do cooldown em ms
         */
        getRemaining: getRemainingCooldown,

        /**
         * Força reset do cooldown (debug)
         */
        reset: function() {
            localStorage.removeItem(CONFIG.SESSION_KEY);
            localStorage.removeItem(CONFIG.LAST_ACTION_KEY);
            localStorage.removeItem('cr_adgate_last_time');
        },

        /**
         * Hook automático em elementos com data-adgate
         * Use: <button data-adgate="play" data-adgate-action="Player.open(123)">
         */
        autoHook: function() {
            document.addEventListener('click', function(e) {
                const el = e.target.closest('[data-adgate]');
                if (!el) return;

                const actionType = el.dataset.adgate || 'generic';
                const actionCode = el.dataset.adgateAction;

                // Se já liberado, deixa passar
                if (isUnlocked()) return;

                // Se não pode mostrar agora, deixa passar
                if (!canShowForAction(actionType)) return;

                // Previne ação original
                e.preventDefault();
                e.stopPropagation();

                // Monta callback
                const callback = function() {
                    if (actionCode) {
                        // Executa código string (cuidado!)
                        try {
                            const fn = new Function(actionCode);
                            fn();
                        } catch(err) {
                            console.error('AdGate action error:', err);
                        }
                    } else if (el.tagName === 'A' && el.href) {
                        window.location.href = el.href;
                    } else if (el.onclick) {
                        el.onclick.call(el, e);
                    }
                };

                openModal(actionType, callback);
            }, true); // useCapture para pegar antes
        }
    };

    // ===== INICIALIZAÇÃO =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.AdGate.autoHook();
        });
    } else {
        window.AdGate.autoHook();
    }

    console.log('[AdGate] Sistema carregado. Cooldown: 20min');
})();
