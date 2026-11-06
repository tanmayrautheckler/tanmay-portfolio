/** Deterministic miniature groundstroke rally. All ball positions are in the
 * sports spread's coordinates; joint targets are in each Athlete's local space.
 * There is no renderer, clock, physics engine or mutable animation state here. */
export type PickleballPoint = [number, number, number];
export type PickleballPlayer = 'front' | 'back';
export type PickleballStrokePhase = 'ready' | 'backswing' | 'contact' | 'follow-through';

export type PickleballPlayerPose = {
 leftElbow: PickleballPoint;
 leftWrist: PickleballPoint;
 rightElbow: PickleballPoint;
 rightWrist: PickleballPoint;
 wristRotation: PickleballPoint;
 crouch: number;
 headYaw: number;
 phase: PickleballStrokePhase;
 /** Seconds since this player's last paddle contact, wrapped to one rally. */
 strokeTime: number;
};

export const PICKLEBALL_ACTORS = {
 front: {position: [-1.42, .08, .52] as PickleballPoint, angle: Math.PI, scale: .83},
 back: {position: [-1.84, .08, -1.04] as PickleballPoint, angle: 0, scale: .83},
} as const;
export const PICKLEBALL_BALL_RADIUS = .037 * .83;
export const PICKLEBALL_PADDLE_FACE_CENTER: PickleballPoint = [0, .255, .0128];
export const PICKLEBALL_CONTACT_WRIST: PickleballPoint = [.12, .48, .23];
export const PICKLEBALL_CONTACT_ROTATION: PickleballPoint = [-.25, 0, -1.75];
export const PICKLEBALL_COURT_Y = .077;
export const PICKLEBALL_GRAVITY = 4.5;
export const PICKLEBALL_FLIGHT_SECONDS = .95;
export const PICKLEBALL_RESTITUTION = .82;
export const PICKLEBALL_BOUNCE_RETENTION = .88;

const add = (a: PickleballPoint, b: PickleballPoint): PickleballPoint => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: PickleballPoint, b: PickleballPoint): PickleballPoint => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const multiply = (a: PickleballPoint, factor: number): PickleballPoint => [a[0] * factor, a[1] * factor, a[2] * factor];
const dot = (a: PickleballPoint, b: PickleballPoint) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const length = (a: PickleballPoint) => Math.hypot(...a);
const normalize = (a: PickleballPoint): PickleballPoint => multiply(a, 1 / Math.max(1e-12, length(a)));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const wrap = (v: number, period: number) => {const remainder=v%period;return remainder<0?remainder+period:remainder;};

/** Three's XYZ Euler convention, without importing Three into the math module. */
function rotateXYZ(point: PickleballPoint, rotation: PickleballPoint): PickleballPoint {
 const [x, y, z] = point, [rx, ry, rz] = rotation;
 const zX = Math.cos(rz) * x - Math.sin(rz) * y, zY = Math.sin(rz) * x + Math.cos(rz) * y;
 const yX = Math.cos(ry) * zX + Math.sin(ry) * z, yZ = -Math.sin(ry) * zX + Math.cos(ry) * z;
 return [yX, Math.cos(rx) * zY - Math.sin(rx) * yZ, Math.sin(rx) * zY + Math.cos(rx) * yZ];
}

/** Ball center at a real paddle-face touch, including its surface offset/radius. */
export function pickleballPaddleContact(player: PickleballPlayer, wrist: PickleballPoint, wristRotation: PickleballPoint): PickleballPoint {
 const actor = PICKLEBALL_ACTORS[player];
 const face = [...PICKLEBALL_PADDLE_FACE_CENTER] as PickleballPoint;
 face[2] += PICKLEBALL_BALL_RADIUS / actor.scale;
 const local = add(wrist, rotateXYZ(face, wristRotation));
 const c = Math.cos(actor.angle), s = Math.sin(actor.angle);
 return add(actor.position, multiply([c * local[0] + s * local[2], local[1], -s * local[0] + c * local[2]], actor.scale));
}

export const PICKLEBALL_CONTACTS = {
 front: pickleballPaddleContact('front', PICKLEBALL_CONTACT_WRIST, PICKLEBALL_CONTACT_ROTATION),
 back: pickleballPaddleContact('back', PICKLEBALL_CONTACT_WRIST, PICKLEBALL_CONTACT_ROTATION),
};

