// Configuration for the weighted Theil-Sen ETA regression.

// Degrees of orthogonality deviation at which a reading's weight is halved.
// Matches the ">2°: consider measurement verification" threshold already
// shown in SingleReadingView, so a reading right at that existing warning
// line counts for about half as much as a perfectly orthogonal one.
export const ANGLE_DEVIATION_HALF_WEIGHT = 2.0;

// Displacement thresholds ETAs are projected for, in mm.
export const ETA_THRESHOLDS_MM = [1, 2, 5];

export const BOOTSTRAP_ITERATIONS = 500;

// A linear fit shouldn't be trusted arbitrarily far into the future (a
// near-zero but technically nonzero slope still has a finite quadratic
// root — without a cap that turns into ETAs centuries out). Projections
// beyond this many years from today are reported as "not reached" rather
// than a real date. Fixed rather than scaled to the observed monitoring
// span — a floor watched for 20 years and one watched for 2 get the same
// trusted horizon, since the cap is about how far a straight-line
// projection is plausible at all, not about how much data backs it.
export const MAX_EXTRAPOLATION_YEARS = 100;

// Below this rate, a method reports "insufficient movement" rather than a
// (potentially huge or divide-by-near-zero) projected ETA.
export const RATE_EPSILON_MM_PER_WEEK = 0.0001;

// Continuous, always-positive weight from orthogonality deviation (degrees).
// A reading is never fully excluded, only discounted.
export const computeReadingWeight = (deviationDegrees) => {
  const deviation = deviationDegrees ?? 0;
  return 1 / (1 + Math.pow(deviation / ANGLE_DEVIATION_HALF_WEIGHT, 2));
};

// Boost for a point that absorbed several reconfirming readings during
// dedupeConsecutiveReadings (a run of k identical readings collapsed to
// one point with runLength = k). k independent checks that a stretch held
// flat is stronger evidence it's genuinely flat, not just under-sampled —
// but it must never multiply the point's influence linearly, or reconfirm
// count reintroduces the exact pairwise-slope inflation dedup exists to
// prevent (see dedupeConsecutiveReadings.js). Scaled as sqrt(k): matches
// how the standard error of a mean shrinks with the square root of
// independent observations, so it has diminishing returns rather than
// letting one long run dominate. Pairwise weight in TheilSen.fit is
// min(weight_i, weight_j), so a boosted point still can't outweigh a
// pairing with a lower-confidence point — the boost only compounds when
// BOTH points in a pair are well-confirmed.
export const computeConfirmationWeight = (runLength) => Math.sqrt(runLength ?? 1);
