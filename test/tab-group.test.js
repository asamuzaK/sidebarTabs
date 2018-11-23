/**
 * tab-group.test.js
 */
/* eslint-disable  max-nested-callbacks, no-await-in-loop, no-magic-numbers */

import {JSDOM} from "jsdom";
import {assert} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import sinon from "sinon";
import {browser} from "./mocha/setup.js";
import * as mjs from "../src/mjs/tab-group.js";
import {
  ACTIVE, CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER, CLASS_TAB_CONTAINER_TMPL,
  CLASS_TAB_CONTEXT, CLASS_TAB_GROUP, HIGHLIGHTED, PINNED, TAB,
  TAB_GROUP_COLLAPSE, TAB_GROUP_EXPAND,
} from "../src/mjs/constant.js";

describe("tab-group", () => {
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

  describe("toggle tab group collapsed state", () => {
    const func = mjs.toggleTabGroupCollapsedState;

    it("should do nothing if argument is empty", async () => {
      const res = await func();
      assert.isUndefined(res, "result");
    });

    it("should add class and call function", async () => {
      browser.i18n.getMessage.withArgs(`${TAB_GROUP_EXPAND}_tooltip`)
        .returns("foo");
      browser.i18n.getMessage.withArgs(TAB_GROUP_EXPAND).returns("bar");
      browser.i18n.getMessage.withArgs(`${TAB_GROUP_COLLAPSE}_tooltip`)
        .returns("baz");
      browser.i18n.getMessage.withArgs(TAB_GROUP_COLLAPSE).returns("qux");
      const i = browser.tabs.update.callCount;
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("span");
      const elm5 = document.createElement("span");
      const elm6 = document.createElement("img");
      const elm7 = document.createElement("img");
      const body = document.querySelector("body");
      elm.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(CLASS_TAB_GROUP);
      elm4.appendChild(elm6);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "1";
      elm2.appendChild(elm4);
      elm5.appendChild(elm7);
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "2";
      elm3.appendChild(elm5);
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(elm);
      const res = await func({
        target: elm,
      });
      assert.isTrue(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(elm4.title, "foo", "title");
      assert.strictEqual(elm6.alt, "bar", "alt");
      assert.strictEqual(browser.tabs.update.callCount, i + 1, "called");
      assert.isNull(res, "result");
      browser.i18n.getMessage.flush();
      browser.tabs.update.flush();
    });

    it("should remove class and not call function", async () => {
      browser.i18n.getMessage.withArgs(`${TAB_GROUP_EXPAND}_tooltip`)
        .returns("foo");
      browser.i18n.getMessage.withArgs(TAB_GROUP_EXPAND).returns("bar");
      browser.i18n.getMessage.withArgs(`${TAB_GROUP_COLLAPSE}_tooltip`)
        .returns("baz");
      browser.i18n.getMessage.withArgs(TAB_GROUP_COLLAPSE).returns("qux");
      const i = browser.tabs.update.callCount;
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("span");
      const elm5 = document.createElement("span");
      const elm6 = document.createElement("img");
      const elm7 = document.createElement("img");
      const body = document.querySelector("body");
      elm.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(CLASS_TAB_COLLAPSED);
      elm4.appendChild(elm6);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "1";
      elm2.appendChild(elm4);
      elm5.appendChild(elm7);
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "2";
      elm3.appendChild(elm5);
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(elm);
      const res = await func({
        target: elm,
      });
      assert.isFalse(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(elm4.title, "baz", "title");
      assert.strictEqual(elm6.alt, "qux", "alt");
      assert.strictEqual(browser.tabs.update.callCount, i, "not called");
      assert.isUndefined(res, "result");
      browser.i18n.getMessage.flush();
      browser.tabs.update.flush();
    });
  });

  describe("handle tab context on click", () => {
    const func = mjs.tabContextOnClick;

    it("should call function", async () => {
      browser.windows.getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      const i = browser.windows.getCurrent.callCount;
      const res = await func();
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 1, "called");
      assert.isUndefined(res, "result");
      browser.windows.getCurrent.flush();
    });
  });

  describe("add tab context click listener", () => {
    const func = mjs.addTabContextClickListener;

    it("should add listener", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      elm.classList.add(CLASS_TAB_CONTEXT);
      body.appendChild(elm);
      await func(elm);
      assert.isTrue(spy.calledOnce, "called");
      elm.addEventListener.restore();
    });

    it("should add listener", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      body.appendChild(elm);
      await func(elm);
      assert.isFalse(spy.calledOnce, "called");
      elm.addEventListener.restore();
    });
  });

  describe("expand activated collapsed tab", () => {
    const func = mjs.expandActivatedCollapsedTab;

    it("should get null", async () => {
      const res = await func();
      assert.isNull(res, "result");
    });

    it("should not call function if parent is not collapsed", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(ACTIVE);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      const res = await func();
      assert.isNull(res, "result");
    });

    it("should not call function if active tab is first child", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_COLLAPSED);
      elm.classList.add(ACTIVE);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      const res = await func();
      assert.isNull(res, "result");
    });

    it("should call function", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_COLLAPSED);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(ACTIVE);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      const res = await func();
      assert.isUndefined(res, "result");
    });
  });

  describe("detach tabs from tab group", () => {
    const func = mjs.detachTabsFromGroup;

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

    it("should get null if tab is not contained", async () => {
      const res = await func(["foo"]);
      assert.isNull(res, "result");
    });

    it("should not detatch pinned tab", async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      elm.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(PINNED);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(elm);
      await func([elm2], 1);
      assert.strictEqual(browser.tabs.move.callCount, i, "not called");
      assert.strictEqual(elm.childElementCount, 2, "child");
    });

    it("should not call function if tab is last child", async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      elm.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(PINNED);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(elm);
      await func([elm3], 1);
      assert.strictEqual(browser.tabs.move.callCount, i, "not called");
      assert.strictEqual(elm.childElementCount, 2, "child");
    });

    it("should call function", async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      elm.classList.add(CLASS_TAB_GROUP);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(elm);
      await func([elm2], 1);
      assert.strictEqual(browser.tabs.move.callCount, i + 1, "called");
      assert.strictEqual(elm.childElementCount, 1, "child");
    });

    it("should call function", async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      elm.classList.add(CLASS_TAB_GROUP);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(elm);
      await func([elm2]);
      assert.strictEqual(browser.tabs.move.callCount, i + 1, "called");
      assert.strictEqual(elm.childElementCount, 1, "child");
    });
  });

  describe("group selected tabs", () => {
    const func = mjs.groupSelectedTabs;

    it("should not group tabs if pinned", async () => {
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const elm = document.createElement("div");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("p");
      const elm5 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      elm.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(PINNED);
      elm3.classList.add(TAB);
      elm3.classList.add(PINNED);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm4.classList.add(TAB);
      elm4.classList.add(PINNED);
      elm4.dataset.tabId = "4";
      elm5.classList.add(TAB);
      elm5.classList.add(HIGHLIGHTED);
      elm5.classList.add(PINNED);
      elm5.dataset.tabId = "5";
      elm.appendChild(elm3);
      elm.appendChild(elm4);
      elm.appendChild(elm5);
      body.appendChild(tmpl);
      body.appendChild(elm);
      const res = await func(1);
      assert.strictEqual(elm.childElementCount, 3, "child");
      assert.isNull(res, "result");
    });

    it("should not group tabs if only one tab contained", async () => {
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("p");
      const elm5 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      elm.classList.add(CLASS_TAB_GROUP);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      elm.appendChild(elm3);
      elm.appendChild(elm4);
      elm2.appendChild(elm5);
      body.appendChild(tmpl);
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func(1);
      assert.strictEqual(elm.childElementCount, 2, "child");
      assert.strictEqual(elm2.childElementCount, 1, "child");
      assert.isNull(res, "result");
    });

    it("should group tabs", async () => {
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("p");
      const elm5 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      elm.classList.add(CLASS_TAB_GROUP);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm5.classList.add(TAB);
      elm5.classList.add(HIGHLIGHTED);
      elm5.dataset.tabId = "5";
      elm.appendChild(elm3);
      elm.appendChild(elm4);
      elm2.appendChild(elm5);
      body.appendChild(tmpl);
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func(1);
      assert.strictEqual(elm.childElementCount, 1, "child");
      assert.strictEqual(elm2.childElementCount, 0, "child");
      assert.isNull(res, "result");
    });

    it("should group tabs", async () => {
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("p");
      const elm5 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      elm.classList.add(CLASS_TAB_GROUP);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm5.classList.add(TAB);
      elm5.classList.add(HIGHLIGHTED);
      elm5.dataset.tabId = "5";
      elm.appendChild(elm3);
      elm.appendChild(elm4);
      elm2.appendChild(elm5);
      body.appendChild(tmpl);
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func();
      assert.strictEqual(elm.childElementCount, 1, "child");
      assert.strictEqual(elm2.childElementCount, 0, "child");
      assert.isNull(res, "result");
    });

    it("should group tabs", async () => {
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("p");
      const elm5 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      elm2.classList.add(CLASS_TAB_GROUP);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm5.classList.add(TAB);
      elm5.classList.add(HIGHLIGHTED);
      elm5.dataset.tabId = "5";
      elm.appendChild(elm3);
      elm2.appendChild(elm4);
      elm2.appendChild(elm5);
      body.appendChild(tmpl);
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func();
      assert.strictEqual(elm.childElementCount, 2, "child");
      assert.strictEqual(elm2.childElementCount, 1, "child");
      assert.isNull(res, "result");
    });
  });

  describe("ungroup tabs", () => {
    const func = mjs.ungroupTabs;

    it("should do nothing if element is not tab group container", async () => {
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      elm2.classList.add(TAB);
      elm3.classList.add(TAB);
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(elm);
      await func(elm);
      assert.strictEqual(elm.childElementCount, 2, "child");
    });

    it("should not ungroup if pinned tabs container", async () => {
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      elm.id = PINNED;
      elm2.classList.add(TAB);
      elm3.classList.add(TAB);
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(elm);
      await func(elm);
      assert.strictEqual(elm.childElementCount, 2, "child");
    });

    it("should ungroup ", async () => {
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      elm.classList.add(CLASS_TAB_GROUP);
      elm2.classList.add(TAB);
      elm3.classList.add(TAB);
      elm.appendChild(elm2);
      elm.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(elm);
      await func(elm);
      assert.strictEqual(elm.childElementCount, 0, "child");
    });
  });
});
