import { useState } from 'react'
import { useData } from '../store/data'
import ProgressBar from '../components/ProgressBar'

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useData()
  const [name, setName] = useState('')
  const [target, setTarget] = useState<number | string>(0)
  const [saved, setSaved] = useState<number | string>(0)
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
      setTarget(0)
      setSaved(0)
      setMsg('Meta cadastrada com sucesso!')
      setTimeout(() => setMsg(''), 3000)
    } else {
      setMsg('Preencha todos os campos obrigatórios')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  function handleEdit(goal: { id: string, name: string, target: number, saved: number }) {
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
    <div className="grid gap-3 md:gap-4">
      <form
        onSubmit={handleSubmit}
        className="rounded shadow p-3 md:p-4 border border-gray-200 bg-gray-50"
      >
        <div className="text-base md:text-lg font-medium mb-3">Nova Meta</div>
        <div className="grid md:grid-cols-4 gap-3">
          <input
            className="border rounded px-2 py-1 text-sm md:text-base"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome da meta"
            required
          />
          <input
            className="border rounded px-2 py-1 text-sm md:text-base"
            type="number"
            step="0.01"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="Meta (R$)"
            min="0.01"
            required
          />
          <input
            className="border rounded px-2 py-1 text-sm md:text-base"
            type="number"
            step="0.01"
            value={saved}
            onChange={e => setSaved(e.target.value)}
            placeholder="Valor já guardado (R$)"
            min="0"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-3 py-1 md:py-2 hover:bg-blue-700 text-sm md:text-base transition-colors"
          >
            Adicionar
          </button>
        </div>
        {msg && (
          <div className={`text-xs sm:text-sm mt-2 ${msg.includes('sucesso') ? 'text-blue-600' : 'text-red-600'}`}>
            {msg}
          </div>
        )}
      </form>
      <div className="grid md:grid-cols-2 gap-3 md:gap-4">
        {goals.map(g => (
          <div key={g.id} className="rounded shadow p-3 md:p-4 border border-gray-200 bg-gray-50">
            {editingId === g.id ? (
              <div className="grid gap-3">
                <input
                  className="border border-gray-300 rounded px-2 py-1 text-sm md:text-base"
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Nome da meta"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm"
                    type="number"
                    step="0.01"
                    value={editTarget}
                    onChange={e => setEditTarget(e.target.value)}
                    placeholder="Meta (R$)"
                    min="0.01"
                  />
                  <input
                    className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm"
                    type="number"
                    step="0.01"
                    value={editSaved}
                    onChange={e => setEditSaved(e.target.value)}
                    placeholder="Guardado (R$)"
                    min="0"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(g.id)}
                    className="flex-1 bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700 text-xs sm:text-sm transition-colors"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-500 text-white rounded px-2 py-1 hover:bg-gray-600 text-xs sm:text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                  <div className="font-medium text-sm sm:text-base">{g.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs sm:text-sm text-gray-700">R$ {g.saved.toFixed(2)} / R$ {g.target.toFixed(2)}</div>
                    <button
                      onClick={() => handleEdit(g)}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                      title="Editar meta"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="text-gray-600 hover:text-red-600 transition-colors"
                      title="Excluir meta"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <ProgressBar value={g.saved} max={g.target} />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
