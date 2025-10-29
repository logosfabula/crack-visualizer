import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import rawData from './data/crackData.json';
import JSZip from 'jszip';
import yaml from 'js-yaml';
import * as XLSX from 'xlsx';

// Constants
import { METER_BOUNDARIES, DISPLAY_RANGE } from './constants/boundaries';
import { METER_CONFIGS } from './constants/meterConfigs';
import { FLOOR_INTERPRETATIONS } from './constants/floorInterpretations';

// Services
import { IntersectionCalculator } from './services/calculations/IntersectionCalculator';
import { AngleAnalyzer } from './services/calculations/AngleAnalyzer';

// Common components
import { SVGGrid } from './components/common/SVGGrid';
import { MovementPatternRenderer } from './components/common/MovementPatternRenderer';

// View components
import { TimelineView } from './components/views/TimelineView';
import { MovementPatternsView } from './components/views/MovementPatternsView';
import { NormalizedMovementView } from './components/views/NormalizedMovementView';
import { SingleReadingView } from './components/views/SingleReadingView';
import { DataTableView } from './components/views/DataTableView';

// Hooks
import { useProcessedData } from './hooks/useProcessedData';

// Utilities
import { toSVGX, toSVGY } from './utils/coordinateConverters';

// Exports
import { ExportService } from './services/export/ExportService';
import { ImageFetcher } from './services/export/ImageFetcher';


// Physical crack meter boundaries (in millimeters)
/* const METER_BOUNDARIES = {
  X_MIN: -20,
  X_MAX: 20,
  Y_MIN: -10,
  Y_MAX: 10
}; */

// Display range for SVG visualization
/* const DISPLAY_RANGE = {
  X_MIN: -1.5,
  X_MAX: 1.5,
  Y_MIN: -1.5,
  Y_MAX: 1.5
}; */

// SVG coordinate conversion functions
/* const toSVGX = (x_mm) => 400 + x_mm * 266.67;
const toSVGY = (y_mm) => 300 + y_mm * 200; */

// Meter configurations
/* const METER_CONFIGS = {
  pianterreno: { 
    name: 'Pianterreno',
    displayName: 'Pianterreno',
    color: '#8884d8',
    rawDataKeys: ['pianterreno_x', 'pianterreno_y'],
    normDataKeys: ['pianterreno_norm_x', 'pianterreno_norm_y']
  },
  piano1: { 
    name: 'Piano 1',
    displayName: 'Piano 1',
    color: '#82ca9d',
    rawDataKeys: ['piano1_x', 'piano1_y'],
    normDataKeys: ['piano1_norm_x', 'piano1_norm_y']
  },
  piano2: { 
    name: 'Piano 2',
    displayName: 'Piano 2',
    color: '#ffc658',
    rawDataKeys: ['piano2_x', 'piano2_y'],
    normDataKeys: ['piano2_norm_x', 'piano2_norm_y']
  }
}; */

// Helper to get meter color by display name
/* const getMeterColor = (meterDisplayName) => {
  const config = Object.values(METER_CONFIGS).find(c => c.displayName === meterDisplayName);
  return config?.color || '#2563eb';
}; */

// const SVGGrid = ({ children, onPointClick, hoveredPoint, setHoveredPoint }) => {
//   return (
//     <svg width="100%" height="600" viewBox="0 0 800 600">
//       {/* Grid pattern with fine and coarse lines */}
//       <defs>
//         <pattern id="fineGrid" width="66.67" height="50" patternUnits="userSpaceOnUse">
//           <path d="M 66.67 0 L 0 0 0 50" fill="none" stroke="#f3f4f6" strokeWidth="1.5"/>
//         </pattern>
//         <pattern id="coarseGrid" width="133.33" height="100" patternUnits="userSpaceOnUse">
//           <path d="M 133.33 0 L 0 0 0 100" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
//         </pattern>
//       </defs>
//       <rect width="800" height="600" fill="url(#fineGrid)"/>
//       <rect width="800" height="600" fill="url(#coarseGrid)"/>
      
//       {/* Center lines */}
//       <line x1="400" y1="0" x2="400" y2="600" stroke="#d1d5db" strokeWidth="2"/>
//       <line x1="0" y1="300" x2="800" y2="300" stroke="#d1d5db" strokeWidth="2"/>
      
//       {/* Axis labels */}
//       <text x="750" y="320" textAnchor="end" fontSize="12" fill="#6b7280">+X</text>
//       <text x="50" y="320" textAnchor="start" fontSize="12" fill="#6b7280">-X</text>
//       <text x="410" y="30" textAnchor="start" fontSize="12" fill="#6b7280">-Y</text>
//       <text x="410" y="580" textAnchor="start" fontSize="12" fill="#6b7280">+Y</text>
      
