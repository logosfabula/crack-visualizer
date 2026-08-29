// Collapses a run of consecutive readings with identical (x, y) into a
// single point, keeping the later one in the run (the tightest confirmation
// the value still held). Pairwise-slope estimators like Theil-Sen treat
// each dated reading as independent evidence — a run of k identical
// readings (plausible whenever real movement is slower than the ~0.25mm
// reading precision) generates C(k,2) "zero movement" pairs that all
// restate the same one observation, which can swamp genuine signal from
// the readings that actually changed. Input must already be sorted by t.
export const dedupeConsecutiveReadings = (readings) => {
  const result = [];
  for (const reading of readings) {
    const last = result[result.length - 1];
    if (last && last.x === reading.x && last.y === reading.y) {
      result[result.length - 1] = reading;
    } else {
      result.push(reading);
    }
  }
  return result;
};
