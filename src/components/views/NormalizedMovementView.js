import React from 'react';
import { SVGGrid } from '../common/SVGGrid';
import { MovementPatternRenderer } from '../common/MovementPatternRenderer';
import { METER_CONFIGS } from '../../constants/meterConfigs';

export const NormalizedMovementView = ({ 
  processedData, 
  selectedMeter, 
  onPointClick, 
  hoveredPoint, 
  setHoveredPoint, 
  setSelectedView 
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Normalized Movement Patterns</h2>
        <button
          onClick={() => setSelectedView('movement')}
          className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
        >
          ↔ Raw View
        </button>
      </div>
      <div className="mb-4 text-sm text-gray-600">
        <p>• Each meter's first reading set as origin (0, 0)</p>
        <p>• Shows movement from origin with floor-specific corrections for unified analysis</p>
        <p>• <strong>Click any dot</strong> to view detailed crack position visualization</p>
      </div>
      
      <div style={{ width: '100%', height: '600px', position: 'relative' }}>
        <SVGGrid>
          <MovementPatternRenderer 
            processedData={processedData}
            selectedMeter={selectedMeter}
            useNormalized={true}
            onPointClick={onPointClick}
            hoveredPoint={hoveredPoint}
            setHoveredPoint={setHoveredPoint}
          />
        </SVGGrid>
        
        {/* Legend */}
        <div className="mt-4 flex justify-center space-x-6">
          {(selectedMeter === 'all' 
            ? Object.values(METER_CONFIGS).map(c => ({ name: c.displayName, color: c.color }))
            : [METER_CONFIGS[selectedMeter]].map(c => ({ name: c.displayName, color: c.color }))
          ).map(item => (
            <div key={item.name} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-xs text-gray-500">(from origin)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};