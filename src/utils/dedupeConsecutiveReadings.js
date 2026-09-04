// Collapses a run of consecutive readings with identical (x, y) into a
// single point, keeping the later one in the run (the tightest confirmation
// the value still held). Pairwise-slope estimators like Theil-Sen treat
// each dated reading as independent evidence — a run of k identical
// readings (plausible whenever real movement is slower than the ~0.25mm
// reading precision) generates C(k,2) "zero movement" pairs that all
// restate the same one observation, which can swamp genuine signal from
// the readings that actually changed. Input must already be sorted by t.
//
// The collapsed point carries `runLength`, the count of raw readings it
// absorbed — a run reconfirmed many times over is stronger evidence that a
// stretch is genuinely flat (not just under-sampled) than two readings far
// apart would be, even though it must still count as exactly one point
// toward the pairwise-slope count. See computeConfirmationWeight in
// regressionConfig.js for how that count is used.
export const dedupeConsecutiveReadings = (readings) => {
  const result = [];
  for (const reading of readings) {
    const last = result[result.length - 1];
    if (last && last.x === reading.x && last.y === reading.y) {
      result[result.length - 1] = { ...reading, runLength: last.runLength + 1 };
    } else {
      result.push({ ...reading, runLength: 1 });
    }
  }
  // t=0 is the regression's time origin by definition (every other t is
  // "days since the first reading") — if the very first reading is itself
  // part of a leading run, the loop above just replaced it with the run's
  // later member, silently shortening the observed window by however long
  // that leading flat stretch lasted. A trailing run has no such problem
  // (keeping its later member already preserves the true last reading),
  // so only the leading edge needs restoring.
  if (result.length > 0 && result[0].t !== readings[0].t) {
    result[0] = { ...readings[0], runLength: result[0].runLength };
  }
  return result;
};
