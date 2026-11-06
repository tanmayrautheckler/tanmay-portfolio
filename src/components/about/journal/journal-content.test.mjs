import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';

const content=JSON.parse(await readFile(new URL('./content.json',import.meta.url),'utf8'));
const pages=content.spreads.flatMap(spread=>[spread.left,spread.right]);
const assets=new URL('../../../../public/images/about/journal/',import.meta.url);

test('book folios stay sequential and each page has a distinct texture',()=>{
  assert.equal(pages.length%2,0);
  assert.equal(new Set(pages.map(page=>page.texture)).size,pages.length);
  pages.forEach((page,index)=>assert.equal(page.number,String(index+1).padStart(2,'0')));
});
test('printed, living, and reader assets exist for every chapter',async()=>{
  for(const page of pages){
    await access(new URL(page.texture+'.webp',assets));
    await access(new URL(page.texture+'-stage.webp',assets));
    if(!['intro','roots','travel','football'].includes(page.kind))await access(new URL(page.texture+'-art.webp',assets));
  }
});
test('personal photographs are not repeated across printed pages',()=>{
  const photos=pages.flatMap(page=>[...(page.image?[page.image]:[]),...(page.photos??[]).map(photo=>photo.image)]);
  assert.equal(new Set(photos).size,photos.length);
});
