import React, { useState } from 'react';
import { VectorRateArrow } from './VectorRateArrow';

const FULL_SIZE = 270;
const HALF_SIZE = FULL_SIZE / 2;

// Cross-floor version of VectorRateArrow: one arrow figure per floor, all
// sharing the same scaleMax as every other VectorRateArrow on the page, so
// arrow length is comparable both within a floor and across floors. Each
// figure is independently clickable/tappable to shrink to half size and
// back — useful for scanning all three at a glance once you already know
// which one you care about.
export const VectorRateArrowGrid = ({ data, scaleMax }) => {
  const [shrunk, setShrunk] = useState({});

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {data.map(d => {
        const isShrunk = !!shrunk[d.name];
        return (
          <div key={d.name}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-sm font-medium text-gray-700">{d.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setShrunk(prev => ({ ...prev, [d.name]: !prev[d.name] }))}
              className="block bg-transparent border-0 p-0 cursor-pointer"
              style={{ maxWidth: isShrunk ? `${HALF_SIZE}px` : `${FULL_SIZE}px`, transition: 'max-width 150ms ease' }}
              title={isShrunk ? 'Click to enlarge' : 'Click to shrink'}
              aria-label={`${isShrunk ? 'Enlarge' : 'Shrink'} ${d.name} horizontal vs. vertical rate figure`}
            >
              <VectorRateArrow horizontalRate={d.horizontal} verticalRate={d.vertical} scaleMax={scaleMax} id={d.name} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
