import { FilterState, DonorRecord } from '../types'
import { getAuthHeaders } from './auth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

function toParams(f: FilterState): URLSearchParams {
  const p = new URLSearchParams()
  if (f.idSearch)  p.set('idSearch', f.idSearch)
  if (f.ageRanges) p.set('ageRanges', f.ageRanges)
  if (f.sex) p.set('sex', f.sex)
  f.race?.forEach(v             => p.append('race',             v))
  f.studySource?.forEach(v         => p.append('studySource',        v))
  f.primaryDiagnosis?.forEach(v    => p.append('primaryDiagnosis',   v))
  f.ad_type?.forEach(v             => p.append('ad_type',            v))
  f.secondaryDiagnoses?.forEach(v  => p.append('secondaryDiagnoses', v))
  f.apoe?.forEach(v             => p.append('apoe',             v))
  f.mapt?.forEach(v             => p.append('mapt',             v))
  f.thalPhases?.forEach(v       => p.append('thalPhases',       String(v)))
  f.braakStages?.forEach(v      => p.append('braakStages',      String(v)))
  f.ceradScores?.forEach(v      => p.append('ceradScores',      v))
  f.tissueAvailable?.forEach(v => p.append('tissueAvailable', v))
  if (f.diagnosisOrder) {
    p.set('diagnosisOrderDx',  f.diagnosisOrder.diagnosis)
    p.set('diagnosisOrderMin', String(f.diagnosisOrder.min))
    p.set('diagnosisOrderMax', String(f.diagnosisOrder.max))
  }
  return p
}

export interface SamplesResult {
  records: DonorRecord[]
  total: number
  page: number
  totalPages: number
}

export async function fetchSamples(
  filters: FilterState,
  page: number,
  limit: number,
  sortBy = 'NPID',
  sortDir: 'asc' | 'desc' = 'asc',
): Promise<SamplesResult> {
  const p = toParams(filters)
  p.set('page',    String(page))
  p.set('limit',   String(limit))
  p.set('sortBy',  sortBy)
  p.set('sortDir', sortDir)
  const res = await fetch(`${API_BASE}/samples?${p}`, { headers: await getAuthHeaders() })
  if (!res.ok) throw new Error('Failed to fetch samples')
  return res.json()
}

export async function fetchCount(filters: FilterState): Promise<number> {
  const res = await fetch(`${API_BASE}/samples/count?${toParams(filters)}`, {
    headers: await getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch count')
  return (await res.json()).count
}
