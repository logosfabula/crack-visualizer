import { ACTIVE_MOVEMENT_ICON_SET } from './icons';
import { hStateFromDir, vStateFromDir } from '../../constants/movementStates';

// Renders whichever icon set is currently active (see components/common/
// icons/index.js) for a given trend direction.
export const MovementIcon = ({ dirX, dirY, size }) => {
  const hState = hStateFromDir(dirX);
  const vState = vStateFromDir(dirY);
  return ACTIVE_MOVEMENT_ICON_SET.resolve(hState, vState, { size });
};
