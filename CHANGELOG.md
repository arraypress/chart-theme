# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] — Unreleased

### Initial Release

- `resolveCssVar(prop, fallback?, target?)` — single-token lookup.
  Trims whitespace, accepts the prop name with or without the
  leading `--`, falls back when the value is empty or we're SSR.
- `resolveCssTokens(map, target?)` — bulk lookup. Pass an object
  describing the tokens you want; get back the same shape with
  resolved values.
- `isLightTheme({ attr?, lightValue?, target? })` — boolean read of
  the theme attribute on `<html>`. Default `'data-theme' === 'light'`
  matches the `@arraypress/theme-switcher-astro` convention.
- All three are SSR-safe — return sensible defaults when called
  outside a browser.

17 tests passing under jsdom. Zero runtime dependencies.
