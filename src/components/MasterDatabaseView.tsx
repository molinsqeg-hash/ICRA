import React, { useState, useMemo } from 'react';
import { MasterCatalogItem } from '../types';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Database,
  Tag,
  Folders,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface MasterDatabaseViewProps {
  catalog: MasterCatalogItem[];
  onSaveItem: (item: MasterCatalogItem) => void;
  onDeleteItem: (id: string) => void;
  onResetCatalog: () => void;
  onSelectForAssessment: (item: MasterCatalogItem) => void;
}

export const MasterDatabaseView: React.FC<MasterDatabaseViewProps> = ({
  catalog,
  onSaveItem,
  onDeleteItem,
  onResetCatalog,
  onSelectForAssessment
}) => {
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterSubgroup, setFilterSubgroup] = useState('');

  // Modal / Form state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterCatalogItem | null>(null);

  const [formGrup, setFormGrup] = useState('');
  const [formSubgrup, setFormSubgrup] = useState('');
  const [formMasalah, setFormMasalah] = useState('');
  const [formUnitTerkait, setFormUnitTerkait] = useState('');
  const [formKet, setFormKet] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Extract distinct groups and subgroups
  const distinctGroups = useMemo(() => {
    const s = Array.from(new Set(catalog.map(c => c.grup?.trim()))).filter(Boolean);
    return s.sort((a, b) => a.localeCompare(b));
  }, [catalog]);

  const distinctSubgroups = useMemo(() => {
    let filtered = catalog;
    if (filterGroup) {
      filtered = filtered.filter(c => c.grup === filterGroup);
    }
    const s = Array.from(new Set(filtered.map(c => c.subgrup?.trim()))).filter(Boolean);
    return s.sort((a, b) => a.localeCompare(b));
  }, [catalog, filterGroup]);

  // Filtered catalog list
  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => {
      if (filterGroup && item.grup !== filterGroup) return false;
      if (filterSubgroup && item.subgrup !== filterSubgroup) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const text = `${item.masalah} ${item.subgrup} ${item.grup} ${item.unitTerkait || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [catalog, filterGroup, filterSubgroup, search]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormGrup(distinctGroups[0] || 'Infeksi-infeksi yang penting secara epidemiologis (surveilans)');
    setFormSubgrup('');
    setFormMasalah('');
    setFormUnitTerkait('');
    setFormKet('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MasterCatalogItem) => {
    setEditingItem(item);
    setFormGrup(item.grup);
    setFormSubgrup(item.subgrup);
    setFormMasalah(item.masalah);
    setFormUnitTerkait(item.unitTerkait || '');
    setFormKet(item.keterangan || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGrup.trim() || !formSubgrup.trim() || !formMasalah.trim()) {
      alert('Grup Kategori, Sub Kategori, dan Potensial Risiko harus diisi.');
      return;
    }

    const item: MasterCatalogItem = {
      id: editingItem ? editingItem.id : `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      grup: formGrup.trim(),
      subgrup: formSubgrup.trim(),
      masalah: formMasalah.trim(),
      unitTerkait: formUnitTerkait.trim(),
      keterangan: formKet.trim()
    };

    onSaveItem(item);
    setIsModalOpen(false);
    setToastMsg(editingItem ? 'Master data berhasil diperbarui!' : 'Potensial risiko baru berhasil ditambahkan ke database!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportExcel = () => {
    const data = filteredCatalog.map((c, i) => ({
      'No': i + 1,
      'Grup Kategori PPI': c.grup,
      'Sub Kategori': c.subgrup,
      'Potensial Risiko / Masalah': c.masalah,
      'Unit / Departemen Terkait': c.unitTerkait || '',
      'Keterangan': c.keterangan || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Database Sub & Risiko');
    XLSX.writeFile(wb, `Master_Database_ICRA_Siloam_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0f4c5c]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0f4c5c]">
              Database Standar ICRA Siloam
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
            Database Sub Kategori &amp; Potensial Risiko
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pustaka referensi seluruh sub kategori dan potensi risiko infeksi yang terhubung otomatis ke formulir penilaian
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f4c5c] hover:bg-[#13677b] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Risiko Baru</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Potensial Risiko</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{catalog.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0f4c5c] flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Sub Kategori Terdaftar</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {Array.from(new Set(catalog.map(c => c.subgrup?.trim()))).filter(Boolean).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Grup Kategori PPI</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{distinctGroups.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Folders className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Cari potensi risiko, sub kategori..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
            />
          </div>

          {/* Filter Group */}
          <div>
            <select
              value={filterGroup}
              onChange={e => {
                setFilterGroup(e.target.value);
                setFilterSubgroup('');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none"
            >
              <option value="">Semua Grup Kategori ({distinctGroups.length})</option>
              {distinctGroups.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Subgroup */}
          <div>
            <select
              value={filterSubgroup}
              onChange={e => setFilterSubgroup(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none"
            >
              <option value="">Semua Sub Kategori ({distinctSubgroups.length})</option>
              {distinctSubgroups.map(sg => (
                <option key={sg} value={sg}>
                  Sub: {sg}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Menampilkan <b>{filteredCatalog.length}</b> dari <b>{catalog.length}</b> data standar
          </span>
          <div className="flex items-center gap-3">
            {(search || filterGroup || filterSubgroup) && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterGroup('');
                  setFilterSubgroup('');
                }}
                className="text-[#0f4c5c] font-semibold hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('Kembalikan database master ke daftar bawaan standar Siloam ICRA?')) {
                  onResetCatalog();
                  setToastMsg('Database master berhasil dikembalikan ke standar awal.');
                  setTimeout(() => setToastMsg(null), 3000);
                }
              }}
              className="text-xs text-slate-400 hover:text-orange-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset ke Standar Awal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table of Database items */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">No</th>
                <th className="py-2.5 px-3 w-44">Sub Kategori</th>
                <th className="py-2.5 px-3">Potensial Risiko / Masalah</th>
                <th className="py-2.5 px-3 w-56">Grup Kategori PPI</th>
                <th className="py-2.5 px-3 w-40">Unit Terkait</th>
                <th className="py-2.5 px-3 text-right w-44">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCatalog.length > 0 ? (
                filteredCatalog.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
                        {item.subgrup || '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {item.masalah}
                      {item.keterangan && (
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                          {item.keterangan}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="line-clamp-2" title={item.grup}>
                        {item.grup}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      <span className="truncate block max-w-[150px]" title={item.unitTerkait}>
                        {item.unitTerkait || 'Semua Unit'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectForAssessment(item)}
                          title="Gunakan untuk Penilaian Baru"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-50 hover:bg-[#0f4c5c] text-teal-800 hover:text-white font-semibold text-[10px] transition-colors cursor-pointer"
                        >
                          <span>Gunakan</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit Master Data"
                          className="p-1 text-slate-400 hover:text-[#0f4c5c] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus "${item.masalah}" dari database master?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          title="Hapus dari Master"
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    Tidak ditemukan item yang cocok dengan pencarian di database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Master Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingItem ? 'Edit Item Database Master' : 'Tambah Potensial Risiko / Sub Kategori Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Item ini akan langsung tersedia di pilihan otomatis pada Formulir Input Data Risiko.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Grup Kategori PPI *
                </label>
                <input
                  type="text"
                  list="groupSuggestions"
                  value={formGrup}
                  onChange={e => setFormGrup(e.target.value)}
                  placeholder="Pilih atau ketik grup kategori PPI"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
                <datalist id="groupSuggestions">
                  {distinctGroups.map(g => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sub Kategori *
                </label>
                <input
                  type="text"
                  list="subgroupSuggestions"
                  value={formSubgrup}
                  onChange={e => setFormSubgrup(e.target.value)}
                  placeholder="mis. HAIs, Bundle SSI, Laboratorium, Linen, Food safety"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
                <datalist id="subgroupSuggestions">
                  {distinctSubgroups.map(sg => (
                    <option key={sg} value={sg} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Potensial Risiko / Masalah *
                </label>
                <textarea
                  rows={2}
                  value={formMasalah}
                  onChange={e => setFormMasalah(e.target.value)}
                  placeholder="Ketik deskripsi masalah risiko potensial..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit Terkait (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formUnitTerkait}
                    onChange={e => setFormUnitTerkait(e.target.value)}
                    placeholder="mis. ICU, OT, Laboratorium"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Keterangan
                  </label>
                  <input
                    type="text"
                    value={formKet}
                    onChange={e => setFormKet(e.target.value)}
                    placeholder="mis. Standar ICRA 2026/2027"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f4c5c] hover:bg-[#13677b] text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan ke Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
