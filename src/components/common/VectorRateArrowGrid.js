import React from 'react';
import { VectorRateArrow } from './VectorRateArrow';

// Cross-floor version of VectorRateArrow: one arrow figure per floor, all
// sharing the same scaleMax as every other VectorRateArrow on the page, so
// arrow length is comparable both within a floor and across floors.
export const VectorRateArrowGrid = ({ data, scaleMax }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    {data.map(d => (
      <div key={d.name}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
          <span className="text-sm font-medium text-gray-700">{d.name}</span>
        </div>
        <div className="max-w-[140px]">
          <VectorRateArrow horizontalRate={d.horizontal} verticalRate={d.vertical} scaleMax={scaleMax} id={d.name} />
        </div>
      </div>
    ))}
  </div>
);
