import React from 'react';
import { H_STATE, V_STATE } from '../../../../constants/movementStates';

// Gap between the two wall blocks (horizontal cue) and vertical offset of
// the right block relative to the left (vertical cue), in local SVG units.
const GAP = { [H_STATE.CLOSING]: 4, [H_STATE.STILL]: 11, [H_STATE.EXPANDING]: 19 };
const OFFSET = { [V_STATE.SINKING]: 8, [V_STATE.STILL]: 0, [V_STATE.RISING]: -8 };

const COLOR_H = '#2b5b84';
const COLOR_V = '#a8722c';
const WALL_FILL = '#c7ccd1';
const WALL_STROKE = '#8b939a';

const VB = 56;
const CENTER = VB / 2;
const WALL_W = 9;
const WALL_H = 26;

const SvgMovementGlyph = ({ hState, vState, size = 32 }) => {
  const gap = GAP[hState];
  const offset = OFFSET[vState];

  const leftX = CENTER - gap / 2 - WALL_W;
  const leftY = CENTER - WALL_H / 2;
  const rightX = CENTER + gap / 2;
  const rightY = CENTER - WALL_H / 2 + offset;

  let hCue = null;
  if (hState !== H_STATE.STILL) {
    const inward = hState === H_STATE.CLOSING;
    const midY = CENTER;
    hCue = inward ? (
      <>
        <path d={`M ${CENTER - 2} ${midY - 5} L ${CENTER - 7} ${midY} L ${CENTER - 2} ${midY + 5}`} fill="none" stroke={COLOR_H} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M ${CENTER + 2} ${midY - 5} L ${CENTER + 7} ${midY} L ${CENTER + 2} ${midY + 5}`} fill="none" stroke={COLOR_H} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <>
        <path d={`M ${CENTER - 7} ${midY - 5} L ${CENTER - 2} ${midY} L ${CENTER - 7} ${midY + 5}`} fill="none" stroke={COLOR_H} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M ${CENTER + 7} ${midY - 5} L ${CENTER + 2} ${midY} L ${CENTER + 7} ${midY + 5}`} fill="none" stroke={COLOR_H} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
  }

  let vCue = null;
  if (vState !== V_STATE.STILL) {
    const up = vState === V_STATE.RISING;
    const chevY = up ? leftY - 9 : leftY + WALL_H + 9;
    const chevX = rightX + WALL_W / 2;
    vCue = up ? (
      <path d={`M ${chevX - 5} ${chevY + 4} L ${chevX} ${chevY - 2} L ${chevX + 5} ${chevY + 4}`} fill="none" stroke={COLOR_V} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d={`M ${chevX - 5} ${chevY - 4} L ${chevX} ${chevY + 2} L ${chevX + 5} ${chevY - 4}`} fill="none" stroke={COLOR_V} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    );
  }

  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} width={size} height={size} aria-hidden="true">
      <rect x={leftX} y={leftY} width={WALL_W} height={WALL_H} rx="1.5" fill={WALL_FILL} stroke={WALL_STROKE} strokeWidth="1" />
      <rect x={rightX} y={rightY} width={WALL_W} height={WALL_H} rx="1.5" fill={WALL_FILL} stroke={WALL_STROKE} strokeWidth="1" />
      {hCue}
      {vCue}
    </svg>
  );
};

// Icon-set contract: resolve(hState, vState, opts) => ReactNode. Any future
// set (a GIF/PNG sprite sheet, emoji, etc.) just needs to implement this
// same function shape — see src/components/common/icons/index.js for how
// a set is wired in, and MovementIcon.js for the only consumer.
export const svgIconSet = {
  id: 'svg',
  resolve: (hState, vState, opts = {}) => (
    <SvgMovementGlyph hState={hState} vState={vState} size={opts.size} />
  )
};
