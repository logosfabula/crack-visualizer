import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';

// Grouped bar chart comparing every floor's horizontal vs. vertical rate
// (mm/week, signed) side by side — independent of the Displacement
// Component selector, this is the cross-floor view of the same question
// each floor's own RateComparisonBar answers for a single floor.
export const ComponentRateChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis label={{ value: 'mm/week', angle: -90, position: 'insideLeft' }} />
      <Tooltip formatter={(value) => `${value.toFixed(4)} mm/week`} />
      <Legend />
      <ReferenceLine y={0} stroke="#9ca3af" />
      <Bar dataKey="horizontal" name="Horizontal" fill="#3b82f6" />
      <Bar dataKey="vertical" name="Vertical" fill="#f97316" />
    </BarChart>
  </ResponsiveContainer>
);
