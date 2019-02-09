/**
 * menu.test.js
 */
/* eslint-disable  max-nested-callbacks, no-await-in-loop, no-magic-numbers */

import {JSDOM} from "jsdom";
import {assert} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import sinon from "sinon";
import {browser} from "./mocha/setup.js";
import * as mjs from "../src/mjs/menu.js";

describe("menu", () => {
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

  describe("create context menu item", () => {
    const func = mjs.createMenuItem;

    it("should not call function if no argument given", async () => {
      const i = browser.menus.create.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.create.callCount, i, "not called");
      assert.isNull(res, "result");
    });

    it("should not call function if argument is empty object", async () => {
      const i = browser.menus.create.callCount;
      const res = await func({});
      assert.strictEqual(browser.menus.create.callCount, i, "not called");
      assert.isNull(res, "result");
    });

    it("should not call function if object does not contain id", async () => {
      const i = browser.menus.create.callCount;
      const res = await func({
        foo: "bar",
      });
      assert.strictEqual(browser.menus.create.callCount, i, "not called");
      assert.isNull(res, "result");
    });

    it("should not call function if id is not string", async () => {
      const i = browser.menus.create.callCount;
      const res = await func({
        id: [],
      });
      assert.strictEqual(browser.menus.create.callCount, i, "not called");
      assert.isNull(res, "result");
    });

    it("should call function", async () => {
      browser.menus.create.resolves("foo");
      const i = browser.menus.create.callCount;
      const res = await func({
        id: "foo",
      });
      assert.strictEqual(browser.menus.create.callCount, i + 1, "called");
      assert.strictEqual(res, "foo", "result");
      browser.menus.create.flush();
    });
  });

  describe("create contextual identities menu", () => {
    const func = mjs.createContextualIdentitiesMenu;

    it("should not call function", async () => {
      const i = browser.menus.create.callCount;
      await func();
      assert.strictEqual(browser.menus.create.callCount, i, "not called");
    });

    it("should not call function if argument is empty object", async () => {
      const i = browser.menus.create.callCount;
      await func({});
      assert.strictEqual(browser.menus.create.callCount, i, "not called");
    });

    it("should throw if color not contained", async () => {
      await func({
        foo: "bar",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "throw");
      });
    });

    it("should throw if cookieStoreId not contained", async () => {
      await func({
        color: "red",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "throw");
      });
    });

    it("should throw if icon not contained", async () => {
      await func({
        color: "red",
        cookieStoreId: "foo",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "throw");
      });
    });

    it("should throw if name not contained", async () => {
      await func({
        color: "red",
        cookieStoreId: "foo",
        icon: "fingerprint",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "throw");
      });
    });

    it("should call function", async () => {
      const i = browser.menus.create.callCount;
      const res = await func({
        color: "red",
        cookieStoreId: "foo",
        icon: "fingerprint",
        name: "bar",
      });
      assert.strictEqual(browser.menus.create.callCount, i + 2, "called");
      assert.deepEqual(res, [null, null], "result");
    });
  });

  describe("create context menu", () => {
    const func = mjs.createContextMenu;

    it("should get array", async () => {
      browser.contextualIdentities.query.withArgs({}).resolves([{}, {}]);
      const i = browser.contextualIdentities.query.callCount;
      const res = await func();
      assert.strictEqual(browser.contextualIdentities.query.callCount, i + 1,
                         "called");
      assert.isTrue(res.length > 0, "result");
    });

    it("should get array", async () => {
      browser.contextualIdentities.query.withArgs({}).resolves(null);
      const i = browser.contextualIdentities.query.callCount;
      const res = await func();
      assert.strictEqual(browser.contextualIdentities.query.callCount, i + 1,
                         "called");
      assert.isTrue(res.length > 0, "result");
    });
  });

  describe("update contextual identities menu", () => {
    const func = mjs.updateContextualIdentitiesMenu;

    it("should not call function", async () => {
      const i = browser.menus.update.callCount;
      await func();
      assert.strictEqual(browser.menus.update.callCount, i, "not called");
    });

    it("should not call function if argument is empty object", async () => {
      const i = browser.menus.update.callCount;
      await func({});
      assert.strictEqual(browser.menus.update.callCount, i, "not called");
    });

    it("should throw if color not contained", async () => {
      await func({
        foo: "bar",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "throw");
      });
    });

    it("should throw if cookieStoreId not contained", async () => {
      await func({
        color: "red",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "throw");
      });
    });

    it("should throw if icon not contained", async () => {
      await func({
        color: "red",
        cookieStoreId: "foo",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "throw");
      });
    });

    it("should throw if name not contained", async () => {
      await func({
        color: "red",
        cookieStoreId: "foo",
        icon: "fingerprint",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "throw");
      });
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const res = await func({
        color: "red",
        cookieStoreId: "foo",
        icon: "fingerprint",
        name: "bar",
      });
      assert.strictEqual(browser.menus.update.callCount, i + 2, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
    });
  });

  describe("update context menu", () => {
    const func = mjs.updateContextMenu;

    it("should not call function if 1st arg is not given", async () => {
      const i = browser.menus.update.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.update.callCount, i, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function if 1st arg is not string", async () => {
      const i = browser.menus.update.callCount;
      const res = await func(1);
      assert.strictEqual(browser.menus.update.callCount, i, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function if 2nd arg is not given", async () => {
      const i = browser.menus.update.callCount;
      const res = await func("foo");
      assert.strictEqual(browser.menus.update.callCount, i, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function if 2nd arg is empty object", async () => {
      const i = browser.menus.update.callCount;
      const res = await func("foo", {});
      assert.strictEqual(browser.menus.update.callCount, i, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function if prop does not match", async () => {
      const i = browser.menus.update.callCount;
      const res = await func("foo", {
        bar: "baz",
      });
      assert.strictEqual(browser.menus.update.callCount, i, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const res = await func("foo", {
        enabled: true,
      });
      assert.strictEqual(browser.menus.update.callCount, i + 1, "called");
      assert.deepEqual(res, [undefined], "result");
    });
  });

  describe("remove contextual identities menu", () => {
    const func = mjs.removeContextualIdentitiesMenu;

    it("should not call function if no argument given", async () => {
      const i = browser.menus.remove.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.remove.callCount, i, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function if argument is empty object", async () => {
      const i = browser.menus.remove.callCount;
      const res = await func({});
      assert.strictEqual(browser.menus.remove.callCount, i, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function if cookieStoreId not contained", async () => {
      const i = browser.menus.remove.callCount;
      const res = await func({
        foo: "bar",
      });
      assert.strictEqual(browser.menus.remove.callCount, i, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should call function", async () => {
      const i = browser.menus.remove.callCount;
      const res = await func({
        cookieStoreId: "foo",
      });
      assert.strictEqual(browser.menus.remove.callCount, i + 2, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
    });
  });

  describe("override context menu", () => {
    const func = mjs.overrideContextMenu;
    beforeEach(() => {
      if (typeof browser.menus.overrideContext !== "function") {
        browser.menus.overrideContext = sinon.stub();
      }
    });

    it("should call function with empty object argument", async () => {
      const i = browser.menus.overrideContext.withArgs({}).callCount;
      const res = await func({});
      assert.strictEqual(browser.menus.overrideContext.withArgs({}).callCount,
                         i + 1, "called");
      assert.isUndefined(res, "result");
    });

    it("should call function with object argument", async () => {
      const i = browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: "tab",
      }).callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const res = await func({
        target: elm,
      });
      assert.strictEqual(browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: "tab",
      }).callCount, i + 1, "called");
      assert.isUndefined(res, "result");
    });

    it("should call function with empty object argument", async () => {
      const i = browser.menus.overrideContext.withArgs({}).callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.dataset.tabId = browser.tabs.TAB_ID_NONE;
      body.appendChild(elm);
      const res = await func({
        target: elm,
      });
      assert.strictEqual(browser.menus.overrideContext.withArgs({}).callCount,
                         i + 1, "called");
      assert.isUndefined(res, "result");
    });
  });

  describe("handle contextmenu click", () => {
    const func = mjs.contextmenuOnClick;
    beforeEach(() => {
      if (typeof browser.menus.overrideContext !== "function") {
        browser.menus.overrideContext = sinon.stub();
      }
    });

    it("should call function", async () => {
      const i = browser.menus.overrideContext.callCount;
      const res = await func({});
      assert.strictEqual(browser.menus.overrideContext.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
    });
  });

  describe("handle contextualIdentities.onCreated", () => {
    const func = mjs.contextualIdentitiesOnCreated;

    it("should call function", async () => {
      const i = browser.menus.create.callCount;
      const info = {
        color: "blue",
        cookieStoreId: "foo",
        icon: "briefcase",
        name: "bar",
      };
      const res = await func(info);
      assert.strictEqual(browser.menus.create.callCount, i + 2, "called");
      assert.deepEqual(res, [null, null], "result");
    });
  });

  describe("handle contextualIdentities.onRemoved", () => {
    const func = mjs.contextualIdentitiesOnRemoved;

    it("should call function", async () => {
      const i = browser.menus.remove.callCount;
      const res = await func({
        cookieStoreId: "foo",
      });
      assert.strictEqual(browser.menus.remove.callCount, i + 2, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
    });
  });

  describe("handle contextualIdentities.onUpdated", () => {
    const func = mjs.contextualIdentitiesOnUpdated;

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const res = await func({
        color: "red",
        cookieStoreId: "foo",
        icon: "fingerprint",
        name: "bar",
      });
      assert.strictEqual(browser.menus.update.callCount, i + 2, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
    });
  });
});
