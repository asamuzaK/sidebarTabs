/**
 * theme.test.js
 */

import {JSDOM} from "jsdom";
import {assert} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import {browser} from "./mocha/setup.js";
import * as mjs from "../src/mjs/theme.js";
import {
  CLASS_COMPACT, CLASS_NARROW,
  CLASS_THEME_CUSTOM, CLASS_THEME_DARK, CLASS_THEME_LIGHT,
  CSS_ID, CUSTOM_BG, CUSTOM_BG_ACTIVE, CUSTOM_BG_DISCARDED,
  CUSTOM_BG_HOVER_SHADOW, CUSTOM_BG_SELECT, CUSTOM_BG_SELECT_HOVER,
  CUSTOM_BORDER, CUSTOM_BORDER_ACTIVE, CUSTOM_BORDER_DISCARDED,
  CUSTOM_COLOR, CUSTOM_COLOR_ACTIVE, CUSTOM_COLOR_DISCARDED,
  THEME, THEME_CURRENT, THEME_CUSTOM, THEME_CUSTOM_SETTING,
  THEME_DARK, THEME_DARK_ID, THEME_LIGHT, THEME_LIGHT_ID,
  THEME_SCROLLBAR_NARROW, THEME_TAB_COMPACT,
} from "../src/mjs/constant.js";

