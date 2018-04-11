"use strict";
{
  /* api */
  const {JSDOM} = require("jsdom");
  const {after, before, describe, it} = require("mocha");
  const {assert} = require("chai");
  const browser = require("sinon-chrome");
  const rewire = require("rewire");

  describe("background", () => {
    let bg;

    before(() => {
      const {window} = new JSDOM();
      const {document} = window;
      global.browser = browser;
      global.window = window;
      global.document = document;
      bg = rewire("../src/js/background");
    });

    after(() => {
      browser.flush();
      delete global.browser;
      delete global.window;
      delete global.document;
      bg = null;
    });

    describe("throwErr", () => {
      it("should throw", () => {
        const throwErr = bg.__get__("throwErr");
        const e = new Error("error test");
        assert.throws(() => throwErr(e), "error test");
      });
    });

    describe("setSidebarWindowId", () => {
      it("should set current window ID", async () => {
        const setSidebarWindowId = bg.__get__("setSidebarWindowId");
        const WINDOW_ID_CURRENT = bg.__get__("WINDOW_ID_CURRENT");
        const setSidebar = bg.__set__("sidebar", {
          windowId: Math.abs(WINDOW_ID_CURRENT) + 1,
        });
        await setSidebarWindowId();
        const {windowId} = bg.__get__("sidebar");
        assert.isNumber(windowId);
        assert.strictEqual(windowId, WINDOW_ID_CURRENT);
        setSidebar();
      });

      it("should set current window ID", async () => {
        const setSidebarWindowId = bg.__get__("setSidebarWindowId");
        const WINDOW_ID_CURRENT = bg.__get__("WINDOW_ID_CURRENT");
        const WINDOW_ID_NONE = bg.__get__("WINDOW_ID_NONE");
        const setSidebar = bg.__set__("sidebar", {
          windowId: Math.abs(WINDOW_ID_CURRENT) + 1,
        });
        await setSidebarWindowId(WINDOW_ID_NONE);
        const {windowId} = bg.__get__("sidebar");
        assert.isNumber(windowId);
        assert.strictEqual(windowId, WINDOW_ID_CURRENT);
        setSidebar();
      });

      it("should set given window ID", async () => {
        const setSidebarWindowId = bg.__get__("setSidebarWindowId");
        const WINDOW_ID_CURRENT = bg.__get__("WINDOW_ID_CURRENT");
        const setSidebar = bg.__set__("sidebar", {
          windowId: WINDOW_ID_CURRENT,
        });
        const id = Math.abs(WINDOW_ID_CURRENT) + 1;
        await setSidebarWindowId(id);
        const {windowId} = bg.__get__("sidebar");
        assert.isNumber(windowId);
        assert.strictEqual(windowId, id);
        setSidebar();
      });
    });

    describe("setSidebarIsOpenState", () => {
      it("should set false", async () => {
        const setSidebarIsOpenState = bg.__get__("setSidebarIsOpenState");
        const WINDOW_ID_CURRENT = bg.__get__("WINDOW_ID_CURRENT");
        const id = WINDOW_ID_CURRENT;
        const sidebarAction = bg.__set__("sidebarAction", {
          isOpen: async opt => {
            const {windowId} = opt;
            return windowId === id;
          },
        });
        const setSidebar = bg.__set__("sidebar", {
          windowId: Math.abs(WINDOW_ID_CURRENT) + 1,
          isOpen: true,
        });
        await setSidebarIsOpenState();
        const {isOpen} = bg.__get__("sidebar");
        assert.isFalse(isOpen);
        sidebarAction();
        setSidebar();
      });

      it("should set false", async () => {
        const setSidebarIsOpenState = bg.__get__("setSidebarIsOpenState");
        const WINDOW_ID_CURRENT = bg.__get__("WINDOW_ID_CURRENT");
        const id = Math.abs(WINDOW_ID_CURRENT) + 1;
        const sidebarAction = bg.__set__("sidebarAction", {
          isOpen: async () => false,
        });
        const setSidebar = bg.__set__("sidebar", {
          windowId: id,
          isOpen: true,
        });
        await setSidebarIsOpenState();
        const {isOpen} = bg.__get__("sidebar");
        assert.isFalse(isOpen);
        sidebarAction();
        setSidebar();
      });

      it("should set true", async () => {
        const setSidebarIsOpenState = bg.__get__("setSidebarIsOpenState");
        const WINDOW_ID_CURRENT = bg.__get__("WINDOW_ID_CURRENT");
        const id = Math.abs(WINDOW_ID_CURRENT) + 1;
        const sidebarAction = bg.__set__("sidebarAction", {
          isOpen: async opt => {
            const {windowId} = opt;
            let res;
            if (windowId === id) {
              res = true;
            }
            return res || false;
          },
        });
        const setSidebar = bg.__set__("sidebar", {
          windowId: id,
          isOpen: false,
        });
        await setSidebarIsOpenState();
        const {isOpen} = bg.__get__("sidebar");
        assert.isTrue(isOpen);
        sidebarAction();
        setSidebar();
      });
    });

    describe("toggleSidebar", () => {
      it("should close sidebar", async () => {
        const toggleSidebar = bg.__get__("toggleSidebar");
        const sidebarAction = bg.__set__("sidebarAction", {
          open: async () => 1,
          close: async () => 0,
        });
        const setSidebar = bg.__set__("sidebar", {
          isOpen: true,
        });
        const res = await toggleSidebar();
        assert.strictEqual(res, 0);
        sidebarAction();
        setSidebar();
      });

      it("should open sidebar", async () => {
        const toggleSidebar = bg.__get__("toggleSidebar");
        const sidebarAction = bg.__set__("sidebarAction", {
          open: async () => 1,
          close: async () => 0,
        });
        const setSidebar = bg.__set__("sidebar", {
          isOpen: false,
        });
        const res = await toggleSidebar();
        assert.strictEqual(res, 1);
        sidebarAction();
        setSidebar();
      });
    });

    describe("handlePort", () => {
      it("should add listener", async () => {
        const handlePort = bg.__get__("handlePort");
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
        const callback = bg.__set__("setSidebarIsOpenState", async () => true);
        await handlePort(port);
        const res = await port.disconnect();
        assert.isTrue(res);
        callback();
      });
    });

    describe("handleBrowserActionOnClicked", () => {
      it("should return function", async () => {
        const func = bg.__get__("handleBrowserActionOnClicked");
        const toggleSidebar = bg.__set__("toggleSidebar",
                                         async () => true);
        const setSidebarState = bg.__set__("setSidebarIsOpenState",
                                           async () => true);
        const res = await func();
        assert.isTrue(res);
        toggleSidebar();
        setSidebarState();
      });
    });

    describe("handleConnectedPort", () => {
      it("should return function", async () => {
        const func = bg.__get__("handleConnectedPort");
        const handlePort = bg.__set__("handlePort", async () => true);
        const setSidebarState = bg.__set__("setSidebarIsOpenState",
                                           async () => true);
        const res = await func();
        assert.isTrue(res);
        handlePort();
        setSidebarState();
      });
    });

    describe("handleWindowOnFocusChanged", () => {
      it("should return function", async () => {
        const func = bg.__get__("handleWindowOnFocusChanged");
        const setSidebarWindowId = bg.__set__("setSidebarWindowId",
                                              async () => true);
        const setSidebarState = bg.__set__("setSidebarIsOpenState",
                                           async () => true);
        const res = await func();
        assert.isTrue(res);
        setSidebarWindowId();
        setSidebarState();
      });
    });

    describe("handleOnStartup", () => {
      it("should return function", async () => {
        const func = bg.__get__("handleOnStartup");
        const setSidebarState = bg.__set__("setSidebarIsOpenState",
                                           async () => true);
        const res = await func();
        assert.isTrue(res);
        setSidebarState();
      });
    });
  });
}
