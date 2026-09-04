// Configuration for the weighted Theil-Sen ETA regression.

// Degrees of orthogonality deviation at which a reading's weight is halved.
// Matches the ">2°: consider measurement verification" threshold already
// shown in SingleReadingView, so a reading right at that existing warning
// line counts for about half as much as a perfectly orthogonal one.
export const ANGLE_DEVIATION_HALF_WEIGHT = 2.0;

// Displacement thresholds ETAs are projected for, in mm.
export const ETA_THRESHOLDS_MM = [1, 2, 5];

export const BOOTSTRAP_ITERATIONS = 500;

// A linear fit shouldn't be trusted arbitrarily far past the span it was
// actually observed over (a near-zero but technically nonzero slope still
// has a finite quadratic root — without a cap that turns into ETAs
// centuries out). Projections beyond this multiple of the observed
// monitoring span are reported as "not reached" rather than a real date.
export const MAX_EXTRAPOLATION_MULTIPLE = 10;

// Below this rate, a method reports "insufficient movement" rather than a
// (potentially huge or divide-by-near-zero) projected ETA.
export const RATE_EPSILON_MM_PER_WEEK = 0.0001;

// Which displacement component an ETA is solved for: the combined 2D
// magnitude (default, historical behavior), or a single axis analyzed on
// its own — lets the user compare whether sinking (vertical) or outward
// pull (horizontal) is the stronger driver.
export const ETA_COMPONENTS = {
  COMBINED: 'combined',
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
};

export const DEFAULT_ETA_COMPONENT = ETA_COMPONENTS.COMBINED;

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
