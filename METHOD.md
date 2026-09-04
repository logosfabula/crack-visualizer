# Crack Meter Analysis Method

## Overview
This method converts crack meter readings (4 boundary measurements) into precise crack position and orientation data, normalizes them with a floor-specific parameter (orientation), and provides interpretations for structural movement analysis.

## Input Data Format
Each measurement consists of 4 values: `[up, right, down, left]`

**Example**: `[-2, +1, 0, +3]`

## Coordinate System & Measurement Mapping

### Grid Layout
- **Grid center**: (0, 0)
- **X-axis**: Horizontal (left ← → right movements, determined by "up" and "down" readings)
- **Y-axis**: Vertical (down ↓ ↑ up movements, determined by "left" and "right" readings)

### How Boundary Measurements Map to Coordinates

The crack meter readings `[up, right, down, left]` represent where the red cross intersects the **boundaries** of the measurement grid:

**Horizontal Position (X-coordinate)** - Determined by `up` and `down` values:
- `up`: Where red cross intersects the **top boundary** (horizontal position)
- `down`: Where red cross intersects the **bottom boundary** (horizontal position)
- **Positive values** = right of center line
- **Negative values** = left of center line

**Vertical Position (Y-coordinate)** - Determined by `left` and `right` values:
- `left`: Where red cross intersects the **left boundary** (vertical position)
- `right`: Where red cross intersects the **right boundary** (vertical position)  
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
- **Up/Down measurements** → **Horizontal (X) position** of red cross intersection (center)
- **Left/Right measurements** → **Vertical (Y) position** of red cross intersection (center)

This mapping may seem counterintuitive, but it reflects how the crack's orientation determines where the red cross intersects each boundary of the measurement grid.

## Floor-Specific Movement Interpretations

The same raw coordinate changes represent different physical movements depending on the floor level due to different meter orientations or installation setups:

### Piano 1 (P1) - Standard Interpretation for this application
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

However, all the physical interpretations are standard, because the inverted crack meters data are normalized before being interpreted. 

## Normalization

Normalization consists of two different transformations of the raw readings

### Shifting 
- **Oldest reading** will be transformed to **(0,0) coordinates**
- **Difference** between the oldest reading and (0,0) will be applied to **all the same floor's other readings**
- In case the oldest reading is (0,0), reading's raw data will correspond to normalized data (if no flipping is due)

### Flipping
- **X and Y values will be flipped**, becoming positive when negative and viceversa, if the floor's crack meter is **marked as inverse**
- in case the reading's floor is marked as standard, reading's raw data will correspond to normalized data (if no shifting is due)

**If a floor's oldest reading is (0,0) and the floor's crack meter is marked as standard (non-inverse), the floor's normalized readings are the same as the floor's raw readings. Installing crack-meters to comply to both (so as to avoid translation and reflection of the grid) is advised, but not mandatory, for the software applies normalization to your convenience.**

## Step-by-Step Method

### Step 1: Define Physical Crack Meter Boundaries

The crack meter operates in a physical coordinate system measured in millimeters:
```javascript
// Physical crack meter boundaries (in millimeters)
const METER_X_MIN = -20;  // Left boundary
const METER_X_MAX = 20;   // Right boundary (40mm total width)
const METER_Y_MIN = -10;  // Top boundary
const METER_Y_MAX = 10;   // Bottom boundary (20mm total height)
```

### Step 2: Convert Measurements to Line Endpoints

Given a measurement `[up, right, down, left]`, create two lines in physical coordinate space:

**Vertical Line** (connects top and bottom boundaries):
```javascript
const topPoint = { x: up, y: METER_Y_MIN };      // (up, -10)
const bottomPoint = { x: down, y: METER_Y_MAX };  // (down, +10)
```

- The vertical line runs from the top boundary to the bottom boundary
- `up` and `down` values determine the **horizontal (x)** position at each boundary

**Horizontal Line** (connects left and right boundaries):
```javascript
const leftPoint = { x: METER_X_MIN, y: left };    // (-20, left)
const rightPoint = { x: METER_X_MAX, y: right };  // (+20, right)
```

- The horizontal line runs from the left boundary to the right boundary
- `left` and `right` values determine the **vertical (y)** position at each boundary

