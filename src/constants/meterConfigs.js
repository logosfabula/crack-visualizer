// Meter configurations
export const METER_CONFIGS = {
  pianterreno: { 
    name: 'Pianterreno',
    displayName: 'Pianterreno',
    color: '#8884d8',
    rawDataKeys: ['pianterreno_x', 'pianterreno_y'],
    normDataKeys: ['pianterreno_norm_x', 'pianterreno_norm_y']
  },
  piano1: { 
    name: 'Piano 1',
    displayName: 'Piano 1',
    color: '#82ca9d',
    rawDataKeys: ['piano1_x', 'piano1_y'],
    normDataKeys: ['piano1_norm_x', 'piano1_norm_y']
  },
  piano2: { 
    name: 'Piano 2',
    displayName: 'Piano 2',
    color: '#ffc658',
    rawDataKeys: ['piano2_x', 'piano2_y'],
    normDataKeys: ['piano2_norm_x', 'piano2_norm_y']
  }
};