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
    // The whole series is one leading run here, so the single surviving
    // point keeps t=0 (the series' own first reading), not t=59 — see the
    // leading-run test below for why.
    const readings = Array.from({ length: 60 }, (_, i) => ({ t: i, x: 5, y: 5 }));
    const result = dedupeConsecutiveReadings(readings);
    expect(result).toEqual([{ t: 0, x: 5, y: 5, runLength: 60 }]);
  });

  test('a run starting at the series\' first reading keeps t=0, not the run\'s later member', () => {
    // t=0 is the regression's time origin — collapsing a leading run
    // toward its later member (as an interior run correctly does) would
    // silently shorten the observed window by the run's own length,
    // inflating any rate computed from it.
    const readings = [
      { t: 0, x: 0, y: 0 },
      { t: 155, x: 0, y: 0 }, // same value as t=0, leading run
      { t: 653, x: 1, y: 1 },
      { t: 797, x: 2, y: 2 }
    ];
    const result = dedupeConsecutiveReadings(readings);
    expect(result).toEqual([
      { t: 0, x: 0, y: 0, runLength: 2 },
      { t: 653, x: 1, y: 1, runLength: 1 },
      { t: 797, x: 2, y: 2, runLength: 1 }
    ]);
  });

  test('a trailing run still keeps its later member (already the true last reading)', () => {
    const readings = [
      { t: 0, x: 0, y: 0 },
      { t: 100, x: 1, y: 1 },
      { t: 200, x: 2, y: 2 },
      { t: 300, x: 2, y: 2 } // trailing run, same value as t=200
    ];
    const result = dedupeConsecutiveReadings(readings);
    expect(result).toEqual([
      { t: 0, x: 0, y: 0, runLength: 1 },
      { t: 100, x: 1, y: 1, runLength: 1 },
      { t: 300, x: 2, y: 2, runLength: 2 }
    ]);
  });
});
