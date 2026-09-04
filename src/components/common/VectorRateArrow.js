import React from 'react';

// Colors are keyed by axis dominance, not by floor — the same color always
// means "horizontal is the stronger driver" wherever it appears, so it
// carries meaning across floors instead of just identifying which floor a
// figure belongs to.
export const RATE_ARROW_COLORS = {
  horizontal: '#2b5b84',
  vertical: '#a8722c',
  neutral: '#9ca3af'
};

const VB = 200;
const CENTER = VB / 2;
const ARM = 74;

const dominantColor = (h, v) => {
  if (h === 0 && v === 0) return RATE_ARROW_COLORS.neutral;
  return Math.abs(h) >= Math.abs(v) ? RATE_ARROW_COLORS.horizontal : RATE_ARROW_COLORS.vertical;
};

// A floor's horizontal vs. vertical rate as a single arrow from the
// origin, angled to the actual H/V ratio and colored by whichever axis
// currently has the larger magnitude — angle and length read the
// comparison in one glance instead of comparing two separate bars.
// `scaleMax` fixes the axis extent (mm/week) and must be the same value
// passed to every other VectorRateArrow on the page, so a given rate
// always renders at the same length wherever it's shown.
export const VectorRateArrow = ({ horizontalRate, verticalRate, scaleMax, id }) => {
  const toPx = (v) => (v / scaleMax) * ARM;
  const flat = horizontalRate === 0 && verticalRate === 0;
  const color = dominantColor(horizontalRate, verticalRate);
  const x = CENTER + toPx(horizontalRate);
  const y = CENTER - toPx(verticalRate);
  // url(#id) breaks if id contains anything but a handful of safe
  // characters (a space in a floor name like "Piano 1" is enough to make
  // the marker fail to resolve, silently dropping the arrowhead) — sanitize
  // rather than trust callers to pass an already-safe id.
  const markerId = `rate-arrowhead-${String(id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full h-auto">
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={color} />
        </marker>
      </defs>
      <line x1={CENTER - ARM - 6} y1={CENTER} x2={CENTER + ARM + 6} y2={CENTER} stroke="#e5e7eb" strokeWidth="1" />
      <line x1={CENTER} y1={CENTER - ARM - 6} x2={CENTER} y2={CENTER + ARM + 6} stroke="#e5e7eb" strokeWidth="1" />
      <text x={CENTER + ARM + 9} y={CENTER + 3} fontSize="9" fill="#6b7280">H</text>
      <text x={CENTER - 5} y={CENTER - ARM - 10} textAnchor="middle" fontSize="9" fill="#6b7280">V</text>
      <text x={CENTER + ARM - 2} y={CENTER + 12} textAnchor="end" fontSize="8.5" fill="#9ca3af">
        +{scaleMax.toFixed(4)}
      </text>
      <text x={CENTER - ARM + 2} y={CENTER + 12} fontSize="8.5" fill="#9ca3af">
        −{scaleMax.toFixed(4)}
      </text>
      {flat ? (
        <circle cx={CENTER} cy={CENTER} r="4" fill="none" stroke={color} strokeWidth="1.5" />
      ) : (
        <line
          x1={CENTER}
          y1={CENTER}
          x2={x}
          y2={y}
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          markerEnd={`url(#${markerId})`}
        />
      )}
    </svg>
  );
};
