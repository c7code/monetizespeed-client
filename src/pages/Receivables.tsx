import React, { useState, useMemo } from 'react'
import { useData, Receivable, Wallet, presetCategories } from '../store/data'
import { icons } from '../App'

const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function Receivables() {
    const { receivables, addReceivable, updateReceivable, deleteReceivable, receiveBill, wallets } = useData()

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [filterText, setFilterText] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'received' | 'overdue'>('all')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null)

    // Estado do formulário
    const [form, setForm] = useState<Omit<Partial<Receivable>, 'amount'> & { amount: number | string }>({
        description: '',
        amount: 0,
        due_date: new Date().toISOString().split('T')[0],
        category: '',
        status: 'pending',
        customer_name: '',
        customer_document: '',
        wallet_id: undefined,
        is_recurring: false,
        notes: ''
    })

    // Filtragem e Ordenação
    const filteredReceivables = useMemo(() => {
        return receivables.filter(r => {
            const date = new Date(r.due_date)
            // Corrige timezone offset para comparação correta de mês/ano
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            const adjustDate = new Date(date.getTime() + userTimezoneOffset);

            const matchMonth = adjustDate.getMonth() === selectedMonth
            const matchYear = adjustDate.getFullYear() === selectedYear

            // Filtros de texto/categoria/status sempre aplicáveis
            const matchText = filterText === '' ||
                r.description.toLowerCase().includes(filterText.toLowerCase()) ||
                (r.customer_name && r.customer_name.toLowerCase().includes(filterText.toLowerCase()))

            const matchCategory = filterCategory === '' || r.category === filterCategory
            const matchStatus = filterStatus === 'all' || r.status === filterStatus

            return matchMonth && matchYear && matchText && matchCategory && matchStatus
        }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    }, [receivables, selectedMonth, selectedYear, filterText, filterCategory, filterStatus])

    // Cálculos de Resumo
    const summary = useMemo(() => {
        const monthReceivables = receivables.filter(r => {
            const date = new Date(r.due_date)
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            const adjustDate = new Date(date.getTime() + userTimezoneOffset);
            return adjustDate.getMonth() === selectedMonth && adjustDate.getFullYear() === selectedYear
        })

        return {
            total: monthReceivables.reduce((acc, r) => acc + r.amount, 0),
            pending: monthReceivables.filter(r => r.status === 'pending').reduce((acc, r) => acc + r.amount, 0),
            overdue: monthReceivables.filter(r => r.status === 'overdue').reduce((acc, r) => acc + r.amount, 0),
            received: monthReceivables.filter(r => r.status === 'received').reduce((acc, r) => acc + r.amount, 0)
        }
    }, [receivables, selectedMonth, selectedYear])

    // Handlers
    const handleOpenModal = (receivable?: Receivable) => {
        if (receivable) {
            setEditingReceivable(receivable)
            setForm({ ...receivable, due_date: receivable.due_date.split('T')[0] })
        } else {
            setEditingReceivable(null)
            setForm({
                description: '',
                amount: 0,
                due_date: new Date().toISOString().split('T')[0],
                category: '',
                status: 'pending',
                customer_name: '',
                customer_document: '',
                wallet_id: undefined,
                is_recurring: false,
                notes: ''
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.description || !form.amount || !form.due_date) return

        const submissionData = {
            ...form,
            amount: Number(form.amount)
        }

        try {
            if (editingReceivable) {
                await updateReceivable(editingReceivable.id, submissionData)
            } else {
                await addReceivable(submissionData as Omit<Receivable, 'id' | 'status'>)
            }
            setIsModalOpen(false)
        } catch (error) {
            alert('Erro ao salvar conta')
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta conta?')) {
            await deleteReceivable(id)
        }
    }

    const handleReceive = async (receivable: Receivable) => {
        if (receivable.status === 'received') return
        if (confirm(`Confirmar recebimento de ${receivable.description}?`)) {
            await receiveBill(receivable.id)
        }
    }

    // Render Helpers
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'received': return 'text-green-400 bg-green-500/15 border-green-500/30'
            case 'overdue': return 'text-red-400 bg-red-500/15 border-red-500/30'
            default: return 'text-purple-400 bg-purple-500/15 border-purple-500/30'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'received': return 'Recebido'
            case 'overdue': return 'Atrasado'
            default: return 'Pendente'
        }
    }

    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Contas a Receber</h1>
                    <p className="text-gray-400 text-sm">Gerencie seus recebimentos futuros e acompanhe inadimplências.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-gray-300 hover:bg-dark-surface">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Exportar PDF
                    </button>

                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nova Conta a Receber
                    </button>
                </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-dark-card p-6 rounded-xl shadow-sm border border-dark-border">
                    <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Mês Selecionado</div>
                    <div className="flex items-center gap-2 mb-4">
                        <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(Number(e.target.value))}
                            className="bg-dark-surface text-white rounded-lg px-3 py-1.5 text-sm border border-dark-border focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={e => setSelectedYear(Number(e.target.value))}
                            className="bg-dark-surface text-white border border-dark-border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total:</span>
                            <span className="font-bold">R$ {summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-yellow-600">Pendente:</span>
                            <span className="font-bold text-yellow-600">R$ {summary.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-green-600">Recebido:</span>
                            <span className="font-bold text-green-600">R$ {summary.received.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-card p-6 rounded-xl shadow-sm border border-dark-border">
                    <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">A Receber (Mês)</div>
                    <div className="text-3xl font-bold text-green-400">
                        R$ {summary.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                        ● {receivables.filter(r => r.status === 'pending' && new Date(r.due_date).getMonth() === selectedMonth).length} conta(s) a receber
                    </div>
                </div>

                <div className="bg-dark-card p-6 rounded-xl shadow-sm border border-dark-border">
                    <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Atrasadas (Geral)</div>
                    <div className="text-3xl font-bold text-red-400">
                        R$ {summary.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                        ▲ {receivables.filter(r => r.status === 'overdue' && new Date(r.due_date).getMonth() === selectedMonth).length} conta(s) no mês
                    </div>
                </div>
            </div>

            {/* Filtros e Lista */}
            <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border overflow-hidden">
                <div className="p-4 border-b border-dark-border space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar por descrição ou cliente..."
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-dark-surface text-gray-200 border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500"
                                />
                            </div>
                        </div>

                        <div className="w-full sm:w-auto">
                            <select
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                className="w-full px-4 py-2.5 bg-dark-surface text-gray-200 border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Todas as Categorias</option>
                                {presetCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="w-full sm:w-auto">
                            <div className="flex bg-dark-hover p-1 rounded-lg">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                                >Todas</button>
                                <button
                                    onClick={() => setFilterStatus('pending')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'pending' ? 'bg-yellow-500 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                                >A Receber</button>
                                <button
                                    onClick={() => setFilterStatus('overdue')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'overdue' ? 'bg-red-500 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                                >Atrasadas</button>
                                <button
                                    onClick={() => setFilterStatus('received')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'received' ? 'bg-green-500 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                                >Recebidas</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista */}
                <div className="overflow-x-auto">
                    {filteredReceivables.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="inline-block p-4 rounded-full bg-dark-hover mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium">Nenhuma conta encontrada</p>
                            <p className="text-sm">Tente ajustar os filtros ou adicione uma nova conta.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-dark-surface text-gray-400 text-sm">
                                    <th className="p-4 font-medium">Descrição</th>
                                    <th className="p-4 font-medium">Vencimento</th>
                                    <th className="p-4 font-medium">Valor</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Cliente</th>
                                    <th className="p-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {filteredReceivables.map(receivable => (
                                    <tr key={receivable.id} className="hover:bg-dark-surface group">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-100">{receivable.description}</div>
                                            <div className="text-xs text-gray-500">{receivable.category}</div>
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            {new Date(receivable.due_date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-semibold text-gray-100">
                                            R$ {receivable.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(receivable.status)}`}>
                                                {getStatusLabel(receivable.status)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {receivable.customer_name || '-'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {receivable.status !== 'received' && (
                                                    <button
                                                        onClick={() => handleReceive(receivable)}
                                                        className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg"
                                                        title="Receber"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenModal(receivable)}
                                                    className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(receivable.id)}
                                                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"
                                                    title="Excluir"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal de Criação/Edição */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 text-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90dvh] overflow-y-auto border border-gray-700">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-green-500">
                                {editingReceivable ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Geral */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Descrição</label>
                                    <input
                                        required
                                        type="text"
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="Ex: Consultoria, Venda, Freelance..."
                                        className="w-full bg-gray-800 border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-300">Valor</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                value={form.amount}
                                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                                className="w-full bg-gray-800 border-gray-700 rounded-lg p-2.5 pl-10 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-300">Vencimento</label>
                                        <input
                                            required
                                            type="date"
                                            value={form.due_date}
                                            onChange={e => setForm({ ...form, due_date: e.target.value })}
                                            className="w-full bg-gray-800 border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dados do Cliente */}
                            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
                                <div className="flex items-center gap-2 text-sm text-gray-300 mb-2 border-b border-gray-700 pb-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="font-semibold">Dados do Cliente (Opcional)</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Nome do Cliente</label>
                                        <input
                                            type="text"
                                            value={form.customer_name || ''}
                                            onChange={e => setForm({ ...form, customer_name: e.target.value })}
                                            placeholder="Nome do cliente"
                                            className="w-full bg-gray-800 border-gray-700 rounded p-2 text-sm text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">CPF/CNPJ</label>
                                        <input
                                            type="text"
                                            value={form.customer_document || ''}
                                            onChange={e => setForm({ ...form, customer_document: e.target.value })}
                                            placeholder="000.000.000-00"
                                            className="w-full bg-gray-800 border-gray-700 rounded p-2 text-sm text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Categoria e Carteira */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Categoria</label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        className="w-full bg-gray-800 border-gray-700 rounded-lg p-2.5 text-white"
                                    >
                                        <option value="">Selecione</option>
                                        {presetCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Conta de Destino (Wallet)</label>
                                    <select
                                        value={form.wallet_id || ''}
                                        onChange={e => setForm({ ...form, wallet_id: Number(e.target.value) || undefined })}
                                        className="w-full bg-gray-800 border-gray-700 rounded-lg p-2.5 text-white"
                                    >
                                        <option value="">Selecione a conta</option>
                                        {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Opções Extras */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_recurring}
                                        onChange={e => setForm({ ...form, is_recurring: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-300">Recebimento Recorrente</span>
                                </label>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Observações</label>
                                    <textarea
                                        value={form.notes || ''}
                                        onChange={e => setForm({ ...form, notes: e.target.value })}
                                        placeholder="Adicione observações (opcional)"
                                        rows={3}
                                        className="w-full bg-gray-800 border-gray-700 rounded-lg p-2.5 text-white resize-none"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-dark-surface border border-dark-border rounded-lg hover:bg-dark-hover hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                                >
                                    {editingReceivable ? 'Salvar Alterações' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