### Step 3: Work with Physical Coordinates

Using the measurement `[-2, +1, 0, +3]` as an example, we have:

**Vertical Line Endpoints** (in millimeters):
- Top: `(-2, -10)` 
- Bottom: `(0, +10)`

**Horizontal Line Endpoints** (in millimeters):
- Left: `(-20, +3)`
- Right: `(+20, +1)`

**Note:** At this stage, all coordinates remain in millimeters. The intersection point will also be calculated in millimeters. Pixel conversion for visualization happens separately during SVG rendering using transformation functions:
```javascript
// Visualization only (not part of calculation)
const toSVGX = (x_mm) => 400 + x_mm * 266.67;  // Maps mm to pixels
const toSVGY = (y_mm) => 300 + y_mm * 200;     // Maps mm to pixels
```
### Step 4: Calculate Line Equations

For the measurement `[-2, +1, 0, +3]`, we have:
- Vertical line: from `(-2, -10)` to `(0, +10)`
- Horizontal line: from `(-20, +3)` to `(+20, +1)`

**Vertical Line**: y = m₁x + b₁
```javascript
const m1 = (bottomPoint.y - topPoint.y) / (bottomPoint.x - topPoint.x);
const m1 = (10 - (-10)) / (0 - (-2)) = 20 / 2 = 10

const b1 = topPoint.y - m1 * topPoint.x;
const b1 = -10 - 10 × (-2) = -10 + 20 = 10

// Equation: y = 10x + 10
```
**Horizontal Line**: y = m₂x + b₂
```javascript
const m2 = (rightPoint.y - leftPoint.y) / (rightPoint.x - leftPoint.x);
const m2 = (1 - 3) / (20 - (-20)) = -2 / 40 = -0.05

const b2 = leftPoint.y - m2 * leftPoint.x;
const b2 = 3 - (-0.05) × (-20) = 3 - 1 = 2

// Equation: y = -0.05x + 2
```
### Step 5: Find Intersection Point

Using the line equations from Step 4:
- Vertical line: `y = 10x + 10`
- Horizontal line: `y = -0.05x + 2`

Set equations equal: `10x + 10 = -0.05x + 2`

**Solve for x:**
```javascript
10x + 0.05x = 2 - 10
10.05x = -8
x = -8 / 10.05
x = -0.796 mm
```

**Solve for y:**
```javascript
y = 10 × (-0.796) + 10
y = -7.96 + 10
y = 2.04 mm
```

### Step 6: Result - Physical Crack Position

The intersection point from Step 5 **is the final result** - no further conversion needed.

**For measurement `[-2, +1, 0, +3]`:**
- **Crack Position**: **(-0.796 mm, 2.04 mm)**

This represents the physical location of the crack intersection on the meter's measurement grid:
- **X-coordinate**: -0.796 mm (0.796 mm left of center)
- **Y-coordinate**: 2.04 mm (2.04 mm below center)

**In the code:**
```javascript
const calculateIntersection = (reading) => {
  // ... calculation steps ...
  
  const intersectionX = (b2 - b1) / (m1 - m2);
  const intersectionY = m1 * intersectionX + b1;
  
  // Return in millimeters (physical coordinates)
  return { x: intersectionX, y: intersectionY };
};
```

## Implementation Formula

Quick reference for implementing the intersection calculation.

### Physical Boundaries
```javascript
const METER_X_MIN = -20, METER_X_MAX = 20;  // 40mm horizontal range
const METER_Y_MIN = -10, METER_Y_MAX = 10;  // 20mm vertical range
```

### Line Endpoints
Given measurement $[u, r, d, l]$ (up, right, down, left):

**Vertical line:** $P_{top} = (u, -10)$ to $P_{bottom} = (d, +10)$

**Horizontal line:** $P_{left} = (-20, l)$ to $P_{right} = (+20, r)$

### Special Cases

**Case A: Vertical line** ($u = d$)
$$x_{int} = u$$
$$y_{int} = l + \frac{r - l}{40} \cdot (u + 20)$$

**Case B: Horizontal line** ($l = r$)
$$y_{int} = l$$
$$x_{int} = u + \frac{d - u}{20} \cdot (l + 10)$$

### Normal Case

**Line equations:** $y = m_1 x + b_1$ and $y = m_2 x + b_2$

