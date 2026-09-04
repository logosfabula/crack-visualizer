import React, { useState } from 'react';

const activateOnKey = (fn) => (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
};

// A collapsed-by-default info note: shows a compact label with an icon that
// signals both "there's more here" and "click to see it". Clicking it
// replaces it in place with the full content, styled as the box it always
// used to be — not appended below an unchanged trigger — and that box is
// itself clickable to collapse back to the compact label. Plain
// role="button" divs rather than real <button> elements, since some
// callers' content includes links, which can't legally nest inside one.
export const InfoDisclosure = ({ label, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  if (open) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(false)}
        onKeyDown={activateOnKey(() => setOpen(false))}
        className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
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
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded px-3 py-1.5 hover:bg-blue-100 transition-colors w-fit cursor-pointer select-none"
    >
      <span aria-hidden="true">ⓘ</span>
      <span className="font-medium">{label}</span>
      <span aria-hidden="true">›</span>
    </div>
  );
};
