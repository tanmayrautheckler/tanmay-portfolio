/** Position on a sheet hinged at x=0. Endpoints lie flat on opposite sides;
 * intermediate positions curve along the sheet while preserving its binding. */
export function pagePosition(u:number,z:number,progress:number,width:number,height:number): [number,number,number] {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const bend = Math.sin(p * Math.PI);
  const angle = p * Math.PI + bend * .46 * Math.sin(u * Math.PI - p * 1.8);
  return [
    u * width * Math.cos(angle),
    .207 + u * width * Math.sin(angle) + bend * .045 * Math.sin(z / height * Math.PI) * u,
    z + bend * .035 * Math.sin(u * Math.PI),
  ];
}
