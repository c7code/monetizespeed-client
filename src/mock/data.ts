import type { Budget, Goal, Transaction } from '../store/data'

export const categories = ['Alimentação', 'Transporte', 'Lazer', 'Moradia', 'Salário', 'Saúde']

export const initialTransactions: Transaction[] = [
  { id: 't1', type: 'income', category: 'Salário', amount: 4500, date: new Date().toISOString(), status: 'received', description: 'Salário mensal' },
  { id: 't2', type: 'expense', category: 'Alimentação', amount: 120, date: new Date().toISOString(), status: 'paid', description: 'Almoço' },
  { id: 't3', type: 'expense', category: 'Transporte', amount: 60, date: new Date().toISOString(), status: 'paid', description: 'Uber' },
  { id: 't4', type: 'expense', category: 'Moradia', amount: 1500, date: new Date().toISOString(), recurring: true, status: 'paid', description: 'Aluguel' },
  { id: 't5', type: 'expense', category: 'Lazer', amount: 300, date: new Date().toISOString(), status: 'paid', description: 'Cinema' }
]

export const initialBudgets: Budget[] = [
  { id: 'b1', category: 'Alimentação', limit: 800 },
  { id: 'b2', category: 'Transporte', limit: 300 },
  { id: 'b3', category: 'Lazer', limit: 500 },
  { id: 'b4', category: 'Saúde', limit: 400 }
]

export const initialGoals: Goal[] = [
  { id: 'g1', name: 'Viagem', target: 5000, saved: 1200 },
  { id: 'g2', name: 'Reserva de Emergência', target: 10000, saved: 3500 }
]

