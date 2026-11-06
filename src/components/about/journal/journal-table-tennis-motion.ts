/** A repeatable forehand exchange for the existing miniature table. Ball
 * positions are in spread space; joint targets are Athlete-local. This pure
 * sampler shares the scene clock, so pausing it also freezes every contact. */
export type TableTennisPoint = [number, number, number];
export type TableTennisPlayer = 'front' | 'back';
export type TableTennisStrokePhase = 'ready' | 'backswing' | 'contact' | 'follow-through';

export type TableTennisPlayerPose = {
 leftElbow: TableTennisPoint;
 leftWrist: TableTennisPoint;
 rightElbow: TableTennisPoint;
 rightWrist: TableTennisPoint;
 wristRotation: TableTennisPoint;
 crouch: number;
 headYaw: number;
 phase: TableTennisStrokePhase;
 /** Seconds since this player's previous contact, wrapped to one exchange. */
 strokeTime: number;
};

export const TABLE_TENNIS_ACTORS = {
 front: {position: [-2.43, .08, .36] as TableTennisPoint, angle: Math.PI, scale: .83},
 back: {position: [-2.43, .08, -1.22] as TableTennisPoint, angle: 0, scale: .83},
} as const;
export const TABLE_TENNIS_BALL_RADIUS = .012;
export const TABLE_TENNIS_PADDLE_FACE_CENTER: TableTennisPoint = [0, .115, .0085];
export const TABLE_TENNIS_CONTACT_WRIST: TableTennisPoint = [.15, .45, .20];
export const TABLE_TENNIS_CONTACT_ROTATION: TableTennisPoint = [-.12, 0, -.12];
export const TABLE_TENNIS_TABLE_Y = .441;
export const TABLE_TENNIS_TABLE_BOUNDS = {minX: -2.69, maxX: -2.17, minZ: -.905, maxZ: .045} as const;
export const TABLE_TENNIS_NET_Z = -.43;
export const TABLE_TENNIS_NET_TOP_Y = .5145;
export const TABLE_TENNIS_GRAVITY = 4.8;
export const TABLE_TENNIS_FLIGHT_SECONDS = .42;
export const TABLE_TENNIS_RESTITUTION = .86;
export const TABLE_TENNIS_BOUNCE_RETENTION = .97;

const add = (a: TableTennisPoint, b: TableTennisPoint): TableTennisPoint => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
const sub = (a: TableTennisPoint, b: TableTennisPoint): TableTennisPoint => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
const multiply = (a: TableTennisPoint, factor: number): TableTennisPoint => [a[0]*factor, a[1]*factor, a[2]*factor];
const dot = (a: TableTennisPoint, b: TableTennisPoint) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const length = (a: TableTennisPoint) => Math.hypot(...a);
const normalize = (a: TableTennisPoint): TableTennisPoint => multiply(a,1/Math.max(1e-12,length(a)));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo,Math.min(hi,v));
const wrap = (v: number, period: number) => {const remainder=v%period;return remainder<0?remainder+period:remainder;};

/** Three's XYZ Euler order: Z, then Y, then X when applied to a point. */
function rotateXYZ(point: TableTennisPoint, rotation: TableTennisPoint): TableTennisPoint {
 const [x,y,z]=point,[rx,ry,rz]=rotation;
 const zx=Math.cos(rz)*x-Math.sin(rz)*y,zy=Math.sin(rz)*x+Math.cos(rz)*y;
 const yx=Math.cos(ry)*zx+Math.sin(ry)*z,yz=-Math.sin(ry)*zx+Math.cos(ry)*z;
 return [yx,Math.cos(rx)*zy-Math.sin(rx)*yz,Math.sin(rx)*zy+Math.cos(rx)*yz];
}

/** Exact ball-center tangency with the equipment's positive rubber face. */
export function tableTennisPaddleContact(player: TableTennisPlayer, wrist: TableTennisPoint, rotation: TableTennisPoint): TableTennisPoint {
 const actor=TABLE_TENNIS_ACTORS[player],face=[...TABLE_TENNIS_PADDLE_FACE_CENTER] as TableTennisPoint;
 face[2]+=TABLE_TENNIS_BALL_RADIUS/actor.scale;
 const local=add(wrist,rotateXYZ(face,rotation)),c=Math.cos(actor.angle),s=Math.sin(actor.angle);
 return add(actor.position,multiply([c*local[0]+s*local[2],local[1],-s*local[0]+c*local[2]],actor.scale));
}

export const TABLE_TENNIS_CONTACTS = {
 front: tableTennisPaddleContact('front',TABLE_TENNIS_CONTACT_WRIST,TABLE_TENNIS_CONTACT_ROTATION),
 back: tableTennisPaddleContact('back',TABLE_TENNIS_CONTACT_WRIST,TABLE_TENNIS_CONTACT_ROTATION),
};

