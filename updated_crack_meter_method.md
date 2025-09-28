# Crack Meter Analysis Method

## Overview
This method converts crack meter readings (4 boundary measurements) into precise crack position and orientation data, with floor-specific interpretations for structural movement analysis.

## Input Data Format
Each measurement consists of 4 values: `[up, right, down, left]`

**Example**: `[-2, +1, 0, +3]`

## Coordinate System & Measurement Mapping

### Grid Layout
- **Grid center**: (0, 0)
- **X-axis**: Horizontal (left ← → right movements, determined by "up" and "down" readings)
- **Y-axis**: Vertical (down ↓ ↑ up movements, determined by "left" and "right" readings)

### How Boundary Measurements Map to Coordinates

The crack meter readings `[up, right, down, left]` represent where the crack intersects the **boundaries** of the measurement grid:

**Horizontal Position (X-coordinate)** - Determined by `up` and `down` values:
- `up`: Where crack intersects the **top boundary** (horizontal position)
- `down`: Where crack intersects the **bottom boundary** (horizontal position)
- **Positive values** = right of center line
- **Negative values** = left of center line

**Vertical Position (Y-coordinate)** - Determined by `left` and `right` values:
- `left`: Where crack intersects the **left boundary** (vertical position)
- `right`: Where crack intersects the **right boundary** (vertical position)  
- **Positive values** = below center line
- **Negative values** = above center line

### Visual Example
```
Grid Boundaries:           Measurement Values:
                          up = -1 (left of center)
    -2  -1   0  +1  +2    
-2  ┌───●───┼───┬───┐     left = +1 (below center)
-1  ├───┼───┼───┼───┤  ←  
 0  ├───┼───┼───┼───●     · = crack intersection at (-0.5, +0.5)
+1  ●───┼─˙─┼───┼───┤  ←  
+2  └───┴───●───┴───┘     right = 0 (on center)
                          
                          down = 0 (on center)
```

### Key Insight
- **Up/Down measurements** → **Horizontal (X) position** of crack intersection
- **Left/Right measurements** → **Vertical (Y) position** of crack intersection

This mapping may seem counterintuitive, but it reflects how the crack's orientation determines where it intersects each boundary of the measurement grid.

## Floor-Specific Movement Interpretations

The same coordinate changes represent different physical movements depending on the floor level due to different meter orientations or installation setups:

### Piano 1 (P1) - Standard Interpretation
- **Horizontal Movement (X-axis):**
  - **Negative X** = crack closing (wall segments moving toward each other)
  - **Positive X** = crack expanding (wall segments separating)
- **Vertical Movement (Y-axis):**
  - **Negative Y** = wall sinking (downward movement)
  - **Positive Y** = wall rising (upward movement)

### Pianterreno (P0) & Piano 2 (P2) - Inverted Interpretation
- **Horizontal Movement (X-axis):**
  - **Negative X** = crack expanding (wall segments separating)
  - **Positive X** = crack closing (wall segments moving toward each other)
- **Vertical Movement (Y-axis):**
  - **Negative Y** = wall rising (upward movement)
  - **Positive Y** = wall sinking (downward movement)

## Step-by-Step Method

### Step 1: Define Grid Parameters
```javascript
const gridWidth = 400;    // pixels
const gridHeight = 300;   // pixels
const centerX = 200;      // pixels (grid center X)
const centerY = 150;      // pixels (grid center Y)
const scaleX = 20;        // pixels per unit (horizontal)
const scaleY = 15;        // pixels per unit (vertical)
```

### Step 2: Convert Measurements to Line Endpoints

**Vertical Line** (intersects top and bottom boundaries):
- Top intersection: x = `up` value
- Bottom intersection: x = `down` value

**Horizontal Line** (intersects left and right boundaries):
- Left intersection: y = `left` value  
- Right intersection: y = `right` value

### Step 3: Calculate Pixel Coordinates

For measurement `[-2, +1, 0, +3]`:

