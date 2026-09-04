import { LinearThresholdSolver } from './LinearThresholdSolver';

describe('LinearThresholdSolver.solveThresholdCrossing', () => {
  test('finds a future crossing on a positive-slope line', () => {
    // value(t) = 0.1*t, threshold 1mm -> t = 10
    expect(LinearThresholdSolver.solveThresholdCrossing(0, 0.1, 1, 0)).toBeCloseTo(10, 6);
  });

  test('resolves sign automatically for a negative-slope line', () => {
    // value(t) = -0.1*t, threshold 1mm -> crosses -1 at t=10 (the +1 crossing is in the past/never)
    expect(LinearThresholdSolver.solveThresholdCrossing(0, -0.1, 1, 0)).toBeCloseTo(10, 6);
  });

  test('returns null for a flat line (no drift)', () => {
    expect(LinearThresholdSolver.solveThresholdCrossing(0.5, 0, 1, 0)).toBeNull();
  });

  test('respects tNow, not returning a root already in the past', () => {
    expect(LinearThresholdSolver.solveThresholdCrossing(0, 0.1, 1, 15)).toBeNull();
    expect(LinearThresholdSolver.solveThresholdCrossing(0, 0.1, 1, 5)).toBeCloseTo(10, 6);
  });

  test('respects an upper bound maxT', () => {
    expect(LinearThresholdSolver.solveThresholdCrossing(0, 0.00001, 1, 0, 1000)).toBeNull();
  });
});
