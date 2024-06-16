/**
 * main.test.js
 */
/* eslint-disable camelcase, import/order, regexp/no-super-linear-backtracking */

/* api */
import sinon from 'sinon';
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom, mockPort } from './mocha/setup.js';

/* test */
import * as mjs from '../src/mjs/main.js';
import {
  ACTIVE, AUDIBLE, BROWSER_SETTINGS_READ,
  CLASS_COLLAPSE_AUTO, CLASS_COMPACT, CLASS_HEADING, CLASS_HEADING_LABEL,
  CLASS_HEADING_LABEL_EDIT, CLASS_NARROW, CLASS_NARROW_TAB_GROUP,
  CLASS_SEPARATOR_SHOW, CLASS_TAB_AUDIO, CLASS_TAB_CLOSE, CLASS_TAB_CLOSE_ICON,
  CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER, CLASS_TAB_CONTAINER_TMPL,
  CLASS_TAB_CONTENT, CLASS_TAB_CONTEXT, CLASS_TAB_GROUP, CLASS_TAB_ITEMS,
  CLASS_TAB_TITLE, CLASS_TAB_TOGGLE_ICON, COOKIE_STORE_DEFAULT,
  CUSTOM_BG, CUSTOM_BG_ACTIVE, CUSTOM_BG_HOVER, CUSTOM_BG_SELECT,
  CUSTOM_BG_SELECT_HOVER,
  CUSTOM_BORDER_ACTIVE,
  CUSTOM_COLOR, CUSTOM_COLOR_ACTIVE, CUSTOM_COLOR_HOVER,
  CUSTOM_COLOR_SELECT, CUSTOM_COLOR_SELECT_HOVER,
  DISCARDED, EXT_INIT, FRAME_COLOR_USE,
  FONT_ACTIVE, FONT_ACTIVE_BOLD, FONT_ACTIVE_NORMAL, HIGHLIGHTED,
  NEW_TAB, NEW_TAB_BUTTON, NEW_TAB_OPEN_CONTAINER, NEW_TAB_OPEN_NO_CONTAINER,
  NEW_TAB_SEPARATOR_SHOW,
  OPTIONS_OPEN, PINNED, PINNED_HEIGHT, SCROLL_DIR_INVERT, SIDEBAR, SIDEBAR_MAIN,
  TAB, TAB_ALL_BOOKMARK, TAB_ALL_RELOAD, TAB_ALL_SELECT, TAB_BOOKMARK,
  TAB_CLOSE, TAB_CLOSE_DUPE, TAB_CLOSE_UNDO, TAB_DUPE,
  TAB_GROUP_BOOKMARK, TAB_GROUP_CLOSE, TAB_GROUP_COLLAPSE,
  TAB_GROUP_COLLAPSE_OTHER, TAB_GROUP_CONTAINER, TAB_GROUP_DETACH,
  TAB_GROUP_DETACH_TABS, TAB_GROUP_DOMAIN, TAB_GROUP_ENABLE,
  TAB_GROUP_EXPAND_COLLAPSE_OTHER, TAB_GROUP_EXPAND_EXCLUDE_PINNED,
  TAB_GROUP_LABEL_SHOW, TAB_GROUP_NEW_TAB_AT_END, TAB_GROUP_SELECTED,
  TAB_GROUP_UNGROUP,
  TAB_LIST, TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN, TAB_MUTE, TAB_NEW,
  TAB_PIN, TAB_QUERY, TAB_RELOAD, TAB_REOPEN_CONTAINER, TAB_REOPEN_NO_CONTAINER,
  TAB_SWITCH_SCROLL, TAB_SWITCH_SCROLL_ALWAYS,
  TABS_BOOKMARK, TABS_CLOSE, TABS_CLOSE_DBLCLICK, TABS_CLOSE_DUPE,
  TABS_CLOSE_END, TABS_CLOSE_MDLCLICK, TABS_CLOSE_MDLCLICK_PREVENT,
  TABS_CLOSE_OTHER, TABS_CLOSE_START, TABS_DUPE, TABS_MOVE_END,
  TABS_MOVE_START, TABS_MOVE_WIN, TABS_MUTE, TABS_PIN, TABS_RELOAD,
  TABS_REOPEN_CONTAINER, TABS_REOPEN_NO_CONTAINER,
  THEME, THEME_AUTO, THEME_CUSTOM, THEME_CUSTOM_DARK, THEME_CUSTOM_ID,
  THEME_CUSTOM_INIT, THEME_CUSTOM_LIGHT, THEME_CUSTOM_REQ,
  THEME_UI_SCROLLBAR_NARROW, THEME_UI_TAB_COMPACT, THEME_UI_TAB_GROUP_NARROW,
  USER_CSS, USER_CSS_USE, USER_CSS_ID
} from '../src/mjs/constant.js';

