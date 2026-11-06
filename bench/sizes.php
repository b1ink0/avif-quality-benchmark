<?php
// The sizes WordPress creates on upload, and the qualities to test. Keep in sync with sizes.json.
const BENCH_WEBP_QUALITIES = array( 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94 );
const BENCH_AVIF_QUALITIES = array( 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90 );

/**
 * Returns the sizes WordPress would create for an upload of the given dimensions.
 *
 * "full" is the original, or the 2560 "-scaled" image when the upload is larger (big_image_size_threshold).
 * Default sizes are only created when the image is larger than the size box, like image_resize_dimensions().
 *
 * @return array<string, array{int, int, bool}> Size name => width, height, crop. A width of 0 means no resize.
 */
function bench_sizes( int $width, int $height ): array {
	$sizes = array( 'full' => $width > 2560 || $height > 2560 ? array( 2560, 2560, false ) : array( 0, 0, false ) );
	$boxes = array(
		'thumbnail'    => array( 150, 150, true ),
		'medium'       => array( 300, 300, false ),
		'medium_large' => array( 768, 0, false ),
		'large'        => array( 1024, 1024, false ),
		'1536x1536'    => array( 1536, 1536, false ),
		'2048x2048'    => array( 2048, 2048, false ),
	);
	foreach ( $boxes as $name => [ $w, $h, $crop ] ) {
		if ( $width > $w || ( $h && $height > $h ) ) {
			$sizes[ $name ] = array( $w, $h, $crop );
		}
	}
	return $sizes;
}
