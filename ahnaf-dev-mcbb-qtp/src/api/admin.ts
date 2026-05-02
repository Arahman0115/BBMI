import { getAuthHeaders } from './auth'
import { API_BASE } from './config'

export interface AdminUser {
  uid: string
  email: string | null
  role: 'admin' | 'researcher'
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: await getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function updateUserRole(uid: string, role: 'admin' | 'researcher'): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/users/${uid}/role`, {
    method: 'PUT',
    headers: { ...(await getAuthHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
  if (!res.ok) throw new Error('Failed to update role')
}
