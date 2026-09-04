import React, { useState } from 'react';
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
import { InfoDisclosure } from '../common/InfoDisclosure';

const formatDateTick = (timestamp) => new Date(timestamp).toISOString().split('T')[0];

export const TimelineView = ({ processedData, selectedMeter }) => {
  const [proportionalSpacing, setProportionalSpacing] = useState(true);

  // Recharts' category axis spaces points by index, not by date, unless
  // given a numeric dataKey and told to treat it as a continuous scale.
  const chartData = processedData.map(d => ({
    ...d,
    dateTimestamp: new Date(d.date).getTime()
  }));

  const xAxisProps = proportionalSpacing
    ? { dataKey: 'dateTimestamp', type: 'number', domain: ['dataMin', 'dataMax'], tickFormatter: formatDateTick }
    : { dataKey: 'date', type: 'category' };

  return (
    <div className="space-y-8">
      <InfoDisclosure label="Timeline normalized view">
        <p>
          <strong>Timeline shows normalized movement data:</strong> All floors are made start at (0, 0) and subsequent readings are shifted according to the first reading.
          This allows direct comparison of structural movement patterns across all floors.
        </p>
      </InfoDisclosure>

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={proportionalSpacing}
          onChange={(e) => setProportionalSpacing(e.target.checked)}
          className="cursor-pointer"
        />
        Space readings proportionally to time (instead of one evenly-spaced tick per reading)
      </label>

      <div>
        <h2 className="text-xl font-semibold mb-4">Horizontal Movement Over Time (X-axis)</h2>
        <p className="text-sm text-gray-600 mb-2">
          Positive values = crack expanding | Negative values = crack closing
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis {...xAxisProps} />
            <YAxis label={{ value: 'Δ Position (mm)', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} labelFormatter={proportionalSpacing ? formatDateTick : undefined} />
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
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis {...xAxisProps} />
            <YAxis label={{ value: 'Δ Position (mm)', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} labelFormatter={proportionalSpacing ? formatDateTick : undefined} />
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