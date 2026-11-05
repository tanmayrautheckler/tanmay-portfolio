/** Author-owned book layouts, composed from existing portfolio photographs.
 * Run from the repository root: node scripts/build-journal-assets.mjs
 * Original photos remain unchanged. WebP pages are textures; accessible text is
 * rendered from the same content.json in the journal reader.
 */
import fs from 'node:fs/promises';
import sharp from 'sharp';

const dir = 'public/images/about/journal';
const content = JSON.parse(await fs.readFile('src/components/about/journal/content.json', 'utf8'));
await fs.mkdir(dir, { recursive: true });
const W = 1000, H = 1400;
const ink = '#27312e', muted = '#73796c', gold = '#9d7744';
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const image = async (path, width, height, fit = 'cover') => `data:image/png;base64,${(await sharp('public'+path).resize(width,height,{fit,position:'attention',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer()).toString('base64')}`;
const wrap = (text, max = 41) => {
 const lines = []; let line = '';
 for (const word of text.split(' ')) { if ((line+' '+word).trim().length > max) {lines.push(line);line=word;} else line=(line+' '+word).trim(); }
 if(line)lines.push(line);return lines;
};
const lines = (text,x,y,size=36,color=ink,max=39,lineHeight=1.45,family='Arial') => wrap(text,max).map((line,i)=>`<text x="${x}" y="${y+i*size*lineHeight}" fill="${color}" font-size="${size}" font-family="${family}">${escape(line)}</text>`).join('');
const label = (text,x,y,size=23,color=muted) => `<text x="${x}" y="${y}" fill="${color}" font-family="monospace" font-size="${size}" letter-spacing="3">${escape(text)}</text>`;
const heading = (text,x,y,size=100) => text.split('\n').map((line,i)=>`<text x="${x}" y="${y+i*size*1.02}" fill="${ink}" font-family="Georgia" font-size="${size}" letter-spacing="-4">${escape(line)}</text>`).join('');
function page(body, number, side='right') {
 return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}"><defs><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".08"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter><linearGradient id="gutter"><stop stop-color="#6d5a35" stop-opacity="${side==='right'?'.16':'0'}"/><stop offset=".12" stop-color="#6d5a35" stop-opacity="0"/><stop offset=".88" stop-color="#6d5a35" stop-opacity="0"/><stop offset="1" stop-color="#6d5a35" stop-opacity="${side==='left'?'.16':'0'}"/></linearGradient></defs><rect width="1000" height="1400" fill="#eee8d8"/><rect width="1000" height="1400" fill="#f8f3e7" filter="url(#grain)"/>${body}<path d="M85 1294H915" stroke="#b8b09b" stroke-width="1"/>${label('TANMAY RAUT / PERSONAL NOTES',85,1338,17)}${label(number,875,1338,23)}<rect width="1000" height="1400" fill="url(#gutter)"/></svg>`;
}
async function write(name,svg) {await sharp(Buffer.from(svg)).webp({quality:92}).toFile(`${dir}/${name}.webp`);}
const [a,b] = content.spreads;
const portrait = await image(a.left.image,720,1040,'contain');
await write('person',page(`${label(a.left.kicker,85,95)}${heading(a.left.title,82,245,140)}<path d="M86 437H415" stroke="${gold}" stroke-width="3"/>${lines(a.left.body,88,492,34,muted,43)}<circle cx="616" cy="898" r="265" fill="#dbdac7"/><path d="M382 1175C440 1060 800 1008 905 1179" fill="none" stroke="#b6bba7" stroke-width="2"/><image x="302" y="572" width="670" height="664" preserveAspectRatio="xMidYMid meet" xlink:href="${portrait}"/>${label('MUMBAI',88,912,22)}<path d="M90 947v96m-7-8 7 10 7-10" stroke="${gold}" fill="none" stroke-width="2"/>${label('PHOENIX',88,1083,22)}<text x="88" y="1218" font-size="42" font-style="italic" font-family="Georgia" fill="${ink}">Tanmay.</text>`,a.left.number,'left'));
// Each photograph belongs to one printed page. Layouts share the reader's source.
const road = await image(a.right.image, 820, 595);
await write('journey',page(`${label(a.right.kicker,85,95)}${heading(a.right.title,85,235,97)}${lines(a.right.body,88,438,32,muted,45)}
<path d="M88 582H912M88 601H912" stroke="#b7aa8c"/><text x="88" y="722" font-family="Georgia" font-size="126" fill="${ink}">MUM</text><text x="655" y="722" font-family="Georgia" font-size="126" fill="${ink}">PHX</text><path d="M410 681Q528 587 640 681m-21-3 22 4-9-20" fill="none" stroke="${gold}" stroke-width="3"/>${label('MUMBAI',94,773,20)}${label('PHOENIX',663,773,20)}
<g transform="translate(103 833) rotate(-3 390 150)"><rect x="-12" y="-12" width="818" height="355" fill="#fffaf0"/><image width="794" height="280" preserveAspectRatio="xMidYMin slice" xlink:href="${road}"/><text x="25" y="321" font-size="25" fill="${ink}" font-family="Georgia" font-style="italic">Somewhere along the way.</text></g>${label('THE CAREER STORY LIVES IN EXPERIENCE ↗',88,1247,18)}`,a.right.number));
const travelImage = async (entry,w,h) => image(entry.image,w,h);
const [sky,city,aurora,forest] = await Promise.all([
 travelImage(b.left.photos[0],840,540),travelImage(b.left.photos[1],620,440),
 travelImage(b.right.photos[0],640,870),travelImage(b.right.photos[1],510,345)
]);
await write('outside',page(`${label(b.left.kicker,85,95)}${heading(b.left.title,85,224,105)}
<g transform="translate(82 388) rotate(-3 418 250)"><rect x="-10" y="-10" width="856" height="560" fill="#fffaf0"/><image width="836" height="480" preserveAspectRatio="xMidYMid slice" xlink:href="${sky}"/><text x="22" y="525" font-size="25" font-family="Georgia" font-style="italic" fill="${ink}">Above the clouds.</text></g>
<path d="M129 937q-80 61 7 121m-8-20 9 21-21-8" stroke="${gold}" stroke-width="2" fill="none"/>
<g transform="translate(335 856) rotate(5 270 170)"><rect x="-12" y="-12" width="562" height="360" fill="#fffaf0"/><image width="538" height="290" preserveAspectRatio="xMidYMid slice" xlink:href="${city}"/><text x="18" y="330" font-size="24" font-family="Georgia" font-style="italic" fill="${ink}">Los Angeles. Another point of view.</text></g>
${label('01',92,1134,50,gold)}${label('SKYDIVING',92,1175,17)}${label('02 / LOS ANGELES',400,1246,18)}`,b.left.number,'left'));
await write('after-dark',page(`${label(b.right.kicker,85,95)}${heading(b.right.title,85,224,105)}
<g transform="translate(95 392) rotate(2 300 380)"><rect x="-10" y="-10" width="640" height="765" fill="#fffaf0"/><image width="620" height="700" preserveAspectRatio="xMidYMid slice" xlink:href="${aurora}"/><text x="24" y="739" font-family="Georgia" font-style="italic" font-size="27" fill="${ink}">Look up.</text></g>
<g transform="translate(388 887) rotate(-7 220 140)"><rect x="-12" y="-12" width="496" height="326" fill="#fffaf0"/><image width="472" height="259" preserveAspectRatio="xMidYMid slice" xlink:href="${forest}"/><text x="20" y="298" font-family="Georgia" font-style="italic" font-size="26" fill="${ink}">No rush. No screen.</text></g>
<g transform="translate(775 484) rotate(90)">${label('03 / NORTHERN LIGHTS',0,0,19)}${label('04 / UNDER THE TREES',0,43,19)}</g>${label('SOME MOMENTS DESERVE MORE TIME.',88,1246,18)}`,b.right.number));
const c=content.spreads[2];
await write('matchday',page(`${label(c.left.kicker,85,95)}${heading(c.left.title,85,235,108)}
<defs><linearGradient id="jersey"><stop stop-color="#20314b"/><stop offset=".48" stop-color="#314667"/><stop offset=".49" stop-color="#87364e"/><stop offset="1" stop-color="#6b263e"/></linearGradient><pattern id="pitch" width="85" height="85" patternUnits="userSpaceOnUse"><path d="M85 0H0V85" fill="none" stroke="#e7d6b8" stroke-opacity=".1"/></pattern></defs>
<rect x="85" y="416" width="830" height="646" fill="#202f35"/><rect x="85" y="416" width="830" height="646" fill="url(#pitch)"/>
<path d="M142 470H858V1005H142Z M500 470V1005 M142 622H260V854H142 M858 622H740V854H858" stroke="#d2d3bb" stroke-opacity=".25" stroke-width="2" fill="none"/><circle cx="500" cy="738" r="94" stroke="#d2d3bb" stroke-opacity=".25" stroke-width="2" fill="none"/>
<g transform="translate(405 465) rotate(7 200 230)"><path d="M90 25 155 0Q200 45 245 0L310 25 386 144 305 198 283 165V460H117V165L95 198 14 144Z" fill="#101d27" opacity=".35" transform="translate(12 20)"/><path d="M90 25 155 0Q200 45 245 0L310 25 386 144 305 198 283 165V460H117V165L95 198 14 144Z" fill="url(#jersey)" stroke="#d9b66d" stroke-width="2"/><text x="200" y="313" text-anchor="middle" font-family="Georgia" font-size="180" fill="#e7ce91">10</text><text x="200" y="117" text-anchor="middle" font-family="monospace" font-size="23" letter-spacing="5" fill="#e7ce91">MESSI</text></g>
<path d="M190 932C437 914 208 682 420 574" stroke="#cfb97f" stroke-width="3" stroke-dasharray="10 11" fill="none"/><circle cx="190" cy="932" r="12" fill="#e8d6a2"/>${label('FC BARCELONA',131,1026,21,'#e8d6a2')}
${lines(c.left.body,88,1130,32,ink,46,1.4)}${lines(c.left.aside,88,1243,27,muted,60)}`,c.left.number,'left'));
const p=c.right.project;
await write('curiosity',page(`${label(c.right.kicker,85,95)}${heading(c.right.title,85,235,100)}${lines(c.right.body,88,459,33,muted,44)}
<path d="M103 642C247 575 289 694 415 630S642 575 804 660" stroke="${gold}" stroke-width="2" fill="none"/><circle cx="103" cy="642" r="6" fill="${gold}"/><text x="825" y="684" font-family="Georgia" font-style="italic" font-size="88" fill="${gold}">?</text>
<rect x="85" y="748" width="830" height="367" rx="3" fill="#203d3a"/>${label('A PERSONAL RABBIT HOLE',123,801,18,'#d6c6a3')}<text x="123" y="880" font-family="Georgia" font-size="52" fill="#f8f0d9">${escape(p.title)}</text>${lines(p.body,123,939,30,'#d5ddd2',44,1.4)}${label('EXPLORE THE PROJECT ↗',123,1082,19,'#d6c6a3')}
<text x="88" y="1221" font-family="Georgia" font-style="italic" font-size="42" fill="${ink}">${escape(c.right.note)}</text>`,c.right.number));
const cover=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1400"><defs><filter id="cloth"><feTurbulence type="fractalNoise" baseFrequency=".8 .35" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feBlend in="SourceGraphic" mode="soft-light"/></filter><linearGradient id="foil"><stop stop-color="#b99c64"/><stop offset=".45" stop-color="#f3e0ad"/><stop offset="1" stop-color="#a99063"/></linearGradient></defs><rect width="1000" height="1400" fill="#263b36"/><rect width="1000" height="1400" fill="#263b36" opacity="0" filter="url(#cloth)"/><rect x="42" y="40" width="916" height="1320" rx="12" fill="none" stroke="#ad996b" stroke-width="1.5" opacity=".7"/><rect x="54" y="52" width="892" height="1296" rx="8" fill="none" stroke="#ad996b" stroke-width="1" opacity=".35"/><path d="M62 0V1400" stroke="#122722" stroke-width="8"/><text x="505" y="190" text-anchor="middle" font-family="monospace" letter-spacing="7" font-size="24" fill="#cab98a">A PERSONAL JOURNAL</text><g fill="url(#foil)" font-family="Georgia" text-anchor="middle"><text x="505" y="518" font-size="140" letter-spacing="-7">Tanmay</text><text x="505" y="665" font-size="140" letter-spacing="-7">Raut.</text><text x="505" y="791" font-size="37" font-style="italic">Work. Wonder. Everything between.</text></g><path d="M444 930h120m-60-28v56" stroke="#cfbb83" stroke-width="1.5"/><circle cx="504" cy="930" r="44" fill="none" stroke="#cfbb83" stroke-width="1.5"/><text x="505" y="1213" text-anchor="middle" font-family="monospace" letter-spacing="5" font-size="22" fill="#cab98a">MUMBAI · PHOENIX</text><text x="505" y="1266" text-anchor="middle" font-family="monospace" letter-spacing="3" font-size="19" fill="#cab98a">VOL. 01 / STILL CURIOUS</text></svg>`;
await write('cover',cover);
await sharp('public/images/about/materials/wood_floor_Diffuse.jpg').resize(1024).webp({quality:82}).toFile(`${dir}/desk.webp`);
await sharp('public/images/about/materials/wood_floor_nor_gl.jpg').resize(512).webp({quality:85}).toFile(`${dir}/desk-normal.webp`);
const cloth=Buffer.alloc(256*256*3);let seed=41;for(let y=0;y<256;y++)for(let x=0;x<256;x++){seed=(seed*1664525+1013904223)>>>0;const v=127+((seed>>>24)%28)-14+(x%3===0?14:0)+(y%3===0?9:0);const i=(y*256+x)*3;cloth[i]=cloth[i+1]=cloth[i+2]=v;}
await sharp(cloth,{raw:{width:256,height:256,channels:3}}).png().toFile(`${dir}/cloth.png`);
console.log('Journal textures written. Source photographs unchanged.');
