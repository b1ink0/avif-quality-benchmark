<?php
// Creates every WordPress sub-size of one source with a core image editor, then saves each size as a
// lossless PNG reference and as JPEG, WebP and AVIF at each test quality, the way core does it.
// Usage: php wp-encode.php <wordpress dir> <gd|imagick> <source png> <out dir>
[ , $wp, $editor_name, $source, $out ] = $argv;

define( 'ABSPATH', rtrim( $wp, '/' ) . '/' );
define( 'WPINC', 'wp-includes' );
foreach ( array( 'version', 'compat', 'load', 'default-constants', 'class-wp-error', 'plugin', 'pomo/translations', 'l10n', 'functions', 'formatting', 'shortcodes', 'media', 'class-wp-image-editor', 'class-wp-image-editor-gd', 'class-wp-image-editor-imagick' ) as $file ) {
	require_once ABSPATH . WPINC . "/$file.php";
}
wp_initial_constants();

require __DIR__ . '/sizes.php';

// The quality for each save comes from the same filter the plugin uses.
$GLOBALS['bench_quality'] = 82;
add_filter( 'wp_editor_set_quality', static fn() => $GLOBALS['bench_quality'] );

// Saves through _save() like make_subsize() does. save() would also switch the editor's mime type to the
// saved format, after which core stops re-reading the quality filter for repeated saves to that format.
class Bench_GD extends WP_Image_Editor_GD {
	public function bench_save( string $file, string $mime ) {
		return $this->_save( $this->image, $file, $mime );
	}
}
class Bench_Imagick extends WP_Image_Editor_Imagick {
	public function bench_save( string $file, string $mime ) {
		return $this->_save( $this->image, $file, $mime );
	}
}
$class = 'imagick' === $editor_name ? 'Bench_Imagick' : 'Bench_GD';
[ $width, $height ] = getimagesize( $source );
@mkdir( $out, 0777, true );

foreach ( bench_sizes( $width, $height ) as $size => [ $w, $h, $crop ] ) {
	$editor = new $class( $source );
	$loaded = $editor->load();
	if ( is_wp_error( $loaded ) ) {
		fwrite( STDERR, $loaded->get_error_message() . "\n" );
		exit( 1 );
	}
	if ( $w ) {
		$resized = $editor->resize( $w, $h, $crop );
		if ( is_wp_error( $resized ) ) {
			fwrite( STDERR, "$size: " . $resized->get_error_message() . "\n" );
			continue;
		}
	}
	$saves = array( array( 'ref', 0, 'image/png', 'png' ), array( 'jpeg', 82, 'image/jpeg', 'jpg' ) );
	foreach ( BENCH_WEBP_QUALITIES as $q ) {
		$saves[] = array( 'webp', $q, 'image/webp', 'webp' );
	}
	foreach ( BENCH_AVIF_QUALITIES as $q ) {
		$saves[] = array( 'avif', $q, 'image/avif', 'avif' );
	}
	foreach ( $saves as [ $format, $q, $mime, $ext ] ) {
		$GLOBALS['bench_quality'] = $q ? $q : 82;
		$saved = $editor->bench_save( "$out/{$size}__{$format}__{$q}.$ext", $mime );
		if ( is_wp_error( $saved ) ) {
			fwrite( STDERR, "$size $format $q: " . $saved->get_error_message() . "\n" );
			exit( 1 );
		}
	}
}
