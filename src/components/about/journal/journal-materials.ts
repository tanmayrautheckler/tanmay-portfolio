"use client";

import {useEffect,useMemo} from 'react';
import {useTexture} from '@react-three/drei/core/Texture';
import * as THREE from 'three';
import {surfaceUrls,type JournalSurface} from './journal-surfaces';

/** Small, locally served photographed material maps. Each instance owns its
 * repeat settings; shared loader textures stay untouched. */
export function useJournalSurface(kind:JournalSurface,repeat:[number,number]=[1,1],strength=.35){
  const urls=surfaceUrls(kind);
  const color=useTexture(urls[0]),normal=useTexture(urls[1]),roughness=useTexture(urls[2]);
  const [x,y]=repeat;
  const maps=useMemo(()=>[color,normal,roughness].map((source,index)=>{
    const texture=source.clone();
    texture.colorSpace=index===0?THREE.SRGBColorSpace:THREE.NoColorSpace;
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    texture.repeat.set(x,y);texture.anisotropy=4;texture.needsUpdate=true;
    return texture;
  }),[color,normal,roughness,x,y]);
  useEffect(()=>()=>maps.forEach(texture=>texture.dispose()),[maps]);
  return useMemo(()=>({map:maps[0],normalMap:maps[1],roughnessMap:maps[2],normalScale:new THREE.Vector2(strength,strength)}),[maps,strength]);
}
