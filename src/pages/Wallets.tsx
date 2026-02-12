import { useState } from 'react'
import { useData } from '../store/data'

const accountTypeLabels: Record<string, string> = {
    conta_corrente: 'Conta Corrente',
    poupanca: 'Poupança',
    investimento: 'Investimento',
    carteira: 'Carteira',
    outro: 'Outro'
}

const walletColors = [
    { accent: 'from-blue-500 to-blue-600', bar: 'bg-blue-500', icon: 'text-blue-400 bg-blue-500/15' },
    { accent: 'from-purple-500 to-purple-600', bar: 'bg-purple-500', icon: 'text-purple-400 bg-purple-500/15' },
    { accent: 'from-orange-500 to-orange-600', bar: 'bg-orange-500', icon: 'text-orange-400 bg-orange-500/15' },
    { accent: 'from-green-500 to-green-600', bar: 'bg-green-500', icon: 'text-green-400 bg-green-500/15' },
    { accent: 'from-pink-500 to-pink-600', bar: 'bg-pink-500', icon: 'text-pink-400 bg-pink-500/15' },
    { accent: 'from-cyan-500 to-cyan-600', bar: 'bg-cyan-500', icon: 'text-cyan-400 bg-cyan-500/15' },
]

export default function Wallets() {
    const { wallets, addWallet, updateWallet, deleteWallet } = useData()
    const [name, setName] = useState('')
    const [bankName, setBankName] = useState('')
    const [accountType, setAccountType] = useState('conta_corrente')
    const [initialBalance, setInitialBalance] = useState<number | string>(0)

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editBankName, setEditBankName] = useState('')
    const [editAccountType, setEditAccountType] = useState('')
    const [editBalance, setEditBalance] = useState<number | string>(0)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)

    const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0)

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError('O nome da conta é obrigatório')
            return
        }

        setIsSubmitting(true)
        try {
            await addWallet({
                name: name.trim(),
                bank_name: bankName.trim() || null,
                account_type: accountType,
                initial_balance: Number(initialBalance) || 0,
                bank_logo_url: null
            })

            setName('')
            setBankName('')
            setAccountType('conta_corrente')
            setInitialBalance(0)
            setShowForm(false)
        } catch (err) {
            console.error('Erro ao adicionar carteira:', err)
            setError(err instanceof Error ? err.message : 'Erro ao adicionar carteira.')
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleEdit(wallet: typeof wallets[0]) {
        setEditingId(wallet.id)
        setEditName(wallet.name)
        setEditBankName(wallet.bank_name || '')
        setEditAccountType(wallet.account_type)
        setEditBalance(wallet.balance)
    }

    async function handleSaveEdit() {
        if (editingId) {
            await updateWallet(editingId, {
                name: editName,
                bank_name: editBankName || null,
                account_type: editAccountType,
                balance: Number(editBalance) || 0
            })
            setEditingId(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Saldo Consolidado Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-500 p-6 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
                <div className="absolute right-20 -bottom-10 w-32 h-32 rounded-full bg-white/5" />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="text-xs font-semibold tracking-wider text-blue-200 uppercase mb-2">Saldo Consolidado</div>
                        <div className="text-3xl md:text-4xl font-bold text-white">
                            R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-blue-200 mt-2">
                            ● Você possui {wallets.length} {wallets.length === 1 ? 'conta vinculada' : 'contas vinculadas'} ativamente
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/25 text-white rounded-xl hover:bg-white/25 transition-all font-medium text-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nova Transação
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Wallets List - Left 2 Columns */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">Minhas Carteiras</h2>
                            <p className="text-sm text-gray-400">Gerencie suas contas e saldos bancários</p>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-dark-hover rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {wallets.map((wallet, idx) => {
                            const color = walletColors[idx % walletColors.length]
                            return (
                                <div
                                    key={wallet.id}
                                    className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-gray-600 transition-all group relative"
                                >
                                    {editingId === wallet.id ? (
                                        <div className="space-y-3">
                                            <input
                                                className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                type="text"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                placeholder="Nome da conta"
                                            />
                                            <input
                                                className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                type="text"
                                                value={editBankName}
                                                onChange={e => setEditBankName(e.target.value)}
                                                placeholder="Nome do banco"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <select
                                                    className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500"
                                                    value={editAccountType}
                                                    onChange={e => setEditAccountType(e.target.value)}
                                                >
                                                    <option value="conta_corrente">Conta Corrente</option>
                                                    <option value="poupanca">Poupança</option>
                                                    <option value="investimento">Investimento</option>
                                                    <option value="carteira">Carteira</option>
                                                    <option value="outro">Outro</option>
                                                </select>
                                                <input
                                                    className="bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500"
                                                    type="number"
                                                    step="0.01"
                                                    value={editBalance}
                                                    onChange={e => setEditBalance(e.target.value)}
                                                    placeholder="Saldo"
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
                                            {/* Actions - top right */}
                                            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(wallet)}
                                                    className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => deleteWallet(wallet.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Icon */}
                                            <div className={`w-12 h-12 rounded-xl ${color.icon} flex items-center justify-center mb-4`}>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>

                                            {/* Info */}
                                            <h3 className="font-semibold text-gray-100 text-base">{wallet.name}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {wallet.bank_name && `${wallet.bank_name} • `}{accountTypeLabels[wallet.account_type] || wallet.account_type}
                                            </p>

                                            {/* Balance */}
                                            <div className="mt-4 flex items-center gap-3">
                                                <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Saldo Atual</span>
                                                <span className={`text-lg font-bold ${wallet.balance >= 0 ? (idx % 3 === 0 ? 'text-orange-400' : idx % 3 === 1 ? 'text-blue-400' : 'text-orange-400') : 'text-red-400'}`}>
                                                    R$ {wallet.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>

                                            {/* Color bar */}
                                            <div className={`mt-3 h-1 rounded-full ${color.bar} opacity-60`} />
                                        </>
                                    )}
                                </div>
                            )
                        })}

                        {/* Add New Wallet Card */}
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-dark-card border-2 border-dashed border-dark-border rounded-2xl p-5 hover:border-gray-500 transition-all flex flex-col items-center justify-center gap-3 min-h-[200px] group"
                        >
                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-600 group-hover:border-gray-400 flex items-center justify-center transition-colors">
                                <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="text-sm text-gray-500 group-hover:text-gray-300 font-medium transition-colors">Nova Carteira</span>
                        </button>
                    </div>
                </div>

                {/* New Wallet Form - Right Column */}
                <div className="lg:col-span-1">
                    <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sticky top-8">
                        <h3 className="text-lg font-semibold text-white mb-1">Nova Carteira</h3>
                        <p className="text-sm text-gray-400 mb-6">Preencha os dados abaixo para cadastrar uma nova conta.</p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nome da Conta</label>
                                <input
                                    className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ex: Conta Principal"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Banco</label>
                                <input
                                    className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    type="text"
                                    value={bankName}
                                    onChange={e => setBankName(e.target.value)}
                                    placeholder="Ex: Itaú, Nubank, Santa..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Tipo</label>
                                    <select
                                        className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        value={accountType}
                                        onChange={e => setAccountType(e.target.value)}
                                        required
                                    >
                                        <option value="conta_corrente">Corrente</option>
                                        <option value="poupanca">Poupança</option>
                                        <option value="investimento">Investimento</option>
                                        <option value="carteira">Carteira</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Saldo Inicial</label>
                                    <input
                                        className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        type="number"
                                        step="0.01"
                                        value={initialBalance}
                                        onChange={e => setInitialBalance(e.target.value)}
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-3 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {isSubmitting ? 'Adicionando...' : 'Adicionar Carteira'}
                            </button>
                        </form>

                        {/* Info hint */}
                        <div className="mt-4 flex items-start gap-2 p-3 bg-dark-surface rounded-lg border border-dark-border">
                            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Ao cadastrar uma nova carteira, você poderá vincular transações e gerar relatórios específicos para esta conta.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
