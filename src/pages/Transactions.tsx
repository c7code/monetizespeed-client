import { useState, useMemo } from 'react'
import { useData, presetCategories } from '../store/data'

type FilterType = 'all' | 'paid' | 'received' | 'pending_payment' | 'pending_receipt'

export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useData()
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [category, setCategory] = useState(presetCategories[0])
  const [amount, setAmount] = useState(0)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [recurring, setRecurring] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'paid' | 'received' | 'pending_payment' | 'pending_receipt'>('paid')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editType, setEditType] = useState<'income' | 'expense'>('expense')
  const [editCategory, setEditCategory] = useState('')
  const [editAmount, setEditAmount] = useState(0)
  const [editDate, setEditDate] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState<'paid' | 'received' | 'pending_payment' | 'pending_receipt'>('paid')

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setReceiptUrl(URL.createObjectURL(f))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const defaultStatus = type === 'expense' ? 'paid' : 'received'
    await addTransaction({ type, category, amount: Number(amount), date, recurring, receiptUrl, description, status: status || defaultStatus })
    setAmount(0)
    setDescription('')
    setStatus('paid')
  }

  function handleEdit(t: typeof transactions[0]) {
    setEditingId(t.id)
    setEditType(t.type)
    setEditCategory(t.category)
    setEditAmount(t.amount)
    setEditDate(t.date)
    setEditDescription(t.description || '')
    setEditStatus(t.status || (t.type === 'expense' ? 'paid' : 'received'))
  }

  async function handleSaveEdit() {
    if (editingId) {
      await updateTransaction(editingId, {
        type: editType,
        category: editCategory,
        amount: editAmount,
        date: editDate,
        description: editDescription,
        status: editStatus
      })
      setEditingId(null)
    }
  }

  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    if (filter === 'paid') {
      filtered = filtered.filter(t => t.status === 'paid')
    } else if (filter === 'received') {
      filtered = filtered.filter(t => t.status === 'received')
    } else if (filter === 'pending_payment') {
      filtered = filtered.filter(t => t.status === 'pending_payment')
    } else if (filter === 'pending_receipt') {
      filtered = filtered.filter(t => t.status === 'pending_receipt')
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(t => 
        (t.description?.toLowerCase().includes(searchLower)) ||
        t.category.toLowerCase().includes(searchLower)
      )
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, filter, search])

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  function getStatusLabel(status?: string, transactionType?: 'income' | 'expense') {
    switch (status) {
      case 'paid': return 'Pago'
      case 'received': return 'Recebido'
      case 'pending_payment': return 'A pagar'
      case 'pending_receipt': return 'A receber'
      default: return transactionType === 'expense' ? 'Pago' : 'Recebido'
    }
  }

  function getStatusColor(status?: string) {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'received': return 'bg-blue-100 text-blue-800'
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800'
      case 'pending_receipt': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="grid gap-4 md:gap-6">
      <form onSubmit={submit} className="bg-white rounded shadow p-3 md:p-4 border border-gray-200">
        <div className="text-base md:text-lg font-medium mb-3">Nova Transação</div>
        <div className="grid gap-3">
          <div className="flex gap-3 text-xs md:text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={type==='expense'} onChange={()=>{setType('expense'); setStatus('paid')}} />Despesa
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={type==='income'} onChange={()=>{setType('income'); setStatus('received')}} />Receita
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <select className="border border-gray-300 rounded px-2 py-1 bg-white text-sm md:text-base" value={category} onChange={e=>setCategory(e.target.value)}>
              {presetCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm md:text-base" type="number" step="0.01" value={amount} onChange={e=>setAmount(Number(e.target.value))} placeholder="Valor" />
            <input className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm md:text-base" type="date" value={date} onChange={e=>setDate(e.target.value)} />
            <select className="border border-gray-300 rounded px-2 py-1 bg-white text-sm md:text-base" value={status} onChange={e=>setStatus(e.target.value as any)}>
              {type === 'expense' ? (
                <>
                  <option value="paid">Pago</option>
                  <option value="pending_payment">A pagar</option>
                </>
              ) : (
                <>
                  <option value="received">Recebido</option>
                  <option value="pending_receipt">A receber</option>
                </>
              )}
            </select>
          </div>
          <input className="border border-gray-300 rounded px-2 py-1 text-sm md:text-base" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Descrição" />
          <label className="flex items-center gap-2 text-xs md:text-sm cursor-pointer">
            <input type="checkbox" checked={recurring} onChange={e=>setRecurring(e.target.checked)} />Recorrente
          </label>
          <button className="bg-green-600 text-white rounded px-3 py-2 hover:bg-green-700 text-sm md:text-base transition-colors w-full sm:w-auto">Adicionar</button>
        </div>
      </form>

      <div className="bg-white rounded shadow border border-gray-200">
        <div className="p-3 md:p-4 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold mb-1">Transações</h2>
          <p className="text-xs md:text-sm text-gray-600">Verifique suas transações completas.</p>
        </div>
        
        <div className="p-3 md:p-4 border-b border-gray-200">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {setFilter('all'); setCurrentPage(1)}}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm transition-colors ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Todas
              </button>
              <button
                onClick={() => {setFilter('paid'); setCurrentPage(1)}}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm transition-colors ${filter === 'paid' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Pagos
              </button>
              <button
                onClick={() => {setFilter('received'); setCurrentPage(1)}}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm transition-colors ${filter === 'received' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Recebidos
              </button>
              <button
                onClick={() => {setFilter('pending_payment'); setCurrentPage(1)}}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm transition-colors ${filter === 'pending_payment' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                A pagar
              </button>
              <button
                onClick={() => {setFilter('pending_receipt'); setCurrentPage(1)}}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm transition-colors ${filter === 'pending_receipt' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                A receber
              </button>
            </div>
            <input
              type="text"
              placeholder="Pesquisar por descrição, categoria..."
              value={search}
              onChange={e => {setSearch(e.target.value); setCurrentPage(1)}}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-700 uppercase">DESCRIÇÃO</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-700 uppercase">VALOR</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-700 uppercase hidden sm:table-cell">CATEGORIA</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-700 uppercase">TIPO</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-700 uppercase hidden md:table-cell">STATUS</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-700 uppercase hidden lg:table-cell">DATA</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-700 uppercase">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTransactions.map(t => (
                editingId === t.id ? (
                  <tr key={t.id} className="bg-gray-50">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="grid gap-3">
                        <div className="grid md:grid-cols-3 gap-2">
                          <input
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            type="text"
                            value={editDescription}
                            onChange={e => setEditDescription(e.target.value)}
                            placeholder="Descrição"
                          />
                          <input
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            type="number"
                            step="0.01"
                            value={editAmount}
                            onChange={e => setEditAmount(Number(e.target.value))}
                            placeholder="Valor"
                          />
                          <select
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            value={editCategory}
                            onChange={e => setEditCategory(e.target.value)}
                          >
                            {presetCategories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="grid md:grid-cols-3 gap-2">
                          <select
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            value={editType}
                            onChange={e => setEditType(e.target.value as any)}
                          >
                            <option value="expense">Despesa</option>
                            <option value="income">Receita</option>
                          </select>
                          <select
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value as any)}
                          >
                            {editType === 'expense' ? (
                              <>
                                <option value="paid">Pago</option>
                                <option value="pending_payment">A pagar</option>
                              </>
                            ) : (
                              <>
                                <option value="received">Recebido</option>
                                <option value="pending_receipt">A receber</option>
                              </>
                            )}
                          </select>
                          <input
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            type="date"
                            value={editDate}
                            onChange={e => setEditDate(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700 text-sm transition-colors"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-500 text-white rounded px-3 py-1 hover:bg-gray-600 text-sm transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                      <div className="font-medium">{t.description || '-'}</div>
                      <div className="text-xs text-gray-500 sm:hidden">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold ${t.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                      {t.type === 'expense' ? '-' : '+'} R$ {t.amount.toFixed(2)}
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm hidden sm:table-cell">{t.category}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {t.type === 'expense' ? 'Despesa' : 'Receita'}
                      </span>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(t.status)}`}>
                        {getStatusLabel(t.status, t.type)}
                      </span>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm hidden lg:table-cell">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3">
                      <div className="flex gap-1 md:gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-gray-600 hover:text-green-600 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="text-gray-600 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-3 md:p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-full sm:w-auto px-4 py-2 rounded border border-gray-300 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="text-xs md:text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-full sm:w-auto px-4 py-2 rounded border border-gray-300 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
