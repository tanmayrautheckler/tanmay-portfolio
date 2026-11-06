import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3, Euler} from 'three';
import {
  sampleSoccerShot, soccerGoalNetPoint, SOCCER_ACTOR, SOCCER_BALL_RADIUS,
  SOCCER_BOOT_CONTACT_NORMAL, SOCCER_SUPPORT_ANKLE, SOCCER_EVENTS,
  SOCCER_SHOT_PERIOD, SOCCER_TURF_Y, SOCCER_GOAL, SOCCER_NET_IMPACT,
  SOCCER_NET_DEPTH_BOUNDS,
} from './journal-soccer-motion.ts';

const distance = (a, b) => Math.hypot(...a.map((value, i) => value - b[i]));
const world = point => point.multiplyScalar(SOCCER_ACTOR.scale).applyAxisAngle(new Vector3(0, 1, 0), SOCCER_ACTOR.angle).add(new Vector3(...SOCCER_ACTOR.position));
const bootWorld = (point, ankle, pitch) => world(point.applyEuler(new Euler(pitch, 0, 0)).add(new Vector3(0, -.032, .035)).add(new Vector3(...ankle)));

test('soccer strike touches the actual rotated shoe ellipsoid, including ball radius', () => {
  const frame = sampleSoccerShot(SOCCER_EVENTS.strike), pose = frame.player;
  const normal = new Vector3(...SOCCER_BOOT_CONTACT_NORMAL).applyEuler(new Euler(-pose.rightShoePitch, 0, 0));
  const axes = [.048, .032, .09], n = normal.toArray(), denominator = Math.hypot(...n.map((value, i) => value * axes[i]));
  const tangent = new Vector3(...n.map((value, i) => axes[i] ** 2 * value / denominator));
  tangent.addScaledVector(normal, SOCCER_BALL_RADIUS / SOCCER_ACTOR.scale);
  const contact = bootWorld(tangent, pose.rightAnkle, pose.rightShoePitch);
  assert.ok(distance(contact.toArray(), frame.ball.position) < 1e-9);
});

test('support foot stays planted, limbs keep length and both shoes clear the turf', () => {
  for (let i = 0; i < 1600; i++) {
    const p = sampleSoccerShot(i / 1600 * SOCCER_SHOT_PERIOD).player;
    assert.deepEqual(p.leftAnkle, SOCCER_SUPPORT_ANKLE);
    for (const [side, ankle, knee, pitch] of [[-1, p.leftAnkle, p.leftKnee, 0], [1, p.rightAnkle, p.rightKnee, p.rightShoePitch]]) {
      assert.ok(Math.abs(distance([side * .082, .53 - p.crouch, 0], knee) - .25) < 1e-6);
      assert.ok(Math.abs(distance(knee, ankle) - .235) < 1e-6);
      // Actual sole-box corners, transformed through the rendered shoe group.
      for (const x of [-.041, .041]) for (const y of [-.030, -.018]) for (const z of [-.069, .081]) {
        assert.ok(bootWorld(new Vector3(x, y, z), ankle, pitch).y >= SOCCER_TURF_Y - 1e-6);
      }
      const wrist = side < 0 ? p.leftWrist : p.rightWrist, elbow = side < 0 ? p.leftElbow : p.rightElbow;
      assert.ok(Math.abs(distance([side * .145, .785 - p.crouch, 0], elbow) - .20) < 1e-6);
      assert.ok(Math.abs(distance(elbow, wrist) - .185) < 1e-6);
    }
  }
});

test('shot clears the goal mouth, lands on turf and meets the curved net with pinned edges', () => {
  let previous = sampleSoccerShot(SOCCER_EVENTS.strike).ball.position, crossed = false;
  for (let i = 1; i <= 1800; i++) {
    const frame = sampleSoccerShot(SOCCER_EVENTS.strike + (SOCCER_EVENTS.settle - SOCCER_EVENTS.strike) * i / 1800), ball = frame.ball;
    assert.ok(ball.position[1] - SOCCER_BALL_RADIUS >= SOCCER_TURF_Y - 1e-9);
    if (previous[2] > -1.09 && ball.position[2] <= -1.09) {
      assert.ok(ball.position[0] - SOCCER_BALL_RADIUS > 1.246 && ball.position[0] + SOCCER_BALL_RADIUS < 2.454);
      assert.ok(ball.position[1] + SOCCER_BALL_RADIUS < .669); crossed = true;
    }
    previous = ball.position;
  }
  assert.ok(crossed);
  const [u, v] = SOCCER_NET_IMPACT.uv, slack = Math.sin(u * Math.PI) * Math.sin(v * Math.PI);
  const surface = [(u - .5) * 1.25 + 1.85, v * .61 - slack * .018 + .08, .04 * v - slack * .035 - .29 - 1.09];
  const hit = sampleSoccerShot(SOCCER_EVENTS.netHit).ball.position;
  assert.ok(distance(surface, SOCCER_NET_IMPACT.position) < 1e-9);
  assert.ok(Math.abs(distance(surface, hit) - SOCCER_BALL_RADIUS) < 1e-9);
  for (const displacement of [-.022, .022]) for (let x = 0; x <= 20; x++) for (let y = 0; y <= 20; y++) {
    const a = soccerGoalNetPoint(x / 20, y / 20, 0), b = soccerGoalNetPoint(x / 20, y / 20, displacement);
    assert.ok(b[2] >= SOCCER_NET_DEPTH_BOUNDS.min - 1e-12 && b[2] <= SOCCER_NET_DEPTH_BOUNDS.max + 1e-12);
    if (x === 0 || y === 0 || x === 20 || y === 20) assert.ok(distance(a, b) < 1e-12);
  }
  assert.deepEqual(SOCCER_GOAL.position, [1.85, .08, -1.09]);
});

test('visible ball/body do not jump; reset occurs only when hidden and rolling spin matches travel', () => {
  for (const event of Object.values(SOCCER_EVENTS)) {
    const before = sampleSoccerShot(event - 1e-7), after = sampleSoccerShot(event + 1e-7);
    if (event === SOCCER_EVENTS.hiddenReset) {
      assert.equal(sampleSoccerShot(event).ball.opacity, 0);
      assert.ok(Math.max(before.ball.opacity, after.ball.opacity) < 1e-5);
    } else assert.ok(distance(before.ball.position, after.ball.position) < 1e-5);
    for (const field of Object.keys(before.player)) {
      const a = before.player[field], b = after.player[field];
      assert.ok(Array.isArray(a) ? distance(a, b) < 1e-5 : Math.abs(a - b) < 1e-5, `${field} jumps at ${event}`);
    }
  }
  const time = (SOCCER_EVENTS.landing + SOCCER_EVENTS.netHit) / 2, epsilon = 1e-6;
  const a = sampleSoccerShot(time - epsilon), b = sampleSoccerShot(time + epsilon), center = sampleSoccerShot(time);
  const angularVelocity = (b.ball.spin[0] - a.ball.spin[0]) / (2 * epsilon);
  assert.ok(Math.abs(angularVelocity - center.ball.velocity[2] / SOCCER_BALL_RADIUS) < 1e-6);
  const heldA = sampleSoccerShot(SOCCER_EVENTS.settle + .05), heldB = sampleSoccerShot(SOCCER_EVENTS.fadeOut);
  assert.deepEqual(heldA.ball.position, heldB.ball.position);
  assert.deepEqual(heldA.ball.spin, heldB.ball.spin);
});