//       {/* Scale markers */}
//       <g stroke="#9ca3af" strokeWidth="1" fontSize="12" fill="#6b7280">
//         {/* Horizontal markers */}
//         {[DISPLAY_RANGE.X_MIN, -1, -0.5, 0.5, 1, DISPLAY_RANGE.X_MAX].map(val => (
//           <g key={`h-marker-${val}`}>
//             <line x1={toSVGX(val)} y1="295" x2={toSVGX(val)} y2="305"/>
//             <text x={toSVGX(val)} y="325" textAnchor="middle">
//               {val > 0 ? '+' : ''}{val}
//             </text>
//           </g>
//         ))}
        
//         {/* Vertical markers */}
//         {[DISPLAY_RANGE.Y_MIN, -1, -0.5, 0.5, 1, DISPLAY_RANGE.Y_MAX].map(val => (
//           <g key={`v-marker-${val}`}>
//             <line x1="390" y1={toSVGY(val)} x2="410" y2={toSVGY(val)}/>
//             <text x="420" y={toSVGY(val) + 8} textAnchor="start">
//               {val > 0 ? '+' : ''}{val}
//             </text>
//           </g>
//         ))}
//       </g>
      
//       {children}
//     </svg>
//   );
// };

// Add this after SVGGrid component definition
// const MovementPatternRenderer = ({ 
//   processedData, 
//   selectedMeter, 
//   useNormalized = false,
//   onPointClick,
//   hoveredPoint,
//   setHoveredPoint
// }) => {
//   // Build meter configs from global constant
//   const meterConfigs = Object.entries(METER_CONFIGS).map(([key, config]) => ({
//     ...config,
//     dataKey: useNormalized ? config.normDataKeys : config.rawDataKeys,
//     normDataKey: config.normDataKeys,
//     rawReadingKey: `raw${config.displayName.replace(' ', '')}`,
//     show: selectedMeter === 'all' || selectedMeter === key
//   }));
  
//   return (
//     <>
//       {meterConfigs.map(config => {
//         if (!config.show) return null;
        
//         // Filter and sort data for this meter
//         const meterData = processedData
//           .filter(d => d[config.dataKey[0]] !== undefined && d[config.dataKey[1]] !== undefined)
//           .sort((a, b) => new Date(a.date) - new Date(b.date))
//           .map((d, index, array) => ({
//             ...d,
//             x: d[config.dataKey[0]],
//             y: d[config.dataKey[1]],
//             normX: d[config.normDataKey[0]], // Always include normalized
//             normY: d[config.normDataKey[1]], // Always include normalized
//             opacity: (index + 1) / array.length,
//             index: index,
//             rawReading: d[config.rawReadingKey],
//             isFirst: index === 0
//           }));
        
//         if (meterData.length === 0) return null;
        
//         // Get first reading date for days calculation
//         const firstDate = new Date(meterData[0].date);
        
//         // Arrow marker ID unique for normalized vs raw
//         const markerId = `arrowhead-${useNormalized ? 'norm-' : ''}${config.name}`;
        
//         return (
//           <g key={config.name}>
//             {/* Draw connecting lines - UNCHANGED */}
//             {meterData.slice(1).map((point, i) => {
//               const prevPoint = meterData[i];
//               const x1 = toSVGX(prevPoint.x);
//               const y1 = toSVGY(prevPoint.y);
//               const x2 = toSVGX(point.x);
//               const y2 = toSVGY(point.y);
              
//               const date1 = new Date(prevPoint.date);
//               const date2 = new Date(point.date);
//               const daysDiff = Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
              
//               const lineOpacity = point.opacity * 0.8;
//               const midX = (x1 + x2) / 2;
//               const midY = (y1 + y2) / 2;
              
//               return (
//                 <g key={`${config.name}-line-${i}`}>
//                   <line 
//                     x1={x1} y1={y1} 
//                     x2={x2} y2={y2}
//                     stroke={config.color}
//                     strokeOpacity={lineOpacity}
//                     strokeWidth="2"
//                     markerEnd={`url(#${markerId})`}
//                   />
//                   <rect
//                     x={midX - 12}
//                     y={midY - 8}
//                     width="24"
//                     height="16"
//                     fill="white"
//                     stroke={config.color}
//                     strokeOpacity={lineOpacity}
//                     strokeWidth="1"
//                     rx="2"
//                   />
//                   <text
//                     x={midX}
//                     y={midY + 3}
//                     textAnchor="middle"
//                     fontSize="10"
//                     fill={config.color}
//                     fillOpacity={lineOpacity}
//                   >
//                     {daysDiff}d
//                   </text>
//                 </g>
//               );
//             })}
            
