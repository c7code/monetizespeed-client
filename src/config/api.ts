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
    // URL padrão da API em produção
    return 'https://monetizespeed-api.vercel.app/api'
  }

  // Desenvolvimento local
  return 'http://localhost:3000/api'
}

export const API_URL = getApiUrl()

// Log para debug
if (typeof window !== 'undefined') {
  console.log('🔧 API URL configurada:', API_URL)
}