const FLOOR=TABLE_TENNIS_TABLE_Y+TABLE_TENNIS_BALL_RADIUS;
const CONTACT_Y=TABLE_TENNIS_CONTACTS.front[1];
const LAUNCH_Y=(FLOOR-CONTACT_Y+.5*TABLE_TENNIS_GRAVITY*TABLE_TENNIS_FLIGHT_SECONDS**2)/TABLE_TENNIS_FLIGHT_SECONDS;
const REBOUND_Y=-(LAUNCH_Y-TABLE_TENNIS_GRAVITY*TABLE_TENNIS_FLIGHT_SECONDS)*TABLE_TENNIS_RESTITUTION;
/** Receiver contacts the ball on the rising branch after its single bounce. */
export const TABLE_TENNIS_RETURN_SECONDS=(REBOUND_Y-Math.sqrt(REBOUND_Y**2-2*TABLE_TENNIS_GRAVITY*(CONTACT_Y-FLOOR)))/TABLE_TENNIS_GRAVITY;
export const TABLE_TENNIS_LEG_SECONDS=TABLE_TENNIS_FLIGHT_SECONDS+TABLE_TENNIS_RETURN_SECONDS;
export const TABLE_TENNIS_RALLY_PERIOD=TABLE_TENNIS_LEG_SECONDS*2;
export const TABLE_TENNIS_EVENTS = {
 frontContact: 0,
 backBounce: TABLE_TENNIS_FLIGHT_SECONDS,
 backContact: TABLE_TENNIS_LEG_SECONDS,
 frontBounce: TABLE_TENNIS_LEG_SECONDS+TABLE_TENNIS_FLIGHT_SECONDS,
 nextFrontContact: TABLE_TENNIS_RALLY_PERIOD,
} as const;

function sampleBall(time: number) {
 const leg=time<TABLE_TENNIS_LEG_SECONDS?0:1;
 const from: TableTennisPlayer=leg===0?'front':'back',to: TableTennisPlayer=leg===0?'back':'front';
 const t=time-leg*TABLE_TENNIS_LEG_SECONDS,start=TABLE_TENNIS_CONTACTS[from],end=TABLE_TENNIS_CONTACTS[to];
 const horizontalTime=TABLE_TENNIS_FLIGHT_SECONDS+TABLE_TENNIS_BOUNCE_RETENTION*TABLE_TENNIS_RETURN_SECONDS;
 const vx=(end[0]-start[0])/horizontalTime,vz=(end[2]-start[2])/horizontalTime;
 const bounce: TableTennisPoint=[start[0]+vx*TABLE_TENNIS_FLIGHT_SECONDS,FLOOR,start[2]+vz*TABLE_TENNIS_FLIGHT_SECONDS];
 // Compare the shared event time directly: subtracting the second leg first
 // can round an exact bounce to the last pre-impact floating-point instant.
 const bounceTime=leg*TABLE_TENNIS_LEG_SECONDS+TABLE_TENNIS_FLIGHT_SECONDS;
 const bounced=time>=bounceTime,after=time-bounceTime;
 const position: TableTennisPoint=bounced
  ?[bounce[0]+vx*TABLE_TENNIS_BOUNCE_RETENTION*after,FLOOR+REBOUND_Y*after-.5*TABLE_TENNIS_GRAVITY*after**2,bounce[2]+vz*TABLE_TENNIS_BOUNCE_RETENTION*after]
  :[start[0]+vx*t,start[1]+LAUNCH_Y*t-.5*TABLE_TENNIS_GRAVITY*t**2,start[2]+vz*t];
 const velocity: TableTennisPoint=bounced
  ?[vx*TABLE_TENNIS_BOUNCE_RETENTION,REBOUND_Y-TABLE_TENNIS_GRAVITY*after,vz*TABLE_TENNIS_BOUNCE_RETENTION]
  :[vx,LAUNCH_Y-TABLE_TENNIS_GRAVITY*t,vz];
 return {position,velocity,radius:TABLE_TENNIS_BALL_RADIUS,from,to,phase:bounced?'after-bounce' as const:'flight' as const,bounce,legTime:t,contactTime:leg*TABLE_TENNIS_LEG_SECONDS,bounceTime,nextContactTime:(leg+1)*TABLE_TENNIS_LEG_SECONDS};
}

type PoseKey={time:number;wrist:TableTennisPoint;rotation:TableTennisPoint;offhand:TableTennisPoint;crouch:number};
const KEYS: PoseKey[] = [
 {time:0,wrist:TABLE_TENNIS_CONTACT_WRIST,rotation:TABLE_TENNIS_CONTACT_ROTATION,offhand:[-.13,.61,.12],crouch:.025},
 {time:.085,wrist:[.13,.50,.26],rotation:[-.12,-.08,-.30],offhand:[-.15,.62,.11],crouch:.020},
 {time:.28,wrist:[.15,.535,.25],rotation:[-.12,0,-.12],offhand:[-.10,.59,.20],crouch:.015},
 {time:TABLE_TENNIS_RALLY_PERIOD-.18,wrist:[.24,.48,.12],rotation:[-.18,.06,.08],offhand:[-.17,.61,.13],crouch:.026},
 {time:TABLE_TENNIS_RALLY_PERIOD-.07,wrist:[.20,.425,.16],rotation:[-.14,.02,-.02],offhand:[-.16,.60,.12],crouch:.029},
];

