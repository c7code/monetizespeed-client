import { useState } from 'react'
import { useData } from '../store/data'

export default function Streamings() {
    const { streamings, addStreaming, updateStreaming, deleteStreaming } = useData()
    const [name, setName] = useState('')
    const [monthlyPrice, setMonthlyPrice] = useState<number | string>(0)

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editMonthlyPrice, setEditMonthlyPrice] = useState<number | string>(0)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Calcular totais
    const totalMonthly = streamings.reduce((acc, s) => acc + s.monthly_price, 0)
    const totalYearly = totalMonthly * 12

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError('O nome do streaming é obrigatório')
            return
        }

        if (!monthlyPrice || monthlyPrice <= 0) {
            setError('O valor mensal deve ser maior que zero')
            return
        }

        setIsSubmitting(true)
        try {
            await addStreaming({
                name: name.trim(),
                monthly_price: Number(monthlyPrice)
            })

            setName('')
            setMonthlyPrice(0)
        } catch (err) {
            console.error('Erro ao adicionar streaming:', err)
            setError(err instanceof Error ? err.message : 'Erro ao adicionar streaming. Tente novamente.')
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleEdit(streaming: typeof streamings[0]) {
        setEditingId(streaming.id)
        setEditName(streaming.name)
        setEditMonthlyPrice(streaming.monthly_price)
    }

    async function handleSaveEdit() {
        if (editingId) {
            await updateStreaming(editingId, {
                name: editName,
                monthly_price: Number(editMonthlyPrice)
            })
            setEditingId(null)
        }
    }

    // Nomes de streamings populares para sugestões
    const popularStreamings = [
        'Netflix', 'Spotify', 'Amazon Prime', 'Disney+', 'HBO Max',
        'Apple TV+', 'YouTube Premium', 'Crunchyroll', 'Paramount+',
        'Deezer', 'Globoplay', 'Star+', 'Discovery+'
    ]

    return (
        <div className="grid gap-4 md:gap-6">
            {/* Cards de Totais */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg p-4 md:p-6 text-white">
                    <div className="text-sm opacity-90">Gasto Mensal</div>
                    <div className="text-2xl md:text-3xl font-bold mt-1">
                        R$ {totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm opacity-80 mt-2">
                        {streamings.length} {streamings.length === 1 ? 'serviço' : 'serviços'} ativo{streamings.length !== 1 ? 's' : ''}
                    </div>
                </div>
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg p-4 md:p-6 text-white">
                    <div className="text-sm opacity-90">Gasto Anual</div>
                    <div className="text-2xl md:text-3xl font-bold mt-1">
                        R$ {totalYearly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm opacity-80 mt-2">
                        Projeção de 12 meses
                    </div>
                </div>
            </div>

            {/* Formulário */}
            <form onSubmit={submit} className="bg-dark-card rounded shadow p-3 md:p-4 border border-dark-border">
                <div className="text-base md:text-lg font-medium mb-3">Adicionar Streaming</div>
                {error && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        {error}
                    </div>
                )}
                <div className="grid gap-3">
                    <div>
                        <input
                            className="w-full border border-dark-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm md:text-base"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Nome do serviço (ex: Netflix, Spotify)"
                            list="streaming-suggestions"
                            required
                        />
                        <datalist id="streaming-suggestions">
                            {popularStreamings.map(s => (
                                <option key={s} value={s} />
                            ))}
                        </datalist>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                            <input
                                className="w-full border border-dark-border rounded pl-10 pr-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm md:text-base"
                                type="number"
                                step="0.01"
                                min="0"
                                value={monthlyPrice}
                                onChange={e => setMonthlyPrice(e.target.value)}
                                placeholder="Valor mensal"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-purple-600 text-white rounded px-3 py-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base transition-colors"
                        >
                            {isSubmitting ? 'Adicionando...' : 'Adicionar'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Lista de Streamings */}
            <div className="bg-dark-card rounded shadow border border-dark-border">
                <div className="p-3 md:p-4 border-b border-dark-border">
                    <h2 className="text-lg md:text-xl font-semibold mb-1">Meus Streamings</h2>
                    <p className="text-xs md:text-sm text-gray-400">Gerencie suas assinaturas de streaming</p>
                </div>

                <div className="p-3 md:p-4">
                    {streamings.length === 0 ? (
                        <p className="text-gray-500 text-sm md:text-base text-center py-8">
                            Nenhum streaming cadastrado. Adicione seu primeiro serviço acima.
                        </p>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {streamings.map(streaming => (
                                <div
                                    key={streaming.id}
                                    className="border-2 rounded-lg p-4 hover:shadow-lg transition-all"
                                    style={{
                                        borderColor: streaming.color,
                                        backgroundColor: `${streaming.color}10`
                                    }}
                                >
                                    {editingId === streaming.id ? (
                                        <div className="space-y-3">
                                            <input
                                                className="w-full border border-dark-border rounded px-2 py-1 text-sm"
                                                type="text"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                placeholder="Nome do streaming"
                                            />
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
                                                <input
                                                    className="w-full border border-dark-border rounded pl-8 pr-2 py-1 text-sm"
                                                    type="number"
                                                    step="0.01"
                                                    value={editMonthlyPrice}
                                                    onChange={e => setEditMonthlyPrice(e.target.value)}
                                                    placeholder="Valor mensal"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="flex-1 bg-purple-600 text-white rounded px-3 py-1 hover:bg-purple-700 text-sm transition-colors"
                                                >
                                                    Salvar
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="flex-1 bg-dark-surface0 text-white rounded px-3 py-1 hover:bg-gray-600 text-sm transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                                                        style={{ backgroundColor: streaming.color }}
                                                    >
                                                        {streaming.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-base" style={{ color: streaming.color }}>
                                                            {streaming.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEdit(streaming)}
                                                        className="text-gray-400 hover:text-purple-600 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => deleteStreaming(streaming.id)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: `${streaming.color}30` }}>
                                                <span className="text-gray-400 text-sm">Mensal:</span>
                                                <span className="font-bold text-lg" style={{ color: streaming.color }}>
                                                    R$ {streaming.monthly_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
