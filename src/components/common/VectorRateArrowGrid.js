import React from 'react';
import { VectorRateArrow } from './VectorRateArrow';
import { ResizableFigure } from './ResizableFigure';

// Cross-floor version of VectorRateArrow: one arrow figure per floor, all
// sharing the same scaleMax as every other VectorRateArrow on the page, so
// arrow length is comparable both within a floor and across floors.
// `shrunk`/`onToggle` are controlled from the caller, which shares the same
// pair with every other Horizontal vs. Vertical Rate figure on the page —
// clicking any one of them (here or per-floor) resizes all of them
// together, since they're meant to be read as one group, not compared one
// figure at a time.
export const VectorRateArrowGrid = ({ data, scaleMax, shrunk, onToggle }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {data.map(d => (
      <div key={d.name}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
          <span className="text-sm font-medium text-gray-700">{d.name}</span>
        </div>
        <ResizableFigure shrunk={shrunk} onToggle={onToggle} label="all horizontal vs. vertical rate figures">
          <VectorRateArrow horizontalRate={d.horizontal} verticalRate={d.vertical} scaleMax={scaleMax} id={d.name} />
        </ResizableFigure>
      </div>
    ))}
  </div>
);
