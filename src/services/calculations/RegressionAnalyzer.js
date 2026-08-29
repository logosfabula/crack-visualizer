import { TheilSen } from './TheilSen';
import { computeReadingWeight } from '../../constants/regressionConfig';

// Fits independent weighted Theil-Sen trends for x(t) and y(t) for one
// floor's readings. Fitting the two axes separately (rather than fitting
// displacement magnitude directly) avoids assuming the crack moves radially
// outward from the origin in a straight line.
export class RegressionAnalyzer {
  // readings: [{ t, x, y, deviation }], t = days since the floor's first
  // reading, x/y = normalized coordinates, deviation = orthogonality
  // deviation in degrees (0 when unavailable).
  static fitFloor(readings) {
    if (!readings || readings.length < 2) return null;

    const t = readings.map(r => r.t);
    const x = readings.map(r => r.x);
    const y = readings.map(r => r.y);
    const weights = readings.map(r => computeReadingWeight(r.deviation));

    const fitX = TheilSen.fit(t, x, weights);
    const fitY = TheilSen.fit(t, y, weights);
    if (!fitX || !fitY) return null;

    return { x: fitX, y: fitY, n: readings.length, weights };
  }
}
