import React from 'react';
import { RateComparisonBar } from './RateComparisonBar';

// Cross-floor version of RateComparisonBar: every floor's pair is scaled
// to one shared max across the whole group, so bar length compares
// intensity both within a floor and across floors at a glance.
export const RateComparisonSummary = ({ data }) => {
  const maxAbs = Math.max(
    0.0001,
    ...data.flatMap(d => [Math.abs(d.horizontal), Math.abs(d.vertical)])
  );

  return (
    <div className="space-y-3">
      {data.map(d => (
        <div key={d.name}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-sm font-medium text-gray-700">{d.name}</span>
          </div>
          <RateComparisonBar
            horizontalRate={d.horizontal}
            verticalRate={d.vertical}
            color={d.color}
            maxAbs={maxAbs}
          />
        </div>
      ))}
    </div>
  );
};
