/**
 * tab-group.test.js
 */
/* eslint-disable no-magic-numbers */

import {JSDOM} from "jsdom";
import {assert} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import sinon from "sinon";
import psl from "psl";
import {browser} from "./mocha/setup.js";
import * as mjs from "../src/mjs/tab-group.js";
import {
  ACTIVE, CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER, CLASS_TAB_CONTAINER_TMPL,
  CLASS_TAB_CONTEXT, CLASS_TAB_GROUP, CLASS_UNGROUP, HIGHLIGHTED, PINNED,
  TAB, TAB_GROUP_COLLAPSE, TAB_GROUP_ENABLE, TAB_GROUP_EXPAND,
} from "../src/mjs/constant.js";

describe("tab-group", () => {
  /**
   * create jsdom
   *
   * @returns {object} - jsdom instance
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
    window.psl = psl;
    document = window && window.document;
    browser._sandbox.reset();
    browser.i18n.getMessage.callsFake((...args) => args.toString());
    browser.permissions.contains.resolves(true);
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
    browser._sandbox.reset();
  });

  it("should get browser object", () => {
    assert.isObject(browser, "browser");
  });

  describe("restore sidebar tab containers", () => {
    const func = mjs.restoreTabContainers;

    it("should call function", async () => {
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const child = document.createElement("p");
      const child2 = document.createElement("p");
      const child3 = document.createElement("p");
      const body = document.querySelector("body");
      elm.id = PINNED;
      elm.classList.add(CLASS_TAB_CONTAINER);
      elm2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(CLASS_TAB_GROUP);
      elm4.classList.add(CLASS_TAB_CONTAINER);
      elm3.appendChild(child);
      elm4.appendChild(child2);
      elm4.appendChild(child3);
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      await func();
      assert.strictEqual(body.childElementCount, 3, "child count");
      assert.deepEqual(elm.parentNode, body, "pinned");
      assert.isNull(elm2.parentNode, "removed");
      assert.isFalse(elm3.classList.contains(CLASS_TAB_GROUP), "remove class");
      assert.isTrue(elm4.classList.contains(CLASS_TAB_GROUP), "add class");
    });
  });

  describe("collapse tab group", () => {
    const func = mjs.collapseTabGroup;

    it("should not call function", async () => {
      await func();
      assert.isFalse(browser.i18n.getMessage.called, "result");
    });

    it("should not call function", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      await func(elm);
      assert.isFalse(browser.i18n.getMessage.called, "result");
    });

    it("should set value", async () => {
      browser.i18n.getMessage.withArgs(`${TAB_GROUP_EXPAND}_tooltip`)
        .returns("foo");
      browser.i18n.getMessage.withArgs(TAB_GROUP_EXPAND).returns("bar");
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("span");
      const elm4 = document.createElement("img");
      const body = document.querySelector("body");
      elm.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(CLASS_TAB_GROUP);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "1";
      elm3.appendChild(elm4);
      elm2.appendChild(elm3);
      elm.appendChild(elm2);
      body.appendChild(elm);
      await func(elm);
      assert.isTrue(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 2, "called");
      assert.strictEqual(elm3.title, "foo", "title");
      assert.strictEqual(elm4.alt, "bar", "alt");
    });

    it("should not call function", async () => {
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("span");
      const elm4 = document.createElement("img");
      const body = document.querySelector("body");
      elm.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(CLASS_TAB_GROUP);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "1";
      elm3.appendChild(elm4);
      elm2.appendChild(elm3);
      elm.appendChild(elm2);
      body.appendChild(elm);
      body.classList.add(CLASS_UNGROUP);
      await func(elm);
      assert.isFalse(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(browser.i18n.getMessage.callCount, i, "not called");
    });
  });

  describe("expand tab group", () => {
    const func = mjs.expandTabGroup;

    it("should not call function", async () => {
      await func();
      assert.isFalse(browser.i18n.getMessage.called, "result");
    });

    it("should not call function", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      await func(elm);
      assert.isFalse(browser.i18n.getMessage.called, "result");
    });

    it("should set value", async () => {
      browser.i18n.getMessage.withArgs(`${TAB_GROUP_COLLAPSE}_tooltip`)
        .returns("foo");
      browser.i18n.getMessage.withArgs(TAB_GROUP_COLLAPSE).returns("bar");
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("span");
      const elm4 = document.createElement("img");
      const body = document.querySelector("body");
      elm.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(CLASS_TAB_COLLAPSED);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "1";
      elm3.appendChild(elm4);
      elm2.appendChild(elm3);
      elm.appendChild(elm2);
      body.appendChild(elm);
      await func(elm);
      assert.isFalse(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 2, "called");
      assert.strictEqual(elm3.title, "foo", "title");
      assert.strictEqual(elm4.alt, "bar", "alt");
    });
  });

  describe("toggle enable / disable tab grouping", () => {
    const func = mjs.toggleTabGrouping;

    it("should not add class", async () => {
      const i = browser.storage.local.get.callCount;
      const body = document.querySelector("body");
      browser.storage.local.get.withArgs([TAB_GROUP_ENABLE]).resolves({});
      body.classList.add(CLASS_UNGROUP);
      await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.isFalse(body.classList.contains(CLASS_UNGROUP), "class");
    });

    it("should not add class", async () => {
      const i = browser.storage.local.get.callCount;
      const body = document.querySelector("body");
      browser.storage.local.get.withArgs([TAB_GROUP_ENABLE]).resolves({
        enableTabGroup: {
          checked: true,
        },
      });
      body.classList.add(CLASS_UNGROUP);
      await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.isFalse(body.classList.contains(CLASS_UNGROUP), "class");
    });

    it("should add class", async () => {
      const i = browser.storage.local.get.callCount;
      const elm = document.createElement("div");
      const p = document.createElement("p");
      const span = document.createElement("span");
      const img = document.createElement("img");
      const body = document.querySelector("body");
      browser.storage.local.get.withArgs([TAB_GROUP_ENABLE]).resolves({
        enableTabGroup: {
          checked: false,
        },
      });
      span.appendChild(img);
      p.appendChild(span);
      elm.appendChild(p);
      elm.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(CLASS_TAB_COLLAPSED);
      body.appendChild(elm);
      body.classList.remove(CLASS_UNGROUP);
      await func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.isFalse(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isTrue(body.classList.contains(CLASS_UNGROUP), "class");
    });
  });

  describe("toggle tab group collapsed state", () => {
    const func = mjs.toggleTabGroupCollapsedState;

    it("should do nothing if argument is empty", async () => {
      const res = await func();
      assert.deepEqual(res, [], "result");
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
      const res = await func(elm, true);
      assert.isTrue(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(elm4.title, "foo", "title");
      assert.strictEqual(elm6.alt, "bar", "alt");
      assert.strictEqual(browser.tabs.update.callCount, i + 1, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
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
      const res = await func(elm2, true);
      assert.isTrue(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(elm4.title, "foo", "title");
      assert.strictEqual(elm6.alt, "bar", "alt");
      assert.strictEqual(browser.tabs.update.callCount, i + 1, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
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
      const res = await func(elm3, true);
      assert.isTrue(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(elm4.title, "foo", "title");
      assert.strictEqual(elm6.alt, "bar", "alt");
      assert.strictEqual(browser.tabs.update.callCount, i + 1, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
    });

    it("should add class and not call function", async () => {
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
      const res = await func(elm, false);
      assert.isTrue(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(elm4.title, "foo", "title");
      assert.strictEqual(elm6.alt, "bar", "alt");
      assert.strictEqual(browser.tabs.update.callCount, i, "not called");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should remove class and call function", async () => {
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
      const res = await func(elm, true);
      assert.isFalse(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(elm4.title, "baz", "title");
      assert.strictEqual(elm6.alt, "qux", "alt");
      assert.strictEqual(browser.tabs.update.callCount, i + 1, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
    });

    it("should remove class and call function", async () => {
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
      const res = await func(elm2, true);
      assert.isFalse(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(elm4.title, "baz", "title");
      assert.strictEqual(elm6.alt, "qux", "alt");
      assert.strictEqual(browser.tabs.update.callCount, i + 1, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
    });

    it("should remove class and call function", async () => {
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
      const res = await func(elm3, true);
      assert.isFalse(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(elm4.title, "baz", "title");
      assert.strictEqual(elm6.alt, "qux", "alt");
      assert.strictEqual(browser.tabs.update.callCount, i + 1, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
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
      const res = await func(elm, false);
      assert.isFalse(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(elm4.title, "baz", "title");
      assert.strictEqual(elm6.alt, "qux", "alt");
      assert.strictEqual(browser.tabs.update.callCount, i, "not called");
      assert.deepEqual(res, [undefined], "result");
    });
  });

  describe("toggle multiple tab groups collapsed state", () => {
    const func = mjs.toggleTabGroupsCollapsedState;

    it("should do nothing if argument is empty", async () => {
      const res = await func();
      assert.deepEqual(res, [], "result");
    });

    it("should not call functions", async () => {
      const i = browser.i18n.getMessage.callCount;
      const j = browser.tabs.update.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(CLASS_TAB_CONTAINER);
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(browser.i18n.getMessage.callCount, i, "not called");
      assert.strictEqual(browser.tabs.update.callCount, j, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should call functions", async () => {
      browser.i18n.getMessage.withArgs(`${TAB_GROUP_EXPAND}_tooltip`)
        .returns("foo");
      browser.i18n.getMessage.withArgs(TAB_GROUP_EXPAND).returns("bar");
      browser.i18n.getMessage.withArgs(`${TAB_GROUP_COLLAPSE}_tooltip`)
        .returns("baz");
      browser.i18n.getMessage.withArgs(TAB_GROUP_COLLAPSE).returns("qux");
      const i = browser.i18n.getMessage.callCount;
      const j = browser.tabs.update.callCount;
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("span");
      const elm5 = document.createElement("span");
      const elm6 = document.createElement("img");
      const elm7 = document.createElement("img");
      const elmB = document.createElement("div");
      const elmB2 = document.createElement("p");
      const elmB3 = document.createElement("p");
      const elmB4 = document.createElement("span");
      const elmB5 = document.createElement("span");
      const elmB6 = document.createElement("img");
      const elmB7 = document.createElement("img");
      const elmC = document.createElement("div");
      const elmC2 = document.createElement("p");
      const elmC3 = document.createElement("p");
      const elmC4 = document.createElement("span");
      const elmC5 = document.createElement("span");
      const elmC6 = document.createElement("img");
      const elmC7 = document.createElement("img");
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
      elmB.classList.add(CLASS_TAB_CONTAINER);
      elmB.classList.add(CLASS_TAB_GROUP);
      elmB4.appendChild(elmB6);
      elmB2.classList.add(TAB);
      elmB2.dataset.tabId = "3";
      elmB2.appendChild(elmB4);
      elmB5.appendChild(elmB7);
      elmB3.classList.add(TAB);
      elmB3.dataset.tabId = "4";
      elmB3.appendChild(elmB5);
      elmB.appendChild(elmB2);
      elmB.appendChild(elmB3);
      elmC.classList.add(CLASS_TAB_CONTAINER);
      elmC.classList.add(CLASS_TAB_GROUP);
      elmC.classList.add(CLASS_TAB_COLLAPSED);
      elmC6.alt = "corge";
      elmC4.title = "quux";
      elmC4.appendChild(elmC6);
      elmC2.classList.add(TAB);
      elmC2.dataset.tabId = "5";
      elmC2.appendChild(elmC4);
      elmC5.appendChild(elmC7);
      elmC3.classList.add(TAB);
      elmC3.dataset.tabId = "6";
      elmC3.appendChild(elmC5);
      elmC.appendChild(elmC2);
      elmC.appendChild(elmC3);
      body.appendChild(elm);
      body.appendChild(elmB);
      body.appendChild(elmC);
      const res = await func(elm);
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.strictEqual(browser.tabs.update.callCount, j + 1, "called");
      assert.isFalse(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isTrue(elmB.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isTrue(elmC.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(elm4.title, "baz", "title");
      assert.strictEqual(elm6.alt, "qux", "alt");
      assert.strictEqual(elmB4.title, "foo", "title");
      assert.strictEqual(elmB6.alt, "bar", "alt");
      assert.strictEqual(elmC4.title, "quux", "title");
      assert.strictEqual(elmC6.alt, "corge", "alt");
      assert.deepEqual(res, [
        [undefined, undefined],
        [undefined],
      ], "result");
    });
  });

  describe("collapse multiple tab groups", () => {
    const func = mjs.collapseTabGroups;

    it("should do nothing if argument is empty", async () => {
      const res = await func();
      assert.deepEqual(res, [], "result");
    });

    it("should not call functions", async () => {
      const i = browser.i18n.getMessage.callCount;
      const j = browser.tabs.update.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(CLASS_TAB_CONTAINER);
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(browser.i18n.getMessage.callCount, i, "not called");
      assert.strictEqual(browser.tabs.update.callCount, j, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should call functions", async () => {
      browser.i18n.getMessage.withArgs(`${TAB_GROUP_EXPAND}_tooltip`)
        .returns("foo");
      browser.i18n.getMessage.withArgs(TAB_GROUP_EXPAND).returns("bar");
      const i = browser.i18n.getMessage.callCount;
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("span");
      const elm5 = document.createElement("span");
      const elm6 = document.createElement("img");
      const elm7 = document.createElement("img");
      const elmB = document.createElement("div");
      const elmB2 = document.createElement("p");
      const elmB3 = document.createElement("p");
      const elmB4 = document.createElement("span");
      const elmB5 = document.createElement("span");
      const elmB6 = document.createElement("img");
      const elmB7 = document.createElement("img");
      const elmC = document.createElement("div");
      const elmC2 = document.createElement("p");
      const elmC3 = document.createElement("p");
      const elmC4 = document.createElement("span");
      const elmC5 = document.createElement("span");
      const elmC6 = document.createElement("img");
      const elmC7 = document.createElement("img");
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
      elmB.classList.add(CLASS_TAB_CONTAINER);
      elmB.classList.add(CLASS_TAB_GROUP);
      elmB4.appendChild(elmB6);
      elmB2.classList.add(TAB);
      elmB2.dataset.tabId = "3";
      elmB2.appendChild(elmB4);
      elmB5.appendChild(elmB7);
      elmB3.classList.add(TAB);
      elmB3.dataset.tabId = "4";
      elmB3.appendChild(elmB5);
      elmB.appendChild(elmB2);
      elmB.appendChild(elmB3);
      elmC.classList.add(CLASS_TAB_CONTAINER);
      elmC.classList.add(CLASS_TAB_GROUP);
      elmC4.appendChild(elmC6);
      elmC2.classList.add(TAB);
      elmC2.dataset.tabId = "5";
      elmC2.appendChild(elmC4);
      elmC5.appendChild(elmC7);
      elmC3.classList.add(TAB);
      elmC3.dataset.tabId = "6";
      elmC3.appendChild(elmC5);
      elmC.appendChild(elmC2);
      elmC.appendChild(elmC3);
      body.appendChild(elm);
      body.appendChild(elmB);
      body.appendChild(elmC);
      const res = await func(elm);
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.isFalse(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isTrue(elmB.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isTrue(elmC.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.strictEqual(elmB4.title, "foo", "title");
      assert.strictEqual(elmB6.alt, "bar", "alt");
      assert.strictEqual(elmC4.title, "foo", "title");
      assert.strictEqual(elmC6.alt, "bar", "alt");
      assert.deepEqual(res, [
        [undefined],
        [undefined],
      ], "result");
    });
  });

  describe("handle individual tab group collapsed state", () => {
    const func = mjs.handleTabGroupCollapsedState;

    it("should throw", () => {
      assert.throws(() => func());
    });

    it("should not call function", async () => {
      const i = browser.windows.getCurrent.callCount;
      browser.windows.getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      const evt = {
        target: elm,
      };
      const res = await func(evt);
      assert.strictEqual(browser.windows.getCurrent.callCount, i, "not called");
      assert.isNull(res, "result");
    });

    it("should call function", async () => {
      const i = browser.windows.getCurrent.callCount;
      browser.windows.getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const evt = {
        target: elm,
      };
      const res = await func(evt);
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 1, "called");
      assert.isUndefined(res, "result");
    });
  });

  describe("handle multiple tab groups collapsed state", () => {
    const func = mjs.handleTabGroupsCollapsedState;

    it("should throw", () => {
      assert.throws(() => func());
    });

    it("should not call functions", async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.windows.getCurrent.callCount;
      browser.windows.getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      const evt = {
        target: elm,
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.update.callCount, i, "not called");
      assert.strictEqual(browser.windows.getCurrent.callCount, j, "not called");
      assert.isNull(res, "result");
    });

    it("should call functions", async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.windows.getCurrent.callCount;
      browser.windows.getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      const elm = document.createElement("div");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("span");
      const elm5 = document.createElement("span");
      const elm6 = document.createElement("img");
      const elm7 = document.createElement("img");
      const elmB = document.createElement("div");
      const elmB2 = document.createElement("p");
      const elmB3 = document.createElement("p");
      const elmB4 = document.createElement("span");
      const elmB5 = document.createElement("span");
      const elmB6 = document.createElement("img");
      const elmB7 = document.createElement("img");
      const elmC = document.createElement("div");
      const elmC2 = document.createElement("p");
      const elmC3 = document.createElement("p");
      const elmC4 = document.createElement("span");
      const elmC5 = document.createElement("span");
      const elmC6 = document.createElement("img");
      const elmC7 = document.createElement("img");
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
      elmB.classList.add(CLASS_TAB_CONTAINER);
      elmB.classList.add(CLASS_TAB_GROUP);
      elmB4.appendChild(elmB6);
      elmB2.classList.add(TAB);
      elmB2.dataset.tabId = "3";
      elmB2.appendChild(elmB4);
      elmB5.appendChild(elmB7);
      elmB3.classList.add(TAB);
      elmB3.dataset.tabId = "4";
      elmB3.appendChild(elmB5);
      elmB.appendChild(elmB2);
      elmB.appendChild(elmB3);
      elmC.classList.add(CLASS_TAB_CONTAINER);
      elmC.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(CLASS_TAB_COLLAPSED);
      elmC4.appendChild(elmC6);
      elmC2.classList.add(TAB);
      elmC2.dataset.tabId = "5";
      elmC2.appendChild(elmC4);
      elmC5.appendChild(elmC7);
      elmC3.classList.add(TAB);
      elmC3.dataset.tabId = "6";
      elmC3.appendChild(elmC5);
      elmC.appendChild(elmC2);
      elmC.appendChild(elmC3);
      body.appendChild(elm);
      body.appendChild(elmB);
      body.appendChild(elmC);
      const evt = {
        target: elm4,
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.update.callCount, i + 1, "called");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1, "called");
      assert.isFalse(elm.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isTrue(elmB.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isTrue(elmC.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isUndefined(res, "result");
    });
  });

  describe("add tab context click listener", () => {
    const func = mjs.addTabContextClickListener;

    it("should not add listener", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      const spy2 = sinon.spy(elm, "removeEventListener");
      body.appendChild(elm);
      await func(elm);
      assert.isFalse(spy.called, "not called");
      assert.isFalse(spy2.called, "not called");
      elm.addEventListener.restore();
      elm.removeEventListener.restore();
    });

    it("should not add listener", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      const spy2 = sinon.spy(elm, "removeEventListener");
      body.appendChild(elm);
      await func(elm, true);
      assert.isFalse(spy.called, "not called");
      assert.isFalse(spy2.called, "not called");
      elm.addEventListener.restore();
      elm.removeEventListener.restore();
    });

    it("should add listener", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      const spy2 = sinon.spy(elm, "removeEventListener");
      elm.classList.add(CLASS_TAB_CONTEXT);
      body.appendChild(elm);
      await func(elm);
      assert.isTrue(spy.calledOnce, "called");
      assert.isTrue(spy2.calledOnce, "called");
      elm.addEventListener.restore();
      elm.removeEventListener.restore();
    });

    it("should add listener", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      const spy2 = sinon.spy(elm, "removeEventListener");
      elm.classList.add(CLASS_TAB_CONTEXT);
      body.appendChild(elm);
      await func(elm, true);
      assert.isTrue(spy.calledOnce, "called");
      assert.isTrue(spy2.calledOnce, "called");
      elm.addEventListener.restore();
      elm.removeEventListener.restore();
    });
  });

  describe("replace tab context click listener", () => {
    const func = mjs.replaceTabContextClickListener;

    it("should not add listener", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      const spy2 = sinon.spy(elm, "removeEventListener");
      body.appendChild(elm);
      const res = await func(false);
      assert.isFalse(spy.called, "not called");
      assert.isFalse(spy2.called, "not called");
      assert.deepEqual(res, [], "result");
      elm.addEventListener.restore();
      elm.removeEventListener.restore();
    });

    it("should not add listener", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      const spy2 = sinon.spy(elm, "removeEventListener");
      body.appendChild(elm);
      const res = await func(true);
      assert.isFalse(spy.called, "not called");
      assert.isFalse(spy2.called, "not called");
      assert.deepEqual(res, [], "result");
      elm.addEventListener.restore();
      elm.removeEventListener.restore();
    });

    it("should add listener", async () => {
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      const spy2 = sinon.spy(elm, "removeEventListener");
      const spy3 = sinon.spy(elm2, "addEventListener");
      const spy4 = sinon.spy(elm2, "removeEventListener");
      const i = spy.callCount;
      const j = spy2.callCount;
      const k = spy3.callCount;
      const l = spy4.callCount;
      elm.classList.add(CLASS_TAB_CONTEXT);
      elm2.classList.add(CLASS_TAB_CONTEXT);
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func(false);
      assert.strictEqual(spy.callCount, i + 1, "called");
      assert.strictEqual(spy2.callCount, j + 1, "called");
      assert.strictEqual(spy3.callCount, k + 1, "called");
      assert.strictEqual(spy4.callCount, l + 1, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
      elm.addEventListener.restore();
      elm.removeEventListener.restore();
      elm2.addEventListener.restore();
      elm2.removeEventListener.restore();
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
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
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
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
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
      const elm3 = document.createElement("span");
      const elm4 = document.createElement("span");
      const elm5 = document.createElement("img");
      const elm6 = document.createElement("img");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(ACTIVE);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.appendChild(elm5);
      elm4.appendChild(elm6);
      elm.appendChild(elm3);
      elm2.appendChild(elm4);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      const res = await func();
      assert.deepEqual(res, [undefined, undefined], "result");
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

  describe("group same container tabs", () => {
    const func = mjs.groupSameContainerTabs;

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected Number but got Undefined.");
      });
    });

    it("should not group", async () => {
      const arg = {
        cookieStoreId: "foo",
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      const i = browser.tabs.query.withArgs(arg).callCount;
      const j = browser.tabs.move.callCount;
      browser.tabs.get.resolves({
        cookieStoreId: "foo",
      });
      browser.tabs.query.withArgs(arg).resolves([
        {
          id: 1,
          cookieStoreId: "foo",
        },
      ]);
      const res = await func(1);
      assert.strictEqual(browser.tabs.query.withArgs(arg).callCount, i + 1,
                         "query");
      assert.strictEqual(browser.tabs.move.callCount, j, "not moved");
      assert.isNull(res, "result");
    });

    it("should group tabs", async () => {
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const parent = document.createElement("div");
      const parent2 = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      const arg = {
        cookieStoreId: "foo",
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      const i = browser.tabs.query.withArgs(arg).callCount;
      const j = browser.tabs.move.callCount;
      browser.tabs.get.resolves({
        cookieStoreId: "foo",
      });
      browser.tabs.query.withArgs(arg).resolves([
        {
          id: 1,
          cookieStoreId: "foo",
        },
        {
          id: 3,
          cookieStoreId: "foo",
        },
      ]);
      const res = await func(1, browser.windows.WINDOW_ID_CURRENT);
      assert.strictEqual(browser.tabs.query.withArgs(arg).callCount, i + 1,
                         "query");
      assert.strictEqual(browser.tabs.move.callCount, j + 2, "move");
      assert.strictEqual(body.childElementCount, 4, "parent");
      assert.strictEqual(parent.childElementCount, 1, "child");
      assert.strictEqual(parent.nextElementSibling.childElementCount, 2,
                         "child");
      assert.strictEqual(parent2.childElementCount, 0, "child");
      assert.isNull(res, "result");
    });

    it("should group tabs", async () => {
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const parent = document.createElement("div");
      const parent2 = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      const arg = {
        cookieStoreId: "foo",
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      const i = browser.tabs.query.withArgs(arg).callCount;
      const j = browser.tabs.move.callCount;
      browser.tabs.get.resolves({
        cookieStoreId: "foo",
      });
      browser.tabs.query.withArgs(arg).resolves([
        {
          id: 1,
          cookieStoreId: "foo",
        },
        {
          id: 3,
          cookieStoreId: "foo",
        },
      ]);
      const res = await func(3, browser.windows.WINDOW_ID_CURRENT);
      assert.strictEqual(browser.tabs.query.withArgs(arg).callCount, i + 1,
                         "query");
      assert.strictEqual(browser.tabs.move.callCount, j + 1, "move");
      assert.strictEqual(body.childElementCount, 3, "parent");
      assert.strictEqual(parent.childElementCount, 1, "child");
      assert.strictEqual(parent2.childElementCount, 2, "child");
      assert.isNull(res, "result");
    });
  });

  describe("group same domain tabs", () => {
    const func = mjs.groupSameDomainTabs;

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "error");
        assert.strictEqual(e.message, "Expected Number but got Undefined.");
      });
    });

    it("should not group", async () => {
      const arg = {
        pinned: false,
        url: "*://*.example.com/*",
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      const i = browser.tabs.query.withArgs(arg).callCount;
      const j = browser.tabs.move.callCount;
      browser.tabs.get.resolves({
        url: "https://www.example.com/foo",
      });
      browser.tabs.query.withArgs(arg).resolves([
        {
          id: 1,
          url: "https://www.example.com/foo",
        },
      ]);
      const res = await func(1);
      assert.strictEqual(browser.tabs.query.withArgs(arg).callCount, i + 1,
                         "query");
      assert.strictEqual(browser.tabs.move.callCount, j, "not moved");
      assert.isNull(res, "result");
    });

    it("should group tabs", async () => {
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const parent = document.createElement("div");
      const parent2 = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      const arg = {
        pinned: false,
        url: "*://*.example.com/*",
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      const i = browser.tabs.query.withArgs(arg).callCount;
      const j = browser.tabs.move.callCount;
      browser.tabs.get.resolves({
        url: "https://www.example.com/foo",
      });
      browser.tabs.query.withArgs(arg).resolves([
        {
          id: 1,
          url: "https://www.example.com/foo",
        },
        {
          id: 3,
          url: "https://example.com/bar",
        },
      ]);
      const res = await func(1, browser.windows.WINDOW_ID_CURRENT);
      assert.strictEqual(browser.tabs.query.withArgs(arg).callCount, i + 1,
                         "query");
      assert.strictEqual(browser.tabs.move.callCount, j + 2, "move");
      assert.strictEqual(body.childElementCount, 4, "parent");
      assert.strictEqual(parent.childElementCount, 1, "child");
      assert.strictEqual(parent.nextElementSibling.childElementCount, 2,
                         "child");
      assert.strictEqual(parent2.childElementCount, 0, "child");
      assert.isNull(res, "result");
    });

    it("should group tabs", async () => {
      const tmpl = document.createElement("template");
      const cnt = document.createElement("div");
      const parent = document.createElement("div");
      const parent2 = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      const arg = {
        pinned: false,
        url: "*://*.example.com/*",
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      const i = browser.tabs.query.withArgs(arg).callCount;
      const j = browser.tabs.move.callCount;
      browser.tabs.get.resolves({
        url: "https://example.com/bar",
      });
      browser.tabs.query.withArgs(arg).resolves([
        {
          id: 1,
          url: "https://www.example.com/foo",
        },
        {
          id: 3,
          url: "https://example.com/bar",
        },
      ]);
      const res = await func(3, browser.windows.WINDOW_ID_CURRENT);
      assert.strictEqual(browser.tabs.query.withArgs(arg).callCount, i + 1,
                         "query");
      assert.strictEqual(browser.tabs.move.callCount, j + 1, "move");
      assert.strictEqual(body.childElementCount, 3, "parent");
      assert.strictEqual(parent.childElementCount, 1, "child");
      assert.strictEqual(parent2.childElementCount, 2, "child");
      assert.isNull(res, "result");
    });
  });

  describe("ungroup tabs", () => {
    const func = mjs.ungroupTabs;

    it("should do nothing if argument is not element", async () => {
      const spy = sinon.spy(document, "getElementById");
      await func();
      assert.isFalse(spy.called, "not called");
      document.getElementById.restore();
    });

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
