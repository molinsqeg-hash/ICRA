import React, { useState, useMemo } from 'react';
import { HospitalProfile, IcraRecord } from '../types';
import { calculateIcra, RISK_LEVELS, RISK_LEVEL_MAP, SCORING_CRITERIA } from '../constants';
import { calculateDenseRanks, getDistinctUnits, getDistinctYears } from '../utils/storage';
import { RiskMatrixChart } from './RiskMatrixChart';
import { HBarChart, HBarRow } from './HBarChart';
import { VBarChart, VBarCol } from './VBarChart';
import {
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  Flame,
  Award,
  Layers,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { exportToExcel } from '../utils/excel';

interface DashboardViewProps {
  records: IcraRecord[];
  profile: HospitalProfile;
  onEditRecord: (recordId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  profile,
  onEditRecord
}) => {
  const distinctYears = useMemo(() => getDistinctYears(records), [records]);
  const distinctUnits = useMemo(() => getDistinctUnits(records), [records]);

  const defaultYear = distinctYears[0] ?? profile.year;
  const [selectedYear, setSelectedYear] = useState<string>(String(defaultYear));
  const [selectedUnit, setSelectedUnit] = useState<string>('Seluruh Departemen');

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchYear = !selectedYear || String(r.tahun) === selectedYear;
      const matchUnit = !selectedUnit || r.unit === selectedUnit;
      return matchYear && matchUnit;
    });
  }, [records, selectedYear, selectedUnit]);

  // Calculate ranks
  const denseRanks = useMemo(() => {
    return calculateDenseRanks(filteredRecords);
  }, [filteredRecords]);

  // Risk levels counts
  const levelCounts = useMemo(() => {
    const counts = { Significant: 0, High: 0, Moderate: 0, Low: 0 };
    filteredRecords.forEach(r => {
      const { level } = calculateIcra(r);
      counts[level]++;
    });
    return counts;
  }, [filteredRecords]);

  const maxScore = useMemo(() => {
    return filteredRecords.reduce((m, r) => Math.max(m, calculateIcra(r).score), 0);
  }, [filteredRecords]);

  // Priority 1, 2, 3 items
  const priority1 = filteredRecords.filter(r => denseRanks[r.id] === 1);
  const priority2 = filteredRecords.filter(r => denseRanks[r.id] === 2);
  const priority3 = filteredRecords.filter(r => denseRanks[r.id] === 3);

  // Top 10 items for horizontal chart
  const top10Rows: HBarRow[] = useMemo(() => {
    const sorted = [...filteredRecords]
      .sort((a, b) => {
        const diff = calculateIcra(b).score - calculateIcra(a).score;
        if (diff !== 0) return diff;
        return (b.L * b.I) - (a.L * a.I);
      })
      .slice(0, 10);

    return sorted.map(r => {
      const calc = calculateIcra(r);
      const prio = denseRanks[r.id];
      return {
        label: r.masalah,
        subLabel: `${r.unit} • L${r.L} I${r.I} S${r.S}`,
        total: calc.score,
        totalLabel: prio <= 3 ? `${calc.score} (P${prio})` : calc.score,
        isPriority: prio <= 3
      };
    });
  }, [filteredRecords, denseRanks]);

  // Group breakdown with stacked segments
  const groupRows: HBarRow[] = useMemo(() => {
    const map: Record<string, { total: number; significant: number; high: number; moderate: number; low: number }> = {};
    filteredRecords.forEach(r => {
      const g = r.grup || 'Lainnya';
      if (!map[g]) map[g] = { total: 0, significant: 0, high: 0, moderate: 0, low: 0 };
      map[g].total++;
      const { level } = calculateIcra(r);
      if (level === 'Significant') map[g].significant++;
      if (level === 'High') map[g].high++;
      if (level === 'Moderate') map[g].moderate++;
      if (level === 'Low') map[g].low++;
    });

    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
      .map(([grup, data]) => ({
        label: grup,
        total: data.total,
        segments: [
          { value: data.significant, color: RISK_LEVEL_MAP.Significant.color, label: 'Significant' },
          { value: data.high, color: RISK_LEVEL_MAP.High.color, label: 'High' },
          { value: data.moderate, color: RISK_LEVEL_MAP.Moderate.color, label: 'Moderate' },
          { value: data.low, color: RISK_LEVEL_MAP.Low.color, label: 'Low' }
        ]
      }));
  }, [filteredRecords]);

  // Current system (1 to 5) distribution
  const csCols: VBarCol[] = useMemo(() => {
    return [1, 2, 3, 4, 5].map(v => {
      const count = filteredRecords.filter(r => r.S === v).length;
      return {
        label: `S ${v}`,
        subLabel: SCORING_CRITERIA.S.lbl[v],
        total: count
      };
    });
  }, [filteredRecords]);

  // Trend per year for selected unit
  const trendCols: VBarCol[] = useMemo(() => {
    const unitRecs = records.filter(r => !selectedUnit || r.unit === selectedUnit);
    const years = getDistinctYears(unitRecs).sort((a, b) => a - b);
    return years.map(yr => {
      const recsInYr = unitRecs.filter(r => r.tahun === yr);
      const sig = recsInYr.filter(r => calculateIcra(r).level === 'Significant').length;
      const hig = recsInYr.filter(r => calculateIcra(r).level === 'High').length;
      const mod = recsInYr.filter(r => calculateIcra(r).level === 'Moderate').length;
      const low = recsInYr.filter(r => calculateIcra(r).level === 'Low').length;
      return {
        label: String(yr),
        total: recsInYr.length,
        segments: [
          { value: sig, color: RISK_LEVEL_MAP.Significant.color, label: 'Significant' },
          { value: hig, color: RISK_LEVEL_MAP.High.color, label: 'High' },
          { value: mod, color: RISK_LEVEL_MAP.Moderate.color, label: 'Moderate' },
          { value: low, color: RISK_LEVEL_MAP.Low.color, label: 'Low' }
        ]
      };
    });
  }, [records, selectedUnit]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportToExcel(filteredRecords, profile, `ICRA_${selectedUnit}_${selectedYear}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0f4c5c]">
              Komite PPI &bull; {profile.hospital}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
            Dashboard Penilaian ICRA
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis risiko epidemiologis &amp; keselamatan layanan pencegahan dan pengendalian infeksi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 no-print">
          {/* Year selector */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 mr-2 font-medium">Tahun:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">Semua Tahun</option>
              {distinctYears.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Unit selector */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs max-w-xs">
            <span className="text-slate-400 mr-2 font-medium shrink-0">Unit:</span>
            <select
              value={selectedUnit}
              onChange={e => setSelectedUnit(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer truncate"
            >
              <option value="">Semua Unit</option>
              {distinctUnits.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* 3 Prioritas Utama ICRA */}
      <div className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent p-4 sm:p-5 rounded-2xl border-2 border-red-500/30 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-black shadow-xs">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-red-950">
                3 Prioritas Utama ICRA (Top Risk Priorities)
              </h2>
              <p className="text-[11px] text-slate-500">
                Ditentukan otomatis berdasarkan peringkat skor ICRA tertinggi (L &times; I &times; S)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { rank: 1, list: priority1, color: 'border-red-500 bg-red-50/60' },
            { rank: 2, list: priority2, color: 'border-orange-400 bg-orange-50/50' },
            { rank: 3, list: priority3, color: 'border-amber-400 bg-amber-50/50' }
          ].map(({ rank, list, color }) => {
            const first = list[0];
            const calc = first ? calculateIcra(first) : null;
            return (
              <div
                key={`prio-card-${rank}`}
                className={`p-3.5 rounded-xl border ${color} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-red-600 text-white uppercase shadow-2xs">
                      Prioritas {rank}
                    </span>
                    {calc && (
                      <span className="text-lg font-black text-red-900 font-mono">
                        {calc.score}
                        <span className="text-[10px] font-normal text-slate-500 ml-1">
                          pts
                        </span>
                      </span>
                    )}
                  </div>

                  {list.length > 0 ? (
                    <div className="space-y-2">
                      {list.map(r => (
                        <div key={r.id} className="pt-1.5 border-t border-red-200/40">
                          <div className="text-xs font-bold text-slate-900 leading-snug">
                            {r.masalah}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {r.unit} &bull; {r.subgrup || r.grup}
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono mt-1">
                            L{r.L} &times; I{r.I} &times; S{r.S} = <b>{calculateIcra(r).score}</b>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 py-3 italic">
                      Tidak ada risiko di prioritas ini
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Risiko Dinilai</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {filteredRecords.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Skor Max: <b className="text-slate-700">{maxScore}</b>
          </div>
        </div>

        {RISK_LEVELS.map(level => {
          const count = levelCounts[level.key];
          const pct = filteredRecords.length > 0 ? Math.round((count / filteredRecords.length) * 100) : 0;
          return (
            <div
              key={level.key}
              style={{ backgroundColor: level.bgColor, borderColor: level.borderColor }}
              className="p-3.5 rounded-xl border shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs font-semibold" style={{ color: level.textColor }}>
                <span>{level.label}</span>
                <span className="text-[10px] opacity-80">{level.range}</span>
              </div>
              <div className="text-2xl font-black mt-1" style={{ color: level.textColor }}>
                {count}
              </div>
              <div className="w-full bg-white/60 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  style={{ width: `${pct}%`, backgroundColor: level.color }}
                  className="h-full rounded-full"
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1">{pct}% dari total</div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Risks */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                10 Risiko Tertinggi (Top 10 ICRA Score)
              </h3>
              <p className="text-[11px] text-slate-500">
                Warna merah menunjukkan 3 Prioritas Utama
              </p>
            </div>
          </div>
          <HBarChart rows={top10Rows} axisLabel="Skor ICRA (L × I × S)" />
        </div>

        {/* 5x5 Matrix Chart */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Matriks Risiko (Probability &times; Impact)
            </h3>
            <p className="text-[11px] text-slate-500">
              Angka di tiap titik menunjukkan nomor koordinat &amp; total risiko terdaftar
            </p>
          </div>
          <RiskMatrixChart records={filteredRecords} ranks={denseRanks} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Jumlah Risiko per Grup Kategori
            </h3>
            <p className="text-[11px] text-slate-500">
              Dipecah berdasarkan komposisi tingkat risiko
            </p>
          </div>
          <HBarChart rows={groupRows} axisLabel="Jumlah Potensial Masalah" />
        </div>

        {/* Current System */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Kesiapan Sistem (Current System)
            </h3>
            <p className="text-[11px] text-slate-500">
              Distribusi kesiapan regulasi, fasilitas &amp; pelaksanaan di unit
            </p>
          </div>
          <VBarChart cols={csCols} yLabel="Jumlah Risiko" />
        </div>
      </div>

      {/* Multi-Year Trend */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tren Tingkat Risiko per Tahun &bull; {selectedUnit || 'Seluruh Departemen'}
            </h3>
            <p className="text-[11px] text-slate-500">
              Komparasi total dan komposisi risiko dari tahun ke tahun
            </p>
          </div>
        </div>
        <VBarChart cols={trendCols} yLabel="Jumlah Risiko per Tahun" />
      </div>

      {/* Table of Top 25 Highest Score Risks */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tabel 25 Risiko Tertinggi
            </h3>
            <p className="text-[11px] text-slate-500">
              Klik pada baris untuk langsung mengedit atau memperbarui penilaian
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">Prio</th>
                <th className="py-2.5 px-3">Potensial Risiko / Masalah</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Grup / Kategori</th>
                <th className="py-2.5 px-2 text-center w-12">L</th>
                <th className="py-2.5 px-2 text-center w-12">I</th>
                <th className="py-2.5 px-2 text-center w-12">S</th>
                <th className="py-2.5 px-2 text-center w-16">Skor</th>
                <th className="py-2.5 px-3">Tingkat</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...filteredRecords]
                .sort((a, b) => denseRanks[a.id] - denseRanks[b.id] || calculateIcra(b).score - calculateIcra(a).score)
                .slice(0, 25)
                .map(r => {
                  const calc = calculateIcra(r);
                  const prio = denseRanks[r.id];
                  const levelInfo = RISK_LEVEL_MAP[calc.level];
                  return (
                    <tr
                      key={r.id}
                      onClick={() => onEditRecord(r.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-[11px] ${
                            prio <= 3 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {prio}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs">
                        {r.masalah}
                        {r.rencana && (
                          <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                            ↳ {r.rencana}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{r.unit}</td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-[180px] truncate">
                        {r.subgrup ? `${r.subgrup} (${r.grup})` : r.grup}
                      </td>
                      <td className="py-2.5 px-2 text-center font-medium text-slate-700">{r.L}</td>
                      <td className="py-2.5 px-2 text-center font-medium text-slate-700">{r.I}</td>
                      <td className="py-2.5 px-2 text-center font-medium text-slate-700">{r.S}</td>
                      <td className="py-2.5 px-2 text-center font-black text-[#0f4c5c] text-sm">
                        {calc.score}
                      </td>
                      <td className="py-2.5 px-3">
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
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditRecord(r.id);
                          }}
                          className="text-xs font-semibold text-[#0f4c5c] hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Edit</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
