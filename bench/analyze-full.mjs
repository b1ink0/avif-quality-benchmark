// Finds the AVIF quality that matches JPEG 82, WebP 82 and WebP 86 from the same WordPress editor, for every
// image and every WordPress sub-size, then breaks the result down by content type, data set and size.
// Usage: node analyze-full.mjs <results dir> <report.md>
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [ , , dir, reportFile ] = process.argv;

// One unit is one image, one editor and one sub-size, holding every encode of that sub-size.
const units = new Map();
for ( const file of readdirSync( dir ).filter( ( f ) => f.endsWith( '.csv' ) ) ) {
	for ( const line of readFileSync( join( dir, file ), 'utf8' ).trim().split( '\n' ) ) {
		const [ image, editor, size, width, height, format, q, bytes, ssimulacra2, butteraugli, vmaf, dssim ] = line.split( ',' );
		const key = `${ image }|${ editor }|${ size }`;
		if ( ! units.has( key ) ) {
			units.set( key, { image, editor, size, width: +width, height: +height, set: image.split( '-' )[ 0 ], jpeg: {}, webp: {}, avif: {} } );
		}
		units.get( key )[ format ][ q ] = { q: +q, bytes: +bytes, ssimulacra2: +ssimulacra2, butteraugli: +butteraugli, vmaf: +vmaf, dssim: +dssim };
	}
}

const groupOf = { kodak: 'Photo', clic: 'Photo', cid22: 'Photo', plugin: 'Photo', web: 'Screenshot', theme: 'Screenshot', commons: 'Diagram' };
const setNames = { kodak: 'Kodak', clic: 'CLIC 2020', cid22: 'CID22', plugin: 'Plugin test images', web: 'Web page screenshots', theme: 'Theme screenshots', commons: 'Wikimedia diagrams' };
const sizes = [ 'thumbnail', 'medium', 'medium_large', 'large', '1536x1536', '2048x2048', 'full' ];
const editors = { gd: 'GD', imagick: 'Imagick', vips: 'Browser' };
const baselines = { 'jpeg 82': [ 'jpeg', '82' ], 'webp 82': [ 'webp', '82' ], 'webp 86': [ 'webp', '86' ] };
const baselineNames = { 'jpeg 82': 'JPEG 82', 'webp 82': 'WebP 82', 'webp 86': 'WebP 86' };
const avifQs = Object.keys( [ ...units.values() ][ 0 ].avif ).map( Number ).sort( ( a, b ) => a - b );

// 1 = higher is better, -1 = lower is better.
const metrics = { ssimulacra2: 1, butteraugli: -1, vmaf: 1, dssim: -1 };
const checks = {
	'All but VMAF': [ 'ssimulacra2', 'butteraugli', 'dssim' ],
	'SSIMULACRA 2': [ 'ssimulacra2' ],
	Butteraugli: [ 'butteraugli' ],
	DSSIM: [ 'dssim' ],
	VMAF: [ 'vmaf' ],
	'All four': Object.keys( metrics ),
};
const atLeast = ( a, t, ms ) => ms.every( ( m ) => ( metrics[ m ] > 0 ? a[ m ] >= t[ m ] : a[ m ] <= t[ m ] ) );

const median = ( a ) => quantile( a, 0.5 );
function quantile( a, p ) {
	const s = [ ...a ].sort( ( x, y ) => x - y );
	const i = ( s.length - 1 ) * p;
	const lo = Math.floor( i );
	return lo === i ? s[ lo ] : s[ lo ] + ( s[ lo + 1 ] - s[ lo ] ) * ( i - lo );
}
const pct = ( x ) => `${ Math.round( x * 100 ) }%`;
// Matching qualities fall on the even AVIF steps, so a median between two steps is shown as is.
const qText = ( q ) => ( Number.isFinite( q ) ? String( Math.round( q * 10 ) / 10 ) : '>90' );

// Lowest AVIF quality that is at least as good as the baseline, or Infinity when even AVIF 90 is not.
function match( unit, baseline, ms ) {
	const [ format, q ] = baselines[ baseline ];
	const t = unit[ format ][ q ];
	const hit = avifQs.map( ( x ) => unit.avif[ x ] ).find( ( a ) => atLeast( a, t, ms ) );
	return hit ? { q: hit.q, ratio: hit.bytes / t.bytes } : { q: Infinity, ratio: NaN };
}

