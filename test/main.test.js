/**
 * main.test.js
 */
/*
  eslint-disable array-bracket-newline, camelcase, default-case,
                 no-await-in-loop, no-magic-numbers, object-shorthand
*/

import {assert} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import {browser, createJsdom} from "./mocha/setup.js";
import os from "os";
import psl from "psl";
import sinon from "sinon";
import * as mjs from "../src/mjs/main.js";
import {
  ACTIVE, AUDIBLE, BROWSER_SETTINGS_READ,
  CLASS_COMPACT, CLASS_HEADING, CLASS_HEADING_LABEL, CLASS_HEADING_LABEL_EDIT,
  CLASS_NARROW, CLASS_TAB_AUDIO, CLASS_TAB_CLOSE, CLASS_TAB_CLOSE_ICON,
  CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER, CLASS_TAB_CONTAINER_TMPL,
  CLASS_TAB_CONTENT, CLASS_TAB_CONTEXT, CLASS_TAB_GROUP, CLASS_TAB_TITLE,
  CLASS_TAB_TOGGLE_ICON, CLASS_THEME_LIGHT, CLASS_THEME_DARK,
  COOKIE_STORE_DEFAULT,
  CUSTOM_BG, CUSTOM_BG_ACTIVE, CUSTOM_BG_HOVER, CUSTOM_BG_SELECT,
  CUSTOM_BG_SELECT_HOVER, CUSTOM_BORDER, CUSTOM_BORDER_ACTIVE,
  CUSTOM_COLOR, CUSTOM_COLOR_ACTIVE, CUSTOM_COLOR_HOVER,
  CUSTOM_COLOR_SELECT, CUSTOM_COLOR_SELECT_HOVER,
  DISCARDED, EXT_INIT, HIGHLIGHTED, NEW_TAB, PINNED, SIDEBAR_MAIN,
  TAB, TAB_ALL_BOOKMARK, TAB_ALL_RELOAD, TAB_ALL_SELECT, TAB_BOOKMARK,
  TAB_CLOSE, TAB_CLOSE_DBLCLICK, TAB_CLOSE_END, TAB_CLOSE_OTHER, TAB_CLOSE_UNDO,
  TAB_DUPE,
  TAB_GROUP_COLLAPSE, TAB_GROUP_COLLAPSE_OTHER, TAB_GROUP_CONTAINER,
  TAB_GROUP_DETACH, TAB_GROUP_DETACH_TABS, TAB_GROUP_DOMAIN, TAB_GROUP_ENABLE,
  TAB_GROUP_EXPAND_COLLAPSE_OTHER, TAB_GROUP_LABEL_SHOW,
  TAB_GROUP_NEW_TAB_AT_END, TAB_GROUP_SELECTED, TAB_GROUP_UNGROUP,
  TAB_LIST, TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN, TAB_MUTE, TAB_PIN,
  TAB_QUERY, TAB_RELOAD, TAB_SKIP_COLLAPSED, TAB_SWITCH_SCROLL,
  TABS_BOOKMARK, TABS_CLOSE, TABS_DUPE, TABS_MOVE_END,
  TABS_MOVE_START, TABS_MOVE_WIN, TABS_MUTE, TABS_PIN, TABS_RELOAD,
  THEME_CUSTOM_INIT, THEME_CUSTOM_REQ, THEME_DARK, THEME_LIGHT,
  THEME_SCROLLBAR_NARROW, THEME_TAB_COMPACT,
} from "../src/mjs/constant.js";
const IS_WIN = os.platform() === "win32";

