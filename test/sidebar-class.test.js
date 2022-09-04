/**
 * sidebar-class.test.js
 */

/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom } from './mocha/setup.js';
import {
  BROWSER_SETTINGS_READ, NEW_TAB_SEPARATOR_SHOW, SCROLL_DIR_INVERT,
  TAB_CLOSE_DBLCLICK, TAB_CLOSE_MDLCLICK_PREVENT, TAB_GROUP_ENABLE,
  TAB_GROUP_EXPAND_COLLAPSE_OTHER, TAB_GROUP_EXPAND_EXCLUDE_PINNED,
  TAB_GROUP_NEW_TAB_AT_END, TAB_SKIP_COLLAPSED, TAB_SWITCH_SCROLL,
  TAB_SWITCH_SCROLL_ALWAYS, USER_CSS_USE
} from '../src/mjs/constant.js';

/* test */
import { Sidebar } from '../src/mjs/sidebar-class.js';

describe('sidebar-class', () => {
  const globalKeys = ['Node'];
  let window, document;
  beforeEach(() => {
    const dom = createJsdom();
    window = dom && dom.window;
    document = window && window.document;
    browser._sandbox.reset();
    browser.i18n.getMessage.callsFake((...args) => args.toString());
    browser.permissions.contains.resolves(true);
    browser.storage.local.get.resolves({});
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

  it('should get browser object', () => {
    assert.isObject(browser, 'browser');
  });

  describe('Sidebar', () => {
    const args = [
      BROWSER_SETTINGS_READ,
      NEW_TAB_SEPARATOR_SHOW,
      SCROLL_DIR_INVERT,
      TAB_CLOSE_DBLCLICK,
      TAB_CLOSE_MDLCLICK_PREVENT,
      TAB_GROUP_ENABLE,
      TAB_GROUP_EXPAND_COLLAPSE_OTHER,
      TAB_GROUP_EXPAND_EXCLUDE_PINNED,
      TAB_GROUP_NEW_TAB_AT_END,
      TAB_SKIP_COLLAPSED,
      TAB_SWITCH_SCROLL,
      TAB_SWITCH_SCROLL_ALWAYS,
      USER_CSS_USE
    ];
    const falseValues = [
      'alwaysSwitchTabByScrolling',
      'closeTabsByDoubleClick',
      'incognito',
      'invertScrollDirection',
      'isMac',
      'readBrowserSettings',
      'showNewTabSeparator',
      'skipCollapsed',
      'switchTabByScrolling',
      'tabGroupOnExpandCollapseOther',
      'tabGroupOnExpandExcludePinned',
      'tabGroupPutNewTabAtTheEnd',
      'useUserCSS'
    ];
    const trueValues = [
      'closeTabsByMiddleClick',
      'enableTabGroup'
    ];
    const nullValues = [
      'context',
      'contextualIds',
      'firstSelectedTab',
      'lastClosedTab',
      'pinnedTabsWaitingToMove',
      'tabsWaitingToMove',
      'windowId'
    ];

    it('should be instance of Sidebar', () => {
      const sidebar = new Sidebar();
      assert.instanceOf(sidebar, Sidebar, 'instance');
    });

    describe('getter / setter', () => {
      it('should get value', () => {
        const sidebar = new Sidebar();
        for (const key of falseValues) {
          assert.isFalse(sidebar[key], `${key}`);
        }
        for (const key of trueValues) {
          assert.isTrue(sidebar[key], `${key}`);
        }
        for (const key of nullValues) {
          assert.isNull(sidebar[key], `${key}`);
        }
      });

      it('should set value', () => {
        const sidebar = new Sidebar();
        for (const key of falseValues) {
          sidebar[key] = true;
          assert.isTrue(sidebar[key], `${key}`);
        }
        for (const key of trueValues) {
          sidebar[key] = false;
          assert.isFalse(sidebar[key], `get ${key}`);
        }
        for (const key of nullValues) {
          switch (key) {
            case 'context':
            case 'firstSelectedTab': {
              const elm = document.querySelector('body');
              sidebar[key] = elm;
              assert.deepEqual(sidebar[key], elm, `set ${key}`);
              sidebar[key] = 'foo';
              assert.isNull(sidebar[key], `set ${key}`);
              break;
            }
            case 'contextualIds':
            case 'pinnedTabsWaitingToMove':
            case 'tabsWaitingToMove': {
              const arr = [1, 2];
              sidebar[key] = arr;
              assert.deepEqual(sidebar[key], arr, `set ${key}`);
              sidebar[key] = [];
              assert.isNull(sidebar[key], `set ${key}`);
              sidebar[key] = 'foo';
              assert.isNull(sidebar[key], `set ${key}`);
              break;
            }
            case 'lastClosedTab': {
              const tab = {
                windowId: 1
              };
              sidebar[key] = tab;
              assert.deepEqual(sidebar[key], tab, `set ${key}`);
              sidebar[key] = {};
              assert.isNull(sidebar[key], `set ${key}`);
              break;
            }
            case 'windowId': {
              sidebar[key] = 1;
              assert.strictEqual(sidebar[key], 1, `set ${key}`);
              sidebar[key] = 'foo';
              assert.isNull(sidebar[key], `set ${key}`);
              break;
            }
            default:
          }
        }
      });
    });

    describe('setup', () => {
      it('should set values', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({});
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        for (const key of falseValues) {
          assert.isFalse(sidebar[key], `${key}`);
        }
        for (const key of trueValues) {
          assert.isTrue(sidebar[key], `${key}`);
        }
        for (const key of nullValues) {
          if (key === 'windowId') {
            assert.strictEqual(sidebar[key], 1, `${key}`);
          } else {
            assert.isNull(sidebar[key], `${key}`);
          }
        }
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'mac'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: true
        });
        getStorage.resolves({
          alwaysSwitchTabByScrolling: {
            checked: true
          },
          closeTabsByDoubleClick: {
            checked: true
          },
          preventCloseTabsByMiddleClick: {
            checked: true
          },
          invertScrollDirection: {
            checked: true
          },
          readBrowserSettings: {
            checked: true
          },
          showNewTabSeparator: {
            checked: true
          },
          skipCollapsed: {
            checked: true
          },
          switchTabByScrolling: {
            checked: true
          },
          enableTabGroup: {
            checked: false
          },
          tabGroupOnExpandCollapseOther: {
            checked: true
          },
          tabGroupOnExpandExcludePinned: {
            checked: true
          },
          tabGroupPutNewTabAtTheEnd: {
            checked: true
          },
          useUserCSS: {
            checked: true
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isTrue(sidebar.alwaysSwitchTabByScrolling, 'alwaysSwitchTab');
        assert.isTrue(sidebar.closeTabsByDoubleClick, 'closeTabsByDoubleClick');
        assert.isFalse(sidebar.closeTabsByMiddleClick,
          'closeTabsByMiddleClick');
        assert.isFalse(sidebar.enableTabGroup, 'enableTabGroup');
        assert.isTrue(sidebar.invertScrollDirection, 'invertScrollDirection');
        assert.isTrue(sidebar.readBrowserSettings, 'readBrowserSettings');
        assert.isTrue(sidebar.showNewTabSeparator, 'showNewTabSeparator');
        assert.isTrue(sidebar.skipCollapsed, 'skipCollapsed');
        assert.isTrue(sidebar.switchTabByScrolling, 'switchTab');
        assert.isTrue(sidebar.tabGroupOnExpandCollapseOther,
          'tabGroupCollapseOther');
        assert.isTrue(sidebar.tabGroupOnExpandExcludePinned,
          'tabGroupOnExpandExcludePinned');
        assert.isTrue(sidebar.tabGroupPutNewTabAtTheEnd,
          'tabGroupPutNewTabAtTheEnd');
        assert.isTrue(sidebar.useUserCSS, 'useUserCSS');
        assert.isTrue(sidebar.incognito, 'incognito');
        assert.isTrue(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({
          alwaysSwitchTabByScrolling: {
            checked: true
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isTrue(sidebar.alwaysSwitchTabByScrolling, 'alwaysSwitchTab');
        assert.isFalse(sidebar.incognito, 'incognito');
        assert.isFalse(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({
          closeTabsByDoubleClick: {
            checked: true
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isTrue(sidebar.closeTabsByDoubleClick, 'closeTabsByDoubleClick');
        assert.isFalse(sidebar.incognito, 'incognito');
        assert.isFalse(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({
          preventCloseTabsByMiddleClick: {
            checked: true
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isFalse(sidebar.closeTabsByMiddleClick,
          'closeTabsByMiddleClick');
        assert.isFalse(sidebar.incognito, 'incognito');
        assert.isFalse(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({
          enableTabGroup: {
            checked: false
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isFalse(sidebar.enableTabGroup, 'enableTabGroup');
        assert.isFalse(sidebar.incognito, 'incognito');
        assert.isFalse(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({
          invertScrollDirection: {
            checked: true
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isTrue(sidebar.invertScrollDirection, 'invertScrollDirection');
        assert.isFalse(sidebar.incognito, 'incognito');
        assert.isFalse(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({
          readBrowserSettings: {
            checked: true
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isTrue(sidebar.readBrowserSettings, 'readBrowserSettings');
        assert.isFalse(sidebar.incognito, 'incognito');
        assert.isFalse(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({
          showNewTabSeparator: {
            checked: true
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isTrue(sidebar.showNewTabSeparator, 'showNewTabSeparator');
        assert.isFalse(sidebar.incognito, 'incognito');
        assert.isFalse(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({
          skipCollapsed: {
            checked: true
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isTrue(sidebar.skipCollapsed, 'skipCollapsed');
        assert.isFalse(sidebar.incognito, 'incognito');
        assert.isFalse(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({
          switchTabByScrolling: {
            checked: true
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isTrue(sidebar.switchTabByScrolling, 'switchTab');
        assert.isFalse(sidebar.incognito, 'incognito');
        assert.isFalse(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({
          tabGroupOnExpandCollapseOther: {
            checked: true
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isTrue(sidebar.tabGroupOnExpandCollapseOther,
          'tabGroupCollapseOther');
        assert.isFalse(sidebar.incognito, 'incognito');
        assert.isFalse(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({
          tabGroupOnExpandExcludePinned: {
            checked: true
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isTrue(sidebar.tabGroupOnExpandExcludePinned,
          'tabGroupOnExpandExcludePinned');
        assert.isFalse(sidebar.incognito, 'incognito');
        assert.isFalse(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({
          tabGroupPutNewTabAtTheEnd: {
            checked: true
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isTrue(sidebar.tabGroupPutNewTabAtTheEnd,
          'tabGroupPutNewTabAtTheEnd');
        assert.isFalse(sidebar.incognito, 'incognito');
        assert.isFalse(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });

      it('should set value', async () => {
        const sidebar = new Sidebar();
        const getCurrent = browser.windows.getCurrent.withArgs({
          populate: true
        });
        const getStorage = browser.storage.local.get.withArgs(args);
        const getOs = browser.runtime.getPlatformInfo.resolves({
          os: 'win'
        });
        const i = getCurrent.callCount;
        const j = getStorage.callCount;
        const k = getOs.callCount;
        getCurrent.resolves({
          id: 1,
          incognito: false
        });
        getStorage.resolves({
          useUserCSS: {
            checked: true
          }
        });
        await sidebar.setup();
        assert.strictEqual(getCurrent.callCount, i + 1, 'getCurrent called');
        assert.strictEqual(getStorage.callCount, j + 1, 'getStorage called');
        assert.strictEqual(getOs.callCount, k + 1, 'getOs called');
        assert.isTrue(sidebar.useUserCSS, 'useUserCSS');
        assert.isFalse(sidebar.incognito, 'incognito');
        assert.isFalse(sidebar.isMac, 'isMac');
        assert.strictEqual(sidebar.windowId, 1, 'windowId');
      });
    });

    describe('init', () => {
      it('should init', async () => {
        const sidebar = new Sidebar();
        const { setWindowValue } = browser.sessions;
        const { clear } = browser.storage.local;
        const i = setWindowValue.callCount;
        const j = clear.callCount;
        await sidebar.init();
        assert.strictEqual(setWindowValue.callCount, i + 1,
          'setWindowValue called');
        assert.strictEqual(clear.callCount, j + 1, 'clear called');
      });

      it('should init', async () => {
        const sidebar = new Sidebar();
        const { setWindowValue } = browser.sessions;
        const { clear } = browser.storage.local;
        const i = setWindowValue.callCount;
        const j = clear.callCount;
        await sidebar.init(true);
        assert.strictEqual(setWindowValue.callCount, i + 1,
          'setWindowValue called');
        assert.strictEqual(clear.callCount, j + 1, 'clear called');
      });
    });
  });
});
