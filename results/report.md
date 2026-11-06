# AVIF quality that matches JPEG 82 and WebP in WordPress

384 source images, 4389 image sub-sizes over 3 editors, 153615 encodes.

| Data set | Content | Images |
| --- | --- | --- |
| Kodak | Photo | 24 |
| CLIC 2020 | Photo | 41 |
| CID22 | Photo | 250 |
| Plugin test images | Photo | 4 |
| Web page screenshots | Screenshot | 20 |
| Theme screenshots | Screenshot | 5 |
| Wikimedia diagrams | Diagram | 40 |

Every sub-size WordPress creates is encoded by the editor that creates it (GD, Imagick or the browser through wasm-vips) and compared with the lossless sub-size from the same editor. "Matches" means the AVIF file scores at least as well as the baseline file. "All but VMAF" means SSIMULACRA 2, Butteraugli and DSSIM all agree.

## Matching AVIF quality (all but VMAF)

Median over every image sub-size, the 95% interval of that median (resampling images), the 75th and 90th percentile, and the median AVIF size vs the baseline file at the matching quality.

| Baseline | Editor | Median | 95% interval | 75th pct | 90th pct | AVIF size vs baseline |
| --- | --- | --- | --- | --- | --- | --- |
| JPEG 82 | GD | 66 | 66 to 68 | 74 | 78 | 67% |
| JPEG 82 | Imagick | 68 | 66 to 68 | 74 | 76 | 69% |
| JPEG 82 | Browser | 68 | 68 to 68 | 70 | 72 | 69% |
| WebP 82 | GD | 66 | 66 to 66 | 70 | 80 | 89% |
| WebP 82 | Imagick | 66 | 66 to 66 | 66 | 70 | 86% |
| WebP 82 | Browser | 68 | 68 to 68 | 70 | 74 | 89% |
| WebP 86 | GD | 74 | 74 to 74 | 78 | 90 | 90% |
| WebP 86 | Imagick | 74 | 74 to 74 | 74 | 76 | 87% |
| WebP 86 | Browser | 74 | 72 to 74 | 76 | 80 | 88% |

## Matching AVIF quality per metric (median)

| Baseline | Editor | All but VMAF | SSIMULACRA 2 | Butteraugli | DSSIM | VMAF | All four |
| --- | --- | --- | --- | --- | --- | --- | --- |
| JPEG 82 | GD | 66 | 64 | 62 | 66 | 74 | 74 |
| JPEG 82 | Imagick | 68 | 64 | 62 | 66 | 80 | 80 |
| JPEG 82 | Browser | 68 | 66 | 66 | 68 | 78 | 78 |
| WebP 82 | GD | 66 | 64 | 66 | 64 | 64 | 68 |
| WebP 82 | Imagick | 66 | 64 | 64 | 64 | 64 | 66 |
| WebP 82 | Browser | 68 | 66 | 68 | 66 | 68 | 68 |
| WebP 86 | GD | 74 | 74 | 74 | 72 | 72 | 76 |
| WebP 86 | Imagick | 74 | 74 | 72 | 72 | 72 | 74 |
| WebP 86 | Browser | 74 | 72 | 72 | 70 | 74 | 76 |

## Matching AVIF quality by content type (all but VMAF, median)

| Content type | JPEG 82, GD | JPEG 82, Imagick | JPEG 82, Browser | WebP 82, GD | WebP 82, Imagick | WebP 82, Browser | WebP 86, GD | WebP 86, Imagick | WebP 86, Browser |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Photo | 68 | 70 | 68 | 66 | 66 | 68 | 74 | 74 | 74 |
| Screenshot | 52 | 56 | 56 | 66 | 66 | 68 | 74 | 74 | 74 |
| Diagram | 62 | 60 | 60 | 72 | 64 | 68 | 78 | 72 | 70 |

## Matching AVIF quality by data set (all but VMAF, median)

