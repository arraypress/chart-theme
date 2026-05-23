/**
 * @arraypress/chart-theme — TypeScript definitions.
 */

/** One entry in a CSS token map. */
export interface CssTokenEntry {
  /** CSS custom property name. The leading `--` is optional. */
  prop: string;
  /** Value to use when the property isn't set or we're in SSR. */
  fallback?: string;
}

/** Map of JS keys → token descriptors. The result of
 *  `resolveCssTokens()` mirrors this shape. */
export type CssTokenMap = Record<string, CssTokenEntry>;

export interface IsLightThemeOptions {
  /** Attribute name on the root element. Default: `'data-theme'`. */
  attr?: string;
  /** Attribute value treated as "light". Default: `'light'`. */
  lightValue?: string;
  /** Element to read from. Default: `document.documentElement`. */
  target?: Element;
}

/**
 * Single-token lookup. Returns the trimmed `getPropertyValue` for
 * the CSS custom property on `<html>`, falling back to `fallback`
 * when the value is empty or we're not in a browser.
 */
export function resolveCssVar(
  prop: string,
  fallback?: string,
  target?: Element,
): string;

/**
 * Bulk lookup. Pass a map describing the tokens you want; get back
 * an object with the same keys, each holding the resolved string.
 */
export function resolveCssTokens<M extends CssTokenMap>(
  map: M,
  target?: Element,
): { [K in keyof M]: string };

/** Boolean read of the current theme attribute on `<html>`. */
export function isLightTheme(options?: IsLightThemeOptions): boolean;