describe("main", () => {
  const globalKeys = ["Node"];
  let window, document;
  beforeEach(() => {
    const dom = createJsdom();
    Object.defineProperty(dom.window.HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get: function () {
        return this._clientHeight || 0;
      },
      set(val) {
        this._clientHeight = val;
      },
    });
    Object.defineProperty(dom.window.HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get: function () {
        return this._scrollHeight || 0;
      },
      set(val) {
        this._scrollHeight = val;
      },
    });
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
    mjs.sidebar.closeTabsByDoubleClick = false;
    mjs.sidebar.context = null;
    mjs.sidebar.contextualIds = null;
    mjs.sidebar.enableTabGroup = true;
    mjs.sidebar.incognito = false;
    mjs.sidebar.isMac = false;
    mjs.sidebar.lastClosedTab = null;
    mjs.sidebar.pinnedTabsWaitingToMove = null;
    mjs.sidebar.readBrowserSettings = false;
    mjs.sidebar.skipCollapsed = false;
    mjs.sidebar.switchTabByScrolling = false;
    mjs.sidebar.tabGroupOnExpandCollapseOther = false;
    mjs.sidebar.tabGroupPutNewTabAtTheEnd = false;
    mjs.sidebar.tabsWaitingToMove = null;
    mjs.sidebar.windowId = null;
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
    mjs.sidebar.closeTabsByDoubleClick = false;
    mjs.sidebar.context = null;
    mjs.sidebar.contextualIds = null;
    mjs.sidebar.enableTabGroup = true;
    mjs.sidebar.incognito = false;
    mjs.sidebar.isMac = false;
    mjs.sidebar.lastClosedTab = null;
    mjs.sidebar.pinnedTabsWaitingToMove = null;
    mjs.sidebar.readBrowserSettings = false;
    mjs.sidebar.skipCollapsed = false;
    mjs.sidebar.switchTabByScrolling = false;
    mjs.sidebar.tabGroupOnExpandCollapseOther = false;
    mjs.sidebar.tabGroupPutNewTabAtTheEnd = false;
    mjs.sidebar.tabsWaitingToMove = null;
    mjs.sidebar.windowId = null;
  });

  it("should get browser object", () => {
    assert.isObject(browser, "browser");
  });

  describe("set sidebar", () => {
    const func = mjs.setSidebar;
    const args = [
      BROWSER_SETTINGS_READ,
      TAB_CLOSE_DBLCLICK,
      TAB_GROUP_ENABLE,
      TAB_GROUP_EXPAND_COLLAPSE_OTHER,
      TAB_GROUP_NEW_TAB_AT_END,
      TAB_SKIP_COLLAPSED,
      TAB_SWITCH_SCROLL,
    ];

    it("should set value", async () => {
      const {sidebar} = mjs;
      const getCurrent = browser.windows.getCurrent.withArgs({
        populate: true,
      });
      const getStorage = browser.storage.local.get.withArgs(args);
      const getOs = browser.runtime.getPlatformInfo.resolves({
        os: "mac",
      });
      const i = getCurrent.callCount;
      const j = getStorage.callCount;
      const k = getOs.callCount;
      getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      getStorage.resolves({
        closeTabsByDoubleClick: {
          checked: true,
        },
        readBrowserSettings: {
          checked: true,
        },
        skipCollapsed: {
          checked: true,
        },
        switchTabByScrolling: {
          checked: true,
        },
        enableTabGroup: {
          checked: false,
        },
        tabGroupOnExpandCollapseOther: {
          checked: true,
        },
        tabGroupPutNewTabAtTheEnd: {
          checked: true,
        },
      });
      await func();
      assert.strictEqual(getCurrent.callCount, i + 1, "getCurrent called");
      assert.strictEqual(getStorage.callCount, j + 1, "getStorage called");
      assert.strictEqual(getOs.callCount, k + 1, "getOs called");
      assert.isTrue(sidebar.closeTabsByDoubleClick, "closeTabsByDoubleClick");
      assert.isFalse(sidebar.enableTabGroup, "enableTabGroup");
      assert.isTrue(sidebar.readBrowserSettings, "readBrowserSettings");
      assert.isTrue(sidebar.skipCollapsed, "skipCollapsed");
      assert.isTrue(sidebar.switchTabByScrolling, "switchTab");
      assert.isTrue(sidebar.tabGroupOnExpandCollapseOther,
                    "tabGroupCollapseOther");
      assert.isTrue(sidebar.tabGroupPutNewTabAtTheEnd,
                    "tabGroupPutNewTabAtTheEnd");
      assert.isTrue(sidebar.incognito, "incognito");
      assert.isTrue(sidebar.isMac, "isMac");
      assert.strictEqual(sidebar.windowId, 1, "windowId");
    });

    it("should set value", async () => {
      const {sidebar} = mjs;
      const getCurrent = browser.windows.getCurrent.withArgs({
        populate: true,
      });
      const getStorage = browser.storage.local.get.withArgs(args);
      const getOs = browser.runtime.getPlatformInfo.resolves({
        os: "mac",
      });
      const i = getCurrent.callCount;
      const j = getStorage.callCount;
      const k = getOs.callCount;
      getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      getStorage.resolves({
        tabGroupOnExpandCollapseOther: {
          checked: true,
        },
      });
      await func();
      assert.strictEqual(getCurrent.callCount, i + 1, "getCurrent called");
      assert.strictEqual(getStorage.callCount, j + 1, "getStorage called");
      assert.strictEqual(getOs.callCount, k + 1, "getOs called");
      assert.isFalse(sidebar.closeTabsByDoubleClick, "closeTabsByDoubleClick");
      assert.isTrue(sidebar.enableTabGroup, "enableTabGroup");
      assert.isFalse(sidebar.readBrowserSettings, "readBrowserSettings");
      assert.isTrue(sidebar.tabGroupOnExpandCollapseOther,
                    "tabGroupCollapseOther");
      assert.isFalse(sidebar.tabGroupPutNewTabAtTheEnd,
                     "tabGroupPutNewTabAtTheEnd");
      assert.isTrue(sidebar.incognito, "incognito");
      assert.isTrue(sidebar.isMac, "isMac");
      assert.strictEqual(sidebar.windowId, 1, "windowId");
    });

    it("should set value", async () => {
      const {sidebar} = mjs;
      const getCurrent = browser.windows.getCurrent.withArgs({
        populate: true,
      });
      const getStorage = browser.storage.local.get.withArgs(args);
      const getOs = browser.runtime.getPlatformInfo.resolves({
        os: "mac",
      });
      const i = getCurrent.callCount;
      const j = getStorage.callCount;
      const k = getOs.callCount;
      getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      getStorage.resolves({
        enableTabGroup: {
          checked: true,
        },
        tabGroupPutNewTabAtTheEnd: {
          checked: true,
        },
      });
      await func();
      assert.strictEqual(getCurrent.callCount, i + 1, "getCurrent called");
      assert.strictEqual(getStorage.callCount, j + 1, "getStorage called");
      assert.strictEqual(getOs.callCount, k + 1, "getOs called");
      assert.isFalse(sidebar.closeTabsByDoubleClick, "closeTabsByDoubleClick");
      assert.isTrue(sidebar.enableTabGroup, "enableTabGroup");
      assert.isFalse(sidebar.readBrowserSettings, "readBrowserSettings");
      assert.isFalse(sidebar.tabGroupOnExpandCollapseOther,
                     "tabGroupCollapseOther");
      assert.isTrue(sidebar.tabGroupPutNewTabAtTheEnd,
                    "tabGroupPutNewTabAtTheEnd");
      assert.isTrue(sidebar.incognito, "incognito");
      assert.isTrue(sidebar.isMac, "isMac");
      assert.strictEqual(sidebar.windowId, 1, "windowId");
    });

    it("should set value", async () => {
      const {sidebar} = mjs;
      const getCurrent = browser.windows.getCurrent.withArgs({
        populate: true,
      });
      const getStorage = browser.storage.local.get.withArgs(args);
      const getOs = browser.runtime.getPlatformInfo.resolves({
        os: "mac",
      });
      const i = getCurrent.callCount;
      const j = getStorage.callCount;
      const k = getOs.callCount;
      getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      getStorage.resolves({
        readBrowserSettings: {
          checked: true,
        },
      });
      await func();
      assert.strictEqual(getCurrent.callCount, i + 1, "getCurrent called");
      assert.strictEqual(getStorage.callCount, j + 1, "getStorage called");
      assert.strictEqual(getOs.callCount, k + 1, "getOs called");
      assert.isFalse(sidebar.closeTabsByDoubleClick, "closeTabsByDoubleClick");
      assert.isTrue(sidebar.enableTabGroup, "enableTabGroup");
      assert.isTrue(sidebar.readBrowserSettings, "readBrowserSettings");
      assert.isFalse(sidebar.tabGroupOnExpandCollapseOther,
                     "tabGroupCollapseOther");
      assert.isFalse(sidebar.tabGroupPutNewTabAtTheEnd,
                     "tabGroupPutNewTabAtTheEnd");
      assert.isTrue(sidebar.incognito, "incognito");
      assert.isTrue(sidebar.isMac, "isMac");
      assert.strictEqual(sidebar.windowId, 1, "windowId");
    });

    it("should set value", async () => {
      const {sidebar} = mjs;
      const getCurrent = browser.windows.getCurrent.withArgs({
        populate: true,
      });
      const getStorage = browser.storage.local.get.withArgs(args);
      const getOs = browser.runtime.getPlatformInfo.resolves({
        os: "mac",
      });
      const i = getCurrent.callCount;
      const j = getStorage.callCount;
      const k = getOs.callCount;
      getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      getStorage.resolves({
        closeTabsByDoubleClick: {
          checked: true,
        },
      });
      await func();
      assert.strictEqual(getCurrent.callCount, i + 1, "getCurrent called");
      assert.strictEqual(getStorage.callCount, j + 1, "getStorage called");
      assert.strictEqual(getOs.callCount, k + 1, "getOs called");
      assert.isTrue(sidebar.closeTabsByDoubleClick, "closeTabsByDoubleClick");
      assert.isTrue(sidebar.enableTabGroup, "enableTabGroup");
      assert.isFalse(sidebar.readBrowserSettings, "readBrowserSettings");
      assert.isFalse(sidebar.tabGroupOnExpandCollapseOther,
                     "tabGroupCollapseOther");
      assert.isFalse(sidebar.tabGroupPutNewTabAtTheEnd,
                     "tabGroupPutNewTabAtTheEnd");
      assert.isTrue(sidebar.incognito, "incognito");
      assert.isTrue(sidebar.isMac, "isMac");
      assert.strictEqual(sidebar.windowId, 1, "windowId");
    });

    it("should set value", async () => {
      const {sidebar} = mjs;
      const getCurrent = browser.windows.getCurrent.withArgs({
        populate: true,
      });
      const getStorage = browser.storage.local.get.withArgs(args);
      const getOs = browser.runtime.getPlatformInfo.resolves({
        os: "mac",
      });
      const i = getCurrent.callCount;
      const j = getStorage.callCount;
      const k = getOs.callCount;
      getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      getStorage.resolves({
        skipCollapsed: {
          checked: true,
        },
      });
      await func();
      assert.strictEqual(getCurrent.callCount, i + 1, "getCurrent called");
      assert.strictEqual(getStorage.callCount, j + 1, "getStorage called");
      assert.strictEqual(getOs.callCount, k + 1, "getOs called");
      assert.isFalse(sidebar.closeTabsByDoubleClick, "closeTabsByDoubleClick");
      assert.isTrue(sidebar.skipCollapsed, "skipCollapsed");
      assert.isTrue(sidebar.enableTabGroup, "enableTabGroup");
      assert.isFalse(sidebar.readBrowserSettings, "readBrowserSettings");
      assert.isFalse(sidebar.tabGroupOnExpandCollapseOther,
                     "tabGroupCollapseOther");
      assert.isFalse(sidebar.tabGroupPutNewTabAtTheEnd,
                     "tabGroupPutNewTabAtTheEnd");
      assert.isTrue(sidebar.incognito, "incognito");
      assert.isTrue(sidebar.isMac, "isMac");
      assert.strictEqual(sidebar.windowId, 1, "windowId");
    });

    it("should set value", async () => {
      const {sidebar} = mjs;
      const getCurrent = browser.windows.getCurrent.withArgs({
        populate: true,
      });
      const getStorage = browser.storage.local.get.withArgs(args);
      const getOs = browser.runtime.getPlatformInfo.resolves({
        os: "mac",
      });
      const i = getCurrent.callCount;
      const j = getStorage.callCount;
      const k = getOs.callCount;
      getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      getStorage.resolves({
        switchTabByScrolling: {
          checked: true,
        },
      });
      await func();
      assert.strictEqual(getCurrent.callCount, i + 1, "getCurrent called");
      assert.strictEqual(getStorage.callCount, j + 1, "getStorage called");
      assert.strictEqual(getOs.callCount, k + 1, "getOs called");
      assert.isFalse(sidebar.closeTabsByDoubleClick, "closeTabsByDoubleClick");
      assert.isFalse(sidebar.skipCollapsed, "skipCollapsed");
      assert.isTrue(sidebar.switchTabByScrolling, "switchTab");
      assert.isTrue(sidebar.enableTabGroup, "enableTabGroup");
      assert.isFalse(sidebar.readBrowserSettings, "readBrowserSettings");
      assert.isFalse(sidebar.tabGroupOnExpandCollapseOther,
                     "tabGroupCollapseOther");
      assert.isFalse(sidebar.tabGroupPutNewTabAtTheEnd,
                     "tabGroupPutNewTabAtTheEnd");
      assert.isTrue(sidebar.incognito, "incognito");
      assert.isTrue(sidebar.isMac, "isMac");
      assert.strictEqual(sidebar.windowId, 1, "windowId");
    });

    it("should set value", async () => {
      const {sidebar} = mjs;
      const getCurrent = browser.windows.getCurrent.withArgs({
        populate: true,
      });
      const getStorage = browser.storage.local.get.withArgs(args);
      const getOs = browser.runtime.getPlatformInfo.resolves({
        os: "mac",
      });
      const i = getCurrent.callCount;
      const j = getStorage.callCount;
      const k = getOs.callCount;
      getCurrent.resolves({
        id: 1,
        incognito: true,
      });
      getStorage.resolves(undefined);
      await func();
      assert.strictEqual(getCurrent.callCount, i + 1, "getCurrent called");
      assert.strictEqual(getStorage.callCount, j + 1, "getStorage called");
      assert.strictEqual(getOs.callCount, k + 1, "getOs called");
      assert.isTrue(sidebar.enableTabGroup, "enableTabGroup");
      assert.isFalse(sidebar.readBrowserSettings, "readBrowserSettings");
      assert.isFalse(sidebar.tabGroupOnExpandCollapseOther,
                     "tabGroupCollapseOther");
      assert.isFalse(sidebar.tabGroupPutNewTabAtTheEnd,
                     "tabGroupPutNewTabAtTheEnd");
      assert.isTrue(sidebar.incognito, "incognito");
      assert.isTrue(sidebar.isMac, "isMac");
      assert.strictEqual(sidebar.windowId, 1, "windowId");
    });
  });

  describe("set context", () => {
    const func = mjs.setContext;

    it("should set value", async () => {
      const {sidebar} = mjs;
      const p = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(p);
      await func(p);
      assert.deepEqual(sidebar.context, p, "result");
    });

    it("should set null", async () => {
      const {sidebar} = mjs;
      await func("foo");
      assert.isNull(sidebar.context, "result");
    });
  });

  describe("set contextual identities cookieStoreIds", () => {
    const func = mjs.setContextualIds;

    it("should set value", async () => {
      const {sidebar} = mjs;
      const query = browser.contextualIdentities.query.withArgs({});
      const i = query.callCount;
      query.resolves([
        {
          cookieStoreId: "foo",
        },
        {
          cookieStoreId: "bar",
        },
        {
          cookieStoreId: "baz",
        },
      ]);
      await func();
      assert.strictEqual(query.callCount, i + 1, "query called");
      assert.deepEqual(sidebar.contextualIds, ["foo", "bar", "baz"], "ids");
    });

    it("should set value", async () => {
      const {sidebar} = mjs;
      const query = browser.contextualIdentities.query.withArgs({});
      const stub = sinon.stub(console, "error");
      const i = query.callCount;
      query.rejects("error");
      await func();
      const {calledOnce} = stub;
      stub.restore();
      assert.strictEqual(query.callCount, i + 1, "query called");
      assert.isTrue(calledOnce, "log error called");
      assert.isNull(sidebar.contextualIds, "ids");
    });
  });

  describe("set last closed tab", () => {
    const func = mjs.setLastClosedTab;

    it("should set value", async () => {
      const {sidebar} = mjs;
      const tab = {
        id: 1,
      };
      await func(tab);
      assert.deepEqual(sidebar.lastClosedTab, tab, "result");
    });

    it("should set null", async () => {
      const {sidebar} = mjs;
      await func({});
      assert.isNull(sidebar.lastClosedTab, "result");
    });
  });

  describe("set pinned tabs waiting to move", () => {
    const func = mjs.setPinnedTabsWaitingToMove;

    it("should set value", async () => {
      const {sidebar} = mjs;
      const arr = [1, 2];
      await func(arr);
      assert.deepEqual(sidebar.pinnedTabsWaitingToMove, arr, "result");
    });

    it("should set null", async () => {
      const {sidebar} = mjs;
      await func("foo");
      assert.isNull(sidebar.pinnedTabsWaitingToMove, "result");
    });
  });

  describe("set tabs waiting to move", () => {
    const func = mjs.setTabsWaitingToMove;

    it("should set value", async () => {
      const {sidebar} = mjs;
      const arr = [1, 2];
      await func(arr);
      assert.deepEqual(sidebar.tabsWaitingToMove, arr, "result");
    });

    it("should set null", async () => {
      const {sidebar} = mjs;
      await func("foo");
      assert.isNull(sidebar.tabsWaitingToMove, "result");
    });
  });

  describe("init sidebar", () => {
    const func = mjs.initSidebar;

    it("should init", async () => {
      const {setWindowValue} = browser.sessions;
      const {clear} = browser.storage.local;
      const i = setWindowValue.callCount;
      const j = clear.callCount;
      await func();
      assert.strictEqual(setWindowValue.callCount, i + 1,
                         "setWindowValue called");
      assert.strictEqual(clear.callCount, j + 1, "clear called");
    });
  });

  describe("get last closed tab", () => {
    const func = mjs.getLastClosedTab;

    it("should call function", async () => {
      const {getRecentlyClosed} = browser.sessions;
      const i = getRecentlyClosed.callCount;
      getRecentlyClosed.resolves([{
        tab: {
          windowId: browser.windows.WINDOW_ID_CURRENT,
        },
      }]);
      const res = await func();
      assert.strictEqual(getRecentlyClosed.callCount, i + 1, "called");
      assert.deepEqual(res, {
        windowId: browser.windows.WINDOW_ID_CURRENT,
      }, "result");
    });

    it("should call function", async () => {
      const {getRecentlyClosed} = browser.sessions;
      const i = getRecentlyClosed.callCount;
      getRecentlyClosed.resolves([{}]);
      const res = await func();
      assert.strictEqual(getRecentlyClosed.callCount, i + 1, "called");
      assert.isNull(res, "result");
    });
  });

  describe("undo close tab", () => {
    const func = mjs.undoCloseTab;

    it("should not call function if lastClosedTab is not set", async () => {
      const {restore} = browser.sessions;
      const i = restore.callCount;
      const res = await func();
      assert.strictEqual(restore.callCount, i, "not called");
      assert.isNull(res, "result");
    });

    it("should call function", async () => {
      const {sidebar} = mjs;
      const restore = browser.sessions.restore.withArgs("foo");
      const i = restore.callCount;
      sidebar.lastClosedTab = {
        sessionId: "foo",
      };
      restore.resolves({});
      const res = await func();
      assert.strictEqual(restore.callCount, i + 1, "called");
      assert.deepEqual(res, {}, "result");
    });
  });

  describe("create DnD data", () => {
    const func = mjs.createDnDData;
    beforeEach(() => {
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should not set data", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      parent.appendChild(elm);
      body.appendChild(parent);
      mjs.sidebar.isMac = false;
      const setData = sinon.stub();
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          setData,
          effectAllowed: "uninitialized",
        },
      };
      await func(evt);
      assert.isFalse(setData.called, "data");
      assert.strictEqual(evt.dataTransfer.effectAllowed, "uninitialized",
                         "effect");
    });

    it("should set data", async () => {
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.draggable = true;
      elm.dataset.tabId = "1";
      parent.appendChild(elm);
      body.appendChild(parent);
      mjs.sidebar.isMac = false;
      let parsedData;
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          setData: (type, data) => {
            parsedData = JSON.parse(data);
          },
          effectAllowed: "uninitialized",
        },
        type: "dragstart",
      };
      await func(evt);
      assert.strictEqual(evt.dataTransfer.effectAllowed, "move", "effect");
      assert.deepEqual(parsedData, {
        pinned: false,
        tabIds: [1],
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
      }, "data");
    });
  });

  describe("handle create new tab", () => {
    const func = mjs.handleCreateNewTab;
    beforeEach(() => {
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should not call function", async () => {
      const {create} = browser.tabs;
      const i = create.callCount;
      const main = document.createElement("main");
      const elm = document.createElement("p");
      const span = document.createElement("span");
      const body = document.querySelector("body");
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      const evt = {
        button: 1,
        target: body,
      };
      const res = await func(evt);
      assert.strictEqual(create.callCount, i, "not called create");
      assert.isNull(res, "result");
    });

    it("should not call function", async () => {
      const {create} = browser.tabs;
      const i = create.callCount;
      const main = document.createElement("main");
      const elm = document.createElement("p");
      const span = document.createElement("span");
      const body = document.querySelector("body");
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      const evt = {
        button: 0,
        target: main,
        type: "click",
      };
      const res = await func(evt);
      assert.strictEqual(create.callCount, i, "not called create");
      assert.isNull(res, "result");
    });

    it("should not call function", async () => {
      const {create} = browser.tabs;
      const i = create.callCount;
      const main = document.createElement("main");
      const elm = document.createElement("p");
      const span = document.createElement("span");
      const body = document.querySelector("body");
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      const evt = {
        button: 1,
        target: main,
        type: "dblclick",
      };
      const res = await func(evt);
      assert.strictEqual(create.callCount, i, "not called create");
      assert.isNull(res, "result");
    });

    it("should call function", async () => {
      const {create} = browser.tabs;
      const i = create.callCount;
      const main = document.createElement("main");
      const elm = document.createElement("p");
      const span = document.createElement("span");
      const body = document.querySelector("body");
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      const evt = {
        button: 1,
        target: main,
        type: "mousedown",
      };
      create.resolves({});
      const res = await func(evt);
      assert.strictEqual(create.callCount, i + 1, "called create");
      assert.deepEqual(res, {}, "result");
    });

    it("should call function", async () => {
      const {create} = browser.tabs;
      const i = create.callCount;
      const main = document.createElement("main");
      const elm = document.createElement("p");
      const span = document.createElement("span");
      const body = document.querySelector("body");
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      const evt = {
        button: 0,
        target: main,
        type: "dblclick",
      };
      create.resolves({});
      const res = await func(evt);
      assert.strictEqual(create.callCount, i + 1, "called create");
      assert.deepEqual(res, {}, "result");
    });

    it("should call function", async () => {
      const {create} = browser.tabs;
      const i = create.callCount;
      const main = document.createElement("main");
      const elm = document.createElement("p");
      const span = document.createElement("span");
      const body = document.querySelector("body");
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      const evt = {
        target: elm,
      };
      create.resolves({});
      const res = await func(evt);
      assert.strictEqual(create.callCount, i + 1, "called create");
      assert.deepEqual(res, {}, "result");
    });

    it("should call function", async () => {
      const {create} = browser.tabs;
      const i = create.callCount;
      const main = document.createElement("main");
      const elm = document.createElement("p");
      const span = document.createElement("span");
      const body = document.querySelector("body");
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      const evt = {
        currentTarget: elm,
        target: span,
      };
      create.resolves({});
      const res = await func(evt);
      assert.strictEqual(create.callCount, i + 1, "called create");
      assert.deepEqual(res, {}, "result");
    });
  });

  describe("handle clicked tab", () => {
    const func = mjs.handleClickedTab;
    beforeEach(() => {
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should not call function", async () => {
      const {update} = browser.tabs;
      const i = update.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const evt = {
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        target: body,
        type: "click",
      };
      const res = await func(evt);
      assert.strictEqual(update.callCount, i, "not called update");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function", async () => {
      const {highlight} = browser.tabs;
      const i = highlight.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const evt = {
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        target: body,
        type: "click",
      };
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i, "not called highlight");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function", async () => {
      const {highlight} = browser.tabs;
      const i = highlight.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const evt = {
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        target: body,
        type: "click",
      };
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i, "not called highlight");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function", async () => {
      const {highlight} = browser.tabs;
      const i = highlight.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const evt = {
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        target: elm,
        type: "mousedown",
      };
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i, "not called highlight");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function", async () => {
      const {remove} = browser.tabs;
      const i = remove.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const evt = {
        button: 1,
        target: body,
        type: "mousedown",
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i, "not called remove");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function", async () => {
      const {remove} = browser.tabs;
      const i = remove.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const evt = {
        button: 0,
        target: elm,
        type: "mousedown",
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i, "not called remove");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function", async () => {
      const {remove, update} = browser.tabs;
      const i = remove.callCount;
      const j = update.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const evt = {
        button: 1,
        target: body,
        type: "dblclick",
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i, "not called remove");
      assert.strictEqual(remove.callCount, j, "not called update");
      assert.deepEqual(res, [], "result");
    });

    it("should call function", async () => {
      const {update} = browser.tabs;
      const i = update.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const evt = {
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        target: elm,
        type: "click",
      };
      update.resolves({});
      const res = await func(evt);
      assert.strictEqual(update.callCount, i + 1, "called update");
      assert.deepEqual(res, [{}], "result");
    });

    it("should call function", async () => {
      const {highlight, query, update} = browser.tabs;
      const i = highlight.callCount;
      const j = query.callCount;
      const k = update.callCount;
      const activeElm = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      activeElm.classList.add(TAB);
      activeElm.classList.add(HIGHLIGHTED);
      activeElm.dataset.tabId = "1";
      elm.classList.add(TAB);
      elm.dataset.tabId = "2";
      body.appendChild(activeElm);
      body.appendChild(elm);
      mjs.sidebar.firstSelectedTab = activeElm;
      const evt = {
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        target: elm,
        type: "click",
      };
      highlight.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        tabs: [0, 1],
      }).resolves([{}, {}]);
      query.resolves([{
        index: 0,
      }]);
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i + 1, "called highlight");
      assert.strictEqual(query.callCount, j + 1, "called query");
      assert.strictEqual(update.callCount, k, "not called update");
      assert.deepEqual(res, [[{}, {}]], "result");
    });

    it("should call function", async () => {
      const {highlight, query, update} = browser.tabs;
      const i = highlight.callCount;
      const j = query.callCount;
      const k = update.callCount;
      const activeElm = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      activeElm.classList.add(TAB);
      activeElm.classList.add(HIGHLIGHTED);
      activeElm.dataset.tabId = "1";
      elm.classList.add(TAB);
      elm.dataset.tabId = "2";
      body.appendChild(activeElm);
      body.appendChild(elm);
      mjs.sidebar.firstSelectedTab = activeElm;
      const evt = {
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        target: elm,
        type: "click",
      };
      highlight.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        tabs: [0, 1],
      }).resolves([{}, {}]);
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i + 1, "called highlight");
      assert.strictEqual(query.callCount, j, "not called query");
      assert.strictEqual(update.callCount, k, "not called update");
      assert.deepEqual(res, [[{}, {}]], "result");
    });

    it("should call function", async () => {
      const {highlight, query, update} = browser.tabs;
      const i = highlight.callCount;
      const j = query.callCount;
      const k = update.callCount;
      const activeElm = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      activeElm.classList.add(TAB);
      activeElm.classList.add(HIGHLIGHTED);
      activeElm.dataset.tabId = "1";
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "2";
      body.appendChild(activeElm);
      body.appendChild(elm);
      mjs.sidebar.firstSelectedTab = activeElm;
      const evt = {
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        target: elm,
        type: "click",
      };
      highlight.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        tabs: [0],
      }).resolves([{}]);
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i + 1, "called highlight");
      assert.strictEqual(query.callCount, j, "not called query");
      assert.strictEqual(update.callCount, k, "not called update");
      assert.deepEqual(res, [[{}]], "result");
    });

    it("should call function", async () => {
      const {highlight, query, update} = browser.tabs;
      const i = highlight.callCount;
      const j = query.callCount;
      const k = update.callCount;
      const activeElm = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      activeElm.classList.add(TAB);
      activeElm.classList.add(HIGHLIGHTED);
      activeElm.dataset.tabId = "1";
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "2";
      body.appendChild(activeElm);
      body.appendChild(elm);
      mjs.sidebar.firstSelectedTab = activeElm;
      const evt = {
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        target: activeElm,
        type: "click",
      };
      highlight.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        tabs: [1],
      }).resolves([{}]);
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i + 1, "called highlight");
      assert.strictEqual(query.callCount, j, "not called query");
      assert.strictEqual(update.callCount, k, "not called update");
      assert.deepEqual(res, [[{}]], "result");
    });

    it("should call function", async () => {
      const {get, highlight, query, update} = browser.tabs;
      const i = highlight.callCount;
      const j = query.callCount;
      const k = update.callCount;
      const l = get.callCount;
      const activeElm = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      activeElm.classList.add(TAB);
      activeElm.classList.add(HIGHLIGHTED);
      activeElm.dataset.tabId = "1";
      elm.classList.add(TAB);
      elm.dataset.tabId = "2";
      body.appendChild(activeElm);
      body.appendChild(elm);
      mjs.sidebar.firstSelectedTab = activeElm;
      get.resolves({
        audible: false,
        mutedInfo: {
          muted: false,
        },
      });
      const evt = {
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        target: activeElm,
        type: "click",
      };
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i, "not called highlight");
      assert.strictEqual(query.callCount, j, "not called query");
      assert.strictEqual(update.callCount, k, "not called update");
      assert.strictEqual(get.callCount, l + 1, "called get");
      assert.deepEqual(res, [[undefined, undefined]], "result");
    });

    it("should call function", async () => {
      const {highlight, query, update} = browser.tabs;
      const i = highlight.callCount;
      const j = query.callCount;
      const k = update.callCount;
      const activeElm = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      activeElm.classList.add(TAB);
      activeElm.classList.add(HIGHLIGHTED);
      activeElm.dataset.tabId = "1";
      elm.classList.add(TAB);
      elm.dataset.tabId = "2";
      body.appendChild(activeElm);
      body.appendChild(elm);
      mjs.sidebar.firstSelectedTab = activeElm;
      mjs.sidebar.isMac = true;
      const evt = {
        ctrlKey: false,
        metaKey: true,
        shiftKey: false,
        target: elm,
        type: "click",
      };
      highlight.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        tabs: [0, 1],
      }).resolves([{}, {}]);
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i + 1, "called highlight");
      assert.strictEqual(query.callCount, j, "not called query");
      assert.strictEqual(update.callCount, k, "not called update");
      assert.deepEqual(res, [[{}, {}]], "result");
    });

    it("should call function", async () => {
      const {remove} = browser.tabs;
      const i = remove.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const evt = {
        button: 1,
        target: elm,
        type: "mousedown",
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i + 1, "called remove");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const {remove} = browser.tabs;
      const i = remove.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const evt = {
        button: 0,
        target: elm,
        type: "dblclick",
      };
      mjs.sidebar.closeTabsByDoubleClick = true;
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i + 1, "called remove");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should not call function", async () => {
      const {remove} = browser.tabs;
      const i = remove.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      const evt = {
        button: 0,
        target: elm,
        type: "dblclick",
      };
      mjs.sidebar.closeTabsByDoubleClick = false;
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i, "not called remove");
      assert.deepEqual(res, [], "result");
    });
  });

  describe("add sidebar tab click listener", () => {
    const func = mjs.addTabClickListener;

    it("should not add listener", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      const spy = sinon.spy(elm, "addEventListener");
      await func(elm);
      assert.isFalse(spy.called, "called");
      elm.addEventListener.restore();
    });

    it("should add listener", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(CLASS_TAB_CONTENT);
      body.appendChild(elm);
      const spy = sinon.spy(elm, "addEventListener");
      await func(elm);
      assert.isTrue(spy.called, "called");
      elm.addEventListener.restore();
    });
  });

  describe("toggle tab dblclick listener", () => {
    const func = mjs.toggleTabDblClickListener;

    it("should not add or remove listener", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      const spy = sinon.spy(elm, "addEventListener");
      const spy2 = sinon.spy(elm, "removeEventListener");
      await func(elm, true);
      assert.isFalse(spy.called, "called");
      assert.isFalse(spy2.called, "called");
      elm.addEventListener.restore();
      elm.removeEventListener.restore();
    });

    it("should add listener", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(CLASS_TAB_CONTENT);
      body.appendChild(elm);
      const spy = sinon.spy(elm, "addEventListener");
      const spy2 = sinon.spy(elm, "removeEventListener");
      await func(elm, true);
      assert.isTrue(spy.called, "called");
      assert.isFalse(spy2.called, "called");
      elm.addEventListener.restore();
      elm.removeEventListener.restore();
    });

    it("should remove listener", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(CLASS_TAB_CONTENT);
      body.appendChild(elm);
      const spy = sinon.spy(elm, "addEventListener");
      const spy2 = sinon.spy(elm, "removeEventListener");
      await func(elm, false);
      assert.isFalse(spy.called, "called");
      assert.isTrue(spy2.called, "called");
      elm.addEventListener.restore();
      elm.removeEventListener.restore();
    });
  });

  describe("replace tab dblclick listeners", () => {
    const func = mjs.replaceTabDblClickListeners;

    it("should get empty array", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      body.appendChild(elm);
      const res = await func();
      assert.deepEqual(res, [], "result");
    });

    it("should get empty array", async () => {
      const span = document.createElement("span");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.appendChild(span);
      body.appendChild(elm);
      const res = await func();
      assert.deepEqual(res, [], "result");
    });

    it("should call function", async () => {
      const span = document.createElement("span");
      const span2 = document.createElement("span");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      span.classList.add(CLASS_TAB_CONTENT);
      elm.classList.add(TAB);
      elm.appendChild(span);
      span2.classList.add(CLASS_TAB_CONTENT);
      elm2.classList.add(TAB);
      elm2.appendChild(span2);
      body.appendChild(elm);
      body.appendChild(elm2);
      const spy = sinon.spy(span, "addEventListener");
      const spy2 = sinon.spy(span2, "addEventListener");
      const res = await func(true);
      assert.isTrue(spy.called, "called");
      assert.isTrue(spy2.called, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
      span.addEventListener.restore();
      span2.addEventListener.restore();
    });

    it("should call function", async () => {
      const span = document.createElement("span");
      const span2 = document.createElement("span");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      span.classList.add(CLASS_TAB_CONTENT);
      elm.classList.add(TAB);
      elm.appendChild(span);
      span2.classList.add(CLASS_TAB_CONTENT);
      elm2.classList.add(TAB);
      elm2.appendChild(span2);
      body.appendChild(elm);
      body.appendChild(elm2);
      const spy = sinon.spy(span, "removeEventListener");
      const spy2 = sinon.spy(span2, "removeEventListener");
      const res = await func(false);
      assert.isTrue(spy.called, "called");
      assert.isTrue(spy2.called, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
      span.removeEventListener.restore();
      span2.removeEventListener.restore();
    });

    it("should call function", async () => {
      const span = document.createElement("span");
      const span2 = document.createElement("span");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      span.classList.add(CLASS_TAB_CONTENT);
      elm.classList.add(TAB);
      elm.appendChild(span);
      span2.classList.add(CLASS_TAB_CONTENT);
      elm2.classList.add(TAB);
      elm2.appendChild(span2);
      body.appendChild(elm);
      body.appendChild(elm2);
      const spy = sinon.spy(span, "removeEventListener");
      const spy2 = sinon.spy(span2, "removeEventListener");
      const res = await func(null);
      assert.isTrue(spy.called, "called");
      assert.isTrue(spy2.called, "called");
      assert.deepEqual(res, [undefined, undefined], "result");
      span.removeEventListener.restore();
      span2.removeEventListener.restore();
    });
  });

  describe("trigger tab warmup", () => {
    const func = mjs.triggerTabWarmup;

    it("should throw", () => {
      assert.throws(() => func());
    });

    it("should not call function", async () => {
      if (typeof browser.tabs.warmup === "function") {
        const i = browser.tabs.warmup.callCount;
        const elm = document.createElement("p");
        const body = document.querySelector("body");
        body.appendChild(elm);
        const evt = {
          target: elm,
        };
        const res = await func(evt);
        assert.strictEqual(browser.tabs.warmup.callCount, i, "not called");
        assert.isNull(res, "result");
      }
    });

    it("should call function", async () => {
      if (typeof browser.tabs.warmup === "function") {
        const i = browser.tabs.warmup.callCount;
        const elm = document.createElement("p");
        const body = document.querySelector("body");
        elm.classList.add(TAB);
        elm.dataset.tabId = "1";
        body.appendChild(elm);
        const evt = {
          target: elm,
        };
        const res = await func(evt);
        assert.strictEqual(browser.tabs.warmup.callCount, i + 1, "called");
        assert.isUndefined(res, "result");
      }
    });

    it("should not call function", async () => {
      if (typeof browser.tabs.warmup === "function") {
        const i = browser.tabs.warmup.callCount;
        const elm = document.createElement("p");
        const body = document.querySelector("body");
        elm.classList.add(TAB);
        elm.classList.add(ACTIVE);
        elm.dataset.tabId = "1";
        body.appendChild(elm);
        const evt = {
          target: elm,
        };
        const res = await func(evt);
        assert.strictEqual(browser.tabs.warmup.callCount, i, "not called");
        assert.isNull(res, "result");
      }
    });
  });

  describe("add tab event listeners", () => {
    const func = mjs.addTabEventListeners;

    it("should not add dragstart listner", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      const spy = sinon.spy(elm, "addEventListener");
      const i = spy.callCount;
      await func();
      assert.strictEqual(spy.callCount, i, "not called");
      elm.addEventListener.restore();
    });

    it("should not add listner", async () => {
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      body.appendChild(elm2);
      const spy = sinon.spy(elm, "addEventListener");
      const i = spy.callCount;
      await func(elm2);
      assert.strictEqual(spy.callCount, i, "not called");
      elm.addEventListener.restore();
    });

    it("should not add dragstart listner", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      const spy = sinon.spy(elm, "addEventListener");
      const i = spy.callCount;
      await func(elm);
      assert.strictEqual(spy.callCount, i + 6, "not called");
      elm.addEventListener.restore();
    });

    it("should not add dragstart listner", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.draggable = false;
      body.appendChild(elm);
      const spy = sinon.spy(elm, "addEventListener");
      await func(elm);
      const i = spy.callCount;
      await func(elm);
      assert.strictEqual(spy.callCount, i + 6, "not called");
      elm.addEventListener.restore();
    });

    it("should add all listners", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.draggable = true;
      body.appendChild(elm);
      const spy = sinon.spy(elm, "addEventListener");
      const i = spy.callCount;
      await func(elm);
      assert.strictEqual(spy.callCount, i + 7, "called");
      elm.addEventListener.restore();
    });
  });

  describe("handle activated tab", () => {
    const func = mjs.handleActivatedTab;
    beforeEach(() => {
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should throw", async () => {
      await func({
        tabId: "foo",
        windowId: 1,
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should throw", async () => {
      await func({
        tabId: 1,
        windowId: "foo",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should not set class", async () => {
      const parent = document.createElement("div");
      const parent2 = document.createElement("div");
      const heading = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      const info = {
        tabId: browser.tabs.TAB_ID_NONE,
        windowId: browser.windows.WINDOW_ID_CURRENT + 1,
      };
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(ACTIVE);
      elm2.dataset.tabId = "2";
      heading.classList.add(CLASS_HEADING);
      heading.hidden = true;
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent2.classList.add(ACTIVE);
      parent2.appendChild(heading2);
      parent2.appendChild(elm2);
      body.appendChild(parent);
      body.appendChild(parent2);
      await func(info);
      assert.isFalse(parent.classList.contains(ACTIVE), "add class");
      assert.isFalse(heading.classList.contains(ACTIVE), "add class");
      assert.isFalse(elm.classList.contains(ACTIVE), "add class");
      assert.isTrue(parent2.classList.contains(ACTIVE), "remove class");
      assert.isFalse(heading2.classList.contains(ACTIVE), "remove class");
      assert.isTrue(elm2.classList.contains(ACTIVE), "remove class");
    });

    it("should not set class", async () => {
      const parent = document.createElement("div");
      const parent2 = document.createElement("div");
      const heading = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      const info = {
        tabId: browser.tabs.TAB_ID_NONE,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(ACTIVE);
      elm2.dataset.tabId = "2";
      heading.classList.add(CLASS_HEADING);
      heading.hidden = true;
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent2.classList.add(ACTIVE);
      parent2.appendChild(heading2);
      parent2.appendChild(elm2);
      body.appendChild(parent);
      body.appendChild(parent2);
      await func(info);
      assert.isFalse(parent.classList.contains(ACTIVE), "add class");
      assert.isFalse(heading.classList.contains(ACTIVE), "add class");
      assert.isFalse(elm.classList.contains(ACTIVE), "add class");
      assert.isTrue(parent2.classList.contains(ACTIVE), "remove class");
      assert.isFalse(heading2.classList.contains(ACTIVE), "remove class");
      assert.isTrue(elm2.classList.contains(ACTIVE), "remove class");
    });

    it("should not set class", async () => {
      const parent = document.createElement("div");
      const parent2 = document.createElement("div");
      const heading = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      const info = {
        tabId: 3,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(ACTIVE);
      elm2.dataset.tabId = "2";
      heading.classList.add(CLASS_HEADING);
      heading.hidden = true;
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent2.classList.add(ACTIVE);
      parent2.appendChild(heading2);
      parent2.appendChild(elm2);
      body.appendChild(parent);
      body.appendChild(parent2);
      await func(info);
      assert.isFalse(parent.classList.contains(ACTIVE), "add class");
      assert.isFalse(heading.classList.contains(ACTIVE), "add class");
      assert.isFalse(elm.classList.contains(ACTIVE), "add class");
      assert.isTrue(parent2.classList.contains(ACTIVE), "remove class");
      assert.isFalse(heading2.classList.contains(ACTIVE), "remove class");
      assert.isTrue(elm2.classList.contains(ACTIVE), "remove class");
    });

    it("should set class", async () => {
      const parent = document.createElement("div");
      const parent2 = document.createElement("div");
      const heading = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      const info = {
        tabId: 1,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(ACTIVE);
      elm2.dataset.tabId = "2";
      heading.classList.add(CLASS_HEADING);
      heading.hidden = true;
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent2.classList.add(ACTIVE);
      parent2.appendChild(heading2);
      parent2.appendChild(elm2);
      body.appendChild(parent);
      body.appendChild(parent2);
      await func(info);
      assert.isTrue(parent.classList.contains(ACTIVE), "add class");
      assert.isFalse(heading.classList.contains(ACTIVE), "add class");
      assert.isTrue(elm.classList.contains(ACTIVE), "add class");
      assert.isFalse(parent2.classList.contains(ACTIVE), "remove class");
      assert.isFalse(heading2.classList.contains(ACTIVE), "remove class");
      assert.isFalse(elm2.classList.contains(ACTIVE), "remove class");
    });

    it("should set class", async () => {
      const parent = document.createElement("div");
      const parent2 = document.createElement("div");
      const heading = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      const info = {
        tabId: 1,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(ACTIVE);
      elm2.dataset.tabId = "2";
      heading.classList.add(CLASS_HEADING);
      heading.hidden = false;
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = false;
      parent.classList.add(CLASS_TAB_COLLAPSED);
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent2.classList.add(ACTIVE);
      parent2.appendChild(heading2);
      parent2.appendChild(elm2);
      body.appendChild(parent);
      body.appendChild(parent2);
      await func(info);
      assert.isTrue(parent.classList.contains(ACTIVE), "add class");
      assert.isTrue(heading.classList.contains(ACTIVE), "add class");
      assert.isTrue(elm.classList.contains(ACTIVE), "add class");
      assert.isFalse(parent2.classList.contains(ACTIVE), "remove class");
      assert.isFalse(heading2.classList.contains(ACTIVE), "remove class");
      assert.isFalse(elm2.classList.contains(ACTIVE), "remove class");
    });
  });

  describe("handle created tab", () => {
    const func = mjs.handleCreatedTab;
    beforeEach(() => {
      const body = document.querySelector("body");
      const tmpl = document.createElement("template");
      tmpl.id = "tab-container-template";
      const sect = document.createElement("section");
      sect.classList.add("tab-container");
      sect.dataset.tabControls = "";
      sect.setAttribute("hidden", "hidden");
      const h1 = document.createElement("h1");
      h1.classList.add(CLASS_HEADING);
      h1.setAttribute("hidden", "hidden");
      sect.appendChild(h1);
      tmpl.content.appendChild(sect);
      body.appendChild(tmpl);
      const tmpl2 = document.createElement("template");
      tmpl2.id = "tab-template";
      const div = document.createElement("div");
      div.classList.add("tab");
      div.draggable = true;
      div.dataset.tabId = "";
      div.dataset.tab = "";
      const span = document.createElement("span");
      span.classList.add("tab-context");
      span.setAttribute("title", "");
      const img = document.createElement("img");
      img.classList.add("tab-toggle-icon");
      img.src = "";
      img.alt = "";
      span.appendChild(img);
      div.appendChild(span);
      const span2 = document.createElement("span");
      span2.classList.add("tab-content");
      span2.setAttribute("title", "");
      const img2 = document.createElement("img");
      img2.classList.add("tab-icon");
      img2.src = "";
      img2.alt = "";
      img2.dataset.connecting = "";
      span2.appendChild(img2);
      const span2_1 = document.createElement("span");
      span2_1.classList.add("tab-title");
      span2.appendChild(span2_1);
      div.appendChild(span2);
      const span3 = document.createElement("span");
      span3.classList.add("tab-audio");
      span3.setAttribute("title", "");
      const img3 = document.createElement("img");
      img3.classList.add("tab-audio-icon");
      img3.src = "";
      img3.alt = "";
      span3.appendChild(img3);
      div.appendChild(span3);
      const span4 = document.createElement("span");
      span4.classList.add("tab-ident");
      span4.setAttribute("title", "");
      const img4 = document.createElement("img");
      img4.classList.add("tab-ident-icon");
      img4.src = "";
      img4.alt = "";
      span4.appendChild(img4);
      div.appendChild(span4);
      const span5 = document.createElement("span");
      span5.classList.add("tab-close");
      span5.setAttribute("title", "");
      const img5 = document.createElement("img");
      img5.classList.add("tab-close-icon");
      img5.src = "";
      img5.alt = "";
      span5.appendChild(img5);
      div.appendChild(span5);
      const span6 = document.createElement("span");
      span6.classList.add("tab-pinned");
      const img6 = document.createElement("img");
      img6.classList.add("tab-pinned-icon");
      img6.src = "";
      img6.alt = "";
      span6.appendChild(img6);
      div.appendChild(span6);
      tmpl2.content.appendChild(div);
      body.appendChild(tmpl2);
      const pinned = document.createElement("section");
      pinned.id = PINNED;
      body.appendChild(pinned);
      const newTab = document.createElement("section");
      newTab.id = NEW_TAB;
      body.appendChild(newTab);
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
      mjs.sidebar.incognito = false;
    });
    afterEach(() => {
      mjs.sidebar.windowId = null;
      mjs.sidebar.incognito = false;
    });

    it("should throw", async () => {
      await func({
        id: "foo",
        windowId: 1,
        mutedInfo: {
          muted: false,
        },
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should throw", async () => {
      await func({
        id: 1,
        windowId: "foo",
        mutedInfo: {
          muted: false,
        },
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should not create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        pinned: false,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: 1,
        mutedInfo: {
          muted: false,
        },
      };
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.strictEqual(browser.i18n.getMessage.callCount, i, "not called");
      assert.isNotOk(elm, "not created");
      assert.deepEqual(res, [], "result");
    });

    it("should create element, but hide", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        hidden: true,
        id: 1,
        index: 0,
        pinned: false,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      const tabItems = [
        CLASS_TAB_CONTEXT, CLASS_TAB_TOGGLE_ICON, CLASS_TAB_CONTENT,
        CLASS_TAB_TITLE, CLASS_TAB_AUDIO, CLASS_TAB_CLOSE, CLASS_TAB_CLOSE_ICON,
      ];
      assert.isOk(elm, "created");
      assert.isTrue(elm.hasAttribute("hidden"), "hidden");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      for (const tabItem of tabItems) {
        const item = elm.querySelector(`.${tabItem}`);
        switch (tabItem) {
          case CLASS_TAB_CONTEXT:
            assert.strictEqual(item.title, `${TAB_GROUP_COLLAPSE}_tooltip`,
                               `item ${tabItem}`);
            break;
          case CLASS_TAB_TOGGLE_ICON:
            assert.strictEqual(item.alt, TAB_GROUP_COLLAPSE, `item ${tabItem}`);
            break;
          case CLASS_TAB_CONTENT:
            assert.strictEqual(item.title, "foo", `item ${tabItem}`);
            break;
          case CLASS_TAB_TITLE:
            assert.strictEqual(item.textContent, "foo", `item ${tabItem}`);
            break;
          case CLASS_TAB_AUDIO:
            assert.isFalse(item.classList.contains(AUDIBLE), `item ${tabItem}`);
            break;
          case CLASS_TAB_CLOSE:
            assert.strictEqual(item.title, `${TAB_CLOSE}_tooltip`,
                               `item ${tabItem}`);
            break;
          case CLASS_TAB_CLOSE_ICON:
            assert.strictEqual(item.alt, TAB_CLOSE, `item ${tabItem}`);
            break;
        }
      }
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        hidden: false,
        id: 1,
        index: 0,
        pinned: false,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      const tabItems = [
        CLASS_TAB_CONTEXT, CLASS_TAB_TOGGLE_ICON, CLASS_TAB_CONTENT,
        CLASS_TAB_TITLE, CLASS_TAB_AUDIO, CLASS_TAB_CLOSE, CLASS_TAB_CLOSE_ICON,
      ];
      assert.isOk(elm, "created");
      assert.isFalse(elm.hasAttribute("hidden"), "hidden");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      for (const tabItem of tabItems) {
        const item = elm.querySelector(`.${tabItem}`);
        switch (tabItem) {
          case CLASS_TAB_CONTEXT:
            assert.strictEqual(item.title, `${TAB_GROUP_COLLAPSE}_tooltip`,
                               `item ${tabItem}`);
            break;
          case CLASS_TAB_TOGGLE_ICON:
            assert.strictEqual(item.alt, TAB_GROUP_COLLAPSE, `item ${tabItem}`);
            break;
          case CLASS_TAB_CONTENT:
            assert.strictEqual(item.title, "foo", `item ${tabItem}`);
            break;
          case CLASS_TAB_TITLE:
            assert.strictEqual(item.textContent, "foo", `item ${tabItem}`);
            break;
          case CLASS_TAB_AUDIO:
            assert.isFalse(item.classList.contains(AUDIBLE), `item ${tabItem}`);
            break;
          case CLASS_TAB_CLOSE:
            assert.strictEqual(item.title, `${TAB_CLOSE}_tooltip`,
                               `item ${tabItem}`);
            break;
          case CLASS_TAB_CLOSE_ICON:
            assert.strictEqual(item.alt, TAB_CLOSE, `item ${tabItem}`);
            break;
        }
      }
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: true,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        pinned: false,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.isTrue(elm.classList.contains(ACTIVE), "class");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: true,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        pinned: false,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 6, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        pinned: false,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const parent = document.createElement("section");
      const child = document.createElement("div");
      const body = document.querySelector("body");
      const newTab = document.getElementById(NEW_TAB);
      child.classList.add(TAB);
      child.dataset.tabId = "2";
      parent.appendChild(child);
      body.insertBefore(parent, newTab);
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        openerTabId: 2,
        pinned: false,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const parent = document.createElement("section");
      const child = document.createElement("div");
      const body = document.querySelector("body");
      const newTab = document.getElementById(NEW_TAB);
      child.classList.add(TAB);
      child.dataset.tabId = "2";
      parent.appendChild(child);
      body.insertBefore(parent, newTab);
      const res = await func(tabsTab, true);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.isFalse(elm.parentNode === parent, "not parent");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: false,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const parent = document.createElement("section");
      const child = document.createElement("div");
      const span = document.createElement("span");
      const img = document.createElement("img");
      const child2 = document.createElement("div");
      const body = document.querySelector("body");
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = "2";
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = "3";
      parent.appendChild(child);
      parent.appendChild(child2);
      body.insertBefore(parent, newTab);
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 6, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.isTrue(elm.parentNode === parent, "parent");
      assert.isFalse(parent.classList.contains(CLASS_TAB_COLLAPSED),
                     "not collapsed");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, [undefined, undefined],
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: false,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const parent = document.createElement("section");
      const child = document.createElement("div");
      const span = document.createElement("span");
      const img = document.createElement("img");
      const child2 = document.createElement("div");
      const body = document.querySelector("body");
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = "2";
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = "3";
      parent.appendChild(child);
      parent.appendChild(child2);
      body.insertBefore(parent, newTab);
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.isTrue(elm.parentNode === parent, "parent");
      assert.isFalse(parent.classList.contains(CLASS_TAB_COLLAPSED),
                     "not collapsed");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        openerTabId: 2,
        pinned: false,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const parent = document.createElement("section");
      const child = document.createElement("div");
      const span = document.createElement("span");
      const img = document.createElement("img");
      const child2 = document.createElement("div");
      const body = document.querySelector("body");
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = "2";
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = "3";
      parent.appendChild(child);
      parent.appendChild(child2);
      body.insertBefore(parent, newTab);
      browser.tabs.get.withArgs(2).resolves({
        index: 0,
      });
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 6, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.isTrue(elm.parentNode === parent, "parent");
      assert.isFalse(parent.classList.contains(CLASS_TAB_COLLAPSED),
                     "not collapsed");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, [undefined, undefined], undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 3,
        openerTabId: 3,
        pinned: false,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const parent = document.createElement("section");
      const child = document.createElement("div");
      const span = document.createElement("span");
      const img = document.createElement("img");
      const child2 = document.createElement("div");
      const body = document.querySelector("body");
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = "2";
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = "3";
      parent.appendChild(child);
      parent.appendChild(child2);
      body.insertBefore(parent, newTab);
      browser.tabs.get.withArgs(3).resolves({
        index: 1,
      });
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 6, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.isTrue(elm.parentNode === parent, "parent");
      assert.isFalse(parent.classList.contains(CLASS_TAB_COLLAPSED),
                     "collapse");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, [undefined, undefined], undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const j = browser.tabs.move.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        openerTabId: 2,
        pinned: false,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const parent = document.createElement("section");
      const child = document.createElement("div");
      const span = document.createElement("span");
      const img = document.createElement("img");
      const child2 = document.createElement("div");
      const body = document.querySelector("body");
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = "2";
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = "3";
      parent.appendChild(child);
      parent.appendChild(child2);
      body.insertBefore(parent, newTab);
      mjs.sidebar.tabGroupPutNewTabAtTheEnd = true;
      browser.tabs.get.withArgs(2).resolves({
        index: 0,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
      });
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.isTrue(elm.parentNode === parent, "parent");
      assert.strictEqual(browser.tabs.move.callCount, j + 1, "called move");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const j = browser.tabs.move.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 2,
        openerTabId: 2,
        pinned: false,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const parent = document.createElement("section");
      const child = document.createElement("div");
      const span = document.createElement("span");
      const img = document.createElement("img");
      const child2 = document.createElement("div");
      const body = document.querySelector("body");
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = "2";
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = "3";
      parent.appendChild(child);
      parent.appendChild(child2);
      body.insertBefore(parent, newTab);
      mjs.sidebar.tabGroupPutNewTabAtTheEnd = true;
      browser.tabs.get.withArgs(2).resolves({
        index: 0,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 1,
      });
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.isTrue(elm.parentNode === parent, "parent");
      assert.strictEqual(browser.tabs.move.callCount, j, "not called move");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: true,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const pinned = document.getElementById(PINNED);
      const child = document.createElement("div");
      const child2 = document.createElement("div");
      pinned.classList.add(CLASS_TAB_CONTAINER);
      pinned.classList.add(CLASS_TAB_GROUP);
      child.classList.add(TAB);
      child.dataset.tabId = "2";
      child2.classList.add(TAB);
      child2.dataset.tabId = "3";
      pinned.appendChild(child);
      pinned.appendChild(child2);
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.isTrue(elm.classList.contains(PINNED), "pinned");
      assert.isTrue(elm.draggable, "draggable");
      assert.isTrue(elm.parentNode === pinned, "parent");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: true,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const pinned = document.getElementById(PINNED);
      const child = document.createElement("div");
      pinned.classList.add(CLASS_TAB_CONTAINER);
      child.classList.add(TAB);
      child.dataset.tabId = "2";
      pinned.appendChild(child);
      mjs.sidebar.enableTabGroup = false;
      mjs.sidebar.tabGroupPutNewTabAtTheEnd = true;
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.isTrue(elm.classList.contains(PINNED), "pinned");
      assert.isTrue(elm.draggable, "draggable");
      assert.isTrue(elm.parentNode === pinned, "parent");
      assert.isTrue(pinned.classList.contains(CLASS_TAB_GROUP), "group");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: true,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const pinned = document.getElementById(PINNED);
      const child = document.createElement("div");
      pinned.classList.add(CLASS_TAB_CONTAINER);
      child.classList.add(TAB);
      child.dataset.tabId = "2";
      pinned.appendChild(child);
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.isTrue(elm.classList.contains(PINNED), "pinned");
      assert.isTrue(elm.draggable, "draggable");
      assert.isTrue(elm.parentNode === pinned, "parent");
      assert.isTrue(pinned.classList.contains(CLASS_TAB_GROUP), "group");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: true,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      const pinned = document.getElementById(PINNED);
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.isTrue(elm.classList.contains(PINNED), "pinned");
      assert.isTrue(elm.draggable, "draggable");
      assert.isTrue(elm.parentNode === pinned, "parent");
      assert.isFalse(pinned.classList.contains(CLASS_TAB_GROUP), "group");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: "foo",
        id: 1,
        index: 0,
        pinned: false,
        status: "complete",
        title: "bar",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      browser.contextualIdentities.get.withArgs("foo").resolves({
        color: "red",
        icon: "fingerprint",
        name: "baz",
      });
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined,
      ], "result");
    });

    it("should create element", async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: "foo",
        id: 1,
        index: 0,
        pinned: false,
        status: "complete",
        title: "bar",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        mutedInfo: {
          muted: false,
        },
      };
      mjs.sidebar.incognito = true;
      browser.contextualIdentities.get.withArgs("foo").resolves({
        color: "red",
        icon: "fingerprint",
        name: "baz",
      });
      const res = await func(tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isOk(elm, "created");
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, "called");
      assert.strictEqual(elm.dataset.tabId, "1", "id");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tab");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined,
      ], "result");
    });
  });

  describe("handle attached tab", () => {
    const func = mjs.handleAttachedTab;
    beforeEach(() => {
      const body = document.querySelector("body");
      const tmpl = document.createElement("template");
      tmpl.id = "tab-container-template";
      const sect = document.createElement("section");
      sect.classList.add("tab-container");
      sect.dataset.tabControls = "";
      sect.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(sect);
      body.appendChild(tmpl);
      const tmpl2 = document.createElement("template");
      tmpl2.id = "tab-template";
      const div = document.createElement("div");
      div.classList.add("tab");
      div.draggable = true;
      div.dataset.tabId = "";
      div.dataset.tab = "";
      const span = document.createElement("span");
      span.classList.add("tab-context");
      span.setAttribute("title", "");
      const img = document.createElement("img");
      img.classList.add("tab-toggle-icon");
      img.src = "";
      img.alt = "";
      span.appendChild(img);
      div.appendChild(span);
      const span2 = document.createElement("span");
      span2.classList.add("tab-content");
      span2.setAttribute("title", "");
      const img2 = document.createElement("img");
      img2.classList.add("tab-icon");
      img2.src = "";
      img2.alt = "";
      img2.dataset.connecting = "";
      span2.appendChild(img2);
      const span2_1 = document.createElement("span");
      span2_1.classList.add("tab-title");
      span2.appendChild(span2_1);
      div.appendChild(span2);
      const span3 = document.createElement("span");
      span3.classList.add("tab-audio");
      span3.setAttribute("title", "");
      const img3 = document.createElement("img");
      img3.classList.add("tab-audio-icon");
      img3.src = "";
      img3.alt = "";
      span3.appendChild(img3);
      div.appendChild(span3);
      const span4 = document.createElement("span");
      span4.classList.add("tab-ident");
      span4.setAttribute("title", "");
      const img4 = document.createElement("img");
      img4.classList.add("tab-ident-icon");
      img4.src = "";
      img4.alt = "";
      span4.appendChild(img4);
      div.appendChild(span4);
      const span5 = document.createElement("span");
      span5.classList.add("tab-close");
      span5.setAttribute("title", "");
      const img5 = document.createElement("img");
      img5.classList.add("tab-close-icon");
      img5.src = "";
      img5.alt = "";
      span5.appendChild(img5);
      div.appendChild(span5);
      const span6 = document.createElement("span");
      span6.classList.add("tab-pinned");
      const img6 = document.createElement("img");
      img6.classList.add("tab-pinned-icon");
      img6.src = "";
      img6.alt = "";
      span6.appendChild(img6);
      div.appendChild(span6);
      tmpl2.content.appendChild(div);
      body.appendChild(tmpl2);
      const pinned = document.createElement("section");
      pinned.id = PINNED;
      body.appendChild(pinned);
      const newTab = document.createElement("section");
      newTab.id = NEW_TAB;
      body.appendChild(newTab);
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should throw", async () => {
      await func("foo", {}).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should throw", async () => {
      await func(1, {
        newPosition: "foo",
        newWindowId: 1,
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should throw", async () => {
      await func(1, {
        newPosition: 1,
        newWindowId: "foo",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should not call function", async () => {
      const info = {
        newPosition: 0,
        newWindowId: browser.windows.WINDOW_ID_CURRENT,
      };
      const i = browser.tabs.get.callCount;
      browser.tabs.get.withArgs(1).resolves({
        id: 1,
        mutedInfo: {},
      });
      const res = await func(browser.tabs.TAB_ID_NONE, info);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called");
      assert.isNull(res, "result");
    });

    it("should not call function", async () => {
      const info = {
        newPosition: 0,
        newWindowId: 1,
      };
      const i = browser.tabs.get.callCount;
      browser.tabs.get.withArgs(1).resolves({
        id: 1,
        mutedInfo: {},
      });
      const res = await func(1, info);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called");
      assert.isNull(res, "result");
    });

    it("should call function", async () => {
      const info = {
        newPosition: 0,
        newWindowId: browser.windows.WINDOW_ID_CURRENT,
      };
      const i = browser.tabs.get.callCount;
      browser.tabs.get.withArgs(1).resolves({
        id: 1,
        mutedInfo: {},
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const res = await func(1, info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called");
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined,
      ], "result");
    });
  });

  describe("handle detached tab", () => {
    const func = mjs.handleDetachedTab;
    beforeEach(() => {
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should throw", async () => {
      await func("foo", {}).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should throw", async () => {
      await func(1, {
        oldWindowId: "foo",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should not remove element", async () => {
      const info = {
        oldWindowId: 1,
      };
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      await func(1, info);
      assert.deepEqual(elm.parentNode, body, "not removed");
    });

    it("should remove element", async () => {
      const info = {
        oldWindowId: browser.windows.WINDOW_ID_CURRENT,
      };
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      await func(1, info);
      assert.isNull(elm.parentNode, "removed");
    });
  });

  describe("handle highlighted tab", () => {
    const func = mjs.handleHighlightedTab;
    beforeEach(() => {
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should throw", async () => {
      await func({
        tabIds: 1,
        windowId: 1,
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Array but got Number.",
                           "throw");
      });
    });

    it("should throw", async () => {
      await func({
        tabIds: [],
        windowId: "foo",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should do nothing if window ID does not match", async () => {
      const res = await func({
        tabIds: [],
        windowId: 1,
      });
      assert.deepEqual(res, [], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      body.appendChild(elm);
      body.appendChild(elm2);
      browser.tabs.get.withArgs(2).resolves({
        audible: false,
        mutedInfo: {
          muted: false,
        },
      });
      const res = await func({
        tabIds: [1],
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called");
      assert.isTrue(elm.classList.contains(HIGHLIGHTED), "class");
      assert.isFalse(elm2.classList.contains(HIGHLIGHTED), "remove class");
      assert.deepEqual(res, [[undefined, undefined]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      browser.tabs.get.withArgs(2).resolves({
        audible: false,
        mutedInfo: {
          muted: false,
        },
      });
      browser.tabs.get.withArgs(3).resolves({
        audible: false,
        mutedInfo: {
          muted: false,
        },
      });
      const res = await func({
        tabIds: [1, 3],
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      assert.strictEqual(browser.tabs.get.callCount, i + 2, "called");
      assert.isTrue(elm.classList.contains(HIGHLIGHTED), "class");
      assert.isFalse(elm2.classList.contains(HIGHLIGHTED), "remove class");
      assert.isTrue(elm3.classList.contains(HIGHLIGHTED), "add class");
      assert.deepEqual(res, [
        [undefined, undefined],
        [[undefined, undefined]],
      ], "result");
    });

    it("should not call function", async () => {
      const i = browser.tabs.get.callCount;
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      const res = await func({
        tabIds: [1, 2],
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      assert.strictEqual(browser.tabs.get.callCount, i, "not called");
      assert.isTrue(elm.classList.contains(HIGHLIGHTED), "class");
      assert.isTrue(elm2.classList.contains(HIGHLIGHTED), "class");
      assert.isFalse(elm3.classList.contains(HIGHLIGHTED), "class");
      assert.deepEqual(res, [], "result");
    });
  });

  describe("handle moved tab", () => {
    const func = mjs.handleMovedTab;
    beforeEach(() => {
      const body = document.querySelector("body");
      const tmpl = document.createElement("template");
      tmpl.id = "tab-container-template";
      const sect = document.createElement("section");
      sect.classList.add("tab-container");
      sect.dataset.tabControls = "";
      sect.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(sect);
      body.appendChild(tmpl);
      const newTab = document.createElement("section");
      newTab.id = NEW_TAB;
      body.appendChild(newTab);
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should throw", async () => {
      await func("foo", {
        fromIndex: 0,
        toIndex: 1,
        windowId: 1,
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should throw", async () => {
      await func(1, {
        fromIndex: "foo",
        toIndex: 1,
        windowId: 1,
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should throw", async () => {
      await func(1, {
        fromIndex: 0,
        toIndex: "foo",
        windowId: 1,
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should throw", async () => {
      await func(1, {
        fromIndex: 0,
        toIndex: 1,
        windowId: "foo",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should get null if window ID does not match", async () => {
      let windowId = browser.windows.WINDOW_ID_CURRENT + 1;
      if (windowId === browser.windows.WINDOW_ID_NONE) {
        windowId++;
      }
      const res = await func(1, {
        windowId,
        fromIndex: 0,
        toIndex: 1,
      });
      assert.isNull(res, "result");
    });

    it("should get null if tab not found", async () => {
      const res = await func(1, {
        fromIndex: 0,
        toIndex: 1,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      assert.isNull(res, "result");
    });

    it("should remove value", async () => {
      const i = browser.sessions.setWindowValue.callCount;
      const parent = document.createElement("section");
      const elm = document.createElement("div");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.restore = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const res = await func(1, {
        fromIndex: 1,
        toIndex: 0,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      assert.strictEqual(elm.dataset.restore, "", "restore");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
    });

    it("should remove value", async () => {
      const parent = document.createElement("section");
      const elm = document.createElement("div");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm.dataset.group = "1";
      parent.appendChild(elm);
      body.appendChild(parent);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const res = await func(1, {
        fromIndex: 1,
        toIndex: 0,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      assert.strictEqual(elm.dataset.group, "", "restore");
      assert.isNull(res, "result");
    });

    it("should not move", async () => {
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const res = await func(1, {
        fromIndex: 1,
        toIndex: 0,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ["1", "2"], "not move");
      assert.isNull(res, "result");
    });

    it("should set value", async () => {
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const parent3 = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      browser.tabs.get.withArgs(1).resolves({
        index: 1,
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      const res = await func(1, {
        fromIndex: 0,
        toIndex: 2,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(mjs.sidebar.tabsWaitingToMove, [undefined, {
        index: 1,
        tabId: 1,
        toIndex: 2,
      }], "wait");
      assert.deepEqual(items, ["1", "2", "3"], "not move");
      assert.isNull(res, "result");
    });

    it("should set value", async () => {
      const parent = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      parent.id = PINNED;
      parent.classList.add(PINNED, CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB, PINNED);
      elm3.dataset.tabId = "3";
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(parent);
      browser.tabs.get.withArgs(1).resolves({
        index: 1,
        pinned: true,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      const res = await func(1, {
        fromIndex: 0,
        toIndex: 2,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(mjs.sidebar.pinnedTabsWaitingToMove, [undefined, {
        index: 1,
        tabId: 1,
        toIndex: 2,
      }], "wait");
      assert.deepEqual(items, ["1", "2", "3"], "not move");
      assert.isNull(res, "result");
    });

    // pinned
    it("should move", async () => {
      const parent = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      parent.id = PINNED;
      parent.classList.add(PINNED, CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB, PINNED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://example.com/bar",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(parent);
      browser.tabs.get.withArgs(3).resolves({
        index: 1,
        pinned: true,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      const res = await func(3, {
        fromIndex: 2,
        toIndex: 1,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ["1", "3", "2"], "move");
      assert.isUndefined(res, "result");
    });

    it("should move", async () => {
      const parent = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      parent.id = PINNED;
      parent.classList.add(PINNED, CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB, PINNED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://example.com/bar",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(parent);
      browser.tabs.get.withArgs(2).resolves({
        index: 2,
        pinned: true,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      const res = await func(2, {
        fromIndex: 1,
        toIndex: 2,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ["1", "3", "2"], "move");
      assert.isUndefined(res, "result");
    });

    it("should move", async () => {
      const i = browser.sessions.setWindowValue.callCount;
      const parent = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      parent.id = PINNED;
      parent.classList.add(PINNED, CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB, PINNED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://example.com/bar",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(parent);
      browser.tabs.get.withArgs(2).resolves({
        index: 2,
        pinned: true,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      mjs.sidebar.pinnedTabsWaitingToMove = [undefined, {
        index: 1,
        tabId: 1,
        toIndex: 2,
      }];
      const res = await func(2, {
        fromIndex: 1,
        toIndex: 2,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ["3", "1", "2"], "move");
      assert.isNull(mjs.sidebar.tabsWaitingToMove, "wait");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
    });

    // group
    it("should move", async () => {
      const i = browser.sessions.setWindowValue.callCount;
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const parent3 = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://example.com/bar",
      });
      elm3.dataset.group = "1";
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      browser.tabs.get.withArgs(3).resolves({
        index: 1,
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      const res = await func(3, {
        fromIndex: 2,
        toIndex: 1,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ["1", "3", "2"], "move");
      assert.isTrue(elm.parentNode === elm3.parentNode, "group");
      assert.strictEqual(elm3.dataset.group, "", "value");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
    });

    it("should move", async () => {
      const i = browser.sessions.setWindowValue.callCount;
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const parent3 = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm.dataset.group = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://example.com/bar",
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      browser.tabs.get.withArgs(1).resolves({
        index: 1,
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      const res = await func(1, {
        fromIndex: 0,
        toIndex: 1,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ["2", "1", "3"], "move");
      assert.isTrue(elm.parentNode === elm2.parentNode, "group");
      assert.strictEqual(elm.dataset.group, "", "value");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
    });

    it("should move", async () => {
      const i = browser.sessions.setWindowValue.callCount;
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const parent3 = document.createElement("section");
      const parent4 = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      parent4.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        url: "https://example.com/baz",
      });
      elm4.dataset.group = "2";
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      browser.tabs.get.withArgs(4).resolves({
        index: 2,
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      mjs.sidebar.tabsWaitingToMove = [undefined, {
        index: 1,
        tabId: 1,
        toIndex: 2,
      }];
      const res = await func(4, {
        fromIndex: 3,
        toIndex: 2,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ["2", "1", "4", "3"], "move");
      assert.isTrue(elm.parentNode === elm2.parentNode, "group");
      assert.isTrue(elm4.parentNode === elm2.parentNode, "group");
      assert.strictEqual(elm4.dataset.group, "", "value");
      assert.isNull(mjs.sidebar.tabsWaitingToMove, "wait");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
    });

    // grouped tab
    it("should move", async () => {
      const i = browser.sessions.setWindowValue.callCount;
      const tmpl = document.createElement("template");
      const cnt = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://example.com/bar",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.get.withArgs(3).resolves({
        index: 1,
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      const res = await func(3, {
        fromIndex: 2,
        toIndex: 1,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ["1", "3", "2"], "move");
      assert.isTrue(elm.parentNode === elm3.parentNode, "parent");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
    });

    it("should move", async () => {
      const i = browser.sessions.setWindowValue.callCount;
      const tmpl = document.createElement("template");
      const cnt = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://example.com/bar",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.get.withArgs(1).resolves({
        index: 1,
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      const res = await func(1, {
        fromIndex: 0,
        toIndex: 1,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ["2", "1", "3"], "move");
      assert.isTrue(elm.parentNode === elm2.parentNode, "parent");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
    });

    it("should move", async () => {
      const i = browser.sessions.setWindowValue.callCount;
      const tmpl = document.createElement("template");
      const cnt = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const parent3 = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        url: "https://example.com/baz",
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      parent3.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      browser.tabs.get.withArgs(4).resolves({
        index: 2,
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      mjs.sidebar.tabsWaitingToMove = [undefined, {
        index: 1,
        tabId: 1,
        toIndex: 2,
      }];
      const res = await func(4, {
        fromIndex: 3,
        toIndex: 2,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ["2", "1", "4", "3"], "move");
      assert.isTrue(elm.parentNode === elm2.parentNode, "parent");
      assert.isTrue(elm4.parentNode === elm2.parentNode, "parent");
      assert.isNull(mjs.sidebar.tabsWaitingToMove, "wait");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
    });

    it("should move", async () => {
      const i = browser.sessions.setWindowValue.callCount;
      const tmpl = document.createElement("template");
      const cnt = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const parent3 = document.createElement("section");
      const parent4 = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        url: "https://example.com/baz",
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      browser.tabs.get.withArgs(4).resolves({
        index: 2,
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      const res = await func(4, {
        fromIndex: 3,
        toIndex: 2,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ["1", "2", "4", "3"], "move");
      assert.isTrue(elm4.parentNode !== elm2.parentNode, "parent");
      assert.isTrue(elm4.parentNode !== elm3.parentNode, "parent");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
    });

    it("should move", async () => {
      const i = browser.sessions.setWindowValue.callCount;
      const tmpl = document.createElement("template");
      const cnt = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const parent3 = document.createElement("section");
      const parent4 = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        url: "https://example.com/baz",
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      browser.tabs.get.withArgs(1).resolves({
        index: 2,
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      const res = await func(1, {
        fromIndex: 0,
        toIndex: 2,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ["2", "3", "1", "4"], "move");
      assert.isTrue(elm.parentNode !== elm3.parentNode, "parent");
      assert.isTrue(elm.parentNode !== elm4.parentNode, "parent");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
    });

    it("should move", async () => {
      const i = browser.sessions.setWindowValue.callCount;
      const tmpl = document.createElement("template");
      const cnt = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const parent3 = document.createElement("section");
      const parent4 = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        url: "https://example.com/baz",
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      browser.tabs.get.withArgs(4).resolves({
        index: 2,
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      mjs.sidebar.tabsWaitingToMove = [undefined, {
        index: 1,
        tabId: 1,
        toIndex: 2,
      }];
      const res = await func(4, {
        fromIndex: 3,
        toIndex: 2,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const items = Array.from(document.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ["2", "1", "4", "3"], "move");
      assert.isTrue(elm.parentNode !== elm2.parentNode, "parent");
      assert.isTrue(elm.parentNode !== elm4.parentNode, "parent");
      assert.isTrue(elm4.parentNode !== elm3.parentNode, "parent");
      assert.isNull(mjs.sidebar.tabsWaitingToMove, "wait");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i + 1,
                         "called");
      assert.isUndefined(res, "result");
    });
  });

  describe("handle removed tab", () => {
    const func = mjs.handleRemovedTab;
    beforeEach(() => {
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should throw", async () => {
      await func("foo", {}).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should throw", async () => {
      await func(1, {
        isWindowClosing: false,
        windowId: "foo",
      }).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should not remove", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      await func(1, {
        isWindowClosing: false,
        windowId: 1,
      });
      assert.isTrue(elm.parentNode === body, "not removed");
    });

    it("should not remove", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      await func(1, {
        isWindowClosing: true,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      assert.isTrue(elm.parentNode === body, "not removed");
    });

    it("should not remove", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      await func(2, {
        isWindowClosing: false,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      assert.isTrue(elm.parentNode === body, "not removed");
    });

    it("should not remove", async () => {
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.dataset.tabId = "1";
      body.appendChild(elm);
      await func(1, {
        isWindowClosing: false,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      assert.isFalse(elm.parentNode === body, "removed");
      assert.strictEqual(body.childElementCount, 0, "child count");
    });
  });

  describe("handle updated tab", () => {
    const func = mjs.handleUpdatedTab;
    beforeEach(() => {
      const tab = document.createElement("div");
      tab.classList.add("tab");
      tab.dataset.tabId = "1";
      tab.dataset.tab = "";
      const context = document.createElement("span");
      context.classList.add("tab-context");
      context.title = "";
      const toggleIcon = document.createElement("img");
      toggleIcon.classList.add("tab-toggle-icon");
      toggleIcon.src = "";
      toggleIcon.alt = "";
      context.appendChild(toggleIcon);
      tab.appendChild(context);
      const content = document.createElement("span");
      content.classList.add("tab-content");
      content.title = "";
      const tabIcon = document.createElement("img");
      tabIcon.classList.add("tab-icon");
      tabIcon.src = "";
      tabIcon.alt = "";
      tabIcon.dataset.connecting = "";
      content.appendChild(tabIcon);
      const title = document.createElement("span");
      title.classList.add("tab-title");
      content.appendChild(title);
      tab.appendChild(content);
      const audio = document.createElement("span");
      audio.classList.add("tab-audio");
      audio.title = "";
      const audioIcon = document.createElement("img");
      audioIcon.classList.add("tab-audio-icon");
      audioIcon.src = "";
      audioIcon.alt = "";
      audio.appendChild(audioIcon);
      tab.appendChild(audio);
      const ident = document.createElement("span");
      ident.classList.add("tab-ident");
      ident.title = "";
      const identIcon = document.createElement("img");
      identIcon.classList.add("tab-ident-icon");
      ident.src = "";
      ident.alt = "";
      ident.appendChild(identIcon);
      tab.appendChild(ident);
      const closeButton = document.createElement("span");
      closeButton.classList.add("tab-close");
      closeButton.title = "";
      const closeIcon = document.createElement("img");
      closeIcon.classList.add("tab-close-icon");
      closeIcon.src = "";
      closeIcon.alt = "";
      closeButton.appendChild(closeIcon);
      tab.appendChild(closeButton);
      const pinned = document.createElement("span");
      pinned.classList.add("tab-pinned");
      const pinnedIcon = document.createElement("img");
      pinnedIcon.classList.add("tab-pinned-icon");
      pinnedIcon.src = "";
      pinnedIcon.alt = "";
      pinned.appendChild(pinnedIcon);
      tab.appendChild(pinned);
      const sect = document.createElement("section");
      sect.classList.add("tab-container");
      const h1 = document.createElement("h1");
      const label = document.createElement("span");
      h1.classList.add(CLASS_HEADING);
      label.classList.add(CLASS_HEADING_LABEL);
      h1.appendChild(label);
      sect.appendChild(h1);
      sect.appendChild(tab);
      const body = document.querySelector("body");
      body.appendChild(sect);
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should throw", async () => {
      await func("foo", {}, {}).catch(e => {
        assert.strictEqual(e.message, "Expected Number but got String.",
                           "throw");
      });
    });

    it("should not update", async () => {
      const res = await func(1, {}, {
        windowId: 1,
      });
      assert.deepEqual(res, [], "result");
    });

    it("should not update", async () => {
      const res = await func(2, {}, {
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      assert.deepEqual(res, [], "result");
    });

    it("should not update", async () => {
      const res = await func(2, {
        foo: "bar",
      }, {});
      assert.deepEqual(res, [], "result");
    });

    it("should not update", async () => {
      const res = await func(2, {
        foo: "bar",
      }, {
        mutedInfo: {
          muted: false,
        },
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      assert.deepEqual(res, [], "result");
    });

    it("should not update", async () => {
      const res = await func(2, {
        foo: "bar",
      }, {
        mutedInfo: {
          muted: false,
        },
        windowId: browser.windows.WINDOW_ID_NONE,
      });
      assert.deepEqual(res, [], "result");
    });

    it("should update, not call function", async () => {
      const info = {
        foo: "bar",
      };
      const tabsTab = {
        discarded: false,
        mutedInfo: {
          muted: false,
        },
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      const res = await func(1, info, tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isFalse(elm.classList.contains(DISCARDED), "class");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tabsTab");
      assert.deepEqual(res, [], "result");
    });

    it("should update, add class", async () => {
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      const info = {
        hidden: true,
      };
      const tabsTab = {
        discarded: true,
        mutedInfo: {
          muted: false,
        },
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      const res = await func(1, info, tabsTab);
      assert.isTrue(elm.hasAttribute("hidden"), "hidden");
      assert.isTrue(elm.classList.contains(DISCARDED), "class");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tabsTab");
      assert.deepEqual(res, [], "result");
    });

    it("should update, add class", async () => {
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      const info = {
        hidden: false,
      };
      const tabsTab = {
        discarded: false,
        mutedInfo: {
          muted: false,
        },
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      elm.setAttribute("hidden", "hidden");
      const res = await func(1, info, tabsTab);
      assert.isFalse(elm.hasAttribute("hidden"), "hidden");
      assert.isFalse(elm.classList.contains(DISCARDED), "class");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tabsTab");
      assert.deepEqual(res, [], "result");
    });

    it("should update, call function", async () => {
      const i = browser.windows.getCurrent.callCount;
      const info = {
        discarded: true,
      };
      const tabsTab = {
        discarded: true,
        mutedInfo: {
          muted: false,
        },
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      browser.windows.getCurrent.resolves({
        incognito: true,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const res = await func(1, info, tabsTab);
      assert.isTrue(elm.classList.contains(DISCARDED), "class");
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 1, "called");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tabsTab");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should update, call function", async () => {
      const i = browser.windows.getCurrent.callCount;
      const info = {
        discarded: false,
      };
      const tabsTab = {
        discarded: false,
        mutedInfo: {
          muted: false,
        },
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      elm.classList.add(DISCARDED);
      browser.windows.getCurrent.resolves({
        incognito: true,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      });
      const res = await func(1, info, tabsTab);
      assert.isFalse(elm.classList.contains(DISCARDED), "class");
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 1, "called");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tabsTab");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should not update, not call function", async () => {
      const i = browser.tabs.query.callCount;
      const info = {
        status: "loading",
      };
      const tabsTab = {
        discarded: false,
        id: 1,
        mutedInfo: {
          muted: false,
        },
        status: "loading",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        active: true,
        windowType: "normal",
      }).resolves([tabsTab]);
      const res = await func(1, info, tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isFalse(elm.classList.contains(ACTIVE), "class");
      assert.strictEqual(browser.tabs.query.callCount, i, "not called");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tabsTab");
      assert.deepEqual(res, [], "result");
    });

    it("should update, call function", async () => {
      const i = browser.tabs.query.callCount;
      const info = {
        status: "complete",
      };
      const tabsTab = {
        discarded: false,
        id: 1,
        mutedInfo: {
          muted: false,
        },
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        active: true,
        windowType: "normal",
      }).resolves([tabsTab]);
      const res = await func(1, info, tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isTrue(elm.classList.contains(ACTIVE), "class");
      assert.strictEqual(browser.tabs.query.callCount, i + 1, "called");
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, "tabsTab");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should update, call function", async () => {
      const i = browser.windows.getCurrent.callCount;
      const j = browser.sessions.getWindowValue.callCount;
      const k = browser.sessions.setWindowValue.callCount;
      const pinned = document.createElement("section");
      pinned.id = PINNED;
      pinned.classList.add("tab-container");
      const body = document.querySelector("body");
      const sect = body.querySelector("section");
      body.insertBefore(pinned, sect);
      const info = {
        pinned: true,
      };
      const tabsTab = {
        discarded: false,
        id: 1,
        mutedInfo: {
          muted: false,
        },
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      browser.sessions.getWindowValue.resolves(undefined);
      const res = await func(1, info, tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isTrue(elm.classList.contains(PINNED), "class");
      assert.isTrue(elm.parentNode === pinned, "parent");
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 2,
                         "called windows get");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, j + 1,
                         "called sessions get");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, k + 1,
                         "called sessions set");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should update, call function", async () => {
      const i = browser.windows.getCurrent.callCount;
      const j = browser.sessions.getWindowValue.callCount;
      const k = browser.sessions.setWindowValue.callCount;
      const body = document.querySelector("body");
      const tmpl = document.createElement("template");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      const sect = document.createElement("section");
      sect.classList.add(CLASS_TAB_CONTAINER);
      const pinned = body.querySelector("section");
      pinned.id = PINNED;
      tmpl.content.appendChild(sect);
      body.appendChild(tmpl);
      const info = {
        pinned: false,
      };
      const tabsTab = {
        discarded: false,
        id: 1,
        mutedInfo: {
          muted: false,
        },
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      browser.sessions.getWindowValue.resolves(undefined);
      const res = await func(1, info, tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      assert.isFalse(elm.classList.contains(PINNED), "class");
      assert.isTrue(elm.parentNode === pinned.nextElementSibling, "parent");
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 2,
                         "called windows get");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, j + 1,
                         "called sessions get");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, k + 1,
                         "called sessions set");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should update", async () => {
      const info = {
        audible: true,
        mutedInfo: {
          muted: false,
        },
      };
      const tabsTab = {
        discarded: false,
        id: 1,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        audible: true,
        mutedInfo: {
          muted: false,
        },
      };
      const res = await func(1, info, tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      const audio = elm.querySelector(".tab-audio");
      assert.isTrue(audio.classList.contains(AUDIBLE), "audible");
      assert.deepEqual(res, [undefined, undefined], "result");
    });

    it("should update", async () => {
      const info = {
        audible: false,
        mutedInfo: {
          muted: false,
        },
      };
      const tabsTab = {
        discarded: false,
        id: 1,
        status: "complete",
        title: "foo",
        url: "https://example.com",
        windowId: browser.windows.WINDOW_ID_CURRENT,
        audible: false,
        mutedInfo: {
          muted: false,
        },
      };
      const res = await func(1, info, tabsTab);
      const elm = document.querySelector("[data-tab-id=\"1\"]");
      const audio = elm.querySelector(".tab-audio");
      assert.isFalse(audio.classList.contains(AUDIBLE), "audible");
      assert.deepEqual(res, [undefined, undefined], "result");
    });
  });

  describe("handle clicked menu", () => {
    const func = mjs.handleClickedMenu;
    beforeEach(() => {
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should not call function", async () => {
      const info = {
        menuItemId: "foo",
      };
      const res = await func(info);
      assert.deepEqual(res, [], "result");
    });

    it("should not call function", async () => {
      const i = browser.tabs.get.callCount;
      const items = [
        TAB_MUTE, TABS_MUTE, TAB_PIN, TABS_PIN,
        TAB_GROUP_COLLAPSE,
        TAB_GROUP_DETACH, TAB_GROUP_UNGROUP,
      ];
      const body = document.querySelector("body");
      mjs.sidebar.context = body;
      for (const item of items) {
        const info = {
          menuItemId: item,
        };
        const res = await func(info);
        assert.strictEqual(browser.tabs.get.callCount, i, "not called");
        assert.deepEqual(res, [], "result");
      }
    });

    it("should not call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.create.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      sect.appendChild(elm);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.contextualIds = ["foo"];
      browser.tabs.get.withArgs(1).resolves({});
      const info = {
        menuItemId: "foo",
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.create.callCount, j, "called create");
      assert.deepEqual(res, [], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.create.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      sect.appendChild(elm);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.contextualIds = ["foo"];
      browser.tabs.get.withArgs(1).resolves({});
      const info = {
        menuItemId: "fooReopen",
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 2, "called get");
      assert.strictEqual(browser.tabs.create.callCount, j + 1, "called create");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.create.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.contextualIds = ["foo"];
      browser.tabs.get.resolves({});
      const info = {
        menuItemId: "fooReopen",
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 3, "called get");
      assert.strictEqual(browser.tabs.create.callCount, j + 2, "called create");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.create.callCount;
      const newTab = document.getElementById(NEW_TAB);
      browser.tabs.create.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        active: true,
        cookieStoreId: "foo",
      }).resolves({
        id: "foo",
      });
      mjs.sidebar.context = newTab;
      mjs.sidebar.contextualIds = ["foo"];
      const info = {
        menuItemId: "fooNewTab",
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.create.callCount, i + 1, "called create");
      assert.deepEqual(res, [{
        id: "foo",
      }], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.reload.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      const info = {
        menuItemId: TABS_RELOAD,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.reload.callCount, i + 2, "called reload");
      assert.deepEqual(res, [[undefined, undefined]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.reload.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      const info = {
        menuItemId: TAB_RELOAD,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.reload.callCount, i + 1, "called reload");
      assert.deepEqual(res, [[undefined]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({
        pinned: true,
      });
      browser.tabs.update.withArgs(1, {pinned: false}).resolves({});
      browser.tabs.update.withArgs(2, {pinned: false}).resolves({});
      const info = {
        menuItemId: TABS_PIN,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.update.callCount, j + 2, "called update");
      assert.deepEqual(res, [[{}, {}]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({
        pinned: false,
      });
      browser.tabs.update.withArgs(1, {pinned: true}).resolves({});
      browser.tabs.update.withArgs(2, {pinned: true}).resolves({});
      const info = {
        menuItemId: TABS_PIN,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.update.callCount, j + 2, "called update");
      assert.deepEqual(res, [[{}, {}]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({
        pinned: true,
      });
      browser.tabs.update.withArgs(1, {pinned: false}).resolves({});
      const info = {
        menuItemId: TAB_PIN,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.update.callCount, j + 1, "called update");
      assert.deepEqual(res, [[{}]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({
        pinned: false,
      });
      browser.tabs.update.withArgs(1, {pinned: true}).resolves({});
      const info = {
        menuItemId: TAB_PIN,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.update.callCount, j + 1, "called update");
      assert.deepEqual(res, [[{}]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({
        mutedInfo: {
          muted: true,
        },
      });
      browser.tabs.update.withArgs(1, {muted: false}).resolves({});
      browser.tabs.update.withArgs(2, {muted: false}).resolves({});
      const info = {
        menuItemId: TABS_MUTE,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.update.callCount, j + 2, "called update");
      assert.deepEqual(res, [[{}, {}]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({
        mutedInfo: {
          muted: false,
        },
      });
      browser.tabs.update.withArgs(1, {muted: true}).resolves({});
      browser.tabs.update.withArgs(2, {muted: true}).resolves({});
      const info = {
        menuItemId: TABS_MUTE,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.update.callCount, j + 2, "called update");
      assert.deepEqual(res, [[{}, {}]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({
        mutedInfo: {
          muted: true,
        },
      });
      browser.tabs.update.withArgs(1, {muted: false}).resolves({});
      const info = {
        menuItemId: TAB_MUTE,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.update.callCount, j + 1, "called update");
      assert.deepEqual(res, [[{}]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({
        mutedInfo: {
          muted: false,
        },
      });
      browser.tabs.update.withArgs(1, {muted: true}).resolves({});
      const info = {
        menuItemId: TAB_MUTE,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.update.callCount, j + 1, "called update");
      assert.deepEqual(res, [[{}]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.create.callCount;
      const k = browser.tabs.move.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.windows.create.resolves({
        id: 1,
      });
      browser.tabs.move.resolves([{}, {}]);
      const info = {
        menuItemId: TABS_MOVE_WIN,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.windows.create.callCount, j + 1,
                         "called create");
      assert.strictEqual(browser.tabs.move.callCount, k + 1, "called move");
      assert.deepEqual(res, [[{}, {}]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.create.callCount;
      const k = browser.tabs.move.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.windows.create.resolves({
        id: 1,
      });
      browser.tabs.move.resolves([{}, {}]);
      const info = {
        menuItemId: TAB_MOVE_WIN,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.windows.create.callCount, j + 1,
                         "called create");
      assert.strictEqual(browser.tabs.move.callCount, k, "not called move");
      assert.deepEqual(res, [null], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.move.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(pinned);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.move.resolves([{}, {}]);
      const info = {
        menuItemId: TABS_MOVE_START,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.move.callCount, j + 1, "called move");
      assert.deepEqual(res, [[[{}, {}]]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.move.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(pinned);
      body.appendChild(sect);
      mjs.sidebar.context = elm2;
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.move.resolves([{}]);
      const info = {
        menuItemId: TAB_MOVE_START,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.move.callCount, j + 1, "called move");
      assert.deepEqual(res, [[[{}]]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.move.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.move.resolves([{}, {}]);
      const info = {
        menuItemId: TABS_MOVE_END,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.move.callCount, j + 1, "called move");
      assert.deepEqual(res, [[[{}, {}]]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.move.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.move.resolves([{}]);
      const info = {
        menuItemId: TAB_MOVE_END,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.move.callCount, j + 1, "called move");
      assert.deepEqual(res, [[[{}]]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.create.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.create.resolves({});
      const info = {
        menuItemId: TABS_DUPE,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 3, "called get");
      assert.strictEqual(browser.tabs.create.callCount, j + 2,
                         "called create");
      assert.deepEqual(res, [[{}, {}]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.create.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.create.resolves({});
      const info = {
        menuItemId: TAB_DUPE,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 2, "called get");
      assert.strictEqual(browser.tabs.create.callCount, j + 1,
                         "called create");
      assert.deepEqual(res, [[{}]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.tabs.remove.resolves(undefined);
      const info = {
        menuItemId: TAB_CLOSE_OTHER,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.remove.callCount, j + 1, "called remove");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.tabs.remove.resolves(undefined);
      const info = {
        menuItemId: TAB_CLOSE_END,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.remove.callCount, j + 1, "called remove");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.tabs.remove.resolves(undefined);
      const info = {
        menuItemId: TABS_CLOSE,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.remove.callCount, j + 1, "called remove");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.tabs.remove.resolves(undefined);
      const info = {
        menuItemId: TAB_CLOSE,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.remove.callCount, j + 1, "called remove");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.bookmarks.create.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        title: "foo",
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        title: "bar",
        url: "https://www.example.com",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.bookmarks.create.resolves({});
      const info = {
        menuItemId: TABS_BOOKMARK,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.bookmarks.create.callCount, j + 2,
                         "called create");
      assert.deepEqual(res, [[{}, {}]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.bookmarks.create.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        title: "foo",
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        title: "bar",
        url: "https://www.example.com",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.bookmarks.create.resolves({});
      const info = {
        menuItemId: TAB_BOOKMARK,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.bookmarks.create.callCount, j + 1,
                         "called create");
      assert.deepEqual(res, [[{}]], "result");
    });

    it("should call function", async () => {
      const i = browser.sessions.restore.callCount;
      mjs.sidebar.lastClosedTab = {
        sessionId: "foo",
      };
      browser.sessions.restore.withArgs("foo").resolves({});
      const info = {
        menuItemId: TAB_CLOSE_UNDO,
      };
      const res = await func(info);
      assert.strictEqual(browser.sessions.restore.callCount, i + 1, "called");
      assert.deepEqual(res, [{}], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.getCurrent.callCount;
      const k = browser.sessions.getWindowValue.callCount;
      const l = browser.sessions.setWindowValue.callCount;
      const tmpl = document.createElement("template");
      const sect = document.createElement("section");
      const pinned = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://foo.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://bar.com",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://baz.com",
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.resolves({
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const info = {
        menuItemId: TAB_GROUP_UNGROUP,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called tabs get");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 2,
                         "called windows get current");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, k + 1,
                         "called sessions get");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, l + 1,
                         "called sessions set");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.getCurrent.callCount;
      const k = browser.sessions.getWindowValue.callCount;
      const l = browser.sessions.setWindowValue.callCount;
      const m = browser.tabs.move.callCount;
      const tmpl = document.createElement("template");
      const sect = document.createElement("section");
      const pinned = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://www.example.com/foo",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://example.net/",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://example.com/bar",
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      const arg = {
        pinned: false,
        url: "*://*.example.com/*",
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
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
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const info = {
        menuItemId: TAB_GROUP_DOMAIN,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 2, "called tabs get");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 2,
                         "called windows get current");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, k + 1,
                         "called sessions get");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, l + 1,
                         "called sessions set");
      assert.strictEqual(browser.tabs.move.callCount, m + 2, "called move");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.getCurrent.callCount;
      const k = browser.sessions.getWindowValue.callCount;
      const l = browser.sessions.setWindowValue.callCount;
      const m = browser.tabs.move.callCount;
      const tmpl = document.createElement("template");
      const sect = document.createElement("section");
      const pinned = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        cookieStoreId: "foo",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        cookieStoreId: "bar",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        cookieStoreId: "foo",
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      const arg = {
        cookieStoreId: "foo",
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT,
      };
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
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const info = {
        menuItemId: TAB_GROUP_CONTAINER,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 2, "called tabs get");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 2,
                         "called windows get current");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, k + 1,
                         "called sessions get");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, l + 1,
                         "called sessions set");
      assert.strictEqual(browser.tabs.move.callCount, m + 2, "called move");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.getCurrent.callCount;
      const k = browser.sessions.getWindowValue.callCount;
      const l = browser.sessions.setWindowValue.callCount;
      const m = browser.tabs.move.callCount;
      const tmpl = document.createElement("template");
      const sect = document.createElement("section");
      const pinned = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://foo.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://bar.com",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://baz.com",
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.resolves({
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const info = {
        menuItemId: TAB_GROUP_SELECTED,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called tabs get");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 2,
                         "called windows get current");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, k + 1,
                         "called sessions get");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, l + 1,
                         "called sessions set");
      assert.strictEqual(browser.tabs.move.callCount, m + 2, "called move");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.getCurrent.callCount;
      const k = browser.sessions.getWindowValue.callCount;
      const l = browser.sessions.setWindowValue.callCount;
      const m = browser.tabs.move.callCount;
      const tmpl = document.createElement("template");
      const sect = document.createElement("section");
      const pinned = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://foo.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://bar.com",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://baz.com",
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.resolves({
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const info = {
        menuItemId: TAB_GROUP_DETACH_TABS,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called tabs get");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 2,
                         "called windows get current");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, k + 1,
                         "called sessions get");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, l + 1,
                         "called sessions set");
      assert.strictEqual(browser.tabs.move.callCount, m + 1, "called move");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.getCurrent.callCount;
      const k = browser.sessions.getWindowValue.callCount;
      const l = browser.sessions.setWindowValue.callCount;
      const m = browser.tabs.move.callCount;
      const tmpl = document.createElement("template");
      const sect = document.createElement("section");
      const pinned = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://foo.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://bar.com",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://baz.com",
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.resolves({
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const info = {
        menuItemId: TAB_GROUP_DETACH,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called tabs get");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 2,
                         "called windows get current");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, k + 1,
                         "called sessions get");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, l + 1,
                         "called sessions set");
      assert.strictEqual(browser.tabs.move.callCount, m + 1, "called move");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should get result", async () => {
      const sect = document.createElement("section");
      const heading = document.createElement("div");
      const child = document.createElement("div");
      const button = document.createElement("button");
      const body = document.querySelector("body");
      child.classList.add(CLASS_HEADING_LABEL);
      button.classList.add(CLASS_HEADING_LABEL_EDIT);
      heading.classList.add(CLASS_HEADING);
      heading.appendChild(child);
      heading.appendChild(button);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(heading);
      body.appendChild(sect);
      mjs.sidebar.context = heading;
      const info = {
        menuItemId: TAB_GROUP_LABEL_SHOW,
      };
      const res = await func(info);
      assert.isTrue(heading.hidden, "hidden");
      assert.deepEqual(res, [[undefined]], "result");
    });

    it("should get result", async () => {
      const sect = document.createElement("section");
      const heading = document.createElement("div");
      const child = document.createElement("div");
      const button = document.createElement("button");
      const body = document.querySelector("body");
      child.classList.add(CLASS_HEADING_LABEL);
      button.classList.add(CLASS_HEADING_LABEL_EDIT);
      heading.classList.add(CLASS_HEADING);
      heading.hidden = true;
      heading.appendChild(child);
      heading.appendChild(button);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(heading);
      body.appendChild(sect);
      mjs.sidebar.context = heading;
      const info = {
        menuItemId: TAB_GROUP_LABEL_SHOW,
      };
      const res = await func(info);
      assert.isFalse(heading.hidden, "hidden");
      assert.deepEqual(res, [[undefined, child]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.getCurrent.callCount;
      const k = browser.sessions.getWindowValue.callCount;
      const l = browser.sessions.setWindowValue.callCount;
      const m = browser.i18n.getMessage.callCount;
      const tmpl = document.createElement("template");
      const sect = document.createElement("section");
      const pinned = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const cnt = document.createElement("span");
      const icon = document.createElement("img");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      cnt.appendChild(icon);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://foo.com",
      });
      elm.appendChild(cnt);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://bar.com",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://baz.com",
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.resolves({
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const info = {
        menuItemId: TAB_GROUP_COLLAPSE,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called tabs get");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 2,
                         "called windows get current");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, k + 1,
                         "called sessions get");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, l + 1,
                         "called sessions set");
      assert.strictEqual(browser.i18n.getMessage.callCount, m + 2,
                         "called get message");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.getCurrent.callCount;
      const k = browser.sessions.getWindowValue.callCount;
      const l = browser.sessions.setWindowValue.callCount;
      const m = browser.i18n.getMessage.callCount;
      const tmpl = document.createElement("template");
      const sect = document.createElement("section");
      const pinned = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const cnt = document.createElement("span");
      const icon = document.createElement("img");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      cnt.appendChild(icon);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://foo.com",
      });
      elm.appendChild(cnt);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://bar.com",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://baz.com",
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.tabGroupOnExpandCollapseOther = true;
      browser.tabs.get.resolves({
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const info = {
        menuItemId: TAB_GROUP_COLLAPSE,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called tabs get");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 2,
                         "called windows get current");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, k + 1,
                         "called sessions get");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, l + 1,
                         "called sessions set");
      assert.strictEqual(browser.i18n.getMessage.callCount, m + 2,
                         "called get message");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.getCurrent.callCount;
      const k = browser.sessions.getWindowValue.callCount;
      const l = browser.sessions.setWindowValue.callCount;
      const m = browser.i18n.getMessage.callCount;
      const tmpl = document.createElement("template");
      const sect = document.createElement("section");
      const pinned = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const cnt = document.createElement("span");
      const icon = document.createElement("img");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      cnt.appendChild(icon);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://foo.com",
      });
      elm.appendChild(cnt);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://bar.com",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://baz.com",
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.enableTabGroup = false;
      mjs.sidebar.tabGroupOnExpandCollapseOther = true;
      browser.tabs.get.resolves({
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const info = {
        menuItemId: TAB_GROUP_COLLAPSE,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called tabs get");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 2,
                         "called windows get current");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, k + 1,
                         "called sessions get");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, l + 1,
                         "called sessions set");
      assert.strictEqual(browser.i18n.getMessage.callCount, m + 2,
                         "called get message");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.getCurrent.callCount;
      const k = browser.sessions.getWindowValue.callCount;
      const l = browser.sessions.setWindowValue.callCount;
      const m = browser.i18n.getMessage.callCount;
      const tmpl = document.createElement("template");
      const sect = document.createElement("section");
      const pinned = document.createElement("section");
      const parent = document.createElement("section");
      const parent2 = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const cnt = document.createElement("span");
      const icon = document.createElement("img");
      const body = document.querySelector("body");
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      cnt.appendChild(icon);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        url: "https://foo.com",
      });
      elm.appendChild(cnt);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        url: "https://bar.com",
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        url: "https://baz.com",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        url: "https://qux.com",
      });
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm3;
      browser.tabs.get.resolves({
        pinned: false,
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const info = {
        menuItemId: TAB_GROUP_COLLAPSE_OTHER,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called tabs get");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 2,
                         "called windows get current");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, k + 1,
                         "called sessions get");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, l + 1,
                         "called sessions set");
      assert.strictEqual(browser.i18n.getMessage.callCount, m + 2,
                         "called get message");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        active: true,
        windowType: "normal",
      }).resolves([{
        index: 0,
      }]);
      browser.tabs.highlight.resolves({});
      const info = {
        menuItemId: TAB_ALL_SELECT,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.query.callCount, j + 1, "called query");
      assert.strictEqual(browser.tabs.highlight.callCount, k + 1,
                         "called highlight");
      assert.deepEqual(res, [{}], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = body;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        active: true,
        windowType: "normal",
      }).resolves([{
        index: 0,
      }]);
      browser.tabs.highlight.resolves({});
      const info = {
        menuItemId: TAB_ALL_SELECT,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called get");
      assert.strictEqual(browser.tabs.query.callCount, j + 1, "called query");
      assert.strictEqual(browser.tabs.highlight.callCount, k + 1,
                         "called highlight");
      assert.deepEqual(res, [{}], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.reload.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.highlight.resolves(undefined);
      const info = {
        menuItemId: TAB_ALL_RELOAD,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.reload.callCount, j + 3, "called reload");
      assert.deepEqual(res, [[undefined, undefined, undefined]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.reload.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = body;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.highlight.resolves(undefined);
      const info = {
        menuItemId: TAB_ALL_RELOAD,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called get");
      assert.strictEqual(browser.tabs.reload.callCount, j + 3, "called reload");
      assert.deepEqual(res, [[undefined, undefined, undefined]], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.bookmarks.create.callCount;
      const pinned = document.createElement("section");
      const sect = document.createElement("section");
      const newTab = document.createElement("section");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        title: "foo",
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        title: "bar",
        url: "https://www.example.com",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        title: "baz",
        url: "http://example.com",
      });
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      browser.tabs.get.withArgs(1).resolves({});
      browser.bookmarks.create.resolves({});
      const info = {
        menuItemId: TAB_ALL_BOOKMARK,
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.bookmarks.create.callCount, j + 3,
                         "called create");
      assert.deepEqual(res, [[{}, {}, {}]], "result");
    });
  });

  describe("prepare contexual IDs menu items", () => {
    const func = mjs.prepareContexualIdsMenuItems;

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "instance");
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "message");
      });
    });

    it("should not call function", async () => {
      const i = browser.menus.update.callCount;
      const res = await func("foo");
      assert.strictEqual(browser.menus.update.callCount, i, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function", async () => {
      const i = browser.menus.update.callCount;
      mjs.sidebar.contextualIds = [];
      const res = await func("foo");
      assert.strictEqual(browser.menus.update.callCount, i, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      mjs.sidebar.contextualIds = ["bar", "baz"];
      const res = await func("foo");
      assert.strictEqual(browser.menus.update.callCount, i + 2, "called");
      assert.deepEqual(res, [[undefined], [undefined]], "result");
    });
  });

  describe("prepare new tab menu items", () => {
    const func = mjs.prepareNewTabMenuItems;

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.update.callCount, i + 2, "called");
      assert.deepEqual(res, [[undefined], [undefined]], "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const body = document.querySelector("body");
      const res = await func(body);
      assert.strictEqual(browser.menus.update.callCount, i + 2, "called");
      assert.deepEqual(res, [[undefined], [undefined]], "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.id = NEW_TAB;
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(browser.menus.update.callCount, i + 2, "called");
      assert.deepEqual(res, [[undefined], [undefined], []], "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.id = NEW_TAB;
      body.appendChild(elm);
      mjs.sidebar.contextualIds = ["foo"];
      const res = await func(elm);
      assert.strictEqual(browser.menus.update.callCount, i + 3, "called");
      assert.deepEqual(res, [[undefined], [undefined], [[undefined]]],
                       "result");
    });
  });

  describe("prepare page menu items", () => {
    const func = mjs.preparePageMenuItems;

    it("should not call function", async () => {
      const i = browser.menus.update.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.update.callCount, i, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const res = await func({
        allTabsLength: 2,
        allTabsSelected: false,
        isTab: true,
      });
      assert.strictEqual(browser.menus.update.callCount, i + 3, "called");
      assert.deepEqual(res, [[undefined], [undefined], [undefined]], "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      mjs.sidebar.lastClosedTab = {};
      const res = await func({
        allTabsLength: 2,
        allTabsSelected: false,
        isTab: true,
      });
      assert.strictEqual(browser.menus.update.callCount, i + 3, "called");
      assert.deepEqual(res, [[undefined], [undefined], [undefined]], "result");
    });
  });

  describe("prepare tab group menu items", () => {
    const func = mjs.prepareTabGroupMenuItems;

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.update.callCount, i + 1, "called");
      assert.deepEqual(res, [[undefined]], "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(browser.menus.update.callCount, i + 1, "called");
      assert.deepEqual(res, [[undefined]], "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      body.appendChild(elm);
      mjs.sidebar.enableTabGroup = false;
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: false,
        pinned: false,
      });
      assert.strictEqual(browser.menus.update.callCount, i + 1, "called");
      assert.deepEqual(res, [[undefined]], "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: false,
        pinned: false,
      });
      assert.strictEqual(browser.menus.update.callCount, i + 12, "called");
      assert.deepEqual(res.length, 12, "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: false,
        pinned: false,
      });
      assert.strictEqual(browser.menus.update.callCount, i + 12, "called");
      assert.deepEqual(res.length, 12, "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement("div");
      const parent2 = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const elm4 = document.createElement("p");
      const body = document.querySelector("body");
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: false,
        pinned: false,
      });
      assert.strictEqual(browser.menus.update.callCount, i + 12, "called");
      assert.deepEqual(res.length, 12, "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(HIGHLIGHTED);
      elm2.classList.add(HIGHLIGHTED);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: true,
        pinned: false,
      });
      assert.strictEqual(browser.menus.update.callCount, i + 12, "called");
      assert.deepEqual(res.length, 12, "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(HIGHLIGHTED);
      elm2.classList.add(HIGHLIGHTED);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: true,
        pinned: true,
      });
      assert.strictEqual(browser.menus.update.callCount, i + 12, "called");
      assert.deepEqual(res.length, 12, "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(HIGHLIGHTED);
      elm2.classList.add(HIGHLIGHTED);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: true,
        pinned: true,
      });
      assert.strictEqual(browser.menus.update.callCount, i + 12, "called");
      assert.deepEqual(res.length, 12, "result");
    });

    it("should call function", async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(HIGHLIGHTED);
      elm2.classList.add(HIGHLIGHTED);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      const res = await func(elm, {
        labelHidden: false,
        multiTabsSelected: true,
        pinned: true,
      });
      assert.strictEqual(browser.menus.update.callCount, i + 12, "called");
      assert.deepEqual(res.length, 12, "result");
    });
  });

  describe("prepare tab menu items", () => {
    const func = mjs.prepareTabMenuItems;
    beforeEach(() => {
      const pinned = document.createElement("section");
      const newTab = document.createElement("section");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(newTab);
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
      mjs.sidebar.incognito = false;
    });
    afterEach(() => {
      mjs.sidebar.windowId = null;
      mjs.sidebar.incognito = false;
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const res = await func();
      assert.strictEqual(browser.tabs.get.callCount, i, "not called");
      assert.strictEqual(browser.menus.update.callCount, j + 25, "called");
      assert.deepEqual(res.length, 23, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      const res = await func(body);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called get");
      assert.strictEqual(browser.menus.update.callCount, j + 25,
                         "called update");
      assert.strictEqual(res.length, 23, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.menus.update.callCount, j + 40,
                         "called update");
      assert.strictEqual(res.length, 28, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      const res = await func(elm1);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.menus.update.callCount, j + 40,
                         "called update");
      assert.strictEqual(res.length, 28, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      const res = await func(elm2);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.menus.update.callCount, j + 40,
                         "called update");
      assert.strictEqual(res.length, 28, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      const res = await func(elm3);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.menus.update.callCount, j + 40,
                         "called update");
      assert.strictEqual(res.length, 28, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      elm2.classList.add(HIGHLIGHTED);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      const res = await func(elm3);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.menus.update.callCount, j + 40,
                         "called update");
      assert.strictEqual(res.length, 28, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.menus.update.callCount, j + 40,
                         "called update");
      assert.strictEqual(res.length, 28, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      mjs.sidebar.enableTabGroup = false;
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.menus.update.callCount, j + 29,
                         "called update");
      assert.strictEqual(res.length, 28, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      mjs.sidebar.contextualIds = ["foo"];
      const res = await func(elm3);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.menus.update.callCount, j + 41,
                         "called update");
      assert.strictEqual(res.length, 28, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      mjs.sidebar.contextualIds = ["foo"];
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.menus.update.callCount, j + 41,
                         "called update");
      assert.strictEqual(res.length, 28, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.classList.add(CLASS_TAB_CONTAINER);
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.menus.update.callCount, j + 40,
                         "called update");
      assert.strictEqual(res.length, 28, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(CLASS_HEADING);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      body.insertBefore(sect, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      const res = await func(elm1);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called get");
      assert.strictEqual(browser.menus.update.callCount, j + 35,
                         "called update");
      assert.strictEqual(res.length, 22, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(CLASS_HEADING);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      body.insertBefore(sect, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      const res = await func(elm2);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.menus.update.callCount, j + 40,
                         "called update");
      assert.strictEqual(res.length, 28, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(CLASS_HEADING);
      elm1.hidden = true;
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      body.insertBefore(sect, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.menus.update.resolves(undefined);
      const res = await func(elm2);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.menus.update.callCount, j + 40,
                         "called update");
      assert.strictEqual(res.length, 28, "result");
    });
  });

  describe("handle event", () => {
    const func = mjs.handleEvt;
    beforeEach(() => {
      const pinned = document.createElement("section");
      const newTab = document.createElement("section");
      const body = document.querySelector("body");
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(newTab);
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
      mjs.sidebar.incognito = false;
    });
    afterEach(() => {
      mjs.sidebar.windowId = null;
      mjs.sidebar.incognito = false;
    });

    it("should throw", () => {
      assert.throws(() => func());
    });

    it("should not call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const body = document.querySelector("body");
      browser.menus.update.resolves(undefined);
      const evt = {
        target: body,
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called get");
      assert.strictEqual(browser.menus.update.callCount, j,
                         "not called update");
      assert.deepEqual(res, [], "result");
    });

    it("should not call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      const evt = {
        ctrlKey: true,
        key: "c",
        target: body,
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called get");
      assert.strictEqual(browser.tabs.query.callCount, j, "not called query");
      assert.strictEqual(browser.tabs.highlight.callCount, k,
                         "not called highlight");
      assert.deepEqual(res, [], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.query.resolves([{
        index: 1,
      }]);
      browser.tabs.highlight.resolves({});
      const evt = {
        ctrlKey: true,
        key: "a",
        target: body,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub(),
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called get");
      assert.strictEqual(browser.tabs.query.callCount, j + 1, "called query");
      assert.strictEqual(browser.tabs.highlight.callCount, k + 1,
                         "called highlight");
      assert.deepEqual(res, [{}], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.query.resolves([{
        index: 1,
      }]);
      browser.tabs.highlight.resolves({});
      const evt = {
        ctrlKey: true,
        key: "a",
        target: elm,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub(),
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called get");
      assert.strictEqual(browser.tabs.query.callCount, j + 1, "called query");
      assert.strictEqual(browser.tabs.highlight.callCount, k + 1,
                         "called highlight");
      assert.deepEqual(res, [{}], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.query.resolves([{
        index: 1,
      }]);
      browser.tabs.highlight.resolves({});
      mjs.sidebar.isMac = true;
      const evt = {
        metaKey: true,
        key: "a",
        target: body,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub(),
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called get");
      assert.strictEqual(browser.tabs.query.callCount, j + 1, "called query");
      assert.strictEqual(browser.tabs.highlight.callCount, k + 1,
                         "called highlight");
      assert.deepEqual(res, [{}], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      const evt = {
        shiftKey: true,
        key: "F10",
        target: body,
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called get");
      assert.strictEqual(browser.tabs.query.callCount, j, "not called query");
      assert.strictEqual(browser.tabs.highlight.callCount, k,
                         "not called highlight");
      assert.deepEqual(res.length, 2, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false,
        },
        pinned: true,
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true,
        },
        pinned: false,
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false,
        },
        pinned: false,
      });
      const evt = {
        shiftKey: true,
        key: "F10",
        target: elm,
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, "called get");
      assert.strictEqual(browser.tabs.query.callCount, j, "not called query");
      assert.strictEqual(browser.tabs.highlight.callCount, k,
                         "not called highlight");
      assert.deepEqual(res.length, 2, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      const evt = {
        key: "ContextMenu",
        target: body,
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called get");
      assert.strictEqual(browser.tabs.query.callCount, j, "not called query");
      assert.strictEqual(browser.tabs.highlight.callCount, k,
                         "not called highlight");
      assert.deepEqual(res.length, 2, "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement("section");
      const sect2 = document.createElement("section");
      const elm = document.createElement("div");
      const elm1 = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = "2";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "3";
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "4";
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      const evt = {
        button: 2,
        target: body,
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called get");
      assert.strictEqual(browser.tabs.query.callCount, j, "not called query");
      assert.strictEqual(browser.tabs.highlight.callCount, k,
                         "not called highlight");
      assert.deepEqual(res.length, 2, "result");
    });
  });

  describe("handle contextmenu event", () => {
    const func = mjs.handleContextmenuEvt;
    beforeEach(() => {
      if (typeof browser.menus.overrideContext !== "function") {
        browser.menus.overrideContext = sinon.stub();
      }
    });

    it("should throw", () => {
      assert.throws(() => func());
    });

    it("should not call function", async () => {
      const i = browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: "tab",
      }).callCount;
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.dataset.tabId = browser.tabs.TAB_ID_NONE.toString();
      elm.classList.add(TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func({
        target: elm,
      });
      assert.strictEqual(browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: "tab",
      }).callCount, i, "not called");
      assert.isUndefined(res, "result");
    });

    it("should call function", async () => {
      const i = browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: "tab",
      }).callCount;
      const parent = document.createElement("div");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.dataset.tabId = "1";
      elm.classList.add(TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func({
        target: elm,
      });
      assert.strictEqual(browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: "tab",
      }).callCount, i + 1, "called");
      assert.isUndefined(res, "result");
    });

    it("should call function", async () => {
      const i = browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: "tab",
      }).callCount;
      const parent = document.createElement("div");
      const heading = document.createElement("p");
      const elm = document.createElement("p");
      const body = document.querySelector("body");
      elm.dataset.tabId = "1";
      elm.classList.add(TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(heading);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func({
        target: heading,
      });
      assert.strictEqual(browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: "tab",
      }).callCount, i + 1, "called");
      assert.isUndefined(res, "result");
    });
  });

  describe("handle wheel event", () => {
    const func = mjs.handleWheelEvt;

    it("should throws", () => {
      assert.throws(() => func());
    });

    it("should not prevent default", () => {
      const main = document.createElement("main");
      const body = document.querySelector("body");
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 123;
      main.clientHeight = 120;
      const evt = {
        deltaY: 3,
        preventDefault: sinon.stub(),
      };
      const res = func(evt);
      assert.isTrue(evt.preventDefault.notCalled, "not called");
      assert.isNull(res, "result");
    });

    it("should not prevent default", () => {
      const main = document.createElement("main");
      const body = document.querySelector("body");
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 120;
      main.clientHeight = 120;
      const evt = {
        deltaY: 3,
        preventDefault: sinon.stub(),
      };
      const res = func(evt);
      assert.isTrue(evt.preventDefault.notCalled, "not called");
      assert.isNull(res, "result");
    });

    it("should not prevent default", async () => {
      const main = document.createElement("main");
      const body = document.querySelector("body");
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 120;
      main.clientHeight = 120;
      mjs.sidebar.switchTabByScrolling = true;
      const evt = {
        preventDefault: sinon.stub(),
      };
      const res = await func(evt);
      assert.isTrue(evt.preventDefault.notCalled, "not called");
      assert.isNull(res, "result");
    });

    it("should prevent default and call function", async () => {
      const main = document.createElement("main");
      const body = document.querySelector("body");
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 120;
      main.clientHeight = 120;
      mjs.sidebar.switchTabByScrolling = true;
      browser.tabs.query.resolves([{id: 1}]);
      const evt = {
        deltaY: 3,
        preventDefault: sinon.stub(),
      };
      const res = await func(evt);
      assert.isTrue(evt.preventDefault.calledOnce, "called");
      assert.isTrue(browser.tabs.query.calledOnce, "called");
      assert.isNull(res, "result");
    });
  });

  describe("handle runtime message", () => {
    const func = mjs.handleMsg;

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

    it("should not call function", async () => {
      const msg = {
        [EXT_INIT]: false,
      };
      const res = await func(msg);
      assert.deepEqual(res, [], "result");
    });

    it("should not call function", async () => {
      const msg = {
        [THEME_CUSTOM_INIT]: false,
      };
      const res = await func(msg);
      assert.deepEqual(res, [], "result");
    });

    it("should not call function", async () => {
      const msg = {
        [THEME_CUSTOM_REQ]: false,
      };
      const res = await func(msg);
      assert.deepEqual(res, [], "result");
    });

    it("should call function", async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.getCurrent.callCount;
      const k = browser.sessions.getWindowValue.callCount;
      const l = browser.sessions.setWindowValue.callCount;
      const sect = document.createElement("section");
      const div = document.createElement("div");
      const body = document.querySelector("body");
      sect.classList.add(CLASS_TAB_CONTAINER);
      div.classList.add(TAB);
      div.dataset.tabId = "1";
      div.dataset.tab = JSON.stringify({
        index: 0,
        url: "https://example.com",
      });
      const span = document.createElement("span");
      span.classList.add("tab-context");
      span.setAttribute("title", "");
      const img = document.createElement("img");
      img.classList.add("tab-toggle-icon");
      img.src = "";
      img.alt = "";
      span.appendChild(img);
      div.appendChild(span);
      const span2 = document.createElement("span");
      span2.classList.add("tab-content");
      span2.setAttribute("title", "");
      const img2 = document.createElement("img");
      img2.classList.add("tab-icon");
      img2.src = "";
      img2.alt = "";
      img2.dataset.connecting = "";
      span2.appendChild(img2);
      const span2_1 = document.createElement("span");
      span2_1.classList.add("tab-title");
      span2.appendChild(span2_1);
      div.appendChild(span2);
      const span3 = document.createElement("span");
      span3.classList.add("tab-audio");
      span3.setAttribute("title", "");
      const img3 = document.createElement("img");
      img3.classList.add("tab-audio-icon");
      img3.src = "";
      img3.alt = "";
      span3.appendChild(img3);
      div.appendChild(span3);
      const span4 = document.createElement("span");
      span4.classList.add("tab-ident");
      span4.setAttribute("title", "");
      const img4 = document.createElement("img");
      img4.classList.add("tab-ident-icon");
      img4.src = "";
      img4.alt = "";
      span4.appendChild(img4);
      div.appendChild(span4);
      const span5 = document.createElement("span");
      span5.classList.add("tab-close");
      span5.setAttribute("title", "");
      const img5 = document.createElement("img");
      img5.classList.add("tab-close-icon");
      img5.src = "";
      img5.alt = "";
      span5.appendChild(img5);
      div.appendChild(span5);
      const span6 = document.createElement("span");
      span6.classList.add("tab-pinned");
      const img6 = document.createElement("img");
      img6.classList.add("tab-pinned-icon");
      img6.src = "";
      img6.alt = "";
      span6.appendChild(img6);
      div.appendChild(span6);
      sect.appendChild(div);
      body.appendChild(sect);
      browser.tabs.get.withArgs(1).resolves({
        status: "complete",
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false,
      });
      const msg = {
        [EXT_INIT]: true,
      };
      const res = await func(msg);
      assert.strictEqual(browser.tabs.get.callCount, i, "not called get");
      assert.strictEqual(browser.windows.getCurrent.callCount, j,
                         "not called windows get current");
      assert.strictEqual(browser.sessions.getWindowValue.callCount, k,
                         "not called sessions get");
      assert.strictEqual(browser.sessions.setWindowValue.callCount, l + 1,
                         "called sessions set");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should call function", async () => {
      const msg = {
        [THEME_CUSTOM_INIT]: true,
      };
      const res = await func(msg);
      assert.deepEqual(res, [null], "result");
    });

    it("should call function", async () => {
      const msg = {
        [THEME_CUSTOM_REQ]: true,
      };
      const res = await func(msg);
      assert.deepEqual(res, [null], "result");
    });
  });

  describe("requestSidebarStateUpdate", () => {
    const func = mjs.requestSidebarStateUpdate;

    it("should not call function", async () => {
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
      });
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.windows.getCurrent.callCount;
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
                         "not called");
      assert.strictEqual(browser.windows.getCurrent.callCount, j,
                         "not called");
      assert.isNull(res, "result");
    });

    it("should not call function", async () => {
      browser.windows.getCurrent.resolves({
        focused: false,
        id: 1,
        type: "normal",
      });
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.windows.getCurrent.callCount;
      mjs.sidebar.windowId = 1;
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
                         "not called");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called");
      assert.isNull(res, "result");
    });

    it("should not call function", async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 2,
        type: "normal",
      });
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.windows.getCurrent.callCount;
      mjs.sidebar.windowId = 1;
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
                         "not called");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called");
      assert.isNull(res, "result");
    });

    it("should not call function", async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        type: "popup",
      });
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.windows.getCurrent.callCount;
      mjs.sidebar.windowId = 1;
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
                         "not called");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called");
      assert.isNull(res, "result");
    });

    it("should call function", async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        type: "normal",
      });
      browser.runtime.sendMessage.resolves(true);
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.windows.getCurrent.callCount;
      mjs.sidebar.windowId = 1;
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called");
      assert.isTrue(res, "result");
    });
  });

  describe("set variable", () => {
    const func = mjs.setVar;

    it("should not set variable", async () => {
      const res = await func();
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func("foo", {});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(CUSTOM_BG, {value: "#ff0000"});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(CUSTOM_BG_ACTIVE, {value: "#ff0000"});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(CUSTOM_BG_HOVER, {value: "#ff0000"});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(CUSTOM_BG_SELECT, {value: "#ff0000"});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(CUSTOM_BG_SELECT_HOVER, {value: "#ff0000"});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(CUSTOM_BORDER, {value: "#ff0000"});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(CUSTOM_BORDER_ACTIVE, {value: "#ff0000"});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(CUSTOM_COLOR, {value: "#ff0000"});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(CUSTOM_COLOR_ACTIVE, {value: "#ff0000"});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(CUSTOM_COLOR_HOVER, {value: "#ff0000"});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(CUSTOM_COLOR_SELECT, {value: "#ff0000"});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(CUSTOM_COLOR_SELECT_HOVER, {value: "#ff0000"});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(THEME_SCROLLBAR_NARROW, {checked: true});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(THEME_TAB_COMPACT, {checked: true});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(THEME_LIGHT, {checked: true});
      assert.deepEqual(res, [], "result");
    });

    it("should not set variable", async () => {
      const res = await func(THEME_DARK, {checked: true});
      assert.deepEqual(res, [], "result");
    });

    it("should set variable", async () => {
      const res = await func(CUSTOM_BG, {value: "#ff0000"}, true);
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const res = await func(CUSTOM_BG_ACTIVE, {value: "#ff0000"}, true);
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const res = await func(CUSTOM_BG_HOVER, {value: "#ff0000"}, true);
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const res = await func(CUSTOM_BG_SELECT, {value: "#ff0000"}, true);
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const res = await func(CUSTOM_BG_SELECT_HOVER, {value: "#ff0000"}, true);
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const res = await func(CUSTOM_BORDER, {value: "#ff0000"}, true);
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const res = await func(CUSTOM_BORDER_ACTIVE, {value: "#ff0000"}, true);
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const res = await func(CUSTOM_COLOR, {value: "#ff0000"}, true);
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const res = await func(CUSTOM_COLOR_ACTIVE, {value: "#ff0000"}, true);
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const res = await func(CUSTOM_COLOR_HOVER, {value: "#ff0000"}, true);
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const res = await func(CUSTOM_COLOR_SELECT, {value: "#ff0000"}, true);
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const res = await func(CUSTOM_COLOR_SELECT_HOVER, {value: "#ff0000"},
                             true);
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const body = document.querySelector("body");
      const res = await func(THEME_SCROLLBAR_NARROW, {checked: true}, true);
      assert.isTrue(body.classList.contains(CLASS_NARROW), "set");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const body = document.querySelector("body");
      const res = await func(THEME_TAB_COMPACT, {checked: true}, true);
      assert.isTrue(body.classList.contains(CLASS_COMPACT), "set");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const body = document.querySelector("body");
      const res = await func(THEME_LIGHT, {checked: true}, true);
      assert.isTrue(body.classList.contains(CLASS_THEME_LIGHT), "set");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const body = document.querySelector("body");
      const res = await func(THEME_DARK, {checked: true}, true);
      assert.isTrue(body.classList.contains(CLASS_THEME_DARK), "set");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const i = browser.browserSettings.closeTabsByDoubleClick.get.callCount;
      const j = browser.storage.local.set.callCount;
      browser.browserSettings.closeTabsByDoubleClick.get.returns({});
      const res = await func(BROWSER_SETTINGS_READ, {checked: false});
      assert.isFalse(mjs.sidebar.readBrowserSettings, "set");
      assert.strictEqual(
        browser.browserSettings.closeTabsByDoubleClick.get.callCount,
        i, "not called",
      );
      assert.strictEqual(browser.storage.local.set.callCount, j, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should set variable", async () => {
      const i = browser.browserSettings.closeTabsByDoubleClick.get.callCount;
      const j = browser.storage.local.set.callCount;
      browser.browserSettings.closeTabsByDoubleClick.get.returns({});
      const res = await func(BROWSER_SETTINGS_READ, {checked: true});
      assert.isTrue(mjs.sidebar.readBrowserSettings, "set");
      assert.strictEqual(
        browser.browserSettings.closeTabsByDoubleClick.get.callCount,
        i, "not called",
      );
      assert.strictEqual(browser.storage.local.set.callCount, j, "not called");
      assert.deepEqual(res, [], "result");
    });

    it("should set variable", async () => {
      const i = browser.browserSettings.closeTabsByDoubleClick.get.callCount;
      const j = browser.storage.local.set.callCount;
      browser.browserSettings.closeTabsByDoubleClick.get.returns({});
      const res = await func(BROWSER_SETTINGS_READ, {checked: true}, true);
      assert.isTrue(mjs.sidebar.readBrowserSettings, "set");
      assert.strictEqual(
        browser.browserSettings.closeTabsByDoubleClick.get.callCount,
        i + 1, "called",
      );
      assert.strictEqual(browser.storage.local.set.callCount, j + 1, "called");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const res = await func(TAB_CLOSE_DBLCLICK, {checked: true});
      assert.isTrue(mjs.sidebar.closeTabsByDoubleClick, "set");
      assert.deepEqual(res, [], "result");
    });

    it("should set variable", async () => {
      mjs.sidebar.tabGroupCollapseOther = true;
      const res = await func(TAB_CLOSE_DBLCLICK, {checked: false});
      assert.isFalse(mjs.sidebar.closeTabsByDoubleClick, "set");
      assert.deepEqual(res, [], "result");
    });

    it("should set variable", async () => {
      const res = await func(TAB_CLOSE_DBLCLICK, {checked: true}, true);
      assert.isTrue(mjs.sidebar.closeTabsByDoubleClick, "set");
      assert.deepEqual(res, [[]], "result");
    });

    it("should set variable", async () => {
      const res = await func(TAB_GROUP_ENABLE, {checked: true});
      assert.isTrue(mjs.sidebar.enableTabGroup, "set");
      assert.deepEqual(res, [], "result");
    });

    it("should set variable", async () => {
      const res = await func(TAB_GROUP_ENABLE, {checked: false});
      assert.isFalse(mjs.sidebar.enableTabGroup, "set");
      assert.deepEqual(res, [], "result");
    });

    it("should set variable", async () => {
      const res =
        await func(TAB_GROUP_ENABLE, {checked: true}, true);
      assert.isTrue(mjs.sidebar.enableTabGroup, "set");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should set variable", async () => {
      const res = await func(TAB_GROUP_EXPAND_COLLAPSE_OTHER, {checked: true});
      assert.isTrue(mjs.sidebar.tabGroupOnExpandCollapseOther, "set");
      assert.deepEqual(res, [], "result");
    });

    it("should set variable", async () => {
      mjs.sidebar.tabGroupCollapseOther = true;
      const res = await func(TAB_GROUP_EXPAND_COLLAPSE_OTHER, {checked: false});
      assert.isFalse(mjs.sidebar.tabGroupOnExpandCollapseOther, "set");
      assert.deepEqual(res, [], "result");
    });

    it("should set variable", async () => {
      const res =
        await func(TAB_GROUP_EXPAND_COLLAPSE_OTHER, {checked: true}, true);
      assert.isTrue(mjs.sidebar.tabGroupOnExpandCollapseOther, "set");
      assert.deepEqual(res, [[]], "result");
    });

    it("should set variable", async () => {
      const res = await func(TAB_GROUP_NEW_TAB_AT_END, {checked: true});
      assert.isTrue(mjs.sidebar.tabGroupPutNewTabAtTheEnd, "set");
      assert.deepEqual(res, [], "result");
    });

    it("should set variable", async () => {
      mjs.sidebar.tabGroupPutNewTabAtTheEnd = true;
      const res = await func(TAB_GROUP_NEW_TAB_AT_END, {checked: false});
      assert.isFalse(mjs.sidebar.tabGroupPutNewTabAtTheEnd, "set");
      assert.deepEqual(res, [], "result");
    });
  });

  describe("set variables", () => {
    const func = mjs.setVars;

    it("should not set variables", async () => {
      const res = await func();
      assert.deepEqual(res, [], "result");
    });

    it("should set variables", async () => {
      const res = await func({
        tabGroupPutNewTabAtTheEnd: {
          checked: true,
        },
      });
      assert.isTrue(mjs.sidebar.tabGroupPutNewTabAtTheEnd, "set");
      assert.deepEqual(res, [[]], "result");
    });
  });

  describe("restore highlighted tabs", () => {
    const func = mjs.restoreHighlightedTabs;

    it("should restore", async () => {
      const i = browser.tabs.query.callCount;
      const elm = document.createElement("p");
      const elm2 = document.createElement("p");
      const elm3 = document.createElement("p");
      const body = document.querySelector("body");
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = "3";
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        highlighted: true,
        windowType: "normal",
      }).returns([
        {id: 1},
        {id: 2},
      ]);
      await func();
      assert.strictEqual(browser.tabs.query.callCount, i + 1, "called");
      assert.isTrue(elm.classList.contains(HIGHLIGHTED), "class");
      assert.isTrue(elm2.classList.contains(HIGHLIGHTED), "class");
      assert.isFalse(elm3.classList.contains(HIGHLIGHTED), "class");
    });
  });

  describe("restore tab groups", () => {
    const func = mjs.restoreTabGroups;
    beforeEach(() => {
      const pinned = document.createElement("section");
      const heading = document.createElement("h1");
      const label = document.createElement("span");
      const newTab = document.createElement("section");
      const body = document.querySelector("body");
      label.classList.add(CLASS_HEADING_LABEL);
      heading.classList.add(CLASS_HEADING);
      heading.hidden = true;
      heading.appendChild(label);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      pinned.appendChild(heading);
      newTab.id = NEW_TAB;
      newTab.classList.add(CLASS_TAB_CONTAINER);
      body.appendChild(pinned);
      body.appendChild(newTab);
    });

    it("should not restore if session is undefined", async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement("section");
      const sect2 = document.createElement("section");
      const sect3 = document.createElement("section");
      const sect4 = document.createElement("section");
      const sect5 = document.createElement("section");
      const heading1 = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const heading3 = document.createElement("h1");
      const heading4 = document.createElement("h1");
      const heading5 = document.createElement("h1");
      const label1 = document.createElement("span");
      const label2 = document.createElement("span");
      const label3 = document.createElement("span");
      const label4 = document.createElement("span");
      const label5 = document.createElement("span");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const elm5 = document.createElement("div");
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      sect1.id = "sect1";
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = "sect2";
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = "sect3";
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = "sect4";
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = "sect5";
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: "https://example.com/baz",
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: "https://example.com/qux",
      });
      sect1.appendChild(elm);
      sect2.appendChild(elm2);
      sect3.appendChild(elm3);
      sect4.appendChild(elm4);
      sect5.appendChild(elm5);
      body.insertBefore(sect1, newTab);
      body.insertBefore(sect2, newTab);
      body.insertBefore(sect3, newTab);
      body.insertBefore(sect4, newTab);
      body.insertBefore(sect5, newTab);
      browser.sessions.getWindowValue.withArgs(winId, TAB_LIST)
        .resolves(undefined);
      browser.windows.getCurrent.resolves({
        id: winId,
      });
      const res = await func();
      const items = document.querySelectorAll(
        `.${CLASS_TAB_CONTAINER}:not(#${PINNED}):not(#${NEW_TAB})`,
      );
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        "called sessions get",
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called windows get current");
      for (const item of items) {
        assert.strictEqual(item.childElementCount, 2, "child");
      }
      assert.deepEqual(res, [], "result");
    });

    it("should not restore if recent tab list is undefined", async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement("section");
      const sect2 = document.createElement("section");
      const sect3 = document.createElement("section");
      const sect4 = document.createElement("section");
      const sect5 = document.createElement("section");
      const heading1 = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const heading3 = document.createElement("h1");
      const heading4 = document.createElement("h1");
      const heading5 = document.createElement("h1");
      const label1 = document.createElement("span");
      const label2 = document.createElement("span");
      const label3 = document.createElement("span");
      const label4 = document.createElement("span");
      const label5 = document.createElement("span");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const elm5 = document.createElement("div");
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      sect1.id = "sect1";
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = "sect2";
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = "sect3";
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = "sect4";
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = "sect5";
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: "https://example.com/baz",
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: "https://example.com/qux",
      });
      sect1.appendChild(elm);
      sect2.appendChild(elm2);
      sect3.appendChild(elm3);
      sect4.appendChild(elm4);
      sect5.appendChild(elm5);
      body.insertBefore(sect1, newTab);
      body.insertBefore(sect2, newTab);
      body.insertBefore(sect3, newTab);
      body.insertBefore(sect4, newTab);
      body.insertBefore(sect5, newTab);
      browser.sessions.getWindowValue
        .withArgs(winId, TAB_LIST).resolves(JSON.stringify({}));
      browser.windows.getCurrent.resolves({
        id: winId,
      });
      const res = await func();
      const items = document.querySelectorAll(
        `.${CLASS_TAB_CONTAINER}:not(#${PINNED}):not(#${NEW_TAB})`,
      );
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        "called sessions get",
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called windows get current");
      for (const item of items) {
        assert.strictEqual(item.childElementCount, 2, "child");
      }
      assert.deepEqual(res, [], "result");
    });

    it("should not restore if not grouped", async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement("section");
      const sect2 = document.createElement("section");
      const sect3 = document.createElement("section");
      const sect4 = document.createElement("section");
      const sect5 = document.createElement("section");
      const heading1 = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const heading3 = document.createElement("h1");
      const heading4 = document.createElement("h1");
      const heading5 = document.createElement("h1");
      const label1 = document.createElement("span");
      const label2 = document.createElement("span");
      const label3 = document.createElement("span");
      const label4 = document.createElement("span");
      const label5 = document.createElement("span");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const elm5 = document.createElement("div");
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      sect1.id = "sect1";
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = "sect2";
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = "sect3";
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = "sect4";
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = "sect5";
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: "https://example.com/baz",
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: "https://example.com/qux",
      });
      sect1.appendChild(elm);
      sect2.appendChild(elm2);
      sect3.appendChild(elm3);
      sect4.appendChild(elm4);
      sect5.appendChild(elm5);
      body.insertBefore(sect1, newTab);
      body.insertBefore(sect2, newTab);
      body.insertBefore(sect3, newTab);
      body.insertBefore(sect4, newTab);
      body.insertBefore(sect5, newTab);
      browser.sessions.getWindowValue.withArgs(winId, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            0: {
              collapsed: false,
              containerIndex: 0,
              url: "https://example.com",
            },
            1: {
              collapsed: false,
              containerIndex: 1,
              url: "https://example.com/foo",
            },
            2: {
              collapsed: false,
              containerIndex: 2,
              url: "https://example.com/bar",
            },
            3: {
              collapsed: false,
              containerIndex: 3,
              url: "https://example.com/baz",
            },
            4: {
              collapsed: false,
              containerIndex: 4,
              url: "https://example.com/qux",
            },
          },
        }));
      browser.windows.getCurrent.resolves({
        id: winId,
      });
      const res = await func();
      const items =
        document.querySelectorAll(
          `.${CLASS_TAB_CONTAINER}:not(#${PINNED}):not(#${NEW_TAB})`,
        );
      assert.strictEqual(browser.sessions.getWindowValue.callCount, i + 1,
                         "called sessions get");
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called windows get current");
      for (const item of items) {
        assert.strictEqual(item.childElementCount, 2, "child");
      }
      assert.deepEqual(res, [], "result");
    });

    it("should restore pinned tabs", async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const pinned = document.getElementById(PINNED);
      const sect1 = document.createElement("section");
      const sect2 = document.createElement("section");
      const sect3 = document.createElement("section");
      const sect4 = document.createElement("section");
      const sect5 = document.createElement("section");
      const heading1 = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const heading3 = document.createElement("h1");
      const heading4 = document.createElement("h1");
      const heading5 = document.createElement("h1");
      const label1 = document.createElement("span");
      const label2 = document.createElement("span");
      const label3 = document.createElement("span");
      const label4 = document.createElement("span");
      const label5 = document.createElement("span");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const elm5 = document.createElement("div");
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      sect1.id = "sect1";
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = "sect2";
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = "sect3";
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = "sect4";
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = "sect5";
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: true,
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: true,
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: true,
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: "https://example.com/baz",
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: "https://example.com/qux",
      });
      sect1.appendChild(elm);
      sect2.appendChild(elm2);
      sect3.appendChild(elm3);
      sect4.appendChild(elm4);
      sect5.appendChild(elm5);
      body.insertBefore(sect1, newTab);
      body.insertBefore(sect2, newTab);
      body.insertBefore(sect3, newTab);
      body.insertBefore(sect4, newTab);
      body.insertBefore(sect5, newTab);
      browser.sessions.getWindowValue.withArgs(winId, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            0: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com",
            },
            1: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com/foo",
            },
            2: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com/bar",
            },
            3: {
              collapsed: false,
              containerIndex: 1,
              url: "https://example.com/baz",
            },
            4: {
              collapsed: false,
              containerIndex: 2,
              url: "https://example.com/qux",
            },
          },
        }));
      browser.windows.getCurrent.resolves({
        id: winId,
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        "called sessions get",
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called windows get current");
      assert.strictEqual(pinned.childElementCount, 4, "pinned");
      assert.isFalse(pinned.classList.contains(CLASS_TAB_COLLAPSED), "false");
      assert.isFalse(pinned.querySelector(`.${CLASS_HEADING}`).hidden,
                     "heading");
      assert.strictEqual(sect1.childElementCount, 1, "empty section");
      assert.strictEqual(sect2.childElementCount, 1, "empty section");
      assert.strictEqual(sect3.childElementCount, 1, "empty section");
      assert.strictEqual(sect4.childElementCount, 2, "section");
      assert.strictEqual(sect5.childElementCount, 2, "section");
      assert.deepEqual(res, [undefined, undefined, undefined], "result");
    });

    it("should restore pinned tabs", async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const pinned = document.getElementById(PINNED);
      const sect1 = document.createElement("section");
      const sect2 = document.createElement("section");
      const sect3 = document.createElement("section");
      const sect4 = document.createElement("section");
      const sect5 = document.createElement("section");
      const heading1 = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const heading3 = document.createElement("h1");
      const heading4 = document.createElement("h1");
      const heading5 = document.createElement("h1");
      const label1 = document.createElement("span");
      const label2 = document.createElement("span");
      const label3 = document.createElement("span");
      const label4 = document.createElement("span");
      const label5 = document.createElement("span");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const elm5 = document.createElement("div");
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      sect1.id = "sect1";
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = "sect2";
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = "sect3";
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = "sect4";
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = "sect5";
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: true,
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: true,
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: true,
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: "https://example.com/baz",
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: "https://example.com/qux",
      });
      sect1.appendChild(elm);
      sect2.appendChild(elm2);
      sect3.appendChild(elm3);
      sect4.appendChild(elm4);
      sect5.appendChild(elm5);
      body.insertBefore(sect1, newTab);
      body.insertBefore(sect2, newTab);
      body.insertBefore(sect3, newTab);
      body.insertBefore(sect4, newTab);
      body.insertBefore(sect5, newTab);
      browser.sessions.getWindowValue.withArgs(winId, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            0: {
              collapsed: true,
              containerIndex: 0,
              headingLabel: "",
              headingShown: false,
              url: "https://example.com",
            },
            1: {
              collapsed: true,
              containerIndex: 0,
              headingLabel: "",
              headingShown: false,
              url: "https://example.com/foo",
            },
            2: {
              collapsed: true,
              containerIndex: 0,
              headingLabel: "",
              headingShown: false,
              url: "https://example.com/bar",
            },
            3: {
              collapsed: false,
              containerIndex: 1,
              url: "https://example.com/baz",
            },
            4: {
              collapsed: false,
              containerIndex: 2,
              url: "https://example.com/qux",
            },
          },
        }));
      browser.windows.getCurrent.resolves({
        id: winId,
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        "called sessions get",
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called windows get current");
      assert.strictEqual(pinned.childElementCount, 4, "pinned");
      assert.isTrue(pinned.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isTrue(pinned.querySelector(`.${CLASS_HEADING}`).hidden,
                    "heading");
      assert.strictEqual(sect1.childElementCount, 1, "empty section");
      assert.strictEqual(sect2.childElementCount, 1, "empty section");
      assert.strictEqual(sect3.childElementCount, 1, "empty section");
      assert.strictEqual(sect4.childElementCount, 2, "section");
      assert.strictEqual(sect5.childElementCount, 2, "section");
      assert.deepEqual(res, [undefined, undefined, undefined], "result");
    });

    it("should restore group", async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement("section");
      const sect2 = document.createElement("section");
      const sect3 = document.createElement("section");
      const sect4 = document.createElement("section");
      const sect5 = document.createElement("section");
      const heading1 = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const heading3 = document.createElement("h1");
      const heading4 = document.createElement("h1");
      const heading5 = document.createElement("h1");
      const label1 = document.createElement("span");
      const label2 = document.createElement("span");
      const label3 = document.createElement("span");
      const label4 = document.createElement("span");
      const label5 = document.createElement("span");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const elm5 = document.createElement("div");
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      sect1.id = "sect1";
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = "sect2";
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = "sect3";
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = "sect4";
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = "sect5";
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: "https://example.com/baz",
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: "https://example.com/bar",
      });
      sect1.appendChild(elm);
      sect2.appendChild(elm2);
      sect3.appendChild(elm3);
      sect4.appendChild(elm4);
      sect5.appendChild(elm5);
      body.insertBefore(sect1, newTab);
      body.insertBefore(sect2, newTab);
      body.insertBefore(sect3, newTab);
      body.insertBefore(sect4, newTab);
      body.insertBefore(sect5, newTab);
      browser.sessions.getWindowValue.withArgs(winId, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            0: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com",
            },
            1: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com/foo",
            },
            2: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com/bar",
            },
            3: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: "bar",
              headingShown: true,
              url: "https://example.com/baz",
            },
            4: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: "bar",
              headingShown: true,
              url: "https://example.com/bar",
            },
          },
        }));
      browser.windows.getCurrent.resolves({
        id: winId,
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        "called sessions get",
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called windows get current");
      assert.strictEqual(sect1.childElementCount, 4, "section");
      assert.isFalse(sect1.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isFalse(sect1.querySelector(`.${CLASS_HEADING}`).hidden,
                     "heading");
      assert.strictEqual(sect2.childElementCount, 1, "empty section");
      assert.strictEqual(sect3.childElementCount, 1, "empty section");
      assert.strictEqual(sect4.childElementCount, 3, "section");
      assert.isTrue(sect4.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isFalse(sect4.querySelector(`.${CLASS_HEADING}`).hidden,
                     "heading");
      assert.strictEqual(sect5.childElementCount, 1, "empty section");
      assert.deepEqual(res, [undefined, undefined, undefined], "result");
    });

    it("should restore group, case: tab added", async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement("section");
      const sect2 = document.createElement("section");
      const sect3 = document.createElement("section");
      const sect4 = document.createElement("section");
      const sect5 = document.createElement("section");
      const heading1 = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const heading3 = document.createElement("h1");
      const heading4 = document.createElement("h1");
      const heading5 = document.createElement("h1");
      const label1 = document.createElement("span");
      const label2 = document.createElement("span");
      const label3 = document.createElement("span");
      const label4 = document.createElement("span");
      const label5 = document.createElement("span");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const elm5 = document.createElement("div");
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      sect1.id = "sect1";
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = "sect2";
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = "sect3";
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = "sect4";
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = "sect5";
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: "https://example.com/baz",
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: "https://example.com/bar",
      });
      sect1.appendChild(elm);
      sect2.appendChild(elm2);
      sect3.appendChild(elm3);
      sect4.appendChild(elm4);
      sect5.appendChild(elm5);
      body.insertBefore(sect1, newTab);
      body.insertBefore(sect2, newTab);
      body.insertBefore(sect3, newTab);
      body.insertBefore(sect4, newTab);
      body.insertBefore(sect5, newTab);
      browser.sessions.getWindowValue.withArgs(winId, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            0: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com",
            },
            1: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com/foo",
            },
            2: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: "bar",
              headingShown: true,
              url: "https://example.com/baz",
            },
            3: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: "bar",
              headingShown: true,
              url: "https://example.com/bar",
            },
          },
        }));
      browser.windows.getCurrent.resolves({
        id: winId,
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        "called sessions get",
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called windows get current");
      assert.strictEqual(sect1.childElementCount, 3, "section");
      assert.isFalse(sect1.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isFalse(sect1.querySelector(`.${CLASS_HEADING}`).hidden,
                     "heading");
      assert.strictEqual(sect2.childElementCount, 1, "empty section");
      assert.strictEqual(sect3.childElementCount, 2, "empty section");
      assert.strictEqual(sect4.childElementCount, 3, "section");
      assert.isTrue(sect4.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isFalse(sect4.querySelector(`.${CLASS_HEADING}`).hidden,
                     "heading");
      assert.strictEqual(sect5.childElementCount, 1, "empty section");
      assert.deepEqual(res, [undefined, undefined], "result");
    });

    it("should restore group, case: tab removed", async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement("section");
      const sect2 = document.createElement("section");
      const sect4 = document.createElement("section");
      const sect5 = document.createElement("section");
      const heading1 = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const heading4 = document.createElement("h1");
      const heading5 = document.createElement("h1");
      const label1 = document.createElement("span");
      const label2 = document.createElement("span");
      const label4 = document.createElement("span");
      const label5 = document.createElement("span");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm4 = document.createElement("div");
      const elm5 = document.createElement("div");
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      sect1.id = "sect1";
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = "sect2";
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect4.id = "sect4";
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = "sect5";
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: "https://example.com/foo",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: "https://example.com/baz",
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: "https://example.com/bar",
      });
      sect1.appendChild(elm);
      sect2.appendChild(elm2);
      sect4.appendChild(elm4);
      sect5.appendChild(elm5);
      body.insertBefore(sect1, newTab);
      body.insertBefore(sect2, newTab);
      body.insertBefore(sect4, newTab);
      body.insertBefore(sect5, newTab);
      browser.sessions.getWindowValue.withArgs(winId, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            0: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com",
            },
            1: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com/foo",
            },
            2: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com/bar",
            },
            3: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: "bar",
              headingShown: true,
              url: "https://example.com/baz",
            },
            4: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: "bar",
              headingShown: true,
              url: "https://example.com/bar",
            },
          },
        }));
      browser.windows.getCurrent.resolves({
        id: winId,
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        "called sessions get",
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called windows get current");
      assert.strictEqual(sect1.childElementCount, 3, "section");
      assert.isFalse(sect1.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isFalse(sect1.querySelector(`.${CLASS_HEADING}`).hidden,
                     "heading");
      assert.strictEqual(sect2.childElementCount, 1, "empty section");
      assert.strictEqual(sect4.childElementCount, 3, "section");
      assert.isTrue(sect4.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isFalse(sect4.querySelector(`.${CLASS_HEADING}`).hidden,
                     "heading");
      assert.strictEqual(sect5.childElementCount, 1, "empty section");
      assert.deepEqual(res, [undefined, undefined], "result");
    });

    it("should restore group, case: tab moved", async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement("section");
      const sect2 = document.createElement("section");
      const sect3 = document.createElement("section");
      const sect4 = document.createElement("section");
      const sect5 = document.createElement("section");
      const heading1 = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const heading3 = document.createElement("h1");
      const heading4 = document.createElement("h1");
      const heading5 = document.createElement("h1");
      const label1 = document.createElement("span");
      const label2 = document.createElement("span");
      const label3 = document.createElement("span");
      const label4 = document.createElement("span");
      const label5 = document.createElement("span");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const elm5 = document.createElement("div");
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      sect1.id = "sect1";
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = "sect2";
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = "sect3";
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = "sect4";
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = "sect5";
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: "https://example.com/baz",
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: "https://example.com/bar",
      });
      sect1.appendChild(elm);
      sect2.appendChild(elm2);
      sect3.appendChild(elm3);
      sect4.appendChild(elm4);
      sect5.appendChild(elm5);
      body.insertBefore(sect1, newTab);
      body.insertBefore(sect3, newTab);
      body.insertBefore(sect4, newTab);
      body.insertBefore(sect5, newTab);
      body.insertBefore(sect2, newTab);
      browser.sessions.getWindowValue.withArgs(winId, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            0: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com",
            },
            1: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com/foo",
            },
            2: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com/bar",
            },
            3: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: "bar",
              headingShown: true,
              url: "https://example.com/baz",
            },
            4: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: "bar",
              headingShown: true,
              url: "https://example.com/bar",
            },
          },
        }));
      browser.windows.getCurrent.resolves({
        id: winId,
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        "called sessions get",
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called windows get current");
      assert.strictEqual(sect1.childElementCount, 2, "section");
      assert.strictEqual(sect3.childElementCount, 2, "section");
      assert.strictEqual(sect4.childElementCount, 3, "section");
      assert.isTrue(sect4.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isFalse(sect4.querySelector(`.${CLASS_HEADING}`).hidden,
                     "heading");
      assert.strictEqual(sect5.childElementCount, 1, "empty section");
      assert.strictEqual(sect2.childElementCount, 2, "section");
      assert.deepEqual(res, [undefined], "result");
    });

    it("should restore group, case: grouped tabs moved ", async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement("section");
      const sect2 = document.createElement("section");
      const sect3 = document.createElement("section");
      const sect4 = document.createElement("section");
      const sect5 = document.createElement("section");
      const heading1 = document.createElement("h1");
      const heading2 = document.createElement("h1");
      const heading3 = document.createElement("h1");
      const heading4 = document.createElement("h1");
      const heading5 = document.createElement("h1");
      const label1 = document.createElement("span");
      const label2 = document.createElement("span");
      const label3 = document.createElement("span");
      const label4 = document.createElement("span");
      const label5 = document.createElement("span");
      const elm = document.createElement("div");
      const elm2 = document.createElement("div");
      const elm3 = document.createElement("div");
      const elm4 = document.createElement("div");
      const elm5 = document.createElement("div");
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector("body");
      sect1.id = "sect1";
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = "sect2";
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = "sect3";
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = "sect4";
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = "sect5";
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = "1";
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: "https://example.com",
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = "2";
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: "https://example.com/foo",
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = "3";
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: "https://example.com/bar",
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = "4";
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: "https://example.com/baz",
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = "5";
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: "https://example.com/bar",
      });
      sect1.appendChild(elm);
      sect2.appendChild(elm2);
      sect3.appendChild(elm3);
      sect4.appendChild(elm4);
      sect5.appendChild(elm5);
      body.insertBefore(sect4, newTab);
      body.insertBefore(sect5, newTab);
      body.insertBefore(sect1, newTab);
      body.insertBefore(sect2, newTab);
      body.insertBefore(sect3, newTab);
      browser.sessions.getWindowValue.withArgs(winId, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            0: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com",
            },
            1: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com/foo",
            },
            2: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: "foo",
              headingShown: true,
              url: "https://example.com/bar",
            },
            3: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: "",
              headingShown: false,
              url: "https://example.com/baz",
            },
            4: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: "",
              headingShown: false,
              url: "https://example.com/bar",
            },
          },
        }));
      browser.windows.getCurrent.resolves({
        id: winId,
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        "called sessions get",
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
                         "called windows get current");
      assert.strictEqual(sect4.childElementCount, 3, "section");
      assert.isTrue(sect4.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isTrue(sect4.querySelector(`.${CLASS_HEADING}`).hidden,
                    "heading");
      assert.strictEqual(sect5.childElementCount, 1, "empty section");
      assert.strictEqual(sect1.childElementCount, 4, "section");
      assert.isFalse(sect1.classList.contains(CLASS_TAB_COLLAPSED), "class");
      assert.isFalse(sect1.querySelector(`.${CLASS_HEADING}`).hidden,
                     "heading");
      assert.strictEqual(sect2.childElementCount, 1, "empty section");
      assert.strictEqual(sect3.childElementCount, 1, "empty section");
      assert.deepEqual(res, [undefined, undefined, undefined], "result");
    });
  });

  describe("emulate tabs in order", () => {
    const func = mjs.emulateTabsInOrder;
    beforeEach(() => {
      const body = document.querySelector("body");
      const tmpl = document.createElement("template");
      tmpl.id = "tab-container-template";
      const sect = document.createElement("section");
      sect.classList.add("tab-container");
      sect.dataset.tabControls = "";
      sect.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(sect);
      body.appendChild(tmpl);
      const tmpl2 = document.createElement("template");
      tmpl2.id = "tab-template";
      const div = document.createElement("div");
      div.classList.add("tab");
      div.draggable = true;
      div.dataset.tabId = "";
      div.dataset.tab = "";
      const span = document.createElement("span");
      span.classList.add("tab-context");
      span.setAttribute("title", "");
      const img = document.createElement("img");
      img.classList.add("tab-toggle-icon");
      img.src = "";
      img.alt = "";
      span.appendChild(img);
      div.appendChild(span);
      const span2 = document.createElement("span");
      span2.classList.add("tab-content");
      span2.setAttribute("title", "");
      const img2 = document.createElement("img");
      img2.classList.add("tab-icon");
      img2.src = "";
      img2.alt = "";
      img2.dataset.connecting = "";
      span2.appendChild(img2);
      const span2_1 = document.createElement("span");
      span2_1.classList.add("tab-title");
      span2.appendChild(span2_1);
      div.appendChild(span2);
      const span3 = document.createElement("span");
      span3.classList.add("tab-audio");
      span3.setAttribute("title", "");
      const img3 = document.createElement("img");
      img3.classList.add("tab-audio-icon");
      img3.src = "";
      img3.alt = "";
      span3.appendChild(img3);
      div.appendChild(span3);
      const span4 = document.createElement("span");
      span4.classList.add("tab-ident");
      span4.setAttribute("title", "");
      const img4 = document.createElement("img");
      img4.classList.add("tab-ident-icon");
      img4.src = "";
      img4.alt = "";
      span4.appendChild(img4);
      div.appendChild(span4);
      const span5 = document.createElement("span");
      span5.classList.add("tab-close");
      span5.setAttribute("title", "");
      const img5 = document.createElement("img");
      img5.classList.add("tab-close-icon");
      img5.src = "";
      img5.alt = "";
      span5.appendChild(img5);
      div.appendChild(span5);
      const span6 = document.createElement("span");
      span6.classList.add("tab-pinned");
      const img6 = document.createElement("img");
      img6.classList.add("tab-pinned-icon");
      img6.src = "";
      img6.alt = "";
      span6.appendChild(img6);
      div.appendChild(span6);
      tmpl2.content.appendChild(div);
      body.appendChild(tmpl2);
      const pinned = document.createElement("section");
      pinned.id = PINNED;
      body.appendChild(pinned);
      const newTab = document.createElement("section");
      newTab.id = NEW_TAB;
      body.appendChild(newTab);
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should throw", async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, "instance");
        assert.strictEqual(e.message, "Expected Array but got Undefined.",
                           "message");
      });
    });

    it("should create tabs in order", async () => {
      const arr = [
        {
          active: false,
          audible: false,
          cookieStoreId: COOKIE_STORE_DEFAULT,
          id: 1,
          index: 0,
          pinned: false,
          status: "complete",
          title: "foo",
          url: "https://example.com",
          windowId: browser.windows.WINDOW_ID_CURRENT,
          mutedInfo: {
            muted: false,
          },
        },
      ];
      await func(arr);
      const items = document.querySelectorAll(TAB_QUERY);
      assert.strictEqual(items.length, 1, "created");
      assert.strictEqual(items[0].textContent, "foo", "title");
    });

    it("should create tabs in order", async () => {
      const arr = [
        {
          active: false,
          audible: false,
          cookieStoreId: COOKIE_STORE_DEFAULT,
          id: 1,
          index: 0,
          pinned: false,
          status: "complete",
          title: "foo",
          url: "https://example.com",
          windowId: browser.windows.WINDOW_ID_CURRENT,
          mutedInfo: {
            muted: false,
          },
        },
        {
          active: false,
          audible: false,
          cookieStoreId: COOKIE_STORE_DEFAULT,
          id: 2,
          index: 1,
          pinned: false,
          status: "complete",
          title: "bar",
          url: "https://www.example.com",
          windowId: browser.windows.WINDOW_ID_CURRENT,
          mutedInfo: {
            muted: false,
          },
        },
      ];
      await func(arr);
      const items = document.querySelectorAll(TAB_QUERY);
      // NOTE: temporary skipping assertation in travis. Bug in JSDOM?
      if (IS_WIN) {
        assert.strictEqual(items.length, 2, "created");
        assert.strictEqual(items[1].textContent, "bar", "title");
      }
      assert.strictEqual(items[0].textContent, "foo", "title");
    });
  });

  describe("emulate tabs in sidebar", () => {
    const func = mjs.emulateTabs;
    beforeEach(() => {
      const body = document.querySelector("body");
      const tmpl = document.createElement("template");
      tmpl.id = "tab-container-template";
      const sect = document.createElement("section");
      sect.classList.add("tab-container");
      sect.dataset.tabControls = "";
      sect.setAttribute("hidden", "hidden");
      tmpl.content.appendChild(sect);
      body.appendChild(tmpl);
      const tmpl2 = document.createElement("template");
      tmpl2.id = "tab-template";
      const div = document.createElement("div");
      div.classList.add("tab");
      div.draggable = true;
      div.dataset.tabId = "";
      div.dataset.tab = "";
      const span = document.createElement("span");
      span.classList.add("tab-context");
      span.setAttribute("title", "");
      const img = document.createElement("img");
      img.classList.add("tab-toggle-icon");
      img.src = "";
      img.alt = "";
      span.appendChild(img);
      div.appendChild(span);
      const span2 = document.createElement("span");
      span2.classList.add("tab-content");
      span2.setAttribute("title", "");
      const img2 = document.createElement("img");
      img2.classList.add("tab-icon");
      img2.src = "";
      img2.alt = "";
      img2.dataset.connecting = "";
      span2.appendChild(img2);
      const span2_1 = document.createElement("span");
      span2_1.classList.add("tab-title");
      span2.appendChild(span2_1);
      div.appendChild(span2);
      const span3 = document.createElement("span");
      span3.classList.add("tab-audio");
      span3.setAttribute("title", "");
      const img3 = document.createElement("img");
      img3.classList.add("tab-audio-icon");
      img3.src = "";
      img3.alt = "";
      span3.appendChild(img3);
      div.appendChild(span3);
      const span4 = document.createElement("span");
      span4.classList.add("tab-ident");
      span4.setAttribute("title", "");
      const img4 = document.createElement("img");
      img4.classList.add("tab-ident-icon");
      img4.src = "";
      img4.alt = "";
      span4.appendChild(img4);
      div.appendChild(span4);
      const span5 = document.createElement("span");
      span5.classList.add("tab-close");
      span5.setAttribute("title", "");
      const img5 = document.createElement("img");
      img5.classList.add("tab-close-icon");
      img5.src = "";
      img5.alt = "";
      span5.appendChild(img5);
      div.appendChild(span5);
      const span6 = document.createElement("span");
      span6.classList.add("tab-pinned");
      const img6 = document.createElement("img");
      img6.classList.add("tab-pinned-icon");
      img6.src = "";
      img6.alt = "";
      span6.appendChild(img6);
      div.appendChild(span6);
      tmpl2.content.appendChild(div);
      body.appendChild(tmpl2);
      const pinned = document.createElement("section");
      pinned.id = PINNED;
      body.appendChild(pinned);
      const newTab = document.createElement("section");
      newTab.id = NEW_TAB;
      body.appendChild(newTab);
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it("should create tab", async () => {
      const i = browser.tabs.query.callCount;
      const arr = [
        {
          active: false,
          audible: false,
          cookieStoreId: COOKIE_STORE_DEFAULT,
          id: 1,
          index: 0,
          pinned: true,
          status: "complete",
          title: "foo",
          url: "https://example.com",
          windowId: browser.windows.WINDOW_ID_CURRENT,
          mutedInfo: {
            muted: false,
          },
        },
      ];
      browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        windowType: "normal",
      }).resolves(arr);
      await func();
      const items = document.querySelectorAll(TAB_QUERY);
      assert.strictEqual(browser.tabs.query.callCount, i + 1, "called");
      assert.strictEqual(items.length, 1, "created");
      assert.strictEqual(items[0].textContent, "foo", "title");
    });
  });

  describe("set main", () => {
    const func = mjs.setMain;

    it("should add listener", async () => {
      const main = document.createElement("main");
      const pinned = document.createElement("section");
      const newTab = document.createElement("section");
      const body = document.querySelector("body");
      main.id = SIDEBAR_MAIN;
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      main.appendChild(pinned);
      main.appendChild(newTab);
      body.appendChild(main);
      const spy = sinon.spy(newTab, "addEventListener");
      const spy2 = sinon.spy(main, "addEventListener");
      await func();
      assert.isTrue(spy.calledOnce, "called on new tab");
      assert.strictEqual(spy2.callCount, 3, "called on main");
      newTab.addEventListener.restore();
      main.addEventListener.restore();
    });
  });
});