**Slopes:**
$$m_1 = \frac{10 - (-10)}{d - u} = \frac{20}{d - u}$$
$$m_2 = \frac{r - l}{20 - (-20)} = \frac{r - l}{40}$$

**Intercepts:**
$$b_1 = -10 - m_1 \cdot u$$
$$b_2 = l - m_2 \cdot (-20)$$

**Parallel check:** If $|m_1 - m_2| < 10^{-10}$ → return null

**Intersection:**
$$x_{int} = \frac{b_2 - b_1}{m_1 - m_2}$$
$$y_{int} = m_1 x_{int} + b_1$$

**Result:** $(x_{int}, y_{int})$ in millimeters

## Movement Analysis Examples

### Understanding Raw vs. Normalized Data

**Raw Data:** Coordinate changes have different physical meanings per floor due to different crack meter orientations.

**Normalized Data:** After applying floor-specific inversions, ALL floors use the same interpretation (P1 standard).

### Example: Normalized Coordinate Change (+0.5, -0.3)

After normalization, this means the **same thing** for all floors:

- **Horizontal**: +0.5mm = crack expanding (rightward movement)
- **Vertical**: -0.3mm = wall sinking (upward movement in display)
- **Summary**: "Crack expanding and wall sinking"

**This applies to Pianterreno, Piano 1, AND Piano 2** after normalization.

### Why Normalization Matters

**Without normalization (raw data):**
- P0 raw: (+0.5, -0.3) means crack closing & wall rising
- P1 raw: (+0.5, -0.3) means crack expanding & wall sinking  
- P2 raw: (+0.5, -0.3) means crack closing & wall rising

**After normalization:**
- All floors: (+0.5, -0.3) means crack expanding & wall sinking ✓

### Movement Significance Thresholds
- **< 0.1mm**: Minimal movement (measurement precision)
- **0.1-0.5mm**: Small but detectable movement
- **0.5-1.0mm**: Moderate movement (monitor closely)
- **> 1.0mm**: Significant movement (requires attention)

## Output Data

The system generates two types of coordinate data for each measurement:

### Raw Data
- **Position**: (x, y) in millimeters - crack intersection location in physical coordinates
- **Format**: Direct output from `calculateIntersection()` function
- **Use**: Reference only - interpretation varies by floor
- **Example**: `pianterreno_x: -0.796, pianterreno_y: 2.04`

### Normalized Data
- **Position**: (norm_x, norm_y) in millimeters - movement from first reading
- **Origin**: First reading of each meter set to (0, 0)
- **Floor corrections**: Inverted for P0 and P2 to match P1 orientation
- **Use**: All structural analysis and interpretation
- **Example**: `pianterreno_norm_x: 0.150, pianterreno_norm_y: -0.300`

### Additional Output
- **Angle Analysis**: Quadrant angle deviations from 90° orthogonality. Orthogonality of the crack meter's cross arms are relevant only as a litmus test for the actual reading. Since readings are prone to human error and usually have a .25mm approximation, they might result in non-orthogonal reconstruction of the virtual cross. Angle Analysis does not serve any other purpose than a control test of the reading itself and does not provide any information on the crack
- **Movement Interpretation**: Automated text descriptions based on normalized data (knowledge from information)
- **Rate Calculations**: 
  - Direct displacement (straight-line distance)
  - Total path distance (cumulative movement)
  - Weekly movement rate
  - ETA to displacement thresholds (1mm, 2mm, 5mm)

### Data Table Columns

**Per Floor (Pianterreno, Piano 1, Piano 2):**

| Date       | Raw Reading             | Raw Position    | Normalized Position | Angles                           |
| ---------- | ----------------------- | --------------- | ------------------- | -------------------------------- |
| 2024-06-01 | -0.25;+0.75;+0.00;+1.00 | (-0.125, 0.875) | (0.000, 0.000)      | Perfect 90°                      |
| 2024-11-22 | -0.25;+0.75;+0.00;+1.00 | (-0.125, 0.875) | (0.000, 0.000)      | Perfect 90°                      |
| 2024-12-18 | -0.50;+0.75;-0.25;+1.25 | (-0.375, 1.000) | (-0.250, 0.125)     | NW & SE: 90.12°, NE & SW: 89.88° |

