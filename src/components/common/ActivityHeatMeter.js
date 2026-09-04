import React from 'react';

// A relative activity gauge, not a projection: shows how much a floor's
// crack is moving in total (direction-agnostic, from Weekly Rate / Total
// Path) relative to the other floors currently monitored. Deliberately not
// an absolute scale — there's no literature-backed threshold for "how much
// weekly wobble is concerning" for this crack/building type, so this only
// ever answers "more or less active than the others right now."
const activityFraction = (rateMmPerWeek, maxRateMmPerWeek) =>
  maxRateMmPerWeek > 0 ? Math.min(1, rateMmPerWeek / maxRateMmPerWeek) : 0;

// Exported so callers (e.g. the "Activity Gauge: <assessment>" title) can
// show the same word the bar itself represents, without duplicating the
// threshold logic.
export const getActivityAssessment = (rateMmPerWeek, maxRateMmPerWeek) => {
  const fraction = activityFraction(rateMmPerWeek, maxRateMmPerWeek);
  return fraction < 0.01 ? 'No measurable'
    : fraction < 0.34 ? 'Lower'
    : fraction < 0.67 ? 'Moderate'
    : 'Highest';
};

export const ActivityHeatMeter = ({ rateMmPerWeek, maxRateMmPerWeek, color }) => {
  const percent = Math.round(activityFraction(rateMmPerWeek, maxRateMmPerWeek) * 100);

  return (
    <div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">
        relative to the other floors, by cumulative path
      </div>
    </div>
  );
};
