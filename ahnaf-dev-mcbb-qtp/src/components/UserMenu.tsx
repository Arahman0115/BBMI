import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import './UserMenu.css'

const UserMenu: React.FC = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const initial = (
    currentUser?.displayName?.[0] ??
    currentUser?.email?.[0] ??
    '?'
  ).toUpperCase()

  const email = currentUser?.email ?? ''

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = () =>
    signOut(auth).then(() => navigate('/login'))

  return (
    <div className='user-menu' ref={ref}>
      <button
        className={`user-avatar${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label='User menu'
        aria-expanded={open}
      >
        {initial}
      </button>

      {open && (
        <div className='user-dropdown'>
          <div className='user-dropdown-info'>
            <span className='user-dropdown-avatar'>{initial}</span>
            <span className='user-dropdown-email'>{email}</span>
          </div>
          <div className='user-dropdown-divider' />
          <button className='user-dropdown-signout' onClick={handleSignOut}>
            <svg width='13' height='13' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
              <path d='M3 3h7a1 1 0 010 2H4v10h6a1 1 0 010 2H3a1 1 0 01-1-1V4a1 1 0 011-1z'/>
              <path d='M13.293 6.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 010-2h6.586l-1.293-1.293a1 1 0 010-1.414z'/>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
