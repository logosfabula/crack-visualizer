import { TheilSenEstimator } from './TheilSenEstimator';

describe('TheilSenEstimator.compute', () => {
  test('direction matches the fitted slope, not the raw last reading', () => {
    // clean linear drift: direction should point the same way the line does
    const readings = [
      { t: 0, x: 0, y: 0, deviation: 0 },
      { t: 10, x: 1, y: -1, deviation: 0 },
      { t: 20, x: 2, y: -2, deviation: 0 }
    ];
    const result = TheilSenEstimator.compute({ readings, tNow: 20, thresholds: [] });
    expect(result.direction.x).toBeGreaterThan(0);
    expect(result.direction.y).toBeLessThan(0);
  });

  test('an oscillating series with no consistent direction reports zero direction, even though the last reading is away from the origin', () => {
    // last reading sits at (0.25, -0.13), away from origin, but the series
    // bounces around with no consistent trend
    const readings = [
      { t: 0, x: 0, y: 0, deviation: 0 },
      { t: 108, x: 0.5, y: 0, deviation: 0 },
      { t: 269, x: 0.25, y: -0.13, deviation: 0 },
      { t: 333, x: 0, y: -0.13, deviation: 0 },
      { t: 453, x: 0.75, y: -0.13, deviation: 0 },
      { t: 580, x: 0.5, y: 0, deviation: 0 },
      { t: 610, x: 0.25, y: 0, deviation: 0 },
      { t: 724, x: 0.25, y: -0.13, deviation: 0 }
    ];
    const result = TheilSenEstimator.compute({ readings, tNow: 724, thresholds: [] });
    expect(result.direction.x).toBe(0);
    expect(result.direction.y).toBe(0);
  });
});
