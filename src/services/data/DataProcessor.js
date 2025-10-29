import { IntersectionCalculator } from '../calculations/IntersectionCalculator';
import { AngleAnalyzer } from '../calculations/AngleAnalyzer';
import { FLOOR_INTERPRETATIONS } from '../../constants/floorInterpretations';

export class DataProcessor {
  static process(rawData) {
    // First pass: calculate raw positions and angles
    const rawProcessed = rawData.map(entry => {
      const result = {
        date: entry.date,
        dateObj: new Date(entry.date),
        rawPianterreno: entry.Pianterreno,
        rawPiano1: entry['Piano 1'],
        rawPiano2: entry['Piano 2']
      };
      
      // Calculate intersection points and quadrant angle analysis
      const pianoterrenoPos = IntersectionCalculator.calculate(entry.Pianterreno);
      const piano1Pos = IntersectionCalculator.calculate(entry['Piano 1']);
      const piano2Pos = IntersectionCalculator.calculate(entry['Piano 2']);
      
      const pianoterrenoAngles = AngleAnalyzer.analyzeQuadrantAngles(entry.Pianterreno);
      const piano1Angles = AngleAnalyzer.analyzeQuadrantAngles(entry['Piano 1']);
      const piano2Angles = AngleAnalyzer.analyzeQuadrantAngles(entry['Piano 2']);
      
      if (pianoterrenoPos) {
        result.pianterreno_x = pianoterrenoPos.x;
        result.pianterreno_y = pianoterrenoPos.y;
        result.pianterreno_angle_analysis = pianoterrenoAngles?.description || '—';
      }
      if (piano1Pos) {
        result.piano1_x = piano1Pos.x;
        result.piano1_y = piano1Pos.y;
        result.piano1_angle_analysis = piano1Angles?.description || '—';
      }
      if (piano2Pos) {
        result.piano2_x = piano2Pos.x;
        result.piano2_y = piano2Pos.y;
        result.piano2_angle_analysis = piano2Angles?.description || '—';
      }
      
      return result;
    });
    
    // Second pass: calculate normalized coordinates
    const normalizedData = this.normalizeData(rawProcessed);
    
    return normalizedData;
  }
  
  static normalizeData(rawProcessed) {
    const normalizedData = rawProcessed.map(entry => ({ ...entry }));
    
    // Find first reading for each meter and calculate normalized positions
    const meters = ['pianterreno', 'piano1', 'piano2'];
    
    meters.forEach(meter => {
      const meterData = normalizedData.filter(d => d[`${meter}_x`] !== undefined);
      
      if (meterData.length > 0) {
        // Sort by date to find the oldest reading
        meterData.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const firstReading = meterData[0];
        const originX = firstReading[`${meter}_x`];
        const originY = firstReading[`${meter}_y`];
        
        // Calculate normalized coordinates for all readings of this meter
        normalizedData.forEach(entry => {
          if (entry[`${meter}_x`] !== undefined && entry[`${meter}_y`] !== undefined) {
            // Calculate relative position from first reading
            let normX = entry[`${meter}_x`] - originX;
            let normY = entry[`${meter}_y`] - originY;
            
            // Apply floor-specific inversion to match P1 interpretation
            if (FLOOR_INTERPRETATIONS[meter].needsInversion) {
              normX = -normX;
              normY = -normY;
            }
            
            entry[`${meter}_norm_x`] = normX;
            entry[`${meter}_norm_y`] = normY;
          }
        });
      }
    });
    
    return normalizedData;
  }
}