| Data set | JPEG 82, GD | JPEG 82, Imagick | JPEG 82, Browser | WebP 82, GD | WebP 82, Imagick | WebP 82, Browser | WebP 86, GD | WebP 86, Imagick | WebP 86, Browser |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Kodak | 70 | 72 | 68 | 68 | 66 | 68 | 76 | 74 | 76 |
| CLIC 2020 | 72 | 74 | 68 | 66 | 66 | 68 | 74 | 74 | 72 |
| CID22 | 68 | 68 | 68 | 66 | 66 | 68 | 74 | 74 | 74 |
| Plugin test images | 66 | 68 | 68 | 66 | 66 | 72 | 74 | 74 | 80 |
| Web page screenshots | 52 | 54 | 56 | 64 | 66 | 68 | 74 | 74 | 74 |
| Theme screenshots | 64 | 66 | 66 | 66 | 68 | 68 | 74 | 74 | 72 |
| Wikimedia diagrams | 62 | 60 | 60 | 72 | 64 | 68 | 78 | 72 | 70 |

## Matching AVIF quality by sub-size (all but VMAF, median)

| Sub-size | JPEG 82, GD | JPEG 82, Imagick | JPEG 82, Browser | WebP 82, GD | WebP 82, Imagick | WebP 82, Browser | WebP 86, GD | WebP 86, Imagick | WebP 86, Browser |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| thumbnail | 64 | 66 | 68 | 66 | 66 | 68 | 74 | 74 | 76 |
| medium | 67 | 68 | 68 | 66 | 66 | 68 | 74 | 74 | 74 |
| medium_large | 66 | 64 | 64 | 66 | 66 | 68 | 74 | 74 | 72 |
| large | 66 | 66 | 64 | 66 | 66 | 68 | 74 | 74 | 72 |
| 1536x1536 | 72 | 66 | 64 | 66 | 66 | 64 | 76 | 74 | 70 |
| 2048x2048 | 52 | 56 | 56 | 64 | 66 | 68 | 74 | 76 | 74 |
| full | 72 | 70 | 68 | 66 | 66 | 66 | 74 | 74 | 72 |

## One AVIF quality for every image

Share of image sub-sizes where AVIF at that quality matches the baseline (all but VMAF, and SSIMULACRA 2 alone), and the median AVIF size vs the baseline file.

### JPEG 82

| AVIF | GD matches | GD SSIMULACRA 2 | GD size | Imagick matches | Imagick SSIMULACRA 2 | Imagick size | Browser matches | Browser SSIMULACRA 2 | Browser size |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 60 | 25% | 36% | 53% | 23% | 32% | 54% | 19% | 24% | 52% |
| 62 | 31% | 46% | 56% | 30% | 42% | 57% | 22% | 28% | 54% |
| 64 | 39% | 54% | 58% | 36% | 50% | 59% | 29% | 40% | 58% |
| 66 | 50% | 65% | 61% | 48% | 64% | 63% | 34% | 50% | 60% |
| 68 | 59% | 72% | 63% | 57% | 71% | 65% | 73% | 92% | 68% |
| 70 | 65% | 78% | 65% | 66% | 78% | 67% | 82% | 96% | 70% |
| 72 | 72% | 83% | 68% | 74% | 83% | 69% | 94% | 99% | 74% |
| 74 | 83% | 91% | 72% | 85% | 92% | 74% | 97% | 100% | 76% |
| 76 | 88% | 95% | 75% | 91% | 96% | 77% | 99% | 100% | 81% |
| 78 | 92% | 97% | 79% | 95% | 98% | 81% | 99% | 100% | 84% |
| 80 | 94% | 98% | 82% | 97% | 99% | 84% | 100% | 100% | 90% |
| 82 | 97% | 99% | 91% | 99% | 100% | 93% | 100% | 100% | 93% |
| 84 | 97% | 100% | 96% | 100% | 100% | 98% | 100% | 100% | 101% |
| 86 | 98% | 100% | 102% | 100% | 100% | 104% | 100% | 100% | 105% |

### WebP 82