const FLOOR = PICKLEBALL_COURT_Y + PICKLEBALL_BALL_RADIUS;
const CONTACT_Y = PICKLEBALL_CONTACTS.front[1];
const LAUNCH_Y = (FLOOR - CONTACT_Y + .5 * PICKLEBALL_GRAVITY * PICKLEBALL_FLIGHT_SECONDS ** 2) / PICKLEBALL_FLIGHT_SECONDS;
const REBOUND_Y = -(LAUNCH_Y - PICKLEBALL_GRAVITY * PICKLEBALL_FLIGHT_SECONDS) * PICKLEBALL_RESTITUTION;
/** Rising branch of the bounce: the receiver meets the ball before its apex. */
export const PICKLEBALL_RETURN_SECONDS = (REBOUND_Y - Math.sqrt(REBOUND_Y ** 2 - 2 * PICKLEBALL_GRAVITY * (CONTACT_Y - FLOOR))) / PICKLEBALL_GRAVITY;
export const PICKLEBALL_LEG_SECONDS = PICKLEBALL_FLIGHT_SECONDS + PICKLEBALL_RETURN_SECONDS;
export const PICKLEBALL_RALLY_PERIOD = PICKLEBALL_LEG_SECONDS * 2;

function sampleBall(time: number) {
 const leg = time < PICKLEBALL_LEG_SECONDS ? 0 : 1;
 const from: PickleballPlayer = leg === 0 ? 'front' : 'back', to: PickleballPlayer = leg === 0 ? 'back' : 'front';
 const t = time - leg * PICKLEBALL_LEG_SECONDS;
 const start = PICKLEBALL_CONTACTS[from], end = PICKLEBALL_CONTACTS[to];
 const horizontalTime = PICKLEBALL_FLIGHT_SECONDS + PICKLEBALL_BOUNCE_RETENTION * PICKLEBALL_RETURN_SECONDS;
 const vx = (end[0] - start[0]) / horizontalTime, vz = (end[2] - start[2]) / horizontalTime;
 const bounce: PickleballPoint = [start[0] + vx * PICKLEBALL_FLIGHT_SECONDS, FLOOR, start[2] + vz * PICKLEBALL_FLIGHT_SECONDS];
 const bounced = t >= PICKLEBALL_FLIGHT_SECONDS, after = t - PICKLEBALL_FLIGHT_SECONDS;
 const position: PickleballPoint = bounced
  ? [bounce[0] + vx * PICKLEBALL_BOUNCE_RETENTION * after, FLOOR + REBOUND_Y * after - .5 * PICKLEBALL_GRAVITY * after ** 2, bounce[2] + vz * PICKLEBALL_BOUNCE_RETENTION * after]
  : [start[0] + vx * t, start[1] + LAUNCH_Y * t - .5 * PICKLEBALL_GRAVITY * t ** 2, start[2] + vz * t];
 const velocity: PickleballPoint = bounced
  ? [vx * PICKLEBALL_BOUNCE_RETENTION, REBOUND_Y - PICKLEBALL_GRAVITY * after, vz * PICKLEBALL_BOUNCE_RETENTION]
  : [vx, LAUNCH_Y - PICKLEBALL_GRAVITY * t, vz];
 return {position, velocity, radius: PICKLEBALL_BALL_RADIUS, from, to, phase: bounced ? 'after-bounce' as const : 'flight' as const, bounce, legTime: t, contactTime: leg * PICKLEBALL_LEG_SECONDS, bounceTime: leg * PICKLEBALL_LEG_SECONDS + PICKLEBALL_FLIGHT_SECONDS, nextContactTime: (leg + 1) * PICKLEBALL_LEG_SECONDS};
}

type PoseKey = {time: number; wrist: PickleballPoint; rotation: PickleballPoint; offhand: PickleballPoint; crouch: number};
const KEYS: PoseKey[] = [
 {time: 0, wrist: PICKLEBALL_CONTACT_WRIST, rotation: PICKLEBALL_CONTACT_ROTATION, offhand: [-.16,.59,.14], crouch: .035},
 {time: .18, wrist: [.07,.58,.30], rotation: [-.18,-.08,-.90], offhand: [-.18,.61,.13], crouch: .020},
 {time: .55, wrist: [.15,.535,.25], rotation: [-.12,0,-.12], offhand: [-.10,.59,.20], crouch: .015},
 {time: PICKLEBALL_RALLY_PERIOD-.44, wrist: [.22,.48,.12], rotation: [-.32,.10,-2.35], offhand: [-.17,.60,.16], crouch: .025},
 {time: PICKLEBALL_RALLY_PERIOD-.16, wrist: [.17,.445,.195], rotation: [-.30,.04,-2.00], offhand: [-.17,.59,.14], crouch: .035},
];

/** Periodic cubic Hermite interpolation carries velocity through the impact
 * keyframe; the paddle does not stop at contact or jump when the loop wraps. */
