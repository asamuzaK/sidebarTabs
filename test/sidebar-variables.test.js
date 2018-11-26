/**
 * sidebar-variables.test.js
 */
/*
  eslint-disable max-nested-callbacks, no-await-in-loop, no-magic-numbers,
                 array-bracket-newline
*/

import {JSDOM} from "jsdom";
import {assert} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import sinon from "sinon";
import {browser} from "./mocha/setup.js";
import * as mjs from "../src/mjs/sidebar-variables.js";
import {
  CLASS_THEME_DARK, CLASS_THEME_LIGHT, COMPACT, TAB_GROUP_NEW_TAB_AT_END,
  THEME_DARK, THEME_LIGHT, THEME_TAB_COMPACT,
} from "../src/mjs/constant.js";

describe("sidebar-variables", () => {
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
  const globalKeys = ["Node"];
  let window, document;
  beforeEach(() => {
    const dom = createJsdom();
    window = dom && dom.window;
    document = window && window.document;
    global.browser = browser;
    global.window = window;
    global.document = document;
    for (const key of globalKeys) {
      global[key] = window[key];
    }
    mjs.sidebar.tabGroupPutNewTabAtTheEnd = false;
    mjs.sidebar.incognito = false;
    mjs.sidebar.isMac = false;
    mjs.sidebar.windowId = null;
    mjs.sidebar.contextualIds = null;
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
    mjs.sidebar.tabGroupPutNewTabAtTheEnd = false;
    mjs.sidebar.incognito = false;
    mjs.sidebar.isMac = false;
    mjs.sidebar.windowId = null;
    mjs.sidebar.contextualIds = null;
  });

  it("should get browser object", () => {
    assert.isObject(browser, "browser");
  });

  describe("set sidebar", () => {
    const func = mjs.setSidebar;

    it("should set value", async () => {
      const {sidebar} = mjs;
      const getCurrent = browser.windows.getCurrent.withArgs({
        populate: true,
      });
      const getStorage = browser.storage.local.get
        .withArgs(TAB_GROUP_NEW_TAB_AT_END);
      const getOs = browser.runtime.getPlatformInfo.resolves({
        os: "mac",
      });
      const i = getCurrent.callCount;
      const j = getStorage.callCount;
      const k = getOs.callCount;
      getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      getStorage.resolves({
        tabGroupPutNewTabAtTheEnd: {
          checked: true,
        },
      });
      await func();
      assert.strictEqual(getCurrent.callCount, i + 1, "getCurrent called");
      assert.strictEqual(getStorage.callCount, j + 1, "getStorage called");
      assert.strictEqual(getOs.callCount, k + 1, "getOs called");
      assert.isTrue(sidebar.tabGroupPutNewTabAtTheEnd,
                    "tabGroupPutNewTabAtTheEnd");
      assert.isTrue(sidebar.incognito, "incognito");
      assert.isTrue(sidebar.isMac, "isMac");
      assert.strictEqual(sidebar.windowId, 1, "windowId");
      browser.windows.getCurrent.flush();
      browser.storage.local.get.flush();
      browser.runtime.getPlatformInfo.flush();
    });

    it("should set value", async () => {
      const {sidebar} = mjs;
      const getCurrent = browser.windows.getCurrent.withArgs({
        populate: true,
      });
      const getStorage = browser.storage.local.get
        .withArgs(TAB_GROUP_NEW_TAB_AT_END);
      const getOs = browser.runtime.getPlatformInfo.resolves({
        os: "mac",
      });
      const i = getCurrent.callCount;
      const j = getStorage.callCount;
      const k = getOs.callCount;
      getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      getStorage.resolves(undefined);
      await func();
      assert.strictEqual(getCurrent.callCount, i + 1, "getCurrent called");
      assert.strictEqual(getStorage.callCount, j + 1, "getStorage called");
      assert.strictEqual(getOs.callCount, k + 1, "getOs called");
      assert.isFalse(sidebar.tabGroupPutNewTabAtTheEnd,
                     "tabGroupPutNewTabAtTheEnd");
      assert.isTrue(sidebar.incognito, "incognito");
      assert.isTrue(sidebar.isMac, "isMac");
      assert.strictEqual(sidebar.windowId, 1, "windowId");
      browser.windows.getCurrent.flush();
      browser.storage.local.get.flush();
      browser.runtime.getPlatformInfo.flush();
    });
  });

  describe("set contextual identities cookieStoreIds", () => {
    const func = mjs.setContextualIds;

    it("should set value", async () => {
      const {sidebar} = mjs;
      const query = browser.contextualIdentities.query.withArgs({});
      const i = query.callCount;
      query.resolves([
        {
          cookieStoreId: "foo",
        },
        {
          cookieStoreId: "bar",
        },
        {
          cookieStoreId: "baz",
        },
      ]);
      await func();
      assert.strictEqual(query.callCount, i + 1, "query called");
      assert.deepEqual(sidebar.contextualIds, ["foo", "bar", "baz"], "ids");
      browser.contextualIdentities.query.flush();
    });

    it("should set value", async () => {
      const {sidebar} = mjs;
      const query = browser.contextualIdentities.query.withArgs({});
      const stub = sinon.stub(console, "error");
      const i = query.callCount;
      query.rejects("error");
      await func();
      const {calledOnce} = stub;
      stub.restore();
      assert.strictEqual(query.callCount, i + 1, "query called");
      assert.isTrue(calledOnce, "log error called");
      assert.isNull(sidebar.contextualIds, "ids");
      browser.contextualIdentities.query.flush();
    });
  });

  describe("init sidebar", () => {
    const func = mjs.initSidebar;

    it("should init", async () => {
      const {setWindowValue} = browser.sessions;
      const {clear} = browser.storage.local;
      const i = setWindowValue.callCount;
      const j = clear.callCount;
      await func();
      assert.strictEqual(setWindowValue.callCount, i + 1,
                         "setWindowValue called");
      assert.strictEqual(clear.callCount, j + 1, "clear called");
    });
  });

  describe("get last closed tab", () => {
    const func = mjs.getLastClosedTab;

    it("should call function", async () => {
      const {getRecentlyClosed} = browser.sessions;
      const i = getRecentlyClosed.callCount;
      getRecentlyClosed.resolves([{
        tab: {
          windowId: browser.windows.WINDOW_ID_CURRENT,
        },
      }]);
      const res = await func();
      assert.strictEqual(getRecentlyClosed.callCount, i + 1, "called");
      assert.deepEqual(res, {
        windowId: browser.windows.WINDOW_ID_CURRENT,
      }, "result");
      browser.sessions.getRecentlyClosed.flush();
    });

    it("should call function", async () => {
      const {getRecentlyClosed} = browser.sessions;
      const i = getRecentlyClosed.callCount;
      getRecentlyClosed.resolves([{}]);
      const res = await func();
      assert.strictEqual(getRecentlyClosed.callCount, i + 1, "called");
      assert.isNull(res, "result");
      browser.sessions.getRecentlyClosed.flush();
    });
  });

  describe("undo close tab", () => {
    const func = mjs.undoCloseTab;

    it("should not call function if lastClosedTab is not set", async () => {
      const {restore} = browser.sessions;
      const i = restore.callCount;
      const res = await func();
      assert.strictEqual(restore.callCount, i, "not called");
      assert.isNull(res, "result");
    });

    it("should call function", async () => {
      const {sidebar} = mjs;
      const restore = browser.sessions.restore.withArgs("foo");
      const i = restore.callCount;
      sidebar.lastClosedTab = {
        sessionId: "foo",
      };
      restore.resolves({});
      const res = await func();
      assert.strictEqual(restore.callCount, i + 1, "called");
      assert.deepEqual(res, {}, "result");
      browser.sessions.restore.flush();
    });
  });

  describe("set variable", () => {
    const func = mjs.setVar;

    it("should throw if 1st argument not given", async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.");
      });
    });

    it("should not set value if 2nd argument is empty object", async () => {
      const res = await func("foo", {});
      assert.deepEqual(res, [], "result");
    });

    it("should not set value if key does not match", async () => {
      const res = await func("foo", {
        checked: true,
      });
      assert.isUndefined(mjs.sidebar.foo, "value");
      assert.deepEqual(res, [], "result");
    });

    it("should set value", async () => {
      const res = await func(TAB_GROUP_NEW_TAB_AT_END, {
        checked: true,
      });
      assert.isTrue(mjs.sidebar[TAB_GROUP_NEW_TAB_AT_END], "value");
      assert.deepEqual(res, [], "result");
    });

    it("should not set value if 3rd argument is falsy", async () => {
      const res = await func(THEME_DARK, {
        checked: true,
      }, false);
      const body = document.querySelector("body");
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), "class");
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), "class");
      assert.deepEqual(res, [], "result");
    });

    it("should set value", async () => {
      const res = await func(THEME_DARK, {
        checked: true,
      }, true);
      const body = document.querySelector("body");
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), "class");
      assert.isFalse(body.classList.contains(CLASS_THEME_LIGHT), "class");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set value", async () => {
      const res = await func(THEME_LIGHT, {
        checked: true,
      }, true);
      const body = document.querySelector("body");
      assert.isFalse(body.classList.contains(CLASS_THEME_DARK), "class");
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), "class");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should not set value if 3rd argument is falsy", async () => {
      const res = await func(THEME_TAB_COMPACT, {
        checked: true,
      }, false);
      const body = document.querySelector("body");
      assert.isFalse(body.classList.contains(COMPACT), "class");
      assert.deepEqual(res, [], "result");
    });

    it("should set value", async () => {
      const res = await func(THEME_TAB_COMPACT, {
        checked: true,
      }, true);
      const body = document.querySelector("body");
      assert.isTrue(body.classList.contains(COMPACT), "class");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set value", async () => {
      const res = await func(THEME_TAB_COMPACT, {
        checked: false,
      }, true);
      const body = document.querySelector("body");
      assert.isFalse(body.classList.contains(COMPACT), "class");
      assert.deepEqual(res, [undefined], "result");
    });
  });
});
