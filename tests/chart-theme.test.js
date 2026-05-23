import { describe, it, expect, beforeEach } from 'vitest';
import {
  resolveCssVar,
  resolveCssTokens,
  isLightTheme,
} from '../src/index.js';

/** Set CSS custom properties on <html> so the resolver finds them. */
function setVars(vars) {
  for (const [prop, value] of Object.entries(vars)) {
    document.documentElement.style.setProperty(
      prop.startsWith('--') ? prop : `--${prop}`,
      value,
    );
  }
}

describe('resolveCssVar', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style');
    document.documentElement.removeAttribute('data-theme');
  });

  it('returns the value when the property is set', () => {
    setVars({ '--color-accent': '#FF6600' });
    expect(resolveCssVar('--color-accent')).toBe('#FF6600');
  });

  it('returns the fallback when the property is empty', () => {
    expect(resolveCssVar('--color-missing', '#000000')).toBe('#000000');
  });

  it('returns empty string when no fallback + property missing', () => {
    expect(resolveCssVar('--color-missing')).toBe('');
  });

  it('accepts the prop name without the leading --', () => {
    setVars({ '--color-accent': '#FF6600' });
    expect(resolveCssVar('color-accent')).toBe('#FF6600');
  });

  it('trims whitespace from the resolved value', () => {
    setVars({ '--color-accent': '  #FF6600  ' });
    expect(resolveCssVar('--color-accent')).toBe('#FF6600');
  });

  it('reads from a custom target element', () => {
    const div = document.createElement('div');
    div.style.setProperty('--my-token', '#ABC');
    document.body.appendChild(div);
    expect(resolveCssVar('--my-token', '', div)).toBe('#ABC');
  });
});

describe('resolveCssTokens', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style');
  });

  it('returns the same keys with resolved values', () => {
    setVars({
      '--color-accent': '#FFF200',
      '--color-text':   '#EDEDED',
    });
    const tokens = resolveCssTokens({
      accent: { prop: '--color-accent', fallback: '#000' },
      text:   { prop: '--color-text',   fallback: '#000' },
    });
    expect(tokens.accent).toBe('#FFF200');
    expect(tokens.text).toBe('#EDEDED');
  });

  it('uses fallbacks for missing props', () => {
    const tokens = resolveCssTokens({
      accent: { prop: '--color-accent', fallback: '#FFF200' },
      missing: { prop: '--nope', fallback: '#DEFA00' },
    });
    expect(tokens.accent).toBe('#FFF200');
    expect(tokens.missing).toBe('#DEFA00');
  });

  it('mixes resolved + fallback values per-entry', () => {
    setVars({ '--color-text': '#FFFFFF' });
    const tokens = resolveCssTokens({
      text: { prop: '--color-text', fallback: '#000' },
      bg:   { prop: '--color-bg',   fallback: '#111' },
    });
    expect(tokens).toEqual({ text: '#FFFFFF', bg: '#111' });
  });

  it('returns empty strings when no fallback + no value', () => {
    const tokens = resolveCssTokens({
      a: { prop: '--missing-a' },
      b: { prop: '--missing-b', fallback: 'present' },
    });
    expect(tokens.a).toBe('');
    expect(tokens.b).toBe('present');
  });
});

describe('isLightTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('returns false by default (no attribute set)', () => {
    expect(isLightTheme()).toBe(false);
  });

  it('returns true when data-theme="light"', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    expect(isLightTheme()).toBe(true);
  });

  it('honours a custom attribute name', () => {
    document.documentElement.setAttribute('data-color-mode', 'light');
    expect(isLightTheme({ attr: 'data-color-mode' })).toBe(true);
  });

  it('honours a custom light value', () => {
    document.documentElement.setAttribute('data-theme', 'day');
    expect(isLightTheme({ lightValue: 'day' })).toBe(true);
    expect(isLightTheme({ lightValue: 'light' })).toBe(false);
  });

  it('reads from a custom target', () => {
    const div = document.createElement('div');
    div.setAttribute('data-theme', 'light');
    document.body.appendChild(div);
    expect(isLightTheme({ target: div })).toBe(true);
  });
});

describe('SSR safety', () => {
  it('resolveCssVar returns fallback when document is undefined', () => {
    /* Simulate SSR by passing through globalThis and deleting document.
     * vitest+jsdom restores document after the test. */
    const real = globalThis.document;
    // eslint-disable-next-line no-global-assign
    delete globalThis.document;
    try {
      expect(resolveCssVar('--color-accent', '#FFF200')).toBe('#FFF200');
    } finally {
      globalThis.document = real;
    }
  });

  it('isLightTheme returns false when document is undefined', () => {
    const real = globalThis.document;
    delete globalThis.document;
    try {
      expect(isLightTheme()).toBe(false);
    } finally {
      globalThis.document = real;
    }
  });
});
