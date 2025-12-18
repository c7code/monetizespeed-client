// Configuração da URL da API
// Detecta automaticamente se está em produção ou desenvolvimento
function getApiUrl(): string {
  // Se a variável de ambiente estiver definida, usa ela (prioridade máxima)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Detecta se está rodando em produção (Vercel ou outro domínio)
  const isProduction = typeof window !== 'undefined' && 
                       window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1'

  if (isProduction) {
    // Em produção sem variável configurada, mostra erro claro
    console.error('❌ ERRO: VITE_API_URL não configurada!')
    console.error('📝 Configure a variável de ambiente no Vercel:')
    console.error('   1. Settings → Environment Variables')
    console.error('   2. Adicione: VITE_API_URL = https://seu-backend.com/api')
    console.error('   3. Faça um novo deploy')
    
    // Tenta usar API na mesma origem como fallback
    // Se seu backend estiver em outro domínio, isso não funcionará
    return '/api'
  }

  // Desenvolvimento local
  return 'http://localhost:3000/api'
}

export const API_URL = getApiUrl()

// Log para debug
if (typeof window !== 'undefined') {
  console.log('🔧 API URL:', API_URL)
  if (API_URL.includes('localhost') && window.location.hostname !== 'localhost') {
    console.warn('⚠️ Usando localhost em produção! Configure VITE_API_URL no Vercel.')
  }
}

