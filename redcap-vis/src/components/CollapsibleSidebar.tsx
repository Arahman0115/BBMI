import React, { useState } from 'react'
import './CollapsibleSidebar.css'

type HeaderAction = {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
}

type Props = {
  children: React.ReactNode
  headerActions?: HeaderAction[]
}

const CollapsibleSidebar: React.FC<Props> = ({ children, headerActions }) => {
  const [open, setOpen] = useState(true)

  return (
    <div className={`csb${open ? '' : ' csb--closed'}`}>
      <div className='csb-toggle-row'>
        <button className='csb-toggle' onClick={() => setOpen(o => !o)} title={open ? 'Collapse' : 'Expand filters'}>
          {open ? '‹' : '›'}
        </button>
        {open && headerActions && headerActions.length > 0 && (
          <div className='csb-header-actions'>
            {headerActions.map((a, i) => (
              <button
                key={i}
                className={`csb-header-btn${a.active ? ' csb-header-btn--active' : ''}`}
                onClick={a.onClick}
                disabled={a.disabled}
                title={a.label}
              >
                <span className='csb-header-btn-icon'>{a.icon}</span>
                <span className='csb-header-btn-label'>{a.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className='csb-inner'>
        {children}
      </div>
    </div>
  )
}

export default CollapsibleSidebar
