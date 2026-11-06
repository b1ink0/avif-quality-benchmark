// Compares the matching AVIF quality of two server stacks on the same images, for GD and Imagick.
// Usage: node compare-stacks.mjs <old results dir> <new results dir> <report.md>
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [ , , oldDir, newDir, reportFile ] = process.argv;
const stacks = { 'Debian 13': oldDir, 'Alpine 3.24': newDir };
const editors = { gd: 'GD', imagick: 'Imagick' };

// Units are image|editor|size, only for images that the new stack has.
const load = ( dir, only ) => {
	const units = new Map();
	for ( const file of readdirSync( dir ).filter( ( f ) => f.endsWith( '.csv' ) ) ) {
		for ( const line of readFileSync( join( dir, file ), 'utf8' ).trim().split( '\n' ) ) {
			const [ image, editor, size, , , format, q, bytes, ssimulacra2, butteraugli, , dssim ] = line.split( ',' );
			if ( ! editors[ editor ] || ( only && ! only.has( image ) ) ) {
				continue;
			}
			const key = `${ image }|${ editor }|${ size }`;
			if ( ! units.has( key ) ) {
				units.set( key, { image, editor, size, jpeg: {}, webp: {}, avif: {} } );
			}
			units.get( key )[ format ][ q ] = { q: +q, bytes: +bytes, ssimulacra2: +ssimulacra2, butteraugli: +butteraugli, dssim: +dssim };
		}
	}
	return units;
};
const fresh = load( newDir );
const images = new Set( [ ...fresh.values() ].map( ( u ) => u.image ) );
const data = { 'Debian 13': load( oldDir, images ), 'Alpine 3.24': fresh };

const atLeast = ( a, t ) => a.ssimulacra2 >= t.ssimulacra2 && a.butteraugli <= t.butteraugli && a.dssim <= t.dssim;
const quantile = ( a, p ) => {
	const s = [ ...a ].sort( ( x, y ) => x - y );
	const i = ( s.length - 1 ) * p;
	const lo = Math.floor( i );
	return lo === i ? s[ lo ] : s[ lo ] + ( s[ lo + 1 ] - s[ lo ] ) * ( i - lo );
};
const pct = ( x ) => `${ Math.round( x * 100 ) }%`;
const qText = ( q ) => ( Number.isFinite( q ) ? String( Math.round( q * 10 ) / 10 ) : '>90' );
const avifQs = [ 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90 ];
const baselines = { 'JPEG 82': [ 'jpeg', '82' ], 'WebP 82': [ 'webp', '82' ], 'WebP 86': [ 'webp', '86' ] };

const out = [];
const log = ( s = '' ) => out.push( s );
log( `# AVIF on Debian 13 vs Alpine 3.24 (${ images.size } images)` );
log();
log( 'Debian 13: GD with libavif 1.2.1, Imagick 7.1.1-43 with libheif 1.23.6, both on libaom 3.12.1 (tune=ssim).' );
log( 'Alpine 3.24: GD with libavif 1.4.1, Imagick 7.1.2-35 with libheif 1.23.4, both on libaom 3.14.1 (tune=iq by default).' );
log( 'Matches means SSIMULACRA 2, Butteraugli and DSSIM all score the AVIF at least as well as the baseline from the same editor and stack.' );

log();
log( '## Lowest matching AVIF quality per image sub-size' );
log();
log( '| Baseline | Editor | Stack | Units | Median | 75th pct | 90th pct |' );
log( '| --- | --- | --- | --- | --- | --- | --- |' );
for ( const [ baseline, [ format, bq ] ] of Object.entries( baselines ) ) {
	for ( const [ editor, name ] of Object.entries( editors ) ) {
		for ( const [ stack, units ] of Object.entries( data ) ) {
			const list = [ ...units.values() ].filter( ( u ) => u.editor === editor );
			const qs = list.map( ( u ) => ( avifQs.find( ( q ) => atLeast( u.avif[ q ], u[ format ][ bq ] ) ) ?? Infinity ) );
			log( `| ${ baseline } | ${ name } | ${ stack } | ${ list.length } | ${ qText( quantile( qs, 0.5 ) ) } | ${ qText( quantile( qs, 0.75 ) ) } | ${ qText( quantile( qs, 0.9 ) ) } |` );
		}
	}
}

for ( const [ baseline, [ format, bq ] ] of Object.entries( baselines ) ) {
	log();
	log( `## One AVIF quality vs ${ baseline }: share that matches, median size vs ${ baseline }` );
	log();
	log( `| AVIF | ${ Object.values( editors ).flatMap( ( e ) => Object.keys( data ).map( ( s ) => `${ e } ${ s }` ) ).join( ' | ' ) } |` );
	log( `| --- | ${ Object.keys( editors ).flatMap( () => Object.keys( data ).map( () => '---' ) ).join( ' | ' ) } |` );
	for ( const q of avifQs.filter( ( x ) => x >= 62 && x <= 84 ) ) {
		const cells = Object.keys( editors ).flatMap( ( editor ) => Object.values( data ).map( ( units ) => {
			const list = [ ...units.values() ].filter( ( u ) => u.editor === editor );
			return `${ pct( list.filter( ( u ) => atLeast( u.avif[ q ], u[ format ][ bq ] ) ).length / list.length ) }, ${ pct( quantile( list.map( ( u ) => u.avif[ q ].bytes / u[ format ][ bq ].bytes ), 0.5 ) ) }`;
		} ) );
		log( `| ${ q } | ${ cells.join( ' | ' ) } |` );
	}
}

log();
log( '## Same AVIF quality number on both stacks: Alpine vs Debian (median)' );
log();
log( '| AVIF | GD size | GD SSIMULACRA 2 change | Imagick size | Imagick SSIMULACRA 2 change |' );
log( '| --- | --- | --- | --- | --- |' );
for ( const q of [ 60, 66, 70, 74, 78, 82 ] ) {
	const cells = Object.keys( editors ).map( ( editor ) => {
		const pairs = [ ...data[ 'Alpine 3.24' ].values() ].filter( ( u ) => u.editor === editor ).map( ( u ) => [ u.avif[ q ], data[ 'Debian 13' ].get( `${ u.image }|${ u.editor }|${ u.size }` )?.avif[ q ] ] ).filter( ( [ , b ] ) => b );
		return `${ pct( quantile( pairs.map( ( [ a, b ] ) => a.bytes / b.bytes ), 0.5 ) ) } | ${ quantile( pairs.map( ( [ a, b ] ) => a.ssimulacra2 - b.ssimulacra2 ), 0.5 ).toFixed( 2 ) }`;
	} );
	log( `| ${ q } | ${ cells.join( ' | ' ) } |` );
}

writeFileSync( reportFile, out.join( '\n' ) + '\n' );
console.log( out.join( '\n' ) );
