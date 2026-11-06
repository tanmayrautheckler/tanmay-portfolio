"use client";
/* R3F owns animated scene transforms. */
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {RoundedBox} from '@react-three/drei/core/RoundedBox';
import * as THREE from 'three';
import {useJournalSurface} from './journal-materials';
import {JournalCharacter} from './journal-character';

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
  const g=new THREE.PlaneGeometry(5.68,3.26,82,52);g.rotateX(-Math.PI/2);
  const p=g.attributes.position,colors=new Float32Array(p.count*3),stone=new THREE.Color('#d3d7cd'),grass=new THREE.Color('#e1e8d6'),snow=new THREE.Color('#f0f1e6');
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),z=p.getZ(i),y=height(x,z);p.setY(i,y);
   const variation=.8+rand(i)*.25;
   const c=grass.clone().lerp(stone,THREE.MathUtils.smoothstep(y,.45,1.15));
   if(y>1.45)c.lerp(snow,THREE.MathUtils.smoothstep(y,1.45,1.8)*.7);
   c.multiplyScalar(variation);c.toArray(colors,i*3);
  }
  g.setAttribute('color',new THREE.BufferAttribute(colors,3));g.computeVertexNormals();return g;
 },[]);
 const rockPatches=useMemo(()=>{
  const source=geometry.toNonIndexed(),p=source.attributes.position,n=source.attributes.normal,u=source.attributes.uv,positions:number[]=[],normals:number[]=[],uv:number[]=[];
  for(let i=0;i<p.count;i+=3){
   const y=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3,up=(n.getY(i)+n.getY(i+1)+n.getY(i+2))/3;
   if(y<.62||up>.74&&y<1.43)continue;
   for(let j=0;j<3;j++){positions.push(p.getX(i+j),p.getY(i+j)+.003,p.getZ(i+j));normals.push(n.getX(i+j),n.getY(i+j),n.getZ(i+j));uv.push(u.getX(i+j),u.getY(i+j));}
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
 return <group name="sculpted-land" userData={{revealOrder:0,journalLayer:'terrain'}}>
  <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial {...surface} vertexColors roughness={.98}/></mesh>
  <mesh geometry={rockPatches} castShadow receiveShadow><meshStandardMaterial {...rockSurface} color="#aeb9ae" roughness={.98}/></mesh>
  <mesh geometry={skirt} receiveShadow><meshStandardMaterial vertexColors roughness={1} side={THREE.DoubleSide}/></mesh>
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
 const trunks=useRef<THREE.InstancedMesh>(null),crowns=useRef<THREE.InstancedMesh>(null),rocks=useRef<THREE.InstancedMesh>(null);
 useEffect(()=>{
  if(!trunks.current||!crowns.current||!rocks.current)return;
  const d=new THREE.Object3D();let count=0;
  for(let i=0;i<135&&count<38;i++){
   const x=(rand(i+7)-.5)*5.1,z=(rand(i+29)-.5)*2.7,y=height(x,z);
   if(y>1.05||Math.abs(x-riverX(z))<.39||z>.75||x>1.12&&z>-.8||x< -2.1&&z>-.6&&z<-.2)continue;
   const s=.15+rand(i+53)*.17;
   d.position.set(x,y+s*.45,z);d.scale.set(s*.13,s*.9,s*.13);d.rotation.set(0,0,.04*Math.sin(i));d.updateMatrix();trunks.current.setMatrixAt(count,d.matrix);
   d.position.set(x,y+s*1.1,z);d.scale.set(s*.75,s,s*.75);d.rotation.set(0,i,0);d.updateMatrix();crowns.current.setMatrixAt(count,d.matrix);crowns.current.setColorAt(count,new THREE.Color().setHSL(.28+rand(i)*.04,.2,.55+rand(i+15)*.13));count++;
  }
  trunks.current.count=count;crowns.current.count=count;trunks.current.instanceMatrix.needsUpdate=true;crowns.current.instanceMatrix.needsUpdate=true;if(crowns.current.instanceColor)crowns.current.instanceColor.needsUpdate=true;
  for(let i=0;i<34;i++){
   const z=-1.3+rand(i+84)*2.8,x=riverX(z)+(i%2?1:-1)*(.3+rand(i+21)*.12),y=height(x,z),s=.035+rand(i+34)*.07;
   d.position.set(x,y+s*.25,z);d.scale.set(s*1.5,s*.65,s);d.rotation.set(i,i*.4,i*.1);d.updateMatrix();rocks.current.setMatrixAt(i,d.matrix);rocks.current.setColorAt(i,new THREE.Color().setHSL(.12,.1,.38+rand(i)*.18));
  }
  rocks.current.instanceMatrix.needsUpdate=true;if(rocks.current.instanceColor)rocks.current.instanceColor.needsUpdate=true;
 },[]);
 return <group name="forest" userData={{revealOrder:1,journalLayer:'terrain'}}>
  <instancedMesh ref={trunks} args={[undefined,undefined,52]} castShadow><cylinderGeometry args={[.8,1,1,7]}/><meshStandardMaterial color="#655d44" roughness={1}/></instancedMesh>
  <instancedMesh ref={crowns} args={[undefined,undefined,38]} geometry={foliage} castShadow receiveShadow><meshStandardMaterial color="#526047" vertexColors roughness={.97} side={THREE.DoubleSide}/></instancedMesh>
  <instancedMesh ref={rocks} args={[undefined,undefined,34]} castShadow receiveShadow><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial {...rockSurface} color="#a2aaa1" roughness={.95}/></instancedMesh>
 </group>;
}
function fracturedSlab(seed:number){
 const geometry=new THREE.BoxGeometry(1,1,1,6,10,4),p=geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ledge=Math.sin(y*23+seed)*.035;
  p.setXYZ(i,x*(.9+.11*Math.sin(y*11+seed))+.055*Math.sin(y*15+z*7+seed),y+Math.sin(x*9+z*7+seed)*.025,z*(.9+.09*Math.cos(y*17+seed))+Math.sin(x*17+y*21+seed)*.025+ledge);
 }
 geometry.computeVertexNormals();return geometry;
}
function LayeredRock({position=[0,0,0],scale=[1,1,1],layers=4}:{position?:Point;scale?:Point;layers?:number}){
 const surface=useJournalSurface('rock',[1,1.3],.7),geometry=useMemo(()=>fracturedSlab(2.4+layers),[layers]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <group position={position} scale={scale}>
  <mesh geometry={geometry} position={[0,.5,0]} castShadow receiveShadow><meshStandardMaterial {...surface} color="#9da9a2" roughness={.96}/></mesh>
 </group>;
}
const waterVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
function Water({time}:Clock){
 const riverSurface=useRef<THREE.Mesh>(null),fall=useRef<THREE.ShaderMaterial>(null),fallUniforms=useMemo(()=>({uTime:{value:0}}),[]);
 const river=useMemo(()=>{
  const p:number[]=[],uv:number[]=[],index:number[]=[];
  for(let i=0;i<=70;i++){
   const z=-.5+i/70*2.09,x=riverX(z),width=.13+.07*i/70;
   p.push(x-width,.078,z,x+width,.078,z);uv.push(0,i/70,1,i/70);
   if(i<70){const j=i*2;index.push(j,j+2,j+1,j+1,j+2,j+3);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;
 },[]);
 const streams=useMemo(()=>Array.from({length:9},(_,i)=>{
  const x=-.095+i*.023;
  return new THREE.CatmullRomCurve3([new THREE.Vector3(x,1.015,-.39),new THREE.Vector3(x+.009*Math.sin(i),.8,-.305),new THREE.Vector3(x+.015*Math.sin(i*2),.42,-.248),new THREE.Vector3(x*1.4,.1,-.21)]);
 }),[]);
 const curtain=useMemo(()=>{
  const g=new THREE.PlaneGeometry(.24,.92,18,34),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const y=p.getY(i),t=(y+.46)/.92,x=p.getX(i);p.setXYZ(i,x*(1.14-t*.14)+Math.sin(t*5)*.007,y,-.21-.18*t*t+Math.sin(x*70)*.004);}
  g.computeVertexNormals();return g;
 },[]);
 const foam=useRef<THREE.InstancedMesh>(null);
 useEffect(()=>()=>{river.dispose();curtain.dispose();},[river,curtain]);
 useFrame(()=>{
  const t=time.current.t;if(fall.current)fall.current.uniforms.uTime.value=t;
  const positions=riverSurface.current?.geometry.attributes.position;
  if(!positions)return;
  for(let i=0;i<positions.count;i++){const z=positions.getZ(i),x=positions.getX(i);positions.setY(i,.078+Math.sin(z*38+x*19-t*1.9)*.0018);}
  positions.needsUpdate=true;
  if(!foam.current)return;const d=new THREE.Object3D();
  for(let i=0;i<28;i++){
   const a=i*2.4+t*.12,r=.025+((i*.043+t*.028)%.22);d.position.set(.01+Math.cos(a)*r,.088,-.2+Math.sin(a)*r*.63);d.rotation.set(-Math.PI/2,0,a);d.scale.set(.012+(i%4)*.006,.008+(i%3)*.005,.015);d.updateMatrix();foam.current.setMatrixAt(i,d.matrix);
  }
  foam.current.instanceMatrix.needsUpdate=true;
 });
 return <group name="moving-water" userData={{revealOrder:2,journalLayer:'atmosphere'}}>
  <mesh ref={riverSurface} geometry={river} receiveShadow><meshPhysicalMaterial color="#355e52" roughness={.2} metalness={.07} envMapIntensity={.8} clearcoat={.7} clearcoatRoughness={.1} side={THREE.DoubleSide}/></mesh>
  <LayeredRock position={[-.47,.035,-.67]} scale={[.75,.99,.57]}/><LayeredRock position={[.47,.035,-.67]} scale={[.73,1.03,.56]}/>
  {/* Broken, curved filaments share the scene depth and meet the plunge pool. */}
  {streams.map((path,i)=><mesh key={i}><tubeGeometry args={[path,34,.005+(i%3)*.002,5,false]}/><meshPhysicalMaterial color={i%3?'#bdcfc4':'#e4e9dc'} roughness={.16} transparent opacity={i%2?.56:.38} metalness={.02} envMapIntensity={1.2}/></mesh>)}
  <mesh geometry={curtain} position={[0,.56,0]}><shaderMaterial ref={fall} uniforms={fallUniforms} transparent side={THREE.DoubleSide} depthWrite={false} vertexShader={waterVertex} fragmentShader={`varying vec2 vUv;uniform float uTime;void main(){float edge=pow(sin(vUv.x*3.14159),1.4);float strand=pow(.5+.5*sin(vUv.x*56.+sin(vUv.y*12.-uTime*4.)*.8),3.);float broken=.5+.5*sin(vUv.y*29.+uTime*8.+vUv.x*13.);gl_FragColor=vec4(.8,.88,.81,edge*strand*(.08+.19*broken));}`}/></mesh>
  <mesh position={[0,.081,-.22]} rotation={[-Math.PI/2,0,0]} scale={[1,.7,1]}><circleGeometry args={[.31,40]}/><meshPhysicalMaterial color="#527a68" roughness={.15} metalness={.05} clearcoat={1} envMapIntensity={1}/></mesh>
  <instancedMesh ref={foam} args={[undefined,undefined,28]}><circleGeometry args={[1,8]}/><meshBasicMaterial color="#dce6d8" transparent opacity={.32} side={THREE.DoubleSide} depthWrite={false}/></instancedMesh>
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
 return <mesh geometry={geometry} userData={{journalLayer:'terrain'}} receiveShadow><meshStandardMaterial {...surface} color="#b9aa83" roughness={1} side={THREE.DoubleSide}/></mesh>;
}
function Trekker({time}:Clock){
 const root=useRef<THREE.Group>(null);
 useFrame(()=>{
  const t=time.current.t,p=.14+(t*.014)%.47,x=-2.45+p*1.25,z=.55-p*1.45+Math.sin(p*Math.PI*3)*.17;
  if(root.current){root.current.position.set(x,height(x,z)+.015,z);root.current.rotation.y=Math.atan2(1.25,-1.45+Math.cos(p*Math.PI*3)*.17*Math.PI*3);}
 });
 return <group name="trekking" userData={{revealOrder:3,journalLayer:'actors'}}><group ref={root}>
  <JournalCharacter time={time} height={.7} pose="walk" shirt="#8d593e" pants="#454d3f" helmet backpack/>
  <Rod a={[-.12,.43,.09]} b={[-.14,.02,.16]} r={.005} color="#424b40"/>
 </group></group>;
}
function Climber({time}:Clock){
 const body=useRef<THREE.Group>(null);
 const rope=useMemo(()=>new THREE.CatmullRomCurve3([new THREE.Vector3(1.58,1.82,-.05),new THREE.Vector3(1.67,1.4,.26),new THREE.Vector3(1.74,1.01,.28)]),[]);
 useFrame(()=>{if(body.current)body.current.position.y=.54+Math.sin(time.current.t*.65)*.008;});
 return <group name="rock-climbing" userData={{revealOrder:3,journalLayer:'actors'}}>
  <LayeredRock position={[1.69,.19,-.14]} scale={[.88,1.63,.63]} layers={5}/>
  <mesh castShadow><tubeGeometry args={[rope,28,.004,5,false]}/><meshStandardMaterial color="#b99b5c" roughness={.88}/></mesh>
  <group ref={body} position={[1.72,.54,.255]} rotation={[0,Math.PI,-.07]}>
   <JournalCharacter time={time} height={.83} pose="climb" shirt="#8e4934" pants="#3d4940" backpack={false} helmet/>
   <mesh position={[0,.43,.01]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.077,.006,6,18]}/><meshStandardMaterial color="#344b46" roughness={.85}/></mesh>
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
 const car=useRef<THREE.Group>(null),wheels=useRef<THREE.Group[]>([]),curve=useMemo(()=>roadCurve(),[]);
 const road=useMemo(()=>{
  const p:number[]=[],uv:number[]=[],index:number[]=[];
  for(let i=0;i<=100;i++){
   const t=i/100,point=curve.getPoint(t),tangent=curve.getTangent(t),normal=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();
   for(const s of [-1,1]){const v=point.clone().addScaledVector(normal,s*.15);p.push(v.x,v.y,v.z);uv.push(s<0?0:1,t);}
   if(i<100){const j=i*2;index.push(j,j+2,j+1,j+1,j+2,j+3);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;
 },[curve]);
 const bridge=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-.53,0);s.lineTo(-.53,.17);s.quadraticCurveTo(0,.29,.53,.17);s.lineTo(.53,0);s.lineTo(.35,0);s.quadraticCurveTo(0,.24,-.35,0);s.closePath();return new THREE.ExtrudeGeometry(s,{depth:.47,bevelEnabled:false});},[]);
 useEffect(()=>()=>{road.dispose();bridge.dispose();},[road,bridge]);
 useFrame(()=>{
  const t=time.current.t,p=.08+(t*.019)%.8;
  if(car.current){car.current.position.copy(curve.getPoint(p));const v=curve.getTangent(p);car.current.rotation.y=Math.atan2(-v.z,v.x);}
  wheels.current.forEach(w=>{if(w)w.rotation.z=-t*1.9;});
 });
 return <group name="road-trip" userData={{revealOrder:3,journalLayer:'actors'}}>
  <mesh geometry={road} receiveShadow><meshStandardMaterial {...roadSurface} color="#626965" roughness={.96} side={THREE.DoubleSide}/></mesh>
  {Array.from({length:24},(_,i)=>{const p=curve.getPoint(i/24),t=curve.getTangent(i/24);return <mesh key={i} position={[p.x,p.y+.003,p.z]} rotation={[-Math.PI/2,0,Math.atan2(t.z,t.x)]}><planeGeometry args={[.07,.012]}/><meshBasicMaterial color="#d4c8a3"/></mesh>;})}
  <mesh geometry={bridge} position={[.03,.045,.99]} castShadow receiveShadow><meshStandardMaterial {...bridgeSurface} color="#dad2ba" roughness={.98}/></mesh>
  {[-1,1].map(s=><Rod key={s} a={[-.47,.32,1.22+s*.2]} b={[.49,.32,1.22+s*.2]} r={.019} color="#a69d84"/>)}
  <group ref={car} scale={[1.02,1.18,1.02]}>
   <RoundedBox args={[.63,.13,.29]} radius={.028} smoothness={3} position={[0,.115,0]} castShadow><meshPhysicalMaterial color="#244e43" metalness={.42} roughness={.31} clearcoat={.3}/></RoundedBox>
   <mesh position={[.2,.195,0]} castShadow><boxGeometry args={[.25,.045,.285]}/><meshStandardMaterial color="#376454" metalness={.4} roughness={.32}/></mesh>
   <mesh position={[-.23,.195,0]} castShadow><boxGeometry args={[.13,.05,.28]}/><meshStandardMaterial color="#376454" metalness={.4} roughness={.32}/></mesh>
   <mesh position={[.057,.25,0]} rotation={[0,0,-.26]}><boxGeometry args={[.018,.14,.265]}/><meshPhysicalMaterial color="#9ab9b7" transparent opacity={.48} metalness={.1} roughness={.12}/></mesh>
   <Rod a={[.075,.195,-.135]} b={[.039,.318,-.135]} r={.009} color="#d1d1b7"/><Rod a={[.075,.195,.135]} b={[.039,.318,.135]} r={.009} color="#d1d1b7"/><Rod a={[.039,.318,-.135]} b={[.039,.318,.135]} r={.007} color="#d1d1b7"/>
   {[-1,1].map(s=><group key={s}>
    <mesh position={[-.11,.225,s*.071]} rotation={[0,0,-.16]} castShadow><boxGeometry args={[.055,.13,.095]}/><meshStandardMaterial color="#b79b6f" roughness={.88}/></mesh>
    {[-.2,.21].map((x,i)=><group key={i} ref={el=>{if(el)wheels.current[(s<0?0:2)+i]=el;}} position={[x,.085,s*.158]}><mesh castShadow rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.073,.073,.037,18]}/><meshStandardMaterial color="#242c29" roughness={.9}/></mesh><mesh position={[0,0,s*.02]}><circleGeometry args={[.043,18]}/><meshStandardMaterial color="#c4c9b7" metalness={.75} roughness={.3} side={THREE.DoubleSide}/></mesh></group>)}
    <mesh position={[.322,.15,s*.099]} rotation={[0,Math.PI/2,0]}><circleGeometry args={[.028,12]}/><meshStandardMaterial color="#e0d5af" emissive="#c5b47e" emissiveIntensity={.15}/></mesh>
    <mesh position={[-.32,.153,s*.1]}><boxGeometry args={[.01,.028,.04]}/><meshStandardMaterial color="#a94f3f"/></mesh>
   </group>)}
   <mesh position={[-.06,.29,.07]}><capsuleGeometry args={[.03,.05,3,8]}/><meshStandardMaterial color="#c7c2a4"/></mesh><mesh position={[-.055,.35,.07]}><sphereGeometry args={[.028,10,8]}/><meshStandardMaterial color="#b08a63"/></mesh>
   <mesh position={[.327,.09,0]}><boxGeometry args={[.018,.02,.25]}/><meshStandardMaterial color="#bbc4b7" metalness={.8} roughness={.3}/></mesh>
  </group>
 </group>;
}
function Photographer({time,birding=false}:Clock&{birding?:boolean}){
 const x=birding?-2.35:-2.5,z=birding?-.37:.62,y=height(x,z),personHeight=birding?.6:.64;
 return <group position={[x,y+.01,z]} rotation={[0,birding?2.6:-.7,0]} name={birding?'birdwatching':'photography'} userData={{revealOrder:3,journalLayer:'actors'}}>
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
