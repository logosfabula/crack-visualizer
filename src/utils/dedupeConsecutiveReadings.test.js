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
      { t: 0, x: 0, y: 0, runLength: 1 },
      { t: 30, x: 1, y: 1, runLength: 3 },
      { t: 40, x: 2, y: 2, runLength: 1 }
    ]);
  });

  test('leaves distinct-valued readings untouched, each with runLength 1', () => {
    const readings = [
      { t: 0, x: 0, y: 0 },
      { t: 10, x: 1, y: 0 },
      { t: 20, x: 2, y: 0 }
    ];
    expect(dedupeConsecutiveReadings(readings)).toEqual(
      readings.map(r => ({ ...r, runLength: 1 }))
    );
  });

  test('does not collapse non-consecutive repeats (a return to an earlier value)', () => {
    const readings = [
      { t: 0, x: 0, y: 0 },
      { t: 10, x: 1, y: 0 },
      { t: 20, x: 0, y: 0 } // same value as t=0, but not adjacent to it
    ];
    expect(dedupeConsecutiveReadings(readings)).toEqual(
      readings.map(r => ({ ...r, runLength: 1 }))
    );
  });

  test('a run only collapses when both x and y match', () => {
    const readings = [
      { t: 0, x: 1, y: 1 },
      { t: 10, x: 1, y: 2 } // x matches, y doesn't
    ];
    expect(dedupeConsecutiveReadings(readings)).toEqual(
      readings.map(r => ({ ...r, runLength: 1 }))
    );
  });

  test('a long run accumulates the full count, not just the last collapse', () => {
    const readings = Array.from({ length: 60 }, (_, i) => ({ t: i, x: 5, y: 5 }));
    const result = dedupeConsecutiveReadings(readings);
    expect(result).toEqual([{ t: 59, x: 5, y: 5, runLength: 60 }]);
  });
});