**Vertical Line Points:**
- Top: (centerX + up×scaleX, 0) = (200 + (-2)×20, 0) = **(160px, 0px)**
- Bottom: (centerX + down×scaleX, gridHeight) = (200 + 0×20, 300) = **(200px, 300px)**

**Horizontal Line Points:**
- Left: (0, centerY + left×scaleY) = (0, 150 + 3×15) = **(0px, 195px)**
- Right: (gridWidth, centerY + right×scaleY) = (400, 150 + 1×15) = **(400px, 165px)**

### Step 4: Calculate Line Equations

**Vertical Line**: y = m₁x + b₁
```javascript
const m1 = (300 - 0) / (200 - 160) = 300/40 = 7.5
const b1 = 0 - 7.5 × 160 = -1200
// Equation: y = 7.5x - 1200
```

**Horizontal Line**: y = m₂x + b₂
```javascript
const m2 = (165 - 195) / (400 - 0) = -30/400 = -0.075
const b2 = 195 - (-0.075) × 0 = 195
// Equation: y = -0.075x + 195
```

### Step 5: Find Intersection Point

Set equations equal: `7.5x - 1200 = -0.075x + 195`

Solve for x:
```javascript
7.5x + 0.075x = 195 + 1200
7.575x = 1395
x = 184.2 pixels
```

Solve for y:
```javascript
y = 7.5 × 184.2 - 1200 = 181.2 pixels
```

**Intersection Point (pixels)**: (184.2, 181.2)

### Step 6: Convert to Grid Coordinates

```javascript
const gridX = (184.2 - 200) / 20 = -0.792
const gridY = (150 - 181.2) / 15 = -2.079
```

**Final Result**: **(-0.792, -2.079)** in grid coordinates

## Implementation Formula

For any measurement `[up, right, down, left]`:

1. **Line endpoints**:
   - Vertical: (centerX + up×scaleX, 0) to (centerX + down×scaleX, gridHeight)
   - Horizontal: (0, centerY + left×scaleY) to (gridWidth, centerY + right×scaleY)

2. **Intersection calculation**:
   ```javascript
   // Slopes
   m1 = gridHeight / ((down - up) × scaleX)
   m2 = -(right - left) × scaleY / gridWidth
   
   // Y-intercepts
   b1 = -m1 × (centerX + up × scaleX)
   b2 = centerY + left × scaleY
   
   // Intersection
   x = (b2 - b1) / (m1 - m2)
   y = m1 × x + b1
   
   // Grid coordinates
   gridX = (x - centerX) / scaleX
   gridY = (centerY - y) / scaleY
   ```

## Floor-Specific Movement Analysis Examples

### Example: Coordinate Change (+0.5, -0.3)

**Piano 1 (P1) Interpretation:**
- Horizontal: +0.5mm = crack expanding
- Vertical: -0.3mm = wall sinking
- **Summary**: "Crack expanding and wall sinking"

**Pianterreno (P0) & Piano 2 (P2) Interpretation:**
- Horizontal: +0.5mm = crack closing
- Vertical: -0.3mm = wall rising  
- **Summary**: "Crack closing and wall rising"

### Movement Significance Thresholds
- **< 0.1mm**: Minimal movement (measurement precision)
- **0.1-0.5mm**: Small but detectable movement
- **0.5-1.0mm**: Moderate movement (monitor closely)
- **> 1.0mm**: Significant movement (requires attention)

## Output Data
- **Position**: (gridX, gridY) - crack center location
- **Floor-specific interpretation**: Physical meaning based on floor level
- **Movement tracking**: Compare positions over time with proper interpretation
- **Rate analysis**: Movement velocity and acceleration trends

## Applications
- **Multi-floor monitoring**: Track crack movement with floor-appropriate interpretations
- **Structural assessment**: Understand different movement patterns per floor
- **Alert systems**: Set floor-specific thresholds for critical movements
- **Comparative analysis**: Compare movement patterns between floors while accounting for interpretation differences

## Important Notes
- Always specify the floor level when reporting results
- Use floor-specific interpretation functions in analysis software
- Coordinate values are mathematically consistent; only the physical interpretation changes
- Movement trends should be analyzed within the context of each floor's interpretation system
