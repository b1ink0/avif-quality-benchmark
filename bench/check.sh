cat /etc/debian_version
grep "wp_version =" /usr/src/wordpress/wp-includes/version.php
php -r 'echo Imagick::getVersion()["versionString"], PHP_EOL; echo function_exists("imageavif") ? "gd avif" : "no gd avif", PHP_EOL; echo implode(",", array_intersect(Imagick::queryFormats(), ["AVIF","WEBP","JPEG"])), PHP_EOL; print_r(array_intersect_key(gd_info(), ["GD Version"=>1]));'
for t in magick avifdec dwebp ssimulacra2 butteraugli_main dssim ffmpeg node; do printf '%s: ' $t; command -v $t || echo MISSING; done
ffmpeg-vmaf -hide_banner -filters 2>/dev/null | grep -c libvmaf
avifdec --version 2>&1 | head -2
nproc
