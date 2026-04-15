import React, { createContext, useContext, useMemo, useState } from 'react'
import { apiUrl } from '../config/api'

type UserType = {
  id: number
  email: string
  name?: string
  plan_status?: string
  plan_expires_at?: string | null
  is_admin?: boolean
}

type AuthContextType = { 
  token: string | null
  user: UserType | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  updatePlanStatus: (status: string, expiresAt?: string | null) => void
}

const AuthContext = createContext<AuthContextType>({ 
  token: null, 
  user: null,
  login: async () => {}, 
  register: async () => {},
  logout: () => {},
  updatePlanStatus: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ms_token'))
  const [user, setUser] = useState<UserType | null>(() => {
    const stored = localStorage.getItem('ms_user')
    return stored ? JSON.parse(stored) : null
  })

  async function login(email: string, password: string) {
    try {
      const response = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        const text = await response.text()
        console.error('Resposta do servidor não é JSON:', text)
        throw new Error(`Erro do servidor (${response.status}): ${text || response.statusText}`)
      }

      if (!response.ok) {
        if (response.status === 500) {
          console.error('Erro 500 do servidor:', data)
          throw new Error(data.error || data.message || 'Erro interno do servidor. Verifique os logs do backend.')
        }
        throw new Error(data.error || data.message || `Erro ao fazer login (${response.status})`)
      }

      localStorage.setItem('ms_token', data.token)
      localStorage.setItem('ms_user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
    } catch (error: any) {
      if (error.message) {
        throw error
      }
      throw new Error(error.message || 'Erro ao fazer login. Verifique sua conexão.')
    }
  }

  async function register(email: string, password: string, name?: string) {
    try {
      const response = await fetch(apiUrl('/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        const text = await response.text()
        console.error('Resposta do servidor não é JSON:', text)
        throw new Error(`Erro do servidor (${response.status}): ${text || response.statusText}`)
      }

      if (!response.ok) {
        if (response.status === 500) {
          console.error('Erro 500 do servidor:', data)
          throw new Error(data.error || data.message || 'Erro interno do servidor. Verifique os logs do backend.')
        }
        throw new Error(data.error || data.message || `Erro ao cadastrar (${response.status})`)
      }

      localStorage.setItem('ms_token', data.token)
      localStorage.setItem('ms_user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
    } catch (error: any) {
      if (error.message) {
        throw error
      }
      throw new Error(error.message || 'Erro ao cadastrar. Verifique sua conexão.')
    }
  }

  function logout() {
    localStorage.removeItem('ms_token')
    localStorage.removeItem('ms_user')
    setToken(null)
    setUser(null)
  }

  function updatePlanStatus(status: string, expiresAt?: string | null) {
    if (user) {
      const updatedUser = { ...user, plan_status: status, plan_expires_at: expiresAt ?? user.plan_expires_at }
      localStorage.setItem('ms_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  const value = useMemo(() => ({ token, user, login, register, logout, updatePlanStatus }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }

