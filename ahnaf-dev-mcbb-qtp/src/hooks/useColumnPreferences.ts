import { useState, useEffect, useRef } from 'react'
import { ColumnKey, DEFAULT_VISIBLE, PHI_COLUMNS } from '../columns'
import { useAuth } from '../context/AuthContext'
import { fetchColumnPrefs, saveColumnPrefs } from '../api/preferences'

const STORAGE_KEY = 'brainbank_column_prefs'

function loadLocal(): Record<ColumnKey, boolean> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULT_VISIBLE, ...JSON.parse(stored) }
  } catch {}
  return { ...DEFAULT_VISIBLE }
}

function saveLocal(prefs: Record<ColumnKey, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

function enforcePHI(prefs: Record<ColumnKey, boolean>): Record<ColumnKey, boolean> {
  const next = { ...prefs }
  PHI_COLUMNS.forEach(k => { next[k] = false })
  return next
}

export function useColumnPreferences() {
  const { currentUser, role } = useAuth()
  const [visible, setVisible] = useState<Record<ColumnKey, boolean>>(() => {
    const base = loadLocal()
    return role === 'researcher' ? enforcePHI(base) : base
  })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // On login, pull prefs from MongoDB and sync over the local cache
  useEffect(() => {
    if (!currentUser) return
    fetchColumnPrefs().then(prefs => {
      if (!prefs) return
      const merged = { ...DEFAULT_VISIBLE, ...prefs }
      const final = role === 'researcher' ? enforcePHI(merged) : merged
      setVisible(final)
      saveLocal(final)
    })
  }, [currentUser, role])

  // Re-enforce PHI restrictions if role changes
  useEffect(() => {
    if (role === 'researcher') {
      setVisible(prev => {
        const enforced = enforcePHI(prev)
        saveLocal(enforced)
        return enforced
      })
    }
  }, [role])

  const persist = (prefs: Record<ColumnKey, boolean>) => {
    saveLocal(prefs)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      saveColumnPrefs(prefs).catch(console.error)
    }, 800)
  }

  const toggle = (key: ColumnKey) => {
    if (role === 'researcher' && PHI_COLUMNS.includes(key)) return
    setVisible(prev => {
      const next = { ...prev, [key]: !prev[key] }
      persist(next)
      return next
    })
  }

  const setGroup = (keys: ColumnKey[], value: boolean) => {
    setVisible(prev => {
      const next = { ...prev }
      keys.forEach(k => {
        if (role === 'researcher' && PHI_COLUMNS.includes(k)) return
        next[k] = value
      })
      persist(next)
      return next
    })
  }

  const reset = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const defaults = { ...DEFAULT_VISIBLE }
    const final = role === 'researcher' ? enforcePHI(defaults) : defaults
    saveLocal(final)
    saveColumnPrefs(final).catch(console.error)
    setVisible(final)
  }

  return { visible, toggle, setGroup, reset }
}
