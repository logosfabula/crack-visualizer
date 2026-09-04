import React, { useState } from 'react';
import { SVGGrid } from '../common/SVGGrid';
import { MovementPatternRenderer } from '../common/MovementPatternRenderer';
import { METER_CONFIGS } from '../../constants/meterConfigs';

export const MovementPatternsView = ({
  processedData,
  selectedMeter,
  onPointClick,
  hoveredPoint,
  setHoveredPoint
}) => {
  const [useNormalized, setUseNormalized] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {useNormalized ? 'Normalized Movement Patterns' : 'Movement Patterns'}
        </h2>
        <button
          onClick={() => setUseNormalized(!useNormalized)}
          className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
        >
          {useNormalized ? '↔ Raw View' : '↔ Normalized View'}
        </button>
      </div>
      <div className="mb-4 text-sm text-gray-600">
        {useNormalized ? (
          <>
            <p>• Each meter's first reading set as origin (0, 0)</p>
            <p>• Shows movement from origin with floor-specific corrections for unified analysis</p>
            <p>• <strong>Click any dot</strong> to view detailed crack position visualization</p>
          </>
        ) : (
          <>
            <p>• Transparency gradient: oldest (transparent) → newest (solid)</p>
            <p>• Lines show movement direction with days between measurements</p>
            <p>• <strong>Note:</strong> This view shows raw positions that not consistent across floors. For consistent analysis across floors, use the Normalized View</p>
            <p>• <strong>Click any dot</strong> to view detailed crack position visualization</p>
          </>
        )}
      </div>

      <div style={{ width: '100%', height: '600px', position: 'relative' }}>
        <SVGGrid>
          <MovementPatternRenderer
            processedData={processedData}
            selectedMeter={selectedMeter}
            useNormalized={useNormalized}
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
              {useNormalized && <span className="text-xs text-gray-500">(from origin)</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
