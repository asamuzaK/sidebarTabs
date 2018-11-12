/**
 * options.test.js
 */
/* eslint-disable  max-nested-callbacks, no-await-in-loop, no-magic-numbers */

import {JSDOM} from "jsdom";
import {assert} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import sinon from "sinon";
import {browser} from "./mocha/setup.js";
import * as mjs from "../src/mjs/options.js";
import {EXT_INIT} from "../src/mjs/constant.js";

describe("options", () => {
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

  describe("send message", () => {
    const func = mjs.sendMsg;

    it("should not call function if no argument given", async () => {
      const i = browser.runtime.sendMessage.callCount;
      await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
                         "not called");
    });

    it("should not call function if argument is falsy", async () => {
      const i = browser.runtime.sendMessage.callCount;
      await func(false);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
                         "not called");
    });

    it("should call function", async () => {
      const i = browser.runtime.sendMessage.callCount;
      await func({foo: "bar"});
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
    });
  });

  describe("port init extension", () => {
    const func = mjs.portInitExt;

    it("should not call function if no argument given", async () => {
      const i = browser.runtime.sendMessage.callCount;
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
                         "not called");
      assert.isNull(res, "result");
    });

    it("should call function", async () => {
      const i = browser.runtime.sendMessage.callCount;
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
    });
  });

  describe("create pref", () => {
    const func = mjs.createPref;

    it("should get null if argument not given", async () => {
      const res = await func();
      assert.isNull(res, "result");
    });

    it("should get object", async () => {
      const res = await func({
        id: "foo",
      });
      assert.deepEqual(res, {
        foo: {
          id: "foo",
          checked: false,
          value: "",
          subItemOf: null,
        },
      }, "result");
    });
  });

  describe("store pref", () => {
    const func = mjs.storePref;

    it("should call function", async () => {
      const i = browser.storage.local.set.callCount;
      const evt = {
        target: {
          id: "foo",
          type: "text",
        },
      };
      const res = await func(evt);
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, "called");
      assert.strictEqual(res.length, 1, "array length");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.storage.local.set.callCount;
      const elm = document.createElement("input");
      const elm2 = document.createElement("input");
      const body = document.querySelector("body");
      const evt = {
        target: {
          id: "foo",
          name: "bar",
          type: "radio",
        },
      };
      elm.id = "foo";
      elm.name = "bar";
      elm.type = "radio";
      elm2.id = "baz";
      elm2.name = "bar";
      elm2.type = "radio";
      body.appendChild(elm);
      body.appendChild(elm2);
      window.func = func;
      const res = await window.func(evt);
      assert.strictEqual(browser.storage.local.set.callCount, i + 2, "called");
      assert.strictEqual(res.length, 2, "array length");
      assert.deepEqual(res, [undefined, undefined], "result");
    });
  });

  describe("handle init extension click", () => {
    const func = mjs.handleInitExtClick;

    it("should get undefined", async () => {
      browser.runtime.sendMessage.resolves(undefined);
      const i = browser.runtime.sendMessage.callCount;
      const fake = sinon.fake();
      const fake2 = sinon.fake();
      const res = await func({
        currentTarget: "foo",
        target: "foo",
        preventDefault: fake,
        stopPropagation: fake2,
      });
      assert.isTrue(fake.calledOnce, "preventDefault");
      assert.isTrue(fake2.calledOnce, "stopPropagation");
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
      browser.runtime.sendMessage.flush();
    });
  });

  describe("add event listener to init button", () => {
    const func = mjs.addInitExtensionListener;

    it("should not set listener", async () => {
      const elm = document.createElement("button");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      body.appendChild(elm);
      window.func = func;
      await window.func();
      assert.isTrue(spy.notCalled, "not called");
      elm.addEventListener.restore();
    });

    it("should set listener", async () => {
      const elm = document.createElement("button");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      elm.id = EXT_INIT;
      body.appendChild(elm);
      window.func = func;
      await window.func();
      assert.isTrue(spy.calledOnce, "called");
      elm.addEventListener.restore();
    });
  });

  describe("add event listener to input elements", () => {
    const func = mjs.addInputChangeListener;

    it("should set listener", async () => {
      const elm = document.createElement("input");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      body.appendChild(elm);
      window.func = func;
      await window.func();
      assert.isTrue(spy.calledOnce, "called");
      elm.addEventListener.restore();
    });
  });

  describe("set html input value", () => {
    const func = mjs.setHtmlInputValue;

    it("should not set value if argument not given", async () => {
      const elm = document.createElement("input");
      const body = document.querySelector("body");
      window.func = func;
      elm.id = "foo";
      elm.type = "checkbox";
      body.appendChild(elm);
      await window.func();
      assert.strictEqual(elm.checked, false, "checked");
    });

    it("should not set value if element not found", async () => {
      const elm = document.createElement("input");
      const body = document.querySelector("body");
      window.func = func;
      elm.id = "foo";
      elm.type = "checkbox";
      body.appendChild(elm);
      await window.func({
        id: "bar",
        checked: true,
      });
      assert.strictEqual(elm.checked, false, "checked");
    });

    it("should not set value if type does not match", async () => {
      const elm = document.createElement("input");
      const body = document.querySelector("body");
      window.func = func;
      elm.id = "foo";
      elm.type = "bar";
      elm.checked = false;
      elm.value = "baz";
      body.appendChild(elm);
      await window.func({
        id: "foo",
        checked: true,
        value: "qux",
      });
      assert.strictEqual(elm.checked, false, "checked");
      assert.strictEqual(elm.value, "baz", "checked");
    });

    it("should set checkbox value", async () => {
      const elm = document.createElement("input");
      const body = document.querySelector("body");
      window.func = func;
      elm.id = "foo";
      elm.type = "checkbox";
      body.appendChild(elm);
      await window.func({
        id: "foo",
        checked: true,
      });
      assert.strictEqual(elm.checked, true, "checked");
    });

    it("should set checkbox value", async () => {
      const elm = document.createElement("input");
      const body = document.querySelector("body");
      window.func = func;
      elm.id = "foo";
      elm.type = "checkbox";
      body.appendChild(elm);
      await window.func({
        id: "foo",
      });
      assert.strictEqual(elm.checked, false, "checked");
    });

    it("should set radio value", async () => {
      const elm = document.createElement("input");
      const body = document.querySelector("body");
      window.func = func;
      elm.id = "foo";
      elm.type = "radio";
      body.appendChild(elm);
      await window.func({
        id: "foo",
        checked: true,
      });
      assert.strictEqual(elm.checked, true, "checked");
    });

    it("should set text value", async () => {
      const elm = document.createElement("input");
      const body = document.querySelector("body");
      window.func = func;
      elm.id = "foo";
      elm.type = "text";
      body.appendChild(elm);
      await window.func({
        id: "foo",
        value: "bar",
      });
      assert.strictEqual(elm.value, "bar", "value");
    });

    it("should set text value", async () => {
      const elm = document.createElement("input");
      const body = document.querySelector("body");
      window.func = func;
      elm.id = "foo";
      elm.type = "text";
      body.appendChild(elm);
      await window.func({
        id: "foo",
      });
      assert.strictEqual(elm.value, "", "value");
    });

    it("should set url value", async () => {
      const elm = document.createElement("input");
      const body = document.querySelector("body");
      window.func = func;
      elm.id = "foo";
      elm.type = "url";
      body.appendChild(elm);
      await window.func({
        id: "foo",
        value: "bar/baz",
      });
      assert.strictEqual(elm.value, "bar/baz", "value");
    });
  });

  describe("set html input values from storage", () => {
    const func = mjs.setValuesFromStorage;

    it("should get empty array", async () => {
      const i = browser.storage.local.get.callCount;
      browser.storage.local.get.resolves({});
      window.func = func;
      const res = await window.func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.strictEqual(res.length, 0, "array length");
      assert.deepEqual(res, [], "result");
    });

    it("should get empty array", async () => {
      const i = browser.storage.local.get.callCount;
      browser.storage.local.get.resolves({
        foo: {},
        bar: {},
      });
      window.func = func;
      const res = await window.func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.strictEqual(res.length, 0, "array length");
      assert.deepEqual(res, [], "result");
    });

    it("should get array", async () => {
      const i = browser.storage.local.get.callCount;
      browser.storage.local.get.resolves({
        foo: {
          bar: {},
        },
        baz: {
          qux: {},
        },
      });
      window.func = func;
      const res = await window.func();
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, "called");
      assert.strictEqual(res.length, 2, "array length");
      assert.deepEqual(res, [undefined, undefined], "result");
    });
  });
});
