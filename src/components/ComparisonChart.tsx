type ComparisonData = { income: number; expenses: number }

export default function ComparisonChart({ data }: { data: ComparisonData[] }) {
  const w = 600
  const h = 250
  const margin = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartWidth = w - margin.left - margin.right
  const chartHeight = h - margin.top - margin.bottom
  const barWidth = chartWidth / (data.length * 2.5)
  const gap = barWidth * 0.3

  const maxValue = Math.max(
    1,
    ...data.flatMap(d => [d.income, d.expenses])
  )

  const monthLabels = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - i))
    return date.toLocaleDateString('pt-BR', { month: 'short' })
  })

  return (
    <svg width="100%" height="auto" viewBox={`0 0 ${w} ${h}`} className="bg-white rounded shadow max-w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      
      {/* Eixos */}
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={h - margin.bottom}
        stroke="#e5e7eb"
        strokeWidth="2"
      />
      <line
        x1={margin.left}
        y1={h - margin.bottom}
        x2={w - margin.right}
        y2={h - margin.bottom}
        stroke="#e5e7eb"
        strokeWidth="2"
      />

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = margin.top + chartHeight * (1 - ratio)
        return (
          <line
            key={ratio}
            x1={margin.left}
            y1={y}
            x2={w - margin.right}
            y2={y}
            stroke="#f3f4f6"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        )
      })}

      {/* Labels do eixo Y */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = margin.top + chartHeight * (1 - ratio)
        const value = maxValue * ratio
        return (
          <text
            key={ratio}
            x={margin.left - 10}
            y={y + 4}
            textAnchor="end"
            fontSize="10"
            fill="#6b7280"
          >
            R$ {(value / 1000).toFixed(value >= 1000 ? 0 : 1)}k
          </text>
        )
      })}

      {/* Barras */}
      {data.map((d, i) => {
        const x = margin.left + (i * chartWidth) / data.length + gap
        const incomeHeight = (d.income / maxValue) * chartHeight
        const expenseHeight = (d.expenses / maxValue) * chartHeight
        const baseY = h - margin.bottom

        return (
          <g key={i}>
            {/* Barra de Receitas */}
            <rect
              x={x}
              y={baseY - incomeHeight}
              width={barWidth}
              height={incomeHeight}
              fill="url(#incomeGrad)"
              rx="2"
            />
            {/* Barra de Despesas */}
            <rect
              x={x + barWidth + gap * 0.5}
              y={baseY - expenseHeight}
              width={barWidth}
              height={expenseHeight}
              fill="url(#expenseGrad)"
              rx="2"
            />
            {/* Label do mês */}
            <text
              x={x + barWidth}
              y={h - margin.bottom + 20}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {monthLabels[i]}
            </text>
          </g>
        )
      })}

      {/* Legenda */}
      <g transform={`translate(${w - margin.right - 120}, ${margin.top})`}>
        <rect x={0} y={0} width={12} height={12} fill="url(#incomeGrad)" rx="2" />
        <text x={18} y={10} fontSize="11" fill="#374151">
          Receitas
        </text>
        <rect x={0} y={18} width={12} height={12} fill="url(#expenseGrad)" rx="2" />
        <text x={18} y={28} fontSize="11" fill="#374151">
          Despesas
        </text>
      </g>
    </svg>
  )
}



