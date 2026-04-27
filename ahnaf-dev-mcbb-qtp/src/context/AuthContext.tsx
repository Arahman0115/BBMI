import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { fetchUserProfile } from '../api/preferences'

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

  return (
    <AuthContext.Provider value={{ currentUser, loading, role }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