describe("theme", () => {
  /**
   * create jsdom
   * @returns {Object} - jsdom instance
   */
  const createJsdom = () => {
    const domstr = "<!DOCTYPE html><html><head></head><body></body></html>";
    const opt = {
      runScripts: "dangerously",
    };
    return new JSDOM(domstr, opt);
  };
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

  it("should get browser object", () => {
    assert.isObject(browser, "browser");
  });

  describe("theme map", () => {
    it("should get object", async () => {
      assert.isObject(mjs.themeMap, "themeMap");
    });
  });

  describe("current theme colors", () => {
    it("should get map", async () => {
      assert.instanceOf(mjs.currentThemeColors, Map, "currentThemeColors");
    });
  });

  describe("current theme", () => {
    it("should get map", async () => {
      assert.instanceOf(mjs.currentTheme, Map, "currentTheme");
    });
  });

  describe("set current theme colors map", () => {
    const func = mjs.setCurrentThemeColors;
    beforeEach(() => {
      mjs.currentThemeColors.clear();
    });
    afterEach(() => {
      mjs.currentThemeColors.clear();
    });

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "message");
      });
    });

    it("should throw", async () => {
      await func("foo").catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "message");
      });
    });

    it("should not set map if 2nd arg is not a color", async () => {
      await func("foo", "bar");
      assert.strictEqual(mjs.currentThemeColors.size, 0, "size");
    });

    it("should set map", async () => {
      await func("foo", "#1234AB");
      await func("bar", "#FF1234");
      assert.strictEqual(mjs.currentThemeColors.size, 2, "size");
      assert.strictEqual(mjs.currentThemeColors.get("foo"), "#1234ab", "map");
      assert.strictEqual(mjs.currentThemeColors.get("bar"), "#ff1234", "map");
    });
  });

  describe("get current theme base values", () => {
    const func = mjs.getCurrentThemeBaseValues;
    const {themeMap} = mjs;
    beforeEach(() => {
      mjs.currentThemeColors.clear();
    });
    afterEach(() => {
      mjs.currentThemeColors.clear();
    });

    it("should throw", async () => {
      mjs.currentThemeColors.set("tab_line", "foo");
      const res = await func().catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected String but got Null.",
                           "message");
      });
    });

    it("should get values", async () => {
      const res = await func();
      assert.deepEqual(res, themeMap[THEME_LIGHT], "result");
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("sidebar", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("frame", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("accentcolor", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_BG || key === CUSTOM_BG_DISCARDED) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("sidebar_highlight", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_ACTIVE) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("tab_selected", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_ACTIVE) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("toolbar", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_ACTIVE) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("tab_line", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_SELECT) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, "#e60101", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("tab_line", "#ff0000");
      mjs.currentThemeColors.set("tab_background_text", "#0000ff");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_SELECT) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, "#e5001a", `${key}`);
        } else if (key === CUSTOM_BG_HOVER_SHADOW) {
          assert.strictEqual(value, "#0000ff1a", `${key}`);
        } else if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED) {
          assert.strictEqual(value, "#0000ff", `${key}`);
        } else if (key === CUSTOM_COLOR_ACTIVE) {
          assert.strictEqual(value, "#0000ff", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("tab_line", "#ff0000");
      mjs.currentThemeColors.set("textcolor", "#0000ff");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_BG_SELECT) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else if (key === CUSTOM_BG_SELECT_HOVER) {
          assert.strictEqual(value, "#e5001a", `${key}`);
        } else if (key === CUSTOM_BG_HOVER_SHADOW) {
          assert.strictEqual(value, "#0000ff1a", `${key}`);
        } else if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED) {
          assert.strictEqual(value, "#0000ff", `${key}`);
        } else if (key === CUSTOM_COLOR_ACTIVE) {
          assert.strictEqual(value, "#0000ff", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("sidebar_border", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER || key === CUSTOM_BORDER_ACTIVE ||
            key === CUSTOM_BORDER_DISCARDED) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("tab_background_separator", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER || key === CUSTOM_BORDER_ACTIVE ||
            key === CUSTOM_BORDER_DISCARDED) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("toolbar_top_separator", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_ACTIVE) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("toolbar_bottom_separator", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_BORDER_ACTIVE) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("sidebar_text", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_DISCARDED) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("tab_background_text", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_ACTIVE ||
            key === CUSTOM_COLOR_DISCARDED) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else if (key === CUSTOM_BG_HOVER_SHADOW) {
          assert.strictEqual(value, "#ff00001a", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("textcolor", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR || key === CUSTOM_COLOR_ACTIVE ||
            key === CUSTOM_COLOR_DISCARDED) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else if (key === CUSTOM_BG_HOVER_SHADOW) {
          assert.strictEqual(value, "#ff00001a", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("sidebar_highlight_text", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR_ACTIVE) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("tab_text", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR_ACTIVE) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("bookmark_text", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR_ACTIVE) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });

    it("should get values", async () => {
      mjs.currentThemeColors.set("toolbar_text", "#ff0000");
      const res = await func();
      const obj = themeMap[THEME_LIGHT];
      const items = Object.entries(res);
      assert.notDeepEqual(res, themeMap[THEME_LIGHT], "result");
      for (const [key, value] of items) {
        if (key === CUSTOM_COLOR_ACTIVE) {
          assert.strictEqual(value, "#ff0000", `${key}`);
        } else {
          assert.strictEqual(value, obj[key], `${key}`);
        }
      }
    });
  });

  describe("get base value", () => {
    const func = mjs.getBaseValues;
    beforeEach(() => {
      mjs.currentThemeColors.clear();
    });
    afterEach(() => {
      mjs.currentThemeColors.clear();
    });

    it("should get fallback values", async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves(null);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], "result");
    });

    it("should get fallback values", async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: "foo",
          enabled: true,
          type: "theme",
        },
      ]);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], "result");
    });

    it("should get values", async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_DARK_ID,
          enabled: true,
          type: "theme",
        },
      ]);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_DARK], "result");
    });

    it("should get values", async () => {
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: THEME_LIGHT_ID,
          enabled: true,
          type: "theme",
        },
      ]);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], "result");
    });

    it("should get fallback values", async () => {
      browser.theme.getCurrent.resolves({
        foo: "bar",
      });
      browser.management.getAll.resolves(null);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], "result");
    });

    it("should get fallback values", async () => {
      browser.theme.getCurrent.resolves({
        colors: {},
      });
      browser.management.getAll.resolves(null);
      const res = await func();
      assert.deepEqual(res, mjs.themeMap[THEME_LIGHT], "result");
    });

    it("should get values", async () => {
      browser.theme.getCurrent.resolves({
        colors: {
          accentcolor: "red",
          icons: undefined,
        },
      });
      browser.management.getAll.resolves(null);
      const res = await func();
      assert.notDeepEqual(res, mjs.themeMap[THEME_LIGHT], "result");
      assert.strictEqual(res[CUSTOM_BG], "#ff0000", "color");
    });
  });

  describe("set current theme value", () => {
    const func = mjs.setCurrentThemeValue;
    beforeEach(() => {
      mjs.currentTheme.clear();
    });
    afterEach(() => {
      mjs.currentTheme.clear();
    });

    it("should set theme", async () => {
      browser.storage.local.get.resolves({});
      await func();
      assert.strictEqual(mjs.currentTheme.size, 1, "size");
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), "key");
    });

    it("should set theme", async () => {
      browser.storage.local.get.resolves({
        [CUSTOM_BG]: {
          value: "#ff0000",
        },
      });
      await func();
      assert.strictEqual(mjs.currentTheme.size, 1, "size");
      assert.isTrue(mjs.currentTheme.has(THEME_CURRENT), "key");
    });
  });

  describe("send current theme values", () => {
    const func = mjs.sendCurrentTheme;
    beforeEach(() => {
      mjs.currentTheme.clear();
    });
    afterEach(() => {
      mjs.currentTheme.clear();
    });

    it("it should get null", async () => {
      const res = await func();
      assert.isNull(res, "result");
    });

    it("it should get null", async () => {
      browser.runtime.sendMessage.callsFake((...args) => args);
      mjs.currentTheme.set(THEME_CURRENT, {
        foo: "bar",
      });
      const res = await func();
      assert.deepEqual(res, [
        null,
        {
          [THEME_CUSTOM_SETTING]: {
            foo: "bar",
          },
        },
        null,
      ], "result");
    });
  });

  describe("update custom theme CSS", () => {
    const func = mjs.updateCustomThemeCss;
    beforeEach(() => {
      mjs.currentTheme.clear();
    });
    afterEach(() => {
      mjs.currentTheme.clear();
    });

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "message");
      });
    });

    it("should not update stylesheet if map is not set", async () => {
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      await func(".foo");
      const {sheet} = elm;
      assert.strictEqual(sheet.cssRules.length, 0, "length");
    });

    it("should not update stylesheet if map is empty object", async () => {
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, {});
      await func(".foo");
      const {sheet} = elm;
      assert.strictEqual(sheet.cssRules.length, 0, "length");
    });

    it("should not update stylesheet if ID does not match", async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = "bar";
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func(".foo");
      const {sheet} = elm;
      assert.strictEqual(sheet.cssRules.length, 0, "length");
    });

    it("should not update stylesheet if element is not style", async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func(".foo");
      assert.strictEqual(elm.textContent, "", "content");
    });

    it("should update stylesheet", async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func(".foo");
      const {sheet} = elm;
      assert.strictEqual(sheet.cssRules.length, 1, "length");
      assert.strictEqual(sheet.cssRules[0].selectorText, ".foo", "selector");
    });

    it("should update stylesheet", async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      elm.sheet.insertRule(".bar { background: red; }", 0);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func(".foo");
      const {sheet} = elm;
      assert.strictEqual(sheet.cssRules.length, 2, "length");
      assert.strictEqual(sheet.cssRules[0].selectorText, ".bar", "selector");
      assert.strictEqual(sheet.cssRules[1].selectorText, ".foo", "selector");
    });

    it("should update stylesheet", async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      elm.sheet.insertRule(".foo { background: red; }", 0);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func(".foo");
      const {sheet} = elm;
      assert.strictEqual(sheet.cssRules.length, 1, "length");
      assert.strictEqual(sheet.cssRules[0].selectorText, ".foo", "selector");
    });

    it("should update stylesheet", async () => {
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      elm.sheet.insertRule(".foo { background: red; }", 0);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      await func(".foo", CUSTOM_BG, "#0000ff");
      const {sheet} = elm;
      const customTheme = mjs.currentTheme.get(THEME_CURRENT);
      assert.strictEqual(sheet.cssRules.length, 1, "length");
      assert.strictEqual(sheet.cssRules[0].selectorText, ".foo", "selector");
      assert.strictEqual(customTheme[CUSTOM_BG], "#0000ff", "theme");
    });
  });

  describe("delete custom them CSS rule", () => {
    const func = mjs.deleteCustomThemeCss;

    it("should not delete style if ID does not match", async () => {
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = "bar";
      body.appendChild(elm);
      elm.sheet.insertRule(`.${CLASS_THEME_CUSTOM} { background: red; }`, 0);
      await func();
      const {sheet} = elm;
      assert.strictEqual(sheet.cssRules.length, 1, "length");
      assert.strictEqual(sheet.cssRules[0].selectorText,
                         `.${CLASS_THEME_CUSTOM}`, "selector");
    });

    it("should not delete style if selector does not match", async () => {
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      elm.sheet.insertRule(".foo { background: red; }", 0);
      await func();
      const {sheet} = elm;
      assert.strictEqual(sheet.cssRules.length, 1, "length");
      assert.strictEqual(sheet.cssRules[0].selectorText, ".foo", "selector");
    });

    it("should not delete style if no rules", async () => {
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      await func();
      const {sheet} = elm;
      assert.strictEqual(sheet.cssRules.length, 0, "length");
    });

    it("should delete style", async () => {
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      elm.sheet.insertRule(`.${CLASS_THEME_CUSTOM} { background: red; }`, 0);
      await func();
      const {sheet} = elm;
      assert.strictEqual(sheet.cssRules.length, 0, "length");
    });

    it("should delete style", async () => {
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      elm.sheet.insertRule(`.${CLASS_THEME_CUSTOM} { background: red; }`, 0);
      elm.sheet.insertRule(".foo { color: red; }", 1);
      elm.sheet.insertRule(`.${CLASS_THEME_CUSTOM} { color: blue; }`, 2);
      await func();
      const {sheet} = elm;
      assert.strictEqual(sheet.cssRules.length, 1, "length");
      assert.strictEqual(sheet.cssRules[0].selectorText, ".foo", "selector");
    });
  });

  describe("init custom theme", () => {
    const func = mjs.initCustomTheme;
    beforeEach(() => {
      mjs.currentTheme.clear();
      mjs.currentThemeColors.clear();
    });
    afterEach(() => {
      mjs.currentTheme.clear();
      mjs.currentThemeColors.clear();
    });

    it("should not call function", async () => {
      browser.runtime.sendMessage.callsFake((...args) => args);
      const i = browser.runtime.sendMessage.callCount;
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
                         "not called");
      assert.isNull(res, "result");
    });

    it("should not call function", async () => {
      browser.runtime.sendMessage.callsFake((...args) => args);
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
                         "not called");
      assert.strictEqual(browser.storage.local.remove.callCount, j,
                         "not called");
      assert.isNull(res, "result");
    });

    it("should not call function", async () => {
      browser.runtime.sendMessage.callsFake((...args) => args);
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
                         "not called");
      assert.strictEqual(browser.storage.local.remove.callCount, j,
                         "not called");
      assert.isNull(res, "result");
    });

    it("should not call function", async () => {
      browser.runtime.sendMessage.callsFake((...args) => args);
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
                         "not called");
      assert.strictEqual(browser.storage.local.remove.callCount, j,
                         "not called");
      assert.isNull(res, "result");
    });

    it("should call function", async () => {
      browser.runtime.sendMessage.callsFake((...args) => args);
      browser.storage.local.get.resolves({});
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.strictEqual(browser.storage.local.remove.callCount, j,
                         "not called");
      assert.deepEqual(res, [
        null,
        {
          [THEME_CUSTOM_SETTING]: currentTheme,
        },
        null,
      ], "result");
    });

    it("should call function", async () => {
      browser.runtime.sendMessage.callsFake((...args) => args);
      browser.storage.local.get.resolves({});
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.storage.local.remove.callCount;
      const currentTheme = mjs.themeMap[THEME_LIGHT];
      const elm = document.createElement("style");
      const body = document.querySelector("body");
      elm.id = CSS_ID;
      body.appendChild(elm);
      mjs.currentTheme.set(THEME_CURRENT, currentTheme);
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.strictEqual(browser.storage.local.remove.callCount, j + 1,
                         "called");
      assert.deepEqual(res, [
        null,
        {
          [THEME_CUSTOM_SETTING]: currentTheme,
        },
        null,
      ], "result");
    });
  });

  describe("get theme", () => {
    const func = mjs.getTheme;

    it("should get light theme", async () => {
      browser.storage.local.get.withArgs(THEME).resolves({
        theme: "foo",
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.deepEqual(res, [THEME_LIGHT], "result");
    });

    it("should get stored theme", async () => {
      browser.storage.local.get.withArgs(THEME).resolves({
        theme: ["foo"],
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.deepEqual(res, ["foo"], "result");
    });

    it("should get light theme", async () => {
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: "foo",
          type: "theme",
          enabled: true,
        },
      ]);
      const i = browser.storage.local.get.callCount;
      const j = browser.management.getAll.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.strictEqual(browser.management.getAll.callCount, j + 1, "called");
      assert.deepEqual(res, [THEME_LIGHT], "result");
    });

    it("should get dark theme", async () => {
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: THEME_DARK_ID,
          type: "theme",
          enabled: true,
        },
      ]);
      const i = browser.storage.local.get.callCount;
      const j = browser.management.getAll.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.strictEqual(browser.management.getAll.callCount, j + 1, "called");
      assert.deepEqual(res, [THEME_DARK], "result");
    });

    it("should get light theme", async () => {
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: THEME_LIGHT_ID,
          type: "theme",
          enabled: true,
        },
      ]);
      const i = browser.storage.local.get.callCount;
      const j = browser.management.getAll.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.strictEqual(browser.management.getAll.callCount, j + 1, "called");
      assert.deepEqual(res, [THEME_LIGHT], "result");
    });
  });

  describe("set theme", () => {
    const func = mjs.setTheme;

    it("should throw if no argument given", async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, "Expected Array but got Undefined.",
                           "throw");
      });
    });

    it("should throw if argument is not array", async () => {
      await func("foo").catch(e => {
        assert.strictEqual(e.message, "Expected Array but got String.",
                           "throw");
      });
    });

    it("should set light theme", async () => {
      const body = document.querySelector("body");
      const i = browser.storage.local.set.callCount;
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func(["foo"]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, "called");
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), "custom");
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), "dark");
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), "light");
    });

    it("should set light theme", async () => {
      const body = document.querySelector("body");
      const i = browser.storage.local.set.callCount;
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func([THEME_LIGHT]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, "called");
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), "custom");
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), "dark");
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), "light");
    });

    it("should set dark theme", async () => {
      const body = document.querySelector("body");
      const i = browser.storage.local.set.callCount;
      body.classList.remove(CLASS_THEME_DARK);
      body.classList.add(CLASS_THEME_LIGHT);
      await func([THEME_DARK]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, "called");
      assert.isFalse(body.classList.contains(CLASS_THEME_CUSTOM), "custom");
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), "dark");
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), "light");
    });

    it("should set custom theme", async () => {
      const body = document.querySelector("body");
      const i = browser.storage.local.set.callCount;
      body.classList.remove(CLASS_THEME_DARK);
      body.classList.add(CLASS_THEME_LIGHT);
      await func([THEME_CUSTOM]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, "called");
      assert.isTrue(body.classList.contains(CLASS_THEME_CUSTOM), "custom");
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), "dark");
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), "light");
    });
  });

  describe("get tab height", () => {
    const func = mjs.getTabHeight;

    it("should get result", async () => {
      browser.storage.local.get.withArgs(THEME_TAB_COMPACT).resolves(undefined);
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.isFalse(res, "result");
    });

    it("should get result", async () => {
      browser.storage.local.get.withArgs(THEME_TAB_COMPACT).resolves({
        [THEME_TAB_COMPACT]: {
          checked: true,
        },
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.isTrue(res, "result");
    });

    it("should get result", async () => {
      browser.storage.local.get.withArgs(THEME_TAB_COMPACT).resolves({
        [THEME_TAB_COMPACT]: {
          checked: false,
        },
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.isFalse(res, "result");
    });
  });

  describe("set tab height", () => {
    const func = mjs.setTabHeight;

    it("should set height", async () => {
      const body = document.querySelector("body");
      body.classList.remove(CLASS_COMPACT);
      await func(true);
      assert.isTrue(body.classList.contains(CLASS_COMPACT));
    });

    it("should set height", async () => {
      const body = document.querySelector("body");
      body.classList.add(CLASS_COMPACT);
      await func(false);
      assert.isFalse(body.classList.contains(CLASS_COMPACT));
    });
  });

  describe("get scrollbar width", () => {
    const func = mjs.getScrollbarWidth;

    it("should get result", async () => {
      browser.storage.local.get.withArgs(THEME_SCROLLBAR_NARROW)
        .resolves(undefined);
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.isFalse(res, "result");
    });

    it("should get result", async () => {
      browser.storage.local.get.withArgs(THEME_SCROLLBAR_NARROW).resolves({
        [THEME_SCROLLBAR_NARROW]: {
          checked: true,
        },
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.isTrue(res, "result");
    });

    it("should get result", async () => {
      browser.storage.local.get.withArgs(THEME_SCROLLBAR_NARROW).resolves({
        [THEME_SCROLLBAR_NARROW]: {
          checked: false,
        },
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.isFalse(res, "result");
    });
  });

  describe("set scrollbar width", () => {
    const func = mjs.setScrollbarWidth;

    it("should set height", async () => {
      const body = document.querySelector("body");
      body.classList.remove(CLASS_NARROW);
      await func(true);
      assert.isTrue(body.classList.contains(CLASS_NARROW));
    });

    it("should set height", async () => {
      const body = document.querySelector("body");
      body.classList.add(CLASS_NARROW);
      await func(false);
      assert.isFalse(body.classList.contains(CLASS_NARROW));
    });
  });

  describe("apply CSS", () => {
    const func = mjs.applyCss;

    it("should remove attribute", async () => {
      const elm = document.createElement("section");
      const body = document.querySelector("body");
      elm.setAttribute("hidden", "hidden");
      body.appendChild(elm);
      await func();
      assert.isFalse(elm.hasAttribute("hidden"), "hidden");
    });
  });

  describe("set sidebar theme", () => {
    const func = mjs.setSidebarTheme;

    it("should call functions", async () => {
      browser.storage.local.get.resolves({});
      const res = await func();
      assert.isUndefined(res, "result");
    });
  });
});
