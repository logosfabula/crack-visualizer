import React from 'react';
import { VectorRateArrow } from './VectorRateArrow';

const FULL_SIZE = 270;

// Cross-floor version of VectorRateArrow: one arrow figure per floor, all
// sharing the same scaleMax as every other VectorRateArrow on the page, so
// arrow length is comparable both within a floor and across floors. Always
// shown at full size — the shared shrink-to-compare feature was dropped
// once the per-floor cards stopped participating in it, leaving only these
// three figures to toggle, which wasn't worth the interaction on its own.
//
// Desktop always fits all three figures in one row; on a narrow (mobile)
// viewport, one full-size figure per row instead.
export const VectorRateArrowGrid = ({ data, scaleMax }) => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
    {data.map(d => (
      <div key={d.name}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
          <span className="text-sm font-medium text-gray-700">{d.name}</span>
        </div>
        <div style={{ maxWidth: `${FULL_SIZE}px` }}>
          <VectorRateArrow horizontalRate={d.horizontal} verticalRate={d.vertical} scaleMax={scaleMax} id={d.name} />
        </div>
      </div>
    ))}
  </div>
);
