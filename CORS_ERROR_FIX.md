# Correção do Erro de CORS

## Problema Identificado

O erro de CORS está ocorrendo porque:
1. ✅ **Frontend corrigido**: A URL com barra dupla (`/api//auth/login`) foi corrigida
2. ❌ **Backend precisa corrigir**: O backend está redirecionando requisições OPTIONS (preflight), o que não é permitido

## Erro Específico

```
Access to fetch at 'https://monetizespeed-api.vercel.app/api/auth/login' 
from origin 'https://monetizespeed-client-black.vercel.app' 
has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
Redirect is not allowed for a preflight request.
```

## O que é Preflight Request?

Quando o navegador faz uma requisição CORS (cross-origin), ele primeiro envia uma requisição **OPTIONS** para verificar se o servidor permite a requisição. Isso é chamado de "preflight request".

**O problema**: O backend está **redirecionando** essa requisição OPTIONS em vez de responder diretamente com os headers CORS corretos.

## Solução no Backend

### 1. Configurar CORS Corretamente

O backend precisa:
- **Responder diretamente** às requisições OPTIONS (não redirecionar)
- **Incluir os headers CORS** corretos na resposta
- **Permitir a origem** do frontend

### 2. Exemplo para Node.js/Express

```javascript
const cors = require('cors');

// Configurar CORS
app.use(cors({
  origin: [
    'https://monetizespeed-client-black.vercel.app',
    'http://localhost:5173', // Para desenvolvimento
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// OU manualmente:
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://monetizespeed-client-black.vercel.app',
    'http://localhost:5173',
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // IMPORTANTE: Responder diretamente ao OPTIONS, sem redirecionar
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});
```

### 3. Verificar Configuração do Vercel

Se o backend está usando serverless functions no Vercel, verifique:

1. **Não redirecionar requisições OPTIONS**
2. **Headers CORS devem estar nas respostas**, não apenas nas rotas principais
3. **Verificar se há middleware de redirecionamento** que está interferindo

### 4. Exemplo para Vercel Serverless Functions

```javascript
// api/auth/login.js (ou similar)
export default async function handler(req, res) {
  // Configurar CORS headers ANTES de qualquer coisa
  res.setHeader('Access-Control-Allow-Origin', 'https://monetizespeed-client-black.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Responder ao preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Resto do código da função...
  if (req.method === 'POST') {
    // Lógica de login
  }
}
```

## Checklist para Corrigir

- [ ] Backend responde diretamente a requisições OPTIONS (sem redirecionar)
- [ ] Headers CORS estão configurados corretamente
- [ ] Origem do frontend está na lista de origens permitidas
- [ ] Headers `Access-Control-Allow-Headers` incluem `Content-Type` e `Authorization`
- [ ] Não há middleware de redirecionamento interferindo nas requisições OPTIONS

## Testando

Após corrigir o backend:

1. Faça deploy do backend
2. Teste a requisição no frontend
3. Verifique no DevTools → Network:
   - A requisição OPTIONS deve retornar `200 OK`
   - Headers de resposta devem incluir `Access-Control-Allow-Origin`
   - A requisição POST deve funcionar normalmente

## Referências

- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Vercel - CORS Headers](https://vercel.com/docs/concepts/functions/serverless-functions#cors)

