import React, { useState } from 'react';

const FULL_SIZE = 270;
const HALF_SIZE = FULL_SIZE / 2;

// Wraps a figure in a click/tap target that toggles it between full size
// and half size. Uncontrolled by default (manages its own state), so a
// standalone figure resizes independently; pass `shrunk` + `onToggle` to
// control it externally instead, so several figures can share one state
// and resize together as a group.
export const ResizableFigure = ({ children, label, shrunk, onToggle }) => {
  const [internalShrunk, setInternalShrunk] = useState(false);
  const isControlled = shrunk !== undefined;
  const isShrunk = isControlled ? shrunk : internalShrunk;
  const toggle = isControlled ? onToggle : () => setInternalShrunk(v => !v);

  return (
    <button
      type="button"
      onClick={toggle}
      className="block bg-transparent border-0 p-0 cursor-pointer"
      style={{ maxWidth: isShrunk ? `${HALF_SIZE}px` : `${FULL_SIZE}px`, transition: 'max-width 150ms ease' }}
      title={isShrunk ? 'Click to enlarge' : 'Click to shrink'}
      aria-label={`${isShrunk ? 'Enlarge' : 'Shrink'}${label ? ` ${label}` : ''} figure`}
    >
      {children}
    </button>
  );
};
