# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
(No unreleased changes)

---

## [0.20.0] - 2026-09-06
### Added
- dotted line from the first reading to this reading, shaped by normalized displacement
### Changed
- correct TODO.md's account of the first-to-current dotted line
- document the first-to-current dotted line feature in TODO.md
### Fixed
- first-to-current dotted line: literal raw coordinates, not the normalized-shifted variant
## [0.19.0] - 2026-09-06
### Added
- click-to-toggle mm/wk <-> µm/wk on Trend Rate and Activity Rate
- show total monitoring duration; rename to "Total Observed Activity" in both views
- make the Crack Overall Movement line clickable, group value + chevron on the right
- make per-floor Movement Summary cards collapsible
### Changed
- document removal of compact-view consensus percentage in TODO.md
- document bootstrap range coverage clarification in TODO.md
- clarify the bootstrap range's actual coverage, in both views
- document micron display, ETA cycle signal, and fixed extrapolation cap in TODO.md
- extrapolation cap: fixed 100 years instead of 10x the observed span
- Trend Rate/Activity Rate: always µm/wk, no longer clickable; signal ETA is clickable
- use the word "micron" instead of the µ symbol; [ADD] click ETA to cycle combined/H/V
- document total monitoring duration and Total Observed Activity rename in TODO.md
- show total monitoring duration; rename to "Total Observed Activity" in both views
- correct and extend TODO.md's account of cell-2 alignment iterations
- cell 2: Crack Overall Movement left, ETA + Activity Gauge right, ETA aligned to Trend Rate
- document full cell-2 right-alignment fix in TODO.md
- right-align "Crack Overall Movement" too, matching the rest of cell 2
- document lean-view text alignment in TODO.md
- lean-view text alignment: cell 1 right, cell 2 left except ETA and Activity Gauge
- document confidence/consensus terminology cleanup in TODO.md
- use "confidence" only for the actual confidence interval, "consensus" for the reached-fraction
- document ETA per-value yr suffix and confidence sizing in TODO.md
- ETA line: per-value "yr" suffix, smaller confidence percentages
- document lean-view relabeling batch in TODO.md
- lean-view relabeling: wk, Total Activity, Crack Overall Movement, Activity Rate
- document lean-view width/label/spacing refinements in TODO.md
- rename "Weekly Rate (Activity)" to "Weekly Activity Rate" in lean view
- fix gauge column width across floors, drop Secant's parenthetical in lean view
- lean-view polish: match value styling, tone down "no movement", drop " conf."
- bottom-align Weekly Rate, Activity Gauge, and the graph in the lean view
- push Activity Gauge to the bottom of its lean-view cell
- document per-floor lean-view redesign and mobile-landscape breakpoint fix in TODO.md
- Structural Analysis Summary graphs: 2 cols on mobile, smaller still in landscape
- regroup lean-view fields into 3 semantic cells, abbreviate estimator label
- document mobile-small/desktop-full Structural Analysis Summary graphs in TODO.md
- Structural Analysis Summary graphs: small on mobile, full size from sm: up
- document orientation-responsive grid, shrink-toggle removal, and nowrap fix in TODO.md
- lean-view grid: 1 column in mobile portrait, 2 in mobile landscape
- document 3-col lean layout, chevron header, and always-big expanded graph in TODO.md
- refine Movement Summary card: 3-col lean layout, always-big expanded graph, chevron header
- document inline-string/font-matching fix for lean view in TODO.md
- make lean-view rows a single inline string, matching expanded-view fonts
- document lean-view 2-column grid layout in TODO.md
- lay out the lean Movement Summary view as a 2-column grid
- document collapsible Movement Summary cards and normalization note fix in TODO.md
- make per-floor Movement Summary cards collapsible
### Fixed
- uneven gap before the bottom-pinned line in lean-view cells
- Cross Angle Analysis color no longer contradicts Cross Orthogonality's own verdict
- mobile-landscape figures were getting the desktop size, overflowing the row
- stop clipping non-wrapping lean-view text, rearrange for its actual widths
### Removed
- remove the consensus percentage from the compact view's ETA line
- remove the shared rate-figure shrink toggle, fix summary graphs at full size
## [0.18.0] - 2026-09-05
### Added
- scope icon on Cross Angle Analysis to disclaim structural causation
- click-to-resize for Horizontal vs. Vertical Rate figures
- collapsed-by-default info disclosure for explanatory text blocks
- fix mobile grid width, add click-to-shrink to Summary rate figures
- "Activity Gauge" label above the activity bar
- confirmation-density weighting for reconfirmed readings
- pluggable movement-state icon set, wired into Top 5 Soonest ETAs
- document horizontal/vertical rate graphs in METHOD.md
- horizontal vs. vertical rate graphs to Movement Summary
- document horizontal/vertical component analysis in METHOD.md and README.md
- Displacement Component selector and horizontal/vertical rate comparison to Movement Summary
- horizontal/vertical component-selective ETA calculation
### Changed
- rename stale TODO.md heading to v0.18.0, the target for this batch
- document final Cross Angle Analysis copy trims and rate-grid fix in TODO.md
- trim Cross Angle Analysis scope copy, keep camera icon in expanded text
- drop the "not necessarily real structural movement" trailing clause
- document collapsible Cross Angle Analysis and dedup fix in docs
- make Cross Angle Analysis collapsible, matching the other disclosures
- unify all Horizontal vs. Vertical Rate figures under one shared trigger
- document group resize, 2-col Summary layout, and InfoDisclosure in TODO.md
- document mobile grid fix and click-to-shrink feature in TODO.md
- document cross-floor rate figure widening in TODO.md
- widen cross-floor Horizontal vs. Vertical Rate figures to match per-floor size
- document Horizontal vs. Vertical Rate figure widening in TODO.md
- widen per-floor Horizontal vs. Vertical Rate figure to 270px
- document view merge, timeline default, and activity gauge label in docs
- color-code the activity assessment in the "Activity Gauge" title
- document Displacement Component selector removal in docs
- document confirmation-density weighting in METHOD.md and TODO.md
- swap ETA to Displacement Thresholds with Weekly Rate (Total Path)
- move Weekly Rate (Total Path) next to Overall Movement Direction and H vs. V Rate
- document movement-state icon set in METHOD.md and TODO.md
- document repeated ETA controls in TODO.md
- repeat ETA Method/Displacement Component controls throughout Movement Summary
- document arrowhead/sizing fix in TODO.md
- document vector-arrow figure redesign in METHOD.md and TODO.md
- replace horizontal/vertical rate bars with a vector-arrow figure
- document shared bar scale fix in METHOD.md and TODO.md
- document same-direction magnitude bar redesign in METHOD.md and TODO.md
- same-direction magnitude bars for horizontal/vertical rate comparison
- document horizontal/vertical rate graphs in TODO.md
- document component-selective ETA feature in TODO.md
### Fixed
- keep all three rate figures on one row at desktop width
- dedup discarding the true first reading's timestamp in a leading run
- fix mobile grid width, add click-to-shrink to Summary rate figures
- Overall Interpretation section spans full card width, Weekly Rate gets double space
- missing arrowhead and oversized figures in the cross-floor rate grid
- make horizontal/vertical rate bar scale consistent and non-misleading
- second stale updated_crack_meter_method.md reference in README.md
### Removed
- merge Normalized Movement into Movement Patterns, remove from View selector
- remove Displacement Component selector and single-axis ETA machinery
## [0.17.2] - 2026-08-29
### Added
- backlog item: synthetic 2017 datapoint for P0 ETA regression
### Changed
- document Overall Movement Direction fix in TODO.md
### Fixed
- make Overall Movement Direction reflect the selected ETA method
## [0.17.1] - 2026-08-29
### Added
- document new ETA prediction method in METHOD.md and README.md
### Changed
- document exact-zero Theil-Sen slope finding for Piano 2 in TODO.md
## [0.17.0] - 2026-08-29
### Added
- switch for time-proportional reading spacing in Timeline view
### Changed
- mark Timeline spacing item done in TODO.md
- sync public docs automatically during version bump
- sync public/README.md version references to 0.16.1
## [0.16.1] - 2026-08-29
### Changed
- sync public/README.md version references to 0.16.0
## [0.16.0] - 2026-08-29
### Added
- ETA method selector and activity heat-meter to Movement Summary
- weighted Theil-Sen ETA regression with pluggable estimator methods (Theil-Sen, Secant)
### Changed
- sync public docs with root README/LICENSE
- update TODO.md for v0.16.0 ETA rework
### Fixed
- repair test setup and replace dead App.test.js placeholder
## [0.15.17] - 2026-08-26
### Added
- 2026/08 readings
### Changed
- normalize May 2026 image extensions to lowercase .jpg
## [0.15.16] - 2026-05-08
### Added
- urgent TODO: time-weighted readings for timeline view and ETA calculation
## [0.15.15] - 2026-05-04
### Changed
- update GitHub Actions to Node 24 compatible versions
## [0.15.14] - 2026-05-04
### Added
- 2026/05 readings
### Changed
- update GitHub Actions to v4 compatible versions
## [0.15.13] - 2026-05-04
### Added
- 2026/05 readings
## [0.15.12] - 2026-04-04
### Added
- 2026/04 readings
## [0.15.11] - 2026-04-04
### Added
- 2026/04 readings
## [0.15.10] - 2026-02-24
### Changed
- ETAs caption improved
## [0.15.9] - 2026-02-24
### Changed
- footer and license copyright date updated
## [0.15.8] - 2026-02-24
### Added
- 2026/02 readings
### Changed
- 2026/02 readings
## [0.15.7] - 2025-11-29
### Fixed
- single reading view tooltip now consistent with other views
## [0.15.6] - 2025-11-29
### Added
- 2025/11 readings
### Changed
- 2025/11 readings
## [0.15.5] - 2025-11-02
### Changed
- clean formatting of TODO.md and CHANGELOG.md
## [0.15.2] - 2025-11-02
### Changed
- cleaner changelog sections from version bumping script

## [0.15.1] - 2025-11-02
### Changed
- updated project structure section in README.md

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