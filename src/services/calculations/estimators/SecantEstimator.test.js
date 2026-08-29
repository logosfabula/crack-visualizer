import { SecantEstimator } from './SecantEstimator';

describe('SecantEstimator.compute', () => {
  test('projects a threshold crossing from constant rate, ignoring intermediate points', () => {
    const readings = [
      { t: 0, x: 0, y: 0 },
      { t: 50, x: 100, y: 0 }, // wild swing in the middle, should be ignored
      { t: 100, x: 0.5, y: 0 } // last reading: 0.5mm over 100 days
    ];
    const result = SecantEstimator.compute({ readings, tNow: 100, thresholds: [1] });
    // rate = 0.5mm / 100 days = 0.005 mm/day -> 1mm at t = 200
    expect(result.thresholdResults[0].reached).toBe(true);
    expect(result.thresholdResults[0].etaT).toBeCloseTo(200, 6);
    expect(result.rateMmPerWeek).toBeCloseTo(0.035, 6);
  });

  test('reports insufficient movement below the rate epsilon', () => {
    const readings = [
      { t: 0, x: 0, y: 0 },
      { t: 1000, x: 0, y: 0 }
    ];
    const result = SecantEstimator.compute({ readings, tNow: 1000, thresholds: [1] });
    expect(result.thresholdResults[0].reached).toBe(false);
    expect(result.thresholdResults[0].etaT).toBeNull();
  });

  test('does not project a crossing that would already be in the past relative to tNow', () => {
    const readings = [
      { t: 0, x: 0, y: 0 },
      { t: 10, x: 1, y: 0 }
    ];
    // rate = 0.1/day -> 1mm crossing at t=10, asking from tNow=50 (already past it)
    const result = SecantEstimator.compute({ readings, tNow: 50, thresholds: [1] });
    expect(result.thresholdResults[0].reached).toBe(false);
  });

  test('describe reports how many intermediate readings are ignored', () => {
    expect(SecantEstimator.describe({ rawReadingCount: 5 })).toMatch(/3 intermediate readings ignored/);
    expect(SecantEstimator.describe({ rawReadingCount: 2 })).toBe('Uses the first and last reading');
  });

  test('direction is the raw first-to-last vector, ignoring intermediate swings', () => {
    const readings = [
      { t: 0, x: 0, y: 0 },
      { t: 50, x: -100, y: 100 }, // wild swing, should be ignored
      { t: 100, x: 0.5, y: -0.3 }
    ];
    const result = SecantEstimator.compute({ readings, tNow: 100, thresholds: [] });
    expect(result.direction).toEqual({ x: 0.5, y: -0.3 });
  });
});
