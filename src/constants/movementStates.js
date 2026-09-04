// The 3×3 space every floor's movement falls into: 3 horizontal outcomes ×
// 3 vertical outcomes. Icon sets are keyed by these states, not by raw
// numbers, so a state derived once here is the single source of truth for
// both the icon lookup and the existing "Overall Movement Direction" text.
export const H_STATE = { CLOSING: 'closing', STILL: 'still', EXPANDING: 'expanding' };
export const V_STATE = { RISING: 'rising', STILL: 'still', SINKING: 'sinking' };

export const hStateFromDir = (dirX) => (
  dirX > 0 ? H_STATE.EXPANDING : dirX < 0 ? H_STATE.CLOSING : H_STATE.STILL
);

export const vStateFromDir = (dirY) => (
  dirY > 0 ? V_STATE.RISING : dirY < 0 ? V_STATE.SINKING : V_STATE.STILL
);

export const movementStateKey = (hState, vState) => `${hState}-${vState}`;

export const ALL_MOVEMENT_STATE_KEYS = Object.values(H_STATE).flatMap(h =>
  Object.values(V_STATE).map(v => movementStateKey(h, v))
);

const H_WORDS = { [H_STATE.EXPANDING]: 'Expanding', [H_STATE.CLOSING]: 'Closing' };
const V_WORDS = { [V_STATE.RISING]: 'Rising', [V_STATE.SINKING]: 'Sinking' };
const H_ARROWS = { [H_STATE.EXPANDING]: '→', [H_STATE.CLOSING]: '←' };
const V_ARROWS = { [V_STATE.RISING]: '↑', [V_STATE.SINKING]: '↓' };

// Matches the wording already used by "Overall Movement Direction" in
// CrackMovementVisualizer, so an icon and its caption always agree.
export const movementCaption = (hState, vState) => {
  if (hState === H_STATE.STILL && vState === V_STATE.STILL) return 'No movement detected';
  if (hState === H_STATE.STILL) return `${V_ARROWS[vState]} Wall ${V_WORDS[vState]}`;
  if (vState === V_STATE.STILL) return `${H_ARROWS[hState]} Crack ${H_WORDS[hState]}`;
  return `${H_ARROWS[hState]} ${H_WORDS[hState]} & ${V_ARROWS[vState]} ${V_WORDS[vState]}`;
};
