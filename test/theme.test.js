/**
 * theme.test.js
 */
/* eslint-disable  max-nested-callbacks, no-await-in-loop, no-magic-numbers */

import {JSDOM} from "jsdom";
import {assert} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import {browser} from "./mocha/setup.js";
import * as mjs from "../src/mjs/theme.js";
import {
  CLASS_THEME_DARK, CLASS_THEME_LIGHT, COMPACT, THEME, THEME_DARK,
  THEME_DARK_ID, THEME_LIGHT, THEME_LIGHT_ID, THEME_TAB_COMPACT,
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
  });

  it("should get browser object", () => {
    assert.isObject(browser, "browser");
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
      browser.storage.local.get.flush();
    });

    it("should get stored theme", async () => {
      browser.storage.local.get.withArgs(THEME).resolves({
        theme: ["foo"],
      });
      const i = browser.storage.local.get.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.deepEqual(res, ["foo"], "result");
      browser.storage.local.get.flush();
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
      browser.management.getAll.flush();
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
      browser.management.getAll.flush();
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
      browser.management.getAll.flush();
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
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), "theme dark");
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), "theme light");
    });

    it("should set light theme", async () => {
      const body = document.querySelector("body");
      const i = browser.storage.local.set.callCount;
      body.classList.add(CLASS_THEME_DARK);
      body.classList.remove(CLASS_THEME_LIGHT);
      await func([THEME_LIGHT]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, "called");
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), "theme dark");
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), "theme light");
    });

    it("should set dark theme", async () => {
      const body = document.querySelector("body");
      const i = browser.storage.local.set.callCount;
      body.classList.remove(CLASS_THEME_DARK);
      body.classList.add(CLASS_THEME_LIGHT);
      await func([THEME_DARK]);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, "called");
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), "theme dark");
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), "theme light");
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
      browser.storage.local.get.flush();
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
      browser.storage.local.get.flush();
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
      browser.storage.local.get.flush();
    });
  });

  describe("set tab height", () => {
    const func = mjs.setTabHeight;

    it("should set height", async () => {
      const body = document.querySelector("body");
      body.classList.remove(COMPACT);
      await func(true);
      assert.isTrue(body.classList.contains(COMPACT));
    });

    it("should set height", async () => {
      const body = document.querySelector("body");
      body.classList.add(COMPACT);
      await func(false);
      assert.isFalse(body.classList.contains(COMPACT));
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
      browser.storage.local.get.flush();
    });
  });
});