describe('main', () => {
  const globalKeys = [
    'CSSStyleSheet',
    'DOMParser',
    'Node',
    'ResizeObserver',
    'XMLSerializer'
  ];
  let window, document;
  beforeEach(() => {
    const dom = createJsdom();
    Object.defineProperty(dom.window.HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get() {
        return this._clientHeight || 0;
      },
      set(val) {
        this._clientHeight = val;
      }
    });
    Object.defineProperty(dom.window.HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return this._scrollHeight || 0;
      },
      set(val) {
        this._scrollHeight = val;
      }
    });
    window = dom.window;
    document = dom.window.document;
    browser._sandbox.reset();
    browser.i18n.getMessage.callsFake((...args) => args.toString());
    browser.permissions.contains.resolves(true);
    browser.storage.local.get.resolves({});
    global.browser = browser;
    global.window = window;
    global.document = document;
    for (const key of globalKeys) {
      // mock CSSStyleSheet
      if (key === 'CSSStyleSheet') {
        global[key] = class CSSStyleSheet extends window.StyleSheet {
          #cssRules;
          constructor() {
            super();
            this.#cssRules = new Set();
          }

          get cssRules() {
            return Array.from(this.#cssRules);
          }

          replaceSync(str) {
            if (/\{\s*(?:\S.*(?:[\n\r\u2028\u2029]\s*)?)?\}/.test(str)) {
              const arr = str.replace(/\n/g, '').trim().split('}');
              for (let i of arr) {
                i = i.trim();
                if (i) {
                  let textEnd;
                  if (i.endsWith(';') || i.endsWith('{')) {
                    textEnd = '';
                  } else {
                    textEnd = ';';
                  }
                  const [, styleText] = /\{\s*(.*)\s*$/.exec(i);
                  let styleTextEnd;
                  if (!styleText || styleText.endsWith(';')) {
                    styleTextEnd = '';
                  } else {
                    styleTextEnd = ';';
                  }
                  this.#cssRules.add({
                    cssText: `${i}${textEnd} }`.trim(),
                    style: {
                      cssText: `${styleText}${styleTextEnd}`.trim()
                    }
                  });
                }
              }
            }
          }

          async replace(str) {
            await this.replaceSync(str);
            return this;
          }
        };
      // mock ResizeObserver
      } else if (key === 'ResizeObserver') {
        global[key] = class ResizeObserver {
          #callback;
          #disconnect;
          #observe;
          #unobserve;
          constructor(callback) {
            this.#callback = callback;
            this.#disconnect = () => sinon.stub();
            this.#observe = () => sinon.stub();
            this.#unobserve = () => sinon.stub();
          }

          disconnect() {
            return this.#disconnect();
          }

          observe() {
            return this.#observe();
          }

          unobserve() {
            return this.#unobserve();
          }
        };
      } else {
        global[key] = window[key];
      }
    }
    mjs.sidebar.context = null;
    mjs.sidebar.contextualIds = null;
    mjs.sidebar.firstSelectedTab = null;
    mjs.sidebar.incognito = false;
    mjs.sidebar.isMac = false;
    mjs.sidebar.lastClosedTab = null;
    mjs.sidebar.pinnedObserver = null;
    mjs.sidebar.pinnedTabsWaitingToMove = null;
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
    mjs.sidebar.context = null;
    mjs.sidebar.contextualIds = null;
    mjs.sidebar.firstSelectedTab = null;
    mjs.sidebar.incognito = false;
    mjs.sidebar.isMac = false;
    mjs.sidebar.lastClosedTab = null;
    mjs.sidebar.pinnedObserver = null;
    mjs.sidebar.pinnedTabsWaitingToMove = null;
    mjs.sidebar.tabsWaitingToMove = null;
    mjs.sidebar.windowId = null;
  });

  it('should get browser object', () => {
    assert.isObject(browser, 'browser');
  });

  describe('set user options', () => {
    const func = mjs.setUserOpts;
    beforeEach(() => {
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.userOpts.clear();
    });

    it('should set user option', async () => {
      const res = await func({
        foo: {
          checked: true
        }
      });
      assert.deepEqual(res, mjs.userOpts, 'result');
      assert.strictEqual(res.size, 1, 'size');
      assert.isTrue(res.has('foo'), 'key');
      assert.isTrue(res.get('foo'), 'value');
    });

    it('should set user option', async () => {
      const res = await func({
        [TABS_CLOSE_MDLCLICK_PREVENT]: {
          checked: true
        }
      });
      assert.deepEqual(res, mjs.userOpts, 'result');
      assert.strictEqual(res.size, 1, 'size');
      assert.isFalse(res.has(TABS_CLOSE_MDLCLICK_PREVENT), 'key');
      assert.isTrue(res.has(TABS_CLOSE_MDLCLICK), 'key');
      assert.isFalse(res.get(TABS_CLOSE_MDLCLICK), 'value');
    });

    it('should call function', async () => {
      const res = await func();
      assert.deepEqual(res, mjs.userOpts, 'result');
      assert.strictEqual(res.size, 2, 'size');
      assert.isTrue(res.has(TABS_CLOSE_MDLCLICK), 'default option');
      assert.isTrue(res.has(TAB_GROUP_ENABLE), 'default option');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [BROWSER_SETTINGS_READ]: {
          checked: true
        },
        [PINNED_HEIGHT]: {
          value: 100
        },
        [TABS_CLOSE_MDLCLICK_PREVENT]: {
          checked: true
        },
        [TAB_GROUP_ENABLE]: {
          checked: false
        }
      });
      const res = await func();
      assert.deepEqual(res, mjs.userOpts, 'result');
      assert.strictEqual(res.size, 4, 'size');
      assert.isTrue(res.has(BROWSER_SETTINGS_READ), 'key');
      assert.isTrue(res.get(BROWSER_SETTINGS_READ), 'value');
      assert.isTrue(res.has(PINNED_HEIGHT), 'key');
      assert.strictEqual(res.get(PINNED_HEIGHT), 100, 'value');
      assert.isTrue(res.has(TABS_CLOSE_MDLCLICK), 'key');
      assert.isFalse(res.get(TABS_CLOSE_MDLCLICK), 'value');
      assert.isTrue(res.has(TAB_GROUP_ENABLE), 'key');
      assert.isFalse(res.get(TAB_GROUP_ENABLE), 'value');
      assert.isFalse(res.has(FONT_ACTIVE), 'key');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM_DARK]: {
          foo: 'bar'
        },
        [THEME_CUSTOM_LIGHT]: {
          foo: 'baz'
        }
      });
      const res = await func();
      assert.deepEqual(res, mjs.userOpts, 'result');
      assert.strictEqual(res.size, 4, 'size');
      assert.isTrue(res.has(THEME_CUSTOM_DARK), 'key');
      assert.isObject(res.get(THEME_CUSTOM_DARK), 'value');
      assert.isTrue(res.has(THEME_CUSTOM_LIGHT), 'key');
      assert.isObject(res.get(THEME_CUSTOM_LIGHT), 'value');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [FONT_ACTIVE_BOLD]: {
          checked: true,
          value: 'bold'
        },
        [FONT_ACTIVE_NORMAL]: {
          checked: false,
          value: 'normal'
        }
      });
      const res = await func();
      assert.deepEqual(res, mjs.userOpts, 'result');
      assert.strictEqual(res.size, 3, 'size');
      assert.isTrue(res.has(FONT_ACTIVE), 'key');
      assert.strictEqual(res.get(FONT_ACTIVE), 'bold', 'value');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [FONT_ACTIVE_BOLD]: {
          checked: false,
          value: 'bold'
        },
        [FONT_ACTIVE_NORMAL]: {
          checked: true,
          value: 'normal'
        }
      });
      const res = await func();
      assert.deepEqual(res, mjs.userOpts, 'result');
      assert.strictEqual(res.size, 3, 'size');
      assert.isTrue(res.has(FONT_ACTIVE), 'key');
      assert.strictEqual(res.get(FONT_ACTIVE), 'normal', 'value');
    });
  });

  describe('set sidebar', () => {
    const func = mjs.setSidebar;

    it('should get default values', async () => {
      const { sidebar } = mjs;
      const getCurrent = browser.windows.getCurrent.withArgs({
        populate: true
      });
      const getOs = browser.runtime.getPlatformInfo;

      const i = getCurrent.callCount;
      const j = getOs.callCount;
      getCurrent.resolves({
        id: 1,
        incognito: false
      });
      getOs.resolves({
        os: 'win'
      });
      await func();
      assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
      assert.strictEqual(getOs.callCount, j + 1, 'getOs called');
      assert.isFalse(sidebar.incognito, 'incognito');
      assert.isFalse(sidebar.isMac, 'isMac');
      assert.strictEqual(sidebar.windowId, 1, 'windowId');
    });

    it('should set value', async () => {
      const { sidebar } = mjs;
      const getCurrent = browser.windows.getCurrent.withArgs({
        populate: true
      });
      const getOs = browser.runtime.getPlatformInfo;
      const i = getCurrent.callCount;
      const j = getOs.callCount;
      getCurrent.resolves({
        id: 1,
        incognito: true
      });
      getOs.resolves({
        os: 'mac'
      });
      await func();
      assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
      assert.strictEqual(getOs.callCount, j + 1, 'getOs called');
      assert.isTrue(sidebar.incognito, 'incognito');
      assert.isTrue(sidebar.isMac, 'isMac');
      assert.strictEqual(sidebar.windowId, 1, 'windowId');
    });
  });

  describe('init sidebar', () => {
    const func = mjs.initSidebar;

    it('should init', async () => {
      const { setWindowValue } = browser.sessions;
      const { clear } = browser.storage.local;
      const i = setWindowValue.callCount;
      const j = clear.callCount;
      await func();
      assert.strictEqual(setWindowValue.callCount, i + 1,
        'setWindowValue called');
      assert.strictEqual(clear.callCount, j + 1, 'clear called');
    });
  });

  describe('set context', () => {
    const func = mjs.setContext;

    it('should set value', async () => {
      const { sidebar } = mjs;
      const p = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(p);
      await func(p);
      assert.deepEqual(sidebar.context, p, 'result');
    });

    it('should set null', async () => {
      const { sidebar } = mjs;
      await func('foo');
      assert.isNull(sidebar.context, 'result');
    });
  });

  describe('set contextual identities cookieStoreIds', () => {
    const func = mjs.setContextualIds;

    it('should set value', async () => {
      const { sidebar } = mjs;
      const query = browser.contextualIdentities.query.withArgs({});
      const i = query.callCount;
      query.resolves([
        {
          cookieStoreId: 'foo'
        },
        {
          cookieStoreId: 'bar'
        },
        {
          cookieStoreId: 'baz'
        }
      ]);
      await func();
      assert.strictEqual(query.callCount, i + 1, 'query called');
      assert.deepEqual(sidebar.contextualIds, ['foo', 'bar', 'baz'], 'ids');
    });

    it('should throw', async () => {
      const query = browser.contextualIdentities.query.withArgs({});
      query.rejects('error');
      await func().catch(e => {
        assert.instanceOf(e, Error, 'error');
      });
    });
  });

  describe('set last closed tab', () => {
    const func = mjs.setLastClosedTab;

    it('should set null', async () => {
      const { sidebar } = mjs;
      await func({});
      assert.isNull(sidebar.lastClosedTab, 'result');
    });

    it('should set null', async () => {
      const { sidebar } = mjs;
      await func({
        id: 2
      });
      assert.isNull(sidebar.lastClosedTab, 'result');
    });

    it('should set value', async () => {
      const { sidebar } = mjs;
      const tab = {
        id: 2,
        windowId: 1
      };
      await func(tab);
      assert.deepEqual(sidebar.lastClosedTab, tab, 'result');
    });
  });

  describe('get last closed tab', () => {
    const func = mjs.getLastClosedTab;

    it('should call function', async () => {
      const { getRecentlyClosed } = browser.sessions;
      const i = getRecentlyClosed.callCount;
      getRecentlyClosed.resolves([{
        tab: {
          windowId: browser.windows.WINDOW_ID_CURRENT
        }
      }]);
      const res = await func();
      assert.strictEqual(getRecentlyClosed.callCount, i + 1, 'called');
      assert.deepEqual(res, {
        windowId: browser.windows.WINDOW_ID_CURRENT
      }, 'result');
    });

    it('should call function', async () => {
      const { getRecentlyClosed } = browser.sessions;
      const i = getRecentlyClosed.callCount;
      getRecentlyClosed.resolves([{}]);
      const res = await func();
      assert.strictEqual(getRecentlyClosed.callCount, i + 1, 'called');
      assert.isNull(res, 'result');
    });
  });

  describe('undo close tab', () => {
    const func = mjs.undoCloseTab;

    it('should not call function if lastClosedTab is not set', async () => {
      const { restore } = browser.sessions;
      const i = restore.callCount;
      const res = await func();
      assert.strictEqual(restore.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const { sidebar } = mjs;
      const restore = browser.sessions.restore.withArgs('foo').resolves({});
      const i = restore.callCount;
      sidebar.lastClosedTab = {
        sessionId: 'foo'
      };
      const res = await func();
      assert.strictEqual(restore.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('set pinned tabs waiting to move', () => {
    const func = mjs.setPinnedTabsWaitingToMove;

    it('should set null', async () => {
      const { sidebar } = mjs;
      await func('foo');
      assert.isNull(sidebar.pinnedTabsWaitingToMove, 'result');
    });

    it('should set null', async () => {
      const { sidebar } = mjs;
      await func([]);
      assert.isNull(sidebar.pinnedTabsWaitingToMove, 'result');
    });

    it('should set value', async () => {
      const { sidebar } = mjs;
      const arr = [1, 2];
      await func(arr);
      assert.deepEqual(sidebar.pinnedTabsWaitingToMove, arr, 'result');
    });
  });

  describe('set tabs waiting to move', () => {
    const func = mjs.setTabsWaitingToMove;

    it('should set null', async () => {
      const { sidebar } = mjs;
      await func('foo');
      assert.isNull(sidebar.tabsWaitingToMove, 'result');
    });

    it('should set null', async () => {
      const { sidebar } = mjs;
      await func([]);
      assert.isNull(sidebar.tabsWaitingToMove, 'result');
    });

    it('should set value', async () => {
      const { sidebar } = mjs;
      const arr = [1, 2];
      await func(arr);
      assert.deepEqual(sidebar.tabsWaitingToMove, arr, 'result');
    });
  });

  describe('apply user style', () => {
    const func = mjs.applyUserStyle;
    beforeEach(() => {
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.userOpts.clear();
    });

    it('should not apply user style', async () => {
      const elm = document.createElement('style');
      const head = document.querySelector('head');
      elm.id = USER_CSS_ID;
      head.appendChild(elm);
      const res = await func();
      assert.strictEqual(elm.textContent, '', 'content');
      assert.isUndefined(res, 'result');
    });

    it('should not apply user style', async () => {
      const elm = document.createElement('style');
      const head = document.querySelector('head');
      elm.id = USER_CSS_ID;
      head.appendChild(elm);
      mjs.userOpts.set(USER_CSS_USE, true);
      const res = await func();
      assert.strictEqual(elm.textContent, '', 'content');
      assert.isUndefined(res, 'result');
    });

    it('should not apply user style', async () => {
      const elm = document.createElement('style');
      const head = document.querySelector('head');
      elm.id = USER_CSS_ID;
      head.appendChild(elm);
      mjs.userOpts.set(USER_CSS_USE, true);
      browser.storage.local.get.resolves({
        [USER_CSS]: {
          value: ''
        }
      });
      const res = await func();
      assert.strictEqual(elm.textContent, '', 'content');
      assert.isUndefined(res, 'result');
    });

    it('should apply user style', async () => {
      const elm = document.createElement('style');
      const head = document.querySelector('head');
      elm.id = USER_CSS_ID;
      head.appendChild(elm);
      mjs.userOpts.set(USER_CSS_USE, true);
      browser.storage.local.get.resolves({
        [USER_CSS]: {
          value: 'body { color: red; }'
        }
      });
      const res = await func();
      assert.strictEqual(elm.textContent, 'body { color: red; }', 'content');
      assert.isUndefined(res, 'result');
    });
  });

  describe('apply user custom theme', () => {
    const func = mjs.applyUserCustomTheme;
    beforeEach(() => {
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.userOpts.clear();
    });

    it('should get null', async () => {
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      mjs.userOpts.set(THEME_CUSTOM, true);
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get array', async () => {
      mjs.userOpts.set(THEME_CUSTOM, true);
      mjs.userOpts.set(THEME_CUSTOM_DARK, {
        [CUSTOM_BG]: '#ff0000',
        [CUSTOM_COLOR]: '#ffffff'
      });
      mjs.userOpts.set(THEME_CUSTOM_LIGHT, {
        [CUSTOM_BG]: '#ff00ff',
        [CUSTOM_COLOR]: '#00ff00'
      });
      const res = await func();
      assert.deepEqual(res, [undefined, undefined], 'result');
    });

    it('should get array', async () => {
      window.matchMedia().matches = true;
      mjs.userOpts.set(THEME_CUSTOM, true);
      mjs.userOpts.set(THEME_CUSTOM_DARK, {
        [CUSTOM_BG]: '#ff0000',
        [CUSTOM_COLOR]: '#ffffff'
      });
      mjs.userOpts.set(THEME_CUSTOM_LIGHT, {
        [CUSTOM_BG]: '#ff00ff',
        [CUSTOM_COLOR]: '#00ff00'
      });
      const res = await func();
      assert.deepEqual(res, [undefined, undefined], 'result');
    });
  });

  describe('apply pinned container height', () => {
    const func = mjs.applyPinnedContainerHeight;
    beforeEach(() => {
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.userOpts.clear();
    });

    it('should throw', async () => {
      assert.throws(() => func());
    });

    it('should throw', async () => {
      assert.throws(() => func([]));
    });

    it('should get empty array', async () => {
      const res = await func([{}]);
      assert.isNull(res, 'result');
    });

    it('should not set styles', async () => {
      const i = browser.storage.local.set.callCount;
      const elm = document.createElement('div');
      const body = document.querySelector('body');
      elm.id = 'foo';
      body.appendChild(elm);
      const res = await func([{
        target: elm
      }]);
      assert.strictEqual(elm.style.height, '', 'height');
      assert.strictEqual(elm.style.resize, '', 'resize');
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should set height: auto, resize: none', async () => {
      const i = browser.storage.local.set.callCount;
      const elm = document.createElement('div');
      const body = document.querySelector('body');
      elm.id = PINNED;
      body.appendChild(elm);
      const res = await func([{
        target: elm
      }]);
      assert.strictEqual(elm.style.height, 'auto', 'height');
      assert.strictEqual(elm.style.resize, 'none', 'resize');
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should set height: auto, resize: none', async () => {
      const i = browser.storage.local.set.callCount;
      const elm = document.createElement('div');
      const body = document.querySelector('body');
      elm.id = PINNED;
      elm.clientHeight = 100;
      elm.scrollHeight = 100;
      body.appendChild(elm);
      const res = await func([{
        target: elm
      }]);
      assert.strictEqual(elm.style.height, 'auto', 'height');
      assert.strictEqual(elm.style.resize, 'none', 'resize');
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should set height: auto, resize: none', async () => {
      const i = browser.storage.local.set.callCount;
      const elm = document.createElement('div');
      const body = document.querySelector('body');
      elm.id = PINNED;
      elm.clientHeight = 200;
      elm.scrollHeight = 300;
      elm.classList.add(CLASS_TAB_COLLAPSED);
      body.appendChild(elm);
      const res = await func([{
        target: elm
      }]);
      assert.strictEqual(elm.style.height, 'auto', 'height');
      assert.strictEqual(elm.style.resize, 'none', 'resize');
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should set height: auto, resize: block', async () => {
      const i = browser.storage.local.set.callCount;
      const elm = document.createElement('div');
      const body = document.querySelector('body');
      elm.id = PINNED;
      elm.clientHeight = 0;
      elm.scrollHeight = 300;
      body.appendChild(elm);
      const res = await func([{
        target: elm
      }]);
      assert.strictEqual(elm.style.height, 'auto', 'height');
      assert.strictEqual(elm.style.resize, 'block', 'resize');
      assert.strictEqual(browser.storage.local.set.callCount, i, 'called');
      assert.isNull(res, 'result');
    });

    it('should set height: 200px, resize: block', async () => {
      const i = browser.storage.local.set.callCount;
      const elm = document.createElement('div');
      const body = document.querySelector('body');
      elm.id = PINNED;
      elm.clientHeight = 200;
      elm.scrollHeight = 300;
      body.appendChild(elm);
      const res = await func([{
        target: elm
      }]);
      assert.strictEqual(elm.style.height, '200px', 'height');
      assert.strictEqual(elm.style.resize, 'block', 'resize');
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should set height: 100px, resize: block', async () => {
      const i = browser.storage.local.set.callCount;
      const elm = document.createElement('div');
      const body = document.querySelector('body');
      elm.id = PINNED;
      elm.clientHeight = 200;
      elm.scrollHeight = 300;
      body.appendChild(elm);
      mjs.userOpts.set(PINNED_HEIGHT, 100);
      const res = await func([{
        target: elm
      }]);
      assert.strictEqual(elm.style.height, '100px', 'height');
      assert.strictEqual(elm.style.resize, 'block', 'resize');
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should throw', async () => {
      const stubErr = sinon.stub(console, 'error');
      browser.storage.local.set.rejects(new Error('error'));
      const elm = document.createElement('div');
      const body = document.querySelector('body');
      elm.id = PINNED;
      elm.clientHeight = 200;
      elm.scrollHeight = 300;
      body.appendChild(elm);
      await func([{
        target: elm
      }]).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'error', 'message');
      });
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.isTrue(errCalled, 'called');
      assert.strictEqual(elm.style.height, '200px', 'height');
      assert.strictEqual(elm.style.resize, 'block', 'resize');
    });
  });

  describe('trigger DnD handler', () => {
    const func = mjs.triggerDndHandler;

    it('should not call function', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      mjs.sidebar.isMac = false;
      mjs.sidebar.windowId = 1;
      const getData = sinon.stub();
      const setData = sinon.stub();
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData,
          setData,
          effectAllowed: 'uninitialized'
        }
      };
      const res = await func(evt);
      assert.isTrue(getData.notCalled, 'not called');
      assert.isTrue(setData.notCalled, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'uninitialized',
        'effect');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.draggable = true;
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      mjs.sidebar.isMac = false;
      mjs.sidebar.windowId = 1;
      const getData = sinon.stub();
      const setData = sinon.stub();
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData,
          setData,
          effectAllowed: 'uninitialized'
        },
        type: 'foo'
      };
      const res = await func(evt);
      assert.isTrue(getData.notCalled, 'not called');
      assert.isTrue(setData.notCalled, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'uninitialized',
        'effect');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.draggable = true;
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      mjs.sidebar.isMac = false;
      mjs.sidebar.windowId = 1;
      const getData = sinon.stub();
      const setData = sinon.stub();
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData,
          setData,
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt);
      assert.isTrue(getData.notCalled, 'not called');
      assert.isTrue(setData.calledOnce, 'called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.draggable = true;
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      mjs.sidebar.isMac = false;
      mjs.sidebar.windowId = 1;
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const getData = sinon.stub();
      const setData = sinon.stub();
      const evt = {
        currentTarget: elm,
        preventDefault,
        stopPropagation,
        dataTransfer: {
          getData,
          setData,
          effectAllowed: 'uninitialized'
        },
        type: 'dragover'
      };
      const res = await func(evt);
      assert.isTrue(getData.calledOnce, 'called');
      assert.isTrue(setData.notCalled, 'not called');
      assert.isNull(res, 'result');
    });
  });

  describe('handle create new tab', () => {
    const func = mjs.handleCreateNewTab;

    it('should not call function', async () => {
      const { create } = browser.tabs;
      const i = create.callCount;
      const main = document.createElement('main');
      const elm = document.createElement('p');
      const span = document.createElement('span');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      mjs.sidebar.windowId = 1;
      const evt = {
        button: 1,
        target: body
      };
      const res = await func(evt);
      assert.strictEqual(create.callCount, i, 'not called create');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const { create } = browser.tabs;
      const i = create.callCount;
      const main = document.createElement('main');
      const elm = document.createElement('p');
      const span = document.createElement('span');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      mjs.sidebar.windowId = 1;
      const evt = {
        button: 0,
        target: main,
        type: 'click'
      };
      const res = await func(evt);
      assert.strictEqual(create.callCount, i, 'not called create');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const { create } = browser.tabs;
      const i = create.callCount;
      const main = document.createElement('main');
      const elm = document.createElement('p');
      const span = document.createElement('span');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      mjs.sidebar.windowId = 1;
      const evt = {
        button: 1,
        target: main,
        type: 'dblclick'
      };
      const res = await func(evt);
      assert.strictEqual(create.callCount, i, 'not called create');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const { create } = browser.tabs;
      const i = create.callCount;
      const main = document.createElement('main');
      const elm = document.createElement('p');
      const span = document.createElement('span');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      mjs.sidebar.windowId = 1;
      const evt = {
        button: 1,
        target: main,
        type: 'mousedown'
      };
      create.resolves({});
      const res = await func(evt);
      assert.strictEqual(create.callCount, i + 1, 'called create');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const { create } = browser.tabs;
      const i = create.callCount;
      const main = document.createElement('main');
      const elm = document.createElement('p');
      const span = document.createElement('span');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      mjs.sidebar.windowId = 1;
      const evt = {
        button: 0,
        target: main,
        type: 'dblclick'
      };
      create.resolves({});
      const res = await func(evt);
      assert.strictEqual(create.callCount, i + 1, 'called create');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const { create } = browser.tabs;
      const i = create.callCount;
      const main = document.createElement('main');
      const elm = document.createElement('p');
      const span = document.createElement('span');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB_BUTTON;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      mjs.sidebar.windowId = 1;
      const evt = {
        target: elm
      };
      create.resolves({});
      const res = await func(evt);
      assert.strictEqual(create.callCount, i + 1, 'called create');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const { create } = browser.tabs;
      const i = create.callCount;
      const main = document.createElement('main');
      const elm = document.createElement('p');
      const span = document.createElement('span');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      elm.id = NEW_TAB_BUTTON;
      elm.appendChild(span);
      main.appendChild(elm);
      body.appendChild(main);
      mjs.sidebar.windowId = 1;
      const evt = {
        currentTarget: elm,
        target: span
      };
      create.resolves({});
      const res = await func(evt);
      assert.strictEqual(create.callCount, i + 1, 'called create');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('activate clicked tab', () => {
    const func = mjs.activateClickedTab;
    beforeEach(() => {
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.userOpts.clear();
    });

    it('should not call function', async () => {
      const { get: getTab, update } = browser.tabs;
      const i = update.callCount;
      const j = getTab.callCount;
      const res = await func();
      assert.strictEqual(update.callCount, i, 'not called update');
      assert.strictEqual(getTab.callCount, j, 'not called get');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const stubErr = sinon.stub(console, 'error');
      const { get: getTab, update } = browser.tabs;
      const i = update.callCount;
      const j = getTab.callCount;
      update.resolves({});
      getTab.withArgs(1).rejects(new Error('error'));
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      const res = await func(elm);
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.isTrue(errCalled, 'called error');
      assert.strictEqual(update.callCount, i, 'not called update');
      assert.strictEqual(getTab.callCount, j + 1, 'called get');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const { get: getTab, update } = browser.tabs;
      const i = update.callCount;
      const j = getTab.callCount;
      update.resolves({});
      getTab.withArgs(1).resolves({
        active: false
      });
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(update.callCount, i + 1, 'called update');
      assert.strictEqual(getTab.callCount, j + 1, 'called get');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const { get: getTab, update } = browser.tabs;
      const i = update.callCount;
      const j = getTab.callCount;
      update.resolves({});
      getTab.withArgs(1).resolves({
        active: false
      });
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.userOpts.set(TABS_CLOSE_DBLCLICK, true);
      const res = await func(elm);
      assert.strictEqual(update.callCount, i + 1, 'called update');
      assert.strictEqual(getTab.callCount, j + 1, 'called get');
      assert.deepEqual(res, {}, 'result');
    });

    it('should not call function', async () => {
      const { get: getTab, update } = browser.tabs;
      const i = update.callCount;
      const j = getTab.callCount;
      update.resolves({});
      getTab.withArgs(1).resolves({
        active: true
      });
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(update.callCount, i, 'not called update');
      assert.strictEqual(getTab.callCount, j + 1, 'called get');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const { get: getTab, update } = browser.tabs;
      const i = update.callCount;
      const j = getTab.callCount;
      update.resolves({});
      getTab.withArgs(1).resolves({
        active: true
      });
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.userOpts.set(TABS_CLOSE_DBLCLICK, true);
      const res = await func(elm);
      assert.strictEqual(update.callCount, i, 'not called update');
      assert.strictEqual(getTab.callCount, j + 1, 'called get');
      assert.isNull(res, 'result');
    });
  });

  describe('handle clicked tab', () => {
    const func = mjs.handleClickedTab;
    beforeEach(() => {
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.userOpts.clear();
    });

    it('should not call function', async () => {
      const { update } = browser.tabs;
      const i = update.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        target: body,
        type: 'click'
      };
      const res = await func(evt);
      assert.strictEqual(update.callCount, i, 'not called update');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const { highlight } = browser.tabs;
      const i = highlight.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        target: body,
        type: 'click'
      };
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i, 'not called highlight');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const { highlight } = browser.tabs;
      const i = highlight.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        target: body,
        type: 'click'
      };
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i, 'not called highlight');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const { highlight } = browser.tabs;
      const i = highlight.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        target: elm,
        type: 'mousedown'
      };
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i, 'not called highlight');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const { remove } = browser.tabs;
      const i = remove.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      const preventDefault = sinon.stub();
      const evt = {
        preventDefault,
        button: 1,
        target: body,
        type: 'mousedown'
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i, 'not called remove');
      assert.isFalse(preventDefault.called, 'event not prevented');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const { remove } = browser.tabs;
      const i = remove.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      const preventDefault = sinon.stub();
      const evt = {
        preventDefault,
        button: 0,
        target: elm,
        type: 'mousedown'
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i, 'not called remove');
      assert.isFalse(preventDefault.called, 'event not prevented');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const { remove, update } = browser.tabs;
      const i = remove.callCount;
      const j = update.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      const preventDefault = sinon.stub();
      const evt = {
        preventDefault,
        button: 1,
        target: body,
        type: 'dblclick'
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i, 'not called remove');
      assert.strictEqual(remove.callCount, j, 'not called update');
      assert.isFalse(preventDefault.called, 'event not prevented');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const { get: getTab, update } = browser.tabs;
      const i = update.callCount;
      const j = getTab.callCount;
      getTab.withArgs(1).resolves({
        active: false
      });
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        target: elm,
        type: 'click'
      };
      update.resolves({});
      const res = await func(evt);
      assert.strictEqual(update.callCount, i, 'not called update');
      assert.strictEqual(getTab.callCount, j, 'not called update');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const { get: getTab, update } = browser.tabs;
      const i = update.callCount;
      const j = getTab.callCount;
      getTab.withArgs(1).resolves({
        active: false
      });
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: false,
        detail: 1,
        metaKey: false,
        shiftKey: false,
        target: elm,
        type: 'click'
      };
      update.resolves({});
      const res = await func(evt);
      assert.strictEqual(update.callCount, i + 1, 'called update');
      assert.strictEqual(getTab.callCount, j + 1, 'called get');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should not call function', async () => {
      const { get: getTab, update } = browser.tabs;
      const i = update.callCount;
      const j = getTab.callCount;
      getTab.withArgs(1).resolves({
        active: true
      });
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: false,
        detail: 1,
        metaKey: false,
        shiftKey: false,
        target: elm,
        type: 'click'
      };
      update.resolves({});
      const res = await func(evt);
      assert.strictEqual(update.callCount, i, 'not called update');
      assert.strictEqual(getTab.callCount, j + 1, 'called get');
      assert.deepEqual(res, [null], 'result');
    });

    it('should not call function', async () => {
      const { get: getTab, update } = browser.tabs;
      const i = update.callCount;
      const j = getTab.callCount;
      getTab.withArgs(1).resolves({
        active: false
      });
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: false,
        detail: 2,
        metaKey: false,
        shiftKey: false,
        target: elm,
        type: 'click'
      };
      update.resolves({});
      const res = await func(evt);
      assert.strictEqual(update.callCount, i, 'not called update');
      assert.strictEqual(getTab.callCount, j, 'not called update');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const { highlight, query, update } = browser.tabs;
      const i = highlight.callCount;
      const j = query.callCount;
      const k = update.callCount;
      const activeElm = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      activeElm.classList.add(TAB);
      activeElm.classList.add(HIGHLIGHTED);
      activeElm.dataset.tabId = '1';
      elm.classList.add(TAB);
      elm.dataset.tabId = '2';
      body.appendChild(activeElm);
      body.appendChild(elm);
      mjs.sidebar.firstSelectedTab = activeElm;
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        target: elm,
        type: 'click'
      };
      highlight.withArgs({
        windowId: 1,
        tabs: [0, 1]
      }).resolves([{}, {}]);
      query.resolves([{
        index: 0
      }]);
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i + 1, 'called highlight');
      assert.strictEqual(query.callCount, j + 1, 'called query');
      assert.strictEqual(update.callCount, k, 'not called update');
      assert.deepEqual(res, [[{}, {}]], 'result');
    });

    it('should call function', async () => {
      const { highlight, query, update } = browser.tabs;
      const i = highlight.callCount;
      const j = query.callCount;
      const k = update.callCount;
      const activeElm = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      activeElm.classList.add(TAB);
      activeElm.classList.add(HIGHLIGHTED);
      activeElm.dataset.tabId = '1';
      elm.classList.add(TAB);
      elm.dataset.tabId = '2';
      body.appendChild(activeElm);
      body.appendChild(elm);
      mjs.sidebar.firstSelectedTab = activeElm;
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        target: elm,
        type: 'click'
      };
      highlight.withArgs({
        windowId: 1,
        tabs: [0, 1]
      }).resolves([{}, {}]);
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i + 1, 'called highlight');
      assert.strictEqual(query.callCount, j, 'not called query');
      assert.strictEqual(update.callCount, k, 'not called update');
      assert.deepEqual(res, [[{}, {}]], 'result');
    });

    it('should call function', async () => {
      const { highlight, query, update } = browser.tabs;
      const i = highlight.callCount;
      const j = query.callCount;
      const k = update.callCount;
      const activeElm = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      activeElm.classList.add(TAB);
      activeElm.classList.add(HIGHLIGHTED);
      activeElm.dataset.tabId = '1';
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '2';
      body.appendChild(activeElm);
      body.appendChild(elm);
      mjs.sidebar.firstSelectedTab = activeElm;
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        target: elm,
        type: 'click'
      };
      highlight.withArgs({
        windowId: 1,
        tabs: [0]
      }).resolves([{}]);
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i + 1, 'called highlight');
      assert.strictEqual(query.callCount, j, 'not called query');
      assert.strictEqual(update.callCount, k, 'not called update');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should call function', async () => {
      const { highlight, query, update } = browser.tabs;
      const i = highlight.callCount;
      const j = query.callCount;
      const k = update.callCount;
      const activeElm = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      activeElm.classList.add(TAB);
      activeElm.classList.add(HIGHLIGHTED);
      activeElm.dataset.tabId = '1';
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '2';
      body.appendChild(activeElm);
      body.appendChild(elm);
      mjs.sidebar.firstSelectedTab = activeElm;
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        target: activeElm,
        type: 'click'
      };
      highlight.withArgs({
        windowId: 1,
        tabs: [1]
      }).resolves([{}]);
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i + 1, 'called highlight');
      assert.strictEqual(query.callCount, j, 'not called query');
      assert.strictEqual(update.callCount, k, 'not called update');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should not call function', async () => {
      const { get, highlight, query, update } = browser.tabs;
      const i = highlight.callCount;
      const j = query.callCount;
      const k = update.callCount;
      const l = get.callCount;
      const activeElm = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      activeElm.classList.add(TAB);
      activeElm.classList.add(HIGHLIGHTED);
      activeElm.dataset.tabId = '1';
      elm.classList.add(TAB);
      elm.dataset.tabId = '2';
      body.appendChild(activeElm);
      body.appendChild(elm);
      mjs.sidebar.firstSelectedTab = activeElm;
      mjs.sidebar.windowId = 1;
      get.resolves({
        audible: false,
        mutedInfo: {
          muted: false
        }
      });
      const evt = {
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        target: activeElm,
        type: 'click'
      };
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i, 'not called highlight');
      assert.strictEqual(query.callCount, j, 'not called query');
      assert.strictEqual(update.callCount, k, 'not called update');
      assert.strictEqual(get.callCount, l, 'not called get');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const { highlight, query, update } = browser.tabs;
      const i = highlight.callCount;
      const j = query.callCount;
      const k = update.callCount;
      const activeElm = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      activeElm.classList.add(TAB);
      activeElm.classList.add(HIGHLIGHTED);
      activeElm.dataset.tabId = '1';
      elm.classList.add(TAB);
      elm.dataset.tabId = '2';
      body.appendChild(activeElm);
      body.appendChild(elm);
      mjs.sidebar.firstSelectedTab = activeElm;
      mjs.sidebar.isMac = true;
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: false,
        metaKey: true,
        shiftKey: false,
        target: elm,
        type: 'click'
      };
      highlight.withArgs({
        windowId: 1,
        tabs: [0, 1]
      }).resolves([{}, {}]);
      const res = await func(evt);
      assert.strictEqual(highlight.callCount, i + 1, 'called highlight');
      assert.strictEqual(query.callCount, j, 'not called query');
      assert.strictEqual(update.callCount, k, 'not called update');
      assert.deepEqual(res, [[{}, {}]], 'result');
    });

    it('should call function', async () => {
      const { remove } = browser.tabs;
      const i = remove.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        button: 1,
        target: elm,
        type: 'mousedown'
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i + 1, 'called remove');
      assert.isTrue(preventDefault.calledOnce, 'event prevented');
      assert.isTrue(stopPropagation.calledOnce, 'event stopped');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const { remove } = browser.tabs;
      const i = remove.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.userOpts.set(TABS_CLOSE_MDLCLICK, true);
      mjs.userOpts.set(TAB_SWITCH_SCROLL, true);
      mjs.sidebar.windowId = 1;
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        button: 1,
        target: elm,
        type: 'mousedown'
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i + 1, 'called remove');
      assert.isTrue(preventDefault.calledOnce, 'event prevented');
      assert.isTrue(stopPropagation.calledOnce, 'event stopped');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const { remove } = browser.tabs;
      const i = remove.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.userOpts.set(TABS_CLOSE_MDLCLICK, false);
      mjs.userOpts.set(TAB_SWITCH_SCROLL, false);
      mjs.sidebar.windowId = 1;
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        button: 1,
        target: elm,
        type: 'mousedown'
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i + 1, 'called remove');
      assert.isTrue(preventDefault.calledOnce, 'event prevented');
      assert.isTrue(stopPropagation.calledOnce, 'event stopped');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should not call function', async () => {
      const { remove } = browser.tabs;
      const i = remove.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.userOpts.set(TABS_CLOSE_MDLCLICK, false);
      mjs.userOpts.set(TAB_SWITCH_SCROLL, true);
      mjs.sidebar.windowId = 1;
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        button: 1,
        target: elm,
        type: 'mousedown'
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i, 'not called remove');
      assert.isFalse(preventDefault.called, 'event not prevented');
      assert.isFalse(stopPropagation.called, 'event not stopped');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const { get: getTab, remove, update } = browser.tabs;
      const i = remove.callCount;
      const j = getTab.callCount;
      const k = update.callCount;
      getTab.withArgs(1).resolves({
        active: true
      });
      update.resolves({});
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(ACTIVE);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.userOpts.set(TABS_CLOSE_DBLCLICK, true);
      mjs.sidebar.windowId = 1;
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        button: 0,
        target: elm,
        type: 'dblclick'
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i + 1, 'called remove');
      assert.strictEqual(getTab.callCount, j, 'not called get');
      assert.strictEqual(update.callCount, k, 'not called remove');
      assert.isTrue(preventDefault.calledOnce, 'event prevented');
      assert.isTrue(stopPropagation.calledOnce, 'event stopped');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const { get: getTab, remove, update } = browser.tabs;
      const i = remove.callCount;
      const j = getTab.callCount;
      const k = update.callCount;
      getTab.withArgs(1).resolves({
        active: false
      });
      update.resolves({});
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.userOpts.set(TABS_CLOSE_DBLCLICK, true);
      mjs.sidebar.windowId = 1;
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        button: 0,
        target: elm,
        type: 'dblclick'
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i, 'not called remove');
      assert.strictEqual(getTab.callCount, j, 'not called get');
      assert.strictEqual(update.callCount, k + 1, 'called update');
      assert.isTrue(preventDefault.calledOnce, 'event prevented');
      assert.isTrue(stopPropagation.calledOnce, 'event stopped');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should not call function', async () => {
      const { get: getTab, remove, update } = browser.tabs;
      const i = remove.callCount;
      const j = getTab.callCount;
      const k = update.callCount;
      getTab.withArgs(1).resolves({
        active: true
      });
      update.resolves({});
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.userOpts.set(TABS_CLOSE_DBLCLICK, false);
      mjs.sidebar.windowId = 1;
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        button: 0,
        target: elm,
        type: 'dblclick'
      };
      const res = await func(evt);
      assert.strictEqual(remove.callCount, i, 'not called remove');
      assert.strictEqual(getTab.callCount, j, 'not called get');
      assert.strictEqual(update.callCount, k, 'not called update');
      assert.isFalse(preventDefault.called, 'event not prevented');
      assert.isFalse(stopPropagation.calledOnce, 'event not stopped');
      assert.deepEqual(res, [], 'result');
    });
  });

  describe('add sidebar tab click listener', () => {
    const func = mjs.addTabClickListener;

    it('should not add listener', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const spy = sinon.spy(elm, 'addEventListener');
      await func(elm);
      assert.isFalse(spy.called, 'called');
      elm.addEventListener.restore();
    });

    it('should add listener', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(CLASS_TAB_ITEMS);
      body.appendChild(elm);
      const spy = sinon.spy(elm, 'addEventListener');
      await func(elm);
      assert.isTrue(spy.called, 'called');
      elm.addEventListener.restore();
    });
  });

  describe('toggle tab dblclick listener', () => {
    const func = mjs.toggleTabDblClickListener;

    it('should not add or remove listener', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const spy = sinon.spy(elm, 'addEventListener');
      const spy2 = sinon.spy(elm, 'removeEventListener');
      await func(elm, true);
      assert.isFalse(spy.called, 'called');
      assert.isFalse(spy2.called, 'called');
      elm.addEventListener.restore();
      elm.removeEventListener.restore();
    });

    it('should add listener', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(CLASS_TAB_CONTENT);
      body.appendChild(elm);
      const spy = sinon.spy(elm, 'addEventListener');
      const spy2 = sinon.spy(elm, 'removeEventListener');
      await func(elm, true);
      assert.isTrue(spy.called, 'called');
      assert.isFalse(spy2.called, 'called');
      elm.addEventListener.restore();
      elm.removeEventListener.restore();
    });

    it('should remove listener', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(CLASS_TAB_CONTENT);
      body.appendChild(elm);
      const spy = sinon.spy(elm, 'addEventListener');
      const spy2 = sinon.spy(elm, 'removeEventListener');
      await func(elm, false);
      assert.isFalse(spy.called, 'called');
      assert.isTrue(spy2.called, 'called');
      elm.addEventListener.restore();
      elm.removeEventListener.restore();
    });
  });

  describe('replace tab dblclick listeners', () => {
    const func = mjs.replaceTabDblClickListeners;

    it('should get empty array', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      body.appendChild(elm);
      const res = await func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', async () => {
      const span = document.createElement('span');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.appendChild(span);
      body.appendChild(elm);
      const res = await func();
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const span = document.createElement('span');
      const span2 = document.createElement('span');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      span.classList.add(CLASS_TAB_CONTENT);
      elm.classList.add(TAB);
      elm.appendChild(span);
      span2.classList.add(CLASS_TAB_CONTENT);
      elm2.classList.add(TAB);
      elm2.appendChild(span2);
      body.appendChild(elm);
      body.appendChild(elm2);
      const spy = sinon.spy(span, 'addEventListener');
      const spy2 = sinon.spy(span2, 'addEventListener');
      const res = await func(true);
      assert.isTrue(spy.called, 'called');
      assert.isTrue(spy2.called, 'called');
      assert.deepEqual(res, [undefined, undefined], 'result');
      span.addEventListener.restore();
      span2.addEventListener.restore();
    });

    it('should call function', async () => {
      const span = document.createElement('span');
      const span2 = document.createElement('span');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      span.classList.add(CLASS_TAB_CONTENT);
      elm.classList.add(TAB);
      elm.appendChild(span);
      span2.classList.add(CLASS_TAB_CONTENT);
      elm2.classList.add(TAB);
      elm2.appendChild(span2);
      body.appendChild(elm);
      body.appendChild(elm2);
      const spy = sinon.spy(span, 'removeEventListener');
      const spy2 = sinon.spy(span2, 'removeEventListener');
      const res = await func(false);
      assert.isTrue(spy.called, 'called');
      assert.isTrue(spy2.called, 'called');
      assert.deepEqual(res, [undefined, undefined], 'result');
      span.removeEventListener.restore();
      span2.removeEventListener.restore();
    });

    it('should call function', async () => {
      const span = document.createElement('span');
      const span2 = document.createElement('span');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      span.classList.add(CLASS_TAB_CONTENT);
      elm.classList.add(TAB);
      elm.appendChild(span);
      span2.classList.add(CLASS_TAB_CONTENT);
      elm2.classList.add(TAB);
      elm2.appendChild(span2);
      body.appendChild(elm);
      body.appendChild(elm2);
      const spy = sinon.spy(span, 'removeEventListener');
      const spy2 = sinon.spy(span2, 'removeEventListener');
      const res = await func(null);
      assert.isTrue(spy.called, 'called');
      assert.isTrue(spy2.called, 'called');
      assert.deepEqual(res, [undefined, undefined], 'result');
      span.removeEventListener.restore();
      span2.removeEventListener.restore();
    });
  });

  describe('trigger tab warmup', () => {
    const func = mjs.triggerTabWarmup;

    it('should throw', () => {
      assert.throws(() => func());
    });

    it('should not call function', async () => {
      if (typeof browser.tabs.warmup === 'function') {
        const i = browser.tabs.warmup.callCount;
        const elm = document.createElement('p');
        const body = document.querySelector('body');
        body.appendChild(elm);
        const evt = {
          target: elm
        };
        const res = await func(evt);
        assert.strictEqual(browser.tabs.warmup.callCount, i, 'not called');
        assert.isNull(res, 'result');
      }
    });

    it('should call function', async () => {
      if (typeof browser.tabs.warmup === 'function') {
        const i = browser.tabs.warmup.callCount;
        const elm = document.createElement('p');
        const body = document.querySelector('body');
        elm.classList.add(TAB);
        elm.dataset.tabId = '1';
        body.appendChild(elm);
        const evt = {
          target: elm
        };
        const res = await func(evt);
        assert.strictEqual(browser.tabs.warmup.callCount, i + 1, 'called');
        assert.isUndefined(res, 'result');
      }
    });

    it('should not call function', async () => {
      if (typeof browser.tabs.warmup === 'function') {
        const i = browser.tabs.warmup.callCount;
        const elm = document.createElement('p');
        const body = document.querySelector('body');
        elm.classList.add(TAB);
        elm.classList.add(ACTIVE);
        elm.dataset.tabId = '1';
        body.appendChild(elm);
        const evt = {
          target: elm
        };
        const res = await func(evt);
        assert.strictEqual(browser.tabs.warmup.callCount, i, 'not called');
        assert.isNull(res, 'result');
      }
    });
  });

  describe('add tab event listeners', () => {
    const func = mjs.addTabEventListeners;

    it('should not add dragstart listner', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const spy = sinon.spy(elm, 'addEventListener');
      const i = spy.callCount;
      await func();
      assert.strictEqual(spy.callCount, i, 'not called');
      elm.addEventListener.restore();
    });

    it('should not add listner', async () => {
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      body.appendChild(elm2);
      const spy = sinon.spy(elm, 'addEventListener');
      const i = spy.callCount;
      await func(elm2);
      assert.strictEqual(spy.callCount, i, 'not called');
      elm.addEventListener.restore();
    });

    it('should not add dragstart listner', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const spy = sinon.spy(elm, 'addEventListener');
      const i = spy.callCount;
      await func(elm);
      assert.strictEqual(spy.callCount, i + 8, 'not called');
      elm.addEventListener.restore();
    });

    it('should not add dragstart listner', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.draggable = false;
      body.appendChild(elm);
      const spy = sinon.spy(elm, 'addEventListener');
      await func(elm);
      const i = spy.callCount;
      await func(elm);
      assert.strictEqual(spy.callCount, i + 8, 'not called');
      elm.addEventListener.restore();
    });

    it('should add all listners', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.draggable = true;
      body.appendChild(elm);
      const spy = sinon.spy(elm, 'addEventListener');
      const i = spy.callCount;
      await func(elm);
      assert.strictEqual(spy.callCount, i + 9, 'called');
      elm.addEventListener.restore();
    });
  });

  describe('handle activated tab', () => {
    const func = mjs.handleActivatedTab;

    it('should throw', async () => {
      await func({
        tabId: 'foo',
        windowId: 1
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should throw', async () => {
      await func({
        tabId: 1,
        windowId: 'foo'
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should not set class', async () => {
      const i = browser.tabs.get.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      const info = {
        tabId: browser.tabs.TAB_ID_NONE,
        windowId: browser.windows.WINDOW_ID_CURRENT + 1
      };
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(ACTIVE);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
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
      mjs.sidebar.windowId = 1;
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called');
      assert.isFalse(parent.classList.contains(ACTIVE), 'add class');
      assert.isFalse(heading.classList.contains(ACTIVE), 'add class');
      assert.isFalse(elm.classList.contains(ACTIVE), 'add class');
      assert.isFalse(elm.classList.contains(HIGHLIGHTED), 'add class');
      assert.isTrue(parent2.classList.contains(ACTIVE), 'remove class');
      assert.isFalse(heading2.classList.contains(ACTIVE), 'remove class');
      assert.isTrue(elm2.classList.contains(ACTIVE), 'remove class');
      assert.isTrue(elm2.classList.contains(HIGHLIGHTED), 'remove class');
      assert.isNull(res, 'result');
    });

    it('should not set class', async () => {
      const i = browser.tabs.get.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      const info = {
        tabId: browser.tabs.TAB_ID_NONE,
        windowId: browser.windows.WINDOW_ID_CURRENT
      };
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(ACTIVE);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
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
      mjs.sidebar.windowId = 1;
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called');
      assert.isFalse(parent.classList.contains(ACTIVE), 'add class');
      assert.isFalse(heading.classList.contains(ACTIVE), 'add class');
      assert.isFalse(elm.classList.contains(ACTIVE), 'add class');
      assert.isFalse(elm.classList.contains(HIGHLIGHTED), 'add class');
      assert.isTrue(parent2.classList.contains(ACTIVE), 'remove class');
      assert.isFalse(heading2.classList.contains(ACTIVE), 'remove class');
      assert.isTrue(elm2.classList.contains(ACTIVE), 'remove class');
      assert.isTrue(elm2.classList.contains(HIGHLIGHTED), 'remove class');
      assert.isNull(res, 'result');
    });

    it('should not set class', async () => {
      const i = browser.tabs.get.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      const info = {
        tabId: 3,
        windowId: browser.windows.WINDOW_ID_CURRENT
      };
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(ACTIVE);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
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
      mjs.sidebar.windowId = 1;
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called');
      assert.isFalse(parent.classList.contains(ACTIVE), 'add class');
      assert.isFalse(heading.classList.contains(ACTIVE), 'add class');
      assert.isFalse(elm.classList.contains(ACTIVE), 'add class');
      assert.isFalse(elm.classList.contains(HIGHLIGHTED), 'add class');
      assert.isTrue(parent2.classList.contains(ACTIVE), 'remove class');
      assert.isFalse(heading2.classList.contains(ACTIVE), 'remove class');
      assert.isTrue(elm2.classList.contains(ACTIVE), 'remove class');
      assert.isTrue(elm2.classList.contains(HIGHLIGHTED), 'remove class');
      assert.isNull(res, 'result');
    });

    it('should not set class', async () => {
      const i = browser.tabs.get.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      const info = {
        tabId: 3,
        windowId: 1
      };
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(ACTIVE);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
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
      mjs.sidebar.windowId = 1;
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called');
      assert.isFalse(parent.classList.contains(ACTIVE), 'add class');
      assert.isFalse(heading.classList.contains(ACTIVE), 'add class');
      assert.isFalse(elm.classList.contains(ACTIVE), 'add class');
      assert.isFalse(elm.classList.contains(HIGHLIGHTED), 'add class');
      assert.isTrue(parent2.classList.contains(ACTIVE), 'remove class');
      assert.isFalse(heading2.classList.contains(ACTIVE), 'remove class');
      assert.isTrue(elm2.classList.contains(ACTIVE), 'remove class');
      assert.isTrue(elm2.classList.contains(HIGHLIGHTED), 'remove class');
      assert.isNull(res, 'result');
    });

    it('should set class', async () => {
      const i = browser.tabs.get.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      const info = {
        tabId: 1,
        windowId: 1
      };
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.query.resolves([1]);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(ACTIVE);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
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
      mjs.sidebar.windowId = 1;
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called');
      assert.strictEqual(elm.dataset.tab, '{}', 'dataset');
      assert.isTrue(parent.classList.contains(ACTIVE), 'add class');
      assert.isFalse(heading.classList.contains(ACTIVE), 'add class');
      assert.isTrue(elm.classList.contains(ACTIVE), 'add class');
      assert.isTrue(elm.classList.contains(HIGHLIGHTED), 'add class');
      assert.isFalse(parent2.classList.contains(ACTIVE), 'remove class');
      assert.isFalse(heading2.classList.contains(ACTIVE), 'remove class');
      assert.isFalse(elm2.classList.contains(ACTIVE), 'remove class');
      assert.isFalse(elm2.classList.contains(HIGHLIGHTED), 'remove class');
      assert.isUndefined(res, 'result');
    });

    it('should set class', async () => {
      const i = browser.tabs.get.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      const info = {
        tabId: 1,
        windowId: 1
      };
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.query.resolves([1]);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(ACTIVE);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
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
      mjs.sidebar.windowId = 1;
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called');
      assert.strictEqual(elm.dataset.tab, '{}', 'dataset');
      assert.isTrue(parent.classList.contains(ACTIVE), 'add class');
      assert.isTrue(heading.classList.contains(ACTIVE), 'add class');
      assert.isTrue(elm.classList.contains(ACTIVE), 'add class');
      assert.isTrue(elm.classList.contains(HIGHLIGHTED), 'add class');
      assert.isFalse(parent2.classList.contains(ACTIVE), 'remove class');
      assert.isFalse(heading2.classList.contains(ACTIVE), 'remove class');
      assert.isFalse(elm2.classList.contains(ACTIVE), 'remove class');
      assert.isFalse(elm2.classList.contains(HIGHLIGHTED), 'remove class');
      assert.isUndefined(res, 'result');
    });
  });

  describe('handle created tab', () => {
    const func = mjs.handleCreatedTab;
    beforeEach(() => {
      const body = document.querySelector('body');
      const tmpl = document.createElement('template');
      tmpl.id = 'tab-container-template';
      const sect = document.createElement('section');
      sect.classList.add('tab-container');
      sect.dataset.tabControls = '';
      sect.setAttribute('hidden', 'hidden');
      const h1 = document.createElement('h1');
      h1.classList.add(CLASS_HEADING);
      h1.setAttribute('hidden', 'hidden');
      sect.appendChild(h1);
      tmpl.content.appendChild(sect);
      body.appendChild(tmpl);
      const tmpl2 = document.createElement('template');
      tmpl2.id = 'tab-template';
      const div = document.createElement('div');
      div.classList.add('tab');
      div.draggable = true;
      div.dataset.tabId = '';
      div.dataset.tab = '';
      const span = document.createElement('span');
      span.classList.add('tab-context');
      span.setAttribute('title', '');
      const img = document.createElement('img');
      img.classList.add('tab-toggle-icon');
      img.src = '';
      img.alt = '';
      span.appendChild(img);
      div.appendChild(span);
      const span2 = document.createElement('span');
      span2.classList.add('tab-content');
      span2.setAttribute('title', '');
      const img2 = document.createElement('img');
      img2.classList.add('tab-icon');
      img2.src = '';
      img2.alt = '';
      img2.dataset.connecting = '';
      span2.appendChild(img2);
      const span2_1 = document.createElement('span');
      span2_1.classList.add('tab-title');
      span2.appendChild(span2_1);
      div.appendChild(span2);
      const span3 = document.createElement('span');
      span3.classList.add('tab-audio');
      span3.setAttribute('title', '');
      const img3 = document.createElement('img');
      img3.classList.add('tab-audio-icon');
      img3.src = '';
      img3.alt = '';
      span3.appendChild(img3);
      div.appendChild(span3);
      const span4 = document.createElement('span');
      span4.classList.add('tab-ident');
      span4.setAttribute('title', '');
      const img4 = document.createElement('img');
      img4.classList.add('tab-ident-icon');
      img4.src = '';
      img4.alt = '';
      span4.appendChild(img4);
      div.appendChild(span4);
      const span5 = document.createElement('span');
      span5.classList.add('tab-close');
      span5.setAttribute('title', '');
      const img5 = document.createElement('img');
      img5.classList.add('tab-close-icon');
      img5.src = '';
      img5.alt = '';
      span5.appendChild(img5);
      div.appendChild(span5);
      const span6 = document.createElement('span');
      span6.classList.add('tab-pinned');
      const img6 = document.createElement('img');
      img6.classList.add('tab-pinned-icon');
      img6.src = '';
      img6.alt = '';
      span6.appendChild(img6);
      div.appendChild(span6);
      tmpl2.content.appendChild(div);
      body.appendChild(tmpl2);
      const pinned = document.createElement('section');
      pinned.id = PINNED;
      body.appendChild(pinned);
      const newTab = document.createElement('section');
      newTab.id = NEW_TAB;
      body.appendChild(newTab);
      mjs.sidebar.incognito = false;
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.sidebar.incognito = false;
      mjs.userOpts.clear();
    });

    it('should throw', async () => {
      await func({
        id: 'foo',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should throw', async () => {
      await func({
        id: 1,
        windowId: 'foo',
        mutedInfo: {
          muted: false
        }
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should not create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 2,
        mutedInfo: {
          muted: false
        }
      };
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.strictEqual(browser.i18n.getMessage.callCount, i, 'not called');
      assert.isNotOk(elm, 'not created');
      assert.deepEqual(res, [], 'result');
    });

    it('should create element, but hide', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        hidden: true,
        id: 1,
        index: 0,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      const tabItems = [
        CLASS_TAB_CONTEXT, CLASS_TAB_TOGGLE_ICON, CLASS_TAB_CONTENT,
        CLASS_TAB_TITLE, CLASS_TAB_AUDIO, CLASS_TAB_CLOSE, CLASS_TAB_CLOSE_ICON
      ];
      assert.isOk(elm, 'created');
      assert.isTrue(elm.hasAttribute('hidden'), 'hidden');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
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
            assert.strictEqual(item.title, 'foo', `item ${tabItem}`);
            break;
          case CLASS_TAB_TITLE:
            assert.strictEqual(item.textContent, 'foo', `item ${tabItem}`);
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
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        hidden: false,
        id: 1,
        index: 0,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      const tabItems = [
        CLASS_TAB_CONTEXT, CLASS_TAB_TOGGLE_ICON, CLASS_TAB_CONTENT,
        CLASS_TAB_TITLE, CLASS_TAB_AUDIO, CLASS_TAB_CLOSE, CLASS_TAB_CLOSE_ICON
      ];
      assert.isOk(elm, 'created');
      assert.isFalse(elm.hasAttribute('hidden'), 'hidden');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
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
            assert.strictEqual(item.title, 'foo', `item ${tabItem}`);
            break;
          case CLASS_TAB_TITLE:
            assert.strictEqual(item.textContent, 'foo', `item ${tabItem}`);
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
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: true,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      browser.tabs.get.withArgs(1).resolves(tabsTab);
      browser.tabs.query.resolves([1]);
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.classList.contains(ACTIVE), 'class');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: true,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 6, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: true
        }
      };
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 6, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: 'foo',
        id: 1,
        index: 0,
        pinned: false,
        status: 'complete',
        title: 'bar',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      browser.contextualIdentities.get.withArgs('foo').resolves(null);
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const stubErr = sinon.stub(console, 'error');
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: 'foo',
        id: 1,
        index: 0,
        pinned: false,
        status: 'complete',
        title: 'bar',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      browser.contextualIdentities.get.withArgs('foo')
        .rejects(new Error('error'));
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isTrue(errCalled, 'called error');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: 'foo',
        id: 1,
        index: 0,
        pinned: false,
        status: 'complete',
        title: 'bar',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      browser.contextualIdentities.get.withArgs('foo').resolves({
        color: 'red',
        icon: 'fingerprint',
        name: 'baz'
      });
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: 'foo',
        id: 1,
        index: 0,
        pinned: false,
        status: 'complete',
        title: 'bar',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      mjs.sidebar.incognito = true;
      mjs.sidebar.windowId = 1;
      browser.contextualIdentities.get.withArgs('foo').resolves({
        color: 'red',
        icon: 'fingerprint',
        name: 'baz'
      });
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        pinned: true,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const pinned = document.getElementById(PINNED);
      pinned.classList.add(CLASS_TAB_CONTAINER);
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.classList.contains(PINNED), 'pinned');
      assert.isTrue(elm.draggable, 'draggable');
      assert.isTrue(elm.parentNode === pinned, 'parent');
      assert.isTrue(elm === pinned.firstElementChild, 'position');
      assert.isFalse(pinned.classList.contains(CLASS_TAB_GROUP), 'group');
      assert.strictEqual(pinned.childElementCount, 1, 'count');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        pinned: true,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const pinned = document.getElementById(PINNED);
      const child = document.createElement('div');
      pinned.classList.add(CLASS_TAB_CONTAINER);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      pinned.appendChild(child);
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.classList.contains(PINNED), 'pinned');
      assert.isTrue(elm.draggable, 'draggable');
      assert.isTrue(elm.parentNode === pinned, 'parent');
      assert.isTrue(elm === pinned.firstElementChild, 'position');
      assert.isTrue(pinned.classList.contains(CLASS_TAB_GROUP), 'group');
      assert.strictEqual(pinned.childElementCount, 2, 'count');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        pinned: true,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const pinned = document.getElementById(PINNED);
      const child = document.createElement('div');
      pinned.classList.add(CLASS_TAB_CONTAINER);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      pinned.appendChild(child);
      mjs.userOpts.set(TAB_GROUP_NEW_TAB_AT_END, true); ;
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.classList.contains(PINNED), 'pinned');
      assert.isTrue(elm.draggable, 'draggable');
      assert.isTrue(elm.parentNode === pinned, 'parent');
      assert.isTrue(elm === pinned.firstElementChild, 'position');
      assert.isTrue(pinned.classList.contains(CLASS_TAB_GROUP), 'group');
      assert.strictEqual(pinned.childElementCount, 2, 'count');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: true,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const pinned = document.getElementById(PINNED);
      const child = document.createElement('div');
      pinned.classList.add(CLASS_TAB_CONTAINER);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      pinned.appendChild(child);
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.classList.contains(PINNED), 'pinned');
      assert.isTrue(elm.draggable, 'draggable');
      assert.isTrue(elm.parentNode === pinned, 'parent');
      assert.isTrue(elm === pinned.lastElementChild, 'position');
      assert.isTrue(pinned.classList.contains(CLASS_TAB_GROUP), 'group');
      assert.strictEqual(pinned.childElementCount, 2, 'count');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: true,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const pinned = document.getElementById(PINNED);
      const child = document.createElement('div');
      const child2 = document.createElement('div');
      pinned.classList.add(CLASS_TAB_CONTAINER);
      pinned.classList.add(CLASS_TAB_GROUP);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      pinned.appendChild(child);
      pinned.appendChild(child2);
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.classList.contains(PINNED), 'pinned');
      assert.isTrue(elm.draggable, 'draggable');
      assert.isTrue(elm.parentNode === pinned, 'parent');
      assert.isTrue(elm.previousElementSibling === child, 'position');
      assert.isTrue(elm.nextElementSibling === child2, 'position');
      assert.isTrue(pinned.classList.contains(CLASS_TAB_GROUP), 'group');
      assert.strictEqual(pinned.childElementCount, 3, 'count');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 2,
        pinned: true,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const pinned = document.getElementById(PINNED);
      const child = document.createElement('div');
      const child2 = document.createElement('div');
      pinned.classList.add(CLASS_TAB_CONTAINER);
      pinned.classList.add(CLASS_TAB_GROUP);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      pinned.appendChild(child);
      pinned.appendChild(child2);
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.classList.contains(PINNED), 'pinned');
      assert.isTrue(elm.draggable, 'draggable');
      assert.isTrue(elm.parentNode === pinned, 'parent');
      assert.isTrue(elm.previousElementSibling === child2, 'position');
      assert.isTrue(pinned.lastElementChild === elm, 'position');
      assert.isTrue(pinned.classList.contains(CLASS_TAB_GROUP), 'group');
      assert.strictEqual(pinned.childElementCount, 3, 'count');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: true,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const pinned = document.getElementById(PINNED);
      const div = document.createElement('div');
      const child = document.createElement('div');
      const child2 = document.createElement('div');
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      pinned.classList.add(CLASS_TAB_CONTAINER);
      div.classList.add(CLASS_TAB_CONTAINER);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      pinned.appendChild(child);
      div.appendChild(child2);
      body.insertBefore(div, newTab);
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.classList.contains(PINNED), 'pinned');
      assert.isTrue(elm.draggable, 'draggable');
      assert.isTrue(elm.parentNode === pinned, 'parent');
      assert.isTrue(elm === pinned.lastElementChild, 'position');
      assert.isTrue(pinned.classList.contains(CLASS_TAB_GROUP), 'group');
      assert.strictEqual(pinned.childElementCount, 2, 'count');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const child = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      parent.appendChild(child);
      body.insertBefore(parent, newTab);
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab, {
        emulate: true
      });
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isFalse(elm.parentNode.hasAttribute('hidden'), 'hidden attr');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const child = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      parent.appendChild(child);
      body.insertBefore(parent, newTab);
      mjs.sidebar.windowId = 1;
      const res = await func(tabsTab, {
        attached: true
      });
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isFalse(elm.parentNode.hasAttribute('hidden'), 'hidden attr');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const child = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const child2 = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      parent.appendChild(child);
      parent.appendChild(child2);
      body.insertBefore(parent, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(3).resolves({
        index: 1
      });
      const res = await func(tabsTab, {
        attached: true
      });
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 6, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.parentNode === parent, 'parent');
      assert.isFalse(parent.classList.contains(CLASS_TAB_COLLAPSED),
        'not collapsed');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, [undefined, undefined]
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 2,
        openerTabId: 2,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const child = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const child2 = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      parent.appendChild(child);
      parent2.appendChild(child2);
      body.insertBefore(parent, newTab);
      body.insertBefore(parent2, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(2).resolves({
        index: 0
      });
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.parentNode !== parent, 'parent');
      assert.isTrue(elm.parentNode !== parent2, 'parent');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        openerTabId: 2,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const child = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const child2 = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      parent.appendChild(child);
      parent.appendChild(child2);
      body.insertBefore(parent, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(3).resolves({
        index: 1
      });
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 6, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.parentNode === parent, 'parent');
      assert.isFalse(parent.classList.contains(CLASS_TAB_COLLAPSED),
        'not collapsed');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, [undefined, undefined], undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 0,
        openerTabId: 3,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const child = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const child2 = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      parent.appendChild(child);
      parent.appendChild(child2);
      body.insertBefore(parent, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(3).resolves({
        index: 1
      });
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.parentNode.nextElementSibling === parent, 'parent');
      assert.isTrue(parent.classList.contains(CLASS_TAB_COLLAPSED),
        'collapsed');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 2,
        openerTabId: 2,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const activeTabsTab = {
        active: true,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 2,
        index: 0,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const child = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const child2 = document.createElement('div');
      const span2 = document.createElement('span');
      const img2 = document.createElement('img');
      const child3 = document.createElement('div');
      const span3 = document.createElement('span');
      const img3 = document.createElement('img');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child.appendChild(span);
      span2.appendChild(img2);
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      child2.appendChild(span2);
      span3.appendChild(img3);
      child3.classList.add(TAB);
      child3.dataset.tabId = '4';
      child3.appendChild(span3);
      parent.appendChild(child);
      parent.appendChild(child2);
      parent2.appendChild(child3);
      body.insertBefore(parent, newTab);
      body.insertBefore(parent2, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(2).resolves({
        index: 0
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 1
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 2
      });
      browser.tabs.query.withArgs({
        windowId: 1,
        active: true,
        windowType: 'normal'
      }).resolves([activeTabsTab]);
      browser.tabs.query.withArgs({
        windowId: 1,
        highlighted: true,
        windowType: 'normal'
      }).resolves([2]);
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.parentNode === parent, 'parent');
      assert.isTrue(parent.classList.contains(CLASS_TAB_COLLAPSED),
        'collapsed');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
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
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const child = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const child2 = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      parent.appendChild(child);
      parent.appendChild(child2);
      body.insertBefore(parent, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.userOpts.set(TAB_GROUP_NEW_TAB_AT_END, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(2).resolves({
        index: 0
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2
      });
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.parentNode === parent, 'parent');
      assert.strictEqual(browser.tabs.move.callCount, j + 1, 'called move');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
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
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const child = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const child2 = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      parent.appendChild(child);
      parent.appendChild(child2);
      body.insertBefore(parent, newTab);
      mjs.userOpts.set(TAB_GROUP_NEW_TAB_AT_END, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(2).resolves({
        index: 0
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2
      });
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.parentNode === parent, 'parent');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called move');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        openerTabId: 2,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const child = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const child2 = document.createElement('div');
      const child3 = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      child3.classList.add(TAB);
      child3.dataset.tabId = '4';
      parent.appendChild(child);
      parent.appendChild(child2);
      parent.appendChild(child3);
      body.insertBefore(parent, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(4).resolves({
        index: 2
      });
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 6, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.parentNode === parent, 'parent');
      assert.isFalse(parent.classList.contains(CLASS_TAB_COLLAPSED),
        'not collapsed');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, [undefined, undefined], undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 2,
        openerTabId: 3,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const child = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const child2 = document.createElement('div');
      const child3 = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      child3.classList.add(TAB);
      child3.dataset.tabId = '4';
      parent.appendChild(child);
      parent.appendChild(child2);
      parent.appendChild(child3);
      body.insertBefore(parent, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(4).resolves({
        index: 2
      });
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 6, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.parentNode === parent, 'parent');
      assert.isFalse(parent.classList.contains(CLASS_TAB_COLLAPSED),
        'not collapsed');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, [undefined, undefined], undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const child = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const child2 = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      parent.appendChild(child);
      parent.appendChild(child2);
      body.insertBefore(parent, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(3).resolves({
        index: 1
      });
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 6, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.parentNode === parent, 'parent');
      assert.isFalse(parent.classList.contains(CLASS_TAB_COLLAPSED),
        'not collapsed');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, [undefined, undefined]
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const child = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const child2 = document.createElement('div');
      const child3 = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      child3.classList.add(TAB);
      child3.dataset.tabId = '4';
      parent.appendChild(child);
      parent.appendChild(child2);
      parent.appendChild(child3);
      body.insertBefore(parent, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(4).resolves({
        index: 2
      });
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 6, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isTrue(elm.parentNode === parent, 'parent');
      assert.isFalse(parent.classList.contains(CLASS_TAB_COLLAPSED),
        'not collapsed');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, [undefined, undefined]
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const child = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const child2 = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      parent.appendChild(child);
      parent.appendChild(child2);
      body.insertBefore(parent, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(3).resolves({
        index: 1
      });
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isFalse(elm.parentNode === parent, 'parent');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });

    it('should create element', async () => {
      const i = browser.i18n.getMessage.callCount;
      const tabsTab = {
        active: false,
        audible: false,
        cookieStoreId: COOKIE_STORE_DEFAULT,
        id: 1,
        index: 1,
        pinned: false,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        mutedInfo: {
          muted: false
        }
      };
      const parent = document.createElement('section');
      const child = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const child2 = document.createElement('div');
      const child3 = document.createElement('div');
      const body = document.querySelector('body');
      const newTab = document.getElementById(NEW_TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      span.appendChild(img);
      child.classList.add(TAB);
      child.dataset.tabId = '2';
      child.appendChild(span);
      child2.classList.add(TAB);
      child2.dataset.tabId = '3';
      child3.classList.add(TAB);
      child3.dataset.tabId = '4';
      parent.appendChild(child);
      parent.appendChild(child2);
      parent.appendChild(child3);
      body.insertBefore(parent, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(4).resolves({
        index: 2
      });
      const res = await func(tabsTab);
      const elm = document.querySelector('[data-tab-id="1"]');
      assert.isOk(elm, 'created');
      assert.strictEqual(browser.i18n.getMessage.callCount, i + 4, 'called');
      assert.strictEqual(elm.dataset.tabId, '1', 'id');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tab');
      assert.isFalse(elm.parentNode === parent, 'parent');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });
  });

  describe('handle attached tab', () => {
    const func = mjs.handleAttachedTab;
    beforeEach(() => {
      const body = document.querySelector('body');
      const tmpl = document.createElement('template');
      tmpl.id = 'tab-container-template';
      const sect = document.createElement('section');
      sect.classList.add('tab-container');
      sect.dataset.tabControls = '';
      sect.setAttribute('hidden', 'hidden');
      tmpl.content.appendChild(sect);
      body.appendChild(tmpl);
      const tmpl2 = document.createElement('template');
      tmpl2.id = 'tab-template';
      const div = document.createElement('div');
      div.classList.add('tab');
      div.draggable = true;
      div.dataset.tabId = '';
      div.dataset.tab = '';
      const span = document.createElement('span');
      span.classList.add('tab-context');
      span.setAttribute('title', '');
      const img = document.createElement('img');
      img.classList.add('tab-toggle-icon');
      img.src = '';
      img.alt = '';
      span.appendChild(img);
      div.appendChild(span);
      const span2 = document.createElement('span');
      span2.classList.add('tab-content');
      span2.setAttribute('title', '');
      const img2 = document.createElement('img');
      img2.classList.add('tab-icon');
      img2.src = '';
      img2.alt = '';
      img2.dataset.connecting = '';
      span2.appendChild(img2);
      const span2_1 = document.createElement('span');
      span2_1.classList.add('tab-title');
      span2.appendChild(span2_1);
      div.appendChild(span2);
      const span3 = document.createElement('span');
      span3.classList.add('tab-audio');
      span3.setAttribute('title', '');
      const img3 = document.createElement('img');
      img3.classList.add('tab-audio-icon');
      img3.src = '';
      img3.alt = '';
      span3.appendChild(img3);
      div.appendChild(span3);
      const span4 = document.createElement('span');
      span4.classList.add('tab-ident');
      span4.setAttribute('title', '');
      const img4 = document.createElement('img');
      img4.classList.add('tab-ident-icon');
      img4.src = '';
      img4.alt = '';
      span4.appendChild(img4);
      div.appendChild(span4);
      const span5 = document.createElement('span');
      span5.classList.add('tab-close');
      span5.setAttribute('title', '');
      const img5 = document.createElement('img');
      img5.classList.add('tab-close-icon');
      img5.src = '';
      img5.alt = '';
      span5.appendChild(img5);
      div.appendChild(span5);
      const span6 = document.createElement('span');
      span6.classList.add('tab-pinned');
      const img6 = document.createElement('img');
      img6.classList.add('tab-pinned-icon');
      img6.src = '';
      img6.alt = '';
      span6.appendChild(img6);
      div.appendChild(span6);
      tmpl2.content.appendChild(div);
      body.appendChild(tmpl2);
      const pinned = document.createElement('section');
      pinned.id = PINNED;
      body.appendChild(pinned);
      const newTab = document.createElement('section');
      newTab.id = NEW_TAB;
      body.appendChild(newTab);
    });

    it('should throw', async () => {
      await func('foo', {}).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should throw', async () => {
      await func(1, {
        newPosition: 'foo',
        newWindowId: 1
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should throw', async () => {
      await func(1, {
        newPosition: 1,
        newWindowId: 'foo'
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should not call function', async () => {
      const info = {
        newPosition: 0,
        newWindowId: 1
      };
      const i = browser.tabs.get.callCount;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        id: 1,
        mutedInfo: {}
      });
      const res = await func(browser.tabs.TAB_ID_NONE, info);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const info = {
        newPosition: 0,
        newWindowId: 2
      };
      const i = browser.tabs.get.callCount;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        id: 1,
        mutedInfo: {}
      });
      const res = await func(1, info);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const info = {
        newPosition: 0,
        newWindowId: 1
      };
      const i = browser.tabs.get.callCount;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        id: 1,
        mutedInfo: {},
        windowId: 1
      });
      const res = await func(1, info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called');
      assert.deepEqual(res, [
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined
      ], 'result');
    });
  });

  describe('handle detached tab', () => {
    const func = mjs.handleDetachedTab;

    it('should throw', async () => {
      await func('foo', {}).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should throw', async () => {
      await func(1, {
        oldWindowId: 'foo'
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should not remove element', async () => {
      const info = {
        oldWindowId: 2
      };
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      await func(1, info);
      assert.deepEqual(elm.parentNode, body, 'not removed');
    });

    it('should remove element', async () => {
      const info = {
        oldWindowId: 1
      };
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      await func(1, info);
      assert.isNull(elm.parentNode, 'removed');
    });
  });

  describe('handle highlighted tab', () => {
    const func = mjs.handleHighlightedTab;

    it('should throw', async () => {
      await func({
        tabIds: 1,
        windowId: 1
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Number.',
          'throw');
      });
    });

    it('should throw', async () => {
      await func({
        tabIds: [],
        windowId: 'foo'
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should do nothing if window ID does not match', async () => {
      mjs.sidebar.windowId = 1;
      const res = await func({
        tabIds: [],
        windowId: 2
      });
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      body.appendChild(elm);
      body.appendChild(elm2);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        audible: false,
        mutedInfo: {
          muted: false
        }
      });
      browser.tabs.get.withArgs(2).resolves({
        audible: false,
        mutedInfo: {
          muted: false
        }
      });
      const res = await func({
        tabIds: [1],
        windowId: 1
      });
      assert.strictEqual(browser.tabs.get.callCount, i + 2, 'called');
      assert.isTrue(elm.classList.contains(HIGHLIGHTED), 'class');
      assert.isFalse(elm2.classList.contains(HIGHLIGHTED), 'remove class');
      assert.deepEqual(res, [
        [
          [undefined, undefined]
        ],
        [
          [undefined, undefined]
        ]
      ], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        audible: false,
        mutedInfo: {
          muted: false
        }
      });
      browser.tabs.get.withArgs(2).resolves({
        audible: false,
        mutedInfo: {
          muted: false
        }
      });
      browser.tabs.get.withArgs(3).resolves({
        audible: false,
        mutedInfo: {
          muted: false
        }
      });
      const res = await func({
        tabIds: [1, 3],
        windowId: 1
      });
      assert.strictEqual(browser.tabs.get.callCount, i + 3, 'called');
      assert.isTrue(elm.classList.contains(HIGHLIGHTED), 'class');
      assert.isFalse(elm2.classList.contains(HIGHLIGHTED), 'remove class');
      assert.isTrue(elm3.classList.contains(HIGHLIGHTED), 'add class');
      assert.deepEqual(res, [
        [
          [undefined, undefined],
          [undefined, undefined]
        ],
        [
          [undefined, undefined]
        ]
      ], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        audible: false,
        mutedInfo: {
          muted: false
        }
      });
      browser.tabs.get.withArgs(2).resolves({
        audible: false,
        mutedInfo: {
          muted: false
        }
      });
      const res = await func({
        tabIds: [1, 2],
        windowId: 1
      });
      assert.strictEqual(browser.tabs.get.callCount, i + 2, 'called');
      assert.isTrue(elm.classList.contains(HIGHLIGHTED), 'class');
      assert.isTrue(elm2.classList.contains(HIGHLIGHTED), 'class');
      assert.isFalse(elm3.classList.contains(HIGHLIGHTED), 'class');
      assert.deepEqual(res, [
        [
          [undefined, undefined],
          [undefined, undefined]
        ],
        []
      ], 'result');
    });
  });

  describe('handle moved tab', () => {
    const func = mjs.handleMovedTab;
    beforeEach(() => {
      const body = document.querySelector('body');
      const tmpl = document.createElement('template');
      tmpl.id = 'tab-container-template';
      const sect = document.createElement('section');
      sect.classList.add('tab-container');
      sect.dataset.tabControls = '';
      sect.setAttribute('hidden', 'hidden');
      tmpl.content.appendChild(sect);
      body.appendChild(tmpl);
      const newTab = document.createElement('section');
      newTab.id = NEW_TAB;
      body.appendChild(newTab);
      mjs.ports.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
    });

    it('should throw', async () => {
      await func('foo', {
        fromIndex: 0,
        toIndex: 1,
        windowId: 1
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should throw', async () => {
      await func(1, {
        fromIndex: 'foo',
        toIndex: 1,
        windowId: 1
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should throw', async () => {
      await func(1, {
        fromIndex: 0,
        toIndex: 'foo',
        windowId: 1
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should throw', async () => {
      await func(1, {
        fromIndex: 0,
        toIndex: 1,
        windowId: 'foo'
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should get null if window ID does not match', async () => {
      const windowId = 2;
      mjs.sidebar.windowId = 1;
      const res = await func(1, {
        windowId,
        fromIndex: 0,
        toIndex: 1
      });
      assert.isNull(res, 'result');
    });

    it('should get null if tab not found', async () => {
      mjs.sidebar.windowId = 1;
      const res = await func(1, {
        fromIndex: 0,
        toIndex: 1,
        windowId: 1
      });
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_2`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const res = await func(1, {
        fromIndex: 1,
        toIndex: 0,
        windowId: 1
      });
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should remove value', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const parent = document.createElement('section');
      const elm = document.createElement('div');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.restore = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        pinned: false
      });
      const res = await func(1, {
        fromIndex: 1,
        toIndex: 0,
        windowId: 1
      });
      assert.strictEqual(elm.dataset.restore, '', 'restore');
      assert.deepEqual(elm.dataset.tab, JSON.stringify({
        index: 0,
        pinned: false
      }), 'tabsTab');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should remove value', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const parent = document.createElement('section');
      const elm = document.createElement('div');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm.dataset.group = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        pinned: false,
        url: 'https://example.com'
      });
      const res = await func(1, {
        fromIndex: 1,
        toIndex: 0,
        windowId: 1
      });
      assert.strictEqual(elm.dataset.group, '', 'restore');
      assert.deepEqual(elm.dataset.tab, JSON.stringify({
        index: 0,
        pinned: false,
        url: 'https://example.com'
      }), 'tabsTab');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not move', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      body.appendChild(parent);
      body.appendChild(parent2);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        pinned: false
      });
      const res = await func(1, {
        fromIndex: 1,
        toIndex: 0,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ['1', '2'], 'not move');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should set value', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const parent3 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 1,
        pinned: false
      });
      const res = await func(1, {
        fromIndex: 0,
        toIndex: 2,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(mjs.sidebar.tabsWaitingToMove, [undefined, {
        index: 1,
        tabId: 1,
        toIndex: 2
      }], 'wait');
      assert.deepEqual(items, ['1', '2', '3'], 'not move');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should set value', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const parent = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED, CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB, PINNED);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(parent);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 1,
        pinned: true
      });
      const res = await func(1, {
        fromIndex: 0,
        toIndex: 2,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(mjs.sidebar.pinnedTabsWaitingToMove, [undefined, {
        index: 1,
        tabId: 1,
        toIndex: 2
      }], 'wait');
      assert.deepEqual(items, ['1', '2', '3'], 'not move');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.isNull(res, 'result');
    });

    // pinned
    it('should move', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const parent = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED, CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB, PINNED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(parent);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(3).resolves({
        index: 1,
        pinned: true
      });
      const res = await func(3, {
        fromIndex: 2,
        toIndex: 1,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ['1', '3', '2'], 'move');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should move', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const parent = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED, CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB, PINNED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(parent);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(2).resolves({
        index: 2,
        pinned: true
      });
      const res = await func(2, {
        fromIndex: 1,
        toIndex: 2,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ['1', '3', '2'], 'move');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should move', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const parent = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED, CLASS_TAB_CONTAINER);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB, PINNED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(parent);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(2).resolves({
        index: 2,
        pinned: true
      });
      mjs.sidebar.pinnedTabsWaitingToMove = [undefined, {
        index: 1,
        tabId: 1,
        toIndex: 2
      }];
      const res = await func(2, {
        fromIndex: 1,
        toIndex: 2,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ['3', '1', '2'], 'move');
      assert.isNull(mjs.sidebar.tabsWaitingToMove, 'wait');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    // group
    it('should move', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const parent3 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar'
      });
      elm3.dataset.group = '1';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(3).resolves({
        index: 1,
        pinned: false
      });
      const res = await func(3, {
        fromIndex: 2,
        toIndex: 1,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ['1', '3', '2'], 'move');
      assert.isTrue(elm.parentNode === elm3.parentNode, 'group');
      assert.strictEqual(elm3.dataset.group, '', 'value');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should move', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const parent3 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm.dataset.group = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar'
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 1,
        pinned: false
      });
      const res = await func(1, {
        fromIndex: 0,
        toIndex: 1,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ['2', '1', '3'], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'group');
      assert.strictEqual(elm.dataset.group, '', 'value');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should move', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const parent3 = document.createElement('section');
      const parent4 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      parent4.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz'
      });
      elm4.dataset.group = '2';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      mjs.sidebar.windowId = 1;
      mjs.sidebar.tabsWaitingToMove = [undefined, {
        index: 1,
        tabId: 1,
        toIndex: 2
      }];
      browser.tabs.get.withArgs(4).resolves({
        index: 2,
        pinned: false
      });
      const res = await func(4, {
        fromIndex: 3,
        toIndex: 2,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ['2', '1', '4', '3'], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'group');
      assert.isTrue(elm4.parentNode === elm2.parentNode, 'group');
      assert.strictEqual(elm4.dataset.group, '', 'value');
      assert.isNull(mjs.sidebar.tabsWaitingToMove, 'wait');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    // grouped tab
    it('should move', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const tmpl = document.createElement('template');
      const cnt = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_GROUP, CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(3).resolves({
        index: 1,
        pinned: false
      });
      const res = await func(3, {
        fromIndex: 2,
        toIndex: 1,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ['1', '3', '2'], 'move');
      assert.isTrue(elm.parentNode === elm3.parentNode, 'parent');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should move', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const tmpl = document.createElement('template');
      const cnt = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_GROUP, CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 1,
        pinned: false
      });
      const res = await func(1, {
        fromIndex: 0,
        toIndex: 1,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ['2', '1', '3'], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'parent');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should move', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const tmpl = document.createElement('template');
      const cnt = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const parent3 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP, CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz'
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      parent3.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      mjs.sidebar.windowId = 1;
      mjs.sidebar.tabsWaitingToMove = [undefined, {
        index: 1,
        tabId: 1,
        toIndex: 2
      }];
      browser.tabs.get.withArgs(4).resolves({
        index: 2,
        pinned: false
      });
      const res = await func(4, {
        fromIndex: 3,
        toIndex: 2,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ['2', '1', '4', '3'], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'parent');
      assert.isTrue(elm4.parentNode === elm2.parentNode, 'parent');
      assert.isNull(mjs.sidebar.tabsWaitingToMove, 'wait');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should move', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const tmpl = document.createElement('template');
      const cnt = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const parent3 = document.createElement('section');
      const parent4 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      parent4.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz'
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(4).resolves({
        index: 2,
        pinned: false
      });
      const res = await func(4, {
        fromIndex: 3,
        toIndex: 2,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ['1', '2', '4', '3'], 'move');
      assert.isTrue(elm4.parentNode !== elm2.parentNode, 'parent');
      assert.isTrue(elm4.parentNode !== elm3.parentNode, 'parent');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should move', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const tmpl = document.createElement('template');
      const cnt = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const parent3 = document.createElement('section');
      const parent4 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      parent4.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz'
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 2,
        pinned: false
      });
      const res = await func(1, {
        fromIndex: 0,
        toIndex: 2,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ['2', '3', '1', '4'], 'move');
      assert.isTrue(elm.parentNode !== elm3.parentNode, 'parent');
      assert.isTrue(elm.parentNode !== elm4.parentNode, 'parent');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should move', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const tmpl = document.createElement('template');
      const cnt = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const parent3 = document.createElement('section');
      const parent4 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent3.classList.add(CLASS_TAB_CONTAINER);
      parent4.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://example.com/baz'
      });
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      mjs.sidebar.windowId = 1;
      mjs.sidebar.tabsWaitingToMove = [undefined, {
        index: 1,
        tabId: 1,
        toIndex: 2
      }];
      browser.tabs.get.withArgs(4).resolves({
        index: 2,
        pinned: false
      });
      const res = await func(4, {
        fromIndex: 3,
        toIndex: 2,
        windowId: 1
      });
      const items = Array.from(body.querySelectorAll(`.${TAB}`))
        .map(obj => obj.dataset.tabId);
      assert.deepEqual(items, ['2', '1', '4', '3'], 'move');
      assert.isTrue(elm.parentNode !== elm2.parentNode, 'parent');
      assert.isTrue(elm.parentNode !== elm4.parentNode, 'parent');
      assert.isTrue(elm4.parentNode !== elm3.parentNode, 'parent');
      assert.isNull(mjs.sidebar.tabsWaitingToMove, 'wait');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('handle removed tab', () => {
    const func = mjs.handleRemovedTab;

    it('should throw', async () => {
      await func('foo', {}).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should throw', async () => {
      await func(1, {
        isWindowClosing: false,
        windowId: 'foo'
      }).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should not remove', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      await func(1, {
        isWindowClosing: false,
        windowId: 2
      });
      assert.isTrue(elm.parentNode === body, 'not removed');
    });

    it('should not remove', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      await func(1, {
        isWindowClosing: true,
        windowId: 1
      });
      assert.isTrue(elm.parentNode === body, 'not removed');
    });

    it('should not remove', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      await func(2, {
        isWindowClosing: false,
        windowId: 1
      });
      assert.isTrue(elm.parentNode === body, 'not removed');
    });

    it('should not remove', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      mjs.sidebar.windowId = 1;
      await func(1, {
        isWindowClosing: false,
        windowId: 1
      });
      assert.isFalse(elm.parentNode === body, 'removed');
      assert.strictEqual(body.childElementCount, 0, 'child count');
    });
  });

  describe('handle updated tab', () => {
    const func = mjs.handleUpdatedTab;
    beforeEach(() => {
      const tab = document.createElement('div');
      tab.classList.add('tab');
      tab.dataset.tabId = '1';
      tab.dataset.tab = '';
      const context = document.createElement('span');
      context.classList.add('tab-context');
      context.title = '';
      const toggleIcon = document.createElement('img');
      toggleIcon.classList.add('tab-toggle-icon');
      toggleIcon.src = '';
      toggleIcon.alt = '';
      context.appendChild(toggleIcon);
      tab.appendChild(context);
      const content = document.createElement('span');
      content.classList.add('tab-content');
      content.title = '';
      const tabIcon = document.createElement('img');
      tabIcon.classList.add('tab-icon');
      tabIcon.src = '';
      tabIcon.alt = '';
      tabIcon.dataset.connecting = '';
      content.appendChild(tabIcon);
      const title = document.createElement('span');
      title.classList.add('tab-title');
      content.appendChild(title);
      tab.appendChild(content);
      const audio = document.createElement('span');
      audio.classList.add('tab-audio');
      audio.title = '';
      const audioIcon = document.createElement('img');
      audioIcon.classList.add('tab-audio-icon');
      audioIcon.src = '';
      audioIcon.alt = '';
      audio.appendChild(audioIcon);
      tab.appendChild(audio);
      const ident = document.createElement('span');
      ident.classList.add('tab-ident');
      ident.title = '';
      const identIcon = document.createElement('img');
      identIcon.classList.add('tab-ident-icon');
      ident.src = '';
      ident.alt = '';
      ident.appendChild(identIcon);
      tab.appendChild(ident);
      const closeButton = document.createElement('span');
      closeButton.classList.add('tab-close');
      closeButton.title = '';
      const closeIcon = document.createElement('img');
      closeIcon.classList.add('tab-close-icon');
      closeIcon.src = '';
      closeIcon.alt = '';
      closeButton.appendChild(closeIcon);
      tab.appendChild(closeButton);
      const pinnedTab = document.createElement('span');
      pinnedTab.classList.add('tab-pinned');
      const pinnedIcon = document.createElement('img');
      pinnedIcon.classList.add('tab-pinned-icon');
      pinnedIcon.src = '';
      pinnedIcon.alt = '';
      pinnedTab.appendChild(pinnedIcon);
      tab.appendChild(pinnedTab);
      const sect = document.createElement('section');
      sect.classList.add(CLASS_TAB_CONTAINER);
      const h1 = document.createElement('h1');
      const label = document.createElement('span');
      h1.classList.add(CLASS_HEADING);
      label.classList.add(CLASS_HEADING_LABEL);
      h1.appendChild(label);
      sect.appendChild(h1);
      sect.appendChild(tab);
      const pinned = document.createElement('section');
      pinned.id = PINNED;
      pinned.classList.add('tab-container');
      const newTab = document.createElement('section');
      newTab.id = NEW_TAB;
      const body = document.querySelector('body');
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      sinon.stub(tab, 'getBoundingClientRect');
      sinon.stub(pinned, 'getBoundingClientRect').returns({
        top: 0,
        bottom: 100
      });
      sinon.stub(newTab, 'getBoundingClientRect').returns({
        top: 300,
        bottom: 400
      });
      mjs.ports.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
    });

    it('should throw', async () => {
      await func('foo', {}, {}).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should not update', async () => {
      mjs.sidebar.windowId = 1;
      const res = await func(1, {}, {
        windowId: 1
      });
      assert.deepEqual(res, [], 'result');
    });

    it('should not update', async () => {
      mjs.sidebar.windowId = 1;
      const res = await func(2, {}, {
        windowId: 1
      });
      assert.deepEqual(res, [], 'result');
    });

    it('should not update', async () => {
      mjs.sidebar.windowId = 1;
      const res = await func(2, {
        foo: 'bar'
      }, {});
      assert.deepEqual(res, [], 'result');
    });

    it('should not update', async () => {
      mjs.sidebar.windowId = 1;
      const res = await func(2, {
        foo: 'bar'
      }, {
        mutedInfo: {
          muted: false
        },
        windowId: 1
      });
      assert.deepEqual(res, [], 'result');
    });

    it('should not update', async () => {
      mjs.sidebar.windowId = 1;
      const res = await func(2, {
        foo: 'bar'
      }, {
        mutedInfo: {
          muted: false
        },
        windowId: browser.windows.WINDOW_ID_NONE
      });
      assert.deepEqual(res, [], 'result');
    });

    it('should update, not call function', async () => {
      const stubWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const info = {
        foo: 'bar'
      };
      const tabsTab = {
        discarded: false,
        index: 0,
        mutedInfo: {
          muted: false
        },
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1
      };
      mjs.sidebar.windowId = 1;
      const elm = document.querySelector('[data-tab-id="1"]');
      elm.getBoundingClientRect.returns({
        top: 100,
        bottom: 200
      });
      const res = await func(1, info, tabsTab);
      assert.isFalse(elm.classList.contains(DISCARDED), 'class');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tabsTab');
      assert.isFalse(stubWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should update, add class', async () => {
      const stubWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const elm = document.querySelector('[data-tab-id="1"]');
      elm.getBoundingClientRect.returns({
        top: 100,
        bottom: 200
      });
      const info = {
        hidden: true
      };
      const tabsTab = {
        discarded: true,
        index: 0,
        mutedInfo: {
          muted: false
        },
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1
      };
      mjs.sidebar.windowId = 1;
      const res = await func(1, info, tabsTab);
      assert.isTrue(elm.hasAttribute('hidden'), 'hidden');
      assert.isTrue(elm.classList.contains(DISCARDED), 'class');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tabsTab');
      assert.isFalse(stubWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should update, add class', async () => {
      const stubWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const elm = document.querySelector('[data-tab-id="1"]');
      elm.getBoundingClientRect.returns({
        top: 100,
        bottom: 200
      });
      const info = {
        hidden: false
      };
      const tabsTab = {
        discarded: false,
        index: 0,
        mutedInfo: {
          muted: false
        },
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1
      };
      elm.setAttribute('hidden', 'hidden');
      mjs.sidebar.windowId = 1;
      const res = await func(1, info, tabsTab);
      assert.isFalse(elm.hasAttribute('hidden'), 'hidden');
      assert.isFalse(elm.classList.contains(DISCARDED), 'class');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tabsTab');
      assert.isFalse(stubWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should update, not call function', async () => {
      const stubWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const info = {
        discarded: true
      };
      const tabsTab = {
        discarded: true,
        index: 0,
        mutedInfo: {
          muted: false
        },
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1
      };
      const elm = document.querySelector('[data-tab-id="1"]');
      elm.getBoundingClientRect.returns({
        top: 100,
        bottom: 200
      });
      mjs.sidebar.windowId = 1;
      const res = await func(1, info, tabsTab);
      assert.isTrue(elm.classList.contains(DISCARDED), 'class');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tabsTab');
      assert.isFalse(stubWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should update, not call function', async () => {
      const stubWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const info = {
        discarded: false
      };
      const tabsTab = {
        discarded: false,
        index: 0,
        mutedInfo: {
          muted: false
        },
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1
      };
      const elm = document.querySelector('[data-tab-id="1"]');
      elm.getBoundingClientRect.returns({
        top: 100,
        bottom: 200
      });
      elm.classList.add(DISCARDED);
      mjs.sidebar.windowId = 1;
      const res = await func(1, info, tabsTab);
      assert.isFalse(elm.classList.contains(DISCARDED), 'class');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tabsTab');
      assert.isFalse(stubWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should update, call function', async () => {
      const stubWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const info = {
        url: 'https://example.com'
      };
      const tabsTab = {
        discarded: false,
        id: 1,
        index: 0,
        mutedInfo: {
          muted: false
        },
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1
      };
      mjs.sidebar.windowId = 1;
      const res = await func(1, info, tabsTab);
      assert.isTrue(stubWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should not update, not call function', async () => {
      const stubWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const info = {
        url: null
      };
      const tabsTab = {
        discarded: false,
        id: 1,
        index: 0,
        mutedInfo: {
          muted: false
        },
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1
      };
      mjs.sidebar.windowId = 1;
      const res = await func(1, info, tabsTab);
      assert.isFalse(stubWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not update, not call function', async () => {
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.query.callCount;
      const j = browser.windows.getCurrent.callCount;
      const info = {
        status: 'loading'
      };
      const tabsTab = {
        active: true,
        discarded: false,
        id: 1,
        index: 0,
        mutedInfo: {
          muted: false
        },
        status: 'loading',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1
      };
      mjs.sidebar.windowId = 1;
      browser.tabs.query.withArgs({
        windowId: 1,
        active: true,
        windowType: 'normal'
      }).resolves([tabsTab]);
      browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const elm = document.querySelector('[data-tab-id="1"]');
      elm.getBoundingClientRect.returns({
        top: 100,
        bottom: 200
      });
      const res = await func(1, info, tabsTab);
      assert.isFalse(elm.classList.contains(ACTIVE), 'class');
      assert.strictEqual(browser.tabs.query.callCount, i, 'not called');
      assert.strictEqual(browser.windows.getCurrent.callCount, j, 'not called');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tabsTab');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should update, call function', async () => {
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.query.callCount;
      const j = browser.windows.getCurrent.callCount;
      const info = {
        status: 'complete'
      };
      const tabsTab = {
        active: true,
        discarded: false,
        id: 1,
        index: 0,
        mutedInfo: {
          muted: false
        },
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1
      };
      mjs.sidebar.windowId = 1;
      browser.tabs.query.withArgs({
        windowId: 1,
        active: true,
        windowType: 'normal'
      }).resolves([tabsTab]);
      browser.tabs.query.withArgs({
        windowId: 1,
        highlighted: true,
        windowType: 'normal'
      }).resolves([1]);
      browser.tabs.get.withArgs(1).resolves(tabsTab);
      browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const elm = document.querySelector('[data-tab-id="1"]');
      elm.getBoundingClientRect.returns({
        top: 100,
        bottom: 200
      });
      elm.dataset.tab = JSON.stringify(tabsTab);
      const res = await func(1, info, tabsTab);
      assert.isTrue(elm.classList.contains(ACTIVE), 'class');
      assert.strictEqual(browser.tabs.query.callCount, i + 2, 'called');
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1, 'called');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tabsTab');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [undefined, {}], 'result');
    });

    it('should update, call function', async () => {
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.query.callCount;
      const j = browser.windows.getCurrent.callCount;
      const info = {
        status: 'complete'
      };
      const tabsTab = {
        active: true,
        discarded: false,
        id: 1,
        index: 1,
        mutedInfo: {
          muted: false
        },
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1
      };
      mjs.sidebar.windowId = 1;
      browser.tabs.query.withArgs({
        windowId: 1,
        active: true,
        windowType: 'normal'
      }).resolves([tabsTab]);
      browser.tabs.query.withArgs({
        windowId: 1,
        highlighted: true,
        windowType: 'normal'
      }).resolves([1]);
      browser.tabs.get.withArgs(1).resolves(tabsTab);
      browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const elm = document.querySelector('[data-tab-id="1"]');
      elm.getBoundingClientRect.returns({
        top: 100,
        bottom: 200
      });
      elm.dataset.tab = JSON.stringify(tabsTab);
      const tab = document.createElement('div');
      tab.classList.add('tab');
      tab.dataset.tabId = '2';
      tab.dataset.tab = '';
      elm.parentNode.appendChild(tab);
      elm.parentNode.classList.add(CLASS_TAB_GROUP);
      const res = await func(1, info, tabsTab);
      assert.isTrue(elm.classList.contains(ACTIVE), 'class');
      assert.strictEqual(browser.tabs.query.callCount, i + 2, 'called');
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 2, 'called');
      assert.deepEqual(JSON.parse(elm.dataset.tab), tabsTab, 'tabsTab');
      assert.isTrue(port.postMessage.calledTwice, 'called');
      assert.deepEqual(res, [{}, undefined, {}], 'result');
    });

    it('should update, call function', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const info = {
        pinned: true
      };
      const tabsTab = {
        discarded: false,
        id: 1,
        index: 0,
        mutedInfo: {
          muted: false
        },
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1
      };
      mjs.sidebar.windowId = 1;
      const elm = document.querySelector('[data-tab-id="1"]');
      elm.getBoundingClientRect.returns({
        top: 100,
        bottom: 200
      });
      const pinned = document.getElementById(PINNED);
      const res = await func(1, info, tabsTab);
      assert.isTrue(elm.classList.contains(PINNED), 'class');
      assert.isTrue(elm.parentNode === pinned, 'parent');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [undefined, {}], 'result');
    });

    it('should update, call function', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const body = document.querySelector('body');
      const tmpl = document.createElement('template');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      const sect = document.createElement('section');
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      body.appendChild(tmpl);
      const info = {
        pinned: false
      };
      const tabsTab = {
        discarded: false,
        id: 1,
        index: 0,
        mutedInfo: {
          muted: false
        },
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1
      };
      mjs.sidebar.windowId = 1;
      const elm = document.querySelector('[data-tab-id="1"]');
      elm.getBoundingClientRect.returns({
        top: 100,
        bottom: 200
      });
      const pinned = document.getElementById(PINNED);
      const res = await func(1, info, tabsTab);
      assert.isFalse(elm.classList.contains(PINNED), 'class');
      assert.isTrue(elm.parentNode === pinned.nextElementSibling, 'parent');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should update', async () => {
      const info = {
        audible: true,
        mutedInfo: {
          muted: false
        }
      };
      const tabsTab = {
        discarded: false,
        id: 1,
        index: 0,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        audible: true,
        mutedInfo: {
          muted: false
        }
      };
      mjs.sidebar.windowId = 1;
      const elm = document.querySelector('[data-tab-id="1"]');
      elm.getBoundingClientRect.returns({
        top: 100,
        bottom: 200
      });
      const audio = elm.querySelector('.tab-audio');
      const res = await func(1, info, tabsTab);
      assert.isTrue(audio.classList.contains(AUDIBLE), 'audible');
      assert.deepEqual(res, [undefined, undefined], 'result');
    });

    it('should update', async () => {
      const info = {
        audible: false,
        mutedInfo: {
          muted: false
        }
      };
      const tabsTab = {
        discarded: false,
        id: 1,
        index: 0,
        status: 'complete',
        title: 'foo',
        url: 'https://example.com',
        windowId: 1,
        audible: false,
        mutedInfo: {
          muted: false
        }
      };
      mjs.sidebar.windowId = 1;
      const elm = document.querySelector('[data-tab-id="1"]');
      elm.getBoundingClientRect.returns({
        top: 100,
        bottom: 200
      });
      const audio = elm.querySelector('.tab-audio');
      const res = await func(1, info, tabsTab);
      assert.isFalse(audio.classList.contains(AUDIBLE), 'audible');
      assert.deepEqual(res, [undefined, undefined], 'result');
    });
  });

  describe('handle clicked menu', () => {
    const func = mjs.handleClickedMenu;
    beforeEach(() => {
      mjs.ports.clear();
      mjs.sidebar.duplicatedTabs = null;
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
      mjs.sidebar.duplicatedTabs = null;
      mjs.userOpts.clear();
    });

    it('should not call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: 'foo'
      };
      const res = await func(info);
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.get.callCount;
      const items = [
        TAB_MUTE, TABS_MUTE, TAB_PIN, TABS_PIN,
        TAB_GROUP_COLLAPSE, TAB_GROUP_DETACH, TAB_GROUP_UNGROUP
      ];
      const body = document.querySelector('body');
      mjs.sidebar.context = body;
      mjs.sidebar.windowId = 1;
      browser.windows.getCurrent.resolves({
        focused: true
      });
      for (const item of items) {
        const info = {
          menuItemId: item
        };
        // eslint-disable-next-line no-await-in-loop
        const res = await func(info);
        assert.strictEqual(browser.tabs.get.callCount, i, 'not called');
        assert.deepEqual(res, [], 'result');
      }
    });

    it('should not call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.create.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      sect.appendChild(elm);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.contextualIds = ['foo'];
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: 'foo'
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.create.callCount, j, 'not called create');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: false
      });
      const i = browser.runtime.openOptionsPage.callCount;
      const res = await func({
        menuItemId: OPTIONS_OPEN
      });
      assert.strictEqual(browser.runtime.openOptionsPage.callCount, i,
        'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const i = browser.runtime.openOptionsPage.callCount;
      const res = await func({
        menuItemId: OPTIONS_OPEN
      });
      assert.strictEqual(browser.runtime.openOptionsPage.callCount, i + 1,
        'called');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.create.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      sect.appendChild(elm);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.contextualIds = ['foo'];
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_REOPEN_NO_CONTAINER
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.create.callCount, j + 1, 'called create');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.create.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        cookieStoreId: 'bar'
      });
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        cookieStoreId: 'foo'
      });
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.contextualIds = ['foo', 'bar'];
      mjs.sidebar.windowId = 1;
      browser.tabs.get.resolves({
        cookieStoreId: 'bar'
      });
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_REOPEN_NO_CONTAINER
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.create.callCount, j + 2, 'called create');
      assert.deepEqual(res, [undefined, undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.create.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      sect.appendChild(elm);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.contextualIds = ['foo'];
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: 'fooReopen'
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 2, 'called get');
      assert.strictEqual(browser.tabs.create.callCount, j + 1, 'called create');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.create.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        cookieStoreId: 'bar'
      });
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        cookieStoreId: 'foo'
      });
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.contextualIds = ['foo', 'bar'];
      mjs.sidebar.windowId = 1;
      browser.tabs.get.resolves({
        cookieStoreId: 'bar'
      });
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: 'fooReopen'
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 2, 'called get');
      assert.strictEqual(browser.tabs.create.callCount, j + 1, 'called create');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.create.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.contextualIds = ['foo'];
      mjs.sidebar.windowId = 1;
      browser.tabs.get.resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: 'barReopen'
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.create.callCount, j, 'not called create');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const newTab = document.getElementById(NEW_TAB);
      browser.tabs.create.withArgs({
        windowId: 1,
        active: true
      }).resolves({
        id: COOKIE_STORE_DEFAULT
      });
      mjs.sidebar.context = newTab;
      mjs.sidebar.contextualIds = ['foo'];
      mjs.sidebar.windowId = 1;
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: NEW_TAB_OPEN_NO_CONTAINER
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.create.callCount, i + 1, 'called create');
      assert.deepEqual(res, [{
        id: COOKIE_STORE_DEFAULT
      }], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const newTab = document.getElementById(NEW_TAB);
      browser.tabs.create.withArgs({
        windowId: 1,
        active: true,
        cookieStoreId: 'foo'
      }).resolves({
        id: 'foo'
      });
      mjs.sidebar.context = newTab;
      mjs.sidebar.contextualIds = ['foo'];
      mjs.sidebar.windowId = 1;
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: 'fooNewTab'
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.create.callCount, i + 1, 'called create');
      assert.deepEqual(res, [{
        id: 'foo'
      }], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.reload.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_RELOAD
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.reload.callCount, i + 2, 'called reload');
      assert.deepEqual(res, [[undefined, undefined]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.reload.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_RELOAD
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.reload.callCount, i + 1, 'called reload');
      assert.deepEqual(res, [[undefined]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        pinned: true
      });
      browser.tabs.update.withArgs(1, { pinned: false }).resolves({});
      browser.tabs.update.withArgs(2, { pinned: false }).resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_PIN
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.update.callCount, j + 2, 'called update');
      assert.deepEqual(res, [[{}, {}]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        pinned: false
      });
      browser.tabs.update.withArgs(1, { pinned: true }).resolves({});
      browser.tabs.update.withArgs(2, { pinned: true }).resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_PIN
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.update.callCount, j + 2, 'called update');
      assert.deepEqual(res, [[{}, {}]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        pinned: true
      });
      browser.tabs.update.withArgs(1, { pinned: false }).resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_PIN
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.update.callCount, j + 1, 'called update');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        pinned: false
      });
      browser.tabs.update.withArgs(1, { pinned: true }).resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_PIN
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.update.callCount, j + 1, 'called update');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should not call function', async () => {
      browser.browserSettings.newTabPosition.get.resolves({
        value: 'afterCurrent'
      });
      browser.windows.getCurrent.resolves({
        focused: false
      });
      browser.tabs.create.resolves({});
      const i = browser.tabs.create.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      const info = {
        menuItemId: TAB_NEW
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      browser.browserSettings.newTabPosition.get.resolves({
        value: 'afterCurrent'
      });
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const create = browser.tabs.create.withArgs({
        index: 1,
        openerTabId: 1,
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      const info = {
        menuItemId: TAB_NEW
      };
      const res = await func(info);
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.browserSettings.newTabPosition.get.resolves({
        value: 'afterCurrent'
      });
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const create = browser.tabs.create.withArgs({
        index: 1,
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = body;
      mjs.sidebar.windowId = 1;
      const info = {
        menuItemId: TAB_NEW
      };
      const res = await func(info);
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.browserSettings.newTabPosition.get.resolves({
        value: 'afterCurrent'
      });
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const create = browser.tabs.create.withArgs({
        index: 1,
        openerTabId: 1,
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      const info = {
        menuItemId: TAB_NEW
      };
      const res = await func(info);
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.browserSettings.newTabPosition.get.resolves({
        value: 'afterCurrent'
      });
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const create = browser.tabs.create.withArgs({
        index: 1,
        openerTabId: 1,
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect2.appendChild(elm2);
      body.appendChild(sect);
      body.appendChild(sect2);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      const info = {
        menuItemId: TAB_NEW
      };
      const res = await func(info);
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.browserSettings.newTabPosition.get.resolves({
        value: 'afterCurrent'
      });
      browser.tabs.get.withArgs(1).resolves({
        cookieStoreId: COOKIE_STORE_DEFAULT
      });
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const create = browser.tabs.create.withArgs({
        index: 1,
        openerTabId: 1,
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect2.appendChild(elm2);
      body.appendChild(sect);
      body.appendChild(sect2);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      const info = {
        menuItemId: TAB_NEW
      };
      const res = await func(info);
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.browserSettings.newTabPosition.get.resolves({
        value: 'afterCurrent'
      });
      browser.tabs.get.withArgs(1).resolves({
        cookieStoreId: 'foo'
      });
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const create = browser.tabs.create.withArgs({
        cookieStoreId: 'foo',
        index: 1,
        openerTabId: 1,
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect2.appendChild(elm2);
      body.appendChild(sect);
      body.appendChild(sect2);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      const info = {
        menuItemId: TAB_NEW
      };
      const res = await func(info);
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        mutedInfo: {
          muted: true
        }
      });
      browser.tabs.update.withArgs(1, { muted: false }).resolves({});
      browser.tabs.update.withArgs(2, { muted: false }).resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_MUTE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.update.callCount, j + 2, 'called update');
      assert.deepEqual(res, [[{}, {}]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        mutedInfo: {
          muted: false
        }
      });
      browser.tabs.update.withArgs(1, { muted: true }).resolves({});
      browser.tabs.update.withArgs(2, { muted: true }).resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_MUTE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.update.callCount, j + 2, 'called update');
      assert.deepEqual(res, [[{}, {}]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        mutedInfo: {
          muted: true
        }
      });
      browser.tabs.update.withArgs(1, { muted: false }).resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_MUTE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.update.callCount, j + 1, 'called update');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.update.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        mutedInfo: {
          muted: false
        }
      });
      browser.tabs.update.withArgs(1, { muted: true }).resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_MUTE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.update.callCount, j + 1, 'called update');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.create.callCount;
      const k = browser.tabs.move.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.windows.create.resolves({
        id: 1
      });
      browser.tabs.move.resolves([{}, {}]);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_MOVE_WIN
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.windows.create.callCount, j + 1,
        'called create');
      assert.strictEqual(browser.tabs.move.callCount, k + 1, 'called move');
      assert.deepEqual(res, [[{}, {}]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.create.callCount;
      const k = browser.tabs.move.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.windows.create.resolves({
        id: 2
      });
      browser.tabs.move.resolves([{}, {}]);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_MOVE_WIN
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.windows.create.callCount, j + 1,
        'called create');
      assert.strictEqual(browser.tabs.move.callCount, k, 'not called move');
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.move.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(pinned);
      body.appendChild(sect);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.move.resolves([{}, {}]);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_MOVE_START
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.move.callCount, j + 1, 'called move');
      assert.deepEqual(res, [[[{}, {}]]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.move.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      body.appendChild(pinned);
      body.appendChild(sect);
      mjs.sidebar.context = elm2;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.move.resolves([{}]);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_MOVE_START
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.move.callCount, j + 1, 'called move');
      assert.deepEqual(res, [[[{}]]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.move.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.move.resolves([{}, {}]);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_MOVE_END
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.move.callCount, j + 1, 'called move');
      assert.deepEqual(res, [[[{}, {}]]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.move.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.move.resolves([{}]);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_MOVE_END
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.move.callCount, j + 1, 'called move');
      assert.deepEqual(res, [[[{}]]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.create.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.classList.add(ACTIVE);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        active: true,
        index: 0
      });
      browser.tabs.get.withArgs(2).resolves({
        active: false,
        index: 1
      });
      browser.tabs.duplicate.resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_DUPE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 3, 'called get');
      assert.strictEqual(browser.tabs.duplicate.callCount, j + 2,
        'called duplicate');
      assert.deepEqual(res, [[{}, {}]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.create.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(ACTIVE);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        active: true,
        index: 0
      });
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.duplicate.resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_DUPE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 2, 'called get');
      assert.strictEqual(browser.tabs.duplicate.callCount, j + 1,
        'called duplicate');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm3;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.tabs.remove.resolves(undefined);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_CLOSE_START
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.remove.callCount, j + 1, 'called remove');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.tabs.remove.resolves(undefined);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_CLOSE_OTHER
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.remove.callCount, j + 1, 'called remove');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.tabs.remove.resolves(undefined);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_CLOSE_END
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.remove.callCount, j + 1, 'called remove');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm3;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.tabs.remove.resolves(undefined);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_CLOSE_DUPE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.remove.callCount, j, 'not called remove');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm3;
      mjs.sidebar.windowId = 1;
      mjs.sidebar.duplicatedTabs = [
        {
          id: 1,
          pinned: false
        },
        {
          id: 2,
          pinned: false
        }
      ];
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.tabs.remove.resolves(undefined);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_CLOSE_DUPE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.remove.callCount, j + 1, 'called remove');
      assert.deepEqual(res, [null], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm3;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.tabs.remove.resolves(undefined);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_CLOSE_DUPE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.remove.callCount, j, 'not called remove');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm3;
      mjs.sidebar.windowId = 1;
      mjs.sidebar.duplicatedTabs = [
        {
          id: 1,
          pinned: false
        },
        {
          id: 2,
          pinned: false
        },
        {
          id: 3,
          pinned: false
        }
      ];
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.tabs.remove.resolves(undefined);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_CLOSE_DUPE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.remove.callCount, j + 1, 'called remove');
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.tabs.remove.resolves(undefined);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_CLOSE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.remove.callCount, j + 1, 'called remove');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.tabs.remove.resolves(undefined);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_CLOSE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.remove.callCount, j + 1, 'called remove');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.bookmarks.create.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        title: 'foo',
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        title: 'bar',
        url: 'https://www.example.com'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.bookmarks.create.resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TABS_BOOKMARK
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.bookmarks.create.callCount, j + 2,
        'called create');
      assert.deepEqual(res, [[{}, {}]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.bookmarks.create.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        title: 'foo',
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        title: 'bar',
        url: 'https://www.example.com'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.bookmarks.create.resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_BOOKMARK
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.bookmarks.create.callCount, j + 1,
        'called create');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should call function', async () => {
      const i = browser.sessions.restore.callCount;
      mjs.sidebar.lastClosedTab = {
        sessionId: 'foo'
      };
      mjs.sidebar.windowId = 1;
      browser.sessions.restore.withArgs('foo').resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_CLOSE_UNDO
      };
      const res = await func(info);
      assert.strictEqual(browser.sessions.restore.callCount, i + 1, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      window.prompt.returns('foobar');
      const i = browser.tabs.get.callCount;
      const j = browser.bookmarks.create.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const h1 = document.createElement('h1');
      const label = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      h1.classList.add(CLASS_HEADING);
      label.classList.add(CLASS_HEADING_LABEL);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        title: 'foo',
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        title: 'bar',
        url: 'https://www.example.com'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tab = JSON.stringify({
        title: 'baz',
        url: 'https://www.example.com/baz'
      });
      elm3.dataset.tabId = '3';
      h1.appendChild(label);
      sect.appendChild(h1);
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = label;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.bookmarks.create.resolves({});
      browser.bookmarks.create.withArgs({
        parentId: undefined,
        title: 'foobar',
        type: 'folder'
      }).resolves({
        id: 'foo'
      });
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_GROUP_BOOKMARK
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.bookmarks.create.callCount, j + 4,
        'called create');
      assert.deepEqual(res, [[{}, {}, {}]], 'result');
    });

    it('should call function', async () => {
      window.prompt.returns('foobar');
      const i = browser.tabs.get.callCount;
      const j = browser.bookmarks.create.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const h1 = document.createElement('h1');
      const label = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      h1.classList.add(CLASS_HEADING);
      label.classList.add(CLASS_HEADING_LABEL);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        title: 'foo',
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        title: 'bar',
        url: 'https://www.example.com'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tab = JSON.stringify({
        title: 'baz',
        url: 'https://www.example.com/baz'
      });
      elm3.dataset.tabId = '3';
      h1.appendChild(label);
      sect.appendChild(h1);
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.bookmarks.create.resolves({});
      browser.bookmarks.create.withArgs({
        parentId: undefined,
        title: 'foobar',
        type: 'folder'
      }).resolves({
        id: 'foo'
      });
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_GROUP_BOOKMARK
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.bookmarks.create.callCount, j + 4,
        'called create');
      assert.deepEqual(res, [[{}, {}, {}]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.remove.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const h1 = document.createElement('h1');
      const label = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      h1.classList.add(CLASS_HEADING);
      label.classList.add(CLASS_HEADING_LABEL);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      h1.appendChild(label);
      sect.appendChild(h1);
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = label;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.get.withArgs(2).resolves({});
      browser.tabs.get.withArgs(3).resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_GROUP_CLOSE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.tabs.remove.callCount, j + 1, 'called remove');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.get.callCount;
      const j = browser.windows.getCurrent.callCount;
      const tmpl = document.createElement('template');
      const sect = document.createElement('section');
      const pinned = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://foo.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://bar.com'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://baz.com'
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.resolves({
        pinned: false
      });
      const info = {
        menuItemId: TAB_GROUP_UNGROUP
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called tabs get');
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 2,
        'called current window');
      assert.isTrue(port.postMessage.calledOnce, 'called msg');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.windows.getCurrent.callCount;
      const tmpl = document.createElement('template');
      const sect = document.createElement('section');
      const pinned = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://www.example.com/foo'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.net/'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://example.com/bar'
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      const arg = {
        pinned: false,
        url: '*://*.example.com/*',
        windowId: 1
      };
      browser.tabs.get.resolves({
        url: 'https://www.example.com/foo'
      });
      browser.tabs.query.withArgs(arg).resolves([
        {
          id: 1,
          url: 'https://www.example.com/foo'
        },
        {
          id: 3,
          url: 'https://example.com/bar'
        }
      ]);
      const info = {
        menuItemId: TAB_GROUP_DOMAIN
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 2, 'called tabs get');
      assert.strictEqual(browser.tabs.move.callCount, j + 2, 'called move');
      assert.strictEqual(browser.windows.getCurrent.callCount, k + 2,
        'called current window');
      assert.isTrue(port.postMessage.calledOnce, 'called msg');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.windows.getCurrent.callCount;
      const tmpl = document.createElement('template');
      const sect = document.createElement('section');
      const pinned = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        cookieStoreId: 'foo'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        cookieStoreId: 'bar'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        cookieStoreId: 'foo'
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      const arg = {
        cookieStoreId: 'foo',
        pinned: false,
        windowId: 1
      };
      browser.tabs.get.resolves({
        cookieStoreId: 'foo'
      });
      browser.tabs.query.withArgs(arg).resolves([
        {
          id: 1,
          cookieStoreId: 'foo'
        },
        {
          id: 3,
          cookieStoreId: 'foo'
        }
      ]);
      const info = {
        menuItemId: TAB_GROUP_CONTAINER
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 2, 'called tabs get');
      assert.strictEqual(browser.tabs.move.callCount, j + 2, 'called move');
      assert.strictEqual(browser.windows.getCurrent.callCount, k + 2,
        'called current window');
      assert.isTrue(port.postMessage.calledOnce, 'called msg');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.windows.getCurrent.callCount;
      const tmpl = document.createElement('template');
      const sect = document.createElement('section');
      const pinned = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://foo.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://bar.com'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://baz.com'
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.resolves({
        pinned: false
      });
      const info = {
        menuItemId: TAB_GROUP_SELECTED
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called tabs get');
      assert.strictEqual(browser.tabs.move.callCount, j + 2, 'called move');
      assert.strictEqual(browser.windows.getCurrent.callCount, k + 2,
        'called current window');
      assert.isTrue(port.postMessage.calledOnce, 'called msg');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.windows.getCurrent.callCount;
      const tmpl = document.createElement('template');
      const sect = document.createElement('section');
      const pinned = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://foo.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://bar.com'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://baz.com'
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.resolves({
        pinned: false
      });
      const info = {
        menuItemId: TAB_GROUP_DETACH_TABS
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called tabs get');
      assert.strictEqual(browser.tabs.move.callCount, j + 1, 'called move');
      assert.strictEqual(browser.windows.getCurrent.callCount, k + 2,
        'called current window');
      assert.isTrue(port.postMessage.calledOnce, 'called msg');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.windows.getCurrent.callCount;
      const tmpl = document.createElement('template');
      const sect = document.createElement('section');
      const pinned = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://foo.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://bar.com'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://baz.com'
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.resolves({
        pinned: false
      });
      const info = {
        menuItemId: TAB_GROUP_DETACH
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called tabs get');
      assert.strictEqual(browser.tabs.move.callCount, j + 1, 'called move');
      assert.strictEqual(browser.windows.getCurrent.callCount, k + 2,
        'called current window');
      assert.isTrue(port.postMessage.calledOnce, 'called msg');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should get result', async () => {
      const sect = document.createElement('section');
      const heading = document.createElement('div');
      const child = document.createElement('div');
      const button = document.createElement('button');
      const body = document.querySelector('body');
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
      mjs.sidebar.windowId = 1;
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_GROUP_LABEL_SHOW
      };
      const res = await func(info);
      assert.isTrue(heading.hidden, 'hidden');
      assert.deepEqual(res, [[undefined]], 'result');
    });

    it('should get result', async () => {
      const sect = document.createElement('section');
      const heading = document.createElement('div');
      const child = document.createElement('div');
      const button = document.createElement('button');
      const body = document.querySelector('body');
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
      mjs.sidebar.windowId = 1;
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_GROUP_LABEL_SHOW
      };
      const res = await func(info);
      assert.isFalse(heading.hidden, 'hidden');
      assert.deepEqual(res, [[undefined, child]], 'result');
    });

    it('should call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.get.callCount;
      const j = browser.i18n.getMessage.callCount;
      const k = browser.windows.getCurrent.callCount;
      const tmpl = document.createElement('template');
      const sect = document.createElement('section');
      const pinned = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const cnt = document.createElement('span');
      const icon = document.createElement('img');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      sect.classList.add(CLASS_TAB_CONTAINER);
      tmpl.content.appendChild(sect);
      pinned.id = PINNED;
      pinned.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      cnt.appendChild(icon);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://foo.com'
      });
      elm.appendChild(cnt);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://bar.com'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://baz.com'
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.resolves({
        pinned: false
      });
      const info = {
        menuItemId: TAB_GROUP_COLLAPSE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called tabs get');
      assert.strictEqual(browser.i18n.getMessage.callCount, j + 2,
        'called get message');
      assert.strictEqual(browser.windows.getCurrent.callCount, k + 2,
        'called current window');
      assert.isTrue(port.postMessage.calledOnce, 'called msg');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.get.callCount;
      const j = browser.i18n.getMessage.callCount;
      const k = browser.windows.getCurrent.callCount;
      const tmpl = document.createElement('template');
      const sect = document.createElement('section');
      const pinned = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const cnt = document.createElement('span');
      const icon = document.createElement('img');
      const body = document.querySelector('body');
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
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://foo.com'
      });
      elm.appendChild(cnt);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://bar.com'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://baz.com'
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.userOpts.set(TAB_GROUP_EXPAND_COLLAPSE_OTHER, true);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.resolves({
        pinned: false
      });
      const info = {
        menuItemId: TAB_GROUP_COLLAPSE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called tabs get');
      assert.strictEqual(browser.i18n.getMessage.callCount, j + 2,
        'called get message');
      assert.strictEqual(browser.windows.getCurrent.callCount, k + 2,
        'called current window');
      assert.isTrue(port.postMessage.calledOnce, 'called msg');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.get.callCount;
      const j = browser.i18n.getMessage.callCount;
      const k = browser.windows.getCurrent.callCount;
      const tmpl = document.createElement('template');
      const sect = document.createElement('section');
      const pinned = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const cnt = document.createElement('span');
      const icon = document.createElement('img');
      const body = document.querySelector('body');
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
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://foo.com'
      });
      elm.appendChild(cnt);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://bar.com'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://baz.com'
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.userOpts.set(TAB_GROUP_EXPAND_COLLAPSE_OTHER, true);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.resolves({
        pinned: false
      });
      const info = {
        menuItemId: TAB_GROUP_COLLAPSE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called tabs get');
      assert.strictEqual(browser.i18n.getMessage.callCount, j + 2,
        'called get message');
      assert.strictEqual(browser.windows.getCurrent.callCount, k + 2,
        'called current window');
      assert.isTrue(port.postMessage.calledOnce, 'called msg');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.get.callCount;
      const j = browser.i18n.getMessage.callCount;
      const k = browser.windows.getCurrent.callCount;
      const tmpl = document.createElement('template');
      const sect = document.createElement('section');
      const pinned = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const cnt = document.createElement('span');
      const icon = document.createElement('img');
      const body = document.querySelector('body');
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
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://foo.com'
      });
      elm.appendChild(cnt);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://bar.com'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://baz.com'
      });
      parent2.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(tmpl);
      body.appendChild(pinned);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(newTab);
      mjs.userOpts.set(TAB_GROUP_EXPAND_COLLAPSE_OTHER, true);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.resolves({
        pinned: false
      });
      const info = {
        menuItemId: TAB_GROUP_COLLAPSE
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called tabs get');
      assert.strictEqual(browser.i18n.getMessage.callCount, j + 2,
        'called get message');
      assert.strictEqual(browser.windows.getCurrent.callCount, k + 2,
        'called current window');
      assert.isTrue(port.postMessage.calledOnce, 'called msg');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = browser.tabs.get.callCount;
      const j = browser.i18n.getMessage.callCount;
      const k = browser.windows.getCurrent.callCount;
      const tmpl = document.createElement('template');
      const sect = document.createElement('section');
      const pinned = document.createElement('section');
      const parent = document.createElement('section');
      const parent2 = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const cnt = document.createElement('span');
      const icon = document.createElement('img');
      const body = document.querySelector('body');
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
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'https://foo.com'
      });
      elm.appendChild(cnt);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://bar.com'
      });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://baz.com'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        url: 'https://qux.com'
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
      mjs.sidebar.windowId = 1;
      browser.tabs.get.resolves({
        pinned: false
      });
      const info = {
        menuItemId: TAB_GROUP_COLLAPSE_OTHER
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called tabs get');
      assert.strictEqual(browser.i18n.getMessage.callCount, j + 2,
        'called get message');
      assert.strictEqual(browser.windows.getCurrent.callCount, k + 2,
        'called current window');
      assert.isTrue(port.postMessage.calledOnce, 'called msg');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.query.withArgs({
        windowId: 1,
        active: true,
        windowType: 'normal'
      }).resolves([{
        index: 0
      }]);
      browser.tabs.highlight.resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_ALL_SELECT
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.query.callCount, j + 1, 'called query');
      assert.strictEqual(browser.tabs.highlight.callCount, k + 1,
        'called highlight');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = body;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.query.withArgs({
        windowId: 1,
        active: true,
        windowType: 'normal'
      }).resolves([{
        index: 0
      }]);
      browser.tabs.highlight.resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_ALL_SELECT
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.tabs.query.callCount, j + 1, 'called query');
      assert.strictEqual(browser.tabs.highlight.callCount, k + 1,
        'called highlight');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.reload.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.highlight.resolves(undefined);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_ALL_RELOAD
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.reload.callCount, j + 3, 'called reload');
      assert.deepEqual(res, [[undefined, undefined, undefined]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.reload.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = body;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.tabs.highlight.resolves(undefined);
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_ALL_RELOAD
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.tabs.reload.callCount, j + 3, 'called reload');
      assert.deepEqual(res, [[undefined, undefined, undefined]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.bookmarks.create.callCount;
      const pinned = document.createElement('section');
      const sect = document.createElement('section');
      const newTab = document.createElement('section');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      sect.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        title: 'foo',
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        title: 'bar',
        url: 'https://www.example.com'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        title: 'baz',
        url: 'http://example.com'
      });
      sect.appendChild(elm);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(sect);
      body.appendChild(newTab);
      mjs.sidebar.context = elm;
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({});
      browser.bookmarks.create.resolves({});
      browser.windows.getCurrent.resolves({
        focused: true
      });
      const info = {
        menuItemId: TAB_ALL_BOOKMARK
      };
      const res = await func(info);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.bookmarks.create.callCount, j + 3,
        'called create');
      assert.deepEqual(res, [[{}, {}, {}]], 'result');
    });
  });

  describe('prepare contexual IDs menu items', () => {
    const func = mjs.prepareContexualIdsMenuItems;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'instance');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'message');
      });
    });

    it('should not call function', async () => {
      const i = browser.menus.update.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const i = browser.menus.update.callCount;
      mjs.sidebar.contextualIds = [];
      const res = await func('foo');
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const i = browser.menus.update.callCount;
      mjs.sidebar.contextualIds = ['bar', 'baz'];
      const res = await func('foo');
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      mjs.sidebar.contextualIds = ['bar', 'baz'];
      const res = await func(TAB_REOPEN_CONTAINER);
      assert.strictEqual(browser.menus.update.callCount, i + 6, 'called');
      assert.deepEqual(res, [
        [undefined],
        [undefined],
        [undefined],
        [undefined],
        [undefined],
        [undefined]
      ], 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      mjs.sidebar.contextualIds = ['bar', 'baz'];
      const res = await func(TABS_REOPEN_CONTAINER);
      assert.strictEqual(browser.menus.update.callCount, i + 6, 'called');
      assert.deepEqual(res, [
        [undefined],
        [undefined],
        [undefined],
        [undefined],
        [undefined],
        [undefined]
      ], 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      mjs.sidebar.contextualIds = ['bar', 'baz'];
      const res = await func(NEW_TAB_OPEN_CONTAINER);
      assert.strictEqual(browser.menus.update.callCount, i + 2, 'called');
      assert.deepEqual(res, [[undefined], [undefined]], 'result');
    });
  });

  describe('prepare new tab menu items', () => {
    const func = mjs.prepareNewTabMenuItems;

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.update.callCount, i + 2, 'called');
      assert.deepEqual(res, [[undefined], [undefined]], 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const body = document.querySelector('body');
      const res = await func(body);
      assert.strictEqual(browser.menus.update.callCount, i + 2, 'called');
      assert.deepEqual(res, [[undefined], [undefined]], 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.id = NEW_TAB;
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(browser.menus.update.callCount, i + 2, 'called');
      assert.deepEqual(res, [[undefined], [undefined], []], 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.id = NEW_TAB;
      body.appendChild(elm);
      mjs.sidebar.contextualIds = ['foo'];
      const res = await func(elm);
      assert.strictEqual(browser.menus.update.callCount, i + 3, 'called');
      assert.deepEqual(res, [[undefined], [undefined], [[undefined]]],
        'result');
    });
  });

  describe('prepare page menu items', () => {
    const func = mjs.preparePageMenuItems;

    it('should not call function', async () => {
      const i = browser.menus.update.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const res = await func({
        allTabsLength: 2,
        allTabsSelected: false,
        isTab: true
      });
      assert.strictEqual(browser.menus.update.callCount, i + 3, 'called');
      assert.deepEqual(res, [[undefined], [undefined], [undefined]], 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      mjs.sidebar.lastClosedTab = {};
      const res = await func({
        allTabsLength: 2,
        allTabsSelected: false,
        isTab: true
      });
      assert.strictEqual(browser.menus.update.callCount, i + 3, 'called');
      assert.deepEqual(res, [[undefined], [undefined], [undefined]], 'result');
    });
  });

  describe('prepare tab group menu items', () => {
    const func = mjs.prepareTabGroupMenuItems;
    beforeEach(() => {
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.userOpts.clear();
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const res = await func();
      assert.strictEqual(browser.menus.update.callCount, i + 1, 'called');
      assert.deepEqual(res, [[undefined]], 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(browser.menus.update.callCount, i + 1, 'called');
      assert.deepEqual(res, [[undefined]], 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: false,
        pinned: false
      });
      assert.strictEqual(browser.menus.update.callCount, i + 1, 'called');
      assert.deepEqual(res, [[undefined]], 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: false,
        pinned: false
      });
      assert.strictEqual(browser.menus.update.callCount, i + 15, 'called');
      assert.deepEqual(res.length, 15, 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: false,
        pinned: false
      });
      assert.strictEqual(browser.menus.update.callCount, i + 15, 'called');
      assert.deepEqual(res.length, 15, 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
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
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: false,
        pinned: false
      });
      assert.strictEqual(browser.menus.update.callCount, i + 15, 'called');
      assert.deepEqual(res.length, 15, 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(HIGHLIGHTED);
      elm2.classList.add(HIGHLIGHTED);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: true,
        pinned: false
      });
      assert.strictEqual(browser.menus.update.callCount, i + 15, 'called');
      assert.deepEqual(res.length, 15, 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(HIGHLIGHTED);
      elm2.classList.add(HIGHLIGHTED);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: true,
        pinned: true
      });
      assert.strictEqual(browser.menus.update.callCount, i + 15, 'called');
      assert.deepEqual(res.length, 15, 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(HIGHLIGHTED);
      elm2.classList.add(HIGHLIGHTED);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      const res = await func(elm, {
        labelHidden: true,
        multiTabsSelected: true,
        pinned: true
      });
      assert.strictEqual(browser.menus.update.callCount, i + 15, 'called');
      assert.deepEqual(res.length, 15, 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.update.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(HIGHLIGHTED);
      elm2.classList.add(HIGHLIGHTED);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(CLASS_TAB_COLLAPSED);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      const res = await func(elm, {
        labelHidden: false,
        multiTabsSelected: true,
        pinned: true
      });
      assert.strictEqual(browser.menus.update.callCount, i + 15, 'called');
      assert.deepEqual(res.length, 15, 'result');
    });
  });

  describe('prepare tab menu items', () => {
    const func = mjs.prepareTabMenuItems;
    beforeEach(() => {
      const pinned = document.createElement('section');
      const newTab = document.createElement('section');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(newTab);
      mjs.sidebar.incognito = false;
      mjs.sidebar.duplicatedTabs = null;
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.sidebar.incognito = false;
      mjs.sidebar.duplicatedTabs = null;
      mjs.userOpts.clear();
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      mjs.sidebar.windowId = 1;
      browser.tabs.query.resolves([]);
      const res = await func();
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called');
      assert.strictEqual(browser.menus.update.callCount, j + 29, 'called');
      assert.deepEqual(res.length, 27, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false
        },
        pinned: true
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(body);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.menus.update.callCount, j + 29,
        'called update');
      assert.strictEqual(res.length, 27, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false
        },
        pinned: true
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const k = browser.i18n.getMessage.withArgs(`${TABS_CLOSE}_menu`, [
        '2',
        '(&C)'
      ]).callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false
        },
        pinned: true
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm1);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(browser.i18n.getMessage.withArgs(
        `${TABS_CLOSE}_menu`, [
          '2',
          '(&C)'
        ]
      ).callCount, k + 1, 'called i18n');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false
        },
        pinned: true
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm2);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false
        },
        pinned: true
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm3);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      elm2.classList.add(HIGHLIGHTED);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false
        },
        pinned: true
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm3);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false
        },
        pinned: true
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false
        },
        pinned: true
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 35,
        'called update');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.contextualIds = ['foo'];
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false
        },
        pinned: true
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm3);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 54,
        'called update');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.contextualIds = ['foo'];
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false
        },
        pinned: true
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 54,
        'called update');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(TAB);
      elm1.classList.add(HIGHLIGHTED);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.classList.add(CLASS_TAB_CONTAINER);
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true
        },
        pinned: true
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(CLASS_HEADING);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      body.insertBefore(sect, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true
        },
        pinned: true
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm1);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.menus.update.callCount, j + 43,
        'called update');
      assert.strictEqual(res.length, 27, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(CLASS_HEADING);
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      body.insertBefore(sect, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true
        },
        pinned: true
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm2);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(CLASS_HEADING);
      elm1.hidden = true;
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      body.insertBefore(sect, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true
        },
        pinned: true
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm2);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(CLASS_HEADING);
      elm1.hidden = true;
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      elm4.classList.add(TAB);
      elm4.classList.add(HIGHLIGHTED);
      elm4.dataset.tabId = '5';
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      sect.appendChild(elm4);
      body.insertBefore(sect, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true
        },
        pinned: true
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm);
      assert.isNull(mjs.sidebar.duplicatedTabs, 'duped tabs');
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const k = browser.i18n.getMessage.withArgs(`${TABS_CLOSE_DUPE}_menu`, [
        '2',
        '(&U)'
      ]).callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(CLASS_HEADING);
      elm1.hidden = true;
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      elm4.classList.add(TAB);
      elm4.classList.add(HIGHLIGHTED);
      elm4.dataset.tabId = '5';
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      sect.appendChild(elm4);
      body.insertBefore(sect, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true
        },
        pinned: true
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(5).resolves({
        index: 4,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([
        {
          id: 4
        }
      ]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm);
      assert.deepEqual(mjs.sidebar.duplicatedTabs, [
        {
          id: 4
        }
      ], 'duped tabs');
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(browser.i18n.getMessage.withArgs(
        `${TABS_CLOSE_DUPE}_menu`, [
          '2',
          '(&U)'
        ]
      ).callCount, k, 'not called i18n');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const k = browser.i18n.getMessage.withArgs(`${TABS_CLOSE_DUPE}_menu`, [
        '2',
        '(&U)'
      ]).callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(CLASS_HEADING);
      elm1.hidden = true;
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      elm4.classList.add(TAB);
      elm4.classList.add(HIGHLIGHTED);
      elm4.dataset.tabId = '5';
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      sect.appendChild(elm4);
      body.insertBefore(sect, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true
        },
        pinned: true
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(5).resolves({
        index: 4,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([
        {
          id: 3
        },
        {
          id: 4
        }
      ]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm);
      assert.deepEqual(mjs.sidebar.duplicatedTabs, [
        {
          id: 3
        },
        {
          id: 4
        }
      ], 'duped tabs');
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(browser.i18n.getMessage.withArgs(
        `${TABS_CLOSE_DUPE}_menu`, [
          '2',
          '(&U)'
        ]
      ).callCount, k + 1, 'called i18n');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const k = browser.i18n.getMessage.withArgs(`${TABS_CLOSE_DUPE}_menu`, [
        '2',
        '(&U)'
      ]).callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(CLASS_HEADING);
      elm1.hidden = true;
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      elm4.classList.add(TAB);
      elm4.classList.add(HIGHLIGHTED);
      elm4.dataset.tabId = '5';
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      sect.appendChild(elm4);
      body.insertBefore(sect, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true
        },
        pinned: true
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(5).resolves({
        index: 4,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([
        {
          id: 3
        }
      ]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm3);
      assert.deepEqual(mjs.sidebar.duplicatedTabs, [
        {
          id: 3
        }
      ], 'duped tabs');
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(browser.i18n.getMessage.withArgs(
        `${TABS_CLOSE_DUPE}_menu`, [
          '2',
          '(&U)'
        ]
      ).callCount, k, 'not called i18n');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const k = browser.i18n.getMessage.withArgs(`${TABS_CLOSE_DUPE}_menu`, [
        '2',
        '(&U)'
      ]).callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(CLASS_HEADING);
      elm1.hidden = true;
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      elm4.classList.add(TAB);
      elm4.classList.add(HIGHLIGHTED);
      elm4.dataset.tabId = '5';
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      sect.appendChild(elm4);
      body.insertBefore(sect, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true
        },
        pinned: true
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(5).resolves({
        index: 4,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([
        {
          id: 3
        },
        {
          id: 4
        }
      ]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm3);
      assert.deepEqual(mjs.sidebar.duplicatedTabs, [
        {
          id: 3
        },
        {
          id: 4
        }
      ], 'duped tabs');
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(browser.i18n.getMessage.withArgs(
        `${TABS_CLOSE_DUPE}_menu`, [
          '2',
          '(&U)'
        ]
      ).callCount, k, 'not called i18n');
      assert.strictEqual(res.length, 34, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const k = browser.i18n.getMessage.withArgs(`${TABS_CLOSE_DUPE}_menu`, [
        '2',
        '(&U)'
      ]).callCount;
      const sect = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.classList.add(HIGHLIGHTED);
      pinned.appendChild(elm);
      elm1.classList.add(CLASS_HEADING);
      elm1.hidden = true;
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      elm4.classList.add(TAB);
      elm4.classList.add(HIGHLIGHTED);
      elm4.dataset.tabId = '5';
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect.appendChild(elm3);
      sect.appendChild(elm4);
      body.insertBefore(sect, newTab);
      mjs.userOpts.set(TAB_GROUP_ENABLE, true);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: true
        },
        pinned: true
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(5).resolves({
        index: 4,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([
        {
          id: 3
        },
        {
          id: 4
        },
        {
          id: 5
        }
      ]);
      browser.menus.update.resolves(undefined);
      const res = await func(elm3);
      assert.deepEqual(mjs.sidebar.duplicatedTabs, [
        {
          id: 3
        },
        {
          id: 4
        },
        {
          id: 5
        }
      ], 'duped tabs');
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.menus.update.callCount, j + 49,
        'called update');
      assert.strictEqual(browser.i18n.getMessage.withArgs(
        `${TABS_CLOSE_DUPE}_menu`, [
          '2',
          '(&U)'
        ]
      ).callCount, k + 1, 'called i18n');
      assert.strictEqual(res.length, 34, 'result');
    });
  });

  describe('handle updated theme', () => {
    const func = mjs.handleUpdatedTheme;
    beforeEach(() => {
      mjs.sidebar.windowId = null;
    });
    afterEach(() => {
      mjs.sidebar.windowId = null;
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.set.callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func();
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j + 1,
        'called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.set.callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func({
        theme: {}
      });
      assert.strictEqual(browser.storage.local.set.callCount, i + 1, 'called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j + 1,
        'called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.theme.getCurrent.resolves({
        colors: {}
      });
      mjs.sidebar.windowId = 1;
      const i = browser.storage.local.set.callCount;
      const j = browser.runtime.sendMessage.callCount;
      const k = browser.theme.getCurrent.callCount;
      const res = await func({
        theme: {},
        windowId: 1
      });
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j,
        'not called');
      assert.strictEqual(browser.theme.getCurrent.callCount, k, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.theme.getCurrent.resolves({
        colors: {}
      });
      mjs.sidebar.windowId = 1;
      const i = browser.storage.local.set.callCount;
      const j = browser.runtime.sendMessage.callCount;
      const k = browser.theme.getCurrent.callCount;
      const res = await func({
        theme: {},
        windowId: 2
      });
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j,
        'not called');
      assert.strictEqual(browser.theme.getCurrent.callCount, k, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.theme.getCurrent.resolves({
        colors: {}
      });
      mjs.sidebar.windowId = 1;
      const i = browser.storage.local.set.callCount;
      const j = browser.runtime.sendMessage.callCount;
      const k = browser.theme.getCurrent.callCount;
      const res = await func({
        theme: {
          colors: {}
        },
        windowId: 1
      });
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j,
        'not called');
      assert.strictEqual(browser.theme.getCurrent.callCount, k + 1, 'called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.theme.getCurrent.resolves({
        colors: {}
      });
      mjs.sidebar.windowId = 1;
      const i = browser.storage.local.set.callCount;
      const j = browser.runtime.sendMessage.callCount;
      const k = browser.theme.getCurrent.callCount;
      const res = await func({
        theme: {
          colors: {}
        },
        windowId: 2
      });
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j,
        'not called');
      assert.strictEqual(browser.theme.getCurrent.callCount, k, 'not called');
      assert.isNull(res, 'result');
    });
  });

  describe('handle init custom theme request', () => {
    const func = mjs.handleInitCustomThemeRequest;
    beforeEach(() => {
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.userOpts.clear();
    });

    it('should not call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      const i = browser.runtime.sendMessage.callCount;
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      const res = await func();
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
        'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      const i = browser.runtime.sendMessage.callCount;
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {
          checked: true
        },
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      const i = browser.runtime.sendMessage.callCount;
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      mjs.userOpts.set(FRAME_COLOR_USE, true);
      const res = await func(true);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
        'called');
      assert.isNull(res, 'result');
    });
  });

  describe('handle event', () => {
    const func = mjs.handleEvt;
    beforeEach(() => {
      const pinned = document.createElement('section');
      const newTab = document.createElement('section');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      body.appendChild(pinned);
      body.appendChild(newTab);
      mjs.sidebar.incognito = false;
    });
    afterEach(() => {
      mjs.sidebar.incognito = false;
    });

    it('should throw', () => {
      assert.throws(() => func());
    });

    it('should not call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.menus.update.callCount;
      const body = document.querySelector('body');
      mjs.sidebar.windowId = 1;
      browser.menus.update.resolves(undefined);
      const evt = {
        target: body
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.menus.update.callCount, j,
        'not called update');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.sidebar.windowId = 1;
      const evt = {
        ctrlKey: true,
        key: 'c',
        target: body
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.tabs.query.callCount, j, 'not called query');
      assert.strictEqual(browser.tabs.highlight.callCount, k,
        'not called highlight');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.query.resolves([{
        index: 1
      }]);
      browser.tabs.highlight.resolves({});
      const evt = {
        ctrlKey: true,
        key: 'a',
        target: body,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.tabs.query.callCount, j + 1, 'called query');
      assert.strictEqual(browser.tabs.highlight.callCount, k + 1,
        'called highlight');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.query.resolves([{
        index: 1
      }]);
      browser.tabs.highlight.resolves({});
      const evt = {
        ctrlKey: true,
        key: 'a',
        target: elm,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.tabs.query.callCount, j + 1, 'called query');
      assert.strictEqual(browser.tabs.highlight.callCount, k + 1,
        'called highlight');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.query.resolves([{
        index: 1
      }]);
      browser.tabs.highlight.resolves({});
      mjs.sidebar.isMac = true;
      const evt = {
        metaKey: true,
        key: 'a',
        target: body,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.tabs.query.callCount, j + 1, 'called query');
      assert.strictEqual(browser.tabs.highlight.callCount, k + 1,
        'called highlight');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.sidebar.windowId = 1;
      const evt = {
        shiftKey: true,
        key: 'F10',
        target: body
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.tabs.query.callCount, j, 'not called query');
      assert.strictEqual(browser.tabs.highlight.callCount, k,
        'not called highlight');
      assert.deepEqual(res.length, 2, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.sidebar.windowId = 1;
      browser.tabs.get.withArgs(1).resolves({
        index: 0,
        mutedInfo: {
          muted: false
        },
        pinned: true
      });
      browser.tabs.get.withArgs(2).resolves({
        index: 1,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.get.withArgs(3).resolves({
        index: 2,
        mutedInfo: {
          muted: true
        },
        pinned: false
      });
      browser.tabs.get.withArgs(4).resolves({
        index: 3,
        mutedInfo: {
          muted: false
        },
        pinned: false
      });
      browser.tabs.query.resolves([]);
      const evt = {
        shiftKey: true,
        key: 'F10',
        target: elm
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i + 1, 'called get');
      assert.strictEqual(browser.tabs.query.callCount, j + 1, 'called query');
      assert.strictEqual(browser.tabs.highlight.callCount, k,
        'not called highlight');
      assert.deepEqual(res.length, 2, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.sidebar.windowId = 1;
      const evt = {
        key: 'ContextMenu',
        target: body
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.tabs.query.callCount, j, 'not called query');
      assert.strictEqual(browser.tabs.highlight.callCount, k,
        'not called highlight');
      assert.deepEqual(res.length, 2, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.tabs.query.callCount;
      const k = browser.tabs.highlight.callCount;
      const sect = document.createElement('section');
      const sect2 = document.createElement('section');
      const elm = document.createElement('div');
      const elm1 = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const pinned = document.getElementById(PINNED);
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      pinned.appendChild(elm);
      sect.classList.add(CLASS_TAB_CONTAINER);
      sect.classList.add(CLASS_TAB_GROUP);
      elm1.classList.add(TAB);
      elm1.classList.add(ACTIVE);
      elm1.dataset.tabId = '2';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '3';
      sect.appendChild(elm1);
      sect.appendChild(elm2);
      sect2.classList.add(CLASS_TAB_CONTAINER);
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '4';
      sect2.appendChild(elm3);
      body.insertBefore(sect, newTab);
      body.insertBefore(sect2, newTab);
      mjs.sidebar.windowId = 1;
      const evt = {
        button: 2,
        target: body
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.tabs.query.callCount, j, 'not called query');
      assert.strictEqual(browser.tabs.highlight.callCount, k,
        'not called highlight');
      assert.deepEqual(res.length, 2, 'result');
    });
  });

  describe('handle contextmenu event', () => {
    const func = mjs.handleContextmenuEvt;
    beforeEach(() => {
      if (typeof browser.menus.overrideContext !== 'function') {
        browser.menus.overrideContext = sinon.stub();
      }
    });

    it('should throw', () => {
      assert.throws(() => func());
    });

    it('should not call function', async () => {
      const i = browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: 'tab'
      }).callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = browser.tabs.TAB_ID_NONE.toString();
      elm.classList.add(TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func({
        target: elm
      });
      assert.strictEqual(browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: 'tab'
      }).callCount, i, 'not called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: 'tab'
      }).callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm.classList.add(TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func({
        target: elm
      });
      assert.strictEqual(browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: 'tab'
      }).callCount, i + 1, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: 'tab'
      }).callCount;
      const parent = document.createElement('div');
      const heading = document.createElement('p');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm.classList.add(TAB);
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(heading);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func({
        target: heading
      });
      assert.strictEqual(browser.menus.overrideContext.withArgs({
        tabId: 1,
        context: 'tab'
      }).callCount, i + 1, 'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('handle wheel event', () => {
    const func = mjs.handleWheelEvt;
    beforeEach(() => {
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.userOpts.clear();
    });

    it('should throws', () => {
      assert.throws(() => func());
    });

    it('should not prevent default', () => {
      const main = document.createElement('main');
      const body = document.querySelector('body');
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 123;
      main.clientHeight = 120;
      const evt = {
        deltaY: 3,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = func(evt);
      assert.isTrue(evt.preventDefault.notCalled, 'not called');
      assert.isTrue(evt.stopPropagation.notCalled, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not prevent default', () => {
      const main = document.createElement('main');
      const body = document.querySelector('body');
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 120;
      main.clientHeight = 120;
      const evt = {
        deltaY: 3,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = func(evt);
      assert.isTrue(evt.preventDefault.notCalled, 'not called');
      assert.isTrue(evt.stopPropagation.notCalled, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not prevent default', async () => {
      const main = document.createElement('main');
      const body = document.querySelector('body');
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 120;
      main.clientHeight = 120;
      mjs.userOpts.set(TAB_SWITCH_SCROLL, true);
      const evt = {
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = await func(evt);
      assert.isTrue(evt.preventDefault.notCalled, 'not called');
      assert.isTrue(evt.stopPropagation.notCalled, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not prevent default', async () => {
      const main = document.createElement('main');
      const body = document.querySelector('body');
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 120;
      main.clientHeight = 120;
      mjs.userOpts.set(TAB_SWITCH_SCROLL, true);
      const evt = {
        deltaY: 0,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = await func(evt);
      assert.isTrue(evt.preventDefault.notCalled, 'not called');
      assert.isTrue(evt.stopPropagation.notCalled, 'not called');
      assert.isNull(res, 'result');
    });

    it('should prevent default and call function', async () => {
      const stubActivate = browser.tabs.update.withArgs(3, {
        active: true
      });
      const i = stubActivate.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const main = document.createElement('main');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm2.dataset.tabId = '2';
      elm3.dataset.tabId = '3';
      main.appendChild(elm);
      main.appendChild(elm2);
      main.appendChild(elm3);
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 120;
      main.clientHeight = 120;
      mjs.userOpts.set(TAB_SWITCH_SCROLL, true);
      browser.tabs.query.resolves([{ id: 2 }]);
      const evt = {
        deltaY: 3,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = await func(evt);
      assert.strictEqual(stubActivate.callCount, i + 1, 'called');
      assert.isTrue(evt.preventDefault.calledOnce, 'called');
      assert.isTrue(evt.stopPropagation.notCalled, 'not called');
      assert.isTrue(browser.tabs.query.calledOnce, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should prevent default and call function', async () => {
      const stubActivate = browser.tabs.update.withArgs(1, {
        active: true
      });
      const i = stubActivate.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const main = document.createElement('main');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm2.dataset.tabId = '2';
      elm3.dataset.tabId = '3';
      main.appendChild(elm);
      main.appendChild(elm2);
      main.appendChild(elm3);
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 120;
      main.clientHeight = 120;
      mjs.userOpts.set(TAB_SWITCH_SCROLL, true);
      mjs.userOpts.set(SCROLL_DIR_INVERT, true);
      browser.tabs.query.resolves([{ id: 2 }]);
      const evt = {
        deltaY: 3,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = await func(evt);
      assert.strictEqual(stubActivate.callCount, i + 1, 'called');
      assert.isTrue(evt.preventDefault.calledOnce, 'called');
      assert.isTrue(evt.stopPropagation.notCalled, 'not called');
      assert.isTrue(browser.tabs.query.calledOnce, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should prevent default and call function', async () => {
      const stubActivate = browser.tabs.update.withArgs(1, {
        active: true
      });
      const i = stubActivate.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const main = document.createElement('main');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm2.dataset.tabId = '2';
      elm3.dataset.tabId = '3';
      main.appendChild(elm);
      main.appendChild(elm2);
      main.appendChild(elm3);
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 120;
      main.clientHeight = 120;
      mjs.userOpts.set(TAB_SWITCH_SCROLL, true);
      browser.tabs.query.resolves([{ id: 2 }]);
      const evt = {
        deltaY: -3.1,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = await func(evt);
      assert.strictEqual(stubActivate.callCount, i + 1, 'called');
      assert.isTrue(evt.preventDefault.calledOnce, 'called');
      assert.isTrue(evt.stopPropagation.notCalled, 'not called');
      assert.isTrue(browser.tabs.query.calledOnce, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should prevent default and call function', async () => {
      const stubActivate = browser.tabs.update.withArgs(3, {
        active: true
      });
      const i = stubActivate.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const main = document.createElement('main');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm2.dataset.tabId = '2';
      elm3.dataset.tabId = '3';
      main.appendChild(elm);
      main.appendChild(elm2);
      main.appendChild(elm3);
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 120;
      main.clientHeight = 120;
      mjs.userOpts.set(TAB_SWITCH_SCROLL, true);
      mjs.userOpts.set(SCROLL_DIR_INVERT, true);
      browser.tabs.query.resolves([{ id: 2 }]);
      const evt = {
        deltaY: -3.1,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = await func(evt);
      assert.strictEqual(stubActivate.callCount, i + 1, 'called');
      assert.isTrue(evt.preventDefault.calledOnce, 'called');
      assert.isTrue(evt.stopPropagation.notCalled, 'not called');
      assert.isTrue(browser.tabs.query.calledOnce, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should not call function', async () => {
      const stubActivate = browser.tabs.update.withArgs(1, {
        active: true
      });
      const i = stubActivate.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const main = document.createElement('main');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm2.dataset.tabId = '2';
      elm3.dataset.tabId = '3';
      main.appendChild(elm);
      main.appendChild(elm2);
      main.appendChild(elm3);
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 200;
      main.clientHeight = 120;
      mjs.userOpts.set(TAB_SWITCH_SCROLL, true);
      mjs.userOpts.set(TAB_SWITCH_SCROLL_ALWAYS, false);
      browser.tabs.query.resolves([{ id: 2 }]);
      const evt = {
        deltaY: -3.1,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = await func(evt);
      assert.strictEqual(stubActivate.callCount, i, 'not called');
      assert.isTrue(evt.preventDefault.notCalled, 'not called');
      assert.isTrue(evt.stopPropagation.notCalled, 'not called');
      assert.isTrue(browser.tabs.query.notCalled, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const stubActivate = browser.tabs.update.withArgs(1, {
        active: true
      });
      const i = stubActivate.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const main = document.createElement('main');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm2.dataset.tabId = '2';
      elm3.dataset.tabId = '3';
      main.appendChild(elm);
      main.appendChild(elm2);
      main.appendChild(elm3);
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 200;
      main.clientHeight = 120;
      mjs.userOpts.set(TAB_SWITCH_SCROLL, false);
      mjs.userOpts.set(TAB_SWITCH_SCROLL_ALWAYS, true);
      browser.tabs.query.resolves([{ id: 2 }]);
      const evt = {
        deltaY: -3.1,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = await func(evt);
      assert.strictEqual(stubActivate.callCount, i, 'not called');
      assert.isTrue(evt.preventDefault.notCalled, 'not called');
      assert.isTrue(evt.stopPropagation.notCalled, 'not called');
      assert.isTrue(browser.tabs.query.notCalled, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const stubActivate = browser.tabs.update.withArgs(1, {
        active: true
      });
      const i = stubActivate.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const main = document.createElement('main');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm2.dataset.tabId = '2';
      elm3.dataset.tabId = '3';
      main.appendChild(elm);
      main.appendChild(elm2);
      main.appendChild(elm3);
      body.appendChild(main);
      main.id = SIDEBAR_MAIN;
      main.scrollHeight = 200;
      main.clientHeight = 120;
      mjs.userOpts.set(TAB_SWITCH_SCROLL, true);
      mjs.userOpts.set(TAB_SWITCH_SCROLL_ALWAYS, true);
      browser.tabs.query.resolves([{ id: 2 }]);
      const evt = {
        deltaY: -3.1,
        preventDefault: sinon.stub(),
        stopPropagation: sinon.stub()
      };
      const res = await func(evt);
      assert.strictEqual(stubActivate.callCount, i + 1, 'called');
      assert.isTrue(evt.preventDefault.calledOnce, 'called');
      assert.isTrue(evt.stopPropagation.calledOnce, 'called');
      assert.isTrue(browser.tabs.query.calledOnce, 'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('handle runtime message', () => {
    const func = mjs.handleMsg;

    it('should not call function', async () => {
      const res = await func({});
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const msg = {
        foo: true
      };
      const res = await func(msg);
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const msg = {
        [EXT_INIT]: false
      };
      const res = await func(msg);
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const msg = {
        [THEME_CUSTOM_INIT]: false
      };
      const res = await func(msg);
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const msg = {
        [THEME_CUSTOM_REQ]: false
      };
      const res = await func(msg);
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const j = browser.windows.getCurrent.callCount;
      const k = browser.sessions.getWindowValue.callCount;
      const l = browser.sessions.setWindowValue.callCount;
      const sect = document.createElement('section');
      const div = document.createElement('div');
      const body = document.querySelector('body');
      sect.classList.add(CLASS_TAB_CONTAINER);
      div.classList.add(TAB);
      div.dataset.tabId = '1';
      div.dataset.tab = JSON.stringify({
        index: 0,
        url: 'https://example.com'
      });
      const span = document.createElement('span');
      span.classList.add('tab-context');
      span.setAttribute('title', '');
      const img = document.createElement('img');
      img.classList.add('tab-toggle-icon');
      img.src = '';
      img.alt = '';
      span.appendChild(img);
      div.appendChild(span);
      const span2 = document.createElement('span');
      span2.classList.add('tab-content');
      span2.setAttribute('title', '');
      const img2 = document.createElement('img');
      img2.classList.add('tab-icon');
      img2.src = '';
      img2.alt = '';
      img2.dataset.connecting = '';
      span2.appendChild(img2);
      const span2_1 = document.createElement('span');
      span2_1.classList.add('tab-title');
      span2.appendChild(span2_1);
      div.appendChild(span2);
      const span3 = document.createElement('span');
      span3.classList.add('tab-audio');
      span3.setAttribute('title', '');
      const img3 = document.createElement('img');
      img3.classList.add('tab-audio-icon');
      img3.src = '';
      img3.alt = '';
      span3.appendChild(img3);
      div.appendChild(span3);
      const span4 = document.createElement('span');
      span4.classList.add('tab-ident');
      span4.setAttribute('title', '');
      const img4 = document.createElement('img');
      img4.classList.add('tab-ident-icon');
      img4.src = '';
      img4.alt = '';
      span4.appendChild(img4);
      div.appendChild(span4);
      const span5 = document.createElement('span');
      span5.classList.add('tab-close');
      span5.setAttribute('title', '');
      const img5 = document.createElement('img');
      img5.classList.add('tab-close-icon');
      img5.src = '';
      img5.alt = '';
      span5.appendChild(img5);
      div.appendChild(span5);
      const span6 = document.createElement('span');
      span6.classList.add('tab-pinned');
      const img6 = document.createElement('img');
      img6.classList.add('tab-pinned-icon');
      img6.src = '';
      img6.alt = '';
      span6.appendChild(img6);
      div.appendChild(span6);
      sect.appendChild(div);
      body.appendChild(sect);
      browser.tabs.get.withArgs(1).resolves({
        status: 'complete'
      });
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT,
        incognito: false
      });
      const msg = {
        [EXT_INIT]: true
      };
      const res = await func(msg);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called get');
      assert.strictEqual(browser.windows.getCurrent.callCount, j,
        'not called windows get current');
      assert.strictEqual(browser.sessions.getWindowValue.callCount, k,
        'not called sessions get');
      assert.strictEqual(browser.sessions.setWindowValue.callCount, l + 1,
        'called sessions set');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const msg = {
        [THEME_CUSTOM_INIT]: true
      };
      const res = await func(msg);
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      const msg = {
        [THEME_CUSTOM_REQ]: true
      };
      const res = await func(msg);
      assert.deepEqual(res, [null], 'result');
    });
  });

  describe('requestSidebarStateUpdate', () => {
    const func = mjs.requestSidebarStateUpdate;
    beforeEach(() => {
      mjs.ports.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
    });

    it('should not call function', async () => {
      browser.windows.getCurrent.resolves({
        id: browser.windows.WINDOW_ID_CURRENT
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = port.postMessage.callCount;
      const j = browser.windows.getCurrent.callCount;
      const res = await func();
      assert.strictEqual(port.postMessage.callCount, i, 'not called');
      assert.strictEqual(browser.windows.getCurrent.callCount, j, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: false,
        id: 1,
        type: 'normal'
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = port.postMessage.callCount;
      const j = browser.windows.getCurrent.callCount;
      mjs.sidebar.windowId = 1;
      const res = await func();
      assert.strictEqual(port.postMessage.callCount, i, 'not called');
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1, 'called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 2,
        type: 'normal'
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = port.postMessage.callCount;
      const j = browser.windows.getCurrent.callCount;
      mjs.sidebar.windowId = 1;
      const res = await func();
      assert.strictEqual(port.postMessage.callCount, i, 'not called');
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1, 'called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        type: 'popup'
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = port.postMessage.callCount;
      const j = browser.windows.getCurrent.callCount;
      mjs.sidebar.windowId = 1;
      const res = await func();
      assert.strictEqual(port.postMessage.callCount, i, 'not called');
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1, 'called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.windows.getCurrent.resolves({
        focused: true,
        id: 1,
        type: 'normal'
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.resolves({});
      mjs.ports.set(portId, port);
      const i = port.postMessage.callCount;
      const j = browser.windows.getCurrent.callCount;
      mjs.sidebar.windowId = 1;
      const res = await func();
      assert.strictEqual(port.postMessage.callCount, i + 1, 'called');
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('set storage value', () => {
    const func = mjs.setStorageValue;
    beforeEach(() => {
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.userOpts.clear();
    });

    it('should not set variable', async () => {
      const res = await func();
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func('foo', {});
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func(CUSTOM_BG, { value: '#ff0000' });
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func(CUSTOM_BG_ACTIVE, { value: '#ff0000' });
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func(CUSTOM_BG_HOVER, { value: '#ff0000' });
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func(CUSTOM_BG_SELECT, { value: '#ff0000' });
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func(CUSTOM_BG_SELECT_HOVER, { value: '#ff0000' });
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func(CUSTOM_BORDER_ACTIVE, { value: '#ff0000' });
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func(CUSTOM_COLOR, { value: '#ff0000' });
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func(CUSTOM_COLOR_ACTIVE, { value: '#ff0000' });
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func(CUSTOM_COLOR_HOVER, { value: '#ff0000' });
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func(CUSTOM_COLOR_SELECT, { value: '#ff0000' });
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func(CUSTOM_COLOR_SELECT_HOVER, { value: '#ff0000' });
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func(THEME_UI_SCROLLBAR_NARROW, { checked: true });
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variable', async () => {
      const res = await func(THEME_UI_TAB_COMPACT, { checked: true });
      assert.deepEqual(res, [], 'result');
    });

    it('should set variable', async () => {
      const body = document.querySelector('body');
      const res =
        await func(THEME_UI_SCROLLBAR_NARROW, { checked: true }, true);
      assert.isTrue(body.classList.contains(CLASS_NARROW), 'set');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set variable', async () => {
      const body = document.querySelector('body');
      const res = await func(THEME_UI_TAB_COMPACT, { checked: true }, true);
      assert.isTrue(body.classList.contains(CLASS_COMPACT), 'set');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set variable', async () => {
      const body = document.querySelector('body');
      const res =
        await func(THEME_UI_TAB_GROUP_NARROW, { checked: true }, true);
      assert.isTrue(body.classList.contains(CLASS_NARROW_TAB_GROUP), 'set');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should not call function', async () => {
      mjs.userOpts.set(USER_CSS_USE, true);
      browser.storage.local.get.resolves({
        [USER_CSS]: {
          value: 'body { color: red; }'
        }
      });
      const i = browser.storage.local.get.callCount;
      const res = await func(USER_CSS, { value: 'body { color: red; }' });
      assert.strictEqual(browser.storage.local.get.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      mjs.userOpts.set(USER_CSS_USE, true);
      browser.storage.local.get.resolves({
        [USER_CSS]: {
          value: 'body { color: red; }'
        }
      });
      const i = browser.storage.local.get.callCount;
      const res = await func(USER_CSS, { value: 'body { color: red; }' }, true);
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should not call function', async () => {
      browser.storage.local.get.resolves({
        [USER_CSS]: {
          value: 'body { color: red; }'
        }
      });
      const i = browser.storage.local.get.callCount;
      const res = await func(USER_CSS_USE, { checked: true });
      assert.strictEqual(browser.storage.local.get.callCount, i, 'not called');
      assert.isTrue(mjs.userOpts.get(USER_CSS_USE), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should call function', async () => {
      mjs.userOpts.set(USER_CSS_USE, true);
      browser.storage.local.get.resolves({
        [USER_CSS]: {
          value: 'body { color: red; }'
        }
      });
      const i = browser.storage.local.get.callCount;
      const res = await func(USER_CSS_USE, { checked: false }, true);
      assert.strictEqual(browser.storage.local.get.callCount, i, 'not called');
      assert.isFalse(mjs.userOpts.get(USER_CSS_USE), 'value');
      assert.deepEqual(res, [mjs.userOpts, undefined], 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [USER_CSS]: {
          value: 'body { color: red; }'
        }
      });
      const i = browser.storage.local.get.callCount;
      const res = await func(USER_CSS_USE, { checked: true }, true);
      assert.strictEqual(browser.storage.local.get.callCount, i + 1, 'called');
      assert.isTrue(mjs.userOpts.get(USER_CSS_USE), 'value');
      assert.deepEqual(res, [mjs.userOpts, undefined], 'result');
    });

    it('should not call function', async () => {
      const i = browser.storage.local.set.callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func(FRAME_COLOR_USE, {
        checked: true
      }, false);
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j,
        'not called');
      assert.isTrue(mjs.userOpts.get(FRAME_COLOR_USE), 'opts');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.runtime.sendMessage.resolves({});
      const i = browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      }).callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func(FRAME_COLOR_USE, {
        checked: true
      }, true);
      assert.strictEqual(browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j + 1,
        'called');
      assert.isTrue(mjs.userOpts.get(FRAME_COLOR_USE), 'opts');
      assert.deepEqual(res, [null], 'result');
    });

    it('should not call function', async () => {
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.set.callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func(THEME_AUTO, {
        checked: false
      }, true);
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j,
        'not called');
      assert.isFalse(mjs.userOpts.get(THEME_AUTO), 'map');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.set.callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func(THEME_AUTO, {
        checked: true
      }, false);
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j,
        'not called');
      assert.isUndefined(mjs.userOpts.get(THEME_AUTO), 'map');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.runtime.sendMessage.resolves({});
      const i = browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      }).callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func(THEME_AUTO, {
        checked: true
      }, true);
      assert.strictEqual(browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j + 1,
        'called');
      assert.isTrue(mjs.userOpts.get(THEME_AUTO), 'map');
      assert.deepEqual(res, [null], 'result');
    });

    it('should not call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.set.callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func(THEME_CUSTOM, {
        checked: false
      }, true);
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j,
        'not called');
      assert.isFalse(mjs.userOpts.get(THEME_CUSTOM), 'map');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      const i = browser.storage.local.set.callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func(THEME_CUSTOM, {
        checked: true
      }, false);
      assert.strictEqual(browser.storage.local.set.callCount, i, 'not called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j,
        'not called');
      assert.isUndefined(mjs.userOpts.get(THEME_CUSTOM), 'map');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.runtime.sendMessage.resolves({});
      const i = browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      }).callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func(THEME_CUSTOM, {
        checked: true
      }, true);
      assert.strictEqual(browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j + 1,
        'called');
      assert.isUndefined(mjs.userOpts.get(THEME_AUTO), 'map');
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.runtime.sendMessage.resolves({});
      const i = browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      }).callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func(THEME_CUSTOM_DARK, {
        foo: 'bar'
      }, true);
      assert.strictEqual(browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      }).callCount, i + 1, 'called');
      assert.deepEqual(mjs.userOpts.get(THEME_CUSTOM_DARK), {
        foo: 'bar'
      }, 'map');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j + 1,
        'called');
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      browser.storage.local.get.resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.storage.local.get.withArgs(THEME).resolves(undefined);
      browser.management.getAll.resolves([
        {
          id: 'foo',
          type: 'theme',
          enabled: true
        }
      ]);
      browser.runtime.sendMessage.resolves({});
      const i = browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      }).callCount;
      const j = browser.runtime.sendMessage.callCount;
      const res = await func(THEME_CUSTOM_LIGHT, {
        foo: 'bar'
      }, true);
      assert.strictEqual(browser.storage.local.set.withArgs({
        [THEME]: [THEME_AUTO, false]
      }).callCount, i + 1, 'called');
      assert.deepEqual(mjs.userOpts.get(THEME_CUSTOM_LIGHT), {
        foo: 'bar'
      }, 'map');
      assert.strictEqual(browser.runtime.sendMessage.callCount, j + 1,
        'called');
      assert.deepEqual(res, [null], 'result');
    });

    it('should set variable', async () => {
      const i = browser.browserSettings.closeTabsByDoubleClick.get.callCount;
      const j = browser.storage.local.set.callCount;
      browser.browserSettings.closeTabsByDoubleClick.get.returns({});
      const res = await func(BROWSER_SETTINGS_READ, { checked: false });
      assert.isFalse(mjs.userOpts.get(BROWSER_SETTINGS_READ), 'value');
      assert.strictEqual(
        browser.browserSettings.closeTabsByDoubleClick.get.callCount,
        i, 'not called'
      );
      assert.strictEqual(browser.storage.local.set.callCount, j, 'not called');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const i = browser.browserSettings.closeTabsByDoubleClick.get.callCount;
      const j = browser.storage.local.set.callCount;
      browser.browserSettings.closeTabsByDoubleClick.get.returns({});
      const res = await func(BROWSER_SETTINGS_READ, { checked: true });
      assert.isTrue(mjs.userOpts.get(BROWSER_SETTINGS_READ), 'value');
      assert.strictEqual(
        browser.browserSettings.closeTabsByDoubleClick.get.callCount,
        i, 'not called'
      );
      assert.strictEqual(browser.storage.local.set.callCount, j, 'not called');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const i = browser.browserSettings.closeTabsByDoubleClick.get.callCount;
      const j = browser.storage.local.set.callCount;
      browser.browserSettings.closeTabsByDoubleClick.get.returns({});
      const res = await func(BROWSER_SETTINGS_READ, { checked: true }, true);
      assert.isTrue(mjs.userOpts.get(BROWSER_SETTINGS_READ), 'value');
      assert.strictEqual(
        browser.browserSettings.closeTabsByDoubleClick.get.callCount,
        i + 1, 'called'
      );
      assert.strictEqual(browser.storage.local.set.callCount, j + 1, 'called');
      assert.deepEqual(res, [mjs.userOpts, undefined], 'result');
    });

    it('should set variable', async () => {
      const res = await func(FONT_ACTIVE_BOLD, {
        checked: true,
        value: 'bold'
      }, true);
      assert.strictEqual(mjs.userOpts.get(FONT_ACTIVE), 'bold', 'value');
      assert.deepEqual(res, [mjs.userOpts, undefined], 'result');
    });

    it('should set variable', async () => {
      const res = await func(FONT_ACTIVE_BOLD, {
        checked: false,
        value: 'bold'
      }, true);
      assert.isFalse(mjs.userOpts.has(FONT_ACTIVE), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res = await func(FONT_ACTIVE_BOLD, {
        checked: true,
        value: 'bold'
      }, false);
      assert.strictEqual(mjs.userOpts.get(FONT_ACTIVE), 'bold', 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res = await func(FONT_ACTIVE_NORMAL, {
        checked: true,
        value: 'normal'
      }, true);
      assert.strictEqual(mjs.userOpts.get(FONT_ACTIVE), 'normal', 'value');
      assert.deepEqual(res, [mjs.userOpts, undefined], 'result');
    });

    it('should set variable', async () => {
      const res = await func(FONT_ACTIVE_NORMAL, {
        checked: false,
        value: 'normal'
      }, true);
      assert.isFalse(mjs.userOpts.has(FONT_ACTIVE), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const elm = document.createElement('style');
      const body = document.querySelector('body');
      elm.id = THEME_CUSTOM_ID;
      body.appendChild(elm);
      const res = await func(FONT_ACTIVE_NORMAL, {
        checked: true,
        value: 'normal'
      }, false);
      const { sheet } = elm;
      assert.strictEqual(mjs.userOpts.get(FONT_ACTIVE), 'normal', 'value');
      assert.strictEqual(sheet.cssRules.length, 0, 'length');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res = await func(TABS_CLOSE_DBLCLICK, { checked: true });
      assert.isTrue(mjs.userOpts.get(TABS_CLOSE_DBLCLICK), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res = await func(TABS_CLOSE_DBLCLICK, { checked: false });
      assert.isFalse(mjs.userOpts.get(TABS_CLOSE_DBLCLICK), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res = await func(TABS_CLOSE_DBLCLICK, { checked: true }, true);
      assert.isTrue(mjs.userOpts.get(TABS_CLOSE_DBLCLICK), 'value');
      assert.deepEqual(res, [mjs.userOpts, []], 'result');
    });

    it('should set variable', async () => {
      const res = await func(TABS_CLOSE_MDLCLICK_PREVENT, { checked: true });
      assert.isFalse(mjs.userOpts.get(TABS_CLOSE_MDLCLICK), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res = await func(TABS_CLOSE_MDLCLICK_PREVENT, { checked: false });
      assert.isTrue(mjs.userOpts.get(TABS_CLOSE_MDLCLICK), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res =
        await func(TABS_CLOSE_MDLCLICK_PREVENT, { checked: true }, true);
      assert.isFalse(mjs.userOpts.get(TABS_CLOSE_MDLCLICK), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res = await func(TAB_GROUP_ENABLE, { checked: true });
      assert.isTrue(mjs.userOpts.get(TAB_GROUP_ENABLE), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res = await func(TAB_GROUP_ENABLE, { checked: false });
      assert.isFalse(mjs.userOpts.get(TAB_GROUP_ENABLE), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res = await func(TAB_GROUP_ENABLE, { checked: true }, true);
      assert.isTrue(mjs.userOpts.get(TAB_GROUP_ENABLE), 'value');
      assert.deepEqual(res, [mjs.userOpts, []], 'result');
    });

    it('should set variable', async () => {
      const res =
        await func(TAB_GROUP_EXPAND_COLLAPSE_OTHER, { checked: true });
      assert.isTrue(mjs.userOpts.get(TAB_GROUP_EXPAND_COLLAPSE_OTHER), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      mjs.userOpts.set(TAB_GROUP_EXPAND_COLLAPSE_OTHER, true);
      const res =
        await func(TAB_GROUP_EXPAND_COLLAPSE_OTHER, { checked: false });
      assert.isFalse(mjs.userOpts.get(TAB_GROUP_EXPAND_COLLAPSE_OTHER),
        'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res =
        await func(TAB_GROUP_EXPAND_COLLAPSE_OTHER, { checked: true }, true);
      assert.isTrue(mjs.userOpts.get(TAB_GROUP_EXPAND_COLLAPSE_OTHER), 'value');
      assert.deepEqual(res, [mjs.userOpts, []], 'result');
    });

    it('should set variable', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(CLASS_TAB_CONTAINER, PINNED, CLASS_COLLAPSE_AUTO);
      body.appendChild(elm);
      const res =
        await func(TAB_GROUP_EXPAND_EXCLUDE_PINNED, { checked: true });
      assert.isTrue(mjs.userOpts.get(TAB_GROUP_EXPAND_EXCLUDE_PINNED), 'value');
      assert.isFalse(elm.classList.contains(CLASS_COLLAPSE_AUTO));
      assert.deepEqual(res, [mjs.userOpts, undefined], 'result');
    });

    it('should set variable', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(CLASS_TAB_CONTAINER, PINNED);
      body.appendChild(elm);
      const res =
        await func(TAB_GROUP_EXPAND_EXCLUDE_PINNED, { checked: false });
      assert.isFalse(mjs.userOpts.get(TAB_GROUP_EXPAND_EXCLUDE_PINNED),
        'value');
      assert.isTrue(elm.classList.contains(CLASS_COLLAPSE_AUTO));
      assert.deepEqual(res, [mjs.userOpts, undefined], 'result');
    });

    it('should set variable', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(CLASS_TAB_CONTAINER, PINNED, CLASS_COLLAPSE_AUTO);
      body.appendChild(elm);
      const res =
        await func(TAB_GROUP_EXPAND_EXCLUDE_PINNED, { checked: true }, true);
      assert.isTrue(mjs.userOpts.get(TAB_GROUP_EXPAND_EXCLUDE_PINNED), 'value');
      assert.isFalse(elm.classList.contains(CLASS_COLLAPSE_AUTO));
      assert.deepEqual(res, [mjs.userOpts, undefined], 'result');
    });

    it('should set variable', async () => {
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(CLASS_TAB_CONTAINER, PINNED, CLASS_COLLAPSE_AUTO);
      body.appendChild(elm);
      const res =
        await func(TAB_GROUP_EXPAND_EXCLUDE_PINNED, { checked: false }, true);
      assert.isFalse(mjs.userOpts.get(TAB_GROUP_EXPAND_EXCLUDE_PINNED),
        'value');
      assert.isTrue(elm.classList.contains(CLASS_COLLAPSE_AUTO));
      assert.deepEqual(res, [mjs.userOpts, undefined], 'result');
    });

    it('should set variable', async () => {
      const res = await func(TAB_GROUP_NEW_TAB_AT_END, { checked: true });
      assert.isTrue(mjs.userOpts.get(TAB_GROUP_NEW_TAB_AT_END), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      mjs.userOpts.set(TAB_GROUP_NEW_TAB_AT_END, true);
      const res = await func(TAB_GROUP_NEW_TAB_AT_END, { checked: false });
      assert.isFalse(mjs.userOpts.get(TAB_GROUP_NEW_TAB_AT_END), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res = await func(TAB_SWITCH_SCROLL, { checked: true });
      assert.isTrue(mjs.userOpts.get(TAB_SWITCH_SCROLL), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      mjs.userOpts.set(TAB_SWITCH_SCROLL, true);
      const res = await func(TAB_SWITCH_SCROLL, { checked: false });
      assert.isFalse(mjs.userOpts.get(TAB_SWITCH_SCROLL), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res = await func(TAB_SWITCH_SCROLL_ALWAYS, { checked: true });
      assert.isTrue(mjs.userOpts.get(TAB_SWITCH_SCROLL_ALWAYS), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      mjs.userOpts.set(TAB_SWITCH_SCROLL_ALWAYS, true);
      const res = await func(TAB_SWITCH_SCROLL_ALWAYS, { checked: false });
      assert.isFalse(mjs.userOpts.get(TAB_SWITCH_SCROLL_ALWAYS), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res = await func(SCROLL_DIR_INVERT, { checked: true });
      assert.isTrue(mjs.userOpts.get(SCROLL_DIR_INVERT), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      mjs.userOpts.set(SCROLL_DIR_INVERT, true);
      const res = await func(SCROLL_DIR_INVERT, { checked: false });
      assert.isFalse(mjs.userOpts.get(SCROLL_DIR_INVERT), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const res = await func(SCROLL_DIR_INVERT, { checked: true }, true);
      assert.isTrue(mjs.userOpts.get(SCROLL_DIR_INVERT), 'value');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = NEW_TAB;
      elm.classList.add(TAB, NEW_TAB);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(NEW_TAB_SEPARATOR_SHOW, { checked: true });
      assert.isTrue(mjs.userOpts.get(NEW_TAB_SEPARATOR_SHOW), 'value');
      assert.isFalse(elm.classList.contains(CLASS_SEPARATOR_SHOW), 'class');
      assert.deepEqual(res, [mjs.userOpts], 'result');
    });

    it('should set variable', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = NEW_TAB;
      elm.classList.add(TAB, NEW_TAB);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(NEW_TAB_SEPARATOR_SHOW, { checked: true }, true);
      assert.isTrue(mjs.userOpts.get(NEW_TAB_SEPARATOR_SHOW), 'value');
      assert.isTrue(elm.classList.contains(CLASS_SEPARATOR_SHOW), 'class');
      assert.deepEqual(res, [mjs.userOpts, undefined], 'result');
    });

    it('should set variable', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = NEW_TAB;
      elm.classList.add(TAB, NEW_TAB, CLASS_SEPARATOR_SHOW);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(NEW_TAB_SEPARATOR_SHOW, { checked: false }, true);
      assert.isFalse(mjs.userOpts.get(NEW_TAB_SEPARATOR_SHOW), 'value');
      assert.isFalse(elm.classList.contains(CLASS_SEPARATOR_SHOW), 'class');
      assert.deepEqual(res, [mjs.userOpts, undefined], 'result');
    });
  });

  describe('handle storage', () => {
    const func = mjs.handleStorage;
    beforeEach(() => {
      mjs.userOpts.clear();
    });
    afterEach(() => {
      mjs.userOpts.clear();
    });

    it('should not set variables', async () => {
      const res = await func();
      assert.deepEqual(res, [], 'result');
    });

    it('should not set variables', async () => {
      const res = await func({
        [TAB_GROUP_NEW_TAB_AT_END]: {
          checked: true
        }
      }, 'foo');
      assert.strictEqual(mjs.userOpts.size, 0, 'size');
      assert.deepEqual(res, [], 'result');
    });

    it('should set variables', async () => {
      const res = await func({
        [TAB_GROUP_NEW_TAB_AT_END]: {
          checked: true
        }
      });
      assert.strictEqual(mjs.userOpts.size, 1, 'size');
      assert.isTrue(mjs.userOpts.get(TAB_GROUP_NEW_TAB_AT_END), 'value');
      assert.deepEqual(res, [[mjs.userOpts]], 'result');
    });

    it('should set variables', async () => {
      const res = await func({
        [TAB_GROUP_NEW_TAB_AT_END]: {
          checked: true
        }
      }, 'local');
      assert.strictEqual(mjs.userOpts.size, 1, 'size');
      assert.isTrue(mjs.userOpts.get(TAB_GROUP_NEW_TAB_AT_END), 'value');
      assert.deepEqual(res, [[mjs.userOpts]], 'result');
    });

    it('should set variables', async () => {
      const res = await func({
        [TAB_GROUP_NEW_TAB_AT_END]: {
          newValue: {
            checked: true
          }
        }
      });
      assert.strictEqual(mjs.userOpts.size, 1, 'size');
      assert.isTrue(mjs.userOpts.get(TAB_GROUP_NEW_TAB_AT_END), 'value');
      assert.deepEqual(res, [[mjs.userOpts]], 'result');
    });

    it('should set variables', async () => {
      const res = await func({
        [TAB_GROUP_NEW_TAB_AT_END]: {
          newValue: {
            checked: true
          }
        }
      }, 'local', true);
      assert.strictEqual(mjs.userOpts.size, 3, 'size');
      assert.isTrue(mjs.userOpts.has(TABS_CLOSE_MDLCLICK), 'default option');
      assert.isTrue(mjs.userOpts.has(TAB_GROUP_ENABLE), 'default option');
      assert.isTrue(mjs.userOpts.get(TAB_GROUP_NEW_TAB_AT_END), 'value');
      assert.deepEqual(res, [[mjs.userOpts]], 'result');
    });
  });

  describe('restore highlighted tabs', () => {
    const func = mjs.restoreHighlightedTabs;

    it('should restore', async () => {
      const i = browser.tabs.query.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        highlighted: true,
        windowType: 'normal'
      }).returns([
        { id: 1 },
        { id: 2 }
      ]);
      await func();
      assert.strictEqual(browser.tabs.query.callCount, i + 1, 'called');
      assert.isTrue(elm.classList.contains(HIGHLIGHTED), 'class');
      assert.isTrue(elm2.classList.contains(HIGHLIGHTED), 'class');
      assert.isFalse(elm3.classList.contains(HIGHLIGHTED), 'class');
    });
  });

  describe('restore tab groups', () => {
    const func = mjs.restoreTabGroups;
    beforeEach(() => {
      const pinned = document.createElement('section');
      const heading = document.createElement('h1');
      const label = document.createElement('span');
      const newTab = document.createElement('section');
      const body = document.querySelector('body');
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
      mjs.userOpts.clear();
    });

    it('should not restore if session is undefined', async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement('section');
      const sect2 = document.createElement('section');
      const sect3 = document.createElement('section');
      const sect4 = document.createElement('section');
      const sect5 = document.createElement('section');
      const heading1 = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const heading3 = document.createElement('h1');
      const heading4 = document.createElement('h1');
      const heading5 = document.createElement('h1');
      const label1 = document.createElement('span');
      const label2 = document.createElement('span');
      const label3 = document.createElement('span');
      const label4 = document.createElement('span');
      const label5 = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const elm5 = document.createElement('div');
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      sect1.id = 'sect1';
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = 'sect2';
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = 'sect3';
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = 'sect4';
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = 'sect5';
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: 'https://example.com/baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: 'https://example.com/qux'
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
        id: winId
      });
      const res = await func();
      const items = document.querySelectorAll(
        `.${CLASS_TAB_CONTAINER}:not(#${PINNED}):not(#${NEW_TAB})`
      );
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        'called sessions get'
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
        'called windows get current');
      for (const item of items) {
        assert.strictEqual(item.childElementCount, 2, 'child');
      }
      assert.deepEqual(res, [], 'result');
    });

    it('should not restore if recent tab list is undefined', async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement('section');
      const sect2 = document.createElement('section');
      const sect3 = document.createElement('section');
      const sect4 = document.createElement('section');
      const sect5 = document.createElement('section');
      const heading1 = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const heading3 = document.createElement('h1');
      const heading4 = document.createElement('h1');
      const heading5 = document.createElement('h1');
      const label1 = document.createElement('span');
      const label2 = document.createElement('span');
      const label3 = document.createElement('span');
      const label4 = document.createElement('span');
      const label5 = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const elm5 = document.createElement('div');
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      sect1.id = 'sect1';
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = 'sect2';
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = 'sect3';
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = 'sect4';
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = 'sect5';
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: 'https://example.com/baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: 'https://example.com/qux'
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
        .withArgs(winId, TAB_LIST).resolves(JSON.stringify({
          foo: 'bar'
        }));
      browser.windows.getCurrent.resolves({
        id: winId
      });
      const res = await func();
      const items = document.querySelectorAll(
        `.${CLASS_TAB_CONTAINER}:not(#${PINNED}):not(#${NEW_TAB})`
      );
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        'called sessions get'
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
        'called windows get current');
      for (const item of items) {
        assert.strictEqual(item.childElementCount, 2, 'child');
      }
      assert.deepEqual(res, [], 'result');
    });

    it('should not restore if not grouped', async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement('section');
      const sect2 = document.createElement('section');
      const sect3 = document.createElement('section');
      const sect4 = document.createElement('section');
      const sect5 = document.createElement('section');
      const heading1 = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const heading3 = document.createElement('h1');
      const heading4 = document.createElement('h1');
      const heading5 = document.createElement('h1');
      const label1 = document.createElement('span');
      const label2 = document.createElement('span');
      const label3 = document.createElement('span');
      const label4 = document.createElement('span');
      const label5 = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const elm5 = document.createElement('div');
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      sect1.id = 'sect1';
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = 'sect2';
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = 'sect3';
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = 'sect4';
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = 'sect5';
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: 'https://example.com/baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: 'https://example.com/qux'
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
              url: 'https://example.com'
            },
            1: {
              collapsed: false,
              containerIndex: 1,
              url: 'https://example.com/foo'
            },
            2: {
              collapsed: false,
              containerIndex: 2,
              url: 'https://example.com/bar'
            },
            3: {
              collapsed: false,
              containerIndex: 3,
              url: 'https://example.com/baz'
            },
            4: {
              collapsed: false,
              containerIndex: 4,
              url: 'https://example.com/qux'
            }
          }
        }));
      browser.windows.getCurrent.resolves({
        id: winId
      });
      const res = await func();
      const items =
        document.querySelectorAll(
          `.${CLASS_TAB_CONTAINER}:not(#${PINNED}):not(#${NEW_TAB})`
        );
      assert.strictEqual(browser.sessions.getWindowValue.callCount, i + 1,
        'called sessions get');
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
        'called windows get current');
      for (const item of items) {
        assert.strictEqual(item.childElementCount, 2, 'child');
      }
      assert.deepEqual(res, [], 'result');
    });

    it('should restore pinned tabs', async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const pinned = document.getElementById(PINNED);
      const sect1 = document.createElement('section');
      const sect2 = document.createElement('section');
      const sect3 = document.createElement('section');
      const sect4 = document.createElement('section');
      const sect5 = document.createElement('section');
      const heading1 = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const heading3 = document.createElement('h1');
      const heading4 = document.createElement('h1');
      const heading5 = document.createElement('h1');
      const label1 = document.createElement('span');
      const label2 = document.createElement('span');
      const label3 = document.createElement('span');
      const label4 = document.createElement('span');
      const label5 = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const elm5 = document.createElement('div');
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      sect1.id = 'sect1';
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = 'sect2';
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = 'sect3';
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = 'sect4';
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = 'sect5';
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: true,
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: true,
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: true,
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: 'https://example.com/baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: 'https://example.com/qux'
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
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com'
            },
            1: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com/foo'
            }
          }
        }));
      browser.windows.getCurrent.resolves({
        id: winId
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        'called sessions get'
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
        'called windows get current');
      assert.strictEqual(pinned.childElementCount, 4, 'pinned');
      assert.isFalse(pinned.classList.contains(CLASS_TAB_COLLAPSED), 'false');
      assert.isTrue(pinned.querySelector(`.${CLASS_HEADING}`).hidden,
        'heading');
      assert.strictEqual(sect1.childElementCount, 1, 'empty section');
      assert.strictEqual(sect2.childElementCount, 1, 'empty section');
      assert.strictEqual(sect3.childElementCount, 1, 'empty section');
      assert.strictEqual(sect4.childElementCount, 2, 'section');
      assert.strictEqual(sect5.childElementCount, 2, 'section');
      assert.deepEqual(res, [undefined, undefined, undefined], 'result');
    });

    it('should restore pinned tabs', async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const pinned = document.getElementById(PINNED);
      const sect1 = document.createElement('section');
      const sect2 = document.createElement('section');
      const sect3 = document.createElement('section');
      const sect4 = document.createElement('section');
      const sect5 = document.createElement('section');
      const heading1 = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const heading3 = document.createElement('h1');
      const heading4 = document.createElement('h1');
      const heading5 = document.createElement('h1');
      const label1 = document.createElement('span');
      const label2 = document.createElement('span');
      const label3 = document.createElement('span');
      const label4 = document.createElement('span');
      const label5 = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const elm5 = document.createElement('div');
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      sect1.id = 'sect1';
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = 'sect2';
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = 'sect3';
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = 'sect4';
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = 'sect5';
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: true,
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: true,
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: true,
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: 'https://example.com/baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: 'https://example.com/qux'
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
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com'
            },
            1: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com/foo'
            },
            2: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com/bar'
            },
            3: {
              collapsed: false,
              containerIndex: 1,
              url: 'https://example.com/baz'
            },
            4: {
              collapsed: false,
              containerIndex: 2,
              url: 'https://example.com/qux'
            }
          }
        }));
      browser.windows.getCurrent.resolves({
        id: winId
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        'called sessions get'
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
        'called windows get current');
      assert.strictEqual(pinned.childElementCount, 4, 'pinned');
      assert.isFalse(pinned.classList.contains(CLASS_TAB_COLLAPSED), 'false');
      assert.isFalse(pinned.querySelector(`.${CLASS_HEADING}`).hidden,
        'heading');
      assert.strictEqual(sect1.childElementCount, 1, 'empty section');
      assert.strictEqual(sect2.childElementCount, 1, 'empty section');
      assert.strictEqual(sect3.childElementCount, 1, 'empty section');
      assert.strictEqual(sect4.childElementCount, 2, 'section');
      assert.strictEqual(sect5.childElementCount, 2, 'section');
      assert.deepEqual(res, [undefined, undefined, undefined], 'result');
    });

    it('should restore pinned tabs', async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const pinned = document.getElementById(PINNED);
      const sect1 = document.createElement('section');
      const sect2 = document.createElement('section');
      const sect3 = document.createElement('section');
      const sect4 = document.createElement('section');
      const sect5 = document.createElement('section');
      const heading1 = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const heading3 = document.createElement('h1');
      const heading4 = document.createElement('h1');
      const heading5 = document.createElement('h1');
      const label1 = document.createElement('span');
      const label2 = document.createElement('span');
      const label3 = document.createElement('span');
      const label4 = document.createElement('span');
      const label5 = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const elm5 = document.createElement('div');
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      sect1.id = 'sect1';
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = 'sect2';
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = 'sect3';
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = 'sect4';
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = 'sect5';
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: true,
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: true,
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: true,
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: 'https://example.com/baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: 'https://example.com/qux'
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
              headingLabel: '',
              headingShown: false,
              url: 'https://example.com'
            },
            1: {
              collapsed: true,
              containerIndex: 0,
              headingLabel: '',
              headingShown: false,
              url: 'https://example.com/foo'
            },
            2: {
              collapsed: true,
              containerIndex: 0,
              headingLabel: '',
              headingShown: false,
              url: 'https://example.com/bar'
            },
            3: {
              collapsed: false,
              containerIndex: 1,
              url: 'https://example.com/baz'
            },
            4: {
              collapsed: false,
              containerIndex: 2,
              url: 'https://example.com/qux'
            }
          }
        }));
      browser.windows.getCurrent.resolves({
        id: winId
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        'called sessions get'
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
        'called windows get current');
      assert.strictEqual(pinned.childElementCount, 4, 'pinned');
      assert.isTrue(pinned.classList.contains(CLASS_TAB_COLLAPSED), 'class');
      assert.isTrue(pinned.querySelector(`.${CLASS_HEADING}`).hidden,
        'heading');
      assert.strictEqual(sect1.childElementCount, 1, 'empty section');
      assert.strictEqual(sect2.childElementCount, 1, 'empty section');
      assert.strictEqual(sect3.childElementCount, 1, 'empty section');
      assert.strictEqual(sect4.childElementCount, 2, 'section');
      assert.strictEqual(sect5.childElementCount, 2, 'section');
      assert.deepEqual(res, [undefined, undefined, undefined], 'result');
    });

    it('should restore group', async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement('section');
      const sect2 = document.createElement('section');
      const sect3 = document.createElement('section');
      const sect4 = document.createElement('section');
      const sect5 = document.createElement('section');
      const heading1 = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const heading3 = document.createElement('h1');
      const heading4 = document.createElement('h1');
      const heading5 = document.createElement('h1');
      const label1 = document.createElement('span');
      const label2 = document.createElement('span');
      const label3 = document.createElement('span');
      const label4 = document.createElement('span');
      const label5 = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const elm5 = document.createElement('div');
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      sect1.id = 'sect1';
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = 'sect2';
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = 'sect3';
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = 'sect4';
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = 'sect5';
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: 'https://example.com/baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: 'https://example.com/bar'
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
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com'
            },
            1: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com/foo'
            },
            2: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com/bar'
            },
            3: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: 'bar',
              headingShown: true,
              url: 'https://example.com/baz'
            },
            4: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: 'bar',
              headingShown: true,
              url: 'https://example.com/bar'
            }
          }
        }));
      browser.windows.getCurrent.resolves({
        id: winId
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        'called sessions get'
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
        'called windows get current');
      assert.strictEqual(sect1.childElementCount, 4, 'section');
      assert.isFalse(sect1.classList.contains(CLASS_TAB_COLLAPSED), 'class');
      assert.isFalse(sect1.querySelector(`.${CLASS_HEADING}`).hidden,
        'heading');
      assert.strictEqual(sect2.childElementCount, 1, 'empty section');
      assert.strictEqual(sect3.childElementCount, 1, 'empty section');
      assert.strictEqual(sect4.childElementCount, 3, 'section');
      assert.isTrue(sect4.classList.contains(CLASS_TAB_COLLAPSED), 'class');
      assert.isFalse(sect4.querySelector(`.${CLASS_HEADING}`).hidden,
        'heading');
      assert.strictEqual(sect5.childElementCount, 1, 'empty section');
      assert.deepEqual(res, [undefined, undefined, undefined], 'result');
    });

    it('should restore group, case: tab added', async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement('section');
      const sect2 = document.createElement('section');
      const sect3 = document.createElement('section');
      const sect4 = document.createElement('section');
      const sect5 = document.createElement('section');
      const heading1 = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const heading3 = document.createElement('h1');
      const heading4 = document.createElement('h1');
      const heading5 = document.createElement('h1');
      const label1 = document.createElement('span');
      const label2 = document.createElement('span');
      const label3 = document.createElement('span');
      const label4 = document.createElement('span');
      const label5 = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const elm5 = document.createElement('div');
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      sect1.id = 'sect1';
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = 'sect2';
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = 'sect3';
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = 'sect4';
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = 'sect5';
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: 'https://example.com/baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: 'https://example.com/bar'
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
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com'
            },
            1: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com/foo'
            },
            2: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: 'bar',
              headingShown: true,
              url: 'https://example.com/baz'
            },
            3: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: 'bar',
              headingShown: true,
              url: 'https://example.com/bar'
            }
          }
        }));
      browser.windows.getCurrent.resolves({
        id: winId
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        'called sessions get'
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
        'called windows get current');
      assert.strictEqual(sect1.childElementCount, 3, 'section');
      assert.isFalse(sect1.classList.contains(CLASS_TAB_COLLAPSED), 'class');
      assert.isFalse(sect1.querySelector(`.${CLASS_HEADING}`).hidden,
        'heading');
      assert.strictEqual(sect2.childElementCount, 1, 'empty section');
      assert.strictEqual(sect3.childElementCount, 2, 'empty section');
      assert.strictEqual(sect4.childElementCount, 3, 'section');
      assert.isTrue(sect4.classList.contains(CLASS_TAB_COLLAPSED), 'class');
      assert.isFalse(sect4.querySelector(`.${CLASS_HEADING}`).hidden,
        'heading');
      assert.strictEqual(sect5.childElementCount, 1, 'empty section');
      assert.deepEqual(res, [undefined, undefined], 'result');
    });

    it('should restore group, case: tab removed', async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement('section');
      const sect2 = document.createElement('section');
      const sect4 = document.createElement('section');
      const sect5 = document.createElement('section');
      const heading1 = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const heading4 = document.createElement('h1');
      const heading5 = document.createElement('h1');
      const label1 = document.createElement('span');
      const label2 = document.createElement('span');
      const label4 = document.createElement('span');
      const label5 = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm4 = document.createElement('div');
      const elm5 = document.createElement('div');
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      sect1.id = 'sect1';
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = 'sect2';
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect4.id = 'sect4';
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = 'sect5';
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: 'https://example.com/foo'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: 'https://example.com/baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: 'https://example.com/bar'
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
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com'
            },
            1: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com/foo'
            },
            2: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com/bar'
            },
            3: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: 'bar',
              headingShown: true,
              url: 'https://example.com/baz'
            },
            4: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: 'bar',
              headingShown: true,
              url: 'https://example.com/bar'
            }
          }
        }));
      browser.windows.getCurrent.resolves({
        id: winId
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        'called sessions get'
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
        'called windows get current');
      assert.strictEqual(sect1.childElementCount, 3, 'section');
      assert.isFalse(sect1.classList.contains(CLASS_TAB_COLLAPSED), 'class');
      assert.isFalse(sect1.querySelector(`.${CLASS_HEADING}`).hidden,
        'heading');
      assert.strictEqual(sect2.childElementCount, 1, 'empty section');
      assert.strictEqual(sect4.childElementCount, 3, 'section');
      assert.isTrue(sect4.classList.contains(CLASS_TAB_COLLAPSED), 'class');
      assert.isFalse(sect4.querySelector(`.${CLASS_HEADING}`).hidden,
        'heading');
      assert.strictEqual(sect5.childElementCount, 1, 'empty section');
      assert.deepEqual(res, [undefined, undefined], 'result');
    });

    it('should restore group, case: tab moved', async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement('section');
      const sect2 = document.createElement('section');
      const sect3 = document.createElement('section');
      const sect4 = document.createElement('section');
      const sect5 = document.createElement('section');
      const heading1 = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const heading3 = document.createElement('h1');
      const heading4 = document.createElement('h1');
      const heading5 = document.createElement('h1');
      const label1 = document.createElement('span');
      const label2 = document.createElement('span');
      const label3 = document.createElement('span');
      const label4 = document.createElement('span');
      const label5 = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const elm5 = document.createElement('div');
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      sect1.id = 'sect1';
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = 'sect2';
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = 'sect3';
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = 'sect4';
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = 'sect5';
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: 'https://example.com/baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: 'https://example.com/bar'
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
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com'
            },
            1: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com/foo'
            },
            2: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com/bar'
            },
            3: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: 'bar',
              headingShown: true,
              url: 'https://example.com/baz'
            },
            4: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: 'bar',
              headingShown: true,
              url: 'https://example.com/bar'
            }
          }
        }));
      browser.windows.getCurrent.resolves({
        id: winId
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        'called sessions get'
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
        'called windows get current');
      assert.strictEqual(sect1.childElementCount, 2, 'section');
      assert.strictEqual(sect3.childElementCount, 2, 'section');
      assert.strictEqual(sect4.childElementCount, 3, 'section');
      assert.isTrue(sect4.classList.contains(CLASS_TAB_COLLAPSED), 'class');
      assert.isFalse(sect4.querySelector(`.${CLASS_HEADING}`).hidden,
        'heading');
      assert.strictEqual(sect5.childElementCount, 1, 'empty section');
      assert.strictEqual(sect2.childElementCount, 2, 'section');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should restore group, case: grouped tabs moved ', async () => {
      const winId = browser.windows.WINDOW_ID_CURRENT;
      const i =
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount;
      const j = browser.windows.getCurrent.callCount;
      const sect1 = document.createElement('section');
      const sect2 = document.createElement('section');
      const sect3 = document.createElement('section');
      const sect4 = document.createElement('section');
      const sect5 = document.createElement('section');
      const heading1 = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const heading3 = document.createElement('h1');
      const heading4 = document.createElement('h1');
      const heading5 = document.createElement('h1');
      const label1 = document.createElement('span');
      const label2 = document.createElement('span');
      const label3 = document.createElement('span');
      const label4 = document.createElement('span');
      const label5 = document.createElement('span');
      const elm = document.createElement('div');
      const elm2 = document.createElement('div');
      const elm3 = document.createElement('div');
      const elm4 = document.createElement('div');
      const elm5 = document.createElement('div');
      const newTab = document.getElementById(NEW_TAB);
      const body = document.querySelector('body');
      sect1.id = 'sect1';
      sect1.classList.add(CLASS_TAB_CONTAINER);
      label1.classList.add(CLASS_HEADING_LABEL);
      heading1.classList.add(CLASS_HEADING);
      heading1.hidden = true;
      heading1.appendChild(label1);
      sect1.appendChild(heading1);
      sect2.id = 'sect2';
      sect2.classList.add(CLASS_TAB_CONTAINER);
      label2.classList.add(CLASS_HEADING_LABEL);
      heading2.classList.add(CLASS_HEADING);
      heading2.hidden = true;
      heading2.appendChild(label2);
      sect2.appendChild(heading2);
      sect3.id = 'sect3';
      sect3.classList.add(CLASS_TAB_CONTAINER);
      label3.classList.add(CLASS_HEADING_LABEL);
      heading3.classList.add(CLASS_HEADING);
      heading3.hidden = true;
      heading3.appendChild(label3);
      sect3.appendChild(heading3);
      sect4.id = 'sect4';
      sect4.classList.add(CLASS_TAB_CONTAINER);
      label4.classList.add(CLASS_HEADING_LABEL);
      heading4.classList.add(CLASS_HEADING);
      heading4.hidden = true;
      heading4.appendChild(label4);
      sect4.appendChild(heading4);
      sect5.id = 'sect5';
      sect5.classList.add(CLASS_TAB_CONTAINER);
      label5.classList.add(CLASS_HEADING_LABEL);
      heading5.classList.add(CLASS_HEADING);
      heading5.hidden = true;
      heading5.appendChild(label5);
      sect5.appendChild(heading5);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        id: 1,
        pinned: false,
        url: 'https://example.com'
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        id: 2,
        pinned: false,
        url: 'https://example.com/foo'
      });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        id: 3,
        pinned: false,
        url: 'https://example.com/bar'
      });
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({
        id: 4,
        pinned: false,
        url: 'https://example.com/baz'
      });
      elm5.classList.add(TAB);
      elm5.dataset.tabId = '5';
      elm5.dataset.tab = JSON.stringify({
        id: 5,
        pinned: false,
        url: 'https://example.com/bar'
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
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com'
            },
            1: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com/foo'
            },
            2: {
              collapsed: false,
              containerIndex: 0,
              headingLabel: 'foo',
              headingShown: true,
              url: 'https://example.com/bar'
            },
            3: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: '',
              headingShown: false,
              url: 'https://example.com/baz'
            },
            4: {
              collapsed: true,
              containerIndex: 1,
              headingLabel: '',
              headingShown: false,
              url: 'https://example.com/bar'
            }
          }
        }));
      browser.windows.getCurrent.resolves({
        id: winId
      });
      const res = await func();
      assert.strictEqual(
        browser.sessions.getWindowValue.withArgs(winId, TAB_LIST).callCount,
        i + 1,
        'called sessions get'
      );
      assert.strictEqual(browser.windows.getCurrent.callCount, j + 1,
        'called windows get current');
      assert.strictEqual(sect4.childElementCount, 3, 'section');
      assert.isTrue(sect4.classList.contains(CLASS_TAB_COLLAPSED), 'class');
      assert.isTrue(sect4.querySelector(`.${CLASS_HEADING}`).hidden,
        'heading');
      assert.strictEqual(sect5.childElementCount, 1, 'empty section');
      assert.strictEqual(sect1.childElementCount, 4, 'section');
      assert.isFalse(sect1.classList.contains(CLASS_TAB_COLLAPSED), 'class');
      assert.isFalse(sect1.querySelector(`.${CLASS_HEADING}`).hidden,
        'heading');
      assert.strictEqual(sect2.childElementCount, 1, 'empty section');
      assert.strictEqual(sect3.childElementCount, 1, 'empty section');
      assert.deepEqual(res, [undefined, undefined, undefined], 'result');
    });
  });

  describe('emulate tabs in order', () => {
    const func = mjs.emulateTabsInOrder;
    beforeEach(() => {
      const body = document.querySelector('body');
      const tmpl = document.createElement('template');
      tmpl.id = 'tab-container-template';
      const sect = document.createElement('section');
      sect.classList.add('tab-container');
      sect.dataset.tabControls = '';
      sect.setAttribute('hidden', 'hidden');
      tmpl.content.appendChild(sect);
      body.appendChild(tmpl);
      const tmpl2 = document.createElement('template');
      tmpl2.id = 'tab-template';
      const div = document.createElement('div');
      div.classList.add('tab');
      div.draggable = true;
      div.dataset.tabId = '';
      div.dataset.tab = '';
      const span = document.createElement('span');
      span.classList.add('tab-context');
      span.setAttribute('title', '');
      const img = document.createElement('img');
      img.classList.add('tab-toggle-icon');
      img.src = '';
      img.alt = '';
      span.appendChild(img);
      div.appendChild(span);
      const span2 = document.createElement('span');
      span2.classList.add('tab-content');
      span2.setAttribute('title', '');
      const img2 = document.createElement('img');
      img2.classList.add('tab-icon');
      img2.src = '';
      img2.alt = '';
      img2.dataset.connecting = '';
      span2.appendChild(img2);
      const span2_1 = document.createElement('span');
      span2_1.classList.add('tab-title');
      span2.appendChild(span2_1);
      div.appendChild(span2);
      const span3 = document.createElement('span');
      span3.classList.add('tab-audio');
      span3.setAttribute('title', '');
      const img3 = document.createElement('img');
      img3.classList.add('tab-audio-icon');
      img3.src = '';
      img3.alt = '';
      span3.appendChild(img3);
      div.appendChild(span3);
      const span4 = document.createElement('span');
      span4.classList.add('tab-ident');
      span4.setAttribute('title', '');
      const img4 = document.createElement('img');
      img4.classList.add('tab-ident-icon');
      img4.src = '';
      img4.alt = '';
      span4.appendChild(img4);
      div.appendChild(span4);
      const span5 = document.createElement('span');
      span5.classList.add('tab-close');
      span5.setAttribute('title', '');
      const img5 = document.createElement('img');
      img5.classList.add('tab-close-icon');
      img5.src = '';
      img5.alt = '';
      span5.appendChild(img5);
      div.appendChild(span5);
      const span6 = document.createElement('span');
      span6.classList.add('tab-pinned');
      const img6 = document.createElement('img');
      img6.classList.add('tab-pinned-icon');
      img6.src = '';
      img6.alt = '';
      span6.appendChild(img6);
      div.appendChild(span6);
      tmpl2.content.appendChild(div);
      body.appendChild(tmpl2);
      const pinned = document.createElement('section');
      pinned.id = PINNED;
      body.appendChild(pinned);
      const newTab = document.createElement('section');
      newTab.id = NEW_TAB;
      body.appendChild(newTab);
      mjs.sidebar.windowId = browser.windows.WINDOW_ID_CURRENT;
    });

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'instance');
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'message');
      });
    });

    it('should create tabs in order', async () => {
      const arr = [
        {
          active: false,
          audible: false,
          cookieStoreId: COOKIE_STORE_DEFAULT,
          id: 1,
          index: 0,
          pinned: false,
          status: 'complete',
          title: 'foo',
          url: 'https://example.com',
          windowId: browser.windows.WINDOW_ID_CURRENT,
          mutedInfo: {
            muted: false
          }
        }
      ];
      await func(arr);
      const items = document.querySelectorAll(TAB_QUERY);
      assert.strictEqual(items.length, 1, 'created');
      assert.strictEqual(items[0].textContent, 'foo', 'title');
    });

    it('should create tabs in order', async () => {
      const arr = [
        {
          active: false,
          audible: false,
          cookieStoreId: COOKIE_STORE_DEFAULT,
          id: 1,
          index: 0,
          pinned: false,
          status: 'complete',
          title: 'foo',
          url: 'https://example.com',
          windowId: browser.windows.WINDOW_ID_CURRENT,
          mutedInfo: {
            muted: false
          }
        },
        {
          active: false,
          audible: false,
          cookieStoreId: COOKIE_STORE_DEFAULT,
          id: 2,
          index: 1,
          pinned: false,
          status: 'complete',
          title: 'bar',
          url: 'https://www.example.com',
          windowId: browser.windows.WINDOW_ID_CURRENT,
          mutedInfo: {
            muted: false
          }
        }
      ];
      await func(arr);
      const items = document.querySelectorAll(TAB_QUERY);
      assert.strictEqual(items.length, 2, 'created');
      assert.strictEqual(items[1].textContent, 'bar', 'title');
      assert.strictEqual(items[0].textContent, 'foo', 'title');
    });
  });

  describe('emulate tabs in sidebar', () => {
    const func = mjs.emulateTabs;
    beforeEach(() => {
      const body = document.querySelector('body');
      const tmpl = document.createElement('template');
      tmpl.id = 'tab-container-template';
      const sect = document.createElement('section');
      sect.classList.add('tab-container');
      sect.dataset.tabControls = '';
      sect.setAttribute('hidden', 'hidden');
      tmpl.content.appendChild(sect);
      body.appendChild(tmpl);
      const tmpl2 = document.createElement('template');
      tmpl2.id = 'tab-template';
      const div = document.createElement('div');
      div.classList.add('tab');
      div.draggable = true;
      div.dataset.tabId = '';
      div.dataset.tab = '';
      const span = document.createElement('span');
      span.classList.add('tab-context');
      span.setAttribute('title', '');
      const img = document.createElement('img');
      img.classList.add('tab-toggle-icon');
      img.src = '';
      img.alt = '';
      span.appendChild(img);
      div.appendChild(span);
      const span2 = document.createElement('span');
      span2.classList.add('tab-content');
      span2.setAttribute('title', '');
      const img2 = document.createElement('img');
      img2.classList.add('tab-icon');
      img2.src = '';
      img2.alt = '';
      img2.dataset.connecting = '';
      span2.appendChild(img2);
      const span2_1 = document.createElement('span');
      span2_1.classList.add('tab-title');
      span2.appendChild(span2_1);
      div.appendChild(span2);
      const span3 = document.createElement('span');
      span3.classList.add('tab-audio');
      span3.setAttribute('title', '');
      const img3 = document.createElement('img');
      img3.classList.add('tab-audio-icon');
      img3.src = '';
      img3.alt = '';
      span3.appendChild(img3);
      div.appendChild(span3);
      const span4 = document.createElement('span');
      span4.classList.add('tab-ident');
      span4.setAttribute('title', '');
      const img4 = document.createElement('img');
      img4.classList.add('tab-ident-icon');
      img4.src = '';
      img4.alt = '';
      span4.appendChild(img4);
      div.appendChild(span4);
      const span5 = document.createElement('span');
      span5.classList.add('tab-close');
      span5.setAttribute('title', '');
      const img5 = document.createElement('img');
      img5.classList.add('tab-close-icon');
      img5.src = '';
      img5.alt = '';
      span5.appendChild(img5);
      div.appendChild(span5);
      const span6 = document.createElement('span');
      span6.classList.add('tab-pinned');
      const img6 = document.createElement('img');
      img6.classList.add('tab-pinned-icon');
      img6.src = '';
      img6.alt = '';
      span6.appendChild(img6);
      div.appendChild(span6);
      tmpl2.content.appendChild(div);
      body.appendChild(tmpl2);
      const pinned = document.createElement('section');
      pinned.id = PINNED;
      body.appendChild(pinned);
      const newTab = document.createElement('section');
      newTab.id = NEW_TAB;
      body.appendChild(newTab);
    });

    it('should create tab', async () => {
      const i = browser.tabs.query.callCount;
      const arr = [
        {
          active: false,
          audible: false,
          cookieStoreId: COOKIE_STORE_DEFAULT,
          id: 1,
          index: 0,
          pinned: true,
          status: 'complete',
          title: 'foo',
          url: 'https://example.com',
          windowId: 1,
          mutedInfo: {
            muted: false
          }
        }
      ];
      mjs.sidebar.windowId = 1;
      browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        windowType: 'normal'
      }).resolves(arr);
      await func();
      const items = document.querySelectorAll(TAB_QUERY);
      assert.strictEqual(browser.tabs.query.callCount, i + 1, 'called');
      assert.strictEqual(items.length, 1, 'created');
      assert.strictEqual(items[0].textContent, 'foo', 'title');
    });
  });

  describe('set pinned container observer', () => {
    const func = mjs.setPinnedObserver;
    it('should add observer', async () => {
      const pinned = document.createElement('section');
      const body = document.querySelector('body');
      pinned.id = PINNED;
      body.appendChild(pinned);
      await func();
      assert.instanceOf(mjs.sidebar.pinnedObserver, ResizeObserver, 'observer');
    });
  });

  describe('set main', () => {
    const func = mjs.setMain;

    it('should add listener', async () => {
      const main = document.createElement('main');
      const pinned = document.createElement('section');
      const newTab = document.createElement('section');
      const button = document.createElement('button');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      button.id = NEW_TAB_BUTTON;
      newTab.appendChild(button);
      main.appendChild(pinned);
      main.appendChild(newTab);
      body.appendChild(main);
      const spy = sinon.spy(button, 'addEventListener');
      const spy2 = sinon.spy(main, 'addEventListener');
      await func();
      assert.isTrue(spy.calledOnce, 'called on new tab');
      assert.strictEqual(spy2.callCount, 5, 'called on main');
      button.addEventListener.restore();
      main.addEventListener.restore();
    });
  });

  describe('startup', () => {
    const func = mjs.startup;
    beforeEach(() => {
      mjs.ports.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
    });

    it('should call function', async () => {
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.callsFake(msg => msg);
      mjs.ports.set(portId, port);
      browser.tabs.query.resolves([]);
      browser.theme.getCurrent.resolves({});
      browser.management.getAll.resolves([
        {
          id: 'foo',
          enabled: true,
          type: 'theme'
        }
      ]);
      browser.sessions.getRecentlyClosed.resolves([]);
      browser.runtime.getPlatformInfo.resolves({
        os: 'win'
      });
      browser.storage.local.get.withArgs({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      }).resolves({
        [THEME_CUSTOM]: {},
        [THEME_CUSTOM_DARK]: {},
        [THEME_CUSTOM_LIGHT]: {}
      });
      browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const main = document.createElement('main');
      const pinned = document.createElement('section');
      const newTab = document.createElement('section');
      const newTabElm = document.createElement('p');
      const button = document.createElement('button');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      pinned.id = PINNED;
      newTab.id = NEW_TAB;
      button.id = NEW_TAB_BUTTON;
      newTabElm.classList.add(TAB, NEW_TAB);
      newTabElm.appendChild(button);
      newTab.appendChild(newTabElm);
      main.appendChild(pinned);
      main.appendChild(newTab);
      body.appendChild(main);
      const res = await func();
      assert.isTrue(browser.sessions.getRecentlyClosed.called,
        'called session');
      assert.isNull(res, 'result');
    });
  });
});
