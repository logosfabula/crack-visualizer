import React from 'react';

const ROWS = [
  { key: 'horizontal', label: 'Horizontal', positiveWord: 'expanding', negativeWord: 'closing' },
  { key: 'vertical', label: 'Vertical', positiveWord: 'rising', negativeWord: 'sinking' }
];

// Compact bar pair for a single floor: horizontal and vertical rate
// (mm/week) drawn as same-direction, magnitude-only bars (both growing
// from zero), so their length is directly comparable at a glance — sign
// is only carried by the word next to the number, not by bar direction.
// `maxAbs` lets a caller impose a shared scale (e.g. across floors); left
// unset, the pair scales to its own larger magnitude.
export const RateComparisonBar = ({ horizontalRate, verticalRate, color, maxAbs }) => {
  const scale = maxAbs ?? Math.max(Math.abs(horizontalRate), Math.abs(verticalRate), 0.0001);
  const values = { horizontal: horizontalRate, vertical: verticalRate };

  return (
    <div className="space-y-1.5">
      {ROWS.map(row => {
        const value = values[row.key];
        const percent = Math.min(100, (Math.abs(value) / scale) * 100);
        const isPositive = value > 0;
        return (
          <div key={row.key} className="flex items-center gap-2 text-xs">
            <span className="w-16 text-gray-600 flex-shrink-0">{row.label}</span>
            <div className="relative flex-1 h-3 bg-gray-100 rounded overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded"
                style={{ backgroundColor: color, width: `${percent}%` }}
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
