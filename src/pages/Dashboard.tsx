import { useMemo, useState } from 'react'
import { useData } from '../store/data'
import { useAuth } from '../store/auth'
import { Link } from 'react-router-dom'
import PieChart from '../components/PieChart'
import Chat from './Chat'

export default function Dashboard() {
  const { transactions, budgets } = useData()
  const { user } = useAuth()
  const [chatOpen, setChatOpen] = useState(false)

  // Balance calculations
  const balance = useMemo(() =>
    transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0),
    [transactions]
  )

  const monthlyIncome = useMemo(() => {
    const now = new Date()
    return transactions
      .filter(t => {
        const d = new Date(t.date)
        return t.type === 'income' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((acc, t) => acc + t.amount, 0)
  }, [transactions])

  const monthlyExpense = useMemo(() => {
    const now = new Date()
    return transactions
      .filter(t => {
        const d = new Date(t.date)
        return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((acc, t) => acc + t.amount, 0)
  }, [transactions])

  // Previous month for % change calculation
  const prevMonthBalance = useMemo(() => {
    const now = new Date()
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return transactions
      .filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear
      })
      .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
  }, [transactions])

  const balanceChangePercent = prevMonthBalance !== 0
    ? ((balance - prevMonthBalance) / Math.abs(prevMonthBalance) * 100).toFixed(1)
    : '0.0'

  // Expense distribution for donut chart
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

  const expenseByCategory = useMemo(() => {
    const now = new Date()
    const categoryMap: Record<string, number> = {}
    transactions.filter(t => {
      const d = new Date(t.date)
      return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
    })
    return Object.entries(categoryMap)
      .map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  // Budget progress
  const budgetProgress = useMemo(() => {
    const now = new Date()
    return budgets.map((b, i) => {
      const spent = transactions.filter(t => {
        const d = new Date(t.date)
        return t.type === 'expense' && t.category === b.category &&
          d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).reduce((a, c) => a + c.amount, 0)
      return { ...b, spent, color: colors[i % colors.length] }
    })
  }, [budgets, transactions])

  // Recent transactions
  const recentTransactions = useMemo(() =>
    [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
    [transactions]
  )

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const oneDay = 86400000

    if (diff < oneDay && d.getDate() === now.getDate()) {
      return `Hoje, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    }
    if (diff < oneDay * 2 && d.getDate() === now.getDate() - 1) {
      return `Ontem, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const categoryIcons: Record<string, string> = {
    'Alimentação': '🛒',
    'Transporte': '🚗',
    'Lazer': '🎬',
    'Moradia': '🏠',
    'Salário': '💼',
    'Saúde': '💊',
  }

  const getCategoryColor = (category: string) => {
    const map: Record<string, string> = {
      'Alimentação': 'bg-orange-500/20 text-orange-400',
      'Transporte': 'bg-blue-500/20 text-blue-400',
      'Lazer': 'bg-purple-500/20 text-purple-400',
      'Moradia': 'bg-amber-500/20 text-amber-400',
      'Salário': 'bg-green-500/20 text-green-400',
      'Saúde': 'bg-pink-500/20 text-pink-400',
    }
    return map[category] || 'bg-gray-500/20 text-gray-400'
  }

  const firstName = user?.name?.split(' ')[0] || 'Usuário'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Bem-vindo de volta!</h1>
          <p className="text-gray-400 text-sm mt-1">Aqui está o resumo das suas finanças hoje.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl bg-dark-card border border-dark-border text-gray-400 hover:text-gray-200 hover:bg-dark-hover transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Transação
          </button>
        </div>
      </div>

      {/* Balance + Entradas/Saídas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Saldo Total - Large gradient card */}
        <div className="lg:col-span-2 gradient-card rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-white/70 mb-2">SALDO TOTAL</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
              R$ {formatCurrency(balance)}
            </h2>
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {parseFloat(balanceChangePercent) >= 0 ? '+' : ''}{balanceChangePercent}% este mês
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link to="/transactions" className="flex-1 flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-medium px-5 py-3 rounded-xl transition-all text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Nova Entrada
              </Link>
              <Link to="/transactions" className="flex-1 flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-medium px-5 py-3 rounded-xl transition-all text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Nova Saída
              </Link>
            </div>
          </div>
          {/* Decorative icon */}
          <div className="absolute top-6 right-6 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Entradas / Saídas stacked */}
        <div className="flex flex-col gap-4">
          {/* Entradas */}
          <div className="dark-card p-5 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">Entradas</p>
                <p className="text-xl font-bold text-green-400 mt-0.5">R$ {formatCurrency(monthlyIncome)}</p>
              </div>
              <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
                +{monthlyIncome > 0 ? ((monthlyIncome / (monthlyIncome + monthlyExpense || 1)) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>

          {/* Saídas */}
          <div className="dark-card p-5 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">Saídas</p>
                <p className="text-xl font-bold text-red-400 mt-0.5">R$ {formatCurrency(monthlyExpense)}</p>
              </div>
              <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                -{monthlyExpense > 0 ? ((monthlyExpense / (monthlyIncome + monthlyExpense || 1)) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribuição de Gastos + Orçamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut Chart */}
        <div className="dark-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-100">Distribuição de Gastos</h3>
            <span className="text-sm text-blue-400 font-medium">Este Mês</span>
          </div>
          {expenseByCategory.length > 0 ? (
            <PieChart data={expenseByCategory} size={180} strokeWidth={28} />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">
              Nenhum gasto registrado este mês
            </div>
          )}
        </div>

        {/* Orçamentos por Categoria */}
        <div className="dark-card p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-6">Orçamentos por Categoria</h3>
          <div className="space-y-5">
            {budgetProgress.length > 0 ? budgetProgress.map(b => {
              const pct = Math.min(100, Math.round((b.spent / b.limit) * 100))
              const barColor = pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : b.color ? `bg-blue-500` : 'bg-blue-500'
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-200">{b.category}</span>
                    <span className="text-xs text-gray-400">
                      R$ {formatCurrency(b.spent)} / R$ {formatCurrency(b.limit)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-dark-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full progress-bar ${barColor}`}
                      style={{ width: `${pct}%`, backgroundColor: pct < 60 ? b.color : undefined }}
                    />
                  </div>
                  <div className="text-right mt-1">
                    <span className={`text-xs font-medium ${pct >= 80 ? 'text-red-400' : pct >= 60 ? 'text-amber-400' : 'text-blue-400'}`}>
                      {pct}% utilizado
                    </span>
                  </div>
                </div>
              )
            }) : (
              <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">
                Nenhum orçamento cadastrado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transações Recentes */}
      <div className="dark-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-100">Transações Recentes</h3>
          <Link to="/transactions" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Ver todas
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <>
            {/* Table header - desktop */}
            <div className="hidden sm:grid grid-cols-4 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 px-4">
              <span>Descrição</span>
              <span>Categoria</span>
              <span>Data</span>
              <span className="text-right">Valor</span>
            </div>

            <div className="space-y-2">
              {recentTransactions.map(t => (
                <div
                  key={t.id}
                  className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center px-4 py-3 rounded-xl hover:bg-dark-hover transition-colors"
                >
                  {/* Description + icon */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${getCategoryColor(t.category)}`}>
                      {categoryIcons[t.category] || '📄'}
                    </div>
                    <span className="text-sm font-medium text-gray-200 truncate">{t.description || t.category}</span>
                  </div>

                  {/* Category */}
                  <span className="text-sm text-gray-400 sm:block">{t.category}</span>

                  {/* Date */}
                  <span className="text-sm text-gray-500">{formatDate(t.date)}</span>

                  {/* Value */}
                  <span className={`text-sm font-semibold text-right w-full sm:w-auto ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+ ' : '- '}R$ {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[120px] text-gray-500 text-sm">
            Nenhuma transação encontrada
          </div>
        )}
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
