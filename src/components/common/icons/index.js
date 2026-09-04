import { svgIconSet } from './movementIconSets/svgIconSet';

// The whole app's movement icons come from whichever set is exported here —
// MovementIcon.js is the only consumer, and it never imports a specific set
// directly. To swap in a different set (e.g. a GIF or PNG sprite per
// state instead of hand-drawn SVG), add a new file under movementIconSets/
// exporting an object shaped like { id, resolve(hState, vState, opts) },
// where resolve returns whatever ReactNode should render for that state
// (an <img src="..." /> works as well as a component) — then point this
// export at it. Nothing outside this file needs to change.
export const ACTIVE_MOVEMENT_ICON_SET = svgIconSet;
