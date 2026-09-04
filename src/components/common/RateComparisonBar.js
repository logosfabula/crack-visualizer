import React from 'react';

const ROWS = [
  { key: 'horizontal', label: 'Horizontal', positiveWord: 'expanding', negativeWord: 'closing' },
  { key: 'vertical', label: 'Vertical', positiveWord: 'rising', negativeWord: 'sinking' }
];

// Compact diverging bar pair for a single floor: horizontal and vertical
// rate (mm/week, signed) drawn as bars growing left/right from a zero
// centerline, scaled to whichever of the two is larger in magnitude — so
// relative strength and direction are both visible without reading numbers.
export const RateComparisonBar = ({ horizontalRate, verticalRate, color }) => {
  const maxAbs = Math.max(Math.abs(horizontalRate), Math.abs(verticalRate), 0.0001);
  const values = { horizontal: horizontalRate, vertical: verticalRate };

  return (
    <div className="space-y-1.5">
      {ROWS.map(row => {
        const value = values[row.key];
        const percent = Math.min(50, (Math.abs(value) / maxAbs) * 50);
        const isPositive = value > 0;
        return (
          <div key={row.key} className="flex items-center gap-2 text-xs">
            <span className="w-16 text-gray-600 flex-shrink-0">{row.label}</span>
            <div className="relative flex-1 h-3 bg-gray-100 rounded overflow-hidden">
              <div className="absolute inset-y-0 left-1/2 w-px bg-gray-400" />
              <div
                className="absolute inset-y-0 rounded"
                style={{
                  backgroundColor: color,
                  left: isPositive ? '50%' : `${50 - percent}%`,
                  width: `${percent}%`
                }}
              />
            </div>
            <span className="font-mono text-gray-600 w-28 text-right flex-shrink-0">
              {value.toFixed(4)} mm/wk
              {value !== 0 && (
                <span className="text-gray-400"> ({isPositive ? row.positiveWord : row.negativeWord})</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};
