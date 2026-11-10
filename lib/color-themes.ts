import { COLOR_THEMES, DEFAULT_SWATCHES } from "./color-themes.generated";

export { COLOR_THEMES, DEFAULT_SWATCHES };

export type ColorThemeId = (typeof COLOR_THEMES)[number]["id"];

// One swatch color as "H S% L%" triplets for light and dark mode.
export type Swatch = { readonly light: string; readonly dark: string };

// The selected theme is stored in the browser and applied as
// <html data-color-theme="...">. No attribute means the default theme.
export const COLOR_THEME_STORAGE_KEY = "color-theme";

export function isColorThemeId(value: unknown): value is ColorThemeId {
  return COLOR_THEMES.some((t) => t.id === value);
}

// Runs in <head> before the page paints, so a saved theme shows without a flash
// of the default colors. Unknown stored values are ignored.
export const colorThemeInitScript = `try{var t=localStorage.getItem(${JSON.stringify(
  COLOR_THEME_STORAGE_KEY,
)});if(${JSON.stringify(COLOR_THEMES.map((t) => t.id))}.indexOf(t)>-1)document.documentElement.setAttribute("data-color-theme",t)}catch(e){}`;
