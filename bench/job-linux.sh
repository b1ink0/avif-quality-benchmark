#!/bin/bash
# Encodes one source with one editor, scores every file and writes results/<source>__<editor>.csv.
# Runs inside the benchmark container, where /work holds bench/, src/ and out/.
# Usage: job-linux.sh <source png> <gd|imagick|vips>
src=$1
editor=$2
name=$(basename "$src" .png)
csv=/work/out/results/${name}__$editor.csv
[[ -s $csv ]] && exit 0
enc=/work/out/enc/$name/$editor
dec=/tmp/dec/$name/$editor
mkdir -p "$enc" "$dec" /work/out/results /work/out/logs

if [[ $editor == vips ]]; then
	node /work/bench/vips-encode.mjs /opt/vips/node_modules/wasm-vips/lib/vips-node.mjs "$src" "$enc" webp \
		&& for q in $(seq 50 2 90); do
			node /work/bench/vips-encode.mjs /opt/vips/node_modules/wasm-vips/lib/vips-node.mjs "$src" "$enc" avif "$q" || exit 1
		done
else
	php /work/bench/wp-encode.php /usr/src/wordpress "$editor" "$src" "$enc"
fi 2> "/work/out/logs/${name}__$editor.log" || { echo "encode failed: $name $editor" >&2; exit 1; }

tmp=$csv.tmp
: > "$tmp"
for f in "$enc"/*; do
	[[ $f == *__ref__* ]] && continue
	stem=$(basename "${f%.*}")
	size=${stem%%__*}
	rest=${stem#*__}
	format=${rest%%__*}
	q=${rest#*__}
	ref=$enc/${size}__ref__0.png
	d=$dec/$stem.png
	case ${f##*.} in
		avif) avifdec "$f" "$d" > /dev/null 2>&1 ;;
		webp) dwebp -quiet "$f" -o "$d" ;;
		jpg) magick "$f" -strip PNG24:"$d" ;;
	esac
	dims=$(magick identify -format '%w,%h' "$ref")
	ssim=$(ssimulacra2 "$ref" "$d" 2> /dev/null)
	butter=$(butteraugli_main "$ref" "$d" --pnorm 3 2> /dev/null | awk '/3-norm/{print $2}')
	vmaf=$(ffmpeg-vmaf -hide_banner -nostats -i "$d" -i "$ref" -lavfi "[0:v]format=yuv444p[d];[1:v]format=yuv444p[r];[d][r]libvmaf" -f null - 2>&1 | awk '/VMAF score/{print $NF}')
	dssim=$(dssim "$ref" "$d" 2> /dev/null | awk '{print $1}')
	echo "$name,$editor,$size,$dims,$format,$q,$(stat -c %s "$f"),$ssim,$butter,$vmaf,$dssim" >> "$tmp"
	rm -f "$d"
done
mv "$tmp" "$csv"
