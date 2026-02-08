import { useMemo } from 'react'
import { useData } from '../store/data'
import jsPDF from 'jspdf'

export default function Reports() {
  const { transactions } = useData()
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {}
    transactions.filter(t=>t.type==='expense').forEach(t => { map[t.category] = (map[t.category]||0) + t.amount })
    return Object.entries(map).sort((a,b)=>b[1]-a[1])
  }, [transactions])
  const top5 = byCategory.slice(0,5)
  
  const totalExpenses = useMemo(() => {
    return byCategory.reduce((sum, [, val]) => sum + val, 0)
  }, [byCategory])

  const generatePDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPos = margin

    // Título
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 0)
    doc.text('Relatórios MonetizeSpeed', pageWidth / 2, yPos, { align: 'center' })
    yPos += 15

    // Data do relatório
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    const date = new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
    doc.text(`Gerado em: ${date}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 20

    // Resumo por Categoria
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Resumo por Categoria', margin, yPos)
    yPos += 10

    doc.setFontSize(11)
    byCategory.forEach(([cat, val]) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = margin
      }
      doc.setTextColor(0, 0, 0)
      doc.text(cat, margin + 5, yPos)
      doc.setTextColor(0, 0, 0)
      doc.text(`R$ ${val.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' })
      yPos += 8
    })

    yPos += 10

    // Top 5 Despesas
    if (yPos > 250) {
      doc.addPage()
      yPos = margin
    }
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Top 5 Despesas', margin, yPos)
    yPos += 10

    doc.setFontSize(11)
    top5.forEach(([cat, val]) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = margin
      }
      doc.setTextColor(0, 0, 0)
      doc.text(cat, margin + 5, yPos)
      doc.setTextColor(0, 0, 0)
      doc.text(`R$ ${val.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' })
      yPos += 8
    })

    yPos += 10

    // Total de Gastos
    if (yPos > 250) {
      doc.addPage()
      yPos = margin
    }
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, 'bold')
    doc.text('Total de Gastos', margin, yPos)
    yPos += 8
    doc.setFontSize(16)
    doc.text(`R$ ${totalExpenses.toFixed(2)}`, margin + 5, yPos)
    doc.setFont(undefined, 'normal')

    // Salvar PDF
    doc.save(`relatorio-monetizespeed-${date.replace(/\//g, '-')}.pdf`)
  }

  return (
    <div className="grid gap-4 md:gap-6">
      <div className="flex justify-end">
        <button
          onClick={generatePDF}
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition-colors text-sm md:text-base font-medium shadow-sm"
        >
          📥 Baixar PDF
        </button>
      </div>
      <div className="rounded shadow p-3 md:p-4 border border-gray-200 bg-gray-50">
        <div className="text-base md:text-lg font-medium mb-3">Resumo por Categoria</div>
        <ul className="space-y-2">
          {byCategory.map(([cat, val]) => (
            <li key={cat} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <span className="px-2 py-1 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-700 inline-block w-fit">{cat}</span>
              <span className="font-medium text-sm sm:text-base">R$ {val.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded shadow p-3 md:p-4 border border-gray-200 bg-gray-50">
        <div className="text-base md:text-lg font-medium mb-3">Top 5 Despesas</div>
        <ul className="space-y-2">
          {top5.map(([cat, val]) => (
            <li key={cat} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <span className="px-2 py-1 rounded-full text-xs sm:text-sm bg-gray-200 text-gray-700 inline-block w-fit">{cat}</span>
              <span className="font-medium text-sm sm:text-base">R$ {val.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
