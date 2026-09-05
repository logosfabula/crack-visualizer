import React, { useState } from 'react';

export const activateOnKey = (fn) => (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
};

const TONE_CLASSES = {
  info: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
  warning: 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100'
};

// A collapsed-by-default info note: shows a compact label with an icon that
// signals both "there's more here" and "click to see it". Clicking it
// replaces it in place with the full content, styled as the box it always
// used to be — not appended below an unchanged trigger — and that box is
// itself clickable to collapse back to the compact label. Plain
// role="button" divs rather than real <button> elements, since some
// callers' content includes links, which can't legally nest inside one.
// `tone`: 'info' (default, blue) for neutral explanatory notes, 'warning'
// (orange) for alert-level content that still deserves the same
// collapse-in-place behavior without losing its severity color.
export const InfoDisclosure = ({ label, children, defaultOpen = false, tone = 'info', className = 'mb-4' }) => {
  const [open, setOpen] = useState(defaultOpen);
  const toneClasses = TONE_CLASSES[tone];

  if (open) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(false)}
        onKeyDown={activateOnKey(() => setOpen(false))}
        className={`${className} p-3 border rounded text-sm transition-colors cursor-pointer ${toneClasses}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setOpen(true)}
      onKeyDown={activateOnKey(() => setOpen(true))}
      className={`${className} inline-flex items-center gap-1.5 text-sm border rounded px-3 py-1.5 transition-colors w-fit cursor-pointer select-none ${toneClasses}`}
    >
      <span aria-hidden="true">ⓘ</span>
      <span className="font-medium">{label}</span>
      <span aria-hidden="true">›</span>
    </div>
  );
};
