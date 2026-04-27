import React, { useState, useRef, useEffect } from 'react'
import './MultiSelect.css'

export type MSOption<T extends string | number> = {
  value: T
  label: string
}

type Props<T extends string | number> = {
  placeholder: string
  options: MSOption<T>[]
  selected: T[]
  onChange: (vals: T[]) => void
}

function MultiSelect<T extends string | number>({
  placeholder, options, selected, onChange,
}: Props<T>) {
  const [query, setQuery] = useState('')
  const [open,  setOpen]  = useState(false)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (val: T) => {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val))
    } else {
      onChange([...selected, val])
    }
  }

  const selectedOpts = selected
    .map(v => options.find(o => o.value === v))
    .filter((o): o is MSOption<T> => o !== undefined)

  const summaryText = selectedOpts.map(o => o.label).join(', ')

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className='ms-wrap' ref={wrapRef}>
      <div
        className={`ms-box${open ? ' ms-box--open' : ''}`}
        onClick={() => { setOpen(o => !o); if (!open) setTimeout(() => inputRef.current?.focus(), 0) }}
      >
        <span className={`ms-summary${selected.length === 0 ? ' ms-summary--empty' : ''}`}>
          {selected.length === 0 ? placeholder : summaryText}
        </span>
        <span className='ms-arrow'>{open ? '▴' : '▾'}</span>
      </div>

      {open && (
        <div className='ms-dropdown'>
          <div className='ms-search-wrap'>
            <input
              ref={inputRef}
              className='ms-search'
              placeholder='Search…'
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className='ms-options-list'>
          {filtered.length === 0 && (
            <div className='ms-empty'>No matches</div>
          )}
          {filtered.map(o => {
            const isSelected = selected.includes(o.value)
            return (
              <button
                key={String(o.value)}
                className={`ms-option${isSelected ? ' ms-option--selected' : ''}`}
                onMouseDown={e => { e.preventDefault(); toggle(o.value) }}
              >
                <span className='ms-option-check'>{isSelected ? '✓' : ''}</span>
                {o.label}
              </button>
            )
          })}
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiSelect
