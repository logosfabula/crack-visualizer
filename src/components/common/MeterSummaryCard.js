import React, { useState } from 'react';
import { activateOnKey } from './InfoDisclosure';
import { ActivityHeatMeter, getActivityAssessment } from './ActivityHeatMeter';
import { VectorRateArrow, RATE_ARROW_COLORS } from './VectorRateArrow';
import { formatDurationFromDays } from '../../utils/formatDuration';
import { MAX_EXTRAPOLATION_YEARS } from '../../constants/regressionConfig';

// The lean view's graph is a fixed small preview, not a control — no
// click-to-resize affordance, just a size consistent with a "shrunk" figure
// elsewhere on the page.
const LEAN_GRAPH_SIZE = 135;

// The expanded view's graph is always shown at full detail, matching the
// full size used by the Structural Analysis Summary's own figures.
const EXPANDED_GRAPH_SIZE = 270;

// U+00B5 MICRO SIGN — not U+03BC GREEK SMALL LETTER MU, which looks
// identical in most fonts but is the wrong character for an SI unit prefix.
const MICRO = 'µ';

// Always shown in µm/wk rather than mm/wk — at these magnitudes (a few
// thousandths of a mm per week) mm buries the meaningful digits after a
// string of leading zeros; µm reads the same quantity in a range where the
// digits carry information at a glance. Not interactive.
const MicronRate = ({ mmPerWeek, color, className = 'text-lg font-semibold' }) => (
  <span className={className} style={{ color }}>
    {mmPerWeek === null || mmPerWeek === undefined ? 'Insufficient data' : `${(mmPerWeek * 1000).toFixed(1)} ${MICRO}m/wk`}
  </span>
);

// `compact`: the lean view's values all share the same bold text-lg
// treatment, which makes the full phrase "No movement detected" read as
// far more emphasized than a plain number — shortened to "no movement"
// there instead.
const directionHeadline = (dirX, dirY, { compact = false } = {}) =>
  dirX === 0 && dirY === 0 ? (compact ? 'no movement' : 'No movement detected') :
  dirX === 0 ? (dirY > 0 ? '↑ Wall Rising' : '↓ Wall Sinking') :
  dirY === 0 ? (dirX > 0 ? '→ Crack Expanding' : '← Crack Closing') :
  `${dirX > 0 ? '→ Expanding' : '← Closing'} & ${dirY > 0 ? '↑ Rising' : '↓ Sinking'}`;

const directionDescription = (dirX, dirY, directionLabel) => {
  if (dirX === 0 && dirY === 0) {
    return `Based on ${directionLabel}, normalized data shows no structural movement.`;
  }
  let description = `Based on ${directionLabel}, normalized data shows`;
  if (dirX !== 0) description += dirX > 0 ? ' outward horizontal movement' : ' inward horizontal movement';
  if (dirX !== 0 && dirY !== 0) description += ' and';
  if (dirY !== 0) description += dirY > 0 ? ' upward vertical movement' : ' downward vertical movement';
  return description + '.';
};

// Shortens estimator labels for the space-constrained lean view:
// "Weighted Theil-Sen" -> "W. Theil-Sen", and any trailing parenthetical
// dropped entirely ("Secant (first → last reading)" -> "Secant") — that
// detail belongs in the expanded view's methodology text, not a compact
// label.
const abbreviateLabel = (label) => label.replace('Weighted ', 'W. ').replace(/\s*\([^)]*\)\s*$/, '');

// One value per threshold (in `methodResult.thresholds` order), formatted
// for the lean view's single-line ETA summary: "✓" once already reached,
// "–" if never reached on the current trend, otherwise years remaining
// with its own "yr" suffix (e.g. "3.4yr") so each value in the slash-joined
// list is self-contained rather than relying on one trailing unit for all
// of them. `pick` selects which number to show — the ETA itself, or (only
// present for estimators that compute a bootstrap interval, currently
// Theil-Sen only) the *consensus*: what share of the resampled trends also
// reach the threshold at all. Deliberately not called "confidence" — it
// isn't a confidence bound on any single value, just a tally of how many
// resamples agree with the reached/not-reached verdict.
//
// Scaled by 0.9 (matching the expanded view's "covers X% of all resampled
// trends" next to the p5-p95 range) rather than showing the raw reached
// fraction: the raw fraction alone overstates how much of the full
// bootstrap picture the single ETA value shown actually represents, since
// even among resamples that reach, the date range spans only their middle
// 90%.
const formatThresholdRow = (thresholds, pick) => thresholds.map(t => {
  if (t.alreadyReached) return '✓';
  if (pick === 'eta') return t.reached ? `${(t.remainingDays / 365.25).toFixed(1)}yr` : '–';
  return t.bootstrap ? `${Math.round(t.bootstrap.reachedFraction * 0.9 * 100)}%` : '–';
}).join('/');

