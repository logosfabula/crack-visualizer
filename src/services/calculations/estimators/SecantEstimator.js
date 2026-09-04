import { RATE_EPSILON_MM_PER_WEEK } from '../../../constants/regressionConfig';
import { LinearThresholdSolver } from '../LinearThresholdSolver';

// The original method this app used before v0.16.0: a straight line between
// only the first and last reading, ignoring every point in between. Kept
// as a selectable baseline so it can be compared against sturdier methods,
// not because it's recommended — see TheilSenEstimator for why it isn't.
export class SecantEstimator {
  static id = 'secant';
  static label = 'Secant (first → last reading)';
  static directionLabel = 'the net change from first to last reading';

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
  // component: 'combined' (default) | 'horizontal' | 'vertical' — combined
  // uses the original constant-radial-rate model; horizontal/vertical solve
  // a linear crossing on that axis's own first->last rate instead.
  static compute({ readings, tNow, thresholds, component = 'combined' }) {
    const first = readings[0];
    const last = readings[readings.length - 1];
    const directDx = last.x - first.x;
    const directDy = last.y - first.y;
    const directDistance = Math.hypot(directDx, directDy);
    const daysDiff = last.t - first.t;
    const rateMmPerDay = daysDiff > 0 ? directDistance / daysDiff : 0;
    const rateMmPerWeek = rateMmPerDay * 7;

    const axis = component === 'horizontal' ? 'x' : component === 'vertical' ? 'y' : null;

    let thresholdResults;
    let reportedRateMmPerWeek = rateMmPerWeek;

    if (axis) {
      const origin = axis === 'x' ? first.x : first.y;
      const axisDelta = axis === 'x' ? directDx : directDy;
      const axisRateMmPerDay = daysDiff > 0 ? axisDelta / daysDiff : 0;
      reportedRateMmPerWeek = Math.abs(axisRateMmPerDay) * 7;

      thresholdResults = thresholds.map(threshold => {
        if (reportedRateMmPerWeek < RATE_EPSILON_MM_PER_WEEK) {
          return { threshold, reached: false, etaT: null };
        }
        const etaT = LinearThresholdSolver.solveThresholdCrossing(origin, axisRateMmPerDay, threshold, tNow);
        return etaT !== null
          ? { threshold, reached: true, etaT }
          : { threshold, reached: false, etaT: null };
      });
    } else {
      thresholdResults = thresholds.map(threshold => {
        if (rateMmPerWeek < RATE_EPSILON_MM_PER_WEEK) {
          return { threshold, reached: false, etaT: null };
        }
        const etaT = threshold / rateMmPerDay; // days since first reading; constant-rate radial model
        return etaT >= tNow
          ? { threshold, reached: true, etaT }
          : { threshold, reached: false, etaT: null };
      });
    }

    return {
      rateMmPerWeek: reportedRateMmPerWeek,
      thresholdResults,
      direction: { x: directDx, y: directDy },
      componentRates: {
        x: daysDiff > 0 ? (directDx / daysDiff) * 7 : 0,
        y: daysDiff > 0 ? (directDy / daysDiff) * 7 : 0
      }
    };
  }
}
