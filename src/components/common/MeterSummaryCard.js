import React, { useState } from 'react';
import { activateOnKey } from './InfoDisclosure';
import { ActivityHeatMeter, getActivityAssessment } from './ActivityHeatMeter';
import { VectorRateArrow, RATE_ARROW_COLORS } from './VectorRateArrow';
import { ResizableFigure } from './ResizableFigure';
import { formatDurationFromDays } from '../../utils/formatDuration';

// Half of ResizableFigure's own HALF_SIZE — the lean view's graph is a fixed
// small preview (not a control), so it doesn't need ResizableFigure's own
// click-to-resize affordance, just a size consistent with what "shrunk"
// looks like everywhere else on the page.
const LEAN_GRAPH_SIZE = 135;

const directionHeadline = (dirX, dirY) =>
  dirX === 0 && dirY === 0 ? 'No movement detected' :
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

// One value per threshold (in `methodResult.thresholds` order), formatted
// for the lean view's single-line ETA summary: "✓" once already reached,
// "–" if never reached on the current trend, otherwise years remaining.
// `pick` selects which number to show — the ETA itself, or (only present
// for estimators that compute a bootstrap interval, currently Theil-Sen
// only) the confidence that resampled trends actually reach the threshold.
const formatThresholdRow = (thresholds, pick) => thresholds.map(t => {
  if (t.alreadyReached) return '✓';
  if (pick === 'eta') return t.reached ? (t.remainingDays / 365.25).toFixed(1) : '–';
  return t.bootstrap ? `${Math.round(t.bootstrap.reachedFraction * 100)}%` : '–';
}).join('/');

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
  rateScaleMax, rateFiguresShrunk, toggleRateFigures
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded(v => !v);

  const componentRates = methodResult ? methodResult.componentRates : null;
  const dirX = methodResult ? methodResult.direction.x : null;
  const dirY = methodResult ? methodResult.direction.y : null;
  const hasConfidence = !!(methodResult && methodResult.thresholds.some(t => t.bootstrap));

  const normDataKeyX = meter.dataKeys[0].replace('_x', '_norm_x');
  const normDataKeyY = meter.dataKeys[1].replace('_y', '_norm_y');
  const lastNormX = meterData[meterData.length - 1][normDataKeyX];
  const lastNormY = meterData[meterData.length - 1][normDataKeyY];

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
        <span className="ml-auto text-xs text-gray-400" aria-hidden="true">
          {expanded ? '▲ Less detail' : '▼ More detail'}
        </span>
      </div>

      {expanded ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-medium text-gray-700">Monitoring Period:</div>
            <div>{firstDate} → {lastDate}</div>
            <div className="text-gray-500">({meterData.length} measurements)</div>
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
            <div className="font-medium text-gray-700">Total Path Distance:</div>
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
                  <ResizableFigure
                    shrunk={rateFiguresShrunk}
                    onToggle={toggleRateFigures}
                    label="all horizontal vs. vertical rate figures"
                  >
                    <VectorRateArrow
                      horizontalRate={componentRates.x}
                      verticalRate={componentRates.y}
                      scaleMax={rateScaleMax}
                      id={meter.key}
                    />
                  </ResizableFigure>
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
                                {t.bootstrap.p5Date && t.bootstrap.p95Date
                                  ? `range: ${t.bootstrap.p5Date.toISOString().split('T')[0]} – ${t.bootstrap.p95Date.toISOString().split('T')[0]}`
                                  : ''}
                                {` (reached in ${Math.round(t.bootstrap.reachedFraction * 100)}% of resampled trends)`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-gray-700">Direct Displacement:</span>
            <span className="font-mono font-semibold" style={{ color: meter.color }}>{directDistance.toFixed(3)} mm</span>
          </div>
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-gray-700">Trend Rate ({estimator.label}):</span>
            <span className="font-mono font-semibold" style={{ color: meter.color }}>
              {methodResult ? `${methodResult.rateMmPerWeek.toFixed(4)} mm/week` : 'Insufficient data'}
            </span>
          </div>
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-gray-700">Total Path Distance:</span>
            <span className="font-mono font-semibold" style={{ color: meter.color }}>{totalDistance.toFixed(3)} mm</span>
          </div>
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-gray-700">Weekly Rate (Total Path):</span>
            <span className="font-mono font-semibold" style={{ color: meter.color }}>{totalPathRatePerWeek.toFixed(4)} mm/week</span>
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-baseline gap-2 mb-1">
              <span className="text-gray-700">Activity Gauge:</span>
              <span className="font-medium" style={{ color: meter.color }}>{getActivityAssessment(totalPathRatePerWeek, maxTotalPathRate)}</span>
            </div>
            <ActivityHeatMeter
              rateMmPerWeek={totalPathRatePerWeek}
              maxRateMmPerWeek={maxTotalPathRate}
              color={meter.color}
            />
          </div>

          {componentRates && (
            <div style={{ maxWidth: `${LEAN_GRAPH_SIZE}px` }}>
              <VectorRateArrow
                horizontalRate={componentRates.x}
                verticalRate={componentRates.y}
                scaleMax={rateScaleMax}
                id={`${meter.key}-lean`}
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-gray-700">Overall Movement Direction ({estimator.label}):</span>
              <span className="font-semibold text-right" style={{ color: meter.color }}>
                {methodResult ? directionHeadline(dirX, dirY) : 'Insufficient data'}
              </span>
            </div>
            {methodResult && (
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-gray-700">
                  ETA ({methodResult.thresholds.map(t => `${t.threshold}mm`).join('/')}):
                </span>
                <span className="font-mono font-semibold text-right" style={{ color: meter.color }}>
                  {formatThresholdRow(methodResult.thresholds, 'eta')} yr
                  {hasConfidence && ` (${formatThresholdRow(methodResult.thresholds, 'confidence')} conf.)`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
