import { RegressionAnalyzer } from './RegressionAnalyzer';

describe('RegressionAnalyzer.fitFloor confirmation weighting', () => {
  test('a point with a longer runLength gets a larger weight than one with runLength 1', () => {
    const readings = [
      { t: 0, x: 0, y: 0, deviation: 0, runLength: 1 },
      { t: 10, x: 1, y: 1, deviation: 0, runLength: 20 },
      { t: 20, x: 2, y: 2, deviation: 0, runLength: 1 }
    ];
    const fit = RegressionAnalyzer.fitFloor(readings);
    expect(fit.weights[1]).toBeGreaterThan(fit.weights[0]);
    expect(fit.weights[1]).toBeCloseTo(Math.sqrt(20), 6);
  });

  test('missing runLength defaults to no boost (weight unchanged from angle-only)', () => {
    const withRunLength = RegressionAnalyzer.fitFloor([
      { t: 0, x: 0, y: 0, deviation: 0, runLength: 1 },
      { t: 10, x: 1, y: 0, deviation: 0, runLength: 1 }
    ]);
    const withoutRunLength = RegressionAnalyzer.fitFloor([
      { t: 0, x: 0, y: 0, deviation: 0 },
      { t: 10, x: 1, y: 0, deviation: 0 }
    ]);
    expect(withoutRunLength.weights).toEqual(withRunLength.weights);
  });

  test('a heavily-confirmed point cannot dominate a pair with a less-confirmed point (min-weight rule)', () => {
    // A, B, C: A→C is a clean line (slope 0.01); B sits off that line but
    // is reconfirmed 100x. Pairwise weight in TheilSen.fit is
    // min(weight_i, weight_j), so both pairs touching B (A-B, B-C) are
    // capped at the OTHER point's unboosted weight (1) — B's own 10x
    // weight never gets to act on its own. If the boost could dominate
    // regardless of pairing, the median would shift toward B's slopes
    // (0.1 and -0.08); instead it should land exactly on the honest A→C
    // slope, since all three pairwise weights end up equal.
    const readings = [
      { t: 0, x: 0, y: 0, deviation: 0, runLength: 1 },      // A
      { t: 50, x: 5, y: 5, deviation: 0, runLength: 100 },   // B (off-line, heavily confirmed)
      { t: 100, x: 1, y: 1, deviation: 0, runLength: 1 }     // C
    ];
    const fit = RegressionAnalyzer.fitFloor(readings);
    expect(fit.x.slope).toBeCloseTo(0.01, 6);
  });
});
