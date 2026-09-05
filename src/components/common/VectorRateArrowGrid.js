import React from 'react';
import { VectorRateArrow } from './VectorRateArrow';

// Cross-floor version of VectorRateArrow: one arrow figure per floor, all
// sharing the same scaleMax as every other VectorRateArrow on the page, so
// arrow length is comparable both within a floor and across floors. No
// click-to-resize — the shared shrink-to-compare feature was dropped once
// the per-floor cards stopped participating in it, leaving only these three
// figures to toggle, which wasn't worth the interaction on its own. Instead,
// size responds to viewport: 135px in mobile portrait, smaller still
// (100px) in mobile landscape — two side-by-side figures have noticeably
// less vertical room in landscape — and full (270px) from the same `sm:`
// breakpoint where the grid itself switches from two columns to three.
// max-sm:landscape: shares its breakpoint with sm:, so the two rules stay
// mutually exclusive rather than racing each other in a mid-range overlap.
//
// Desktop always fits all three figures in one row; on a narrow (mobile)
// viewport, two per row (two rows for three floors, the third left-aligned)
// — small enough that two side by side is comfortable.
export const VectorRateArrowGrid = ({ data, scaleMax }) => (
  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
    {data.map(d => (
      <div key={d.name}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
          <span className="text-sm font-medium text-gray-700">{d.name}</span>
        </div>
        <div className="w-[135px] max-sm:landscape:w-[100px] sm:w-[270px]">
          <VectorRateArrow horizontalRate={d.horizontal} verticalRate={d.vertical} scaleMax={scaleMax} id={d.name} />
        </div>
      </div>
    ))}
  </div>
);
