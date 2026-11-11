import React, { useState } from 'react';
import { IcraRecord } from '../types';
import { calculateIcra, SCORING_CRITERIA } from '../constants';

interface RiskMatrixChartProps {
  records: IcraRecord[];
  ranks: Record<string, number>;
}

interface MatrixCellData {
  L: number;
  I: number;
  product: number;
  no: number;
  items: IcraRecord[];
  maxScore: number;
  priorityRanks: number[];
}

export const RiskMatrixChart: React.FC<RiskMatrixChartProps> = ({ records, ranks }) => {
  const [selectedCell, setSelectedCell] = useState<MatrixCellData | null>(null);

  // Group records by (L, I)
  const cellMap: Record<string, IcraRecord[]> = {};
  records.forEach(r => {
    const key = `${r.L}_${r.I}`;
    if (!cellMap[key]) cellMap[key] = [];
    cellMap[key].push(r);
  });

  const cells: MatrixCellData[] = Object.entries(cellMap).map(([key, items]) => {
    const [Lstr, Istr] = key.split('_');
    const L = Number(Lstr);
    const I = Number(Istr);
    items.sort((a, b) => calculateIcra(b).score - calculateIcra(a).score);
    const priorityRanks = Array.from(new Set(items.map(r => ranks[r.id]).filter(p => p <= 3))).sort(
      (a, b) => a - b
    );
    const maxScore = calculateIcra(items[0]).score;
    const bestRank = Math.min(...items.map(r => ranks[r.id] || 999));

    return {
      L,
      I,
      product: L * I,
      no: 0,
      items,
      maxScore,
      priorityRanks,
      _bestRank: bestRank
    } as any;
  });

  // Sort cells to assign numbering 1, 2, 3...
  cells.sort((a: any, b: any) => a._bestRank - b._bestRank || b.maxScore - a.maxScore || b.product - a.product);
  cells.forEach((c, idx) => {
    c.no = idx + 1;
  });

  const indexedMap: Record<string, MatrixCellData> = {};
  cells.forEach(c => {
    indexedMap[`${c.L}_${c.I}`] = c;
  });

  const getCellColor = (val: number) => {
    if (val >= 15) return '#ff7a7a'; // high/extreme
    if (val >= 10) return '#fed7aa'; // amber
    if (val >= 5) return '#fef08a'; // yellow
    return '#86efac'; // soft green
  };

  const impactLabels: Record<number, string> = {
    5: 'Catastrophic (5)',
    4: 'Serious (4)',
    3: 'Prolonged (3)',
    2: 'Moderate (2)',
    1: 'Minimal (1)'
  };

  const likelihoodLabels: Record<number, string> = {
    1: 'Never (1)',
    2: 'Rare (2)',
    3: 'Maybe (3)',
    4: 'Likely (4)',
    5: 'Expect it (5)'
  };

  return (
    <div className="space-y-4">
      {/* Visual Grid Container */}
      <div className="relative overflow-x-auto bg-white p-3 sm:p-4 rounded-xl border border-slate-200">
        <div className="min-w-[540px]">
          {/* Top Label */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 tracking-wide">
              MATRIKS RISIKO (5×5)
            </span>
            <span className="text-[11px] text-slate-500">
              Titik lingkaran merah = Mengandung Prioritas 1–3
            </span>
          </div>

          <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-1.5 items-stretch">
            {/* Corner header */}
            <div className="flex flex-col items-center justify-center p-2 text-center text-[10px] font-bold text-slate-400 bg-slate-50 rounded-lg">
              <span>IMPACT &darr;</span>
              <span>LIKELIHOOD &rarr;</span>
            </div>

            {/* X-axis headers (Likelihood 1 to 5) */}
            {[1, 2, 3, 4, 5].map(l => (
              <div
                key={`head-L-${l}`}
                className="p-1.5 text-center bg-slate-100 rounded-lg text-slate-700 font-bold text-xs"
              >
                <div>{l}</div>
                <div className="text-[9px] font-medium text-slate-500 uppercase truncate">
                  {SCORING_CRITERIA.L.lbl[l]}
                </div>
              </div>
            ))}

            {/* Rows (Impact 5 down to 1) */}
            {[5, 4, 3, 2, 1].map(i => (
              <React.Fragment key={`row-${i}`}>
                {/* Y-axis label */}
                <div className="p-2 bg-slate-100 rounded-lg flex flex-col justify-center text-slate-700 font-bold text-xs">
                  <div>{i}</div>
                  <div className="text-[9px] font-medium text-slate-500 truncate">
                    {impactLabels[i].split(' ')[0]}
                  </div>
                </div>

                {/* 5 cells per row */}
                {[1, 2, 3, 4, 5].map(l => {
                  const product = l * i;
                  const cell = indexedMap[`${l}_${i}`];
                  const hasPriority = cell && cell.priorityRanks.length > 0;
                  const count = cell ? cell.items.length : 0;
                  const isSelected = selectedCell?.L === l && selectedCell?.I === i;

                  return (
                    <div
                      key={`cell-${l}-${i}`}
                      onClick={() => cell && setSelectedCell(isSelected ? null : cell)}
                      style={{ backgroundColor: getCellColor(product) }}
                      className={`relative min-h-[64px] p-1.5 rounded-lg border flex flex-col justify-between transition-all ${
                        cell ? 'cursor-pointer hover:shadow-md' : 'opacity-85'
                      } ${
                        isSelected
                          ? 'ring-3 ring-[#0f4c5c] border-[#0f4c5c] shadow-lg scale-[1.02] z-10'
                          : 'border-slate-300/60'
                      }`}
                    >
                      {/* Top coordinate multiplication */}
                      <span className="text-[11px] font-black text-slate-800/80 leading-none">
                        {product}
                      </span>

                      {/* Center risk count badge */}
                      {cell ? (
                        <div className="flex flex-col items-center justify-center my-0.5">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                              hasPriority
                                ? 'bg-red-600 text-white ring-2 ring-white animate-pulse'
                                : 'bg-slate-800 text-white'
                            }`}
                          >
                            {cell.no}
                          </div>
                          <span className="text-[9px] font-bold text-slate-800 mt-0.5">
                            {count} risiko
                          </span>
                        </div>
                      ) : (
                        <div className="flex-1"></div>
                      )}

                      {/* Bottom Priority indicator */}
                      <div className="text-right leading-none min-h-[10px]">
                        {hasPriority && (
                          <span className="inline-block text-[8.5px] font-extrabold text-red-900 bg-red-100/80 px-1 rounded-sm">
                            P{cell.priorityRanks.join(',')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Cell Detail Modal / Card */}
      {selectedCell && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-teal-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center text-[11px]">
                {selectedCell.no}
              </span>
              <span>
                Titik No {selectedCell.no} &bull; Likelihood {selectedCell.L} &times; Impact{' '}
                {selectedCell.I} = {selectedCell.product} ({selectedCell.items.length} Risiko)
              </span>
            </h4>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
            >
              ✕ Tutup
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {selectedCell.items.map(item => {
              const c = calculateIcra(item);
              const rank = ranks[item.id];
              return (
                <div
                  key={item.id}
                  className="p-2 bg-white rounded-lg border border-teal-100 text-xs flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{item.masalah}</div>
                    <div className="text-[10px] text-slate-500">
                      {item.unit} &bull; {item.subgrup || item.grup}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                      Skor {c.score}
                    </span>
                    {rank <= 3 && (
                      <span className="ml-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                        P{rank}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Matrix Key Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Daftar Titik Koordinat Matriks ({cells.length} Titik Terisi)
          </span>
          <span className="text-[11px] text-slate-500">Klik titik untuk melihat detail</span>
        </div>
        <div className="max-h-56 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold sticky top-0">
              <tr>
                <th className="py-1.5 px-2.5 text-center w-12">Titik</th>
                <th className="py-1.5 px-2 text-center w-16">L &times; I</th>
                <th className="py-1.5 px-2 text-center w-14">Jumlah</th>
                <th className="py-1.5 px-2 text-center w-20">Skor Max</th>
                <th className="py-1.5 px-2.5">Risiko Terkait</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cells.map(c => {
                const hasPrio = c.priorityRanks.length > 0;
                return (
                  <tr
                    key={`tbl-cell-${c.L}-${c.I}`}
                    onClick={() => setSelectedCell(c)}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="py-1.5 px-2 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                          hasPrio ? 'bg-red-600 text-white' : 'bg-slate-700 text-white'
                        }`}
                      >
                        {c.no}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-center font-medium">
                      {c.L} &times; {c.I}
                    </td>
                    <td className="py-1.5 px-2 text-center font-semibold text-slate-700">
                      {c.items.length}
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-[#0f4c5c]">
                      {c.maxScore}
                    </td>
                    <td className="py-1.5 px-2.5 text-slate-600">
                      <div className="truncate max-w-xs sm:max-w-md">
                        {c.items.slice(0, 3).map((it, idx) => (
                          <span key={it.id}>
                            {idx > 0 && '; '}
                            {it.masalah}
                            {ranks[it.id] <= 3 && (
                              <b className="text-red-600 font-bold ml-1">(P{ranks[it.id]})</b>
                            )}
                          </span>
                        ))}
                        {c.items.length > 3 && (
                          <span className="text-slate-400 ml-1">+{c.items.length - 3} lainnya</span>
                        )}
                      </div>
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
