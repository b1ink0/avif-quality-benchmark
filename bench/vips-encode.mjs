// Creates every WordPress sub-size of one source the way the browser (Gutenberg's @wordpress/vips) does it,
// then saves either a lossless PNG reference, JPEG and WebP at each test quality, or AVIF at one or every test quality.
// The passes run in separate processes because one wasm-vips heap cannot hold all saves of a 2560px image.
// Usage: node vips-encode.mjs <vips module> <source png> <out dir> <webp|avif> [avif quality]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [ , , vipsModule, source, out, pass, avifQuality ] = process.argv;
const { default: Vips } = await import( vipsModule );
const vips = await Vips( { dynamicLibraries: [ 'vips-heif.wasm' ] } );
const sizes = JSON.parse( readFileSync( new URL( './sizes.json', import.meta.url ), 'utf8' ) );
mkdirSync( out, { recursive: true } );

const buffer = readFileSync( source );
const original = vips.Image.newFromBuffer( buffer );
const { width, height } = original;

// Same rules as bench_sizes() in sizes.php.
const list = { full: width > 2560 || height > 2560 ? [ 2560, 2560, false ] : [ 0, 0, false ] };
for ( const [ name, [ w, h, crop ] ] of Object.entries( sizes.boxes ) ) {
	if ( width > w || ( h && height > h ) ) {
		list[ name ] = [ w, h, crop ];
	}
}

for ( const [ name, [ w, h, crop ] ] of Object.entries( list ) ) {
	let image = original;
	if ( w ) {
		// Like resizeImage() in @wordpress/vips: thumbnail with size 'down', height from the size or the aspect ratio, centre crop.
		const options = { size: 'down', height: h || Math.round( ( height / width ) * w ) };
		if ( crop ) {
			options.crop = 'centre';
		}
		image = vips.Image.thumbnailBuffer( buffer, w, options );
	}
	// Decode once into memory, as every size is saved many times and libvips reads sequentially.
	image = image.copyMemory();
	if ( 'avif' === pass ) {
		for ( const Q of avifQuality ? [ Number( avifQuality ) ] : sizes.avif ) {
			writeFileSync( join( out, `${ name }__avif__${ Q }.avif` ), image.writeToBuffer( '.avif', { Q, keep: 'icc', effort: 2 } ) );
		}
		continue;
	}
	writeFileSync( join( out, `${ name }__ref__0.png` ), image.writeToBuffer( '.png' ) );
	writeFileSync( join( out, `${ name }__jpeg__82.jpg` ), image.writeToBuffer( '.jpg', { Q: 82, keep: 'icc' } ) );
	for ( const Q of sizes.webp ) {
		writeFileSync( join( out, `${ name }__webp__${ Q }.webp` ), image.writeToBuffer( '.webp', { Q, keep: 'icc' } ) );
	}
}
vips.shutdown();
