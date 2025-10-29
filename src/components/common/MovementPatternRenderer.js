import React from 'react';
import { METER_CONFIGS } from '../../constants/meterConfigs';
import { toSVGX, toSVGY } from '../../utils/coordinateConverters';

// Helper to get meter color by display name
const getMeterColor = (meterDisplayName) => {
  const config = Object.values(METER_CONFIGS).find(c => c.displayName === meterDisplayName);
  return config?.color || '#2563eb';
};

// ADD 'export' before 'const' here!
export const MovementPatternRenderer = ({ 
  processedData, 
  selectedMeter, 
  useNormalized = false,
  onPointClick,
  hoveredPoint,
  setHoveredPoint
}) => {
  // Build meter configs from global constant
  const meterConfigs = Object.entries(METER_CONFIGS).map(([key, config]) => ({
    ...config,
    dataKey: useNormalized ? config.normDataKeys : config.rawDataKeys,
    normDataKey: config.normDataKeys,
    rawReadingKey: `raw${config.displayName.replace(' ', '')}`,
    show: selectedMeter === 'all' || selectedMeter === key
  }));
  
  return (
    <>
      {meterConfigs.map(config => {
        if (!config.show) return null;
        
        // Filter and sort data for this meter
        const meterData = processedData
          .filter(d => d[config.dataKey[0]] !== undefined && d[config.dataKey[1]] !== undefined)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((d, index, array) => ({
            ...d,
            x: d[config.dataKey[0]],
            y: d[config.dataKey[1]],
            normX: d[config.normDataKey[0]], // Always include normalized
            normY: d[config.normDataKey[1]], // Always include normalized
            opacity: (index + 1) / array.length,
            index: index,
            rawReading: d[config.rawReadingKey],
            isFirst: index === 0
          }));
        
        if (meterData.length === 0) return null;
        
        // Get first reading date for days calculation
        const firstDate = new Date(meterData[0].date);
        
        // Arrow marker ID unique for normalized vs raw
        const markerId = `arrowhead-${useNormalized ? 'norm-' : ''}${config.name}`;
        
        return (
          <g key={config.name}>
            {/* Draw connecting lines - UNCHANGED */}
            {meterData.slice(1).map((point, i) => {
              const prevPoint = meterData[i];
              const x1 = toSVGX(prevPoint.x);
              const y1 = toSVGY(prevPoint.y);
              const x2 = toSVGX(point.x);
              const y2 = toSVGY(point.y);
              
              const date1 = new Date(prevPoint.date);
              const date2 = new Date(point.date);
              const daysDiff = Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
              
              const lineOpacity = point.opacity * 0.8;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;
              
              return (
                <g key={`${config.name}-line-${i}`}>
                  <line 
                    x1={x1} y1={y1} 
                    x2={x2} y2={y2}
                    stroke={config.color}
                    strokeOpacity={lineOpacity}
                    strokeWidth="2"
                    markerEnd={`url(#${markerId})`}
                  />
                  <rect
                    x={midX - 12}
                    y={midY - 8}
                    width="24"
                    height="16"
                    fill="white"
                    stroke={config.color}
                    strokeOpacity={lineOpacity}
                    strokeWidth="1"
                    rx="2"
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fontSize="10"
                    fill={config.color}
                    fillOpacity={lineOpacity}
                  >
                    {daysDiff}d
                  </text>
                </g>
              );
            })}
            
            {/* Draw points with ENHANCED hover */}
            {meterData.map((point, i) => {
              const currentDate = new Date(point.date);
              const daysSinceFirst = Math.round((currentDate - firstDate) / (1000 * 60 * 60 * 24));
              
              return (
                <g key={`${config.name}-point-${i}`}>
                  <circle
                    cx={toSVGX(point.x)}
                    cy={toSVGY(point.y)}
                    r="8"
                    fill={config.color}
                    fillOpacity={point.opacity}
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onPointClick({
                      date: point.date,
                      meter: config.displayName,
                      reading: point.rawReading
                    })}
                    onMouseEnter={(e) => {
                      const svgPoint = e.target.ownerSVGElement.createSVGPoint();
                      svgPoint.x = e.clientX;
                      svgPoint.y = e.clientY;
                      const svgCoords = svgPoint.matrixTransform(
                        e.target.ownerSVGElement.getScreenCTM().inverse()
                      );
                      
                      setHoveredPoint({
                        svgX: svgCoords.x,
                        svgY: svgCoords.y,
                        meter: config.displayName,
                        color: config.color,
                        date: point.date,
                        daysSinceFirst: daysSinceFirst,
                        normX: point.normX,
                        normY: point.normY,
                        isFirst: point.isFirst
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <text
                    x={toSVGX(point.x)}
                    y={toSVGY(point.y) - 15}
                    textAnchor="middle"
                    fontSize="9"
                    fill={config.color}
                    fillOpacity={point.opacity}
                    fontWeight="500"
                    style={{ pointerEvents: 'none' }}
                  >
                    {point.date.substring(5)}
                  </text>
                  
                  {useNormalized && i === 0 && (
                    <circle
                      cx={toSVGX(point.x)}
                      cy={toSVGY(point.y)}
                      r="12"
                      fill="none"
                      stroke={config.color}
                      strokeWidth="2"
                      strokeDasharray="4,2"
                      opacity="0.6"
                    />
                  )}
                </g>
              );
            })}
            
            <defs>
              <marker
                id={markerId}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={config.color}
                  fillOpacity="0.8"
                />
              </marker>
            </defs>
          </g>
        );
      })}
      
      {/* TOOLTIP DISPLAY */}
      {hoveredPoint && !hoveredPoint.isFirst && (
        <g transform={`translate(${hoveredPoint.svgX}, ${hoveredPoint.svgY - 80})`}>
          {/* Tooltip background */}
          <rect 
            x="-95" y="-40" 
            width="190" height="75" 
            fill="white" 
            stroke={hoveredPoint.color}
            strokeWidth="2" 
            rx="4"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          />
          
          {/* Meter name and date */}
          <text x="0" y="-20" textAnchor="middle" fontSize="11" fontWeight="bold" fill={hoveredPoint.color}>
            {hoveredPoint.meter} - {hoveredPoint.date}
          </text>
          
          {/* Days since first */}
          <text x="0" y="-5" textAnchor="middle" fontSize="10" fill="#666">
            Day {hoveredPoint.daysSinceFirst} from first reading
          </text>
          
          {/* Normalized difference */}
          <text x="0" y="8" textAnchor="middle" fontSize="10" fill="#333">
            Δ Position: ({hoveredPoint.normX.toFixed(3)}, {hoveredPoint.normY.toFixed(3)}) mm
          </text>
          
          {/* Interpretation */}
          <text x="0" y="22" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#000">
            {(() => {
              const x = hoveredPoint.normX;
              const y = hoveredPoint.normY;
              
              if (Math.abs(x) < 0.01 && Math.abs(y) < 0.01) return 'No significant movement';
              
              let interpretation = '';
              if (Math.abs(x) >= 0.01) {
                interpretation += x > 0 ? 'Expanding' : 'Closing';
              }
              if (Math.abs(x) >= 0.01 && Math.abs(y) >= 0.01) {
                interpretation += ' & ';
              }
              if (Math.abs(y) >= 0.01) {
                interpretation += y > 0 ? 'Rising' : 'Sinking';
              }
              
              return interpretation;
            })()}
          </text>
          
          {/* Note about normalized data */}
          <text x="0" y="32" textAnchor="middle" fontSize="8" fill="#888" fontStyle="italic">
            *Normalized data (unified across floors)
          </text>
        </g>
      )}
      
      {/* Special tooltip for first reading */}
      {hoveredPoint && hoveredPoint.isFirst && (
        <g transform={`translate(${hoveredPoint.svgX}, ${hoveredPoint.svgY - 50})`}>
          <rect 
            x="-70" y="-25" 
            width="140" height="40" 
            fill="white" 
            stroke={hoveredPoint.color}
            strokeWidth="2" 
            rx="4"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          />
          <text x="0" y="-8" textAnchor="middle" fontSize="11" fontWeight="bold" fill={hoveredPoint.color}>
            {hoveredPoint.meter}
          </text>
          <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#666">
            First Reading (Origin)
          </text>
          <text x="0" y="16" textAnchor="middle" fontSize="9" fill="#888">
            {hoveredPoint.date}
          </text>
        </g>
      )}
    </>
  );
};