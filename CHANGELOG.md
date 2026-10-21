# Changelog

## v2.0.0 — 2026-10-21

- Add the two supplied ordering formulas as separate modes, with manual peak-area input and reference provenance.
- Fix Gaussian Jacobian parameter order and LM scaling; add joint linear-background fitting, multi-start double-peak fits, residual/coverage diagnostics and plots.
- Integrate Scherrer single/multi-peak, instrument-profile corrections, Williamson–Hall and independent TEM-calibrated results.
- Add Chinese/English UI and combined, scope-invalidated CSV/JSON exports.
- Publish self-contained versioned HTML and SHA-256 checksum assets after CI validation.
- Expand to 17 numerical/DOM regression groups.

## v1.1.0 — 2026-10-02

- Add validated numeric-text and JSON input; normalize descending scans and reject duplicate/nonmonotonic angles, malformed/nonfinite rows and all-zero data.
- Add CSV/JSON result exports with units and method settings; invalidate stale results on input changes.
- Escape imported names, avoid large-scan plotting argument limits, and add numerical/DOM regression tests.
- Preserve the original empirical four-peak normalized ratio, label it accurately, and add optional calibrated long-range S = √R with provenance/confirmation requirements.
- Remove claims that demonstration calibration values independently establish full ordering.
