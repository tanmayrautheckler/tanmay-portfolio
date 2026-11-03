export const filmBeats = [
  { id:"person", label:"The person", journal:0 },
  { id:"journey", label:"Across continents", journal:0 },
  { id:"outside", label:"Outside the lines", journal:1 },
  { id:"curious", label:"Still curious", journal:3 },
  { id:"next", label:"What’s next", journal:4 },
] as const;
export function clampFilm(value:number) { return Math.min(1,Math.max(0,Number.isFinite(value)?value:0)); }
export function filmBeat(value:number) { return Math.round(clampFilm(value)*4); }
export function sceneOpacity(progress:number,index:number) {
  const distance=Math.abs(clampFilm(progress)*4-index);
  const t=Math.min(1,Math.max(0,(distance-.3)/.4));
  return 1-t*t*(3-2*t);
}
export function captionOpacity(progress:number,index:number) {
  const distance=Math.abs(clampFilm(progress)*4-index);
  const t=Math.min(1,Math.max(0,(distance-.22)/.27));
  return 1-t*t*(3-2*t);
}
