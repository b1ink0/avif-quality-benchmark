// Lists Category:Featured_diagrams files with license and a 1600px PNG render URL. Usage: node commons.mjs > list.json
const api = 'https://commons.wikimedia.org/w/api.php';
const params = { action: 'query', format: 'json', generator: 'categorymembers', gcmtitle: 'Category:Featured_diagrams', gcmtype: 'file', gcmlimit: '50', prop: 'imageinfo', iiprop: 'url|mime|size|extmetadata', iiurlwidth: '1600', iiextmetadatafilter: 'LicenseShortName|Artist' };
const out = [];
let cont = {};
do {
	await new Promise( ( r ) => setTimeout( r, 3000 ) );
	const res = await ( await fetch( `${ api }?${ new URLSearchParams( { ...params, ...cont } ) }`, { headers: { 'User-Agent': 'avif-quality-bench/1.0 (image quality research)' } } ) ).json();
	for ( const p of Object.values( res.query?.pages ?? {} ) ) {
		const i = p.imageinfo?.[ 0 ];
		if ( i?.thumburl ) {
			out.push( { title: p.title, mime: i.mime, width: i.width, height: i.height, license: i.extmetadata?.LicenseShortName?.value, thumb: i.thumburl, page: i.descriptionurl } );
		}
	}
	cont = res.continue ?? null;
} while ( cont );
console.log( JSON.stringify( out, null, 1 ) );
