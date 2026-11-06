#!/bin/bash
# Runs every source with every editor in parallel inside the container. Usage: run-all.sh <parallel jobs>
# Largest sources first so the long jobs do not end up last. Finished jobs are skipped, so it can be restarted.
# Pairs are NUL separated so source names with spaces stay whole.
ls -S /work/src/*.png | while read -r f; do for e in gd imagick vips; do printf '%s\0%s\0' "$f" "$e"; done; done \
	| xargs -0 -n 2 -P "$1" bash /work/bench/job-linux.sh
echo "done: $(ls /work/out/results/*.csv | wc -l) result files"
