import React from 'react';

export interface HBarRow {
  label: string;
  subLabel?: string;
  total: number;
  totalLabel?: string | number;
  isPriority?: boolean;
  segments?: {
    value: number;
    color: string;
    label: string;
  }[];
}

interface HBarChartProps {
  title?: string;
  rows: HBarRow[];
  axisLabel?: string;
}

export const HBarChart: React.FC<HBarChartProps> = ({ title, rows, axisLabel }) => {
  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
        Belum ada data untuk ditampilkan
      </div>
    );
  }

  const maxVal = Math.max(...rows.map(r => r.total), 1);

  return (
    <div className="space-y-3">
      {title && <h4 className="text-xs font-bold text-slate-800">{title}</h4>}
      <div className="space-y-2">
        {rows.map((row, idx) => {
          const pct = Math.min(100, Math.max(4, (row.total / maxVal) * 100));
          return (
            <div key={`hbar-${idx}`} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="truncate max-w-[70%] text-slate-700 font-medium group-hover:text-[#0f4c5c] transition-colors" title={row.label}>
                  {row.label}
                  {row.subLabel && (
                    <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                      &bull; {row.subLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {row.isPriority && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 border border-red-200">
                      Prioritas
                    </span>
                  )}
                  <span className="font-bold text-slate-800 text-xs">
                    {row.totalLabel ?? row.total}
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                {row.segments && row.segments.length > 0 ? (
                  row.segments.map((seg, sIdx) => {
                    const segPct = (seg.value / maxVal) * 100;
                    if (segPct <= 0) return null;
                    return (
                      <div
                        key={`seg-${sIdx}`}
                        style={{ width: `${segPct}%`, backgroundColor: seg.color }}
                        className="h-full transition-all duration-300"
                        title={`${seg.label}: ${seg.value}`}
                      />
                    );
                  })
                ) : (
                  <div
                    style={{
                      width: `${pct}%`,
                      backgroundColor: row.isPriority ? '#d03b3b' : '#13677b'
                    }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {axisLabel && (
        <div className="text-[11px] text-slate-400 text-right italic pt-1">
          {axisLabel}
        </div>
      )}
    </div>
  );
};
