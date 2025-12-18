export default function ProgressBar({ value, max }: { value: number, max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const color = pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-green-600'
  return (
    <div className="w-full h-3 bg-gray-200 rounded">
      <div className={`${color} h-3 rounded transition-all`} style={{ width: pct + '%' }} />
    </div>
  )
}
