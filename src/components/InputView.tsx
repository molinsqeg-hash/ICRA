import React, { useState, useEffect, useMemo } from 'react';
import { HospitalProfile, IcraRecord, MasterCatalogItem } from '../types';
import {
  calculateIcra,
  DEFAULT_UNITS,
  PPI_GROUPS,
  RISK_LEVEL_MAP,
  SCORING_CRITERIA
} from '../constants';
import { calculateDenseRanks, getDistinctSubgroups, getStoredDraft, saveStoredDraft } from '../utils/storage';
import {
  Save,
  RotateCcw,
  Trash2,
  BookOpen,
  CheckCircle2,
  PlusCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Database,
  Search,
  Check
} from 'lucide-react';

interface InputViewProps {
  records: IcraRecord[];
  catalog: MasterCatalogItem[];
  profile: HospitalProfile;
  editRecordId: string | null;
  onSaveRecord: (record: IcraRecord) => void;
  onDeleteRecord: (id: string) => void;
  onCancelEdit: () => void;
  onOpenGuide: () => void;
  onOpenDatabase?: () => void;
}

export const InputView: React.FC<InputViewProps> = ({
  records,
  catalog,
  profile,
  editRecordId,
  onSaveRecord,
  onDeleteRecord,
  onCancelEdit,
  onOpenGuide,
  onOpenDatabase
}) => {
  const editingRecord = useMemo(() => {
    return editRecordId ? records.find(r => r.id === editRecordId) || null : null;
  }, [editRecordId, records]);

  // Form state
  const [tahun, setTahun] = useState<number>(profile.year || 2026);
  const [unit, setUnit] = useState<string>('Seluruh Departemen');
  const [customUnit, setCustomUnit] = useState<string>('');
  const [grup, setGrup] = useState<string>(PPI_GROUPS[0]);
  const [customGrup, setCustomGrup] = useState<string>('');

  // Subgrup state
  const [subgrup, setSubgrup] = useState<string>('');
  const [subgrupMode, setSubgrupMode] = useState<'select' | 'custom'>('select');
  const [customSubgrup, setCustomSubgrup] = useState<string>('');

  // Masalah state
  const [masalah, setMasalah] = useState<string>('');
  const [masalahMode, setMasalahMode] = useState<'select' | 'custom'>('select');
  const [customMasalah, setCustomMasalah] = useState<string>('');

  const [L, setL] = useState<number>(1);
  const [I, setI] = useState<number>(1);
  const [S, setS] = useState<number>(1);
  const [status, setStatus] = useState<'Belum' | 'Proses' | 'Selesai'>('Belum');

  // Action plan state
  const [showActionPlan, setShowActionPlan] = useState<boolean>(false);
  const [tujuan, setTujuan] = useState<string>('');
  const [indikator, setIndikator] = useState<string>('');
  const [rencana, setRencana] = useState<string>('');
  const [pic, setPic] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [bukti, setBukti] = useState<string>('');
  const [ket, setKet] = useState<string>('');

  const [keepContext, setKeepContext] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [alreadyExistsNotice, setAlreadyExistsNotice] = useState<string | null>(null);

  // Distinct Subgroups from Catalog & Records
  const allSubgroups = useMemo(() => {
    return getDistinctSubgroups(catalog, records);
  }, [catalog, records]);

  // Master catalog map for quick lookups
  const catalogMap = useMemo(() => {
    const map = new Map<string, MasterCatalogItem>();
    catalog.forEach(item => {
      const key = item.masalah.toLowerCase().trim();
      if (!map.has(key)) map.set(key, item);
    });
    return map;
  }, [catalog]);

  // Master items grouped by Category
  const groupedMasterItems = useMemo(() => {
    const groups: Record<string, MasterCatalogItem[]> = {};
    catalog.forEach(item => {
      const g = item.grup || 'Lainnya';
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    });
    return groups;
  }, [catalog]);

  // Set of problems already assessed for current (tahun, unit)
  const assessedProblems = useMemo(() => {
    const activeUnitName = unit === '__custom__' ? customUnit : unit;
    const set = new Set<string>();
    records
      .filter(r => r.tahun === tahun && r.unit === activeUnitName)
      .forEach(r => set.add(r.masalah.toLowerCase().trim()));
    return set;
  }, [records, tahun, unit, customUnit]);

  // Load editing record or draft
  useEffect(() => {
    if (editingRecord) {
      setTahun(editingRecord.tahun);
      if (DEFAULT_UNITS.includes(editingRecord.unit)) {
        setUnit(editingRecord.unit);
        setCustomUnit('');
      } else {
        setUnit('__custom__');
        setCustomUnit(editingRecord.unit);
      }

      if (PPI_GROUPS.includes(editingRecord.grup)) {
        setGrup(editingRecord.grup);
        setCustomGrup('');
      } else {
        setGrup('__custom__');
        setCustomGrup(editingRecord.grup);
      }

      // Check if subgrup is in known list
      const recSub = editingRecord.subgrup || '';
      if (allSubgroups.includes(recSub)) {
        setSubgrup(recSub);
        setSubgrupMode('select');
        setCustomSubgrup('');
      } else if (recSub) {
        setSubgrup('__custom__');
        setSubgrupMode('custom');
        setCustomSubgrup(recSub);
      } else {
        setSubgrup('');
        setSubgrupMode('select');
      }

      // Check if masalah is in master catalog
      const recProb = editingRecord.masalah;
      if (catalogMap.has(recProb.toLowerCase().trim())) {
        setMasalah(recProb);
        setMasalahMode('select');
        setCustomMasalah('');
      } else {
        setMasalah('__custom__');
        setMasalahMode('custom');
        setCustomMasalah(recProb);
      }

      setL(editingRecord.L);
      setI(editingRecord.I);
      setS(editingRecord.S);
      setStatus(editingRecord.status || 'Belum');
      setTujuan(editingRecord.tujuan || '');
      setIndikator(editingRecord.indikator || '');
      setRencana(editingRecord.rencana || '');
      setPic(editingRecord.pic || '');
      setTarget(editingRecord.target || '');
      setBukti(editingRecord.bukti || '');
      setKet(editingRecord.ket || '');
      if (editingRecord.rencana || editingRecord.tujuan || editingRecord.pic) {
        setShowActionPlan(true);
      }
    } else {
      // Check stored draft
      const draft = getStoredDraft();
      if (draft && !editRecordId) {
        if (draft.tahun) setTahun(draft.tahun);
        if (draft.unit) {
          if (DEFAULT_UNITS.includes(draft.unit)) {
            setUnit(draft.unit);
          } else {
            setUnit('__custom__');
            setCustomUnit(draft.unit);
          }
        }
        if (draft.grup) {
          if (PPI_GROUPS.includes(draft.grup)) {
            setGrup(draft.grup);
          } else {
            setGrup('__custom__');
            setCustomGrup(draft.grup);
          }
        }
        if (draft.subgrup) {
          if (allSubgroups.includes(draft.subgrup)) {
            setSubgrup(draft.subgrup);
            setSubgrupMode('select');
          } else {
            setSubgrup('__custom__');
            setSubgrupMode('custom');
            setCustomSubgrup(draft.subgrup);
          }
        }
        if (draft.masalah) {
          if (catalogMap.has(draft.masalah.toLowerCase().trim())) {
            setMasalah(draft.masalah);
            setMasalahMode('select');
          } else {
            setMasalah('__custom__');
            setMasalahMode('custom');
            setCustomMasalah(draft.masalah);
          }
        }
        if (draft.L) setL(draft.L);
        if (draft.I) setI(draft.I);
        if (draft.S) setS(draft.S);
      }
    }
  }, [editingRecord, editRecordId, allSubgroups, catalogMap]);

  // Real-time calculation
  const calc = useMemo(() => {
    return calculateIcra({ L, I, S });
  }, [L, I, S]);

  const levelInfo = RISK_LEVEL_MAP[calc.level];

  const activeUnit = unit === '__custom__' ? customUnit : unit;

  // Active subgrup value
  const activeSubgrup = subgrupMode === 'custom' ? customSubgrup : subgrup;

  // Active masalah value
  const activeMasalah = masalahMode === 'custom' ? customMasalah : masalah;

  // Side records for current unit & year
  const sideRecords = useMemo(() => {
    return records
      .filter(r => r.tahun === tahun && r.unit === activeUnit)
      .sort((a, b) => calculateIcra(b).score - calculateIcra(a).score);
  }, [records, tahun, activeUnit]);

  const sideRanks = useMemo(() => {
    return calculateDenseRanks(sideRecords);
  }, [sideRecords]);

  // Handle problem selection from master dropdown
  const handleSelectProblem = (selectedVal: string) => {
    if (selectedVal === '__custom__') {
      setMasalahMode('custom');
      setMasalah('__custom__');
      setAlreadyExistsNotice(null);
      return;
    }

    setMasalahMode('select');
    setMasalah(selectedVal);
    setCustomMasalah('');

    // Check if item exists in catalog map to auto-populate grup and subgrup
    const matched = catalogMap.get(selectedVal.toLowerCase().trim());
    if (matched) {
      if (PPI_GROUPS.includes(matched.grup)) {
        setGrup(matched.grup);
        setCustomGrup('');
      } else {
        setGrup('__custom__');
        setCustomGrup(matched.grup);
      }

      if (allSubgroups.includes(matched.subgrup)) {
        setSubgrup(matched.subgrup);
        setSubgrupMode('select');
        setCustomSubgrup('');
      } else if (matched.subgrup) {
        setSubgrup('__custom__');
        setSubgrupMode('custom');
        setCustomSubgrup(matched.subgrup);
      }
    }

    // Check if already assessed
    if (assessedProblems.has(selectedVal.toLowerCase().trim())) {
      setAlreadyExistsNotice(`Catatan: Masalah ini sudah pernah dinilai untuk ${activeUnit} pada tahun ${tahun} (✓).`);
    } else {
      setAlreadyExistsNotice(null);
    }
  };

  // Handle subgroup selection
  const handleSelectSubgroup = (val: string) => {
    if (val === '__custom__') {
      setSubgrupMode('custom');
      setSubgrup('__custom__');
      return;
    }
    setSubgrupMode('select');
    setSubgrup(val);
    setCustomSubgrup('');

    // If grup is not set or general, try to find matching grup for this subgrup from catalog
    const firstMatchingItem = catalog.find(c => c.subgrup.toLowerCase() === val.toLowerCase());
    if (firstMatchingItem && (!grup || grup === PPI_GROUPS[0])) {
      if (PPI_GROUPS.includes(firstMatchingItem.grup)) {
        setGrup(firstMatchingItem.grup);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUnit = (unit === '__custom__' ? customUnit : unit).trim();
    const finalGrup = (grup === '__custom__' ? customGrup : grup).trim();
    const finalSubgrup = (subgrupMode === 'custom' ? customSubgrup : subgrup).trim();
    const finalMasalah = (masalahMode === 'custom' ? customMasalah : masalah).trim();

    if (!finalUnit) {
      alert('Nama Unit / Area harus diisi.');
      return;
    }
    if (!finalGrup) {
      alert('Grup / Kategori risiko harus dipilih atau diisi.');
      return;
    }
    if (!finalMasalah) {
      alert('Potensial risiko / masalah harus dipilih atau diisi.');
      return;
    }

    const now = new Date().toISOString();
    const newRecord: IcraRecord = {
      id: editingRecord ? editingRecord.id : `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      seq: editingRecord ? editingRecord.seq : records.length + 1,
      tahun: Number(tahun),
      unit: finalUnit,
      grup: finalGrup,
      subgrup: finalSubgrup,
      masalah: finalMasalah,
      L: Number(L),
      I: Number(I),
      S: Number(S),
      status,
      tujuan: tujuan.trim(),
      indikator: indikator.trim(),
      rencana: rencana.trim(),
      pic: pic.trim(),
      target: target.trim(),
      bukti: bukti.trim(),
      ket: ket.trim(),
      createdAt: editingRecord?.createdAt || now,
      updatedAt: now
    };

    onSaveRecord(newRecord);
    saveStoredDraft(null);

    setToastMessage(editingRecord ? 'Perubahan berhasil disimpan!' : `Data tersimpan ✓ Skor: ${calc.score} (${calc.level})`);
    setTimeout(() => setToastMessage(null), 3000);

    if (editingRecord) {
      onCancelEdit();
    } else {
      // Clear problem and scores for next entry
      setMasalah('');
      setMasalahMode('select');
      setCustomMasalah('');
      setAlreadyExistsNotice(null);
      setL(1);
      setI(1);
      setS(1);
      setTujuan('');
      setIndikator('');
      setRencana('');
      setPic('');
      setTarget('');
      setBukti('');
      setKet('');
      if (!keepContext) {
        setSubgrup('');
        setSubgrupMode('select');
        setCustomSubgrup('');
        setUnit(DEFAULT_UNITS[0]);
        setGrup(PPI_GROUPS[0]);
      }
    }
  };

  const handleResetForm = () => {
    if (confirm('Kosongkan formulir input?')) {
      saveStoredDraft(null);
      setMasalah('');
      setMasalahMode('select');
      setCustomMasalah('');
      setSubgrup('');
      setSubgrupMode('select');
      setCustomSubgrup('');
      setAlreadyExistsNotice(null);
      setL(1);
      setI(1);
      setS(1);
      setTujuan('');
      setIndikator('');
      setRencana('');
      setPic('');
      setTarget('');
      setBukti('');
      setKet('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0f4c5c]">
            Formulir Penilaian ICRA
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
            {editingRecord ? 'Edit Penilaian Risiko' : 'Input Data Risiko'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih potensi risiko dari database atau ketik baru. Skor, tingkat risiko, dan prioritas dihitung seketika.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDatabase && (
            <button
              type="button"
              onClick={onOpenDatabase}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Buka Database Master</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-semibold border border-teal-200 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-teal-700" />
            <span>Panduan Skor</span>
          </button>

          {editingRecord && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              ✕ Batal Edit
            </button>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {alreadyExistsNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center justify-between gap-2 shadow-2xs">
          <span>{alreadyExistsNotice}</span>
          <button
            onClick={() => setAlreadyExistsNotice(null)}
            className="text-amber-700 font-bold hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Grid: Form on Left, Side List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Input Form (2 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          {/* Metadata Row: Tahun & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tahun Penilaian *
              </label>
              <input
                type="number"
                value={tahun}
                onChange={e => setTahun(Number(e.target.value))}
                min={2020}
                max={2035}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unit / Area Penilaian *
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c]"
              >
                {DEFAULT_UNITS.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
                <option value="__custom__">➕ Tambah Unit Baru (Ketik manual)...</option>
              </select>
              {unit === '__custom__' && (
                <input
                  type="text"
                  placeholder="Ketik nama unit baru..."
                  value={customUnit}
                  onChange={e => setCustomUnit(e.target.value)}
                  required
                  className="mt-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
                />
              )}
            </div>
          </div>

          {/* Group and Subgroup Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Grup Risiko */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grup Risiko (Kategori PPI) *
              </label>
              <select
                value={grup}
                onChange={e => setGrup(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c]"
              >
                {PPI_GROUPS.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
                <option value="__custom__">➕ Tambah Grup Baru (Ketik manual)...</option>
              </select>
              {grup === '__custom__' && (
                <input
                  type="text"
                  placeholder="Ketik nama grup risiko baru..."
                  value={customGrup}
                  onChange={e => setCustomGrup(e.target.value)}
                  required
                  className="mt-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
                />
              )}
            </div>

            {/* Sub Grup (Sub Kategori) Dropdown with Options from Database */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Sub Grup (Sub Kategori) *
                </label>
                {subgrupMode === 'custom' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSubgrupMode('select');
                      setSubgrup(allSubgroups[0] || '');
                    }}
                    className="text-[10px] text-[#0f4c5c] font-semibold hover:underline cursor-pointer"
                  >
                    Pilih dari Daftar
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400">
                    {allSubgroups.length} Opsi Tersedia
                  </span>
                )}
              </div>

              {subgrupMode === 'select' ? (
                <div className="space-y-1.5">
                  <select
                    value={subgrup}
                    onChange={e => handleSelectSubgroup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c]"
                  >
                    <option value="">— Pilih Sub Grup ({allSubgroups.length} opsi) —</option>
                    {allSubgroups.map(sg => (
                      <option key={sg} value={sg}>
                        {sg}
                      </option>
                    ))}
                    <option value="__custom__">➕ Tambah Sub Grup Baru (Ketik manual)...</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="Ketik nama sub grup baru (mis. HAIs, Bundle SSI, Linen, CSSD)..."
                    value={customSubgrup}
                    onChange={e => setCustomSubgrup(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
                  />
                  <div className="text-[10px] text-slate-400">
                    Ketik sub kategori baru, atau klik "Pilih dari Daftar" untuk memilih opsi standar.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Potensial Risiko / Masalah (Dropdown Selector from Database) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Potensial Risiko / Masalah *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">
                  (✓ = sudah dinilai untuk unit &amp; tahun ini)
                </span>
                {masalahMode === 'custom' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMasalahMode('select');
                      setMasalah('');
                    }}
                    className="text-[10px] text-[#0f4c5c] font-semibold hover:underline cursor-pointer"
                  >
                    Pilih dari Daftar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMasalahMode('custom');
                      setMasalah('__custom__');
                    }}
                    className="text-[10px] text-[#0f4c5c] font-semibold hover:underline cursor-pointer"
                  >
                    ➕ Ketik Manual
                  </button>
                )}
              </div>
            </div>

            {masalahMode === 'select' ? (
              <div className="space-y-2">
                <select
                  value={masalah}
                  onChange={e => handleSelectProblem(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c]"
                >
                  <option value="">
                    — Pilih Potensial Risiko dari Database ({catalog.length} Masalah Terdaftar) —
                  </option>
                  {Object.entries(groupedMasterItems).map(([groupName, items]) => (
                    <optgroup key={groupName} label={groupName}>
                      {items.map(item => {
                        const isDone = assessedProblems.has(item.masalah.toLowerCase().trim());
                        return (
                          <option key={item.id} value={item.masalah}>
                            {isDone ? '✓ ' : ''}
                            {item.subgrup ? `${item.subgrup} · ` : ''}
                            {item.masalah}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                  <option value="__custom__">➕ Tambah Baru (Ketik manual)...</option>
                </select>

                {/* Selected problem preview pill if chosen */}
                {masalah && masalah !== '__custom__' && (
                  <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-xs flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-teal-900">{masalah}</div>
                      <div className="text-[10px] text-teal-700 mt-0.5">
                        Kategori: <b>{grup}</b> &bull; Sub: <b>{activeSubgrup || '-'}</b>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomMasalah(masalah);
                        setMasalahMode('custom');
                      }}
                      className="text-[10px] text-teal-800 hover:underline shrink-0 font-semibold"
                    >
                      Ubah Teks
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={customMasalah}
                  onChange={e => setCustomMasalah(e.target.value)}
                  placeholder="Ketik deskripsi masalah atau potensi risiko baru..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c]"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sedang mengetik masalah kustom.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMasalahMode('select');
                      setMasalah('');
                    }}
                    className="text-[#0f4c5c] font-semibold hover:underline"
                  >
                    Kembali ke Pilihan Database
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SCORING SCALES (L, I, S) */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            {/* 1. Likelihood (Probability) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">
                  1. {SCORING_CRITERIA.L.name} (Likelihood)
                </span>
                <span className="text-xs font-black text-[#0f4c5c]">
                  Nilai: {L} &bull; {SCORING_CRITERIA.L.lbl[L]}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={`scale-L-${val}`}
                    type="button"
                    onClick={() => setL(val)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center min-h-[58px] ${
                      L === val
                        ? 'bg-[#0f4c5c] text-white border-[#0f4c5c] shadow-sm ring-2 ring-[#0f4c5c]/30'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-sm font-black">{val}</span>
                    <span className="text-[10px] font-semibold leading-tight mt-0.5">
                      {SCORING_CRITERIA.L.lbl[val]}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 italic">
                Kriteria: {SCORING_CRITERIA.L.desc[L]}
              </p>
            </div>

            {/* 2. Consequences (Impact) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">
                  2. {SCORING_CRITERIA.I.name} (Impact)
                </span>
                <span className="text-xs font-black text-[#0f4c5c]">
                  Nilai: {I} &bull; {SCORING_CRITERIA.I.lbl[I]}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={`scale-I-${val}`}
                    type="button"
                    onClick={() => setI(val)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center min-h-[58px] ${
                      I === val
                        ? 'bg-[#0f4c5c] text-white border-[#0f4c5c] shadow-sm ring-2 ring-[#0f4c5c]/30'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-sm font-black">{val}</span>
                    <span className="text-[10px] font-semibold leading-tight mt-0.5">
                      {SCORING_CRITERIA.I.lbl[val]}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 italic">
                Kriteria: {SCORING_CRITERIA.I.desc[I]}
              </p>
            </div>

            {/* 3. Current System */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">
                  3. {SCORING_CRITERIA.S.name}
                </span>
                <span className="text-xs font-black text-[#0f4c5c]">
                  Nilai: {S} &bull; {SCORING_CRITERIA.S.lbl[S]}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={`scale-S-${val}`}
                    type="button"
                    onClick={() => setS(val)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center min-h-[58px] ${
                      S === val
                        ? 'bg-[#0f4c5c] text-white border-[#0f4c5c] shadow-sm ring-2 ring-[#0f4c5c]/30'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-sm font-black">{val}</span>
                    <span className="text-[10px] font-semibold leading-tight mt-0.5">
                      {SCORING_CRITERIA.S.lbl[val]}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 italic">
                Kriteria: {SCORING_CRITERIA.S.desc[S]}
              </p>
            </div>
          </div>

          {/* Real-time Result Summary Box */}
          <div className="p-4 rounded-xl border-2 border-dashed border-[#0f4c5c]/30 bg-teal-50/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                  Skor L &times; I
                </span>
                <span className="text-xl font-black text-slate-800 font-mono">{calc.li}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                  Tingkat Risiko
                </span>
                <span
                  style={{
                    backgroundColor: levelInfo.bgColor,
                    color: levelInfo.textColor,
                    borderColor: levelInfo.borderColor
                  }}
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold border inline-block mt-0.5"
                >
                  {calc.level}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                  Skor ICRA (L&times;I&times;S)
                </span>
                <span className="text-2xl font-black text-[#0f4c5c] font-mono">
                  {calc.score}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 max-w-xs text-right sm:text-left">
              <span className="font-semibold block text-slate-800">Tindakan Rekomendasi:</span>
              <span className="text-[11px] text-slate-500 leading-snug block">
                {levelInfo.action}
              </span>
            </div>
          </div>

          {/* Action Plan Collapsible Section */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowActionPlan(!showActionPlan)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#0f4c5c] py-2 hover:underline cursor-pointer"
            >
              <span>Rencana Tindak Lanjut / Risk Priority Plan (Opsional)</span>
              {showActionPlan ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showActionPlan && (
              <div className="space-y-3 mt-3 pt-3 border-t border-slate-100 bg-slate-50/70 p-3.5 rounded-xl border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Tujuan
                    </label>
                    <textarea
                      rows={2}
                      value={tujuan}
                      onChange={e => setTujuan(e.target.value)}
                      placeholder="Contoh: Menurunkan angka insiden infeksi saluran kemih di bawah 1%"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Indikator Terukur / Obyektif
                    </label>
                    <textarea
                      rows={2}
                      value={indikator}
                      onChange={e => setIndikator(e.target.value)}
                      placeholder="Contoh: Kepatuhan pemasangan kateter urine mencapai 100%"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Strategi / Rencana Tindak Lanjut
                  </label>
                  <textarea
                    rows={2}
                    value={rencana}
                    onChange={e => setRencana(e.target.value)}
                    placeholder="Contoh: Pelatihan berkala bundle CAUTI, audit mingguan, penyediaan checklist sterilisasi"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      PIC (Penanggung Jawab)
                    </label>
                    <input
                      type="text"
                      value={pic}
                      onChange={e => setPic(e.target.value)}
                      placeholder="mis. IPCN / Ka. Ruang"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Target Waktu
                    </label>
                    <input
                      type="text"
                      value={target}
                      onChange={e => setTarget(e.target.value)}
                      placeholder="mis. Triwulan II 2026"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Bukti Evaluasi
                    </label>
                    <input
                      type="text"
                      value={bukti}
                      onChange={e => setBukti(e.target.value)}
                      placeholder="mis. Laporan surveilans bulanan"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / Keterangan Tambahan
            </label>
            <input
              type="text"
              value={ket}
              onChange={e => setKet(e.target.value)}
              placeholder="Catatan latar belakang, sumber temuan atau riwayat inspeksi"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            {!editingRecord ? (
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepContext}
                  onChange={e => setKeepContext(e.target.checked)}
                  className="rounded text-[#0f4c5c] focus:ring-[#0f4c5c]"
                />
                <span>Pertahankan tahun &amp; unit untuk entri berikutnya</span>
              </label>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Hapus penilaian risiko ini?')) {
                    onDeleteRecord(editingRecord.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold border border-red-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Data Ini</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {!editingRecord && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Kosongkan
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0f4c5c] hover:bg-[#13677b] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0f4c5c]/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingRecord ? 'Simpan Perubahan' : 'Simpan Data Risiko'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Right: Side List of Saved Risks for this Unit & Year (1 col) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Data {activeUnit}
              </h3>
              <p className="text-[10px] text-slate-400">
                Tahun {tahun} &bull; {sideRecords.length} risiko tersimpan
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              {sideRecords.length} Item
            </span>
          </div>

          <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
            {sideRecords.length > 0 ? (
              sideRecords.map(r => {
                const c = calculateIcra(r);
                const rank = sideRanks[r.id];
                const isSelected = editingRecord?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      // Trigger edit on click
                      onSaveRecord(r);
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#0f4c5c] bg-teal-50/70 shadow-xs ring-1 ring-[#0f4c5c]'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <div className="font-semibold text-slate-900 line-clamp-2">
                        {r.masalah}
                      </div>
                      <div className="shrink-0 flex items-center gap-1">
                        {rank <= 3 && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-red-600 text-white">
                            P{rank}
                          </span>
                        )}
                        <span className="font-black text-[#0f4c5c] text-xs font-mono">
                          {c.score}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{r.subgrup || r.grup}</span>
                      <span className="font-mono">
                        L{r.L} I{r.I} S{r.S}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                Belum ada data risiko yang tersimpan untuk unit dan tahun ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
