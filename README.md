# 🎬 CineRadar - 100% Seguro

> Guia de Streaming com Player Integrado
> **Chaves de API NUNCA expostas no código!**

## 🛡️ Segurança

✅ **Chaves ficam apenas no servidor Vercel**  
✅ **Frontend chama proxy `/api/` — nunca vê as chaves**  
✅ **Código no GitHub está limpo, sem segredos**  

---

## 🚀 Deploy na Vercel

### 1. Subir no GitHub (código limpo!)

```bash
git init
git add .
git commit -m "CineRadar - chaves seguras no servidor"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/cineradar.git
git push -u origin main
```

> ⚠️ O código que sobe pro GitHub **NÃO TEM NENHUMA CHAVE**!

### 2. Configurar Environment Variables na Vercel

1. Acesse https://vercel.com → seu projeto → **Settings**
2. Vá em **Environment Variables**
3. Adicione:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `TMDB_API_KEY` | `sua_chave_tmdb` | Production |
| `WATCHMODE_API_KEY` | `sua_chave_watchmode` | Production |

4. Clique **Save** e depois **Redeploy**

### 3. Pronto!

As chaves ficam **no servidor**, o frontend só chama:
```
/api/onde-assistir.js?endpoint=trending&type=movie
```

O servidor faz a requisição real com as chaves seguras.

---

## 📁 Estrutura

```
cineradar-v2/
├── api/
│   └── onde-assistir.js      ← 🔒 Proxy seguro (chaves aqui no servidor)
├── js/
│   ├── config.js              ← SEM chaves! Aponta para /api/
│   ├── api.js                 ← Chama /api/onde-assistir.js
│   └── ...
├── css/
├── index.html
├── vercel.json                ← Configura serverless functions
└── .gitignore                 ← Ignora arquivos de env
```

---

## 🔑 Como funciona?

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────┐
│  Usuário    │ ──▶  │  Seu App         │ ──▶  │  Vercel      │
│  (navegador)│      │  (HTML/JS)       │      │  Servidor    │
└─────────────┘      └──────────────────┘      └──────┬───────┘
       │                    │                         │
       │                    │  /api/onde-assistir     │
       │                    │  (sem chaves!)          │
       │                    │                         │
       │                    │◀────────────────────────┘
       │                    │  JSON com dados
       │◀───────────────────┘
       │  Mostra filmes/séries
       │
       │  NUNCA vê as chaves!
       ▼
```

---

## ⚠️ Atenção

- ❌ **NUNCA** coloque chaves em `config.js`, `env.js` ou qualquer arquivo JS
- ❌ **NUNCA** commit chaves no GitHub
- ✅ **SEMPRE** use Environment Variables do Vercel
- ✅ O proxy `/api/onde-assistir.js` é a única coisa que vê as chaves

---

## 🎬 APIs utilizadas

- **TMDB** - Dados de filmes/séries (via proxy)
- **Watchmode** - Onde assistir (via proxy)
- **myembed.biz** - Player de vídeo (frontend)
