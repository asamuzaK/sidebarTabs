/**
 * util.test.js
 */
/* eslint-disable no-magic-numbers */

import {JSDOM} from "jsdom";
import {assert} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import sinon from "sinon";
import psl from "psl";
import {browser} from "./mocha/setup.js";
import * as mjs from "../src/mjs/util.js";
import {
  CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, NEW_TAB, PINNED,
  TAB, TAB_LIST,
} from "../src/mjs/constant.js";

describe("util", () => {
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
  const globalKeys = ["Node", "NodeList"];
  let window, document;
  beforeEach(() => {
    const dom = createJsdom();
    window = dom && dom.window;
    window.psl = psl;
    document = window && window.document;
    global.browser = browser;
    global.window = window;
    global.document = document;
    for (const key of globalKeys) {
      global[key] = window[key];
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
  });

  it("should get browser object", () => {
    assert.isObject(browser, "browser");
  });

  describe("get template", () => {
    const func = mjs.getTemplate;

    it("should throw if no argument given", async () => {
      assert.throws(() => func(), "Expected String but got Undefined.");
    });

    it("should throw if argument is not string", async () => {
      assert.throws(() => func(1), "Expected String but got Number.");
    });

    it("should get null", async () => {
      const res = func("foo");
      assert.isNull(res, "result");
    });

    it("should get cloned fragment", async () => {
      const tmpl = document.createElement("template");
      const p = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = "foo";
      tmpl.content.appendChild(p);
      body.appendChild(tmpl);
      const res = await func("foo");
      assert.strictEqual(res.nodeType, Node.ELEMENT_NODE, "nodeType");
      assert.strictEqual(res.localName, "p", "localName");
    });
  });

  describe("get sidebar tab container from parent node", () => {
    const func = mjs.getSidebarTabContainer;

    it("should get null if no argument given", async () => {
      const res = await func();
      assert.isNull(res, "result");
    });

    it("should get null if container not found", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      const res = await func(elm);
      assert.isNull(res, "result");
    });

    it("should get container", async () => {
      const cnt = document.createElement("div");
      const p = document.createElement("p");
      const elm = document.createElement("span");
      const body = document.querySelector("body");
      cnt.classList.add(CLASS_TAB_CONTAINER);
      p.appendChild(elm);
      cnt.appendChild(p);
      body.appendChild(cnt);
      const res = await func(elm);
      assert.isTrue(res === cnt, "result");
    });
  });

  describe("restore sidebar tab container", () => {
    const func = mjs.restoreTabContainer;

    it("should do nothing if no argument given", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      parent.appendChild(elm);
      body.appendChild(parent);
      await func();
      assert.strictEqual(parent.childElementCount, 1, "result");
    });

    it("should do nothing if argument is not element", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      parent.appendChild(elm);
      body.appendChild(parent);
      await func("foo");
      assert.strictEqual(parent.childElementCount, 1, "result");
    });

    it("should remove element", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm);
      assert.strictEqual(parent.childElementCount, 0, "result");
    });

    it("should remove class", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const child = document.createElement("span");
      const body = document.querySelector("body");
      elm.classList.add(CLASS_TAB_GROUP);
      elm.appendChild(child);
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm);
      assert.isFalse(elm.classList.contains(CLASS_TAB_GROUP), "result");
    });

    it("should do nothing", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const child = document.createElement("span");
      const child2 = document.createElement("span");
      const body = document.querySelector("body");
      elm.classList.add(CLASS_TAB_GROUP);
      elm.appendChild(child);
      elm.appendChild(child2);
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm);
      assert.isTrue(elm.classList.contains(CLASS_TAB_GROUP), "result");
    });
  });

  describe("get sidebar tab from parent node", () => {
    const func = mjs.getSidebarTab;

    it("should get null if no argument given", async () => {
      const res = await func();
      assert.isNull(res, "result");
    });

    it("should get null", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.isNull(res, "result");
    });

    it("should get result", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      parent.dataset.tabId = "1";
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.isTrue(res === parent, "result");
    });
  });

  describe("get sidebar tab ID", () => {
    const func = mjs.getSidebarTabId;

    it("should get null if no argument given", async () => {
      const res = await func();
      assert.isNull(res, "result");
    });

    it("should get null", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.isNull(res, "result");
    });

    it("should get result", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      parent.dataset.tabId = "1";
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.strictEqual(res, 1, "result");
    });
  });

  describe("get sidebar tab IDs", () => {
    const func = mjs.getSidebarTabIds;

    it("should throw if no argument given", () => {
      assert.throws(() => func(), "Expected Array but got Undefined.", "throw");
    });

    it("should throw if argument is not array", () => {
      assert.throws(() => func(1), "Expected Array but got Number.", "throw");
    });

    it("should get empty array if array does not contain element", async () => {
      const res = await func(["foo"]);
      assert.deepEqual(res, [], "result");
    });

    it("should get empty array if element is not tab", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      const res = await func([elm]);
      assert.deepEqual(res, [], "result");
    });

    it("should get array", async () => {
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      elm.dataset.tabId = "1";
      elm2.dataset.tabId = "2";
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func([elm, elm2]);
      assert.deepEqual(res, [1, 2], "result");
    });
  });

  describe("get sidebar tab index", () => {
    const func = mjs.getSidebarTabIndex;

    it("should get null if no argument given", async () => {
      const res = await func();
      assert.isNull(res, "result");
    });

    it("should get null if argument is not element", async () => {
      const res = await func("foo");
      assert.isNull(res, "result");
    });

    it("should get null", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      const res = await func(elm);
      assert.isNull(res, "result");
    });

    it("should get result", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(res, 0, "result");
    });

    it("should get result", async () => {
      const prev = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      prev.classList.add(TAB);
      prev.dataset.tabId = "1";
      elm.classList.add(TAB);
      elm.dataset.tabId = "2";
      body.appendChild(prev);
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(res, 1, "result");
    });
  });

  describe("get tabs in range", () => {
    const func = mjs.getTabsInRange;

    it("should get empty array if no argument given", async () => {
      const res = await func();
      assert.deepEqual(res, [], "result");
    });

    it("should get empty array if 2nd argument not given", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      const res = await func(elm);
      assert.deepEqual(res, [], "result");
    });

    it("should get empty array if given arguments are not tabs", async () => {
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func(elm);
      assert.deepEqual(res, [], "result");
    });

    it("should get result", async () => {
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("p");
      const elm5 = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      body.appendChild(elm5);
      const res = await func(elm2, elm4);
      assert.strictEqual(res.length, 3, "length");
      assert.isTrue(res[0] === elm2, "result");
      assert.isTrue(res[1] === elm3, "result");
      assert.isTrue(res[2] === elm4, "result");
    });

    it("should get result", async () => {
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("p");
      const elm5 = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      body.appendChild(elm5);
      const res = await func(elm3, elm5);
      assert.strictEqual(res.length, 3, "length");
      assert.isTrue(res[0] === elm3, "result");
      assert.isTrue(res[1] === elm4, "result");
      assert.isTrue(res[2] === elm5, "result");
    });

    it("should get result", async () => {
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("p");
      const elm5 = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      body.appendChild(elm5);
      const res = await func(elm4, elm);
      assert.strictEqual(res.length, 4, "length");
      assert.isTrue(res[0] === elm, "result");
      assert.isTrue(res[1] === elm2, "result");
      assert.isTrue(res[2] === elm3, "result");
      assert.isTrue(res[3] === elm4, "result");
    });
  });

  describe("is newtab", () => {
    const func = mjs.isNewTab;

    it("should get false if no argument given", async () => {
      const res = await func();
      assert.isFalse(res, "result");
    });

    it("should get false", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.isFalse(res, "result");
    });

    it("should get result", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      parent.id = NEW_TAB;
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.isTrue(res, "result");
    });
  });

  describe("get tab list from sessions", () => {
    const func = mjs.getSessionTabList;

    it("should throw if no argument given", async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "throw");
      });
    });

    it("should throw if argument is not string", async () => {
      await func(1).catch(e => {
        assert.strictEqual(e.message, "Expected String but got Number.",
                           "throw");
      });
    });

    it("should get null", async () => {
      browser.windows.getCurrent.resolves({
        id: 1,
      });
      browser.sessions.getWindowValue.withArgs(1, "foo").resolves(undefined);
      const i = browser.windows.getCurrent.callCount;
      const j = browser.sessions.getWindowValue.callCount;
      const res = await func("foo");
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 1,
                         "called windows");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, j + 1,
                         "called sessions");
      assert.isNull(res, "result");
      browser.windows.getCurrent.flush();
      browser.sessions.getWindowValue.flush();
    });

    it("should get null", async () => {
      browser.windows.getCurrent.resolves({
        id: 1,
      });
      browser.sessions.getWindowValue.withArgs(1, "foo")
        .resolves("{\"bar\":\"baz\"}");
      const i = browser.windows.getCurrent.callCount;
      const j = browser.sessions.getWindowValue.callCount;
      const res = await func("foo");
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 1,
                         "called windows");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, j + 1,
                         "called sessions");
      assert.deepEqual(res, {
        bar: "baz",
      }, "result");
      browser.windows.getCurrent.flush();
      browser.sessions.getWindowValue.flush();
    });
  });

  describe("set tab list to sessions", () => {
    const func = mjs.setSessionTabList;

    it("should not call function if incognito", async () => {
      browser.windows.getCurrent.resolves({
        incognito: true,
      });
      const i = browser.sessions.setWindowValue.callCount;
      await func();
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i,
                         "not called");
      browser.windows.getCurrent.flush();
    });

    it("should not call function if tab not found", async () => {
      browser.windows.getCurrent.resolves({
        incognito: false,
      });
      const i = browser.sessions.setWindowValue.callCount;
      await func();
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i,
                         "not called");
      browser.windows.getCurrent.flush();
    });

    it("should call function", async () => {
      browser.windows.getCurrent.resolves({
        incognito: false,
        id: 1,
      });
      browser.sessions.getWindowValue.withArgs(1, TAB_LIST).resolves(undefined);
      const arg = JSON.stringify({
        recent: {
          0: {
            collapsed: false,
            url: "http://example.com",
            containerIndex: 0,
          },
          1: {
            collapsed: false,
            url: "https://example.com",
            containerIndex: 1,
          },
          2: {
            collapsed: false,
            url: "https://www.example.com",
            containerIndex: 1,
          },
        },
      });
      const i = browser.sessions.setWindowValue.withArgs(1, "tabList", arg)
        .callCount;
      const parent = document.createElement("div");
      const parent2 = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "http://example.com",
      });
      elm2.classList.add(TAB);
      elm2.classList.add(CLASS_TAB_COLLAPSED);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm3.classList.add(TAB);
      elm3.classList.add(CLASS_TAB_COLLAPSED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://www.example.com",
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      await func();
      assert.strictEqual(
        browser.sessions.setWindowValue.withArgs(1, "tabList", arg).callCount,
        i + 1, "called set",
      );
      browser.windows.getCurrent.flush();
      browser.sessions.getWindowValue.flush();
    });

    it("should call function", async () => {
      browser.windows.getCurrent.resolves({
        incognito: false,
        id: 1,
      });
      browser.sessions.getWindowValue.withArgs(1, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            foo: "bar",
          },
        }));
      const arg = JSON.stringify({
        recent: {
          0: {
            collapsed: false,
            url: "http://example.com",
            containerIndex: 0,
          },
          1: {
            collapsed: false,
            url: "https://example.com",
            containerIndex: 1,
          },
          2: {
            collapsed: false,
            url: "https://www.example.com",
            containerIndex: 1,
          },
        },
        prev: {
          foo: "bar",
        },
      });
      const i = browser.sessions.setWindowValue.withArgs(1, "tabList", arg)
        .callCount;
      const parent = document.createElement("div");
      const parent2 = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "http://example.com",
      });
      elm2.classList.add(TAB);
      elm2.classList.add(CLASS_TAB_COLLAPSED);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm3.classList.add(TAB);
      elm3.classList.add(CLASS_TAB_COLLAPSED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://www.example.com",
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      await func();
      assert.strictEqual(
        browser.sessions.setWindowValue.withArgs(1, "tabList", arg).callCount,
        i + 1, "called set",
      );
      browser.windows.getCurrent.flush();
      browser.sessions.getWindowValue.flush();
    });
  });

  describe("activate tab", () => {
    const func = mjs.activateTab;

    it("should get null if no argument given", async () => {
      const res = await func();
      assert.isNull(res, "result");
    });

    it("should get null if tab not found", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      const res = await func(elm);
      assert.isNull(res, "result");
    });

    it("should call function", async () => {
      browser.tabs.update.withArgs(1, {
        active: true,
      }).resolves(true);
      const i = browser.tabs.update.withArgs(1, {
        active: true,
      }).callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.update.callCount, i + 1, "called");
      assert.isTrue(res, "result");
      browser.tabs.update.flush();
    });
  });

  describe("scroll tab into view", () => {
    const func = mjs.scrollTabIntoView;

    it("should not call function", async () => {
      const pinned = document.createElement("p");
      const newTab = document.createElement("p");
      const body = document.querySelector("body");
      const stubPinned = sinon.stub(pinned, "getBoundingClientRect").returns({
        top: 0,
        bottom: 100,
      });
      const stubNewTab = sinon.stub(newTab, "getBoundingClientRect").returns({
        top: 300,
        bottom: 400,
      });
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(newTab);
      await func();
      assert.isFalse(stubPinned.called, "not called");
      assert.isFalse(stubNewTab.called, "not called");
    });

    it("should not call function", async () => {
      const pinned = document.createElement("p");
      const newTab = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const stubPinned = sinon.stub(pinned, "getBoundingClientRect").returns({
        top: 0,
        bottom: 100,
      });
      const stubNewTab = sinon.stub(newTab, "getBoundingClientRect").returns({
        top: 300,
        bottom: 400,
      });
      const stubElm = sinon.stub(elm, "getBoundingClientRect").returns({
        top: 150,
        bottom: 250,
      });
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isFalse(stubPinned.called, "not called");
      assert.isFalse(stubNewTab.called, "not called");
      assert.isFalse(stubElm.called, "not called");
    });

    it("should not call function", async () => {
      const pinned = document.createElement("p");
      const newTab = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const stubPinned = sinon.stub(pinned, "getBoundingClientRect").returns({
        top: 0,
        bottom: 100,
      });
      const stubNewTab = sinon.stub(newTab, "getBoundingClientRect").returns({
        top: 300,
        bottom: 400,
      });
      const stubElm = sinon.stub(elm, "getBoundingClientRect").returns({
        top: 150,
        bottom: 250,
      });
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      elm.dataset.tab = JSON.stringify({
        active: false,
      });
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isFalse(stubPinned.called, "not called");
      assert.isFalse(stubNewTab.called, "not called");
      assert.isFalse(stubElm.called, "not called");
    });

    it("should not call function", async () => {
      const pinned = document.createElement("p");
      const newTab = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const stubPinned = sinon.stub(pinned, "getBoundingClientRect").returns({
        top: 0,
        bottom: 100,
      });
      const stubNewTab = sinon.stub(newTab, "getBoundingClientRect").returns({
        top: 300,
        bottom: 400,
      });
      const stubElm = sinon.stub(elm, "getBoundingClientRect").returns({
        top: 150,
        bottom: 250,
      });
      const stubFunc = sinon.stub();
      elm.dataset.tab = JSON.stringify({
        active: true,
      });
      elm.scrollIntoView = stubFunc;
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isTrue(stubPinned.called, "called");
      assert.isTrue(stubNewTab.called, "called");
      assert.isTrue(stubElm.called, "called");
      assert.isFalse(stubFunc.called, "not called");
    });

    it("should not call function", async () => {
      const pinned = document.createElement("p");
      const newTab = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const stubPinned = sinon.stub(pinned, "getBoundingClientRect").returns({
        top: 0,
        bottom: 100,
      });
      const stubNewTab = sinon.stub(newTab, "getBoundingClientRect").returns({
        top: 300,
        bottom: 400,
      });
      const stubElm = sinon.stub(elm, "getBoundingClientRect").returns({
        top: 150,
        bottom: 250,
      });
      const stubFunc = sinon.stub();
      elm.dataset.tab = JSON.stringify({
        active: false,
        openerTabId: 1,
      });
      elm.scrollIntoView = stubFunc;
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isTrue(stubPinned.called, "called");
      assert.isTrue(stubNewTab.called, "called");
      assert.isTrue(stubElm.called, "called");
      assert.isFalse(stubFunc.called, "not called");
    });

    it("should call function", async () => {
      const pinned = document.createElement("p");
      const newTab = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const stubPinned = sinon.stub(pinned, "getBoundingClientRect").returns({
        top: 0,
        bottom: 100,
      });
      const stubNewTab = sinon.stub(newTab, "getBoundingClientRect").returns({
        top: 300,
        bottom: 400,
      });
      const stubElm = sinon.stub(elm, "getBoundingClientRect").returns({
        top: 350,
        bottom: 450,
      });
      const stubFunc = sinon.stub();
      elm.dataset.tab = JSON.stringify({
        active: true,
      });
      elm.scrollIntoView = stubFunc;
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isTrue(stubPinned.called, "called");
      assert.isTrue(stubNewTab.called, "called");
      assert.isTrue(stubElm.called, "called");
      assert.isTrue(stubFunc.called, "not called");
    });

    it("should call function", async () => {
      const pinned = document.createElement("p");
      const newTab = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const stubPinned = sinon.stub(pinned, "getBoundingClientRect").returns({
        top: 0,
        bottom: 100,
      });
      const stubNewTab = sinon.stub(newTab, "getBoundingClientRect").returns({
        top: 300,
        bottom: 400,
      });
      const stubElm = sinon.stub(elm, "getBoundingClientRect").returns({
        top: 350,
        bottom: 450,
      });
      const stubFunc = sinon.stub();
      elm.dataset.tab = JSON.stringify({
        active: false,
        openerTabId: 1,
      });
      elm.scrollIntoView = stubFunc;
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isTrue(stubPinned.called, "called");
      assert.isTrue(stubNewTab.called, "called");
      assert.isTrue(stubElm.called, "called");
      assert.isTrue(stubFunc.called, "not called");
    });

    it("should call function", async () => {
      const pinned = document.createElement("p");
      const newTab = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const stubPinned = sinon.stub(pinned, "getBoundingClientRect").returns({
        top: 0,
        bottom: 100,
      });
      const stubNewTab = sinon.stub(newTab, "getBoundingClientRect").returns({
        top: 300,
        bottom: 400,
      });
      const stubElm = sinon.stub(elm, "getBoundingClientRect").returns({
        top: 50,
        bottom: 150,
      });
      const stubFunc = sinon.stub();
      elm.dataset.tab = JSON.stringify({
        active: false,
        openerTabId: 1,
      });
      elm.scrollIntoView = stubFunc;
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(elm);
      body.appendChild(newTab);
      await func(elm);
      assert.isTrue(stubPinned.called, "called");
      assert.isTrue(stubNewTab.called, "called");
      assert.isTrue(stubElm.called, "called");
      assert.isTrue(stubFunc.called, "not called");
    });
  });

  describe("create URL match string", () => {
    const func = mjs.createUrlMatchString;

    it("should throw", () => {
      assert.throws(() => func(), "Expected String but got Undefined.",
                    "throw");
    });

    it("should throw", () => {
      assert.throws(() => func(""));
    });

    it("should throw", () => {
      assert.throws(() => func("foo"));
    });

    it("should get result", () => {
      const url = "file:///C:\\Program Files";
      const res = func(url);
      assert.strictEqual(res, "file:///*", "result");
    });

    it("should get result", () => {
      const url = "http://www.example.com/foo";
      const res = func(url);
      assert.strictEqual(res, "*://*.example.com/*", "result");
    });

    it("should get result", () => {
      const url = "https://example.com/foo";
      const res = func(url);
      assert.strictEqual(res, "*://*.example.com/*", "result");
    });

    it("should get result", () => {
      const url = "http://93.184.216.34/foo";
      const res = func(url);
      assert.strictEqual(res, "*://93.184.216.34/*", "result");
    });

    it("should get result", () => {
      const url = "https://93.184.216.34/foo";
      const res = func(url);
      assert.strictEqual(res, "*://93.184.216.34/*", "result");
    });

    it("should get result", () => {
      const url = "https://[::1]/foo";
      const res = func(url);
      assert.strictEqual(res, "*://[::1]/*", "result");
    });

    it("should get result", () => {
      const url = "wss://example.com/foo";
      const res = func(url);
      assert.strictEqual(res, "wss://*.example.com/*", "result");
    });

    it("should get result", () => {
      const url = "wss://93.184.216.34/foo";
      const res = func(url);
      assert.strictEqual(res, "wss://93.184.216.34/*", "result");
    });
  });
});
