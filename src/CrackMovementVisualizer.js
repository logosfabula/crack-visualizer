import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import rawData from './data/crackData.json';


const CrackMovementVisualizer = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  // Raw dataset
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
  const calculateQuadrantAngles = (reading) => {
    if (!reading) return null;
    
    const [up, right, down, left] = reading.split(';').map(v => parseFloat(v));
    
    // Grid parameters
    const gridWidth = 400;
    const gridHeight = 300;
    const centerX = 200;
    const centerY = 150;
    const scaleX = 20;
    const scaleY = 15;
    
    // Calculate line endpoints
    const topX = centerX + up * scaleX;
    const bottomX = centerX + down * scaleX;
    const leftY = centerY + left * scaleY;
    const rightY = centerY + right * scaleY;
    
    // Calculate angles of both lines
    let verticalLineAngle, horizontalLineAngle;
    
    if (Math.abs(bottomX - topX) < 1e-10) {
      verticalLineAngle = 90; // Truly vertical
    } else {
      const verticalSlope = gridHeight / (bottomX - topX);
      verticalLineAngle = Math.atan(verticalSlope) * 180 / Math.PI;
    }
    
    if (Math.abs(rightY - leftY) < 1e-10) {
      horizontalLineAngle = 0; // Truly horizontal
    } else {
      const horizontalSlope = (rightY - leftY) / gridWidth;
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
  };

  // Function to calculate intersection point from crack meter readings
  const calculateIntersection = (reading) => {
    if (!reading) return null;
    
    const [up, right, down, left] = reading.split(';').map(v => parseFloat(v));
    
    // Grid parameters (same as our method)
    const gridWidth = 400;
    const gridHeight = 300;
    const centerX = 200;
    const centerY = 150;
    const scaleX = 20;
    const scaleY = 15;
    
    // Calculate line endpoints
    const topX = centerX + up * scaleX;
    const bottomX = centerX + down * scaleX;
    const leftY = centerY + left * scaleY;
    const rightY = centerY + right * scaleY;
    
    // Handle special case: truly vertical line (up === down)
    if (topX === bottomX) {
      // Vertical line at x = topX, find where horizontal line intersects it
      const verticalLineX = topX;
      const horizontalLineAtX = (rightY - leftY) * (verticalLineX / gridWidth) + leftY;
      
      // Convert to grid coordinates
      const gridX = (verticalLineX - centerX) / scaleX;
      const gridY = (centerY - horizontalLineAtX) / scaleY;
      
      return { x: gridX, y: gridY };
    }
    
    // Handle special case: truly horizontal line (left === right)  
    if (leftY === rightY) {
      // Horizontal line at y = leftY, find where vertical line intersects it
      const horizontalLineY = leftY;
      const verticalLineAtY = (bottomX - topX) * (horizontalLineY / gridHeight) + topX;
      
      // Convert to grid coordinates
      const gridX = (verticalLineAtY - centerX) / scaleX;
      const gridY = (centerY - horizontalLineY) / scaleY;
      
      return { x: gridX, y: gridY };
    }
    
    // Normal case: both lines have slopes
    const m1 = gridHeight / (bottomX - topX); // Vertical line slope
    const b1 = -m1 * topX; // Vertical line y-intercept
    
    const m2 = (rightY - leftY) / gridWidth; // Horizontal line slope
    const b2 = leftY; // Horizontal line y-intercept
    
    // Check for parallel lines
    if (Math.abs(m1 - m2) < 1e-10) {
      return null; // Lines are parallel, no intersection
    }
    
    // Find intersection
    const intersectionX = (b2 - b1) / (m1 - m2);
    const intersectionY = m1 * intersectionX + b1;
    
    // Convert to grid coordinates
    const gridX = (intersectionX - centerX) / scaleX;
    const gridY = (centerY - intersectionY) / scaleY;
    
    return { x: gridX, y: gridY };
  };

  // Process data to calculate intersection points and normalized coordinates
  const processedData = useMemo(() => {
    const rawProcessed = rawData.map(entry => {
      const result = {
        date: entry.date,
        dateObj: new Date(entry.date),
        rawPianterreno: entry.Pianterreno,
        rawPiano1: entry['Piano 1'],
        rawPiano2: entry['Piano 2']
      };
      
      // Calculate intersection points and quadrant angle analysis
      const pianoterrenoPos = calculateIntersection(entry.Pianterreno);
      const piano1Pos = calculateIntersection(entry['Piano 1']);
      const piano2Pos = calculateIntersection(entry['Piano 2']);
      
      const pianoterrenoAngles = calculateQuadrantAngles(entry.Pianterreno);
      const piano1Angles = calculateQuadrantAngles(entry['Piano 1']);
      const piano2Angles = calculateQuadrantAngles(entry['Piano 2']);
      
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
            entry[`${meter}_norm_x`] = entry[`${meter}_x`] - originX;
            entry[`${meter}_norm_y`] = entry[`${meter}_y`] - originY;
          }
        });
      }
    });
    
    return normalizedData;
  }, []);

  const [selectedView, setSelectedView] = useState('timeline');
  const [selectedMeter, setSelectedMeter] = useState('all');
  const [selectedReading, setSelectedReading] = useState(null);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
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

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6">Crack Movement Analysis Dashboard</h1>
      
      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">View:</label>
          <select 
            value={selectedView} 
            onChange={(e) => setSelectedView(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="timeline">Timeline View</option>
            <option value="movement">Movement Patterns</option>
            <option value="normalized">Normalized Movement</option>
            <option value="single">Single Reading</option>
            <option value="data">Raw Data</option>
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
            <label className="block text-sm font-medium mb-2">Reading:</label>
            <select 
              value={selectedReading || ''} 
              onChange={(e) => setSelectedReading(e.target.value || null)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select a reading...</option>
              {processedData
                .filter(d => d.rawPianterreno || d.rawPiano1 || d.rawPiano2)
                .map((entry, index) => {
                  const readings = [];
                  if (entry.rawPianterreno) readings.push(`Pianterreno: ${entry.rawPianterreno}`);
                  if (entry.rawPiano1) readings.push(`Piano 1: ${entry.rawPiano1}`);
                  if (entry.rawPiano2) readings.push(`Piano 2: ${entry.rawPiano2}`);
                  
                  return readings.map((reading, readingIndex) => {
                    const meterName = reading.split(':')[0];
                    const meterReading = reading.split(': ')[1];
                    return (
                      <option 
                        key={`${index}-${readingIndex}`} 
                        value={JSON.stringify({ date: entry.date, meter: meterName, reading: meterReading })}
                      >
                        {entry.date} - {reading}
                      </option>
                    );
                  });
                }).flat()}
            </select>
          </div>
        )}
      </div>

      {/* Timeline View */}
      {selectedView === 'timeline' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Horizontal Movement (X-axis)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Position (millimeters)', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {(selectedMeter === 'all' || selectedMeter === 'pianterreno') && (
                  <Line type="monotone" dataKey="pianterreno_x" stroke="#8884d8" name="Pianterreno X" connectNulls={false} />
                )}
                {(selectedMeter === 'all' || selectedMeter === 'piano1') && (
                  <Line type="monotone" dataKey="piano1_x" stroke="#82ca9d" name="Piano 1 X" connectNulls={false} />
                )}
                {(selectedMeter === 'all' || selectedMeter === 'piano2') && (
                  <Line type="monotone" dataKey="piano2_x" stroke="#ffc658" name="Piano 2 X" connectNulls={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Vertical Movement (Y-axis)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Position (millimeters)', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {(selectedMeter === 'all' || selectedMeter === 'pianterreno') && (
                  <Line type="monotone" dataKey="pianterreno_y" stroke="#8884d8" name="Pianterreno Y" connectNulls={false} />
                )}
                {(selectedMeter === 'all' || selectedMeter === 'piano1') && (
                  <Line type="monotone" dataKey="piano1_y" stroke="#82ca9d" name="Piano 1 Y" connectNulls={false} />
                )}
                {(selectedMeter === 'all' || selectedMeter === 'piano2') && (
                  <Line type="monotone" dataKey="piano2_y" stroke="#ffc658" name="Piano 2 Y" connectNulls={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Single Reading View */}
      {selectedView === 'single' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Single Reading Visualization</h2>
          
          {/* Navigation button */}
          <div className="mb-4">
            <button
              onClick={() => setSelectedView('movement')}
              className="inline-flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors text-sm"
              title="Back to Movement Patterns"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              Movement Patterns
            </button>
          </div>
          
          {selectedReading ? (
            (() => {
              const parsedReading = JSON.parse(selectedReading);
              const { date, meter, reading } = parsedReading;
              const meterName = meter;
              
              // Get meter color based on name
              const getMeterColor = (meter) => {
                switch(meter) {
                  case 'Pianterreno': return '#8884d8';
                  case 'Piano 1': return '#82ca9d';
                  case 'Piano 2': return '#ffc658';
                  default: return '#2563eb';
                }
              };
              const meterColor = getMeterColor(meterName);
              
              // Calculate intersection point and angle analysis
              const intersection = calculateIntersection(reading);
              const angleAnalysis = calculateQuadrantAngles(reading);
              
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
                  
                  normalizedIntersection = {
                    x: intersection.x - originX,
                    y: intersection.y - originY
                  };
                }
              }
              
              if (!intersection) {
                return (
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
                );
              }
              
              return (
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
                        <strong>Intersection Point:</strong> ({intersection.x.toFixed(3)}, {intersection.y.toFixed(3)})
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
                    <svg width="100%" height="400" viewBox="0 0 600 400">
                      {/* Grid pattern */}
                      <defs>
                        <pattern id="singleGrid" width="100" height="66.67" patternUnits="userSpaceOnUse">
                          <path d="M 100 0 L 0 0 0 66.67" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="600" height="400" fill="url(#singleGrid)"/>
                      
                      {/* Center lines */}
                      <line x1="300" y1="0" x2="300" y2="400" stroke="#d1d5db" strokeWidth="2"/>
                      <line x1="0" y1="200" x2="600" y2="200" stroke="#d1d5db" strokeWidth="2"/>
                      
                      {/* Scale markers and labels */}
                      <g stroke="#9ca3af" strokeWidth="1" fontSize="12" fill="#6b7280">
                        {/* Horizontal markers */}
                        <line x1="0" y1="195" x2="0" y2="205"/>
                        <text x="0" y="220" textAnchor="middle">-1.5</text>
                        <line x1="100" y1="195" x2="100" y2="205"/>
                        <text x="100" y="220" textAnchor="middle">-1</text>
                        <line x1="200" y1="195" x2="200" y2="205"/>
                        <text x="200" y="220" textAnchor="middle">-0.5</text>
                        <line x1="400" y1="195" x2="400" y2="205"/>
                        <text x="400" y="220" textAnchor="middle">+0.5</text>
                        <line x1="500" y1="195" x2="500" y2="205"/>
                        <text x="500" y="220" textAnchor="middle">+1</text>
                        <line x1="600" y1="195" x2="600" y2="205"/>
                        <text x="600" y="220" textAnchor="middle">+1.5</text>
                        
                        {/* Vertical markers */}
                        <line x1="290" y1="0" x2="310" y2="0"/>
                        <text x="320" y="8" textAnchor="start">+1.5</text>
                        <line x1="290" y1="66.67" x2="310" y2="66.67"/>
                        <text x="320" y="75" textAnchor="start">+1</text>
                        <line x1="290" y1="133.33" x2="310" y2="133.33"/>
                        <text x="320" y="142" textAnchor="start">+0.5</text>
                        <line x1="290" y1="266.67" x2="310" y2="266.67"/>
                        <text x="320" y="275" textAnchor="start">-0.5</text>
                        <line x1="290" y1="333.33" x2="310" y2="333.33"/>
                        <text x="320" y="342" textAnchor="start">-1</text>
                        <line x1="290" y1="400" x2="310" y2="400"/>
                        <text x="320" y="408" textAnchor="start">-1.5</text>
                      </g>
                      
                      {/* Draw the crack cross */}
                      {(() => {
                        const [up, right, down, left] = reading.split(';').map(v => parseFloat(v));
                        
                        // Use the EXACT same calculation as the main method
                        // Grid parameters (matching the main calculateIntersection function)
                        const gridWidth = 600;  // SVG canvas width
                        const gridHeight = 400; // SVG canvas height
                        const centerX = 300;    // SVG center X
                        const centerY = 200;    // SVG center Y
                        const scaleX = 200;     // pixels per unit (600/3 = 200 for -1.5 to +1.5)
                        const scaleY = 133.33;  // pixels per unit (400/3 = 133.33 for -1.5 to +1.5)
                        
                        // Calculate line endpoints EXACTLY like the main method
                        const topX = centerX + up * scaleX;
                        const bottomX = centerX + down * scaleX;
                        const leftY = centerY + left * scaleY;
                        const rightY = centerY + right * scaleY;
                        
                        // Use the EXACT intersection calculation from calculateIntersection
                        let intersectionX, intersectionY;
                        
                        // Handle special case: truly vertical line (up === down)
                        if (Math.abs(topX - bottomX) < 1e-10) {
                          const verticalLineX = topX;
                          const horizontalLineAtX = (rightY - leftY) * (verticalLineX / gridWidth) + leftY;
                          intersectionX = verticalLineX;
                          intersectionY = horizontalLineAtX;
                        } 
                        // Handle special case: truly horizontal line (left === right)
                        else if (Math.abs(leftY - rightY) < 1e-10) {
                          const horizontalLineY = leftY;
                          const verticalLineAtY = (bottomX - topX) * (horizontalLineY / gridHeight) + topX;
                          intersectionX = verticalLineAtY;
                          intersectionY = horizontalLineY;
                        } 
                        // Normal case: both lines have slopes
                        else {
                          const m1 = gridHeight / (bottomX - topX);
                          const b1 = -m1 * topX;
                          const m2 = (rightY - leftY) / gridWidth;
                          const b2 = leftY;
                          
                          if (Math.abs(m1 - m2) < 1e-10) {
                            // Parallel lines - shouldn't happen with real data
                            intersectionX = centerX;
                            intersectionY = centerY;
                          } else {
                            intersectionX = (b2 - b1) / (m1 - m2);
                            intersectionY = m1 * intersectionX + b1;
                          }
                        }
                        
                        return (
                          <>
                            {/* Vertical line - from top boundary to bottom boundary */}
                            <line 
                              x1={topX} y1={0} 
                              x2={bottomX} y2={gridHeight} 
                              stroke="#dc2626" 
                              strokeWidth="3"
                            />
                            
                            {/* Horizontal line - from left boundary to right boundary */}
                            <line 
                              x1={0} y1={leftY} 
                              x2={gridWidth} y2={rightY} 
                              stroke="#dc2626" 
                              strokeWidth="3"
                            />
                            
                            {/* Normalized intersection marker */}
                            {normalizedIntersection !== null && (
                              <g transform={`translate(${300 + normalizedIntersection.x * 200}, ${200 - normalizedIntersection.y * 133.33})`}>
                                {/* Circle outline - meter color */}
                                <circle 
                                  cx="0" 
                                  cy="0" 
                                  r="8" 
                                  fill="none" 
                                  stroke={meterColor} 
                                  strokeWidth="2"
                                  opacity="0.8"
                                />
                                {/* Coordinate label */}
                                <text 
                                  x="0" 
                                  y="-15" 
                                  textAnchor="middle" 
                                  fontSize="10" 
                                  fill={meterColor} 
                                  fontWeight="bold"
                                  stroke="white"
                                  strokeWidth="2"
                                  paintOrder="stroke"
                                >
                                  ({normalizedIntersection.x.toFixed(3)}, {normalizedIntersection.y.toFixed(3)})
                                </text>
                              </g>
                            )}
                            
                            {/* Intersection point (absolute) */}
                            <circle 
                              cx={intersectionX} 
                              cy={intersectionY} 
                              r="8" 
                              fill={meterColor} 
                              stroke="white" 
                              strokeWidth="3"
                            />
                            
                            {/* Boundary intersection labels */}
                            <text x={topX} y="15" textAnchor="middle" fontSize="12" fill="#dc2626" fontWeight="bold">
                              ↑{up}
                            </text>
                            <text x={bottomX} y="390" textAnchor="middle" fontSize="12" fill="#dc2626" fontWeight="bold">
                              ↓{down}
                            </text>
                            <text x="10" y={leftY + 4} textAnchor="start" fontSize="12" fill="#dc2626" fontWeight="bold">
                              ←{left}
                            </text>
                            <text x="590" y={rightY + 4} textAnchor="end" fontSize="12" fill="#dc2626" fontWeight="bold">
                              →{right}
                            </text>
                            
                            {/* Quadrant angle labels for non-orthogonal crosses */}
                            {angleAnalysis && angleAnalysis.deviation > 0.5 && (
                              <>
                                {/* Quadrant labels */}
                                <text x="150" y="100" textAnchor="middle" fontSize="11" fill="#7c3aed" fontWeight="bold">
                                  NW: {angleAnalysis.widerQuadrants.includes('NW') ? 
                                    angleAnalysis.widerAngle.toFixed(1) : angleAnalysis.narrowerAngle.toFixed(1)}°
                                </text>
                                <text x="450" y="100" textAnchor="middle" fontSize="11" fill="#7c3aed" fontWeight="bold">
                                  NE: {angleAnalysis.widerQuadrants.includes('NE') ? 
                                    angleAnalysis.widerAngle.toFixed(1) : angleAnalysis.narrowerAngle.toFixed(1)}°
                                </text>
                                <text x="150" y="320" textAnchor="middle" fontSize="11" fill="#7c3aed" fontWeight="bold">
                                  SW: {angleAnalysis.widerQuadrants.includes('SW') ? 
                                    angleAnalysis.widerAngle.toFixed(1) : angleAnalysis.narrowerAngle.toFixed(1)}°
                                </text>
                                <text x="450" y="320" textAnchor="middle" fontSize="11" fill="#7c3aed" fontWeight="bold">
                                  SE: {angleAnalysis.widerQuadrants.includes('SE') ? 
                                    angleAnalysis.widerAngle.toFixed(1) : angleAnalysis.narrowerAngle.toFixed(1)}°
                                </text>
                              </>
                            )}
                            <text 
                              x={intersectionX} 
                              y={intersectionY - 15} 
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
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Reading Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Measurement Format:</strong> [up, right, down, left]<br/>
                        <strong>Cross Position:</strong> {intersection.x.toFixed(3)}mm horizontal, {intersection.y.toFixed(3)}mm vertical
                      </div>
                      <div>
                        <strong>Interpretation:</strong><br/>
                        {normalizedIntersection !== null ? (
                          // Base interpretation on normalized coordinates (movement from first reading)
                          normalizedIntersection.x === 0 && normalizedIntersection.y === 0 ? 
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
                              <span className="text-red-700">⚠ Poor (>2.0° deviation)</span>
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
              );
            })()
          ) : (
            <div className="text-gray-500 p-8 text-center border-2 border-dashed border-gray-200 rounded">
              Please select a reading from the dropdown above to visualize the crack position.
            </div>
          )}
        </div>
      )}

      {/* Normalized Movement Patterns View */}
      {selectedView === 'normalized' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Normalized Movement Patterns</h2>
            <button
              onClick={() => setSelectedView('movement')}
              className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
            >
              ↔ Absolute View
            </button>
          </div>
          <div className="mb-4 text-sm text-gray-600">
            <p>• Each meter's first reading set as origin (0, 0)</p>
            <p>• Shows pure relative movement from starting position</p>
            <p>• <strong>Click any dot</strong> to view detailed crack position visualization</p>
          </div>
          
          <div style={{ width: '100%', height: '600px', position: 'relative' }}>
            <svg width="100%" height="600" viewBox="0 0 800 600">
              {/* Grid */}
              <defs>
                <pattern id="normalizedGrid" width="133.33" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 133.33 0 L 0 0 0 100" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="800" height="600" fill="url(#normalizedGrid)"/>
              
              {/* Center lines */}
              <line x1="400" y1="0" x2="400" y2="600" stroke="#d1d5db" strokeWidth="2"/>
              <line x1="0" y1="300" x2="800" y2="300" stroke="#d1d5db" strokeWidth="2"/>
              
              {/* Axis labels */}
              <text x="750" y="320" textAnchor="end" fontSize="12" fill="#6b7280">+X</text>
              <text x="50" y="320" textAnchor="start" fontSize="12" fill="#6b7280">-X</text>
              <text x="410" y="30" textAnchor="start" fontSize="12" fill="#6b7280">+Y</text>
              <text x="410" y="580" textAnchor="start" fontSize="12" fill="#6b7280">-Y</text>
              
              {/* Scale markers */}
              <g stroke="#9ca3af" strokeWidth="1" fontSize="12" fill="#6b7280">
                {/* Horizontal markers */}
                <line x1="0" y1="295" x2="0" y2="305"/>
                <text x="0" y="325" textAnchor="middle">-1.5</text>
                <line x1="133.33" y1="295" x2="133.33" y2="305"/>
                <text x="133.33" y="325" textAnchor="middle">-1</text>
                <line x1="266.67" y1="295" x2="266.67" y2="305"/>
                <text x="266.67" y="325" textAnchor="middle">-0.5</text>
                <line x1="533.33" y1="295" x2="533.33" y2="305"/>
                <text x="533.33" y="325" textAnchor="middle">+0.5</text>
                <line x1="666.67" y1="295" x2="666.67" y2="305"/>
                <text x="666.67" y="325" textAnchor="middle">+1</text>
                <line x1="800" y1="295" x2="800" y2="305"/>
                <text x="800" y="325" textAnchor="middle">+1.5</text>
                
                {/* Vertical markers */}
                <line x1="390" y1="0" x2="410" y2="0"/>
                <text x="420" y="8" textAnchor="start">+1.5</text>
                <line x1="390" y1="100" x2="410" y2="100"/>
                <text x="420" y="108" textAnchor="start">+1</text>
                <line x1="390" y1="200" x2="410" y2="200"/>
                <text x="420" y="208" textAnchor="start">+0.5</text>
                <line x1="390" y1="400" x2="410" y2="400"/>
                <text x="420" y="408" textAnchor="start">-0.5</text>
                <line x1="390" y1="500" x2="410" y2="500"/>
                <text x="420" y="508" textAnchor="start">-1</text>
                <line x1="390" y1="600" x2="410" y2="600"/>
                <text x="420" y="608" textAnchor="start">-1.5</text>
              </g>
              
              {/* Render normalized movement patterns for each meter */}
              {(() => {
                const meterConfigs = [
                  { 
                    name: 'pianterreno', 
                    color: '#8884d8', 
                    dataKey: ['pianterreno_norm_x', 'pianterreno_norm_y'],
                    show: selectedMeter === 'all' || selectedMeter === 'pianterreno'
                  },
                  { 
                    name: 'piano1', 
                    color: '#82ca9d', 
                    dataKey: ['piano1_norm_x', 'piano1_norm_y'],
                    show: selectedMeter === 'all' || selectedMeter === 'piano1'
                  },
                  { 
                    name: 'piano2', 
                    color: '#ffc658', 
                    dataKey: ['piano2_norm_x', 'piano2_norm_y'],
                    show: selectedMeter === 'all' || selectedMeter === 'piano2'
                  }
                ];
                
                return meterConfigs.map(config => {
                  if (!config.show) return null;
                  
                  // Filter and sort data for this meter (normalized coordinates)
                  const meterData = processedData
                    .filter(d => d[config.dataKey[0]] !== undefined && d[config.dataKey[1]] !== undefined)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((d, index, array) => ({
                      ...d,
                      x: d[config.dataKey[0]],
                      y: d[config.dataKey[1]],
                      opacity: (index + 1) / array.length,
                      index: index,
                      rawReading: config.name === 'pianterreno' ? d.rawPianterreno :
                                  config.name === 'piano1' ? d.rawPiano1 :
                                  d.rawPiano2
                    }));
                  
                  if (meterData.length === 0) return null;
                  
                  // Convert coordinates to SVG space (-1.5 to +1.5 range)
                  const toSVGX = (x) => 400 + x * 266.67; // Center at 400, scale: 400px / 1.5 units = 266.67px per unit
                  const toSVGY = (y) => 300 - y * 200;    // Center at 300, scale: 300px / 1.5 units = 200px per unit
                  
                  return (
                    <g key={config.name}>
                      {/* Draw connecting lines */}
                      {meterData.slice(1).map((point, i) => {
                        const prevPoint = meterData[i];
                        const x1 = toSVGX(prevPoint.x);
                        const y1 = toSVGY(prevPoint.y);
                        const x2 = toSVGX(point.x);
                        const y2 = toSVGY(point.y);
                        
                        // Calculate days between measurements
                        const date1 = new Date(prevPoint.date);
                        const date2 = new Date(point.date);
                        const daysDiff = Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
                        
                        // Line opacity based on the newer point
                        const lineOpacity = point.opacity * 0.8;
                        
                        // Midpoint for label
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;
                        
                        return (
                          <g key={`${config.name}-line-${i}`}>
                            {/* Arrow line */}
                            <line 
                              x1={x1} y1={y1} 
                              x2={x2} y2={y2}
                              stroke={config.color}
                              strokeOpacity={lineOpacity}
                              strokeWidth="2"
                              markerEnd={`url(#arrowhead-norm-${config.name})`}
                            />
                            
                            {/* Days label */}
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
                      
                      {/* Draw points */}
                      {meterData.map((point, i) => (
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
                            onClick={() => {
                              // Switch to single reading view and select this reading
                              const readingValue = JSON.stringify({
                                date: point.date,
                                meter: config.name === 'pianterreno' ? 'Pianterreno' :
                                       config.name === 'piano1' ? 'Piano 1' : 'Piano 2',
                                reading: point.rawReading
                              });
                              setSelectedReading(readingValue);
                              setSelectedView('single');
                            }}
                          />
                          {/* Date label */}
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
                          
                          {/* Origin marker for first point */}
                          {i === 0 && (
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
                      ))}
                      
                      {/* Define arrowhead marker */}
                      <defs>
                        <marker
                          id={`arrowhead-norm-${config.name}`}
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
                });
              })()}
            </svg>
            
            {/* Legend */}
            <div className="mt-4 flex justify-center space-x-6">
              {(selectedMeter === 'all' ? 
                [
                  { name: 'Pianterreno', color: '#8884d8' },
                  { name: 'Piano 1', color: '#82ca9d' },
                  { name: 'Piano 2', color: '#ffc658' }
                ] : 
                [
                  selectedMeter === 'pianterreno' && { name: 'Pianterreno', color: '#8884d8' },
                  selectedMeter === 'piano1' && { name: 'Piano 1', color: '#82ca9d' },
                  selectedMeter === 'piano2' && { name: 'Piano 2', color: '#ffc658' }
                ].filter(Boolean)
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
      )}

      {/* Movement Patterns View */}
      {selectedView === 'movement' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Movement Patterns</h2>
            <button
              onClick={() => setSelectedView('normalized')}
              className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
            >
              ↔ Normalized View
            </button>
          </div>
          <div className="mb-4 text-sm text-gray-600">
            <p>• Transparency gradient: oldest (transparent) → newest (solid)</p>
            <p>• Lines show movement direction with days between measurements</p>
          </div>
          
          <div style={{ width: '100%', height: '600px', position: 'relative' }}>
            <svg width="100%" height="600" viewBox="0 0 800 600">
              {/* Grid */}
              <defs>
                <pattern id="movementGrid" width="133.33" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 133.33 0 L 0 0 0 100" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="800" height="600" fill="url(#movementGrid)"/>
              
              {/* Center lines */}
              <line x1="400" y1="0" x2="400" y2="600" stroke="#d1d5db" strokeWidth="2"/>
              <line x1="0" y1="300" x2="800" y2="300" stroke="#d1d5db" strokeWidth="2"/>
              
              {/* Axis labels */}
              <text x="750" y="320" textAnchor="end" fontSize="12" fill="#6b7280">+X</text>
              <text x="50" y="320" textAnchor="start" fontSize="12" fill="#6b7280">-X</text>
              <text x="410" y="30" textAnchor="start" fontSize="12" fill="#6b7280">+Y</text>
              <text x="410" y="580" textAnchor="start" fontSize="12" fill="#6b7280">-Y</text>
              
              {/* Scale markers */}
              <g stroke="#9ca3af" strokeWidth="1" fontSize="12" fill="#6b7280">
                {/* Horizontal scale markers */}
                <line x1="0" y1="295" x2="0" y2="305"/>
                <text x="0" y="325" textAnchor="middle">-1.5</text>
                <line x1="133.33" y1="295" x2="133.33" y2="305"/>
                <text x="133.33" y="325" textAnchor="middle">-1</text>
                <line x1="266.67" y1="295" x2="266.67" y2="305"/>
                <text x="266.67" y="325" textAnchor="middle">-0.5</text>
                <line x1="533.33" y1="295" x2="533.33" y2="305"/>
                <text x="533.33" y="325" textAnchor="middle">+0.5</text>
                <line x1="666.67" y1="295" x2="666.67" y2="305"/>
                <text x="666.67" y="325" textAnchor="middle">+1</text>
                <line x1="800" y1="295" x2="800" y2="305"/>
                <text x="800" y="325" textAnchor="middle">+1.5</text>
                
                {/* Vertical scale markers */}
                <line x1="390" y1="0" x2="410" y2="0"/>
                <text x="420" y="8" textAnchor="start">+1.5</text>
                <line x1="390" y1="100" x2="410" y2="100"/>
                <text x="420" y="108" textAnchor="start">+1</text>
                <line x1="390" y1="200" x2="410" y2="200"/>
                <text x="420" y="208" textAnchor="start">+0.5</text>
                <line x1="390" y1="400" x2="410" y2="400"/>
                <text x="420" y="408" textAnchor="start">-0.5</text>
                <line x1="390" y1="500" x2="410" y2="500"/>
                <text x="420" y="508" textAnchor="start">-1</text>
                <line x1="390" y1="600" x2="410" y2="600"/>
                <text x="420" y="608" textAnchor="start">-1.5</text>
              </g>
              
              {/* Render movement patterns for each meter */}
              {(() => {
                const meterConfigs = [
                  { 
                    name: 'pianterreno', 
                    color: '#8884d8', 
                    dataKey: ['pianterreno_x', 'pianterreno_y'],
                    show: selectedMeter === 'all' || selectedMeter === 'pianterreno'
                  },
                  { 
                    name: 'piano1', 
                    color: '#82ca9d', 
                    dataKey: ['piano1_x', 'piano1_y'],
                    show: selectedMeter === 'all' || selectedMeter === 'piano1'
                  },
                  { 
                    name: 'piano2', 
                    color: '#ffc658', 
                    dataKey: ['piano2_x', 'piano2_y'],
                    show: selectedMeter === 'all' || selectedMeter === 'piano2'
                  }
                ];
                
                return meterConfigs.map(config => {
                  if (!config.show) return null;
                  
                  // Filter and sort data for this meter
                  const meterData = processedData
                    .filter(d => d[config.dataKey[0]] !== undefined && d[config.dataKey[1]] !== undefined)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((d, index, array) => ({
                      ...d,
                      x: d[config.dataKey[0]],
                      y: d[config.dataKey[1]],
                      opacity: (index + 1) / array.length, // Gradient from 0.1 to 1.0
                      index: index,
                      rawReading: config.name === 'pianterreno' ? d.rawPianterreno :
                                  config.name === 'piano1' ? d.rawPiano1 :
                                  d.rawPiano2
                    }));
                  
                  if (meterData.length === 0) return null;
                  
                  // Convert coordinates to SVG space (-1.5 to +1.5 range)
                  const toSVGX = (x) => 400 + x * 266.67; // Center at 400, scale: 400px / 1.5 units = 266.67px per unit
                  const toSVGY = (y) => 300 - y * 200;    // Center at 300, scale: 300px / 1.5 units = 200px per unit
                  
                  return (
                    <g key={config.name}>
                      {/* Draw connecting lines */}
                      {meterData.slice(1).map((point, i) => {
                        const prevPoint = meterData[i];
                        const x1 = toSVGX(prevPoint.x);
                        const y1 = toSVGY(prevPoint.y);
                        const x2 = toSVGX(point.x);
                        const y2 = toSVGY(point.y);
                        
                        // Calculate days between measurements
                        const date1 = new Date(prevPoint.date);
                        const date2 = new Date(point.date);
                        const daysDiff = Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
                        
                        // Line opacity based on the newer point
                        const lineOpacity = point.opacity * 0.8;
                        
                        // Midpoint for label
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;
                        
                        return (
                          <g key={`${config.name}-line-${i}`}>
                            {/* Arrow line */}
                            <line 
                              x1={x1} y1={y1} 
                              x2={x2} y2={y2}
                              stroke={config.color}
                              strokeOpacity={lineOpacity}
                              strokeWidth="2"
                              markerEnd={`url(#arrowhead-${config.name})`}
                            />
                            
                            {/* Days label */}
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
                      
                      {/* Draw points */}
                      {meterData.map((point, i) => (
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
                            onClick={() => {
                              // Switch to single reading view and select this reading
                              const readingValue = JSON.stringify({
                                date: point.date,
                                meter: config.name === 'pianterreno' ? 'Pianterreno' :
                                       config.name === 'piano1' ? 'Piano 1' : 'Piano 2',
                                reading: point.rawReading
                              });
                              setSelectedReading(readingValue);
                              setSelectedView('single');
                            }}
                            onMouseEnter={(e) => {
                              setHoveredPoint({
                                x: e.clientX,
                                y: e.clientY,
                                data: {
                                  meter: config.name,
                                  date: point.date,
                                  position: `(${point.x.toFixed(3)}, ${point.y.toFixed(3)})`,
                                  rawReading: point.rawReading,
                                  opacity: point.opacity,
                                  measurement: i + 1,
                                  total: meterData.length
                                }
                              });
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                            onMouseMove={(e) => {
                              if (hoveredPoint) {
                                setHoveredPoint(prev => ({
                                  ...prev,
                                  x: e.clientX,
                                  y: e.clientY
                                }));
                              }
                            }}
                          />
                          {/* Date label */}
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
                            {point.date.substring(5)} {/* Show MM-DD */}
                          </text>
                        </g>
                      ))}
                      
                      {/* Define arrowhead marker */}
                      <defs>
                        <marker
                          id={`arrowhead-${config.name}`}
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
                });
              })()}
            </svg>
            
            {/* Legend */}
            <div className="mt-4 flex justify-center space-x-6">
              {(selectedMeter === 'all' ? 
                [
                  { name: 'Pianterreno', color: '#8884d8' },
                  { name: 'Piano 1', color: '#82ca9d' },
                  { name: 'Piano 2', color: '#ffc658' }
                ] : 
                [
                  selectedMeter === 'pianterreno' && { name: 'Pianterreno', color: '#8884d8' },
                  selectedMeter === 'piano1' && { name: 'Piano 1', color: '#82ca9d' },
                  selectedMeter === 'piano2' && { name: 'Piano 2', color: '#ffc658' }
                ].filter(Boolean)
              ).map(item => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Raw Data View */}
      {selectedView === 'data' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Processed Data Table</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Date</th>
                  <th className="border border-gray-300 p-2">Pianterreno Raw</th>
                  <th className="border border-gray-300 p-2">Pianterreno Position</th>
                  <th className="border border-gray-300 p-2">Normalized Position</th>
                  <th className="border border-gray-300 p-2">Quadrant Angles</th>
                  <th className="border border-gray-300 p-2">Piano 1 Raw</th>
                  <th className="border border-gray-300 p-2">Piano 1 Position</th>
                  <th className="border border-gray-300 p-2">Normalized Position</th>
                  <th className="border border-gray-300 p-2">Quadrant Angles</th>
                  <th className="border border-gray-300 p-2">Piano 2 Raw</th>
                  <th className="border border-gray-300 p-2">Piano 2 Position</th>
                  <th className="border border-gray-300 p-2">Normalized Position</th>
                  <th className="border border-gray-300 p-2">Quadrant Angles</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="border border-gray-300 p-2 font-mono">{row.date}</td>
                    <td className="border border-gray-300 p-2 font-mono">{row.rawPianterreno || '—'}</td>
                    <td className="border border-gray-300 p-2 font-mono">
                      {row.pianterreno_x !== undefined ? 
                        `(${row.pianterreno_x.toFixed(3)}, ${row.pianterreno_y.toFixed(3)})` : '—'}
                    </td>
                    <td className="border border-gray-300 p-2 font-mono bg-green-50">
                      {row.pianterreno_norm_x !== undefined ? 
                        `(${row.pianterreno_norm_x.toFixed(3)}, ${row.pianterreno_norm_y.toFixed(3)})` : '—'}
                    </td>
                    <td className="border border-gray-300 p-2 text-xs">
                      {row.pianterreno_angle_analysis || '—'}
                    </td>
                    <td className="border border-gray-300 p-2 font-mono">{row.rawPiano1 || '—'}</td>
                    <td className="border border-gray-300 p-2 font-mono">
                      {row.piano1_x !== undefined ? 
                        `(${row.piano1_x.toFixed(3)}, ${row.piano1_y.toFixed(3)})` : '—'}
                    </td>
                    <td className="border border-gray-300 p-2 font-mono bg-green-50">
                      {row.piano1_norm_x !== undefined ? 
                        `(${row.piano1_norm_x.toFixed(3)}, ${row.piano1_norm_y.toFixed(3)})` : '—'}
                    </td>
                    <td className="border border-gray-300 p-2 text-xs">
                      {row.piano1_angle_analysis || '—'}
                    </td>
                    <td className="border border-gray-300 p-2 font-mono">{row.rawPiano2 || '—'}</td>
                    <td className="border border-gray-300 p-2 font-mono">
                      {row.piano2_x !== undefined ? 
                        `(${row.piano2_x.toFixed(3)}, ${row.piano2_y.toFixed(3)})` : '—'}
                    </td>
                    <td className="border border-gray-300 p-2 font-mono bg-green-50">
                      {row.piano2_norm_x !== undefined ? 
                        `(${row.piano2_norm_x.toFixed(3)}, ${row.piano2_norm_y.toFixed(3)})` : '—'}
                    </td>
                    <td className="border border-gray-300 p-2 text-xs">
                      {row.piano2_angle_analysis || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-4">Movement Summary</h3>
        <div className="space-y-4">
          {(() => {
            const meters = [
              { name: 'Pianterreno', dataKeys: ['pianterreno_x', 'pianterreno_y'], color: '#8884d8' },
              { name: 'Piano 1', dataKeys: ['piano1_x', 'piano1_y'], color: '#82ca9d' },
              { name: 'Piano 2', dataKeys: ['piano2_x', 'piano2_y'], color: '#ffc658' }
            ];

            let grandTotalDistance = 0;
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

              grandTotalDistance += totalDistance;

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
                        <div className="text-xs text-gray-600 mt-1">
                          <strong>Movement Interpretation:</strong><br/>
                          • Horizontal: {directDx > 0 ? `+${directDx.toFixed(3)}mm (crack expanding)` : 
                                        directDx < 0 ? `${directDx.toFixed(3)}mm (crack closing)` :
                                        '0.000mm (no horizontal change)'}<br/>
                          • Vertical: {directDy > 0 ? `+${directDy.toFixed(3)}mm (wall rising)` : 
                                      directDy < 0 ? `${directDy.toFixed(3)}mm (wall sinking)` :
                                      '0.000mm (no vertical change)'}
                        </div>
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
                            'Direct path movement'
                          }
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-700">Movement Pattern:</div>
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
                        <div className="font-medium text-gray-700">Weekly Rate:</div>
                        <div className="text-lg font-semibold" style={{ color: meter.color }}>
                          {weeklyMovement.toFixed(4)} mm/week
                        </div>
                        <div className="text-gray-500">
                          Direction: {directDx === 0 && directDy === 0 ? 'No movement' :
                                     directDx === 0 ? (directDy > 0 ? 'Wall rising' : 'Wall sinking') :
                                     directDy === 0 ? (directDx > 0 ? 'Crack expanding' : 'Crack closing') :
                                     `${directDx > 0 ? 'Expanding' : 'Closing'} & ${directDy > 0 ? 'Rising' : 'Sinking'}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
                totalDistance: totalDistance,
                meterName: meter.name,
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
                      <div className="font-medium text-blue-700 mb-2">Average Movement Rate:</div>
                      {(() => {
                        const activeMeters = meterResults.filter(r => r.totalDistance > 0);
                        
                        if (activeMeters.length === 0) {
                          return <div className="text-gray-500">No movement to analyze</div>;
                        }
                        
                        // Calculate average weekly movement across all active meters
                        let totalWeeklyMovement = 0;
                        let validMeters = 0;
                        
                        activeMeters.forEach(result => {
                          if (result.weeklyMovement !== undefined) {
                            totalWeeklyMovement += result.weeklyMovement;
                            validMeters++;
                          }
                        });
                        
                        const avgWeeklyMovement = validMeters > 0 ? totalWeeklyMovement / validMeters : 0;
                        
                        // Calculate average movement direction
                        let avgDirectionX = 0;
                        let avgDirectionY = 0;
                        let directionalMeters = 0;
                        
                        activeMeters.forEach(result => {
                          if (result.weeklyMovement !== undefined && result.weeklyMovement > 0) {
                            avgDirectionX += result.movementDirectionX;
                            avgDirectionY += result.movementDirectionY;
                            directionalMeters++;
                          }
                        });
                        
                        if (directionalMeters > 0) {
                          avgDirectionX /= directionalMeters;
                          avgDirectionY /= directionalMeters;
                        }
                        
                        return (
                          <div>
                            <div className="text-xl font-bold text-blue-600">
                              {avgWeeklyMovement.toFixed(4)} mm/week
                            </div>
                            <div className="text-sm text-blue-700">
                              Average across {validMeters} active meter{validMeters !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              Direction: {directionalMeters === 0 ? 'No net movement' :
                                         Math.abs(avgDirectionX) < 0.001 && Math.abs(avgDirectionY) < 0.001 ? 'No net movement' :
                                         Math.abs(avgDirectionX) < 0.001 ? (avgDirectionY > 0 ? 'Overall rising' : 'Overall sinking') :
                                         Math.abs(avgDirectionY) < 0.001 ? (avgDirectionX > 0 ? 'Overall expanding' : 'Overall closing') :
                                         `${avgDirectionX > 0 ? 'Expanding' : 'Closing'} & ${avgDirectionY > 0 ? 'Rising' : 'Sinking'}`}
                            </div>
                            <div className="text-xs text-blue-600">
                              {avgWeeklyMovement > 0.1 ? 'High activity rate' :
                               avgWeeklyMovement > 0.05 ? 'Moderate activity rate' :
                               avgWeeklyMovement > 0.01 ? 'Low activity rate' :
                               'Minimal activity rate'}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-blue-600">
                    Analysis based on direct displacement over monitoring period
                  </div>
                </div>
              </>
            );
          })()}
        </div>
        
        <p className="text-xs text-gray-600 mt-4">
          * Distances calculated using intersection method from boundary measurements [up, right, down, left]<br/>
          * Total path distance includes all intermediate movements, not just start-to-end displacement<br/>
          * All measurements in millimeters based on crack meter grid scale<br/>
          <br/>
          <strong>Structural Movement Interpretation:</strong><br/>
          • <strong>Horizontal movement:</strong> Left (−X) = crack closing, Right (+X) = crack expanding<br/>
          • <strong>Vertical movement:</strong> Down (−Y) = wall sinking, Up (+Y) = wall rising<br/>
          • <strong>Direct displacement</strong> shows net structural change from start to end position
        </p>
      </div>
    </div>
  );
};

export default CrackMovementVisualizer;