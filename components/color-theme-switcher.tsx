"use client";

import { useEffect, useState } from "react";
import { Laptop, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  COLOR_THEMES,
  COLOR_THEME_STORAGE_KEY,
  DEFAULT_SWATCHES,
  isColorThemeId,
  type ColorThemeId,
  type Swatch,
} from "@/lib/color-themes";

const DEFAULT = "default";
type Selection = ColorThemeId | typeof DEFAULT;

function applyTheme(selection: Selection) {
  const root = document.documentElement;
  if (selection === DEFAULT) root.removeAttribute("data-color-theme");
  else root.setAttribute("data-color-theme", selection);
  try {
    if (selection === DEFAULT) localStorage.removeItem(COLOR_THEME_STORAGE_KEY);
    else localStorage.setItem(COLOR_THEME_STORAGE_KEY, selection);
  } catch {
    // Storage blocked (e.g. private mode): the theme still applies for this page view.
  }
}

declare module "react" {
  interface CSSProperties {
    "--swatch-light"?: string;
    "--swatch-dark"?: string;
  }
}

// Background, primary, secondary and accent of a theme, in the current light/dark mode.
function Swatches({ colors }: { colors: readonly Swatch[] }) {
  return (
    <span className="ml-auto flex gap-0.5 pl-4" aria-hidden>
      {colors.map((c, i) => (
        <span
          key={i}
          className="size-3.5 rounded-sm border border-foreground/20 bg-[hsl(var(--swatch-light))] dark:bg-[hsl(var(--swatch-dark))]"
          style={{ "--swatch-light": c.light, "--swatch-dark": c.dark }}
        />
      ))}
    </span>
  );
}

const MODES = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Laptop },
] as const;

export function ColorThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  // null until mounted: the saved theme is only known in the browser.
  const [selected, setSelected] = useState<Selection | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-color-theme");
    setSelected(isColorThemeId(current) ? current : DEFAULT);
  }, []);

  if (selected === null) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Theme">
          <Palette size={16} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel>Mode</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {MODES.map(({ value, label, Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              {label}
              <span className="ml-auto pl-4" aria-hidden>
                <Icon size={16} className="text-muted-foreground" />
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Color theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selected}
          onValueChange={(value) => {
            const next = isColorThemeId(value) ? value : DEFAULT;
            applyTheme(next);
            setSelected(next);
          }}
        >
          <DropdownMenuRadioItem value={DEFAULT}>
            Default
            <Swatches colors={DEFAULT_SWATCHES} />
          </DropdownMenuRadioItem>
          {COLOR_THEMES.map((t) => (
            <DropdownMenuRadioItem key={t.id} value={t.id}>
              {t.label}
              <Swatches colors={t.swatches} />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
