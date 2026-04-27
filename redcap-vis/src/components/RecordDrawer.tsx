import React, { useState } from 'react'
import { DonorRecord } from '../types'
import './RecordDrawer.css'

type Props = {
  record: DonorRecord | null
  onClose: () => void
}

const braakColor = (s: number) => s >= 5 ? 'high' : s >= 3 ? 'mid' : 'low'
const thalColor  = (p: number) => p >= 4 ? 'high' : p >= 2 ? 'mid' : 'low'

const Bool = ({ val }: { val: boolean }) =>
  val
    ? <span className='rd-bool rd-bool--yes'>Yes</span>
    : <span className='rd-bool rd-bool--no'>—</span>

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className='rd-row'>
      <span className='rd-label'>{label}</span>
      <span className='rd-value'>{value}</span>
    </div>
  )
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className='rd-section'>
      <button className='rd-section-header' onClick={() => setOpen(o => !o)}>
        <span className='rd-section-title'>{title}</span>
        <span className={`rd-section-chevron${open ? '' : ' rd-section-chevron--closed'}`}>›</span>
      </button>
      {open && <div className='rd-section-body'>{children}</div>}
    </div>
  )
}

const RecordDrawer: React.FC<Props> = ({ record, onClose }) => {
  const open = record !== null

  return (
    <>
      <div className={`rd-backdrop${open ? ' rd-backdrop--on' : ''}`} onClick={onClose} />
      <div className={`rd-panel${open ? ' rd-panel--open' : ''}`}>
        {record && (
          <>
            {/* ── Header ── */}
            <div className='rd-header'>
              <div className='rd-header-top'>
                <div>
                  <div className='rd-header-npid'>{record.npid ?? `Record #${record.id}`}</div>
                  {record.autopsy_id && <div className='rd-header-autopsy'>{record.autopsy_id}</div>}
                </div>
                <button className='rd-close' onClick={onClose} aria-label='Close'>✕</button>
              </div>

              {/* Quick-glance summary */}
              <div className='rd-summary'>

                <div className='rd-summary-stats'>
                  <div className='rd-stat'>
                    <span className='rd-stat-val'>{record.age_at_death}</span>
                    <span className='rd-stat-lbl'>Age</span>
                  </div>
                  <div className='rd-stat'>
                    <span className='rd-stat-val'>{record.sex}</span>
                    <span className='rd-stat-lbl'>Sex</span>
                  </div>
                  <div className='rd-stat rd-stat--wide'>
                    <span className='rd-stat-val'>{record.race}</span>
                    <span className='rd-stat-lbl'>Race</span>
                  </div>
                </div>

                <div className='rd-summary-dx-block'>
                  <div className='rd-dx-row'>
                    <span className='rd-dx-label'>Primary</span>
                    <span className='rd-dx-val'>{record.primary_diagnosis}</span>
                  </div>
                  {(record.secondary_diagnoses?.length ?? 0) > 0 && (
                    <div className='rd-dx-row'>
                      <span className='rd-dx-label'>Secondary</span>
                      <div className='rd-secondary-pills'>
                        {record.secondary_diagnoses?.map(dx => (
                          <span key={dx} className='rd-secondary-pill'>{dx}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className='rd-summary-meta'>
                  <span className={`rd-badge rd-badge--${braakColor(record.braak_stage)}`}>
                    Braak {record.braak_stage}
                  </span>
                  <span className='rd-summary-source'>{record.brain_source}</span>
                </div>

              </div>
            </div>

            {/* ── Body ── */}
            <div className='rd-body'>

              <Section title='Receive Info'>
                <Row label='Date Received'  value={record.date_received} />
                <Row label='Brain Source'   value={record.brain_source} />
                <Row label='Study Source'   value={record.study_source} />
                <Row label='State of Origin' value={record.state_of_origin} />
                <Row label='IRB Number'     value={record.irb_number} />
                <Row label='IRB Alerts'     value={record.irb_alerts} />
                <Row label='Comments'       value={record.receive_comments} />
                <Row label='Mayo Clinic ID' value={record.mayo_clinic_id} />
                <Row label='NACC PTID'      value={record.nacc_ptid} />
              </Section>

              <Section title='Demographics'>
                <Row label='Date of Birth'   value={record.dob} />
                <Row label='Date of Death'   value={record.dod} />
                <Row label='Age at Death'    value={`${record.age_at_death} yrs`} />
                <Row label='Sex'             value={record.sex} />
                <Row label='Race'            value={record.race} />
              </Section>

              <Section title='Clinical Hx'>
                <Row label='Clinical Diagnosis' value={record.clinical_diagnosis} />
                <Row label='AD Type'            value={record.ad_type} />
                <Row label='Cognitive Status'   value={record.cognitive_status} />
                <Row label='Age at Onset'       value={record.age_at_onset != null ? `${record.age_at_onset} yrs` : undefined} />
                <Row label='Duration'           value={record.duration_years != null ? `${record.duration_years} yrs` : undefined} />
                <Row label='MMSE'               value={record.mmse_score} />
                <Row label='MoCA'               value={record.moca_score} />
                <Row label='CDR'                value={record.cdr_score} />
                <Row label='CDR-SB'             value={record.cdr_sb_score} />
                <Row label='Secondary Dx'
                  value={record.secondary_diagnoses?.length ? record.secondary_diagnoses.join(', ') : undefined} />
                <Row label='Family History'     value={record.family_history} />
                <Row label='Imaging'            value={<Bool val={record.imaging_available} />} />
                <Row label='Sleep Study'        value={<Bool val={record.sleep_study_available} />} />
              </Section>

              <Section title='Brain Cutting'>
                <Row label='Brain Weight'    value={`${record.brain_weight_grams} g`} />
                <Row label='Cutting Date'    value={record.brain_cutting_date} />
                <Row label='PMI (hrs)'       value={record.tissue.postmortem_interval_hours} />
                <Row label='Gross Findings'  value={record.gross_characteristics} />
                <Row label='Original Path Dx' value={record.original_path_dx} />
                <Row label='Outside Path Dx' value={record.outside_path_dx} />
              </Section>

              <Section title='Histopathological Examination'>
                <Row label='Thal Phase'
                  value={<span className={`rd-badge rd-badge--${thalColor(record.thal_phase)}`}>{record.thal_phase}</span>} />
                <Row label='Braak Stage'
                  value={<span className={`rd-badge rd-badge--${braakColor(record.braak_stage)}`}>{record.braak_stage}</span>} />
                <Row label='CERAD'              value={record.cerad_np} />
                <Row label='ABC Score'          value={record.abc_score} />
                <Row label='A / B / C'
                  value={record.a_score != null ? `${record.a_score} / ${record.b_score} / ${record.c_score}` : undefined} />
                <Row label='NIA-Reagan'         value={record.nia_reagan_score} />
                <Row label='NIA-AA Profile'     value={record.nia_aa_biomarker_profile} />
                <Row label='TDP-43'             value={<Bool val={record.tdp43} />} />
                <Row label='TDP Type'           value={record.tdp_type} />
                <Row label='LBD Type'           value={record.lbd_type} />
                <Row label='CDLB Likelihood'    value={record.cdlb_likelihood} />
                <Row label='PD Braak Stage'     value={record.pd_braak_stage} />
                <div className='rd-slides-placeholder'>
                  <span className='rd-slides-icon'>⬚</span>
                  Histopathological slides — coming soon
                </div>
              </Section>

              <Section title='Other Tissues'>
                <Row label='Spinal Cord'    value={<Bool val={record.tissue.spinal_cord_available} />} />
                <Row label='Olfactory Bulb' value={<Bool val={record.tissue.olfactory_bulb_available} />} />
                <Row label='CSF'            value={<Bool val={record.tissue.csf_available} />} />
              </Section>

              <Section title='Genomic Inventory'>
                <Row label='Frozen'          value={<Bool val={record.tissue.frozen_available} />} />
                <Row label='Frozen Quality'  value={record.tissue.frozen_tissue_quality} />
                <Row label='Freeze-Thaw'     value={record.tissue.freeze_thaw_times} />
                <Row label='FFPE'            value={<Bool val={record.tissue.ffpe_available} />} />
                <Row label='DNA Extracted'   value={<Bool val={record.tissue.dna_extracted} />} />
                <Row label='RNA-seq'         value={<Bool val={record.tissue.rna_seq_available} />} />
                <Row label='RIN'             value={record.rin} />
                <Row label='Blocks Available' value={record.tissue.blocks_available} />
                <Row label='Regions Sampled'
                  value={record.tissue.regions_sampled?.length ? record.tissue.regions_sampled.join(', ') : undefined} />
                <Row label='Stained Slides'  value={record.tissue.number_stained_slides || undefined} />
              </Section>

              <Section title='Genotype Info'>
                <Row label='APOE Genotype'   value={`ε${record.apoe}`} />
                <Row label='Determination'   value={record.apoe_method} />
                <Row label='GRN Genotype'    value={record.grn_genotype} />
                <Row label='MAPT Haplotype'  value={record.mapt} />
                <Row label='SNCA'            value={record.snca} />
              </Section>

            </div>
          </>
        )}
      </div>
    </>
  )
}

export default RecordDrawer
