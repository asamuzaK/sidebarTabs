/**
 * theme.test.js
 */

import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom } from './mocha/setup.js';
import * as mjs from '../src/mjs/theme.js';
import {
  CLASS_COMPACT, CLASS_NARROW, CLASS_NARROW_TAB_GROUP,
  CLASS_THEME_CUSTOM, CLASS_THEME_DARK, CLASS_THEME_LIGHT, CLASS_THEME_SYSTEM,
  CSS_ID, CUSTOM_BG, CUSTOM_BG_ACTIVE, CUSTOM_BG_DISCARDED, CUSTOM_BG_HOVER,
  CUSTOM_BG_HOVER_SHADOW, CUSTOM_BG_SELECT, CUSTOM_BG_SELECT_HOVER,
  CUSTOM_BORDER_ACTIVE,
  CUSTOM_COLOR, CUSTOM_COLOR_ACTIVE, CUSTOM_COLOR_DISCARDED,
  CUSTOM_COLOR_HOVER, CUSTOM_COLOR_SELECT, CUSTOM_COLOR_SELECT_HOVER,
  CUSTOM_HEADING_TEXT_GROUP_1, CUSTOM_HEADING_TEXT_GROUP_2,
  CUSTOM_HEADING_TEXT_GROUP_3, CUSTOM_HEADING_TEXT_GROUP_4,
  CUSTOM_HEADING_TEXT_PINNED,
  THEME, THEME_ALPEN, THEME_ALPEN_DARK, THEME_ALPEN_ID, THEME_AUTO,
  THEME_CURRENT, THEME_CUSTOM, THEME_CUSTOM_SETTING, THEME_DARK, THEME_DARK_ID,
  THEME_LIGHT, THEME_LIGHT_ID, THEME_SYSTEM, THEME_SYSTEM_ID,
  THEME_UI_SCROLLBAR_NARROW, THEME_UI_TAB_COMPACT, THEME_UI_TAB_GROUP_NARROW
} from '../src/mjs/constant.js';

