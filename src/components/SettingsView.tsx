import React, { useState, useRef } from 'react';
import { HospitalProfile, IcraRecord } from '../types';
import {
  Save,
  Download,
  Upload,
  Copy,
  RotateCcw,
  CheckCircle2,
  Building2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { clearAllRecords, getDistinctUnits, getDistinctYears } from '../utils/storage';

interface SettingsViewProps {
  profile: HospitalProfile;
  records: IcraRecord[];
  onSaveProfile: (profile: HospitalProfile) => void;
  onRestoreBackup: (records: IcraRecord[], profile?: HospitalProfile) => void;
  onCopyYear: (fromYear: number, toYear: number, unitFilter?: string) => void;
  onResetSeedData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  records,
  onSaveProfile,
  onRestoreBackup,
  onCopyYear,
  onResetSeedData
}) => {
  const [formProfile, setFormProfile] = useState<HospitalProfile>({ ...profile });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [fromYear, setFromYear] = useState<number>(profile.year || 2026);
  const [toYear, setToYear] = useState<number>((profile.year || 2026) + 1);
  const [copyUnit, setCopyUnit] = useState<string>('');

  const fileBackupRef = useRef<HTMLInputElement>(null);

  const distinctYears = getDistinctYears(records);
  const distinctUnits = getDistinctUnits(records);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formProfile);
    setToastMsg('Pengaturan identitas rumah sakit berhasil disimpan!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleBackupDownload = () => {
    const backupData = {
      app: 'Siloam-ICRA-Dashboard',
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: formProfile,
      records
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_ICRA_Siloam_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
  };

  const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (!json || !Array.isArray(json.records)) {
          alert('Format file backup tidak sesuai (file harus mengandung array records).');
          return;
        }

        const isReplace = confirm(
          `File backup memuat ${json.records.length} data risiko.\n\nKlik OK untuk MEMPERBARUI data, atau Batal untuk keluar.`
        );
        if (!isReplace) return;

        onRestoreBackup(json.records, json.profile);
        setToastMsg(`Restore berhasil: ${json.records.length} data risiko dipulihkan!`);
        setTimeout(() => setToastMsg(null), 4000);
      } catch (err: any) {
        alert('Gagal membaca file backup: ' + err?.message);
      }
    };
    reader.readAsText(file);
    if (fileBackupRef.current) fileBackupRef.current.value = '';
  };

  const handleCopySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromYear === toYear) {
      alert('Tahun asal dan tahun tujuan tidak boleh sama.');
      return;
    }

    if (
      confirm(
        `Salin semua penilaian risiko dari Tahun ${fromYear} ke Tahun ${toYear}${
          copyUnit ? ` untuk unit "${copyUnit}"` : ''
        }?`
      )
    ) {
      onCopyYear(fromYear, toYear, copyUnit || undefined);
      setToastMsg(`Berhasil menyalin data risiko ke Tahun ${toYear}!`);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0f4c5c]">
          Konfigurasi &amp; Database
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
          Pengaturan &amp; Cadangan Data
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Identitas penandatangan laporan, pencadangan database JSON, dan penyalinan data tahunan
        </p>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Hospital Profile & Signatories Form */}
        <form
          onSubmit={handleProfileSubmit}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-[#0f4c5c]" />
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Identitas Rumah Sakit &amp; Penandatangan
              </h2>
              <p className="text-[11px] text-slate-500">
                Data ini dicantumkan pada header dan lembar persetujuan dokumen laporan ICRA
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Rumah Sakit
            </label>
            <input
              type="text"
              value={formProfile.hospital}
              onChange={e => setFormProfile({ ...formProfile, hospital: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tahun Default Penilaian
            </label>
            <input
              type="number"
              value={formProfile.year}
              onChange={e => setFormProfile({ ...formProfile, year: Number(e.target.value) })}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Yang Membuat
              </label>
              <input
                type="text"
                value={formProfile.maker}
                onChange={e => setFormProfile({ ...formProfile, maker: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jabatan Pembuat
              </label>
              <input
                type="text"
                value={formProfile.makerRole}
                onChange={e => setFormProfile({ ...formProfile, makerRole: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mengetahui (Ketua Komite PPI)
              </label>
              <input
                type="text"
                value={formProfile.chair}
                onChange={e => setFormProfile({ ...formProfile, chair: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jabatan Mengetahui
              </label>
              <input
                type="text"
                value={formProfile.chairRole}
                onChange={e => setFormProfile({ ...formProfile, chairRole: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Menyetujui (Direktur)
              </label>
              <input
                type="text"
                value={formProfile.director}
                onChange={e => setFormProfile({ ...formProfile, director: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jabatan Menyetujui
              </label>
              <input
                type="text"
                value={formProfile.directorRole}
                onChange={e => setFormProfile({ ...formProfile, directorRole: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0f4c5c] hover:bg-[#13677b] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Identitas Laporan</span>
            </button>
          </div>
        </form>

        {/* Right: Data Management, Backup & Rollover */}
        <div className="space-y-6">
          {/* Backup & Restore Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                  Cadangkan &amp; Pulihkan Database (JSON)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Data tersimpan secara aman di browser lokal komputer Anda
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed">
              Saat ini terdapat <b>{records.length}</b> rekaman penilaian risiko di dalam sistem.
              Disarankan untuk mengunduh cadangan JSON secara berkala sebelum pembaruan besar.
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleBackupDownload}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Cadangan (.json)</span>
              </button>

              <input
                type="file"
                ref={fileBackupRef}
                onChange={handleBackupUpload}
                accept=".json"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileBackupRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Pulihkan dari File (.json)</span>
              </button>
            </div>
          </div>

          {/* Copy Assessments to New Year (Rollover) */}
          <form
            onSubmit={handleCopySubmit}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Copy className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                  Salin Penilaian ke Tahun Baru (Rollover)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Duplikasi item risiko dari tahun berjalan untuk dilakukan reassessment tahun depan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Dari Tahun
                </label>
                <select
                  value={fromYear}
                  onChange={e => setFromYear(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold"
                >
                  {distinctYears.map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ke Tahun Baru
                </label>
                <input
                  type="number"
                  value={toYear}
                  onChange={e => setToYear(Number(e.target.value))}
                  min={2020}
                  max={2035}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Filter Unit (Opsional)
                </label>
                <select
                  value={copyUnit}
                  onChange={e => setCopyUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="">Semua Unit</option>
                  {distinctUnits.map(u => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Data ke Tahun {toYear}</span>
              </button>
            </div>
          </form>

          {/* Reset to Seed Data */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-orange-600" />
              <span>Muat Ulang Data Awal Siloam ICRA</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Jika diperlukan, Anda dapat mengembalikan data ke kondisi awal dari dokumen ICRA Siloam
              Hospitals TB Simatupang 2026 (~100+ rekaman standar).
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Muat ulang data awal ICRA Siloam? Data kustom yang belum dicadangkan akan tertimpa.')) {
                    onResetSeedData();
                    setToastMsg('Data awal Siloam ICRA berhasil dimuat ulang!');
                    setTimeout(() => setToastMsg(null), 3000);
                  }
                }}
                className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Muat Ulang Data Awal SHTB 2026
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
