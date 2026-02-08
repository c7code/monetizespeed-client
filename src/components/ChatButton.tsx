import { useState } from 'react'
import Chat from '../pages/Chat'

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-110"
        aria-label="Abrir chat"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Modal do Chat */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false)
            }
          }}
        >
          <div className="bg-white rounded-t-lg md:rounded-lg shadow-xl w-full max-w-2xl h-[85vh] md:h-[80vh] flex flex-col animate-in slide-in-from-bottom md:slide-in-from-bottom-0 fade-in duration-300">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Chat de Gastos</h3>
                <p className="text-xs text-gray-500">Digite seus gastos em linguagem natural</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Fechar chat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo do Chat */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <Chat showHeader={false} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
