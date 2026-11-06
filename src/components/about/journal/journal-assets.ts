import content,{type JournalPage} from './journal-content';
import {surfaceUrls} from './journal-surfaces';
const BASE='/images/about/journal/';
export const paperUrl=(page:JournalPage,living=false)=>BASE+page.texture+(living?'-stage':'')+'.webp';
export const paperUrls=(spread:number,living=false)=>[content.spreads[spread-1].left,content.spreads[spread-1].right].map(page=>paperUrl(page,living));
export function livingUrls(spread:number) {
 const scene=content.spreads[spread-1].scene;
 if(scene==='travel')return [...surfaceUrls('rock'),...surfaceUrls('ground'),...surfaceUrls('concrete')];
 if(scene==='sports')return [...surfaceUrls('concrete'),...surfaceUrls('ground')];
 if(scene==='valorant')return surfaceUrls('concrete');
 if(scene==='journey')return ['/images/about/gallery/bmw.webp',...surfaceUrls('rock'),...surfaceUrls('ground')];
 if(scene==='football')return [BASE+'messi-barca-2014.webp',...surfaceUrls('concrete')];
 if(scene==='world')return [BASE+'world-atlas.webp'];
 return [];
}
export const spreadAssets=(spread:number)=>[...new Set([...paperUrls(spread),...paperUrls(spread,true),...livingUrls(spread)])];
