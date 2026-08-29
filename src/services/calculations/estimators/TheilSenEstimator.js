import { RegressionAnalyzer } from '../RegressionAnalyzer';
import { ETASolver } from '../ETASolver';
import { BootstrapEstimator } from '../BootstrapEstimator';
import { BOOTSTRAP_ITERATIONS, MAX_EXTRAPOLATION_MULTIPLE } from '../../../constants/regressionConfig';

// Robust, quality-weighted regression over every reading. See
// RegressionAnalyzer/ETASolver/BootstrapEstimator for the actual math.
export class TheilSenEstimator {
  static id = 'theilsen';
  static label = 'Weighted Theil-Sen';

  static methodology = 'Weighted Theil-Sen trend on normalized (x, y) vs. real elapsed time, projected from today; range is a 90% bootstrap interval.';

  static describe({ n, rawReadingCount }) {
    return n < rawReadingCount
      ? `Robust fit over ${n} distinct readings (of ${rawReadingCount} total; repeated identical readings collapsed), weighted by reading quality`
      : `Robust fit over all ${n} readings, weighted by reading quality`;
  }

  // readings: deduplicated [{ t, x, y, deviation }], sorted by t.
  static compute({ readings, tNow, thresholds }) {
    const fit = RegressionAnalyzer.fitFloor(readings);
    if (!fit) return null;

    const last = readings[readings.length - 1];
    const observedSpan = Math.max(last.t, tNow);
    const maxT = tNow + observedSpan * MAX_EXTRAPOLATION_MULTIPLE;

    const t = readings.map(r => r.t);
    const x = readings.map(r => r.x);
    const y = readings.map(r => r.y);
    const weights = fit.weights;

    const thresholdResults = thresholds.map(threshold => {
      const etaT = ETASolver.solveThresholdCrossing(
        fit.x.intercept, fit.x.slope, fit.y.intercept, fit.y.slope, threshold, tNow, maxT
      );
      const bootstrap = BootstrapEstimator.run({
        t, x, y, weights, threshold, tNow, maxT, iterations: BOOTSTRAP_ITERATIONS
      });

      return { threshold, reached: etaT !== null, etaT, bootstrap };
    });

    return {
      rateMmPerWeek: Math.hypot(fit.x.slope, fit.y.slope) * 7,
      thresholdResults
    };
  }
}
