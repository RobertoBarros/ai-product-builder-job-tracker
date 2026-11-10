// Returns the custom properties declared in the first `selector { ... }` block
// of a CSS string, as { name: value } without the leading "--".
export function cssVarsIn(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = css.match(new RegExp(`(?:^|[\\s}])${escaped}\\s*\\{([^}]*)\\}`));
  if (!block) throw new Error(`No CSS block found for ${selector}`);
  return Object.fromEntries(
    [...block[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim(),
    ]),
  );
}
