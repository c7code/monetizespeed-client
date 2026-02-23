import { useState } from 'react'
import { useData, presetCategories } from '../store/data'

// Ícones e cores por categoria
const categoryConfig: Record<string, { icon: JSX.Element; color: string; bgColor: string }> = {
  'Alimentação': {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/15'
  },
  'Moradia': {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/15'
  },
  'Lazer': {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15'
  },
  'Transporte': {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M16 3v18" /><path d="M8 3v18" /><path d="M3 8h18" /><path d="M3 16h18" />
      </svg>
    ),
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15'
  },
  'Salário': {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    color: 'text-green-400',
    bgColor: 'bg-green-500/15'
  },
  'Saúde': {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/15'
  },
}

function getCategoryConfig(category: string) {
  return categoryConfig[category] || {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" />
      </svg>
    ),
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/15'
  }
}

export default function Budgets() {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget } = useData()
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState<number | string>('')
  const [msg, setMsg] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCategory, setEditCategory] = useState('')
  const [editLimit, setEditLimit] = useState<number | string>(0)
  const [showAddCard, setShowAddCard] = useState(false)

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) {
      setMsg('Selecione uma categoria')
      setTimeout(() => setMsg(''), 3000)
      return
    }
    if (Number(limit) > 0) {
      await addBudget({ category, limit: Number(limit) })
      setMsg('Orçamento salvo com sucesso!')
      setCategory('')
      setLimit('')
      setTimeout(() => setMsg(''), 3000)
    } else {
      setMsg('Informe um valor válido')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Orçamentos</h1>
        <p className="text-gray-400 text-sm">Gerencie seus limites de gastos mensais por categoria.</p>
      </div>

      {/* Formulário Inline */}
      <div className="bg-dark-card rounded-xl border border-dark-border p-5">
        <form onSubmit={handleAddBudget} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full md:w-auto">
            <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1.5 block">Categoria</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-dark-surface text-gray-200 border border-dark-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Selecione uma categoria</option>
              {presetCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 w-full md:w-auto">
            <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1.5 block">Limite Mensal</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={limit}
                onChange={e => setLimit(e.target.value)}
                placeholder="0,00"
                className="w-full bg-dark-surface text-gray-200 border border-dark-border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium whitespace-nowrap shadow-lg shadow-purple-600/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Salvar Orçamento
          </button>
        </form>
        {msg && (
          <div className={`mt-3 text-sm ${msg.includes('sucesso') ? 'text-green-400' : 'text-yellow-400'}`}>
            {msg}
          </div>
        )}
      </div>

      {/* Cards de Orçamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map(b => {
          const spent = transactions
            .filter(t => t.type === 'expense' && t.category === b.category)
            .reduce((a, c) => a + (Number(c.amount) || 0), 0)
          const budgetLimit = Number(b.limit) || 0
          const pct = budgetLimit > 0 ? Math.min(100, Math.round((spent / budgetLimit) * 100)) : 0
          const isExceeded = spent > budgetLimit
          const config = getCategoryConfig(b.category)

          return (
            <div
              key={b.id}
              className="bg-dark-card rounded-xl border border-dark-border p-5 hover:border-gray-600 transition-colors group"
            >
              {editingId === b.id ? (
                /* Modo Edição */
                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-300 mb-1">Editar Orçamento</div>
                  <select
                    className="w-full bg-dark-surface text-gray-200 border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                  >
                    {presetCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                    <input
                      className="w-full bg-dark-surface text-gray-200 border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      type="number"
                      step="0.01"
                      value={editLimit}
                      onChange={e => setEditLimit(e.target.value)}
                      min="0.01"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (editCategory && Number(editLimit) > 0) {
                          await updateBudget(b.id, { category: editCategory, limit: Number(editLimit) })
                          setEditingId(null)
                          setMsg('Orçamento atualizado!')
                          setTimeout(() => setMsg(''), 3000)
                        }
                      }}
                      className="flex-1 bg-purple-600 text-white rounded-lg px-3 py-2 hover:bg-purple-700 text-sm font-medium transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditCategory('')
                        setEditLimit(0)
                      }}
                      className="flex-1 bg-dark-surface text-gray-300 rounded-lg px-3 py-2 hover:bg-dark-hover text-sm font-medium transition-colors border border-dark-border"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* Modo Visualização */
                <>
                  {/* Header do Card */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${config.bgColor} ${config.color} flex items-center justify-center`}>
                        {config.icon}
                      </div>
                      <span className="font-semibold text-white">{b.category}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingId(b.id)
                          setEditCategory(b.category)
                          setEditLimit(budgetLimit)
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir orçamento de ${b.category}?`)) {
                            deleteBudget(b.id)
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Valores */}
                  <div className="mb-4">
                    {isExceeded && (
                      <div className="flex items-center gap-1 text-red-400 text-xs font-medium mb-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Excedido
                      </div>
                    )}
                    {!isExceeded && (
                      <div className="text-xs text-gray-500 mb-1">Gastos atuais</div>
                    )}
                    <div className="flex items-end justify-between">
                      <span className={`text-xl font-bold ${isExceeded ? 'text-red-400' : 'text-white'}`}>
                        R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Limite</div>
                        <span className="text-sm text-gray-400">
                          R$ {budgetLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full h-2 bg-dark-surface rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${isExceeded ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          )
        })}

        {/* Card "Adicionar Categoria" */}
        <button
          onClick={() => {
            setShowAddCard(true)
            // Scroll to top form 
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="bg-transparent rounded-xl border-2 border-dashed border-dark-border p-5 flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors min-h-[180px] cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-medium">Adicionar Categoria</span>
        </button>
      </div>
    </div>
  )
}
