// Floor-specific interpretation configuration
export const FLOOR_INTERPRETATIONS = {
  pianterreno: {
    needsInversion: true,  // P0 needs inversion to match P1
    name: 'Pianterreno',
    interpretation: 'Inverted'
  },
  piano1: {
    needsInversion: false, // P1 is the standard
    name: 'Piano 1', 
    interpretation: 'Standard'
  },
  piano2: {
    needsInversion: true,  // P2 needs inversion to match P1
    name: 'Piano 2',
    interpretation: 'Inverted'
  }
};