type Point = { x: number, y: number }
export default function Chart({ data }: { data: number[] }) {
  const w = 600
  const h = 200
  const max = Math.max(1, ...data)
  const points: Point[] = data.map((v, i) => ({ x: (i / (data.length - 1)) * (w - 40) + 20, y: h - 20 - (v / max) * (h - 40) }))
  const d = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
  return (
    <svg width="100%" height="auto" viewBox={`0 0 ${w} ${h}`} className="bg-white rounded shadow max-w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="50%" stopColor="#374151" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(16,185,129,0.25)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0.05)" />
        </linearGradient>
      </defs>
      <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="url(#lineGrad)" strokeWidth={3} />
      <path d={`${d} L ${w - 20} ${h - 20} L 20 ${h - 20} Z`} fill="url(#fillGrad)" />
    </svg>
  )
}
