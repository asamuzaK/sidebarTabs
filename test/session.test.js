/**
 * session.test.js
 */
/* eslint-disable import-x/order */

/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom, mockPort } from './mocha/setup.js';

/* test */
import * as mjs from '../src/mjs/session.js';
import {
  CLASS_HEADING, CLASS_HEADING_LABEL, CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER,
  SESSION_SAVE, SIDEBAR, TAB, TAB_LIST
} from '../src/mjs/constant.js';

describe('session', () => {
  const globalKeys = ['DOMParser', 'Node', 'NodeList', 'XMLSerializer'];
  let window, document;
  beforeEach(() => {
    const dom = createJsdom();
    window = dom.window;
    document = dom.window.document;
    browser._sandbox.reset();
    browser.i18n.getMessage.callsFake((...args) => args.toString());
    browser.permissions.contains.resolves(true);
    browser.runtime.connect.callsFake(mockPort);
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

  describe('get tab list from sessions', () => {
    const func = mjs.getSessionTabList;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'throw');
      });
    });

    it('should throw if argument is not string', async () => {
      await func(1).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Number.',
          'throw');
      });
    });

    it('should get null', async () => {
      browser.windows.getCurrent.resolves({
        id: 1
      });
      browser.sessions.getWindowValue.withArgs(1, 'foo').resolves(undefined);
      const i = browser.windows.getCurrent.callCount;
      const j = browser.sessions.getWindowValue.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 1,
        'called windows');
      assert.strictEqual(browser.sessions.getWindowValue.callCount, j + 1,
        'called sessions');
      assert.isNull(res, 'result');
    });

    it('should get value', async () => {
      browser.windows.getCurrent.resolves({
        id: 1
      });
      browser.sessions.getWindowValue.withArgs(1, 'foo')
        .resolves('{"bar":"baz"}');
      const i = browser.windows.getCurrent.callCount;
      const j = browser.sessions.getWindowValue.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.windows.getCurrent.callCount, i + 1,
        'called windows');
      assert.strictEqual(browser.sessions.getWindowValue.callCount, j + 1,
        'called sessions');
      assert.deepEqual(res, {
        bar: 'baz'
      }, 'result');
    });

    it('should get value', async () => {
      browser.windows.getCurrent.resolves({
        id: 1
      });
      browser.sessions.getWindowValue.withArgs(1, 'foo')
        .resolves('{"bar":"baz"}');
      const i = browser.windows.getCurrent.callCount;
      const j = browser.sessions.getWindowValue.callCount;
      const res = await func('foo', 1);
      assert.strictEqual(browser.windows.getCurrent.callCount, i,
        'not called windows');
      assert.strictEqual(browser.sessions.getWindowValue.callCount, j + 1,
        'called sessions');
      assert.deepEqual(res, {
        bar: 'baz'
      }, 'result');
    });
  });

  describe('save tab list to sessions', () => {
    const func = mjs.saveSessionTabList;
    beforeEach(() => {
      mjs.mutex.clear();
    });
    afterEach(() => {
      mjs.mutex.clear();
    });

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected String but got Undefined.');
      });
    });

    it('should throw', async () => {
      await func('foo').catch(e => {
        assert.instanceOf(e, TypeError, 'error');
        assert.strictEqual(e.message, 'Expected Number but got Undefined.');
      });
    });

    it('should not call function if incognito', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        id: 1,
        incognito: true
      });
      const i = browser.sessions.setWindowValue.callCount;
      const res = await func('foo', 1);
      assert.isTrue(stubWin.calledOnce, 'called window');
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i,
        'not called');
      assert.isFalse(res, 'result');
    });

    it('should not call function if mutex has window ID', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        id: 1,
        incognito: false
      });
      mjs.mutex.add(1);
      const i = browser.sessions.setWindowValue.callCount;
      const res = await func('foo', 1);
      assert.isTrue(stubWin.calledOnce, 'called window');
      assert.strictEqual(browser.sessions.setWindowValue.callCount, i,
        'not called');
      assert.isFalse(res, 'result');
    });

    it('should throw', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      const stubGetValue = browser.sessions.getWindowValue.withArgs(1, TAB_LIST)
        .rejects(new Error('error'));
      await func('foo', 1).catch(e => {
        assert.strictEqual(e.message, 'error', 'error');
      });
      assert.isTrue(stubWin.calledOnce, 'called');
      assert.isTrue(stubGetValue.calledOnce, 'called');
      assert.isFalse(mjs.mutex.has(1), 'mutex');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      const stubGetValue = browser.sessions.getWindowValue.withArgs(1, TAB_LIST)
        .resolves(undefined);
      const arg = JSON.stringify({
        recent: {
          0: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'http://example.com',
            containerIndex: 0
          },
          1: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://example.com',
            containerIndex: 1
          },
          2: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://www.example.com',
            containerIndex: 1
          }
        }
      });
      const stubSetValue =
        browser.sessions.setWindowValue.withArgs(1, 'tabList', arg);
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const frag = document.createDocumentFragment();
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
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
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      frag.appendChild(parent);
      frag.appendChild(parent2);
      const domstr = new XMLSerializer().serializeToString(frag);
      const res = await func(domstr, 1);
      assert.isTrue(stubWin.calledOnce, 'called window');
      assert.isTrue(stubGetValue.calledOnce, 'called get');
      assert.isTrue(stubSetValue.calledOnce, 'called set');
      assert.isFalse(mjs.mutex.has(1), 'mutex');
      assert.isTrue(res, 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      const stubGetValue = browser.sessions.getWindowValue
        .withArgs(1, TAB_LIST).resolves(undefined);
      const arg = JSON.stringify({
        recent: {
          0: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'http://example.com',
            containerIndex: 0
          },
          1: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://example.com',
            containerIndex: 1
          },
          2: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://www.example.com',
            containerIndex: 1
          }
        }
      });
      const stubSetValue = browser.sessions.setWindowValue
        .withArgs(1, 'tabList', arg);
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const frag = document.createDocumentFragment();
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
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
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      frag.appendChild(parent);
      frag.appendChild(parent2);
      const domstr = new XMLSerializer().serializeToString(frag);
      const res = await Promise.all([
        func(domstr, 1),
        func(domstr, 1)
      ]);
      assert.isTrue(stubWin.calledTwice, 'called window');
      assert.isTrue(stubGetValue.calledOnce, 'called get');
      assert.isTrue(stubSetValue.calledOnce, 'called set');
      assert.isFalse(mjs.mutex.has(1), 'mutex');
      assert.deepEqual(res, [true, false], 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
      });
      const stubGetValue = browser.sessions.getWindowValue
        .withArgs(1, TAB_LIST).resolves(undefined);
      const arg = JSON.stringify({
        recent: {
          0: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'http://example.com',
            containerIndex: 0
          },
          1: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://example.com',
            containerIndex: 1
          },
          2: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://www.example.com',
            containerIndex: 1
          }
        }
      });
      const stubSetValue = browser.sessions.setWindowValue
        .withArgs(1, 'tabList', arg);
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const frag = document.createDocumentFragment();
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
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
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      frag.appendChild(parent);
      frag.appendChild(parent2);
      const domstr = new XMLSerializer().serializeToString(frag);
      const res = await func(domstr, 1).then(() => func(domstr, 1));
      assert.isTrue(stubWin.calledTwice, 'called window');
      assert.isTrue(stubGetValue.calledTwice, 'called get');
      assert.isTrue(stubSetValue.calledTwice, 'called set');
      assert.isFalse(mjs.mutex.has(1), 'mutex');
      assert.isTrue(res, 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
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
            headingLabel: null,
            headingShown: null,
            url: 'http://example.com',
            containerIndex: 0
          },
          1: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
            url: 'https://example.com',
            containerIndex: 1
          },
          2: {
            collapsed: false,
            headingLabel: null,
            headingShown: null,
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
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const frag = document.createDocumentFragment();
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
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
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      frag.appendChild(parent);
      frag.appendChild(parent2);
      const domstr = new XMLSerializer().serializeToString(frag);
      const res = await func(domstr, 1);
      assert.isTrue(stubWin.calledOnce, 'called window');
      assert.isTrue(stubGetValue.calledOnce, 'called get');
      assert.isTrue(stubSetValue.calledOnce, 'called set');
      assert.isFalse(mjs.mutex.has(1), 'mutex');
      assert.isTrue(res, 'result');
    });

    it('should call function', async () => {
      const stubWin = browser.windows.get.withArgs(1, null).resolves({
        incognito: false,
        id: 1
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
      const res = await func(domstr, 1);
      assert.isTrue(stubWin.calledOnce, 'called window');
      assert.isTrue(stubGetValue.calledOnce, 'called get');
      assert.isTrue(stubSetValue.calledOnce, 'called set');
      assert.isFalse(mjs.mutex.has(1), 'mutex');
      assert.isTrue(res, 'result');
    });
  });

  describe('request save session', () => {
    const func = mjs.requestSaveSession;
    beforeEach(() => {
      mjs.ports.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
    });

    it('should not call function', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: true
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const res = await func();
      assert.isTrue(stubCurrentWin.calledOnce, 'called current window');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      mjs.ports.set(portId, port);
      const res = await func();
      assert.isTrue(stubCurrentWin.calledOnce, 'called current window');
      assert.isFalse(port.postMessage.called, 'not called');
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
      mjs.ports.set(portId, port);
      const res = await func();
      assert.strictEqual(stubCurrentWin.callCount, 2, 'called current window');
      assert.isFalse(port.postMessage.called, 'not called message');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const portId = `${SIDEBAR}_1`;
      const port = mockPort({
        name: portId
      });
      port.postMessage.callsFake(msg => msg);
      mjs.ports.set(portId, port);
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const heading = document.createElement('h1');
      const heading2 = document.createElement('h1');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      heading.classList.add(CLASS_HEADING);
      heading2.classList.add(CLASS_HEADING);
      elm.classList.add(TAB);
      elm2.classList.add(TAB);
      elm3.classList.add(TAB);
      parent.appendChild(heading);
      parent.appendChild(elm);
      parent2.appendChild(heading2);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = await func();
      assert.isTrue(stubCurrentWin.calledOnce, 'called current window');
      assert.isTrue(port.postMessage.calledOnce, 'called message');
      assert.isObject(res, 'result');
      assert.property(res, SESSION_SAVE, 'property');
      assert.property(res[SESSION_SAVE], 'windowId', 'property');
      assert.property(res[SESSION_SAVE], 'domString', 'property');
      assert.isNumber(res[SESSION_SAVE].windowId, 'value');
      assert.isString(res[SESSION_SAVE].domString, 'value');
    });
  });
});
