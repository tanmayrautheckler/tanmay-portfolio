/** One planted-foot practice shot. The same pure clock drives the boot, ball
 * and cloth. A new ball position is introduced only while fully transparent. */
export type SoccerPoint = [number, number, number];
export type SoccerShotPhase = 'ready' | 'backswing' | 'strike' | 'follow-through' | 'flight' | 'roll' | 'net' | 'hold' | 'fade-out' | 'reset' | 'fade-in';
export type SoccerPlayerPose = {
 leftElbow: SoccerPoint;
 leftWrist: SoccerPoint;
 rightElbow: SoccerPoint;
 rightWrist: SoccerPoint;
 leftKnee: SoccerPoint;
 leftAnkle: SoccerPoint;
 rightKnee: SoccerPoint;
 rightAnkle: SoccerPoint;
 rightShoePitch: number;
 crouch: number;
 headYaw: number;
};

export const SOCCER_ACTOR = {position: [1.9,.08,.45] as SoccerPoint,angle:Math.PI,scale:.91} as const;
export const SOCCER_BALL_RADIUS = .065;
export const SOCCER_TURF_Y = .078;
export const SOCCER_BALL_REST: SoccerPoint = [1.78,SOCCER_TURF_Y+SOCCER_BALL_RADIUS,.30];
export const SOCCER_SUPPORT_ANKLE: SoccerPoint = [-.105,.062,0];
export const SOCCER_SHOE_CENTER_FROM_ANKLE: SoccerPoint = [0,-.032,.035];
export const SOCCER_SHOE_RADII: SoccerPoint = [.048,.032,.09];
export const SOCCER_CONTACT_SHOE_PITCH = -.06;
/** Unit surface normal in Athlete-local space, pointing from boot to ball. */
export const SOCCER_BOOT_CONTACT_NORMAL: SoccerPoint = [0,.32,Math.sqrt(1-.32**2)];
export const SOCCER_LIMB_LENGTHS = {upperArm:.20,forearm:.185,thigh:.25,shin:.235} as const;
export const SOCCER_GOAL = {position:[1.85,.08,-1.09] as SoccerPoint,width:1.25,height:.61,depth:.29} as const;
export const SOCCER_GRAVITY = 3.2;
export const SOCCER_LAUNCH_SPEED = 2.6;
export const SOCCER_LAUNCH_Y = .7;
export const SOCCER_LANDING_RETENTION = .85;
export const SOCCER_ROLL_DECELERATION = 1.4;
export const SOCCER_NET_RESTITUTION = .18;
export const SOCCER_REBOUND_DECELERATION = .85;
export const SOCCER_STRIKE_TIME = .80;
export const SOCCER_FADE_SECONDS = .25;
export const SOCCER_HIDDEN_SECONDS = .08;

const add=(a:SoccerPoint,b:SoccerPoint):SoccerPoint=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a:SoccerPoint,b:SoccerPoint):SoccerPoint=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const multiply=(a:SoccerPoint,factor:number):SoccerPoint=>[a[0]*factor,a[1]*factor,a[2]*factor];
const dot=(a:SoccerPoint,b:SoccerPoint)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const length=(a:SoccerPoint)=>Math.hypot(...a);
const normalize=(a:SoccerPoint):SoccerPoint=>multiply(a,1/Math.max(1e-12,length(a)));
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const wrap=(v:number,period:number)=>{const remainder=v%period;return remainder<0?remainder+period:remainder;};
const smooth=(v:number)=>{const u=clamp(v,0,1);return u*u*(3-2*u);};
const pitch=(point:SoccerPoint,angle:number):SoccerPoint=>[point[0],Math.cos(angle)*point[1]-Math.sin(angle)*point[2],Math.sin(angle)*point[1]+Math.cos(angle)*point[2]];

function actorWorld(point:SoccerPoint):SoccerPoint {
 const c=Math.cos(SOCCER_ACTOR.angle),s=Math.sin(SOCCER_ACTOR.angle);
 return add(SOCCER_ACTOR.position,multiply([c*point[0]+s*point[2],point[1],-s*point[0]+c*point[2]],SOCCER_ACTOR.scale));
}
function actorLocal(point:SoccerPoint):SoccerPoint {
 const delta=multiply(sub(point,SOCCER_ACTOR.position),1/SOCCER_ACTOR.scale),c=Math.cos(SOCCER_ACTOR.angle),s=Math.sin(SOCCER_ACTOR.angle);
 return [c*delta[0]-s*delta[2],delta[1],s*delta[0]+c*delta[2]];
}