//             {/* Draw points with ENHANCED hover */}
//             {meterData.map((point, i) => {
//               const currentDate = new Date(point.date);
//               const daysSinceFirst = Math.round((currentDate - firstDate) / (1000 * 60 * 60 * 24));
              
//               return (
//                 <g key={`${config.name}-point-${i}`}>
//                   <circle
//                     cx={toSVGX(point.x)}
//                     cy={toSVGY(point.y)}
//                     r="8"
//                     fill={config.color}
//                     fillOpacity={point.opacity}
//                     stroke="white"
//                     strokeWidth="2"
//                     style={{ cursor: 'pointer' }}
//                     onClick={() => onPointClick({
//                       date: point.date,
//                       meter: config.displayName,
//                       reading: point.rawReading
//                     })}
//                     onMouseEnter={(e) => {
//                       const svgPoint = e.target.ownerSVGElement.createSVGPoint();
//                       svgPoint.x = e.clientX;
//                       svgPoint.y = e.clientY;
//                       const svgCoords = svgPoint.matrixTransform(
//                         e.target.ownerSVGElement.getScreenCTM().inverse()
//                       );
                      
//                       setHoveredPoint({
//                         svgX: svgCoords.x,
//                         svgY: svgCoords.y,
//                         meter: config.displayName,
//                         color: config.color,
//                         date: point.date,
//                         daysSinceFirst: daysSinceFirst,
//                         normX: point.normX,
//                         normY: point.normY,
//                         isFirst: point.isFirst
//                       });
//                     }}
//                     onMouseLeave={() => setHoveredPoint(null)}
//                   />
//                   <text
//                     x={toSVGX(point.x)}
//                     y={toSVGY(point.y) - 15}
//                     textAnchor="middle"
//                     fontSize="9"
//                     fill={config.color}
//                     fillOpacity={point.opacity}
//                     fontWeight="500"
//                     style={{ pointerEvents: 'none' }}
//                   >
//                     {point.date.substring(5)}
//                   </text>
                  
//                   {useNormalized && i === 0 && (
//                     <circle
//                       cx={toSVGX(point.x)}
//                       cy={toSVGY(point.y)}
//                       r="12"
//                       fill="none"
//                       stroke={config.color}
//                       strokeWidth="2"
//                       strokeDasharray="4,2"
//                       opacity="0.6"
//                     />
//                   )}
//                 </g>
//               );
//             })}
            
//             <defs>
//               <marker
//                 id={markerId}
//                 markerWidth="10"
//                 markerHeight="7"
//                 refX="9"
//                 refY="3.5"
//                 orient="auto"
//               >
//                 <polygon
//                   points="0 0, 10 3.5, 0 7"
//                   fill={config.color}
//                   fillOpacity="0.8"
//                 />
//               </marker>
//             </defs>
//           </g>
//         );
//       })}
      
//       {/* TOOLTIP DISPLAY */}
//       {hoveredPoint && !hoveredPoint.isFirst && (
//         <g transform={`translate(${hoveredPoint.svgX}, ${hoveredPoint.svgY - 80})`}>
//           {/* Tooltip background */}
//           <rect 
//             x="-95" y="-40" 
//             width="190" height="75" 
//             fill="white" 
//             stroke={hoveredPoint.color}
//             strokeWidth="2" 
//             rx="4"
//             filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
//           />
          
//           {/* Meter name and date */}
//           <text x="0" y="-20" textAnchor="middle" fontSize="11" fontWeight="bold" fill={hoveredPoint.color}>
//             {hoveredPoint.meter} - {hoveredPoint.date}
//           </text>
          
//           {/* Days since first */}
//           <text x="0" y="-5" textAnchor="middle" fontSize="10" fill="#666">
//             Day {hoveredPoint.daysSinceFirst} from first reading
//           </text>
          
//           {/* Normalized difference */}
//           <text x="0" y="8" textAnchor="middle" fontSize="10" fill="#333">
//             Δ Position: ({hoveredPoint.normX.toFixed(3)}, {hoveredPoint.normY.toFixed(3)}) mm
//           </text>
          
//           {/* Interpretation */}
//           <text x="0" y="22" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#000">
//             {(() => {
//               const x = hoveredPoint.normX;
//               const y = hoveredPoint.normY;
              
//               if (Math.abs(x) < 0.01 && Math.abs(y) < 0.01) return 'No significant movement';
              
//               let interpretation = '';
//               if (Math.abs(x) >= 0.01) {
//                 interpretation += x > 0 ? 'Expanding' : 'Closing';
//               }
//               if (Math.abs(x) >= 0.01 && Math.abs(y) >= 0.01) {
//                 interpretation += ' & ';
//               }
//               if (Math.abs(y) >= 0.01) {
//                 interpretation += y > 0 ? 'Rising' : 'Sinking';
//               }
              
