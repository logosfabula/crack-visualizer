import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { CustomTooltip } from '../common/CustomTooltip';

export const TimelineView = ({ processedData, selectedMeter }) => {
  return (
    <div className="space-y-8">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Timeline shows normalized movement data:</strong> All floors are made start at (0, 0) and subsequent readings are shifted according to the first reading. 
          This allows direct comparison of structural movement patterns across all floors.
        </p>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Horizontal Movement Over Time (X-axis)</h2>
        <p className="text-sm text-gray-600 mb-2">
          Positive values = crack expanding | Negative values = crack closing
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: 'Δ Position (mm)', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {(selectedMeter === 'all' || selectedMeter === 'pianterreno') && (
              <Line type="monotone" dataKey="pianterreno_norm_x" stroke="#8884d8" name="Pianterreno X" connectNulls={false} />
            )}
            {(selectedMeter === 'all' || selectedMeter === 'piano1') && (
              <Line type="monotone" dataKey="piano1_norm_x" stroke="#82ca9d" name="Piano 1 X" connectNulls={false} />
            )}
            {(selectedMeter === 'all' || selectedMeter === 'piano2') && (
              <Line type="monotone" dataKey="piano2_norm_x" stroke="#ffc658" name="Piano 2 X" connectNulls={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Vertical Movement Over Time (Y-axis)</h2>
        <p className="text-sm text-gray-600 mb-2">
          Positive values = wall rising | Negative values = wall sinking
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: 'Δ Position (mm)', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {(selectedMeter === 'all' || selectedMeter === 'pianterreno') && (
              <Line type="monotone" dataKey="pianterreno_norm_y" stroke="#8884d8" name="Pianterreno Y" connectNulls={false} />
            )}
            {(selectedMeter === 'all' || selectedMeter === 'piano1') && (
              <Line type="monotone" dataKey="piano1_norm_y" stroke="#82ca9d" name="Piano 1 Y" connectNulls={false} />
            )}
            {(selectedMeter === 'all' || selectedMeter === 'piano2') && (
              <Line type="monotone" dataKey="piano2_norm_y" stroke="#ffc658" name="Piano 2 Y" connectNulls={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};