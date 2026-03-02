import { useState, useEffect } from 'react'
import { useAuth } from '../store/auth'
import { API_URL } from '../config/api'

export default function WhatsApp() {
    const { token } = useAuth()
    const [phoneNumber, setPhoneNumber] = useState('')
    const [currentNumber, setCurrentNumber] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        try {
            const res = await fetch(`${API_URL}/user/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (res.ok && data.whatsapp_number) {
                setCurrentNumber(data.whatsapp_number)
                setPhoneNumber(data.whatsapp_number)
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const formatPhoneDisplay = (number: string) => {
        const digits = number.replace(/\D/g, '')
        if (digits.length === 11) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
        }
        if (digits.length === 13) {
            return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`
        }
        return number
    }

    const handleSave = async () => {
        const cleanNumber = phoneNumber.replace(/\D/g, '')
        if (cleanNumber.length < 10) {
            setMessage({ type: 'error', text: 'Por favor, insira um número de celular válido com DDD.' })
            return
        }

        setIsSaving(true)
        setMessage(null)
        try {
            const res = await fetch(`${API_URL}/user/whatsapp`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ whatsapp_number: cleanNumber }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Erro ao salvar')

            setCurrentNumber(cleanNumber)
            setMessage({ type: 'success', text: 'Número cadastrado com sucesso! Agora você pode enviar transações pelo WhatsApp.' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao salvar o número.' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleRemove = async () => {
        if (!confirm('Tem certeza que deseja remover seu número do WhatsApp?')) return

        setIsSaving(true)
        setMessage(null)
        try {
            const res = await fetch(`${API_URL}/user/whatsapp`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ whatsapp_number: '0000000000' }),
            })
            if (res.ok) {
                setCurrentNumber(null)
                setPhoneNumber('')
                setMessage({ type: 'success', text: 'Número removido com sucesso.' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Erro ao remover o número.' })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 p-8 md:p-10 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

                <div className="relative flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-5">
                        <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-3">WhatsApp Integrado</h1>
                    <p className="text-white/85 text-sm md:text-base max-w-lg leading-relaxed">
                        Registre transações enviando mensagens, áudios ou fotos de recibos direto pelo WhatsApp
                    </p>
                </div>
            </div>

            {/* Feedback Message */}
            {message && (
                <div className={`rounded-xl p-4 text-sm font-medium ${message.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}

            {/* Current Status */}
            {currentNumber && (
                <div className="bg-dark-card rounded-xl p-6 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                        </span>
                        <span className="text-green-400 text-sm font-semibold">Conectado</span>
                    </div>
                    <p className="text-white text-xl font-bold mb-3">{formatPhoneDisplay(currentNumber)}</p>
                    <button
                        onClick={handleRemove}
                        disabled={isSaving}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remover número
                    </button>
                </div>
            )}

            {/* QR Code - Iniciar conversa */}
            {currentNumber && (
                <div className="bg-dark-card rounded-xl p-6 border border-emerald-500/20">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* QR Code */}
                        <div className="shrink-0 bg-white rounded-xl p-3">
                            <img
                                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https%3A%2F%2Fwa.me%2F5581920039924&bgcolor=ffffff&color=000000"
                                alt="QR Code para abrir conversa no WhatsApp"
                                width={180}
                                height={180}
                                className="block"
                            />
                        </div>

                        {/* Instructions */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-lg font-semibold text-gray-200 mb-2 flex items-center justify-center md:justify-start gap-2">
                                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                Último passo: inicie a conversa!
                            </h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                Para receber mensagens do <strong className="text-green-400">Tudo no Azul</strong> no seu WhatsApp,
                                é necessário iniciar a conversa primeiro. Escaneie o QR code ao lado com a câmera do celular
                                ou clique no botão abaixo.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <a
                                    href="https://wa.me/5581920039924"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 active:scale-[0.98] text-sm"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Abrir conversa no WhatsApp
                                </a>
                                <span className="text-gray-600 text-xs">ou escaneie o QR code</span>
                            </div>

                            <p className="text-gray-600 text-xs mt-4">
                                💡 Após iniciar a conversa, envie qualquer mensagem (ex: "Oi") para ativar o recebimento de notificações.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Phone Input Card */}
            <div className="bg-dark-card rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-200 mb-2">
                    {currentNumber ? 'Alterar número' : 'Cadastrar número'}
                </h2>
                <p className="text-gray-500 text-sm mb-5">
                    Informe seu número de celular com DDD para conectar ao WhatsApp.
                </p>

                <div className="flex rounded-xl overflow-hidden border border-dark-border mb-5 focus-within:border-green-500/50 transition-colors">
                    <div className="px-4 py-3.5 bg-dark-bg border-r border-dark-border flex items-center gap-2 select-none">
                        <span className="text-base">🇧🇷</span>
                        <span className="text-gray-300 font-semibold text-sm">+55</span>
                    </div>
                    <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        maxLength={15}
                        className="flex-1 px-4 py-3.5 bg-dark-bg text-white text-base placeholder:text-gray-600 focus:outline-none"
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 ${isSaving
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/20 active:scale-[0.98]'
                        }`}
                >
                    {isSaving ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            {currentNumber ? 'Atualizar Número' : 'Conectar WhatsApp'}
                        </>
                    )}
                </button>
            </div>

            {/* How it Works */}
            <div className="bg-dark-card rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-200 mb-6">Como funciona</h2>

                <div className="space-y-0">
                    {[
                        {
                            icon: (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            ),
                            iconBg: 'bg-green-500/15 text-green-400',
                            title: '1. Envie uma mensagem',
                            desc: 'Mande um texto como "Gastei 50 reais no almoço", grave um áudio ou envie foto do recibo.',
                        },
                        {
                            icon: (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            ),
                            iconBg: 'bg-blue-500/15 text-blue-400',
                            title: '2. IA processa',
                            desc: 'Nossa IA analisa e categoriza automaticamente a transação.',
                        },
                        {
                            icon: (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ),
                            iconBg: 'bg-emerald-500/15 text-emerald-400',
                            title: '3. Confirmação instantânea',
                            desc: 'Receba a confirmação no WhatsApp e veja a transação no app.',
                        },
                    ].map((step, i) => (
                        <div key={i}>
                            <div className="flex items-start gap-4 py-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${step.iconBg}`}>
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-200">{step.title}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{step.desc}</p>
                                </div>
                            </div>
                            {i < 2 && <div className="border-b border-dark-border ml-14" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Examples */}
            <div className="bg-dark-card rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-200 mb-4">Exemplos de mensagens</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    {[
                        '💬 "Gastei 50 reais no almoço"',
                        '💬 "Recebi 2000 de salário"',
                        '💬 "Paguei 500 de aluguel"',
                        '🎤 Envie um áudio descrevendo o gasto',
                        '📷 Envie uma foto do recibo ou nota',
                    ].map((example, i) => (
                        <div
                            key={i}
                            className="bg-dark-bg rounded-lg px-4 py-3 text-sm text-gray-300 border border-dark-border"
                        >
                            {example}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
