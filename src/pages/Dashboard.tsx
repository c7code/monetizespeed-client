import { useMemo, useState } from 'react'
import { useData } from '../store/data'
import PieChart from '../components/PieChart'

export default function Dashboard() {
  const { transactions, budgets, bills, receivables, streamings } = useData()
  const [period, setPeriod] = useState<'dia' | 'semana' | 'mês' | 'ano'>('mês')
  const balance = useMemo(() => transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0), [transactions])

  const colors = [
    '#2563EB', // blue
    '#1D4ED8', // blue dark
    '#000000', // black
    '#374151', // gray
    '#6b7280', // gray light
    '#ef4444', // red
    '#f59e0b', // yellow
    '#6366f1', // indigo
  ]

  // Filter budgetData based on period
  const filteredBudgetData = useMemo(() => {
    return budgets.map(b => {
      const spent = transactions.filter(t => {
        const tDate = new Date(t.date)
        const now = new Date()

        // Time filter logic
        let timeFilter = false
        if (period === 'ano') {
          timeFilter = tDate.getFullYear() === now.getFullYear()
        } else {
          // Default to 'mês' behavior for dia/semana/mês for simplicity in this context
          timeFilter = tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()
        }

        return t.type === 'expense' && t.category === b.category && timeFilter
      }).reduce((a, c) => a + c.amount, 0)

      return { ...b, spent }
    }).filter(b => b.spent > 0)
  }, [budgets, transactions, period])

  const totalSpent = useMemo(() => filteredBudgetData.reduce((sum, b) => sum + b.spent, 0), [filteredBudgetData])



  const filteredPayableVsReceivable = useMemo(() => {
    let startDate = new Date()
    let endDate = new Date()

    if (period === 'ano') {
      startDate = new Date(startDate.getFullYear(), 0, 1)
      endDate = new Date(startDate.getFullYear(), 11, 31)
    } else {
      // Default to 'mês'
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
    }

    // Ajuste de fuso horário
    const userTimezoneOffset = startDate.getTimezoneOffset() * 60000

    const payableBills = bills.filter(b => {
      const bDate = new Date(b.due_date)
      const adjustDate = new Date(bDate.getTime() + userTimezoneOffset)
      return adjustDate >= startDate && adjustDate <= endDate && b.status !== 'paid'
    }).reduce((acc, b) => acc + b.amount, 0)

    // Calcular custo de streamings
    // Se for 'ano', multiplica por 12 (ou meses restantes, mas simplificado para custo anual)
    // Se for 'mês', custo mensal
    const streamingCost = streamings.reduce((acc, s) => {
      return acc + (period === 'ano' ? s.monthly_price * 12 : s.monthly_price)
    }, 0)

    const payable = payableBills + streamingCost

    const receivable = receivables.filter(r => {
      const rDate = new Date(r.due_date)
      const adjustDate = new Date(rDate.getTime() + userTimezoneOffset)
      return adjustDate >= startDate && adjustDate <= endDate && r.status !== 'received'
    }).reduce((acc, r) => acc + r.amount, 0)

    return { payable, receivable }
  }, [bills, receivables, streamings, period])

  // Prepare data for Pie Charts
  const expenseDistributionData = useMemo(() => {
    return filteredBudgetData.map((b, i) => ({
      label: b.category,
      value: b.spent,
      color: colors[i % colors.length]
    }))
  }, [filteredBudgetData])

  const payableReceivableData = useMemo(() => {
    return [
      { label: 'A Receber', value: filteredPayableVsReceivable.receivable, color: '#2563EB' },
      { label: 'A Pagar', value: filteredPayableVsReceivable.payable, color: '#000000' }
    ].filter(d => d.value > 0)
  }, [filteredPayableVsReceivable])



  return (
    <div className="grid gap-4 md:gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs sm:text-sm text-gray-600">Saldo Atual</div>
          <div className="text-2xl sm:text-3xl font-semibold text-black">R$ {balance.toFixed(2)}</div>
        </div>
        <select className="border border-gray-300 rounded px-2 py-1 bg-white shadow-sm text-sm w-full sm:w-auto" value={period} onChange={e => setPeriod(e.target.value as any)}>
          <option value="dia">Dia</option>
          <option value="semana">Semana</option>
          <option value="mês">Mês</option>
          <option value="ano">Ano</option>
        </select>
      </div>
      <div>
        <div className="mb-2 text-sm text-gray-700">Alertas de Orçamento</div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded shadow p-3 md:p-4 border border-gray-200">
            <div className="text-sm font-medium mb-3 text-gray-700">Distribuição de Gastos</div>
            {totalSpent > 0 ? (
              <PieChart data={expenseDistributionData} />
            ) : (
              <div className="flex items-center justify-center h-[200px] sm:h-[250px] text-gray-400 text-sm">
                Nenhum gasto registrado
              </div>
            )}
            <div className="mt-3 md:mt-4 space-y-2">
              {filteredBudgetData.map((b, i) => (
                <div key={b.id} className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }}></div>
                  <span className="text-gray-700 truncate">{b.category}:</span>
                  <span className="font-medium">R$ {b.spent.toFixed(2)}</span>
                </div>
              ))}
            </div>
            {totalSpent > 0 && (
              <div className="mt-3 md:mt-4 flex justify-end">
                <div className="text-sm sm:text-base font-semibold text-gray-800">
                  Total: R$ {totalSpent.toFixed(2)}
                </div>
              </div>
            )}
          </div>
          <div className="grid gap-3 md:gap-4">
            {budgets.map(b => {
              // We need to re-calculate specific budget spending for the progress bar based on the period filter
              // Actually filteredBudgetData already has the filtered 'spent'. We should find it there.
              const budgetStats = filteredBudgetData.find(fb => fb.id === b.id)
              const spent = budgetStats ? budgetStats.spent : 0

              const pct = Math.min(100, Math.round((spent / b.limit) * 100))
              const color = pct >= 80 ? 'bg-red-50 text-red-700 border-red-200' : pct >= 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-blue-700 border-blue-200'
              return (
                <div key={b.id} className={`rounded shadow p-3 md:p-4 border border-gray-200 ${color}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm sm:text-base">{b.category}</div>
                    <div className="font-semibold text-sm sm:text-base">{pct}%</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Gasto: R$ {spent.toFixed(2)} / Limite: R$ {b.limit.toFixed(2)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div>
        <div className="mb-2 text-sm text-gray-700">Fluxo Futuro: A Pagar vs A Receber ({period === 'ano' ? 'Ano Atual' : 'Este Mês'})</div>
        <div className="bg-white rounded shadow p-3 md:p-4 border border-gray-200 mb-6">
          <PieChart data={payableReceivableData} />
        </div>

      </div>
    </div>
  )
}