/** Support point of the actual shoe ellipsoid, plus a ball-radius offset along
 * its surface normal. The geometry's center offset and pitch are both included. */
function bootBallOffset(shoePitch:number):SoccerPoint {
 const normal=pitch(SOCCER_BOOT_CONTACT_NORMAL,-shoePitch);
 const denominator=Math.hypot(...normal.map((v,i)=>v*SOCCER_SHOE_RADII[i]));
 const ballLocal=normal.map((v,i)=>SOCCER_SHOE_RADII[i]**2*v/denominator+SOCCER_BALL_RADIUS/SOCCER_ACTOR.scale*v) as SoccerPoint;
 return add(SOCCER_SHOE_CENTER_FROM_ANKLE,pitch(ballLocal,shoePitch));
}
export const SOCCER_CONTACT_ANKLE=sub(actorLocal(SOCCER_BALL_REST),bootBallOffset(SOCCER_CONTACT_SHOE_PITCH));
export function soccerBootBallContact(ankle:SoccerPoint,shoePitch:number):SoccerPoint {
 return actorWorld(add(ankle,bootBallOffset(shoePitch)));
}

function restNetPoint(u:number,v:number):SoccerPoint {
 const slack=Math.sin(u*Math.PI)*Math.sin(v*Math.PI);
 return [(u-.5)*SOCCER_GOAL.width,v*SOCCER_GOAL.height-slack*.018,.04*v-slack*.035];
}
/** Front-facing normal of the bowed back cloth, not a substitute flat plane. */
function restNetNormal(u:number,v:number):SoccerPoint {
 const su=Math.sin(u*Math.PI),cu=Math.cos(u*Math.PI),sv=Math.sin(v*Math.PI),cv=Math.cos(v*Math.PI);
 const yu=-.018*Math.PI*cu*sv,zu=-.035*Math.PI*cu*sv;
 const yv=SOCCER_GOAL.height-.018*Math.PI*su*cv,zv=.04-.035*Math.PI*su*cv;
 return normalize([yu*zv-zu*yv,-SOCCER_GOAL.width*zv,SOCCER_GOAL.width*yv]);
}
function netWorld(point:SoccerPoint):SoccerPoint {
 return add(add(SOCCER_GOAL.position,[0,0,-SOCCER_GOAL.depth]),point);
}
function findNetImpact() {
 let u=(SOCCER_BALL_REST[0]-SOCCER_GOAL.position[0])/SOCCER_GOAL.width+.5;
 let v=(SOCCER_BALL_REST[1]-SOCCER_GOAL.position[1])/SOCCER_GOAL.height;
 // Solve the sphere's center, so its lowest point remains on the turf while
 // its front touches the real bowed cloth at a slightly lower surface point.
 for(let i=0;i<12;i++) {
  const center=add(netWorld(restNetPoint(u,v)),multiply(restNetNormal(u,v),SOCCER_BALL_RADIUS));
  u+=(SOCCER_BALL_REST[0]-center[0])/SOCCER_GOAL.width;
  v+=(SOCCER_BALL_REST[1]-center[1])/SOCCER_GOAL.height;
 }
 const position=netWorld(restNetPoint(u,v)),normal=restNetNormal(u,v);
 return {position,normal,uv:[u,v] as [number,number],ballCenter:add(position,multiply(normal,SOCCER_BALL_RADIUS))};
}
export const SOCCER_NET_IMPACT=findNetImpact();
const minimumDepthV=Math.acos(.04/(.035*Math.PI))/Math.PI;
export const SOCCER_NET_DEPTH_BOUNDS={min:.04*minimumDepthV-.035*Math.sin(Math.PI*minimumDepthV),max:.04} as const;

/** Back-line-local vertices, before Goal's existing [0,0,-.29] line offset.
 * The frame remains pinned and every vertex stays inside the original depth
 * envelope, including the low impact where very little rear travel is possible. */
export function soccerGoalNetPoint(u:number,v:number,displacement=0):SoccerPoint {
 const point=restNetPoint(u,v);
 if(displacement===0)return point;
 const [iu,iv]=SOCCER_NET_IMPACT.uv;
 const pinned=Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
 const impactPin=Math.sin(Math.PI*iu)*Math.sin(Math.PI*iv);
 const weight=pinned/impactPin*Math.exp(-(((u-iu)/.22)**2+((v-iv)/.28)**2));
 return [point[0],point[1],clamp(point[2]+displacement*weight,SOCCER_NET_DEPTH_BOUNDS.min,SOCCER_NET_DEPTH_BOUNDS.max)];
}

