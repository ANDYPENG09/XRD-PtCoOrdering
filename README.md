# XRD-PtCoOrdering — PtCo L1₀ Ordering Degree

A single-file, zero-dependency, **offline** HTML tool for computing the
**chemical long-range ordering degree** of PtCo L1₀ alloys from XRD peak
areas. All processing runs locally in the browser — data never leaves your
device.

## Features

- Ordering degree from four characteristic reflections (110)/(111)/(200)/(002).
- Isolated peaks ((110)/(111)): **side-window quadratic baseline +
  single-Gaussian LM fit** — robust for oscillating backgrounds and weak
  superlattice peaks.
- Overlapping (200)/(002): **SNIP baseline + double-Gaussian
  Levenberg–Marquardt deconvolution** — separates the merged fundamentals.
- Reference intensities default to the fully ordered PtCo L1₀ benchmark
  (I110=20, I111=100, I200=55, I002=45, Cu Kα, normalized to I111=100).
- Built-in PtCo L1₀ demo data (desensitized reconstruction of a measured
  pattern); demo computes to ~97% ordering.

## Formula

```
Ordering degree (%) = [A110/(A111+A200+A002)]
                    ÷ [I110/(I111+I200+I002)] × 100%
```

- `A_hkl` — measured net peak area (background-subtracted)
- `I_hkl` — fully ordered reference card intensity (same phase & calibration)

## Usage

Open `index.html` in any modern browser. Import a two-column XRD file
(`.xy .xye .csv .txt .dat .asc .ras .json`) or click **Load demo data**.
Adjust the four peak regions and reference intensities as needed, then
**Integrate all peaks and compute ordering**.

## Algorithms & references

- SNIP morphological baseline: Ryan et al. (1988).
- Levenberg–Marquardt nonlinear least squares (parameter scaling + λI
  fallback) — implemented from scratch.
- Stamenkovic et al., *Nat. Mater.* 6 (2007) 222–233 (PtCo alloy context).

See `LICENSE_AUDIT.md` for the full license/copyright audit.

## Data & applicability

These tools are developed from my own measured XRD datasets. They are currently
best adapted for PtCo alloy (L1₀ ordering) and Pt/C catalysts. I will keep
extending them to more sample types as my measurement data grows.

## License

MIT © 2026 Yu Peng
