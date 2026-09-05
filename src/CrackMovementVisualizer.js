import React, { useState } from 'react';
import rawData from './data/crackData.json';

// Package info
import packageJson from '../package.json';

// Constants
import { METER_CONFIGS } from './constants/meterConfigs';

// View components
import { TimelineView } from './components/views/TimelineView';
import { MovementPatternsView } from './components/views/MovementPatternsView';
import { SingleReadingView } from './components/views/SingleReadingView';
import { DataTableView } from './components/views/DataTableView';

// Hooks
import { useProcessedData } from './hooks/useProcessedData';
import { useETAPredictions } from './hooks/useETAPredictions';

// Sections
import InterpretationNotes from './components/InterpretationNotes';
import Footer from './components/Footer';

// Common components
import { VectorRateArrowGrid } from './components/common/VectorRateArrowGrid';
import { MovementIcon } from './components/common/MovementIcon';
import { MeterSummaryCard } from './components/common/MeterSummaryCard';

// ETA estimator registry (Theil-Sen, Secant, ...)
import { ETA_ESTIMATORS, DEFAULT_ETA_METHOD } from './services/calculations/estimators';

// Utils
import { formatDurationFromDays } from './utils/formatDuration';
import { niceCeil } from './utils/niceCeil';

// Shared by the Movement Summary header and the Structural Analysis Summary
// header — same state, so changing either copy updates both sections at once.
const ETAControls = ({ selectedETAMethod, setSelectedETAMethod }) => (
  <div>
    <label className="text-sm font-medium mr-2">ETA Method:</label>
    <select
      value={selectedETAMethod}
      onChange={(e) => setSelectedETAMethod(e.target.value)}
      className="border border-gray-300 rounded px-2 py-1 text-sm"
    >
      {Object.values(ETA_ESTIMATORS).map(estimator => (
        <option key={estimator.id} value={estimator.id}>{estimator.label}</option>
      ))}
    </select>
  </div>
);

