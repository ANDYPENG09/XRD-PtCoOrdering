# License & Copyright Audit — XRD-Scherrer / XRD-PtCoOrdering tools

**Date:** 2026-08-04  ·  **Auditor:** WorkBuddy  ·  **Owner:** PENG (Andy Peng)

## 1. Code ownership
- Both tools are **original work** by PENG (Andy Peng), authored via WorkBuddy.
- **No third-party source code** is copied or vendored. All functions (parsing, plotting, baseline, fitting, UI) are written from first principles in vanilla JavaScript.
- **Zero runtime dependencies**: no npm packages, no CDNs, no external libraries. Pure HTML + CSS + Canvas + JS in a single file.

## 2. Algorithms (all standard scientific methods, implemented independently)
| Algorithm | Origin / citation | Implementation |
|---|---|---|
| Scherrer equation D = Kλ/(β·cosθ) | Scherrer (1918); Cullity & Stock, *Elements of X-Ray Diffraction* | From-scratch |
| Instrumental broadening correction (Gaussian quadratic / Cauchy linear) | Standard XRD practice; DTU Nanolab guidance | From-scratch |
| SNIP morphological baseline | Ryan et al., *SNIP background algorithm* (1988) — public method | From-scratch |
| Levenberg–Marquardt nonlinear least squares | Standard numerical method (Levenberg 1944 / Marquardt 1963) | From-scratch (parameter scaling + λI fallback) |
| Gaussian / double-Gaussian peak deconvolution | Standard peak-fitting | From-scratch |
| Side-window quadratic baseline (ordering tool) | Standard background estimation | From-scratch |

These are **ideas/methods**, not copyrightable code; the implementations are original. Literature is cited in each tool's `REFERENCES` constant for attribution.

## 3. Data
- The built-in **demo data is a synthetic reconstruction** of the user's own measured PtCo L1₀ powder pattern, **desensitized** (internal sample name stripped; only the PtCo L1₀ phase peak positions and relative intensities are retained).
- **No third-party datasets** are embedded. Peak positions match public JCPDF/literature values for L1₀ PtCo (space group P4/mmm).
- Reference intensities (20/100/55/45) are the user's own measured fully-ordered benchmark, normalized.

## 4. License
- Declared license: **MIT** (OSI-approved, permissive). Stated in each file's footer.
- MIT permits use, modification, distribution, and private use with attribution. Compatible with open-source release and with the tools being kept private.
- **Requirement:** a `LICENSE` file containing the MIT text and copyright notice must accompany each distribution. This is provided in each repository.

## 5. Copyright notice
© 2026 PENG (Andy Peng). All rights reserved under the MIT License.

## 6. Risk assessment
| Risk | Level | Mitigation |
|---|---|---|
| Third-party code infringement | **None** — all code original | — |
| Third-party data infringement | **None** — demo is own/reconstructed data | — |
| Employer (CAIC) IP on sample data | **Low** (data is synthetic reconstruction, not raw) | Repos set **private**; confirm employer data policy before making public |
| Trademark conflict | **None** — "XRD", "Scherrer", "Williamson-Hall", "PtCo L1₀" are generic scientific terms | — |
| Missing license/attribution | **None** — LICENSE + README included in each repo | — |

## 7. Recommendation
- Code is safe to release under MIT.
- Keep both repositories **private** for now (per user instruction), especially while the demo embeds reconstructed real-sample peak parameters; revisit publicity after confirming employer (CAIC) data/IP policy.
- Each repo ships: `index.html` (the tool), `README.md`, `LICENSE`.
