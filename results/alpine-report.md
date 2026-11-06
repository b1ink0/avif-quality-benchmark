# AVIF on Debian 13 vs Alpine 3.24 (73 images)

Debian 13: GD with libavif 1.2.1, Imagick 7.1.1-43 with libheif 1.23.6, both on libaom 3.12.1 (tune=ssim).
Alpine 3.24: GD with libavif 1.4.1, Imagick 7.1.2-35 with libheif 1.23.4, both on libaom 3.14.1 (tune=iq by default).
Matches means SSIMULACRA 2, Butteraugli and DSSIM all score the AVIF at least as well as the baseline from the same editor and stack.

## Lowest matching AVIF quality per image sub-size

| Baseline | Editor | Stack | Units | Median | 75th pct | 90th pct |
| --- | --- | --- | --- | --- | --- | --- |
| JPEG 82 | GD | Debian 13 | 266 | 66 | 74 | 77 |
| JPEG 82 | GD | Alpine 3.24 | 266 | 60 | 64 | 66 |
| JPEG 82 | Imagick | Debian 13 | 266 | 68 | 74 | 76 |
| JPEG 82 | Imagick | Alpine 3.24 | 266 | 68 | 69.5 | 72 |
| WebP 82 | GD | Debian 13 | 266 | 66 | 70 | 76 |
| WebP 82 | GD | Alpine 3.24 | 266 | 60 | 66 | 72 |
| WebP 82 | Imagick | Debian 13 | 266 | 66 | 68 | 70 |
| WebP 82 | Imagick | Alpine 3.24 | 266 | 68 | 68 | 72 |
| WebP 86 | GD | Debian 13 | 266 | 74 | 78 | 87 |
| WebP 86 | GD | Alpine 3.24 | 266 | 68 | 74 | 86 |
| WebP 86 | Imagick | Debian 13 | 266 | 74 | 76 | 78 |
| WebP 86 | Imagick | Alpine 3.24 | 266 | 72 | 76 | 80 |

## One AVIF quality vs JPEG 82: share that matches, median size vs JPEG 82

| AVIF | GD Debian 13 | GD Alpine 3.24 | Imagick Debian 13 | Imagick Alpine 3.24 |
| --- | --- | --- | --- | --- |
| 62 | 33%, 56% | 70%, 64% | 30%, 57% | 23%, 53% |
| 64 | 42%, 58% | 80%, 66% | 34%, 59% | 30%, 57% |
| 66 | 51%, 62% | 94%, 70% | 45%, 63% | 35%, 60% |
| 68 | 60%, 63% | 95%, 72% | 54%, 65% | 75%, 66% |
| 70 | 65%, 65% | 97%, 74% | 62%, 67% | 83%, 68% |
| 72 | 73%, 68% | 97%, 77% | 73%, 70% | 96%, 72% |
| 74 | 83%, 72% | 98%, 82% | 86%, 74% | 99%, 74% |
| 76 | 90%, 75% | 99%, 86% | 91%, 78% | 100%, 80% |
| 78 | 95%, 78% | 99%, 89% | 97%, 81% | 100%, 83% |
| 80 | 97%, 82% | 99%, 93% | 99%, 85% | 100%, 89% |
| 82 | 99%, 91% | 99%, 101% | 100%, 93% | 100%, 93% |
| 84 | 99%, 96% | 99%, 109% | 100%, 98% | 100%, 100% |

## One AVIF quality vs WebP 82: share that matches, median size vs WebP 82

| AVIF | GD Debian 13 | GD Alpine 3.24 | Imagick Debian 13 | Imagick Alpine 3.24 |
| --- | --- | --- | --- | --- |
| 62 | 11%, 82% | 68%, 89% | 10%, 80% | 20%, 73% |
| 64 | 26%, 84% | 74%, 91% | 26%, 83% | 38%, 78% |
| 66 | 50%, 90% | 80%, 97% | 65%, 88% | 48%, 81% |
| 68 | 66%, 92% | 85%, 99% | 81%, 91% | 80%, 90% |
| 70 | 77%, 95% | 87%, 103% | 91%, 95% | 86%, 93% |
| 72 | 82%, 98% | 88%, 106% | 95%, 97% | 94%, 98% |
| 74 | 86%, 105% | 93%, 112% | 97%, 105% | 96%, 101% |
| 76 | 89%, 110% | 94%, 117% | 98%, 109% | 98%, 107% |
| 78 | 90%, 114% | 95%, 120% | 98%, 114% | 98%, 110% |
| 80 | 92%, 119% | 95%, 126% | 98%, 119% | 99%, 118% |
| 82 | 95%, 130% | 95%, 135% | 99%, 130% | 98%, 122% |
| 84 | 95%, 136% | 95%, 146% | 98%, 136% | 99%, 133% |

## One AVIF quality vs WebP 86: share that matches, median size vs WebP 86

| AVIF | GD Debian 13 | GD Alpine 3.24 | Imagick Debian 13 | Imagick Alpine 3.24 |
| --- | --- | --- | --- | --- |
| 62 | 2%, 70% | 19%, 77% | 1%, 69% | 4%, 62% |
| 64 | 3%, 72% | 23%, 79% | 1%, 71% | 7%, 67% |
| 66 | 5%, 77% | 42%, 83% | 3%, 76% | 9%, 69% |
| 68 | 6%, 79% | 51%, 85% | 6%, 78% | 25%, 77% |
| 70 | 9%, 82% | 59%, 88% | 12%, 81% | 33%, 79% |
| 72 | 20%, 84% | 66%, 91% | 26%, 83% | 57%, 84% |
| 74 | 52%, 90% | 74%, 97% | 68%, 89% | 69%, 86% |
| 76 | 67%, 94% | 79%, 101% | 83%, 93% | 83%, 92% |
| 78 | 74%, 97% | 81%, 104% | 94%, 97% | 88%, 95% |
| 80 | 79%, 101% | 84%, 108% | 96%, 101% | 96%, 102% |
| 82 | 85%, 111% | 87%, 116% | 98%, 111% | 97%, 105% |
| 84 | 86%, 117% | 88%, 125% | 98%, 117% | 98%, 113% |

## Same AVIF quality number on both stacks: Alpine vs Debian (median)

| AVIF | GD size | GD SSIMULACRA 2 change | Imagick size | Imagick SSIMULACRA 2 change |
| --- | --- | --- | --- | --- |
| 60 | 111% | 3.02 | 91% | -0.07 |
| 66 | 107% | 2.32 | 91% | -0.16 |
| 70 | 107% | 1.93 | 98% | 0.86 |
| 74 | 107% | 1.54 | 96% | 0.39 |
| 78 | 106% | 1.29 | 98% | 0.53 |
| 82 | 105% | 0.83 | 96% | 0.11 |
