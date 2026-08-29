import { useMemo } from 'react';
import { METER_CONFIGS } from '../constants/meterConfigs';
import { ETA_THRESHOLDS_MM } from '../constants/regressionConfig';
import { ETA_ESTIMATORS } from '../services/calculations/estimators';
import { dedupeConsecutiveReadings } from '../utils/dedupeConsecutiveReadings';

const DAY_MS = 1000 * 60 * 60 * 24;

const buildFloorSeries = (processedData, meterKey) => {
  const rows = processedData
    .filter(d => d[`${meterKey}_norm_x`] !== undefined && d[`${meterKey}_norm_y`] !== undefined)
    .map(d => ({ ...d, dateObj: new Date(d.date) }))
    .sort((a, b) => a.dateObj - b.dateObj);

  if (rows.length === 0) return null;

  const firstDate = rows[0].dateObj;
  const readings = rows.map(d => ({
    t: (d.dateObj - firstDate) / DAY_MS,
    x: d[`${meterKey}_norm_x`],
    y: d[`${meterKey}_norm_y`],
    deviation: d[`${meterKey}_angle_deviation`] ?? 0
  }));

  return { firstDate, readings: dedupeConsecutiveReadings(readings), rawReadingCount: readings.length };
};

const daysToDate = (firstDate, days) => {
  if (days === null || days === undefined) return null;
  return new Date(firstDate.getTime() + days * DAY_MS);
};

// Per floor, runs every registered ETA estimator (see
// services/calculations/estimators) over the same deduplicated, normalized
// reading series, so the UI can let the user pick which method's numbers
// to trust rather than committing to just one.
export const useETAPredictions = (processedData) => {
  return useMemo(() => {
    const results = {};

    Object.keys(METER_CONFIGS).forEach(meterKey => {
      const series = buildFloorSeries(processedData, meterKey);
      if (!series || series.readings.length < 2) {
        results[meterKey] = { insufficientData: true, n: series ? series.readings.length : 0 };
        return;
      }

      const { firstDate, readings, rawReadingCount } = series;
      const last = readings[readings.length - 1];
      const currentDisplacement = Math.hypot(last.x, last.y);
      const tNow = (new Date() - firstDate) / DAY_MS;

      const estimates = {};
      Object.values(ETA_ESTIMATORS).forEach(estimator => {
        const raw = estimator.compute({ readings, tNow, thresholds: ETA_THRESHOLDS_MM });
        if (!raw) {
          estimates[estimator.id] = null;
          return;
        }

        const thresholds = raw.thresholdResults.map(tr => {
          if (currentDisplacement >= tr.threshold) {
            return { threshold: tr.threshold, alreadyReached: true };
          }
          return {
            threshold: tr.threshold,
            alreadyReached: false,
            reached: tr.reached,
            etaDate: tr.reached ? daysToDate(firstDate, tr.etaT) : null,
            remainingDays: tr.reached ? tr.etaT - tNow : null,
            totalDaysFromFirstReading: tr.reached ? tr.etaT : null,
            bootstrap: tr.bootstrap ? {
              reachedFraction: tr.bootstrap.reachedFraction,
              p5Date: daysToDate(firstDate, tr.bootstrap.p5),
              p50Date: daysToDate(firstDate, tr.bootstrap.p50),
              p95Date: daysToDate(firstDate, tr.bootstrap.p95)
            } : null
          };
        });

        estimates[estimator.id] = { rateMmPerWeek: raw.rateMmPerWeek, thresholds, direction: raw.direction };
      });

      results[meterKey] = {
        insufficientData: false,
        n: readings.length,
        rawReadingCount,
        currentDisplacement,
        estimates
      };
    });

    return results;
  }, [processedData]);
};
