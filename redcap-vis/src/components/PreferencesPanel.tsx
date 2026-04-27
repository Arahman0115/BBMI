import React from 'react'
import { ALL_COLUMNS, COLUMN_GROUPS, ColumnKey, PHI_COLUMNS } from '../columns'
import './PreferencesPanel.css'

type Props = {
  visible: Record<ColumnKey, boolean>
  role: 'admin' | 'researcher'
  onToggle: (key: ColumnKey) => void
  onSetGroup: (keys: ColumnKey[], value: boolean) => void
  onReset: () => void
  onClose: () => void
}

const PreferencesPanel: React.FC<Props> = ({ visible, role, onToggle, onSetGroup, onReset, onClose }) => {
  const isPHI = (key: ColumnKey) => PHI_COLUMNS.includes(key)
  const locked = (key: ColumnKey) => role === 'researcher' && isPHI(key)

  const groups = COLUMN_GROUPS.map(group => ({
    group,
    columns: ALL_COLUMNS.filter(c => c.group === group),
  }))

  return (
    <div className='pref-overlay' onClick={onClose}>
      <div className='pref-panel' onClick={e => e.stopPropagation()}>

        <div className='pref-header'>
          <span className='pref-title'>Column Preferences</span>
          <button className='pref-close' onClick={onClose}>✕</button>
        </div>

        {role === 'researcher' && (
          <div className='pref-phi-notice'>
            PHI columns are restricted to Admin users only.
          </div>
        )}

        <div className='pref-body'>
          {groups.map(({ group, columns }) => {
            const toggleableKeys = columns.map(c => c.key).filter(k => !locked(k))
            const allOn  = toggleableKeys.every(k => visible[k])
            const allOff = toggleableKeys.every(k => !visible[k])
            return (
              <div key={group} className='pref-group'>
                <div className='pref-group-header'>
                  <span className='pref-group-label'>{group}</span>
                  <div className='pref-group-actions'>
                    <button
                      className={`pref-group-btn ${allOn ? 'active' : ''}`}
                      onClick={() => onSetGroup(toggleableKeys, true)}
                      disabled={toggleableKeys.length === 0}
                    >All</button>
                    <button
                      className={`pref-group-btn ${allOff ? 'active' : ''}`}
                      onClick={() => onSetGroup(toggleableKeys, false)}
                      disabled={toggleableKeys.length === 0}
                    >None</button>
                  </div>
                </div>
                <div className='pref-col-grid'>
                  {columns.map(col => (
                    <label
                      key={col.key}
                      className={`pref-col-item${locked(col.key) ? ' pref-col-locked' : ''}`}
                      title={locked(col.key) ? 'Restricted — PHI (Admin only)' : undefined}
                    >
                      <span className='pref-toggle'>
                        <input
                          type='checkbox'
                          checked={visible[col.key]}
                          onChange={() => onToggle(col.key)}
                          disabled={locked(col.key)}
                        />
                        <span className='pref-toggle-track'>
                          <span className='pref-toggle-thumb' />
                        </span>
                      </span>
                      <span className='pref-col-label'>
                        {col.label}
                        {locked(col.key) && <span className='pref-phi-badge'>PHI</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className='pref-footer'>
          <button className='pref-reset-btn' onClick={onReset}>Reset to defaults</button>
        </div>

      </div>
    </div>
  )
}

export default PreferencesPanel
