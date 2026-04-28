const TISSUE_FIELD_MAP = {
  frozen:           'FrozenTissueAvailable',
  ffpe:             'FixedTissueAvailable',
  unstained_slides: 'UnstainedSlidesAvailable',
  spinal_cord:      'SpinalCord',
  olfactory_bulb:   'OlfactoryBulb',
  csf:              'CSF',
}

function applyFilters(docs, params) {
  const {
    idSearch, sex, race, ageRanges,
    thalPhases, braakStages, ceradScores,
    primaryDiagnosis, ad_type, secondaryDiagnoses,
    apoe, mapt, studySource,
    tissueAvailable,
    diagnosisOrderDx, diagnosisOrderMin, diagnosisOrderMax,
  } = params

  return docs.filter(r => {
    if (idSearch) {
      const re = new RegExp(idSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      if (!re.test(r.NPID ?? '') && !re.test(r.AutopsyID ?? '') &&
          !re.test(r.MayoClinicID ?? '') && !re.test(r.NACCPtid ?? '')) return false
    }

    if (sex && r.Sex !== sex) return false

    if (race) {
      if (![].concat(race).includes(r.Race)) return false
    }

    if (studySource) {
      if (![].concat(studySource).includes(r.StudySource)) return false
    }

    if (apoe) {
      if (![].concat(apoe).includes(r.APOEGenotype)) return false
    }

    if (mapt) {
      if (![].concat(mapt).includes(r.MAPT)) return false
    }

    if (ageRanges) {
      const ranges = ageRanges.split(';').map(s => {
        const [a, b] = s.trim().split('-').map(Number)
        return (!isNaN(a) && !isNaN(b)) ? [a, b] : null
      }).filter(Boolean)
      if (ranges.length > 0 && !ranges.some(([a, b]) => (r.AgeAtDeath ?? -1) >= a && (r.AgeAtDeath ?? -1) <= b)) return false
    }

    if (thalPhases) {
      if (![].concat(thalPhases).map(Number).includes(r.ThalPhase)) return false
    }

    if (braakStages) {
      if (![].concat(braakStages).map(Number).includes(r.BraakStage)) return false
    }

    if (ceradScores) {
      if (![].concat(ceradScores).includes(r.CERADNP)) return false
    }

    if (primaryDiagnosis) {
      const values = [].concat(primaryDiagnosis)
      if (!(r.diagnosis ?? []).some(d => d.DiagnosisOrder === 1 && values.includes(d.DiseaseCategory))) return false
    }

    if (secondaryDiagnoses) {
      const values = [].concat(secondaryDiagnoses)
      if (!(r.diagnosis ?? []).some(d => d.DiagnosisOrder > 1 && values.includes(d.DiseaseCategory))) return false
    }

    if (ad_type) {
      const values = [].concat(ad_type)
      if (!(r.diagnosis ?? []).some(d => d.DiagnosisOrder === 1 && values.includes(d.DiseaseSubtype))) return false
    }

    if (diagnosisOrderDx) {
      const min = Math.max(1, parseInt(diagnosisOrderMin) || 1)
      const max = Math.max(min, parseInt(diagnosisOrderMax) || 99)
      if (!(r.diagnosis ?? []).some(d =>
        d.DiseaseCategory === diagnosisOrderDx &&
        d.DiagnosisOrder >= min && d.DiagnosisOrder <= max
      )) return false
    }

    if (tissueAvailable) {
      for (const t of [].concat(tissueAvailable)) {
        const field = TISSUE_FIELD_MAP[t]
        if (field && !(r[field] > 0)) return false
      }
    }

    return true
  })
}

module.exports = applyFilters
