import { DEFAULT_HOSPITAL_PROFILE, getInitialSeedRecords } from '../seedData';
import { HospitalProfile, IcraRecord, MasterCatalogItem } from '../types';
import { calculateIcra } from '../constants';
import { getInitialMasterCatalog } from '../masterCatalog';

const STORAGE_KEY_RECORDS = 'siloam_icra_records_v1';
const STORAGE_KEY_PROFILE = 'siloam_icra_profile_v1';
const STORAGE_KEY_DRAFT = 'siloam_icra_draft_v1';
const STORAGE_KEY_CATALOG = 'siloam_icra_catalog_v1';

export function getStoredProfile(): HospitalProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      return { ...DEFAULT_HOSPITAL_PROFILE, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to read profile', e);
  }
  return DEFAULT_HOSPITAL_PROFILE;
}

export function saveStoredProfile(profile: HospitalProfile): void {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
}

export function getStoredRecords(): IcraRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read records', e);
  }
  // Initialize with seed data
  const initial = getInitialSeedRecords();
  saveStoredRecords(initial);
  return initial;
}

export function saveStoredRecords(records: IcraRecord[]): void {
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
}

export function resetToSeedData(): IcraRecord[] {
  const initial = getInitialSeedRecords();
  saveStoredRecords(initial);
  return initial;
}

export function clearAllRecords(): void {
  saveStoredRecords([]);
}

export function getStoredDraft(): Partial<IcraRecord> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load draft', e);
  }
  return null;
}

export function saveStoredDraft(draft: Partial<IcraRecord> | null): void {
  if (!draft) {
    localStorage.removeItem(STORAGE_KEY_DRAFT);
  } else {
    localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
  }
}

/**
 * Calculates dense rankings per (tahun + unit) grouping.
 * The highest scores receive rank 1. Tied scores receive the exact same rank.
 */
export function calculateDenseRanks(records: IcraRecord[]): Record<string, number> {
  const groups: Record<string, IcraRecord[]> = {};
  records.forEach(r => {
    const key = `${r.tahun}|${r.unit}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  const rankMap: Record<string, number> = {};

  Object.values(groups).forEach(groupList => {
    const distinctScores = Array.from(new Set(groupList.map(r => calculateIcra(r).score))).sort(
      (a, b) => b - a
    );
    groupList.forEach(r => {
      const score = calculateIcra(r).score;
      rankMap[r.id] = distinctScores.indexOf(score) + 1;
    });
  });

  return rankMap;
}

export function getDistinctYears(records: IcraRecord[]): number[] {
  const ys = Array.from(new Set(records.map(r => Number(r.tahun)))).filter(Boolean);
  return ys.sort((a, b) => b - a);
}

export function getDistinctUnits(records: IcraRecord[]): string[] {
  const us = Array.from(new Set(records.map(r => r.unit))).filter(Boolean);
  return us.sort((a, b) => a.localeCompare(b));
}

export function getStoredMasterCatalog(): MasterCatalogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATALOG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read master catalog', e);
  }
  const initial = getInitialMasterCatalog();
  saveStoredMasterCatalog(initial);
  return initial;
}

export function saveStoredMasterCatalog(items: MasterCatalogItem[]): void {
  localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(items));
}

export function resetMasterCatalogToSeed(): MasterCatalogItem[] {
  const initial = getInitialMasterCatalog();
  saveStoredMasterCatalog(initial);
  return initial;
}

export function getDistinctSubgroups(
  catalog: MasterCatalogItem[],
  records?: IcraRecord[]
): string[] {
  const fromCatalog = catalog.map(c => c.subgrup?.trim()).filter(Boolean);
  const fromRecords = (records || []).map(r => r.subgrup?.trim()).filter(Boolean);
  const unique = Array.from(new Set([...fromCatalog, ...fromRecords]));
  return unique.sort((a, b) => a.localeCompare(b));
}

export function getDistinctMasterGroups(catalog: MasterCatalogItem[]): string[] {
  const groups = Array.from(new Set(catalog.map(c => c.grup?.trim()))).filter(Boolean);
  return groups.sort((a, b) => a.localeCompare(b));
}
