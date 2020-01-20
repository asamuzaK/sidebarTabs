/**
 * background-main.test.js
 */
/* eslint-disable max-nested-callbacks */

import {assert} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import {browser} from "./mocha/setup.js";
import * as mjs from "../src/mjs/background-main.js";
import {SIDEBAR_STATE_UPDATE, TOGGLE_STATE} from "../src/mjs/constant.js";

describe("background-main", () => {
  beforeEach(() => {
    browser._sandbox.reset();
    browser.i18n.getMessage.callsFake((...args) => args.toString());
    browser.permissions.contains.resolves(true);
    global.browser = browser;
  });
  afterEach(() => {
    delete global.browser;
    browser._sandbox.reset();
  });

  it("should get browser object", () => {
    assert.isObject(browser, "browser");
  });

  describe("set sidebar state", () => {
    const func = mjs.setSidebarState;
    beforeEach(() => {
      mjs.sidebar.windowId = null;
      mjs.sidebar.isOpen = false;
    });
    afterEach(() => {
      mjs.sidebar.windowId = null;
      mjs.sidebar.isOpen = false;
    });

    it("should set values", async () => {
      const i = browser.sidebarAction.isOpen.callCount;
      browser.sidebarAction.isOpen.resolves(true);
      await func();
      assert.strictEqual(browser.sidebarAction.isOpen.callCount, i + 1,
                         "called");
      assert.strictEqual(mjs.sidebar.windowId,
                         browser.windows.WINDOW_ID_CURRENT, "windowId");
      assert.isTrue(mjs.sidebar.isOpen, "windowId");
    });

    it("should set values", async () => {
      const i = browser.sidebarAction.isOpen.callCount;
      browser.sidebarAction.isOpen.resolves(true);
      await func(1);
      assert.strictEqual(browser.sidebarAction.isOpen.callCount, i + 1,
                         "called");
      assert.strictEqual(mjs.sidebar.windowId, 1, "windowId");
      assert.isTrue(mjs.sidebar.isOpen, "windowId");
    });

    it("should set default values", async () => {
      const i = browser.sidebarAction.isOpen.callCount;
      browser.sidebarAction.isOpen.resolves(true);
      mjs.sidebar.windowId = 1;
      mjs.sidebar.isOpen = true;
      await func(browser.windows.WINDOW_ID_NONE);
      assert.strictEqual(browser.sidebarAction.isOpen.callCount, i,
                         "not called");
      assert.isNull(mjs.sidebar.windowId, "windowId");
      assert.isFalse(mjs.sidebar.isOpen, "windowId");
    });
  });

  describe("toggle sidebar", () => {
    const func = mjs.toggleSidebar;
    beforeEach(() => {
      mjs.sidebar.windowId = null;
      mjs.sidebar.isOpen = false;
    });
    afterEach(() => {
      mjs.sidebar.windowId = null;
      mjs.sidebar.isOpen = false;
    });

    it("should not call function", async () => {
      browser.sidebarAction.close.resolves(true);
      browser.sidebarAction.open.resolves(true);
      const i = browser.sidebarAction.close.callCount;
      const j = browser.sidebarAction.open.callCount;
      mjs.sidebar.windowId = null;
      mjs.sidebar.isOpen = true;
      const res = await func();
      assert.strictEqual(browser.sidebarAction.close.callCount, i,
                         "not called");
      assert.strictEqual(browser.sidebarAction.open.callCount, j,
                         "not called");
      assert.isUndefined(res, "result");
    });

    it("should call function", async () => {
      browser.sidebarAction.close.resolves(true);
      browser.sidebarAction.open.resolves(true);
      const i = browser.sidebarAction.close.callCount;
      const j = browser.sidebarAction.open.callCount;
      mjs.sidebar.windowId = 1;
      mjs.sidebar.isOpen = true;
      const res = await func();
      assert.strictEqual(browser.sidebarAction.close.callCount, i + 1,
                         "called");
      assert.strictEqual(browser.sidebarAction.open.callCount, j,
                         "not called");
      assert.isTrue(res, "result");
    });

    it("should call function", async () => {
      browser.sidebarAction.close.resolves(true);
      browser.sidebarAction.open.resolves(true);
      const i = browser.sidebarAction.close.callCount;
      const j = browser.sidebarAction.open.callCount;
      mjs.sidebar.windowId = 1;
      mjs.sidebar.isOpen = false;
      const res = await func();
      assert.strictEqual(browser.sidebarAction.close.callCount, i,
                         "not called");
      assert.strictEqual(browser.sidebarAction.open.callCount, j + 1,
                         "called");
      assert.isTrue(res, "result");
    });
  });

  describe("handle runtime message", () => {
    const func = mjs.handleMsg;
    beforeEach(() => {
      mjs.sidebar.windowId = null;
      mjs.sidebar.isOpen = false;
    });
    afterEach(() => {
      mjs.sidebar.windowId = null;
      mjs.sidebar.isOpen = false;
    });

    it("should not call function", async () => {
      const res = await func({});
      assert.deepEqual(res, [], "result");
    });

    it("should not call function", async () => {
      const msg = {
        foo: true,
      };
      const res = await func(msg);
      assert.deepEqual(res, [], "result");
    });

    it("should call function", async () => {
      browser.sidebarAction.isOpen.resolves(true);
      const i = browser.sidebarAction.isOpen.callCount;
      const msg = {
        [SIDEBAR_STATE_UPDATE]: {
          windowId: 1,
        },
      };
      const res = await func(msg);
      assert.strictEqual(browser.sidebarAction.isOpen.callCount, i + 1,
                         "called");
      assert.strictEqual(mjs.sidebar.windowId, 1, "windowId");
      assert.isTrue(mjs.sidebar.isOpen, "isOpen");
      assert.deepEqual(res, [undefined], "result");
    });
  });

  describe("handle command", () => {
    const func = mjs.handleCmd;
    beforeEach(() => {
      mjs.sidebar.windowId = null;
      mjs.sidebar.isOpen = false;
    });
    afterEach(() => {
      mjs.sidebar.windowId = null;
      mjs.sidebar.isOpen = false;
    });

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "message");
      });
    });

    it("should get null", async () => {
      const res = await func("foo");
      assert.isNull(res, "result");
    });

    it("should call function", async () => {
      const i = browser.sidebarAction.close.callCount;
      const j = browser.sidebarAction.open.callCount;
      const k = browser.sidebarAction.isOpen.callCount;
      browser.sidebarAction.close.resolves(true);
      browser.sidebarAction.open.resolves(true);
      browser.sidebarAction.isOpen.resolves(false);
      mjs.sidebar.windowId = 1;
      mjs.sidebar.isOpen = true;
      const res = await func(TOGGLE_STATE);
      assert.strictEqual(browser.sidebarAction.close.callCount, i + 1,
                         "called");
      assert.strictEqual(browser.sidebarAction.open.callCount, j,
                         "not called");
      assert.strictEqual(browser.sidebarAction.isOpen.callCount, k + 1,
                         "called");
      assert.isFalse(mjs.sidebar.isOpen, "isOpen");
      assert.isUndefined(res, "result");
    });
  });
});
