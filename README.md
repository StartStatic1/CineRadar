# 🎬 CineRadar

## 🚨 ERRO "SITE BRANCO" - SOLUÇÃO RÁPIDA

Se o site ficou branco após deploy, é provavelmente um destes problemas:

### ❌ Problema 1: `vercel.json` com `builds` (CONFLITO)
**Solução:** O `vercel.json` foi corrigido. Agora usa apenas `rewrites` (modo moderno).

### ❌ Problema 2: API Routes não aparecem no deploy
**Solução:** Vá no Dashboard da Vercel → seu projeto → **Deployments** → clique no deploy mais recente → aba **Functions**. Deve aparecer:
```
/api/onde-assistir.js
```
Se NÃO aparecer, o `vercel.json` antigo estava bloqueando.

### ❌ Problema 3: Environment Variables não configuradas
**Solução:** 
1. Dashboard → Settings → Environment Variables
2. Adicione:
   - `TMDB_API_KEY` = sua chave do TMDB
3. **Redeploy** o projeto

---

## 🚀 Deploy Rápido (Passo a Passo)

### 1. Subir no GitHub
```bash
git add .
git commit -m "fix: vercel.json moderno"
git push
```

### 2. Na Vercel
- O deploy automático vai acontecer
- Vá em **Deployments** → clique no último
- Verifique se aparece **Functions: /api/onde-assistir.js**

### 3. Configurar Environment Variables
- Settings → Environment Variables
- `TMDB_API_KEY` = sua chave
- Salvar e **Redeploy**

### 4. Testar
- Abra o site
- Aperte **F12** → Console
- Deve ver: `🎬 CineRadar iniciando...`
- Se ver erro vermelho, cole aqui pra mim!

---

## 📁 Estrutura Corrigida

```
cineradar-v2/
├── api/
│   └── onde-assistir.js      ← Serverless Function (TMDB proxy)
├── js/
│   ├── config.js              ← SEM chaves expostas
│   ├── api.js                 ← Tenta proxy, fallback direto
│   └── ...
├── css/
├── index.html
├── vercel.json                ← Só rewrites (SEM builds!)
└── .gitignore
```

## 🔑 Segurança

- ✅ Chaves ficam no servidor Vercel (Environment Variables)
- ✅ Código no GitHub está limpo
- ✅ Proxy `/api/onde-assistir.js` faz as requisições seguras
