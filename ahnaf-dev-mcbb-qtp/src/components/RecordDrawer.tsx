import React, { useState } from 'react'
import { DonorRecord } from '../types'
import './RecordDrawer.css'

type Props = {
  record: DonorRecord | null
  onClose: () => void
}

const braakColor = (s: number) => s >= 5 ? 'high' : s >= 3 ? 'mid' : 'low'
const thalColor  = (p: number) => p >= 4 ? 'high' : p >= 2 ? 'mid' : 'low'

const Bool = ({ val }: { val: boolean | number | null | undefined }) =>
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
        {record && (() => {
          const sortedDx = record.diagnosis?.slice().sort((a, b) => (a.DiagnosisOrder ?? 0) - (b.DiagnosisOrder ?? 0)) ?? []
          return (
            <>
              {/* ── Header ── */}
              <div className='rd-header'>
                <div className='rd-header-top'>
                  <div>
                    <div className='rd-header-npid'>{record.NPID}</div>
                    {record.AutopsyID && <div className='rd-header-autopsy'>{record.AutopsyID}</div>}
                  </div>
                  <button className='rd-close' onClick={onClose} aria-label='Close'>✕</button>
                </div>

                {/* Quick-glance summary */}
                <div className='rd-summary'>

                  <div className='rd-summary-stats'>
                    <div className='rd-stat'>
                      <span className='rd-stat-val'>{record.AgeAtDeath ?? '—'}</span>
                      <span className='rd-stat-lbl'>Age</span>
                    </div>
                    <div className='rd-stat'>
                      <span className='rd-stat-val'>{record.Sex ?? '—'}</span>
                      <span className='rd-stat-lbl'>Sex</span>
                    </div>
                    <div className='rd-stat rd-stat--wide'>
                      <span className='rd-stat-val'>{record.Race ?? '—'}</span>
                      <span className='rd-stat-lbl'>Race</span>
                    </div>
                  </div>

                  <div className='rd-summary-dx-block'>
                    {sortedDx.map(d => (
                      <div key={d.DiagnosisOrder} className='rd-dx-row'>
                        <span className='rd-dx-order'>{d.DiagnosisOrder}.</span>
                        <span className='rd-dx-val'>{d.DiseaseCategory}</span>
                      </div>
                    ))}
                  </div>

                  <div className='rd-summary-meta'>
                    <span className={`rd-badge rd-badge--${braakColor(record.BraakStage ?? 0)}`}>
                      Braak {record.BraakStage ?? '—'}
                    </span>
                    <span className='rd-summary-source'>{record.BrainSource}</span>
                  </div>

                </div>
              </div>

              {/* ── Body ── */}
              <div className='rd-body'>

                <Section title='Receive Info'>
                  <Row label='Date Received'   value={record.DateReceived} />
                  <Row label='Brain Source'    value={record.BrainSource} />
                  <Row label='Study Source'    value={record.StudySource} />
                  <Row label='State of Origin' value={record.StateOfOriginOfBrain} />
                  <Row label='IRB Number'      value={record.IRBNumber} />
                  <Row label='IRB Alerts'      value={record.IRBAlerts} />
                  <Row label='Comments'        value={record.ReceiveComments} />
                  <Row label='Mayo Clinic ID'  value={record.MayoClinicID} />
                  <Row label='NACC PTID'       value={record.NACCPtid} />
                </Section>

                <Section title='Demographics'>
                  <Row label='Date of Birth'  value={record.DOB} />
                  <Row label='Date of Death'  value={record.DOD} />
                  <Row label='Age at Death'   value={record.AgeAtDeath != null ? `${record.AgeAtDeath} yrs` : undefined} />
                  <Row label='Sex'            value={record.Sex} />
                  <Row label='Race'           value={record.Race} />
                </Section>

                <Section title='Clinical Hx'>
                  <Row label='Clinical Diagnosis' value={record.ClinicalDiagnosis} />
                  <Row label='Cognitive Status'   value={record.CognitiveStatus} />
                  <Row label='Age at Onset'       value={record.AgeAtOnset != null ? `${record.AgeAtOnset} yrs` : undefined} />
                  <Row label='Duration'           value={record.Duration != null ? `${record.Duration} yrs` : undefined} />
                  <Row label='MMSE'               value={record.MMSEScore} />
                  <Row label='MoCA'               value={record.MoCAScore} />
                  <Row label='CDR'                value={record.CDRScore} />
                  <Row label='CDR-SB'             value={record.CDRSBScore} />
                  {sortedDx.filter(d => (d.DiagnosisOrder ?? 0) > 1).map(d => (
                    <Row key={d.DiagnosisOrder} label={`Dx ${d.DiagnosisOrder}`} value={d.DiseaseCategory} />
                  ))}
                  <Row label='Family History'     value={record.FamilyHistory} />
                  <Row label='Imaging'            value={<Bool val={record.ImagingAvailable} />} />
                  <Row label='Sleep Study'        value={<Bool val={record.SleepStudyAvailable} />} />
                </Section>

                <Section title='Brain Cutting'>
                  <Row label='Brain Weight'     value={record.BrainWeight != null ? `${record.BrainWeight} g` : undefined} />
                  <Row label='Cutting Date'     value={record.BrainCuttingDate} />
                  <Row label='PMI (hrs)'        value={record.PostmortemInterval} />
                  <Row label='Gross Findings'   value={record.GrossCharacteristics} />
                  <Row label='Original Path Dx' value={record.OriginalPathDx} />
                  <Row label='Outside Path Dx'  value={record.OutsidePathDx} />
                </Section>

                <Section title='Histopathological Examination'>
                  <Row label='Thal Phase'
                    value={<span className={`rd-badge rd-badge--${thalColor(record.ThalPhase ?? 0)}`}>{record.ThalPhase ?? '—'}</span>} />
                  <Row label='Braak Stage'
                    value={<span className={`rd-badge rd-badge--${braakColor(record.BraakStage ?? 0)}`}>{record.BraakStage ?? '—'}</span>} />
                  <Row label='CERAD'          value={record.CERADNP} />
                  <Row label='ABC Score'      value={record.ABCScore} />
                  <Row label='A / B / C'
                    value={record.AScore != null ? `${record.AScore} / ${record.BScore} / ${record.CScore}` : undefined} />
                  <Row label='NIA-Reagan'     value={record.NIAReaganScore} />
                  <Row label='NIA-AA Profile' value={record.NIAAABiomarkerProfile} />
                  <Row label='TDP-43'         value={<Bool val={record.TDP43} />} />
                  <Row label='TDP Type'       value={record.TDPType} />
                  <Row label='LBD Type'       value={record.LBDType} />
                  <Row label='CDLB Likelihood' value={record.CDLBLikelihood} />
                  <Row label='PD Braak Stage' value={record.PDBraakStage} />
                  <div className='rd-slides-placeholder'>
                    <span className='rd-slides-icon'>⬚</span>
                    Histopathological slides — coming soon
                  </div>
                </Section>

                <Section title='Other Tissues'>
                  <Row label='Spinal Cord'    value={<Bool val={record.SpinalCord} />} />
                  <Row label='Olfactory Bulb' value={<Bool val={record.OlfactoryBulb} />} />
                  <Row label='CSF'            value={<Bool val={record.CSF} />} />
                </Section>

                <Section title='Tissue Inventory'>
                  <Row label='Frozen'          value={<Bool val={record.FrozenTissueAvailable} />} />
                  <Row label='Frozen Quality'  value={record.FrozenTissueQuality} />
                  <Row label='Freeze-Thaw'     value={record.FreezeThawTimes} />
                  <Row label='FFPE'            value={<Bool val={record.FixedTissueAvailable} />} />
                  <Row label='DNA Extracted'   value={<Bool val={record.DNAExtracted} />} />
                  <Row label='RNA-seq'         value={<Bool val={record.RNASeq} />} />
                  <Row label='RIN'             value={record.RIN} />
                  <Row label='Unstained Slides' value={<Bool val={record.UnstainedSlidesAvailable} />} />
                  <Row label='Stained Slides'  value={record.NumberStainedSlides || undefined} />
                </Section>

                <Section title='Genotype Info'>
                  <Row label='APOE Genotype'  value={record.APOEGenotype ? `ε${record.APOEGenotype}` : undefined} />
                  <Row label='Determination'  value={record.APOEDeterminationMethod} />
                  <Row label='GRN Genotype'   value={record.GRNGenotype} />
                  <Row label='MAPT Haplotype' value={record.MAPT} />
                  <Row label='SNCA'           value={record.SNCA} />
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
