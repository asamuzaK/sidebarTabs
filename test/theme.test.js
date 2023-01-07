/**
 * theme.test.js
 */

/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom } from './mocha/setup.js';
import { fileURLToPath } from 'url';
import { promises as fsPromise } from 'fs';
import path from 'path';
import { sleep } from '../src/mjs/common.js';
import { convertColorToHex } from '../src/mjs/color.js';
import {
  CLASS_COMPACT, CLASS_NARROW, CLASS_NARROW_TAB_GROUP, CLASS_SEPARATOR_SHOW,
  CLASS_THEME_CUSTOM, CLASS_THEME_DARK, CLASS_THEME_LIGHT, CLASS_THEME_SYSTEM,
  CSS_ROOT, CSS_VAR_BG, CSS_VAR_COLOR, CSS_VAR_FONT_ACTIVE,
  CUSTOM_BG, CUSTOM_BG_ACTIVE, CUSTOM_BG_DISCARDED, CUSTOM_BG_FIELD,
  CUSTOM_BG_FIELD_ACTIVE, CUSTOM_BG_FRAME, CUSTOM_BG_HOVER,
  CUSTOM_BG_HOVER_SHADOW, CUSTOM_BG_SELECT, CUSTOM_BG_SELECT_HOVER,
  CUSTOM_BORDER_ACTIVE, CUSTOM_BORDER_FIELD, CUSTOM_BORDER_FIELD_ACTIVE,
  CUSTOM_COLOR, CUSTOM_COLOR_ACTIVE, CUSTOM_COLOR_DISCARDED,
  CUSTOM_COLOR_FIELD, CUSTOM_COLOR_FIELD_ACTIVE, CUSTOM_COLOR_FRAME,
  CUSTOM_COLOR_HOVER, CUSTOM_COLOR_SELECT, CUSTOM_COLOR_SELECT_HOVER,
  CUSTOM_HEADING_TEXT_GROUP_1, CUSTOM_HEADING_TEXT_GROUP_2,
  CUSTOM_HEADING_TEXT_GROUP_3, CUSTOM_HEADING_TEXT_GROUP_4,
  CUSTOM_HEADING_TEXT_PINNED, CUSTOM_OUTLINE_FOCUS,
  NEW_TAB, NEW_TAB_SEPARATOR_SHOW, TAB,
  THEME, THEME_ALPEN, THEME_ALPEN_DARK, THEME_ALPEN_ID, THEME_AUTO,
  THEME_CURRENT, THEME_CURRENT_ID, THEME_CUSTOM, THEME_CUSTOM_DARK,
  THEME_CUSTOM_ID, THEME_CUSTOM_LIGHT, THEME_CUSTOM_SETTING, THEME_DARK,
  THEME_DARK_ID, THEME_LIGHT, THEME_LIGHT_ID, THEME_SYSTEM, THEME_SYSTEM_ID,
  THEME_UI_SCROLLBAR_NARROW, THEME_UI_TAB_COMPACT, THEME_UI_TAB_GROUP_NARROW,
  USER_CSS_ID
} from '../src/mjs/constant.js';

/* test */
import * as mjs from '../src/mjs/theme.js';

