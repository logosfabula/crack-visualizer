// Given a fitted 2D linear trend x(t) = a_x + b_x*t, y(t) = a_y + b_y*t,
// finds when the trajectory crosses a displacement threshold R by solving
// x(t)^2 + y(t)^2 = R^2 for t, a quadratic in t. Returns the smallest root
// at or after tNow, or null if the trend never reaches R (no real root, or
// every root lies in the past / the trend is moving away from R).
export class ETASolver {
  // maxT: optional upper bound on how far forward a root may be trusted.
  // A near-zero (but nonzero) slope still yields a finite root, which
  // without a cap can land centuries out — not a meaningful projection for
  // a linear fit calibrated on a couple of years of data.
  static solveThresholdCrossing(a_x, b_x, a_y, b_y, threshold, tNow, maxT = Infinity) {
    const A = b_x * b_x + b_y * b_y;
    const B = 2 * (a_x * b_x + a_y * b_y);
    const C = a_x * a_x + a_y * a_y - threshold * threshold;

    if (A < 1e-12) {
      // No drift at all: the trajectory is a fixed point, never reaches R
      // unless it's already there (handled by the caller via observed data).
      return null;
    }

    const discriminant = B * B - 4 * A * C;
    if (discriminant < 0) return null; // trend's closest approach never reaches R

    const sqrtDisc = Math.sqrt(discriminant);
    const roots = [(-B - sqrtDisc) / (2 * A), (-B + sqrtDisc) / (2 * A)]
      .filter(t => t >= tNow && t <= maxT)
      .sort((a, b) => a - b);

    return roots.length > 0 ? roots[0] : null;
  }
}
