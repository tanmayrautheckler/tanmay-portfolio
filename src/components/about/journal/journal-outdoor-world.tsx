"use client";
/* R3F owns animated scene transforms. */
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import Roadster from './journal-roadster';
import * as THREE from 'three';
import {useJournalSurface} from './journal-materials';
import {JournalCharacter} from './journal-character';
import {HeroClimber} from './journal-climber';

type Clock={time:React.RefObject<{t:number}>};
type Point=[number,number,number];
const INK='#253732';
const rand=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const gaussian=(x:number,z:number,cx:number,cz:number,sx:number,sz:number)=>Math.exp(-((x-cx)**2/sx+(z-cz)**2/sz));
const riverX=(z:number)=>.08+Math.sin((z+.2)*2.1)*.22;
function height(x:number,z:number){
 const edge=THREE.MathUtils.smoothstep(Math.min(2.84-Math.abs(x),1.63-Math.abs(z)),0,.3);
 let h=.065+1.7*gaussian(x,z,-.6,-1.08,.6,.22)+1.02*gaussian(x,z,-1.8,-.85,.48,.38)+1.35*gaussian(x,z,1.7,-.56,.48,.45)+.47*gaussian(x,z,-1.5,.05,.65,.3);
 h+=(Math.sin(x*9+z*4)*Math.sin(z*12-x*2)*.11+Math.sin(x*21-z*17)*.025)*Math.min(h,1.3);
 if(z>-.5){const valley=Math.exp(-(((x-riverX(z))/.31)**2));h=THREE.MathUtils.lerp(h,.065,valley*.98);}
 if(z>.8)h=THREE.MathUtils.lerp(h,.065,THREE.MathUtils.smoothstep(z,.8,1.3));
 if(z>-.5){const d=Math.abs(x-riverX(z)),w=.13+.07*THREE.MathUtils.clamp((z+.5)/2.09,0,1);h-=.035*Math.exp(-((d/(w*.86))**6));h+=.048*Math.exp(-(((d-w-.065)/.058)**2));}
 return Math.max(.035,h*edge);
}

