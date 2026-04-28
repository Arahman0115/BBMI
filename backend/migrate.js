// One-shot migration: transforms all documents in the samples collection
// from the old snake_case + nested tissue schema to the new PascalCase flat schema.
// Run once: node backend/migrate.js

require('dotenv').config({ path: __dirname + '/.env' })
const mongoose = require('mongoose')

function transformDoc(doc) {
  const t = doc.tissue ?? {}

  // Build ordered diagnosis array from flat fields
  const diagnosis = []
  if (doc.primary_diagnosis) {
    diagnosis.push({
      DiagnosisOrder:  1,
      DiseaseCategory: doc.primary_diagnosis,
      DiseaseSubtype:  doc.ad_type ?? null,
    })
  }
  if (Array.isArray(doc.secondary_diagnoses)) {
    doc.secondary_diagnoses.forEach((dx, i) => {
      diagnosis.push({ DiagnosisOrder: i + 2, DiseaseCategory: dx, DiseaseSubtype: null })
    })
  }

  const bool = v => (v == null ? null : v ? 1 : 0)

  return {
    _id: doc._id,

    // Identifiers
    ID:                    doc.id != null ? String(doc.id) : null,
    NPID:                  doc.npid                        ?? null,
    AutopsyID:             doc.autopsy_id                  ?? null,
    MayoClinicID:          doc.mayo_clinic_id              ?? null,
    TruncatedMayoClinicID: doc.truncated_mayo_clinic_id    ?? null,
    NACCPtid:              doc.nacc_ptid                   ?? null,
    PTNUM:                 doc.ptnum                       ?? null,
    IRBNumber:             doc.irb_number                  ?? null,
    IRBAlerts:             doc.irb_alerts                  ?? null,

    // Intake
    DateReceived:       doc.date_received    ?? null,
    BrainSource:        doc.brain_source     ?? null,
    StudySource:        doc.study_source     ?? null,
    StateOfOriginOfBrain: doc.state_of_origin ?? null,
    ReceiveComments:    doc.receive_comments ?? null,

    // Demographics
    DOB:        doc.dob          ?? null,
    DOD:        doc.dod          ?? null,
    AgeAtDeath: doc.age_at_death ?? null,
    Sex:        doc.sex          ?? null,
    Race:       doc.race         ?? null,

    // Clinical
    ClinicalDiagnosis:         doc.clinical_diagnosis          ?? null,
    ClinicalDiagnosisComments: doc.clinical_diagnosis_comments ?? null,
    FamilyHistory:             doc.family_history              ?? null,
    AgeAtOnset:                doc.age_at_onset                ?? null,
    DateOfOnset:               doc.date_of_onset               ?? null,
    DateOfSymptomOnset:        doc.date_of_symptom_onset       ?? null,
    Duration:                  doc.duration_years              ?? null,
    CognitiveStatus:           doc.cognitive_status            ?? null,
    MMSEScore:                 doc.mmse_score                  ?? null,
    MoCAScore:                 doc.moca_score                  ?? null,
    CDRScore:                  doc.cdr_score                   ?? null,
    CDRSBScore:                doc.cdr_sb_score                ?? null,
    ALSFRSRScore:              doc.alsfrs_r_score              ?? null,
    ImagingAvailable:          bool(doc.imaging_available),
    SleepStudyAvailable:       bool(doc.sleep_study_available),

    // Autopsy
    BrainCuttingDate:        doc.brain_cutting_date     ?? null,
    BrainWeight:             doc.brain_weight_grams     ?? null,
    PostmortemInterval:      t.postmortem_interval_hours ?? null,
    GrossCharacteristics:    doc.gross_characteristics  ?? null,
    MCJDiener:               doc.mcj_diener             ?? null,
    AutopsyNotes:            doc.autopsy_notes          ?? null,
    UnstainedSlidesAvailable: bool(t.unstained_slides_available),
    NumberStainedSlides:     t.number_stained_slides    ?? null,
    OriginalPathDx:          doc.original_path_dx       ?? null,
    OutsidePathDx:           doc.outside_path_dx        ?? null,
    DigitalReportAvailable:  bool(doc.digital_report_available),
    SignOutDate:             doc.sign_out_date           ?? null,
    CPCConferenceDate:       doc.cpc_conference_date     ?? null,

    // Neuropathology
    ThalPhase:            doc.thal_phase              ?? null,
    BraakStage:           doc.braak_stage             ?? null,
    CERADNP:              doc.cerad_np                ?? null,
    ABCScore:             doc.abc_score               ?? null,
    AScore:               doc.a_score                 ?? null,
    BScore:               doc.b_score                 ?? null,
    CScore:               doc.c_score                 ?? null,
    NIAReaganScore:       doc.nia_reagan_score         ?? null,
    ADSubtype:            doc.ad_type                 ?? null,
    NIAAABiomarkerProfile: doc.nia_aa_biomarker_profile ?? null,
    PDBraakStage:         doc.pd_braak_stage           ?? null,
    LBDType:              doc.lbd_type                 ?? null,
    CDLBLikelihood:       doc.cdlb_likelihood          ?? null,
    VaDSummary:           doc.va_d_summary             ?? null,
    VaDKalaria:           doc.va_d_kalaria             ?? null,
    KalariaModified:      doc.kalaria_modified         ?? null,
    TDP43:                bool(doc.tdp43),
    TDPType:              doc.tdp_type                 ?? null,
    TDPTypeOld:           doc.tdp_type_old             ?? null,

    // Tissue (flat, numbers)
    SpinalCord:              bool(t.spinal_cord_available),
    OlfactoryBulb:           bool(t.olfactory_bulb_available),
    CSF:                     bool(t.csf_available),
    FixedTissueAvailable:    bool(t.ffpe_available),
    FixedTissueUnit:         t.fixed_tissue_unit         ?? null,
    FixedTissueBoxNumber:    t.fixed_tissue_box_number   ?? null,
    FrozenTissueAvailable:   bool(t.frozen_available),
    FrozenTissueQuality:     t.frozen_tissue_quality     ?? null,
    FrozenTissueCaseValue:   t.frozen_tissue_case_value  ?? null,
    FreezerNumber:           t.freezer_number            ?? null,
    FreezerBox:              t.freezer_box               ?? null,
    FreezeThawTimes:         t.freeze_thaw_times         ?? null,
    FrozenTissueComments:    t.frozen_tissue_comments    ?? null,
    DNAExtracted:            bool(t.dna_extracted),
    ExtractedDNANotInFreezer: bool(t.extracted_dna_not_in_freezer),
    DNALocation:             t.dna_location              ?? null,
    RNASeq:                  bool(t.rna_seq_available),

    // Genetics
    APOEGenotype:           doc.apoe              ?? null,
    APOEDeterminationMethod: doc.apoe_method       ?? null,
    GBAGenotype:            doc.gba_genotype       ?? null,
    GRNGenotype:            doc.grn_genotype       ?? null,
    GRNrs5848:              doc.grn_rs5848         ?? null,
    MAPT:                   doc.mapt               ?? null,
    MOBP:                   doc.mobp               ?? null,
    RIN:                    doc.rin                ?? null,
    SNCA:                   doc.snca               ?? null,
    TMEM106brs1990622:      doc.tmem106b_rs1990622 ?? null,
    TMEM106brs3173615:      doc.tmem106b_rs3173615 ?? null,

    diagnosis: diagnosis.length > 0 ? diagnosis : [],
    slides:    doc.slides ?? [],
  }
}

async function migrate() {
  await mongoose.connect(process.env.DATABASE_URL)
  const col = mongoose.connection.db.collection('samples')

  // Drop legacy unique index on `id` — new schema uses NPID as the identifier
  try {
    await col.dropIndex('id_1')
    console.log('Dropped legacy index id_1')
  } catch (_) { /* index may not exist */ }

  const docs = await col.find({}).toArray()
  console.log(`Found ${docs.length} documents to migrate`)

  let migrated = 0
  let skipped  = 0
  for (const doc of docs) {
    if (doc.NPID !== undefined) { skipped++; continue } // already migrated
    const newDoc = transformDoc(doc)
    await col.replaceOne({ _id: doc._id }, newDoc)
    migrated++
    if (migrated % 100 === 0) console.log(`  ${migrated}/${docs.length}...`)
  }

  console.log(`Done: ${migrated} migrated, ${skipped} already up-to-date`)
  await mongoose.disconnect()
}

migrate().catch(err => { console.error(err); process.exit(1) })
