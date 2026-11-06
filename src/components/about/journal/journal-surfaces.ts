/** Pure asset names stay outside the renderer so the HTML cover does not pull
 * Three.js into its initial client bundle. */
export type JournalSurface='rock'|'ground'|'concrete';
export const surfaceUrls=(kind:JournalSurface)=>['color','normal','roughness'].map(map=>`/images/about/materials/journal/${kind}-${map}.webp`);
