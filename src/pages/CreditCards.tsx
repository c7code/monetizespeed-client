import { useState } from 'react'
import { useData } from '../store/data'

// Mapeamento de bancos para cores
const bankColors: Record<string, { bg: string; border: string; text: string }> = {
  nubank: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700' },
  itau: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700' },
  itaú: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700' },
  bradesco: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700' },
  banco_do_brasil: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700' },
  bb: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700' },
  santander: { bg: 'bg-red-100', border: 'border-red-600', text: 'text-red-800' },
  caixa: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700' },
  caixa_economica: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700' },
  inter: { bg: 'bg-orange-100', border: 'border-orange-600', text: 'text-orange-800' },
  banco_inter: { bg: 'bg-orange-100', border: 'border-orange-600', text: 'text-orange-800' },
  c6: { bg: 'bg-gray-900', border: 'border-gray-700', text: 'text-gray-100' },
  c6_bank: { bg: 'bg-gray-900', border: 'border-gray-700', text: 'text-gray-100' },
  next: { bg: 'bg-blue-100', border: 'border-blue-600', text: 'text-blue-800' },
  neon: { bg: 'bg-cyan-50', border: 'border-cyan-500', text: 'text-cyan-700' },
  picpay: { bg: 'bg-blue-100', border: 'border-blue-600', text: 'text-blue-800' },
  pagbank: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700' },
  will: { bg: 'bg-indigo-50', border: 'border-indigo-500', text: 'text-indigo-700' },
  default: { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700' }
}

function getBankColor(cardName: string) {
  const nameLower = cardName.toLowerCase().trim()

  // Verificar correspondência exata ou parcial
  for (const [bank, colors] of Object.entries(bankColors)) {
    if (bank !== 'default' && nameLower.includes(bank)) {
      return colors
    }
  }

  return bankColors.default
}

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
      console.log('Chamando addCreditCard com dados:', {
        name: name.trim(),
        limit_amount: Number(limitAmount),
        total_spent: Number(totalSpent) || 0,
        closing_day: closingDay ? Number(closingDay) : null,
        due_day: dueDay ? Number(dueDay) : null
      })

      await addCreditCard({
        name: name.trim(),
        limit_amount: Number(limitAmount),
        total_spent: Number(totalSpent) || 0,
        closing_day: closingDay ? Number(closingDay) : null,
        due_day: dueDay ? Number(dueDay) : null
      })

      console.log('Cartão adicionado com sucesso!')
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
    return (card.total_spent / card.limit_amount) * 100
  }

  return (
    <div className="grid gap-4 md:gap-6">
      <form onSubmit={submit} className="bg-white rounded shadow p-3 md:p-4 border border-gray-200">
        <div className="text-base md:text-lg font-medium mb-3">Novo Cartão de Crédito</div>
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        <div className="grid gap-3">
          <input
            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome do cartão (ex: Nubank, Itaú)"
            required
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="border border-gray-300 rounded px-2 py-1 text-sm md:text-base w-full md:w-auto"
              type="number"
              step="0.01"
              value={limitAmount}
              onChange={e => setLimitAmount(e.target.value)}
              placeholder="Limite (R$)"
              required
            />
            <input
              className="border border-gray-300 rounded px-2 py-1 text-sm md:text-base w-full md:w-auto"
              type="number"
              step="0.01"
              value={totalSpent}
              onChange={e => setTotalSpent(e.target.value)}
              placeholder="Gasto total (R$)"
            />
            <input
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              type="number"
              min="1"
              max="31"
              value={closingDay}
              onChange={e => setClosingDay(e.target.value ? Number(e.target.value) : '')}
              placeholder="Dia de fechamento (1-31)"
            />
            <input
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              type="number"
              min="1"
              max="31"
              value={dueDay}
              onChange={e => setDueDay(e.target.value ? Number(e.target.value) : '')}
              placeholder="Dia de vencimento (1-31)"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base transition-colors w-full sm:w-auto"
          >
            {isSubmitting ? 'Adicionando...' : 'Adicionar Cartão'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded shadow border border-gray-200">
        <div className="p-3 md:p-4 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold mb-1">Meus Cartões</h2>
          <p className="text-xs md:text-sm text-gray-600">Gerencie seus cartões de crédito</p>
        </div>

        <div className="p-3 md:p-4">
          {creditCards.length === 0 ? (
            <p className="text-gray-500 text-sm md:text-base text-center py-8">
              Nenhum cartão cadastrado. Adicione seu primeiro cartão acima.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {creditCards.map(card => {
                const bankColor = getBankColor(card.name)
                return (
                  <div
                    key={card.id}
                    className={`border-2 ${bankColor.border} ${bankColor.bg} rounded-lg p-4 hover:shadow-lg transition-all`}
                  >
                    {editingId === card.id ? (
                      <div className="space-y-3">
                        <input
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          placeholder="Nome do cartão"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            type="number"
                            step="0.01"
                            value={editLimitAmount}
                            onChange={e => setEditLimitAmount(e.target.value)}
                            placeholder="Limite"
                          />
                          <input
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            type="number"
                            step="0.01"
                            value={editTotalSpent}
                            onChange={e => setEditTotalSpent(e.target.value)}
                            placeholder="Gasto"
                          />
                          <input
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            type="number"
                            min="1"
                            max="31"
                            value={editClosingDay}
                            onChange={e => setEditClosingDay(e.target.value ? Number(e.target.value) : '')}
                            placeholder="Fechamento"
                          />
                          <input
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            type="number"
                            min="1"
                            max="31"
                            value={editDueDay}
                            onChange={e => setEditDueDay(e.target.value ? Number(e.target.value) : '')}
                            placeholder="Vencimento"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 text-sm transition-colors"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 bg-gray-500 text-white rounded px-3 py-1 hover:bg-gray-600 text-sm transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className={`font-semibold text-base md:text-lg ${bankColor.text}`}>{card.name}</h3>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(card)}
                              className="text-gray-600 hover:text-blue-600 transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteCreditCard(card.id)}
                              className="text-gray-600 hover:text-red-600 transition-colors"
                              title="Excluir"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Limite:</span>
                            <span className="font-semibold">R$ {card.limit_amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gasto:</span>
                            <span className="font-semibold text-red-600">R$ {card.total_spent.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Disponível:</span>
                            <span className={`font-semibold ${getAvailableLimit(card) < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                              R$ {getAvailableLimit(card).toFixed(2)}
                            </span>
                          </div>

                          {/* Barra de progresso */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Uso do limite</span>
                              <span>{getUsagePercentage(card).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${getUsagePercentage(card) >= 90
                                  ? 'bg-red-600'
                                  : getUsagePercentage(card) >= 70
                                    ? 'bg-yellow-500'
                                    : 'bg-blue-500'
                                  }`}
                                style={{ width: `${Math.min(getUsagePercentage(card), 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {(card.closing_day || card.due_day) && (
                            <div className="pt-2 border-t border-gray-200 mt-3">
                              {card.closing_day && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">Fechamento:</span>
                                  <span className="font-medium">Dia {card.closing_day}</span>
                                </div>
                              )}
                              {card.due_day && (
                                <div className="flex justify-between text-xs mt-1">
                                  <span className="text-gray-600">Vencimento:</span>
                                  <span className="font-medium">Dia {card.due_day}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
