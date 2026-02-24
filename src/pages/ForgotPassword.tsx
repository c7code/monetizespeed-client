import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiUrl } from '../config/api'
import logo from '../assets/TUDO NO AZUL-03.png'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await fetch(apiUrl('/auth/forgot-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar solicitação')
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar email de recuperação')
        } finally {
            setLoading(false)
        }
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
                        /* Mensagem de sucesso */
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/15 flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-white">Email enviado!</h2>
                            <p className="text-sm text-gray-400">
                                Se o email <strong className="text-gray-200">{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
                            </p>
                            <p className="text-xs text-gray-500">
                                Verifique também a pasta de spam. O link expira em 1 hora.
                            </p>
                            <Link
                                to="/login"
                                className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 font-medium"
                            >
                                ← Voltar para o login
                            </Link>
                        </div>
                    ) : (
                        /* Formulário */
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-white mb-1">Esqueceu sua senha?</h2>
                                <p className="text-sm text-gray-400">
                                    Informe seu email e enviaremos um link para redefinir sua senha.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="grid gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4V6z" stroke="#6b7280" strokeWidth="1.5" /><path d="M4 7l8 6 8-6" stroke="#6b7280" strokeWidth="1.5" /></svg>
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
                                    {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                                </button>

                                <div className="text-center text-xs text-gray-400">
                                    Lembrou a senha? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Fazer login</Link>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
