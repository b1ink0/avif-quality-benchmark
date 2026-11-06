// Takes lossless viewport screenshots of openly licensed pages. Needs Playwright and Google Chrome.
// Usage: node screens.mjs <out dir>
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[ 2 ];
// Wikipedia text is CC BY-SA 4.0. The WordPress developer handbooks are GPLv2 or later.
const pages = [
	'https://en.wikipedia.org/wiki/WordPress',
	'https://en.wikipedia.org/wiki/JPEG',
	'https://en.wikipedia.org/wiki/AVIF',
	'https://en.wikipedia.org/wiki/Periodic_table',
	'https://en.wikipedia.org/wiki/Mount_Everest',
	'https://en.wikipedia.org/wiki/Solar_System',
	'https://en.wikipedia.org/wiki/List_of_countries_by_population_(United_Nations)',
	'https://en.wikipedia.org/wiki/Python_(programming_language)',
	'https://en.wikipedia.org/wiki/Main_Page',
	'https://en.wikipedia.org/wiki/Typography',
	'https://developer.wordpress.org/block-editor/',
	'https://developer.wordpress.org/themes/',
	'https://developer.wordpress.org/plugins/',
	'https://developer.wordpress.org/reference/functions/wp_get_image_editor/',
	'https://developer.wordpress.org/rest-api/',
	'https://developer.wordpress.org/block-editor/reference-guides/core-blocks/',
	'https://developer.wordpress.org/apis/',
	'https://developer.wordpress.org/coding-standards/',
	'https://developer.wordpress.org/advanced-administration/',
	'https://developer.wordpress.org/news/',
];
const browser = await chromium.launch( { channel: 'chrome' } );
const credits = [];
for ( const [ n, url ] of pages.entries() ) {
	// Half at 1x (1440x900) and half at 2x (2880x1800), like screenshots from regular and retina screens.
	const scale = n % 2 ? 2 : 1;
	const page = await browser.newPage( { viewport: { width: 1440, height: 900 }, deviceScaleFactor: scale } );
	try {
		await page.goto( url, { waitUntil: 'networkidle', timeout: 60000 } );
		const name = `screen${ String( n + 1 ).padStart( 2, '0' ) }`;
		writeFileSync( join( outDir, `${ name }.png` ), await page.screenshot( { type: 'png' } ) );
		credits.push( `${ name }\t${ scale }x\t${ url }` );
	} catch ( e ) {
		console.error( `skip ${ url }: ${ e.message }` );
	}
	await page.close();
}
await browser.close();
writeFileSync( join( outDir, 'CREDITS.tsv' ), credits.join( '\n' ) + '\n' );
console.log( `${ credits.length } screenshots` );
