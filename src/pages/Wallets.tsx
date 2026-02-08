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

const accountTypeLabels: Record<string, string> = {
    conta_corrente: 'Conta Corrente',
    poupanca: 'Poupança',
    investimento: 'Investimento',
    carteira: 'Carteira',
    outro: 'Outro'
}

function getBankColor(bankName: string) {
    const nameLower = (bankName || '').toLowerCase().trim()

    for (const [bank, colors] of Object.entries(bankColors)) {
        if (bank !== 'default' && nameLower.includes(bank)) {
            return colors
        }
    }

    return bankColors.default
}

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

    // Calcular saldo total
    const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0)

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError('O nome da conta é obrigatório')
            return
        }

        if (!accountType) {
            setError('O tipo de conta é obrigatório')
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
        } catch (err) {
            console.error('Erro ao adicionar carteira:', err)
            setError(err instanceof Error ? err.message : 'Erro ao adicionar carteira. Tente novamente.')
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
        <div className="grid gap-4 md:gap-6">
            {/* Saldo Total */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-4 md:p-6 text-white">
                <div className="text-sm opacity-90">Saldo Total</div>
                <div className="text-2xl md:text-3xl font-bold mt-1">
                    R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm opacity-80 mt-2">
                    {wallets.length} {wallets.length === 1 ? 'conta' : 'contas'} cadastrada{wallets.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Formulário de Nova Carteira */}
            <form onSubmit={submit} className="bg-white rounded shadow p-3 md:p-4 border border-gray-200">
                <div className="text-base md:text-lg font-medium mb-3">Nova Carteira</div>
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
                        placeholder="Nome da conta (ex: Conta Principal)"
                        required
                    />
                    <input
                        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                        type="text"
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        placeholder="Nome do banco (ex: Itaú, Nubank)"
                    />
                    <div className="grid sm:grid-cols-2 gap-3">
                        <select
                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                            value={accountType}
                            onChange={e => setAccountType(e.target.value)}
                            required
                        >
                            <option value="conta_corrente">Conta Corrente</option>
                            <option value="poupanca">Poupança</option>
                            <option value="investimento">Investimento</option>
                            <option value="carteira">Carteira</option>
                            <option value="outro">Outro</option>
                        </select>
                        <input
                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                            type="number"
                            step="0.01"
                            value={initialBalance}
                            onChange={e => setInitialBalance(e.target.value)}
                            placeholder="Saldo inicial"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base transition-colors w-full sm:w-auto"
                    >
                        {isSubmitting ? 'Adicionando...' : 'Adicionar Carteira'}
                    </button>
                </div>
            </form>

            {/* Lista de Carteiras */}
            <div className="bg-white rounded shadow border border-gray-200">
                <div className="p-3 md:p-4 border-b border-gray-200">
                    <h2 className="text-lg md:text-xl font-semibold mb-1">Minhas Carteiras</h2>
                    <p className="text-xs md:text-sm text-gray-600">Gerencie suas contas e saldos</p>
                </div>

                <div className="p-3 md:p-4">
                    {wallets.length === 0 ? (
                        <p className="text-gray-500 text-sm md:text-base text-center py-8">
                            Nenhuma carteira cadastrada. Adicione sua primeira carteira acima.
                        </p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {wallets.map(wallet => {
                                const bankColor = getBankColor(wallet.bank_name || wallet.name)
                                return (
                                    <div
                                        key={wallet.id}
                                        className={`border-2 ${bankColor.border} ${bankColor.bg} rounded-lg p-4 hover:shadow-lg transition-all`}
                                    >
                                        {editingId === wallet.id ? (
                                            <div className="space-y-3">
                                                <input
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                    type="text"
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    placeholder="Nome da conta"
                                                />
                                                <input
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                    type="text"
                                                    value={editBankName}
                                                    onChange={e => setEditBankName(e.target.value)}
                                                    placeholder="Nome do banco"
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <select
                                                        className="border border-gray-300 rounded px-2 py-1 text-sm"
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
                                                        className="border border-gray-300 rounded px-2 py-1 text-sm"
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
                                                    <div>
                                                        <h3 className={`font-semibold text-base md:text-lg ${bankColor.text}`}>{wallet.name}</h3>
                                                        {wallet.bank_name && (
                                                            <p className="text-xs text-gray-500">{wallet.bank_name}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleEdit(wallet)}
                                                            className="text-gray-600 hover:text-blue-600 transition-colors"
                                                            title="Editar"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => deleteWallet(wallet.id)}
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
                                                        <span className="text-gray-600">Tipo:</span>
                                                        <span className="font-medium">{accountTypeLabels[wallet.account_type] || wallet.account_type}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                                                        <span className="text-gray-600">Saldo:</span>
                                                        <span className={`font-bold text-lg ${wallet.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                            R$ {wallet.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
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
