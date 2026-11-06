// Collects results shared as comments on the GitHub issue and prints a summary per editor and baseline.
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
const bytes = new Map( rows.map( ( r ) => [ `${ r.image }|${ r.editor }|${ r.format }-${ r.q }`, r.bytes ] ) );
const EDITORS = [ 'gd', 'imagick', 'vips' ];
const BASELINES = { 'jpeg-82': 'JPEG 82', 'webp-82': 'WebP 82', 'webp-86': 'WebP 86' };
// Results shared before the JPEG baseline was added used these encoder names, Kodak names without a prefix and WebP 82.
const OLD_ENCODERS = { 'gd-avif': 'gd', 'im-avif': 'imagick', 'vips-avif': 'vips' };
const median = ( list ) => {
	const s = [ ...list ].sort( ( a, b ) => a - b );
	const m = s.length >> 1;
	return s.length % 2 ? s[ m ] : ( s[ m - 1 ] + s[ m ] ) / 2;
};

const { comments } = JSON.parse( execFileSync( 'gh', [ 'issue', 'view', issue, '--json', 'comments' ], { encoding: 'utf8' } ) );

// Keep the newest result per person, editor and baseline.
const latest = new Map();
for ( const comment of comments.sort( ( a, b ) => b.createdAt.localeCompare( a.createdAt ) ) ) {
	const json = comment.body.match( /```json\s*([\s\S]*?)```/ );
	if ( ! json ) {
		continue;
	}
	try {
		const result = JSON.parse( json[ 1 ] );
		if ( ! result.baseline && OLD_ENCODERS[ result.encoder ] ) {
			result.editor = OLD_ENCODERS[ result.encoder ];
			result.baseline = 'webp-82';
			result.picks = Object.fromEntries( Object.entries( result.picks ?? {} ).map( ( [ i, q ] ) => [ `kodak-${ i }`, q ] ) );
		}
		const id = `${ comment.author.login }|${ result.editor }|${ result.baseline }`;
		if ( EDITORS.includes( result.editor ) && BASELINES[ result.baseline ] && result.picks && ! latest.has( id ) ) {
			latest.set( id, result );
		}
	} catch {
		console.error( `Skipped a comment by ${ comment.author.login }: invalid JSON` );
	}
}

for ( const [ baseline, name ] of Object.entries( BASELINES ) ) {
	for ( const editor of EDITORS ) {
		const results = [ ...latest.values() ].filter( ( r ) => r.editor === editor && r.baseline === baseline );
		if ( ! results.length ) {
			continue;
		}
		const all = results.flatMap( ( r ) => Object.entries( r.picks ) );
		console.log( `\n## ${ editor } vs ${ name }: ${ results.length } people, ${ all.length } picks` );
		console.log( `Median quality: ${ median( all.map( ( [ , q ] ) => q ) ) }, median of each person's median: ${ median( results.map( ( r ) => median( Object.values( r.picks ) ) ) ) }` );
		console.log( `\n| Image | Picks | Median quality | AVIF size vs ${ name } at that quality |` );
		console.log( '| --- | --- | --- | --- |' );
		for ( const image of [ ...new Set( all.map( ( [ i ] ) => i ) ) ].sort() ) {
			const qs = all.filter( ( [ i ] ) => i === image ).map( ( [ , q ] ) => q );
			const q = median( qs );
			const avif = bytes.get( `${ image }|${ editor }|avif-${ q }` );
			const size = avif ? `${ Math.round( ( avif / bytes.get( `${ image }|${ editor }|${ baseline }` ) ) * 100 ) }%` : 'n/a';
			console.log( `| ${ image } | ${ qs.length } | ${ q } | ${ size } |` );
		}
	}
}
