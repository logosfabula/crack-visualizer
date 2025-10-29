import React from 'react';
import { DISPLAY_RANGE } from '../../constants/boundaries';
import { toSVGX, toSVGY } from '../../utils/coordinateConverters';

export const SVGGrid = ({ children, onPointClick, hoveredPoint, setHoveredPoint }) => {
  return (
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
        {/* Horizontal markers */}
        {[DISPLAY_RANGE.X_MIN, -1, -0.5, 0.5, 1, DISPLAY_RANGE.X_MAX].map(val => (
          <g key={`h-marker-${val}`}>
            <line x1={toSVGX(val)} y1="295" x2={toSVGX(val)} y2="305"/>
            <text x={toSVGX(val)} y="325" textAnchor="middle">
              {val > 0 ? '+' : ''}{val}
            </text>
          </g>
        ))}
        
        {/* Vertical markers */}
        {[DISPLAY_RANGE.Y_MIN, -1, -0.5, 0.5, 1, DISPLAY_RANGE.Y_MAX].map(val => (
          <g key={`v-marker-${val}`}>
            <line x1="390" y1={toSVGY(val)} x2="410" y2={toSVGY(val)}/>
            <text x="420" y={toSVGY(val) + 8} textAnchor="start">
              {val > 0 ? '+' : ''}{val}
            </text>
          </g>
        ))}
      </g>
      
      {children}
    </svg>
  );
};