export const SOCCER_FLIGHT_SECONDS=2*SOCCER_LAUNCH_Y/SOCCER_GRAVITY;
export const SOCCER_LANDING_POSITION:SoccerPoint=[SOCCER_BALL_REST[0],SOCCER_BALL_REST[1],SOCCER_BALL_REST[2]-SOCCER_LAUNCH_SPEED*SOCCER_FLIGHT_SECONDS];
const rollSpeed=SOCCER_LAUNCH_SPEED*SOCCER_LANDING_RETENTION;
const rollDistance=SOCCER_LANDING_POSITION[2]-SOCCER_NET_IMPACT.ballCenter[2];
export const SOCCER_ROLL_SECONDS=(rollSpeed-Math.sqrt(rollSpeed**2-2*SOCCER_ROLL_DECELERATION*rollDistance))/SOCCER_ROLL_DECELERATION;
const reboundSpeed=(rollSpeed-SOCCER_ROLL_DECELERATION*SOCCER_ROLL_SECONDS)*SOCCER_NET_RESTITUTION;
export const SOCCER_REBOUND_SECONDS=reboundSpeed/SOCCER_REBOUND_DECELERATION;
const settlePosition:SoccerPoint=[SOCCER_BALL_REST[0],SOCCER_BALL_REST[1],SOCCER_NET_IMPACT.ballCenter[2]+reboundSpeed**2/(2*SOCCER_REBOUND_DECELERATION)];
const landing=SOCCER_STRIKE_TIME+SOCCER_FLIGHT_SECONDS,netHit=landing+SOCCER_ROLL_SECONDS,settle=netHit+SOCCER_REBOUND_SECONDS;
const fadeOut=settle+.7,hiddenReset=fadeOut+SOCCER_FADE_SECONDS,fadeIn=hiddenReset+SOCCER_HIDDEN_SECONDS;
export const SOCCER_SHOT_PERIOD=fadeIn+SOCCER_FADE_SECONDS;
export const SOCCER_EVENTS={backswing:.45,strike:SOCCER_STRIKE_TIME,landing,netHit,settle,fadeOut,hiddenReset,fadeIn,period:SOCCER_SHOT_PERIOD} as const;

function sampleBall(time:number) {
 let position=[...SOCCER_BALL_REST] as SoccerPoint,velocity:SoccerPoint=[0,0,0],opacity=1,distance=0;
 if(time>=SOCCER_EVENTS.hiddenReset) {
  opacity=time<SOCCER_EVENTS.fadeIn?0:clamp((time-SOCCER_EVENTS.fadeIn)/SOCCER_FADE_SECONDS,0,1);
 } else if(time>=SOCCER_EVENTS.settle) {
  position=[...settlePosition];distance=SOCCER_BALL_REST[2]-position[2];
  opacity=1-clamp((time-SOCCER_EVENTS.fadeOut)/SOCCER_FADE_SECONDS,0,1);
 } else if(time>=SOCCER_EVENTS.netHit) {
  const t=time-SOCCER_EVENTS.netHit;
  position=[SOCCER_BALL_REST[0],SOCCER_BALL_REST[1],SOCCER_NET_IMPACT.ballCenter[2]+reboundSpeed*t-.5*SOCCER_REBOUND_DECELERATION*t*t];
  velocity=[0,0,reboundSpeed-SOCCER_REBOUND_DECELERATION*t];distance=SOCCER_BALL_REST[2]-position[2];
 } else if(time>=SOCCER_EVENTS.landing) {
  const t=time-SOCCER_EVENTS.landing;
  position=[SOCCER_BALL_REST[0],SOCCER_BALL_REST[1],SOCCER_LANDING_POSITION[2]-rollSpeed*t+.5*SOCCER_ROLL_DECELERATION*t*t];
  velocity=[0,0,-rollSpeed+SOCCER_ROLL_DECELERATION*t];distance=SOCCER_BALL_REST[2]-position[2];
 } else if(time>=SOCCER_EVENTS.strike) {
  const t=time-SOCCER_EVENTS.strike;
  position=[SOCCER_BALL_REST[0],SOCCER_BALL_REST[1]+SOCCER_LAUNCH_Y*t-.5*SOCCER_GRAVITY*t*t,SOCCER_BALL_REST[2]-SOCCER_LAUNCH_SPEED*t];
  velocity=[0,SOCCER_LAUNCH_Y-SOCCER_GRAVITY*t,-SOCCER_LAUNCH_SPEED];distance=SOCCER_LAUNCH_SPEED*t;
 }
 // Negative X spin cancels a -Z center velocity at the ball's bottom point;
 // the small +Z rebound reverses that spin through the same distance measure.
 return {position,velocity,radius:SOCCER_BALL_RADIUS,opacity,spin:[-distance/SOCCER_BALL_RADIUS,0,0] as SoccerPoint};
}