describe('theme', () => {
  let window, document;
  beforeEach(() => {
    const dom = createJsdom();
    window = dom && dom.window;
    document = window && window.document;
    browser._sandbox.reset();
    browser.i18n.getMessage.callsFake((...args) => args.toString());
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
      assert.strictEqual(mjs.currentThemeColors.size, 3, 'size');
      assert.strictEqual(mjs.currentThemeColors.get('foo'), '#1234ab', 'map');
      assert.strictEqual(mjs.currentThemeColors.get('bar'), '#ff1234', 'map');
      assert.strictEqual(mjs.currentThemeColors.get('baz'), 'transparent',
        'map');
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

    it('should get values', async () => {
      mjs.currentThemeColors.set('sidebar_highlight_text', '#0000ff');
      mjs.currentThemeColors.set('sidebar_highlight', '#ff0000');
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], 'result');
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_SELECT) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else if (key === CUSTOM_COLOR_SELECT ||
                   key === CUSTOM_COLOR_SELECT_HOVER) {
          assert.strictEqual(value, '#0000ff', `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, '#e5001a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
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
        if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED) {
          assert.strictEqual(value, '#ff0000', `${key}`);
        } else if (key === CUSTOM_BG_HOVER_SHADOW) {
          assert.strictEqual(value, '#ff00001a', `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
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
      mjs.currentThemeColors.set('tab_text', '#ff0000');
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
      browser.management.getAll.resolves(null);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get fallback values', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_ALPEN_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_ALPEN], 'result');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_ALPEN_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_ALPEN_DARK], 'result');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_DARK_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_LIGHT_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
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
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      window.matchMedia().matches = true;
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_SYSTEM_ID,
          enabled: true,
          type: 'theme'
        }
      ]);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
    });

    it('should get fallback values', async () => {
      browser.theme.getCurrent.resolves({
        foo: 'bar'
      });
      browser.management.getAll.resolves(null);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get fallback values', async () => {
      browser.theme.getCurrent.resolves({
        colors: {}
      });
      browser.management.getAll.resolves(null);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should get values', async () => {
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'red',
          icons: undefined
        }
      });
      browser.management.getAll.resolves(null);
      const res = await func();
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
      browser.management.getAll.resolves(null);
      const res = await func();
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
      assert.strictEqual(res[CUSTOM_BG], '#0000ff', 'color');
    });

    it('should equal alpenglow theme values', async () => {
      // https://hg.mozilla.org/mozilla-central/raw-file/tip/browser/themes/addons/alpenglow/manifest.json
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'hsla(240, 20%, 98%, 1)',
          toolbar: 'hsla(0, 0%, 100%, .76)',
          button_background_active: 'hsla(240, 26%, 11%, .16)',
          button_background_hover: 'hsla(240, 26%, 11%, .08)',
          icons: 'hsla(258, 66%, 48%, 1)',
          icons_attention: 'hsla(180, 100%, 32%, 1)',
          toolbar_text: 'hsla(261, 53%, 15%, 1)',
          toolbar_vertical_separator: 'hsla(261, 53%, 15%, .2)',
          toolbar_field: 'hsla(0, 0%, 100%, .8)',
          toolbar_field_focus: 'hsla(261, 53%, 15%, .96)',
          toolbar_field_text: 'hsla(261, 53%, 15%, 1)',
          toolbar_field_text_focus: 'hsla(255, 100%, 94%, 1)',
          toolbar_field_border: 'transparent',
          toolbar_field_border_focus: 'hsla(265, 100%, 72%, 1)',
          toolbar_field_highlight: 'hsla(265, 100%, 72%, .32)',
          toolbar_top_separator: 'transparent',
          toolbar_bottom_separator: 'hsla(261, 53%, 15%, .32)',
          bookmark_text: 'hsla(261, 53%, 15%, 1)',
          tab_text: 'hsla(261, 53%, 15%, 1)',
          tab_background_text: 'hsla(261, 53%, 15%, 1)',
          tab_background_separator: 'hsla(261, 53%, 15%, 1)',
          tab_line: 'hsla(265, 100%, 72%, 1)',
          tab_loading: 'hsla(265, 100%, 72%, 1)',
          ntp_background: '#F9F9FB',
          ntp_text: 'hsla(261, 53%, 15%, 1)',
          popup: 'hsla(254, 46%, 21%, 1)',
          popup_text: 'hsla(255, 100%, 94%, 1)',
          popup_border: 'hsla(255, 100%, 94%, .32)',
          popup_highlight: 'hsla(255, 100%, 94%, .12)',
          popup_highlight_text: 'hsla(0, 0%, 100%, 1)',
          sidebar: 'hsla(240, 15%, 95%, 1)',
          sidebar_text: 'hsla(261, 53%, 15%, 1)',
          sidebar_border: 'hsla(261, 53%, 15%, .24)',
          sidebar_highlight: 'hsla(265, 100%, 72%, 1)',
          sidebar_highlight_text: 'hsla(0, 0%, 100%, 1)',
          focus_outline: 'hsla(258, 65%, 48%, 1)'
        }
      });
      browser.management.getAll.resolves(null);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_ALPEN], 'result');
    });

    it('should equal dark alpenglow theme values', async () => {
      window.matchMedia().matches = true;
      // https://hg.mozilla.org/mozilla-central/raw-file/tip/browser/themes/addons/alpenglow/manifest.json
      browser.theme.getCurrent.resolves({
        colors: {
          frame: 'hsla(240, 20%, 98%, 1)',
          toolbar: 'hsla(254, 46%, 21%, .96)',
          button_background_active: 'hsla(255, 100%, 94%, .24)',
          button_background_hover: 'hsla(255, 100%, 94%, .12)',
          icons: 'hsla(271, 100%, 77%, 1)',
          icons_attention: 'hsla(157, 100%, 66%, 1)',
          toolbar_text: 'hsla(255, 100%, 94%, 1)',
          toolbar_vertical_separator: 'hsla(271, 100%, 77%, .4)',
          toolbar_field: 'hsla(250, 43%, 25%, 1)',
          toolbar_field_focus: 'hsla(250, 43%, 25%, .98)',
          toolbar_field_text: 'hsla(255, 100%, 94%, 1)',
          toolbar_field_text_focus: 'hsla(255, 100%, 94%, 1)',
          toolbar_field_border: 'transparent',
          toolbar_field_border_focus: 'hsla(265, 100%, 72%, 1)',
          toolbar_field_highlight: 'hsla(265, 100%, 72%, .32)',
          toolbar_top_separator: 'transparent',
          toolbar_bottom_separator: 'hsla(245, 38%, 33%, .96)',
          bookmark_text: 'hsla(255, 100%, 94%, 1)',
          tab_selected: 'rgb(60, 31, 123)',
          tab_text: 'hsla(255, 100%, 94%, 1)',
          tab_background_text: 'hsla(255, 100%, 94%, 1)',
          tab_background_separator: 'hsla(255, 100%, 94%, 1)',
          tab_line: 'hsla(265, 100%, 72%, 1)',
          tab_loading: 'hsla(265, 100%, 72%, 1)',
          ntp_background: '#2A2A2E',
          ntp_text: 'hsla(255, 100%, 94%, 1)',
          popup: 'hsla(250, 43%, 25%, 1)',
          popup_text: 'hsla(255, 100%, 94%, 1)',
          popup_border: 'hsla(255, 100%, 94%, .32)',
          popup_highlight: 'hsla(255, 100%, 94%, .12)',
          popup_highlight_text: 'hsla(0, 0%, 100%, 1)',
          sidebar: 'hsla(250, 43%, 25%, 1)',
          sidebar_text: 'hsla(255, 100%, 94%, 1)',
          sidebar_border: 'hsla(255, 100%, 94%, .24)',
          sidebar_highlight: 'hsla(259, 76%, 58%, 1)',
          sidebar_highlight_text: 'hsla(0, 0%, 100%, 1)',
          focus_outline: 'hsla(265, 100%, 72%, 1)'
        }
      });
      browser.management.getAll.resolves(null);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_ALPEN_DARK], 'result');
    });

    it('should equal light theme values', async () => {
      // https://hg.mozilla.org/mozilla-central/raw-file/tip/browser/themes/addons/light/manifest.json
      browser.theme.getCurrent.resolves({
        colors: {
          tab_background_text: 'rgb(21,20,26)',
          tab_selected: '#fff',
          tab_text: 'rgb(21,20,26)',
          icons: 'rgb(91,91,102)',
          frame: '#f0f0f4',
          popup: '#fff',
          popup_text: 'rgb(21,20,26)',
          popup_border: 'rgb(240,240,244)',
          popup_highlight: '#e0e0e6',
          popup_highlight_text: '#15141a',
          tab_line: 'rgba(128,128,142,0.9)',
          toolbar: '#f9f9fb',
          toolbar_top_separator: 'transparent',
          toolbar_bottom_separator: '#ccc',
          toolbar_field: '#f0f0f4',
          toolbar_field_text: 'rgb(21,20,26)',
          toolbar_field_border: 'transparent',
          toolbar_field_focus: 'white',
          toolbar_text: 'rgb(21,20,26)',
          ntp_background: '#F9F9FB',
          ntp_text: 'rgb(21, 20, 26)',
          popup_action_color: 'rgb(91,91,102)',
          button: 'rgb(240,240,244)',
          button_hover: 'rgb(224,224,230)',
          button_active: 'rgb(207,207,216)',
          button_primary: 'rgb(0, 97, 224)',
          button_primary_hover: 'rgb(2, 80, 187)',
          button_primary_active: 'rgb(5, 62, 148)',
          button_primary_color: 'rgb(251, 251, 254)',
          checkbox_border_color: 'rgb(143, 143, 157)',
          checkbox_unchecked_background: 'rgb(240, 240, 244)',
          checkbox_unchecked_background_hover: 'rgb(224, 224, 230)',
          checkbox_unchecked_background_active: 'rgb(207, 207, 216)',
          checkbox_checked_background: 'rgb(0, 97, 224)',
          checkbox_checked_background_hover: 'rgb(2, 80, 187)',
          checkbox_checked_background_active: 'rgb(5, 62, 148)',
          checkbox_checked_color: 'rgb(251, 251, 254)',
          error_text_color: 'rgb(197,0,66)',
          autocomplete_popup_hover: 'rgb(240,240,244)',
          autocomplete_popup_separator: 'rgb(240,240,244)',
          appmenu_update_icon_color: '#2AC3A2',
          appmenu_warning_icon_color: '#FFA436',
          appmenu_info_icon_color: '#0090ED',
          tab_icon_overlay_stroke: 'rgb(255,255,255)',
          tab_icon_overlay_fill: 'rgb(91,91,102)'
        }
      });
      browser.management.getAll.resolves(null);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], 'result');
    });

    it('should equal dark theme values', async () => {
      window.matchMedia().matches = true;
      // https://hg.mozilla.org/mozilla-central/raw-file/tip/browser/themes/addons/dark/manifest.json
      browser.theme.getCurrent.resolves({
        colors: {
          tab_background_text: '#fbfbfe',
          tab_selected: 'rgb(66,65,77)',
          tab_text: 'rgb(251,251,254)',
          icons: 'rgb(251,251,254)',
          frame: '#1c1b22',
          popup: 'rgb(66,65,77)',
          popup_text: 'rgb(251,251,254)',
          popup_border: 'rgb(82,82,94)',
          popup_highlight: 'rgb(43,42,51)',
          tab_line: 'transparent',
          toolbar: 'rgb(43,42,51)',
          toolbar_top_separator: 'transparent',
          toolbar_bottom_separator: 'hsl(240, 5%, 5%)',
          toolbar_field: 'rgb(28,27,34)',
          toolbar_field_border: 'transparent',
          toolbar_field_text: 'rgb(251,251,254)',
          toolbar_field_focus: 'rgb(66,65,77)',
          toolbar_text: 'rgb(251, 251, 254)',
          ntp_background: '#2A2A2E',
          ntp_text: 'rgb(251, 251, 254)',
          sidebar: '#38383D',
          sidebar_text: 'rgb(249, 249, 250)',
          sidebar_border: 'rgba(255, 255, 255, 0.1)',
          button: 'rgb(43,42,51)',
          button_hover: 'rgb(82,82,94)',
          button_active: 'rgb(91,91,102)',
          button_primary: 'rgb(0, 221, 255)',
          button_primary_hover: 'rgb(128, 235, 255)',
          button_primary_active: 'rgb(170, 242, 255)',
          button_primary_color: 'rgb(43, 42, 51)',
          checkbox_border_color: 'rgb(143, 143, 157)',
          checkbox_unchecked_background: 'rgb(43, 42, 51)',
          checkbox_unchecked_background_hover: 'rgb(82, 82, 94)',
          checkbox_unchecked_background_active: 'rgb(91, 91, 102)',
          checkbox_checked_background: 'rgb(0, 221, 255)',
          checkbox_checked_color: 'rgb(43, 42, 51)',
          checkbox_checked_background_hover: 'rgb(128, 235, 255)',
          checkbox_checked_background_active: 'rgb(170, 242, 255)',
          error_text_color: 'rgb(255, 154, 162)',
          input_background: '#42414D',
          input_color: '#BFBFC9',
          input_border: '#8f8f9d',
          input_border_error: 'rgb(255, 132, 138)',
          zoom_controls: 'rgb(74,74,85)',
          autocomplete_popup_separator: 'rgb(82,82,94)',
          appmenu_update_icon_color: '#54FFBD',
          appmenu_warning_icon_color: '#FFBD4F',
          appmenu_info_icon_color: '#80EBFF',
          tab_icon_overlay_stroke: 'rgb(66,65,77)',
          tab_icon_overlay_fill: 'rgb(251,251,254)'
        }
      });
      browser.management.getAll.resolves(null);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], 'result');
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
      browser.storage.local.get.resolves({});
      await func();
      assert.strictEqual(mjs.currentTheme.size, 1, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
    });

    it('should set theme', async () => {
      browser.storage.local.get.resolves({
        [CUSTOM_BG]: {
          value: '#ff0000'
        }
      });
      await func();
      assert.strictEqual(mjs.currentTheme.size, 1, 'size');
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), 'key');
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

    it('it should get null', async () => {
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('it should get null', async () => {
      browser.runtime.sendMessage.callsFake((...args) => args);
      mjs.currentTheme.set(THEME_CURRENT, {
        foo: 'bar'
      });
      const res = await func();
      assert.deepEqual(res, [
        null,
        {
          [THEME_CUSTOM_SETTING]: {
            foo: 'bar'
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
      elm.id = CSS_ID;
      body.appendChild(elm);
      await func('.foo');
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 0, 'length');
    });

    it('should not update stylesheet if map is empty object', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = CSS_ID;
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
      elm.id = CSS_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func('.foo');
      assert.strictEqual(elm.textContent, '', 'content');
    });

    it('should update stylesheet', async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = CSS_ID;
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
      elm.id = CSS_ID;
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
      elm.id = CSS_ID;
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
      elm.id = CSS_ID;
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
      elm.id = CSS_ID;
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
      elm.id = CSS_ID;
      body.appendChild(elm);
      await func();
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 0, 'length');
    });

    it('should delete style', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = CSS_ID;
      body.appendChild(elm);
      elm.sheet.insertRule(`.${CLASS_THEME_CUSTOM} { background: red; }`, 0);
      await func();
      const { sheet } = elm;
      assert.strictEqual(sheet.cssRules.length, 0, 'length');
    });

    it('should delete style', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = CSS_ID;
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
      browser.runtime.sendMessage.callsFake((...args) => args);
      const i = browser.runtime.sendMessage.callCount;
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.runtime.sendMessage.callsFake((...args) => args);
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = CSS_ID;
      body.appendChild(elm);
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
      assert.strictEqual(browser.storage.local.remove.callCount, j,
        'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.runtime.sendMessage.callsFake((...args) => args);
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = CSS_ID;
      body.appendChild(elm);
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
      assert.strictEqual(browser.storage.local.remove.callCount, j,
        'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.runtime.sendMessage.callsFake((...args) => args);
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
      assert.strictEqual(browser.storage.local.remove.callCount, j,
        'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.runtime.sendMessage.callsFake((...args) => args);
      browser.storage.local.get.resolves({});
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = CSS_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.strictEqual(browser.storage.local.remove.callCount, j,
        'not called');
      assert.deepEqual(res, [
        null,
        {
          [THEME_CUSTOM_SETTING]: currentTheme
        },
        null
      ], 'result');
    });

    it('should call function', async () => {
      browser.runtime.sendMessage.callsFake((...args) => args);
      browser.storage.local.get.resolves({});
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = CSS_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.strictEqual(browser.storage.local.remove.callCount, j + 1,
        'called');
      assert.deepEqual(res, [
        null,
        {
          [THEME_CUSTOM_SETTING]: currentTheme
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
      const body = document.querySelector('body');
      const i = browser.storage.local.set.callCount;
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func(['foo']);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set auto dark theme', async () => {
      window.matchMedia().matches = true;
      const body = document.querySelector('body');
      const i = browser.storage.local.set.callCount;
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func(['foo']);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set system light theme', async () => {
      const body = document.querySelector('body');
      const i = browser.storage.local.set.callCount;
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func([THEME_SYSTEM]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set system dark theme', async () => {
      window.matchMedia().matches = true;
      const body = document.querySelector('body');
      const i = browser.storage.local.set.callCount;
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func([THEME_SYSTEM]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isTrue(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set light theme', async () => {
      const body = document.querySelector('body');
      const i = browser.storage.local.set.callCount;
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func([THEME_LIGHT]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isFalse(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set light theme', async () => {
      window.matchMedia().matches = true;
      const body = document.querySelector('body');
      const i = browser.storage.local.set.callCount;
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func([THEME_LIGHT]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isFalse(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set dark theme', async () => {
      const body = document.querySelector('body');
      const i = browser.storage.local.set.callCount;
      body.classList.remove(CLASS_THEME_DARK);
      body.classList.add(CLASS_THEME_LIGHT);
      await func([THEME_DARK]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isFalse(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set dark theme', async () => {
      window.matchMedia().matches = false;
      const body = document.querySelector('body');
      const i = browser.storage.local.set.callCount;
      body.classList.remove(CLASS_THEME_DARK);
      body.classList.add(CLASS_THEME_LIGHT);
      await func([THEME_DARK]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isFalse(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set custom theme', async () => {
      const body = document.querySelector('body');
      const i = browser.storage.local.set.callCount;
      body.classList.remove(CLASS_THEME_DARK);
      body.classList.add(CLASS_THEME_LIGHT);
      await func([THEME_CUSTOM]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), 'custom');
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), 'dark');
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), 'light');
      assert.isFalse(body.classList.contains(CLASS_THEME_SYSTEM), 'system');
    });

    it('should set custom theme', async () => {
      window.matchMedia().matches = true;
      const body = document.querySelector('body');
      const i = browser.storage.local.set.callCount;
      body.classList.remove(CLASS_THEME_DARK);
      body.classList.add(CLASS_THEME_LIGHT);
      await func([THEME_CUSTOM]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
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
      await func();
      assert.strictEqual(browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      }).callCount, i + 1, 'called');
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

    it('should set height', async () => {
      const body = document.querySelector('body');
      body.classList.remove(CLASS_COMPACT);
      await func(true);
      assert.isTrue(body.classList.contains(CLASS_COMPACT));
    });

    it('should set height', async () => {
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

    it('should set width', async () => {
      const body = document.querySelector('body');
      body.classList.remove(CLASS_NARROW);
      await func(true);
      assert.isTrue(body.classList.contains(CLASS_NARROW));
    });

    it('should set width', async () => {
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

    it('should set width', async () => {
      const body = document.querySelector('body');
      body.classList.remove(CLASS_NARROW_TAB_GROUP);
      await func(true);
      assert.isTrue(body.classList.contains(CLASS_NARROW_TAB_GROUP));
    });

    it('should set width', async () => {
      const body = document.querySelector('body');
      body.classList.add(CLASS_NARROW_TAB_GROUP);
      await func(false);
      assert.isFalse(body.classList.contains(CLASS_NARROW_TAB_GROUP));
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
      browser.storage.local.get.resolves({});
      const res = await func();
      assert.isUndefined(res, 'result');
    });
  });
});