describe('theme', () => {
  const globalKeys = ['CSSStyleSheet'];
  let window, document;
  beforeEach(() => {
    const dom = createJsdom();
    window = dom && dom.window;
    document = window && window.document;
    browser._sandbox.reset();
    browser.permissions.contains.resolves(true);
    global.browser = browser;
    global.window = window;
    global.document = document;
    for (const key of globalKeys) {
      // mock CSSStyleSheet
      if (key === 'CSSStyleSheet') {
        global[key] = class CSSStyleSheet extends window.StyleSheet {
          #cssRules;
          constructor() {
            super();
            this.#cssRules = new Set();
          }

          get cssRules() {
            return Array.from(this.#cssRules);
          }

          replaceSync(str) {
            if (/{\s*.*\s*}/.test(str)) {
              const arr = str.replace(/\n/g, '').trim().split('}');
              for (let i of arr) {
                i = i.trim();
                if (i) {
                  let textEnd;
                  if (i.endsWith(';') || i.endsWith('{')) {
                    textEnd = '';
                  } else {
                    textEnd = ';';
                  }
                  const [, styleText] = /{\s*(.*)\s*$/.exec(i);
                  let styleTextEnd;
                  if (!styleText || styleText.endsWith(';')) {
                    styleTextEnd = '';
                  } else {
                    styleTextEnd = ';';
                  }
                  this.#cssRules.add({
                    cssText: `${i}${textEnd} }`.trim(),
                    style: {
                      cssText: `${styleText}${styleTextEnd}`.trim()
                    }
                  });
                }
              }
            }
          }

          async replace(str) {
            await this.replaceSync(str);
            return this;
          }
        };
      }
    }
  });
  afterEach(() => {
    window = null;
    document = null;
    delete global.browser;
    delete global.window;
    delete global.document;
    for (const key of globalKeys) {
      delete global[key];
    }
    browser._sandbox.reset();
  });

  it('should get browser object', () => {
    assert.isObject(browser, 'browser');
  });

  describe('theme map', () => {
    it('should get object', async () => {
      assert.isObject(mjs.themeMap, 'mjs.themeMap');
    });
  });

  describe('current theme colors', () => {
    it('should get map', async () => {
      assert.instanceOf(mjs.currentThemeColors, Map, 'currentThemeColors');
    });
  });

  describe('current theme', () => {
    it('should get map', async () => {
      assert.instanceOf(mjs.currentTheme, Map, 'currentTheme');
    });
  });

  describe('get theme ID', () => {
    const func = mjs.getThemeId;

    it('should get null', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves(null);
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get value', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      const res = await func();
      assert.strictEqual(res, 'foo', 'result');
    });

    it('should get value', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_ALPEN_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      const res = await func();
      assert.strictEqual(res, THEME_ALPEN_ID, 'result');
    });

    it('should get value', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_DARK_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      const res = await func();
      assert.strictEqual(res, THEME_DARK_ID, 'result');
    });

    it('should get value', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_LIGHT_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      const res = await func();
      assert.strictEqual(res, THEME_LIGHT_ID, 'result');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      const res = await func();
      assert.strictEqual(res, THEME_SYSTEM_ID, 'result');
    });
  });

  describe('set current theme colors map', () => {
    const func = mjs.setCurrentThemeColors;
    beforeEach(() => {
      mjs.currentThemeColors.clear();
    });
    afterEach(() => {
      mjs.currentThemeColors.clear();
    });

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'message');
      });
    });

    it('should throw', async () => {
      await func('foo').catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message,
          'Expected Array or String but got Undefined.',
          'message');
      });
    });

    it('should throw', async () => {
      await func('foo', []).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'Expected array length of 3 or 4 but got 0.',
          'message');
      });
    });

    it('should throw', async () => {
      await func('foo', [128, 128, -1]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '-1 is not between 0 and 255.',
          'message');
      });
    });

    it('should throw', async () => {
      await func('foo', [128, 128, 256]).catch(e => {
        assert.instanceOf(e, RangeError, 'error');
        assert.strictEqual(e.message, '256 is not between 0 and 255.',
          'message');
      });
    });

    it('should not set map if 2nd arg is not a color', async () => {
      await func('foo', 'bar');
      assert.strictEqual(mjs.currentThemeColors.size, 0, 'size');
    });

    it('should set map', async () => {
      await func('foo', '#1234AB');
      await func('bar', '#FF1234');
      await func('baz', 'transparent');
      await func('qux', 'currentColor');
      await func('quux', 'color-mix(in srgb, currentcolor, red)');
      await func('corge', 'foobar');
      await func('grault', [128, 0, 255]);
      await func('garply', ' ');
      await func(' ', 'red');
      assert.strictEqual(mjs.currentThemeColors.size, 6, 'size');
      assert.strictEqual(mjs.currentThemeColors.get('foo'), '#1234ab', 'map');
      assert.strictEqual(mjs.currentThemeColors.get('bar'), '#ff1234', 'map');
      assert.strictEqual(mjs.currentThemeColors.get('baz'), 'transparent',
        'map');
      assert.strictEqual(mjs.currentThemeColors.get('qux'), 'currentColor',
        'map');
      assert.strictEqual(mjs.currentThemeColors.get('quux'),
        'color-mix(in srgb, currentcolor, red)', 'map');
      assert.isFalse(mjs.currentThemeColors.has('corge'), 'map');
      assert.strictEqual(mjs.currentThemeColors.get('grault'), '#8000ff',
        'map');
      assert.isFalse(mjs.currentThemeColors.has('garply'), 'map');
      assert.isFalse(mjs.currentThemeColors.has(''), 'map');
      assert.isFalse(mjs.currentThemeColors.has(' '), 'map');
    });
  });

  describe('get current theme base values', () => {
    const func = mjs.getCurrentThemeBaseValues;
    beforeEach(() => {
      mjs.currentThemeColors.clear();
    });
    afterEach(() => {
      mjs.currentThemeColors.clear();
    });

    it('should throw', async () => {
      mjs.currentThemeColors.set('tab_line', 'foo');
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Null.',
          'message');
      });
    });

    it('should get values', async () => {
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('accentcolor', '#ff0000');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('textcolor', '#ff0000');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('bookmark_text', '#ff0000');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('frame', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED ||
            key === CUSTOM_BG_FRAME) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#e70203', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#e7e7e8', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      mjs.currentThemeColors.set('frame', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_DARK];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_DARK], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED ||
            key === CUSTOM_BG_FRAME) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#fe1919', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#55545f', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('frame', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED ||
            key === CUSTOM_BG_FRAME || key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#e7e7e8', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      mjs.currentThemeColors.set('frame', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_DARK];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_DARK], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED ||
            key === CUSTOM_BG_FRAME || key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#f9f9fa', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#55545f', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('frame', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED ||
            key === CUSTOM_BG_FRAME) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#7e0b0e', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#e7e7e8', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      mjs.currentThemeColors
        .set('frame', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_DARK];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_DARK], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED ||
            key === CUSTOM_BG_FRAME) {
          assert.strictEqual(value, '#fc7d7d', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#fc8a8a', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#55545f', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('sidebar', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#e70203', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#e7e7e8', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      mjs.currentThemeColors.set('sidebar', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_DARK];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_DARK], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#fe1919', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#55545f', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('sidebar', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_HOVER ||
            key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#e7e7e8', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      mjs.currentThemeColors.set('sidebar', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_DARK];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_DARK], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED ||
            key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#f9f9fa', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#55545f', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('sidebar', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#7e0b0e', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#e7e7e8', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      mjs.currentThemeColors
        .set('sidebar', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_DARK];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_DARK], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, '#fc7d7d', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#fc8a8a', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#55545f', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('sidebar_highlight', '#ff0000');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('sidebar_highlight_text', '#ff0000');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('sidebar_highlight_text', '#0000ff');
      mjs.currentThemeColors.set('sidebar_highlight', '#ff0000');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('sidebar_highlight_text', 'currentColor');
      mjs.currentThemeColors.set('sidebar_highlight', '#ff0000');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('sidebar_highlight_text', '#0000ff');
      mjs.currentThemeColors.set('sidebar_highlight', 'currentColor');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors
        .set('sidebar_highlight_text', 'color-mix(in srgb, currentColor, red)');
      mjs.currentThemeColors.set('sidebar_highlight', '#ff0000');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('sidebar_highlight_text', '#0000ff');
      mjs.currentThemeColors
        .set('sidebar_highlight', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values if sidebar is not set', async () => {
      mjs.currentThemeColors.set('sidebar_text', '#ff0000');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('sidebar', '#0000ff');
      mjs.currentThemeColors.set('sidebar_text', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else if (key === CUSTOM_BG_HOVER_SHADOW) {
          assert.strictEqual(value, '#ff00001a', `${key}`);
        } else if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, '#0000ff', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#1a00e5', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#e7e7e8', `${key}`);
        } else if (key === CUSTOM_COLOR_HOVER) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else if (key === CUSTOM_COLOR_SELECT_HOVER) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_1) {
          assert.strictEqual(value, '#e03d1f', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_2) {
          assert.strictEqual(value, '#855c3d', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_3) {
          assert.strictEqual(value, '#e03d5c', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_4) {
          assert.strictEqual(value, '#a35c7a', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_PINNED) {
          assert.strictEqual(value, '#a33d5c', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('sidebar', '#0000ff');
      mjs.currentThemeColors.set('sidebar_text', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, '#0000ff', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#0202e8', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#e7e7e8', `${key}`);
        } else if (key === CUSTOM_COLOR_HOVER) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else if (key === CUSTOM_COLOR_SELECT_HOVER) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_1) {
          assert.strictEqual(value, '#834529', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_2) {
          assert.strictEqual(value, '#276448', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_3) {
          assert.strictEqual(value, '#834566', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_4) {
          assert.strictEqual(value, '#466485', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_PINNED) {
          assert.strictEqual(value, '#464566', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('sidebar', '#0000ff');
      mjs.currentThemeColors
        .set('sidebar_text', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, '#0000ff', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#0e01e6', `${key}`);
        } else if (key === CUSTOM_BG_HOVER_SHADOW) {
          assert.strictEqual(value, '#8a0a0d1a', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#e7e7e8', `${key}`);
        } else if (key === CUSTOM_COLOR_HOVER) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else if (key === CUSTOM_COLOR_SELECT_HOVER) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_1) {
          assert.strictEqual(value, '#b24124', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_2) {
          assert.strictEqual(value, '#566042', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_3) {
          assert.strictEqual(value, '#b24161', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_4) {
          assert.strictEqual(value, '#746080', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_PINNED) {
          assert.strictEqual(value, '#744161', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('tab_background_separator', '#ff0000');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_background_text', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
            key === CUSTOM_COLOR_ACTIVE || key === CUSTOM_COLOR_FRAME) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else if (key === CUSTOM_BG_HOVER_SHADOW) {
          assert.strictEqual(value, '#ff00001a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_background_text', 'currentColor');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('tab_background_text', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
            key === CUSTOM_COLOR_ACTIVE || key === CUSTOM_COLOR_FRAME) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else if (key === CUSTOM_BG_HOVER_SHADOW) {
          assert.strictEqual(value, '#8a0a0d1a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_line', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_ACTIVE) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_line', 'transparent');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_line', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_ACTIVE) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('tab_line', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_ACTIVE) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('tab_line', 'color-mix(in srgb, blue, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_ACTIVE) {
          assert.strictEqual(value, '#800080', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_border', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_FIELD) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_border', 'transparent');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_border', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_FIELD) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('toolbar_field_border', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_FIELD) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('toolbar_field_border', 'color-mix(in srgb, blue, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_FIELD) {
          assert.strictEqual(value, '#800080', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_border_focus', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_FIELD_ACTIVE) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else if (key === CUSTOM_OUTLINE_FOCUS) {
          assert.strictEqual(value, '#ff000066', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_border_focus', 'transparent');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_FIELD_ACTIVE) {
          assert.strictEqual(value, '#f0f0f4', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_border_focus', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_FIELD_ACTIVE) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else if (key === CUSTOM_OUTLINE_FOCUS) {
          assert.strictEqual(value, '#15141a66', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('toolbar_field_border_focus', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_FIELD_ACTIVE) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else if (key === CUSTOM_OUTLINE_FOCUS) {
          assert.strictEqual(value, '#8a0a0d66', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('toolbar_field_border_focus', 'color-mix(in srgb, blue, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_FIELD_ACTIVE) {
          assert.strictEqual(value, '#800080', `${key}`);
        } else if (key === CUSTOM_OUTLINE_FOCUS) {
          assert.strictEqual(value, '#80008066', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_selected', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_ACTIVE || key === CUSTOM_BG_SELECT) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_selected', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_ACTIVE || key === CUSTOM_BG_SELECT) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('tab_selected', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_ACTIVE || key === CUSTOM_BG_SELECT) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_FIELD) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_FIELD) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('toolbar_field', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_FIELD) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_focus', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_FIELD_ACTIVE) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_focus', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_FIELD_ACTIVE) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('toolbar_field_focus', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_FIELD_ACTIVE) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_text', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR_ACTIVE || key === CUSTOM_COLOR_SELECT ||
            key === CUSTOM_BORDER_ACTIVE) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_text', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_ACTIVE) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('tab_text', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_ACTIVE || key === CUSTOM_COLOR_ACTIVE ||
            key === CUSTOM_COLOR_SELECT) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_text', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR_FIELD) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_text', 'currentColor');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('toolbar_field_text', 'color-mix(in srgb, currentColor, red)');
      const res = func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR_FIELD) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_text_focus', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR_FIELD_ACTIVE) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_text_focus', 'currentColor');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('toolbar_field_text_focus', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR_FIELD_ACTIVE) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('focus_outline', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_OUTLINE_FOCUS) {
          assert.strictEqual(value, '#ff000066', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('focus_outline', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_OUTLINE_FOCUS) {
          assert.strictEqual(value, '#15141a66', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('focus_outline', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_OUTLINE_FOCUS) {
          assert.strictEqual(value, '#8a0a0d66', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('focus_outline', 'color-mix(in srgb, blue, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_OUTLINE_FOCUS) {
          assert.strictEqual(value, '#80008066', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('focus_outline', 'transparent');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('button_primary', '#ff0000');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_OUTLINE_FOCUS) {
          assert.strictEqual(value, '#ff000066', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('button_primary', 'currentColor');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_OUTLINE_FOCUS) {
          assert.strictEqual(value, '#15141a66', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('button_primary', 'color-mix(in srgb, currentColor, red)');
      const res = await func();
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_OUTLINE_FOCUS) {
          assert.strictEqual(value, '#8a0a0d66', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('button_primary', 'transparent');
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      const res = await func({
        useFrame: true
      });
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, obj[CUSTOM_BG_FRAME], `${key}`);
        } else if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
                   key === CUSTOM_COLOR_HOVER) {
          assert.strictEqual(value, obj[CUSTOM_COLOR_FRAME], `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      const res = await func({
        useFrame: true
      });
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, obj[CUSTOM_BG_FRAME], `${key}`);
        } else if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
                   key === CUSTOM_COLOR_HOVER) {
          assert.strictEqual(value, obj[CUSTOM_COLOR_FRAME], `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('frame', 'currentColor');
      const res = await func({
        useFrame: true
      });
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED ||
            key === CUSTOM_BG_FRAME || key === CUSTOM_BG_HOVER ||
            key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
            key === CUSTOM_COLOR_HOVER) {
          assert.strictEqual(value, obj[CUSTOM_COLOR_FRAME], `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('frame', 'color-mix(in srgb, currentColor, red)');
      const res = await func({
        useFrame: true
      });
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED ||
            key === CUSTOM_BG_FRAME) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
                   key === CUSTOM_COLOR_HOVER) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#7e0b0e', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_background_text', 'currentColor');
      const res = await func({
        useFrame: true
      });
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, obj[CUSTOM_BG_FRAME], `${key}`);
        } else if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
                   key === CUSTOM_COLOR_HOVER) {
          assert.strictEqual(value, obj[CUSTOM_COLOR_FRAME], `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('tab_background_text', 'color-mix(in srgb, currentColor, red)');
      const res = await func({
        useFrame: true
      });
      const obj = mjs.themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, '#f0f0f4', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#e6d9dc', `${key}`);
        } else if (key === CUSTOM_BG_HOVER_SHADOW) {
          assert.strictEqual(value, '#8a0a0d1a', `${key}`);
        } else if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
                   key === CUSTOM_COLOR_HOVER || key === CUSTOM_COLOR_ACTIVE ||
                   key === CUSTOM_COLOR_FRAME) {
          assert.strictEqual(value, '#8a0a0d', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_1) {
          assert.strictEqual(value, '#b24124', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_2) {
          assert.strictEqual(value, '#566042', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_3) {
          assert.strictEqual(value, '#b24161', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_4) {
          assert.strictEqual(value, '#746080', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_PINNED) {
          assert.strictEqual(value, '#744161', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      const res = await func({
        useFrame: true
      });
      const obj = mjs.themeMap[THEME_DARK];
      const items = Object.entries(res);
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, obj[CUSTOM_BG_FRAME], `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#333238', `${key}`);
        } else if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
                   key === CUSTOM_COLOR_HOVER) {
          assert.strictEqual(value, obj[CUSTOM_COLOR_FRAME], `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_1) {
          assert.strictEqual(value, '#dfa284', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_2) {
          assert.strictEqual(value, '#83c0a3', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_3) {
          assert.strictEqual(value, '#dfa2c1', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_4) {
          assert.strictEqual(value, '#a2c0e0', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_PINNED) {
          assert.strictEqual(value, '#a2a2c1', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('frame', 'currentColor');
      window.matchMedia().matches = true;
      const res = await func({
        useFrame: true
      });
      const obj = mjs.themeMap[THEME_DARK];
      const items = Object.entries(res);
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED ||
            key === CUSTOM_BG_FRAME || key === CUSTOM_BG_HOVER ||
            key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
            key === CUSTOM_COLOR_HOVER) {
          assert.strictEqual(value, obj[CUSTOM_COLOR_FRAME], `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_1) {
          assert.strictEqual(value, '#dfa284', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_2) {
          assert.strictEqual(value, '#83c0a3', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_3) {
          assert.strictEqual(value, '#dfa2c1', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_4) {
          assert.strictEqual(value, '#a2c0e0', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_PINNED) {
          assert.strictEqual(value, '#a2a2c1', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('frame', 'color-mix(in srgb, currentColor, red)');
      window.matchMedia().matches = true;
      const res = await func({
        useFrame: true
      });
      const obj = mjs.themeMap[THEME_DARK];
      const items = Object.entries(res);
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED ||
            key === CUSTOM_BG_FRAME) {
          assert.strictEqual(value, '#fd7e7f', `${key}`);
        } else if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
                   key === CUSTOM_COLOR_HOVER) {
          assert.strictEqual(value, '#fbfbfe', `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#fd8b8c', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_1) {
          assert.strictEqual(value, '#dfa284', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_2) {
          assert.strictEqual(value, '#83c0a3', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_3) {
          assert.strictEqual(value, '#dfa2c1', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_4) {
          assert.strictEqual(value, '#a2c0e0', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_PINNED) {
          assert.strictEqual(value, '#a2a2c1', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_background_text', 'currentColor');
      window.matchMedia().matches = true;
      const res = await func({
        useFrame: true
      });
      const obj = mjs.themeMap[THEME_DARK];
      const items = Object.entries(res);
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, obj[CUSTOM_BG_FRAME], `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#333238', `${key}`);
        } else if (key === CUSTOM_BG_HOVER_SHADOW) {
          assert.strictEqual(value, '#fbfbfe1a', `${key}`);
        } else if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
                   key === CUSTOM_COLOR_HOVER) {
          assert.strictEqual(value, obj[CUSTOM_COLOR_FRAME], `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_1) {
          assert.strictEqual(value, '#dfa284', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_2) {
          assert.strictEqual(value, '#83c0a3', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_3) {
          assert.strictEqual(value, '#dfa2c1', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_4) {
          assert.strictEqual(value, '#a2c0e0', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_PINNED) {
          assert.strictEqual(value, '#a2a2c1', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors
        .set('tab_background_text', 'color-mix(in srgb, currentColor, red)');
      window.matchMedia().matches = true;
      const res = await func({
        useFrame: true
      });
      const obj = mjs.themeMap[THEME_DARK];
      const items = Object.entries(res);
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, obj[CUSTOM_BG_FRAME], `${key}`);
        } else if (key === CUSTOM_BG_HOVER) {
          assert.strictEqual(value, '#33252b', `${key}`);
        } else if (key === CUSTOM_BG_HOVER_SHADOW) {
          assert.strictEqual(value, '#fd7e7f1a', `${key}`);
        } else if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
                   key === CUSTOM_COLOR_HOVER || key === CUSTOM_COLOR_ACTIVE ||
                   key === CUSTOM_COLOR_FRAME) {
          assert.strictEqual(value, '#fd7e7f', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_1) {
          assert.strictEqual(value, '#e07051', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_2) {
          assert.strictEqual(value, '#848e70', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_3) {
          assert.strictEqual(value, '#e0708f', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_GROUP_4) {
          assert.strictEqual(value, '#a28ead', `${key}`);
        } else if (key === CUSTOM_HEADING_TEXT_PINNED) {
          assert.strictEqual(value, '#a2708f', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      const dirName = path.dirname(fileURLToPath(import.meta.url));
      const filePath =
        path.resolve(dirName, '../resource', 'alpenglow-manifest.json');
      const file = await fsPromise.readFile(filePath, {
        encoding: 'utf8',
        flag: 'r'
      });
      const {
        theme: {
          colors
        }
      } = JSON.parse(file);
      const items = Object.entries(colors);
      for (const [key, value] of items) {
        // eslint-disable-next-line no-await-in-loop
        const hexValue = await convertColorToHex(value, {
          alpha: true
        });
        mjs.currentThemeColors.set(key, hexValue);
      }
      const res = await func({
        themeId: THEME_ALPEN_ID,
        useFrame: true
      });
      assert.deepEqual(res, mjs.themeMap[THEME_ALPEN], 'result');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      const dirName = path.dirname(fileURLToPath(import.meta.url));
      const filePath =
        path.resolve(dirName, '../resource', 'alpenglow-manifest.json');
      const file = await fsPromise.readFile(filePath, {
        encoding: 'utf8',
        flag: 'r'
      });
      const {
        dark_theme: {
          colors
        }
      } = JSON.parse(file);
      const items = Object.entries(colors);
      for (const [key, value] of items) {
        // eslint-disable-next-line no-await-in-loop
        const hexValue = await convertColorToHex(value, {
          alpha: true
        });
        mjs.currentThemeColors.set(key, hexValue);
      }
      const res = await func({
        themeId: THEME_ALPEN_ID,
        useFrame: true
      });
      assert.deepEqual(res, mjs.themeMap[THEME_ALPEN_DARK], 'result');
    });
  });

  describe('get base values', () => {
    const func = mjs.getBaseValues;
    beforeEach(() => {
      mjs.currentThemeColors.clear();
    });
    afterEach(() => {
      mjs.currentThemeColors.clear();
    });

    it('should get fallback values', async () => {
      browser.theme.getCurrent.resolves({});
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get fallback values', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
    });

    it('should get fallback values', async () => {
      browser.theme.getCurrent.resolves({
        colors: null
      });
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get fallback values', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({
        colors: null
      });
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({
        colors: {}
      });
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({
        colors: {}
      });
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({
        colors: {
          sidebar: 'red',
          sidebar_text: 'white'
        }
      });
      const res = await func();
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      assert.strictEqual(res[CUSTOM_BG], '#ff0000', 'value');
      assert.strictEqual(res[CUSTOM_COLOR], '#ffffff', 'value');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({
        colors: {
          sidebar: 'red',
          sidebar_text: 'white'
        }
      });
      const res = await func();
      assert.notDeepEqual(res, mjs.themeMap[THEME_DARK], 'result');
      assert.strictEqual(res[CUSTOM_BG], '#ff0000', 'value');
      assert.strictEqual(res[CUSTOM_COLOR], '#ffffff', 'value');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({});
      const res = await func({
        themeId: THEME_ALPEN_ID
      });
      assert.deepEqual(res, mjs.themeMap[THEME_ALPEN], 'result');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      const res = await func({
        themeId: THEME_ALPEN_ID
      });
      assert.deepEqual(res, mjs.themeMap[THEME_ALPEN_DARK], 'result');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      const res = await func({
        themeId: THEME_DARK_ID
      });
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      const dirName = path.dirname(fileURLToPath(import.meta.url));
      const filePath =
        path.resolve(dirName, '../resource', 'dark-manifest.json');
      const file = await fsPromise.readFile(filePath, {
        encoding: 'utf8',
        flag: 'r'
      });
      const {
        applications: {
          gecko: {
            id
          }
        },
        theme: {
          colors
        }
      } = JSON.parse(file);
      browser.management.getAll.resolves([
        {
          id,
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.theme.getCurrent.resolves({ colors });
      const res = await func({
        themeId: THEME_DARK_ID,
        useFrame: true
      });
      assert.notDeepEqual(res, mjs.themeMap[THEME_DARK], 'result');
      assert.strictEqual(res[CUSTOM_BG], '#1c1b22', `${CUSTOM_BG}`);
      assert.strictEqual(res[CUSTOM_COLOR], '#fbfbfe', `${CUSTOM_COLOR}`);
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({});
      const res = await func({
        themeId: THEME_LIGHT_ID
      });
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      const dirName = path.dirname(fileURLToPath(import.meta.url));
      const filePath =
        path.resolve(dirName, '../resource', 'light-manifest.json');
      const file = await fsPromise.readFile(filePath, {
        encoding: 'utf8',
        flag: 'r'
      });
      const {
        applications: {
          gecko: {
            id
          }
        },
        theme: {
          colors
        }
      } = JSON.parse(file);
      browser.management.getAll.resolves([
        {
          id,
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.theme.getCurrent.resolves({ colors });
      const res = await func({
        themeId: THEME_LIGHT_ID,
        useFrame: true
      });
      assert.strictEqual(res[CUSTOM_BG], '#f0f0f4', `${CUSTOM_BG}`);
      assert.strictEqual(res[CUSTOM_COLOR], '#15141a', `${CUSTOM_COLOR}`);
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({});
      const res = await func({
        themeId: THEME_SYSTEM_ID
      });
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      const res = await func({
        themeId: THEME_SYSTEM_ID
      });
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
    });

    it('should not call function', async () => {
      const dirName = path.dirname(fileURLToPath(import.meta.url));
      const filePath =
        path.resolve(dirName, '../resource', 'light-manifest.json');
      const file = await fsPromise.readFile(filePath, {
        encoding: 'utf8',
        flag: 'r'
      });
      const {
        applications: {
          gecko: {
            id
          }
        },
        theme: {
          colors
        }
      } = JSON.parse(file);
      browser.management.getAll.resolves([
        {
          id,
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.theme.getCurrent.resolves({ colors });
      const i = browser.theme.getCurrent.callCount;
      const res = await func({
        themeId: THEME_LIGHT_ID,
        theme: {
          colors
        }
      });
      assert.strictEqual(browser.theme.getCurrent.callCount, i, 'not called');
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      const dirName = path.dirname(fileURLToPath(import.meta.url));
      const filePath =
        path.resolve(dirName, '../resource', 'dark-manifest.json');
      const file = await fsPromise.readFile(filePath, {
        encoding: 'utf8',
        flag: 'r'
      });
      const {
        applications: {
          gecko: {
            id
          }
        },
        theme: {
          colors
        }
      } = JSON.parse(file);
      browser.management.getAll.resolves([
        {
          id,
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.theme.getCurrent.resolves({ colors });
      const i = browser.theme.getCurrent.callCount;
      const res = await func({
        themeId: THEME_DARK_ID,
        theme: {
          colors
        }
      });
      assert.strictEqual(browser.theme.getCurrent.callCount, i, 'not called');
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
    });

    it('should not call function', async () => {
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'red'
        }
      });
      const i = browser.storage.local.set.callCount;
      const res = await func({
        startup: true,
        themeId: THEME_SYSTEM_ID
      });
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      assert.strictEqual(res[CUSTOM_BG], '#ff0000', 'value');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.withArgs(1).resolves({
        colors: {
          frame: 'red'
        }
      });
      const res = await func({
        startup: true,
        themeId: THEME_SYSTEM_ID,
        windowId: 1
      });
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      assert.strictEqual(res[CUSTOM_BG], '#ff0000', 'color');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      const dirName = path.dirname(fileURLToPath(import.meta.url));
      const filePath =
        path.resolve(dirName, '../resource', 'dark-manifest.json');
      const file = await fsPromise.readFile(filePath, {
        encoding: 'utf8',
        flag: 'r'
      });
      const {
        applications: {
          gecko: {
            id
          }
        },
        theme: {
          colors
        }
      } = JSON.parse(file);
      browser.management.getAll.resolves([
        {
          id,
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.theme.getCurrent.resolves({ colors });
      const res = await func({
        startup: true,
        themeId: THEME_DARK_ID
      });
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
    });

    it('should get values', async () => {
      const dirName = path.dirname(fileURLToPath(import.meta.url));
      const filePath =
        path.resolve(dirName, '../resource', 'light-manifest.json');
      const file = await fsPromise.readFile(filePath, {
        encoding: 'utf8',
        flag: 'r'
      });
      const {
        applications: {
          gecko: {
            id
          }
        },
        theme: {
          colors
        }
      } = JSON.parse(file);
      browser.management.getAll.resolves([
        {
          id,
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.theme.getCurrent.resolves({ colors });
      const res = await func({
        startup: true,
        themeId: THEME_LIGHT_ID
      });
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });
  });

  describe('set current theme value', () => {
    const func = mjs.setCurrentThemeValue;
    beforeEach(() => {
      mjs.currentTheme.clear();
    });
    afterEach(() => {
      mjs.currentTheme.clear();
    });

    it('should set theme', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      await func({
        themeId: 'foo'
      });
      assert.strictEqual(mjs.currentTheme.size, 2, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT_ID), 'id');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT_ID), 'foo',
        'id value');
    });

    it('should not set old custom theme value', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {},
        [CUSTOM_BG]: {
          value: '#ff0000'
        }
      });
      await func({
        themeId: 'foo'
      });
      assert.strictEqual(mjs.currentTheme.size, 2, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT_ID), 'id');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT_ID), 'foo',
        'id value');
      assert.isObject(mjs.currentTheme.get(THEME_CURRENT), 'key value');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT)[CUSTOM_BG],
        '#f0f0f4', 'value');
    });

    it('should set theme', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      await func({
        themeId: 'foo'
      });
      assert.strictEqual(mjs.currentTheme.size, 2, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT_ID), 'id');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT_ID), 'foo',
        'id value');
    });

    it('should set theme', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      await func({
        themeId: 'foo'
      });
      assert.strictEqual(mjs.currentTheme.size, 2, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT_ID), 'id');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT_ID), 'foo',
        'id value');
    });

    it('should set theme', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {
          id: THEME_CUSTOM_DARK,
          [CUSTOM_BG]: '#0000ff'
        },
        [THEME_CUSTOM_LIGHT]: {
          id: THEME_CUSTOM_LIGHT,
          [CUSTOM_BG]: '#ff0000'
        }
      });
      await func({
        themeId: 'foo'
      });
      assert.strictEqual(mjs.currentTheme.size, 2, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT_ID), 'id');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT_ID), 'foo',
        'id value');
      assert.isObject(mjs.currentTheme.get(THEME_CURRENT), 'key value');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT)[CUSTOM_BG],
        '#ff0000', 'value');
    });

    it('should set theme', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {
          id: THEME_CUSTOM_DARK,
          [CUSTOM_BG]: '#0000ff'
        },
        [THEME_CUSTOM_LIGHT]: {
          id: THEME_CUSTOM_LIGHT,
          [CUSTOM_BG]: '#ff0000'
        }
      });
      await func({
        themeId: 'foo'
      });
      assert.strictEqual(mjs.currentTheme.size, 2, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT_ID), 'id');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT_ID), 'foo',
        'id value');
      assert.isObject(mjs.currentTheme.get(THEME_CURRENT), 'key value');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT)[CUSTOM_BG],
        '#0000ff', 'value');
    });

    it('should set theme', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {
          id: THEME_CUSTOM_DARK,
          [CUSTOM_BG]: '#0000ff'
        },
        [THEME_CUSTOM_LIGHT]: {
          id: 'foo',
          [CUSTOM_BG]: '#ff0000'
        }
      });
      await func({
        themeId: 'foo'
      });
      assert.strictEqual(mjs.currentTheme.size, 2, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT_ID), 'id');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT_ID), 'foo',
        'id value');
      assert.isObject(mjs.currentTheme.get(THEME_CURRENT), 'key value');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT)[CUSTOM_BG],
        '#ff0000', 'value');
    });

    it('should set theme', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {
          id: THEME_CUSTOM_DARK,
          [CUSTOM_BG]: '#0000ff'
        },
        [THEME_CUSTOM_LIGHT]: {
          id: 'foo',
          [CUSTOM_BG]: '#ff0000'
        }
      });
      await func({
        themeId: 'foo'
      });
      assert.strictEqual(mjs.currentTheme.size, 2, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT_ID), 'id');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT_ID), 'foo',
        'id value');
      assert.isObject(mjs.currentTheme.get(THEME_CURRENT), 'key value');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT)[CUSTOM_BG],
        '#0000ff', 'value');
    });

    it('should set theme', async () => {
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'red',
          sidebar: 'blue'
        }
      });
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: false
        },
        [THEME_CUSTOM_DARK]: {
          id: THEME_CUSTOM_DARK,
          [CUSTOM_BG]: '#00ff00'
        },
        [THEME_CUSTOM_LIGHT]: {
          id: 'foo',
          [CUSTOM_BG]: '#ff00ff'
        }
      });
      await func({
        themeId: 'foo'
      });
      assert.strictEqual(mjs.currentTheme.size, 2, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT_ID), 'id');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT_ID), 'foo',
        'id value');
      assert.isObject(mjs.currentTheme.get(THEME_CURRENT), 'key value');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT)[CUSTOM_BG],
        '#0000ff', 'value');
    });

    it('should set theme', async () => {
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'red',
          sidebar: 'blue'
        }
      });
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {
          id: THEME_CUSTOM_DARK,
          [CUSTOM_BG]: '#00ff00'
        },
        [THEME_CUSTOM_LIGHT]: {
          id: 'foo',
          [CUSTOM_BG]: '#ff00ff'
        }
      });
      await func({
        themeId: 'foo'
      });
      assert.strictEqual(mjs.currentTheme.size, 2, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT_ID), 'id');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT_ID), 'foo',
        'id value');
      assert.isObject(mjs.currentTheme.get(THEME_CURRENT), 'key value');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT)[CUSTOM_BG],
        '#ff00ff', 'value');
    });

    it('should set theme', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'red',
          sidebar: 'blue'
        }
      });
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {
          id: THEME_CUSTOM_DARK,
          [CUSTOM_BG]: '#00ff00'
        },
        [THEME_CUSTOM_LIGHT]: {
          id: 'foo',
          [CUSTOM_BG]: '#ff00ff'
        }
      });
      await func({
        themeId: 'foo'
      });
      assert.strictEqual(mjs.currentTheme.size, 2, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT_ID), 'id');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT_ID), 'foo',
        'id value');
      assert.isObject(mjs.currentTheme.get(THEME_CURRENT), 'key value');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT)[CUSTOM_BG],
        '#00ff00', 'value');
    });
  });

  describe('send current theme values', () => {
    const func = mjs.sendCurrentTheme;
    beforeEach(() => {
      mjs.currentTheme.clear();
    });
    afterEach(() => {
      mjs.currentTheme.clear();
    });

    it('it should not call function', async () => {
      const res = await func();
      assert.isTrue(browser.runtime.sendMessage.notCalled, 'not called');
      assert.isNull(res, 'result');
    });

    it('it should call function', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'qux',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.runtime.sendMessage.callsFake((...args) => args);
      mjs.currentTheme.set(THEME_CURRENT_ID, 'foo');
      mjs.currentTheme.set(THEME_CURRENT, {
        bar: 'baz'
      });
      const res = await func();
      assert.isFalse(browser.management.getAll.called, 'not called');
      assert.isTrue(browser.runtime.sendMessage.calledOnce, 'called');
      assert.deepEqual(res, [
        {
          [THEME_CUSTOM_SETTING]: {
            colorScheme: 'light',
            id: 'foo',
            values: {
              bar: 'baz'
            }
          }
        },
        null
      ], 'result');
    });

    it('it should call function', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'qux',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.runtime.sendMessage.callsFake((...args) => args);
      mjs.currentTheme.set(THEME_CURRENT_ID, 'foo');
      mjs.currentTheme.set(THEME_CURRENT, {
        bar: 'baz'
      });
      const res = await func();
      assert.isFalse(browser.management.getAll.called, 'not called');
      assert.isTrue(browser.runtime.sendMessage.calledOnce, 'called');
      assert.deepEqual(res, [
        {
          [THEME_CUSTOM_SETTING]: {
            colorScheme: 'dark',
            id: 'foo',
            values: {
              bar: 'baz'
            }
          }
        },
        null
      ], 'result');
    });

    it('it should call function', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'qux',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.runtime.sendMessage.callsFake((...args) => args);
      mjs.currentTheme.set(THEME_CURRENT_ID, 'foo');
      mjs.currentTheme.set(THEME_CURRENT, {
        bar: 'baz'
      });
      const res = await func('foo');
      assert.isFalse(browser.management.getAll.called, 'not called');
      assert.isTrue(browser.runtime.sendMessage.calledOnce, 'called');
      assert.deepEqual(res, [
        {
          [THEME_CUSTOM_SETTING]: {
            colorScheme: 'light',
            id: 'foo',
            values: {
              bar: 'baz'
            }
          }
        },
        null
      ], 'result');
    });

    it('it should call function', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.runtime.sendMessage.callsFake((...args) => args);
      mjs.currentTheme.set(THEME_CURRENT_ID, null);
      mjs.currentTheme.set(THEME_CURRENT, {
        bar: 'baz'
      });
      const res = await func();
      assert.isTrue(browser.management.getAll.called, 'called');
      assert.isTrue(browser.runtime.sendMessage.calledOnce, 'called');
      assert.deepEqual(res, [
        {
          [THEME_CUSTOM_SETTING]: {
            colorScheme: 'light',
            id: 'foo',
            values: {
              bar: 'baz'
            }
          }
        },
        null
      ], 'result');
    });
  });

  describe('update custom theme CSS', () => {
    const func = mjs.updateCustomThemeCss;
    beforeEach(() => {
      mjs.currentTheme.clear();
    });
    afterEach(() => {
      mjs.currentTheme.clear();
    });

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'message');
      });
    });

    it('should update stylesheet', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      await func(CSS_ROOT, CSS_VAR_FONT_ACTIVE, 'bold');
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 1, 'length');
      assert.strictEqual(sheet.cssRules[0].selectorText, CSS_ROOT, 'selector');
      assert.strictEqual(sheet.cssRules[0].style.cssText,
        '--font-weight-active: bold;', 'cssText');
    });

    it('should not update stylesheet if map is not set', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      await func('.foo');
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 0, 'length');
    });

    it('should not update stylesheet if map is empty object', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, {});
      await func('.foo');
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 0, 'length');
    });

    it('should not update stylesheet if ID does not match', async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = 'bar';
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func('.foo');
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 0, 'length');
    });

    it('should not update stylesheet if element is not style', async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func('.foo');
      assert.strictEqual(elm.textContent, '', 'content');
    });

    it('should update stylesheet', async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func('.foo');
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 1, 'length');
      assert.strictEqual(sheet.cssRules[0].selectorText, '.foo', 'selector');
    });

    it('should update stylesheet', async () => {
      const currentTheme = mjs.themeMap[THEME_DARK];
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func('.foo');
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 1, 'length');
      assert.strictEqual(sheet.cssRules[0].selectorText, '.foo', 'selector');
    });

    it('should update stylesheet', async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      elm.sheet.insertRule('.bar { background: red; }', 0);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func('.foo');
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 2, 'length');
      assert.strictEqual(sheet.cssRules[0].selectorText, '.bar', 'selector');
      assert.strictEqual(sheet.cssRules[1].selectorText, '.foo', 'selector');
    });

    it('should update stylesheet', async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      elm.sheet.insertRule('.foo { background: red; }', 0);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func('.foo');
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 1, 'length');
      assert.strictEqual(sheet.cssRules[0].selectorText, '.foo', 'selector');
    });

    it('should update stylesheet', async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      elm.sheet.insertRule('.foo { background: red; }', 0);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func('.foo', CUSTOM_BG, '#0000ff');
      const { sheet } = elm;
      const customTheme = mjs.currentTheme.get(THEME_CURRENT);
      assert.strictEqual(sheet.cssRules.length, 1, 'length');
      assert.strictEqual(sheet.cssRules[0].selectorText, '.foo', 'selector');
      assert.strictEqual(customTheme[CUSTOM_BG], '#0000ff', 'theme');
    });
  });

  describe('delete custom them CSS rule', () => {
    const func = mjs.deleteCustomThemeCss;

    it('should not delete style if ID does not match', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = 'bar';
      body.appendChild(elm);
      elm.sheet.insertRule(`.${CLASS_THEME_CUSTOM} { background: red; }`, 0);
      await func();
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 1, 'length');
      assert.strictEqual(sheet.cssRules[0].selectorText,
                         `.${CLASS_THEME_CUSTOM}`, 'selector');
    });

    it('should not delete style if selector does not match', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      elm.sheet.insertRule('.foo { background: red; }', 0);
      await func();
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 1, 'length');
      assert.strictEqual(sheet.cssRules[0].selectorText, '.foo', 'selector');
    });

    it('should not delete style if no rules', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      await func();
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 0, 'length');
    });

    it('should delete style', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      elm.sheet.insertRule(`.${CLASS_THEME_CUSTOM} { background: red; }`, 0);
      await func();
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 0, 'length');
    });

    it('should delete style', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      elm.sheet.insertRule(`.${CLASS_THEME_CUSTOM} { background: red; }`, 0);
      elm.sheet.insertRule('.foo { color: red; }', 1);
      elm.sheet.insertRule(`.${CLASS_THEME_CUSTOM} { color: blue; }`, 2);
      await func();
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 1, 'length');
      assert.strictEqual(sheet.cssRules[0].selectorText, '.foo', 'selector');
    });
  });

  describe('init custom theme', () => {
    const func = mjs.initCustomTheme;
    beforeEach(() => {
      mjs.currentTheme.clear();
      mjs.currentThemeColors.clear();
    });
    afterEach(() => {
      mjs.currentTheme.clear();
      mjs.currentThemeColors.clear();
    });

    it('should not call function', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.runtime.sendMessage.callsFake((...args) => args);
      const i = browser.runtime.sendMessage.callCount;
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.runtime.sendMessage.callsFake((...args) => args);
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const k = browser.storage.local.set.callCount;
      const l = browser.management.getAll.callCount;
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
      assert.strictEqual(browser.storage.local.remove.callCount, j,
        'not called');
      assert.strictEqual(browser.storage.local.set.callCount, k,
        'not called');
      assert.strictEqual(browser.management.getAll.callCount, l,
        'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.runtime.sendMessage.callsFake((...args) => args);
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const k = browser.storage.local.set.callCount;
      const l = browser.management.getAll.callCount;
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      const res = await func({
        remove: true,
        useFrame: true
      });
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
      assert.strictEqual(browser.storage.local.remove.callCount, j,
        'not called');
      assert.strictEqual(browser.storage.local.set.callCount, k,
        'not called');
      assert.strictEqual(browser.management.getAll.callCount, l,
        'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.runtime.sendMessage.callsFake((...args) => args);
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const k = browser.storage.local.set.callCount;
      const l = browser.management.getAll.callCount;
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
      assert.strictEqual(browser.storage.local.remove.callCount, j,
        'not called');
      assert.strictEqual(browser.storage.local.set.callCount, k,
        'not called');
      assert.strictEqual(browser.management.getAll.callCount, l,
        'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.runtime.sendMessage.callsFake((...args) => args);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const k = browser.storage.local.set.callCount;
      const l = browser.management.getAll.callCount;
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT_ID, 'foo');
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      const res = await func({
        remove: true,
        useFrame: true
      });
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.strictEqual(browser.storage.local.remove.callCount, j + 1,
        'not called');
      assert.strictEqual(browser.storage.local.set.callCount, k,
        'not called');
      assert.strictEqual(browser.management.getAll.callCount, l,
        'not called');
      assert.deepEqual(res, [
        {
          [THEME_CUSTOM_SETTING]: {
            colorScheme: 'light',
            id: 'foo',
            values: currentTheme
          }
        },
        null
      ], 'result');
    });

    it('should call function', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.runtime.sendMessage.callsFake((...args) => args);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const k = browser.storage.local.set.callCount;
      const l = browser.management.getAll.callCount;
      const currentTheme = mjs.themeMap[THEME_DARK];
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT_ID, 'foo');
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      const res = await func({
        remove: true,
        useFrame: true
      });
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.strictEqual(browser.storage.local.remove.callCount, j + 1,
        'not called');
      assert.strictEqual(browser.storage.local.set.callCount, k,
        'not called');
      assert.strictEqual(browser.management.getAll.callCount, l,
        'not called');
      assert.deepEqual(res, [
        {
          [THEME_CUSTOM_SETTING]: {
            colorScheme: 'dark',
            id: 'foo',
            values: currentTheme
          }
        },
        null
      ], 'result');
    });

    it('should call function', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.runtime.sendMessage.callsFake((...args) => args);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const k = browser.storage.local.set.callCount;
      const l = browser.management.getAll.callCount;
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT_ID, null);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      const res = await func({
        remove: true,
        useFrame: true
      });
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.strictEqual(browser.storage.local.remove.callCount, j + 1,
        'called');
      assert.strictEqual(browser.storage.local.set.callCount, k,
        'not called');
      assert.strictEqual(browser.management.getAll.callCount, l + 1,
        'called');
      assert.deepEqual(res, [
        {
          [THEME_CUSTOM_SETTING]: {
            colorScheme: 'light',
            id: 'foo',
            values: currentTheme
          }
        },
        null
      ], 'result');
    });

    it('should call function', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.runtime.sendMessage.callsFake((...args) => args);
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const k = browser.storage.local.set.callCount;
      const l = browser.management.getAll.callCount;
      const currentTheme = mjs.themeMap[THEME_DARK];
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT_ID, null);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      const res = await func({
        remove: true,
        useFrame: true
      });
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.strictEqual(browser.storage.local.remove.callCount, j + 1,
        'called');
      assert.strictEqual(browser.storage.local.set.callCount, k,
        'not called');
      assert.strictEqual(browser.management.getAll.callCount, l + 1,
        'called');
      assert.deepEqual(res, [
        {
          [THEME_CUSTOM_SETTING]: {
            colorScheme: 'dark',
            id: 'foo',
            values: currentTheme
          }
        },
        null
      ], 'result');
    });
  });

  describe('get theme info', () => {
    const func = mjs.getThemeInfo;

    it('should get auto theme', async () => {
      browser.storage.local.get.withArgs(THEME).resolves({
        theme: 'foo'
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, [THEME_AUTO, false], 'result');
    });

    it('should get auto theme', async () => {
      browser.storage.local.get.withArgs(THEME).resolves({
        theme: ['foo']
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, [THEME_AUTO, false], 'result');
    });

    it('should get auto theme', async () => {
      browser.storage.local.get.withArgs(THEME).resolves({
        theme: [THEME_AUTO]
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, [THEME_AUTO, false], 'result');
    });

    it('should get auto theme', async () => {
      browser.storage.local.get.withArgs(THEME).resolves({
        theme: ['foo', false]
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, [THEME_AUTO, false], 'result');
    });

    it('should get auto theme', async () => {
      browser.storage.local.get.withArgs(THEME).resolves({
        theme: [THEME_AUTO, true]
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, [THEME_AUTO, false], 'result');
    });

    it('should get stored theme', async () => {
      browser.storage.local.get.withArgs(THEME).resolves({
        theme: ['foo', true]
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, ['foo', true], 'result');
    });

    it('should get stored theme', async () => {
      browser.storage.local.get.withArgs(THEME).resolves({
        theme: [THEME_LIGHT, true]
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, [THEME_LIGHT, true], 'result');
    });

    it('should get stored theme', async () => {
      browser.storage.local.get.withArgs(THEME).resolves({
        theme: [THEME_DARK, true]
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, [THEME_DARK, true], 'result');
    });

    it('should get stored theme', async () => {
      browser.storage.local.get.withArgs(THEME).resolves({
        theme: [THEME_CUSTOM, true]
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, [THEME_CUSTOM, true], 'result');
    });

    it('should get auto theme', async () => {
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.get.callCount;
      const j = browser.management.getAll.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.strictEqual(browser.management.getAll.callCount, j + 1, 'called');
      assert.deepEqual(res, [THEME_AUTO, false], 'result');
    });

    it('should get alpenglow theme', async () => {
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: THEME_ALPEN_ID,
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.get.callCount;
      const j = browser.management.getAll.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.strictEqual(browser.management.getAll.callCount, j + 1, 'called');
      assert.deepEqual(res, [THEME_AUTO, false], 'result');
    });

    it('should get dark theme', async () => {
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: THEME_DARK_ID,
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.get.callCount;
      const j = browser.management.getAll.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.strictEqual(browser.management.getAll.callCount, j + 1, 'called');
      assert.deepEqual(res, [THEME_DARK, false], 'result');
    });

    it('should get light theme', async () => {
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: THEME_LIGHT_ID,
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.get.callCount;
      const j = browser.management.getAll.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.strictEqual(browser.management.getAll.callCount, j + 1, 'called');
      assert.deepEqual(res, [THEME_LIGHT, false], 'result');
    });

    it('should get system theme', async () => {
      window.matchMedia().matches = true;
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.get.callCount;
      const j = browser.management.getAll.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.strictEqual(browser.management.getAll.callCount, j + 1, 'called');
      assert.deepEqual(res, [THEME_AUTO, false], 'result');
    });

    it('should get system theme', async () => {
      window.matchMedia().matches = false;
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.get.callCount;
      const j = browser.management.getAll.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.strictEqual(browser.management.getAll.callCount, j + 1, 'called');
      assert.deepEqual(res, [THEME_AUTO, false], 'result');
    });

    it('should get auto theme', async () => {
      window.matchMedia().matches = true;
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.get.callCount;
      const j = browser.management.getAll.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.strictEqual(browser.management.getAll.callCount, j + 1, 'called');
      assert.deepEqual(res, [THEME_AUTO, false], 'result');
    });

    it('should get auto theme', async () => {
      window.matchMedia().matches = false;
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.get.callCount;
      const j = browser.management.getAll.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.strictEqual(browser.management.getAll.callCount, j + 1, 'called');
      assert.deepEqual(res, [THEME_AUTO, false], 'result');
    });
  });

  describe('set theme', () => {
    const func = mjs.setTheme;

    it('should set auto light theme', async () => {
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      await func();
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set auto dark theme', async () => {
      window.matchMedia().matches = true;
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      await func();
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set auto light theme', async () => {
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      await func([THEME_LIGHT]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set auto dark theme', async () => {
      window.matchMedia().matches = true;
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      await func([THEME_DARK]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set system light theme', async () => {
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_SYSTEM, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      await func([THEME_SYSTEM]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set system dark theme', async () => {
      window.matchMedia().matches = true;
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_SYSTEM, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func([THEME_SYSTEM]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set custom theme', async () => {
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_CUSTOM, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      await func([THEME_CUSTOM]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isFalse(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set system light theme', async () => {
      browser.theme.getCurrent.withArgs(1).resolves({
        colors: null
      });
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.windows.getCurrent.resolves({
        id: 1,
        type: 'foo'
      });
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_SYSTEM, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func([THEME_AUTO]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set system light theme', async () => {
      browser.theme.getCurrent.withArgs(1).resolves({
        colors: null
      });
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.windows.getCurrent.resolves({
        id: 1,
        type: 'normal'
      });
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_SYSTEM, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func([THEME_AUTO]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set system light theme', async () => {
      browser.theme.getCurrent.withArgs(1).resolves({
        colors: {
          frame: '#f0f0f4',
          tab_background_text: 'rgb(21,20,26)'
        }
      });
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.windows.getCurrent.resolves({
        id: 1,
        type: 'normal'
      });
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_SYSTEM, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      await func([THEME_AUTO]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set system dark theme', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.withArgs(1).resolves({
        colors: {
          frame: '#1c1b22',
          tab_background_text: 'rgb(251,251,254)'
        }
      });
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.windows.getCurrent.resolves({
        id: 1,
        type: 'normal'
      });
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_SYSTEM, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      await func([THEME_AUTO]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set auto light theme', async () => {
      browser.theme.getCurrent.withArgs(1).resolves({
        colors: {
          frame: 'red',
          tab_background_text: 'white'
        }
      });
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.windows.getCurrent.resolves({
        id: 1,
        type: 'normal'
      });
      const i = browser.storage.local.set.callCount;
      const body = document.querySelector('body');
      await func([THEME_AUTO]);
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set auto dark theme', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.withArgs(1).resolves({
        colors: {
          frame: 'red',
          tab_background_text: 'white'
        }
      });
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.windows.getCurrent.resolves({
        id: 1,
        type: 'normal'
      });
      const i = browser.storage.local.set.callCount;
      const body = document.querySelector('body');
      await func([THEME_AUTO]);
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should not store', async () => {
      const i = browser.storage.local.set.callCount;
      const body = document.querySelector('body');
      await func([], {
        local: true
      });
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should not store', async () => {
      window.matchMedia().matches = true;
      const i = browser.storage.local.set.callCount;
      const body = document.querySelector('body');
      await func([], {
        local: true
      });
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set auto light theme', async () => {
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      await func([], {
        themeId: 'foo'
      });
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set auto dark theme', async () => {
      window.matchMedia().matches = true;
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      await func([], {
        themeId: 'foo'
      });
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });
  });

  describe('apply local theme', () => {
    const func = mjs.applyLocalTheme;
    beforeEach(() => {
      mjs.currentTheme.clear();
      mjs.currentThemeColors.clear();
      mjs.timeStamp.clear();
    });
    afterEach(() => {
      mjs.currentTheme.clear();
      mjs.currentThemeColors.clear();
      mjs.timeStamp.clear();
    });

    it('should not call function', async () => {
      const i = browser.theme.getCurrent.callCount;
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.theme.getCurrent.resolves({
        colors: {}
      });
      mjs.currentTheme.set(THEME_CURRENT, {});
      const res = await func();
      assert.strictEqual(browser.theme.getCurrent.callCount, i, 'not called');
      assert.strictEqual(mjs.timeStamp.size, 0, 'size');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.theme.getCurrent.callCount;
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.theme.getCurrent.resolves({
        colors: {}
      });
      mjs.currentTheme.set(THEME_CURRENT, {});
      const res = await func({
        local: true,
        theme: {}
      });
      assert.strictEqual(browser.theme.getCurrent.callCount, i, 'not called');
      assert.strictEqual(mjs.timeStamp.size, 0, 'size');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.theme.getCurrent.callCount;
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'red',
          tab_background_text: 'white'
        }
      });
      mjs.currentTheme.set(THEME_CURRENT, {});
      const res = await func({
        local: true,
        theme: {
          colors: {
            frame: 'red',
            tab_background_text: 'white'
          }
        },
        windowId: 1
      });
      assert.strictEqual(browser.theme.getCurrent.callCount, i + 1, 'called');
      assert.strictEqual(mjs.timeStamp.size, 0, 'size');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.theme.getCurrent.callCount;
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'red',
          tab_background_text: 'white'
        }
      });
      browser.theme.getCurrent.onCall(0).resolves({
        colors: {
          frame: 'blue',
          tab_background_text: 'white'
        }
      });
      browser.theme.getCurrent.onCall(1).resolves({
        colors: {
          frame: 'red',
          tab_background_text: 'black'
        }
      });
      mjs.currentTheme.set(THEME_CURRENT, {});
      const res = await func({
        local: true,
        theme: {
          colors: {
            frame: 'red',
            tab_background_text: 'white'
          }
        },
        windowId: 1
      });
      assert.strictEqual(browser.theme.getCurrent.callCount, i + 4, 'called');
      assert.strictEqual(mjs.timeStamp.size, 0, 'size');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.theme.getCurrent.callCount;
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'red',
          tab_background_text: 'white'
        }
      });
      browser.theme.getCurrent.onCall(0).resolves({
        colors: {
          frame: 'blue',
          tab_background_text: 'white'
        }
      });
      browser.theme.getCurrent.onCall(1).resolves({
        colors: {
          frame: 'red',
          tab_background_text: 'black'
        }
      });
      mjs.currentTheme.set(THEME_CURRENT, {});
      const res = await Promise.all([
        func({
          local: true,
          theme: {
            colors: {
              frame: 'red',
              tab_background_text: 'white'
            }
          },
          windowId: 1
        }),
        await sleep(Math.floor(1000 / 60)).then(() => func({
          local: true,
          theme: {
            colors: {
              frame: 'yellow',
              tab_background_text: 'black'
            }
          },
          windowId: 1
        }))
      ]);
      assert.strictEqual(browser.theme.getCurrent.callCount, i + 4, 'called');
      assert.strictEqual(mjs.timeStamp.size, 0, 'size');
      assert.deepEqual(res, [null, null], 'result');
    });
  });

  describe('apply custom theme', () => {
    const func = mjs.applyCustomTheme;
    beforeEach(() => {
      mjs.currentTheme.clear();
    });
    afterEach(() => {
      mjs.currentTheme.clear();
    });

    it('should get empty array', async () => {
      const res = await func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', async () => {
      const res = await func({
        foo: 'bar'
      });
      assert.deepEqual(res, [], 'result');
    });

    it('should set css', async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement('style');
      const head = document.querySelector('head');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      head.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      const res = await func({
        foo: 'bar',
        [CUSTOM_BG]: '#ff0000',
        [CUSTOM_COLOR]: '#ffffff'
      });
      assert.strictEqual(elm.sheet.cssRules[0].style[CSS_VAR_BG], '#ff0000',
        'style');
      assert.strictEqual(elm.sheet.cssRules[0].style[CSS_VAR_COLOR], '#ffffff',
        'style');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'class');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'class');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'class');
      assert.isFalse(body.classList.contains(CLASS_THEME_SYSTEM), 'class');
      assert.deepEqual(res, [undefined, undefined], 'result');
    });
  });

  describe('apply theme', () => {
    const func = mjs.applyTheme;
    beforeEach(() => {
      mjs.currentTheme.clear();
      mjs.currentThemeColors.clear();
      mjs.timeStamp.clear();
    });
    afterEach(() => {
      mjs.currentTheme.clear();
      mjs.currentThemeColors.clear();
      mjs.timeStamp.clear();
    });

    it('should call function', async () => {
      const i = browser.storage.local.set.callCount;
      const j = browser.runtime.sendMessage.callCount;
      browser.runtime.sendMessage.resolves({});
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          type: 'theme',
          enabled: true
        }
      ]);
      browser.windows.getCurrent.resolves({
        id: 1,
        type: 'normal'
      });
      mjs.currentTheme.set(THEME_CURRENT, {});
      const res = await func();
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j + 1,
        'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const i = browser.storage.local.set.callCount;
      const j = browser.runtime.sendMessage.callCount;
      browser.runtime.sendMessage.resolves({});
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          type: 'theme',
          enabled: true
        }
      ]);
      browser.windows.getCurrent.resolves({
        id: 1,
        type: 'normal'
      });
      mjs.currentTheme.set(THEME_CURRENT, {});
      const res = await func({
        useFrame: true
      });
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j + 1,
        'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const i = browser.theme.getCurrent.callCount;
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          type: 'theme',
          enabled: true
        }
      ]);
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'red',
          tab_background_text: 'white'
        }
      });
      browser.windows.getCurrent.resolves({
        id: 1,
        type: 'normal'
      });
      mjs.currentTheme.set(THEME_CURRENT, {});
      const res = await func({
        local: true,
        theme: {
          colors: {
            frame: 'red',
            tab_background_text: 'white'
          }
        },
        windowId: 1
      });
      assert.strictEqual(browser.theme.getCurrent.callCount, i + 1, 'called');
      assert.strictEqual(mjs.timeStamp.size, 0, 'size');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.theme.getCurrent.callCount;
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          type: 'theme',
          enabled: true
        }
      ]);
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'red',
          tab_background_text: 'white'
        }
      });
      browser.windows.getCurrent.resolves({
        id: 1,
        type: 'normal'
      });
      mjs.currentTheme.set(THEME_CURRENT, {});
      const res = await func({
        local: true,
        theme: {
          colors: {
            frame: 'red',
            tab_background_text: 'white'
          }
        },
        useFrame: true,
        windowId: 1
      });
      assert.strictEqual(browser.theme.getCurrent.callCount, i + 1, 'called');
      assert.strictEqual(mjs.timeStamp.size, 0, 'size');
      assert.isNull(res, 'result');
    });
  });

  describe('set user CSS', () => {
    const func = mjs.setUserCss;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'message');
      });
    });

    it('should not set CSS', async () => {
      const elm = document.createElement('style');
      const head = document.querySelector('head');
      elm.id = USER_CSS_ID;
      elm.textContent = 'body { color: red }';
      head.appendChild(elm);
      await func('');
      assert.strictEqual(elm.textContent, '', 'content');
    });

    it('should not set CSS', async () => {
      const elm = document.createElement('style');
      const head = document.querySelector('head');
      elm.id = USER_CSS_ID;
      head.appendChild(elm);
      await func('');
      assert.strictEqual(elm.textContent, '', 'content');
    });

    it('should set CSS', async () => {
      const elm = document.createElement('style');
      const head = document.querySelector('head');
      elm.id = USER_CSS_ID;
      elm.textContent = 'body { color: red; }';
      head.appendChild(elm);
      await func('body { }');
      assert.strictEqual(elm.textContent, 'body { }', 'content');
    });

    it('should set CSS', async () => {
      const elm = document.createElement('style');
      const head = document.querySelector('head');
      elm.id = USER_CSS_ID;
      head.appendChild(elm);
      await func(' body {\n color : red\n }\nmain {\n background: blue\n } ');
      assert.strictEqual(elm.textContent,
        'body { color : red; } main { background: blue; }', 'content');
    });
  });

  describe('get tab height', () => {
    const func = mjs.getTabHeight;

    it('should get result', async () => {
      browser.storage.local.get.withArgs(THEME_UI_TAB_COMPACT)
        .resolves(undefined);
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.isFalse(res, 'result');
    });

    it('should get result', async () => {
      browser.storage.local.get.withArgs(THEME_UI_TAB_COMPACT).resolves({
        [THEME_UI_TAB_COMPACT]: {
          checked: true
        }
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.isTrue(res, 'result');
    });

    it('should get result', async () => {
      browser.storage.local.get.withArgs(THEME_UI_TAB_COMPACT).resolves({
        [THEME_UI_TAB_COMPACT]: {
          checked: false
        }
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.isFalse(res, 'result');
    });
  });

  describe('set tab height', () => {
    const func = mjs.setTabHeight;

    it('should add class', async () => {
      const body = document.querySelector('body');
      body.classList.remove(CLASS_COMPACT);
      await func(true);
      assert.isTrue(body.classList.contains(CLASS_COMPACT));
    });

    it('should not add class', async () => {
      const body = document.querySelector('body');
      body.classList.add(CLASS_COMPACT);
      await func(false);
      assert.isFalse(body.classList.contains(CLASS_COMPACT));
    });
  });

  describe('get scrollbar width', () => {
    const func = mjs.getScrollbarWidth;

    it('should get result', async () => {
      browser.storage.local.get.withArgs(THEME_UI_SCROLLBAR_NARROW)
        .resolves(undefined);
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.isFalse(res, 'result');
    });

    it('should get result', async () => {
      browser.storage.local.get.withArgs(THEME_UI_SCROLLBAR_NARROW).resolves({
        [THEME_UI_SCROLLBAR_NARROW]: {
          checked: true
        }
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.isTrue(res, 'result');
    });

    it('should get result', async () => {
      browser.storage.local.get.withArgs(THEME_UI_SCROLLBAR_NARROW).resolves({
        [THEME_UI_SCROLLBAR_NARROW]: {
          checked: false
        }
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.isFalse(res, 'result');
    });
  });

  describe('set scrollbar width', () => {
    const func = mjs.setScrollbarWidth;

    it('should add class', async () => {
      const body = document.querySelector('body');
      body.classList.remove(CLASS_NARROW);
      await func(true);
      assert.isTrue(body.classList.contains(CLASS_NARROW));
    });

    it('should not add class', async () => {
      const body = document.querySelector('body');
      body.classList.add(CLASS_NARROW);
      await func(false);
      assert.isFalse(body.classList.contains(CLASS_NARROW));
    });
  });

  describe('get tab group color bar width', () => {
    const func = mjs.getTabGroupColorBarWidth;

    it('should get result', async () => {
      browser.storage.local.get.withArgs(THEME_UI_TAB_GROUP_NARROW)
        .resolves(undefined);
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.isFalse(res, 'result');
    });

    it('should get result', async () => {
      browser.storage.local.get.withArgs(THEME_UI_TAB_GROUP_NARROW).resolves({
        [THEME_UI_TAB_GROUP_NARROW]: {
          checked: true
        }
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.isTrue(res, 'result');
    });

    it('should get result', async () => {
      browser.storage.local.get.withArgs(THEME_UI_TAB_GROUP_NARROW).resolves({
        [THEME_UI_TAB_GROUP_NARROW]: {
          checked: false
        }
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.isFalse(res, 'result');
    });
  });

  describe('set tab group color bar width', () => {
    const func = mjs.setTabGroupColorBarWidth;

    it('should add class', async () => {
      const body = document.querySelector('body');
      body.classList.remove(CLASS_NARROW_TAB_GROUP);
      await func(true);
      assert.isTrue(body.classList.contains(CLASS_NARROW_TAB_GROUP));
    });

    it('should not add class', async () => {
      const body = document.querySelector('body');
      body.classList.add(CLASS_NARROW_TAB_GROUP);
      await func(false);
      assert.isFalse(body.classList.contains(CLASS_NARROW_TAB_GROUP));
    });
  });

  describe('get new tab separator', () => {
    const func = mjs.getNewTabSeparator;

    it('should get result', async () => {
      browser.storage.local.get.withArgs(NEW_TAB_SEPARATOR_SHOW)
        .resolves(undefined);
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.isFalse(res, 'result');
    });

    it('should get result', async () => {
      browser.storage.local.get.withArgs(NEW_TAB_SEPARATOR_SHOW).resolves({
        [NEW_TAB_SEPARATOR_SHOW]: {
          checked: true
        }
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.isTrue(res, 'result');
    });

    it('should get result', async () => {
      browser.storage.local.get.withArgs(NEW_TAB_SEPARATOR_SHOW).resolves({
        [NEW_TAB_SEPARATOR_SHOW]: {
          checked: false
        }
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.isFalse(res, 'result');
    });
  });

  describe('set new tab separator', () => {
    const func = mjs.setNewTabSeparator;

    it('should add class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = NEW_TAB;
      elm.classList.add(TAB, NEW_TAB);
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(true);
      assert.isTrue(elm.classList.contains(CLASS_SEPARATOR_SHOW));
    });

    it('should not add class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = NEW_TAB;
      elm.classList.add(TAB, NEW_TAB, CLASS_SEPARATOR_SHOW);
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(false);
      assert.isFalse(elm.classList.contains(CLASS_SEPARATOR_SHOW));
    });
  });

  describe('set active tab font weight', () => {
    const func = mjs.setActiveTabFontWeight;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.');
      });
    });

    it('should not set css', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      const res = await func('');
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 0, 'length');
      assert.isNull(res, 'result');
    });

    it('should not set css', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      const res = await func('foo');
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 0, 'length');
      assert.isNull(res, 'result');
    });

    it('should set css', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      const res = await func('bold');
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 1, 'length');
      assert.strictEqual(sheet.cssRules[0].selectorText, CSS_ROOT, 'selector');
      assert.strictEqual(sheet.cssRules[0].style.cssText,
        '--font-weight-active: bold;', 'cssText');
      assert.isUndefined(res, 'result');
    });

    it('should set css', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      const res = await func('normal');
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 1, 'length');
      assert.strictEqual(sheet.cssRules[0].selectorText, CSS_ROOT, 'selector');
      assert.strictEqual(sheet.cssRules[0].style.cssText,
        '--font-weight-active: normal;', 'cssText');
      assert.isUndefined(res, 'result');
    });
  });

  describe('apply CSS', () => {
    const func = mjs.applyCss;

    it('should remove attribute', async () => {
      const elm = document.createElement('section');
      const body = document.querySelector('body');
      elm.setAttribute('hidden', 'hidden');
      body.appendChild(elm);
      await func();
      assert.isFalse(elm.hasAttribute('hidden'), 'hidden');
    });
  });

  describe('set sidebar theme', () => {
    const func = mjs.setSidebarTheme;

    it('should call functions', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.storage.local.get.withArgs({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      }).resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = NEW_TAB;
      elm.classList.add(TAB, NEW_TAB, CLASS_SEPARATOR_SHOW);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func();
      assert.isUndefined(res, 'result');
    });
  });
});
