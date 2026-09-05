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
// less vertical room in landscape — and full (270px) only from `lg:` up.
//
// The full-size threshold deliberately isn't `sm:`/`md:` (640/768px): a
// phone rotated to landscape is routinely *wider* than either — large
// phones can exceed 900px — so a low width-only breakpoint reads a
// landscape phone as "desktop" and hands it the big, non-mobile size,
// overflowing the row. `lg:` (1024px) is comfortably above any phone's
// landscape width, so `max-lg:landscape:` and `lg:` stay mutually
// exclusive across the width phones actually reach.
//
// The grid's own column count still switches at `sm:` — that's safe on
// its own, since three 100–135px figures fit easily even at a phone's
// full landscape width; it's only the *size* jump that needed pushing up.
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
        <div className="w-[135px] max-lg:landscape:w-[100px] lg:w-[270px]">
          <VectorRateArrow horizontalRate={d.horizontal} verticalRate={d.vertical} scaleMax={scaleMax} id={d.name} />
        </div>
      </div>
    ))}
  </div>
);
