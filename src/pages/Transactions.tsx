import { useState, useRef, useEffect } from 'react'
import { useData, Transaction } from '../store/data'
import Chat from './Chat'

export default function Transactions() {
  const { transactions, deleteTransaction, addTransaction, updateTransaction } = useData()
  const [chatOpen, setChatOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'expense' | 'income' | 'paid' | 'received' | 'pending_payment' | 'pending_receipt'>('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Transaction>>({})
  const itemsPerPage = 10

  const editDescriptionRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && editDescriptionRef.current) {
      editDescriptionRef.current.focus()
    }
  }, [editingId])

  const filteredTransactions = transactions
    .filter(t => {
      if (filter === 'all') return true
      if (filter === 'expense') return t.type === 'expense'
      if (filter === 'income') return t.type === 'income'
      if (filter === 'paid') return t.status === 'paid'
      if (filter === 'received') return t.status === 'received'
      if (filter === 'pending_payment') return t.status === 'pending_payment'
      if (filter === 'pending_receipt') return t.status === 'pending_receipt'
      return true
    })
    .filter(t => {
      if (!search) return true
      const searchLower = search.toLowerCase()
      return (
        (t.description || '').toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower) ||
        t.amount.toString().includes(searchLower)
      )
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-500/15 border border-green-500/30'
      case 'received': return 'text-blue-400 bg-blue-500/15 border border-blue-500/30'
      case 'pending_payment': return 'text-yellow-400 bg-yellow-500/15 border border-yellow-500/30'
      case 'pending_receipt': return 'text-orange-400 bg-orange-500/15 border border-orange-500/30'
      default: return 'text-gray-400 bg-dark-hover'
    }
  }

  const getStatusLabel = (status: Transaction['status'], type: Transaction['type']) => {
    switch (status) {
      case 'paid': return 'Pago'
      case 'received': return 'Recebido'
      case 'pending_payment': return 'Pendente'
      case 'pending_receipt': return 'A Receber'
      default: return status || '-'
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setEditForm({
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      status: transaction.status,
      type: transaction.type
    })
  }

  const handleSaveEdit = async () => {
    if (editingId && editForm) {
      if (!editForm.description || !editForm.amount || !editForm.date) {
        alert('Por favor, preencha todos os campos obrigatórios.')
        return
      }
      await updateTransaction(editingId, editForm)
      setEditingId(null)
      setEditForm({})
    }
  }

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'paid', label: 'Pagas' },
    { key: 'received', label: 'Recebidas' },
    { key: 'pending_payment', label: 'A pagar' },
    { key: 'pending_receipt', label: 'A receber' },
  ]

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transações</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie suas receitas e despesas com facilidade</p>
        </div>
        <button onClick={() => setChatOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors font-medium text-sm shadow-lg shadow-blue-600/20">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Transação
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex bg-dark-card border border-dark-border p-1 rounded-xl">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setCurrentPage(1) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Pesquisar por descrição, categoria..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-card border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Descrição</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Valor</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase hidden sm:table-cell">Categoria</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Tipo</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase hidden md:table-cell">Status</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase hidden lg:table-cell">Data</th>
                <th className="px-5 py-4 text-right text-[11px] font-semibold tracking-wider text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="inline-block p-4 rounded-full bg-dark-surface mb-3">
                      <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-medium">Nenhuma transação encontrada</p>
                    <p className="text-sm text-gray-500 mt-1">Tente ajustar os filtros ou adicionar uma nova transação.</p>
                  </td>
                </tr>
              ) : paginatedTransactions.map(t => (
                editingId === t.id ? (
                  <tr key={t.id} className="bg-dark-surface">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="grid gap-3">
                        <div className="grid md:grid-cols-3 gap-3">
                          <input
                            ref={editDescriptionRef}
                            type="text"
                            value={editForm.description || ''}
                            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                            className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Descrição"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.amount || ''}
                            onChange={e => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                            className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Valor"
                          />
                          <input
                            type="date"
                            value={editForm.date ? new Date(editForm.date).toISOString().slice(0, 10) : ''}
                            onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                            className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-3">
                          <select
                            value={editForm.category || ''}
                            onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                            className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Selecione Categoria</option>
                            <option value="Alimentação">Alimentação</option>
                            <option value="Transporte">Transporte</option>
                            <option value="Moradia">Moradia</option>
                            <option value="Lazer">Lazer</option>
                            <option value="Saúde">Saúde</option>
                            <option value="Investimentos">Investimentos</option>
                            <option value="Salário">Salário</option>
                            <option value="Outros">Outros</option>
                          </select>
                          <select
                            value={editForm.status || (editForm.type === 'expense' ? 'paid' : 'received')}
                            onChange={e => setEditForm({ ...editForm, status: e.target.value as Transaction['status'] })}
                            className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500"
                          >
                            {editForm.type === 'expense' ? (
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
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-500 text-sm transition-colors font-medium"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-dark-card text-gray-300 border border-dark-border rounded-lg px-4 py-2 hover:bg-dark-hover text-sm transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={t.id} className="hover:bg-dark-surface/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-100 text-sm">{t.description || '-'}</div>
                      <div className="text-xs text-gray-500 sm:hidden mt-0.5">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className={`font-bold text-sm ${t.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                        <span className="text-xs font-medium">{t.type === 'expense' ? '- R$' : '+ R$'}</span>
                        <br />
                        {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-300 hidden sm:table-cell">{t.category}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${t.type === 'expense'
                        ? 'text-red-400 bg-red-500/15 border border-red-500/30'
                        : 'text-green-400 bg-green-500/15 border border-green-500/30'
                        }`}>
                        {t.type === 'expense' ? 'Despesa' : 'Receita'}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(t.status)}`}>
                        {getStatusLabel(t.status, t.type)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400 hidden lg:table-cell">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-300">{Math.min(filteredTransactions.length, (currentPage - 1) * itemsPerPage + 1)}</span> - <span className="font-semibold text-gray-300">{Math.min(filteredTransactions.length, currentPage * itemsPerPage)}</span> de <span className="font-semibold text-gray-300">{filteredTransactions.length}</span> transações
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-400 bg-dark-surface border border-dark-border rounded-lg hover:bg-dark-hover hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-dark-surface border border-dark-border rounded-lg hover:bg-dark-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
      {/* Chat Modal */}
      {chatOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setChatOpen(false)
          }}
        >
          <div className="bg-dark-card border border-dark-border rounded-t-2xl md:rounded-2xl shadow-xl w-full max-w-2xl h-[85dvh] md:h-[80dvh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <div>
                <h3 className="text-lg font-semibold text-gray-100">Chat de Gastos</h3>
                <p className="text-xs text-gray-500">Digite seus gastos em linguagem natural</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Fechar chat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <Chat showHeader={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
