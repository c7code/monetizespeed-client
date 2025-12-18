import { useMemo, useState } from 'react'
import { useData } from '../store/data'
import ComparisonChart from '../components/ComparisonChart'

export default function Dashboard() {
  const { transactions, budgets } = useData()
  const [period, setPeriod] = useState<'dia' | 'semana' | 'mês' | 'ano'>('mês')
  const balance = useMemo(() => transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0), [transactions])
  
  const budgetData = useMemo(() => {
    return budgets.map(b => {
      const spent = transactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((a, c) => a + c.amount, 0)
      return { ...b, spent }
    }).filter(b => b.spent > 0)
  }, [budgets, transactions])

  const totalSpent = useMemo(() => budgetData.reduce((sum, b) => sum + b.spent, 0), [budgetData])

  const incomeVsExpenses = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      return date
    })
    
    return months.map(month => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date)
        return tDate >= monthStart && tDate <= monthEnd
      })
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0)
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0)
      
      return { income, expenses }
    })
  }, [transactions])

  const colors = [
    '#10b981', // green
    '#059669', // green dark
    '#000000', // black
    '#374151', // gray
    '#6b7280', // gray light
    '#ef4444', // red
    '#f59e0b', // yellow
    '#6366f1', // indigo
  ]

  function createPieSlice(index: number, startAngle: number, endAngle: number, color: string, size: number = 300) {
    const centerX = size / 2
    const centerY = size / 2
    const radius = size * 0.4
    
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180
    
    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    
    return (
      <path
        key={index}
        d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
        fill={color}
        stroke="white"
        strokeWidth="2"
      />
    )
  }

  const pieSlices = useMemo(() => {
    if (totalSpent === 0) return []
    
    let currentAngle = 0
    return budgetData.map((b, i) => {
      const angle = (b.spent / totalSpent) * 360
      const slice = createPieSlice(i, currentAngle, currentAngle + angle, colors[i % colors.length], 300)
      currentAngle += angle
      return slice
    })
  }, [budgetData, totalSpent])

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
              <div className="flex items-center justify-center overflow-hidden">
                <svg width="100%" height="auto" viewBox="0 0 300 300" className="max-w-[250px] sm:max-w-[300px]" preserveAspectRatio="xMidYMid meet">
                  {pieSlices}
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] sm:h-[250px] text-gray-400 text-sm">
                Nenhum gasto registrado
              </div>
            )}
            <div className="mt-3 md:mt-4 space-y-2">
              {budgetData.map((b, i) => (
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
              const spent = transactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((a, c) => a + c.amount, 0)
              const pct = Math.min(100, Math.round((spent / b.limit) * 100))
              const color = pct >= 80 ? 'bg-red-50 text-red-700 border-red-200' : pct >= 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-green-700 border-green-200'
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
        <div className="mb-2 text-sm text-gray-700">Comparação Receitas vs Despesas</div>
        <div className="bg-white rounded shadow p-3 md:p-4 border border-gray-200">
          <ComparisonChart data={incomeVsExpenses} />
        </div>
      </div>
    </div>
  )
}
