import { dedupeConsecutiveReadings } from './dedupeConsecutiveReadings';

describe('dedupeConsecutiveReadings', () => {
  test('collapses a run of identical values, keeping the later one', () => {
    const readings = [
      { t: 0, x: 0, y: 0 },
      { t: 10, x: 1, y: 1 },
      { t: 20, x: 1, y: 1 },
      { t: 30, x: 1, y: 1 },
      { t: 40, x: 2, y: 2 }
    ];
    const result = dedupeConsecutiveReadings(readings);
    expect(result).toEqual([
      { t: 0, x: 0, y: 0 },
      { t: 30, x: 1, y: 1 },
      { t: 40, x: 2, y: 2 }
    ]);
  });

  test('leaves distinct-valued readings untouched', () => {
    const readings = [
      { t: 0, x: 0, y: 0 },
      { t: 10, x: 1, y: 0 },
      { t: 20, x: 2, y: 0 }
    ];
    expect(dedupeConsecutiveReadings(readings)).toEqual(readings);
  });

  test('does not collapse non-consecutive repeats (a return to an earlier value)', () => {
    const readings = [
      { t: 0, x: 0, y: 0 },
      { t: 10, x: 1, y: 0 },
      { t: 20, x: 0, y: 0 } // same value as t=0, but not adjacent to it
    ];
    expect(dedupeConsecutiveReadings(readings)).toEqual(readings);
  });

  test('a run only collapses when both x and y match', () => {
    const readings = [
      { t: 0, x: 1, y: 1 },
      { t: 10, x: 1, y: 2 } // x matches, y doesn't
    ];
    expect(dedupeConsecutiveReadings(readings)).toEqual(readings);
  });
});
