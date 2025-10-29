import { METER_BOUNDARIES } from '../../constants/boundaries';

export class AngleAnalyzer {
  static analyzeQuadrantAngles(reading) {
    if (!reading) return null;

    const [up, right, down, left] = reading.split(';').map(v => parseFloat(v));
    
    // Physical crack meter boundaries (in millimeters)
    const { X_MIN: METER_X_MIN, X_MAX: METER_X_MAX, 
          Y_MIN: METER_Y_MIN, Y_MAX: METER_Y_MAX } = METER_BOUNDARIES;
    
    // Line endpoints in physical coordinates (mm)
    const topPoint = { x: up, y: METER_Y_MIN };
    const bottomPoint = { x: down, y: METER_Y_MAX };
    const leftPoint = { x: METER_X_MIN, y: left };
    const rightPoint = { x: METER_X_MAX, y: right };
    
    // Calculate angles of both lines
    let verticalLineAngle, horizontalLineAngle;
    
    if (Math.abs(bottomPoint.x - topPoint.x) < 1e-10) {
      verticalLineAngle = 90; // Truly vertical
    } else {
      const verticalSlope = (bottomPoint.y - topPoint.y) / (bottomPoint.x - topPoint.x);
      verticalLineAngle = Math.atan(verticalSlope) * 180 / Math.PI;
    }
    
    if (Math.abs(rightPoint.y - leftPoint.y) < 1e-10) {
      horizontalLineAngle = 0; // Truly horizontal
    } else {
      const horizontalSlope = (rightPoint.y - leftPoint.y) / (rightPoint.x - leftPoint.x);
      horizontalLineAngle = Math.atan(horizontalSlope) * 180 / Math.PI;
    }
    
    // Calculate angle between lines
    let angleBetween = Math.abs(verticalLineAngle - horizontalLineAngle);
    if (angleBetween > 90) angleBetween = 180 - angleBetween;
    
    const deviation = Math.abs(90 - angleBetween);
    
    if (deviation < 0.01) {
      return {
        deviation: 0,
        description: "Perfect 90°"
      };
    }
    
    // Determine which quadrants are wider/narrower
    let widerQuadrants, narrowerQuadrants;
    
    if (angleBetween < 90) {
      widerQuadrants = "NW & SE";
      narrowerQuadrants = "NE & SW";
    } else {
      widerQuadrants = "NE & SW";
      narrowerQuadrants = "NW & SE";
    }
    
    const widerAngle = 90 + deviation;
    const narrowerAngle = 90 - deviation;
    
    return {
      deviation: deviation,
      widerQuadrants: widerQuadrants,
      narrowerQuadrants: narrowerQuadrants,
      widerAngle: widerAngle,
      narrowerAngle: narrowerAngle,
      description: `${widerQuadrants}: ${widerAngle.toFixed(2)}°, ${narrowerQuadrants}: ${narrowerAngle.toFixed(2)}°`
    };
  }
}