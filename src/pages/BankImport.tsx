import { useState } from 'react'
import { useData } from '../store/data'

function categorize(desc: string) {
  const d = desc.toLowerCase()
  if (d.includes('uber') || d.includes('bus') || d.includes('trans')) return 'Transporte'
  if (d.includes('mercado') || d.includes('rest') || d.includes('food')) return 'Alimentação'
  if (d.includes('salario') || d.includes('salary')) return 'Salário'
  if (d.includes('netflix') || d.includes('cinema')) return 'Lazer'
  return 'Saúde'
}

export default function BankImport() {
  const { addTransaction } = useData()
  const [info, setInfo] = useState('')
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const text = await f.text()
    const lines = text.split(/\r?\n/).filter(Boolean)
    let imported = 0
    lines.forEach(line => {
      const parts = line.split(',')
      if (parts.length >= 3) {
        const date = parts[0]
        const description = parts[1]
        const amount = Number(parts[2])
        const type = amount >= 0 ? 'income' : 'expense'
        const category = categorize(description)
        addTransaction({ type: type as any, category, amount: Math.abs(amount), date, description })
        imported += 1
      }
    })
    setInfo(imported + ' linhas importadas')
  }
  return (
    <div className="grid gap-3 md:gap-4">
      <div className="rounded shadow p-3 md:p-4 border border-gray-200 bg-gray-50">
        <div className="text-base md:text-lg font-medium mb-3">Importar Extrato (CSV simples)</div>
        <input type="file" accept=".csv,text/csv" onChange={onFile} className="w-full file:mr-2 sm:file:mr-4 file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 text-xs sm:text-sm" />
        {info && <div className="text-xs sm:text-sm text-gray-700 mt-2">{info}</div>}
      </div>
      <div className="text-xs sm:text-sm text-gray-700">Formato esperado: data,descrição,valor. Valores positivos como receitas, negativos como despesas.</div>
    </div>
  )
}
