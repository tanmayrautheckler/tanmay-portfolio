import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3, Euler} from 'three';
import {
  samplePickleballRally, PICKLEBALL_ACTORS, PICKLEBALL_BALL_RADIUS,
  PICKLEBALL_PADDLE_FACE_CENTER, PICKLEBALL_COURT_Y,
  PICKLEBALL_FLIGHT_SECONDS, PICKLEBALL_LEG_SECONDS, PICKLEBALL_RALLY_PERIOD,
} from './journal-pickleball-motion.ts';

const distance = (a, b) => Math.hypot(...a.map((value, i) => value - b[i]));

test('both strikes meet the rendered paddle face, including ball radius and actor transforms', () => {
  for (const [player, time] of [['front', 0], ['back', PICKLEBALL_LEG_SECONDS]]) {
    const frame = samplePickleballRally(time), pose = frame.players[player], actor = PICKLEBALL_ACTORS[player];
    // Independent Three.js transform matches the actual equipment parent chain.
    const face = new Vector3(...PICKLEBALL_PADDLE_FACE_CENTER);
    face.z += PICKLEBALL_BALL_RADIUS / actor.scale;
    face.applyEuler(new Euler(...pose.wristRotation)).add(new Vector3(...pose.rightWrist));
    face.multiplyScalar(actor.scale).applyAxisAngle(new Vector3(0, 1, 0), actor.angle).add(new Vector3(...actor.position));
    assert.ok(distance(face.toArray(), frame.ball.position) < 1e-9, `${player} misses the paddle`);
  }
});

test('each return bounces on the court and clears the actual sagging net', () => {
  for (const start of [0, PICKLEBALL_LEG_SECONDS]) {
    const bounce = start + PICKLEBALL_FLIGHT_SECONDS;
    const before = samplePickleballRally(bounce - 1e-6), at = samplePickleballRally(bounce), after = samplePickleballRally(bounce + 1e-6);
    assert.ok(Math.abs(at.ball.position[1] - PICKLEBALL_COURT_Y - PICKLEBALL_BALL_RADIUS) < 1e-9);
    assert.ok(before.ball.velocity[1] < 0 && after.ball.velocity[1] > 0);
    let previous = samplePickleballRally(start).ball.position, crossings = 0;
    for (let i = 1; i <= 2000; i++) {
      const current = samplePickleballRally(start + PICKLEBALL_LEG_SECONDS * i / 2000).ball.position;
      assert.ok(current[1] >= PICKLEBALL_COURT_Y + PICKLEBALL_BALL_RADIUS - 1e-9);
      if ((previous[2] + .28) * (current[2] + .28) < 0) {
        const top = .08 + .43 - .024 * Math.max(0, 1 - ((current[0] + 1.48) / .56) ** 2);
        assert.ok(current[1] - PICKLEBALL_BALL_RADIUS > top + .025, 'ball clips net tape');
        crossings++;
      }
      previous = current;
    }
    assert.equal(crossings, 1);
  }
});

test('ball and grips remain continuous through both impacts, bounces and loop reset', () => {
  const epsilon = 1e-7;
  for (const event of [0, PICKLEBALL_FLIGHT_SECONDS, PICKLEBALL_LEG_SECONDS, PICKLEBALL_LEG_SECONDS + PICKLEBALL_FLIGHT_SECONDS, PICKLEBALL_RALLY_PERIOD]) {
    const before = samplePickleballRally(event - epsilon), after = samplePickleballRally(event + epsilon);
    assert.ok(distance(before.ball.position, after.ball.position) < 1e-5);
    for (const player of ['front', 'back']) {
      assert.ok(distance(before.players[player].rightWrist, after.players[player].rightWrist) < 1e-5);
      assert.ok(distance(before.players[player].wristRotation, after.players[player].wristRotation) < 1e-5);
    }
  }
});

test('stroke rig preserves arm lengths across the complete rally', () => {
  for (let i = 0; i < 2000; i++) {
    for (const pose of Object.values(samplePickleballRally(i / 2000 * PICKLEBALL_RALLY_PERIOD).players)) {
      const shoulderY = .785 - pose.crouch;
      assert.ok(Math.abs(distance([.145, shoulderY, 0], pose.rightElbow) - .20) < 1e-6);
      assert.ok(Math.abs(distance(pose.rightElbow, pose.rightWrist) - .185) < 1e-6);
      assert.ok(Math.abs(distance([-.145, shoulderY, 0], pose.leftElbow) - .18) < 1e-6);
      assert.ok(Math.abs(distance(pose.leftElbow, pose.leftWrist) - .17) < 1e-6);
    }
  }
});
