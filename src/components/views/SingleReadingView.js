import React from 'react';
import { IntersectionCalculator } from '../../services/calculations/IntersectionCalculator';
import { AngleAnalyzer } from '../../services/calculations/AngleAnalyzer';
import { ExportService } from '../../services/export/ExportService';
import { METER_CONFIGS } from '../../constants/meterConfigs';
import { FLOOR_INTERPRETATIONS } from '../../constants/floorInterpretations';
import { METER_BOUNDARIES, DISPLAY_RANGE } from '../../constants/boundaries';
import { toSVGX, toSVGY } from '../../utils/coordinateConverters';

// Helper to get meter color by display name
const getMeterColor = (meterDisplayName) => {
  const config = Object.values(METER_CONFIGS).find(c => c.displayName === meterDisplayName);
  return config?.color || '#2563eb';
};

export const SingleReadingView = ({ 
  processedData,
  selectedReading,
  hoveredPoint,
  setHoveredPoint 
}) => {
  // Early return if no reading selected
  if (!selectedReading || selectedReading === '') {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Single Reading Visualization</h2>
        <div className="text-gray-500 p-8 text-center border-2 border-dashed border-gray-200 rounded">
          Please select a reading from the dropdown above to visualize the crack position.
        </div>
      </div>
    );
  }

  // Safe parsing with error handling
  let parsedReading;
  try {
    parsedReading = JSON.parse(selectedReading);
  } catch (e) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Single Reading Visualization</h2>
        <div className="text-red-500 p-4 border border-red-200 rounded">
          Error parsing reading data. Please select a different reading.
        </div>
      </div>
    );
  }

  const { date, meter, reading } = parsedReading;
  
  // Validate that all required fields exist
  if (!date || !meter || !reading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Single Reading Visualization</h2>
        <div className="text-red-500 p-4 border border-red-200 rounded">
          Invalid reading data. Missing required fields.
        </div>
      </div>
    );
  }

  const meterName = meter;
  const meterColor = getMeterColor(meterName);
  
  // Calculate intersection point and angle analysis
  const intersection = IntersectionCalculator.calculate(reading);
  const angleAnalysis = AngleAnalyzer.analyzeQuadrantAngles(reading);
  
  // Calculate normalized intersection (relative to first reading of this meter)
  let normalizedIntersection = null;
  if (intersection !== null) {
    const meterKey = meterName === 'Pianterreno' ? 'pianterreno' : 
                    meterName === 'Piano 1' ? 'piano1' : 'piano2';
    
    // Find the first reading for this meter to use as origin
    const meterData = processedData
      .filter(d => d[`${meterKey}_x`] !== undefined)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (meterData.length > 0) {
      const firstReading = meterData[0];
      const originX = firstReading[`${meterKey}_x`];
      const originY = firstReading[`${meterKey}_y`];
      
      // Calculate relative position from first reading
      let normX = intersection.x - originX;
      let normY = intersection.y - originY;
      
      // Apply floor-specific inversion to match P1 interpretation
      if (FLOOR_INTERPRETATIONS[meterKey].needsInversion) {
        normX = -normX;
        normY = -normY;
      }
      
      normalizedIntersection = {
        x: normX,
        y: normY
      };
    }
  }
  
  // Early return if intersection calculation failed
  if (!intersection) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Single Reading Visualization</h2>
        <div className="text-red-500 p-4 border border-red-200 rounded">
          Unable to calculate intersection for this reading. Please check the data format.
          {normalizedIntersection !== null && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <div className="text-sm">
                <strong className="text-blue-800">Normalized Position:</strong>
                <span className="text-blue-700 font-mono ml-2">
                  ({normalizedIntersection.x.toFixed(3)}, {normalizedIntersection.y.toFixed(3)}) mm
                </span>
                <div className="text-xs text-blue-600 mt-1">
                  ○ Blue circle outline shows position relative to this meter's first reading
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Parse the reading values - with validation
  const readingParts = reading.split(';').map(v => parseFloat(v));
  if (readingParts.length !== 4 || readingParts.some(v => isNaN(v))) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Single Reading Visualization</h2>
        <div className="text-red-500 p-4 border border-red-200 rounded">
          Invalid reading format. Expected 4 semicolon-separated numbers.
          <div className="mt-2 text-sm">
            <strong>Reading:</strong> {reading}
          </div>
        </div>
      </div>
    );
  }
  
  const [up, right, down, left] = readingParts;
  
  // Calculate line endpoints in physical coordinates
  const topPoint = { x: up, y: METER_BOUNDARIES.Y_MIN };
  const bottomPoint = { x: down, y: METER_BOUNDARIES.Y_MAX };
  const leftPoint = { x: METER_BOUNDARIES.X_MIN, y: left };
  const rightPoint = { x: METER_BOUNDARIES.X_MAX, y: right };
  
  // Calculate vertical line endpoints for display
  let topDisplayX, bottomDisplayX;
  
  if (Math.abs(topPoint.x - bottomPoint.x) < 1e-10) {
    // Truly vertical line
    topDisplayX = up;
    bottomDisplayX = down;
  } else {
    // Sloped line
    const verticalSlope = (bottomPoint.y - topPoint.y) / (bottomPoint.x - topPoint.x);
    const verticalIntercept = topPoint.y - verticalSlope * topPoint.x;
    topDisplayX = (DISPLAY_RANGE.Y_MIN - verticalIntercept) / verticalSlope;
    bottomDisplayX = (DISPLAY_RANGE.Y_MAX - verticalIntercept) / verticalSlope;
  }
  
  // Calculate horizontal line endpoints for display
  let leftDisplayY, rightDisplayY;
  
  if (Math.abs(leftPoint.y - rightPoint.y) < 1e-10) {
    // Truly horizontal line
    leftDisplayY = left;
    rightDisplayY = right;
  } else {
    // Sloped line
    const horizontalSlope = (rightPoint.y - leftPoint.y) / (rightPoint.x - leftPoint.x);
    const horizontalIntercept = leftPoint.y - horizontalSlope * leftPoint.x;
    leftDisplayY = horizontalSlope * DISPLAY_RANGE.X_MIN + horizontalIntercept;
    rightDisplayY = horizontalSlope * DISPLAY_RANGE.X_MAX + horizontalIntercept;
  }
  
  // Convert to SVG coordinates
  const topX_svg = toSVGX(topDisplayX);
  const topY_svg = toSVGY(DISPLAY_RANGE.Y_MIN);
  const bottomX_svg = toSVGX(bottomDisplayX);
  const bottomY_svg = toSVGY(DISPLAY_RANGE.Y_MAX);
  
  const leftX_svg = toSVGX(DISPLAY_RANGE.X_MIN);
  const leftY_svg = toSVGY(leftDisplayY);
  const rightX_svg = toSVGX(DISPLAY_RANGE.X_MAX);
  const rightY_svg = toSVGY(rightDisplayY);
  
  const intersectionX_svg = toSVGX(intersection.x);
  const intersectionY_svg = toSVGY(intersection.y);
  
  // Calculate days since first reading for tooltip
  const meterKey = meterName === 'Pianterreno' ? 'pianterreno' : 
                  meterName === 'Piano 1' ? 'piano1' : 'piano2';
  const firstReading = processedData
    .filter(d => d[`${meterKey}_x`] !== undefined)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  
  const daysSinceFirst = firstReading ? 
    Math.round((new Date(date) - new Date(firstReading.date)) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Single Reading Visualization</h2>
      
      {/* Action buttons */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => ExportService.downloadImage(meterName, date)}
          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors text-sm"
          title="Download crack meter image"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Image
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: meterColor }}
            ></div>
            <h3 className="font-semibold">{meterName} - {date}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Raw Reading:</strong> {reading}
            </div>
            <div>
              <strong>Grid Coordinates:</strong> X: {intersection.x.toFixed(3)}mm, Y: {intersection.y.toFixed(3)}mm
            </div>
            {normalizedIntersection !== null && (
              <div>
                <strong>Normalized Grid Coordinates:</strong> X: {normalizedIntersection.x.toFixed(3)}mm, Y: {normalizedIntersection.y.toFixed(3)}mm
              </div>
            )}
          </div>
          {angleAnalysis && angleAnalysis.deviation > 0.1 && (
            <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
              <div className="text-sm">
                <strong className="text-orange-800">Cross Angle Analysis:</strong> <span className="text-orange-700">{angleAnalysis.description}</span>
                <div className="text-xs text-orange-600 mt-1">
                  Deviation from 90°: {angleAnalysis.deviation.toFixed(2)}°
                  {angleAnalysis.deviation > 2.0 && " - Consider measurement verification"}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="border border-gray-300 rounded-lg p-4">
          <svg width="100%" height="600" viewBox="0 0 800 600">
            {/* Grid pattern with fine and coarse lines */}
            <defs>
              <pattern id="fineGrid" width="66.67" height="50" patternUnits="userSpaceOnUse">
                <path d="M 66.67 0 L 0 0 0 50" fill="none" stroke="#f3f4f6" strokeWidth="1.5"/>
              </pattern>
              <pattern id="coarseGrid" width="133.33" height="100" patternUnits="userSpaceOnUse">
                <path d="M 133.33 0 L 0 0 0 100" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
              </pattern>
            </defs>
            <rect width="800" height="600" fill="url(#fineGrid)"/>
            <rect width="800" height="600" fill="url(#coarseGrid)"/>
            
            {/* Center lines */}
            <line x1="400" y1="0" x2="400" y2="600" stroke="#d1d5db" strokeWidth="2"/>
            <line x1="0" y1="300" x2="800" y2="300" stroke="#d1d5db" strokeWidth="2"/>
            
            {/* Axis labels */}
            <text x="750" y="320" textAnchor="end" fontSize="12" fill="#6b7280">+X</text>
            <text x="50" y="320" textAnchor="start" fontSize="12" fill="#6b7280">-X</text>
            <text x="410" y="30" textAnchor="start" fontSize="12" fill="#6b7280">-Y</text>
            <text x="410" y="580" textAnchor="start" fontSize="12" fill="#6b7280">+Y</text>
            
            {/* Scale markers */}
            <g stroke="#9ca3af" strokeWidth="1" fontSize="12" fill="#6b7280">
              {[DISPLAY_RANGE.X_MIN, -1, -0.5, 0.5, 1, DISPLAY_RANGE.X_MAX].map((val, idx) => {
                const xPos = toSVGX(val);
                return (
                  <g key={`h-marker-${idx}`}>
                    <line x1={xPos} y1="295" x2={xPos} y2="305"/>
                    <text x={xPos} y="325" textAnchor="middle">
                      {val > 0 ? '+' : ''}{val}
                    </text>
                  </g>
                );
              })}
              
              {[DISPLAY_RANGE.Y_MIN, -1, -0.5, 0.5, 1, DISPLAY_RANGE.Y_MAX].map((val, idx) => {
                const yPos = toSVGY(val);
                return (
                  <g key={`v-marker-${idx}`}>
                    <line x1="390" y1={yPos} x2="410" y2={yPos}/>
                    <text x="420" y={yPos + 8} textAnchor="start">
                      {val > 0 ? '+' : ''}{val}
                    </text>
                  </g>
                );
              })}
            </g>
            
            {/* Draw the crack cross - DASHED RED LINES */}
            <line 
              x1={topX_svg} y1={topY_svg} 
              x2={bottomX_svg} y2={bottomY_svg} 
              stroke="#ff6b6b" 
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.6"
            />
            <line 
              x1={leftX_svg} y1={leftY_svg} 
              x2={rightX_svg} y2={rightY_svg} 
              stroke="#ff6b6b" 
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.6"
            />
            
            {/* Intersection point (absolute) - DASHED CIRCLE */}
            <circle 
              cx={intersectionX_svg} 
              cy={intersectionY_svg} 
              r="8" 
              fill="white"
              stroke={meterColor} 
              strokeWidth="2"
              strokeDasharray="3,2"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => {
                setHoveredPoint({
                  show: true,
                  isRaw: true,
                  meter: meterName,
                  color: meterColor,
                  rawX: intersection.x,
                  rawY: intersection.y
                });
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            
            {/* Normalized intersection marker - SOLID DOT + RED CROSS */}
            {normalizedIntersection !== null && (
              <g transform={`translate(${toSVGX(normalizedIntersection.x)}, ${toSVGY(normalizedIntersection.y)})`}>
                {/* Red cross at normalized position */}
                <line 
                  x1="-15" y1="0" 
                  x2="15" y2="0" 
                  stroke="#dc2626" 
                  strokeWidth="3"
                />
                <line 
                  x1="0" y1="-15" 
                  x2="0" y2="15" 
                  stroke="#dc2626" 
                  strokeWidth="3"
                />
                {/* Solid floor-colored dot with hover */}
                <circle 
                  cx="0" 
                  cy="0" 
                  r="8" 
                  fill={meterColor} 
                  stroke="white"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => {
                    setHoveredPoint({
                      show: true,
                      meter: meterName,
                      color: meterColor,
                      date: date,
                      daysSinceFirst: daysSinceFirst,
                      rawX: intersection.x,
                      rawY: intersection.y,
                      normX: normalizedIntersection.x,
                      normY: normalizedIntersection.y,
                      reading: reading,
                      angleAnalysis: angleAnalysis,
                      isNormalized: true
                    });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Coordinate label */}
                <text 
                  x="0" 
                  y="-22" 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill={meterColor} 
                  fontWeight="bold"
                  stroke="white"
                  strokeWidth="2"
                  paintOrder="stroke"
                  style={{ pointerEvents: 'none' }}
                >
                  ({normalizedIntersection.x.toFixed(3)}, {normalizedIntersection.y.toFixed(3)})
                </text>
              </g>
            )}
            
            {/* Tooltip for normalized position (detailed) */}
            {hoveredPoint && hoveredPoint.show && hoveredPoint.isNormalized && (
              <g transform={`translate(${toSVGX(hoveredPoint.normX)}, ${toSVGY(hoveredPoint.normY) - 90})`}>
                <rect 
                  x="-110" y="-45" 
                  width="220" height="85" 
                  fill="white" 
                  stroke={hoveredPoint.color}
                  strokeWidth="2" 
                  rx="4"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                />
                <text x="0" y="-25" textAnchor="middle" fontSize="11" fontWeight="bold" fill={hoveredPoint.color}>
                  {hoveredPoint.meter} - {hoveredPoint.date}
                </text>
                <text x="0" y="-10" textAnchor="middle" fontSize="10" fill="#666">
                  Day {hoveredPoint.daysSinceFirst} from first reading
                </text>
                <text x="0" y="3" textAnchor="middle" fontSize="9" fill="#888">
                  Raw: ({hoveredPoint.rawX.toFixed(3)}, {hoveredPoint.rawY.toFixed(3)}) mm
                </text>
                <text x="0" y="16" textAnchor="middle" fontSize="10" fill="#333">
                  Normalized: ({hoveredPoint.normX.toFixed(3)}, {hoveredPoint.normY.toFixed(3)}) mm
                </text>
                <text x="0" y="30" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#000">
                  {(() => {
                    const x = hoveredPoint.normX;
                    const y = hoveredPoint.normY;
                    if (Math.abs(x) < 0.05 && Math.abs(y) < 0.05) return 'No movement from origin';
                    
                    let dir = '';
                    if (Math.abs(y) > 0.05) dir += y < 0 ? 'Closing' : 'Opening';
                    if (Math.abs(x) > 0.05) {
                      if (dir) dir += ' + ';
                      dir += x < 0 ? 'Left' : 'Right';
                    }
                    return dir || 'Minimal movement';
                  })()}
                </text>
              </g>
            )}
            
            {/* Tooltip for raw position (simple) */}
            {hoveredPoint && hoveredPoint.show && hoveredPoint.isRaw && (
              <g transform={`translate(${toSVGX(hoveredPoint.rawX)}, ${toSVGY(hoveredPoint.rawY) - 55})`}>
                <rect 
                  x="-95" y="-25" 
                  width="190" height="50" 
                  fill="white" 
                  stroke={hoveredPoint.color}
                  strokeWidth="2" 
                  rx="4"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                />
                <text x="0" y="-10" textAnchor="middle" fontSize="11" fontWeight="bold" fill={hoveredPoint.color}>
                  Raw Position
                </text>
                <text x="0" y="2" textAnchor="middle" fontSize="10" fill="#333">
                  ({hoveredPoint.rawX.toFixed(3)}, {hoveredPoint.rawY.toFixed(3)}) mm
                </text>
                <text x="0" y="15" textAnchor="middle" fontSize="9" fill="#666" fontStyle="italic">
                  Hover over normalized position (solid dot)
                </text>
                <text x="0" y="26" textAnchor="middle" fontSize="9" fill="#666" fontStyle="italic">
                  for detailed movement analysis
                </text>
              </g>
            )}
            
            {/* Physical meter boundary readings shown on display edges */}
            {(() => {
              const boundaryMarkers = [];
              
              // Show markers only if they're visible within display range
              if (up >= DISPLAY_RANGE.X_MIN && up <= DISPLAY_RANGE.X_MAX) {
                boundaryMarkers.push({ x: up, y: DISPLAY_RANGE.Y_MIN, label: 'top' });
              }
              if (down >= DISPLAY_RANGE.X_MIN && down <= DISPLAY_RANGE.X_MAX) {
                boundaryMarkers.push({ x: down, y: DISPLAY_RANGE.Y_MAX, label: 'bottom' });
              }
              if (left >= DISPLAY_RANGE.Y_MIN && left <= DISPLAY_RANGE.Y_MAX) {
                boundaryMarkers.push({ x: DISPLAY_RANGE.X_MIN, y: left, label: 'left' });
              }
              if (right >= DISPLAY_RANGE.Y_MIN && right <= DISPLAY_RANGE.Y_MAX) {
                boundaryMarkers.push({ x: DISPLAY_RANGE.X_MAX, y: right, label: 'right' });
              }
              
              return boundaryMarkers.map((marker, idx) => (
                <circle
                  key={`boundary-reading-${idx}`}
                  cx={toSVGX(marker.x)}
                  cy={toSVGY(marker.y)}
                  r="6"
                  fill="none"
                  stroke="#ff6b6b"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                  opacity="0.6"
                />
              ));
            })()}
            
            {/* Boundary intersection labels - showing actual reading values */}
            <text x={toSVGX(up)} y="15" textAnchor="middle" fontSize="12" fill="#dc2626" fontWeight="bold">
              ↑{up}
            </text>
            <text x={toSVGX(down)} y="590" textAnchor="middle" fontSize="12" fill="#dc2626" fontWeight="bold">
              ↓{down}
            </text>
            <text x="10" y={toSVGY(left) + 4} textAnchor="start" fontSize="12" fill="#dc2626" fontWeight="bold">
              ←{left}
            </text>
            <text x="790" y={toSVGY(right) + 4} textAnchor="end" fontSize="12" fill="#dc2626" fontWeight="bold">
              →{right}
            </text>
            
            {/* Intersection coordinate label */}
            <text 
              x={intersectionX_svg} 
              y={intersectionY_svg - 15} 
              textAnchor="middle" 
              fontSize="12" 
              fill={meterColor} 
              fontWeight="bold"
              stroke="white"
              strokeWidth="3"
              paintOrder="stroke"
            >
              ({intersection.x.toFixed(3)}, {intersection.y.toFixed(3)})
            </text>
            
            {/* Quadrant angle labels for non-orthogonal crosses */}
            {angleAnalysis && angleAnalysis.deviation > 0.1 && (
              <>
                <text x="200" y="150" textAnchor="middle" fontSize="12" fill="#7c3aed" fontWeight="bold"
                      stroke="white" strokeWidth="3" paintOrder="stroke">
                  NW: {angleAnalysis.widerQuadrants?.includes('NW') ? 
                    angleAnalysis.widerAngle.toFixed(1) : angleAnalysis.narrowerAngle.toFixed(1)}°
                </text>
                <text x="600" y="150" textAnchor="middle" fontSize="12" fill="#7c3aed" fontWeight="bold"
                      stroke="white" strokeWidth="3" paintOrder="stroke">
                  NE: {angleAnalysis.widerQuadrants?.includes('NE') ? 
                    angleAnalysis.widerAngle.toFixed(1) : angleAnalysis.narrowerAngle.toFixed(1)}°
                </text>
                <text x="200" y="450" textAnchor="middle" fontSize="12" fill="#7c3aed" fontWeight="bold"
                      stroke="white" strokeWidth="3" paintOrder="stroke">
                  SW: {angleAnalysis.widerQuadrants?.includes('SW') ? 
                    angleAnalysis.widerAngle.toFixed(1) : angleAnalysis.narrowerAngle.toFixed(1)}°
                </text>
                <text x="600" y="450" textAnchor="middle" fontSize="12" fill="#7c3aed" fontWeight="bold"
                      stroke="white" strokeWidth="3" paintOrder="stroke">
                  SE: {angleAnalysis.widerQuadrants?.includes('SE') ? 
                    angleAnalysis.widerAngle.toFixed(1) : angleAnalysis.narrowerAngle.toFixed(1)}°
                </text>
              </>
            )}
          </svg>

          {/* Legend */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="text-sm font-semibold mb-2">Symbol Legend:</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <svg width="50" height="30" viewBox="0 0 50 30">
                  <line x1="10" y1="15" x2="40" y2="15" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.6" />
                  <line x1="25" y1="5" x2="25" y2="25" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.6" />
                  <circle cx="25" cy="15" r="6" fill="white" stroke={meterColor} strokeWidth="2" strokeDasharray="3,2" />
                </svg>
                <span> Raw crack position</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="50" height="30" viewBox="0 0 50 30">
                  <line x1="10" y1="15" x2="40" y2="15" stroke="#dc2626" strokeWidth="2" />
                  <line x1="25" y1="5" x2="25" y2="25" stroke="#dc2626" strokeWidth="2" />
                  <circle cx="25" cy="15" r="6" fill={meterColor} stroke="white" strokeWidth="2" />
                </svg>
                <span> Normalized position</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="50" height="30" viewBox="0 0 50 30">
                  <circle cx="25" cy="15" r="5" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
                </svg>
                <span> Cross intersections at physical meter edges</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              • Hover over the <strong>solid dot</strong> for normalized movement analysis<br/>
              • Display range: ±1.5mm (physical meter range: ±20mm×±10mm)
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Reading Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Days Since First Reading:</strong> {daysSinceFirst} days
              {normalizedIntersection !== null && daysSinceFirst > 0 && (
                <>
                  <br/>
                  <strong>Movement Pace:</strong> {(() => {
                    const totalDistance = Math.sqrt(
                      normalizedIntersection.x ** 2 + normalizedIntersection.y ** 2
                    );
                    const perDay = totalDistance / daysSinceFirst;
                    const perWeek = totalDistance / (daysSinceFirst / 7);
                    const perMonth = totalDistance / (daysSinceFirst / 30.44);
                    return `${perDay.toFixed(4)} mm/day, ${perWeek.toFixed(4)} mm/week, ${perMonth.toFixed(4)} mm/month`;
                  })()}
                  <br/>
                  <span className="text-xs text-gray-600 mt-1">* Average pace from first reading ({firstReading?.date}) to this reading ({date})</span>
                </>
              )}
              {normalizedIntersection !== null && daysSinceFirst === 0 && (
                <>
                  <br/>
                  <span className="text-xs text-gray-600 italic">This is the first reading (origin point)</span>
                </>
              )}
            </div>
            <div>
              <strong>Interpretation (Normalized):</strong><br/>
              {normalizedIntersection !== null ? (
                <>
                  {normalizedIntersection.x === 0 && normalizedIntersection.y === 0 ? 
                    'No change from initial position - stable crack' :
                    Math.abs(normalizedIntersection.x) < 0.1 && Math.abs(normalizedIntersection.y) < 0.1 ? 
                    'Minimal change from initial position - stable crack' :
                    <>
                      {normalizedIntersection.x > 0.1 ? 'Crack expanding ' : 
                      normalizedIntersection.x < -0.1 ? 'Crack closing ' : 'No horizontal change '}
                      {normalizedIntersection.y > 0.1 ? '& wall rising' : 
                      normalizedIntersection.y < -0.1 ? '& wall sinking' : 
                      normalizedIntersection.x !== 0 ? '& no vertical change' : '& no vertical change'}
                      {Math.abs(normalizedIntersection.x) > 1 || Math.abs(normalizedIntersection.y) > 1 ? 
                        ' - significant change (requires attention)' : ''}
                    </>
                  }
                  <br/>
                  <span className="text-xs text-gray-600 mt-1">
                    {FLOOR_INTERPRETATIONS[meterKey].needsInversion ? 
                      '* Coordinates inverted to standard interpretation' : 
                      '* Standard interpretation'}
                  </span>
                </>
              ) : (
                // Fallback to absolute coordinates if normalized not available
                Math.abs(intersection.x) < 0.1 && Math.abs(intersection.y) < 0.1 ? 
                  'Crack positioned near center - minimal displacement' :
                  Math.abs(intersection.x) > 1 || Math.abs(intersection.y) > 1 ?
                  'Significant crack displacement detected' :
                  'Moderate crack displacement from center'
              )}
            </div>
          </div>
          
          {angleAnalysis && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Cross Orthogonality:</strong><br/>
                  {angleAnalysis.deviation < 0.5 ? 
                    <span className="text-green-700">✓ Excellent (≤0.5° deviation)</span> :
                    angleAnalysis.deviation < 1.0 ?
                    <span className="text-blue-700">◯ Good (≤1.0° deviation)</span> :
                    angleAnalysis.deviation < 2.0 ?
                    <span className="text-yellow-700">⚠ Fair (≤2.0° deviation)</span> :
                    <span className="text-red-700">⚠ Poor (&gt;2.0° deviation)</span>
                  }
                </div>
                <div>
                  <strong>Quadrant Angles:</strong><br/>
                  <span className="font-mono text-xs">{angleAnalysis.description}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};