# @arraypress/chart-theme

> Resolve CSS custom properties from `<html>` into a plain JS
> object — feed your design tokens into ApexCharts, Chart.js,
> ECharts, or any library that can't read CSS variables natively.

Three composable primitives. Zero dependencies. SSR-safe.

## Install

```bash
npm install @arraypress/chart-theme
```

## Quick start

```js
import { resolveCssTokens, isLightTheme } from '@arraypress/chart-theme';

const t = resolveCssTokens({
  accent: { prop: '--color-accent', fallback: '#FFF200' },
  text:   { prop: '--color-text',   fallback: '#ededed' },
  border: { prop: '--color-border', fallback: '#242424' },
  font:   { prop: '--font-body',    fallback: 'Inter, sans-serif' },
});

// Feed into ApexCharts:
new ApexCharts(el, {
  chart:   { foreColor: t.text, fontFamily: t.font },
  colors:  [t.accent],
  grid:    { borderColor: t.border },
  tooltip: { theme: isLightTheme() ? 'light' : 'dark' },
  series:  [/* … */],
});
```

## API

### `resolveCssVar(prop, fallback?, target?)`

Single-token lookup. Returns the trimmed `getPropertyValue` for the
CSS custom property on `<html>`, falling back when empty or SSR.

```js
resolveCssVar('--color-accent', '#FFF200');
// → '#FFF200' (or the runtime value if set)

resolveCssVar('color-accent');         // leading `--` optional
resolveCssVar('--my-token', '', el);   // read from a custom element
```

### `resolveCssTokens(map, target?)`

Bulk lookup. Pass an object describing the tokens you want; get
back the same shape with resolved string values.

```js
const t = resolveCssTokens({
  accent:   { prop: '--color-accent', fallback: '#FFF200' },
  textSoft: { prop: '--color-text-soft', fallback: '#c8c8c8' },
});

t.accent;    // '#FFF200'
t.textSoft;  // '#c8c8c8'
```

JS keys are independent of CSS variable names — useful when the
property doesn't read well as a JS identifier (`--color-text-soft`
→ `textSoft`).

### `isLightTheme({ attr?, lightValue?, target? })`

Boolean read of the theme attribute on `<html>`. Defaults match the
[`@arraypress/theme-switcher-astro`](https://github.com/arraypress/theme-switcher-astro)
convention (`data-theme="light"`).

```js
isLightTheme();
// → true  if <html data-theme="light">
// → false otherwise

isLightTheme({ attr: 'data-color-mode' });          // custom attribute
isLightTheme({ lightValue: 'day' });                // custom value
isLightTheme({ target: document.body });            // custom target
```

## Recipes

### Re-resolve on theme change

ApexCharts caches its colors at init — re-resolve + re-init when
the user toggles the theme:

```js
let chart = new ApexCharts(el, buildOptions());
document.documentElement.addEventListener('themechange', () => {
  chart.destroy();
  chart = new ApexCharts(el, buildOptions());
  chart.render();
});

function buildOptions() {
  const t = resolveCssTokens({
    accent: { prop: '--color-accent', fallback: '#FFF200' },
    text:   { prop: '--color-text',   fallback: '#ededed' },
  });
  return {
    chart:   { foreColor: t.text },
    colors:  [t.accent],
    tooltip: { theme: isLightTheme() ? 'light' : 'dark' },
    series:  [/* … */],
  };
}
```

(The `themechange` CustomEvent is fired by
`@arraypress/theme-switcher-astro` on every toggle.)

### Build a typed theme object

```ts
import { resolveCssTokens, type CssTokenMap } from '@arraypress/chart-theme';

const TOKENS = {
  accent:    { prop: '--color-accent',     fallback: '#FFF200' },
  text:      { prop: '--color-text',       fallback: '#ededed' },
  textSoft:  { prop: '--color-text-soft',  fallback: '#c8c8c8' },
  border:    { prop: '--color-border',     fallback: '#242424' },
  card:      { prop: '--color-card',       fallback: '#141414' },
} satisfies CssTokenMap;

type Theme = { [K in keyof typeof TOKENS]: string };

export function getChartTheme(): Theme {
  return resolveCssTokens(TOKENS);
}
```

## SSR

Every primitive returns a sensible default when called outside a
browser (`typeof document === 'undefined'`):

- `resolveCssVar` returns the `fallback`.
- `resolveCssTokens` returns an object where each value is the
  per-entry `fallback` (or `''` when none was passed).
- `isLightTheme` returns `false`.

Safe to import + call from any module, including ones that get
evaluated during Astro / Next SSR.

## License

MIT
