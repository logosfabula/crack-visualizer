import { TheilSen } from './TheilSen';
import { ETASolver } from './ETASolver';

// Bootstrap confidence range for the threshold-crossing ETA: resample
// readings uniformly with replacement, refit the weighted Theil-Sen trend
// on each resample (duplicated points carry their original quality weight),
// solve the threshold crossing per replicate, and take percentiles of the
// resulting ETA distribution. Also reports what fraction of replicates
// reach the threshold at all, since a fit near the boundary of "reached vs
// not" is itself useful information, not just noise to average away.
export class BootstrapEstimator {
  static run({ t, x, y, weights, threshold, tNow, maxT = Infinity, iterations = 500, rng = Math.random }) {
    const n = t.length;
    const etas = [];
    let reachedCount = 0;
    let validFits = 0;

    for (let iter = 0; iter < iterations; iter++) {
      const idx = Array.from({ length: n }, () => Math.floor(rng() * n));
      const rt = idx.map(i => t[i]);
      const rw = idx.map(i => weights[i]);
      const rx = idx.map(i => x[i]);
      const ry = idx.map(i => y[i]);
      const fitX = TheilSen.fit(rt, rx, rw);
      const fitY = TheilSen.fit(rt, ry, rw);
      if (!fitX || !fitY) continue;
      validFits++;
      const etaT = ETASolver.solveThresholdCrossing(
        fitX.intercept, fitX.slope, fitY.intercept, fitY.slope, threshold, tNow, maxT
      );

      if (etaT !== null) {
        etas.push(etaT);
        reachedCount++;
      }
    }

    etas.sort((a, b) => a - b);
    const percentile = (p) => {
      if (etas.length === 0) return null;
      const idx = Math.min(etas.length - 1, Math.floor(p * etas.length));
      return etas[idx];
    };

    return {
      iterations,
      validFits,
      reachedFraction: validFits > 0 ? reachedCount / validFits : 0,
      p5: percentile(0.05),
      p50: percentile(0.5),
      p95: percentile(0.95)
    };
  }
}
