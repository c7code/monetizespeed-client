import React, { useState, useMemo } from 'react'
import { useData, Bill, Wallet, presetCategories } from '../store/data'
import { icons } from '../App'

const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function Bills() {
    const { bills, addBill, updateBill, deleteBill, payBill, wallets } = useData()

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [filterText, setFilterText] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBill, setEditingBill] = useState<Bill | null>(null)

    // Estado do formulário
    const [form, setForm] = useState<Omit<Partial<Bill>, 'amount'> & { amount: number | string }>({
        description: '',
        amount: 0,
        due_date: new Date().toISOString().split('T')[0],
        category: '',
        status: 'pending',
        supplier_name: '',
        supplier_document: '',
        supplier_contact: '',
        supplier_phone: '',
        payment_method: 'pix',
        pix_key: '',
        wallet_id: undefined,
        is_recurring: false,
        notes: ''
    })

    // Filtragem e Ordenação
    const filteredBills = useMemo(() => {
        return bills.filter(b => {
            const date = new Date(b.due_date)
            // Corrige timezone offset para comparação correta de mês/ano
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            const adjustDate = new Date(date.getTime() + userTimezoneOffset);

            const matchMonth = adjustDate.getMonth() === selectedMonth
            const matchYear = adjustDate.getFullYear() === selectedYear

            // Filtros de texto/categoria/status sempre aplicáveis
            const matchText = filterText === '' ||
                b.description.toLowerCase().includes(filterText.toLowerCase()) ||
                (b.supplier_name && b.supplier_name.toLowerCase().includes(filterText.toLowerCase()))

            const matchCategory = filterCategory === '' || b.category === filterCategory
            const matchStatus = filterStatus === 'all' || b.status === filterStatus

            return matchMonth && matchYear && matchText && matchCategory && matchStatus
        }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    }, [bills, selectedMonth, selectedYear, filterText, filterCategory, filterStatus])

    // Cálculos de Resumo
    const summary = useMemo(() => {
        const monthBills = bills.filter(b => {
            const date = new Date(b.due_date)
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            const adjustDate = new Date(date.getTime() + userTimezoneOffset);
            return adjustDate.getMonth() === selectedMonth && adjustDate.getFullYear() === selectedYear
        })

        return {
            total: monthBills.reduce((acc, b) => acc + b.amount, 0),
            pending: monthBills.filter(b => b.status === 'pending').reduce((acc, b) => acc + b.amount, 0),
            overdue: monthBills.filter(b => b.status === 'overdue').reduce((acc, b) => acc + b.amount, 0),
            paid: monthBills.filter(b => b.status === 'paid').reduce((acc, b) => acc + b.amount, 0)
        }
    }, [bills, selectedMonth, selectedYear])

    // Handlers
    const handleOpenModal = (bill?: Bill) => {
        if (bill) {
            setEditingBill(bill)
            setForm({ ...bill, due_date: bill.due_date.split('T')[0] })
        } else {
            setEditingBill(null)
            setForm({
                description: '',
                amount: 0,
                due_date: new Date().toISOString().split('T')[0],
                category: '',
                status: 'pending',
                supplier_name: '',
                supplier_document: '',
                supplier_contact: '',
                supplier_phone: '',
                payment_method: 'pix',
                pix_key: '',
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
            if (editingBill) {
                await updateBill(editingBill.id, submissionData)
            } else {
                await addBill(submissionData as Omit<Bill, 'id' | 'status'>)
            }
            setIsModalOpen(false)
        } catch (error) {
            alert('Erro ao salvar conta')
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta conta?')) {
            await deleteBill(id)
        }
    }

    const handlePay = async (bill: Bill) => {
        if (bill.status === 'paid') return
        if (confirm(`Confirmar pagamento de ${bill.description}?`)) {
            await payBill(bill.id)
        }
    }

    // Render Helpers
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'text-green-400 bg-green-500/15 border-green-500/30'
            case 'overdue': return 'text-red-400 bg-red-500/15 border-red-500/30'
            default: return 'text-purple-400 bg-purple-500/15 border-purple-500/30'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'Pago'
            case 'overdue': return 'Atrasado'
            default: return 'Pendente'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Contas a Pagar</h1>
                    <p className="text-gray-400 text-sm">Gerencie seus compromissos financeiros e evite atrasos.</p>
                </div>
                <div className="flex gap-2">
                    {/* Botão Exportar PDF (Simulado) */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-gray-300 hover:bg-dark-surface">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Exportar PDF
                    </button>

                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nova Conta a Pagar
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
                            className="bg-dark-surface text-white rounded-lg px-3 py-1.5 text-sm border border-dark-border focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={e => setSelectedYear(Number(e.target.value))}
                            className="bg-dark-surface text-white border border-dark-border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                            <span className="text-green-600">Pago:</span>
                            <span className="font-bold text-green-600">R$ {summary.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-card p-6 rounded-xl shadow-sm border border-dark-border">
                    <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Saldo Pendente (Mês)</div>
                    <div className="text-3xl font-bold text-purple-400">
                        R$ {summary.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                        ● {bills.filter(b => b.status === 'pending' && new Date(b.due_date).getMonth() === selectedMonth).length} conta(s) em aberto
                    </div>
                </div>

                <div className="bg-dark-card p-6 rounded-xl shadow-sm border border-dark-border">
                    <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Atrasadas (Geral)</div>
                    <div className="text-3xl font-bold text-red-400">
                        R$ {summary.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                        ▲ {bills.filter(b => b.status === 'overdue' && new Date(b.due_date).getMonth() === selectedMonth).length} conta(s) no mês
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
                                    placeholder="Buscar por descrição, fornecedor ou cliente..."
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-dark-surface text-gray-200 border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                                />
                            </div>
                        </div>

                        <div className="w-full sm:w-auto">
                            <select
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                className="w-full px-4 py-2.5 bg-dark-surface text-gray-200 border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Todas as Categorias</option>
                                {presetCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="w-full sm:w-auto">
                            <div className="flex bg-dark-hover p-1 rounded-lg">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                                >Todas</button>
                                <button
                                    onClick={() => setFilterStatus('pending')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'pending' ? 'bg-yellow-500 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                                >A Vencer</button>
                                <button
                                    onClick={() => setFilterStatus('overdue')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'overdue' ? 'bg-red-500 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                                >Atrasadas</button>
                                <button
                                    onClick={() => setFilterStatus('paid')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'paid' ? 'bg-green-500 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                                >Pagas</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista */}
                <div className="overflow-x-auto">
                    {filteredBills.length === 0 ? (
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
                                    <th className="p-4 font-medium">Fornecedor</th>
                                    <th className="p-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {filteredBills.map(bill => (
                                    <tr key={bill.id} className="hover:bg-dark-surface group">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-100">{bill.description}</div>
                                            <div className="text-xs text-gray-500">{bill.category}</div>
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            {new Date(bill.due_date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-semibold text-gray-100">
                                            R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(bill.status)}`}>
                                                {getStatusLabel(bill.status)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {bill.supplier_name || '-'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {bill.status !== 'paid' && (
                                                    <button
                                                        onClick={() => handlePay(bill)}
                                                        className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg"
                                                        title="Marcar como Pago"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenModal(bill)}
                                                    className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bill.id)}
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
                    <div className="bg-gray-900 text-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-purple-500">
                                {editingBill ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
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
                                        placeholder="Ex: Aluguel, Água, Luz..."
                                        className="w-full bg-gray-800 border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                                className="w-full bg-gray-800 border-gray-700 rounded-lg p-2.5 pl-10 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                            className="w-full bg-gray-800 border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dados do Fornecedor */}
                            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
                                <div className="flex items-center gap-2 text-sm text-gray-300 mb-2 border-b border-gray-700 pb-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="font-semibold">Dados do Fornecedor/Cliente (Opcional)</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={form.supplier_name || ''}
                                            onChange={e => setForm({ ...form, supplier_name: e.target.value })}
                                            placeholder="Nome do fornecedor"
                                            className="w-full bg-gray-800 border-gray-700 rounded p-2 text-sm text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">CPF/CNPJ</label>
                                        <input
                                            type="text"
                                            value={form.supplier_document || ''}
                                            onChange={e => setForm({ ...form, supplier_document: e.target.value })}
                                            placeholder="000.000.000-00"
                                            className="w-full bg-gray-800 border-gray-700 rounded p-2 text-sm text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Nome para Contato</label>
                                        <input
                                            type="text"
                                            value={form.supplier_contact || ''}
                                            onChange={e => setForm({ ...form, supplier_contact: e.target.value })}
                                            placeholder="Nome do contato"
                                            className="w-full bg-gray-800 border-gray-700 rounded p-2 text-sm text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400">Telefone/WhatsApp</label>
                                        <input
                                            type="text"
                                            value={form.supplier_phone || ''}
                                            onChange={e => setForm({ ...form, supplier_phone: e.target.value })}
                                            placeholder="(00) 00000-0000"
                                            className="w-full bg-gray-800 border-gray-700 rounded p-2 text-sm text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Forma de Pagamento */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        Forma de Pagamento
                                    </label>
                                    <select
                                        value={form.payment_method}
                                        onChange={e => setForm({ ...form, payment_method: e.target.value })}
                                        className="w-full bg-gray-800 border-gray-700 rounded-lg p-2.5 text-white"
                                    >
                                        <option value="pix">PIX</option>
                                        <option value="boleto">Boleto</option>
                                        <option value="credit_card">Cartão de Crédito</option>
                                        <option value="transfer">Transferência</option>
                                        <option value="cash">Dinheiro</option>
                                    </select>
                                </div>

                                {form.payment_method === 'pix' && (
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-300">Chave PIX</label>
                                        <input
                                            type="text"
                                            value={form.pix_key || ''}
                                            onChange={e => setForm({ ...form, pix_key: e.target.value })}
                                            placeholder="CPF, CNPJ, Email, Telefone ou Chave Aleatória"
                                            className="w-full bg-gray-800 border-gray-700 rounded-lg p-2.5 text-white"
                                        />
                                    </div>
                                )}
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
                                    <label className="text-sm font-medium text-gray-300">Conta de Origem (Wallet)</label>
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
                                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-300">Conta Recorrente</span>
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
                                    className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
                                >
                                    {editingBill ? 'Salvar Alterações' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
