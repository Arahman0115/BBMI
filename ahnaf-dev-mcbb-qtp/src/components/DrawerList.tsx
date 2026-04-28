import React, { useState } from 'react'
import { DonorRecord } from '../types'
import './DrawerList.css'

type Props = { data: DonorRecord[] }

const Field = ({ label, value }: { label: string; value?: string | number | boolean | null }) => {
  if (value === undefined || value === null || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
  return (
    <div className='dl-field'>
      <span className='dl-field-label'>{label}</span>
      <span className='dl-field-value'>{display}</span>
    </div>
  )
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className='dl-section'>
    <span className='dl-section-title'>{title}</span>
    <div className='dl-section-fields'>{children}</div>
  </div>
)

const braakColor = (s: number) => s >= 5 ? 'high' : s >= 3 ? 'mid' : 'low'

const DrawerList: React.FC<Props> = ({ data }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (npid: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(npid) ? next.delete(npid) : next.add(npid)
      return next
    })

  if (data.length === 0)
    return <div className='dl-empty'>No records match the current filters</div>

  return (
    <div className='dl-list'>
      <div className='dl-header-row'>
        <span className='dl-col-id'>NPID</span>
        <span className='dl-col-age'>Age</span>
        <span className='dl-col-sex'>Sex</span>
        <span className='dl-col-dx'>Primary Diagnosis</span>
        <span className='dl-col-braak'>Braak</span>
        <span className='dl-col-apoe'>APOE</span>
        <span className='dl-col-tissue'>Tissue</span>
      </div>

      {data.map(r => {
        const isOpen   = expanded.has(r.NPID)
        const primaryDx = r.diagnosis?.find(d => d.DiagnosisOrder === 1)?.DiseaseCategory ?? '—'
        const sortedDx  = r.diagnosis?.slice().sort((a, b) => (a.DiagnosisOrder ?? 0) - (b.DiagnosisOrder ?? 0)) ?? []

        return (
          <div key={r.NPID} className={`dl-item${isOpen ? ' dl-item--open' : ''}`}>

            <div className='dl-row' onClick={() => toggle(r.NPID)}>
              <span className='dl-chevron'>{isOpen ? '▾' : '▸'}</span>
              <span className='dl-col-id dl-mono'>{r.NPID}</span>
              <span className='dl-col-age'>{r.AgeAtDeath ?? '—'}</span>
              <span className='dl-col-sex'>{r.Sex ?? '—'}</span>
              <span className='dl-col-dx'>{primaryDx}</span>
              <span className={`dl-col-braak dl-braak dl-braak--${braakColor(r.BraakStage ?? 0)}`}>
                {r.BraakStage ?? '—'}
              </span>
              <span className='dl-col-apoe dl-mono'>{r.APOEGenotype ? `ε${r.APOEGenotype}` : '—'}</span>
              <span className='dl-col-tissue dl-tissue-pills'>
                {!!r.FrozenTissueAvailable && <span className='dl-pill dl-pill--frozen'>Frozen</span>}
                {!!r.FixedTissueAvailable   && <span className='dl-pill dl-pill--ffpe'>FFPE</span>}
              </span>
            </div>

            <div className='dl-card-wrap'>
              <div className='dl-card-inner'>
                <div className='dl-card'>

                  <Section title='Identifiers'>
                    <Field label='NPID'              value={r.NPID} />
                    <Field label='Autopsy ID'        value={r.AutopsyID} />
                    <Field label='Mayo Clinic ID'    value={r.MayoClinicID} />
                    <Field label='NACC PTID'         value={r.NACCPtid} />
                    <Field label='IRB'               value={r.IRBNumber} />
                    <Field label='Brain Source'      value={r.BrainSource} />
                  </Section>

                  <Section title='Demographics'>
                    <Field label='Age at Death'  value={r.AgeAtDeath} />
                    <Field label='Sex'           value={r.Sex} />
                    <Field label='Race'          value={r.Race} />
                    <Field label='DOB'           value={r.DOB} />
                    <Field label='DOD'           value={r.DOD} />
                    <Field label='State'         value={r.StateOfOriginOfBrain} />
                  </Section>

                  <Section title='Clinical'>
                    <Field label='Cognitive Status'    value={r.CognitiveStatus} />
                    <Field label='Clinical Diagnosis'  value={r.ClinicalDiagnosis} />
                    <Field label='Age at Onset'        value={r.AgeAtOnset} />
                    <Field label='Duration (yrs)'      value={r.Duration} />
                    <Field label='MMSE'                value={r.MMSEScore} />
                    <Field label='MoCA'                value={r.MoCAScore} />
                    <Field label='CDR'                 value={r.CDRScore} />
                    <Field label='CDR-SB'              value={r.CDRSBScore} />
                    <Field label='Family History'      value={r.FamilyHistory} />
                  </Section>

                  <Section title='Neuropathology'>
                    {sortedDx.map(d => (
                      <Field key={d.DiagnosisOrder} label={`Dx ${d.DiagnosisOrder}`} value={d.DiseaseCategory} />
                    ))}
                    <Field label='AD Subtype'          value={r.ADSubtype} />
                    <Field label='Braak Stage'         value={r.BraakStage} />
                    <Field label='Thal Phase'          value={r.ThalPhase} />
                    <Field label='CERAD'               value={r.CERADNP} />
                    <Field label='ABC Score'           value={r.ABCScore} />
                    <Field label='NIA-Reagan'          value={r.NIAReaganScore} />
                    <Field label='LBD Type'            value={r.LBDType} />
                    <Field label='CDLB Likelihood'     value={r.CDLBLikelihood} />
                    <Field label='TDP-43'              value={r.TDP43 != null ? !!r.TDP43 : undefined} />
                    <Field label='TDP Type'            value={r.TDPType} />
                    <Field label='NIA-AA Profile'      value={r.NIAAABiomarkerProfile} />
                    <Field label='VA-D Summary'        value={r.VaDSummary} />
                  </Section>

                  <Section title='Genetics'>
                    <Field label='APOE'          value={r.APOEGenotype} />
                    <Field label='APOE Method'   value={r.APOEDeterminationMethod} />
                    <Field label='MAPT'          value={r.MAPT} />
                    <Field label='GBA'           value={r.GBAGenotype} />
                    <Field label='GRN'           value={r.GRNGenotype} />
                    <Field label='SNCA'          value={r.SNCA} />
                    <Field label='RIN'           value={r.RIN} />
                  </Section>

                  <Section title='Tissue'>
                    <Field label='Frozen'              value={r.FrozenTissueAvailable != null ? !!r.FrozenTissueAvailable : undefined} />
                    <Field label='Frozen Quality'      value={r.FrozenTissueQuality} />
                    <Field label='Freeze/Thaw'         value={r.FreezeThawTimes} />
                    <Field label='FFPE'                value={r.FixedTissueAvailable != null ? !!r.FixedTissueAvailable : undefined} />
                    <Field label='DNA Extracted'       value={r.DNAExtracted != null ? !!r.DNAExtracted : undefined} />
                    <Field label='RNA-seq'             value={r.RNASeq != null ? !!r.RNASeq : undefined} />
                    <Field label='PMI (hrs)'           value={r.PostmortemInterval} />
                    <Field label='Spinal Cord'         value={r.SpinalCord != null ? !!r.SpinalCord : undefined} />
                    <Field label='Olfactory Bulb'      value={r.OlfactoryBulb != null ? !!r.OlfactoryBulb : undefined} />
                    <Field label='CSF'                 value={r.CSF != null ? !!r.CSF : undefined} />
                    <Field label='Unstained Slides'    value={r.UnstainedSlidesAvailable != null ? !!r.UnstainedSlidesAvailable : undefined} />
                  </Section>

                </div>
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}

export default DrawerList
