import { useState, useEffect } from 'react'
import { useAuth } from '../store/auth'
import { apiUrl } from '../config/api'

type PaymentStatus = {
  plan_status: string
  plan_expires_at: string | null
  subscription: any
  access_codes: Array<{
    code: string
    status: string
    redeemed_by_user_id: number | null
    created_at: string
    redeemed_at: string | null
  }>
}

type Tab = 'subscribe' | 'buy-codes' | 'redeem'

export default function Subscription() {
  const { token, user, updatePlanStatus } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('subscribe')
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Subscribe form
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cpf, setCpf] = useState('')

  // Buy codes form
  const [quantity, setQuantity] = useState(1)

  // Redeem form
  const [redeemCode, setRedeemCode] = useState('')

  useEffect(() => {
    fetchStatus()
  }, [])

  async function fetchStatus() {
    try {
      setStatusLoading(true)
      const res = await fetch(apiUrl('/payments/status'), {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setPaymentStatus(data)
      }
    } catch (e) {
      console.error('Erro ao buscar status:', e)
    } finally {
      setStatusLoading(false)
    }
  }

  function formatCardNumber(value: string) {
    const digits = value.replace(/\D/g, '').substring(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, '').substring(0, 4)
    if (digits.length >= 3) return `${digits.substring(0, 2)}/${digits.substring(2)}`
    return digits
  }

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, '').substring(0, 11)
    if (digits.length > 9) return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9)}`
    if (digits.length > 6) return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6)}`
    if (digits.length > 3) return `${digits.substring(0, 3)}.${digits.substring(3)}`
    return digits
  }

  // Retorna os dados do cartão para o backend tokenizar
  function getCardData() {
    return {
      number: cardNumber.replace(/\s/g, ''),
      holder_name: cardName,
      exp_month: parseInt(cardExpiry.split('/')[0]),
      exp_year: parseInt('20' + cardExpiry.split('/')[1]),
      cvv: cardCvv,
    }
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setMessage(null)
    setLoading(true)

    try {
      const res = await fetch(apiUrl('/payments/subscribe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          card: getCardData(),
          document: cpf.replace(/\D/g, ''),
          name: cardName,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar assinatura')

      setMessage({ type: 'success', text: data.message })
      updatePlanStatus(data.plan_status, data.plan_expires_at)
      fetchStatus()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleBuyCodes(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setMessage(null)
    setLoading(true)

    try {
      const res = await fetch(apiUrl('/payments/buy-access-codes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          card: getCardData(),
          document: cpf.replace(/\D/g, ''),
          name: cardName,
          quantity,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao comprar códigos')

      let msg = data.message
      if (data.codes?.length) {
        msg += '\n\nCódigos gerados:\n' + data.codes.join('\n')
      }
      setMessage({ type: 'success', text: msg })
      fetchStatus()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setMessage(null)
    setLoading(true)

    try {
      const res = await fetch(apiUrl('/payments/redeem-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code: redeemCode }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao resgatar código')

      setMessage({ type: 'success', text: data.message })
      updatePlanStatus(data.plan_status, data.plan_expires_at)
      setRedeemCode('')
      fetchStatus()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelSubscription() {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return
    setMessage(null)
    setLoading(true)

    try {
      const res = await fetch(apiUrl('/payments/cancel-subscription'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao cancelar')

      setMessage({ type: 'success', text: data.message })
      fetchStatus()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  const isActive = paymentStatus?.plan_status === 'active'

  const tabs = [
    { id: 'subscribe' as Tab, label: '💳 Assinar Plano', icon: '💳' },
    { id: 'buy-codes' as Tab, label: '🎟️ Comprar Códigos', icon: '🎟️' },
    { id: 'redeem' as Tab, label: '🔑 Resgatar Código', icon: '🔑' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Assinatura & Planos</h1>
        <p className="text-gray-400 mt-1">Gerencie sua assinatura e códigos de acesso</p>
      </div>

      {/* Status Card */}
      <div className={`rounded-2xl p-6 border ${
        isActive
          ? 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30'
          : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-lg font-semibold text-white">
                {statusLoading ? 'Carregando...' : isActive ? 'Plano Ativo ✨' : 'Plano Gratuito'}
              </span>
            </div>
            {isActive && paymentStatus?.plan_expires_at && (
              <p className="text-sm text-gray-400 mt-2 ml-6">
                Acesso até {new Date(paymentStatus.plan_expires_at).toLocaleDateString('pt-BR')}
              </p>
            )}
            {!isActive && !statusLoading && (
              <p className="text-sm text-gray-400 mt-2 ml-6">
                Assine por <span className="text-cyan-400 font-bold">R$ 29,90/mês</span> para ter acesso completo
              </p>
            )}
          </div>
          {isActive && paymentStatus?.subscription?.status === 'active' && (
            <button
              onClick={handleCancelSubscription}
              disabled={loading}
              className="text-sm px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
            >
              Cancelar Assinatura
            </button>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-xl p-4 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border border-red-500/30 text-red-300'
        }`}>
          <pre className="whitespace-pre-wrap text-sm font-sans">{message.text}</pre>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-dark-card rounded-xl p-1.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setMessage(null) }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-dark-card rounded-2xl border border-dark-border p-6">

        {/* === TAB: Assinar Plano === */}
        {activeTab === 'subscribe' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Plano Mensal</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  R$ 29,90
                </span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="mt-4 space-y-2">
                {[
                  'Acesso completo a todas as funcionalidades',
                  'Chat financeiro com IA',
                  'Integração WhatsApp',
                  'Relatórios detalhados',
                  'Gestão de cartões e carteiras',
                  'Contas a pagar e receber',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Nome no Cartão</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    placeholder="Nome como está no cartão"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Número do Cartão</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    required
                    maxLength={19}
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono tracking-wider"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Validade</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/AA"
                    required
                    maxLength={5}
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">CVV</label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="000"
                    required
                    maxLength={4}
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">CPF</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={e => setCpf(formatCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    required
                    maxLength={14}
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-lg hover:from-blue-500 hover:to-cyan-500 transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processando...
                  </span>
                ) : (
                  'Assinar por R$ 29,90/mês'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                🔒 Pagamento seguro via Pagar.me. Cancele quando quiser.
              </p>
            </form>
          </div>
        )}

        {/* === TAB: Comprar Códigos === */}
        {activeTab === 'buy-codes' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Comprar Códigos de Acesso</h2>
              <p className="text-gray-400 text-sm">
                Compre códigos para compartilhar com amigos, familiares ou equipe.
                Cada código dá <span className="text-cyan-400 font-semibold">30 dias de acesso</span> ao Tudo no Azul.
              </p>
            </div>

            <form onSubmit={handleBuyCodes} className="space-y-4">
              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Quantidade de Códigos</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 5, 10].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`py-3 rounded-xl text-center font-semibold transition-all duration-200 ${
                        quantity === q
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-dark-bg border border-dark-border text-gray-400 hover:border-cyan-500/50 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{q}x</span>
                      <span className="block text-xs mt-0.5 opacity-70">
                        R$ {((q * 29.9)).toFixed(2).replace('.', ',')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-dark-bg rounded-xl p-4 border border-dark-border">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    R$ {(quantity * 29.9).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Card Fields (reuses same state) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Nome no Cartão</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    placeholder="Nome como está no cartão"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Número do Cartão</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    required
                    maxLength={19}
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono tracking-wider"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Validade</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/AA"
                    required
                    maxLength={5}
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">CVV</label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="000"
                    required
                    maxLength={4}
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">CPF</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={e => setCpf(formatCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    required
                    maxLength={14}
                    className="w-full px-4 py-3 rounded-xl bg-dark-bg border border-dark-border text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processando...
                  </span>
                ) : (
                  `Comprar ${quantity} código${quantity > 1 ? 's' : ''} — R$ ${(quantity * 29.9).toFixed(2).replace('.', ',')}`
                )}
              </button>
            </form>

            {/* Códigos comprados */}
            {paymentStatus?.access_codes && paymentStatus.access_codes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-3">Seus Códigos</h3>
                <div className="space-y-2">
                  {paymentStatus.access_codes.map((ac, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${
                      ac.status === 'active'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-dark-bg border-dark-border opacity-60'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-lg font-bold tracking-[0.2em] ${
                          ac.status === 'active' ? 'text-cyan-400' : 'text-gray-500 line-through'
                        }`}>
                          {ac.code}
                        </span>
                        {ac.status === 'active' && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(ac.code)
                              setMessage({ type: 'success', text: `Código ${ac.code} copiado!` })
                              setTimeout(() => setMessage(null), 2000)
                            }}
                            className="text-xs px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all"
                          >
                            Copiar
                          </button>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ac.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {ac.status === 'active' ? '✓ Disponível' : '✗ Usado'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === TAB: Resgatar Código === */}
        {activeTab === 'redeem' && (
          <div>
            <div className="mb-6 text-center">
              <div className="text-5xl mb-4">🎁</div>
              <h2 className="text-xl font-bold text-white mb-2">Resgatar Código de Acesso</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Recebeu um código de acesso? Insira abaixo para ativar <span className="text-cyan-400 font-semibold">30 dias</span> de acesso completo ao Tudo no Azul.
              </p>
            </div>

            <form onSubmit={handleRedeem} className="max-w-md mx-auto space-y-4">
              <div>
                <input
                  type="text"
                  value={redeemCode}
                  onChange={e => setRedeemCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8))}
                  placeholder="XXXXXXXX"
                  required
                  maxLength={8}
                  className="w-full px-6 py-4 rounded-xl bg-dark-bg border border-dark-border text-white text-center text-2xl font-mono tracking-[0.3em] placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || redeemCode.length < 8}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold text-lg hover:from-emerald-500 hover:to-cyan-500 transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verificando...
                  </span>
                ) : (
                  '🔓 Resgatar Código'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
