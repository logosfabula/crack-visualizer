# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
(No unreleased changes)

---

## [0.15.2] - 2025-11-02
### Changed
- cleaner changelog sections from version bumping script

---

## [0.15.1] - 2025-11-02
### Changed
- updated project structure section in README.md

---

## [0.15.0] - 2025-11-02
### Added
- scripted version bump
- Footer and Interpretation Notes document elements extracted into components

### Changed
- file TODO renamed to TODO.md
- better git tag error handling in version bumping script
- scripted version bump
- Footer and Interpretation Notes document elements extracted into components
- minor caption change
- updated TODO

### Fixed
- 

---

## [0.14.2] - 2025-10-30
### Changed
- Missing table in Data view fixed

## [0.14.1] - 2025-10-30
### Changed
- Single reading view information

## [0.14.0] - 2025-10-29
### Added
- Specialized files according to SOLID-compliant code structure
### Changed
- Main component, functions extracted to specialized files

## [0.13.2] - 2025-10-27
### Added
- Logos for light and dark themes
### Changed
- Minor updates in README.md with detailed lists in TODO

## [0.13.1] - 2025-10-26
### Changed
- Changed sample case label in dashboard
- Minor change in label
- Improved favicon
- Changed title and subtitle structure
- Webapp custom assets and labels; title split into: app and subject

## [0.13.0] - 2025-10-24
### Added
- Images of reading 2025-10-24
- Updated crack meter readings dataset
### Changed
- Single reading view now more readable; added legend to single reading view
- Changed some labels around the UI (Raw data → Data; Absolute → Raw)
- Updated METHOD.md
### Fixed
- `handleMovementPointClick` variable lint fixed by deletion
- `METER_CONFIGS` unused variable lint fixed by factorization
- `DISPLAY_RANGE` unused variable lint fixed by factorization

## [0.12.1] - 2025-10-24
### Added
- CI/CD now accepts UPPERCASE extensions of readings' images
- CI/CD images script now renames image extension to lowercase .jpg if a compatible image format is found

## [0.12.0] - 2025-10-09
### Added
- Factorized common code among the views
- Tooltip to mouse hover on all views
- Specs files copied to public/ for deployment
### Changed
- Updated TODO

## [0.11.1] - 2025-10-08
### Changed
- Second half of Method document heavily reviewed for clarity and alignment with updated code
- Minor update in METHOD.md

## [0.11.0] - 2025-10-06
### Added
- Added global footer bar
- CI/CD actions to sync README and LICENSE (along with METHOD) in public/ with original documents (in root)
### Changed
- Minor grammar edit on Method document
- General footer links' targets now point directly to documents in public/

## [0.10.0] - 2025-10-05
### Added
- Method file's copy added to public folder
- Auto-copy of Method.md to public/ for preventing broken links targeting to it within the app
### Changed
- Updated README.md
- Updated LICENSE.md
- Updated METHOD.md
- Rephrased various passages in the per-floor and overall summary blocks

## [0.9.0] - 2025-10-04
### Added
- Structural Analysis Summary: replaced rightmost information piece with Top 5 Soonest ETAs
- CI/CD preventing build & deploy by image validation (GitHub Action and JS script)
### Changed
- Aesthetical changes in Summary's Top 5 Soonest ETAs
- Main dashboard title
- Some lint cleaning
### Fixed
- BUGFIX (after rebasing): normalized view P2 not inverting; Raw Data normalized columns are now correct

## [0.8.0] - 2025-10-03
### Added
- Projection of 40×20mm gridbox boundaries intercepts with red cross's arms onto the visible 3×3mm gridbox boundaries
- LICENSE file (MIT with structural engineering disclaimers)
- METHOD and DISCLAIMER files
- ETAs to 1mm, 2mm, and 5mm thresholds added to floors' summaries
- Dataset now downloadable from the Raw Data view (JSON, CSV, XLSX, YAML formats with optional images)
- Can now run `npm run build:ci` to prevent deploy failure due to stricter rules
### Changed
- React README filename changed
### Fixed
- gh-pages deployment authentication
- package-lock.json synchronization
### Removed
- Unused `grandTotalDistance` variable (auto-deploy blocking warning)
- Unused `firstNormX`, `firstNormY` variables (auto-deploy blocking warnings)

## [0.7.0] - 2025-10-02
### Added
- Auto-deploy GitHub Action for gh-pages
- `.nojekyll` marker file for GitHub Pages compatibility
- Missing `web-vitals` dependency
- Complete crack meters pictures set as of 2025-10-01
### Changed
- Moved `FLOOR_INTERPRETATIONS` outside component (resolved warning)
### Fixed
- `getImageFilename` function bugfix to solve non-downloadable pictures' bug

## [0.6.0] - 2025-10-01
### Added
- npm gh-pages package
- Download button for reading pictures in single reading view mode
- Finer grid lines at 0.25mm intervals
### Changed
- Fixed Timeline view, now based on normalized unified data; labels shortened for readability
- Captions and legend items corrected about +Y and -Y
- README updated with method information; method file deleted
### Fixed
- Wrong box boundaries intercept logic: now is (-20.0, -10.0) → (+20.0, +10.0) while keeping the grids within (-1.5, -1.5) → (+1.5, +1.5)
- Broken cross case in single reading view
- Restored color coding in each view

## [0.5.0] - 2025-09-30
### Added
- Movement Pattern (Direct Path) and Overall Movement Direction information added to floor blocks
### Changed
- Information clarified in Structural Analysis Summary
- Greater-than symbol URL-encoded for compatibility with editor (VSCode)
- Grid system unified among views according to method document specs
- Method document corrected about per-floor interpretation, unified normalized interpretation

## [0.4.0] - 2025-09-29
### Added
- Per-floor interpretation with unified normalized data system
- Floors' movement summaries updated according to unified normalized interpretation
- Direct Weekly Rate added
- Normalized Position Change added
### Changed
- Normalized Movement view's text updated
- Single Reading view's behavior and text updated according to floor inversion
- Raw Data view style updated for better readability
- NPM accessible from same network on port 3000

## [0.3.0] - 2025-09-28
### Added
- Single reading viewer mode now color coded by floor
- Method document for interpreting readings, calculating datapoints and interpreting data as actual structural movements
### Changed
- Coordinate System & Measurement Mapping corrected in Method document
- Minor corrections to crack meter method document

## [0.2.0] - 2025-09-27
### Added
- Style improvements: more consistent color coding and more compact pages

## [0.1.0] - 2025-09-25
### Added
- Initial project setup using Create React App
- Working crack visualizer with proper Tailwind styling
- Model decoupled from view/controller
- Basic crack meter data visualization with Recharts integration
- Timeline analysis view for horizontal and vertical movement
- Movement patterns visualization
- Single reading detailed view with cross visualization
- Raw data table display with calculated positions
- Crack meter intersection calculation algorithm
- Physical crack meter boundaries (40mm × 20mm)
- SVG-based grid system with coordinate conversion

## [0.0.1] - 2025-09-24
### Added
- Initial commit and Create React App scaffolding

---

**Note**: This project uses continuous deployment to GitHub Pages at `https://logosfabula.github.io/crack-visualizer`. Version 1.0.0 is planned for when the project reaches production-ready stability with comprehensive documentation and testing.