//               return interpretation;
//             })()}
//           </text>
          
//           {/* Note about normalized data */}
//           <text x="0" y="32" textAnchor="middle" fontSize="8" fill="#888" fontStyle="italic">
//             *Normalized data (unified across floors)
//           </text>
//         </g>
//       )}
      
//       {/* Special tooltip for first reading */}
//       {hoveredPoint && hoveredPoint.isFirst && (
//         <g transform={`translate(${hoveredPoint.svgX}, ${hoveredPoint.svgY - 50})`}>
//           <rect 
//             x="-70" y="-25" 
//             width="140" height="40" 
//             fill="white" 
//             stroke={hoveredPoint.color}
//             strokeWidth="2" 
//             rx="4"
//             filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
//           />
//           <text x="0" y="-8" textAnchor="middle" fontSize="11" fontWeight="bold" fill={hoveredPoint.color}>
//             {hoveredPoint.meter}
//           </text>
//           <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#666">
//             First Reading (Origin)
//           </text>
//           <text x="0" y="16" textAnchor="middle" fontSize="9" fill="#888">
//             {hoveredPoint.date}
//           </text>
//         </g>
//       )}
//     </>
//   );
// };

// Floor-specific interpretation configuration
/* const FLOOR_INTERPRETATIONS = {
  pianterreno: {
    needsInversion: true,  // P0 needs inversion to match P1
    name: 'Pianterreno',
    interpretation: 'Inverted'
  },
  piano1: {
    needsInversion: false, // P1 is the standard
    name: 'Piano 1', 
    interpretation: 'Standard'
  },
  piano2: {
    needsInversion: true,  // P2 needs inversion to match P1
    name: 'Piano 2',
    interpretation: 'Inverted'
  }
}; */

const CrackMovementVisualizer = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

    // ADD THESE LINES ↓↓↓
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
    // ADD THESE LINES ↑↑↑
  
/*   const rawData = [
    { date: '2024-06-01', Pianterreno: null, 'Piano 1': '+0.25;+0.00;+0.25;+0.50', 'Piano 2': null },
    { date: '2024-06-20', Pianterreno: '-0.25;+0.75;+0.00;+1.00', 'Piano 1': null, 'Piano 2': null },
    { date: '2024-09-01', Pianterreno: null, 'Piano 1': null, 'Piano 2': '+0.00;+0.00;+0.00;+0.00' },
    { date: '2024-11-22', Pianterreno: '-0.25;+0.75;+0.00;+1.00', 'Piano 1': '+0.00;+0.00;+0.25;+0.50', 'Piano 2': '-0.50;+0.00;-0.50;+0.00' },
    { date: '2024-12-18', Pianterreno: '-0.50;+0.75;-0.25;+1.25', 'Piano 1': '+0.25;+0.00;+0.25;+0.50', 'Piano 2': '-0.50;+0.00;-0.50;+0.00' },
    { date: '2025-01-13', Pianterreno: '-0.50;+0.75;-0.25;+1.25', 'Piano 1': '+0.25;+0.00;+0.25;+0.75', 'Piano 2': null },
    { date: '2025-05-28', Pianterreno: '-0.50;+0.75;-0.25;+1.25', 'Piano 1': '+0.25;+0.00;+0.25;+0.50', 'Piano 2': '-0.25;+0.00;-0.25;+0.25' },
    { date: '2025-07-31', Pianterreno: '-0.50;+0.75;-0.25;+1.25', 'Piano 1': '+0.25;+0.00;+0.25;+0.50', 'Piano 2': '+0.00;+0.00;+0.00;+0.25' },
    { date: '2025-09-24', Pianterreno: '-0.50;+0.75;-0.25;+1.25', 'Piano 1': '+0.25;+0.00;+0.25;+0.25', 'Piano 2': '-0.25;+0.00;-0.25;+0.25' }
  ]; */

