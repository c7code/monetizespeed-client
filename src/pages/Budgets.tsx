import { useState } from 'react'
import { useData, presetCategories } from '../store/data'
import ProgressBar from '../components/ProgressBar'

export default function Budgets() {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget } = useData()
  const [category, setCategory] = useState(presetCategories[0])
  const [limit, setLimit] = useState<number | string>(0)
  const [msg, setMsg] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCategory, setEditCategory] = useState('')
  const [editLimit, setEditLimit] = useState<number | string>(0)
  return (
    <div className="grid gap-3 md:gap-4">
      <form
        onSubmit={async e => {
          e.preventDefault();
          if (Number(limit) > 0) {
            await addBudget({ category, limit: Number(limit) });
            setMsg('Orçamento salvo');
            setLimit(0)
          } else {
            setMsg('Informe um valor válido')
          }
        }}
        className="rounded shadow p-3 md:p-4 border border-gray-200 bg-gray-50"
      >
        <div className="text-base md:text-lg font-medium mb-3">Novo Orçamento</div>
        <div className="grid md:grid-cols-3 gap-3">
          <select className="border border-gray-300 rounded px-2 py-1 text-sm md:text-base" value={category} onChange={e => setCategory(e.target.value)}>
            {presetCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="border border-gray-300 rounded px-2 py-1 text-sm md:text-base" type="number" step="0.01" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Limite mensal (R$)" />
          <button className="bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700 text-sm md:text-base transition-colors">Salvar</button>
        </div>
        {msg && <div className="text-xs sm:text-sm text-gray-700 mt-2">{msg}</div>}
      </form>
      <div className="grid md:grid-cols-2 gap-3 md:gap-4">
        {budgets.map(b => {
          const spent = transactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((a, c) => a + (Number(c.amount) || 0), 0)
          const limit = Number(b.limit) || 0
          return (
            <div key={b.id} className="rounded shadow p-3 md:p-4 border border-gray-200 bg-gray-50">
              {editingId === b.id ? (
                <div className="grid gap-3">
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm md:text-base"
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                  >
                    {presetCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    className="border border-gray-300 rounded px-2 py-1 text-sm md:text-base"
                    type="number"
                    step="0.01"
                    value={editLimit}
                    onChange={e => setEditLimit(e.target.value)}
                    placeholder="Limite mensal (R$)"
                    min="0.01"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (editCategory && Number(editLimit) > 0) {
                          await updateBudget(b.id, { category: editCategory, limit: Number(editLimit) })
                          setEditingId(null)
                          setMsg('Orçamento atualizado com sucesso!')
                          setTimeout(() => setMsg(''), 3000)
                        }
                      }}
                      className="flex-1 bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700 text-xs sm:text-sm transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditCategory('')
                        setEditLimit(0)
                      }}
                      className="flex-1 bg-gray-500 text-white rounded px-2 py-1 hover:bg-gray-600 text-xs sm:text-sm transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <div className="font-medium text-sm sm:text-base">{b.category}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs sm:text-sm text-gray-600">R$ {spent.toFixed(2)} / R$ {limit.toFixed(2)}</div>
                      <button
                        onClick={() => {
                          setEditingId(b.id)
                          setEditCategory(b.category)
                          setEditLimit(limit)
                        }}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                        title="Editar orçamento"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteBudget(b.id)}
                        className="text-gray-600 hover:text-red-600 transition-colors"
                        title="Excluir orçamento"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <ProgressBar value={spent} max={limit} />
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
