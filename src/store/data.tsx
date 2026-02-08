import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useAuth } from './auth'
import { categories } from '../mock/data'
import { apiUrl } from '../config/api'

export type Transaction = { id: string, type: 'income' | 'expense', category: string, amount: number, date: string, recurring?: boolean, receiptUrl?: string, description?: string, status?: 'paid' | 'received' | 'pending_payment' | 'pending_receipt' }
export type Budget = { id: string, category: string, limit: number }
export type Goal = { id: string, name: string, target: number, saved: number }
export type CreditCard = { id: string, name: string, limit_amount: number, total_spent: number, closing_day?: number | null, due_day?: number | null }
export type Wallet = { id: string, name: string, bank_name: string | null, account_type: string, balance: number, bank_logo_url: string | null }
export type Streaming = { id: string, name: string, monthly_price: number, color: string }
export type Bill = {
  id: string
  description: string
  amount: number
  due_date: string
  status: 'pending' | 'paid' | 'overdue'
  category?: string
  supplier_name?: string
  supplier_document?: string
  supplier_contact?: string
  supplier_phone?: string
  payment_method?: string
  pix_key?: string
  wallet_id?: number
  is_recurring?: boolean
  notes?: string
  paid_date?: string
}

export type Receivable = {
  id: string
  description: string
  amount: number
  due_date: string
  status: 'pending' | 'received' | 'overdue'
  category?: string
  customer_name?: string
  customer_document?: string
  wallet_id?: number
  is_recurring?: boolean
  notes?: string
  received_date?: string
}

