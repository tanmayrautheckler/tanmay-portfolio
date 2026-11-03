import test from "node:test";
import assert from "node:assert/strict";
import { SUPPLY_ORDERS, validSchedule, supplyTotal } from "./supply-desk-model.ts";

test("split schedule preserves ordered quantity", () => {
  const order = SUPPLY_ORDERS[0];
  assert.equal(supplyTotal(order), 60);
  assert.equal(validSchedule(order.lines), true);
  const first = order.lines[0];
  assert.equal(first.first + (first.quantity - first.first), 36);
});
test("rejects over-allocated, fractional, zero and negative first batches", () => {
  const line = SUPPLY_ORDERS[0].lines[0];
  for (const first of [37, 1.5, 0, -3, NaN]) assert.equal(validSchedule([{ ...line, first }]), false);
});
test("split requires a later date on or after first ready date", () => {
  const line = SUPPLY_ORDERS[0].lines[0];
  assert.equal(validSchedule([{ ...line, laterDate: "" }]), false);
  assert.equal(validSchedule([{ ...line, laterDate: "2026-11-11" }]), false);
  assert.equal(validSchedule([{ ...line, laterDate: line.date }]), true);
});
test("single batch requires only first ready date", () => {
  const line = SUPPLY_ORDERS[0].lines[0];
  assert.equal(validSchedule([{ ...line, first: line.quantity, laterDate: "" }]), true);
  assert.equal(validSchedule([{ ...line, date: "" }]), false);
});