// 95% interval of the median, resampling whole images so the sub-sizes of one image stay together.
function bootstrap( list, baseline, ms ) {
	const byImage = new Map();
	for ( const u of list ) {
		byImage.set( u.image, [ ...( byImage.get( u.image ) || [] ), match( u, baseline, ms ).q ] );
	}
	const groups = [ ...byImage.values() ];
	let seed = 1;
	const random = () => ( ( seed = ( seed * 16807 ) % 2147483647 ) - 1 ) / 2147483646;
	const medians = [];
	for ( let i = 0; i < 1000; i++ ) {
		const sample = [];
		for ( let j = 0; j < groups.length; j++ ) {
			sample.push( ...groups[ Math.floor( random() * groups.length ) ] );
		}
		medians.push( median( sample ) );
	}
	return `${ qText( quantile( medians, 0.025 ) ) } to ${ qText( quantile( medians, 0.975 ) ) }`;
}

function summary( list, baseline, ms ) {
	const hits = list.map( ( u ) => match( u, baseline, ms ) );
	const qs = hits.map( ( h ) => h.q );
	const ratios = hits.filter( ( h ) => Number.isFinite( h.q ) ).map( ( h ) => h.ratio );
	return { median: median( qs ), p75: quantile( qs, 0.75 ), p90: quantile( qs, 0.9 ), ratio: median( ratios ), n: list.length };
}

const all = [ ...units.values() ];
const of = ( editor, filter = () => true ) => all.filter( ( u ) => u.editor === editor && filter( u ) );
const images = new Set( all.map( ( u ) => u.image ) );

const out = [];
const log = ( s = '' ) => out.push( s );
log( '# AVIF quality that matches JPEG 82 and WebP in WordPress' );
log();
log( `${ images.size } source images, ${ all.length } image sub-sizes over 3 editors, ${ all.reduce( ( n, u ) => n + Object.keys( u.webp ).length + Object.keys( u.avif ).length + 1, 0 ) } encodes.` );
log();
log( '| Data set | Content | Images |' );
log( '| --- | --- | --- |' );
for ( const [ set, name ] of Object.entries( setNames ) ) {
	log( `| ${ name } | ${ groupOf[ set ] } | ${ [ ...images ].filter( ( i ) => i.startsWith( set + '-' ) ).length } |` );
}
log();
log( 'Every sub-size WordPress creates is encoded by the editor that creates it (GD, Imagick or the browser through wasm-vips) and compared with the lossless sub-size from the same editor. "Matches" means the AVIF file scores at least as well as the baseline file. "All but VMAF" means SSIMULACRA 2, Butteraugli and DSSIM all agree.' );

log();
log( '## Matching AVIF quality (all but VMAF)' );
log();
log( 'Median over every image sub-size, the 95% interval of that median (resampling images), the 75th and 90th percentile, and the median AVIF size vs the baseline file at the matching quality.' );
log();
log( '| Baseline | Editor | Median | 95% interval | 75th pct | 90th pct | AVIF size vs baseline |' );
log( '| --- | --- | --- | --- | --- | --- | --- |' );
for ( const baseline of Object.keys( baselines ) ) {
	for ( const [ editor, name ] of Object.entries( editors ) ) {
		const s = summary( of( editor ), baseline, checks[ 'All but VMAF' ] );
		log( `| ${ baselineNames[ baseline ] } | ${ name } | ${ qText( s.median ) } | ${ bootstrap( of( editor ), baseline, checks[ 'All but VMAF' ] ) } | ${ qText( s.p75 ) } | ${ qText( s.p90 ) } | ${ pct( s.ratio ) } |` );
	}
}

log();
log( '## Matching AVIF quality per metric (median)' );
log();
log( `| Baseline | Editor | ${ Object.keys( checks ).join( ' | ' ) } |` );
log( `| --- | --- | ${ Object.keys( checks ).map( () => '---' ).join( ' | ' ) } |` );
for ( const baseline of Object.keys( baselines ) ) {
	for ( const [ editor, name ] of Object.entries( editors ) ) {
		log( `| ${ baselineNames[ baseline ] } | ${ name } | ${ Object.values( checks ).map( ( ms ) => qText( summary( of( editor ), baseline, ms ).median ) ).join( ' | ' ) } |` );
	}
}

