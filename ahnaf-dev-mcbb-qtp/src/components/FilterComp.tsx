import React, { useState, useEffect } from 'react'
import { FilterState, Sex, ApoeGenotype, MaptHaplotype, BraakStage, ThalPhase, AlzheimersType, CeradScore } from '../types'
import MultiSelect, { MSOption } from './MultiSelect'
import './FilterComp.css'

type Props = {
  filterState: FilterState
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>
  onReset?: () => void
  onSearch?: () => void
  onExpand?: () => void
  expanded?: boolean
}

const SEX_OPTS: MSOption<Sex>[] = [
  { value: 'Male',   label: 'Male' },
  { value: 'Female', label: 'Female' },
]

const RACE_OPTS: MSOption<string>[] = [
  { value: 'African American',        label: 'African American' },
  { value: 'Asian',                   label: 'Asian' },
  { value: 'Asian Filipino',          label: 'Asian Filipino' },
  { value: 'Hispanic',                label: 'Hispanic' },
  { value: 'Mixed (Afro-Caucasian)',  label: 'Mixed (Afro-Caucasian)' },
  { value: 'Native American',         label: 'Native American' },
  { value: 'Non-Hispanic White',      label: 'Non-Hispanic White' },
  { value: 'Other',                   label: 'Other' },
  { value: 'Pacific Islander',        label: 'Pacific Islander' },
  { value: 'Unknown',                 label: 'Unknown' },
]

const STUDY_OPTS: MSOption<string>[] = [
  'ADC', 'ADC (consult)', 'ADC (DIAN)', 'ADC (RPD)', 'ADC/ALLFTD', 'ADC/LBD', 'ADC/LEADS', 'ADC/RPD',
  'ADI', 'ADI (BSN)', 'ADI (consult)', 'ADI/LEADS', 'ADI/PDC',
  'ADPR', 'ADPR (DIAN)',
  'ADRC', 'ADRC (DIAN)', 'ADRC/ALLFTD', 'ADRC/ARFTL', 'ADRC/LEADS (ADRC)', 'ADRC/LEFFTDS',
  'ADRDA', 'ALLFTD',
  'ALS', 'ALS (SOD1 A5D)', 'ALS consult (non-Mayo)',
  'autopsy', 'autospy', 'BSN/MCA',
  'consult', 'consult (BSN', 'consult (BSN)', 'Consult (BSN)', 'consult (BSN) (DIAN)',
  'consult (BSN)/ALLFTD', 'consult (CTE)', 'consult (PDC)', 'consult, Guam',
  'CurePSP', 'CurePSP/PDC', 'CurePSP/RPD',
  'DLB', 'Drug', 'EAS', 'EAS/ADI', 'EGPD', 'FADRC', 'FTD', 'ILBD',
  'KUADC', 'LOAD', 'LRRK2',
  'MCSA', 'MCSA/ADNI', 'MCSA/EGPD', 'NPF', 'other',
  'PDC', 'PDC (ALLFTD)', 'PDC (BSN)', 'PDC/ALLFTD',
  'Penn ADRC', 'PET', 'UCSD', 'Univ MN Anatomy Bequest Prog, Minneapolis',
].map(v => ({ value: v, label: v }))

const APOE_OPTS: MSOption<ApoeGenotype>[] = [
  { value: '22', label: 'E2/E2' },
  { value: '23', label: 'E2/E3' },
  { value: '24', label: 'E2/E4' },
  { value: '33', label: 'E3/E3' },
  { value: '34', label: 'E3/E4' },
  { value: '44', label: 'E4/E4' },
]

const MAPT_OPTS: MSOption<MaptHaplotype>[] = [
  { value: 'H1H1', label: 'H1/H1' },
  { value: 'H1H2', label: 'H1/H2' },
  { value: 'H2H2', label: 'H2/H2' },
]

const THAL_OPTS: MSOption<ThalPhase>[] = ([0,1,2,3,4,5] as ThalPhase[]).map(p => ({ value: p, label: `Phase ${p}` }))

const BRAAK_ROMAN = ['0','I','II','III','IV','V','VI']
const BRAAK_OPTS: MSOption<BraakStage>[] = ([0,1,2,3,4,5,6] as BraakStage[]).map((s, i) => ({ value: s, label: `Stage ${BRAAK_ROMAN[i]}` }))

