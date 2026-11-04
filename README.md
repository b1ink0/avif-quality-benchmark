# AVIF quality test

A blind visual test to find which AVIF quality looks as good as WebP at quality 82, the setting WordPress uses for WebP when the [Modern Image Formats](https://github.com/WordPress/performance/tree/trunk/plugins/webp-uploads) plugin is active.

## Background

WordPress encodes AVIF at quality 82 by default, the same number as JPEG. AVIF and WebP encoders map that number to very different compression levels, so AVIF at 82 often comes out **larger** than WebP at 82. When the plugin keeps a fallback image, it then throws away AVIF sizes that are not smaller than the JPEG.

- GD has passed this quality to AVIF since WordPress 6.5 ([PHP libgd quality mapping](https://github.com/php/php-src/blob/b817a4f71870a21e5cea844d397f21e54f8926d5/ext/gd/libgd/gd_avif.c#L79-L85)).
- Imagick started using it in WordPress 6.7 ([Trac #61614](https://core.trac.wordpress.org/ticket/61614), [wordpress-develop PR #7004](https://github.com/WordPress/wordpress-develop/pull/7004), [commit](https://github.com/WordPress/wordpress-develop/commit/b5df5f08e0a43a05a2a52b5c151028e0c6a6d14d), first reported in [performance #1331](https://github.com/WordPress/performance/issues/1331)). Before that, libheif's default quality of 50 applied ([libheif mapping](https://github.com/strukturag/libheif/blob/12a259a5882dd99d45ec5fc77e296a3b620d1e2e/libheif/plugins/encoder_aom.cc#L1139-L1148)).
- Browser side image processing ([performance PR #2663](https://github.com/WordPress/performance/pull/2663)) uses the same quality setting.

Bug report: [WordPress/performance#2745](https://github.com/WordPress/performance/issues/2745).

Quality scores suggest an AVIF quality of about 64 to 72 matches WebP 82. This test asks people to judge it by eye.

## How to take the test

1. Open the site.
2. In the toolbar above the image, pick the WordPress encoder to test: **Server GD** (the most common), **Server Imagick** or **Browser upload**. Zoom (1x, 2x, 3x) and your progress are on the right of the same toolbar.
3. Drag the divider on the image to compare WebP 82 (left) with AVIF (right).
4. Use the slider under the image (or the − and + buttons) to find the **lowest** AVIF quality that still looks as good as the WebP.
5. Press **Save and next**, or **Skip image** if you are unsure. **Back** returns to the previous image.
6. Press **Finish and share** at any time. The results screen has three steps:
   1. Check your results: your pick per image, and the AVIF size compared with WebP 82.
   2. Add details (optional): your screen and any notes.
   3. Share (optional): **Copy and open the issue** copies your results and opens the GitHub issue, where you paste them as a comment. No GitHub account? Use **Copy results** and send the text to the person who shared the page, or **Download JSON**.

The AVIF slider covers quality 40 to 90 in steps of 2. Images are shown in a random order, and each one starts at a random point on the slider. The quality number is hidden so it does not bias the choice. Progress is saved in your browser, so you can stop and come back.

## Explore all encodes

The **Explore all encodes** page compares any two encodes of the same image:

- The toolbar above the image switches images (‹ and ›) and zoom.
- Under each half of the image, pick the format (Original, WebP, AVIF, JPEG), the encoder and the quality for that side.
- The table below shows file size and quality scores for both sides. Green is the better of the two, red is worse and gray is the same.

## How the images were made

The 24 [Kodak](https://r0k.us/graphics/kodak/) images (768x512) were encoded the way each WordPress editor does it:

| Encoder | Library | Settings |
| --- | --- | --- |
| Server, GD | PHP GD, [`imageavif()`](https://www.php.net/manual/en/function.imageavif.php) and `imagewebp()` | Quality only, like `WP_Image_Editor_GD` |
| Server, Imagick | PHP Imagick (libheif) | `heic:speed` 7, metadata stripped, like `WP_Image_Editor_Imagick` |
| Browser upload | [wasm-vips](https://github.com/kleisauke/wasm-vips) 0.0.19 | AVIF `effort` 2, keeps the ICC profile |

AVIF was encoded at every even quality from 40 to 90. WebP and JPEG were encoded at 82 for comparison, plus a range of WebP qualities for the explorer. The Imagick test compares against the GD WebP file, since no Imagick WebP was made.

Quality scores in the explorer compare each encode with the lossless original:

- [SSIMULACRA 2](https://github.com/cloudinary/ssimulacra2): higher is better.
- [Butteraugli](https://github.com/google/butteraugli) 3-norm: lower is better.
- [VMAF](https://github.com/Netflix/vmaf): higher is better.

## Collecting the results

Sharing is optional. People who want to share paste their results as a comment on one GitHub issue. The page links to [#2745](https://github.com/WordPress/performance/issues/2745), set in `ISSUE_URL` at the top of the script in `index.html`.

Each shared comment has a JSON block with the picks. To summarise them, run this with the [GitHub CLI](https://cli.github.com/) signed in:

```sh
node tools/collect.mjs https://github.com/WordPress/performance/issues/2745
```

It reads the issue comments (read only), keeps the newest result per person and encoder, and prints the median quality overall and per image, with the AVIF size against WebP 82 at that quality.

## Credits and license

- **Images:** the Kodak Lossless True Color Image Suite, released by the Eastman Kodak Company for unrestricted usage ([source](https://r0k.us/graphics/kodak/)). The files in `images` are re-encodes of those photos.
- **Comparison slider:** [img-comparison-slider](https://github.com/sneas/img-comparison-slider) (MIT), loaded from jsDelivr.
- **Code:** the pages and the script are released under the MIT license, see [LICENSE](LICENSE).

🤖 Made with [Claude Code](https://claude.com/claude-code)
