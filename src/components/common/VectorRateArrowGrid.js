import React from 'react';
import { VectorRateArrow } from './VectorRateArrow';

// Cross-floor version of VectorRateArrow: one arrow figure per floor, all
// sharing the same scaleMax as every other VectorRateArrow on the page, so
// arrow length is comparable both within a floor and across floors. No
// click-to-resize — the shared shrink-to-compare feature was dropped once
// the per-floor cards stopped participating in it, leaving only these three
// figures to toggle, which wasn't worth the interaction on its own. Instead,
// size responds to viewport: small (135px, matching a "shrunk" figure
// elsewhere) on mobile, full (270px) from the same `sm:` breakpoint where
// the grid itself switches from a single column to three.
//
// Desktop always fits all three figures in one row; on a narrow (mobile)
// viewport, one figure per row instead.
export const VectorRateArrowGrid = ({ data, scaleMax }) => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
    {data.map(d => (
      <div key={d.name}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
          <span className="text-sm font-medium text-gray-700">{d.name}</span>
        </div>
        <div className="w-[135px] sm:w-[270px]">
          <VectorRateArrow horizontalRate={d.horizontal} verticalRate={d.vertical} scaleMax={scaleMax} id={d.name} />
        </div>
      </div>
    ))}
  </div>
);