const CERAD_OPTS: MSOption<CeradScore>[] = [
  { value: 'None',                 label: 'None' },
  { value: 'Sparse',               label: 'Sparse' },
  { value: 'Moderate',             label: 'Moderate' },
  { value: 'Frequent',             label: 'Frequent' },
  { value: 'None - Sparse',        label: 'None - Sparse' },
  { value: 'Sparse - Moderate',    label: 'Sparse - Moderate' },
  { value: 'Moderate - Frequent',  label: 'Moderate - Frequent' },
]

const TISSUE_OPTS: MSOption<string>[] = [
  { value: 'frozen',           label: 'Frozen Tissue' },
  { value: 'ffpe',             label: 'Fixed Tissue (FFPE)' },
  { value: 'unstained_slides', label: 'Unstained Slides' },
  { value: 'spinal_cord',      label: 'Spinal Cord' },
  { value: 'olfactory_bulb',   label: 'Olfactory Bulb' },
  { value: 'csf',              label: 'CSF' },
]

const AD_TYPE_OPTS: MSOption<AlzheimersType>[] = [
  { value: 'Amnestic AD', label: 'Amnestic AD' },
  { value: 'Atypical AD', label: 'Atypical AD' },
]

const DX_STRINGS: string[] = [
  '3R Tauopathy',
  '4R Tauopathy',
  'Control',
  'GRN Mutation',
  'No Cognitive Impairment',
  'TDP-43 Proteinopathy',
  'Vascular Pathology',
  'aALB',
  'abscess',
  'acquired hepatocerebral degeneration',
  'Acute Disseminated Encephalomyelitis',
  'Acute myeloblastic leukemia',
  'AD NFT type',
  'Adult polyglucosan body disease',
  'AGD-like',
  'AGD-like tau',
  'Aging-Related Tau Astrogliopathy (ARTAG)',
  'agonal changes',
  'agonal hypoxia',
  'ALB',
  'ALB vTLBD',
  'ALB=9',
  'ALD variant',
  'Alobar holoprosencephaly',
  'Alport',
  'ALS status post mesenchymal stem cell Rx/ PART',
  'ALS TDP-43 Type E/ AGD/SRT/ PART',
  'ALS-FET',
  'ALS-FUS',
  'ALS-SOD1',
  "Alzheimer's Disease (AD)",
  'Amyg s LBs',
  'amygdala necrosis',
  'Amygdala Sclerosis (AmygScl)',
  'amygdalo-striato-thalamo-tectal degeneration',
  'amyloidosis',
  'Amyotrophic Lateral Sclerosis (ALS)',
  'and degen',
  'Aneurysm',
  'Angioma',
  'anomalous fiber tracts',
  'Anoxia',
  'Anoxia herniation encephalitis',
  'Anoxic',
  'anoxic changes',
  'Anoxic enceph',
  'Anoxic encephal',
  'Anoxic encephalopathy',
  'anoxic leukoencephalopathy',
  'Anoxic-ischemic encephalopathy',
  'anterior commissure degen',
  'APP anoxic',
  'APP+ axonal injury',
  'APP+ Leukoencephalopathy',
  'aqueductal gliosis',
  'Aqueductal Stenosis',
  'Arachnoid Cyst',
  'Arachnoid fibrosis',
  'Arachnoid Fibrosis',
  'Argyrophilic Grain Disease (AGD)',
  'Arnold Chiari Malformation',
  'Arnold Chiari Malformation Type 1',
  'ARTAG with Thorn-shaped astrocyte (TSA)',
  'Arteriolosclerosis (VaD)',
  'Arteriolosclerotic Small Vessel Disease (ASVD)',
  'Arteriolosclerotic Vascular Disease',
  'arteriopathy',
  'Arteriovenous malformation',
  'Aspergillosis',
  'Aspergillus Encephalitis',
  'Aspergillus Meningitis',
  'Astrocytoma',
  'aSyn-neg-pale bodies',
  'Ataxia telangiectasia',
  'Atherosclerosis',
  'ATP',
  'Atrophy',
  'Autism',
  'Autolysis',
  'axonal spheroids',
  'bacterial',
  'Bacterial growth',
  'Bacterial meningitis',
  'ballooned neurons',
  'band',
  'band heterotopia',
  'basilar thrombosis',
  'basophilic',
  'Basophilic inclusion body disease (BIBD)',
  'Bergmann RF',
  'Berry aneurysm',
  "Binswanger's disease",
  'BLBD',
  'both Thal- and pallid-otomies',
  'brain abscesses',
  'Brain B-cell lymphoma',
  'Brain dead anoxic encephalopathy',
  'Brain Death',
  'brain hernation due to SDH',
  'brain nevi',
  'brain purpura',
  'brain trauma',
  'brain tumor',
  'c',
  'c9ALS',
  'Ca',
  'CA2 Scl',
  'CA3 Scl',
  'calcification',
  'calcospherites',
  'callosal necrosis',
  'Candida meningitis',
  'Candida ventriculitis',
  'Carcinomatosis',
  'Carcinomatous meningitis',
  'Carcinomatous ventriculitis',
  'cardiac a-synuclein',
  'cardiac amyloid',
  'cavernoma',
  'cavernous angioma',
  'cavernous malformation',
  'CBD astrocytic plaques',
  'CBD-like 4R tauopathy',
  'CBT& degen',
  'CD20 leukemoid',
  'Central neurocytoma',
  'Central Pontine Myelinolysis (CPM)',
  'Cerebellar Sclerosis (CblScl)',
  'Cerebral Amyloid Angiopathy (CAA)',
  'Cerebral Autosomal Dominant Arteriopathy with Subcortical Infarcts and Leukoencephalopathy (CADASIL)',
  'cerebritis',
  'Cerebritis',
  'Cerebrovascular Accident (CVA)',
  'ceroid',
  'CGP',
  'Charcot-Bouchard aneurysm',
  'Charles Bonnet syndrome',
  'Chronic lymphocytic leukemia',
  'Chronic Traumatic Encephalopathy (CTE)',
  'CJD / PART',
  'CN axonal dystophy',
  'coarse grain plaques',
  'Cockayne',
  'Coffin-Lowry',
  'collagenosis',
  'congenital aqueductal stenosis',
  'Congenital disorder of glycosylation',
  'congenital malformation',
  'Contusion',
  'corpora amylacea',
  'Corticobasal Degeneration (CBD)',
  'corticobulbar',
  'COVID-19 Encephalitis',
  'Creutzfeldt-Jakob Disease (CJD)',
  'CTE features',
  'CTE-like',
  'CVA status post meningioma',
  'CVA Thal',
  'CVAs and CVD',
  'cyst',
  'DBS',
  'DBS encephalomalacia',
  'DBS for ET',
  'DBS-like',
  'deafness',
  'Degeneration',
  'dementia',
  'dementia unknown etiology',
  'demyelination',
  'denervation atrophy',
  'dentate neuronophagia',
  'depressive pseudodementia',
  'Diabetes',
  'Diffuse axonal injury',
  'Disproportionately Enlarged Subarachnoid Hydrocephalus (DESH)',
  'DLBD',
  'DNET',
  'DNT',
  'dolichoectasia',
  'drug overdose',
  'dural sinus thromboses',
  'Duret Hemorrhage',
  'dysgenesis',
  'Dysmyelinating leukoencephalopathy',
  'dysplasia',
  'dystonia',
  'edema',
  'embalming artifacts',
  'emboli',
  'emperipolesis',
  'Encephalitis',
  'Encephalomalacia',
  'Encephalomyelitis',
  'Encephalopathy',
  'Endendymitis',
  'endovascular foreign body granulomas',
  'eosinophilic perivasculitis',
  'Ependymitis',
  'Ependymoma',
  'Fahr typoe Ca',
  'Fahr-like',
  "Fahr's Disease",
  'falx lipoma',
  'Familial ALS',
  'FCD Type IIb',
  'Fe++',
  'features of CTE',
  'fetal transplant',
  'FPT',
  "Friedreich's ataxia",
  'frontal ICH',
  'frontal leukoencephalopathy',
  'Frontal variant',
  'Frontotemporal Lobar Degeneration (FTLD)',
  'FTDP with grains',
  'FTLD-ALS',
  'FTLD-BIBD',
  'FTLD-FUS',
  'FTLD-MND',
  'FTLD-PLS',
  'FTLD-SOD',
  'FTLD-tau',
  'FTLD-Tau with MAPT mutation (FTDP-17)',
  'FTLD-TDP',
  'FTLD-TDP / PART/berry aneurysm',
  'FTLD-TDP temporal',
  'FTLD-TDP with MND',
  'FTLD-U',
  'Fungal cerebritis',
  'Ganglioglioma',
  'Ganglioneuroma',
  'GCT',
  'Gerstmann-Straussler-Scheinker Disease (GSS)',
  'giant aneurysm',
  'Giant cell glioblastoma',
  'glial hamartoma',
  'Glioblastoma (GBM)',
  'gliomatosis',
  'gliomatosis cerebri',
  'Gliosarcoma',
  'Gliosis',
  'Globular Glial Tauopathy (GGT)',
  'gracile deg',
  'gracile degen',
  'gracile spheroids',
  'granular ependymitis',
  'granulomas',
  'granulomatous angiitis',
  'Guillain-Barre',
  'HAM',
  'head trauma',
  'hem',
  'hem CVA',
  'hem. CVA',
  'hemachromatosis',
  'Hemangioblastoma',
  'Hemangioma',
  'Hemi-megalencephaly',
  'hemosiderosis',
  'hepatocerebral',
  'hepatocerebral degen',
  'Hereditary Diffuse Leukoencephalopathy with Spheroids (HDLS)',
  'Herniation',
  'Herpes Simplex Virus Encephalitis',
  'Heterotopia',
  'Hippocampal Sclerosis (HpScl)',
  'Histiocytosis',
  'holoprosencephaly',
  'HpScl -4',
  'HpScl tauopathy',
  'HpScl with TDP-43',
  'HSP',
  "Huntington's Disease",
  'Hx spinal stenosis',
  'hyaline',
  'hyaline LB',
  'Hydrocephalus',
  'hydrocephalus ex vacuo',
  'hygroma',
  'hypoplasia',
  'hypothal CMV',
  'hypothalamic tau',
  'hypoxia',
  'ICH due to GSW',
  'ICH IVH SAH',
  'ICH pos',
  'ILBD',
  'Incipient encephalitis',
  'Infant brain',
  'Infantile SMA',
  'Inferior Olivary Hypertrophy (IOH)',
  'inflammation',
  'infundibular lipoma',
  'intra-tumor hematoma',
  'Intracranial hematoma',
  'Intracranial hemorrhage',
  'Intranuclear Hyaline Inclusion Disease (INHID)',
  'intravascular bacteria',
  'Intravascular lymphoma',
  'Intraventricular Hemorrhage (IVH)',
  'IO gliosis RF',
  'IOH PART',
  'iron',
  'iron pigment',
  'ischemia',
  'ischemic AmygScl',
  'ischemic gemistrocytosis',
  'ischemic HpScl',
  'Ischemic infarct',
  'KLHL11 autoimmune encephalitis',
  'Kluver-Bucy',
  "Kuf's",
  'lac',
  'Lac',
  'lacs',
  'lacunar infarcts',
  'Lacune',
  'laminar',
  'laminar CtxScl',
  'laminar necrosis',
  'LB',
  'LB AD',
  'LB PD',
  'LB-like',
  'LBLHI',
  "Leigh's syndrome",
  'lesion',
  'leuk',
  'Leukemic meningitis',
  'leuko',
  'leuko sent to CDC Prion',
  'leukoaraiosis',
  'leukocytoclastic microangiopathy',
  'leukocytosis',
  'Leukoencephalopathy',
  'leukoencephalopathy spheroids',
  'leukomalacia',
  'Lewy Body Disease (LBD)',
  'Lewy like inclusions',
  'Lewy-like NCI',
  'Limbic',
  'Limbic-predominant Age-related TDP-43 Encephalopathy (LATE)',
  'lipohyalinosis',
  'lipoma',
  'LN',
  'long neurites',
  'Lubag',
  'Lyme',
  'lymphoid hyperplasia',
  'M',
  'malformation',
  'MCA thrombosis',
  'MCD',
  'MCI',
  'mega-corpus callosum',
  'melanosis cerebelli',
  'MELAS',
  'membrane',
  'membrane a',
  'Meningioma',
  'Meningitis',
  'meningitis c pigment',
  'meningoencephalitis',
  'Meningoencephalitis',
  'meningomyelocele',
  'Metastatic adenocarcinoma',
  'Metastatic breast cancer',
  'Metastatic cancer',
  'Metastatic colon cancer',
  'Metastatic lymphoma',
  'Metastatic melanoma',
  'Metastic carcinoma',
  'MGN encephalitis',
  'MI-MTR',
  'micro-CVA',
  'micro-CVAs',
  'microabscess',
  'microabscesses',
  'microadenoma',
  'microcystic neuroglial tumor',
  'microglial nodule encephalitis',
  'microgliosis',
  'Microhemorrhage',
  'Microinfarct',
  'Micrometastatic cancer',
  'microthrombi',
  'microvacuolation',
  'microvasculopathy with dystrophic calcification',
  'Mixed dementia',
  'mixed myopathy',
  'mixed neurodegenerative disease',
  'mixed PrP lesions',
  'MN',
  'Motor neuron disease',
  'MR',
  'MSA / PA',
  'MSA / PART',
  'MSA frontobulbar degen',
  'MSA NFT-like',
  'MSA w',
  'MSA-C',
  'MSA-P',
  'MSD',
  'MST',
  'MTA',
  'MTL sclerosis',
  'MTR path',
  'MTS',
  'Mucormycosis',
  'mulitofocal leukoencephalopathy with pigmented glia',
  'multi-infarct',
  'multi-infarct dementia',
  'multifocal hemorrhages',
  'Multifocal inflammatory leukoencephalopathy',
  'Multifocal leukoencephalopathy',
  'Multinucleated giant cell response',
  'Multiple Sclerosis (MS)',
  'Multiple System Atrophy (MSA)',
  'muscle atrophy',
  'mycotic aneurysm',
  'Mycotic basilar arteritis',
  'myelinolysis',
  'myelitis',
  'myelopathy',
  'NBIA',
  'nbM',
  'NFT',
  'NCI',
  'NCI in necrosis',
  'necrotic corpus callosum tumor',
  'neurogenic atrophy',
  'neuroma',
  'Neuronal ceroid lipofuscinosis',
  'Neuronal intermediate fillament inclusion disease (NIFID)',
  'neuropathy',
  'NFID-ANXA11',
  'NFT only',
  'NFT PART',
  'NFTD',
  'nigral NFT',
  'nigral-Lyusian atrophy',
  'nigrolyusial degeneration',
  'NIHID',
  'NLA',
  'no CTE',
  'no inclusions (FTLD-ni)',
  'No neurodegenerative changes',
  'No report issued',
  'non-prion spongioform encephalopathy',
  'Normal mitochondrial',
  'normal muscle',
  'Normal Pressure Hydrocephalus (NPH)',
  'not CTE',
  'Not evaluated at MCJ',
  'not in SoftPath',
  'obliterative vasculopathy',
  'OG',
  'Oligodendroglioma',
  'olivary gliosis',
  'olive Rosenthal',
  'Olivopontocerebellar atrophy (OPCA)',
  'OPCA>=SND',
  'OPCA>SND',
  'optic',
  'Optic Atrophy (OA)',
  'Optic Atrophy (OA) with LGN degeneration',
  'P62-negative',
  'pachymeningitis with MG cells',
  'PALATE',
  'Pallido-nigro-luysial atrophy (PNLA)',
  'pallidoluysial degen',
  'Pallidonigral degeneration',
  "Pallidonigral degeneration Perry's Disease",
  'pallidonigral PSD',
  'pallidotomy',
  'Pan- degeneration',
  'Paraneoplastic',
  "Parkinson's disease (PD)",
  'Parkinsonism-Dementia Complex of Guam (PDC)',
  'Pathological Aging (PA)',
  'PCA',
  'PDC',
  'PEP',
  'peripheral nerve NSP',
  'perivasculities',
  'perivasculitis',
  'Periventricular heterotopia',
  'periventriculitis',
  "Perry's Disease",
  'petechia',
  'Pick body like inclusion',
  'Pick body like NFT',
  "Pick's Disease",
  'pigment',
  'Pigment-Spheroid Degeneration (PSD)',
  'pineal cyst',
  'pineal hematoma',
  'Pituitary Adenoma',
  'pituitary amyloid',
  'pituitary apoplexy',
  'pituitary atrophy',
  'pituitary infarct',
  'pituitary infarcts',
  'Pituitary Microadenoma',
  'pituitary sclerosis',
  'plaque-like calcification',
  'plaques',
  'plasma cell meningitis',
  'PLS-FUS',
  'PLS-like',
  'PNLA-like',
  'polio',
  'Poliomyelitis',
  'Polyglucosan Body Disease',
  'Polygyria',
  'polymer emboli',
  'polymicrogyria',
  'pontie hemorrhage',
  'pontine CVA',
  'pontine glioma',
  'pontine hematoma',
  'possibleSRT',
  'post column degen',
  'post surg CPA',
  'post-op CVA',
  'post-polio',
  'post-surgical defect',
  'PPND',
  'PPRN octatpeptide repeat',
  'preamyloid',
  'PRP plaques',
  'Primary Age-Related Tauopathy (PART)',
  'Primary lateral sclerosis (PLS)',
  'Progressive Multifocal Leukoencephalopathy',
  'Progressive Supranuclear Palsy (PSP)',
  'PS',
  'PSD pallidum',
  'PSD PNLA',
  'pseudo-dementia',
  'Pseudo-dementia',
  'pseudo-tabes',
  'pseudodementia',
  'PSP /IOH/ degen/CAA',
  'PSP c astrocytic plaques',
  'PSP change',
  'PSP PNLA / AGD/SC',
  'PSP tauopathy',
  'PSP type',
  'PSP typical',
  'PSP-C',
  'PSP-like',
  'PSP-P',
  'PVL',
  'radiation leuko',
  'Rathke',
  'Report pending',
  'respirator brain',
  'RF encephalopathystatus-post meningioma',
  'RMSF',
  'Rosenthal fiber encephalopathy',
  'RT leuko',
  'rule out CTE',
  'ruptured aneurysm',
  'Sagittal sinus thrombosis',
  'Sarcoidosis meningovascular',
  'SBMA',
  'SC degeneration',
  'SC pre-HpScl',
  'SC toothpaste artifact',
  'SCA',
  'SCA3',
  'SCD',
  'Schwannoma',
  'Schwannosis',
  'sclerosis',
  'SCP',
  'SCP CVA',
  'SCVD',
  'secondary infarcts',
  'Seizures',
  'Senile Changes (SC)',
  'shunt adhesions',
  'sickle cell',
  'SLE microvasculopathy',
  'SMA',
  'SNAG',
  'SND',
  'SND+OPCA',
  'SND=OPCA',
  'SND>=OPCA',
  'SND>OPCA',
  'SOD1',
  'SP',
  'sp DBS',
  'sp frontal Bx',
  'sp pallidotomy',
  'sp thalamotomy',
  'spheroids',
  'Spinal muscular atrophy',
  'spinobulbar ALS',
  'Sporadic Fatal Insomnia (sFI)',
  'status',
  'status post DBS',
  'status post pituitary adenoma',
  'status post Rx meningioma',
  'status post VPS',
  'status post VPS for NPH',
  'spongiosis',
  'Striato-pallido-Luysial autoimmune encephalitis',
  'Subarachnoid Hemorrhage (SAH)',
  'Subdural Hemorrhage (SDH)',
  'subependymal lesion',
  'Subependymoma',
  'Subicular Sclerosis (SubScl)',
  'Superficial Siderosis',
  'synuclein TSA',
  'T-cell leukemia',
  'T-cell lymphoma',
  'TAG',
  'tapered neurites',
  'tau',
  'TDP-43 proteinopathy, non-FTLD',
  'Telangiectasia',
  'telangiectasia sclerotic pontine base',
  'testicular atrophy',
  'Testicular atrophy',
  'thal CVA',
  'thal gliosis',
  'thal lacune',
  'thalamic',
  'Thalamic dementia',
  'thalamic fusion',
  'thalamic gliosis',
  'thalamic inclusions',
  'thrombosis',
  'thyro',
  'thyroiditis',
  'TLBD',
  'Toferson Rx',
  'tonsil herniation',
  'toxoplasma encephalitis',
  'Toxoplasmosis',
  'TPP',
  'tract degen',
  'Transverse myelitis',
  'trauma',
  'Traumatic brain injury',
  'traumatic encephalomalacia',
  'traumatic hematomas',
  'traumatic hemorrhage',
  'TSE',
  'TSP',
  "TTP with MI's",
  'tumor emboli',
  'Type A',
  'Type B',
  'Type C',
  'ultrasound thalamomoty',
  'Unclassified tauopathy',
  'Unknown',
  'Unusual',
  'VA',
  'vacuolar',
  'vacuolation',
  'VaD',
  'vascular PD',
  'VaDAD',
  'Vascular',
  'Vascular Dementia',
  'vascular malformation',
  'vasculitis',
  'vasculopathy',
  'venous',
  'venous anomaly',
  'venous thrombosis',
  'Venous thrombosis',
  'ventriculitis',
  'venulitis',
  'Viral encephalitis',
  'VZV arteritis',
  'VZV vasculities meningoencephalitis',
  'w CVA',
  'watershed CVA',
  'Watershed infarct',
  'WBC plugs',
  "Wernicke's",
  'Weston-Hurst Syndrome',
  'white matter lesion',
  "white matter MI's",
  'WM artifactual microvacuolation',
  'WM CVAs',
  'WM infarcts',
  'WM ischemia',
  "WM MI's",
  'WM microvacuolation',
]

