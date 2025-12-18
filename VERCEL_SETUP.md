# Configuração do Vercel - Variáveis de Ambiente

## Problema
A aplicação está tentando fazer requisições para `localhost:3000` em produção porque a variável de ambiente `VITE_API_URL` não está configurada.

## Solução

### 1. Configurar Variável de Ambiente no Vercel

1. Acesse o [painel do Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto (`monetizespeed-client`)
3. Vá em **Settings** → **Environment Variables**
4. Clique em **Add New**
5. Configure:
   - **Name**: `VITE_API_URL`
   - **Value**: URL do seu backend em produção
     - Exemplo se backend está no Vercel: `https://seu-backend.vercel.app/api`
     - Exemplo se backend está em outro servidor: `https://api.seudominio.com/api`
   - **Environments**: Selecione todas (Production, Preview, Development)
6. Clique em **Save**

### 2. Fazer Novo Deploy

Após configurar a variável de ambiente:

1. Vá em **Deployments**
2. Clique nos três pontos (...) do último deploy
3. Selecione **Redeploy**
4. Ou faça um novo commit e push para o repositório

### 3. Verificar se Funcionou

Após o deploy, abra o DevTools (F12) → Console e verifique:
- Deve aparecer: `🔧 API URL configurada: [sua-url]`
- As requisições devem ir para a URL configurada, não para `localhost:3000`

## Importante

- ⚠️ A variável **DEVE** começar com `VITE_` para ser exposta no build do Vite
- ⚠️ A variável é incorporada no **build time**, não em runtime
- ⚠️ Após adicionar a variável, é necessário fazer um **novo deploy**

## Exemplo de URLs

- **Backend no Vercel**: `https://monetizespeed-api.vercel.app/api`
- **Backend em servidor próprio**: `https://api.monetizespeed.com/api`
- **Backend na mesma origem**: `/api` (se estiver usando proxy)

