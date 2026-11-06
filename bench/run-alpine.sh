#!/bin/bash
# Runs the GD and Imagick jobs for every source in the Alpine image. The browser path does not change with the
# server stack, so it is not rerun. Usage: run-alpine.sh <parallel jobs>
php --ri gd | grep -i avif
php --ri imagick | grep -i 'compiled with'
apk list --installed 2>/dev/null | grep -E '^(libavif|aom-libs|libheif|imagemagick)-[0-9]'
ffmpeg -hide_banner -filters 2>/dev/null | grep -c libvmaf
ls -S /work/src/*.png | while read -r f; do for e in gd imagick; do printf '%s\0%s\0' "$f" "$e"; done; done \
	| xargs -0 -n 2 -P "$1" bash /work/bench/job-linux.sh
echo "done: $(ls /work/out/results/*.csv | wc -l) result files"
