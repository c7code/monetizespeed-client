import { useState } from 'react'
import { useData, CustomCategory, presetCategories } from '../store/data'

export default function Categories() {
  const { customCategories, allCategories, addCategory, updateCategory, deleteCategory } = useData()
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'both' | 'expense' | 'income'>('both')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<'both' | 'expense' | 'income'>('both')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [search, setSearch] = useState('')

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    setLoading(true)
    try {
      await addCategory(newName.trim(), newType)
      setNewName('')
      setNewType('both')
      showMessage('success', `Categoria "${newName.trim()}" criada com sucesso!`)
    } catch (e: any) {
      showMessage('error', e.message || 'Erro ao criar categoria')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (cat: CustomCategory) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditType(cat.type as 'both' | 'expense' | 'income')
  }

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editingId) return
    setLoading(true)
    try {
      await updateCategory(editingId, editName.trim(), editType)
      setEditingId(null)
      showMessage('success', 'Categoria atualizada!')
    } catch (e: any) {
      showMessage('error', e.message || 'Erro ao atualizar')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return
    try {
      await deleteCategory(id)
      showMessage('success', `Categoria "${name}" excluída`)
    } catch (e: any) {
      showMessage('error', e.message || 'Erro ao excluir')
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'expense': return 'Despesa'
      case 'income': return 'Receita'
      default: return 'Ambos'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'expense': return 'text-red-400 bg-red-500/15 border border-red-500/30'
      case 'income': return 'text-green-400 bg-green-500/15 border border-green-500/30'
      default: return 'text-blue-400 bg-blue-500/15 border border-blue-500/30'
    }
  }

  const filteredAll = allCategories.filter(c =>
    !search || c.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Categorias</h1>
        <p className="text-gray-400 text-sm mt-1">Gerencie as categorias das suas transações, orçamentos e contas</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
          {message.text}
        </div>
      )}

      {/* Add new category */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Nova Categoria</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Nome da categoria..."
            className="flex-1 px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <select
            value={newType}
            onChange={e => setNewType(e.target.value as 'both' | 'expense' | 'income')}
            className="px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="both">📊 Ambos</option>
            <option value="expense">📉 Só Despesa</option>
            <option value="income">📈 Só Receita</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={loading || !newName.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors font-medium text-sm shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar
          </button>
        </div>
      </div>

      {/* Custom categories */}
      {customCategories.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-border">
            <h2 className="text-lg font-semibold text-white">Suas Categorias ({customCategories.length})</h2>
            <p className="text-xs text-gray-500 mt-1">Categorias personalizadas criadas por você</p>
          </div>
          <div className="divide-y divide-dark-border">
            {customCategories.map(cat => (
              <div key={cat.id} className="px-5 py-3 flex items-center justify-between hover:bg-dark-surface/50 transition-colors">
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                      className="flex-1 px-3 py-1.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <select
                      value={editType}
                      onChange={e => setEditType(e.target.value as 'both' | 'expense' | 'income')}
                      className="px-3 py-1.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="both">Ambos</option>
                      <option value="expense">Despesa</option>
                      <option value="income">Receita</option>
                    </select>
                    <button onClick={handleSaveEdit} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors">
                      Salvar
                    </button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-dark-bg border border-dark-border text-gray-400 rounded-lg text-sm hover:bg-dark-hover transition-colors">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-100">{cat.name}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(cat.type)}`}>
                        {getTypeLabel(cat.type)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All categories overview */}
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Todas as Categorias ({allCategories.length})</h2>
            <p className="text-xs text-gray-500 mt-1">Categorias padrão + suas personalizadas</p>
          </div>
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar categoria..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {filteredAll.map(name => {
              const isCustom = customCategories.some(c => c.name === name)
              const isPreset = presetCategories.includes(name)
              return (
                <span
                  key={name}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isCustom && !isPreset
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      : 'bg-dark-surface text-gray-300 border border-dark-border'
                  }`}
                >
                  {name}
                  {isCustom && !isPreset && (
                    <span className="text-[10px] opacity-60">personalizada</span>
                  )}
                </span>
              )
            })}
          </div>
          {filteredAll.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">Nenhuma categoria encontrada</p>
          )}
        </div>
      </div>
    </div>
  )
}
