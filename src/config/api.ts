// Configuração da URL da API
// Detecta automaticamente se está em produção ou desenvolvimento
function getApiUrl(): string {
  // Se a variável de ambiente estiver definida, usa ela (prioridade máxima)
  if (import.meta.env.VITE_API_URL) {
    // Remove barra final se existir para evitar barras duplas
    return import.meta.env.VITE_API_URL.replace(/\/$/, '')
  }

  // Detecta se está rodando em produção (Vercel ou outro domínio)
  const isProduction = typeof window !== 'undefined' && 
                       window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1'

  if (isProduction) {
    // URL padrão da API em produção (sem barra final)
    return 'https://monetizespeed-api.vercel.app/api'
  }

  // Desenvolvimento local (sem barra final)
  return 'http://localhost:3000/api'
}

export const API_URL = getApiUrl()

// Função helper para construir URLs da API corretamente
export function apiUrl(endpoint: string): string {
  // Remove barra inicial do endpoint se existir
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  // Garante que não há barras duplas
  return `${API_URL}${cleanEndpoint}`
}

// Log para debug
if (typeof window !== 'undefined') {
  console.log('🔧 API URL configurada:', API_URL)
}

