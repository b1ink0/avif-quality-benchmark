#!/bin/zsh
# Converts one raw image to an 8-bit sRGB PNG without alpha or metadata. Usage: prep.sh <raw file> <set name> <out dir>
raw=$1; set=$2; out=$3
magick "$raw" -colorspace sRGB -background white -alpha remove -alpha off -depth 8 -strip PNG24:"$out/${set}-${${raw:t}:r}.png"