/** Periodic Hermite tangents carry the paddle through impact, rather than
 * stopping it there or snapping it back at the end of an exchange. */
function samplePoseCurve(time: number) {
 const count=KEYS.length;
 let i=count-1;
 for(let k=0;k<count-1;k++)if(time>=KEYS[k].time&&time<KEYS[k+1].time){i=k;break;}
 const j=(i+1)%count,previous=(i+count-1)%count,next=(j+1)%count;
 const a=KEYS[i],b=KEYS[j],start=a.time,end=j===0?TABLE_TENNIS_RALLY_PERIOD:b.time;
 const prevTime=previous>i?KEYS[previous].time-TABLE_TENNIS_RALLY_PERIOD:KEYS[previous].time;
 let nextTime=KEYS[next].time;while(nextTime<=end)nextTime+=TABLE_TENNIS_RALLY_PERIOD;
 const u=(time-start)/(end-start),u2=u*u,u3=u2*u;
 const h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2;
 const curve=(field:'wrist'|'rotation'|'offhand'):TableTennisPoint=>a[field].map((value,axis)=>{
  const tangentA=(b[field][axis]-KEYS[previous][field][axis])/(end-prevTime);
  const tangentB=(KEYS[next][field][axis]-a[field][axis])/(nextTime-start);
  return h00*value+h10*(end-start)*tangentA+h01*b[field][axis]+h11*(end-start)*tangentB;
 }) as TableTennisPoint;
 return {wrist:curve('wrist'),rotation:curve('rotation'),offhand:curve('offhand'),crouch:clamp(a.crouch+(b.crouch-a.crouch)*(u2*(3-2*u)),.015,.029)};
}

function elbow(shoulder: TableTennisPoint,wrist: TableTennisPoint,pole: TableTennisPoint,upper: number,lower: number): TableTennisPoint {
 const axis=normalize(sub(wrist,shoulder));
 const distance=clamp(length(sub(wrist,shoulder)),Math.abs(upper-lower)+1e-8,upper+lower-1e-8);
 const poleVector=sub(pole,shoulder),bend=normalize(sub(poleVector,multiply(axis,dot(poleVector,axis))));
 const along=(upper*upper-lower*lower+distance*distance)/(2*distance);
 return add(add(shoulder,multiply(axis,along)),multiply(bend,Math.sqrt(Math.max(0,upper*upper-along*along))));
}

function samplePlayer(player: TableTennisPlayer,time: number,ball: TableTennisPoint): TableTennisPlayerPose {
 const offset=player==='front'?0:TABLE_TENNIS_LEG_SECONDS,strokeTime=wrap(time-offset,TABLE_TENNIS_RALLY_PERIOD);
 const pose=samplePoseCurve(strokeTime),shoulderY=.785-pose.crouch;
 const actor=TABLE_TENNIS_ACTORS[player],difference=sub(ball,actor.position),c=Math.cos(actor.angle),s=Math.sin(actor.angle);
 const localBallX=c*difference[0]-s*difference[2],localBallZ=s*difference[0]+c*difference[2];
 const phase: TableTennisStrokePhase=strokeTime<.03||strokeTime>TABLE_TENNIS_RALLY_PERIOD-.03?'contact':strokeTime<.28?'follow-through':strokeTime>TABLE_TENNIS_RALLY_PERIOD-.18?'backswing':'ready';
 return {leftElbow:elbow([-.145,shoulderY,0],pose.offhand,[-.30,.61,.06],.18,.17),leftWrist:pose.offhand,rightElbow:elbow([.145,shoulderY,0],pose.wrist,[.35,.61,.075],.20,.185),rightWrist:pose.wrist,wristRotation:pose.rotation,crouch:pose.crouch,headYaw:clamp(Math.atan2(localBallX,Math.max(.03,localBallZ)),-.14,.14),phase,strokeTime};
}

export type TableTennisRallySample = {
 time: number;
 period: number;
 ball: ReturnType<typeof sampleBall>;
 players: Record<TableTennisPlayer,TableTennisPlayerPose>;
};

export function sampleTableTennisRally(seconds: number): TableTennisRallySample {
 const time=wrap(Number.isFinite(seconds)?seconds:0,TABLE_TENNIS_RALLY_PERIOD),ball=sampleBall(time);
 return {time,period:TABLE_TENNIS_RALLY_PERIOD,ball,players:{front:samplePlayer('front',time,ball.position),back:samplePlayer('back',time,ball.position)}};
}
