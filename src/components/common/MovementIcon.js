import { ACTIVE_MOVEMENT_ICON_SET } from './icons';
import { H_STATE, V_STATE, hStateFromDir, vStateFromDir } from '../../constants/movementStates';
import { ETA_COMPONENTS } from '../../constants/regressionConfig';

// Renders whichever icon set is currently active (see components/common/
// icons/index.js) for a given trend direction. `component` restricts the
// icon to the axis actually being looked at: Horizontal-only forces the
// vertical state to "still" and Vertical-only forces horizontal to
// "still", so the icon never implies movement that isn't part of what's
// being projected for that entry — a horizontal-only ETA doesn't use the
// vertical trend at all, so showing it would be misleading.
export const MovementIcon = ({ dirX, dirY, component = ETA_COMPONENTS.COMBINED, size }) => {
  const hState = component === ETA_COMPONENTS.VERTICAL ? H_STATE.STILL : hStateFromDir(dirX);
  const vState = component === ETA_COMPONENTS.HORIZONTAL ? V_STATE.STILL : vStateFromDir(dirY);
  return ACTIVE_MOVEMENT_ICON_SET.resolve(hState, vState, { size });
};
