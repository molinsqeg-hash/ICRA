import React, { useState, useMemo } from 'react';
import { HospitalProfile, IcraRecord, RiskLevelKey } from '../types';
import { calculateIcra, RISK_LEVELS, RISK_LEVEL_MAP, SCORING_CRITERIA } from '../constants';
import { calculateDenseRanks, getDistinctUnits, getDistinctYears } from '../utils/storage';
import { exportToExcel } from '../utils/excel';
import {
  Compass,
  Search,
  Filter,
  Layers,
  LayoutGrid,
  Table,
  BarChart3,
  CheckCircle2,
  Clock,
  CircleDot,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  FileSpreadsheet,
  Flame,
  Award,
  Sparkles,
  X
} from 'lucide-react';

interface DataExplorerViewProps {
  records: IcraRecord[];
  profile: HospitalProfile;
  onEditRecord: (id: string) => void;
  onUpdateStatus?: (id: string, newStatus: 'Belum' | 'Proses' | 'Selesai') => void;
}

type ExplorerMode = 'cards' | 'pivot' | 'distribution' | 'status';

export const DataExplorerView: React.FC<DataExplorerViewProps> = ({
  records,
  profile,
  onEditRecord,
  onUpdateStatus
}) => {
  const [activeMode, setActiveMode] = useState<ExplorerMode>('cards');

  // Filters
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterSubgroup, setFilterSubgroup] = useState('');
  const [filterLevel, setFilterLevel] = useState<RiskLevelKey | ''>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Selected item for deep inspection
  const [inspectedItem, setInspectedItem] = useState<IcraRecord | null>(null);

  // Distinct values for filters
  const distinctYears = useMemo(() => getDistinctYears(records), [records]);
  const distinctUnits = useMemo(() => getDistinctUnits(records), [records]);
  const distinctGroups = useMemo(() => {
    return Array.from(new Set(records.map(r => r.grup?.trim()))).filter(Boolean).sort();
  }, [records]);

  const distinctSubgroups = useMemo(() => {
    let subset = records;
    if (filterGroup) subset = subset.filter(r => r.grup === filterGroup);
    return Array.from(new Set(subset.map(r => r.subgrup?.trim()))).filter(Boolean).sort();
  }, [records, filterGroup]);

  // Dense rankings
  const ranks = useMemo(() => calculateDenseRanks(records), [records]);

  // Filtered dataset
  const exploredData = useMemo(() => {
    return records.filter(r => {
      if (filterYear && String(r.tahun) !== filterYear) return false;
      if (filterUnit && r.unit !== filterUnit) return false;
      if (filterGroup && r.grup !== filterGroup) return false;
      if (filterSubgroup && r.subgrup !== filterSubgroup) return false;
      if (filterStatus && (r.status || 'Belum') !== filterStatus) return false;

      const calc = calculateIcra(r);
      if (filterLevel && calc.level !== filterLevel) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const text = `${r.masalah} ${r.subgrup} ${r.grup} ${r.unit} ${r.rencana || ''} ${r.pic || ''} ${r.ket || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [records, filterYear, filterUnit, filterGroup, filterSubgroup, filterLevel, filterStatus, search]);

  // Aggregated KPI Stats
  const stats = useMemo(() => {
    if (exploredData.length === 0) {
      return { total: 0, avgScore: 0, maxScore: 0, priorityCount: 0, completedPct: 0 };
    }
    const scores = exploredData.map(r => calculateIcra(r).score);
    const sum = scores.reduce((a, b) => a + b, 0);
    const max = Math.max(...scores);
    const avg = Math.round((sum / exploredData.length) * 10) / 10;
    const priorityCount = exploredData.filter(r => (ranks[r.id] || 999) <= 3).length;
    const completedCount = exploredData.filter(r => r.status === 'Selesai').length;
    const completedPct = Math.round((completedCount / exploredData.length) * 100);

    return {
      total: exploredData.length,
      avgScore: avg,
      maxScore: max,
      priorityCount,
      completedPct
    };
  }, [exploredData, ranks]);

  // Pivot Data: Group by Unit & Sub Kategori
  const pivotData = useMemo(() => {
    const unitsInView = Array.from(new Set(exploredData.map(r => r.unit))).sort();
    const subInView = Array.from(new Set(exploredData.map(r => r.subgrup || 'Umum'))).sort();

    const matrix: Record<string, Record<string, { count: number; maxScore: number; level: RiskLevelKey }>> = {};

    unitsInView.forEach(u => {
      matrix[u] = {};
      subInView.forEach(s => {
        const matching = exploredData.filter(r => r.unit === u && (r.subgrup || 'Umum') === s);
        if (matching.length > 0) {
          const max = Math.max(...matching.map(r => calculateIcra(r).score));
          matrix[u][s] = {
            count: matching.length,
            maxScore: max,
            level: calculateIcra(matching[0]).level
          };
        }
      });
    });

    return { units: unitsInView, subgroups: subInView, matrix };
  }, [exploredData]);

  // Score distribution histogram buckets
  const scoreDistribution = useMemo(() => {
    const buckets = [
      { label: 'Low (1–4)', count: 0, color: '#0ca30c' },
      { label: 'Moderate (5–9)', count: 0, color: '#fab219' },
      { label: 'High (10–14)', count: 0, color: '#ec835a' },
      { label: 'Significant (15–24)', count: 0, color: '#e14949' },
      { label: 'Extreme (≥25)', count: 0, color: '#991b1b' }
    ];

    exploredData.forEach(r => {
      const score = calculateIcra(r).score;
      if (score >= 25) buckets[4].count++;
      else if (score >= 15) buckets[3].count++;
      else if (score >= 10) buckets[2].count++;
      else if (score >= 5) buckets[1].count++;
      else buckets[0].count++;
    });

    return buckets;
  }, [exploredData]);

  const handleExportFiltered = () => {
    exportToExcel(exploredData, profile, 'Explorer_ICRA');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0f4c5c]">
              Fitur Baru &bull; Multi-Dimensional Risk Analyzer
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 tracking-tight flex items-center gap-2">
            <span>Explorer Data ICRA</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Baru
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Eksplorasi mendalam, slicing &amp; dicing, cross-tab pivot, dan inspeksi lengkap profil risiko rumah sakit
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportFiltered}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f4c5c] hover:bg-[#13677b] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Hasil Explorer</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 block uppercase">
            Data Tereksplorasi
          </span>
          <div className="text-xl font-black text-slate-900 mt-0.5">{stats.total}</div>
          <span className="text-[10px] text-slate-500">dari {records.length} rekaman</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 block uppercase">
            Rata-rata Skor
          </span>
          <div className="text-xl font-black text-[#0f4c5c] mt-0.5 font-mono">
            {stats.avgScore}
          </div>
          <span className="text-[10px] text-slate-500">Skor Max: {stats.maxScore}</span>
        </div>

        <div className="p-3 bg-red-50/60 rounded-xl border border-red-200/60 shadow-2xs">
          <span className="text-[10px] font-semibold text-red-700 block uppercase">
            Risiko Prioritas
          </span>
          <div className="text-xl font-black text-red-900 mt-0.5">{stats.priorityCount}</div>
          <span className="text-[10px] text-red-600">Peringkat 1–3</span>
        </div>

        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 shadow-2xs">
          <span className="text-[10px] font-semibold text-emerald-700 block uppercase">
            Penyelesaian Aksi
          </span>
          <div className="text-xl font-black text-emerald-900 mt-0.5">
            {stats.completedPct}%
          </div>
          <span className="text-[10px] text-emerald-600">Tindakan selesai</span>
        </div>

        <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200/60 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-semibold text-teal-800 block uppercase">
            Sub Kategori
          </span>
          <div className="text-xl font-black text-teal-900 mt-0.5">
            {distinctSubgroups.length}
          </div>
          <span className="text-[10px] text-teal-700">Area dalam filter</span>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl w-fit">
        {[
          { key: 'cards', label: 'Kartu Risiko & Drill-Down', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
          { key: 'pivot', label: 'Pivot Matrix (Unit &times; Sub)', icon: <Table className="w-3.5 h-3.5" /> },
          { key: 'distribution', label: 'Distribusi Skor', icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { key: 'status', label: 'Status & Tindak Lanjut', icon: <Clock className="w-3.5 h-3.5" /> }
        ].map(mode => (
          <button
            key={mode.key}
            onClick={() => setActiveMode(mode.key as ExplorerMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMode === mode.key
                ? 'bg-white text-[#0f4c5c] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {mode.icon}
            <span dangerouslySetInnerHTML={{ __html: mode.label }}></span>
          </button>
        ))}
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Keyword Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Cari kata kunci masalah, PIC, tindakan..."
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
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none"
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
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none truncate"
            >
              <option value="">Semua Unit</option>
              {distinctUnits.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Subgroup */}
          <div>
            <select
              value={filterSubgroup}
              onChange={e => setFilterSubgroup(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none truncate"
            >
              <option value="">Semua Sub Kategori</option>
              {distinctSubgroups.map(sg => (
                <option key={sg} value={sg}>
                  Sub: {sg}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Risk Level */}
          <div>
            <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value as any)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none"
            >
              <option value="">Semua Tingkat</option>
              {RISK_LEVELS.map(l => (
                <option key={l.key} value={l.key}>
                  {l.label} ({l.range})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Helper */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
          <span>
            Ditemukan <b>{exploredData.length}</b> risiko aktif
          </span>
          {(search || filterYear || filterUnit || filterGroup || filterSubgroup || filterLevel || filterStatus) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterYear('');
                setFilterUnit('');
                setFilterGroup('');
                setFilterSubgroup('');
                setFilterLevel('');
                setFilterStatus('');
              }}
              className="text-[#0f4c5c] font-semibold hover:underline cursor-pointer"
            >
              Bersihkan Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* MODE 1: VISUAL CARDS DRILL-DOWN */}
      {activeMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exploredData.length > 0 ? (
            exploredData.map(item => {
              const calc = calculateIcra(item);
              const rank = ranks[item.id] || 999;
              const levelInfo = RISK_LEVEL_MAP[calc.level];
              const isPriority = rank <= 3;

              return (
                <div
                  key={item.id}
                  onClick={() => setInspectedItem(item)}
                  className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer hover:shadow-md flex flex-col justify-between ${
                    isPriority
                      ? 'border-red-300 ring-1 ring-red-200/80 hover:border-red-400'
                      : 'border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isPriority && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white tracking-wider flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            P{rank}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.unit}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-200">
                          {item.subgrup || 'Umum'}
                        </span>
                      </div>

                      <span
                        style={{
                          backgroundColor: levelInfo.bgColor,
                          color: levelInfo.textColor,
                          borderColor: levelInfo.borderColor
                        }}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0"
                      >
                        {calc.level}
                      </span>
                    </div>

                    {/* Problem Title */}
                    <h3 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                      {item.masalah}
                    </h3>

                    {/* Group info */}
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                      {item.grup}
                    </p>

                    {/* Formula Pill */}
                    <div className="mt-3 p-2 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <div className="text-[11px] text-slate-600 font-mono">
                        L:<b>{item.L}</b> &bull; I:<b>{item.I}</b> &bull; S:<b>{item.S}</b>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block leading-none">Skor ICRA</span>
                        <span className="text-base font-black text-[#0f4c5c] font-mono leading-none">
                          {calc.score}
                        </span>
                      </div>
                    </div>

                    {/* Action plan summary if available */}
                    {item.rencana && (
                      <div className="mt-2 text-[11px] text-slate-500 bg-teal-50/40 p-2 rounded-lg line-clamp-2">
                        <b className="text-teal-900">Rencana:</b> {item.rencana}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Tahun {item.tahun}</span>
                    <span className="text-[#0f4c5c] font-bold flex items-center gap-0.5 hover:underline">
                      <span>Inspeksi Profil</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              Tidak ada data yang cocok dengan parameter explorer.
            </div>
          )}
        </div>
      )}

      {/* MODE 2: PIVOT MATRIX (Unit x Sub Kategori) */}
      {activeMode === 'pivot' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-2">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Matriks Cross-Tab (Unit Penilaian &times; Sub Kategori)
              </h3>
              <p className="text-[11px] text-slate-500">
                Menunjukkan jumlah risiko dan skor tertinggi di setiap perpotongan unit &amp; sub kategori
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 bg-slate-100 sticky left-0 z-20 min-w-[160px]">
                    Unit / Departemen
                  </th>
                  {pivotData.subgroups.map(sg => (
                    <th key={sg} className="py-2.5 px-3 text-center min-w-[100px] border-l border-slate-200">
                      {sg}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pivotData.units.map(u => (
                  <tr key={u} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900 bg-white sticky left-0 z-10 shadow-2xs border-r border-slate-200">
                      {u}
                    </td>
                    {pivotData.subgroups.map(sg => {
                      const cell = pivotData.matrix[u]?.[sg];
                      if (!cell) {
                        return (
                          <td key={sg} className="py-2 px-2 text-center text-slate-300 border-l border-slate-100">
                            -
                          </td>
                        );
                      }
                      const levelInfo = RISK_LEVEL_MAP[cell.level];
                      return (
                        <td
                          key={sg}
                          onClick={() => {
                            setFilterUnit(u);
                            setFilterSubgroup(sg);
                            setActiveMode('cards');
                          }}
                          className="py-2 px-2 text-center border-l border-slate-100 cursor-pointer hover:scale-105 transition-transform"
                          title={`Klik untuk filter: ${u} - ${sg}`}
                        >
                          <div
                            style={{
                              backgroundColor: levelInfo.bgColor,
                              color: levelInfo.textColor,
                              borderColor: levelInfo.borderColor
                            }}
                            className="inline-flex flex-col items-center justify-center px-2 py-1 rounded-lg border shadow-2xs font-bold leading-tight"
                          >
                            <span className="text-[11px]">{cell.count} item</span>
                            <span className="text-[9px] opacity-80">Max: {cell.maxScore}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 3: DISTRIBUTION HISTOGRAM */}
      {activeMode === 'distribution' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Histogram Distribusi Skor ICRA
            </h3>
            <p className="text-xs text-slate-500">
              Sebaran jumlah risiko berdasarkan rentang tingkat keparahan skor akhir
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-4">
            {scoreDistribution.map(bucket => {
              const maxCount = Math.max(...scoreDistribution.map(b => b.count), 1);
              const heightPct = Math.round((bucket.count / maxCount) * 100);

              return (
                <div
                  key={bucket.label}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-between min-h-[220px]"
                >
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {bucket.count}
                  </span>
                  <div className="w-full flex-1 flex items-end justify-center py-4">
                    <div
                      style={{
                        height: `${Math.max(12, heightPct)}%`,
                        backgroundColor: bucket.color
                      }}
                      className="w-16 rounded-t-lg transition-all shadow-sm"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-800 block">
                      {bucket.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {exploredData.length > 0
                        ? `${Math.round((bucket.count / exploredData.length) * 100)}% dari data`
                        : '0%'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 4: ACTION STATUS TRACKING */}
      {activeMode === 'status' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['Belum', 'Proses', 'Selesai'] as const).map(st => {
            const itemsInStatus = exploredData.filter(r => (r.status || 'Belum') === st);
            const statusConfig = {
              Belum: { label: 'Belum Dikerjakan', color: 'bg-slate-100 text-slate-700 border-slate-300' },
              Proses: { label: 'Dalam Pengerjaan', color: 'bg-amber-100 text-amber-800 border-amber-300' },
              Selesai: { label: 'Tindakan Selesai', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
            }[st];

            return (
              <div
                key={st}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                    {statusConfig.label} ({itemsInStatus.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {itemsInStatus.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setInspectedItem(item)}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-300 cursor-pointer text-xs space-y-1.5"
                    >
                      <div className="font-semibold text-slate-900 leading-snug">
                        {item.masalah}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{item.unit} &bull; {item.subgrup}</span>
                        <span className="font-bold text-[#0f4c5c]">Skor {calculateIcra(item).score}</span>
                      </div>
                    </div>
                  ))}
                  {itemsInStatus.length === 0 && (
                    <div className="text-center py-10 text-xs text-slate-400 italic">
                      Tidak ada risiko dalam status ini.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INSPECTOR MODAL / SLIDE-OVER */}
      {inspectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative border border-slate-100 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Inspektur Profil Risiko ICRA
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  {inspectedItem.masalah}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {inspectedItem.unit}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {inspectedItem.subgrup || 'Umum'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Tahun {inspectedItem.tahun}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Metric Banner */}
            {(() => {
              const c = calculateIcra(inspectedItem);
              const rank = ranks[inspectedItem.id] || 999;
              const levelInfo = RISK_LEVEL_MAP[c.level];
              return (
                <div
                  style={{ backgroundColor: levelInfo.bgColor, borderColor: levelInfo.borderColor }}
                  className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                        Skor ICRA Akhir
                      </span>
                      <span className="text-3xl font-black font-mono" style={{ color: levelInfo.textColor }}>
                        {c.score}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                        Tingkat Risiko
                      </span>
                      <span
                        style={{ backgroundColor: levelInfo.color }}
                        className="px-2.5 py-0.5 rounded-full text-xs font-black text-white inline-block mt-0.5"
                      >
                        {c.level}
                      </span>
                    </div>
                  </div>

                  {rank <= 3 && (
                    <div className="px-3 py-1 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <Flame className="w-4 h-4" />
                      <span>3 Prioritas Utama (P{rank})</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Scale breakdown */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Likelihood (L)
                </span>
                <span className="text-sm font-black text-slate-800">
                  {inspectedItem.L} &bull; {SCORING_CRITERIA.L.lbl[inspectedItem.L]}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">{SCORING_CRITERIA.L.desc[inspectedItem.L]}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Impact (I)
                </span>
                <span className="text-sm font-black text-slate-800">
                  {inspectedItem.I} &bull; {SCORING_CRITERIA.I.lbl[inspectedItem.I]}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">{SCORING_CRITERIA.I.desc[inspectedItem.I]}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Current System (S)
                </span>
                <span className="text-sm font-black text-slate-800">
                  {inspectedItem.S} &bull; {SCORING_CRITERIA.S.lbl[inspectedItem.S]}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">{SCORING_CRITERIA.S.desc[inspectedItem.S]}</p>
              </div>
            </div>

            {/* Action plan detailed view */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <h4 className="font-bold text-slate-800">Rencana Pengendalian &amp; Tindak Lanjut</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tujuan:</span>
                  <div className="text-slate-700">{inspectedItem.tujuan || '-'}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Indikator Terukur:</span>
                  <div className="text-slate-700">{inspectedItem.indikator || '-'}</div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Strategi Tindakan:</span>
                <div className="text-slate-700">{inspectedItem.rencana || '-'}</div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block">PIC:</span>
                  <div className="text-slate-700 font-medium">{inspectedItem.pic || '-'}</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block">Target Waktu:</span>
                  <div className="text-slate-700 font-medium">{inspectedItem.target || '-'}</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block">Bukti:</span>
                  <div className="text-slate-700 font-medium">{inspectedItem.bukti || '-'}</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Ubah Status:</span>
                {(['Belum', 'Proses', 'Selesai'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      if (onUpdateStatus) {
                        onUpdateStatus(inspectedItem.id, s);
                        setInspectedItem({ ...inspectedItem, status: s });
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      (inspectedItem.status || 'Belum') === s
                        ? 'bg-[#0f4c5c] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectedItem(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    const id = inspectedItem.id;
                    setInspectedItem(null);
                    onEditRecord(id);
                  }}
                  className="px-4 py-1.5 bg-[#0f4c5c] hover:bg-[#13677b] text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span>Edit di Form Input</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
