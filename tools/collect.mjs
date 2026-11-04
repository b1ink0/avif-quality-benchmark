// Collects results shared as comments on the GitHub issue and prints a summary per encoder.
// Usage: node tools/collect.mjs <issue URL>
// Needs the GitHub CLI (gh), signed in. Only reads the issue.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const issue = process.argv[ 2 ];
if ( ! issue ) {
	console.error( 'Usage: node tools/collect.mjs <issue URL>' );
	process.exit( 1 );
}

const { rows } = JSON.parse( readFileSync( new URL( '../data.js', import.meta.url ), 'utf8' ).replace( /^window\.BENCH = /, '' ).replace( /;\s*$/, '' ) );
const bytes = new Map( rows.map( ( r ) => [ `${ r.image }|${ r.encoder }|${ r.q }`, r.bytes ] ) );
const WEBP_FOR = { 'gd-avif': 'gd-webp', 'im-avif': 'gd-webp', 'vips-avif': 'vips-webp' };
const median = ( list ) => {
	const s = [ ...list ].sort( ( a, b ) => a - b );
	const m = s.length >> 1;
	return s.length % 2 ? s[ m ] : ( s[ m - 1 ] + s[ m ] ) / 2;
};

const { comments } = JSON.parse( execFileSync( 'gh', [ 'issue', 'view', issue, '--json', 'comments' ], { encoding: 'utf8' } ) );

// Keep the newest result per person and encoder.
const latest = new Map();
for ( const comment of comments.sort( ( a, b ) => b.createdAt.localeCompare( a.createdAt ) ) ) {
	const json = comment.body.match( /```json\s*([\s\S]*?)```/ );
	if ( ! json ) {
		continue;
	}
	try {
		const result = JSON.parse( json[ 1 ] );
		const id = `${ comment.author.login }|${ result.encoder }`;
		if ( WEBP_FOR[ result.encoder ] && result.picks && ! latest.has( id ) ) {
			latest.set( id, result );
		}
	} catch {
		console.error( `Skipped a comment by ${ comment.author.login }: invalid JSON` );
	}
}

for ( const encoder of Object.keys( WEBP_FOR ) ) {
	const results = [ ...latest.values() ].filter( ( r ) => r.encoder === encoder );
	if ( ! results.length ) {
		continue;
	}
	const all = results.flatMap( ( r ) => Object.entries( r.picks ) );
	const ratio = ( image, q ) => bytes.get( `${ image }|${ encoder }|${ q }` ) / bytes.get( `${ image }|${ WEBP_FOR[ encoder ] }|82` );
	console.log( `\n## ${ encoder }: ${ results.length } people, ${ all.length } picks` );
	console.log( `Median quality: ${ median( all.map( ( [ , q ] ) => q ) ) }, median of each person's median: ${ median( results.map( ( r ) => median( Object.values( r.picks ) ) ) ) }` );
	console.log( '\n| Image | Picks | Median quality | AVIF size vs WebP 82 at that quality |' );
	console.log( '| --- | --- | --- | --- |' );
	for ( const image of [ ...new Set( all.map( ( [ i ] ) => i ) ) ].sort() ) {
		const qs = all.filter( ( [ i ] ) => i === image ).map( ( [ , q ] ) => q );
		const q = median( qs );
		const size = bytes.has( `${ image }|${ encoder }|${ q }` ) ? `${ Math.round( ratio( image, q ) * 100 ) }%` : 'n/a';
		console.log( `| ${ image } | ${ qs.length } | ${ q } | ${ size } |` );
	}
}
