import { useMemo } from 'react'

type BarChartData = {
    label: string
    receivable: number
    payable: number
}

type BarChartProps = {
    data: BarChartData[]
    height?: number
}

export default function BarChart({ data, height = 260 }: BarChartProps) {
    const maxValue = useMemo(() => {
        const allValues = data.flatMap(d => [d.receivable, d.payable])
        return Math.max(1, ...allValues)
    }, [data])

    const formatCurrency = (value: number) =>
        value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

    // Calculate grid lines
    const gridLines = useMemo(() => {
        const lines: number[] = []
        const step = maxValue / 4
        for (let i = 0; i <= 4; i++) {
            lines.push(Math.round(step * i))
        }
        return lines
    }, [maxValue])

    const chartAreaHeight = height - 40 // Leave space for labels

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center text-gray-500 text-sm" style={{ height }}>
                Sem dados para exibir
            </div>
        )
    }

    const barGroupWidth = 100 / data.length

    return (
        <div className="w-full">
            {/* Legend */}
            <div className="flex items-center justify-end gap-5 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(180deg, #34d399, #10b981)' }} />
                    <span className="text-xs text-gray-400 font-medium">A Receber</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(180deg, #f87171, #ef4444)' }} />
                    <span className="text-xs text-gray-400 font-medium">A Pagar</span>
                </div>
            </div>

            {/* Chart */}
            <div className="relative" style={{ height }}>
                {/* Grid lines */}
                {gridLines.map((value, i) => {
                    const y = chartAreaHeight - (value / maxValue) * chartAreaHeight
                    return (
                        <div key={i} className="absolute left-0 right-0 flex items-center" style={{ top: y }}>
                            <span className="text-[10px] text-gray-600 w-12 text-right pr-2 flex-shrink-0">
                                {value > 0 ? `${(value / 1000).toFixed(value >= 1000 ? 0 : 1)}k` : '0'}
                            </span>
                            <div className="flex-1 border-t border-dark-border/50" />
                        </div>
                    )
                })}

                {/* Bars */}
                <div className="absolute left-14 right-2 bottom-[40px] flex items-end justify-around" style={{ height: chartAreaHeight }}>
                    {data.map((item, index) => {
                        const receivablePx = maxValue > 0 ? (item.receivable / maxValue) * chartAreaHeight : 0
                        const payablePx = maxValue > 0 ? (item.payable / maxValue) * chartAreaHeight : 0

                        return (
                            <div
                                key={index}
                                className="flex items-end justify-center gap-1"
                                style={{ width: `${barGroupWidth}%`, height: chartAreaHeight }}
                            >
                                {/* Receivable bar */}
                                <div className="relative group flex items-end">
                                    <div
                                        className="w-5 sm:w-7 rounded-t-md transition-all duration-700 ease-out cursor-pointer hover:opacity-80"
                                        style={{
                                            height: Math.max(item.receivable > 0 ? 4 : 0, receivablePx),
                                            background: 'linear-gradient(180deg, #34d399, #10b981)',
                                            boxShadow: '0 0 12px rgba(16, 185, 129, 0.2)',
                                        }}
                                    />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center z-10">
                                        <div className="bg-dark-card border border-dark-border text-gray-200 text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                                            <span className="text-green-400 font-semibold">R$ {formatCurrency(item.receivable)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payable bar */}
                                <div className="relative group flex items-end">
                                    <div
                                        className="w-5 sm:w-7 rounded-t-md transition-all duration-700 ease-out cursor-pointer hover:opacity-80"
                                        style={{
                                            height: Math.max(item.payable > 0 ? 4 : 0, payablePx),
                                            background: 'linear-gradient(180deg, #f87171, #ef4444)',
                                            boxShadow: '0 0 12px rgba(239, 68, 68, 0.2)',
                                        }}
                                    />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center z-10">
                                        <div className="bg-dark-card border border-dark-border text-gray-200 text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                                            <span className="text-red-400 font-semibold">R$ {formatCurrency(item.payable)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Month labels */}
                <div className="absolute left-14 right-2 bottom-0 flex justify-around" style={{ height: '36px' }}>
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className="text-[11px] text-gray-500 font-medium text-center pt-2"
                            style={{ width: `${barGroupWidth}%` }}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary below chart */}
            <div className="grid grid-cols-2 gap-3 mt-5">
                {(() => {
                    const totalReceivable = data.reduce((acc, d) => acc + d.receivable, 0)
                    const totalPayable = data.reduce((acc, d) => acc + d.payable, 0)
                    const balance = totalReceivable - totalPayable
                    return (
                        <>
                            <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                                <p className="text-[10px] text-green-400/70 font-semibold tracking-wider uppercase">Total a Receber</p>
                                <p className="text-base font-bold text-green-400 mt-0.5">R$ {formatCurrency(totalReceivable)}</p>
                            </div>
                            <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                                <p className="text-[10px] text-red-400/70 font-semibold tracking-wider uppercase">Total a Pagar</p>
                                <p className="text-base font-bold text-red-400 mt-0.5">R$ {formatCurrency(totalPayable)}</p>
                            </div>
                        </>
                    )
                })()}
            </div>
        </div>
    )
}