type PoseKey={time:number;ankle:SoccerPoint;pitch:number;leftWrist:SoccerPoint;rightWrist:SoccerPoint;crouch:number};
// The kicking foot waits behind the ball, rather than intersecting it before
// the swing. The separate support ankle stays fixed throughout the shot.
const REST_ANKLE:SoccerPoint=[.13,.062,-.09];
const KEYS:PoseKey[]=[
 {time:0,ankle:REST_ANKLE,pitch:0,leftWrist:[-.20,.53,.12],rightWrist:[.20,.53,.12],crouch:.005},
 {time:.45,ankle:REST_ANKLE,pitch:0,leftWrist:[-.20,.53,.12],rightWrist:[.20,.53,.12],crouch:.005},
 {time:.64,ankle:[.13,.145,-.18],pitch:.25,leftWrist:[-.31,.68,.15],rightWrist:[.30,.59,-.13],crouch:.012},
 {time:.74,ankle:[.131,.105,-.09],pitch:.08,leftWrist:[-.30,.67,.16],rightWrist:[.28,.59,-.13],crouch:.014},
 {time:SOCCER_STRIKE_TIME,ankle:SOCCER_CONTACT_ANKLE,pitch:SOCCER_CONTACT_SHOE_PITCH,leftWrist:[-.30,.66,.16],rightWrist:[.27,.58,-.12],crouch:.012},
 {time:.98,ankle:[.13,.17,.23],pitch:-.20,leftWrist:[-.27,.64,.12],rightWrist:[.28,.60,-.10],crouch:.015},
 {time:1.35,ankle:REST_ANKLE,pitch:0,leftWrist:[-.20,.53,.12],rightWrist:[.20,.53,.12],crouch:.005},
];

function samplePoseCurve(time:number) {
 let i=KEYS.length-1;
 for(let k=0;k<KEYS.length-1;k++)if(time<KEYS[k+1].time){i=k;break;}
 const a=KEYS[i],b=KEYS[Math.min(i+1,KEYS.length-1)],end=b.time===a.time?SOCCER_SHOT_PERIOD:b.time;
 const previous=KEYS[Math.max(0,i-1)],next=KEYS[Math.min(i+2,KEYS.length-1)];
 const u=(time-a.time)/(end-a.time),u2=u*u,u3=u2*u;
 const h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2;
 const scalar=(av:number,bv:number,pv:number,nv:number)=>{
  const ma=i<=1||i===KEYS.length-1?0:(bv-pv)/(b.time-previous.time);
  const mb=i===0||i>=KEYS.length-2?0:(nv-av)/(next.time-a.time);
  return h00*av+h10*(end-a.time)*ma+h01*bv+h11*(end-a.time)*mb;
 };
 const point=(field:'ankle'|'leftWrist'|'rightWrist'):SoccerPoint=>a[field].map((value,axis)=>scalar(value,b[field][axis],previous[field][axis],next[field][axis])) as SoccerPoint;
 return {ankle:point('ankle'),leftWrist:point('leftWrist'),rightWrist:point('rightWrist'),pitch:scalar(a.pitch,b.pitch,previous.pitch,next.pitch),crouch:clamp(a.crouch+(b.crouch-a.crouch)*smooth(u),.005,.015)};
}

