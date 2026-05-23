/**
 * @arraypress/chart-theme
 *
 * Resolve CSS custom properties from the document root into a plain
 * JS object — feed your design tokens into chart libraries
 * (ApexCharts, Chart.js, ECharts, D3) that can't read CSS variables
 * natively.
 *
 * Three primitives, composable to taste:
 *
 *   1. `resolveCssVar(prop, fallback?)` — single-token lookup.
 *
 *   2. `resolveCssTokens(map)` — bulk lookup. Hands back the same
 *      object shape you passed in, with each entry's resolved value.
 *
 *   3. `isLightTheme(attr?)` — boolean read of the theme attribute.
 *      Lets you flip `tooltip.theme: 'light' | 'dark'` based on the
 *      live `data-theme` (or whatever attribute you use).
 *
 * All three are SSR-safe — they early-return sane defaults when
 * called server-side so the helper can sit in any module without
 * guarding `typeof window !== 'undefined'` at every call site.
 *
 * Zero dependencies. Works in Node.js, Cloudflare Workers, Deno,
 * Bun, and browsers.
 *
 * @module @arraypress/chart-theme
 */

/**
 * Single-token lookup. Returns the trimmed `getPropertyValue` for
 * the CSS custom property on `<html>`, falling back to `fallback`
 * when the value is empty or we're not in a browser.
 *
 * @param {string} prop - CSS custom property name (with or without the leading `--`).
 * @param {string} [fallback=''] - Value to use when the property isn't set.
 * @param {Element} [target] - Element to read from. Default: `document.documentElement`.
 * @returns {string}
 *
 * @example
 *   resolveCssVar('--color-accent', '#FFF200');
 *   resolveCssVar('color-accent', '#FFF200');  // leading `--` optional
 */
export function resolveCssVar(prop, fallback = '', target) {
  if (typeof document === 'undefined') return fallback;
  const el = target ?? document.documentElement;
  const propName = prop.startsWith('--') ? prop : `--${prop}`;
  const value = getComputedStyle(el).getPropertyValue(propName).trim();
  return value || fallback;
}

/**
 * @typedef {{ prop: string; fallback?: string }} CssTokenEntry
 */

/**
 * @typedef {Record<string, CssTokenEntry>} CssTokenMap
 */

/**
 * Bulk lookup. Pass an object describing the tokens you want; get
 * back an object with the same keys, each holding the resolved
 * string value.
 *
 * The shape is intentionally explicit (per-entry `prop` + `fallback`)
 * so consumers can name the JS keys however they like — handy when
 * the CSS variable name doesn't read well as a JS property
 * (e.g. `--color-text-soft` → `textSoft`).
 *
 * SSR-safe: in non-browser environments every value comes from
 * `fallback` (or empty string when none is set).
 *
 * @template {CssTokenMap} M
 * @param {M} map
 * @param {Element} [target] - Element to read from. Default: `document.documentElement`.
 * @returns {{ [K in keyof M]: string }}
 *
 * @example
 *   const tokens = resolveCssTokens({
 *     accent:   { prop: '--color-accent',   fallback: '#FFF200' },
 *     text:     { prop: '--color-text',     fallback: '#ededed' },
 *     textSoft: { prop: '--color-text-soft', fallback: '#c8c8c8' },
 *   });
 *   tokens.accent;   // '#FFF200'
 *   tokens.textSoft; // '#c8c8c8'
 */
export function resolveCssTokens(map, target) {
  const out = {};
  for (const key of Object.keys(map)) {
    const entry = map[key];
    out[key] = resolveCssVar(entry.prop, entry.fallback ?? '', target);
  }
  return out;
}

/**
 * Boolean read of the current theme attribute on `<html>`. The
 * default checks for `data-theme="light"` (the convention used by
 * `@arraypress/theme-switcher-astro` and most "default-is-dark"
 * themes). Override `attr` / `lightValue` for other patterns.
 *
 * SSR-safe: returns `false` in non-browser environments.
 *
 * @param {Object} [options]
 * @param {string} [options.attr='data-theme'] - Attribute name on the root element.
 * @param {string} [options.lightValue='light'] - Attribute value treated as "light".
 * @param {Element} [options.target] - Element to read from. Default: `document.documentElement`.
 * @returns {boolean}
 *
 * @example
 *   if (isLightTheme()) {
 *     applyChartTheme({ tooltipTheme: 'light' });
 *   }
 */
export function isLightTheme(options = {}) {
  if (typeof document === 'undefined') return false;
  const attr = options.attr ?? 'data-theme';
  const lightValue = options.lightValue ?? 'light';
  const target = options.target ?? document.documentElement;
  return target.getAttribute(attr) === lightValue;
}
