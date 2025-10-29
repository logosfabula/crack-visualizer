import React from 'react';

export const CustomTooltip = ({ active, payload, label }) => {
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
};