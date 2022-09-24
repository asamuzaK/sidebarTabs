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
import {
  CLASS_COMPACT, CLASS_NARROW, CLASS_NARROW_TAB_GROUP, CLASS_SEPARATOR_SHOW,
  CLASS_THEME_CUSTOM, CLASS_THEME_DARK, CLASS_THEME_LIGHT, CLASS_THEME_SYSTEM,
  CUSTOM_BG, CUSTOM_BG_ACTIVE, CUSTOM_BG_DISCARDED, CUSTOM_BG_FIELD,
  CUSTOM_BG_FIELD_ACTIVE, CUSTOM_BG_HOVER, CUSTOM_BG_HOVER_SHADOW,
  CUSTOM_BG_SELECT, CUSTOM_BG_SELECT_HOVER,
  CUSTOM_BORDER_ACTIVE, CUSTOM_BORDER_FIELD, CUSTOM_BORDER_FIELD_ACTIVE,
  CUSTOM_COLOR, CUSTOM_COLOR_ACTIVE, CUSTOM_COLOR_DISCARDED,
  CUSTOM_COLOR_FIELD, CUSTOM_COLOR_FIELD_ACTIVE, CUSTOM_COLOR_HOVER,
  CUSTOM_COLOR_SELECT, CUSTOM_COLOR_SELECT_HOVER,
  CUSTOM_HEADING_TEXT_GROUP_1, CUSTOM_HEADING_TEXT_GROUP_2,
  CUSTOM_HEADING_TEXT_GROUP_3, CUSTOM_HEADING_TEXT_GROUP_4,
  CUSTOM_HEADING_TEXT_PINNED, CUSTOM_OUTLINE_FOCUS,
  NEW_TAB, NEW_TAB_SEPARATOR_SHOW, TAB,
  THEME, THEME_ALPEN, THEME_ALPEN_DARK, THEME_ALPEN_ID, THEME_AUTO,
  THEME_CURRENT, THEME_CURRENT_ID, THEME_CUSTOM, THEME_CUSTOM_ID,
  THEME_CUSTOM_SETTING, THEME_DARK, THEME_DARK_ID, THEME_LIGHT, THEME_LIGHT_ID,
  THEME_LIST, THEME_SYSTEM, THEME_SYSTEM_ID,
  THEME_UI_SCROLLBAR_NARROW, THEME_UI_TAB_COMPACT, THEME_UI_TAB_GROUP_NARROW,
  USER_CSS_ID
} from '../src/mjs/constant.js';

/* test */
import * as mjs from '../src/mjs/theme.js';

