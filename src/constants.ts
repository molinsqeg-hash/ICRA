import { RiskLevelInfo, RiskLevelKey } from './types';

export const SCORING_CRITERIA = {
  L: {
    name: 'Likelihood / Probability',
    short: 'Likelihood',
    lbl: {
      5: 'Expect it',
      4: 'Likely',
      3: 'Maybe',
      2: 'Rare',
      1: 'Never'
    } as Record<number, string>,
    desc: {
      5: 'Sering (>6–12x / tahun)',
      4: 'Agak sering (5–6x / tahun)',
      3: 'Kadang-kadang (3–4x / tahun)',
      2: 'Jarang (1–2x / tahun)',
      1: 'Tidak pernah'
    } as Record<number, string>
  },
  I: {
    name: 'Consequences / Impact',
    short: 'Impact',
    lbl: {
      5: 'Catastrophic loss',
      4: 'Serious loss',
      3: 'Prolonged LOS',
      2: 'Moderate',
      1: 'Minimal'
    } as Record<number, string>,
    desc: {
      5: 'Catastrophic loss (life/limb/function/financial/legal) – kematian yang tidak berhubungan dengan penyakit',
      4: 'Serious loss (function/financial/legal) – cedera berat, cacat, kehilangan fungsi irreversible',
      3: 'Prolonged length of stay – cedera sedang, fungsi berkurang reversible, memperpanjang hari rawat',
      2: 'Moderate clinical/financial – cedera ringan, dapat diatasi dengan pertolongan sederhana',
      1: 'Minimal clinical/financial – tidak ada cedera'
    } as Record<number, string>
  },
  S: {
    name: 'Current System (Kesiapan Sistem)',
    short: 'Current System',
    lbl: {
      5: 'None',
      4: 'Poor',
      3: 'Fair',
      2: 'Good',
      1: 'Solid'
    } as Record<number, string>,
    desc: {
      5: 'Peraturan tidak ada',
      4: 'Peraturan ada, fasilitas tidak ada, tidak dilaksanakan',
      3: 'Peraturan ada, fasilitas ada, tidak dilaksanakan',
      2: 'Peraturan ada, fasilitas ada, tidak selalu dilaksanakan',
      1: 'Peraturan ada, fasilitas ada, dilaksanakan'
    } as Record<number, string>
  }
};

export const RISK_LEVELS: RiskLevelInfo[] = [
  {
    key: 'Significant',
    label: 'Significant',
    range: '≥ 15',
    minScore: 15,
    maxScore: 125,
    color: '#d03b3b',
    bgColor: '#fbeae8',
    borderColor: '#e7b4b4',
    textColor: '#991b1b',
    action: 'Rencana aksi segera; perlu perhatian Direksi (BOD). Bila tidak dapat diterima, pertimbangkan penghentian kegiatan.'
  },
  {
    key: 'High',
    label: 'High',
    range: '10–14',
    minScore: 10,
    maxScore: 14,
    color: '#ec835a',
    bgColor: '#fff3ec',
    borderColor: '#f5c6b0',
    textColor: '#c2410c',
    action: 'Tindakan lanjutan (mungkin mendesak, butuh sumber daya besar) untuk menurunkan risiko.'
  },
  {
    key: 'Moderate',
    label: 'Moderate',
    range: '5–9',
    minScore: 5,
    maxScore: 9,
    color: '#fab219',
    bgColor: '#fffbeb',
    borderColor: '#fcd34d',
    textColor: '#b45309',
    action: 'Tindakan lanjutan untuk menurunkan risiko dengan biaya proporsional.'
  },
  {
    key: 'Low',
    label: 'Low',
    range: '1–4',
    minScore: 1,
    maxScore: 4,
    color: '#0ca30c',
    bgColor: '#eefcee',
    borderColor: '#a3e6a3',
    textColor: '#15803d',
    action: 'Tidak perlu kontrol tambahan; kontrol yang ada tetap efektif.'
  }
];

export const RISK_LEVEL_MAP: Record<RiskLevelKey, RiskLevelInfo> = Object.fromEntries(
  RISK_LEVELS.map(l => [l.key, l])
) as Record<RiskLevelKey, RiskLevelInfo>;

export function getRiskLevel(score: number): RiskLevelKey {
  if (score >= 15) return 'Significant';
  if (score >= 10) return 'High';
  if (score >= 5) return 'Moderate';
  return 'Low';
}

export function calculateIcra(record: { L: number; I: number; S: number }) {
  const li = record.L * record.I;
  const score = li * record.S;
  const level = getRiskLevel(score);
  return { li, score, level };
}

export const PPI_GROUPS = [
  'Infeksi-infeksi yang penting secara epidemiologis (surveilans)',
  'Proses kegiatan di area-area yang berisiko tinggi terjadinya infeksi',
  'Pelayanan yang menggunakan peralatan yang berisiko infeksi',
  'Prosedur/tindakan-tindakan berisiko tinggi',
  'Pelayanan distribusi linen bersih dan kotor',
  'Pengelolaan linen/laundri',
  'Pelayanan sterilisasi alat',
  'Kebersihan permukaan dan lingkungan',
  'Pengelolaan sampah',
  'Penyediaan makanan',
  'Pengelolaan kamar jenazah',
  'Kegagalan tindakan pencegahan',
  'Renovasi dan konstruksi',
  'Edukasi staff, pasien dan pengunjung'
];

export const DEFAULT_UNITS = [
  'Seluruh Departemen',
  'RS SHTB (Prioritisasi)',
  'IPD',
  'OPD',
  'ICU',
  'OT',
  'CSSD',
  'NICU',
  'Hemodialisa',
  'HD',
  'Endoskopi',
  'Laboratorium',
  'Farmasi',
  'Radiologi',
  'Dental',
  'Emergency',
  'Kitchen',
  'Linen dan laundry',
  'Limbah B3',
  'Mortuary',
  'MCU',
  'Office',
  'Fisioterapi',
  'Tenant'
];