// Function to calculate quadrant angle analysis
/* const calculateQuadrantAngles = (reading) => {
  if (!reading) return null;
  
  const [up, right, down, left] = reading.split(';').map(v => parseFloat(v));
  
  // Physical crack meter boundaries (in millimeters)
  const { X_MIN: METER_X_MIN, X_MAX: METER_X_MAX, 
        Y_MIN: METER_Y_MIN, Y_MAX: METER_Y_MAX } = METER_BOUNDARIES;
  
  // Line endpoints in physical coordinates (mm)
  const topPoint = { x: up, y: METER_Y_MIN };
  const bottomPoint = { x: down, y: METER_Y_MAX };
  const leftPoint = { x: METER_X_MIN, y: left };
  const rightPoint = { x: METER_X_MAX, y: right };
  
  // Calculate angles of both lines
  let verticalLineAngle, horizontalLineAngle;
  
  if (Math.abs(bottomPoint.x - topPoint.x) < 1e-10) {
    verticalLineAngle = 90; // Truly vertical
  } else {
    const verticalSlope = (bottomPoint.y - topPoint.y) / (bottomPoint.x - topPoint.x);
    verticalLineAngle = Math.atan(verticalSlope) * 180 / Math.PI;
  }
  
  if (Math.abs(rightPoint.y - leftPoint.y) < 1e-10) {
    horizontalLineAngle = 0; // Truly horizontal
  } else {
    const horizontalSlope = (rightPoint.y - leftPoint.y) / (rightPoint.x - leftPoint.x);
    horizontalLineAngle = Math.atan(horizontalSlope) * 180 / Math.PI;
  }
  
  // Calculate angle between lines
  let angleBetween = Math.abs(verticalLineAngle - horizontalLineAngle);
  if (angleBetween > 90) angleBetween = 180 - angleBetween;
  
  const deviation = Math.abs(90 - angleBetween);
  
  if (deviation < 0.01) {
    return {
      deviation: 0,
      description: "Perfect 90°"
    };
  }
  
  // Determine which quadrants are wider/narrower
  let widerQuadrants, narrowerQuadrants;
  
  if (angleBetween < 90) {
    widerQuadrants = "NW & SE";
    narrowerQuadrants = "NE & SW";
  } else {
    widerQuadrants = "NE & SW";
    narrowerQuadrants = "NW & SE";
  }
  
  const widerAngle = 90 + deviation;
  const narrowerAngle = 90 - deviation;
  
  return {
    deviation: deviation,
    widerQuadrants: widerQuadrants,
    narrowerQuadrants: narrowerQuadrants,
    widerAngle: widerAngle,
    narrowerAngle: narrowerAngle,
    description: `${widerQuadrants}: ${widerAngle.toFixed(2)}°, ${narrowerQuadrants}: ${narrowerAngle.toFixed(2)}°`
  };
}; */

// Function to calculate intersection point from crack meter readings
/* const calculateIntersection = (reading) => {
  if (!reading) return null;
  
  const [up, right, down, left] = reading.split(';').map(v => parseFloat(v));
  
  // Physical crack meter boundaries (in millimeters)
  const { X_MIN: METER_X_MIN, X_MAX: METER_X_MAX, 
        Y_MIN: METER_Y_MIN, Y_MAX: METER_Y_MAX } = METER_BOUNDARIES;
  
  // Line endpoints in physical coordinates (mm)
  // Vertical line: connects top and bottom boundaries
  const topPoint = { x: up, y: METER_Y_MIN };      // (up, -10)
  const bottomPoint = { x: down, y: METER_Y_MAX };  // (down, +10)
  
  // Horizontal line: connects left and right boundaries
  const leftPoint = { x: METER_X_MIN, y: left };    // (-20, left)
  const rightPoint = { x: METER_X_MAX, y: right };  // (+20, right)
  
  // Handle special case: truly vertical line (up === down)
  if (Math.abs(topPoint.x - bottomPoint.x) < 1e-10) {
    // Vertical line at x = topPoint.x
    const verticalX = topPoint.x;
    
    // Find where horizontal line intersects this vertical line
    // Horizontal line equation: interpolate between left and right points
    const horizontalSlope = (rightPoint.y - leftPoint.y) / (METER_X_MAX - METER_X_MIN);
    const intersectionY = leftPoint.y + horizontalSlope * (verticalX - METER_X_MIN);
    
    return { x: verticalX, y: intersectionY };
  }
  
  // Handle special case: truly horizontal line (left === right)
  if (Math.abs(leftPoint.y - rightPoint.y) < 1e-10) {
    // Horizontal line at y = leftPoint.y
    const horizontalY = leftPoint.y;
    
    // Find where vertical line intersects this horizontal line
    // Vertical line equation: interpolate between top and bottom points
    const verticalSlope = (bottomPoint.x - topPoint.x) / (METER_Y_MAX - METER_Y_MIN);
    const intersectionX = topPoint.x + verticalSlope * (horizontalY - METER_Y_MIN);
    
    return { x: intersectionX, y: horizontalY };
  }
  
  // Normal case: both lines have slopes
  // Vertical line: from (up, -10) to (down, +10)
  const m1 = (bottomPoint.y - topPoint.y) / (bottomPoint.x - topPoint.x);
  const b1 = topPoint.y - m1 * topPoint.x;
  
  // Horizontal line: from (-20, left) to (+20, right)
  const m2 = (rightPoint.y - leftPoint.y) / (rightPoint.x - leftPoint.x);
  const b2 = leftPoint.y - m2 * leftPoint.x;
  
  // Check for parallel lines
  if (Math.abs(m1 - m2) < 1e-10) {
    return null; // Lines are parallel
  }
  
  // Find intersection: m1*x + b1 = m2*x + b2
  const intersectionX = (b2 - b1) / (m1 - m2);
  const intersectionY = m1 * intersectionX + b1;
  
  // Return in millimeters (physical coordinates)
  return { x: intersectionX, y: intersectionY };
}; */

  // Process data to calculate intersection points and normalized coordinates
  const processedData = useProcessedData(rawData);