// Single-axis ETA: a much simpler projection than the fitted 2D estimator
// above — no resampling, no robust median, just "at the current rate on
// this one axis, when does |position| reach the threshold" (linear
// extrapolation, straight from today's normalized position). It exists
// only to answer "which axis is driving this threshold" at a glance when
// cycled to from the combined (radial) ETA, not as a replacement for it —
// mirrors the same {threshold, alreadyReached, reached, remainingDays}
// shape as methodResult.thresholds (minus `bootstrap`, since there's
// nothing here to resample) so formatThresholdRow can render either.
// Shares the same MAX_EXTRAPOLATION_YEARS cap as the combined estimator —
// without it, a near-zero axis rate produces the same absurd
// centuries-out ETA that cap exists to prevent there.
const MAX_AXIS_ETA_DAYS = MAX_EXTRAPOLATION_YEARS * 365.25;
const computeAxisThresholds = (currentPos, ratePerWeek, thresholds) => {
  const ratePerDay = ratePerWeek / 7;
  return thresholds.map(({ threshold }) => {
    if (Math.abs(currentPos) >= threshold) return { threshold, alreadyReached: true };
    if (ratePerDay === 0) return { threshold, alreadyReached: false, reached: false, remainingDays: null };
    const candidates = [(threshold - currentPos) / ratePerDay, (-threshold - currentPos) / ratePerDay]
      .filter(t => t > 0 && t <= MAX_AXIS_ETA_DAYS);
    return candidates.length
      ? { threshold, alreadyReached: false, reached: true, remainingDays: Math.min(...candidates) }
      : { threshold, alreadyReached: false, reached: false, remainingDays: null };
  });
};

