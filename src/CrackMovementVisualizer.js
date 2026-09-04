import React, { useState } from 'react';
import rawData from './data/crackData.json';

// Package info
import packageJson from '../package.json';

// Constants
import { METER_CONFIGS } from './constants/meterConfigs';

// View components
import { TimelineView } from './components/views/TimelineView';
import { MovementPatternsView } from './components/views/MovementPatternsView';
import { NormalizedMovementView } from './components/views/NormalizedMovementView';
import { SingleReadingView } from './components/views/SingleReadingView';
import { DataTableView } from './components/views/DataTableView';

// Hooks
import { useProcessedData } from './hooks/useProcessedData';
import { useETAPredictions } from './hooks/useETAPredictions';

// Sections
import InterpretationNotes from './components/InterpretationNotes';
import Footer from './components/Footer';

// Common components
import { ActivityHeatMeter } from './components/common/ActivityHeatMeter';
import { RateComparisonBar } from './components/common/RateComparisonBar';
import { RateComparisonSummary } from './components/common/RateComparisonSummary';

// ETA estimator registry (Theil-Sen, Secant, ...)
import { ETA_ESTIMATORS, DEFAULT_ETA_METHOD } from './services/calculations/estimators';
import { ETA_COMPONENTS, DEFAULT_ETA_COMPONENT } from './constants/regressionConfig';

// Utils
import { formatDurationFromDays } from './utils/formatDuration';

