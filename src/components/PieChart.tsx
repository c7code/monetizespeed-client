import React, { useMemo } from 'react'

type PieData = {
    label: string
    value: number
    color: string
}

type PieChartProps = {
    data: PieData[]
    size?: number
    showLegend?: boolean
}

export default function PieChart({ data, size = 300, showLegend = true }: PieChartProps) {
    const total = useMemo(() => data.reduce((acc, item) => acc + item.value, 0), [data])

    function createPieSlice(index: number, startAngle: number, endAngle: number, color: string) {
        const centerX = size / 2
        const centerY = size / 2
        const radius = size * 0.4

        // Ensure angles are within 0-360 range and handle full circle case
        if (endAngle - startAngle >= 360) {
            return (
                <circle
                    key={index}
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                />
            )
        }

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

    const slices = useMemo(() => {
        if (total === 0) return []

        let currentAngle = -90 // Start from top
        return data.map((item, i) => {
            const angle = (item.value / total) * 360
            const slice = createPieSlice(i, currentAngle, currentAngle + angle, item.color)
            currentAngle += angle
            return slice
        })
    }, [data, total, size])

    if (total === 0) {
        return (
            <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height: size }}>
                Sem dados para exibir
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex items-center justify-center overflow-hidden w-full">
                <svg width="100%" height="auto" viewBox={`0 0 ${size} ${size}`} className="max-w-[250px] sm:max-w-[300px]" preserveAspectRatio="xMidYMid meet">
                    {slices}
                </svg>
            </div>

            {showLegend && (
                <div className="mt-4 w-full space-y-2">
                    {data.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                            <span className="text-gray-700 truncate flex-1">{item.label}</span>
                            <span className="font-medium whitespace-nowrap">
                                R$ {item.value.toFixed(2)} ({((item.value / total) * 100).toFixed(0)}%)
                            </span>
                        </div>
                    ))}
                    <div className="mt-3 flex justify-end pt-2 border-t border-gray-100">
                        <div className="text-sm sm:text-base font-semibold text-gray-800">
                            Total: R$ {total.toFixed(2)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
