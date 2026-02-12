import { useMemo } from 'react'

type PieData = {
    label: string
    value: number
    color: string
}

type DonutChartProps = {
    data: PieData[]
    size?: number
    strokeWidth?: number
    showLegend?: boolean
    centerLabel?: string
    centerValue?: string
}

export default function PieChart({
    data,
    size = 200,
    strokeWidth = 32,
    showLegend = true,
    centerLabel = 'TOTAL',
    centerValue
}: DonutChartProps) {
    const total = useMemo(() => data.reduce((acc, item) => acc + item.value, 0), [data])
    const displayValue = centerValue || `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const center = size / 2

    const slices = useMemo(() => {
        if (total === 0) return []
        let accumulated = 0
        return data.map((item) => {
            const percentage = item.value / total
            const offset = accumulated
            accumulated += percentage
            return {
                ...item,
                percentage,
                offset,
                dashArray: `${circumference * percentage} ${circumference * (1 - percentage)}`,
                dashOffset: -circumference * offset,
            }
        })
    }, [data, total, circumference])

    if (total === 0) {
        return (
            <div className="flex items-center justify-center text-gray-500 text-sm" style={{ height: size }}>
                Sem dados para exibir
            </div>
        )
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
            <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Background circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth={strokeWidth}
                    />
                    {/* Data slices */}
                    {slices.map((slice, i) => (
                        <circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={slice.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={slice.dashArray}
                            strokeDashoffset={slice.dashOffset}
                            strokeLinecap="butt"
                            transform={`rotate(-90 ${center} ${center})`}
                            className="transition-all duration-700 ease-out"
                        />
                    ))}
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">{centerLabel}</span>
                    <span className="text-lg font-bold text-gray-100">{displayValue}</span>
                </div>
            </div>

            {showLegend && (
                <div className="space-y-3 min-w-0">
                    {data.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-gray-400 truncate">{item.label}</span>
                            <span className="font-semibold text-gray-200 ml-auto whitespace-nowrap">
                                {((item.value / total) * 100).toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