function Rod({a,b,r=.012,color=INK}:{a:Point;b:Point;r?:number;color?:string}){
 const {position,rotation,length}=useMemo(()=>{
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),axis=end.clone().sub(start);
  return {position:start.add(end).multiplyScalar(.5),rotation:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),axis.clone().normalize()),length:axis.length()};
 },[a,b]);
 return <mesh position={position} quaternion={rotation} castShadow><cylinderGeometry args={[r,r,length,8]}/><meshStandardMaterial color={color} roughness={.8}/></mesh>;
}
function Terrain(){
 const surface=useJournalSurface('ground',[4,3],.62),rockSurface=useJournalSurface('rock',[3,2],.65);
 const geometry=useMemo(()=>{
  const g=new THREE.PlaneGeometry(5.68,3.26,112,72);g.rotateX(-Math.PI/2);
  const p=g.attributes.position,colors=new Float32Array(p.count*3),stone=new THREE.Color('#c8cfcc'),grass=new THREE.Color('#d2dfbc'),snow=new THREE.Color('#e5e9df');
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),z=p.getZ(i),y=height(x,z);p.setY(i,y);
   const variation=.87+rand(i*.17)*.15;
   const c=grass.clone().lerp(stone,THREE.MathUtils.smoothstep(y,.45,1.15));
   if(y>1.45)c.lerp(snow,THREE.MathUtils.smoothstep(y,1.45,1.8)*.7);
   c.multiplyScalar(variation);c.toArray(colors,i*3);
  }
  g.setAttribute('color',new THREE.BufferAttribute(colors,3));g.computeVertexNormals();return g;
 },[]);
 const rockPatches=useMemo(()=>{
  const source=geometry.toNonIndexed(),p=source.attributes.position,n=source.attributes.normal,positions:number[]=[],normals:number[]=[],uv:number[]=[];
  for(let i=0;i<p.count;i+=3){
   const y=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3,up=(n.getY(i)+n.getY(i+1)+n.getY(i+2))/3;
   if(y<.62||up>.74&&y<1.43)continue;
   for(let j=0;j<3;j++){positions.push(p.getX(i+j),p.getY(i+j)+.003,p.getZ(i+j));normals.push(n.getX(i+j),n.getY(i+j),n.getZ(i+j));uv.push((Math.abs(n.getX(i+j))>Math.abs(n.getZ(i+j))?p.getZ(i+j):p.getX(i+j))*.44,p.getY(i+j)*.64+p.getZ(i+j)*.08);}
  }
  source.dispose();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return g;
 },[geometry]);
 const skirt=useMemo(()=>{
  const positions:number[]=[],colors:number[]=[],c=new THREE.Color();
  const boundary:Point[]=[];
  for(let i=0;i<=82;i++)boundary.push([-2.84+5.68*i/82,0,-1.63]);
  for(let i=1;i<=52;i++)boundary.push([2.84,0,-1.63+3.26*i/52]);
  for(let i=1;i<=82;i++)boundary.push([2.84-5.68*i/82,0,1.63]);
  for(let i=1;i<=52;i++)boundary.push([-2.84,0,1.63-3.26*i/52]);
  for(let i=0;i<boundary.length-1;i++){
   const a=boundary[i],b=boundary[i+1],topA=height(a[0],a[2]),topB=height(b[0],b[2]);
   [[a[0],.004,a[2]],[b[0],.004,b[2]],[b[0],topB,b[2]],[a[0],.004,a[2]],[b[0],topB,b[2]],[a[0],topA,a[2]]].forEach((v,j)=>{positions.push(...v);c.set(j===2||j===4||j===5?'#b2a27a':'#dacbaa').toArray(colors,colors.length);});
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
 },[]);
 useEffect(()=>()=>{geometry.dispose();rockPatches.dispose();skirt.dispose();},[geometry,rockPatches,skirt]);
 return <group name="sculpted-land">
  <group name="connected-soil-backing" userData={{revealOrder:0,journalLayer:'terrain',journalReveal:'fade',journalFastFade:true}}>
   <mesh position={[0,.034,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[5.68,3.26]}/><meshStandardMaterial {...surface} color="#c8d6b4" roughness={.98}/></mesh>
  </group>
  <group name="rising-landforms" userData={{revealOrder:0,journalLayer:'terrain',journalReveal:'rise',journalRiseDepth:2.0}}>
  <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial {...surface} vertexColors roughness={.98}/></mesh>
  <mesh geometry={rockPatches} castShadow receiveShadow><meshStandardMaterial {...rockSurface} color="#a8c3ed" roughness={.96}/></mesh>
  <mesh geometry={skirt} receiveShadow><meshStandardMaterial vertexColors roughness={1} side={THREE.DoubleSide}/></mesh>
  </group>
 </group>;
}
function Forest(){
 const rockSurface=useJournalSurface('rock',[1,1],.5);
 const foliage=useMemo(()=>{
  const vertices:number[]=[],colors:number[]=[];
  // Needled branch whorls leave an irregular silhouette instead of cone tiers.
  for(let whorl=0;whorl<12;whorl++){
   const y=-.88+whorl*.155,radius=(1-whorl/13)*.58,branches=7;
   for(let branch=0;branch<branches;branch++){
    const angle=branch/branches*Math.PI*2+whorl*.71,spread=.17+rand(branch+whorl*19)*.11,length=radius*(.75+rand(branch+whorl*9)*.3);
    const inner=[Math.cos(angle)*length*.08,y+.13,Math.sin(angle)*length*.08];
    for(let needle=0;needle<3;needle++){
     const a=angle+(needle-1)*spread,r=length*(.78+needle*.08);
     const points=[inner,[Math.cos(a-spread*.55)*r,y-.045+rand(needle+whorl)*.025,Math.sin(a-spread*.55)*r],[Math.cos(a+spread*.55)*r,y-.045,Math.sin(a+spread*.55)*r]];
     points.forEach((v,j)=>{vertices.push(...v);new THREE.Color().setHSL(.29+rand(branch+whorl)*.03,.2,.17+rand(branch*3+j+whorl)*.1).toArray(colors,colors.length);});
    }
   }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
 },[]);
 useEffect(()=>()=>foliage.dispose(),[foliage]);
 const leafCluster=useMemo(()=>{
  const positions:number[]=[],colors:number[]=[],up=new THREE.Vector3(0,1,0);
  for(let i=0;i<54;i++){const yy=-.85+1.7*(i+.5)/54,a=i*2.39996,r=Math.sqrt(1-yy*yy),normal=new THREE.Vector3(Math.cos(a)*r,yy,Math.sin(a)*r),center=normal.clone().multiplyScalar(.7+rand(i+8)*.2),side=new THREE.Vector3().crossVectors(up,normal).normalize(),along=new THREE.Vector3().crossVectors(normal,side).normalize();
   const tip=center.clone().addScaledVector(along,.22),base=center.clone().addScaledVector(along,-.18),left=center.clone().addScaledVector(side,.11).addScaledVector(normal,.035),right=center.clone().addScaledVector(side,-.11).addScaledVector(normal,.035);
   for(const point of [base,left,tip,base,tip,right]){positions.push(point.x,point.y,point.z);new THREE.Color().setHSL(.24+rand(i)*.055,.29,.16+rand(i+3)*.10).toArray(colors,colors.length);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
 },[]);
 useEffect(()=>()=>leafCluster.dispose(),[leafCluster]);
 const trunks=useRef<THREE.InstancedMesh>(null),crowns=useRef<THREE.InstancedMesh>(null),rocks=useRef<THREE.InstancedMesh>(null),broadleaf=useRef<THREE.InstancedMesh>(null);
 useEffect(()=>{
  if(!trunks.current||!crowns.current||!rocks.current||!broadleaf.current)return;
  const d=new THREE.Object3D();let count=0,leafCount=0;
  for(let i=0;i<135&&count<38;i++){
   const x=(rand(i+7)-.5)*5.1,z=(rand(i+29)-.5)*2.7,y=height(x,z);
   if(y>1.05||Math.abs(x-riverX(z))<.39||z>.75||x>1.12&&z>-.8||x< -2.1&&z>-.6&&z<-.2)continue;
   const s=.15+rand(i+53)*.17;
   d.position.set(x,y+s*.45,z);d.scale.set(s*.13,s*.9,s*.13);d.rotation.set(0,0,.04*Math.sin(i));d.updateMatrix();trunks.current.setMatrixAt(count,d.matrix);
   d.position.set(x,y+s*1.1,z);d.scale.set(s*(count%3===0?.88:.67),s,s*(count%3===0?.88:.67));d.rotation.set(0,i,0);d.updateMatrix();crowns.current.setMatrixAt(count,d.matrix);crowns.current.setColorAt(count,new THREE.Color().setHSL(.28+rand(i)*.04,.11,.80+rand(i+15)*.1));
   if(count%6===0){
    d.scale.setScalar(0);d.updateMatrix();crowns.current.setMatrixAt(count,d.matrix);
    for(let j=0;j<7;j++){const a=j*2.4;d.position.set(x+Math.sin(a)*s*.28,y+s*(.88+j*.105),z+Math.cos(a)*s*.23);d.scale.set(s*(.31-j*.01),s*.24,s*.28);d.rotation.set(j*.3,i+j,.1*j);d.updateMatrix();broadleaf.current.setMatrixAt(leafCount,d.matrix);broadleaf.current.setColorAt(leafCount,new THREE.Color().setHSL(.24+rand(i+j)*.045,.30,.33+rand(i+j*3)*.09));leafCount++;}
   }
   count++;
  }
  broadleaf.current.count=leafCount;broadleaf.current.instanceMatrix.needsUpdate=true;if(broadleaf.current.instanceColor)broadleaf.current.instanceColor.needsUpdate=true;
  trunks.current.count=count;crowns.current.count=count;trunks.current.instanceMatrix.needsUpdate=true;crowns.current.instanceMatrix.needsUpdate=true;if(crowns.current.instanceColor)crowns.current.instanceColor.needsUpdate=true;
  for(let i=0;i<34;i++){
   const z=-1.3+rand(i+84)*2.8,x=riverX(z)+(i%2?1:-1)*(.3+rand(i+21)*.12),y=height(x,z),s=.035+rand(i+34)*.07;
   d.position.set(x,y+s*.15,z);const slope=Math.hypot(height(x+.025,z)-height(x-.025,z),height(x,z+.025)-height(x,z-.025))/.05;d.scale.set(s*1.5,s*.65,s);if(y>.55||slope>1.15||z<-.48)d.scale.setScalar(0);d.rotation.set(i,i*.4,i*.1);d.updateMatrix();rocks.current.setMatrixAt(i,d.matrix);rocks.current.setColorAt(i,new THREE.Color().setHSL(.12,.1,.38+rand(i)*.18));
  }
  rocks.current.instanceMatrix.needsUpdate=true;if(rocks.current.instanceColor)rocks.current.instanceColor.needsUpdate=true;
 },[]);
 return <group name="forest" userData={{revealOrder:1,journalLayer:'terrain',journalReveal:'rise',journalRiseDepth:2.0}}>
  <instancedMesh ref={trunks} args={[undefined,undefined,52]} castShadow><cylinderGeometry args={[.8,1,1,7]}/><meshStandardMaterial color="#655d44" roughness={1}/></instancedMesh>
  <instancedMesh ref={crowns} args={[undefined,undefined,38]} geometry={foliage} castShadow receiveShadow><meshStandardMaterial color="#6d815a" vertexColors roughness={.97} side={THREE.DoubleSide}/></instancedMesh>
  <instancedMesh ref={broadleaf} args={[undefined,undefined,49]} geometry={leafCluster} castShadow receiveShadow><meshStandardMaterial color="#b8c8a5" vertexColors side={THREE.DoubleSide} roughness={1}/></instancedMesh>
  <instancedMesh ref={rocks} args={[undefined,undefined,34]} castShadow receiveShadow><dodecahedronGeometry args={[1,1]}/><meshStandardMaterial {...rockSurface} color="#a8bddb" roughness={.95}/></instancedMesh>
 </group>;
}
function fracturedSlab(seed:number){
 // A fractured volume keeps the existing footprint while breaking the six-face box silhouette.
 const positions:number[]=[],uv:number[]=[],indices:number[]=[],rings=22,sides=40;
 for(let row=0;row<=rings;row++){
  const t=row/rings,y=t-.5,width=.5*(1.02-.25*t+.09*Math.sin(t*9+seed)),depth=.5*(1-.24*t+.08*Math.cos(t*11+seed));
  for(let i=0;i<=sides;i++){
   const a=i/sides*Math.PI*2,c=Math.cos(a),sn=Math.sin(a),ledge=Math.sin(t*29+seed)*.007;
   const fractureRadius=.96+.055*Math.sin(a*3+seed)+.035*Math.cos(a*7+y*3);
   let x=Math.sign(c)*Math.pow(Math.abs(c),.64)*width*fractureRadius+Math.sin(y*14+seed)*.018;
   let z=Math.sign(sn)*Math.pow(Math.abs(sn),.66)*depth*fractureRadius;
   const fracture=Math.sin(y*21+x*17+seed)*.008+Math.cos(y*36-x*7)*.005;
   x+=fracture*.5;z+=fracture+ledge;
   // The climbing face retains its original contact plane.
   if(sn>.55)z=.46+Math.sin(y*8+seed)*.035+Math.sin(x*9+y*2)*.012;
   const topPlane=.36+.05*c+.04*sn+.025*Math.sin(a*5+seed);
   const topBreak=Math.pow(t,12)*(.5-topPlane);
   positions.push(x,y-topBreak,z);uv.push(i/sides*1.3,t);
   if(row<rings&&i<sides){const q=row*(sides+1)+i;indices.push(q,q+sides+1,q+1,q+1,q+sides+1,q+sides+2);}
  }
 }
 for(const row of [0,rings]){const center=positions.length/3;positions.push(0,row===0?-.5:.36,0);uv.push(.5,row===0?0:1);for(let i=0;i<sides;i++){const a=row*(sides+1)+i;if(row===0)indices.push(center,a,a+1);else indices.push(center,a+1,a);}}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 const projected=geometry.toNonIndexed(),p=projected.attributes.position,coords:number[]=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),normal=new THREE.Vector3();
 for(let i=0;i<p.count;i+=3){a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);normal.crossVectors(b.sub(a),c.sub(a)).normalize();const nx=Math.abs(normal.x),ny=Math.abs(normal.y),nz=Math.abs(normal.z);for(let j=0;j<3;j++){const x=p.getX(i+j),y=p.getY(i+j),z=p.getZ(i+j);if(ny>nx&&ny>nz)coords.push(x+.5,z+.5);else if(nx>nz)coords.push(z+.5,y+.5);else coords.push(x+.5,y+.5);}}
 projected.setAttribute('uv',new THREE.Float32BufferAttribute(coords,2));geometry.dispose();return projected;
}
function LayeredRock({position=[0,0,0],scale=[1,1,1],layers=4}:{position?:Point;scale?:Point;layers?:number}){
 const surface=useJournalSurface('rock',[1,1.3],.7),geometry=useMemo(()=>fracturedSlab(2.4+layers),[layers]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <group position={position} scale={scale}>
  <mesh geometry={geometry} position={[0,.5,0]} castShadow receiveShadow><meshStandardMaterial {...surface} color="#a8c3ed" roughness={.94}/></mesh>
 </group>;
}
const waterVertex=`
varying vec2 vUv;
#include <clipping_planes_pars_vertex>
void main(){
 vUv=uv;
 vec4 mvPosition=modelViewMatrix*vec4(position,1.);
 gl_Position=projectionMatrix*mvPosition;
 #include <clipping_planes_vertex>
}`;
const waterNoise=`
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){return noise(p)*.57+noise(p*2.03+13.1)*.28+noise(p*4.1+7.3)*.15;}
`;
const waterFragmentHeader=`
varying vec2 vUv;
uniform float uTime;
uniform float uReveal;
#include <clipping_planes_pars_fragment>
${waterNoise}
`;
function makeWaterNormal(){
 const size=128,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size*Math.PI*2,v=y/size*Math.PI*2,i=(y*size+x)*4;
  data[i]=128+Math.sin(u*3+Math.sin(v))*19+Math.cos(u*5-v*3)*8;
  data[i+1]=128+Math.cos(v*5+Math.sin(u*2))*.9*19;data[i+2]=250;data[i+3]=255;
 }
 const texture=new THREE.DataTexture(data,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(1.1,2.1);texture.needsUpdate=true;return texture;
}
function Water({time}:Clock){
 const surface=useRef<THREE.MeshPhysicalMaterial>(null),fall=useRef<THREE.ShaderMaterial>(null),foam=useRef<THREE.ShaderMaterial>(null),riverFoam=useRef<THREE.ShaderMaterial>(null),mist=useRef<THREE.InstancedMesh>(null),pebbles=useRef<THREE.InstancedMesh>(null);
 const normals=useMemo(()=>makeWaterNormal(),[]),uniforms=useMemo(()=>({uTime:{value:0},uReveal:{value:1}}),[]);
 const ground=useJournalSurface('ground',[1.3,5.5],.30),stone=useJournalSurface('rock',[1.2,1.2],.36);
 const river=useMemo(()=>{
  const positions:number[]=[],uv:number[]=[],indices:number[]=[],colors:number[]=[];
  const shallow=new THREE.Color('#a2b9a2'),deep=new THREE.Color('#658d7f');
  for(let row=0;row<=100;row++){
   const t=row/100,z=-.5+t*2.09,x=riverX(z),w=.13+.07*t;
   for(let col=0;col<=4;col++){
    const u=col/4;positions.push(x+(u*2-1)*w,.078,z);uv.push(u,t);
    shallow.clone().lerp(deep,Math.sin(u*Math.PI)*.8).toArray(colors,colors.length);
   }
   if(row<100)for(let col=0;col<4;col++){const a=row*5+col;indices.push(a,a+5,a+1,a+1,a+5,a+6);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
 },[]);
 const bed=useMemo(()=>{
  const g=river.clone(),p=g.attributes.position;
  for(let i=0;i<p.count;i++)p.setY(i,.039+Math.sin(p.getX(i)*47+p.getZ(i)*28)*.003);
  g.deleteAttribute('color');g.computeVertexNormals();return g;
 },[river]);
 const banks=useMemo(()=>{
  const positions:number[]=[],uv:number[]=[],colors:number[]=[],indices:number[]=[];
  for(const side of [-1,1]){
   const base=positions.length/3;
   for(let row=0;row<=100;row++){
    const t=row/100,z=-.48+t*2.04,x=riverX(z),w=.13+.07*THREE.MathUtils.clamp((z+.5)/2.09,0,1);
    for(let col=0;col<=6;col++){
     const u=col/6,irregular=Math.sin(z*29+side*7)*.009+Math.cos(z*43-side)*.006;
     const xx=x+side*(w-.028+u*.164+irregular*(1-u));
     const y=height(xx,z)+.003;
     positions.push(xx,y,z);uv.push(u,t);
     new THREE.Color().lerpColors(new THREE.Color('#6d8779'),new THREE.Color('#b6c19a'),Math.min(1,u*1.7)).toArray(colors,colors.length);
    }
    if(row<100)for(let col=0;col<6;col++){const a=base+row*7+col;if(side<0)indices.push(a,a+1,a+7,a+1,a+8,a+7);else indices.push(a,a+7,a+1,a+1,a+7,a+8);}
   }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
 },[]);
 const curtain=useMemo(()=>{
  const g=new THREE.PlaneGeometry(.25,.92,32,58),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),v=(p.getY(i)+.46)/.92;
   p.setXYZ(i,x*(1.12-v*.12)+Math.sin(v*8+x*9)*.006,.095+v*.92,-.21-.18*v*v+Math.sin(x*48)*.008);
  }
  g.computeVertexNormals();return g;
 },[]);
 const mistTexture=useMemo(()=>{
  const size=48,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=Math.hypot((x+.5)/size*2-1,(y+.5)/size*2-1),i=(y*size+x)*4;data[i]=218;data[i+1]=229;data[i+2]=212;data[i+3]=Math.pow(Math.max(0,1-r),2)*115;}
  const texture=new THREE.DataTexture(data,size,size);texture.needsUpdate=true;return texture;
 },[]);
 useEffect(()=>()=>{river.dispose();bed.dispose();banks.dispose();curtain.dispose();normals.dispose();mistTexture.dispose();},[river,bed,banks,curtain,normals,mistTexture]);
 useEffect(()=>{
  if(!pebbles.current)return;const d=new THREE.Object3D();
  for(let i=0;i<32;i++){
   const z=-.03+rand(i+211)*1.52,t=(z+.5)/2.09,w=.13+.07*t,side=i%2?-1:1,s=.017+rand(i+93)*.022;
   const x=riverX(z)+side*(w-.016+rand(i+67)*.032);
   d.position.set(x,.057+rand(i+6)*.008,z);d.rotation.set(i*.13,i*2.4,i*.07);d.scale.set(s*1.6,s*.57,s);d.updateMatrix();pebbles.current.setMatrixAt(i,d.matrix);
   pebbles.current.setColorAt(i,new THREE.Color().setHSL(.13,.065,.37+rand(i+12)*.18));
  }
  pebbles.current.instanceMatrix.needsUpdate=true;if(pebbles.current.instanceColor)pebbles.current.instanceColor.needsUpdate=true;
 },[]);
 useFrame(({camera})=>{
  const t=time.current.t,normal=surface.current?.normalMap;if(normal){normal.offset.y=-t*.028;normal.offset.x=Math.sin(t*.13)*.025;}
  for(const material of [fall.current,foam.current,riverFoam.current])if(material)material.uniforms.uTime.value=t;
  if(mist.current){const d=new THREE.Object3D();for(let i=0;i<16;i++){const p=(t*.041+rand(i+9))%1;d.position.set(.01+Math.sin(i*3.8+t*.18)*(.06+p*.17),.10+p*.15,-.19+Math.cos(i*2.4)*.08);d.quaternion.copy(camera.quaternion);d.scale.setScalar(.13+p*.25);d.updateMatrix();mist.current.setMatrixAt(i,d.matrix);}mist.current.instanceMatrix.needsUpdate=true;}
 });
 return <group name="watercourse">
  <group name="waterfall-stone-flanks" userData={{journalLayer:'terrain',revealOrder:1,journalReveal:'rise',journalRiseDepth:1.1}}>
   <LayeredRock position={[-.47,.035,-.67]} scale={[.75,.99,.57]}/><LayeredRock position={[.47,.035,-.67]} scale={[.73,1.03,.56]}/>
  </group>
  <group name="recessed-bed-and-damp-banks" userData={{journalLayer:'terrain',revealOrder:1,journalReveal:'rise',journalRiseDepth:.32}}>
   <mesh geometry={bed} receiveShadow><meshStandardMaterial {...ground} color="#a4b1a4" roughness={.92}/></mesh>
   <mesh position={[0,.043,-.22]} rotation={[-Math.PI/2,0,0]} scale={[1,.76,1]} receiveShadow><circleGeometry args={[.31,48]}/><meshStandardMaterial {...ground} color="#7f958b" roughness={.94}/></mesh>
   <mesh geometry={banks} receiveShadow><meshStandardMaterial {...ground} vertexColors roughness={.96} side={THREE.DoubleSide}/></mesh>
   <instancedMesh ref={pebbles} args={[undefined,undefined,32]} castShadow receiveShadow><dodecahedronGeometry args={[1,1]}/><meshStandardMaterial {...stone} color="#b7c1c2" roughness={.87}/></instancedMesh>
  </group>
  <group name="moving-water-and-spray" userData={{journalLayer:'atmosphere',revealOrder:2}}>
   <mesh geometry={river} receiveShadow><meshPhysicalMaterial ref={surface} color="#b1c9b9" vertexColors transparent opacity={.72} depthWrite={false} roughness={.13} metalness={0} ior={1.333} normalMap={normals} normalScale={new THREE.Vector2(.17,.12)} envMapIntensity={.7} clearcoat={.8} clearcoatRoughness={.12}/></mesh>
   <mesh position={[0,.081,-.22]} rotation={[-Math.PI/2,0,0]} scale={[1,.76,1]} receiveShadow><circleGeometry args={[.31,56]}/><meshPhysicalMaterial color="#769d8f" transparent opacity={.70} depthWrite={false} normalMap={normals} normalScale={new THREE.Vector2(.17,.12)} roughness={.12} metalness={0} ior={1.333} clearcoat={1} envMapIntensity={.85}/></mesh>
   <mesh geometry={curtain}><meshPhysicalMaterial color="#b7d0c5" transparent opacity={.20} depthWrite={false} roughness={.12} normalMap={normals} normalScale={new THREE.Vector2(.2,.09)} side={THREE.DoubleSide} clearcoat={1} envMapIntensity={.7}/></mesh>
   <mesh geometry={curtain}><shaderMaterial ref={fall} uniforms={uniforms} clipping transparent side={THREE.DoubleSide} depthWrite={false} vertexShader={waterVertex} fragmentShader={`${waterFragmentHeader}
void main(){
 #include <clipping_planes_fragment>
 float edge=smoothstep(0.,.085,vUv.x)*(1.-smoothstep(.915,1.,vUv.x));
 vec2 p=vec2(vUv.x*25.+sin(vUv.y*9.+uTime*1.3)*.7,vUv.y*17.+uTime*9.);
 float broken=fbm(p),fine=fbm(p*vec2(2.7,.6)+7.1);
 float white=smoothstep(.30,.80,broken*.78+fine*.22);
 float alpha=edge*(.16+.51*white);
 vec3 color=mix(vec3(.66,.78,.73),vec3(.92,.96,.91),white);
 gl_FragColor=vec4(color,alpha*uReveal);
}`}/></mesh>
   <mesh geometry={river} position={[0,.002,0]}><shaderMaterial ref={riverFoam} uniforms={uniforms} clipping transparent depthWrite={false} vertexShader={waterVertex} fragmentShader={`${waterFragmentHeader}
void main(){
 #include <clipping_planes_fragment>
 float edge=abs(vUv.x-.5)*2.;
 float contact=smoothstep(.75,1.,edge)*smoothstep(.50,.78,fbm(vec2(vUv.x*14.,vUv.y*61.-uTime*2.)));
 float current=pow(max(0.,1.-abs(vUv.x-(.5+.17*sin(vUv.y*23.)))*12.),2.)*smoothstep(.62,.84,noise(vec2(vUv.x*23.,vUv.y*95.-uTime*5.)));
 gl_FragColor=vec4(.84,.91,.85,(contact*.20+current*.10)*uReveal);
}`}/></mesh>
   <mesh position={[0,.085,-.21]} rotation={[-Math.PI/2,0,0]} scale={[1,.72,1]}><circleGeometry args={[.30,56]}/><shaderMaterial ref={foam} uniforms={uniforms} clipping transparent depthWrite={false} vertexShader={waterVertex} fragmentShader={`${waterFragmentHeader}
void main(){
 #include <clipping_planes_fragment>
 vec2 q=(vUv-.5)*2.;float r=length(q);float impact=1.-smoothstep(.15,.85,r);
 float agitation=fbm(vec2(q.x*14.+sin(q.y*6.+uTime)*.8,q.y*17.-uTime*2.6));
 float foam=impact*smoothstep(.32,.77,agitation)*.45;
 gl_FragColor=vec4(.86,.93,.85,foam*uReveal);
}`}/></mesh>
   <instancedMesh ref={mist} args={[undefined,undefined,16]}><planeGeometry args={[1,1]}/><meshBasicMaterial map={mistTexture} transparent opacity={.23} depthWrite={false} side={THREE.DoubleSide}/></instancedMesh>
  </group>
 </group>;
}

function Trail(){
 const surface=useJournalSurface('ground',[1,13],.45);
 const geometry=useMemo(()=>{
  const p:number[]=[],index:number[]=[],uv:number[]=[];
  for(let i=0;i<=48;i++){
   const t=i/48,x=-2.45+t*1.25,z=.55-t*1.45+Math.sin(t*Math.PI*3)*.17;
   for(const s of [-1,1]){const xx=x+s*.065;p.push(xx,height(xx,z)+.012,z);uv.push(s<0?0:1,t);}
   if(i<48){const j=i*2;index.push(j,j+1,j+2,j+1,j+3,j+2);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;
 },[]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} userData={{journalLayer:'terrain',revealOrder:1,journalReveal:'rise',journalRiseDepth:1.4}} receiveShadow><meshStandardMaterial {...surface} color="#b9aa83" roughness={1} side={THREE.DoubleSide}/></mesh>;
}
function Trekker({time}:Clock){
 const root=useRef<THREE.Group>(null);
 useFrame(()=>{
  const t=time.current.t,p=.14+(t*.014)%.47,x=-2.45+p*1.25,z=.55-p*1.45+Math.sin(p*Math.PI*3)*.17;
  if(root.current){root.current.position.set(x,height(x,z)+.015,z);root.current.rotation.y=Math.atan2(1.25,-1.45+Math.cos(p*Math.PI*3)*.17*Math.PI*3);}
 });
 return <group name="trekking" userData={{revealOrder:3,journalLayer:'actors',journalReveal:'fade'}}><group ref={root}>
  <JournalCharacter time={time} height={.7} pose="walk" shirt="#8d593e" pants="#454d3f" helmet backpack/>
  <Rod a={[-.12,.43,.09]} b={[-.14,.02,.16]} r={.005} color="#424b40"/>
 </group></group>;
}
function ClimbingLedges(){
 const stone=useJournalSurface('rock',[1,1.3],.7);
 const geometry=useMemo(()=>{
  const profile=new THREE.Shape();profile.moveTo(-.048,-.030);profile.lineTo(.041,-.026);profile.lineTo(.052,-.010);profile.lineTo(.027,0);profile.lineTo(-.029,0);profile.lineTo(-.052,-.013);profile.closePath();
  return new THREE.ExtrudeGeometry(profile,{depth:.077,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:1});
 },[]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <group name="embedded-boot-ledges">
  {[[1.78677,.56051,.095],[1.63690,.62132,.090]].map((position,i)=><mesh key={i} geometry={geometry} position={position as Point} castShadow receiveShadow><meshStandardMaterial {...stone} color="#a8c3ed" roughness={.94}/></mesh>)}
 </group>;
}
function Climber({time}:Clock){
 return <group name="rock-climbing">
  <group userData={{revealOrder:1,journalLayer:'terrain',journalReveal:'rise',journalRiseDepth:1.85}}>
   <LayeredRock position={[1.69,.19,-.14]} scale={[.88,1.63,.63]} layers={5}/><ClimbingLedges/>
  </group>
  <group userData={{revealOrder:3,journalLayer:'actors',journalReveal:'fade'}}>
   <group position={[1.72,.54,.255]} rotation={[0,Math.PI,-.07]}><HeroClimber time={time} height={.83}/></group>
  </group>
 </group>;
}
function Parachutist({time}:Clock){
 const root=useRef<THREE.Group>(null);
 const canopy=useMemo(()=>{
  const g=new THREE.PlaneGeometry(1.28,.48,24,8),p=g.attributes.position,colors:number[]=[];
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),z=p.getY(i);p.setXYZ(i,x,.68+Math.sqrt(Math.max(0,1-(x/.68)**2))*.23+Math.cos(z/.24*Math.PI*.5)*.025+Math.sin(x*48)*.004,z);
   const stripe=Math.floor((x+.64)/.13);new THREE.Color(stripe%3===0?'#d9d8bc':stripe%3===1?'#be7144':'#bb5c37').toArray(colors,i*3);
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
 },[]);
 useEffect(()=>()=>canopy.dispose(),[canopy]);
 useFrame(()=>{if(root.current){const t=time.current.t;root.current.position.set(-1.75+Math.sin(t*.14)*.13,1.22+Math.sin(t*.22)*.06,.23);root.current.rotation.z=Math.sin(t*.2)*.045;}});
 return <group name="parachuting" userData={{revealOrder:4,journalLayer:'atmosphere'}}><group ref={root}>
  <mesh geometry={canopy} castShadow><meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={.82}/></mesh>
  {[-.56,-.28,0,.28,.56].flatMap(x=>[-1,1].map(z=><Rod key={`${x}-${z}`} a={[x,.7,z*.18]} b={[x*.13,.18,z*.025]} r={.0028} color="#e1ddc4"/>))}
  <JournalCharacter time={time} height={.58} pose="parachute" shirt="#354d52" pants="#263d42" backpack={false} helmet position={[0,-.24,0]}/>

 </group></group>;
}
function roadCurve(){return new THREE.CatmullRomCurve3([new THREE.Vector3(-2.6,.1,1.23),new THREE.Vector3(-1.65,.105,.97),new THREE.Vector3(-.55,.24,1.18),new THREE.Vector3(.45,.24,1.28),new THREE.Vector3(1.45,.1,1.0),new THREE.Vector3(2.65,.09,1.43)]);}
function RoadTrip({time}:Clock){
 const roadSurface=useJournalSurface('ground',[1,14],.28),bridgeSurface=useJournalSurface('rock',[1.5,1],.5);
 const curve=useMemo(()=>roadCurve(),[]);
 const road=useMemo(()=>{
  const p:number[]=[],uv:number[]=[],index:number[]=[];
  for(let i=0;i<=100;i++){
   const t=i/100,point=curve.getPoint(t),tangent=curve.getTangent(t),normal=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();
   for(const s of [-1,1]){const v=point.clone().addScaledVector(normal,s*.15);p.push(v.x,v.y,v.z);uv.push(s<0?0:1,t);}
   if(i<100){const j=i*2;index.push(j,j+1,j+2,j+1,j+3,j+2);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;
 },[curve]);
 const bridge=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-.53,0);s.lineTo(-.53,.17);s.quadraticCurveTo(0,.29,.53,.17);s.lineTo(.53,0);s.lineTo(.35,0);s.quadraticCurveTo(0,.24,-.35,0);s.closePath();return new THREE.ExtrudeGeometry(s,{depth:.47,bevelEnabled:false});},[]);
 useEffect(()=>()=>{road.dispose();bridge.dispose();},[road,bridge]);
 return <group name="road-trip">
  <group userData={{revealOrder:1,journalLayer:'terrain',journalReveal:'rise',journalRiseDepth:.4}}>
  <mesh geometry={road} receiveShadow><meshStandardMaterial {...roadSurface} color="#626965" roughness={.96}/></mesh>
  {Array.from({length:24},(_,i)=>{const p=curve.getPoint(i/24),t=curve.getTangent(i/24);return <mesh key={i} position={[p.x,p.y+.003,p.z]} rotation={[-Math.PI/2,0,Math.atan2(t.z,t.x)]}><planeGeometry args={[.07,.012]}/><meshBasicMaterial color="#d4c8a3"/></mesh>;})}
  <mesh geometry={bridge} position={[.03,.045,.99]} castShadow receiveShadow><meshStandardMaterial {...bridgeSurface} color="#dad2ba" roughness={.98}/></mesh>
  {[-1,1].map(s=><Rod key={s} a={[-.47,.32,1.22+s*.2]} b={[.49,.32,1.22+s*.2]} r={.019} color="#a69d84"/>)}
  </group>
  <group name="roadster-emergence" userData={{revealOrder:3,journalLayer:'actors',journalReveal:'fade'}}><Roadster time={time} path={curve} length={.63}/></group>
 </group>;
}
function Photographer({time,birding=false}:Clock&{birding?:boolean}){
 const x=birding?-2.35:-2.5,z=birding?-.37:.62,y=height(x,z),personHeight=birding?.6:.64;
 return <group position={[x,y+.01,z]} rotation={[0,birding?2.6:-.7,0]} name={birding?'birdwatching':'photography'} userData={{revealOrder:3,journalLayer:'actors',journalReveal:'fade'}}>
  <JournalCharacter time={time} height={personHeight} pose={birding?'birdwatching':'photography'} shirt={birding?'#777e61':'#a59c78'} pants="#525847" backpack/>
  {birding?[-1,1].map(s=><mesh key={s} position={[s*.02,personHeight*.9,personHeight*.19]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.016,.022,.065,12]}/><meshStandardMaterial color="#293933" roughness={.65}/></mesh>):<><mesh position={[0,personHeight*.9,personHeight*.19]} castShadow><boxGeometry args={[.085,.055,.045]}/><meshStandardMaterial color="#243432" roughness={.6}/></mesh><mesh position={[0,personHeight*.9,personHeight*.19+.04]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.022,.026,.05,12]}/><meshStandardMaterial color="#273e40" metalness={.5} roughness={.25}/></mesh></>}
 </group>;
}
function Birds({time}:Clock){
 const flock=useRef<THREE.Group>(null);
 useFrame(()=>{if(flock.current)flock.current.position.x=Math.sin(time.current.t*.12)*.18;});
 return <group position={[.25,1.95,-.9]} userData={{revealOrder:4,journalLayer:'atmosphere'}}><group ref={flock}>{Array.from({length:5},(_,i)=><group key={i} position={[(i-2)*.23,(i%2)*.08,i*.07]} rotation={[0,.4,Math.sin(i)*.12]}><Rod a={[-.045,.015,0]} b={[0,0,0]} r={.004} color="#313e36"/><Rod a={[0,0,0]} b={[.045,.015,0]} r={.004} color="#313e36"/></group>)}</group></group>;
}

/** An authored physical miniature: every landform and actor shares book lighting and depth. */
export default function OutdoorWorld({time}:Clock){
 return <group name="outdoor-pop-up-world">
  <Terrain/><Forest/><Trail/><Water time={time}/><RoadTrip time={time}/><Trekker time={time}/><Climber time={time}/><Parachutist time={time}/><Photographer time={time}/><Photographer time={time} birding/><Birds time={time}/>
 </group>;
}
