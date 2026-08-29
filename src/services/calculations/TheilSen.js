// Weighted Theil-Sen estimator: slope = weighted median of all pairwise
// slopes between points, intercept = weighted median of per-point intercepts
// implied by that slope. Robust to isolated outliers (breakdown point ~29%
// for the unweighted case) without discarding any point outright.
export class TheilSen {
  static weightedMedian(values, weights) {
    const n = values.length;
    if (n === 0) return null;

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight <= 0) {
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    }

    const order = values.map((_, i) => i).sort((a, b) => values[a] - values[b]);
    let cumulative = 0;
    for (const i of order) {
      cumulative += weights[i];
      if (cumulative >= totalWeight / 2) return values[i];
    }
    return values[order[order.length - 1]];
  }

  // t, v, weights: parallel arrays. Returns { slope, intercept } or null if
  // fewer than 2 usable points (no pair to derive a slope from).
  static fit(t, v, weights) {
    const n = t.length;
    if (n < 2) return null;

    const slopes = [];
    const slopeWeights = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dt = t[j] - t[i];
        if (Math.abs(dt) < 1e-9) continue; // same timestamp, no usable slope
        slopes.push((v[j] - v[i]) / dt);
        slopeWeights.push(Math.min(weights[i], weights[j]));
      }
    }
    if (slopes.length === 0) return null;

    const slope = this.weightedMedian(slopes, slopeWeights);
    const intercepts = t.map((ti, i) => v[i] - slope * ti);
    const intercept = this.weightedMedian(intercepts, weights);

    return { slope, intercept };
  }
}
