import { TheilSen } from './TheilSen';

describe('TheilSen.fit', () => {
  test('returns null with fewer than 2 points', () => {
    expect(TheilSen.fit([0], [1], [1])).toBeNull();
    expect(TheilSen.fit([], [], [])).toBeNull();
  });

  test('reduces to the exact secant with 2 points (equal weights)', () => {
    const fit = TheilSen.fit([0, 10], [0, 5], [1, 1]);
    expect(fit.slope).toBeCloseTo(0.5, 10);
    expect(fit.intercept).toBeCloseTo(0, 10);
  });

  test('recovers an exact line from noiseless points regardless of spacing', () => {
    // y = 2 + 3t, irregular spacing
    const t = [0, 2, 3, 10, 24];
    const v = t.map(ti => 2 + 3 * ti);
    const weights = t.map(() => 1);
    const fit = TheilSen.fit(t, v, weights);
    expect(fit.slope).toBeCloseTo(3, 10);
    expect(fit.intercept).toBeCloseTo(2, 10);
  });

  test('is resistant to a single outlier that a mean-based fit would not be', () => {
    // y = t exactly, except one wild outlier at t=5
    const t = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const v = [0, 1, 2, 3, 4, 500, 6, 7, 8]; // one bad reading
    const weights = t.map(() => 1);
    const fit = TheilSen.fit(t, v, weights);
    expect(fit.slope).toBeCloseTo(1, 5);
    expect(fit.intercept).toBeCloseTo(0, 5);
  });

  test('a near-zero weight suppresses outliers beyond Theil-Sen\'s own breakdown point', () => {
    // 4 clean points (slope 1) + 2 outliers = 33% contaminated, past the
    // ~29% breakdown point where unweighted Theil-Sen itself starts to give.
    const t = [0, 1, 2, 3, 4, 5];
    const v = [0, 1, 2, 3, 400, 500];
    const weightsFull = [1, 1, 1, 1, 1, 1];
    const weightsSuppressed = [1, 1, 1, 1, 0.001, 0.001];

    const fitFull = TheilSen.fit(t, v, weightsFull);
    const fitSuppressed = TheilSen.fit(t, v, weightsSuppressed);

    expect(fitSuppressed.slope).toBeCloseTo(1, 3);
    expect(fitFull.slope).not.toBeCloseTo(1, 3);
  });

  test('ignores pairs with identical timestamps', () => {
    const t = [0, 0, 5];
    const v = [0, 100, 10]; // the t=0 pair has no time delta, must be skipped
    const weights = [1, 1, 1];
    const fit = TheilSen.fit(t, v, weights);
    expect(fit).not.toBeNull();
    expect(Number.isFinite(fit.slope)).toBe(true);
  });
});

describe('TheilSen.weightedMedian', () => {
  test('matches plain median with equal weights (odd count)', () => {
    expect(TheilSen.weightedMedian([5, 1, 3], [1, 1, 1])).toBe(3);
  });

  test('shifts toward the heavily-weighted value', () => {
    const result = TheilSen.weightedMedian([1, 2, 3], [1, 1, 100]);
    expect(result).toBe(3);
  });

  test('falls back to unweighted median when all weights are zero', () => {
    expect(TheilSen.weightedMedian([1, 2, 3], [0, 0, 0])).toBe(2);
  });
});
