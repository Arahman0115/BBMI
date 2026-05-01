import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'
import { DonorRecord } from '../types'
import './ChartsPanel.css'

type Props = { data: DonorRecord[] }

const PIE_COLORS = ['#0068b1', '#34a853', '#fbbc04', '#ea4335', '#9c5fd1', '#00bcd4', '#ff7043']
const TICK  = { fill: '#4a5a6a', fontSize: 10 } as const
const ALINE = { stroke: 'rgba(255,255,255,0.06)' } as const

const countBy = (data: DonorRecord[], key: (r: DonorRecord) => string) => {
  const m: Record<string, number> = {}
  data.forEach(r => { const v = key(r); m[v] = (m[v] || 0) + 1 })
  return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}

const ageBins = (data: DonorRecord[]) => {
  const labels = ['<65', '65–69', '70–74', '75–79', '80–84', '85–89', '90+']
  const edges  = [0, 65, 70, 75, 80, 85, 90, Infinity]
  return labels.map((label, i) => ({
    label,
    n: data.filter(r => (r.demographics?.ageAtDeath ?? 0) >= edges[i] && (r.demographics?.ageAtDeath ?? 0) < edges[i + 1]).length,
  })).filter(b => b.n > 0)
}

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className='cp-tip'>
      <div className='cp-tip-lbl'>{label ?? payload[0].name}</div>
      <div className='cp-tip-val'>{payload[0].value}</div>
    </div>
  )
}

const Legend = ({ items }: { items: { name: string; value: number }[] }) => (
  <div className='cp-legend'>
    {items.map((d, i) => (
      <span key={d.name} className='cp-legend-item'>
        <span className='cp-legend-dot' style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
        {d.name} <span className='cp-legend-n'>({d.value})</span>
      </span>
    ))}
  </div>
)

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className='cp-card'>
    <div className='cp-card-title'>{title}</div>
    <div className='cp-card-body'>{children}</div>
  </div>
)

const Placeholder = ({ label }: { label: string }) => (
  <div className='cp-card cp-card--ph'>
    <div className='cp-ph-plus'>+</div>
    <div className='cp-ph-label'>{label}</div>
  </div>
)

const ChartsPanel: React.FC<Props> = ({ data }) => {
  if (data.length === 0) {
    return <div className='cp-panel cp-empty'>No records — adjust filters to see charts.</div>
  }

  const ages   = ageBins(data)
  const study  = countBy(data, r => r.intake?.studySource ?? 'Unknown')
  const sex    = countBy(data, r => r.demographics?.sex ?? 'Unknown')
  const braak  = countBy(data, r => String(r.pathology?.braakStage ?? '?')).sort((a, b) => Number(a.name) - Number(b.name))
  const thal   = countBy(data, r => String(r.pathology?.thalPhase ?? '?')).sort((a, b) => Number(a.name) - Number(b.name))
  const apoe   = countBy(data, r => { const v = r.genetics?.find(g => g.marker === 'APOE')?.value; return v ? `ε${v}` : 'Unknown' })
  const mapt   = countBy(data, r => r.genetics?.find(g => g.marker === 'MAPT')?.value ?? 'Unknown')

  const donut = (d: {name:string;value:number}[]) => (
    <>
      <PieChart width={150} height={150}>
        <Pie data={d} cx={71} cy={71} innerRadius={42} outerRadius={64}
             dataKey='value' paddingAngle={3} strokeWidth={0}>
          {d.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip content={<Tip />} />
      </PieChart>
      <Legend items={d} />
    </>
  )

  return (
    <div className='cp-panel'>
      <div className='cp-scroll'>

        <Card title='Age at Death'>
          <BarChart width={230} height={170} data={ages} barCategoryGap='35%' margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <XAxis dataKey='label' tick={TICK} axisLine={ALINE} tickLine={false} />
            <YAxis tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey='n' fill='#0068b1' radius={[3, 3, 0, 0]} />
          </BarChart>
        </Card>

        <Card title='Study Source'>
          <BarChart width={260} height={170} data={study} layout='vertical'
                    barCategoryGap='35%' margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
            <XAxis type='number' tick={TICK} axisLine={ALINE} tickLine={false} allowDecimals={false} />
            <YAxis type='category' dataKey='name' tick={{ ...TICK, fontSize: 8 }}
                   axisLine={false} tickLine={false} width={90} />
            <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey='value' fill='#0068b1' radius={[0, 3, 3, 0]} />
          </BarChart>
        </Card>

        <Card title='Sex'>{donut(sex)}</Card>
        <Card title='Braak Stage'>{donut(braak)}</Card>
        <Card title='Thal Phase'>{donut(thal)}</Card>
        <Card title='APOE Genotype'>{donut(apoe)}</Card>
        <Card title='MAPT Haplotype'>{donut(mapt)}</Card>

        <Placeholder label='Primary Diagnosis' />
        <Placeholder label='Cognitive Status' />
        <Placeholder label='Brain Weight Dist.' />
        <Placeholder label='Age vs Braak' />

      </div>
    </div>
  )
}

export default ChartsPanel