describe('theme', () => {
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
  });
  afterEach(() => {
    window = null;
    document = null;
    delete global.browser;
    delete global.window;
    delete global.document;
    browser._sandbox.reset();
  });

  it('should get browser object', () => {
    assert.isObject(browser, 'browser');
  });

  describe('theme map', () => {
    it('should get object', async () => {
      assert.isObject(mjs.themeMap, 'themeMap');
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
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
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
      await func('quux', 'currentcolor');
      await func('corge', 'foobar');
      assert.strictEqual(mjs.currentThemeColors.size, 5, 'size');
      assert.strictEqual(mjs.currentThemeColors.get('foo'), '#1234ab', 'map');
      assert.strictEqual(mjs.currentThemeColors.get('bar'), '#ff1234', 'map');
      assert.strictEqual(mjs.currentThemeColors.get('baz'), 'transparent',
        'map');
      assert.strictEqual(mjs.currentThemeColors.get('qux'), 'currentColor',
        'map');
      assert.strictEqual(mjs.currentThemeColors.get('quux'), 'currentcolor',
        'map');
      assert.isFalse(mjs.currentThemeColors.has('corge'), 'map');
    });
  });

  describe('get current theme base values', () => {
    const func = mjs.getCurrentThemeBaseValues;
    const { themeMap } = mjs;
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
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_DARK], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('accentcolor', '#ff0000');
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('textcolor', '#ff0000');
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('bookmark_text', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR_ACTIVE || key === CUSTOM_COLOR_SELECT) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('bookmark_text', 'currentColor');
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('frame', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      mjs.currentThemeColors.set('frame', 'currentColor');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      mjs.currentThemeColors.set('sidebar', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      mjs.currentThemeColors.set('sidebar', 'currentColor');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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

    it('should not set values', async () => {
      mjs.currentThemeColors.set('sidebar_highlight', '#ff0000');
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('sidebar_highlight_text', '#ff0000');
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('sidebar_highlight_text', '#0000ff');
      mjs.currentThemeColors.set('sidebar_highlight', '#ff0000');
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('sidebar_highlight_text', 'currentColor');
      mjs.currentThemeColors.set('sidebar_highlight', '#ff0000');
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values', async () => {
      mjs.currentThemeColors.set('sidebar_highlight_text', '#0000ff');
      mjs.currentThemeColors.set('sidebar_highlight', 'currentColor');
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should not set values if sidebar is not set', async () => {
      mjs.currentThemeColors.set('sidebar_text', '#ff0000');
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('sidebar', '#0000ff');
      mjs.currentThemeColors.set('sidebar_text', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED) {
          assert.strictEqual(value, '#ff0000', `${key}`);
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
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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

    it('should not set values', async () => {
      mjs.currentThemeColors.set('tab_background_separator', '#ff0000');
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_background_text', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED ||
            key === CUSTOM_COLOR_ACTIVE) {
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
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_line', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_line', 'currentColor');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_ACTIVE) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_border', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_border', 'currentColor');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_FIELD) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_border_focus', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      mjs.currentThemeColors.set('tab_selected', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_ACTIVE || key === CUSTOM_BG_SELECT) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_FIELD) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_focus', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_FIELD_ACTIVE) {
          assert.strictEqual(value, '#15141a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('tab_text', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_ACTIVE) {
          assert.strictEqual(value, 'currentColor', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_text', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('toolbar_field_text_focus', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('focus_outline', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_OUTLINE_FOCUS) {
          assert.strictEqual(value, '#15141a66', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('focus_outline', 'transparent');
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('button_primary', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
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
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_OUTLINE_FOCUS) {
          assert.strictEqual(value, '#15141a66', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it('should get values', async () => {
      mjs.currentThemeColors.set('button_primary', 'transparent');
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_LIGHT], 'result');
    });
  });

  describe('get base value', () => {
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
      browser.theme.getCurrent.resolves({});
      const res = await func('foo');
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({});
      const res = await func(THEME_ALPEN_ID);
      assert.deepEqual(res, mjs.themeMap[THEME_ALPEN], 'result');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      const res = await func(THEME_ALPEN_ID);
      assert.deepEqual(res, mjs.themeMap[THEME_ALPEN_DARK], 'result');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({});
      const res = await func(THEME_DARK_ID);
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({});
      const res = await func(THEME_LIGHT_ID);
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({});
      const res = await func(THEME_SYSTEM_ID);
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      const res = await func(THEME_SYSTEM_ID);
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
    });

    it('should get fallback values', async () => {
      browser.theme.getCurrent.resolves({
        foo: 'bar'
      });
      const res = await func('foo');
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get fallback values', async () => {
      browser.theme.getCurrent.resolves({
        colors: {}
      });
      const res = await func('foo');
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'red',
          icons: undefined
        }
      });
      const res = await func('foo');
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      assert.strictEqual(res[CUSTOM_BG], '#ff0000', 'color');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'red',
          sidebar: 'blue',
          icons: undefined
        }
      });
      const res = await func('foo');
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      assert.strictEqual(res[CUSTOM_BG], '#0000ff', 'color');
    });

    it('should equal alpenglow theme values', async () => {
      const dirName = path.dirname(fileURLToPath(import.meta.url));
      const filePath =
        path.resolve(dirName, '../resource', 'alpenglow-manifest.json');
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
      browser.theme.getCurrent.resolves({ colors });
      const res = await func('foo');
      assert.strictEqual(id, THEME_ALPEN_ID, 'id');
      assert.deepEqual(res, mjs.themeMap[THEME_ALPEN], 'result');
    });

    it('should equal dark alpenglow theme values', async () => {
      window.matchMedia().matches = true;
      const dirName = path.dirname(fileURLToPath(import.meta.url));
      const filePath =
        path.resolve(dirName, '../resource', 'alpenglow-manifest.json');
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
        dark_theme: {
          colors
        }
      } = JSON.parse(file);
      browser.theme.getCurrent.resolves({ colors });
      const res = await func('foo');
      assert.strictEqual(id, THEME_ALPEN_ID, 'id');
      assert.deepEqual(res, mjs.themeMap[THEME_ALPEN_DARK], 'result');
    });

    it('should equal dark theme values', async () => {
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
      browser.theme.getCurrent.resolves({ colors });
      const res = await func('foo');
      assert.strictEqual(id, THEME_DARK_ID, 'id');
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
    });

    it('should equal light theme values', async () => {
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
      browser.theme.getCurrent.resolves({ colors });
      const res = await func('foo');
      assert.strictEqual(id, THEME_LIGHT_ID, 'id');
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
      browser.storage.local.get.resolves({});
      await func();
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
        [CUSTOM_BG]: {
          value: '#ff0000'
        }
      });
      await func();
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
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.storage.local.get.resolves({});
      browser.storage.local.get.withArgs(THEME_LIST).resolves({});
      await func();
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
      browser.storage.local.get.resolves({});
      browser.storage.local.get.withArgs(THEME_LIST).resolves({
        [THEME_LIST]: {
          bar: {}
        }
      });
      await func();
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
      browser.storage.local.get.resolves({});
      browser.storage.local.get.withArgs(THEME_LIST).resolves({
        [THEME_LIST]: {
          foo: {
            id: 'foo',
            values: {
              [CUSTOM_BG]: '#ff0000'
            }
          }
        }
      });
      await func();
      assert.strictEqual(mjs.currentTheme.size, 2, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT_ID), 'id');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT_ID), 'foo',
        'id value');
      assert.isObject(mjs.currentTheme.get(THEME_CURRENT), 'key value');
      assert.strictEqual(mjs.currentTheme.get(THEME_CURRENT)[CUSTOM_BG],
        '#ff0000', 'value');
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
      browser.storage.local.get.withArgs(THEME_LIST).resolves({});
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
      browser.storage.local.get.withArgs(THEME_LIST).resolves({});
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
      browser.storage.local.get.withArgs(THEME_LIST).resolves({});
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const k = browser.storage.local.set.callCount;
      const l = browser.management.getAll.callCount;
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      const res = await func(true);
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
      browser.storage.local.get.withArgs(THEME_LIST).resolves({});
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
      browser.storage.local.get.resolves({});
      browser.storage.local.get.withArgs(THEME_LIST).resolves({});
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
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.strictEqual(browser.storage.local.remove.callCount, j,
        'not called');
      assert.strictEqual(browser.storage.local.set.callCount, k,
        'not called');
      assert.strictEqual(browser.management.getAll.callCount, l + 1,
        'called');
      assert.deepEqual(res, [
        {
          [THEME_CUSTOM_SETTING]: {
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
      browser.storage.local.get.resolves({});
      browser.storage.local.get.withArgs(THEME_LIST).resolves({
        [THEME_LIST]: {
          foo: {}
        }
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
      const res = await func(true);
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
      browser.storage.local.get.resolves({});
      browser.storage.local.get.withArgs(THEME_LIST).resolves({
        [THEME_LIST]: {
          foo: {}
        }
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
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.strictEqual(browser.storage.local.remove.callCount, j + 1,
        'called');
      assert.strictEqual(browser.storage.local.set.callCount, k,
        'not called');
      assert.strictEqual(browser.management.getAll.callCount, l + 2,
        'called');
      assert.deepEqual(res, [
        {
          [THEME_CUSTOM_SETTING]: {
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
      browser.storage.local.get.resolves({});
      browser.storage.local.get.withArgs(THEME_LIST).resolves({
        [THEME_LIST]: {
          foo: {},
          bar: {}
        }
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
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.strictEqual(browser.storage.local.remove.callCount, j,
        'not called');
      assert.strictEqual(browser.storage.local.set.callCount, k + 1,
        'called');
      assert.strictEqual(browser.management.getAll.callCount, l + 1,
        'called');
      assert.deepEqual(res, [
        {
          [THEME_CUSTOM_SETTING]: {
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
      browser.storage.local.get.resolves({});
      browser.storage.local.get.withArgs(THEME_LIST).resolves({
        [THEME_LIST]: {
          foo: {},
          bar: {}
        }
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
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.strictEqual(browser.storage.local.remove.callCount, j,
        'not called');
      assert.strictEqual(browser.storage.local.set.callCount, k + 1,
        'called');
      assert.strictEqual(browser.management.getAll.callCount, l + 2,
        'called');
      assert.deepEqual(res, [
        {
          [THEME_CUSTOM_SETTING]: {
            id: 'foo',
            values: currentTheme
          }
        },
        null
      ], 'result');
    });
  });

  describe('get theme', () => {
    const func = mjs.getTheme;

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
      assert.deepEqual(res, [THEME_SYSTEM, false], 'result');
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
      assert.deepEqual(res, [THEME_SYSTEM, false], 'result');
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

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if argument is not array', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should set auto light theme', async () => {
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: ['foo', false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func(['foo']);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set auto dark theme', async () => {
      window.matchMedia().matches = true;
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: ['foo', false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func(['foo']);
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
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
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

    it('should set system light theme', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
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

    it('should set system dark theme', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
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
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set light theme', async () => {
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_LIGHT, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func([THEME_LIGHT]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isFalse(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set light theme', async () => {
      window.matchMedia().matches = true;
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_LIGHT, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func([THEME_LIGHT]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isFalse(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set dark theme', async () => {
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_DARK, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      body.classList.remove(CLASS_THEME_DARK);
      body.classList.add(CLASS_THEME_LIGHT);
      await func([THEME_DARK]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isFalse(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set dark theme', async () => {
      window.matchMedia().matches = false;
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_DARK, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      body.classList.remove(CLASS_THEME_DARK);
      body.classList.add(CLASS_THEME_LIGHT);
      await func([THEME_DARK]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isFalse(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set custom theme', async () => {
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_CUSTOM, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      body.classList.remove(CLASS_THEME_DARK);
      body.classList.add(CLASS_THEME_LIGHT);
      await func([THEME_CUSTOM]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isFalse(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set custom theme', async () => {
      window.matchMedia().matches = true;
      const stubStorage = browser.storage.local.set.withArgs({
        [THEME]: [THEME_CUSTOM, false]
      });
      const i = stubStorage.callCount;
      const body = document.querySelector('body');
      body.classList.remove(CLASS_THEME_DARK);
      body.classList.add(CLASS_THEME_LIGHT);
      await func([THEME_CUSTOM]);
      assert.strictEqual(stubStorage.callCount, i + 1, 'called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isFalse(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });
  });

  describe('apply theme', () => {
    const func = mjs.applyTheme;
    beforeEach(() => {
      mjs.currentTheme.clear();
      mjs.currentThemeColors.clear();
    });
    afterEach(() => {
      mjs.currentTheme.clear();
      mjs.currentThemeColors.clear();
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({});
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      }).callCount;
      const j = browser.runtime.sendMessage.callCount;
      mjs.currentTheme.set(THEME_CURRENT, {});
      await func();
      assert.strictEqual(browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j + 1,
        'called');
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
      elm.textContent = 'body { color: red }';
      head.appendChild(elm);
      await func('body { color }');
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
      head.appendChild(elm);
      await func('body { color : red }\nmain { background: blue }');
      assert.strictEqual(elm.textContent,
        'body { color : red }\nmain { background: blue }', 'content');
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
      browser.storage.local.get.resolves({});
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