type DataContextType = {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  creditCards: CreditCard[]
  wallets: Wallet[]
  streamings: Streaming[]
  loading: boolean
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>
  updateBudget: (id: string, b: Partial<Budget>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  addGoal: (g: Omit<Goal, 'id'>) => Promise<void>
  updateGoal: (id: string, g: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  addCreditCard: (c: Omit<CreditCard, 'id'>) => Promise<void>
  updateCreditCard: (id: string, c: Partial<CreditCard>) => Promise<void>
  deleteCreditCard: (id: string) => Promise<void>
  addWallet: (w: Omit<Wallet, 'id'> & { initial_balance?: number }) => Promise<void>
  updateWallet: (id: string, w: Partial<Wallet>) => Promise<void>
  deleteWallet: (id: string) => Promise<void>
  addStreaming: (s: Omit<Streaming, 'id' | 'color'>) => Promise<void>
  updateStreaming: (id: string, s: Partial<Streaming>) => Promise<void>
  deleteStreaming: (id: string) => Promise<void>
  bills: Bill[]
  addBill: (b: Omit<Bill, 'id' | 'status'>) => Promise<void>
  updateBill: (id: string, b: Partial<Bill>) => Promise<void>
  deleteBill: (id: string) => Promise<void>
  payBill: (id: string) => Promise<void>
  receivables: Receivable[]
  addReceivable: (r: Omit<Receivable, 'id' | 'status'>) => Promise<void>
  updateReceivable: (id: string, r: Partial<Receivable>) => Promise<void>
  deleteReceivable: (id: string) => Promise<void>
  receiveBill: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextType>({
  transactions: [],
  budgets: [],
  goals: [],
  creditCards: [],
  wallets: [],
  streamings: [],
  loading: false,
  addTransaction: async () => { },
  updateTransaction: async () => { },
  deleteTransaction: async () => { },
  addBudget: async () => { },
  updateBudget: async () => { },
  deleteBudget: async () => { },
  addGoal: async () => { },
  updateGoal: async () => { },
  deleteGoal: async () => { },
  addCreditCard: async () => { },
  updateCreditCard: async () => { },
  deleteCreditCard: async () => { },
  addWallet: async () => { },
  updateWallet: async () => { },
  deleteWallet: async () => { },
  addStreaming: async () => { },
  updateStreaming: async () => { },
  deleteStreaming: async () => { },
  bills: [],
  addBill: async () => { },
  updateBill: async () => { },
  deleteBill: async () => { },
  payBill: async () => { },
  receivables: [],
  addReceivable: async () => { },
  updateReceivable: async () => { },
  deleteReceivable: async () => { },
  receiveBill: async () => { },
  refresh: async () => { }
})

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('ms_token')
  const response = await fetch(apiUrl(endpoint), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro na requisição' }))
    throw new Error(error.error || 'Erro na requisição')
  }

  return response.json()
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [streamings, setStreamings] = useState<Streaming[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    if (!token) {
      setTransactions([])
      setBudgets([])
      setGoals([])
      setCreditCards([])
      setWallets([])
      setStreamings([])
      setBills([])
      return
    }

    setLoading(true)
    try {
      // Carregar dados em paralelo, mas tratar erros individualmente
      const results = await Promise.allSettled([
        apiCall('/transactions'),
        apiCall('/budgets'),
        apiCall('/goals'),
        apiCall('/credit-cards'),
        apiCall('/wallets'),
        apiCall('/streamings'),
        apiCall('/bills'),
        apiCall('/receivables'),
      ])

      // Processar transações
      if (results[0].status === 'fulfilled') {
        setTransactions(results[0].value.map((t: any) => ({
          ...t,
          receiptUrl: t.receipt_url,
          id: t.id.toString(),
          amount: parseFloat(t.amount) || 0
        })))
      } else {
        console.error('Erro ao carregar transações:', results[0].reason)
        setTransactions([])
      }

      // Processar orçamentos
      if (results[1].status === 'fulfilled') {
        setBudgets(results[1].value.map((b: any) => ({
          ...b,
          id: b.id.toString(),
          limit: parseFloat(b.limit) || 0
        })))
      } else {
        console.error('Erro ao carregar orçamentos:', results[1].reason)
        setBudgets([])
      }

      // Processar metas
      if (results[2].status === 'fulfilled') {
        setGoals(results[2].value.map((g: any) => ({
          ...g,
          id: g.id.toString(),
          target: parseFloat(g.target) || 0,
          saved: parseFloat(g.saved) || 0
        })))
      } else {
        console.error('Erro ao carregar metas:', results[2].reason)
        setGoals([])
      }

      // Processar cartões de crédito
      if (results[3].status === 'fulfilled') {
        setCreditCards(results[3].value.map((c: any) => ({
          ...c,
          id: c.id.toString(),
          limit_amount: parseFloat(c.limit_amount) || 0,
          total_spent: parseFloat(c.total_spent) || 0
        })))
      } else {
        console.error('Erro ao carregar cartões de crédito:', results[3].reason)
        setCreditCards([])
      }

      // Processar carteiras
      if (results[4].status === 'fulfilled') {
        setWallets(results[4].value.map((w: any) => ({
          ...w,
          id: w.id.toString(),
          balance: parseFloat(w.balance) || 0
        })))
      } else {
        console.error('Erro ao carregar carteiras:', results[4].reason)
        setWallets([])
      }

      // Processar streamings
      if (results[5].status === 'fulfilled') {
        setStreamings(results[5].value.map((s: any) => ({
          ...s,
          id: s.id.toString(),
          monthly_price: parseFloat(s.monthly_price) || 0
        })))
      } else {
        console.error('Erro ao carregar streamings:', results[5].reason)
        setStreamings([])
      }

      // Processar contas a pagar
      if (results[6].status === 'fulfilled') {
        setBills(results[6].value.map((b: any) => ({
          ...b,
          id: b.id.toString(),
          amount: parseFloat(b.amount) || 0
        })))
      } else {
        console.error('Erro ao carregar contas a pagar:', results[6].reason)
        setBills([])
      }

      // Processar contas a receber
      if (results[7].status === 'fulfilled') {
        setReceivables(results[7].value.map((r: any) => ({
          ...r,
          id: r.id.toString(),
          amount: parseFloat(r.amount) || 0
        })))
      } else {
        console.error('Erro ao carregar contas a receber:', results[7].reason)
        setReceivables([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [token])

  async function addTransaction(t: Omit<Transaction, 'id'>) {
    const data = await apiCall('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        ...t,
        receipt_url: t.receiptUrl,
        status: t.status || (t.type === 'expense' ? 'paid' : 'received')
      }),
    })
    await loadData()
  }

  async function updateTransaction(id: string, t: Partial<Transaction>) {
    await apiCall(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...t,
        receipt_url: t.receipt_url || t.receiptUrl
      }),
    })
    await loadData()
  }

  async function deleteTransaction(id: string) {
    await apiCall(`/transactions/${id}`, {
      method: 'DELETE',
    })
    await loadData()
  }

  async function addBudget(b: Omit<Budget, 'id'>) {
    await apiCall('/budgets', {
      method: 'POST',
      body: JSON.stringify(b),
    })
    await loadData()
  }

  async function updateBudget(id: string, b: Partial<Budget>) {
    await apiCall(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(b),
    })
    await loadData()
  }

  async function deleteBudget(id: string) {
    await apiCall(`/budgets/${id}`, {
      method: 'DELETE',
    })
    await loadData()
  }

  async function addGoal(g: Omit<Goal, 'id'>) {
    await apiCall('/goals', {
      method: 'POST',
      body: JSON.stringify(g),
    })
    await loadData()
  }

  async function updateGoal(id: string, g: Partial<Goal>) {
    await apiCall(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(g),
    })
    await loadData()
  }

  async function deleteGoal(id: string) {
    await apiCall(`/goals/${id}`, {
      method: 'DELETE',
    })
    await loadData()
  }

  async function addCreditCard(c: Omit<CreditCard, 'id'>) {
    await apiCall('/credit-cards', {
      method: 'POST',
      body: JSON.stringify(c),
    })
    await loadData()
  }

  async function updateCreditCard(id: string, c: Partial<CreditCard>) {
    await apiCall(`/credit-cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(c),
    })
    await loadData()
  }

  async function deleteCreditCard(id: string) {
    await apiCall(`/credit-cards/${id}`, {
      method: 'DELETE',
    })
    await loadData()
  }

  async function addWallet(w: Omit<Wallet, 'id'> & { initial_balance?: number }) {
    await apiCall('/wallets', {
      method: 'POST',
      body: JSON.stringify(w),
    })
    await loadData()
  }

  async function updateWallet(id: string, w: Partial<Wallet>) {
    await apiCall(`/wallets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(w),
    })
    await loadData()
  }

  async function deleteWallet(id: string) {
    await apiCall(`/wallets/${id}`, {
      method: 'DELETE',
    })
    await loadData()
  }

  async function addStreaming(s: Omit<Streaming, 'id' | 'color'>) {
    await apiCall('/streamings', {
      method: 'POST',
      body: JSON.stringify(s),
    })
    await loadData()
  }

  async function updateStreaming(id: string, s: Partial<Streaming>) {
    await apiCall(`/streamings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(s),
    })
    await loadData()
  }

  async function deleteStreaming(id: string) {
    await apiCall(`/streamings/${id}`, {
      method: 'DELETE',
    })
    await loadData()
  }

  async function addBill(b: Omit<Bill, 'id' | 'status'>) {
    await apiCall('/bills', {
      method: 'POST',
      body: JSON.stringify(b),
    })
    await loadData()
  }

  async function updateBill(id: string, b: Partial<Bill>) {
    await apiCall(`/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(b),
    })
    await loadData()
  }

  async function deleteBill(id: string) {
    await apiCall(`/bills/${id}`, {
      method: 'DELETE',
    })
    await loadData()
  }

  async function payBill(id: string) {
    await apiCall(`/bills/${id}/pay`, {
      method: 'PATCH',
    })
    await loadData()
  }

  async function addReceivable(r: Omit<Receivable, 'id' | 'status'>) {
    await apiCall('/receivables', {
      method: 'POST',
      body: JSON.stringify(r),
    })
    await loadData()
  }

  async function updateReceivable(id: string, r: Partial<Receivable>) {
    await apiCall(`/receivables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(r),
    })
    await loadData()
  }

  async function deleteReceivable(id: string) {
    await apiCall(`/receivables/${id}`, {
      method: 'DELETE',
    })
    await loadData()
  }

  async function receiveBill(id: string) {
    await apiCall(`/receivables/${id}/receive`, {
      method: 'PATCH',
    })
    await loadData()
  }

  const value = useMemo(() => ({
    transactions,
    budgets,
    goals,
    creditCards,
    wallets,
    streamings,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    addWallet,
    updateWallet,
    deleteWallet,
    addStreaming,
    updateStreaming,
    deleteStreaming,
    bills,
    addBill,
    updateBill,
    deleteBill,

    payBill,
    receivables,
    addReceivable,
    updateReceivable,
    deleteReceivable,
    receiveBill,
    refresh: loadData
  }), [transactions, budgets, goals, creditCards, wallets, streamings, bills, receivables, loading, token])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() { return useContext(DataContext) }
export const presetCategories = categories
