import { useState, useEffect, useCallback, useMemo } from 'react'
import { API_BASE_URL, getAuthHeaders } from '../services/api'
import { AuthContext } from './authContextInstance'

const AUTH_TOKEN_KEY = 'raya_auth_token_v1'
const AUTH_USER_KEY = 'raya_auth_user_v1'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY) || null
    } catch {
      return null
    }
  })

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login') // 'login' | 'register'

  // Validate token with backend on boot
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: getAuthHeaders(token),
        })
        if (res.ok) {
          const userData = await res.json()
          setUser(userData)
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData))
        } else {
          // Token invalid or expired
          setToken(null)
          setUser(null)
          localStorage.removeItem(AUTH_TOKEN_KEY)
          localStorage.removeItem(AUTH_USER_KEY)
        }
      } catch (err) {
        console.warn('[AUTH] Offline or failed to validate token:', err.message)
      } finally {
        setIsLoading(false)
      }
    }
    validateToken()
  }, [token])

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.detail || 'Invalid email or password.' }
      }
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem(AUTH_TOKEN_KEY, data.token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user))
      setIsAuthModalOpen(false)
      return { success: true, user: data.user }
    } catch (err) {
      console.error('[AUTH] Login failure:', err)
      return { success: false, error: 'Cannot connect to authentication service. Please check backend.' }
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.detail || 'Registration failed.' }
      }
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem(AUTH_TOKEN_KEY, data.token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user))
      setIsAuthModalOpen(false)
      return { success: true, user: data.user }
    } catch (err) {
      console.error('[AUTH] Registration failure:', err)
      return { success: false, error: 'Cannot connect to registration service. Please check backend.' }
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const openLogin = useCallback(() => {
    setAuthModalMode('login')
    setIsAuthModalOpen(true)
  }, [])

  const openRegister = useCallback(() => {
    setAuthModalMode('register')
    setIsAuthModalOpen(true)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
      isAuthModalOpen,
      setIsAuthModalOpen,
      authModalMode,
      setAuthModalMode,
      openLogin,
      openRegister,
    }),
    [user, token, isLoading, login, register, logout, isAuthModalOpen, authModalMode, openLogin, openRegister]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
