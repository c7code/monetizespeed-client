import { useState, useRef, useEffect } from 'react'
import { useData, presetCategories } from '../store/data'
import { useAuth } from '../store/auth'
import { apiUrl } from '../config/api'
import AudioRecorder from '../components/AudioRecorder'

type Message = {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  transactionCreated?: boolean
  imageUrl?: string
}

// Mapeamento de palavras-chave para categorias
const categoryKeywords: Record<string, string> = {
  'comida': 'Alimentação',
  'alimentação': 'Alimentação',
  'almoço': 'Alimentação',
  'jantar': 'Alimentação',
  'café': 'Alimentação',
  'restaurante': 'Alimentação',
  'supermercado': 'Alimentação',
  'mercado': 'Alimentação',
  'uber': 'Transporte',
  'táxi': 'Transporte',
  'transporte': 'Transporte',
  'combustível': 'Transporte',
  'gasolina': 'Transporte',
  'ônibus': 'Transporte',
  'metrô': 'Transporte',
  'aluguel': 'Moradia',
  'moradia': 'Moradia',
  'condomínio': 'Moradia',
  'luz': 'Moradia',
  'água': 'Moradia',
  'internet': 'Moradia',
  'cinema': 'Lazer',
  'lazer': 'Lazer',
  'show': 'Lazer',
  'festa': 'Lazer',
  'viagem': 'Lazer',
  'médico': 'Saúde',
  'saúde': 'Saúde',
  'farmácia': 'Saúde',
  'remédio': 'Saúde',
  'hospital': 'Saúde',
  'salário': 'Salário',
  'receita': 'Salário',
  'pagamento': 'Salário'
}

function extractTransaction(text: string): {
  amount: number | null
  category: string | null
  description: string
  type: 'expense' | 'income' | null
} {
  const lowerText = text.toLowerCase()

  // Extrair valor monetário
  const amountPatterns = [
    /r\$\s*(\d+[\.,]?\d*)/gi,
    /(\d+[\.,]?\d*)\s*reais?/gi,
    /(\d+[\.,]?\d*)\s*r\$/gi,
    /(\d+[\.,]?\d*)\s*rs/gi
  ]

  let amount: number | null = null
  for (const pattern of amountPatterns) {
    const match = text.match(pattern)
    if (match) {
      const valueStr = match[0].replace(/[r$rsreais\s]/gi, '').replace(',', '.')
      amount = parseFloat(valueStr)
      if (amount) break
    }
  }

  // Se não encontrou valor explícito, procurar números isolados
  if (!amount) {
    const numberMatch = text.match(/\b(\d+[\.,]?\d*)\b/)
    if (numberMatch) {
      const valueStr = numberMatch[1].replace(',', '.')
      const num = parseFloat(valueStr)
      // Só considera se for um valor razoável (entre 1 e 1000000)
      if (num >= 1 && num <= 1000000) {
        amount = num
      }
    }
  }

  // Determinar tipo (gasto ou receita)
  const expenseKeywords = ['gastei', 'gasto', 'paguei', 'pago', 'comprei', 'compra', 'despesa', 'saída']
  const incomeKeywords = ['recebi', 'recebido', 'ganhei', 'entrada', 'salário', 'receita']

  let type: 'expense' | 'income' | null = null
  if (expenseKeywords.some(kw => lowerText.includes(kw))) {
    type = 'expense'
  } else if (incomeKeywords.some(kw => lowerText.includes(kw))) {
    type = 'income'
  } else {
    // Por padrão, se tem valor, assume que é gasto
    type = amount ? 'expense' : null
  }

  // Identificar categoria
  let category: string | null = null
  for (const [keyword, cat] of Object.entries(categoryKeywords)) {
    if (lowerText.includes(keyword)) {
      category = cat
      break
    }
  }

  // Se não encontrou categoria, usa a primeira disponível como padrão
  if (!category && type) {
    category = type === 'expense' ? presetCategories[0] : 'Salário'
  }

  return {
    amount,
    category,
    description: text.trim(),
    type
  }
}

type ChatProps = {
  showHeader?: boolean
}

export default function Chat({ showHeader = true }: ChatProps) {
  const { addTransaction } = useData()
  const { token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Eu sou seu assistente de finanças. Você pode me dizer seus gastos e receitas em linguagem natural, gravar um áudio ou enviar uma foto de recibo/nota fiscal. Por exemplo: "Gastei R$ 50 com comida hoje" ou "Paguei R$ 100 de aluguel".',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleAudioData = async (data: any) => {
    // Adicionar mensagem do usuário com o texto transcrito
    if (data.text) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: `🎙️ ${data.text}`,
        sender: 'user',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
    }

    if (data.amount && data.type) {
      try {
        // Determinar categoria válida
        let finalCategory = data.category;
        if (!presetCategories.includes(finalCategory)) {
          finalCategory = 'Outros'; // Fallback
        }

        await addTransaction({
          type: data.type,
          category: finalCategory,
          amount: Number(data.amount),
          date: data.date || new Date().toISOString().slice(0, 10),
          description: data.description || 'Transação via áudio',
          status: data.type === 'expense' ? 'paid' : 'received'
        })

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `✅ Transação de áudio criada com sucesso!\n\nTipo: ${data.type === 'expense' ? 'Despesa' : 'Receita'}\nValor: R$ ${Number(data.amount).toFixed(2)}\nCategoria: ${finalCategory}\nDescrição: ${data.description}`,
          sender: 'bot',
          timestamp: new Date(),
          transactionCreated: true
        }
        setMessages(prev => [...prev, botMessage])

      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `❌ Erro ao criar transação de áudio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } else {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `⚠️ Não consegui entender todos os detalhes do áudio. Tente novamente sendo mais específico.`,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    // Processar mensagem
    const transaction = extractTransaction(userMessage.text)

    if (transaction.amount && transaction.type && transaction.category) {
      try {
        await addTransaction({
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          date: new Date().toISOString().slice(0, 10),
          description: transaction.description,
          status: transaction.type === 'expense' ? 'paid' : 'received'
        })

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `✅ Transação criada com sucesso!\n\nTipo: ${transaction.type === 'expense' ? 'Despesa' : 'Receita'}\nValor: R$ ${transaction.amount.toFixed(2)}\nCategoria: ${transaction.category}\nDescrição: ${transaction.description}\n\nVocê pode ver esta transação na página de Transações.`,
          sender: 'bot',
          timestamp: new Date(),
          transactionCreated: true
        }
        setMessages(prev => [...prev, botMessage])
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `❌ Erro ao criar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } else {
      let helpText = 'Não consegui identificar todas as informações necessárias.\n\n'

      if (!transaction.amount) {
        helpText += '⚠️ Não encontrei um valor. Tente incluir valores como "R$ 50" ou "100 reais".\n'
      }
      if (!transaction.type) {
        helpText += '⚠️ Não identifiquei se é um gasto ou receita. Use palavras como "gastei", "paguei" ou "recebi".\n'
      }

      helpText += '\nExemplos:\n'
      helpText += '• "Gastei R$ 50 com comida"\n'
      helpText += '• "Paguei R$ 100 de aluguel"\n'
      helpText += '• "Recebi R$ 2000 de salário"'

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: helpText,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    }

    setIsProcessing(false)
  }

  // ==================== IMAGE UPLOAD ====================

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || isProcessing) return

    // Reset input so the same file can be selected again
    e.target.value = ''

    setIsProcessing(true)

    // Create a local preview URL
    const previewUrl = URL.createObjectURL(file)

    // Add user message with image preview
    const userMsg: Message = {
      id: Date.now().toString(),
      text: '📷 Foto enviada para análise',
      sender: 'user',
      timestamp: new Date(),
      imageUrl: previewUrl
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(apiUrl('/image/transaction'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Erro ao processar imagem no servidor.')
      }

      const result = await response.json()
      const { analysis, data } = result

      if (data && data.amount) {
        let finalCategory = data.category
        if (!presetCategories.includes(finalCategory)) {
          finalCategory = 'Outros'
        }

        await addTransaction({
          type: data.type || 'expense',
          category: finalCategory,
          amount: Number(data.amount),
          date: data.date || new Date().toISOString().slice(0, 10),
          description: data.description || 'Transação via foto',
          status: data.type === 'expense' ? 'paid' : 'received'
        })

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: `🔍 ${analysis}\n\n✅ Transação criada com sucesso!\n\nTipo: ${data.type === 'expense' ? 'Despesa' : 'Receita'}\nValor: R$ ${Number(data.amount).toFixed(2)}\nCategoria: ${finalCategory}\nDescrição: ${data.description}`,
          sender: 'bot',
          timestamp: new Date(),
          transactionCreated: true
        }
        setMessages(prev => [...prev, botMsg])
      } else {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: `🔍 ${analysis || 'Não foi possível identificar uma transação financeira nesta imagem.'}\n\n⚠️ Tente enviar uma foto mais nítida do recibo ou nota fiscal.`,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMsg])
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ Erro ao processar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={`flex flex-col ${showHeader ? 'h-[calc(100dvh-120px)]' : 'h-full'}`}>
      {showHeader && (
        <div className="p-3 md:p-4 border-b border-dark-border flex justify-between items-center">
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-1">Chat de Gastos</h2>
            <p className="text-xs md:text-sm text-gray-400">
              Digite ou fale seus gastos e receitas.
            </p>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] md:max-w-[70%] rounded-lg px-3 md:px-4 py-2 ${msg.sender === 'user'
                ? 'bg-blue-600 text-white'
                : msg.transactionCreated
                  ? 'bg-dark-hover border border-blue-500/30 text-gray-200'
                  : 'bg-dark-hover text-gray-200'
                }`}
            >
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="Foto enviada"
                  className="w-48 h-36 object-cover rounded-md mb-2"
                />
              )}
              <p className="text-sm md:text-base whitespace-pre-wrap">{msg.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-dark-hover rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 md:p-4 border-t border-dark-border">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ex: Gastei R$ 50 com comida hoje"
            className="flex-1 border border-dark-border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isProcessing}
          />
          {/* Image upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center justify-center bg-cyan-600 text-white rounded-full p-2 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            title="Enviar foto de recibo/nota fiscal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <AudioRecorder onTranscriptionComplete={handleAudioData} />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="bg-blue-600 text-white rounded-lg px-4 md:px-6 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
          >
            Enviar
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Dica: Use frases como "Gastei R$ 50 com comida", grave um áudio ou envie uma 📷 foto de recibo
        </p>
      </form>
    </div>
  )
}