| AVIF | GD matches | GD SSIMULACRA 2 | GD size | Imagick matches | Imagick SSIMULACRA 2 | Imagick size | Browser matches | Browser SSIMULACRA 2 | Browser size |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 60 | 7% | 13% | 76% | 6% | 13% | 75% | 13% | 20% | 72% |
| 62 | 16% | 30% | 80% | 18% | 30% | 79% | 18% | 26% | 74% |
| 64 | 30% | 50% | 83% | 37% | 52% | 82% | 29% | 42% | 79% |
| 66 | 58% | 77% | 88% | 74% | 84% | 87% | 38% | 51% | 81% |
| 68 | 70% | 87% | 91% | 87% | 94% | 90% | 71% | 86% | 91% |
| 70 | 79% | 93% | 94% | 94% | 98% | 93% | 79% | 91% | 93% |
| 72 | 82% | 95% | 97% | 95% | 99% | 96% | 88% | 98% | 98% |
| 74 | 86% | 97% | 104% | 97% | 100% | 103% | 92% | 99% | 101% |
| 76 | 88% | 98% | 108% | 98% | 100% | 108% | 95% | 100% | 107% |
| 78 | 88% | 98% | 112% | 97% | 100% | 112% | 96% | 100% | 111% |
| 80 | 90% | 99% | 117% | 98% | 100% | 117% | 97% | 100% | 118% |
| 82 | 91% | 99% | 129% | 98% | 100% | 129% | 97% | 100% | 122% |
| 84 | 91% | 99% | 135% | 98% | 100% | 135% | 97% | 100% | 131% |
| 86 | 92% | 99% | 142% | 98% | 100% | 143% | 97% | 100% | 136% |

### WebP 86

| AVIF | GD matches | GD SSIMULACRA 2 | GD size | Imagick matches | Imagick SSIMULACRA 2 | Imagick size | Browser matches | Browser SSIMULACRA 2 | Browser size |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 60 | 1% | 3% | 65% | 1% | 3% | 63% | 3% | 5% | 61% |
| 62 | 3% | 5% | 68% | 2% | 6% | 67% | 5% | 8% | 63% |
| 64 | 3% | 6% | 71% | 3% | 7% | 69% | 7% | 11% | 68% |
| 66 | 6% | 11% | 75% | 6% | 12% | 74% | 10% | 16% | 70% |
| 68 | 9% | 17% | 77% | 11% | 20% | 76% | 26% | 39% | 78% |
| 70 | 16% | 29% | 80% | 19% | 32% | 79% | 32% | 46% | 80% |
| 72 | 26% | 44% | 83% | 32% | 49% | 82% | 48% | 63% | 84% |
| 74 | 60% | 81% | 88% | 78% | 88% | 88% | 58% | 74% | 87% |
| 76 | 73% | 89% | 92% | 91% | 96% | 92% | 76% | 90% | 92% |
| 78 | 78% | 93% | 96% | 95% | 99% | 95% | 83% | 96% | 95% |
| 80 | 80% | 94% | 100% | 96% | 100% | 99% | 92% | 100% | 102% |
| 82 | 84% | 97% | 109% | 98% | 100% | 109% | 94% | 100% | 105% |
| 84 | 86% | 97% | 115% | 98% | 100% | 115% | 96% | 100% | 113% |
| 86 | 87% | 98% | 121% | 98% | 100% | 122% | 96% | 100% | 117% |

## Baselines compared with each other

Median size vs JPEG 82 from the same editor, and the share of image sub-sizes that match JPEG 82 (all but VMAF).

| Format | GD size | GD matches | Imagick size | Imagick matches | Browser size | Browser matches |
| --- | --- | --- | --- | --- | --- | --- |
| WebP 82 | 70% | 39% | 72% | 34% | 72% | 40% |
| WebP 86 | 83% | 73% | 84% | 72% | 84% | 75% |
| WebP 90 | 103% | 94% | 105% | 95% | 105% | 95% |
| AVIF 70 | 65% | 65% | 67% | 66% | 70% | 82% |
| AVIF 74 | 72% | 83% | 74% | 85% | 76% | 97% |
| AVIF 82 | 91% | 97% | 93% | 99% | 93% | 100% |