for ( const [ title, keyOf, keys, label ] of [
	[ 'content type', ( u ) => groupOf[ u.set ], [ 'Photo', 'Screenshot', 'Diagram' ], ( k ) => k ],
	[ 'data set', ( u ) => u.set, Object.keys( setNames ), ( k ) => setNames[ k ] ],
	[ 'sub-size', ( u ) => u.size, sizes, ( k ) => k ],
] ) {
	log();
	log( `## Matching AVIF quality by ${ title } (all but VMAF, median)` );
	log();
	log( `| ${ title[ 0 ].toUpperCase() + title.slice( 1 ) } | ${ Object.keys( baselines ).flatMap( ( b ) => Object.values( editors ).map( ( e ) => `${ baselineNames[ b ] }, ${ e }` ) ).join( ' | ' ) } |` );
	log( `| --- | ${ Object.keys( baselines ).flatMap( () => Object.keys( editors ).map( () => '---' ) ).join( ' | ' ) } |` );
	for ( const k of keys ) {
		const cells = Object.keys( baselines ).flatMap( ( b ) => Object.keys( editors ).map( ( e ) => {
			const list = of( e, ( u ) => keyOf( u ) === k );
			return list.length ? qText( summary( list, b, checks[ 'All but VMAF' ] ).median ) : '';
		} ) );
		log( `| ${ label( k ) } | ${ cells.join( ' | ' ) } |` );
	}
}

log();
log( '## One AVIF quality for every image' );
log();
log( 'Share of image sub-sizes where AVIF at that quality matches the baseline (all but VMAF, and SSIMULACRA 2 alone), and the median AVIF size vs the baseline file.' );
for ( const baseline of Object.keys( baselines ) ) {
	log();
	log( `### ${ baselineNames[ baseline ] }` );
	log();
	log( `| AVIF | ${ Object.values( editors ).map( ( e ) => `${ e } matches | ${ e } SSIMULACRA 2 | ${ e } size` ).join( ' | ' ) } |` );
	log( `| --- | ${ Object.keys( editors ).map( () => '--- | --- | ---' ).join( ' | ' ) } |` );
	for ( const q of avifQs.filter( ( x ) => x >= 60 && x <= 86 ) ) {
		const cells = Object.keys( editors ).map( ( e ) => {
			const list = of( e );
			const [ format, bq ] = baselines[ baseline ];
			const share = ( ms ) => pct( list.filter( ( u ) => atLeast( u.avif[ q ], u[ format ][ bq ], ms ) ).length / list.length );
			return `${ share( checks[ 'All but VMAF' ] ) } | ${ share( checks[ 'SSIMULACRA 2' ] ) } | ${ pct( median( list.map( ( u ) => u.avif[ q ].bytes / u[ format ][ bq ].bytes ) ) ) }`;
		} );
		log( `| ${ q } | ${ cells.join( ' | ' ) } |` );
	}
}

log();
log( '## Baselines compared with each other' );
log();
log( 'Median size vs JPEG 82 from the same editor, and the share of image sub-sizes that match JPEG 82 (all but VMAF).' );
log();
log( `| Format | ${ Object.values( editors ).map( ( e ) => `${ e } size | ${ e } matches` ).join( ' | ' ) } |` );
log( `| --- | ${ Object.keys( editors ).map( () => '--- | ---' ).join( ' | ' ) } |` );
for ( const [ format, q ] of [ [ 'webp', '82' ], [ 'webp', '86' ], [ 'webp', '90' ], [ 'avif', '70' ], [ 'avif', '74' ], [ 'avif', '82' ] ] ) {
	const cells = Object.keys( editors ).map( ( e ) => {
		const list = of( e );
		return `${ pct( median( list.map( ( u ) => u[ format ][ q ].bytes / u.jpeg[ 82 ].bytes ) ) ) } | ${ pct( list.filter( ( u ) => atLeast( u[ format ][ q ], u.jpeg[ 82 ], checks[ 'All but VMAF' ] ) ).length / list.length ) }`;
	} );
	log( `| ${ format === 'webp' ? 'WebP' : 'AVIF' } ${ q } | ${ cells.join( ' | ' ) } |` );
}

writeFileSync( reportFile, out.join( '\n' ) + '\n' );
console.log( out.join( '\n' ) );
