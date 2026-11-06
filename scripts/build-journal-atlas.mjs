/** Natural Earth 1:110m land coastline artwork for the journal.
 * Data: https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/
 * Public domain: https://www.naturalearthdata.com/about/terms-of-use/
 * Rebuild: node scripts/build-journal-atlas.mjs [path/to/ne_110m_land.geojson]
 * The print shows land and a geographic graticule, not political boundaries,
 * current events, live traffic, or a claim about the illustrated connections.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const input = path.resolve(process.argv[2] ?? 'scripts/data/journal-land-110m.geojson');
const output = path.resolve('public/images/about/journal/world-atlas.webp');
const dataset = JSON.parse(await fs.readFile(input, 'utf8'));
if (dataset.type !== 'FeatureCollection') throw new Error('Expected Natural Earth land FeatureCollection');
const WIDTH = 1536, HEIGHT = 816;
const area = {x: 64, y: 64, width: 1408, height: 704};
const project = ([longitude, latitude]) => [area.x + (longitude + 180) / 360 * area.width, area.y + (90 - latitude) / 180 * area.height];
const point = coordinates => project(coordinates).map(value => value.toFixed(2)).join(' ');
const polygons = dataset.features.flatMap(feature => feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : []);
const coastlines = polygons.map(polygon => `<path d="${polygon.map(ring => `M${ring.map(point).join('L')}Z`).join('')}"/>`).join('');
let grid = '', ticks = '';
for (let lon = -180; lon <= 180; lon += 30) {
  const x = project([lon, 0])[0];
  grid += `<path d="M${x} ${area.y}V${area.y + area.height}"/>`;
  if (lon > -180 && lon < 180) ticks += `<text x="${x}" y="${area.y - 9}" text-anchor="middle">${Math.abs(lon)}°${lon < 0 ? 'W' : lon > 0 ? 'E' : ''}</text>`;
}
for (let lat = -60; lat <= 60; lat += 30) {
  const y = project([0, lat])[1];
  grid += `<path d="M${area.x} ${y}H${area.x + area.width}"/>`;
  ticks += `<text x="${area.x - 8}" y="${y + 4}" text-anchor="end">${Math.abs(lat)}°${lat < 0 ? 'S' : lat > 0 ? 'N' : ''}</text>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<defs><clipPath id="map"><rect x="${area.x}" y="${area.y}" width="${area.width}" height="${area.height}"/></clipPath></defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="#eadfc6"/>
<rect x="20" y="20" width="1496" height="776" rx="2" fill="none" stroke="#b89b61" stroke-width="2.5"/>
<rect x="29" y="29" width="1478" height="758" fill="none" stroke="#b89b61" stroke-opacity=".30" stroke-width=".8"/>
<g font-family="Georgia,serif" font-size="16" fill="#435f50" letter-spacing="3"><text x="64" y="46">A WIDER VIEW</text></g>
<g font-family="monospace" font-size="11" fill="#75816b" letter-spacing="1.6"><text x="1472" y="45" text-anchor="end">LAND / WATER / CONNECTIONS</text></g>
<g clip-path="url(#map)"><rect x="64" y="64" width="1408" height="704" fill="#e9e0cb"/>
<g fill="none" stroke="#7b8a75" stroke-width=".75" stroke-opacity=".30">${grid}</g>
<g fill="#55745f" stroke="#314d3c" stroke-width=".8" stroke-linejoin="round" fill-rule="evenodd">${coastlines}</g>
<path d="M64 ${project([0, 0])[1]}H1472" fill="none" stroke="#b39b65" stroke-width="1.1" stroke-opacity=".60"/>
</g>
<rect x="64" y="64" width="1408" height="704" fill="none" stroke="#b4a477" stroke-width="1"/>
<g font-family="monospace" font-size="10" fill="#7a806a">${ticks}</g>
<g font-family="monospace" font-size="9" fill="#7a806a" letter-spacing="1"><text x="64" y="781">COASTLINES / NATURAL EARTH</text><text x="1472" y="781" text-anchor="end">EQUIRECTANGULAR PROJECTION</text></g>
</svg>`;
await fs.mkdir(path.dirname(output), {recursive: true});
await sharp(Buffer.from(svg)).webp({quality: 91, effort: 6}).toFile(output);
const reviewDirectory = path.resolve('work/journal-realism');
await fs.mkdir(reviewDirectory, {recursive: true});
await fs.writeFile(path.join(reviewDirectory, 'world-atlas.svg'), svg);
const metadata = await sharp(output).metadata();
console.log(JSON.stringify({output, polygons: polygons.length, width: metadata.width, height: metadata.height, bytes: (await fs.stat(output)).size}));
