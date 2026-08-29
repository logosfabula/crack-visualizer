import { RATE_EPSILON_MM_PER_WEEK } from '../../../constants/regressionConfig';

// The original method this app used before v0.16.0: a straight line between
// only the first and last reading, ignoring every point in between. Kept
// as a selectable baseline so it can be compared against sturdier methods,
// not because it's recommended — see TheilSenEstimator for why it isn't.
export class SecantEstimator {
  static id = 'secant';
  static label = 'Secant (first → last reading)';

  static methodology = 'Straight-line rate from the first reading to the last, projected forward from today. No confidence range: a 2-point fit has nothing to resample.';

  static describe({ rawReadingCount }) {
    const ignored = Math.max(0, rawReadingCount - 2);
    return ignored > 0
      ? `Uses only the first and last reading — ${ignored} intermediate reading${ignored === 1 ? '' : 's'} ignored`
      : 'Uses the first and last reading';
  }

  // readings: deduplicated [{ t, x, y }], sorted by t. Dedup never removes
  // the true first/last reading (a run can only collapse toward its later
  // member), so this method's result is unaffected by deduplication.
  static compute({ readings, tNow, thresholds }) {
    const first = readings[0];
    const last = readings[readings.length - 1];
    const directDistance = Math.hypot(last.x - first.x, last.y - first.y);
    const daysDiff = last.t - first.t;
    const rateMmPerDay = daysDiff > 0 ? directDistance / daysDiff : 0;
    const rateMmPerWeek = rateMmPerDay * 7;

    const thresholdResults = thresholds.map(threshold => {
      if (rateMmPerWeek < RATE_EPSILON_MM_PER_WEEK) {
        return { threshold, reached: false, etaT: null };
      }
      const etaT = threshold / rateMmPerDay; // days since first reading; constant-rate radial model
      return etaT >= tNow
        ? { threshold, reached: true, etaT }
        : { threshold, reached: false, etaT: null };
    });

    return { rateMmPerWeek, thresholdResults };
  }
}
