#!/bin/bash
# Lists source and editor pairs that have no result file yet.
for f in /work/src/*.png; do n=$(basename "$f" .png); for e in gd imagick vips; do [[ -s /work/out/results/${n}__$e.csv ]] || echo "$n $e"; done; done
