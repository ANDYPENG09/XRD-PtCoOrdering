# XRD-PtCoOrdering

Offline peak fitting and relative-ordering analysis for PtCo L1₀. Single-file HTML; no data upload or runtime dependencies. **v1.1.0**.

**[Open the tool](https://andypeng09.github.io/xrd-toolkit/demos/ordering/)** · [Download HTML](https://raw.githubusercontent.com/ANDYPENG09/XRD-PtCoOrdering/main/index.html) · [XRD Toolkit](https://andypeng09.github.io/xrd-toolkit/)

## Two clearly separated metrics

Let R = [A110 / (A111 + A200 + A002)] / [I110 / (I111 + I200 + I002)], using net integrated areas.

| Mode | Reported value | Required interpretation |
|---|---|---|
| Empirical relative ordering index (default) | 100 × R | Preserves the original calculation; an empirical comparison index, not independently validated long-range S |
| Calibrated long-range order | 100 × √R | Conditional on a verified fully ordered integrated-intensity reference with matching composition and appropriate geometry/scattering/texture corrections |

Calibrated mode requires a reference source/calibration ID and explicit confirmation. Defaults **20:100:55:45 are demonstration values**, not an independently certified fully ordered reference. The synthetic demo approaching 100% does not establish an absolute calibration. Card peak heights must not be substituted uncritically for integrated areas. Values above 100% remain visible and prompt review.

The square-root relationship is the conventional L1₀ intensity/order relationship; see [Seki et al., J. Magn. Soc. Jpn. 43 (2019), 29–33, Eq. 1](https://www.jstage.jst.go.jp/article/msjmag/43/2/43_1903R004/_pdf). That study concerns FePt/Pd films; transferring the calibration to PtCo powder requires validation of the reference and corrections.

## Workflow

1. Open `index.html` or the online tool; load the built-in synthetic demo or import data.
2. Check the four integration windows. (110)/(111) use a side-window quadratic baseline and single-Gaussian LM fit. Overlapping (200)/(002) use SNIP + double-Gaussian deconvolution.
3. Choose the empirical index or calibrated S; provide the appropriate reference.
4. Calculate, inspect areas and reference sensitivity, then download CSV/JSON.

Text inputs: numeric two-column `.xy .xye .csv .txt .dat .asc .ras`; JSON accepts `{ "x": [...], "y": [...] }`, `[[angle,intensity],...]` or `[{"x":angle,"y":intensity},...]`. Metadata lines are skipped. Descending scans are reversed; duplicate/nonmonotonic angles and nonfinite values are rejected.

Exports record the mode, reference provenance, raw peak areas, peak windows and deconvolution settings. Editing inputs clears stale exports. These exports do not establish a measurement uncertainty budget.

## Development

```bash
npm ci
npm test
```

Numerical/DOM regressions include R=0.64 → empirical 64% versus calibrated S=80%, demo calculation, calibration gating, parser failures, exports and stale-result invalidation. Canvas I/O is mocked; browser-pixel rendering is not covered.

[Changelog](CHANGELOG.md) · [License audit](LICENSE_AUDIT.md) · [MIT License](LICENSE)
