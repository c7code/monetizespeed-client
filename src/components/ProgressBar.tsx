export default function ProgressBar({ value, max }: { value: number, max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const color = pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-blue-500'
  return (
    <div className="w-full h-2.5 bg-dark-surface rounded-full overflow-hidden">
      <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: pct + '%' }} />
    </div>
  )
}