/*   const processedData = useMemo(() => {
    const rawProcessed = rawData.map(entry => {
      const result = {
        date: entry.date,
        dateObj: new Date(entry.date),
        rawPianterreno: entry.Pianterreno,
        rawPiano1: entry['Piano 1'],
        rawPiano2: entry['Piano 2']
      };
      
      // Calculate intersection points and quadrant angle analysis
      const pianoterrenoPos = IntersectionCalculator.calculate(entry.Pianterreno);
      const piano1Pos = IntersectionCalculator.calculate(entry['Piano 1']);
      const piano2Pos = IntersectionCalculator.calculate(entry['Piano 2']);
      
      const pianoterrenoAngles = AngleAnalyzer.analyzeQuadrantAngles(entry.Pianterreno);
      const piano1Angles = AngleAnalyzer.analyzeQuadrantAngles(entry['Piano 1']);
      const piano2Angles = AngleAnalyzer.analyzeQuadrantAngles(entry['Piano 2']);
      
      if (pianoterrenoPos) {
        result.pianterreno_x = pianoterrenoPos.x;
        result.pianterreno_y = pianoterrenoPos.y;
        result.pianterreno_angle_analysis = pianoterrenoAngles?.description || '—';
      }
      if (piano1Pos) {
        result.piano1_x = piano1Pos.x;
        result.piano1_y = piano1Pos.y;
        result.piano1_angle_analysis = piano1Angles?.description || '—';
      }
      if (piano2Pos) {
        result.piano2_x = piano2Pos.x;
        result.piano2_y = piano2Pos.y;
        result.piano2_angle_analysis = piano2Angles?.description || '—';
      }
      
      return result;
    });
    // Calculate normalized coordinates (relative to first reading for each meter)
        const normalizedData = rawProcessed.map(entry => ({ ...entry }));
        
        // Find first reading for each meter and calculate normalized positions
        const meters = ['pianterreno', 'piano1', 'piano2'];
        
        meters.forEach(meter => {
          const meterData = normalizedData.filter(d => d[`${meter}_x`] !== undefined);
          
          if (meterData.length > 0) {
            // Sort by date to find the oldest reading
            meterData.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            const firstReading = meterData[0];
            const originX = firstReading[`${meter}_x`];
            const originY = firstReading[`${meter}_y`];
            
            // Calculate normalized coordinates for all readings of this meter
            normalizedData.forEach(entry => {
              if (entry[`${meter}_x`] !== undefined && entry[`${meter}_y`] !== undefined) {
                // Calculate relative position from first reading
                let normX = entry[`${meter}_x`] - originX;
                let normY = entry[`${meter}_y`] - originY;
                
                // Apply floor-specific inversion to match P1 interpretation
                if (FLOOR_INTERPRETATIONS[meter].needsInversion) {
                  normX = -normX;
                  normY = -normY;
                }
                
                entry[`${meter}_norm_x`] = normX;
                entry[`${meter}_norm_y`] = normY;
              }
            });
          }
        });
        
        return normalizedData;
  }, []); */

  const [selectedView, setSelectedView] = useState('timeline');
  const [selectedMeter, setSelectedMeter] = useState('all');
  const [selectedReading, setSelectedReading] = useState(null);
  // State for dataset download options
  /* const [downloadFormat, setDownloadFormat] = useState('json');
  const [includeImages, setIncludeImages] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); */

  // Helper function to construct image filename from meter and date
/*   const getImageFilename = (meterName, date) => {
    const meterPrefix = meterName === 'Pianterreno' ? 'p0' :
                        meterName === 'Piano 1' ? 'p1' :
                        meterName === 'Piano 2' ? 'p2' : 'unknown';
    
    const dateString = date.replace(/-/g, '');
    
    // Use PUBLIC_URL to handle both local and GitHub Pages paths
    const basePath = process.env.PUBLIC_URL || '';
    return `${basePath}/crack_images/${meterPrefix}_${dateString}.jpg`;
  }; */

  // Handler to download the crack meter image
