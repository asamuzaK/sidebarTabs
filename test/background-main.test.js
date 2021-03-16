/**
 * background-main.test.js
 */

import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom } from './mocha/setup.js';
import * as mjs from '../src/mjs/background-main.js';
import {
  CLASS_HEADING, CLASS_HEADING_LABEL, CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER,
  SESSION_SAVE, SIDEBAR_STATE_UPDATE, TAB, TAB_LIST, TOGGLE_STATE
} from '../src/mjs/constant.js';

describe('background-main', () => {
  const globalKeys = ['DOMParser', 'XMLSerializer'];
  let window, document;
  beforeEach(() => {
    const dom = createJsdom();
    window = dom && dom.window;
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

  it('should get browser object', () => {
    assert.isObject(browser, 'browser');
  });

  describe('sidebar', () => {
    assert.instanceOf(mjs.sidebar, Map, 'instance');
  });

  describe('set sidebar state', () => {
    const func = mjs.setSidebarState;
    beforeEach(() => {
      mjs.sidebar.clear();
    });
    afterEach(() => {
      mjs.sidebar.clear();
    });

    it('should set values', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 3,
        incognito: false,
        sessionId: undefined,
        type: 'normal'
      });
      const stubWin = browser.windows.get.withArgs(4, null).resolves({
        id: 4,
        incognito: false,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen =
        browser.sidebarAction.isOpen.withArgs({ windowId: 3 }).resolves(true);
      await func();
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isFalse(stubWin.called, 'not called');
      assert.isTrue(stubIsOpen.calledOnce, 'called');
      assert.isTrue(mjs.sidebar.has(3), 'entry');
      assert.deepEqual(mjs.sidebar.get(3), {
        isOpen: true,
        incognito: false,
        sessionId: undefined,
        windowId: 3
      }, 'value');
      assert.isFalse(mjs.sidebar.has(4), 'entry');
    });

    it('should set values', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 3,
        incognito: false,
        sessionId: undefined,
        type: 'normal'
      });
      const stubWin = browser.windows.get.withArgs(4, null).resolves({
        id: 4,
        incognito: false,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen =
        browser.sidebarAction.isOpen.withArgs({ windowId: 3 }).resolves(true);
      await func(browser.windows.WINDOW_ID_CURRENT);
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isFalse(stubWin.called, 'not called');
      assert.isTrue(stubIsOpen.calledOnce, 'called');
      assert.isTrue(mjs.sidebar.has(3), 'entry');
      assert.deepEqual(mjs.sidebar.get(3), {
        isOpen: true,
        incognito: false,
        sessionId: undefined,
        windowId: 3
      }, 'value');
      assert.isFalse(mjs.sidebar.has(4), 'entry');
    });

    it('should set values', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 3,
        incognito: false,
        sessionId: undefined,
        type: 'normal'
      });
      const stubWin = browser.windows.get.withArgs(4, null).resolves({
        id: 4,
        incognito: false,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen =
        browser.sidebarAction.isOpen.withArgs({ windowId: 4 }).resolves(true);
      await func(4);
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isTrue(stubWin.calledOnce, 'called');
      assert.isTrue(stubIsOpen.calledOnce, 'called');
      assert.isFalse(mjs.sidebar.has(3), 'entry');
      assert.isTrue(mjs.sidebar.has(4), 'entry');
      assert.deepEqual(mjs.sidebar.get(4), {
        isOpen: true,
        incognito: false,
        sessionId: undefined,
        windowId: 4
      }, 'value');
    });

    it('should set values', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 3,
        incognito: false,
        sessionId: undefined,
        type: 'normal'
      });
      const stubWin = browser.windows.get.withArgs(4, null).resolves({
        id: 4,
        incognito: false,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen =
        browser.sidebarAction.isOpen.withArgs({ windowId: 4 }).resolves(false);
      mjs.sidebar.set(3, {
        incognito: false,
        isOpen: true,
        sessionId: undefined,
        windowId: 3
      });
      mjs.sidebar.set(4, {
        incognito: false,
        isOpen: true,
        sessionId: undefined,
        windowId: 4
      });
      await func(4);
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isTrue(stubWin.calledOnce, 'called');
      assert.isTrue(stubIsOpen.calledOnce, 'called');
      assert.isTrue(mjs.sidebar.has(3), 'entry');
      assert.deepEqual(mjs.sidebar.get(3), {
        incognito: false,
        isOpen: true,
        sessionId: undefined,
        windowId: 3
      }, 'value');
      assert.isTrue(mjs.sidebar.has(4), 'entry');
      assert.deepEqual(mjs.sidebar.get(4), {
        incognito: false,
        isOpen: false,
        sessionId: undefined,
        windowId: 4
      }, 'value');
    });

    it('should not set values', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 3,
        incognito: false,
        sessionId: undefined,
        type: 'normal'
      });
      const stubWin = browser.windows.get.withArgs(4, null).resolves({
        id: 4,
        incognito: false,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen = browser.sidebarAction.isOpen.resolves(true);
      await func(browser.windows.WINDOW_ID_NONE);
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(stubWin.called, 'not called');
      assert.isFalse(stubIsOpen.called, 'not called');
      assert.isFalse(mjs.sidebar.has(3), 'entry');
      assert.isFalse(mjs.sidebar.has(4), 'entry');
    });

    it('should not set values', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 3,
        sessionId: undefined,
        type: 'popup'
      });
      const stubIsOpen = browser.sidebarAction.isOpen.resolves(true);
      await func();
      assert.isTrue(stubCurrentWin.called, 'called');
      assert.isFalse(stubIsOpen.called, 'not called');
      assert.isFalse(mjs.sidebar.has(3), 'entry');
    });
  });

  describe('remove sidebar state', () => {
    const func = mjs.removeSidebarState;
    beforeEach(() => {
      mjs.sidebar.clear();
    });
    afterEach(() => {
      mjs.sidebar.clear();
    });

    it('should remove entry', async () => {
      mjs.sidebar.set(1, {});
      const res = await func(1);
      assert.isFalse(mjs.sidebar.has(1), 'entry');
      assert.isTrue(res, 'result');
    });

    it('should get false if entry does not exist', async () => {
      const res = await func(2);
      assert.isFalse(res, 'result');
    });
  });

  describe('toggle sidebar', () => {
    const func = mjs.toggleSidebar;

    it('should call function', async () => {
      const i = browser.sidebarAction.toggle.callCount;
      const res = await func();
      assert.strictEqual(browser.sidebarAction.toggle.callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('handle save session request', () => {
    const func = mjs.handleSaveSessionRequest;
    beforeEach(() => {
      mjs.sidebar.clear();
    });
    afterEach(() => {
      mjs.sidebar.clear();
    });

    it('should get null', async () => {
      const res = await func();
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const res = await func({
        domString: 'foo'
      });
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const res = await func({
        domString: 'foo',
        windowId: 1
      });
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      mjs.sidebar.set(1, {
        incognito: true
      });
      const res = await func({
        domString: 'foo',
        windowId: 1
      });
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      mjs.sidebar.set(1, {
        incognito: false
      });
      const stubGetValue = browser.sessions.getWindowValue.withArgs(1, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            foo: 'bar'
          }
        }));
      const arg = JSON.stringify({
        recent: {
          0: {
            collapsed: false,
            headingLabel: '',
            headingShown: false,
            url: 'http://example.com',
            containerIndex: 0
          },
          1: {
            collapsed: false,
            headingLabel: 'foo',
            headingShown: true,
            url: 'https://example.com',
            containerIndex: 1
          },
          2: {
            collapsed: false,
            headingLabel: 'foo',
            headingShown: true,
            url: 'https://www.example.com',
            containerIndex: 1
          }
        },
        prev: {
          foo: 'bar'
        }
      });
      const stubSetValue = browser.sessions.setWindowValue
        .withArgs(1, 'tabList', arg);
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const label = document.createElement('span');
      const label2 = document.createElement('span');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const frag = document.createDocumentFragment();
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      label.classList.add(CLASS_HEADING_LABEL);
      heading.classList.add(CLASS_HEADING);
      heading.hidden = true;
      heading.appendChild(label);
      label2.classList.add(CLASS_HEADING_LABEL);
      label2.textContent = 'foo';
      heading2.classList.add(CLASS_HEADING);
      heading2.appendChild(label2);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        url: 'http://example.com'
      });
      elm2.classList.add(TAB);
      elm2.classList.add(CLASS_TAB_COLLAPSED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        url: 'https://example.com'
      });
      elm3.classList.add(TAB);
      elm3.classList.add(CLASS_TAB_COLLAPSED);
      elm3.dataset.tabId = '3';
      elm3.dataset.tab = JSON.stringify({
        url: 'https://www.example.com'
      });
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent2.appendChild(heading2);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      frag.appendChild(parent);
      frag.appendChild(parent2);
      const domstr = new XMLSerializer().serializeToString(frag);
      const res = await func({
        domString: domstr,
        windowId: 1
      });
      assert.isTrue(stubWin.calledOnce, 'called');
      assert.isTrue(stubGetValue.calledOnce, 'called');
      assert.isTrue(stubSetValue.calledOnce, 'called');
      assert.isTrue(res, 'result');
    });
  });

  describe('handle runtime message', () => {
    const func = mjs.handleMsg;
    beforeEach(() => {
      mjs.sidebar.clear();
    });
    afterEach(() => {
      mjs.sidebar.clear();
    });

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

    it('should call function', async () => {
      const msg = {
        [SESSION_SAVE]: {
          domString: 'foo',
          windowId: 1
        }
      };
      const res = await func(msg);
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        id: 1,
        incognito: false,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen =
        browser.sidebarAction.isOpen.withArgs({ windowId: 1 }).resolves(true);
      const msg = {
        [SIDEBAR_STATE_UPDATE]: {
          windowId: 1
        }
      };
      const res = await func(msg);
      assert.isTrue(stubWin.calledOnce, 'called');
      assert.isTrue(stubIsOpen.calledOnce, 'called');
      assert.isTrue(mjs.sidebar.has(1), 'entry');
      assert.deepEqual(mjs.sidebar.get(1), {
        incognito: false,
        isOpen: true,
        sessionId: undefined,
        windowId: 1
      }, 'value');
      assert.deepEqual(res, [undefined], 'result');
    });
  });

  describe('handle command', () => {
    const func = mjs.handleCmd;
    beforeEach(() => {
      mjs.sidebar.clear();
    });
    afterEach(() => {
      mjs.sidebar.clear();
    });

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'message');
      });
    });

    it('should get null', async () => {
      const res = await func('foo');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false,
        sessionId: undefined,
        type: 'normal'
      });
      const stubIsOpen =
        browser.sidebarAction.isOpen.withArgs({ windowId: 1 }).resolves(true);
      mjs.sidebar.set(1, {
        incognito: false,
        isOpen: false,
        sessionId: undefined,
        windowId: 1
      });
      const res = await func(TOGGLE_STATE);
      assert.isTrue(browser.sidebarAction.toggle.calledOnce, 'called');
      assert.isTrue(stubWin.calledOnce, 'called');
      assert.isTrue(stubIsOpen.calledOnce, 'called');
      assert.isTrue(mjs.sidebar.has(1), 'entry');
      assert.deepEqual(mjs.sidebar.get(1), {
        incognito: false,
        isOpen: true,
        sessionId: undefined,
        windowId: 1
      }, 'value');
      assert.isUndefined(res, 'result');
    });
  });
});
