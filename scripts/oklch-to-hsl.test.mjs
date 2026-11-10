import assert from "node:assert/strict";
import { test } from "node:test";
import { oklchToHsl } from "./oklch-to-hsl.mjs";

function parse(triplet) {
  const m = triplet.match(/^(-?[\d.]+) ([\d.]+)% ([\d.]+)%$/);
  assert.ok(m, `not an "H S% L%" triplet: ${triplet}`);
  return m.slice(1).map(Number);
}

function assertHsl(input, [h, s, l]) {
  const [gotH, gotS, gotL] = parse(oklchToHsl(input));
  const hueDiff = Math.min(Math.abs(gotH - h), 360 - Math.abs(gotH - h));
  assert.ok(hueDiff <= 1, `${input}: hue ${gotH}, expected ${h}`);
  assert.ok(Math.abs(gotS - s) <= 1, `${input}: saturation ${gotS}, expected ${s}`);
  assert.ok(Math.abs(gotL - l) <= 1, `${input}: lightness ${gotL}, expected ${l}`);
}

test("converts white and black", () => {
  assert.equal(oklchToHsl("oklch(1.0000 0 0)"), "0 0% 100%");
  assert.equal(oklchToHsl("oklch(0 0 0)"), "0 0% 0%");
});

test("converts saturated sRGB primaries", () => {
  assertHsl("oklch(0.62796 0.25768 29.2339)", [0, 100, 50]); // #ff0000
  assertHsl("oklch(0.86644 0.29483 142.4953)", [120, 100, 50]); // #00ff00
  assertHsl("oklch(0.45201 0.31321 264.052)", [240, 100, 50]); // #0000ff
});

test("converts a mid-tone color", () => {
  assertHsl("oklch(0.6171 0.1375 39.0427)", [15.1, 55.5, 52.3]); // #c96442, checked with culori
});

test("clamps colors outside the sRGB gamut", () => {
  const [, s, l] = parse(oklchToHsl("oklch(0.9 0.4 150)"));
  assert.ok(s <= 100 && l <= 100);
});

test("rejects values that are not oklch()", () => {
  assert.throws(() => oklchToHsl("#ffffff"), /oklch/);
  assert.throws(() => oklchToHsl("oklch(0.5 0.1)"), /oklch/);
});