/*     const downloadCrackImage = (meterName, date) => {
      const imagePath = getImageFilename(meterName, date);
      console.log('Attempting to download from:', imagePath); // ADD THIS LINE
      const filename = imagePath.split('/').pop(); // Extract just the filename
      
      // Create temporary anchor element
      const link = document.createElement('a');
      link.href = imagePath;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
    }; */

    // Prepare dataset for export
    /* const prepareExportData = (includeImageFilenames = false) => {
      // Combine raw and processed data
      return processedData.map(row => {
        const rowData = {
          // Basic info
          date: row.date,
          
          // Pianterreno
          pianterreno_raw: row.rawPianterreno || '',
          pianterreno_x: row.pianterreno_x?.toFixed(3) || '',
          pianterreno_y: row.pianterreno_y?.toFixed(3) || '',
          pianterreno_norm_x: row.pianterreno_norm_x?.toFixed(3) || '',
          pianterreno_norm_y: row.pianterreno_norm_y?.toFixed(3) || '',
          pianterreno_angles: row.pianterreno_angle_analysis || ''
        };
        
        // Always add image column if includeImageFilenames is true
        if (includeImageFilenames) {
          rowData.pianterreno_image = row.rawPianterreno 
            ? getImageFilename('Pianterreno', row.date).split('/').pop()
            : '';
        }
        
        // Piano 1
        rowData.piano1_raw = row.rawPiano1 || '';
        rowData.piano1_x = row.piano1_x?.toFixed(3) || '';
        rowData.piano1_y = row.piano1_y?.toFixed(3) || '';
        rowData.piano1_norm_x = row.piano1_norm_x?.toFixed(3) || '';
        rowData.piano1_norm_y = row.piano1_norm_y?.toFixed(3) || '';
        rowData.piano1_angles = row.piano1_angle_analysis || '';
        
        if (includeImageFilenames) {
          rowData.piano1_image = row.rawPiano1 
            ? getImageFilename('Piano 1', row.date).split('/').pop()
            : '';
        }
        
        // Piano 2
        rowData.piano2_raw = row.rawPiano2 || '';
        rowData.piano2_x = row.piano2_x?.toFixed(3) || '';
        rowData.piano2_y = row.piano2_y?.toFixed(3) || '';
        rowData.piano2_norm_x = row.piano2_norm_x?.toFixed(3) || '';
        rowData.piano2_norm_y = row.piano2_norm_y?.toFixed(3) || '';
        rowData.piano2_angles = row.piano2_angle_analysis || '';
        
        if (includeImageFilenames) {
          rowData.piano2_image = row.rawPiano2 
            ? getImageFilename('Piano 2', row.date).split('/').pop()
            : '';
        }
        
        return rowData;
      });
    }; */

    // Convert to JSON
 /*    const exportAsJSON = (data) => {
      return JSON.stringify(data, null, 2);
    }; */

    // Convert to CSV
    /* const exportAsCSV = (data) => {
      if (data.length === 0) return '';
      
      // Get headers from first object
      const headers = Object.keys(data[0]);
      const csvHeaders = headers.join(',');
      
      // Convert each row
      const csvRows = data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape values containing commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      );
      
      return [csvHeaders, ...csvRows].join('\n');
    }; */

    // Convert to YAML
    /* const exportAsYAML = (data) => {
      return yaml.dump(data);
    }; */

    // Convert to XLSX (using SheetJS which is already available)
    /* const exportAsXLSX = (data) => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Crack Data');
      
      // Generate binary string
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      return wbout;
    }; */
    
    // Fetch all crack meter images
    /* const fetchAllImages = async () => {
      const images = {};
      
      // Get all unique dates and meters from the data
      const imageFiles = [];
      
      processedData.forEach(row => {
        if (row.rawPianterreno) {
          const filename = getImageFilename('Pianterreno', row.date);
          imageFiles.push({ path: filename, filename: filename.split('/').pop() });
        }
        if (row.rawPiano1) {
          const filename = getImageFilename('Piano 1', row.date);
          imageFiles.push({ path: filename, filename: filename.split('/').pop() });
        }
        if (row.rawPiano2) {
          const filename = getImageFilename('Piano 2', row.date);
          imageFiles.push({ path: filename, filename: filename.split('/').pop() });
        }
      });
      
      // Fetch each image
      for (const file of imageFiles) {
        try {
          const response = await fetch(file.path);
          if (response.ok) {
            const blob = await response.blob();
            images[file.filename] = blob;
          }
        } catch (error) {
          console.warn(`Could not fetch image: ${file.filename}`);
        }
      }
      
      return images;
    }; */

    // Create and download dataset with optional images
    /* const downloadDataset = async () => {
      setIsDownloading(true);
      
      try {
        // Prepare data
        const data = prepareExportData(includeImages);
        let dataBlob;
        let fileExtension;
        
        // Convert to selected format
        switch (downloadFormat) {
          case 'json':
            dataBlob = new Blob([exportAsJSON(data)], { type: 'application/json' });
            fileExtension = 'json';
            break;
          case 'csv':
            dataBlob = new Blob([exportAsCSV(data)], { type: 'text/csv' });
            fileExtension = 'csv';
            break;
          case 'yaml':
            dataBlob = new Blob([exportAsYAML(data)], { type: 'text/yaml' });
            fileExtension = 'yaml';
            break;
          case 'xlsx':
            dataBlob = new Blob([exportAsXLSX(data)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fileExtension = 'xlsx';
            break;
          default:
            dataBlob = new Blob([exportAsJSON(data)], { type: 'application/json' });
            fileExtension = 'json';
        }
        
        // Generate timestamp for filename
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (includeImages) {
          // Create ZIP with data + images
          const zip = new JSZip();
          
          // Add data file
          zip.file(`crack_data_${timestamp}.${fileExtension}`, dataBlob);
          
          // Fetch and add images
          const images = await fetchAllImages();
          const imageFolder = zip.folder('crack_images');
          
          Object.keys(images).forEach(filename => {
            imageFolder.file(filename, images[filename]);
          });
          
          // Generate ZIP
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          
          // Download ZIP
          const link = document.createElement('a');
          link.href = URL.createObjectURL(zipBlob);
          link.download = `crack_dataset_${timestamp}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
          
        } else {
          // Download just the data file
          const link = document.createElement('a');
          link.href = URL.createObjectURL(dataBlob);
          link.download = `crack_data_${timestamp}.${fileExtension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }
        
      } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download dataset. Please try again.');
      } finally {
        setIsDownloading(false);
      }
    }; */

  // Custom tooltip for charts
