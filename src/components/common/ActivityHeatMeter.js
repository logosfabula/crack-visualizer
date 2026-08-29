import React from 'react';

// A relative activity gauge, not a projection: shows how much a floor's
// crack is moving in total (direction-agnostic, from Weekly Rate / Total
// Path) relative to the other floors currently monitored. Deliberately not
// an absolute scale — there's no literature-backed threshold for "how much
// weekly wobble is concerning" for this crack/building type, so this only
// ever answers "more or less active than the others right now."
export const ActivityHeatMeter = ({ rateMmPerWeek, maxRateMmPerWeek, color }) => {
  const fraction = maxRateMmPerWeek > 0 ? Math.min(1, rateMmPerWeek / maxRateMmPerWeek) : 0;
  const percent = Math.round(fraction * 100);

  const label = fraction < 0.01 ? 'No measurable activity'
    : fraction < 0.34 ? 'Lower activity'
    : fraction < 0.67 ? 'Moderate activity'
    : 'Highest activity';

  return (
    <div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {label} <span className="text-gray-400">(relative to the other floors, by cumulative path)</span>
      </div>
    </div>
  );
};