const CrackMovementVisualizer = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

    // Handler for clicking points in movement views
    const handleMovementPointClick = (pointData) => {
      const readingValue = JSON.stringify({
        date: pointData.date,
        meter: pointData.meter,
        reading: pointData.reading
      });
      setSelectedReading(readingValue);
      setSelectedView('single');
    };

  // Process data to calculate intersection points and normalized coordinates
  const processedData = useProcessedData(rawData);
  const etaPredictions = useETAPredictions(processedData);
  const [selectedView, setSelectedView] = useState('timeline');
  const [selectedMeter, setSelectedMeter] = useState('all');
  const [selectedReading, setSelectedReading] = useState(null);
  const [selectedETAMethod, setSelectedETAMethod] = useState(DEFAULT_ETA_METHOD);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6">Crack Movement Analysis Dashboard</h1>
      <h2 className="text-xl font mb-6 flex items-center gap-2">
        <img 
          src={`${process.env.PUBLIC_URL}/web-app-manifest-192x192.png`} 
          alt="Site icon" 
          className="w-24 h-24"
        />
        Location: M. d. S., 10
      </h2>
      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">View:</label>
          <select 
            value={selectedView} 
            onChange={(e) => setSelectedView(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="timeline">Timeline</option>
            <option value="movement">Movement Patterns</option>
            <option value="single">Single Reading</option>
            <option value="data">Data</option>
          </select>
        </div>
        
        {(selectedView === 'timeline' || selectedView === 'movement') && (
          <div>
            <label className="block text-sm font-medium mb-2">Crack Meter:</label>
            <select 
              value={selectedMeter} 
              onChange={(e) => setSelectedMeter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="all">All Meters</option>
              <option value="pianterreno">Pianterreno</option>
              <option value="piano1">Piano 1</option>
              <option value="piano2">Piano 2</option>
            </select>
          </div>
        )}

        {selectedView === 'single' && (
          <div>
            <label className="block text-sm font-medium mb-2">Select Reading:</label>
            <select 
              value={selectedReading || ''}
              onChange={(e) => setSelectedReading(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Choose a reading...</option>
              {processedData
                .flatMap(row => {
                  const readings = [];
                  if (row.rawPianterreno) readings.push({ date: row.date, meter: 'Pianterreno', reading: row.rawPianterreno });
                  if (row.rawPiano1) readings.push({ date: row.date, meter: 'Piano 1', reading: row.rawPiano1 });
                  if (row.rawPiano2) readings.push({ date: row.date, meter: 'Piano 2', reading: row.rawPiano2 });
                  return readings;
                })
                .map((item, idx) => (
                  <option key={idx} value={JSON.stringify(item)}>
                    {item.date} - {item.meter}
                  </option>
                ))
              }
            </select>
          </div>
        )}
      </div>

      {/******** Timeline View ********/}
      {/* Timeline View */}
      {selectedView === 'timeline' && (
        <TimelineView 
          processedData={processedData} 
          selectedMeter={selectedMeter} 
        />
      )}

      {/******** Single Reading View ********/} 
      {selectedView === 'single' && selectedReading && (
        <SingleReadingView
          processedData={processedData}
          selectedReading={selectedReading}
          hoveredPoint={hoveredPoint}
          setHoveredPoint={setHoveredPoint}
        />
      )}

      {/******** Movement Patterns View ********/}
      {selectedView === 'movement' && (
        <MovementPatternsView
          processedData={processedData}
          selectedMeter={selectedMeter}
          onPointClick={handleMovementPointClick}
          hoveredPoint={hoveredPoint}
          setHoveredPoint={setHoveredPoint}
        />
      )}

      {/******** Raw Data View ********/}
      {selectedView === 'data' && (
        <DataTableView processedData={processedData} />
      )}

      {/******** Summary Statistics ********/}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-semibold">Movement Summary</h3>
          <ETAControls
            selectedETAMethod={selectedETAMethod}
            setSelectedETAMethod={setSelectedETAMethod}
          />
        </div>
        <div className="space-y-4">
          {(() => {
            const meters = Object.entries(METER_CONFIGS).map(([key, config]) => ({
              key,
              name: config.displayName,
              dataKeys: config.rawDataKeys,
              color: config.color
            }));

            // Pass 1: plain per-floor stats, no JSX yet — needed so the
            // activity heat-meter can scale relative to the group max.
            const meterStats = meters.map(meter => {
              const meterData = processedData
                .filter(d => d[meter.dataKeys[0]] !== undefined && d[meter.dataKeys[1]] !== undefined)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

              if (meterData.length === 0) {
                return { meter, empty: true };
              }

              // Calculate total distance traveled
              let totalDistance = 0;
              for (let i = 1; i < meterData.length; i++) {
                const prev = meterData[i - 1];
                const curr = meterData[i];
                const dx = curr[meter.dataKeys[0]] - prev[meter.dataKeys[0]];
                const dy = curr[meter.dataKeys[1]] - prev[meter.dataKeys[1]];
                totalDistance += Math.sqrt(dx * dx + dy * dy);
              }

              const firstDate = meterData[0].date;
              const lastDate = meterData[meterData.length - 1].date;

              // Calculate direct displacement (straight line from start to end)
              const directDx = meterData[meterData.length - 1][meter.dataKeys[0]] - meterData[0][meter.dataKeys[0]];
              const directDy = meterData[meterData.length - 1][meter.dataKeys[1]] - meterData[0][meter.dataKeys[1]];
              const directDistance = Math.sqrt(directDx * directDx + directDy * directDy);

              const startDate = new Date(firstDate);
              const endDate = new Date(lastDate);
              const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
              const weeksDiff = daysDiff / 7;
              const totalPathRatePerWeek = weeksDiff > 0 ? totalDistance / weeksDiff : 0;

              return {
                meter, empty: false, meterData, totalDistance, firstDate, lastDate,
                directDx, directDy, directDistance, weeksDiff, totalPathRatePerWeek
              };
            });

            const maxTotalPathRate = Math.max(
              0.0001,
              ...meterStats.filter(s => !s.empty).map(s => s.totalPathRatePerWeek)
            );

            // One shared axis scale for every Horizontal vs. Vertical Rate
            // arrow on the page (per-floor cards and the cross-floor summary
            // alike), so the same rate always renders at the same arrow
            // length no matter where it's shown — computed for the currently
            // selected ETA method, since componentRates depend on it.
            // Rounded up to a "nice" number so the axis labels read as a
            // clean reference value, not an arbitrary exact maximum.
            const rateScaleMax = niceCeil(Math.max(
              0.0001,
              ...meters.flatMap(meter => {
                const etaResult = etaPredictions[meter.key];
                const estimatorEstimate = etaResult && !etaResult.insufficientData
                  ? etaResult.estimates[selectedETAMethod]
                  : null;
                const rates = estimatorEstimate ? estimatorEstimate.componentRates : null;
                return rates ? [Math.abs(rates.x), Math.abs(rates.y)] : [];
              })
            ));

            // Pass 2: render, using the group max computed above.
            const meterResults = meterStats.map(stats => {
              if (stats.empty) {
                return {
                  component: (
                    <div key={stats.meter.name} className="p-3 border border-gray-200 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: stats.meter.color }}
                        ></div>
                        <strong>{stats.meter.name}:</strong>
                        <span className="text-gray-500">No measurements</span>
                      </div>
                    </div>
                  ),
                  totalDistance: 0
                };
              }

              const {
                meter, meterData, totalDistance, firstDate, lastDate,
                directDx, directDy, directDistance, totalPathRatePerWeek
              } = stats;

              const etaResult = etaPredictions[meter.key];
              const estimator = ETA_ESTIMATORS[selectedETAMethod];
              const methodResult = etaResult && !etaResult.insufficientData
                ? etaResult.estimates[selectedETAMethod]
                : null;
              const componentRates = methodResult ? methodResult.componentRates : null;

              return {
                component: (
                  <MeterSummaryCard
                    key={meter.name}
                    meter={meter}
                    meterData={meterData}
                    totalDistance={totalDistance}
                    firstDate={firstDate}
                    lastDate={lastDate}
                    directDistance={directDistance}
                    totalPathRatePerWeek={totalPathRatePerWeek}
                    maxTotalPathRate={maxTotalPathRate}
                    etaResult={etaResult}
                    estimator={estimator}
                    methodResult={methodResult}
                    rateScaleMax={rateScaleMax}
                  />
                ),
                totalDistance: totalDistance,
                meterName: meter.name,
                meterColor: meter.color,
                etaResult: etaResult,
                directDisplacement: directDistance,
                movementDirectionX: directDx,
                movementDirectionY: directDy,
                componentRates: componentRates
              };
            });

            return (
              <>
                {meterResults.map((result, idx) => (
                  <React.Fragment key={idx}>
                    {result.component}
                    {idx < meterResults.length - 1 && (
                      <div className="flex justify-end py-1 px-1">
                        <ETAControls
                          selectedETAMethod={selectedETAMethod}
                          setSelectedETAMethod={setSelectedETAMethod}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
                
                {/* Structural Analysis Summary */}
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                      <strong className="text-lg text-blue-800">Structural Analysis Summary</strong>
                    </div>
                    <ETAControls
                      selectedETAMethod={selectedETAMethod}
                      setSelectedETAMethod={setSelectedETAMethod}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="font-medium text-blue-700 mb-2">Most Active Crack Meter:</div>
                      {(() => {
                        const activeMeter = meterResults
                          .filter(r => r.totalDistance > 0)
                          .sort((a, b) => b.totalDistance - a.totalDistance)[0];
                        
                        if (!activeMeter) {
                          return <div className="text-gray-500">No movement detected</div>;
                        }
                        
                        const meterName = activeMeter.meterName;
                        const distance = activeMeter.totalDistance;
                        
                        return (
                          <div>
                            <div className="text-xl font-bold text-blue-600">
                              {meterName}
                            </div>
                            <div className="text-sm text-blue-700">
                              {distance.toFixed(3)} mm total movement
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              {distance > 1.0 ? 'Requires attention' :
                               distance > 0.5 ? 'Monitor closely' :
                               'Normal activity levels'}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    
                    <div>
                      <div className="font-medium text-blue-700 mb-2">Farthest Displacement:</div>
                      {(() => {
                        const activeMeters = meterResults.filter(r => r.totalDistance > 0);
                        
                        if (activeMeters.length === 0) {
                          return <div className="text-gray-500">No displacement detected</div>;
                        }
                        
                        // Find meter with largest direct displacement
                        const farthestMeter = activeMeters
                          .sort((a, b) => b.directDisplacement - a.directDisplacement)[0];
                        
                        return (
                          <div>
                            <div className="text-xl font-bold text-blue-600">
                              {farthestMeter.meterName}
                            </div>
                            <div className="text-sm text-blue-700">
                              {farthestMeter.directDisplacement.toFixed(3)} mm net displacement
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              {farthestMeter.directDisplacement > 1.0 ? 'Significant displacement' :
                               farthestMeter.directDisplacement > 0.5 ? 'Moderate displacement' :
                               'Minor displacement'}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      <div className="font-medium text-blue-700 mb-2">Top 5 Soonest ETAs:</div>
                      {(() => {
                        // Collect all not-yet-reached, trend-projected thresholds from all meters
                        const allETAs = [];

                        meterResults.forEach(result => {
                          if (!result.etaResult || result.etaResult.insufficientData) return;
                          const methodResult = result.etaResult.estimates[selectedETAMethod];
                          if (!methodResult) return;

                          methodResult.thresholds.forEach(t => {
                            if (!t.alreadyReached && t.reached) {
                              allETAs.push({
                                meterName: result.meterName,
                                threshold: t.threshold,
                                remainingDays: t.remainingDays,
                                reachedFraction: t.bootstrap ? t.bootstrap.reachedFraction : null,
                                direction: methodResult.direction
                              });
                            }
                          });
                        });

                        // Sort by soonest first and take top 5
                        const topETAs = allETAs
                          .sort((a, b) => a.remainingDays - b.remainingDays)
                          .slice(0, 5);

                        if (topETAs.length === 0) {
                          return (
                            <div className="text-gray-500 text-sm">
                              All thresholds reached or insufficient movement data
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-1">
                            {topETAs.map((eta) => (
                              <div
                                key={`${eta.meterName}-${eta.threshold}`}
                                className="flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-1.5">
                                  <MovementIcon
                                    dirX={eta.direction.x}
                                    dirY={eta.direction.y}
                                    size={18}
                                  />
                                  <span className="font-medium text-black-700">
                                    {eta.meterName}
                                  </span>
                                  <span className="text-black-600">→ {eta.threshold}mm:</span>
                                </div>
                                <span
                                  className="font-mono font-semibold text-right ml-2 text-black-600"
                                >
                                  {formatDurationFromDays(eta.remainingDays)}
                                  {eta.reachedFraction !== null && (
                                    <span className="text-gray-500 font-normal ml-1">
                                      ({Math.round(eta.reachedFraction * 100)}%)
                                    </span>
                                  )}
                                </span>
                              </div>

                            ))}
                            {topETAs.length < 5 && (
                              <div className="text-xs text-blue-600 mt-1">
                                Showing {topETAs.length} upcoming threshold{topETAs.length !== 1 ? 's' : ''}
                              </div>
                            )}
                            <div className="text-xs text-blue-600 mt-1">
                              {ETA_ESTIMATORS[selectedETAMethod].label} trend per floor
                              {topETAs.some(e => e.reachedFraction !== null) && '; % = share of bootstrap resamples that reach the threshold at all'}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="font-medium text-blue-700 mb-2">
                      Horizontal vs. Vertical Rate — All Floors ({ETA_ESTIMATORS[selectedETAMethod].label}):
                    </div>
                    {(() => {
                      const chartData = meterResults
                        .filter(r => r.componentRates)
                        .map(r => ({
                          name: r.meterName,
                          color: r.meterColor,
                          horizontal: r.componentRates.x,
                          vertical: r.componentRates.y
                        }));

                      if (chartData.length === 0) {
                        return <div className="text-gray-500 text-sm">Insufficient data</div>;
                      }

                      return (
                        <VectorRateArrowGrid
                          data={chartData}
                          scaleMax={rateScaleMax}
                        />
                      );
                    })()}
                  </div>

                  <div className="mt-3 text-xs text-blue-600">
                    {(() => {
                      // Get all dates from active meters
                      const allDates = processedData
                        .filter(d => d.pianterreno_x !== undefined || d.piano1_x !== undefined || d.piano2_x !== undefined)
                        .map(d => d.date)
                        .sort();
                      
                      if (allDates.length === 0) {
                        return "* Analysis based on displacement over monitoring period";
                      }
                      
                      const oldestDate = allDates[0];
                      const latestDate = allDates[allDates.length - 1];
                      
                      return `* Analysis based on displacement over monitoring period ${oldestDate} → ${latestDate}`;
                    })()}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
        
        <InterpretationNotes />

        <Footer version={packageJson.version} />

      </div>
    </div>
  );
};

export default CrackMovementVisualizer;