import { useState, useEffect } from 'react'
import { useAuth } from '../store/auth'
import { apiUrl } from '../config/api'

type Plan = {
  id: number
  name: string
  description: string | null
  billing_type: 'monthly' | 'yearly'
  status: 'active' | 'inactive'
  price_card: number
  price_pix: number
  promo_price_card: number | null
  promo_price_pix: number | null
  created_at: string
  updated_at: string
}

type Coupon = {
  id: number
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  applies_to: 'monthly' | 'yearly' | 'both'
  status: 'active' | 'inactive'
  valid_until: string | null
  duration_months: number | null
  created_at: string
  updated_at: string
}

type Tab = 'plans' | 'coupons' | 'codes'

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function parseCurrency(value: string): number {
  const clean = value.replace(/[^\d,]/g, '').replace(',', '.')
  return Math.round(parseFloat(clean || '0') * 100)
}

export default function AdminPlans() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('plans')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Plans state
  const [plans, setPlans] = useState<Plan[]>([])
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    billing_type: 'monthly' as 'monthly' | 'yearly',
    status: 'active' as 'active' | 'inactive',
    price_card: '',
    price_pix: '',
    promo_price_card: '',
    promo_price_pix: '',
  })

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null)
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    applies_to: 'both' as 'monthly' | 'yearly' | 'both',
    status: 'active' as 'active' | 'inactive',
    valid_until: '',
    duration_months: '',
  })

  // Show form toggles
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [showCouponForm, setShowCouponForm] = useState(false)

  // Access Codes state
  type AccessCode = {
    id: number
    code: string
    purchaser_user_id: number | null
    purchaser_email: string | null
    purchaser_name: string | null
    order_id: string | null
    status: 'active' | 'redeemed'
    redeemed_by_user_id: number | null
    redeemed_by_email: string | null
    redeemed_by_name: string | null
    duration_days: number
    created_at: string
    redeemed_at: string | null
  }
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([])
  const [showCodeForm, setShowCodeForm] = useState(false)
  const [codeForm, setCodeForm] = useState({ quantity: '1', duration_days: '30' })
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])
  const [copiedCodes, setCopiedCodes] = useState(false)

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  // ========== PLANS ==========

  const fetchPlans = async () => {
    try {
      const res = await fetch(apiUrl('/plans'), {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setPlans(data)
      }
    } catch (e) {
      console.error('Erro ao buscar planos:', e)
    }
  }

  const resetPlanForm = () => {
    setPlanForm({
      name: '',
      description: '',
      billing_type: 'monthly',
      status: 'active',
      price_card: '',
      price_pix: '',
      promo_price_card: '',
      promo_price_pix: '',
    })
    setEditingPlanId(null)
    setShowPlanForm(false)
  }

  const handleEditPlan = (plan: Plan) => {
    setPlanForm({
      name: plan.name,
      description: plan.description || '',
      billing_type: plan.billing_type,
      status: plan.status,
      price_card: formatCurrency(plan.price_card),
      price_pix: formatCurrency(plan.price_pix),
      promo_price_card: plan.promo_price_card ? formatCurrency(plan.promo_price_card) : '',
      promo_price_pix: plan.promo_price_pix ? formatCurrency(plan.promo_price_pix) : '',
    })
    setEditingPlanId(plan.id)
    setShowPlanForm(true)
  }

  const handleSavePlan = async () => {
    if (!planForm.name.trim()) {
      showMsg('error', 'Nome do plano é obrigatório')
      return
    }

    setLoading(true)
    try {
      const body = {
        name: planForm.name,
        description: planForm.description || null,
        billing_type: planForm.billing_type,
        status: planForm.status,
        price_card: parseCurrency(planForm.price_card),
        price_pix: parseCurrency(planForm.price_pix),
        promo_price_card: planForm.promo_price_card ? parseCurrency(planForm.promo_price_card) : null,
        promo_price_pix: planForm.promo_price_pix ? parseCurrency(planForm.promo_price_pix) : null,
      }

      const isEdit = editingPlanId !== null
      const url = isEdit ? apiUrl(`/plans/${editingPlanId}`) : apiUrl('/plans')
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar plano')

      showMsg('success', isEdit ? 'Plano atualizado com sucesso!' : 'Plano criado com sucesso!')
      resetPlanForm()
      fetchPlans()
    } catch (e: any) {
      showMsg('error', e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlan = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o plano "${name}"?`)) return

    try {
      const res = await fetch(apiUrl(`/plans/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao excluir')
      }
      showMsg('success', `Plano "${name}" excluído`)
      fetchPlans()
    } catch (e: any) {
      showMsg('error', e.message)
    }
  }

  const handleTogglePlanStatus = async (plan: Plan) => {
    try {
      const newStatus = plan.status === 'active' ? 'inactive' : 'active'
      const res = await fetch(apiUrl(`/plans/${plan.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Erro ao alterar status')
      fetchPlans()
    } catch (e: any) {
      showMsg('error', e.message)
    }
  }

  // ========== COUPONS ==========

  const fetchCoupons = async () => {
    try {
      const res = await fetch(apiUrl('/coupons'), {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCoupons(data)
      }
    } catch (e) {
      console.error('Erro ao buscar cupons:', e)
    }
  }

  const resetCouponForm = () => {
    setCouponForm({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      applies_to: 'both',
      status: 'active',
      valid_until: '',
      duration_months: '',
    })
    setEditingCouponId(null)
    setShowCouponForm(false)
  }

  const handleEditCoupon = (coupon: Coupon) => {
    setCouponForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_type === 'fixed'
        ? formatCurrency(coupon.discount_value)
        : String(coupon.discount_value),
      applies_to: coupon.applies_to,
      status: coupon.status,
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      duration_months: coupon.duration_months ? String(coupon.duration_months) : '',
    })
    setEditingCouponId(coupon.id)
    setShowCouponForm(true)
  }

  const handleSaveCoupon = async () => {
    if (!couponForm.code.trim()) {
      showMsg('error', 'Código do cupom é obrigatório')
      return
    }

    setLoading(true)
    try {
      const body = {
        code: couponForm.code.toUpperCase(),
        discount_type: couponForm.discount_type,
        discount_value: couponForm.discount_type === 'fixed'
          ? parseCurrency(couponForm.discount_value)
          : parseInt(couponForm.discount_value) || 0,
        applies_to: couponForm.applies_to,
        status: couponForm.status,
        valid_until: couponForm.valid_until || null,
        duration_months: couponForm.duration_months ? parseInt(couponForm.duration_months) : null,
      }

      const isEdit = editingCouponId !== null
      const url = isEdit ? apiUrl(`/coupons/${editingCouponId}`) : apiUrl('/coupons')
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar cupom')

      showMsg('success', isEdit ? 'Cupom atualizado!' : 'Cupom criado!')
      resetCouponForm()
      fetchCoupons()
    } catch (e: any) {
      showMsg('error', e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCoupon = async (id: number, code: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cupom "${code}"?`)) return

    try {
      const res = await fetch(apiUrl(`/coupons/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao excluir')
      }
      showMsg('success', `Cupom "${code}" excluído`)
      fetchCoupons()
    } catch (e: any) {
      showMsg('error', e.message)
    }
  }

  const handleToggleCouponStatus = async (coupon: Coupon) => {
    try {
      const newStatus = coupon.status === 'active' ? 'inactive' : 'active'
      const res = await fetch(apiUrl(`/coupons/${coupon.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Erro ao alterar status')
      fetchCoupons()
    } catch (e: any) {
      showMsg('error', e.message)
    }
  }

  useEffect(() => {
    fetchPlans()
    fetchCoupons()
    fetchAccessCodes()
  }, [])

  // ========== ACCESS CODES ==========

  const fetchAccessCodes = async () => {
    try {
      const res = await fetch(apiUrl('/plans/access-codes'), {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setAccessCodes(data)
      }
    } catch (e) {
      console.error('Erro ao buscar códigos:', e)
    }
  }

  const handleGenerateCodes = async () => {
    setLoading(true)
    setGeneratedCodes([])
    try {
      const res = await fetch(apiUrl('/plans/access-codes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: parseInt(codeForm.quantity) || 1,
          duration_days: parseInt(codeForm.duration_days) || 30,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar códigos')

      showMsg('success', data.message)
      setGeneratedCodes(data.codes)
      fetchAccessCodes()
    } catch (e: any) {
      showMsg('error', e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCode = async (id: number, code: string) => {
    if (!confirm(`Excluir código "${code}"?`)) return
    try {
      const res = await fetch(apiUrl(`/plans/access-codes/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao excluir')
      }
      showMsg('success', `Código "${code}" excluído`)
      fetchAccessCodes()
    } catch (e: any) {
      showMsg('error', e.message)
    }
  }

  const handleCopyAllCodes = () => {
    navigator.clipboard.writeText(generatedCodes.join('\n'))
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 3000)
  }

  const tabs = [
    { id: 'plans' as Tab, label: '📋 Planos', count: plans.length },
    { id: 'coupons' as Tab, label: '🏷️ Cupons', count: coupons.length },
    { id: 'codes' as Tab, label: '🔑 Códigos', count: accessCodes.filter(c => c.status === 'active').length },
  ]

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Gestão de Planos, Cupons & Códigos</h1>
        <p className="text-gray-400 text-sm mt-1">Gerencie planos de assinatura, cupons de desconto e códigos de acesso</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-dark-card rounded-xl p-1.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setMessage(null) }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-hover'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-dark-surface'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ========== TAB: PLANOS ========== */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          {/* Botão criar */}
          {!showPlanForm && (
            <button
              onClick={() => { resetPlanForm(); setShowPlanForm(true) }}
              className="w-full py-3 rounded-xl border-2 border-dashed border-dark-border text-gray-400 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Plano
            </button>
          )}

          {/* Formulário de plano */}
          {showPlanForm && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-white mb-4">
                {editingPlanId ? 'Editar Plano' : 'Novo Plano'}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Nome</label>
                    <input
                      type="text"
                      value={planForm.name}
                      onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                      placeholder="Ex: Mensal, Anual Premium"
                      className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Tipo</label>
                    <select
                      value={planForm.billing_type}
                      onChange={e => setPlanForm({ ...planForm, billing_type: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="monthly">📅 Mensal</option>
                      <option value="yearly">📆 Anual</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Descrição</label>
                  <input
                    type="text"
                    value={planForm.description}
                    onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                    placeholder="Descrição curta do plano"
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">💳 Preço Cartão</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <input
                        type="text"
                        value={planForm.price_card}
                        onChange={e => setPlanForm({ ...planForm, price_card: e.target.value })}
                        placeholder="29,90"
                        className="w-full pl-10 pr-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">📱 Preço PIX</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <input
                        type="text"
                        value={planForm.price_pix}
                        onChange={e => setPlanForm({ ...planForm, price_pix: e.target.value })}
                        placeholder="29,90"
                        className="w-full pl-10 pr-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">💳 Promo Cartão</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <input
                        type="text"
                        value={planForm.promo_price_card}
                        onChange={e => setPlanForm({ ...planForm, promo_price_card: e.target.value })}
                        placeholder="Opcional"
                        className="w-full pl-10 pr-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">📱 Promo PIX</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <input
                        type="text"
                        value={planForm.promo_price_pix}
                        onChange={e => setPlanForm({ ...planForm, promo_price_pix: e.target.value })}
                        placeholder="Opcional"
                        className="w-full pl-10 pr-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Status</label>
                  <select
                    value={planForm.status}
                    onChange={e => setPlanForm({ ...planForm, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">✅ Ativo</option>
                    <option value="inactive">⏸️ Inativo</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSavePlan}
                    disabled={loading}
                    className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors font-medium text-sm shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Salvando...' : editingPlanId ? 'Atualizar Plano' : 'Criar Plano'}
                  </button>
                  <button
                    onClick={resetPlanForm}
                    className="px-6 py-2.5 bg-dark-bg border border-dark-border text-gray-400 rounded-xl hover:bg-dark-hover transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de planos */}
          {plans.length === 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center">
              <p className="text-gray-500">Nenhum plano cadastrado ainda.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`bg-dark-card border rounded-2xl p-5 transition-all ${
                    plan.status === 'active' ? 'border-dark-border hover:border-blue-500/40' : 'border-dark-border opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          plan.billing_type === 'monthly'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                        }`}>
                          {plan.billing_type === 'monthly' ? 'Mensal' : 'Anual'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          plan.status === 'active'
                            ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                        }`}>
                          {plan.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleTogglePlanStatus(plan)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          plan.status === 'active'
                            ? 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10'
                            : 'text-gray-500 hover:text-green-400 hover:bg-green-500/10'
                        }`}
                        title={plan.status === 'active' ? 'Desativar' : 'Ativar'}
                      >
                        {plan.status === 'active' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Preços */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-dark-bg rounded-xl p-3 border border-dark-border">
                      <div className="text-xs text-gray-500 mb-1">💳 Cartão</div>
                      <div className="text-lg font-bold text-white">
                        R$ {formatCurrency(plan.price_card)}
                      </div>
                      {plan.promo_price_card && (
                        <div className="text-xs text-green-400 mt-0.5">
                          Promo: R$ {formatCurrency(plan.promo_price_card)}
                        </div>
                      )}
                    </div>
                    <div className="bg-dark-bg rounded-xl p-3 border border-dark-border">
                      <div className="text-xs text-gray-500 mb-1">📱 PIX</div>
                      <div className="text-lg font-bold text-white">
                        R$ {formatCurrency(plan.price_pix)}
                      </div>
                      {plan.promo_price_pix && (
                        <div className="text-xs text-green-400 mt-0.5">
                          Promo: R$ {formatCurrency(plan.promo_price_pix)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== TAB: CUPONS ========== */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          {/* Botão criar */}
          {!showCouponForm && (
            <button
              onClick={() => { resetCouponForm(); setShowCouponForm(true) }}
              className="w-full py-3 rounded-xl border-2 border-dashed border-dark-border text-gray-400 hover:border-purple-500/50 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Cupom
            </button>
          )}

          {/* Formulário de cupom */}
          {showCouponForm && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-white mb-4">
                {editingCouponId ? 'Editar Cupom' : 'Novo Cupom'}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Código</label>
                    <input
                      type="text"
                      value={couponForm.code}
                      onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                      placeholder="EX: DESCONTO20"
                      maxLength={20}
                      className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono tracking-wider"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Tipo de Desconto</label>
                    <select
                      value={couponForm.discount_type}
                      onChange={e => setCouponForm({ ...couponForm, discount_type: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="percentage">% Percentual</option>
                      <option value="fixed">R$ Valor Fixo</option>
                    </select>
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      {couponForm.discount_type === 'percentage' ? 'Percentual (%)' : 'Valor (R$)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        {couponForm.discount_type === 'percentage' ? '%' : 'R$'}
                      </span>
                      <input
                        type="text"
                        value={couponForm.discount_value}
                        onChange={e => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                        placeholder={couponForm.discount_type === 'percentage' ? '20' : '10,00'}
                        className="w-full pl-10 pr-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Aplica em</label>
                    <select
                      value={couponForm.applies_to}
                      onChange={e => {
                        const val = e.target.value as 'monthly' | 'yearly' | 'both'
                        setCouponForm({ ...couponForm, applies_to: val, duration_months: val === 'monthly' ? couponForm.duration_months : '' })
                      }}
                      className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="both">📊 Mensal e Anual</option>
                      <option value="monthly">📅 Só Mensal</option>
                      <option value="yearly">📆 Só Anual</option>
                    </select>
                  </div>
                  {couponForm.applies_to === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">⏱️ Duração (opcional)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={couponForm.duration_months}
                        onChange={e => setCouponForm({ ...couponForm, duration_months: e.target.value })}
                        placeholder="Ex: 2"
                        className="w-full px-4 pr-16 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">meses</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Vazio = desconto para sempre</p>
                  </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Validade (opcional)</label>
                    <input
                      type="date"
                      value={couponForm.valid_until}
                      onChange={e => setCouponForm({ ...couponForm, valid_until: e.target.value })}
                      className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Status</label>
                  <select
                    value={couponForm.status}
                    onChange={e => setCouponForm({ ...couponForm, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">✅ Ativo</option>
                    <option value="inactive">⏸️ Inativo</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveCoupon}
                    disabled={loading}
                    className="flex-1 px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors font-medium text-sm shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Salvando...' : editingCouponId ? 'Atualizar Cupom' : 'Criar Cupom'}
                  </button>
                  <button
                    onClick={resetCouponForm}
                    className="px-6 py-2.5 bg-dark-bg border border-dark-border text-gray-400 rounded-xl hover:bg-dark-hover transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de cupons */}
          {coupons.length === 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center">
              <p className="text-gray-500">Nenhum cupom cadastrado ainda.</p>
            </div>
          ) : (
            <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-dark-border">
                <h2 className="text-lg font-semibold text-white">Cupons de Desconto ({coupons.length})</h2>
              </div>
              <div className="divide-y divide-dark-border">
                {coupons.map(coupon => (
                  <div key={coupon.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-dark-surface/50 transition-colors">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-lg font-bold tracking-wider text-cyan-400">{coupon.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        coupon.discount_type === 'percentage'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : `R$ ${formatCurrency(coupon.discount_value)}`}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        coupon.applies_to === 'monthly'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : coupon.applies_to === 'yearly'
                          ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                          : 'bg-gray-500/15 text-gray-300 border border-gray-500/30'
                      }`}>
                        {coupon.applies_to === 'monthly' ? 'Mensal' : coupon.applies_to === 'yearly' ? 'Anual' : 'Ambos'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        coupon.status === 'active'
                          ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                          : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                      }`}>
                        {coupon.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                      {coupon.duration_months && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          ⏱️ {coupon.duration_months} {coupon.duration_months === 1 ? 'mês' : 'meses'}
                        </span>
                      )}
                      {coupon.valid_until && (
                        <span className="text-xs text-gray-500">
                          até {new Date(coupon.valid_until).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleToggleCouponStatus(coupon)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          coupon.status === 'active'
                            ? 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10'
                            : 'text-gray-500 hover:text-green-400 hover:bg-green-500/10'
                        }`}
                        title={coupon.status === 'active' ? 'Desativar' : 'Ativar'}
                      >
                        {coupon.status === 'active' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleEditCoupon(coupon)}
                        className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* ========== TAB: CÓDIGOS DE ACESSO ========== */}
      {activeTab === 'codes' && (
        <div className="space-y-4">
          {/* Botão gerar */}
          {!showCodeForm && !generatedCodes.length && (
            <button
              onClick={() => { setShowCodeForm(true); setGeneratedCodes([]) }}
              className="w-full py-3 rounded-xl border-2 border-dashed border-dark-border text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Gerar Códigos de Acesso
            </button>
          )}

          {/* Formulário de geração */}
          {showCodeForm && !generatedCodes.length && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-white mb-4">🔑 Gerar Códigos de Acesso</h2>
              <p className="text-sm text-gray-500 mb-4">Gere códigos que liberam o acesso ao sistema sem necessidade de pagamento.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={codeForm.quantity}
                    onChange={e => setCodeForm({ ...codeForm, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Duração (dias)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="3650"
                      value={codeForm.duration_days}
                      onChange={e => setCodeForm({ ...codeForm, duration_days: e.target.value })}
                      className="w-full px-4 pr-14 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">dias</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">30 = 1 mês, 365 = 1 ano</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleGenerateCodes}
                  disabled={loading}
                  className="flex-1 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors font-medium text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Gerando...' : `Gerar ${codeForm.quantity || 1} código(s)`}
                </button>
                <button
                  onClick={() => setShowCodeForm(false)}
                  className="px-6 py-2.5 bg-dark-bg border border-dark-border text-gray-400 rounded-xl hover:bg-dark-hover transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Códigos gerados */}
          {generatedCodes.length > 0 && (
            <div className="bg-dark-card border border-emerald-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">✅ Códigos Gerados!</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyAllCodes}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
                  >
                    {copiedCodes ? '✅ Copiados!' : '📋 Copiar Todos'}
                  </button>
                  <button
                    onClick={() => { setGeneratedCodes([]); setShowCodeForm(false) }}
                    className="px-4 py-2 rounded-xl bg-dark-bg border border-dark-border text-gray-400 text-sm hover:bg-dark-hover transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {generatedCodes.map((code, i) => (
                  <div
                    key={i}
                    onClick={() => { navigator.clipboard.writeText(code) }}
                    className="bg-dark-bg border border-dark-border rounded-xl p-3 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                  >
                    <span className="font-mono text-sm font-bold text-emerald-400 tracking-wider">{code}</span>
                    <p className="text-[10px] text-gray-600 mt-1 group-hover:text-gray-400">clique para copiar</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">Duração: {codeForm.duration_days} dia(s) cada código</p>
            </div>
          )}

          {/* Lista de códigos */}
          {accessCodes.length === 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center">
              <p className="text-gray-500">Nenhum código de acesso cadastrado ainda.</p>
            </div>
          ) : (
            <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-dark-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Códigos de Acesso ({accessCodes.length})</h2>
                <div className="flex gap-3 text-xs">
                  <span className="text-emerald-400">● {accessCodes.filter(c => c.status === 'active').length} ativos</span>
                  <span className="text-gray-500">● {accessCodes.filter(c => c.status === 'redeemed').length} resgatados</span>
                </div>
              </div>
              <div className="divide-y divide-dark-border">
                {accessCodes.map(ac => (
                  <div key={ac.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-dark-surface/50 transition-colors">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`font-mono text-lg font-bold tracking-wider ${ac.status === 'active' ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {ac.code}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ac.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                      }`}>
                        {ac.status === 'active' ? 'Ativo' : 'Resgatado'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {ac.duration_days} dias
                      </span>
                      {ac.order_id === 'ADMIN_GENERATED' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          Admin
                        </span>
                      )}
                      {ac.purchaser_email && (
                        <span className="text-xs text-gray-500">
                          por {ac.purchaser_name || ac.purchaser_email}
                        </span>
                      )}
                      {ac.redeemed_by_email && (
                        <span className="text-xs text-cyan-400">
                          → {ac.redeemed_by_name || ac.redeemed_by_email}
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        {new Date(ac.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {ac.status === 'active' && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(ac.code)
                            showMsg('success', `Código "${ac.code}" copiado!`)
                          }}
                          className="p-1.5 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Copiar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCode(ac.id, ac.code)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
