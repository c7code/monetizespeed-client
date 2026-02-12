import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import logo from '../assets/TUDO NO AZUL-03.png'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Falha no login')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        {/* Logo centralizada */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="tudo no azul" className="w-48 h-48" />
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 sm:p-8">


          <form onSubmit={submit} className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v12H4V6z" stroke="#6b7280" strokeWidth="1.5" /><path d="M4 7l8 6 8-6" stroke="#6b7280" strokeWidth="1.5" /></svg>
                </span>
                <input
                  className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg pl-10 pr-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="12" height="10" rx="2" stroke="#6b7280" strokeWidth="1.5" /><path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="#6b7280" strokeWidth="1.5" /></svg>
                </span>
                <input
                  className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg pl-10 pr-24 sm:pr-28 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPassword(p => p)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap"
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>

            {error && <div className="text-red-600 text-xs sm:text-sm bg-red-50 border border-red-200 rounded-lg p-2">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-blue-600 text-white rounded-lg px-3 py-2.5 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-colors font-medium shadow-sm"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="text-center text-xs text-gray-600">
              Não tem conta? <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">Cadastre-se</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
