# AVIF quality in WordPress

A benchmark and a blind visual test to find which AVIF quality matches JPEG 82, the long-standing WordPress default, and WebP 82, the WebP quality of the [Modern Image Formats](https://github.com/WordPress/performance/tree/trunk/plugins/webp-uploads) plugin.

- Site: https://b1ink0.github.io/avif-vs-webp-quality/
- Issue: [WordPress/performance#2745](https://github.com/WordPress/performance/issues/2745)

## Why

WordPress encodes AVIF at quality 82 by default, the same number as JPEG. No format defines a 0 to 100 scale. Each encoder library maps the number to its own quantizer, and quality 82 is a much higher visual quality for AVIF than for JPEG or WebP. AVIF files at 82 come out larger than WebP and often larger than the JPEG they replace. With "Output fallback images" enabled, the plugin then discards most AVIF sub-sizes for not being smaller than the JPEG.

| Editor | Affected since | Why |
| --- | --- | --- |
| GD | WordPress 6.5 | `imageavif()` has always received quality 82 ([libgd mapping](https://github.com/php/php-src/blob/b817a4f71870a21e5cea844d397f21e54f8926d5/ext/gd/libgd/gd_avif.c#L79-L85)). |
| Imagick | WordPress 6.7 | Before 6.7 the quality never reached the AVIF encoder, so libheif's default of 50 applied ([libheif mapping](https://github.com/strukturag/libheif/blob/12a259a5882dd99d45ec5fc77e296a3b620d1e2e/libheif/plugins/encoder_aom.cc#L1139-L1148)). [r59247](https://github.com/WordPress/wordpress-develop/commit/b5df5f08e0a43a05a2a52b5c151028e0c6a6d14d) ([#61614](https://core.trac.wordpress.org/ticket/61614)) fixed that. |
| Browser (client side media processing) | WordPress 7.1 | The browser reads the same quality filter ([performance#2663](https://github.com/WordPress/performance/pull/2663)). |

This repository measures the AVIF quality that matches JPEG 82 and WebP 82 for every editor and every WordPress sub-size, with four quality metrics, and lets people check the result by eye.

## Results

384 images, every WordPress sub-size, the GD, Imagick and browser editors, 153,615 encodes. "Matches" means the AVIF file scores at least as well as the baseline file from the same editor on SSIMULACRA 2, Butteraugli and DSSIM. VMAF is reported separately in the full report. Each cell is the share of sub-sizes that match, then the median file size compared with the baseline.

### Against JPEG 82

| AVIF quality | GD | Imagick | Browser |
| --- | --- | --- | --- |
| 66 | 50%, 61% | 48%, 63% | 34%, 60% |
| 70 | 65%, 65% | 66%, 67% | 82%, 70% |
| 72 | 72%, 68% | 74%, 69% | 94%, 74% |
| **74** | **83%, 72%** | **85%, 74%** | **97%, 76%** |
| 76 | 88%, 75% | 91%, 77% | 99%, 81% |
| 78 | 92%, 79% | 95%, 81% | 99%, 84% |
| 82 (current) | 97%, 91% | 99%, 93% | 100%, 93% |
| WebP 86 (core's WebP) | 73%, 83% | 72%, 84% | 75%, 84% |
| WebP 82 (plugin's WebP) | 39%, 70% | 34%, 72% | 40%, 72% |

Lowest AVIF quality that matches JPEG 82, per sub-size:

| Editor | Median | 75th percentile | 90th percentile |
| --- | --- | --- | --- |
| GD | 66 | 74 | 78 |
| Imagick | 68 | 74 | 76 |
| Browser | 68 | 70 | 72 |

### Against WebP 82

| AVIF quality | GD | Imagick | Browser |
| --- | --- | --- | --- |
| 66 | 58%, 88% | 74%, 87% | 38%, 81% |
| 68 | 70%, 91% | 87%, 90% | 71%, 91% |
| **70** | **79%, 94%** | **94%, 93%** | **79%, 93%** |
| 72 | 82%, 97% | 95%, 96% | 88%, 98% |
| 74 | 86%, 104% | 97%, 103% | 92%, 101% |
| 82 (current) | 91%, 129% | 98%, 129% | 97%, 122% |

The lowest AVIF quality that matches WebP 82 has a median of 66 (GD and Imagick) and 68 (browser).

### By content

Median lowest AVIF quality that matches JPEG 82: photos 68 to 70, diagrams 60 to 62, screenshots 52 to 56. JPEG is weak on flat colours and sharp text, so AVIF matches it at much lower qualities there. Against WebP 82 the medians stay at 64 to 72 for every content type.

### Proposed values

- **Core:** AVIF 74. It matches JPEG 82 on 83% to 97% of sub-sizes at 72% to 76% of the JPEG size. That is more often than core's WebP 86 matches JPEG 82, and smaller than WebP 86.
- **Plugin:** AVIF 70. It matches the plugin's WebP 82 on most images and keeps AVIF about 6% to 7% smaller than WebP 82.

The full report with per metric, per data set and per sub-size tables is in [results/report.md](results/report.md). Every encode with its size and scores is in [results/results.csv.gz](results/results.csv.gz).

### Newer libavif and libheif (Alpine 3.24)

73 of the images were run again on Alpine 3.24 (libavif 1.4.1, ImageMagick 7.1.2-35 with libheif 1.23.4, libaom 3.14.1), where GD and Imagick use libaom's `tune=iq`. The same 73 images from the main run are the comparison.

| Editor | Libraries | AVIF 74 looks at least as good as JPEG 82 | AVIF 74 size vs JPEG 82 |
| --- | --- | --- | --- |
| GD | Current (libavif 1.2.1) | 83% | 72% |
| GD | Newer (libavif 1.4.1) | 98% | 82% |
| Imagick | Current (libheif 1.23.6, libaom 3.12.1) | 86% | 74% |
| Imagick | Newer (libheif 1.23.4, libaom 3.14.1) | 99% | 74% |

With GD the same quality number gives about 7% larger and better files, because PHP fixes the compression level and the new tuning spends more bytes at that level. With Imagick, libheif changes the quality scale with the tuning, so sizes stay about the same. AVIF 74 stays a safe default on both. Full tables are in [results/alpine-report.md](results/alpine-report.md) and every encode is in [results/alpine-results.csv.gz](results/alpine-results.csv.gz).

## Visual test

The [test page](https://b1ink0.github.io/avif-vs-webp-quality/) asks which AVIF quality looks as good as JPEG 82.

1. Open the site.
2. In the toolbar above the image, pick the WordPress editor: **Server GD** (the most common), **Server Imagick** or **Browser upload**. Next to it, pick what to compare with: **JPEG 82** (the default), **WebP 82** or **WebP 86**. Zoom (1x, 2x, 3x) and your progress are on the right of the same toolbar.
3. Drag the divider on the image to compare the baseline (left) with AVIF (right).
4. Use the slider under the image (or the − and + buttons) to find the **lowest** AVIF quality that still looks as good as the baseline.
5. Press **Save and next**, or **Skip image** if you are unsure. **Back** returns to the previous image.
6. Press **Finish and share** at any time. The results screen has three steps:
   1. Check your results: your pick per image, and the AVIF size compared with the baseline.
   2. Add details (optional): your screen and any notes.
   3. Share (optional): **Copy and open the issue** copies your results and opens the GitHub issue, where you paste them as a comment. No GitHub account? Use **Copy results** and send the text to the person who shared the page, or **Download JSON**.

The AVIF slider covers quality 50 to 90 in steps of 2. Images are shown in a random order, and each one starts at a random point on the slider. The quality number is hidden so it does not bias the choice. Changing the editor or the baseline starts a new round. Progress is saved in your browser, so you can stop and come back.

## Explore all encodes

The [explorer](https://b1ink0.github.io/avif-vs-webp-quality/explore.html) shows three encodes of the same image side by side. It opens with JPEG 82, WebP 82 and AVIF 74 from GD.

- The toolbar switches images (‹ and ›) and zoom.
- Each column has its own format (Original, JPEG, WebP, AVIF), editor (GD, Imagick, Browser) and quality.
- Scrolling one image scrolls the other two to the same spot.
- Under each column are the file size and the SSIMULACRA 2, Butteraugli, DSSIM and VMAF scores. Columns 2 and 3 also show their size as a percentage of column 1. Green is better than column 1, red is worse and gray is the same.

## Site images

The site has 37 images, each with the lossless reference, JPEG 82, every WebP quality (70 to 94) and every AVIF quality (50 to 90) from all three editors, taken from the benchmark run. Images up to 1024 pixels wide use the `full` size, all others use `medium_large` (768 pixels wide).

- All 24 Kodak photos.
- 13 images from the other sets, picked so that the matching AVIF quality differs between them:

| Image | Set | Why | Lowest AVIF that matches JPEG 82 (GD, Imagick, Browser) |
| --- | --- | --- | --- |
| `clic-allef-vinicius-109434` | CLIC 2020 | Photo that needs a high AVIF quality | 82, 82, 76 |
| `clic-andrew-ruiz-376` | CLIC 2020 | Photo close to the median | 68, 70, 72 |
| `clic-amy-zhang-15940` | CLIC 2020 | Photo that needs a low AVIF quality | 64, 70, 68 |
| `cid22-2156881` | CID22 | Photo that needs a high AVIF quality | 82, 78, 76 |
| `cid22-1001682` | CID22 | Photo close to the median | 68, 68, 68 |
| `cid22-1173777` | CID22 | Photo that needs a low AVIF quality | 58, 62, 66 |
| `commons-diagram33` | Wikimedia diagram | Diagram that needs a high AVIF quality | 72, 72, 64 |
| `commons-diagram29` | Wikimedia diagram | Diagram close to the photo median | 66, 72, 62 |
| `commons-diagram21` | Wikimedia diagram | Diagram that needs a low AVIF quality | 60, 60, 56 |
| `web-screen01` | Web page screenshot | Wikipedia page with text, low AVIF quality | 52, 52, 56 |
| `theme-twentytwentyfour` | Theme screenshot | Screenshot with photos, high AVIF quality | 74, 74, 70 |
| `plugin-dice` | Plugin test image | Rendered image, high AVIF quality | 72, 72, 64 |
| `plugin-leaves` | Plugin test image | Photo where the editors disagree | 58, 62, 68 |

## Reproduce

### What runs where

| Part | Version |
| --- | --- |
| Base image | Official `wordpress:php8.3-apache` (Debian 13), with WordPress 7.1.4 and PHP 8.3 |
| GD | PHP GD with libavif 1.2.1 and libaom 3.12.1 |
| Imagick | ImageMagick 7.1.1-43 with libheif 1.23.6 and libaom 3.12.1 |
| Browser | [wasm-vips](https://github.com/kleisauke/wasm-vips) 0.0.19 (libheif 1.23.5, libaom 3.15.1), as used by `@wordpress/vips` |
| SSIMULACRA 2 and Butteraugli | [libjxl](https://github.com/libjxl/libjxl) 0.11.1 tools |
| DSSIM | [dssim](https://github.com/kornelski/dssim) 3.4.0 |
| VMAF | Static [ffmpeg](https://github.com/BtbN/FFmpeg-Builds) 9.0 build with libvmaf |

Every sub-size WordPress creates (thumbnail to 2048x2048, plus the full size scaled to 2560) is made by the editor that creates it, in the same way the editor does:

- `bench/wp-encode.php` loads `WP_Image_Editor_GD` and `WP_Image_Editor_Imagick` from WordPress, resizes like core and saves through `_save()` with the quality from the `wp_editor_set_quality` filter.
- `bench/vips-encode.mjs` resizes like `@wordpress/vips` (`thumbnailBuffer` with `size: 'down'` and centre crop) and saves AVIF with `effort` 2 and the ICC profile kept.

Each sub-size is saved as a lossless PNG reference, JPEG 82, WebP 70 to 94 and AVIF 50 to 90 (both in steps of 2). `bench/sizes.php` and `bench/sizes.json` hold the sizes and qualities. Each encode is decoded and scored against the reference from the same editor with SSIMULACRA 2 (higher is better), Butteraugli 3-norm (lower is better), DSSIM (lower is better) and VMAF (higher is better).

### 1. Prerequisites

- [Docker](https://docs.docker.com/get-docker/).
- On the host, to prepare the sources: zsh and ImageMagick 7 (`magick`). Node.js 18 or later for the analysis and the download scripts.
- Disk space: the sources take about 300 MB and the encodes about 9 GB.
- Memory: wasm-vips needs a few GB per process, so set the number of parallel jobs with that in mind.

### 2. Download the data sets

Put each set in its own folder under `raw/`.

| Set | Prefix | Download |
| --- | --- | --- |
| Kodak | `kodak` | The 24 PNG files `kodim01.png` to `kodim24.png` from https://r0k.us/graphics/kodak/ |
| CLIC 2020 professional validation | `clic` | https://data.vision.ee.ethz.ch/cvl/clic/professional_valid_2020.zip (41 PNG files in `valid/`) |
| CID22 | `cid22` | https://cloudinary-marketing-res.cloudinary.com/raw/upload/v1682032119/CID22.zip (7.2 GB, the 250 files in `CID22/original/` are used) |
| Plugin test images | `plugin` | `leaves.jpg`, `paint.jpeg`, `car.jpeg` and `dice.png` from [`plugins/webp-uploads/tests/data/images`](https://github.com/WordPress/performance/tree/trunk/plugins/webp-uploads/tests/data/images) |
| Theme screenshots | `theme` | `screenshot.png` of Twenty Twenty-One to Twenty Twenty-Five, from `https://downloads.wordpress.org/theme/<theme>.zip`. Rename each to the theme slug, for example `twentytwentyfive.png` |
| Wikimedia diagrams | `commons` | `node bench/commons.mjs > commons.json` then `node bench/fetch-diagrams.mjs commons.json raw/diagram` |
| Web page screenshots | `web` | `npm install playwright` then `node bench/screens.mjs raw/screen` (uses Google Chrome) |

`fetch-diagrams.mjs` takes a seeded sample from Commons' [Featured diagrams](https://commons.wikimedia.org/wiki/Category:Featured_diagrams) category, and `screens.mjs` takes screenshots of live pages. Both change over time, so a new run can give different files. The files used for the published results are listed in [bench/credits/diagrams.tsv](bench/credits/diagrams.tsv) and [bench/credits/screens.tsv](bench/credits/screens.tsv).

### 3. Prepare the sources

`bench/prep.sh` converts one raw file to an 8-bit sRGB PNG with alpha removed on a white background and metadata stripped, named `<prefix>-<file name>.png`. The prefix sets the data set and content type in the analysis.

```sh
mkdir -p src
for f in raw/kodak/*.png; do zsh bench/prep.sh "$f" kodak src; done
for f in raw/clic/valid/*.png; do zsh bench/prep.sh "$f" clic src; done
for f in raw/cid22/CID22/original/*.png; do zsh bench/prep.sh "$f" cid22 src; done
for f in raw/plugin/*; do zsh bench/prep.sh "$f" plugin src; done
for f in raw/theme/*.png; do zsh bench/prep.sh "$f" theme src; done
for f in raw/diagram/*.png; do zsh bench/prep.sh "$f" commons src; done
for f in raw/screen/*.png; do zsh bench/prep.sh "$f" web src; done
```

### 4. Build the image

```sh
docker build -t avif-bench bench
```

### 5. Run

The container expects this layout:

| Path | Contents |
| --- | --- |
| `/work/bench` | This `bench` folder |
| `/work/src` | The prepared PNG sources |
| `/work/out` | Output: `enc/<image>/<editor>/<size>__<format>__<quality>.<ext>`, `results/<image>__<editor>.csv` and `logs/` |

Check the tools first, then run every source with every editor:

```sh
docker run --rm -v "$PWD/bench:/work/bench" -v "$PWD/src:/work/src" -v "$PWD/out:/work/out" avif-bench bash /work/bench/check.sh
docker run --rm -v "$PWD/bench:/work/bench" -v "$PWD/src:/work/src" -v "$PWD/out:/work/out" avif-bench bash /work/bench/run-all.sh 8
```

The last argument is the number of parallel jobs. Finished jobs are skipped, so the run can be restarted. `bench/missing.sh` lists the source and editor pairs that have no result yet.

Each vips AVIF quality runs in its own process, because one wasm-vips heap cannot hold all AVIF saves of a 2560 pixel image.

Each result file has one row per encode, without a header: `image,editor,size,width,height,format,q,bytes,ssimulacra2,butteraugli,vmaf,dssim`.

### 6. Analyze

```sh
node bench/analyze-full.mjs out/results report.md
```

To rebuild [results/report.md](results/report.md) from the published results:

```sh
mkdir -p check
gzip -dc results/results.csv.gz | tail -n +2 > check/results.csv
node bench/analyze-full.mjs check report.md
```

### Newer libavif and libheif

With libaom 3.13 or later, [libavif 1.4.0](https://github.com/AOMediaCodec/libavif/blob/main/CHANGELOG.md) and [libheif 1.22.0](https://github.com/strukturag/libheif/releases/tag/v1.22.0) switch to libaom's `tune=iq` with a different quality to quantizer table. The browser path already uses it. `bench/Dockerfile.alpine` builds the same benchmark on Alpine 3.24, where GD and Imagick get these newer libraries. It reruns only GD and Imagick, and needs its own output folder.

```sh
docker build -t avif-bench-alpine -f bench/Dockerfile.alpine bench
docker run --rm -v "$PWD/bench:/work/bench" -v "$PWD/src:/work/src" -v "$PWD/out-alpine:/work/out" avif-bench-alpine bash /work/bench/run-alpine.sh 8
node bench/compare-stacks.mjs out/results out-alpine/results report-alpine.md
```

`run-alpine.sh` prints the GD, Imagick, libavif, libheif and libaom versions before it starts. The versions in the header of `compare-stacks.mjs` are written by hand, so check them against that output.

## Collecting the results

Sharing is optional. People who want to share paste their results as a comment on one GitHub issue. The page links to [#2745](https://github.com/WordPress/performance/issues/2745), set in `ISSUE_URL` at the top of the script in `index.html`.

Each shared comment has a JSON block with the editor, the baseline and the picks. To summarise them, run this with the [GitHub CLI](https://cli.github.com/) signed in:

```sh
node tools/collect.mjs https://github.com/WordPress/performance/issues/2745
```

It reads the issue comments (read only), keeps the newest result per person, editor and baseline, and prints for each editor and baseline the median quality overall and per image, with the AVIF size against the baseline at that quality. Results shared before the baseline picker was added have no baseline. They are counted as WebP 82, and their Kodak image names are matched to the current names. Their picks below AVIF 50 show no size, because the site no longer has those files.

## Data sets and licenses

| Set | Images | License |
| --- | --- | --- |
| [Kodak Lossless True Color Image Suite](https://r0k.us/graphics/kodak/) | 24 | Released by the Eastman Kodak Company for unrestricted usage |
| [CLIC 2020](https://archive.compression.cc/2021/tasks/index.html) professional validation set | 41 | Photos from Unsplash under the [Unsplash license](https://data.vision.ee.ethz.ch/cvl/clic/LICENSE_professional_2020.txt) ([unsplash.com/license](https://unsplash.com/license)) |
| [CID22](https://cloudinary.com/labs/cid22) | 250 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| [Modern Image Formats test images](https://github.com/WordPress/performance/tree/trunk/plugins/webp-uploads/tests/data/images) | 4 | [GPL-2.0-or-later](https://github.com/WordPress/performance/blob/trunk/LICENSE), as part of the WordPress Performance repository. `dice.png` is a copy of a [Wikimedia Commons image](https://commons.wikimedia.org/wiki/File:PNG_transparency_demonstration_1.png) under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Default theme screenshots, Twenty Twenty-One to Twenty Twenty-Five | 5 | [GPL-2.0-or-later](https://wordpress.org/about/license/), as part of each theme |
| [Wikimedia Commons featured diagrams](https://commons.wikimedia.org/wiki/Category:Featured_diagrams) | 40 | Public domain, CC0, CC BY or CC BY-SA, per file in [bench/credits/diagrams.tsv](bench/credits/diagrams.tsv) |
| Web page screenshots | 20 | Wikipedia pages: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). developer.wordpress.org pages: [GPL-2.0-or-later](https://wordpress.org/about/license/). Per file in [bench/credits/screens.tsv](bench/credits/screens.tsv) |

## Credits

Images on the site, all re-encoded from the sources below:

- `kodak-kodim01` to `kodak-kodim24`: [Kodak Lossless True Color Image Suite](https://r0k.us/graphics/kodak/), Eastman Kodak Company, unrestricted usage.
- `clic-allef-vinicius-109434`, `clic-andrew-ruiz-376`, `clic-amy-zhang-15940`: photos by Allef Vinicius, Andrew Ruiz and Amy Zhang on [Unsplash](https://unsplash.com), from the [CLIC 2020](https://archive.compression.cc/2021/tasks/index.html) professional validation set, [Unsplash license](https://unsplash.com/license).
- `cid22-2156881`, `cid22-1001682`, `cid22-1173777`: [CID22](https://cloudinary.com/labs/cid22) by Cloudinary, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- `commons-diagram21`: [Regulation of gene expression by steroid hormone receptor - Persian](https://commons.wikimedia.org/wiki/File:Regulation_of_gene_expression_by_steroid_hormone_receptor_-_Persian.svg), Wikimedia Commons, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- `commons-diagram29`: [Personal computer, exploded](https://commons.wikimedia.org/wiki/File:Personal_computer,_exploded.svg), Wikimedia Commons, [CC BY 2.5](https://creativecommons.org/licenses/by/2.5/).
- `commons-diagram33`: [Io diagram](https://commons.wikimedia.org/wiki/File:Io_diagram.svg), Wikimedia Commons, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- `web-screen01`: screenshot of the Wikipedia article [WordPress](https://en.wikipedia.org/wiki/WordPress), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- `theme-twentytwentyfour`: `screenshot.png` of the [Twenty Twenty-Four](https://wordpress.org/themes/twentytwentyfour/) theme, [GPL-2.0-or-later](https://wordpress.org/about/license/).
- `plugin-leaves`: `leaves.jpg` from the [Modern Image Formats test images](https://github.com/WordPress/performance/tree/trunk/plugins/webp-uploads/tests/data/images), [GPL-2.0-or-later](https://github.com/WordPress/performance/blob/trunk/LICENSE).
- `plugin-dice`: `dice.png` from the same folder. It is a smaller copy of [PNG transparency demonstration 1](https://commons.wikimedia.org/wiki/File:PNG_transparency_demonstration_1.png) by Ed g2s, Wikimedia Commons, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

Tools:

- **Comparison slider:** [img-comparison-slider](https://github.com/sneas/img-comparison-slider) (MIT), loaded from jsDelivr.
- **Encoders and metrics:** see [What runs where](#what-runs-where).

## License

The pages and the scripts are released under the MIT license, see [LICENSE](LICENSE). The images keep the licenses listed above.

🤖 Made with [Claude Code](https://claude.com/claude-code)
