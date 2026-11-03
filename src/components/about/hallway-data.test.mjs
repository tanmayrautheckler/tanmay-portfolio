import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("./hallway-data.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { canWalk, roomAt, nearestDoor, hallwayRooms } = await import("data:text/javascript;base64," + Buffer.from(compiled).toString("base64"));

test("visitor can walk the whole hallway but cannot escape its ends or side walls", () => {
  for (let z = 4; z >= -32; z -= .2) assert.equal(canWalk({ x: 0, z }, []), true);
  for (const point of [{ x: 0, z: 4.5 }, { x: 0, z: -32.5 }, { x: 3.5, z: 1 }, { x: -3.5, z: 1 }]) {
    assert.equal(canWalk(point, [true,true,true,true,true]), false);
  }
});

test("every closed door blocks crossing; opening it provides a continuous route into the correct room", () => {
  hallwayRooms.forEach((room, index) => {
    const closed = [false,false,false,false,false];
    assert.equal(canWalk({ x: room.side * 2.9, z: room.z }, closed), false);
    assert.equal(nearestDoor({ x: room.side * 2, z: room.z }), index);
    const opened = closed.map((_, i) => i === index);
    for (let depth = 2.5; depth <= 6; depth += .05) {
      assert.equal(canWalk({ x: room.side * depth, z: room.z }, opened), true, room.name);
    }
    assert.equal(roomAt({ x: room.side * 6, z: room.z }), index);
  });
});

test("opening a door does not permit walking through surrounding walls or furniture", () => {
  const opened = [true,true,true,true,true];
  for (const room of hallwayRooms) {
    assert.equal(canWalk({ x: room.side * 2.9, z: room.z + 1.3 }, opened), false);
    assert.equal(canWalk({ x: room.side * 11, z: room.z }, opened), false);
    assert.equal(canWalk({ x: room.side * 7.8, z: room.z - .7 }, opened), false);
  }
  assert.equal(nearestDoor({ x: 0, z: 4 }), null);
  assert.equal(roomAt({ x: 0, z: -10 }), null);
});

test("rooftop stays locked until all keepsakes are collected, then has a continuous bounded entrance", () => {
  assert.equal(canWalk({x:0,z:-33}, [], false), false);
  for(let z=-31.5;z>-42.5;z-=.1)assert.equal(canWalk({x:0,z}, [], true), true);
  assert.equal(canWalk({x:1.3,z:-33}, [], true), false);
  assert.equal(canWalk({x:5.6,z:-38}, [], true), false);
  assert.equal(canWalk({x:0,z:-42.7}, [], true), false);
});