**Column Descriptions:**
- **Date**: Measurement date (YYYY-MM-DD)
- **Raw Reading**: `[up; right; down; left]` boundary measurements in mm
- **Raw Position**: (x, y) calculated intersection point in mm
- **Normalized Position**: (norm_x, norm_y) movement from first reading in mm
- **Angles**: Quadrant angle analysis showing deviations from 90° orthogonality

**Critical:** Only use **normalized data** for structural interpretation and comparison across floors.

## ETA Prediction Method

ETA predictions estimate when a floor's net displacement will cross the 1mm, 2mm, and 5mm thresholds. Two methods are available, selectable from a dropdown in the dashboard's Movement Summary section.

### Weighted Theil-Sen Regression (default)

- **Independent trends per axis**: `x(t)` and `y(t)` are fitted separately on normalized coordinates, where `t` is real elapsed time (days) since the floor's first reading — not reading index, so uneven gaps between visits are represented correctly.
- **Robust estimator**: the slope is the weighted median of every pairwise slope between readings, not a mean — a single unusual reading can't dominate the fit the way it would with ordinary least squares.
- **Quality weighting**: each reading is weighted by a function of its quadrant-angle deviation (see Angle Analysis above) — a reading with a less-than-perpendicular reconstructed cross (e.g. from an awkward photo angle) counts for less, but is never discarded outright.
- **Duplicate readings**: consecutive readings with an identical value (common when real movement is slower than the ~0.25mm reading precision) are collapsed to one point before fitting, so a long static stretch doesn't get counted as repeated evidence of zero movement.
- **ETA from the fitted trend**: the crossing time for a threshold is found by solving where the fitted 2D line intersects the threshold's displacement circle. If the fitted trend has no directional slope at all, or its closest approach to the origin never reaches the threshold, or the crossing would fall implausibly far outside the observed monitoring window (beyond 10× its span), the result is reported as "not reached on current trend" rather than a forced number.
- **"Already reached" status** is always read from the last actual observed measurement, never from the fitted trend — the trend is only used to project forward from today.
- **Confidence range**: a bootstrap resampling of the fit (500 replicates) gives a 90% range for the ETA date, along with what share of resampled trends reach the threshold at all — useful when the point estimate is near the boundary of "will this happen."

**A fitted slope of exactly zero is a real result, not a bug.** With few readings at coarse (~0.25mm) precision, a floor that oscillates without a consistent direction can easily produce readings that repeat exact values on different dates, which pulls the robust trend to precisely zero — correctly reported as "not reached," even if the floor shows real cumulative movement (see Activity vs. ETA below).

### Secant (legacy baseline)

The original method (pre-v0.16.0): a straight line between only the first and last reading, ignoring every reading in between. Kept as a selectable comparison, not a recommendation — it can't distinguish a floor that moved steadily from one that oscillated back to nearly the same place, since it never looks at the readings in between. It has no confidence range (a two-point fit has nothing to resample).

### Activity vs. ETA — two different questions

A floor can show "not reached on current trend" for every threshold while still being the most active floor being monitored — these aren't in conflict. **ETA** answers "is this floor's *net* displacement trending toward a threshold." **Activity** (the relative bar shown alongside Weekly Rate, Total Path) answers "how much has this floor moved in total, regardless of direction" — a floor that moves back and forth a great deal without net progress scores high on activity and can still show no projected ETA. The activity indicator is relative to the other floors currently monitored, not an absolute or literature-backed scale.

### Horizontal vs. Vertical Component Analysis

Both methods fit `x(t)` and `y(t)` independently, so either axis can be analyzed on its own instead of as a combined 2D displacement — useful for judging whether, say, sinking (vertical) or outward wall pull (horizontal) is the stronger driver for a given crack.

