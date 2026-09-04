import React, { useState } from 'react';
import { VectorRateArrow } from './VectorRateArrow';
import { ResizableFigure } from './ResizableFigure';

// Cross-floor version of VectorRateArrow: one arrow figure per floor, all
// sharing the same scaleMax as every other VectorRateArrow on the page, so
// arrow length is comparable both within a floor and across floors. The
// figures share one shrink/enlarge state — clicking any of them resizes
// all of them together, since they're meant to be read as one group, not
// compared one at a time.
export const VectorRateArrowGrid = ({ data, scaleMax }) => {
  const [shrunk, setShrunk] = useState(false);
  const toggle = () => setShrunk(v => !v);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.map(d => (
        <div key={d.name}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-sm font-medium text-gray-700">{d.name}</span>
          </div>
          <ResizableFigure shrunk={shrunk} onToggle={toggle} label="all floors' horizontal vs. vertical rate">
            <VectorRateArrow horizontalRate={d.horizontal} verticalRate={d.vertical} scaleMax={scaleMax} id={d.name} />
          </ResizableFigure>
        </div>
      ))}
    </div>
  );
};
