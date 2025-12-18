# Configuração do Vercel - Variáveis de Ambiente

## ✅ Configuração Atual

O frontend está configurado para usar automaticamente:
- **Produção**: `https://monetizespeed-api.vercel.app/api`
- **Desenvolvimento**: `http://localhost:3000/api`

## Configuração Opcional (Variável de Ambiente)

Se você quiser usar uma URL diferente da padrão, pode configurar a variável de ambiente `VITE_API_URL`:

### 1. Configurar Variável de Ambiente no Vercel (Opcional)

1. Acesse o [painel do Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto (`monetizespeed-client`)
3. Vá em **Settings** → **Environment Variables**
4. Clique em **Add New**
5. Configure:
   - **Name**: `VITE_API_URL`
   - **Value**: URL do seu backend (ex: `https://monetizespeed-api.vercel.app/api`)
   - **Environments**: Selecione todas (Production, Preview, Development)
6. Clique em **Save**

### 2. Fazer Novo Deploy

Se você configurar a variável de ambiente:

1. Vá em **Deployments**
2. Clique nos três pontos (...) do último deploy
3. Selecione **Redeploy**
4. Ou faça um novo commit e push para o repositório

### 3. Verificar se Funcionou

Após o deploy, abra o DevTools (F12) → Console e verifique:
- Deve aparecer: `🔧 API URL configurada: https://monetizespeed-api.vercel.app/api`
- As requisições devem ir para a URL configurada

## Importante

- ✅ **Por padrão**, o frontend já usa `https://monetizespeed-api.vercel.app/api` em produção
- ⚠️ Se configurar `VITE_API_URL`, ela terá **prioridade** sobre o padrão
- ⚠️ A variável **DEVE** começar com `VITE_` para ser exposta no build do Vite
- ⚠️ A variável é incorporada no **build time**, não em runtime


