import { useState } from 'react'
import { useData } from '../store/data'

const cardAccentColors = [
  { name: 'text-red-400', bar: 'bg-red-500', spent: 'text-red-400' },
  { name: 'text-blue-400', bar: 'bg-blue-500', spent: 'text-blue-400' },
  { name: 'text-orange-400', bar: 'bg-orange-500', spent: 'text-orange-400' },
  { name: 'text-purple-400', bar: 'bg-purple-500', spent: 'text-purple-400' },
  { name: 'text-green-400', bar: 'bg-green-500', spent: 'text-green-400' },
  { name: 'text-cyan-400', bar: 'bg-cyan-500', spent: 'text-cyan-400' },
]

export default function CreditCards() {
  const { creditCards, addCreditCard, updateCreditCard, deleteCreditCard } = useData()
  const [name, setName] = useState('')
  const [limitAmount, setLimitAmount] = useState<number | string>(0)
  const [totalSpent, setTotalSpent] = useState<number | string>(0)
  const [closingDay, setClosingDay] = useState<number | ''>('')
  const [dueDay, setDueDay] = useState<number | ''>('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editLimitAmount, setEditLimitAmount] = useState<number | string>(0)
  const [editTotalSpent, setEditTotalSpent] = useState<number | string>(0)
  const [editClosingDay, setEditClosingDay] = useState<number | ''>('')
  const [editDueDay, setEditDueDay] = useState<number | ''>('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('O nome do cartão é obrigatório')
      return
    }

    if (!limitAmount || limitAmount <= 0) {
      setError('O limite do cartão deve ser maior que zero')
      return
    }

    setIsSubmitting(true)
    try {
      await addCreditCard({
        name: name.trim(),
        limit_amount: Number(limitAmount),
        total_spent: Number(totalSpent) || 0,
        closing_day: closingDay ? Number(closingDay) : null,
        due_day: dueDay ? Number(dueDay) : null
      })

      setName('')
      setLimitAmount(0)
      setTotalSpent(0)
      setClosingDay('')
      setDueDay('')
    } catch (err) {
      console.error('Erro ao adicionar cartão:', err)
      setError(err instanceof Error ? err.message : 'Erro ao adicionar cartão. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleEdit(card: typeof creditCards[0]) {
    setEditingId(card.id)
    setEditName(card.name)
    setEditLimitAmount(card.limit_amount)
    setEditTotalSpent(card.total_spent)
    setEditClosingDay(card.closing_day || '')
    setEditDueDay(card.due_day || '')
  }

  async function handleSaveEdit() {
    if (editingId) {
      await updateCreditCard(editingId, {
        name: editName,
        limit_amount: Number(editLimitAmount),
        total_spent: Number(editTotalSpent),
        closing_day: editClosingDay ? Number(editClosingDay) : null,
        due_day: editDueDay ? Number(editDueDay) : null
      })
      setEditingId(null)
    }
  }

  function getAvailableLimit(card: typeof creditCards[0]) {
    return card.limit_amount - card.total_spent
  }

  function getUsagePercentage(card: typeof creditCards[0]) {
    if (card.limit_amount === 0) return 0
    return Math.min((card.total_spent / card.limit_amount) * 100, 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cartões de Crédito</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie seus limites e faturas em um só lugar.</p>
        </div>
        <button className="p-2.5 bg-dark-card border border-dark-border rounded-xl text-gray-400 hover:text-gray-200 hover:bg-dark-hover transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>

      {/* New Card Form */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-gray-200">Novo Cartão de Crédito</span>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="bg-dark-card border border-dark-border rounded-2xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1.5">Nome do Cartão</label>
              <input
                className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Nubank, Itaú Personalité"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1.5">Limite Total (R$)</label>
              <input
                className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                type="number"
                step="0.01"
                value={limitAmount}
                onChange={e => setLimitAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1.5">Gasto Atual (R$)</label>
              <input
                className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                type="number"
                step="0.01"
                value={totalSpent}
                onChange={e => setTotalSpent(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1.5">Fechamento</label>
                <input
                  className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  type="number"
                  min="1"
                  max="31"
                  value={closingDay}
                  onChange={e => setClosingDay(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Dia"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1.5">Vencimento</label>
                <input
                  className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={e => setDueDay(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Dia"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2.5 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {isSubmitting ? 'Adicionando...' : 'Adicionar Cartão'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h2 className="text-lg font-bold text-white">Meus Cartões</h2>
        </div>

        {creditCards.length === 0 ? (
          <div className="bg-dark-card border-2 border-dashed border-dark-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-dark-surface mx-auto flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">Nenhum cartão cadastrado</p>
            <p className="text-sm text-gray-500 mt-1">Adicione seu primeiro cartão de crédito acima.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditCards.map((card, idx) => {
              const color = cardAccentColors[idx % cardAccentColors.length]
              const available = getAvailableLimit(card)
              const usage = getUsagePercentage(card)

              return (
                <div
                  key={card.id}
                  className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-gray-600 transition-all group relative"
                >
                  {editingId === card.id ? (
                    <div className="space-y-3">
                      <input
                        className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Nome do cartão"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500"
                          type="number"
                          step="0.01"
                          value={editLimitAmount}
                          onChange={e => setEditLimitAmount(e.target.value)}
                          placeholder="Limite"
                        />
                        <input
                          className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500"
                          type="number"
                          step="0.01"
                          value={editTotalSpent}
                          onChange={e => setEditTotalSpent(e.target.value)}
                          placeholder="Gasto"
                        />
                        <input
                          className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500"
                          type="number"
                          min="1"
                          max="31"
                          value={editClosingDay}
                          onChange={e => setEditClosingDay(e.target.value ? Number(e.target.value) : '')}
                          placeholder="Fech."
                        />
                        <input
                          className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500"
                          type="number"
                          min="1"
                          max="31"
                          value={editDueDay}
                          onChange={e => setEditDueDay(e.target.value ? Number(e.target.value) : '')}
                          placeholder="Venc."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-500 text-sm transition-colors font-medium"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 bg-dark-surface text-gray-300 rounded-lg px-3 py-2 hover:bg-dark-hover text-sm transition-colors border border-dark-border"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`font-bold text-lg leading-tight ${color.name}`}>{card.name}</h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(card)}
                            className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteCreditCard(card.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Card subtitle - placeholder for brand */}
                      <p className="text-xs text-gray-500 mb-4">Visa Infinite</p>

                      {/* Available limit */}
                      <div className="mb-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-white font-bold">R$</span>
                          <span className="text-2xl font-bold text-white">
                            {available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase mt-0.5">Limite Disponível</div>
                      </div>

                      {/* Usage bar */}
                      <div className="mt-3 mb-4">
                        <div className="w-full bg-dark-surface rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${color.bar}`}
                            style={{ width: `${usage}%` }}
                          />
                        </div>
                      </div>

                      {/* Total & Spent */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Total</div>
                          <div className="text-sm text-gray-200 font-medium">
                            <span className="text-[10px] text-gray-400 mr-0.5">R$</span>
                            {card.limit_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Gasto</div>
                          <div className={`text-sm font-medium ${color.spent}`}>
                            <span className="text-[10px] mr-0.5">R$</span>
                            {card.total_spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      {/* Closing & Due days */}
                      <div className="pt-3 border-t border-dark-border">
                        <div className="flex flex-wrap gap-x-3 text-[11px] text-gray-500">
                          {card.closing_day && (
                            <span><span className="font-semibold uppercase tracking-wide">Fatura:</span> DIA {card.closing_day}</span>
                          )}
                          {card.due_day && (
                            <span><span className="font-semibold uppercase tracking-wide">Vence:</span> DIA {card.due_day}</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Dashed add-more card */}
        <div className="border-2 border-dashed border-dark-border rounded-2xl p-4" />
      </div>
    </div>
  )
}
