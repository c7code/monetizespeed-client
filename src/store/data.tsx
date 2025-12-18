import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useAuth } from './auth'
import { categories } from '../mock/data'
import { apiUrl } from '../config/api'

export type Transaction = { id: string, type: 'income' | 'expense', category: string, amount: number, date: string, recurring?: boolean, receiptUrl?: string, description?: string, status?: 'paid' | 'received' | 'pending_payment' | 'pending_receipt' }
export type Budget = { id: string, category: string, limit: number }
export type Goal = { id: string, name: string, target: number, saved: number }

type DataContextType = {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
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
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextType>({ 
  transactions: [], 
  budgets: [], 
  goals: [],
  loading: false,
  addTransaction: async () => {}, 
  updateTransaction: async () => {}, 
  deleteTransaction: async () => {}, 
  addBudget: async () => {}, 
  updateBudget: async () => {}, 
  deleteBudget: async () => {}, 
  addGoal: async () => {}, 
  updateGoal: async () => {}, 
  deleteGoal: async () => {},
  refresh: async () => {}
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
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    if (!token) {
      setTransactions([])
      setBudgets([])
      setGoals([])
      return
    }

    setLoading(true)
    try {
      const [transData, budgetsData, goalsData] = await Promise.all([
        apiCall('/transactions'),
        apiCall('/budgets'),
        apiCall('/goals'),
      ])
      
      setTransactions(transData.map((t: any) => ({
        ...t,
        receiptUrl: t.receipt_url,
        id: t.id.toString(),
        amount: parseFloat(t.amount) || 0
      })))
      setBudgets(budgetsData.map((b: any) => ({
        ...b,
        id: b.id.toString(),
        limit: parseFloat(b.limit) || 0
      })))
      setGoals(goalsData.map((g: any) => ({
        ...g,
        id: g.id.toString(),
        target: parseFloat(g.target) || 0,
        saved: parseFloat(g.saved) || 0
      })))
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

  const value = useMemo(() => ({ 
    transactions, 
    budgets, 
    goals,
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
    refresh: loadData
  }), [transactions, budgets, goals, loading, token])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() { return useContext(DataContext) }
export const presetCategories = categories
