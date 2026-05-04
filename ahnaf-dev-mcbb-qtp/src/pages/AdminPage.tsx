import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'
import UserMenu from '../components/UserMenu'
import { fetchAdminUsers, updateUserRole, AdminUser } from '../api/admin'
import './AdminPage.css'

const AdminPage: React.FC = () => {
  const navigate = useNavigate()
  const { role } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/', { replace: true })
      return
    }
    fetchAdminUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [role, navigate])

  const handleRoleChange = async (uid: string, newRole: 'admin' | 'researcher') => {
    setSaving(uid)
    try {
      await updateUserRole(uid, newRole)
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update role')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className='admin-page'>
      <header className='admin-header'>
        <img src={`${import.meta.env.BASE_URL}logo_mayo.svg`} alt='Mayo Clinic' className='header-logo' />
        <div className='header-divider' />
        <NavBar />
        <div className='header-spacer' />
        <UserMenu />
      </header>

      <main className='admin-main'>
        {error && <div className='admin-error'>{error}</div>}

        {loading ? (
          <div className='admin-loading'>Loading users...</div>
        ) : (
          <div className='admin-table-wrap'>
            <table className='admin-table'>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>UID</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={3} className='admin-empty'>No users found.</td></tr>
                )}
                {users.map(u => (
                  <tr key={u.uid}>
                    <td className='admin-email'>{u.email ?? <span className='admin-no-email'>—</span>}</td>
                    <td className='admin-uid'>{u.uid}</td>
                    <td>
                      <select
                        className={`admin-role-select admin-role-${u.role}`}
                        value={u.role}
                        disabled={saving === u.uid}
                        onChange={e => handleRoleChange(u.uid, e.target.value as 'admin' | 'researcher')}
                      >
                        <option value='researcher'>Researcher</option>
                        <option value='admin'>Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminPage
