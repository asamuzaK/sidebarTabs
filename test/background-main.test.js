/**
 * background-main.test.js
 */
/* eslint-disable import-x/order */

/* api */
import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import { sleep } from '../src/mjs/common.js';
import { browser, createJsdom, mockPort } from './mocha/setup.js';

/* test */
import * as mjs from '../src/mjs/background-main.js';
import {
  CLASS_HEADING, CLASS_HEADING_LABEL, CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER,
  SESSION_SAVE, SIDEBAR, SIDEBAR_STATE_UPDATE, TAB, TAB_LIST, TOGGLE_STATE
} from '../src/mjs/constant.js';

describe('background-main', () => {
  const globalKeys = ['DOMParser', 'XMLSerializer'];
  let window, document;
  beforeEach(() => {
    const dom = createJsdom();
    window = dom.window;
    document = dom.window.document;
    browser._sandbox.reset();
    browser.i18n.getMessage.callsFake((...args) => args.toString());
    browser.permissions.contains.resolves(true);
    global.browser = browser;
    global.window = window;
    global.document = document;
    for (const key of globalKeys) {
      global[key] = window[key];
    }
    mjs.ports.clear();
    mjs.sidebar.clear();
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
    mjs.ports.clear();
    mjs.sidebar.clear();
  });

  describe('sidebar', () => {
    assert.strictEqual(mjs.sidebar instanceof Map, true, 'instance');
  });

  describe('set sidebar state', () => {
    const func = mjs.setSidebarState;

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
      assert.strictEqual(stubCurrentWin.calledOnce, true, 'called');
      assert.strictEqual(stubWin.called, false, 'not called');
      assert.strictEqual(stubIsOpen.calledOnce, true, 'called');
      assert.strictEqual(mjs.sidebar.has(3), true, 'entry');
      assert.deepEqual(mjs.sidebar.get(3), {
        incognito: false,
        isOpen: true,
        remove: false,
        sessionId: undefined,
        sessionValue: null,
        windowId: 3
      }, 'value');
      assert.strictEqual(mjs.sidebar.has(4), false, 'entry');
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
      assert.strictEqual(stubCurrentWin.calledOnce, true, 'called');
      assert.strictEqual(stubWin.called, false, 'not called');
      assert.strictEqual(stubIsOpen.calledOnce, true, 'called');
      assert.strictEqual(mjs.sidebar.has(3), true, 'entry');
      assert.deepEqual(mjs.sidebar.get(3), {
        incognito: false,
        isOpen: true,
        remove: false,
        sessionId: undefined,
        sessionValue: null,
        windowId: 3
      }, 'value');
      assert.strictEqual(mjs.sidebar.has(4), false, 'entry');
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
      assert.strictEqual(stubCurrentWin.called, false, 'not called');
      assert.strictEqual(stubWin.calledOnce, true, 'called');
      assert.strictEqual(stubIsOpen.calledOnce, true, 'called');
      assert.strictEqual(mjs.sidebar.has(3), false, 'entry');
      assert.strictEqual(mjs.sidebar.has(4), true, 'entry');
      assert.deepEqual(mjs.sidebar.get(4), {
        incognito: false,
        isOpen: true,
        remove: false,
        sessionId: undefined,
        sessionValue: null,
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
        remove: false,
        sessionId: undefined,
        sessionValue: null,
        windowId: 3
      });
      mjs.sidebar.set(4, {
        incognito: false,
        isOpen: true,
        remove: false,
        sessionId: undefined,
        sessionValue: null,
        windowId: 4
      });
      await func(4);
      assert.strictEqual(stubCurrentWin.called, false, 'not called');
      assert.strictEqual(stubWin.calledOnce, true, 'called');
      assert.strictEqual(stubIsOpen.calledOnce, true, 'called');
      assert.strictEqual(mjs.sidebar.has(3), true, 'entry');
      assert.deepEqual(mjs.sidebar.get(3), {
        incognito: false,
        isOpen: true,
        remove: false,
        sessionId: undefined,
        sessionValue: null,
        windowId: 3
      }, 'value');
      assert.strictEqual(mjs.sidebar.has(4), true, 'entry');
      assert.deepEqual(mjs.sidebar.get(4), {
        incognito: false,
        isOpen: false,
        remove: false,
        sessionId: undefined,
        sessionValue: null,
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
      assert.strictEqual(stubCurrentWin.called, false, 'not called');
      assert.strictEqual(stubWin.called, false, 'not called');
      assert.strictEqual(stubIsOpen.called, false, 'not called');
      assert.strictEqual(mjs.sidebar.has(3), false, 'entry');
      assert.strictEqual(mjs.sidebar.has(4), false, 'entry');
    });

    it('should not set values', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 3,
        sessionId: undefined,
        type: 'popup'
      });
      const stubIsOpen = browser.sidebarAction.isOpen.resolves(true);
      await func();
      assert.strictEqual(stubCurrentWin.called, true, 'called');
      assert.strictEqual(stubIsOpen.called, false, 'not called');
      assert.strictEqual(mjs.sidebar.has(3), false, 'entry');
    });
  });

  describe('remove sidebar state', () => {
    const func = mjs.removeSidebarState;

    it('should remove entry', async () => {
      mjs.sidebar.set(1, {});
      const res = await func(1);
      assert.strictEqual(mjs.sidebar.has(1), false, 'entry');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false if entry does not exist', async () => {
      const res = await func(2);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('toggle sidebar', () => {
    const func = mjs.toggleSidebar;

    it('should call function', async () => {
      const i = browser.sidebarAction.toggle.callCount;
      const res = await func();
      assert.strictEqual(browser.sidebarAction.toggle.callCount, i + 1,
        'called');
      assert.strictEqual(res, undefined, 'result');
    });
  });

  describe('handle save session request', () => {
    const func = mjs.handleSaveSessionRequest;

    it('should throw', async () => {
      await func().catch(e => {
        assert.strictEqual(e instanceof TypeError, true, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'message');
      });
    });

    it('should throw', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e instanceof TypeError, true, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'message');
      });
    });

    it('should get false', async () => {
      const res = await func('foo', 1);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', async () => {
      mjs.sidebar.set(1, {
        incognito: true
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const res = await func('foo', 1);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', async () => {
      mjs.sidebar.set(1, {
        incognito: false
      });
      const portId = `${SIDEBAR}_2`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const res = await func('foo', 1);
      assert.strictEqual(res, false, 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      mjs.sidebar.set(1, {
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
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
      const res = await func(domstr, 1);
      assert.strictEqual(stubWin.calledOnce, true, 'called');
      assert.strictEqual(stubGetValue.calledOnce, true, 'called');
      assert.strictEqual(stubSetValue.calledOnce, true, 'called');
      assert.strictEqual(res, true, 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      mjs.sidebar.set(1, {
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const stubGetValue = browser.sessions.getWindowValue.withArgs(1, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            foo: 'bar'
          }
        }));
      const stubSetValue = browser.sessions.setWindowValue;
      stubSetValue.onFirstCall().callsFake(() => sleep(1000));
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
      const domstr = new XMLSerializer().serializeToString(frag);
      const frag2 = document.createDocumentFragment();
      frag2.appendChild(parent2);
      const domstr2 = new XMLSerializer().serializeToString(frag2);
      const arr = [];
      arr.push(func(domstr, 1));
      await sleep(100);
      arr.push(func(domstr2, 1));
      const res = await Promise.all(arr);
      assert.strictEqual(stubWin.calledThrice, true, 'called');
      assert.strictEqual(stubGetValue.calledTwice, true, 'called');
      assert.strictEqual(stubSetValue.calledTwice, true, 'called');
      assert.strictEqual(mjs.sidebar.has(1), true, 'map');
      assert.deepEqual(res, [true, false], 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      mjs.sidebar.set(1, {
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const stubGetValue = browser.sessions.getWindowValue.withArgs(1, TAB_LIST)
        .resolves(JSON.stringify({
          recent: {
            foo: 'bar'
          }
        }));
      const stubSetValue = browser.sessions.setWindowValue;
      stubSetValue.onFirstCall().callsFake(() => sleep(1000));
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
      const domstr = new XMLSerializer().serializeToString(frag);
      const frag2 = document.createDocumentFragment();
      frag2.appendChild(parent2);
      const domstr2 = new XMLSerializer().serializeToString(frag2);
      const arr = [];
      arr.push(func(domstr, 1));
      await sleep(100);
      const currentValue = mjs.sidebar.get(1);
      currentValue.remove = true;
      mjs.sidebar.set(1, currentValue);
      arr.push(func(domstr2, 1));
      const res = await Promise.all(arr);
      assert.strictEqual(stubWin.calledThrice, true, 'called');
      assert.strictEqual(stubGetValue.calledTwice, true, 'called');
      assert.strictEqual(stubSetValue.calledTwice, true, 'called');
      assert.strictEqual(mjs.sidebar.has(1), false, 'map');
      assert.deepEqual(res, [true, false], 'result');
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
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      mjs.sidebar.set(1, {
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
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
      const msg = {
        [SESSION_SAVE]: {}
      };
      const res = await func(msg);
      assert.strictEqual(stubWin.called, false, 'not called');
      assert.strictEqual(stubGetValue.called, false, 'not called');
      assert.strictEqual(stubSetValue.called, false, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      mjs.sidebar.set(1, {
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
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
      const msg = {
        [SESSION_SAVE]: {
          domString: domstr
        }
      };
      const res = await func(msg);
      assert.strictEqual(stubWin.called, false, 'not called');
      assert.strictEqual(stubGetValue.called, false, 'not called');
      assert.strictEqual(stubSetValue.called, false, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      mjs.sidebar.set(1, {
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
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
      const msg = {
        [SESSION_SAVE]: {
          domString: domstr,
          windowId: 1
        }
      };
      const res = await func(msg);
      assert.strictEqual(stubWin.calledOnce, true, 'called');
      assert.strictEqual(stubGetValue.calledOnce, true, 'called');
      assert.strictEqual(stubSetValue.calledOnce, true, 'called');
      assert.deepEqual(res, [true], 'result');
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
      assert.strictEqual(stubWin.calledOnce, true, 'called');
      assert.strictEqual(stubIsOpen.calledOnce, true, 'called');
      assert.strictEqual(mjs.sidebar.has(1), true, 'entry');
      assert.deepEqual(mjs.sidebar.get(1), {
        incognito: false,
        isOpen: true,
        remove: false,
        sessionId: undefined,
        sessionValue: null,
        windowId: 1
      }, 'value');
      assert.deepEqual(res, [undefined], 'result');
    });
  });

  describe('port on message', () => {
    const func = mjs.portOnMessage;

    it('should get empty array', async () => {
      const res = await func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', async () => {
      const res = await func({
        foo: 'bar'
      });
      assert.deepEqual(res, [], 'result');
    });

    it('should get array', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      mjs.sidebar.set(1, {
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
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
      const msg = {
        [SESSION_SAVE]: {
          domString: domstr,
          windowId: 1
        }
      };
      const res = await func(msg);
      assert.strictEqual(stubWin.calledOnce, true, 'called');
      assert.strictEqual(stubGetValue.calledOnce, true, 'called');
      assert.strictEqual(stubSetValue.calledOnce, true, 'called');
      assert.deepEqual(res, [true], 'result');
    });

    it('should get array', async () => {
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
      assert.strictEqual(stubWin.calledOnce, true, 'called');
      assert.strictEqual(stubIsOpen.calledOnce, true, 'called');
      assert.strictEqual(mjs.sidebar.has(1), true, 'entry');
      assert.deepEqual(mjs.sidebar.get(1), {
        incognito: false,
        isOpen: true,
        remove: false,
        sessionId: undefined,
        sessionValue: null,
        windowId: 1
      }, 'value');
      assert.deepEqual(res, [undefined], 'result');
    });
  });

  describe('handle disconnected port', () => {
    const func = mjs.handleDisconnectedPort;

    it('should not log error, should not remove ports, sidebar', async () => {
      const stubErr = sinon.stub(console, 'error');
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      mjs.sidebar.set(1, {});
      await func();
      const { called: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(errCalled, false, 'not called error');
      assert.strictEqual(mjs.ports.size, 1, 'port size');
      assert.strictEqual(mjs.ports.has(portId), true, 'port');
      assert.strictEqual(mjs.sidebar.size, 1, 'sidebar size');
      assert.strictEqual(mjs.sidebar.has(1), true, 'sidebar');
    });

    it('should log error, should not remove ports, sidebar', async () => {
      const stubErr = sinon.stub(console, 'error');
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      mjs.sidebar.set(1, {});
      await func({
        error: new Error('error')
      });
      const { calledOnce: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(errCalled, true, 'called error');
      assert.strictEqual(mjs.ports.size, 1, 'port size');
      assert.strictEqual(mjs.ports.has(portId), true, 'port');
      assert.strictEqual(mjs.sidebar.size, 1, 'sidebar size');
      assert.strictEqual(mjs.sidebar.has(1), true, 'sidebar');
    });

    it('should not remove ports, sidebar', async () => {
      const stubErr = sinon.stub(console, 'error');
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      mjs.sidebar.set(1, {});
      await func({
        name: 'foo'
      });
      const { called: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(errCalled, false, 'not called error');
      assert.strictEqual(mjs.ports.size, 1, 'port size');
      assert.strictEqual(mjs.ports.has(portId), true, 'port');
      assert.strictEqual(mjs.sidebar.size, 1, 'sidebar size');
      assert.strictEqual(mjs.sidebar.has(1), true, 'sidebar');
    });

    it('should remove ports', async () => {
      const stubErr = sinon.stub(console, 'error');
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      mjs.sidebar.set(2, {});
      await func({
        name: portId
      });
      const { called: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(errCalled, false, 'not called error');
      assert.strictEqual(mjs.ports.size, 0, 'port size');
      assert.strictEqual(mjs.sidebar.size, 1, 'sidebar size');
      assert.strictEqual(mjs.sidebar.has(2), true, 'sidebar');
    });

    it('should remove ports, sidebar', async () => {
      const stubErr = sinon.stub(console, 'error');
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      mjs.sidebar.set(1, {
        incognito: true
      });
      await func({
        name: portId
      });
      const { called: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(errCalled, false, 'not called error');
      assert.strictEqual(mjs.ports.size, 0, 'port size');
      assert.strictEqual(mjs.sidebar.size, 0, 'sidebar size');
    });

    it('should remove ports, sidebar', async () => {
      const stubErr = sinon.stub(console, 'error');
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      mjs.sidebar.set(1, {
        incognito: false,
        sessionValue: null
      });
      await func({
        name: portId
      });
      const { called: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(errCalled, false, 'not called error');
      assert.strictEqual(mjs.ports.size, 0, 'port size');
      assert.strictEqual(mjs.sidebar.size, 0, 'sidebar size');
    });

    it('should remove ports, sidebar', async () => {
      const stubErr = sinon.stub(console, 'error');
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
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
      mjs.sidebar.set(1, {
        incognito: false,
        sessionValue: domstr
      });
      await func({
        name: portId
      });
      const { called: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(errCalled, false, 'not called error');
      assert.strictEqual(stubWin.calledOnce, true, 'called');
      assert.strictEqual(stubGetValue.calledOnce, true, 'called');
      assert.strictEqual(stubSetValue.calledOnce, true, 'called');
      assert.strictEqual(mjs.ports.size, 0, 'ports size');
      assert.strictEqual(mjs.sidebar.size, 0, 'sidebar size');
    });
  });

  describe('port on disconnect', () => {
    const func = mjs.portOnDisconnect;

    it('should throw', async () => {
      const stubErr = sinon.stub(console, 'error');
      await func(null).catch(e => {
        assert.strictEqual(e instanceof Error, true, 'error');
      });
      const { calledOnce } = stubErr;
      stubErr.restore();
      assert.strictEqual(calledOnce, true, 'called');
    });

    it('should call function', async () => {
      const stubErr = sinon.stub(console, 'error');
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
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
      mjs.sidebar.set(1, {
        incognito: false,
        sessionValue: domstr
      });
      const res = await func({
        name: portId
      });
      const { called: errCalled } = stubErr;
      stubErr.restore();
      assert.strictEqual(errCalled, false, 'not called error');
      assert.strictEqual(stubWin.calledOnce, true, 'called');
      assert.strictEqual(stubGetValue.calledOnce, true, 'called');
      assert.strictEqual(stubSetValue.calledOnce, true, 'called');
      assert.strictEqual(mjs.ports.size, 0, 'ports size');
      assert.strictEqual(mjs.sidebar.size, 0, 'sidebar size');
      assert.strictEqual(res, undefined, 'result');
    });
  });

  describe('handle connected port', () => {
    const func = mjs.handleConnectedPort;

    it('should not add port', async () => {
      await func();
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.strictEqual(mjs.sidebar.size, 0, 'size');
    });

    it('should not add port', async () => {
      await func({
        name: 'foo'
      });
      assert.strictEqual(mjs.ports.size, 0, 'size');
      assert.strictEqual(mjs.sidebar.size, 0, 'size');
    });

    it('should not add port', async () => {
      const { WINDOW_ID_NONE } = browser.windows;
      const stubWin =
        browser.windows.get.withArgs(WINDOW_ID_NONE, null).resolves({
          id: WINDOW_ID_NONE,
          incognito: false,
          sessionId: undefined,
          type: 'normal'
        });
      const portId = `${SIDEBAR}_${WINDOW_ID_NONE}`;
      const port = mockPort({
        name: portId
      });
      const remove = browser.menus.removeAll.resolves(undefined);
      const create = browser.menus.create;
      await func(port);
      assert.strictEqual(stubWin.called, false, 'called win');
      assert.strictEqual(mjs.ports.size, 0, 'ports size');
      assert.strictEqual(mjs.ports.has(portId), false, 'ports');
      assert.strictEqual(mjs.sidebar.size, 0, 'sidebar size');
      assert.strictEqual(mjs.sidebar.has(1), false, 'sidebar');
      assert.strictEqual(remove.called, false, 'remove');
      assert.strictEqual(create.called, false, 'create');
    });

    it('should add port', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        id: 1,
        incognito: false,
        sessionId: undefined,
        type: 'normal'
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      const remove = browser.menus.removeAll.resolves(undefined);
      const create = browser.menus.create;
      await func(port);
      assert.strictEqual(stubWin.calledOnce, true, 'called win');
      assert.strictEqual(mjs.ports.size, 1, 'ports size');
      assert.strictEqual(mjs.ports.has(portId), true, 'ports');
      assert.strictEqual(mjs.sidebar.size, 1, 'sidebar size');
      assert.strictEqual(mjs.sidebar.has(1), true, 'sidebar');
      assert.strictEqual(remove.calledOnce, true, 'remove');
      assert.strictEqual(create.called, true, 'create');
    });
  });

  describe('handle command', () => {
    const func = mjs.handleCmd;

    it('should throw', async () => {
      await func().catch(e => {
        assert.strictEqual(e instanceof TypeError, true, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'message');
      });
    });

    it('should get null', async () => {
      const res = await func('foo');
      assert.strictEqual(res, null, 'result');
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
      assert.strictEqual(browser.sidebarAction.toggle.calledOnce, true,
        'called');
      assert.strictEqual(stubWin.calledOnce, true, 'called');
      assert.strictEqual(stubIsOpen.calledOnce, true, 'called');
      assert.strictEqual(mjs.sidebar.has(1), true, 'entry');
      assert.deepEqual(mjs.sidebar.get(1), {
        incognito: false,
        isOpen: true,
        sessionId: undefined,
        windowId: 1
      }, 'value');
      assert.strictEqual(res, undefined, 'result');
    });
  });
});
