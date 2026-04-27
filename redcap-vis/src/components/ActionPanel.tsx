import React from 'react'
import './ActionPanel.css'

type Action = {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
}

type Props = {
  actions: Action[]
}

const ActionPanel: React.FC<Props> = ({ actions }) => (
  <div className='ap-panel'>
    <div className='ap-section-label'>Actions</div>
    {actions.map(a => (
      <button
        key={a.label}
        className={`ap-btn${a.active ? ' ap-btn--active' : ''}`}
        onClick={a.onClick}
        disabled={a.disabled}
        title={a.label}
      >
        <span className='ap-icon'>{a.icon}</span>
        <span className='ap-label'>{a.label}</span>
      </button>
    ))}
  </div>
)

export default ActionPanel
