import React, { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './NavBar.css'

const BASE_NAV_ITEMS = [
  { to: '/query-tool',   label: 'Query Tool',   icon: '⬡' },
  { to: '/charts',       label: 'Charts',       icon: '◈' },
  { to: '/data-entry',   label: 'Data Entry',   icon: '◧' },
]

const ADMIN_NAV_ITEM = { to: '/admin', label: 'Admin', icon: '⚙' }

const NavBar: React.FC = () => {
  const { role } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const navItems = role === 'admin' ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className='navbar' ref={ref}>
      <button className={`nav-trigger ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
        <div className='nav-dots-grid'>
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className='nav-dot' />
          ))}
        </div>
      </button>

      {open && (
        <div className='nav-dropdown'>
          <div className='nav-dropdown-header'>Apps</div>
          <div className='nav-grid'>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-grid-item${isActive ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className='nav-grid-icon'>{item.icon}</span>
                <span className='nav-grid-label'>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NavBar
