# XRD-PtCoOrdering

**有序度与晶粒尺寸联合分析 · v2.0.0**

纯浏览器、离线单文件 HTML；中文默认，支持英文切换。使用同一份 XRD 谱图计算 PtCo L1₀ 有序度与 Scherrer 晶粒尺寸，数据不上传服务器。

**[下载可直接运行的 HTML](https://github.com/ANDYPENG09/XRD-PtCoOrdering/releases/download/v2.0.0/XRD-PtCoOrdering-v2.0.0.html)** · [Release 与校验文件](https://github.com/ANDYPENG09/XRD-PtCoOrdering/releases/latest)

下载 `.html` 后直接用浏览器打开，无需安装、联网或启动服务器。GitHub 自动附带的 Source code 压缩包与这里的可运行 HTML 附件不同。

## 两种有序度模式

与提供的两条公式逐一对应。`S_hkl` 表示实测扣背景积分峰面积；`I⁰_hkl` 为参考积分强度。

| 模式 | 归一化比值 R | 报告结果 |
|---|---|---|
| 模式 1：两峰法 | `(S110 / S111) / (I⁰110 / I⁰111)` | `100 × R (%)` |
| 模式 2：四峰法 | `[S110 / (S111 + S200 + S002)] / [I⁰110 / (I⁰111 + I⁰200 + I⁰002)]` | `100 × R (%)` |

- 模式 1 只读取 (110)/(111)；不依赖 (200)/(002)、其参考值或高角度数据。
- 模式 2 联合拟合重叠的 (200)/(002)，避免将重叠面积重复计入。
- 可从原始谱图拟合，也可手动输入已扣背景的积分峰面积。
- 两种公式都按图中定义直接报告百分比。可选附加 `100 × √R` 长程有序参数，须填写参考来源并确认全有序标定适用；不会替换主结果。
- 超过 100% 的数值保留，并提示复核参考、背景、成分与择优取向。

默认参考 `20:100:55:45` **仅为演示数值**，不构成独立的全有序标定。实测分析须换为适合成分、测试几何和校正条件的参考积分强度；峰高和积分面积不可直接混用。这里实现的是给定的归一化面积指标，不能仅凭演示数据将其认定为已验证的绝对长程有序参数。

## 拟合与粒径功能

- 高斯峰与线性背景联合 Levenberg–Marquardt 拟合，或 SNIP 扣背景后高斯拟合。输出峰位、FWHM、全峰模型积分、RMS、R² 与边界/峰尾诊断。
- 修正旧版单峰高斯模型与雅可比参数顺序不一致，以及 LM 参数缩放问题；使用多个初始峰宽改善重叠峰收敛。
- 整合 [XRD-Scherrer](https://github.com/ANDYPENG09/XRD-Scherrer) 的单峰、多峰、仪器展宽、W–H 与独立 TEM 经验修正功能。
- Scherrer：`D = Kλ / (β cosθ)`。`θ = (2θ)/2`；β 用弧度；λ 输入 Å，D 输出 nm。
- β 可选 FWHM 或积分宽度 `area/height`。仪器校正独立选择 Gaussian 二次相减或 Cauchy 线性相减；仪器宽度必须使用相同展宽定义，并适用于相应角度。
- 直接峰宽模式采用端点线性背景或 SNIP，半高交点插值和真实梯形面积积分；高斯拟合模式积分整个峰模型。
- W–H：`β cosθ = Kλ/D + 4ε sinθ`；至少 3 个不同、同相、无重叠反射。非正截距或显著负斜率不报告物理尺寸/应变。
- TEM 经验修正 `D × C` 需要正系数与标定来源，独立列出，不替代 Scherrer D。

“粒径”在此为**相干衍射晶域尺寸**，不直接等于 TEM 颗粒直径。未实现 Kα₂ 剥离；应使用单色或预处理谱图。微应变、缺陷、峰重叠与各向异性会影响结果。W–H 为各向同性均匀形变近似，高 R² 也不能验证假设。结果不包含完整不确定度预算。

## 使用与导出

1. 导入谱图，或载入标识明确的合成示例。
2. 选择两峰/四峰公式，检查参考强度、峰窗口、初始峰位与拟合曲线。
3. 在“晶粒尺寸”页选择 K、λ、展宽和仪器校正，分析单峰或多峰。
4. “结果与导出”页合并导出已有的两类结果。JSON 记录设置和参考来源，UTF-8 BOM CSV 可用 Excel/Origin 打开。

修改参数会清除相应旧结果；重新导入数据清除全部结果。语言和显示选项保留结果。

支持文本 `.xy .xye .csv .txt .dat .asc .ras`（前两列为角度、强度），以及 JSON `{"x":[...],"y":[...]}`、`[[angle,intensity],...]`、`[{"x":angle,"y":intensity},...]`。二进制专有格式需先导出文本。降序扫描自动反转；重复、非单调、非有限、全零输入被拒绝。SNIP 需要近似等间距角度。最多 250,000 点。

## English

Offline single-file XRD ordering and crystallite-size analysis with Chinese/English UI. Download the release HTML and open it directly in a browser; no runtime dependencies or uploads.

The two formula modes implement the supplied normalized integrated-area ratios: **(110)/(111)** and **(110)/[(111)+(200)+(002)]**, both reported as `100 × R`. Mode 1 does not require the higher-angle peaks. Mode 2 simultaneously deconvolves (200)/(002). Manual integrated-area input is available. The optional calibrated `100 × √R` metric is separate and requires reference provenance and calibration confirmation. Demonstration reference values are not certified calibration data.

The integrated Scherrer module supports single/multi-peak widths, FWHM/integral breadth, Gaussian/Cauchy instrument corrections, isotropic Williamson–Hall, and an independently reported TEM factor. Crystallite domain size is not necessarily particle diameter. Kα₂ stripping is not implemented. Exports preserve settings, units, raw metrics and reference provenance.

## Development and releases

```bash
npm ci
npm test
```

17 numerical/DOM regression groups cover both equations, square-root gating, Gaussian derivatives and intensity scaling, known overlapping peaks, truncated scans, Scherrer units and profile corrections, W–H physicality, bilingual UI, combined exports, malformed input and stale-result invalidation. DOM tests mock canvas I/O.

After the validation job succeeds on `main`, the release job publishes an uncreated version from `package.json`, using `.github/release-notes/vVERSION.md`. It attaches **`XRD-PtCoOrdering-vVERSION.html` and `SHA256SUMS.txt`**. Existing version tags/releases are preserved. Bump the package version and supply matching notes for a new release.

References: [IUCr: Scherrer width, International Tables §3.2.2.3](https://onlinelibrary.wiley.com/iucr/itc/Ha/ch3o2v0001/sec3o2o2o3/); [Williamson & Hall (1953), doi:10.1016/0001-6160(53)90006-6](https://doi.org/10.1016/0001-6160(53)90006-6). The ordering definitions follow the two equations supplied for this update; no bibliographic source for that image was provided.

[Changelog](CHANGELOG.md) · [License audit](LICENSE_AUDIT.md) · [MIT License](LICENSE)
