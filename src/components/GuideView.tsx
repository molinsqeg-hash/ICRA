import React from 'react';
import { RISK_LEVELS, SCORING_CRITERIA } from '../constants';
import { ShieldAlert, BookOpen, AlertCircle, Award } from 'lucide-react';

export const GuideView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0f4c5c]">
          Standar &amp; Regulasi Komite PPI
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
          Panduan Penetapan Risiko ICRA
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pedoman resmi penentuan bobot Likelihood, Impact, dan Kesiapan Sistem di Rumah Sakit Siloam
        </p>
      </div>

      {/* Formula Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0f4c5c] to-[#13677b] text-white shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-white/10 text-white shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight">
              Formula Perhitungan Skor ICRA
            </h2>
            <div className="mt-2 text-sm sm:text-lg font-mono font-black bg-white/15 px-3 py-1.5 rounded-xl inline-block border border-white/20">
              SKOR ICRA = Likelihood (L) &times; Impact (I) &times; Current System (S)
            </div>
            <p className="text-xs text-teal-100 mt-2 leading-relaxed">
              Tingkat risiko diklasifikasikan dari hasil perkalian tiga parameter penilaian:
              <b> Significant</b> (Skor &ge; 15), <b> High</b> (10–14), <b> Moderate</b> (5–9), dan <b> Low</b> (1–4).
              Urutan Prioritas ditetapkan berdasarkan skor ICRA tertinggi dalam setiap unit dan tahun.
            </p>
          </div>
        </div>
      </div>

      {/* Tingkat Risiko Table */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#0f4c5c]" />
          <span>Matriks Klasifikasi Tingkat Risiko &amp; Tindakan Penanganan</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-36">Tingkat Risiko</th>
                <th className="py-2.5 px-3 w-28 text-center">Rentang Skor</th>
                <th className="py-2.5 px-3">Tindakan Pengendalian / Rekomendasi Manajerial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RISK_LEVELS.map(l => (
                <tr key={l.key} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3">
                    <span
                      style={{
                        backgroundColor: l.bgColor,
                        color: l.textColor,
                        borderColor: l.borderColor
                      }}
                      className="px-2.5 py-1 rounded-full text-xs font-bold border inline-block"
                    >
                      {l.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800 font-mono">
                    {l.range}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 leading-relaxed">
                    {l.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Parameter Grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Likelihood */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900">
              1. Likelihood / Probability (Frekuensi)
            </h3>
            <p className="text-[11px] text-slate-500">Kemungkinan terjadinya insiden risiko</p>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(v => (
              <div key={`guide-l-${v}`} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Nilai {v} &bull; {SCORING_CRITERIA.L.lbl[v]}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  {SCORING_CRITERIA.L.desc[v]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900">
              2. Consequences / Impact (Dampak)
            </h3>
            <p className="text-[11px] text-slate-500">Keparahan dampak klinis &amp; operasional</p>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(v => (
              <div key={`guide-i-${v}`} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Nilai {v} &bull; {SCORING_CRITERIA.I.lbl[v]}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  {SCORING_CRITERIA.I.desc[v]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current System */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900">
              3. Current System (Kesiapan Sistem)
            </h3>
            <p className="text-[11px] text-slate-500">Ketersediaan regulasi, fasilitas, dan kepatuhan</p>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(v => (
              <div key={`guide-s-${v}`} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Nilai {v} &bull; {SCORING_CRITERIA.S.lbl[v]}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  {SCORING_CRITERIA.S.desc[v]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
