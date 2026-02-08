import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Reports from './pages/Reports'
import Goals from './pages/Goals'
import BankImport from './pages/BankImport'
import Chat from './pages/Chat'
import CreditCards from './pages/CreditCards'
import Wallets from './pages/Wallets'
import Streamings from './pages/Streamings'
import Bills from './pages/Bills'
import Receivables from './pages/Receivables'
import { DataProvider } from './store/data'
import { useAuth, AuthProvider } from './store/auth'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children as JSX.Element
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<RequireAuth><App /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="reports" element={<Reports />} />
              <Route path="goals" element={<Goals />} />
              <Route path="bank-import" element={<BankImport />} />
              <Route path="chat" element={<Chat />} />
              <Route path="credit-cards" element={<CreditCards />} />
              <Route path="wallets" element={<Wallets />} />
              <Route path="streamings" element={<Streamings />} />
              <Route path="bills" element={<Bills />} />
              <Route path="receivables" element={<Receivables />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  </React.StrictMode>
)