// A single floor's Movement Summary card. Defaults to a lean, one-glance
// view — the handful of numbers most people check on a return visit — and
// expands in place to the full detail (monitoring period, raw vs.
// normalized coordinates, movement-pattern classification, per-threshold
// ETA dates) on click. Independent per floor: unlike the shared
// Horizontal-vs-Vertical resize trigger, there's no reason opening one
// floor's detail should open another's.
export const MeterSummaryCard = ({
  meter, meterData, totalDistance, firstDate, lastDate, directDistance,
  totalPathRatePerWeek, maxTotalPathRate, etaResult, estimator, methodResult,
  rateScaleMax
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded(v => !v);

  // Cycles the lean view's ETA line through the combined (radial) estimate
  // and each individual axis, so a reader can tell whether a threshold is
  // being driven mainly by horizontal or vertical movement.
  const [etaMode, setEtaMode] = useState('normal');
  const cycleEtaMode = () => setEtaMode(m => (m === 'normal' ? 'h' : m === 'h' ? 'v' : 'normal'));

  const componentRates = methodResult ? methodResult.componentRates : null;
  const dirX = methodResult ? methodResult.direction.x : null;
  const dirY = methodResult ? methodResult.direction.y : null;
  const totalMonitoringDays = Math.round((new Date(lastDate) - new Date(firstDate)) / (1000 * 60 * 60 * 24));

  const normDataKeyX = meter.dataKeys[0].replace('_x', '_norm_x');
  const normDataKeyY = meter.dataKeys[1].replace('_y', '_norm_y');
  const lastNormX = meterData[meterData.length - 1][normDataKeyX];
  const lastNormY = meterData[meterData.length - 1][normDataKeyY];

  // Consensus (the bootstrap reached-fraction) only exists for the combined
  // radial estimate — the per-axis projection above is a plain linear
  // extrapolation with nothing to resample.
  const hasConsensus = !!(methodResult && etaMode === 'normal' && methodResult.thresholds.some(t => t.bootstrap));
  const etaThresholds = methodResult && (
    etaMode === 'normal' ? methodResult.thresholds :
    etaMode === 'h' ? computeAxisThresholds(lastNormX, componentRates.x, methodResult.thresholds) :
    computeAxisThresholds(lastNormY, componentRates.y, methodResult.thresholds)
  );

  return (
    <div className="p-3 border border-gray-200 rounded">
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={activateOnKey(toggle)}
        className="flex items-center gap-2 mb-3 cursor-pointer select-none"
      >
        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: meter.color }}></div>
        <strong>{meter.name}</strong>
        {!expanded && <span aria-hidden="true" className="text-gray-400">›</span>}
      </div>

      {expanded ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-medium text-gray-700">Monitoring Period:</div>
            <div>{firstDate} → {lastDate}</div>
            <div className="text-gray-500">({meterData.length} measurements over {formatDurationFromDays(totalMonitoringDays)})</div>
          </div>

          <div>
            <div className="font-medium text-gray-700">Position Change:</div>
            <div>
              ({meterData[0][meter.dataKeys[0]].toFixed(3)}, {meterData[0][meter.dataKeys[1]].toFixed(3)}) → (
              {meterData[meterData.length - 1][meter.dataKeys[0]].toFixed(3)}, {meterData[meterData.length - 1][meter.dataKeys[1]].toFixed(3)})
            </div>
            <div className="text-gray-500 text-xs">Raw coordinates</div>
          </div>

          <div>
            <div className="font-medium text-gray-700">Normalized Position Change:</div>
            <div>
              <span style={{ color: meter.color }}>(0.000, 0.000)</span> →
              <span style={{ color: meter.color }}> ({lastNormX.toFixed(3)}, {lastNormY.toFixed(3)})</span>
            </div>
            <div className="text-gray-500 text-xs">Analysis-ready coordinates</div>
          </div>

          <div>
            <div className="font-medium text-gray-700">(Normalized) Movement Interpretation:</div>
            <div className="text-xs text-gray-600">
              • Horizontal: {lastNormX > 0 ? `+${lastNormX.toFixed(3)}mm (crack expanding)` :
                            lastNormX < 0 ? `${lastNormX.toFixed(3)}mm (crack closing)` :
                            '0.000mm (no horizontal change)'}<br/>
              • Vertical: {lastNormY > 0 ? `+${lastNormY.toFixed(3)}mm (wall rising)` :
                          lastNormY < 0 ? `${lastNormY.toFixed(3)}mm (wall sinking)` :
                          '0.000mm (no vertical change)'}
              <div className="text-gray-500 italic mt-1">* Based on normalized data — raw readings alone aren't comparable across floors, since crack meters aren't all mounted in the same orientation</div>
            </div>
          </div>

          <div>
            <div className="font-medium text-gray-700">Direct Displacement:</div>
            <div className="text-lg font-semibold" style={{ color: meter.color }}>
              {directDistance.toFixed(3)} mm
            </div>
            <div className="text-gray-500">
              Straight-line distance (start to end)
            </div>
          </div>

          <div>
            <div className="font-medium text-gray-700">Total Observed Activity:</div>
            <div className="text-lg font-semibold" style={{ color: meter.color }}>
              {totalDistance.toFixed(3)} mm
            </div>
            <div className="text-gray-500">
              {totalDistance > directDistance ?
                `${(totalDistance / directDistance).toFixed(1)}× more than direct path` :
                'Equal to direct path movement'
              }
            </div>
          </div>

          <div>
            <div className="font-medium text-gray-700">Movement Pattern (Direct Path):</div>
            <div className="text-sm">
              {directDistance < 0.1 ? 'Minimal displacement' :
              directDistance < 0.5 ? 'Small displacement' :
              directDistance < 1.0 ? 'Moderate displacement' :
              'Significant displacement'}
            </div>
            <div className="text-gray-500">
              Avg: {(directDistance / (meterData.length - 1 || 1)).toFixed(3)} mm/measurement
            </div>
          </div>

          <div>
            <div className="font-medium text-gray-700">Movement Pattern (Total Path):</div>
            <div className="text-sm">
              {totalDistance < 0.1 ? 'Minimal movement' :
              totalDistance < 0.5 ? 'Small movements' :
              totalDistance < 1.0 ? 'Moderate movement' :
              'Significant movement'}
            </div>
            <div className="text-gray-500">
              Avg: {(totalDistance / (meterData.length - 1 || 1)).toFixed(3)} mm/measurement
            </div>
          </div>

          <div>
            <div className="font-medium text-gray-700">Trend Rate ({estimator.label}):</div>
            <div className="text-lg font-semibold" style={{ color: meter.color }}>
              {methodResult
                ? `${methodResult.rateMmPerWeek.toFixed(4)} mm/week`
                : 'Insufficient data'}
            </div>
            <div className="text-gray-500 text-xs">
              {etaResult && !etaResult.insufficientData
                ? estimator.describe({ n: etaResult.n, rawReadingCount: etaResult.rawReadingCount })
                : ''}
            </div>
          </div>

          <div>
            <div className="font-medium text-gray-700">Weekly Rate (Total Path):</div>
            <div className="text-lg font-semibold" style={{ color: meter.color }}>
              {totalPathRatePerWeek.toFixed(4)} mm/week
            </div>
            <div className="text-gray-500 text-xs mb-2">
              Based on cumulative path distance (direction-agnostic activity, not a projection)
            </div>
            <div className="text-xs font-medium text-gray-600 mb-1">
              Activity Gauge: <span style={{ color: meter.color }}>{getActivityAssessment(totalPathRatePerWeek, maxTotalPathRate)}</span>
            </div>
            <ActivityHeatMeter
              rateMmPerWeek={totalPathRatePerWeek}
              maxRateMmPerWeek={maxTotalPathRate}
              color={meter.color}
            />
          </div>

          <div className="md:col-span-2 mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="font-medium text-gray-700 mb-1">Overall Movement Direction ({estimator.label}):</div>
              {methodResult ? (
                <>
                  <div className="text-sm font-semibold mb-2" style={{ color: meter.color }}>
                    {directionHeadline(dirX, dirY)}
                  </div>
                  <div className="text-xs text-gray-600 italic">
                    {directionDescription(dirX, dirY, estimator.directionLabel)}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Insufficient data</div>
              )}
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className="font-medium text-gray-700 mb-1">Horizontal vs. Vertical Rate ({estimator.label}):</div>
              {componentRates ? (
                <>
                  <div style={{ maxWidth: `${EXPANDED_GRAPH_SIZE}px` }}>
                    <VectorRateArrow
                      horizontalRate={componentRates.x}
                      verticalRate={componentRates.y}
                      scaleMax={rateScaleMax}
                      id={meter.key}
                    />
                  </div>
                  <div className="text-xs font-mono space-x-3">
                    <span style={{ color: RATE_ARROW_COLORS.horizontal }}>
                      H {componentRates.x.toFixed(4)} mm/wk
                    </span>
                    <span style={{ color: RATE_ARROW_COLORS.vertical }}>
                      V {componentRates.y.toFixed(4)} mm/wk
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {Math.abs(componentRates.x) > Math.abs(componentRates.y)
                      ? 'Horizontal component is currently the stronger driver'
                      : Math.abs(componentRates.y) > Math.abs(componentRates.x)
                        ? 'Vertical component is currently the stronger driver'
                        : 'Horizontal and vertical rates are comparable'}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Insufficient data</div>
              )}
            </div>

            <div className="flex-[2] min-w-[280px]">
              <div className="font-medium text-gray-700 mb-1">ETA to Displacement Thresholds:</div>
              <div className="text-xs text-gray-500 mb-1">{estimator.methodology}</div>
              {methodResult ? (
                <div className="text-sm space-y-1">
                  {methodResult.thresholds.map(t => (
                    <div key={t.threshold} className="flex justify-between items-start">
                      <span className="text-gray-600">{t.threshold}mm:</span>
                      <span className="font-mono text-right" style={{ color: meter.color }}>
                        {t.alreadyReached ? (
                          <span className="text-green-700">✓ Reached</span>
                        ) : !t.reached ? (
                          <span className="text-gray-500">not reached on current trend</span>
                        ) : (
                          <>
                            {formatDurationFromDays(t.remainingDays)} remaining
                            <span className="text-gray-500 text-xs ml-1">
                              ({formatDurationFromDays(t.totalDaysFromFirstReading)} from first reading)
                            </span>
                            {t.bootstrap && (
                              <span className="text-gray-500 text-xs ml-1 block">
                                {t.bootstrap.p5Date && t.bootstrap.p95Date && (
                                  <>
                                    {/* This range is the 5th-95th percentile of only the
                                        resamples that reach at all — 90% of that reaching
                                        subset, not 90% of all 500. "Covers X% of all
                                        resampled trends" (0.9 × reachedFraction) is the
                                        share of the full 500 the range actually accounts
                                        for, since reachedFraction alone can make the range
                                        look more comprehensive than it is. */}
                                    range: {t.bootstrap.p5Date.toISOString().split('T')[0]} – {t.bootstrap.p95Date.toISOString().split('T')[0]}
                                    {` (covers ${Math.round(0.9 * t.bootstrap.reachedFraction * 100)}% of all resampled trends)`}
                                    <br />
                                  </>
                                )}
                                {`reached within 100 years in ${Math.round(t.bootstrap.reachedFraction * 100)}% of resampled trends`}
                              </span>
                            )}
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">Insufficient data to calculate</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid overflow-x-auto grid-cols-[max-content] max-lg:landscape:grid-cols-[repeat(2,max-content)] lg:grid-cols-[repeat(3,max-content)] gap-x-8 gap-y-3 text-sm">
          <div className="flex flex-col justify-between whitespace-nowrap text-right">
            <div>
              <span className="font-medium text-gray-700">Direct Displacement: </span>
              <span className="text-lg font-semibold" style={{ color: meter.color }}>{directDistance.toFixed(3)} mm</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Observed Activity: </span>
              <span className="text-lg font-semibold" style={{ color: meter.color }}>{totalDistance.toFixed(3)} mm</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Trend Rate ({abbreviateLabel(estimator.label)}): </span>
              <MicronRate mmPerWeek={methodResult ? methodResult.rateMmPerWeek : null} color={meter.color} />
            </div>
            <div>
              <span className="font-medium text-gray-700">Activity Rate: </span>
              <MicronRate mmPerWeek={totalPathRatePerWeek} color={meter.color} />
            </div>
          </div>

          {/* Fixed width (not max-content) so this column — and the
              Activity Gauge bar in it — is the same width on every floor's
              card, since each card is its own independent grid and would
              otherwise size this column to its own shortest/longest text
              (e.g. "no movement" vs. "→ Expanding & ↓ Sinking"). 500px
              fits the widest real content seen so far; overflow-x-auto on
              the grid is the safety net if a future estimator's label
              needs more. */}
          <div className="flex flex-col justify-between whitespace-nowrap w-[500px]">
            <div
              role="button"
              tabIndex={0}
              onClick={toggle}
              onKeyDown={activateOnKey(toggle)}
              className="flex justify-between items-baseline cursor-pointer select-none"
            >
              <span className="font-medium text-gray-700">Crack Overall Movement ({abbreviateLabel(estimator.label)}): </span>
              <span>
                <span className="text-lg font-semibold" style={{ color: meter.color }}>
                  {methodResult ? directionHeadline(dirX, dirY, { compact: true }) : 'Insufficient data'}
                </span>
                <span aria-hidden="true" className="text-gray-400 ml-1">›</span>
              </span>
            </div>
            {/* Spacer: gives this cell the same 4-slot justify-between rhythm
                as the left cell (Direct Displacement/Total Observed
                Activity/Trend Rate/Activity Rate), so ETA — this cell's 3rd
                slot — lands at
                the same height as Trend Rate, the left cell's 3rd slot. */}
            <div aria-hidden="true">&nbsp;</div>
            {methodResult ? (
              <div
                role="button"
                tabIndex={0}
                onClick={cycleEtaMode}
                onKeyDown={activateOnKey(cycleEtaMode)}
                className="text-right cursor-pointer select-none"
                title="Click to cycle: combined / horizontal / vertical"
              >
                <span className="font-medium text-gray-700">
                  ETA{etaMode === 'h' ? ' H' : etaMode === 'v' ? ' V' : ''} <span aria-hidden="true" className="text-gray-400">⇄</span> ({methodResult.thresholds.map(t => `${t.threshold}mm`).join('/')}):{' '}
                </span>
                <span className="text-lg font-semibold font-mono" style={{ color: meter.color }}>
                  {formatThresholdRow(etaThresholds, 'eta')}
                </span>
                {hasConsensus && (
                  <span className="text-sm font-mono" style={{ color: meter.color }}>
                    {' '}({formatThresholdRow(etaThresholds, 'consensus')})
                  </span>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-right">Insufficient data</div>
            )}
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1 text-right">
                Activity Gauge: <span style={{ color: meter.color }}>{getActivityAssessment(totalPathRatePerWeek, maxTotalPathRate)}</span>
              </div>
              <ActivityHeatMeter
                rateMmPerWeek={totalPathRatePerWeek}
                maxRateMmPerWeek={maxTotalPathRate}
                color={meter.color}
                showCaption={false}
              />
            </div>
          </div>

          {componentRates ? (
            <div style={{ maxWidth: `${LEAN_GRAPH_SIZE}px` }}>
              <VectorRateArrow
                horizontalRate={componentRates.x}
                verticalRate={componentRates.y}
                scaleMax={rateScaleMax}
                id={`${meter.key}-lean`}
              />
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-right">Insufficient data</div>
          )}
        </div>
      )}
    </div>
  );
};
