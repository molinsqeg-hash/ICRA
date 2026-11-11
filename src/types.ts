export interface IcraRecord {
  id: string;
  seq: number;
  tahun: number;
  unit: string;
  grup: string;
  subgrup: string;
  masalah: string;
  L: number; // 1 - 5
  I: number; // 1 - 5
  S: number; // 1 - 5
  status?: 'Belum' | 'Proses' | 'Selesai';
  tujuan?: string;
  indikator?: string;
  rencana?: string;
  pic?: string;
  target?: string;
  bukti?: string;
  ket?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RiskLevelKey = 'Significant' | 'High' | 'Moderate' | 'Low';

export interface RiskLevelInfo {
  key: RiskLevelKey;
  label: string;
  range: string;
  minScore: number;
  maxScore: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  action: string;
}

export interface HospitalProfile {
  hospital: string;
  year: number;
  maker: string;
  makerRole: string;
  chair: string;
  chairRole: string;
  director: string;
  directorRole: string;
}

export interface CalculationResult {
  li: number;
  score: number;
  level: RiskLevelKey;
}

export interface MasterItem {
  grup: string;
  subgrup: string;
  masalah: string;
}

export interface MasterCatalogItem {
  id: string;
  grup: string;
  subgrup: string;
  masalah: string;
  keterangan?: string;
  unitTerkait?: string;
}
