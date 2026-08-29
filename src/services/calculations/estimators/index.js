import { TheilSenEstimator } from './TheilSenEstimator';
import { SecantEstimator } from './SecantEstimator';

// Registry of selectable ETA methods, keyed by id. To add another method
// (e.g. a future a-priori-weighted model), implement the same interface
// (.compute({ readings, tNow, thresholds }), .describe(...), .methodology,
// .label) and add it here — nothing else needs to change.
export const ETA_ESTIMATORS = {
  [TheilSenEstimator.id]: TheilSenEstimator,
  [SecantEstimator.id]: SecantEstimator
};

export const DEFAULT_ETA_METHOD = TheilSenEstimator.id;
