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
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const toggle = (id: number) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
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
        const isOpen = expanded.has(r.id)
        return (
          <div key={r.id} className={`dl-item${isOpen ? ' dl-item--open' : ''}`}>

            <div className='dl-row' onClick={() => toggle(r.id)}>
              <span className='dl-chevron'>{isOpen ? '▾' : '▸'}</span>
              <span className='dl-col-id dl-mono'>{r.npid}</span>
              <span className='dl-col-age'>{r.age_at_death}</span>
              <span className='dl-col-sex'>{r.sex}</span>
              <span className='dl-col-dx'>{r.primary_diagnosis}</span>
              <span className={`dl-col-braak dl-braak dl-braak--${braakColor(r.braak_stage)}`}>
                {r.braak_stage}
              </span>
              <span className='dl-col-apoe dl-mono'>ε{r.apoe}</span>
              <span className='dl-col-tissue dl-tissue-pills'>
                {r.tissue.frozen_available && <span className='dl-pill dl-pill--frozen'>Frozen</span>}
                {r.tissue.ffpe_available   && <span className='dl-pill dl-pill--ffpe'>FFPE</span>}
              </span>
            </div>

            <div className='dl-card-wrap'>
              <div className='dl-card-inner'>
                <div className='dl-card'>

                  <Section title='Identifiers'>
                    <Field label='NPID'              value={r.npid} />
                    <Field label='Autopsy ID'        value={r.autopsy_id} />
                    <Field label='Mayo Clinic ID'    value={r.mayo_clinic_id} />
                    <Field label='NACC PTID'         value={r.nacc_ptid} />
                    <Field label='IRB'               value={r.irb_number} />
                    <Field label='Brain Source'      value={r.brain_source} />
                  </Section>

                  <Section title='Demographics'>
                    <Field label='Age at Death'  value={r.age_at_death} />
                    <Field label='Sex'           value={r.sex} />
                    <Field label='Race'          value={r.race} />
                    <Field label='DOB'           value={r.dob} />
                    <Field label='DOD'           value={r.dod} />
                    <Field label='State'         value={r.state_of_origin} />
                  </Section>

                  <Section title='Clinical'>
                    <Field label='Cognitive Status'    value={r.cognitive_status} />
                    <Field label='Clinical Diagnosis'  value={r.clinical_diagnosis} />
                    <Field label='Age at Onset'        value={r.age_at_onset} />
                    <Field label='Duration (yrs)'      value={r.duration_years} />
                    <Field label='MMSE'                value={r.mmse_score} />
                    <Field label='MoCA'                value={r.moca_score} />
                    <Field label='CDR'                 value={r.cdr_score} />
                    <Field label='CDR-SB'              value={r.cdr_sb_score} />
                    <Field label='Family History'      value={r.family_history} />
                  </Section>

                  <Section title='Neuropathology'>
                    <Field label='Primary Dx'          value={r.primary_diagnosis} />
                    <Field label='AD Type'             value={r.ad_type} />
                    <Field label='Braak Stage'         value={r.braak_stage} />
                    <Field label='Thal Phase'          value={r.thal_phase} />
                    <Field label='CERAD'               value={r.cerad_np} />
                    <Field label='ABC Score'           value={r.abc_score} />
                    <Field label='NIA-Reagan'          value={r.nia_reagan_score} />
                    <Field label='LBD Type'            value={r.lbd_type} />
                    <Field label='CDLB Likelihood'     value={r.cdlb_likelihood} />
                    <Field label='TDP-43'              value={r.tdp43} />
                    <Field label='TDP Type'            value={r.tdp_type} />
                    <Field label='Secondary Dx'        value={r.secondary_diagnoses.join(', ') || undefined} />
                    <Field label='NIA-AA Profile'      value={r.nia_aa_biomarker_profile} />
                    <Field label='VA-D Summary'        value={r.va_d_summary} />
                  </Section>

                  <Section title='Genetics'>
                    <Field label='APOE'          value={r.apoe} />
                    <Field label='APOE Method'   value={r.apoe_method} />
                    <Field label='MAPT'          value={r.mapt} />
                    <Field label='GBA'           value={r.gba_genotype} />
                    <Field label='GRN'           value={r.grn_genotype} />
                    <Field label='SNCA'          value={r.snca} />
                    <Field label='RIN'           value={r.rin} />
                  </Section>

                  <Section title='Tissue'>
                    <Field label='Frozen'              value={r.tissue.frozen_available} />
                    <Field label='Frozen Quality'      value={r.tissue.frozen_tissue_quality} />
                    <Field label='Freeze/Thaw'         value={r.tissue.freeze_thaw_times} />
                    <Field label='FFPE'                value={r.tissue.ffpe_available} />
                    <Field label='DNA Extracted'       value={r.tissue.dna_extracted} />
                    <Field label='RNA-seq'             value={r.tissue.rna_seq_available} />
                    <Field label='Blocks Available'    value={r.tissue.blocks_available} />
                    <Field label='PMI (hrs)'           value={r.tissue.postmortem_interval_hours} />
                    <Field label='Spinal Cord'         value={r.tissue.spinal_cord_available} />
                    <Field label='Olfactory Bulb'      value={r.tissue.olfactory_bulb_available} />
                    <Field label='CSF'                 value={r.tissue.csf_available} />
                    <Field label='Regions'             value={r.tissue.regions_sampled.join(', ')} />
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
