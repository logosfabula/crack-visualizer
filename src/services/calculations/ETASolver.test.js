import { ETASolver } from './ETASolver';

describe('ETASolver.solveThresholdCrossing', () => {
  test('finds the crossing time for simple constant-rate motion along one axis', () => {
    // x(t) = 0.1t, y(t) = 0, threshold = 1mm -> t = 10
    const t = ETASolver.solveThresholdCrossing(0, 0.1, 0, 0, 1, 0);
    expect(t).toBeCloseTo(10, 6);
  });

  test('finds the crossing time for 2D motion', () => {
    // x(t) = 0.03t, y(t) = 0.04t -> speed 0.05/day, threshold 1mm -> t = 20
    const t = ETASolver.solveThresholdCrossing(0, 0.03, 0, 0.04, 1, 0);
    expect(t).toBeCloseTo(20, 6);
  });

  test('returns null when already past the threshold and moving further away', () => {
    // starts at (2,0), already beyond threshold 1, and moving further out
    const t = ETASolver.solveThresholdCrossing(2, 0.1, 0, 0, 1, 0);
    expect(t).toBeNull();
  });

  test('returns null when the trend never reaches the threshold (negative discriminant)', () => {
    // fixed at x=3 (perpendicular offset already exceeds threshold=1)
    const t = ETASolver.solveThresholdCrossing(3, 0, 0, 1, 1, 0);
    expect(t).toBeNull();
  });

  test('returns null for a flat trend (no drift at all)', () => {
    const t = ETASolver.solveThresholdCrossing(0.5, 0, 0.3, 0, 1, 0);
    expect(t).toBeNull();
  });

  test('respects an upper bound on how far forward a root may be trusted', () => {
    // extremely small slope: crossing exists but centuries out
    const uncapped = ETASolver.solveThresholdCrossing(0, 0.00001, 0, 0, 1, 0);
    expect(uncapped).not.toBeNull();
    expect(uncapped).toBeGreaterThan(10000);

    const capped = ETASolver.solveThresholdCrossing(0, 0.00001, 0, 0, 1, 0, 1000);
    expect(capped).toBeNull();
  });

  test('only returns roots at or after tNow', () => {
    // crossing happens at t=10; asking from t=15 (past it) should yield nothing
    const past = ETASolver.solveThresholdCrossing(0, 0.1, 0, 0, 1, 15);
    expect(past).toBeNull();

    // asking from t=5 (before it) should still find it
    const future = ETASolver.solveThresholdCrossing(0, 0.1, 0, 0, 1, 5);
    expect(future).toBeCloseTo(10, 6);
  });
});
