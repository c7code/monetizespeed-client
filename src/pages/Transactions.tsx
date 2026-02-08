import { useState, useRef, useEffect } from 'react'
import { useData, Transaction } from '../store/data'

export default function Transactions() {
  const { transactions, deleteTransaction, addTransaction, updateTransaction } = useData()
  const [filter, setFilter] = useState<'all' | 'expense' | 'income' | 'paid' | 'received' | 'pending_payment' | 'pending_receipt'>('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Transaction>>({})
  const itemsPerPage = 10

  // Refs para focar nos inputs ao editar
  const editDescriptionRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && editDescriptionRef.current) {
      editDescriptionRef.current.focus()
    }
  }, [editingId])

  const filteredTransactions = transactions
    .filter(t => {
      // Filtro de tipo/status
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
      // Filtro de busca
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
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'received':
        return 'bg-green-100 text-green-800'
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending_receipt':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: Transaction['status'], type: Transaction['type']) => {
    switch (status) {
      case 'paid':
        return 'Pago'
      case 'received':
        return 'Recebido'
      case 'pending_payment':
        return 'A Pagar'
      case 'pending_receipt':
        return 'A Receber'
      default:
        return status || '-'
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
      // Validar dados básicos
      if (!editForm.description || !editForm.amount || !editForm.date) {
        alert('Por favor, preencha todos os campos obrigatórios.')
        return
      }

      await updateTransaction(editingId, editForm)
      setEditingId(null)
      setEditForm({})
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 md:p-4 border-b border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Transações</h2>
            <p className="text-sm text-gray-500 hidden md:block">Gerencie suas receitas e despesas</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setFilter('all'); setCurrentPage(1) }}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm transition-colors ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Todas
            </button>
            <button
              onClick={() => { setFilter('paid'); setCurrentPage(1) }}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm transition-colors ${filter === 'paid' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Pagos
            </button>
            <button
              onClick={() => { setFilter('received'); setCurrentPage(1) }}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm transition-colors ${filter === 'received' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Recebidos
            </button>
            <button
              onClick={() => { setFilter('pending_payment'); setCurrentPage(1) }}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm transition-colors ${filter === 'pending_payment' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              A pagar
            </button>
            <button
              onClick={() => { setFilter('pending_receipt'); setCurrentPage(1) }}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm transition-colors ${filter === 'pending_receipt' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              A receber
            </button>
          </div>
          <input
            type="text"
            placeholder="Pesquisar por descrição, categoria..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          ref={editDescriptionRef}
                          type="text"
                          value={editForm.description || ''}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          className="border rounded px-2 py-1 text-sm bg-white"
                          placeholder="Descrição"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.amount || ''}
                          onChange={e => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                          className="border rounded px-2 py-1 text-sm bg-white"
                          placeholder="Valor"
                        />
                        <input
                          type="date"
                          value={editForm.date ? new Date(editForm.date).toISOString().slice(0, 10) : ''}
                          onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                          className="border rounded px-2 py-1 text-sm bg-white"
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-2">
                        <select
                          value={editForm.category || ''}
                          onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                          className="border rounded px-2 py-1 text-sm bg-white"
                        >
                          <option value="">Selecione Categoria</option>
                          <option value="Alimentação">Alimentação</option>
                          <option value="Transporte">Transporte</option>
                          <option value="Moradia">Moradia</option>
                          <option value="Lazer">Lazer</option>
                          <option value="Saúde">Saúde</option>
                          <option value="Salário">Salário</option>
                          <option value="Outros">Outros</option>
                        </select>
                        <select
                          value={editForm.status || (editForm.type === 'expense' ? 'paid' : 'received')} // Default safe value
                          onChange={e => setEditForm({ ...editForm, status: e.target.value as Transaction['status'] })}
                          className="border rounded px-2 py-1 text-sm bg-white"
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
                          className="bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 text-sm transition-colors"
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
                  <td className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold ${t.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                    {t.type === 'expense' ? '-' : '+'} R$ {t.amount.toFixed(2)}
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm hidden sm:table-cell">{t.category}</td>
                  <td className="px-2 md:px-4 py-2 md:py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
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
                        className="text-gray-600 hover:text-blue-600 transition-colors"
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

      <div className="p-4 border-t border-gray-200 mt-auto bg-white">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Mostrando {Math.min(filteredTransactions.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredTransactions.length, currentPage * itemsPerPage)} de {filteredTransactions.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
