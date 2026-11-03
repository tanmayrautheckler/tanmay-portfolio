import assert from "node:assert/strict";
import test from "node:test";
import { resolveShot } from "./penalty-game.ts";

test("a well-powered shot away from the keeper scores on either side", () => {
  assert.equal(resolveShot(85, -60, 70), "goal");
  assert.equal(resolveShot(-85, 60, 70), "goal");
});
test("keeper catches shots within reach, including boundary", () => {
  assert.equal(resolveShot(20, 0, 70), "saved");
  assert.equal(resolveShot(21, 0, 70), "saved");
  assert.equal(resolveShot(22, 0, 70), "goal");
});
test("weak shots allow recovery and excess power clears the bar", () => {
  assert.equal(resolveShot(85, -80, 34), "saved");
  assert.equal(resolveShot(85, -80, 91), "over");
  assert.equal(resolveShot(85, -80, 90), "goal");
});
test("slower shots give keeper more reach", () => {
  assert.equal(resolveShot(30, 0, 45), "saved");
  assert.equal(resolveShot(30, 0, 70), "goal");
});
