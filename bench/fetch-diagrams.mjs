// Downloads 40 random openly licensed SVG diagrams from the Commons list as 1600px PNG renders.
// Usage: node fetch-diagrams.mjs <commons.json> <out dir>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [ , , list, outDir ] = process.argv;
const open = /^(Public domain|CC0|CC BY(-SA)? [0-9.]+)$/;
// Seeded shuffle so the sample is repeatable.
let seed = 2745;
const rand = () => ( ( seed = ( seed * 1103515245 + 12345 ) % 2147483648 ) / 2147483648 );
const files = JSON.parse( readFileSync( list, 'utf8' ) ).filter( ( f ) => f.mime === 'image/svg+xml' && open.test( f.license ?? '' ) && f.width >= 800 );
const sample = files.map( ( f ) => [ rand(), f ] ).sort( ( a, b ) => a[ 0 ] - b[ 0 ] ).slice( 0, 40 ).map( ( [ , f ] ) => f );
const credits = [];
for ( const [ n, f ] of sample.entries() ) {
	await new Promise( ( r ) => setTimeout( r, 1500 ) );
	const res = await fetch( f.thumb, { headers: { 'User-Agent': 'avif-quality-bench/1.0 (image quality research)' } } );
	if ( ! res.ok ) {
		console.error( `skip ${ f.title }: ${ res.status }` );
		continue;
	}
	const name = `diagram${ String( n + 1 ).padStart( 2, '0' ) }`;
	writeFileSync( join( outDir, `${ name }.png` ), Buffer.from( await res.arrayBuffer() ) );
	credits.push( `${ name }\t${ f.license }\t${ f.page }` );
}
writeFileSync( join( outDir, 'CREDITS.tsv' ), credits.join( '\n' ) + '\n' );
console.log( `${ credits.length } of ${ files.length } eligible files saved` );
