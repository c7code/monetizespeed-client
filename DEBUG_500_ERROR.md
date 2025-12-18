# Como Debugar Erro 500 no Backend

## Problema Atual
O frontend está funcionando corretamente e fazendo requisições para `https://monetizespeed-api.vercel.app/api/auth/login`, mas o servidor está retornando **500 Internal Server Error**.

## O que é Erro 500?
Erro 500 significa que há um problema **no servidor (backend)**, não no frontend. Possíveis causas:

1. **Erro no código do backend** (exceção não tratada)
2. **Variáveis de ambiente não configuradas** no backend Vercel
3. **Problema com banco de dados** (conexão, credenciais, etc)
4. **Dependências faltando** ou versões incompatíveis
5. **Problema com CORS** (menos provável, geralmente seria erro diferente)

## Como Verificar os Logs do Backend no Vercel

### 1. Acessar Logs do Deploy
1. Vá para: https://vercel.com/dashboard
2. Selecione o projeto do **backend** (`monetizespeed-api`)
3. Vá em **Deployments**
4. Clique no último deploy
5. Vá na aba **Logs** ou **Functions**

### 2. Verificar Logs em Tempo Real
1. No projeto do backend, vá em **Logs** (menu lateral)
2. Você verá os logs em tempo real
3. Procure por erros relacionados ao endpoint `/api/auth/login`

### 3. Verificar Variáveis de Ambiente do Backend
1. No projeto do backend, vá em **Settings** → **Environment Variables**
2. Verifique se todas as variáveis necessárias estão configuradas:
   - `DATABASE_URL` (se usar banco de dados)
   - `JWT_SECRET` (se usar autenticação JWT)
   - Outras variáveis que o backend precisa

## O que Verificar no Código do Backend

### 1. Verificar o Endpoint de Login
Procure pelo arquivo que trata `/api/auth/login` e verifique:
- Se está tratando erros corretamente
- Se está validando os dados recebidos
- Se está conectando ao banco de dados corretamente

### 2. Verificar Middleware de Erros
Certifique-se de que há um middleware global de tratamento de erros que:
- Captura exceções não tratadas
- Retorna respostas JSON apropriadas
- Loga os erros para debug

### 3. Exemplo de Tratamento de Erro (Node.js/Express)
```javascript
// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    // Em desenvolvimento, pode incluir stack trace
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})
```

## Testando Localmente

1. Clone o repositório do backend
2. Configure as variáveis de ambiente localmente (arquivo `.env`)
3. Execute o backend localmente
4. Teste a requisição com o mesmo payload que o frontend envia:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"teste@email.com","password":"senha123"}'
   ```

## Próximos Passos

1. ✅ Verificar logs do backend no Vercel
2. ✅ Verificar variáveis de ambiente do backend
3. ✅ Verificar se o código do backend está tratando erros
4. ✅ Testar o endpoint localmente
5. ✅ Corrigir o problema encontrado
6. ✅ Fazer novo deploy do backend

## Informações Úteis

- **URL do Backend**: `https://monetizespeed-api.vercel.app`
- **Endpoint com erro**: `/api/auth/login`
- **Método**: POST
- **Payload esperado**: `{ "email": string, "password": string }`


