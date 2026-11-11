import * as XLSX from 'xlsx';
import { calculateIcra } from '../constants';
import { HospitalProfile, IcraRecord } from '../types';
import { calculateDenseRanks } from './storage';

export function exportToExcel(
  records: IcraRecord[],
  profile: HospitalProfile,
  filenamePrefix: string = 'ICRA_Siloam'
): void {
  const wb = XLSX.utils.book_new();
  const ranks = calculateDenseRanks(records);

  // 1. Sheet: Scoring ICRA
  const scoringData = records.map(r => {
    const calc = calculateIcra(r);
    const rankNum = ranks[r.id];
    const prioDisplay = rankNum ? (rankNum <= 3 ? `P${rankNum} (Utama)` : rankNum) : '-';
    return {
      'Prioritas': prioDisplay,
      'Tahun': r.tahun,
      'Unit / Area': r.unit,
      'Grup Risiko': r.grup,
      'Sub Grup': r.subgrup || '-',
      'Potensial Risiko / Masalah': r.masalah,
      'Likelihood (L)': r.L,
      'Impact (I)': r.I,
      'Current System (S)': r.S,
      'Skor L × I': calc.li,
      'Skor ICRA (L×I×S)': calc.score,
      'Tingkat Risiko': calc.level,
      'Status': r.status || 'Belum'
    };
  });
  const wsScoring = XLSX.utils.json_to_sheet(scoringData);
  XLSX.utils.book_append_sheet(wb, wsScoring, 'Scoring ICRA');

  // 2. Sheet: Rencana Tindak Lanjut
  const actionPlanData = records
    .filter(r => ranks[r.id] <= 3 || r.rencana || r.tujuan || r.pic)
    .map(r => {
      const calc = calculateIcra(r);
      return {
        'Prioritas': ranks[r.id] || '-',
        'Tahun': r.tahun,
        'Unit': r.unit,
        'Potensial Risiko': r.masalah,
        'Skor ICRA': calc.score,
        'Tingkat': calc.level,
        'Tujuan': r.tujuan || '',
        'Indikator Terukur': r.indikator || '',
        'Strategi / Rencana Tindak Lanjut': r.rencana || '',
        'PIC': r.pic || '',
        'Target Waktu': r.target || '',
        'Bukti Evaluasi': r.bukti || ''
      };
    });
  const wsAction = XLSX.utils.json_to_sheet(actionPlanData);
  XLSX.utils.book_append_sheet(wb, wsAction, 'Rencana Tindak Lanjut');

  // 3. Sheet: Rekap per Grup
  const groupMap: Record<string, { total: number; significant: number; high: number; moderate: number; low: number; maxScore: number }> = {};
  records.forEach(r => {
    const g = r.grup || 'Lainnya';
    const c = calculateIcra(r);
    if (!groupMap[g]) {
      groupMap[g] = { total: 0, significant: 0, high: 0, moderate: 0, low: 0, maxScore: 0 };
    }
    groupMap[g].total += 1;
    if (c.level === 'Significant') groupMap[g].significant += 1;
    if (c.level === 'High') groupMap[g].high += 1;
    if (c.level === 'Moderate') groupMap[g].moderate += 1;
    if (c.level === 'Low') groupMap[g].low += 1;
    if (c.score > groupMap[g].maxScore) groupMap[g].maxScore = c.score;
  });

  const rekapData = Object.entries(groupMap).map(([grup, stats]) => ({
    'Grup Risiko': grup,
    'Total Risiko': stats.total,
    'Significant (≥15)': stats.significant,
    'High (10-14)': stats.high,
    'Moderate (5-9)': stats.moderate,
    'Low (1-4)': stats.low,
    'Skor Tertinggi': stats.maxScore
  }));
  const wsRekap = XLSX.utils.json_to_sheet(rekapData);
  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekap per Grup');

  // 4. Sheet: Data (Format Raw untuk Re-import)
  const rawExportData = records.map(r => {
    const calc = calculateIcra(r);
    return {
      'ID': r.id,
      'Tahun': r.tahun,
      'Unit': r.unit,
      'Grup': r.grup,
      'Subgrup': r.subgrup,
      'Masalah': r.masalah,
      'L': r.L,
      'I': r.I,
      'S': r.S,
      'Skor_LI': calc.li,
      'Skor_ICRA': calc.score,
      'Tingkat': calc.level,
      'Status': r.status || 'Belum',
      'Tujuan': r.tujuan || '',
      'Indikator': r.indikator || '',
      'Rencana': r.rencana || '',
      'PIC': r.pic || '',
      'Target': r.target || '',
      'Bukti': r.bukti || '',
      'Keterangan': r.ket || ''
    };
  });
  const wsData = XLSX.utils.json_to_sheet(rawExportData);
  XLSX.utils.book_append_sheet(wb, wsData, 'Data');

  // Trigger download
  const dateStr = new Date().toISOString().slice(0, 10);
  const finalName = `${filenamePrefix}_${dateStr}.xlsx`;
  XLSX.writeFile(wb, finalName);
}

export function parseExcelFile(file: File): Promise<Partial<IcraRecord>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let targetSheetName = workbook.SheetNames.find(s => s.toLowerCase() === 'data');
        if (!targetSheetName) {
          targetSheetName = workbook.SheetNames[0];
        }
        
        const worksheet = workbook.Sheets[targetSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);

        const results: Partial<IcraRecord>[] = [];
        const now = new Date().toISOString();

        for (const row of jsonRows) {
          // Normalize column lookups
          const getVal = (...keys: string[]) => {
            for (const k of keys) {
              for (const rowKey of Object.keys(row)) {
                if (rowKey.toLowerCase().replace(/[\s_\-]/g, '') === k.toLowerCase().replace(/[\s_\-]/g, '')) {
                  return row[rowKey];
                }
              }
            }
            return undefined;
          };

          const masalah = getVal('masalah', 'potensialrisiko', 'potensialrisikomasalah', 'problem', 'event');
          if (!masalah) continue;

          const L = Number(getVal('l', 'likelihood', 'probability')) || 1;
          const I = Number(getVal('i', 'impact', 'consequence', 'consequences')) || 1;
          const S = Number(getVal('s', 'currentsystem', 'sistem', 'currsys')) || 1;

          results.push({
            id: getVal('id') || `imp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            tahun: Number(getVal('tahun', 'year')) || new Date().getFullYear(),
            unit: String(getVal('unit', 'area', 'departemen') || 'Seluruh Departemen'),
            grup: String(getVal('grup', 'kategori', 'gruprisiko') || 'Umum'),
            subgrup: String(getVal('subgrup', 'subkategori') || ''),
            masalah: String(masalah),
            L: Math.max(1, Math.min(5, L)),
            I: Math.max(1, Math.min(5, I)),
            S: Math.max(1, Math.min(5, S)),
            status: getVal('status') || 'Belum',
            tujuan: getVal('tujuan') || '',
            indikator: getVal('indikator') || '',
            rencana: getVal('rencana', 'strategi', 'rencanatindaklanjut') || '',
            pic: getVal('pic') || '',
            target: getVal('target', 'targetwaktu') || '',
            bukti: getVal('bukti', 'buktievaluasi') || '',
            ket: getVal('keterangan', 'ket') || '',
            createdAt: now,
            updatedAt: now
          });
        }

        resolve(results);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = err => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
