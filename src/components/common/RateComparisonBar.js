import React from 'react';

const ROWS = [
  { key: 'horizontal', label: 'Horizontal', positiveWord: 'expanding', negativeWord: 'closing' },
  { key: 'vertical', label: 'Vertical', positiveWord: 'rising', negativeWord: 'sinking' }
];

// The current largest value fills this much of the track, not 100% — a
// full bar reads as "maxed out against some limit", which this scale
// doesn't have: it's just whatever is largest right now, and future
// readings can exceed it. Headroom keeps that visually honest.
const MAX_FILL_PERCENT = 80;

// Compact bar pair for a single floor: horizontal and vertical rate
// (mm/week) drawn as same-direction, magnitude-only bars (both growing
// from zero), so their length is directly comparable at a glance — sign
// is only carried by the word next to the number, not by bar direction.
// `maxAbs` should be the same shared scale passed to every other
// RateComparisonBar on the page (see CrackMovementVisualizer), so a given
// rate always renders at the same length wherever it's shown; left unset,
// the pair falls back to scaling against its own larger magnitude.
export const RateComparisonBar = ({ horizontalRate, verticalRate, color, maxAbs }) => {
  const scale = maxAbs ?? Math.max(Math.abs(horizontalRate), Math.abs(verticalRate), 0.0001);
  const values = { horizontal: horizontalRate, vertical: verticalRate };

  return (
    <div className="space-y-1.5">
      {ROWS.map(row => {
        const value = values[row.key];
        const percent = Math.min(MAX_FILL_PERCENT, (Math.abs(value) / scale) * MAX_FILL_PERCENT);
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
