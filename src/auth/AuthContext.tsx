import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { db, type AppUser, verifyPassword } from '../db/database'

interface AuthContextType {
  user: AppUser | null
  isAdmin: boolean
  isLoggedIn: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_KEY = 'rm-session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      try {
        const { userId } = JSON.parse(stored)
        db.users.get(userId).then(u => {
          if (u) setUser(u)
          setLoading(false)
        })
      } catch {
        localStorage.removeItem(SESSION_KEY)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const found = await db.users.where('username').equals(username.trim().toLowerCase()).first()
    if (!found) return false

    const valid = await verifyPassword(password, found.passwordHash)
    if (!valid) return false

    setUser(found)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: found.id }))
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }, [])

  if (loading) return null

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin: user?.role === 'admin',
      isLoggedIn: !!user,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
