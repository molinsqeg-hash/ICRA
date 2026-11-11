import React from 'react';

export interface VBarCol {
  label: string;
  subLabel?: string;
  total: number;
  segments?: {
    value: number;
    color: string;
    label: string;
  }[];
}

interface VBarChartProps {
  title?: string;
  cols: VBarCol[];
  yLabel?: string;
}

export const VBarChart: React.FC<VBarChartProps> = ({ title, cols, yLabel }) => {
  if (cols.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
        Belum ada data
      </div>
    );
  }

  const maxVal = Math.max(...cols.map(c => c.total), 1);

  return (
    <div className="space-y-3">
      {title && <h4 className="text-xs font-bold text-slate-800">{title}</h4>}
      <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-200">
        {cols.map((col, idx) => {
          const heightPct = Math.min(100, Math.max(8, (col.total / maxVal) * 100));

          return (
            <div
              key={`vbar-${idx}`}
              className="flex-1 flex flex-col items-center justify-end h-full group"
            >
              {/* Number tooltip / total on top */}
              <div className="text-[11px] font-bold text-slate-700 mb-1.5 transition-transform group-hover:scale-110">
                {col.total}
              </div>

              {/* Bar */}
              <div className="w-full max-w-[48px] h-full flex flex-col justify-end bg-slate-100 rounded-t-lg overflow-hidden">
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full flex flex-col-reverse rounded-t-lg overflow-hidden transition-all duration-300"
                >
                  {col.segments && col.segments.length > 0 ? (
                    col.segments.map((seg, sIdx) => {
                      const segHeightPct = (seg.value / col.total) * 100;
                      if (segHeightPct <= 0) return null;
                      return (
                        <div
                          key={`vseg-${sIdx}`}
                          style={{
                            height: `${segHeightPct}%`,
                            backgroundColor: seg.color
                          }}
                          className="w-full transition-all"
                          title={`${seg.label}: ${seg.value}`}
                        />
                      );
                    })
                  ) : (
                    <div
                      style={{ height: '100%', backgroundColor: '#2a78d6' }}
                      className="w-full rounded-t-lg"
                    />
                  )}
                </div>
              </div>

              {/* Label below axis */}
              <div className="mt-2 text-center">
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  {col.label}
                </div>
                {col.subLabel && (
                  <div className="text-[9px] text-slate-400 leading-none mt-0.5 max-w-[60px] truncate">
                    {col.subLabel}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {yLabel && (
        <div className="text-[10px] text-slate-400 text-left italic">
          {yLabel}
        </div>
      )}
    </div>
  );
};