/*   const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow">
          <p className="font-semibold">{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: (${entry.value?.toFixed(3) || 'N/A'})`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  }; */

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
                          //const firstNormX = meterData[0][`${meter.dataKeys[0].replace('_x', '_norm_x')}`] || 0; // unused -> warning
                          //const firstNormY = meterData[0][`${meter.dataKeys[1].replace('_y', '_norm_y')}`] || 0; // unused -> warning
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
                        <div className="text-xs text-gray-500 mb-1">Based on direct displacement at current average rate (linear projection)</div>
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
        
        <p className="text-xs text-gray-600 mt-4">
          Distances calculated using intersection method from boundary measurements [up, right, down, left] (<a href={`${process.env.PUBLIC_URL}/METHOD.md`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline italic">see Method</a>)<br/>
          * Total path distance includes all intermediate movements, not just start-to-end displacement<br/>
          * All measurements in millimeters based on crack meter grid scale<br/>
          <br/>
          <strong>Structural Movement Interpretation (Normalized Data):</strong><br/>
          • <strong>All floors use consistent interpretation after normalization</strong> (<a href={`${process.env.PUBLIC_URL}/METHOD.md`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline italic">see Method</a>)<strong>:</strong><br/>
          • <strong>Horizontal movement:</strong> Left (−X) = crack closing, Right (+X) = crack expanding<br/>
          • <strong>Vertical movement:</strong> Up (−Y) = wall sinking, Down (+Y) = wall rising<br/>
          • <strong>Direct displacement</strong> shows net structural change from start to end position<br/>
          • P0 and P2 raw readings are inverted during normalization to match P1's crack meter orientation
 </p>

        {/******** Footer with Links ********/}
        <div className="mt-6 pt-4 border-t border-gray-300">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            
            {/* FIRST LINK - README */}
            <a href={`${process.env.PUBLIC_URL}/README.md`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              README
            </a>
            
            <span className="text-gray-400">|</span>
            
            {/* SECOND LINK - METHOD */}
            <a href={`${process.env.PUBLIC_URL}/METHOD.md`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Method
            </a>
            
            <span className="text-gray-400">|</span>
            
            {/* THIRD LINK - LICENSE */}
            <a href={`${process.env.PUBLIC_URL}/LICENSE.md`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              License
            </a>
            
            <span className="text-gray-400">|</span>
            
            {/* FOURTH LINK - GITHUB REPO */}
            <a href="https://github.com/logosfabula/crack-visualizer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub Repo
            </a>            
          </div>
          
          <div className="mt-3 text-center text-xs text-gray-500">
            v{require('../package.json').version} | 
            © 2025 logosfabula | For monitoring purposes only | Not a professional engineering tool
          </div>

        </div>
      </div>
    </div>
  );
};

export default CrackMovementVisualizer;