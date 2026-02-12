import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import logo from '../assets/TUDO NO AZUL-03.png'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      await register(email, password, name)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo centralizada */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="tudo no azul" className="w-48 h-48" />
        </div>

        {/* Card de registro */}
        <div className="bg-dark-card rounded-2xl shadow-xl border border-dark-border p-6 sm:p-8">

          <form onSubmit={submit} className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome (opcional)</label>
              <input
                className="w-full border border-dark-border bg-dark-surface text-gray-100 rounded-lg px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                value={name}
                onChange={e => setName(e.target.value)}
                type="text"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v12H4V6z" stroke="#6b7280" strokeWidth="1.5" /><path d="M4 7l8 6 8-6" stroke="#6b7280" strokeWidth="1.5" /></svg>
                </span>
                <input
                  className="w-full border border-dark-border bg-dark-surface text-gray-100 rounded-lg pl-10 pr-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="12" height="10" rx="2" stroke="#6b7280" strokeWidth="1.5" /><path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="#6b7280" strokeWidth="1.5" /></svg>
                </span>
                <input
                  className="w-full border border-dark-border bg-dark-surface text-gray-100 rounded-lg pl-10 pr-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Senha</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="12" height="10" rx="2" stroke="#6b7280" strokeWidth="1.5" /><path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="#6b7280" strokeWidth="1.5" /></svg>
                </span>
                <input
                  className="w-full border border-dark-border bg-dark-surface text-gray-100 rounded-lg pl-10 pr-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="Confirme sua senha"
                  required
                />
              </div>
            </div>

            {error && <div className="text-red-400 text-xs sm:text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-2">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-blue-600 text-white rounded-lg px-3 py-2.5 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-colors font-medium shadow-lg shadow-blue-600/20"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>

            <div className="text-center text-xs text-gray-400">
              Já tem conta? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Faça login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
