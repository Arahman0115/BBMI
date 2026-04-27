import { auth } from '../firebase'
import { getAuthHeaders } from './auth'
import { ColumnKey } from '../columns'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export interface UserProfile {
  columnPrefs: Record<ColumnKey, boolean> | null
  role: 'admin' | 'researcher'
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
  const uid = auth.currentUser?.uid
  if (!uid) return null
  try {
    const res = await fetch(`${API_BASE}/users/${uid}/preferences`, {
      headers: await getAuthHeaders(),
    })
    if (!res.ok) return null
    const data = await res.json()
    return { columnPrefs: data.columnPrefs ?? null, role: data.role ?? 'researcher' }
  } catch {
    return null
  }
}

export async function fetchColumnPrefs(): Promise<Record<ColumnKey, boolean> | null> {
  const profile = await fetchUserProfile()
  return profile?.columnPrefs ?? null
}

export async function saveColumnPrefs(prefs: Record<ColumnKey, boolean>): Promise<void> {
  const uid = auth.currentUser?.uid
  if (!uid) return
  await fetch(`${API_BASE}/users/${uid}/preferences`, {
    method: 'PUT',
    headers: { ...(await getAuthHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify({ columnPrefs: prefs }),
  })
}
