import { useState } from 'react'
import { useData } from '../store/data'

// Ícones e cores para as metas (ciclam entre as metas)
const goalStyles = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    barColor: 'bg-gradient-to-r from-blue-600 to-purple-500'
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    barColor: 'bg-gradient-to-r from-emerald-500 to-teal-400'
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/15',
    barColor: 'bg-gradient-to-r from-orange-500 to-amber-400'
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/15',
    barColor: 'bg-gradient-to-r from-rose-500 to-pink-400'
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    barColor: 'bg-gradient-to-r from-purple-500 to-violet-400'
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/15',
    barColor: 'bg-gradient-to-r from-cyan-500 to-blue-400'
  },
]

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useData()
  const [name, setName] = useState('')
  const [target, setTarget] = useState<number | string>('')
  const [saved, setSaved] = useState<number | string>('')
  const [msg, setMsg] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editTarget, setEditTarget] = useState<number | string>(0)
  const [editSaved, setEditSaved] = useState<number | string>(0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim() && Number(target) > 0) {
      await addGoal({ name: name.trim(), target: Number(target), saved: Number(saved) || 0 })
      setName('')
      setTarget('')
      setSaved('')
      setMsg('Meta cadastrada com sucesso!')
      setTimeout(() => setMsg(''), 3000)
    } else {
      setMsg('Preencha todos os campos obrigatórios')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  function handleEdit(goal: { id: string; name: string; target: number; saved: number }) {
    setEditingId(goal.id)
    setEditName(goal.name)
    setEditTarget(goal.target)
    setEditSaved(goal.saved)
  }

  async function handleSaveEdit(id: string) {
    if (editName.trim() && Number(editTarget) > 0) {
      await updateGoal(id, { name: editName.trim(), target: Number(editTarget), saved: Number(editSaved) || 0 })
      setEditingId(null)
      setMsg('Meta atualizada com sucesso!')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditTarget(0)
    setEditSaved(0)
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Minhas Metas</h1>
        <p className="text-gray-400 text-sm">Gerencie e acompanhe seus objetivos financeiros.</p>
      </div>

      {/* Formulário Inline */}
      <div className="bg-dark-card rounded-xl border border-dark-border p-5">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full md:w-auto">
            <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1.5 block">Nome da Meta</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Viagem Japão"
              required
              className="w-full bg-dark-surface text-gray-200 border border-dark-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
            />
          </div>
          <div className="flex-1 w-full md:w-auto">
            <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1.5 block">Valor Alvo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">R$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="0,00"
                required
                className="w-full bg-dark-surface text-gray-200 border border-dark-border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
              />
            </div>
          </div>
          <div className="flex-1 w-full md:w-auto">
            <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1.5 block">Valor Atual</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={saved}
                onChange={e => setSaved(e.target.value)}
                placeholder="0,00"
                className="w-full bg-dark-surface text-gray-200 border border-dark-border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium whitespace-nowrap shadow-lg shadow-purple-600/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar
          </button>
        </form>
        {msg && (
          <div className={`mt-3 text-sm ${msg.includes('sucesso') ? 'text-green-400' : 'text-yellow-400'}`}>
            {msg}
          </div>
        )}
      </div>

      {/* Cards de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g, index) => {
          const targetVal = Number(g.target) || 0
          const savedVal = Number(g.saved) || 0
          const pct = targetVal > 0 ? Math.min(100, (savedVal / targetVal) * 100) : 0
          const isComplete = pct >= 100
          const remaining = targetVal - savedVal
          const style = goalStyles[index % goalStyles.length]

          return (
            <div
              key={g.id}
              className="bg-dark-card rounded-xl border border-dark-border p-5 hover:border-gray-600 transition-colors group"
            >
              {editingId === g.id ? (
                /* Modo Edição */
                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-300 mb-1">Editar Meta</div>
                  <input
                    className="w-full bg-dark-surface text-gray-200 border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Nome da meta"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
                      <input
                        className="w-full bg-dark-surface text-gray-200 border border-dark-border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        type="number"
                        step="0.01"
                        value={editTarget}
                        onChange={e => setEditTarget(e.target.value)}
                        placeholder="Meta"
                        min="0.01"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
                      <input
                        className="w-full bg-dark-surface text-gray-200 border border-dark-border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        type="number"
                        step="0.01"
                        value={editSaved}
                        onChange={e => setEditSaved(e.target.value)}
                        placeholder="Guardado"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(g.id)}
                      className="flex-1 bg-purple-600 text-white rounded-lg px-3 py-2 hover:bg-purple-700 text-sm font-medium transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={handleCancelEdit}
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
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${style.bgColor} ${style.color} flex items-center justify-center`}>
                        {style.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{g.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(g)}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir meta "${g.name}"?`)) {
                            deleteGoal(g.id)
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

                  {/* Valores e Percentual */}
                  <div className="mb-4">
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-2xl font-bold text-white">{pct.toFixed(1)}%</span>
                      <span className="text-sm text-gray-400 pb-0.5">
                        R$ {savedVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-gray-600 pb-0.5">/</span>
                      <span className="text-sm text-gray-500 pb-0.5">
                        R$ {targetVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full h-2 bg-dark-surface rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${style.barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    {isComplete ? (
                      <span className="text-xs font-semibold tracking-wider text-green-400 uppercase">
                        ✓ Meta alcançada!
                      </span>
                    ) : (
                      <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                        Faltam R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                    {isComplete && (
                      <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {!isComplete && (
                      <div className={`w-2.5 h-2.5 rounded-full ${style.bgColor.replace('/15', '/40')}`} />
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}

        {/* Card "Nova Meta" */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-transparent rounded-xl border-2 border-dashed border-dark-border p-5 flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors min-h-[220px] cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-medium">Nova Meta</span>
        </button>
      </div>
    </div>
  )
}