const DX_OPTS: MSOption<string>[] = DX_STRINGS.map(v => ({ value: v, label: v }))

const FilterComp: React.FC<Props> = ({ filterState, setFilterState, onReset, onSearch, onExpand, expanded }) => {
  const set = (patch: Partial<FilterState>) =>
    setFilterState(prev => ({ ...prev, ...patch }))

  const [orderRange, setOrderRange] = useState('')
  useEffect(() => {
    if (!filterState.diagnosisOrder) setOrderRange('')
  }, [filterState.diagnosisOrder])

  const showAdType = filterState.primaryDiagnosis?.includes("Alzheimer's Disease (AD)")
  const availableSecondaryOpts = DX_OPTS.filter(
    opt => !(filterState.primaryDiagnosis ?? []).includes(opt.value)
  )

  return (
    <div className={`filter-comp-box${expanded ? ' filter-comp-box--expanded' : ''}`}>

      <div className='filter-comp-header'>
        <span className='filter-comp-title'>Filters</span>
        <div className='filter-header-actions'>
          <button className='filter-search-btn' onClick={onSearch}>
            <svg width='12' height='12' viewBox='0 0 20 20' fill='none'>
              <circle cx='8.5' cy='8.5' r='5.5' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round'/>
              <path d='M13 13l4 4' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round'/>
            </svg>
            Search
          </button>
          {onExpand && (
            <div className='filter-clear-wrap'>
              <button className='filter-expand-btn' onClick={onExpand}>
                <svg width='13' height='13' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path d='M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round'/>
                </svg>
              </button>
              <span className='filter-clear-tooltip'>Expand filters</span>
            </div>
          )}
          <div className='filter-clear-wrap'>
            <button className='filter-clear-btn' onClick={() => { setFilterState({}); onReset?.() }}>
              <svg width='13' height='14' viewBox='0 0 13 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M1 3.5h11M4.5 3.5V2.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M5.5 6.5v4M7.5 6.5v4M2 3.5l.7 7.6A1 1 0 0 0 3.7 12h5.6a1 1 0 0 0 1-.9L11 3.5' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round'/>
              </svg>
            </button>
            <span className='filter-clear-tooltip'>Clear filters</span>
          </div>
        </div>
      </div>

      <div className='filter-comp-sections'>

      <div className='filter-id-wrap'>
        <input className='filter-comp-input' placeholder='Search IDs (NPID, Autopsy, Mayo, NACC…)'
          value={filterState.idSearch ?? ''}
          onChange={e => set({ idSearch: e.target.value || undefined })} />
        <div className='filter-id-tooltip'>
          <span className='filter-id-tooltip-title'>Search by</span>
          <span>NPID</span>
          <span>Autopsy ID</span>
          <span>Mayo Clinic ID</span>
          <span>NACC PTID</span>
          <span>PTNUM</span>
        </div>
      </div>

      <div className='filter-section'>
        <span className='filter-section-label'>Demographics</span>

        <input className='filter-comp-input' placeholder='Age ranges e.g. 50-55;70-80'
          value={filterState.ageRanges ?? ''}
          onChange={e => set({ ageRanges: e.target.value || undefined })} />

        <div className='filter-check-row'>
          {SEX_OPTS.map(opt => (
            <label key={opt.value} className='filter-check-label'>
              <input
                type='radio'
                name='sex'
                checked={filterState.sex === opt.value}
                onChange={() => set({ sex: opt.value })}
              />
              {opt.label}
            </label>
          ))}
          {filterState.sex && (
            <label className='filter-check-label'>
              <input type='radio' name='sex' checked={false} onChange={() => set({ sex: undefined })} />
              Any
            </label>
          )}
        </div>

        <MultiSelect<string>
          placeholder='Race (any)'
          options={RACE_OPTS}
          selected={filterState.race ?? []}
          onChange={v => set({ race: v.length ? v : undefined })}
        />

        <MultiSelect<string>
          placeholder='Study Source (any)'
          options={STUDY_OPTS}
          selected={filterState.studySource ?? []}
          onChange={v => set({ studySource: v.length ? v : undefined })}
        />
      </div>

      <div className='filter-section'>
        <span className='filter-section-label'>Diagnosis</span>

        <MultiSelect<string>
          placeholder='Primary Diagnosis (any)'
          options={DX_OPTS}
          selected={filterState.primaryDiagnosis ?? []}
          onChange={v => set({ primaryDiagnosis: v.length ? v : undefined, ad_type: undefined })}
        />

        {showAdType && (
          <MultiSelect<AlzheimersType>
            placeholder='AD Subtype (any)'
            options={AD_TYPE_OPTS}
            selected={filterState.ad_type ?? []}
            onChange={v => set({ ad_type: v.length ? v : undefined })}
          />
        )}

        <MultiSelect<string>
          placeholder='Secondary Diagnosis (any)'
          options={availableSecondaryOpts}
          selected={filterState.secondaryDiagnoses ?? []}
          onChange={v => set({ secondaryDiagnoses: v.length ? v : undefined })}
        />
      </div>

      <div className='filter-section'>
        <span className='filter-section-label'>Diagnosis Order</span>
        <MultiSelect<string>
          placeholder='Select diagnosis'
          options={DX_OPTS}
          closeOnSelect
          selected={filterState.diagnosisOrder?.diagnosis ? [filterState.diagnosisOrder.diagnosis] : []}
          onChange={v => {
            const dx = v.find(x => x !== filterState.diagnosisOrder?.diagnosis) ?? v[0]
            if (!dx) { set({ diagnosisOrder: undefined }); setOrderRange(''); return }
            const m = orderRange.match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/)
            const min = m ? Math.max(1, parseInt(m[1])) : 1
            const max = m ? Math.max(min, parseInt(m[2] ?? m[1])) : 99
            set({ diagnosisOrder: { diagnosis: dx, min, max } })
          }}
        />
        {filterState.diagnosisOrder?.diagnosis && (
          <input
            className='filter-comp-input'
            placeholder='Order range (e.g. 1–3)'
            value={orderRange}
            onChange={e => {
              const raw = e.target.value
              setOrderRange(raw)
              if (!raw.trim()) {
                set({ diagnosisOrder: { diagnosis: filterState.diagnosisOrder!.diagnosis, min: 1, max: 99 } })
                return
              }
              const m = raw.match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/)
              if (m) {
                const min = Math.max(1, parseInt(m[1]))
                const max = Math.max(min, parseInt(m[2] ?? m[1]))
                set({ diagnosisOrder: { diagnosis: filterState.diagnosisOrder!.diagnosis, min, max } })
              }
            }}
          />
        )}
      </div>

      <div className='filter-section'>
        <span className='filter-section-label'>Neuropathology</span>

        <div className='filter-group'>
          <span className='filter-group-label'>Thal Phase</span>
          <MultiSelect<ThalPhase>
            placeholder='Any phase'
            options={THAL_OPTS}
            selected={filterState.thalPhases ?? []}
            onChange={v => set({ thalPhases: v.length ? v : undefined })}
          />
        </div>

        <div className='filter-group'>
          <span className='filter-group-label'>Braak Stage</span>
          <MultiSelect<BraakStage>
            placeholder='Any stage'
            options={BRAAK_OPTS}
            selected={filterState.braakStages ?? []}
            onChange={v => set({ braakStages: v.length ? v : undefined })}
          />
        </div>

        <div className='filter-group'>
          <span className='filter-group-label'>CERAD</span>
          <MultiSelect<CeradScore>
            placeholder='Any score'
            options={CERAD_OPTS}
            selected={filterState.ceradScores ?? []}
            onChange={v => set({ ceradScores: v.length ? v : undefined })}
          />
        </div>
      </div>

      <div className='filter-section'>
        <span className='filter-section-label'>Genetics</span>

        <MultiSelect<ApoeGenotype>
          placeholder='APOE (any)'
          options={APOE_OPTS}
          selected={filterState.apoe ?? []}
          onChange={v => set({ apoe: v.length ? v : undefined })}
        />

        <MultiSelect<MaptHaplotype>
          placeholder='MAPT (any)'
          options={MAPT_OPTS}
          selected={filterState.mapt ?? []}
          onChange={v => set({ mapt: v.length ? v : undefined })}
        />
      </div>

      <div className='filter-section'>
        <span className='filter-section-label'>Tissue</span>
        <MultiSelect<string>
          placeholder='Tissue availability (any)'
          options={TISSUE_OPTS}
          selected={filterState.tissueAvailable ?? []}
          onChange={v => set({ tissueAvailable: v.length ? v : undefined })}
        />
      </div>

      </div>{/* filter-comp-sections */}
    </div>
  )
}

export default FilterComp
