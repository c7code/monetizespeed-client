import React, { createContext, useContext, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

type AuthContextType = { 
  token: string | null
  user: { id: number, email: string, name?: string } | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({ 
  token: null, 
  user: null,
  login: async () => {}, 
  register: async () => {},
  logout: () => {} 
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ms_token'))
  const [user, setUser] = useState<{ id: number, email: string, name?: string } | null>(() => {
    const stored = localStorage.getItem('ms_user')
    return stored ? JSON.parse(stored) : null
  })

  async function login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login')
      }

      localStorage.setItem('ms_token', data.token)
      localStorage.setItem('ms_user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login')
    }
  }

  async function register(email: string, password: string, name?: string) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar')
      }

      localStorage.setItem('ms_token', data.token)
      localStorage.setItem('ms_user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao cadastrar')
    }
  }

  function logout() {
    localStorage.removeItem('ms_token')
    localStorage.removeItem('ms_user')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, login, register, logout }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }

