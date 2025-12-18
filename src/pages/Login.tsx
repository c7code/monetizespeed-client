import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import hero from '../assets/finance-hero.svg'

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
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="text-xl sm:text-2xl font-semibold mb-2 text-white">MonetizeSpeed</div>
          <div className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">Organize receitas e despesas, acompanhe seu orçamento e alcance metas com confiança.</div>
          <form onSubmit={submit} className="grid gap-3">
            <label className="text-xs sm:text-sm text-gray-300">E-mail</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v12H4V6z" stroke="#9ca3af" strokeWidth="1.5"/><path d="M4 7l8 6 8-6" stroke="#9ca3af" strokeWidth="1.5"/></svg>
              </span>
              <input className="w-full border border-gray-600 bg-gray-700 text-white rounded pl-10 pr-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-400" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="seu@email.com" required />
            </div>
            <label className="text-xs sm:text-sm text-gray-300">Senha</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="12" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.5"/><path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="#9ca3af" strokeWidth="1.5"/></svg>
              </span>
              <input className="w-full border border-gray-600 bg-gray-700 text-white rounded pl-10 pr-24 sm:pr-28 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-400" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
              <button type="button" onClick={() => setPassword(p => p)} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-green-400 hover:text-green-300 whitespace-nowrap">Esqueci minha senha</button>
            </div>
            {error && <div className="text-red-400 text-xs sm:text-sm">{error}</div>}
            <button 
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-green-600 text-white rounded px-3 py-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <div className="text-xs text-gray-400">Não tem conta? <Link to="/register" className="text-green-400 hover:text-green-300">Cadastre-se</Link></div>
          </form>
        </div>
        <div className="relative hidden md:block">
          <img src={hero} alt="Finanças" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  )
}
