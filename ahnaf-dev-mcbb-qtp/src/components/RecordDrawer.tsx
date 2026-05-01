import React, { useState } from 'react'
import { DonorRecord } from '../types'
import './RecordDrawer.css'

type Props = {
  record: DonorRecord | null
  onClose: () => void
}

const braakColor = (s: number) => s >= 5 ? 'high' : s >= 3 ? 'mid' : 'low'
const thalColor  = (p: number) => p >= 4 ? 'high' : p >= 2 ? 'mid' : 'low'

const Bool = ({ val }: { val: boolean | null | undefined }) =>
  val
    ? <span className='rd-bool rd-bool--yes'>Yes</span>
    : <span className='rd-bool rd-bool--no'>—</span>

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => {
  if (value === null || value === undefined || value === '' || value === '—') return null
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
        {record && (() => {
          const path   = record.pathology
          const dem    = record.demographics
          const intake = record.intake
          const tis    = record.tissue
          const clin   = record.clinical
          const diag   = record.diagnosis ?? []

          const gene = (marker: string) => record.genetics?.find(g => g.marker === marker)?.value
          const geneMethod = (marker: string) => record.genetics?.find(g => g.marker === marker)?.method

          const primaryDx   = diag.find(d => d.order === 1)
          const secondaryDx = diag.filter(d => (d.order ?? 0) > 1).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

          return (
            <>
              {/* ── Header ── */}
              <div className='rd-header'>
                <div className='rd-header-top'>
                  <div>
                    <div className='rd-header-npid'>{record.npid ?? 'Record Details'}</div>
                    {intake?.brainSource && <div className='rd-header-autopsy'>{intake.brainSource}</div>}
                  </div>
                  <button className='rd-close' onClick={onClose} aria-label='Close'>✕</button>
                </div>

                <div className='rd-summary'>
                  <div className='rd-summary-stats'>
                    <div className='rd-stat'>
                      <span className='rd-stat-val'>{dem?.ageAtDeath ?? '—'}</span>
                      <span className='rd-stat-lbl'>Age</span>
                    </div>
                    <div className='rd-stat'>
                      <span className='rd-stat-val'>{dem?.sex ?? '—'}</span>
                      <span className='rd-stat-lbl'>Sex</span>
                    </div>
                    <div className='rd-stat rd-stat--wide'>
                      <span className='rd-stat-val'>{dem?.race ?? '—'}</span>
                      <span className='rd-stat-lbl'>Race</span>
                    </div>
                  </div>

                  <div className='rd-summary-dx-block'>
                    {diag.map(d => (
                      <div key={d.order} className='rd-dx-row'>
                        <span className='rd-dx-order'>{d.order}.</span>
                        <span className='rd-dx-val'>{d.category}</span>
                      </div>
                    ))}
                  </div>

                  <div className='rd-summary-meta'>
                    <span className={`rd-badge rd-badge--${braakColor(path?.braakStage ?? 0)}`}>
                      Braak {path?.braakStage ?? '—'}
                    </span>
                    {intake?.studySource && <span className='rd-summary-source'>{intake.studySource}</span>}
                  </div>
                </div>
              </div>

              {/* ── Body ── */}
              <div className='rd-body'>

                <Section title='Demographics'>
                  <Row label='Date of Birth'   value={dem?.dob} />
                  <Row label='Date of Death'   value={dem?.dod} />
                  <Row label='Age at Death'    value={dem?.ageAtDeath != null ? `${dem.ageAtDeath} yrs` : undefined} />
                  <Row label='Sex'             value={dem?.sex} />
                  <Row label='Race'            value={dem?.race} />
                  <Row label='State of Origin' value={intake?.stateOfOrigin} />
                </Section>

                <Section title='Clinical'>
                  {(clin?.clinicalDiagnosis ?? []).map((d, i) => (
                    <Row key={i} label={i === 0 ? 'Clinical Diagnosis' : `Clinical Dx ${i + 1}`} value={d.diagnosis} />
                  ))}
                  <Row label='Cognitive Status'   value={clin?.cognitiveStatus} />
                  <Row label='Age at Onset'       value={clin?.ageAtOnset} />
                  <Row label='Family History'     value={<Bool val={clin?.familyHistory} />} />
                  <Row label='MMSE'               value={clin?.mmse} />
                  <Row label='MoCA'               value={clin?.moca} />
                  <Row label='CDR'                value={clin?.cdr} />
                  <Row label='CDR-SB'             value={clin?.cdrsb} />
                </Section>

                <Section title='Diagnoses'>
                  {primaryDx && (
                    <>
                      <Row label='Primary Category' value={primaryDx.category} />
                      {primaryDx.subtype && <Row label='AD Subtype' value={primaryDx.subtype} />}
                    </>
                  )}
                  {secondaryDx.map(d => (
                    <Row key={d.order} label={`Dx ${d.order}`} value={d.category} />
                  ))}
                  {(record.contributing ?? []).map((d, i) => (
                    <Row key={`c${i}`} label={`Contributing ${i + 1}`} value={d.category} />
                  ))}
                </Section>

                <Section title='Neuropathology Scores'>
                  <Row label='Original Path Dx'   value={path?.originalPathDx} />
                  <Row label='ABC Score'           value={path?.abcScore} />
                  <Row label='Thal Phase'
                    value={<span className={`rd-badge rd-badge--${thalColor(path?.thalPhase ?? 0)}`}>{path?.thalPhase ?? '—'}</span>} />
                  <Row label='Braak Stage'
                    value={<span className={`rd-badge rd-badge--${braakColor(path?.braakStage ?? 0)}`}>{path?.braakStage ?? '—'}</span>} />
                  <Row label='CERAD NP'      value={path?.ceradNp} />
                  <Row label='NIA-Reagan'    value={path?.niaReaganScore} />
                  <Row label='LBD Type'      value={path?.lbdType} />
                  <Row label='TDP-43'        value={path?.tdp43 != null ? <Bool val={path.tdp43} /> : undefined} />
                </Section>

                <Section title='Genetics'>
                  <Row label='APOE Genotype'  value={gene('APOE') ? `ε${gene('APOE')}` : undefined} />
                  <Row label='APOE Method'    value={geneMethod('APOE')} />
                  <Row label='MAPT'           value={gene('MAPT')} />
                  <Row label='GBA'            value={gene('GBA')} />
                  <Row label='GRN'            value={gene('GRN')} />
                  <Row label='SNCA'           value={gene('SNCA')} />
                  <Row label='TMEM106B rs1990622' value={gene('TMEM106B_rs1990622')} />
                  <Row label='TMEM106B rs3173615' value={gene('TMEM106B_rs3173615')} />
                </Section>

                <Section title='Tissue Inventory'>
                  <Row label='Frozen'             value={<Bool val={tis?.frozenAvailable} />} />
                  <Row label='FFPE'               value={<Bool val={tis?.fixedAvailable} />} />
                  <Row label='Fixed Tissue Unit'  value={tis?.fixedUnit} />
                  <Row label='DNA Extracted'      value={<Bool val={tis?.dnaExtracted} />} />
                  <Row label='RNA-seq'            value={<Bool val={tis?.rnaSeq} />} />
                  <Row label='Spinal Cord'        value={<Bool val={tis?.spinalCord} />} />
                  <Row label='Olfactory Bulb'     value={<Bool val={tis?.olfactoryBulb} />} />
                  <Row label='CSF'                value={<Bool val={tis?.csf} />} />
                  <Row label='Unstained Slides'   value={<Bool val={tis?.unstainedSlides} />} />
                  <Row label='PMI (hrs)'          value={tis?.postmortemInterval} />
                  <Row label='Brain Weight (g)'   value={tis?.brainWeight} />
                  <Row label='Brain Cutting Date' value={tis?.brainCuttingDate} />
                </Section>

                <Section title='Intake'>
                  <Row label='Brain Source'   value={intake?.brainSource} />
                  <Row label='Study Source'   value={intake?.studySource} />
                  <Row label='Date Received'  value={intake?.dateReceived} />
                  <Row label='IRB Number'     value={intake?.irbNumber} />
                </Section>

                <Section title='Histopathological Slides'>
                  {(record.slides ?? []).length === 0 ? (
                    <div className='rd-slides-placeholder'>
                      <span className='rd-slides-icon'>⬚</span>
                      No slides available
                    </div>
                  ) : (record.slides ?? []).map((s, i) => (
                    <Row key={i} label={s.brainRegion ?? `Slide ${i + 1}`} value={s.stainTarget} />
                  ))}
                </Section>

              </div>
            </>
          )
        })()}
      </div>
    </>
  )
}

export default RecordDrawer