function samplePoseCurve(time: number) {
 const count = KEYS.length;
 let i = count - 1;
 for (let k = 0; k < count - 1; k++) if (time >= KEYS[k].time && time < KEYS[k + 1].time) {i = k; break;}
 const j = (i + 1) % count, previous = (i + count - 1) % count, next = (j + 1) % count;
 const a = KEYS[i], b = KEYS[j], start = a.time, end = j === 0 ? PICKLEBALL_RALLY_PERIOD : b.time;
 const prevTime = previous > i ? KEYS[previous].time - PICKLEBALL_RALLY_PERIOD : KEYS[previous].time;
 let nextTime=KEYS[next].time;while(nextTime<=end)nextTime+=PICKLEBALL_RALLY_PERIOD;
 const u = (time - start) / (end - start), u2 = u * u, u3 = u2 * u;
 const h00 = 2*u3-3*u2+1, h10 = u3-2*u2+u, h01 = -2*u3+3*u2, h11 = u3-u2;
 const curve = (field: 'wrist' | 'rotation' | 'offhand'): PickleballPoint => a[field].map((value, axis) => {
  const tangentA = (b[field][axis] - KEYS[previous][field][axis]) / (end - prevTime);
  const tangentB = (KEYS[next][field][axis] - a[field][axis]) / (nextTime - start);
  return h00*value + h10*(end-start)*tangentA + h01*b[field][axis] + h11*(end-start)*tangentB;
 }) as PickleballPoint;
 // Crouch is intentionally bounded: feet and the root never travel.
 return {wrist: curve('wrist'), rotation: curve('rotation'), offhand: curve('offhand'), crouch: clamp(a.crouch + (b.crouch-a.crouch)*(u2*(3-2*u)), .015, .035)};
}

function elbow(shoulder: PickleballPoint, wrist: PickleballPoint, pole: PickleballPoint, upper: number, lower: number): PickleballPoint {
 const axis = normalize(sub(wrist, shoulder));
 const distance = clamp(length(sub(wrist, shoulder)), Math.abs(upper-lower)+1e-8, upper+lower-1e-8);
 const poleVector = sub(pole, shoulder), bend = normalize(sub(poleVector, multiply(axis, dot(poleVector, axis))));
 const along = (upper*upper-lower*lower+distance*distance)/(2*distance);
 return add(add(shoulder, multiply(axis, along)), multiply(bend, Math.sqrt(Math.max(0,upper*upper-along*along))));
}

function samplePlayer(player: PickleballPlayer, time: number, ball: PickleballPoint): PickleballPlayerPose {
 const offset = player === 'front' ? 0 : PICKLEBALL_LEG_SECONDS, strokeTime = wrap(time-offset,PICKLEBALL_RALLY_PERIOD);
 const pose = samplePoseCurve(strokeTime), shoulderY = .785-pose.crouch;
 const actor = PICKLEBALL_ACTORS[player], difference = sub(ball,actor.position), c = Math.cos(actor.angle), s = Math.sin(actor.angle);
 const localBallX = c*difference[0]-s*difference[2], localBallZ = s*difference[0]+c*difference[2];
 const phase: PickleballStrokePhase = strokeTime < .07 || strokeTime > PICKLEBALL_RALLY_PERIOD-.07 ? 'contact' : strokeTime < .55 ? 'follow-through' : strokeTime > PICKLEBALL_RALLY_PERIOD-.44 ? 'backswing' : 'ready';
 return {leftElbow: elbow([-.145,shoulderY,0],pose.offhand,[-.30,.61,.06],.18,.17),leftWrist: pose.offhand,rightElbow: elbow([.145,shoulderY,0],pose.wrist,[.35,.61,.075],.20,.185),rightWrist: pose.wrist,wristRotation: pose.rotation,crouch: pose.crouch,headYaw: clamp(Math.atan2(localBallX,Math.max(.03,localBallZ)),-.14,.14),phase,strokeTime};
}

export type PickleballRallySample = {
 time: number;
 period: number;
 ball: ReturnType<typeof sampleBall>;
 players: Record<PickleballPlayer,PickleballPlayerPose>;
};

export function samplePickleballRally(seconds: number): PickleballRallySample {
 const time = wrap(Number.isFinite(seconds) ? seconds : 0,PICKLEBALL_RALLY_PERIOD), ball = sampleBall(time);
 return {time,period:PICKLEBALL_RALLY_PERIOD,ball,players:{front:samplePlayer('front',time,ball.position),back:samplePlayer('back',time,ball.position)}};
}
