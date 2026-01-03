import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('globetrotter_token') || '')

  useEffect(() => {
    if (token) {
      localStorage.setItem('globetrotter_token', token)
    } else {
      localStorage.removeItem('globetrotter_token')
    }
  }, [token])

  const value = {
    user,
    token,
    setUser,
    setToken,
    logout: () => {
      setUser(null)
      setToken('')
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
