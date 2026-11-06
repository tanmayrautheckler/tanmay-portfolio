"use client";
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';

export default function ThoughtCard({label,position,angle=0}:{label:string;position:[number,number,number];angle?:number}) {
  const map=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
    const ctx=canvas.getContext('2d')!;
    ctx.fillStyle='#f5edda';ctx.fillRect(0,0,512,256);
    ctx.strokeStyle='#b89753';ctx.strokeRect(12,12,488,232);
    ctx.font='italic 62px Georgia';ctx.fillStyle='#21372f';ctx.textAlign='center';ctx.fillText(label,256,149);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
  },[label]);
  useEffect(()=>()=>map.dispose(),[map]);
  return <mesh position={position} rotation={[-.55,angle,0]} castShadow><planeGeometry args={[.95,.475]}/><meshStandardMaterial map={map} side={THREE.DoubleSide} roughness={.9}/></mesh>;
}