- **"Displacement Component" selector** (Combined 2D / Horizontal only / Vertical only), alongside the ETA Method selector, governs Trend Rate, the ETA threshold panel, and Top 5 Soonest ETAs. In single-axis mode, the threshold crossing is solved on that axis's own linear fit (`a + b·t = ±threshold`) rather than the 2D quadratic — the two agree exactly when the other axis has no movement at all, since the 2D magnitude then reduces to the single axis.
- **Horizontal vs. Vertical Rate** is shown at all times, independent of the selector, as a same-direction bar pair per floor: horizontal and vertical rate (mm/week) both drawn as magnitude-only bars from zero, so the longer bar is immediately the stronger driver — sign is only carried by the word next to the number ("expanding"/"closing", "rising"/"sinking"), not by bar direction. A cross-floor version of the same bar pair, scaled to one shared maximum across all floors, appears in the Structural Analysis Summary for comparing intensity across the whole building, not just within one floor.
- Single-axis "already reached" status uses that axis's own absolute displacement (`|x|` or `|y|`) from the last observed reading, consistent with how the combined mode uses `hypot(x, y)`.

## Applications

### Unified Multi-Floor Monitoring
- **Track crack movement** across all floors using consistent normalized data
- **Direct comparison** of movement patterns between floors without conversion
- **Single interpretation** system applies to all floors after normalization

### Structural Movement Analysis
- **Timeline visualization**: Track horizontal and vertical displacement over time
- **Movement patterns**: Visualize crack trajectories with directional arrows
- **Rate calculations**: Monitor movement velocity (mm/week)
- **Trend detection**: Identify acceleration or deceleration in movement

### Alert and Threshold Systems
- **Universal thresholds**: Same displacement limits for all floors (e.g., 1mm, 2mm, 5mm)
- **ETA predictions**: Estimate time to reach critical thresholds, via a selectable weighted-regression or legacy secant method (see ETA Prediction Method above)
- **Most active meter**: Automatically identify which floor shows greatest movement
- **Automated warnings**: Flag rapid changes or threshold exceedances

### Data Export and Reporting
- **Multiple formats**: JSON, CSV, XLSX, YAML export options
- **Image integration**: Optional crack meter photos bundled with data
- **Complete dataset**: Raw readings, calculated positions, normalized coordinates, and angle analysis - and images
- **Time-stamped archives**: Historical tracking with date-stamped exports

### Visual Analysis Tools
- **Single reading view**: Detailed crack position with cross visualization
- **Movement patterns**: Opacity-graded trajectory showing temporal progression
- **Normalized view**: All meters starting from (0,0) and under unified orientation for direct comparison
- **Statistical summaries**: Displacement metrics, movement rates, and directional analysis

## Important Notes

### Critical Requirements

⚠️ **ALWAYS use normalized data for structural interpretation** - Raw data has inconsistent meanings across floors and should only be used for debugging or verification purposes.

⚠️ **Floor identification is essential** - The software automatically applies correct normalization (inversion for P0 and P2) based on floor labels. Mislabeling a floor will produce incorrect movement interpretations.

⚠️ **Coordinate system convention**:
- Display coordinates: +Y points DOWN (standard computer graphics)
- Physical interpretation: +Y means wall RISING (inverted from display)
- It can be initially confusing as it doesn't follow classic Carthesian direction

### Data Quality Considerations

- **Measurement precision**: Crack meters typically have ±0.1mm precision
- **Reading accuracy**: Human readings usually approximate to .25mm increments on the grid (be it .5mm or 1mm scaled)
- **Environmental factors**: Temperature, humidity, and vibration affect readings
- **Orthogonality check**: Angle analysis flags non-perpendicular crosses (>2° deviation warrants verification)
- **Minimum significant movement**: Changes <0.1mm are within measurement noise

### Software Limitations

⚠️ **This is NOT a professional engineering tool** - See LICENSE.md for full disclaimers:
- No warranty for structural safety
- Requires professional structural engineer consultation
- Developer is not a licensed engineer
- For monitoring and visualization purposes only

### Best Practices

✓ Always track trends over time rather than individual measurements

✓ Verify significant changes (>1mm) with on-site inspection

✓ Maintain regular professional structural assessments

✓ Document readings with photos and field observations (note: this app enforces the dataset to have a correspoding imageset)

✓ Export data regularly for archival purposes

✓ Compare normalized data across floors to identify systemic patterns

### When to Seek Professional Help

**Immediately consult licensed structural engineers if:**
- Any crack shows rapid movement (>1mm change between readings)
- New cracks appear or existing cracks expand
- Building shows distress signs (doors/windows sticking, floor sloping, wall bulging)
- Any concerns about structural safety arise
