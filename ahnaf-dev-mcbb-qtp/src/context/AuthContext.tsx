import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { fetchUserProfile } from '../api/preferences'

const INACTIVITY_MS = 5 * 60 * 1000 // 5 minutes
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'] as const

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  role: 'admin' | 'researcher'
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true, role: 'researcher' })

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'admin' | 'researcher'>('researcher')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setCurrentUser(user)
      if (user) {
        const profile = await fetchUserProfile()
        setRole(profile?.role ?? 'researcher')
      } else {
        setRole('researcher')
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!currentUser) return

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => signOut(auth), INACTIVITY_MS)
    }

    reset()
    ACTIVITY_EVENTS.forEach(e => document.addEventListener(e, reset, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach(e => document.removeEventListener(e, reset))
    }
  }, [currentUser])

  return (
    <AuthContext.Provider value={{ currentUser, loading, role }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
