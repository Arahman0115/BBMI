import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react'
import { FilterState, DonorRecord } from '../types'
import { fetchSamples } from '../api/samples'

export interface QueryResult {
  pendingFilters: FilterState
  setPendingFilters: Dispatch<SetStateAction<FilterState>>
  committedFilters: FilterState | null
  records: DonorRecord[]
  total: number
  page: number
  setPage: (p: number) => void
  perPage: number
  setPerPage: (n: number) => void
  totalPages: number
  loading: boolean
  hasSearched: boolean
  search: () => void
  reset: () => void
}

export function useSamplesQuery(): QueryResult {
  const [pendingFilters,   setPendingFilters]   = useState<FilterState>({})
  const [committedFilters, setCommittedFilters] = useState<FilterState | null>(null)
  const [records,    setRecords]    = useState<DonorRecord[]>([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page,       setPage]       = useState(1)
  const [perPage,    setPerPage]    = useState(50)
  const [loading,    setLoading]    = useState(false)

  // Only hits the DB when Search is pressed (committedFilters changes) or page/perPage changes
  useEffect(() => {
    if (!committedFilters) return
    setLoading(true)
    fetchSamples(committedFilters, page, perPage)
      .then(r => {
        setRecords(r.records)
        setTotal(r.total)
        setTotalPages(r.totalPages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [committedFilters, page, perPage])

  const search = useCallback(() => {
    setPage(1)
    setCommittedFilters({ ...pendingFilters })
  }, [pendingFilters])

  const reset = useCallback(() => {
    setPendingFilters({})
    setCommittedFilters(null)
    setRecords([])
    setTotal(0)
    setTotalPages(0)
    setPage(1)
  }, [])

  return {
    pendingFilters, setPendingFilters,
    committedFilters,
    records, total, totalPages,
    page, setPage,
    perPage, setPerPage,
    loading,
    hasSearched: committedFilters !== null,
    search, reset,
  }
}
