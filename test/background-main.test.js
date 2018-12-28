/**
 * background-main.test.js
 */
/* eslint-disable  max-nested-callbacks, no-await-in-loop, no-magic-numbers */

import {assert} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import sinon from "sinon";
import {browser} from "./mocha/setup.js";
import * as mjs from "../src/mjs/background-main.js";

describe("background-main", () => {
  beforeEach(() => {
    global.browser = browser;
  });
  afterEach(() => {
    delete global.browser;
  });

  it("should get browser object", () => {
    assert.isObject(browser, "browser");
  });

  describe("set sidebar window ID", () => {
    const func = mjs.setSidebarWindowId;
    beforeEach(() => {
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });
    afterEach(() => {
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should throw if no argument given", async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, "Expected Number but got Undefined.",
                           "result");
      });
    });

    it("should throw if argument is not number", async () => {
      await func("foo").catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "result");
      });
    });

    it("should set WINDOW_ID_CURRENT if WINDOW_ID_NONE is given", async () => {
      const i = browser.windows.WINDOW_ID_CURRENT;
      mjs.sidebar.windowId = i + 1;
      await func(browser.windows.WINDOW_ID_NONE);
      assert.strictEqual(mjs.sidebar.windowId, i, "result");
    });

    it("should set widowId", async () => {
      await func(1);
      assert.strictEqual(mjs.sidebar.windowId, 1, "result");
    });
  });

  // NOTE: sidebarAction.isOpen is not implemented in sinon-chrome
  describe("set sidebar isOpen state", () => {
    const func = mjs.setSidebarIsOpenState;
    beforeEach(() => {
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
      mjs.sidebar.isOpen = false;
    });
    afterEach(() => {
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
      mjs.sidebar.isOpen = false;
    });

    it("should set isOpen", async () => {
      browser.sidebarAction.isOpen = sinon.stub();
      browser.sidebarAction.isOpen.withArgs({
        windowId: 1,
      }).resolves(true);
      mjs.sidebar.windowId = 1;
      mjs.sidebar.isOpen = false;
      await func();
      assert.isTrue(mjs.sidebar.isOpen, "result");
      delete browser.sidebarAction.isOpen;
    });

    it("should set isOpen", async () => {
      browser.sidebarAction.isOpen = sinon.stub();
      browser.sidebarAction.isOpen.withArgs({
        windowId: 1,
      }).resolves(false);
      mjs.sidebar.windowId = 1;
      mjs.sidebar.isOpen = true;
      await func();
      assert.isFalse(mjs.sidebar.isOpen, "result");
      delete browser.sidebarAction.isOpen;
    });
  });

  describe("toggle sidebar", () => {
    const func = mjs.toggleSidebar;
    beforeEach(() => {
      mjs.sidebar.isOpen = false;
    });
    afterEach(() => {
      mjs.sidebar.isOpen = false;
    });

    it("should call function", async () => {
      browser.sidebarAction.close.resolves(undefined);
      browser.sidebarAction.open.resolves(undefined);
      const i = browser.sidebarAction.close.callCount;
      const j = browser.sidebarAction.open.callCount;
      mjs.sidebar.isOpen = true;
      const res = await func();
      assert.strictEqual(browser.sidebarAction.close.callCount, i + 1,
                         "called");
      assert.strictEqual(browser.sidebarAction.open.callCount, j,
                         "not called");
      assert.isUndefined(res, "result");
      browser.sidebarAction.close.flush();
      browser.sidebarAction.open.flush();
    });

    it("should call function", async () => {
      browser.sidebarAction.close.resolves(undefined);
      browser.sidebarAction.open.resolves(undefined);
      const i = browser.sidebarAction.close.callCount;
      const j = browser.sidebarAction.open.callCount;
      mjs.sidebar.isOpen = false;
      const res = await func();
      assert.strictEqual(browser.sidebarAction.close.callCount, i,
                         "not called");
      assert.strictEqual(browser.sidebarAction.open.callCount, j + 1,
                         "called");
      assert.isUndefined(res, "result");
      browser.sidebarAction.close.flush();
      browser.sidebarAction.open.flush();
    });
  });

  describe("handle port.onDisconnect", () => {
    const func = mjs.portOnDisconnect;

    it("should call function", async () => {
      const stub = sinon.stub();
      browser.sidebarAction.isOpen = stub;
      await func();
      assert.isTrue(stub.calledOnce, "called");
      delete browser.sidebarAction.isOpen;
    });
  });

  describe("handle connected port", () => {
    const func = mjs.handlePort;

    it("should add listener", async () => {
      const port = new browser.runtime.Port({name: "foo"});
      assert.strictEqual(port.name, "foo");
      const i = port.onDisconnect.addListener.callCount;
      await func(port);
      assert.strictEqual(port.onDisconnect.addListener.callCount, i + 1,
                         "called");
    });
  });
});
