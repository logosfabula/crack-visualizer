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

// Sections
import InterpretationNotes from './components/InterpretationNotes';
import Footer from './components/Footer';

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
  const [selectedView, setSelectedView] = useState('timeline');
  const [selectedMeter, setSelectedMeter] = useState('all');
  const [selectedReading, setSelectedReading] = useState(null);

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
        <h3 className="font-semibold mb-4">Movement Summary</h3>
        <div className="space-y-4">
          {(() => {
            const meters = Object.values(METER_CONFIGS).map(config => ({
              name: config.displayName,
              dataKeys: config.rawDataKeys,
              color: config.color
            }));

            //let grandTotalDistance = 0;
            const meterResults = meters.map(meter => {
              const meterData = processedData
                .filter(d => d[meter.dataKeys[0]] !== undefined && d[meter.dataKeys[1]] !== undefined)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

              if (meterData.length === 0) {
                return {
                  component: (
                    <div key={meter.name} className="p-3 border border-gray-200 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: meter.color }}
                        ></div>
                        <strong>{meter.name}:</strong>
                        <span className="text-gray-500">No measurements</span>
                      </div>
                    </div>
                  ),
                  totalDistance: 0
                };
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

              //grandTotalDistance += totalDistance; // unused -> warning
              const firstDate = meterData[0].date;
              const lastDate = meterData[meterData.length - 1].date;
              const firstPosition = `(${meterData[0][meter.dataKeys[0]].toFixed(3)}, ${meterData[0][meter.dataKeys[1]].toFixed(3)})`;
              const lastPosition = `(${meterData[meterData.length - 1][meter.dataKeys[0]].toFixed(3)}, ${meterData[meterData.length - 1][meter.dataKeys[1]].toFixed(3)})`;
              
              // Calculate direct displacement (straight line from start to end)
              const directDx = meterData[meterData.length - 1][meter.dataKeys[0]] - meterData[0][meter.dataKeys[0]];
              const directDy = meterData[meterData.length - 1][meter.dataKeys[1]] - meterData[0][meter.dataKeys[1]];
              const directDistance = Math.sqrt(directDx * directDx + directDy * directDy);
              
              // Calculate weekly movement rate based on direct displacement
              const startDate = new Date(firstDate);
              const endDate = new Date(lastDate);
              const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
              const weeksDiff = daysDiff / 7;
              const weeklyMovement = weeksDiff > 0 ? directDistance / weeksDiff : 0;

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
                        <div className="font-medium text-gray-700">Weekly Rate (Direct):</div>
                        <div className="text-lg font-semibold" style={{ color: meter.color }}>
                          {weeklyMovement.toFixed(4)} mm/week
                        </div>
                        <div className="text-gray-500 text-xs">
                          Based on straight-line displacement
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-gray-700">ETA to Displacement Thresholds:</div>
                        <div className="text-xs text-gray-500 mb-1">Based on direct displacement at current average rate (linear projection from first reading)</div>
                        {(() => {
                          // Calculate ETAs based on direct displacement and weekly rate
                          const currentDisplacement = directDistance;
                          const rate = weeklyMovement;
                          
                          if (rate < 0.0001) {
                            return <div className="text-sm text-gray-500">Insufficient movement to calculate</div>;
                          }
                          
                          const formatTime = (weeks) => {
                            const totalDays = Math.round(weeks * 7);
                            
                            const years = Math.floor(totalDays / 365);
                            const remainingAfterYears = totalDays % 365;
                            const weeksRemaining = Math.floor(remainingAfterYears / 7);
                            const days = remainingAfterYears % 7;
                            
                            // Build format string
                            const parts = [];
                            if (years > 0) parts.push(`${years}y`);
                            if (weeksRemaining > 0) parts.push(`${weeksRemaining}w`);
                            if (days > 0 || parts.length === 0) parts.push(`${days}d`);
                            
                            return parts.join(' ');
                          };
                          
                          const calculateETA = (threshold) => {
                            if (currentDisplacement >= threshold) {
                              // Already reached - show when it was reached
                              const totalWeeks = threshold / rate;
                              return (
                                <span className="text-green-700">
                                  ✓ Reached (after {formatTime(totalWeeks)} from first reading)
                                </span>
                              );
                            }
                            
                            // Not reached yet - show both total and remaining time
                            const totalWeeksToThreshold = threshold / rate;
                            const remainingMM = threshold - currentDisplacement;
                            const remainingWeeks = remainingMM / rate;
                            
                            return (
                              <span>
                                {formatTime(remainingWeeks)} remaining
                                <span className="text-gray-500 text-xs ml-1">
                                  ({formatTime(totalWeeksToThreshold)} from first reading)
                                </span>
                              </span>
                            );
                          };
                          
                          return (
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between items-start">
                                <span className="text-gray-600">1mm:</span>
                                <span className="font-mono text-right" style={{ color: meter.color }}>
                                  {calculateETA(1)}
                                </span>
                              </div>
                              <div className="flex justify-between items-start">
                                <span className="text-gray-600">2mm:</span>
                                <span className="font-mono text-right" style={{ color: meter.color }}>
                                  {calculateETA(2)}
                                </span>
                              </div>
                              <div className="flex justify-between items-start">
                                <span className="text-gray-600">5mm:</span>
                                <span className="font-mono text-right" style={{ color: meter.color }}>
                                  {calculateETA(5)}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-700">Weekly Rate (Total Path):</div>
                        <div className="text-lg font-semibold" style={{ color: meter.color }}>
                          {(totalDistance / weeksDiff || 0).toFixed(4)} mm/week
                        </div>
                        <div className="text-gray-500 text-xs">
                          Based on cumulative path distance
                        </div>
                      </div> {/* End of grid */}

                      {/* Overall Interpretation */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {(() => {
                          // Use normalized coordinates for interpretation
                          const lastNormX = meterData[meterData.length - 1][`${meter.dataKeys[0].replace('_x', '_norm_x')}`];
                          const lastNormY = meterData[meterData.length - 1][`${meter.dataKeys[1].replace('_y', '_norm_y')}`];
                          
                          // Build descriptive text
                          let description = "";

                          if (lastNormX === 0 && lastNormY === 0) {
                            description = "Normalized data shows no structural movement.";
                          } else {
                            description = "Normalized data shows";
                            
                            // Horizontal movement
                            if (Math.abs(lastNormX) > 0.01) {
                              description += lastNormX > 0 ? " outward horizontal movement" : " inward horizontal movement";
                            }
                            
                            // Add connector ONLY if both movements exist
                            if (Math.abs(lastNormX) > 0.01 && Math.abs(lastNormY) > 0.01) {
                              description += " and";
                            }
                            
                            // Vertical movement
                            if (Math.abs(lastNormY) > 0.01) {
                              description += lastNormY > 0 ? " upward vertical movement" : " downward vertical movement";
                            }
                            
                            description += ".";
                          }
                          
                          return (
                            <div>
                              <div className="font-medium text-gray-700 mb-1">Overall Movement Direction:</div>
                              <div className="text-sm font-semibold mb-2" style={{ color: meter.color }}>
                                {lastNormX === 0 && lastNormY === 0 ? 'No movement detected' :
                                lastNormX === 0 ? (lastNormY > 0 ? '↑ Wall Rising' : '↓ Wall Sinking') :
                                lastNormY === 0 ? (lastNormX > 0 ? '→ Crack Expanding' : '← Crack Closing') :
                                `${lastNormX > 0 ? '→ Expanding' : '← Closing'} & ${lastNormY > 0 ? '↑ Rising' : '↓ Sinking'}`}
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
                meterColor: meter.color,  // ADD THIS LINE
                weeklyMovement: weeklyMovement,
                directDisplacement: directDistance,
                movementDirectionX: directDx,
                movementDirectionY: directDy
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
                        // Collect all ETA data from all meters
                        const allETAs = [];
                        
                        meterResults.forEach(result => {
                          if (result.weeklyMovement && result.weeklyMovement >= 0.0001) {
                            const currentDisplacement = result.directDisplacement;
                            const rate = result.weeklyMovement;
                            
                            // Check each threshold
                            [1, 2, 5].forEach(threshold => {
                              if (currentDisplacement < threshold) {
                                const remainingMM = threshold - currentDisplacement;
                                const remainingWeeks = remainingMM / rate;
                                
                                allETAs.push({
                                  meterName: result.meterName,
                                  meterColor: result.meterColor,
                                  threshold: threshold,
                                  remainingWeeks: remainingWeeks,
                                  currentDisplacement: currentDisplacement
                                });
                              }
                            });
                          }
                        });
                        
                        // Sort by soonest first and take top 5
                        const topETAs = allETAs
                          .sort((a, b) => a.remainingWeeks - b.remainingWeeks)
                          .slice(0, 5);
                        
                        if (topETAs.length === 0) {
                          return (
                            <div className="text-gray-500 text-sm">
                              All thresholds reached or insufficient movement data
                            </div>
                          );
                        }
                        
                        // Format time helper
                        const formatTime = (weeks) => {
                          const totalDays = Math.round(weeks * 7);
                          const years = Math.floor(totalDays / 365);
                          const remainingAfterYears = totalDays % 365;
                          const weeksRemaining = Math.floor(remainingAfterYears / 7);
                          const days = remainingAfterYears % 7;
                          
                          const parts = [];
                          if (years > 0) parts.push(`${years}y`);
                          if (weeksRemaining > 0) parts.push(`${weeksRemaining}w`);
                          if (days > 0 || parts.length === 0) parts.push(`${days}d`);
                          
                          return parts.join(' ');
                        };
                        
                        return (
                          <div className="space-y-1">
                            {topETAs.map((eta, index) => (
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
                                  {formatTime(eta.remainingWeeks)}
                                </span>
                              </div>
                              
                            ))}
                            {topETAs.length < 5 && (
                              <div className="text-xs text-blue-600 mt-1">
                                Showing {topETAs.length} upcoming threshold{topETAs.length !== 1 ? 's' : ''}
                              </div>
                            )}
                            <div className="text-xs text-blue-600 mt-1">Considering current per-floor avg linear rate (no accelerations)</div>
                          </div>
                        );
                      })()}
                    </div>
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