# Crack Movement Visualizer

![Version](https://img.shields.io/badge/version-0.19.0-blue)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE.md)

A React-based application for visualizing and analyzing crack meter data from structural monitoring systems.

## ⚠️ CRITICAL DISCLAIMERS - READ BEFORE USE

### 🚨 THIS IS NOT A PROFESSIONAL ENGINEERING TOOL

**IMPORTANT**: This software is provided for **INFORMATIONAL and MONITORING purposes ONLY**.

- ❌ **NOT a substitute** for professional structural engineering assessment
- ❌ **Developer is NOT** a licensed structural engineer or building professional  
- ❌ **NOT intended** for making structural safety decisions
- ✅ **IS intended** as a qualitative visualization and tracking tool only

### ⚖️ Liability and Responsibility

**YOU MUST CONSULT LICENSED STRUCTURAL ENGINEERS** for any structural concerns. This software:
- Provides approximations based on mathematical models
- May not account for all structural factors
- Should never be the sole basis for structural decisions
- Comes with NO warranty for structural safety

**BY USING THIS SOFTWARE, YOU ASSUME ALL RISKS.** The developer assumes NO liability for damages, injuries, or losses resulting from use of this application.

### 👷 When to Seek Professional Help

Immediately consult licensed professionals if you observe:
- Rapid crack movement (>1mm change)
- New cracks or expanding existing cracks
- Building distress signs (stuck doors/windows, sloping floors, bulging walls)
- ANY concerns about structural safety

---

## Overview

This application helps monitor and visualize crack meter readings from structural monitoring systems installed on buildings. It converts 4-boundary crack meter measurements into precise position data and tracks movement patterns over time. It comes with a sample building and crack-meter readings for three floors over a year.

### Features

- 📊 **Timeline Analysis**: Track horizontal and vertical movement over time
- 🎯 **Movement Patterns**: Visualize crack position changes with trajectory arrows
- 📏 **Single Reading View**: Detailed visualization of individual measurements
- 📈 **Normalized Data**: Floor-specific corrections for consistent analysis
- 📋 **Data Tables**: Complete raw and normalized measurement history
- 📊 **Statistical Summary**: Movement rates, displacement analysis, and trends
- ⏳ **ETA Predictions**: Threshold-crossing estimates via a selectable weighted-regression or legacy secant method, with confidence ranges, plus an always-visible horizontal-vs-vertical rate comparison per floor — see METHOD.md
- 🔥 **Activity Indicator**: Relative gauge of cumulative movement per floor, independent of ETA trend

## Installation

```bash
# Clone the repository
git clone https://github.com/logosfabula/crack-visualizer.git
cd crack-visualizer

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Usage

### Data Format

The application expects crack meter data in the following format:

```json
{
  "date": "2024-06-01",
  "Pianterreno": "-0.25;+0.75;+0.00;+1.00",
  "Piano 1": "+0.25;+0.00;+0.25;+0.50",
  "Piano 2": null
}
```

Where each reading is: `[up; right; down; left]` (boundary measurements in mm)

### Understanding the Measurements

- **Raw Data**: Direct calculations from crack meter readings
- **Normalized Data**: Floor-corrected coordinates for consistent analysis across floors
- **Movement Interpretation**: Based on position changes from first reading

### Floor-Specific Configurations

The system accounts for different crack meter orientations. In this case:
- **Pianterreno (P0)**: Inverted interpretation
- **Piano 1 (P1)**: Standard interpretation  
- **Piano 2 (P2)**: Inverted interpretation

The flags for standard/inverted interpretations of each floor are harcoded in the main component at current version (v0.19.0)
TODO: move this info into the data tier

## Technology Stack

- **React** 18.2.0
- **Recharts** 2.5.0 (for data visualization)
- **Tailwind CSS** (via CDN for styling)

## Project Structure
```
crack-visualizer/
├── .github/
│   └── workflows/
│       └── deploy.yml             # CI/CD: Auto-deploy to GitHub Pages
├── public/
│   ├── crack_images/              # Complete crack meter readings images
│   ├── README.md                  # Synced copy of main README
│   ├── METHOD.md                  # Synced copy of methodology doc
│   └── LICENSE.md                 # Synced copy of license
├── src/
│   ├── components/
│   │   ├── common/                # Reusable UI components
│   │   │   ├── SVGGrid.js         # Grid visualization component
│   │   │   └── MovementPatternRenderer.js  # Movement patterns renderer
│   │   ├── views/                 # Main view components
│   │   │   ├── TimelineView.js    # Timeline chart view
│   │   │   ├── MovementPatternsView.js     # Movement patterns (raw/normalized toggle, defaults to normalized)
│   │   │   ├── SingleReadingView.js        # Individual reading detail
│   │   │   └── DataTableView.js   # Tabular data display
│   │   ├── Footer.jsx             # Footer with links and version
│   │   └── InterpretationNotes.jsx # Measurement interpretation guide
│   ├── services/
│   │   ├── calculations/          # Calculation services
│   │   │   ├── IntersectionCalculator.js   # Crack position calculator
│   │   │   └── AngleAnalyzer.js   # Quadrant angle analysis
│   │   ├── data/
│   │   │   └── DataProcessor.js   # Data processing & normalization
│   │   └── export/
│   │       ├── ExportService.js   # Data export orchestrator
│   │       └── formatters/        # Export format handlers
│   │           ├── JSONFormatter.js
│   │           ├── CSVFormatter.js
│   │           ├── XLSXFormatter.js
│   │           └── YAMLFormatter.js
│   ├── hooks/
│   │   └── useProcessedData.js    # Data processing React hook
│   ├── utils/
│   │   └── coordinateConverters.js # SVG coordinate utilities
│   ├── constants/
│   │   ├── meterConfigs.js        # Meter configuration constants
│   │   ├── floorInterpretations.js # Floor interpretation flags
│   │   └── boundaries.js          # Physical & display boundaries
│   ├── data/
│   │   └── crackData.json         # Crack meter measurement dataset
│   ├── CrackMovementVisualizer.js # Main application component
│   ├── App.js                     # Root application wrapper
│   └── index.js                   # React entry point
├── scripts/
│   ├── update-version.js          # Automated version bump script
│   └── validate-images.js         # CI/CD: Validate crack images
├── CHANGELOG.md                   # Version history (Keep a Changelog)
├── TODO.md                        # Development roadmap
├── METHOD.md                      # Mathematical methodology
├── LICENSE.md                     # MIT License with disclaimers
├── README.md                      # This file
└── package.json                   # Project configuration & scripts
```

## Mathematical Method

The application uses the intersection method described in `METHOD.md`:

1. Converts 4 boundary measurements to line endpoints
2. Calculates line equations for vertical and horizontal components
3. Finds intersection point (crack position)
4. Applies floor-specific normalization
5. Tracks movement relative to first reading
6. For more detailed info, read METHOD.md

## Accuracy and Limitations

### ⚠️ Approximations and Limitations

This tool uses mathematical approximations and has several limitations:

1. **Measurement Precision**: Crack meters typically have ±0.1mm precision; the measurement grids use 1.0 mm or 0.5 mm graduations; the readings in the sample were taken at 0.25 mm resolution
2. **Environmental Factors**: Temperature, humidity, and vibration affect readings
3. **Installation Variations**: Meter orientation and mounting affect interpretation - see normalization in Method
4. **Calculation Approximations**: Mathematical models simplify complex structural behavior
5. **Qualitative Nature**: Best used for trend monitoring, not precise measurements

### Best Practices

- Use as a **supplementary monitoring tool** alongside professional inspection
- Track **trends over time** rather than individual measurements
- Verify significant changes with **on-site inspection**
- Maintain regular **professional structural assessments**
- Document all readings with **photos and observations**

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Contributing

Contributions are welcome! Please note:

1. All contributions must maintain disclaimer notices
2. Code should not imply professional engineering capabilities
3. Documentation must emphasize limitations and proper use

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**IMPORTANT**: The license includes additional disclaimers regarding structural engineering, liability, and proper use. Please read the entire LICENSE file carefully.

## Support and Resources

- **Issues**: [GitHub Issues](https://github.com/logosfabula/crack-visualizer/issues)
- **Documentation**: See `METHOD.md` for technical details
- **Professional Help**: For structural concerns, consult:
  - Licensed structural engineers
  - Licensed architects  
  - Qualified building inspectors

## Acknowledgments

This tool was developed for visualization and monitoring purposes to assist in tracking structural movement data collected by crack meter monitoring systems.

---

## Final Reminder

**🏗️ THIS IS A VISUALIZATION TOOL, NOT AN ENGINEERING ANALYSIS TOOL**

Always prioritize professional structural engineering assessment for:
- Building safety decisions
- Structural repairs or modifications
- Legal or insurance matters
- Any situation where structural integrity is a concern

**Your safety depends on proper professional evaluation, not software tools.**
