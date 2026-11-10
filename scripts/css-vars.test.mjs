import assert from "node:assert/strict";
import { test } from "node:test";
import { cssVarsIn } from "./css-vars.mjs";

const css = `
@layer base {
  :root {
    --background: 0 0% 100%;
    --primary: 0 0% 9%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 0 0% 3.9%;
    --primary: 0 0% 98%;
  }
}`;

test("reads the custom properties of the block with the given selector", () => {
  assert.deepEqual(cssVarsIn(css, ":root"), {
    background: "0 0% 100%",
    primary: "0 0% 9%",
    radius: "0.5rem",
  });
  assert.deepEqual(cssVarsIn(css, ".dark"), { background: "0 0% 3.9%", primary: "0 0% 98%" });
});

test("throws when the selector has no block", () => {
  assert.throws(() => cssVarsIn(css, ".light"), /\.light/);
});
