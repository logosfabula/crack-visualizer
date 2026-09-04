// 1D analog of ETASolver: given a fitted line value(t) = a + b*t on a single
// axis, finds when it crosses +threshold or -threshold (whichever is ahead
// on the current trend — trying both and filtering by tNow lets the sign
// resolve itself rather than having to be picked manually).
export class LinearThresholdSolver {
  static solveThresholdCrossing(a, b, threshold, tNow, maxT = Infinity) {
    if (Math.abs(b) < 1e-12) return null; // no drift on this axis

    const roots = [threshold, -threshold]
      .map(target => (target - a) / b)
      .filter(t => t >= tNow && t <= maxT)
      .sort((x, y) => x - y);

    return roots.length > 0 ? roots[0] : null;
  }
}
