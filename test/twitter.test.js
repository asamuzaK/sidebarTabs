/* eslint-disable max-nested-callbacks */
"use strict";
{
  /* api */
  const {JSDOM} = require("jsdom");
  const {after, before, describe, it} = require("mocha");
  const {assert} = require("chai");
  const browser = require("sinon-chrome");
  const rewire = require("rewire");
  const sinon = require("sinon");

  /* constant */
  const CLASS_NEW_TWEETS = "js-new-tweets-bar";
  const TAB_OBSERVE = "observeTab";

  describe("contextmenu", () => {
    let twJs;

    before(() => {
      const {window} = new JSDOM();
      const {document} = window;
      global.browser = browser;
      global.window = window;
      global.document = document;
      twJs = rewire("../src/js/twitter");
    });

    after(() => {
      browser.flush();
      delete global.browser;
      delete global.window;
      delete global.document;
      twJs = null;
    });

    describe("throwErr", () => {
      it("should throw", () => {
        const func = twJs.__get__("throwErr");
        const e = new Error("error test");
        assert.throws(() => func(e), "error test");
      });
    });

    describe("sendMsg", () => {
      it("should get null", async () => {
        const func = twJs.__get__("sendMsg");
        const res = await func();
        assert.isNull(res);
      });

      it("should get message", async () => {
        const func = twJs.__get__("sendMsg");
        const stubSend = twJs.__set__("runtime", {
          sendMessage: msg => msg,
        });
        const res = await func("foo");
        assert.strictEqual(res, "foo");
        stubSend();
      });
    });

    describe("createObserveMsg", () => {
      it("should get null if no argument given", async () => {
        const func = twJs.__get__("createObserveMsg");
        const res = await func();
        assert.isNull(res);
      });

      it("should get null if type is not contained", async () => {
        const func = twJs.__get__("createObserveMsg");
        const res = await func({});
        assert.isNull(res);
      });

      it("should get null if type is not truthy", async () => {
        const func = twJs.__get__("createObserveMsg");
        const res = await func({type: false});
        assert.isNull(res);
      });

      it("should get message", async () => {
        const func = twJs.__get__("createObserveMsg");
        const msg = {
          [TAB_OBSERVE]: "foo",
        };
        const res = await func({type: "foo"});
        assert.deepEqual(res, msg);
      });
    });

    describe("globalNavAddListener", () => {
      it("should add listener", async () => {
        const EXPECTED_CALLS = 2;
        const func = twJs.__get__("globalNavAddListener");
        const p1 = document.createElement("p");
        const p2 = document.createElement("p");
        const arr = [p1, p2];
        const stubQuerySelector =
          sinon.stub(document, "querySelectorAll").callsFake(() => arr);
        const stubP1Listener = sinon.stub(p1, "addEventListener");
        const stubP2Listener = sinon.stub(p2, "addEventListener");
        await func();
        const {calledOnce: queryCalledOnce} = stubQuerySelector;
        const {callCount: p1CalledCount} = stubP1Listener;
        const {callCount: p2CalledCount} = stubP2Listener;
        stubQuerySelector.restore();
        stubP1Listener.restore();
        stubP2Listener.restore();
        assert.isTrue(queryCalledOnce);
        assert.strictEqual(p1CalledCount, EXPECTED_CALLS);
        assert.strictEqual(p2CalledCount, EXPECTED_CALLS);
      });
    });

    describe("handleKeydownMousedown", () => {
      it("should throw if no argument given", () => {
        const func = twJs.__get__("handleKeydownMousedown");
        assert.throws(() => func());
      });

      it("should get null if code does not match", async () => {
        const func = twJs.__get__("handleKeydownMousedown");
        const res = await func({code: "foo"});
        assert.isNull(res);
      });

      it("should get null if class does not match", async () => {
        const func = twJs.__get__("handleKeydownMousedown");
        const parentElm = document.createElement("div");
        const elm = document.createElement("p");
        parentElm.appendChild(elm);
        const res = await func({
          code: "Enter",
          target: elm,
        });
        assert.isNull(res);
      });

      it("should get function", async () => {
        const func = twJs.__get__("handleKeydownMousedown");
        const createObserveMsg = twJs.__set__("createObserveMsg",
                                              async () => true);
        const sendMsg = twJs.__set__("sendMsg", async () => true);
        const parentElm = document.createElement("div");
        const elm = document.createElement("p");
        parentElm.appendChild(elm);
        parentElm.classList.add(CLASS_NEW_TWEETS);
        const res = await func({
          code: "Enter",
          target: elm,
        });
        assert.isTrue(res);
        createObserveMsg();
        sendMsg();
      });

      it("should get function", async () => {
        const func = twJs.__get__("handleKeydownMousedown");
        const createObserveMsg = twJs.__set__("createObserveMsg",
                                              async () => true);
        const sendMsg = twJs.__set__("sendMsg", async () => true);
        const parentElm = document.createElement("div");
        const elm = document.createElement("p");
        elm.classList.add(CLASS_NEW_TWEETS);
        parentElm.appendChild(elm);
        const res = await func({
          code: "Enter",
          target: elm,
        });
        assert.isTrue(res);
        createObserveMsg();
        sendMsg();
      });

      it("should get null if button does not match", async () => {
        const func = twJs.__get__("handleKeydownMousedown");
        const res = await func({
          button: 1,
        });
        assert.isNull(res);
      });

      it("should get null if class does not match", async () => {
        const func = twJs.__get__("handleKeydownMousedown");
        const parentElm = document.createElement("div");
        const elm = document.createElement("p");
        parentElm.appendChild(elm);
        const res = await func({
          button: 0,
          target: elm,
        });
        assert.isNull(res);
      });

      it("should get function", async () => {
        const func = twJs.__get__("handleKeydownMousedown");
        const createObserveMsg = twJs.__set__("createObserveMsg",
                                              async () => true);
        const sendMsg = twJs.__set__("sendMsg", async () => true);
        const parentElm = document.createElement("div");
        const elm = document.createElement("p");
        parentElm.appendChild(elm);
        parentElm.classList.add(CLASS_NEW_TWEETS);
        const res = await func({
          button: 0,
          target: elm,
        });
        assert.isTrue(res);
        createObserveMsg();
        sendMsg();
      });

      it("should get function", async () => {
        const func = twJs.__get__("handleKeydownMousedown");
        const createObserveMsg = twJs.__set__("createObserveMsg",
                                              async () => true);
        const sendMsg = twJs.__set__("sendMsg", async () => true);
        const parentElm = document.createElement("div");
        const elm = document.createElement("p");
        elm.classList.add(CLASS_NEW_TWEETS);
        parentElm.appendChild(elm);
        const res = await func({
          button: 0,
          target: elm,
        });
        assert.isTrue(res);
        createObserveMsg();
        sendMsg();
      });
    });
  });
}