function joint(root:SoccerPoint,end:SoccerPoint,pole:SoccerPoint,upper:number,lower:number):SoccerPoint {
 const axis=normalize(sub(end,root)),distance=clamp(length(sub(end,root)),Math.abs(upper-lower)+1e-8,upper+lower-1e-8);
 const poleVector=sub(pole,root),bend=normalize(sub(poleVector,multiply(axis,dot(poleVector,axis))));
 const along=(upper*upper-lower*lower+distance*distance)/(2*distance);
 return add(add(root,multiply(axis,along)),multiply(bend,Math.sqrt(Math.max(0,upper*upper-along*along))));
}
function minimumShoeY(shoePitch:number) {
 const c=Math.cos(shoePitch),s=Math.sin(shoePitch);
 const ellipse=-Math.hypot(SOCCER_SHOE_RADII[1]*c,SOCCER_SHOE_RADII[2]*s);
 const sole=-.024*c-.006*s-Math.abs(c)*.006-Math.abs(s)*.075;
 return Math.min(ellipse,sole)+SOCCER_SHOE_CENTER_FROM_ANKLE[1];
}
function samplePlayer(time:number,ball:SoccerPoint):SoccerPlayerPose {
 const pose=samplePoseCurve(time),shoulderY=.785-pose.crouch,hipY=.53-pose.crouch;
 const ground=(SOCCER_TURF_Y-SOCCER_ACTOR.position[1])/SOCCER_ACTOR.scale;
 // Rotated heel/sole corners, as well as the ellipsoid, clear the turf.
 pose.ankle[1]=Math.max(pose.ankle[1],ground-minimumShoeY(pose.pitch));
 const localBall=actorLocal(ball);
 const trackingYaw=clamp(Math.atan2(localBall[0],Math.max(.03,localBall[2])),-.10,.10),restBall=actorLocal(SOCCER_BALL_REST);
 const restYaw=clamp(Math.atan2(restBall[0],Math.max(.03,restBall[2])),-.10,.10);
 // The visible athlete returns his gaze during the fade, before the hidden
 // ball reset; following its instantaneous hidden position would snap his head.
 const headYaw=time>=SOCCER_EVENTS.fadeOut?trackingYaw+(restYaw-trackingYaw)*smooth((time-SOCCER_EVENTS.fadeOut)/SOCCER_FADE_SECONDS):trackingYaw;
 return {leftElbow:joint([-.145,shoulderY,0],pose.leftWrist,[-.35,.65,.03],.20,.185),leftWrist:pose.leftWrist,rightElbow:joint([.145,shoulderY,0],pose.rightWrist,[.35,.63,.02],.20,.185),rightWrist:pose.rightWrist,leftKnee:joint([-.082,hipY,0],SOCCER_SUPPORT_ANKLE,[-.11,.28,.30],.25,.235),leftAnkle:[...SOCCER_SUPPORT_ANKLE],rightKnee:joint([.082,hipY,0],pose.ankle,[.17,.28,.30],.25,.235),rightAnkle:pose.ankle,rightShoePitch:pose.pitch,crouch:pose.crouch,headYaw};
}

function sampleNet(time:number) {
 const elapsed=time-SOCCER_EVENTS.netHit;
 const response=elapsed<0||elapsed>=1?0:Math.exp(-7*elapsed)*Math.sin(20*elapsed)*(1-smooth((elapsed-.7)/.3));
 return {impact:{position:SOCCER_NET_IMPACT.position,normal:SOCCER_NET_IMPACT.normal,uv:SOCCER_NET_IMPACT.uv},elapsed,displacement:-.022*response,response};
}
export type SoccerShotSample={time:number;period:number;player:SoccerPlayerPose;ball:ReturnType<typeof sampleBall>;net:ReturnType<typeof sampleNet>;phase:SoccerShotPhase};
export function sampleSoccerShot(seconds:number):SoccerShotSample {
 const time=wrap(Number.isFinite(seconds)?seconds:0,SOCCER_SHOT_PERIOD),ball=sampleBall(time);
 const phase:SoccerShotPhase=time>=SOCCER_EVENTS.fadeIn?'fade-in':time>=SOCCER_EVENTS.hiddenReset?'reset':time>=SOCCER_EVENTS.fadeOut?'fade-out':time>=SOCCER_EVENTS.settle?'hold':time>=SOCCER_EVENTS.netHit?'net':time>=SOCCER_EVENTS.landing?'roll':time>=SOCCER_EVENTS.strike?'flight':time>=SOCCER_STRIKE_TIME-.04?'strike':time>=SOCCER_EVENTS.backswing?'backswing':'ready';
 return {time,period:SOCCER_SHOT_PERIOD,player:samplePlayer(time,ball.position),ball,net:sampleNet(time),phase};
}
