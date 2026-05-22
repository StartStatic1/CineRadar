/**
 * CineRadar Monetag OnClick Controller
 * Gerencia o script onClick do Monetag sem quebrar o app SPA
 * Coordena com AdGate para não ter conflito de modais/popups
 * 
 * Script original: https://al5sm.com/tag.min.js (zone: 11031120)
 */

(function() {
    'use strict';

    // ===== CONFIGURAÇÕES =====
    const CONFIG = {
        ZONE: '11031120',
        SCRIPT_URL: 'https://al5sm.com/tag.min.js',
        COOLDOWN: 45 * 1000,           // 45s entre disparos do onClick
        SESSION_KEY: 'cr_onclick_last',
        ENABLED_KEY: 'cr_onclick_enabled',
        // Seletores onde o onClick NÃO deve disparar (para não quebrar funcionalidades)
        BLOCKED_SELECTORS: [
            '#cr-adgate-modal',           // Não dispara dentro do modal AdGate
            '.cr-adgate-card',
            '.cr-adgate-btn',
            '#cine-gate-overlay',         // Não dispara no gate antigo
            'input[type="search"]',
            'input[type="text"]',
            'textarea',
            'a[href^="mailto:"]',
            'a[href^="tel:"]',
            '[data-no-ad]',               // Elementos marcados para ignorar ads
            '.no-ads'                     // Classe utilitária
        ],
        // Seletores onde o onClick PODE disparar (whitelist opcional)
        // Se vazio, permite em qualquer lugar exceto os bloqueados
        ALLOWED_SELECTORS: [],
        // Máximo de disparos por sessão (para não irritar)
        MAX_PER_SESSION: 8
    };

    // ===== ESTADO =====
    let scriptLoaded = false;
    let scriptElement = null;
    let sessionCount = 0;
    let isPaused = false;

    // ===== UTILS =====
    function getLastTrigger() {
        return parseInt(sessionStorage.getItem(CONFIG.SESSION_KEY) || '0');
    }

    function setLastTrigger() {
        sessionStorage.setItem(CONFIG.SESSION_KEY, Date.now().toString());
    }

    function isCooldownActive() {
        return (Date.now() - getLastTrigger()) < CONFIG.COOLDOWN;
    }

    function isEnabled() {
        return localStorage.getItem(CONFIG.ENABLED_KEY) !== 'false';
    }

    function setEnabled(val) {
        localStorage.setItem(CONFIG.ENABLED_KEY, val ? 'true' : 'false');
    }

    function shouldBlockClick(target) {
        // Verifica se o clique foi em algum elemento bloqueado
        for (const selector of CONFIG.BLOCKED_SELECTORS) {
            if (target.closest(selector)) return true;
        }
        return false;
    }

    function canTrigger() {
        if (!isEnabled()) return false;
        if (isPaused) return false;
        if (isCooldownActive()) return false;
        if (sessionCount >= CONFIG.MAX_PER_SESSION) return false;

        // Se AdGate estiver aberto, não dispara onClick
        const adGateModal = document.getElementById('cr-adgate-modal');
        if (adGateModal && adGateModal.classList.contains('active')) return false;

        // Se gate antigo estiver aberto
        const oldGate = document.getElementById('cine-gate-overlay');
        if (oldGate && oldGate.classList.contains('active')) return false;

        return true;
    }

    // ===== CARREGAMENTO DO SCRIPT =====
    function loadScript() {
        if (scriptLoaded) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.dataset.zone = CONFIG.ZONE;
            s.src = CONFIG.SCRIPT_URL;
            s.async = true;

            s.onload = function() {
                scriptLoaded = true;
                scriptElement = s;
                console.log('[MonetagOnClick] Script carregado. Zone:', CONFIG.ZONE);
                resolve();
            };

            s.onerror = function() {
                console.error('[MonetagOnClick] Falha ao carregar script');
                reject();
            };

            document.body.appendChild(s);
        });
    }

    function unloadScript() {
        if (scriptElement && scriptElement.parentNode) {
            scriptElement.parentNode.removeChild(scriptElement);
            scriptLoaded = false;
            scriptElement = null;
            console.log('[MonetagOnClick] Script removido');
        }
    }

    // ===== CONTROLE DE DISPARO =====
    // O script onClick do Monetag funciona interceptando cliques no documento.
    // Nossa estratégia: carregamos o script, mas controlamos quando ele pode "respirar"

    function activate() {
        if (!canTrigger()) return;

        loadScript().then(() => {
            // O Monetag onClick geralmente dispara no PRÓXIMO clique após carregar
            // Marcamos que estamos "armados"
            console.log('[MonetagOnClick] Armado — próximo clique válido dispara anúncio');
        });
    }

    function recordTrigger() {
        setLastTrigger();
        sessionCount++;
        console.log('[MonetagOnClick] Disparo registrado. Sessão:', sessionCount + '/' + CONFIG.MAX_PER_SESSION);

        // Após disparo, descarregamos o script por um tempo (cooldown)
        // e depois recarregamos
        unloadScript();

        setTimeout(() => {
            if (isEnabled() && sessionCount < CONFIG.MAX_PER_SESSION) {
                activate();
            }
        }, CONFIG.COOLDOWN);
    }

    // ===== LISTENER INTELIGENTE =====
    function initClickInterceptor() {
        // Usamos capture para pegar o clique antes de outros handlers
        document.addEventListener('click', function(e) {
            if (!scriptLoaded) return;
            if (!canTrigger()) return;

            // Verifica se o clique foi em área bloqueada
            if (shouldBlockClick(e.target)) {
                console.log('[MonetagOnClick] Clique bloqueado em elemento restrito');
                return;
            }

            // Se chegou aqui, o script onClick vai disparar no clique
            // Registramos após um pequeno delay (o popunder abre assíncrono)
            setTimeout(recordTrigger, 500);

        }, true); // capture phase
    }

    // ===== API PÚBLICA =====
    window.MonetagOnClick = {
        /**
         * Inicializa o sistema onClick
         */
        init: function() {
            if (!isEnabled()) {
                console.log('[MonetagOnClick] Desabilitado pelo usuário');
                return;
            }

            activate();
            initClickInterceptor();

            console.log('[MonetagOnClick] Inicializado. Cooldown:', CONFIG.COOLDOWN/1000 + 's');
        },

        /**
         * Pausa temporariamente (útil quando AdGate abre)
         */
        pause: function() {
            isPaused = true;
            unloadScript();
            console.log('[MonetagOnClick] Pausado');
        },

        /**
         * Retoma
         */
        resume: function() {
            isPaused = false;
            activate();
            console.log('[MonetagOnClick] Retomado');
        },

        /**
         * Força disparo no próximo clique válido
         */
        trigger: function() {
            sessionCount = Math.max(0, sessionCount - 1);
            unloadScript();
            activate();
        },

        /**
         * Liga/desliga permanentemente
         */
        toggle: function() {
            const newState = !isEnabled();
            setEnabled(newState);
            if (newState) {
                this.resume();
            } else {
                this.pause();
                unloadScript();
            }
            return newState;
        },

        /**
         * Status atual
         */
        status: function() {
            return {
                enabled: isEnabled(),
                loaded: scriptLoaded,
                paused: isPaused,
                sessionCount: sessionCount,
                maxPerSession: CONFIG.MAX_PER_SESSION,
                cooldownActive: isCooldownActive(),
                remainingCooldown: Math.max(0, CONFIG.COOLDOWN - (Date.now() - getLastTrigger()))
            };
        },

        /**
         * Reset da sessão (debug)
         */
        reset: function() {
            sessionCount = 0;
            sessionStorage.removeItem(CONFIG.SESSION_KEY);
            unloadScript();
            activate();
        }
    };

    // ===== INTEGRAÇÃO COM ADGATE =====
    // Quando AdGate abre modal, pausamos onClick para não ter 2 anúncios simultâneos
    const adGateObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            const modal = document.getElementById('cr-adgate-modal');
            if (modal) {
                if (modal.classList.contains('active')) {
                    window.MonetagOnClick.pause();
                } else {
                    window.MonetagOnClick.resume();
                }
            }
        });
    });

    // Observa quando o AdGate modal é criado
    document.addEventListener('DOMContentLoaded', function() {
        const modal = document.getElementById('cr-adgate-modal');
        if (modal) {
            adGateObserver.observe(modal, { attributes: true, attributeFilter: ['class'] });
        }
    });

    // ===== INICIALIZAÇÃO =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.MonetagOnClick.init();
        });
    } else {
        window.MonetagOnClick.init();
    }

})();
