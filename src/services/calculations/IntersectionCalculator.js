import { METER_BOUNDARIES } from '../../constants/boundaries';

export class IntersectionCalculator {
  static calculate(reading) {    
    if (!reading) return null;
    
    const [up, right, down, left] = reading.split(';').map(v => parseFloat(v));
    
    // Physical crack meter boundaries (in millimeters)
    const { X_MIN: METER_X_MIN, X_MAX: METER_X_MAX, 
          Y_MIN: METER_Y_MIN, Y_MAX: METER_Y_MAX } = METER_BOUNDARIES;
    
    // Line endpoints in physical coordinates (mm)
    // Vertical line: connects top and bottom boundaries
    const topPoint = { x: up, y: METER_Y_MIN };      // (up, -10)
    const bottomPoint = { x: down, y: METER_Y_MAX };  // (down, +10)
    
    // Horizontal line: connects left and right boundaries
    const leftPoint = { x: METER_X_MIN, y: left };    // (-20, left)
    const rightPoint = { x: METER_X_MAX, y: right };  // (+20, right)
    
    // Handle special case: truly vertical line (up === down)
    if (Math.abs(topPoint.x - bottomPoint.x) < 1e-10) {
      // Vertical line at x = topPoint.x
      const verticalX = topPoint.x;
      
      // Find where horizontal line intersects this vertical line
      // Horizontal line equation: interpolate between left and right points
      const horizontalSlope = (rightPoint.y - leftPoint.y) / (METER_X_MAX - METER_X_MIN);
      const intersectionY = leftPoint.y + horizontalSlope * (verticalX - METER_X_MIN);
      
      return { x: verticalX, y: intersectionY };
    }
    
    // Handle special case: truly horizontal line (left === right)
    if (Math.abs(leftPoint.y - rightPoint.y) < 1e-10) {
      // Horizontal line at y = leftPoint.y
      const horizontalY = leftPoint.y;
      
      // Find where vertical line intersects this horizontal line
      // Vertical line equation: interpolate between top and bottom points
      const verticalSlope = (bottomPoint.x - topPoint.x) / (METER_Y_MAX - METER_Y_MIN);
      const intersectionX = topPoint.x + verticalSlope * (horizontalY - METER_Y_MIN);
      
      return { x: intersectionX, y: horizontalY };
    }
    
    // Normal case: both lines have slopes
    // Vertical line: from (up, -10) to (down, +10)
    const m1 = (bottomPoint.y - topPoint.y) / (bottomPoint.x - topPoint.x);
    const b1 = topPoint.y - m1 * topPoint.x;
    
    // Horizontal line: from (-20, left) to (+20, right)
    const m2 = (rightPoint.y - leftPoint.y) / (rightPoint.x - leftPoint.x);
    const b2 = leftPoint.y - m2 * leftPoint.x;
    
    // Check for parallel lines
    if (Math.abs(m1 - m2) < 1e-10) {
      return null; // Lines are parallel
    }
    
    // Find intersection: m1*x + b1 = m2*x + b2
    const intersectionX = (b2 - b1) / (m1 - m2);
    const intersectionY = m1 * intersectionX + b1;
    
    // Return in millimeters (physical coordinates)
    return { x: intersectionX, y: intersectionY };
  }
}