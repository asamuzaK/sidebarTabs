/* eslint-disable max-nested-callbacks */
"use strict";
{
  /* api */
  const {JSDOM} = require("jsdom");
  const {after, before, describe, it} = require("mocha");
  const {assert} = require("chai");
  const browser = require("sinon-chrome");
  const rewire = require("rewire");

  describe("background", () => {
    let bgJs;

    before(() => {
      const {window} = new JSDOM();
      const {document} = window;
      global.browser = browser;
      global.window = window;
      global.document = document;
      bgJs = rewire("../src/js/background");
    });

    after(() => {
      browser.flush();
      delete global.browser;
      delete global.window;
      delete global.document;
      bgJs = null;
    });

    describe("throwErr", () => {
      it("should throw", () => {
        const throwErr = bgJs.__get__("throwErr");
        const e = new Error("error test");
        assert.throws(() => throwErr(e), "error test");
      });
    });

    describe("setSidebarWindowId", () => {
      it("should set current window ID", async () => {
        const WINDOW_ID_CURRENT = bgJs.__get__("WINDOW_ID_CURRENT");
        const func = bgJs.__get__("setSidebarWindowId");
        const setSidebar = bgJs.__set__("sidebar", {
          windowId: Math.abs(WINDOW_ID_CURRENT) + 1,
        });
        await func();
        const {windowId} = bgJs.__get__("sidebar");
        assert.isNumber(windowId);
        assert.strictEqual(windowId, WINDOW_ID_CURRENT);
        setSidebar();
      });

      it("should set current window ID", async () => {
        const WINDOW_ID_CURRENT = bgJs.__get__("WINDOW_ID_CURRENT");
        const WINDOW_ID_NONE = bgJs.__get__("WINDOW_ID_NONE");
        const func = bgJs.__get__("setSidebarWindowId");
        const setSidebar = bgJs.__set__("sidebar", {
          windowId: Math.abs(WINDOW_ID_CURRENT) + 1,
        });
        await func(WINDOW_ID_NONE);
        const {windowId} = bgJs.__get__("sidebar");
        assert.isNumber(windowId);
        assert.strictEqual(windowId, WINDOW_ID_CURRENT);
        setSidebar();
      });

      it("should set given window ID", async () => {
        const WINDOW_ID_CURRENT = bgJs.__get__("WINDOW_ID_CURRENT");
        const func = bgJs.__get__("setSidebarWindowId");
        const setSidebar = bgJs.__set__("sidebar", {
          windowId: WINDOW_ID_CURRENT,
        });
        const id = Math.abs(WINDOW_ID_CURRENT) + 1;
        await func(id);
        const {windowId} = bgJs.__get__("sidebar");
        assert.isNumber(windowId);
        assert.strictEqual(windowId, id);
        setSidebar();
      });
    });

    describe("setSidebarIsOpenState", () => {
      it("should set false", async () => {
        const WINDOW_ID_CURRENT = bgJs.__get__("WINDOW_ID_CURRENT");
        const func = bgJs.__get__("setSidebarIsOpenState");
        const id = WINDOW_ID_CURRENT;
        const sidebarAction = bgJs.__set__("sidebarAction", {
          isOpen: async opt => {
            const {windowId} = opt;
            return windowId === id;
          },
        });
        const setSidebar = bgJs.__set__("sidebar", {
          windowId: Math.abs(WINDOW_ID_CURRENT) + 1,
          isOpen: true,
        });
        await func();
        const {isOpen} = bgJs.__get__("sidebar");
        assert.isFalse(isOpen);
        sidebarAction();
        setSidebar();
      });

      it("should set false", async () => {
        const WINDOW_ID_CURRENT = bgJs.__get__("WINDOW_ID_CURRENT");
        const func = bgJs.__get__("setSidebarIsOpenState");
        const id = Math.abs(WINDOW_ID_CURRENT) + 1;
        const sidebarAction = bgJs.__set__("sidebarAction", {
          isOpen: async () => false,
        });
        const setSidebar = bgJs.__set__("sidebar", {
          windowId: id,
          isOpen: true,
        });
        await func();
        const {isOpen} = bgJs.__get__("sidebar");
        assert.isFalse(isOpen);
        sidebarAction();
        setSidebar();
      });

      it("should set true", async () => {
        const WINDOW_ID_CURRENT = bgJs.__get__("WINDOW_ID_CURRENT");
        const func = bgJs.__get__("setSidebarIsOpenState");
        const id = Math.abs(WINDOW_ID_CURRENT) + 1;
        const sidebarAction = bgJs.__set__("sidebarAction", {
          isOpen: async opt => {
            const {windowId} = opt;
            let res;
            if (windowId === id) {
              res = true;
            }
            return res || false;
          },
        });
        const setSidebar = bgJs.__set__("sidebar", {
          windowId: id,
          isOpen: false,
        });
        await func();
        const {isOpen} = bgJs.__get__("sidebar");
        assert.isTrue(isOpen);
        sidebarAction();
        setSidebar();
      });
    });

    describe("toggleSidebar", () => {
      it("should close sidebar", async () => {
        const func = bgJs.__get__("toggleSidebar");
        const sidebarAction = bgJs.__set__("sidebarAction", {
          open: async () => 1,
          close: async () => 0,
        });
        const setSidebar = bgJs.__set__("sidebar", {
          isOpen: true,
        });
        const res = await func();
        assert.strictEqual(res, 0);
        sidebarAction();
        setSidebar();
      });

      it("should open sidebar", async () => {
        const func = bgJs.__get__("toggleSidebar");
        const sidebarAction = bgJs.__set__("sidebarAction", {
          open: async () => 1,
          close: async () => 0,
        });
        const setSidebar = bgJs.__set__("sidebar", {
          isOpen: false,
        });
        const res = await func();
        assert.strictEqual(res, 1);
        sidebarAction();
        setSidebar();
      });
    });

    describe("handlePort", () => {
      it("should add listener", async () => {
        const func = bgJs.__get__("handlePort");
        class Port {
          constructor() {
            this._callback;
            this.onDisconnect = {
              addListener: cb => {
                this._callback = cb;
              },
            };
          }
          disconnect() {
            return this._callback && this._callback();
          }
        }
        const port = new Port();
        const callback = bgJs.__set__("setSidebarIsOpenState",
                                      async () => true);
        await func(port);
        const res = await port.disconnect();
        assert.isTrue(res);
        callback();
      });
    });

    describe("handleBrowserActionOnClicked", () => {
      it("should return function", async () => {
        const func = bgJs.__get__("handleBrowserActionOnClicked");
        const toggleSidebar = bgJs.__set__("toggleSidebar",
                                           async () => true);
        const setSidebarState = bgJs.__set__("setSidebarIsOpenState",
                                             async () => true);
        const res = await func();
        assert.isTrue(res);
        toggleSidebar();
        setSidebarState();
      });
    });

    describe("handleConnectedPort", () => {
      it("should return function", async () => {
        const func = bgJs.__get__("handleConnectedPort");
        const handlePort = bgJs.__set__("handlePort", async () => true);
        const setSidebarState = bgJs.__set__("setSidebarIsOpenState",
                                             async () => true);
        const res = await func();
        assert.isTrue(res);
        handlePort();
        setSidebarState();
      });
    });

    describe("handleWindowOnFocusChanged", () => {
      it("should return function", async () => {
        const func = bgJs.__get__("handleWindowOnFocusChanged");
        const setSidebarWindowId = bgJs.__set__("setSidebarWindowId",
                                                async () => true);
        const setSidebarState = bgJs.__set__("setSidebarIsOpenState",
                                             async () => true);
        const res = await func();
        assert.isTrue(res);
        setSidebarWindowId();
        setSidebarState();
      });
    });

    describe("handleOnStartup", () => {
      it("should return function", async () => {
        const func = bgJs.__get__("handleOnStartup");
        const setSidebarState = bgJs.__set__("setSidebarIsOpenState",
                                             async () => true);
        const res = await func();
        assert.isTrue(res);
        setSidebarState();
      });
    });
  });
}