const ETA_COMPONENT_LABELS = {
  [ETA_COMPONENTS.COMBINED]: 'Combined (2D)',
  [ETA_COMPONENTS.HORIZONTAL]: 'Horizontal only',
  [ETA_COMPONENTS.VERTICAL]: 'Vertical only'
};

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
  const [selectedComponent, setSelectedComponent] = useState(DEFAULT_ETA_COMPONENT);

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
            <option value="normalized">Normalized Movement</option>
            <option value="single">Single Reading</option>
            <option value="data">Data</option>
          </select>
        </div>
        
        {(selectedView === 'timeline' || selectedView === 'movement' || selectedView === 'normalized') && (
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

      {/******** Normalized Movement Patterns View ********/}
      {selectedView === 'normalized' && (
        <NormalizedMovementView
          processedData={processedData}
          selectedMeter={selectedMeter}
          onPointClick={handleMovementPointClick}
          hoveredPoint={hoveredPoint}
          setHoveredPoint={setHoveredPoint}
          setSelectedView={setSelectedView}
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
          setSelectedView={setSelectedView}
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
          <div className="flex gap-4 flex-wrap">
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
            <div>
              <label className="text-sm font-medium mr-2">Displacement Component:</label>
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {Object.values(ETA_COMPONENTS).map(component => (
                  <option key={component} value={component}>{ETA_COMPONENT_LABELS[component]}</option>
                ))}
              </select>
            </div>
          </div>
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
              const estimatorEstimate = etaResult && !etaResult.insufficientData
                ? etaResult.estimates[selectedETAMethod]
                : null;
              const methodResult = estimatorEstimate
                ? estimatorEstimate.components[selectedComponent]
                : null;
              const componentRates = estimatorEstimate ? estimatorEstimate.componentRates : null;

              const firstPosition = `(${meterData[0][meter.dataKeys[0]].toFixed(3)}, ${meterData[0][meter.dataKeys[1]].toFixed(3)})`;
              const lastPosition = `(${meterData[meterData.length - 1][meter.dataKeys[0]].toFixed(3)}, ${meterData[meterData.length - 1][meter.dataKeys[1]].toFixed(3)})`;

              return {
                component: (
                  <div key={meter.name} className="p-3 border border-gray-200 rounded">
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: meter.color }}
                      ></div>
                      <strong>{meter.name}</strong>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="font-medium text-gray-700">Monitoring Period:</div>
                        <div>{firstDate} → {lastDate}</div>
                        <div className="text-gray-500">({meterData.length} measurements)</div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-700">Position Change:</div>
                        <div>{firstPosition} → {lastPosition}</div>
                        <div className="text-gray-500 text-xs">Raw coordinates</div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-700">Normalized Position Change:</div>
                        {(() => {
                          // Get normalized positions for first and last readings
                          const lastNormX = meterData[meterData.length - 1][`${meter.dataKeys[0].replace('_x', '_norm_x')}`];
                          const lastNormY = meterData[meterData.length - 1][`${meter.dataKeys[1].replace('_y', '_norm_y')}`];
                          
                          return (
                            <>
                              <div>
                                <span style={{ color: meter.color }}>(0.000, 0.000)</span> → 
                                <span style={{ color: meter.color }}> ({lastNormX.toFixed(3)}, {lastNormY.toFixed(3)})</span>
                              </div>
                              <div className="text-gray-500 text-xs">Analysis-ready coordinates</div>
                            </>
                          );
                        })()}
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-700">(Normalized) Movement Interpretation:</div>
                        {(() => {
                          // Use normalized coordinates for interpretation
                          const lastNormX = meterData[meterData.length - 1][`${meter.dataKeys[0].replace('_x', '_norm_x')}`];
                          const lastNormY = meterData[meterData.length - 1][`${meter.dataKeys[1].replace('_y', '_norm_y')}`];
                          
                          return (
                            <div className="text-xs text-gray-600">
                              <strong>Based on normalized data</strong><br/>
                              • Horizontal: {lastNormX > 0 ? `+${lastNormX.toFixed(3)}mm (crack expanding)` : 
                                            lastNormX < 0 ? `${lastNormX.toFixed(3)}mm (crack closing)` :
                                            '0.000mm (no horizontal change)'}<br/>
                              • Vertical: {lastNormY > 0 ? `+${lastNormY.toFixed(3)}mm (wall rising)` : 
                                          lastNormY < 0 ? `${lastNormY.toFixed(3)}mm (wall sinking)` :
                                          '0.000mm (no vertical change)'}
                            </div>
                          );
                        })()}
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
                        <div className="font-medium text-gray-700">Trend Rate ({estimator.label} · {ETA_COMPONENT_LABELS[selectedComponent]}):</div>
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
                        <div className="font-medium text-gray-700">Horizontal vs. Vertical Rate ({estimator.label}):</div>
                        {componentRates ? (
                          <>
                            <RateComparisonBar
                              horizontalRate={componentRates.x}
                              verticalRate={componentRates.y}
                              color={meter.color}
                            />
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

                      <div>
                        <div className="font-medium text-gray-700">ETA to Displacement Thresholds ({ETA_COMPONENT_LABELS[selectedComponent]}):</div>
                        <div className="text-xs text-gray-500 mb-1">{estimator.methodology}</div>
                        {(() => {
                          if (!methodResult) {
                            return <div className="text-sm text-gray-500">Insufficient data to calculate</div>;
                          }

                          return (
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
                          );
                        })()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-700">Weekly Rate (Total Path):</div>
                        <div className="text-lg font-semibold" style={{ color: meter.color }}>
                          {totalPathRatePerWeek.toFixed(4)} mm/week
                        </div>
                        <div className="text-gray-500 text-xs mb-2">
                          Based on cumulative path distance (direction-agnostic activity, not a projection)
                        </div>
                        <ActivityHeatMeter
                          rateMmPerWeek={totalPathRatePerWeek}
                          maxRateMmPerWeek={maxTotalPathRate}
                          color={meter.color}
                        />
                      </div> {/* End of grid */}

                      {/* Overall Interpretation */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {(() => {
                          if (!methodResult) {
                            return (
                              <div>
                                <div className="font-medium text-gray-700 mb-1">Overall Movement Direction ({estimator.label}):</div>
                                <div className="text-sm text-gray-500">Insufficient data</div>
                              </div>
                            );
                          }

                          // Direction per the selected method's own trend, not just
                          // the raw last reading — Theil-Sen can (correctly) show no
                          // consistent direction even when the last single reading
                          // sits away from the origin.
                          const dirX = methodResult.direction.x;
                          const dirY = methodResult.direction.y;

                          // Build descriptive text
                          let description = "";

                          if (dirX === 0 && dirY === 0) {
                            description = `Based on ${estimator.directionLabel}, normalized data shows no structural movement.`;
                          } else {
                            description = `Based on ${estimator.directionLabel}, normalized data shows`;

                            // Horizontal movement. No magnitude threshold here: unlike
                            // a raw displacement, `direction` for a fitted method is a
                            // rate (e.g. mm/day), so a fixed mm-scale cutoff doesn't
                            // apply — any nonzero fitted slope is a real detected trend.
                            if (dirX !== 0) {
                              description += dirX > 0 ? " outward horizontal movement" : " inward horizontal movement";
                            }

                            // Add connector ONLY if both movements exist
                            if (dirX !== 0 && dirY !== 0) {
                              description += " and";
                            }

                            // Vertical movement
                            if (dirY !== 0) {
                              description += dirY > 0 ? " upward vertical movement" : " downward vertical movement";
                            }

                            description += ".";
                          }

                          return (
                            <div>
                              <div className="font-medium text-gray-700 mb-1">Overall Movement Direction ({estimator.label}):</div>
                              <div className="text-sm font-semibold mb-2" style={{ color: meter.color }}>
                                {dirX === 0 && dirY === 0 ? 'No movement detected' :
                                dirX === 0 ? (dirY > 0 ? '↑ Wall Rising' : '↓ Wall Sinking') :
                                dirY === 0 ? (dirX > 0 ? '→ Crack Expanding' : '← Crack Closing') :
                                `${dirX > 0 ? '→ Expanding' : '← Closing'} & ${dirY > 0 ? '↑ Rising' : '↓ Sinking'}`}
                              </div>
                              <div className="text-xs text-gray-600 italic">
                                {description}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
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
                {meterResults.map(result => result.component)}
                
                {/* Structural Analysis Summary */}
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                    <strong className="text-lg text-blue-800">Structural Analysis Summary</strong>
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
                          const estimatorEstimate = result.etaResult.estimates[selectedETAMethod];
                          const methodResult = estimatorEstimate ? estimatorEstimate.components[selectedComponent] : null;
                          if (!methodResult) return;

                          methodResult.thresholds.forEach(t => {
                            if (!t.alreadyReached && t.reached) {
                              allETAs.push({
                                meterName: result.meterName,
                                threshold: t.threshold,
                                remainingDays: t.remainingDays,
                                reachedFraction: t.bootstrap ? t.bootstrap.reachedFraction : null
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
                                  <div
                                    className="w-2 h-2 rounded-full flex-shrink-0 bg-blue-500"
                                  ></div>
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
                              {ETA_ESTIMATORS[selectedETAMethod].label} trend per floor ({ETA_COMPONENT_LABELS[selectedComponent]})
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

                      return <RateComparisonSummary data={chartData} />;
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