import React, { useState, useMemo, useRef } from 'react';
import { HospitalProfile, IcraRecord, RiskLevelKey } from '../types';
import { calculateIcra, RISK_LEVELS, RISK_LEVEL_MAP } from '../constants';
import { calculateDenseRanks, getDistinctUnits, getDistinctYears } from '../utils/storage';
import { exportToExcel, parseExcelFile } from '../utils/excel';
import {
  Search,
  FileSpreadsheet,
  Upload,
  Edit2,
  Trash2,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DataViewProps {
  records: IcraRecord[];
  profile: HospitalProfile;
  onEditRecord: (id: string) => void;
  onDeleteRecord: (id: string) => void;
  onImportRecords: (newRecords: Partial<IcraRecord>[]) => void;
}

type SortField = 'prio' | 'tahun' | 'unit' | 'grup' | 'masalah' | 'L' | 'I' | 'S' | 'li' | 'score';

export const DataView: React.FC<DataViewProps> = ({
  records,
  profile,
  onEditRecord,
  onDeleteRecord,
  onImportRecords
}) => {
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [filterLevel, setFilterLevel] = useState<RiskLevelKey | ''>('');
  const [sortField, setSortField] = useState<SortField>('prio');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const distinctYears = useMemo(() => getDistinctYears(records), [records]);
  const distinctUnits = useMemo(() => getDistinctUnits(records), [records]);
  const allDenseRanks = useMemo(() => calculateDenseRanks(records), [records]);

  // Filtering
  const filtered = useMemo(() => {
    return records.filter(r => {
      if (filterYear && String(r.tahun) !== filterYear) return false;
      if (filterUnit && r.unit !== filterUnit) return false;
      const { level } = calculateIcra(r);
      if (filterLevel && level !== filterLevel) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const text = `${r.masalah} ${r.grup} ${r.subgrup} ${r.unit} ${r.rencana} ${r.pic} ${r.ket}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [records, filterYear, filterUnit, filterLevel, search]);

  // Sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'prio') {
        valA = allDenseRanks[a.id] ?? 999;
        valB = allDenseRanks[b.id] ?? 999;
      } else if (sortField === 'score') {
        valA = calculateIcra(a).score;
        valB = calculateIcra(b).score;
      } else if (sortField === 'li') {
        valA = a.L * a.I;
        valB = b.L * b.I;
      } else {
        valA = a[sortField];
        valB = b[sortField];
      }

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filtered, sortField, sortAsc, allDenseRanks]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'masalah' || field === 'unit'); // default asc for text, desc for scores
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('Membaca file Excel...');
      const imported = await parseExcelFile(file);
      if (imported.length === 0) {
        alert('Tidak ada baris data risiko yang valid ditemukan dalam file Excel.');
        setImportStatus(null);
        return;
      }

      onImportRecords(imported);
      setImportStatus(`Berhasil mengimpor ${imported.length} data risiko dari Excel!`);
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err: any) {
      alert(`Gagal mengimpor file Excel: ${err?.message || 'Format tidak didukung'}`);
      setImportStatus(null);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0f4c5c]">
            Database &amp; Arsip Laporan
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
            Data Penilaian ICRA &amp; Excel
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola, telusuri, ekspor ke template laporan Excel, atau impor dokumen dari departemen
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToExcel(filtered, profile, 'ICRA_Filtered')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f4c5c] hover:bg-[#13677b] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh Excel (Sesuai Filter)</span>
          </button>

          <button
            onClick={() => exportToExcel(records, profile, 'ICRA_AllData')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Excel Semua Data ({records.length})</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.xlsm"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Impor Excel</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative sm:col-span-2 md:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Cari masalah, unit, PIC, dll..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
            />
          </div>

          {/* Filter Year */}
          <div>
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none"
            >
              <option value="">Semua Tahun</option>
              {distinctYears.map(y => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Unit */}
          <div>
            <select
              value={filterUnit}
              onChange={e => setFilterUnit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none"
            >
              <option value="">Semua Unit</option>
              {distinctUnits.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Risk Level */}
          <div>
            <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none"
            >
              <option value="">Semua Tingkat Risiko</option>
              {RISK_LEVELS.map(l => (
                <option key={l.key} value={l.key}>
                  {l.label} ({l.range})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Menampilkan <b>{sorted.length}</b> dari <b>{records.length}</b> total rekaman risiko
          </span>
          {(search || filterYear || filterUnit || filterLevel) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterYear('');
                setFilterUnit('');
                setFilterLevel('');
              }}
              className="text-[#0f4c5c] font-semibold hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('prio')}
                  className="py-2.5 px-3 text-center w-14 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Prio</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tahun')}
                  className="py-2.5 px-2 text-center w-16 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Tahun</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unit')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Unit</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('grup')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Grup / Kategori</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('masalah')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 min-w-[220px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Potensial Risiko / Masalah</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('L')}
                  className="py-2.5 px-2 text-center w-10 cursor-pointer hover:bg-slate-100"
                >
                  L
                </th>
                <th
                  onClick={() => handleSort('I')}
                  className="py-2.5 px-2 text-center w-10 cursor-pointer hover:bg-slate-100"
                >
                  I
                </th>
                <th
                  onClick={() => handleSort('li')}
                  className="py-2.5 px-2 text-center w-12 cursor-pointer hover:bg-slate-100"
                >
                  L&times;I
                </th>
                <th className="py-2.5 px-3 text-center">Tingkat</th>
                <th
                  onClick={() => handleSort('S')}
                  className="py-2.5 px-2 text-center w-10 cursor-pointer hover:bg-slate-100"
                >
                  S
                </th>
                <th
                  onClick={() => handleSort('score')}
                  className="py-2.5 px-2 text-center w-16 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Skor</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length > 0 ? (
                sorted.map(r => {
                  const calc = calculateIcra(r);
                  const prio = allDenseRanks[r.id] ?? '-';
                  const levelInfo = RISK_LEVEL_MAP[calc.level];
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-[10px] ${
                            typeof prio === 'number' && prio <= 3
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {prio}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center font-medium text-slate-700">{r.tahun}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{r.unit}</td>
                      <td className="py-2 px-3 text-slate-500 max-w-[180px] truncate">
                        {r.subgrup ? `${r.subgrup} • ` : ''}
                        {r.grup}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">
                        <div>{r.masalah}</div>
                        {r.rencana && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-md">
                            ↳ Rencana: {r.rencana}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center font-semibold text-slate-700">{r.L}</td>
                      <td className="py-2 px-2 text-center font-semibold text-slate-700">{r.I}</td>
                      <td className="py-2 px-2 text-center font-bold text-slate-700">{calc.li}</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          style={{
                            backgroundColor: levelInfo.bgColor,
                            color: levelInfo.textColor,
                            borderColor: levelInfo.borderColor
                          }}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block"
                        >
                          {calc.level}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center font-semibold text-slate-700">{r.S}</td>
                      <td className="py-2 px-2 text-center font-black text-[#0f4c5c] text-sm font-mono">
                        {calc.score}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditRecord(r.id)}
                            title="Edit Data"
                            className="p-1 text-slate-500 hover:text-[#0f4c5c] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus risiko "${r.masalah}"?`)) {
                                onDeleteRecord(r.id);
                              }
                            }}
                            title="Hapus Data"
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-xs text-slate-400">
                    Tidak ada data yang cocok dengan kriteria filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
