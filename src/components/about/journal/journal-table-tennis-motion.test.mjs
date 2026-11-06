import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3, Euler} from 'three';
import {
  sampleTableTennisRally, TABLE_TENNIS_ACTORS, TABLE_TENNIS_BALL_RADIUS,
  TABLE_TENNIS_PADDLE_FACE_CENTER, TABLE_TENNIS_FLIGHT_SECONDS,
  TABLE_TENNIS_LEG_SECONDS, TABLE_TENNIS_RALLY_PERIOD,
} from './journal-table-tennis-motion.ts';

const distance = (a, b) => Math.hypot(...a.map((value, i) => value - b[i]));

test('table tennis contacts meet the actual small rubber face under both actor transforms', () => {
  for (const [player, time] of [['front', 0], ['back', TABLE_TENNIS_LEG_SECONDS]]) {
    const frame = sampleTableTennisRally(time), pose = frame.players[player], actor = TABLE_TENNIS_ACTORS[player];
    const contact = new Vector3(...TABLE_TENNIS_PADDLE_FACE_CENTER);
    contact.z += TABLE_TENNIS_BALL_RADIUS / actor.scale;
    contact.applyEuler(new Euler(...pose.wristRotation)).add(new Vector3(...pose.rightWrist));
    contact.multiplyScalar(actor.scale).applyAxisAngle(new Vector3(0, 1, 0), actor.angle).add(new Vector3(...actor.position));
    assert.ok(distance(contact.toArray(), frame.ball.position) < 1e-9, `${player} misses the rubber face`);
  }
});

test('normal table tennis returns bounce once on the receiver half and clear the net', () => {
  for (const [leg, start] of [[0, 0], [1, TABLE_TENNIS_LEG_SECONDS]]) {
    const time = start + TABLE_TENNIS_FLIGHT_SECONDS, bounce = sampleTableTennisRally(time).ball.position;
    assert.ok(Math.abs(bounce[1] - .453) < 1e-9);
    assert.ok(bounce[0] >= -2.69 && bounce[0] <= -2.17);
    assert.ok(bounce[2] >= -.905 && bounce[2] <= .045);
    assert.ok(leg === 0 ? bounce[2] < -.43 : bounce[2] > -.43, 'bounce lands on the wrong half');
    assert.ok(sampleTableTennisRally(time - 1e-6).ball.velocity[1] < 0);
    assert.ok(sampleTableTennisRally(time + 1e-6).ball.velocity[1] > 0);
    let previous = sampleTableTennisRally(start).ball.position, crossings = 0;
    for (let i = 1; i <= 1500; i++) {
      const current = sampleTableTennisRally(start + TABLE_TENNIS_LEG_SECONDS * i / 1500).ball.position;
      assert.ok(current[1] >= .441 + TABLE_TENNIS_BALL_RADIUS - 1e-9);
      if ((previous[2] + .43) * (current[2] + .43) < 0) {
        assert.ok(current[1] - TABLE_TENNIS_BALL_RADIUS > .5145 + .02, 'ball clips net tape');
        crossings++;
      }
      previous = current;
    }
    assert.equal(crossings, 1);
  }
});

test('table tennis ball and grips do not jump at impact, bounce or loop boundaries', () => {
  for (const event of [0, TABLE_TENNIS_FLIGHT_SECONDS, TABLE_TENNIS_LEG_SECONDS, TABLE_TENNIS_LEG_SECONDS + TABLE_TENNIS_FLIGHT_SECONDS, TABLE_TENNIS_RALLY_PERIOD]) {
    const before = sampleTableTennisRally(event - 1e-7), after = sampleTableTennisRally(event + 1e-7);
    assert.ok(distance(before.ball.position, after.ball.position) < 1e-5);
    for (const player of ['front', 'back']) {
      assert.ok(distance(before.players[player].rightWrist, after.players[player].rightWrist) < 1e-5);
      assert.ok(distance(before.players[player].wristRotation, after.players[player].wristRotation) < 1e-5);
    }
  }
});

test('table tennis forehands preserve arm lengths throughout the exchange', () => {
  for (let i = 0; i < 1500; i++) {
    for (const pose of Object.values(sampleTableTennisRally(i / 1500 * TABLE_TENNIS_RALLY_PERIOD).players)) {
      const shoulderY = .785 - pose.crouch;
      assert.ok(Math.abs(distance([.145, shoulderY, 0], pose.rightElbow) - .20) < 1e-6);
      assert.ok(Math.abs(distance(pose.rightElbow, pose.rightWrist) - .185) < 1e-6);
      assert.ok(Math.abs(distance([-.145, shoulderY, 0], pose.leftElbow) - .18) < 1e-6);
      assert.ok(Math.abs(distance(pose.leftElbow, pose.leftWrist) - .17) < 1e-6);
    }
  }
});
