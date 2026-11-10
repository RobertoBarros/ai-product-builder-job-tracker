// Converts a CSS "oklch(L C H)" color into the "H S% L%" triplet that
// tailwind.config.ts expects inside hsl(var(--name)).
// Colors outside the sRGB gamut are clipped to the nearest sRGB channel values.

const OKLCH = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/;

const round1 = (n) => String(Math.round(n * 10) / 10);

function toSrgbChannel(linear) {
  const c = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
  return Math.min(1, Math.max(0, c));
}

export function oklchToHsl(value) {
  const m = value.trim().match(OKLCH);
  if (!m) throw new Error(`Expected an oklch(L C H) color, got: ${value}`);
  const [L, C, H] = m.slice(1).map(Number);

  // OKLCH -> OKLab -> linear sRGB (Björn Ottosson's reference matrices).
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const r = toSrgbChannel(4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s);
  const g = toSrgbChannel(-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s);
  const bl = toSrgbChannel(-0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s);

  // sRGB -> HSL.
  const max = Math.max(r, g, bl);
  const min = Math.min(r, g, bl);
  const light = (max + min) / 2;
  const delta = max - min;
  if (delta < 1e-6) return `0 0% ${round1(light * 100)}%`;

  const sat = delta / (1 - Math.abs(2 * light - 1));
  let hue;
  if (max === r) hue = ((g - bl) / delta) % 6;
  else if (max === g) hue = (bl - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  hue = (hue * 60 + 360) % 360;

  return `${round1(hue)} ${round1(sat * 100)}% ${round1(light * 100)}%`;
}
