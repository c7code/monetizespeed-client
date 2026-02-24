import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { apiUrl } from '../config/api'
import logo from '../assets/TUDO NO AZUL-03.png'

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            return
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            return
        }

        setLoading(true)
        try {
            const response = await fetch(apiUrl('/auth/reset-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao redefinir senha')
            }

            setSuccess(true)
            setTimeout(() => navigate('/login'), 3000)
        } catch (err: any) {
            setError(err.message || 'Erro ao redefinir senha')
        } finally {
            setLoading(false)
        }
    }

    // Token inválido ou ausente
    if (!token) {
        return (
            <div className="h-screen h-[100dvh] flex items-center justify-center bg-dark-bg p-4 safe-top safe-bottom">
                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-8">
                        <img src={logo} alt="Tudo no Azul" className="w-48 h-48" />
                    </div>
                    <div className="bg-dark-card rounded-2xl shadow-xl border border-dark-border p-6 sm:p-8 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/15 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-white">Link inválido</h2>
                        <p className="text-sm text-gray-400">
                            Este link de recuperação é inválido ou expirou. Solicite um novo link.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="inline-block mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm font-medium transition-colors"
                        >
                            Solicitar novo link
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen h-[100dvh] flex items-center justify-center bg-dark-bg p-4 safe-top safe-bottom">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img src={logo} alt="Tudo no Azul" className="w-48 h-48" />
                </div>

                {/* Card */}
                <div className="bg-dark-card rounded-2xl shadow-xl border border-dark-border p-6 sm:p-8">
                    {success ? (
                        /* Sucesso */
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/15 flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-white">Senha redefinida!</h2>
                            <p className="text-sm text-gray-400">
                                Sua senha foi alterada com sucesso. Redirecionando para o login...
                            </p>
                            <Link
                                to="/login"
                                className="inline-block mt-2 text-sm text-blue-400 hover:text-blue-300 font-medium"
                            >
                                Ir para o login →
                            </Link>
                        </div>
                    ) : (
                        /* Formulário */
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-white mb-1">Redefinir Senha</h2>
                                <p className="text-sm text-gray-400">
                                    Escolha uma nova senha para sua conta.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="grid gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Nova Senha</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="6" y="10" width="12" height="10" rx="2" stroke="#6b7280" strokeWidth="1.5" /><path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="#6b7280" strokeWidth="1.5" /></svg>
                                        </span>
                                        <input
                                            className="w-full border border-dark-border bg-dark-surface text-gray-100 rounded-lg pl-10 pr-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            type="password"
                                            placeholder="Mínimo 6 caracteres"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Senha</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="6" y="10" width="12" height="10" rx="2" stroke="#6b7280" strokeWidth="1.5" /><path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="#6b7280" strokeWidth="1.5" /></svg>
                                        </span>
                                        <input
                                            className="w-full border border-dark-border bg-dark-surface text-gray-100 rounded-lg pl-10 pr-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            type="password"
                                            placeholder="Repita a nova senha"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="text-red-400 text-xs sm:text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white rounded-lg px-3 py-2.5 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-colors font-medium shadow-lg shadow-blue-600/20"
                                >
                                    {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                                </button>

                                <div className="text-center text-xs text-gray-400">
                                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">← Voltar para o login</Link>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
