/**
 * browser-tabs.test.js
 */
/* eslint-disable import-x/order */

/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom } from './mocha/setup.js';

/* test */
import * as mjs from '../src/mjs/browser-tabs.js';
import {
  ACTIVE, AFTER_CURRENT, AFTER_CURRENT_REL, CLASS_TAB_CONTAINER_TMPL,
  CLASS_TAB_GROUP, HIGHLIGHTED, NEW_TAB, PINNED, TAB
} from '../src/mjs/constant.js';

describe('browser-tabs', () => {
  const globalKeys = ['Node'];
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

  describe('close tabs', () => {
    const func = mjs.closeTabs;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if argument is not array', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should not call function if argument is empty array', async () => {
      const i = browser.tabs.remove.callCount;
      const res = await func([]);
      assert.strictEqual(browser.tabs.remove.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.remove.withArgs([1, 2]).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const items = document.querySelectorAll(`.${HIGHLIGHTED}`);
      const res = await func(Array.from(items));
      assert.strictEqual(browser.tabs.remove.withArgs([1, 2]).callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('close duplicate tabs', () => {
    const func = mjs.closeDupeTabs;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if argument is not array', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should not call function if argument is empty array', async () => {
      const i = browser.tabs.remove.callCount;
      const res = await func([]);
      assert.strictEqual(browser.tabs.remove.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.remove.withArgs([1, 2]).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const res = await func([1, 2]);
      assert.strictEqual(browser.tabs.remove.withArgs([1, 2]).callCount, i + 1,
        'called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.remove.withArgs([1, 2]).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const res = await func([1, 2], elm3);
      assert.strictEqual(browser.tabs.remove.withArgs([1, 2]).callCount, i + 1,
        'called');
      assert.isNull(res, 'result');
    });
  });

  describe('close other tabs', () => {
    const func = mjs.closeOtherTabs;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if argument is not array', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should not call function if argument is empty array', async () => {
      const i = browser.tabs.remove.callCount;
      const res = await func([]);
      assert.strictEqual(browser.tabs.remove.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.remove.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      const res = await func([elm]);
      assert.strictEqual(browser.tabs.remove.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.remove.withArgs([3, 4]).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const items = document.querySelectorAll(`.${HIGHLIGHTED}`);
      const res = await func(Array.from(items));
      assert.strictEqual(browser.tabs.remove.withArgs([3, 4]).callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.remove.withArgs([3, 4]).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const res = await func([elm2]);
      assert.strictEqual(browser.tabs.remove.withArgs([3, 4]).callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.remove.withArgs([3, 4]).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.classList.add(HIGHLIGHTED);
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const res = await func([elm2]);
      assert.strictEqual(browser.tabs.remove.withArgs([3, 4]).callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('close tabs to the end', () => {
    const func = mjs.closeTabsToEnd;

    it('should not call function if no argument given', async () => {
      const i = browser.tabs.remove.callCount;
      const res = await func();
      assert.strictEqual(browser.tabs.remove.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function if argument is not element', async () => {
      const i = browser.tabs.remove.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.tabs.remove.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.remove.withArgs([3, 4]).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const res = await func(elm2);
      assert.strictEqual(browser.tabs.remove.withArgs([3, 4]).callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.remove.withArgs([3, 4]).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const res = await func(elm2);
      assert.strictEqual(browser.tabs.remove.withArgs([3, 4]).callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.remove.withArgs([3, 4]).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.classList.add(PINNED);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const res = await func(elm2);
      assert.strictEqual(browser.tabs.remove.withArgs([4]).callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('close tabs to the start', () => {
    const func = mjs.closeTabsToStart;

    it('should not call function if no argument given', async () => {
      const i = browser.tabs.remove.callCount;
      const res = await func();
      assert.strictEqual(browser.tabs.remove.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function if argument is not element', async () => {
      const i = browser.tabs.remove.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.tabs.remove.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function if given argument is pinned', async () => {
      const i = browser.tabs.remove.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.remove.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.remove.withArgs([1, 2]).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const res = await func(elm3);
      assert.strictEqual(browser.tabs.remove.withArgs([1, 2]).callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.remove.withArgs([2, 3]).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const res = await func(elm4);
      assert.strictEqual(browser.tabs.remove.withArgs([2, 3]).callCount, i + 1,
        'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('create tabs in order', () => {
    const func = mjs.createTabsInOrder;

    it('should throw if no argument given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if argument is not array', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should not call function if object is empty', async () => {
      const i = browser.tabs.create.callCount;
      const res = await func([{}]);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const order = [];
      const createFunc = browser.tabs.create.callsFake(opt => {
        const { foo } = opt;
        order.push(foo);
      });
      const res = await func([{ foo: 'bar' }, { foo: 'baz' }]);
      assert.strictEqual(createFunc.callCount, 2, 'called');
      assert.deepEqual(order, ['bar', 'baz'], 'order');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const order = [];
      const createFunc = browser.tabs.create.callsFake(opt => {
        const { foo } = opt;
        order.push(foo);
      });
      const res = await func([{ foo: 'bar' }, { foo: 'baz' }], true);
      assert.strictEqual(createFunc.callCount, 2, 'called');
      assert.deepEqual(order, ['baz', 'bar'], 'order');
      assert.isUndefined(res, 'result');
    });
  });

  describe('reopen tabs in container', () => {
    const func = mjs.reopenTabsInContainer;

    it('should throw if argument not given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if 1st argument is not array', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should throw if 2nd argument not given', async () => {
      await func([]).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Undefined.',
          'throw');
      });
    });

    it('should throw if 2nd argument is not string', async () => {
      await func([], 1).catch(e => {
        assert.strictEqual(e.message, 'Expected String but got Number.',
          'throw');
      });
    });

    it('should not call function if arg is not array of element', async () => {
      const i = browser.tabs.get.callCount;
      const res = await func(['foo'], 'bar');
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      browser.tabs.get.withArgs(1).resolves({
        id: 1,
        index: 0,
        url: 'https://example.com'
      });
      browser.tabs.get.withArgs(2).resolves({
        id: 2,
        index: 1,
        url: 'https://www.example.com'
      });
      const i = browser.tabs.get.withArgs(1).callCount;
      const j = browser.tabs.get.withArgs(2).callCount;
      const k = browser.tabs.create.withArgs({
        url: 'https://www.example.com',
        windowId: 1,
        cookieStoreId: 'bar',
        index: 2,
        openerTabId: 2
      }).callCount;
      const l = browser.tabs.create.withArgs({
        url: 'https://example.com',
        windowId: 1,
        cookieStoreId: 'bar',
        index: 1,
        openerTabId: 1
      }).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm2.dataset.tabId = '2';
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func([elm, elm2], 'bar', 1);
      assert.strictEqual(browser.tabs.get.withArgs(1).callCount, i + 1,
        'called');
      assert.strictEqual(browser.tabs.get.withArgs(2).callCount, j + 1,
        'called');
      assert.strictEqual(browser.tabs.create.withArgs({
        url: 'https://www.example.com',
        windowId: 1,
        cookieStoreId: 'bar',
        index: 2,
        openerTabId: 2
      }).callCount, k + 1, 'called');
      assert.strictEqual(browser.tabs.create.withArgs({
        url: 'https://example.com',
        windowId: 1,
        cookieStoreId: 'bar',
        index: 1,
        openerTabId: 1
      }).callCount, l + 1, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      browser.tabs.get.withArgs(1).resolves({
        id: 1,
        index: 0,
        url: 'https://example.com'
      });
      browser.tabs.get.withArgs(2).resolves({
        id: 2,
        index: 1,
        url: 'https://www.example.com'
      });
      const i = browser.tabs.get.withArgs(1).callCount;
      const j = browser.tabs.get.withArgs(2).callCount;
      const k = browser.tabs.create.withArgs({
        url: 'https://www.example.com',
        windowId: browser.windows.WINDOW_ID_CURRENT,
        cookieStoreId: 'bar',
        index: 2,
        openerTabId: 2
      }).callCount;
      const l = browser.tabs.create.withArgs({
        url: 'https://example.com',
        windowId: browser.windows.WINDOW_ID_CURRENT,
        cookieStoreId: 'bar',
        index: 1,
        openerTabId: 1
      }).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm2.dataset.tabId = '2';
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func([elm, elm2], 'bar');
      assert.strictEqual(browser.tabs.get.withArgs(1).callCount, i + 1,
        'called');
      assert.strictEqual(browser.tabs.get.withArgs(2).callCount, j + 1,
        'called');
      assert.strictEqual(browser.tabs.create.withArgs({
        url: 'https://www.example.com',
        windowId: browser.windows.WINDOW_ID_CURRENT,
        cookieStoreId: 'bar',
        index: 2,
        openerTabId: 2
      }).callCount, k + 1, 'called');
      assert.strictEqual(browser.tabs.create.withArgs({
        url: 'https://example.com',
        windowId: browser.windows.WINDOW_ID_CURRENT,
        cookieStoreId: 'bar',
        index: 1,
        openerTabId: 1
      }).callCount, l + 1, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      browser.tabs.get.withArgs(1).resolves({
        id: 1,
        index: 0,
        url: 'about:newtab'
      });
      browser.tabs.get.withArgs(2).resolves({
        id: 2,
        index: 1,
        url: 'about:blank'
      });
      const i = browser.tabs.get.withArgs(1).callCount;
      const j = browser.tabs.get.withArgs(2).callCount;
      const k = browser.tabs.create.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        cookieStoreId: 'bar',
        index: 1,
        openerTabId: 1
      }).callCount;
      const l = browser.tabs.create.withArgs({
        url: 'about:blank',
        windowId: browser.windows.WINDOW_ID_CURRENT,
        cookieStoreId: 'bar',
        index: 2,
        openerTabId: 2
      }).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.dataset.tabId = '1';
      elm2.dataset.tabId = '2';
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func([elm, elm2], 'bar');
      assert.strictEqual(browser.tabs.get.withArgs(1).callCount, i + 1,
        'called');
      assert.strictEqual(browser.tabs.get.withArgs(2).callCount, j + 1,
        'called');
      assert.strictEqual(browser.tabs.create.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        cookieStoreId: 'bar',
        index: 1,
        openerTabId: 1
      }).callCount, k + 1, 'called');
      assert.strictEqual(browser.tabs.create.withArgs({
        url: 'about:blank',
        windowId: browser.windows.WINDOW_ID_CURRENT,
        cookieStoreId: 'bar',
        index: 2,
        openerTabId: 2
      }).callCount, l + 1, 'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('duplicate tab', () => {
    const func = mjs.dupeTab;

    it('should throw if argument not given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'throw');
      });
    });

    it('should throw if 1st argument is not number', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should call function', async () => {
      browser.tabs.get.withArgs(1).resolves({
        active: true,
        index: 0
      });
      browser.tabs.duplicate.withArgs(1, {
        active: true,
        index: 1
      }).resolves({});
      const i = browser.tabs.get.withArgs(1).callCount;
      const j = browser.tabs.duplicate.withArgs(1, {
        active: true,
        index: 1
      }).callCount;
      const res = await func(1);
      assert.strictEqual(browser.tabs.get.withArgs(1).callCount, i + 1,
        'called get');
      assert.strictEqual(browser.tabs.duplicate.withArgs(1, {
        active: true,
        index: 1
      }).callCount, j + 1, 'called duplicate');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.tabs.get.withArgs(1).resolves({
        active: false,
        index: 0
      });
      browser.tabs.duplicate.withArgs(1, {
        active: true
      }).resolves({});
      const i = browser.tabs.get.withArgs(1).callCount;
      const j = browser.tabs.duplicate.withArgs(1, {
        active: true
      }).callCount;
      const res = await func(1, 1);
      assert.strictEqual(browser.tabs.get.withArgs(1).callCount, i + 1,
        'called get');
      assert.strictEqual(browser.tabs.duplicate.withArgs(1, {
        active: true
      }).callCount, j + 1, 'called duplicate');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('duplicate tabs', () => {
    const func = mjs.dupeTabs;

    it('should throw if argument not given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if 1st argument is not array', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should not call function if element is not contained', async () => {
      const i = browser.tabs.create.callCount;
      const res = await func(['foo']);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if element is not tab', async () => {
      const i = browser.tabs.get.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func([elm]);
      assert.strictEqual(browser.tabs.get.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.get.callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
      const items = document.querySelectorAll(`.${HIGHLIGHTED}`);
      const res = await func(Array.from(items));
      assert.strictEqual(browser.tabs.get.callCount, i + 2, 'called');
      assert.deepEqual(res, [null, null], 'result');
    });
  });

  describe('highlight tabs', () => {
    const func = mjs.highlightTabs;

    it('should throw if argument not given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if 1st argument is not number', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should call function', async () => {
      browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        active: true,
        windowType: 'normal'
      }).resolves([{
        index: 0
      }]);
      browser.tabs.highlight.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        tabs: [0]
      }).resolves({});
      const i = browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        active: true,
        windowType: 'normal'
      }).callCount;
      const j = browser.tabs.highlight.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        tabs: [0]
      }).callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      const res = await func([elm]);
      assert.strictEqual(browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        active: true,
        windowType: 'normal'
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.highlight.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        tabs: [0]
      }).callCount, j + 1, 'called');
      assert.isObject(res, 'result');
    });

    it('should call function', async () => {
      browser.tabs.query.withArgs({
        windowId: 1,
        active: true,
        windowType: 'normal'
      }).resolves([{
        index: 0
      }]);
      browser.tabs.highlight.withArgs({
        windowId: 1,
        tabs: [0, 2]
      }).resolves({});
      const i = browser.tabs.query.withArgs({
        windowId: 1,
        active: true,
        windowType: 'normal'
      }).callCount;
      const j = browser.tabs.highlight.withArgs({
        windowId: 1,
        tabs: [0, 2]
      }).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(ACTIVE);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      const res = await func([elm, elm3], {
        windowId: 1
      });
      assert.strictEqual(browser.tabs.query.withArgs({
        windowId: 1,
        active: true,
        windowType: 'normal'
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.highlight.withArgs({
        windowId: 1,
        tabs: [0, 2]
      }).callCount, j + 1, 'called');
      assert.isObject(res, 'result');
    });

    it('should call function', async () => {
      browser.tabs.query.withArgs({
        windowId: 1,
        active: true,
        windowType: 'normal'
      }).resolves([{
        index: 2
      }]);
      browser.tabs.highlight.withArgs({
        windowId: 1,
        tabs: [2, 0]
      }).resolves({});
      const i = browser.tabs.query.withArgs({
        windowId: 1,
        active: true,
        windowType: 'normal'
      }).callCount;
      const j = browser.tabs.highlight.withArgs({
        windowId: 1,
        tabs: [2, 0]
      }).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.classList.add(ACTIVE);
      elm3.classList.add(HIGHLIGHTED);
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      const res = await func([elm, elm3], {
        windowId: 1
      });
      assert.strictEqual(browser.tabs.query.withArgs({
        windowId: 1,
        active: true,
        windowType: 'normal'
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.highlight.withArgs({
        windowId: 1,
        tabs: [2, 0]
      }).callCount, j + 1, 'called');
      assert.isObject(res, 'result');
    });

    it('should call function', async () => {
      browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        active: true,
        windowType: 'normal'
      }).resolves([{
        index: 0
      }]);
      browser.tabs.highlight.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        tabs: [0, 2]
      }).resolves({});
      const i = browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        active: true,
        windowType: 'normal'
      }).callCount;
      const j = browser.tabs.highlight.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        tabs: [0, 2]
      }).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      const res = await func([elm, elm3]);
      assert.strictEqual(browser.tabs.query.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        active: true,
        windowType: 'normal'
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.highlight.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        tabs: [0, 2]
      }).callCount, j + 1, 'called');
      assert.isObject(res, 'result');
    });

    it('should call function', async () => {
      browser.tabs.update.withArgs(3, {
        active: true
      }).resolves({
        index: 2
      });
      browser.tabs.highlight.withArgs({
        windowId: 1,
        tabs: [2, 0]
      }).resolves({});
      const i = browser.tabs.update.withArgs(3, {
        active: true
      }).callCount;
      const j = browser.tabs.highlight.withArgs({
        windowId: 1,
        tabs: [2, 0]
      }).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.classList.add(ACTIVE);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      const res = await func([elm, elm3], {
        tabId: 3,
        windowId: 1
      });
      assert.strictEqual(browser.tabs.update.withArgs(3, {
        active: true
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.highlight.withArgs({
        windowId: 1,
        tabs: [2, 0]
      }).callCount, j + 1, 'called');
      assert.isObject(res, 'result');
    });
  });

  describe('move tabs in order', () => {
    const func = mjs.moveTabsInOrder;

    it('should throw if argument not given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if 1st argument is not number', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should not call function if object is empty', async () => {
      const i = browser.tabs.move.callCount;
      const res = await func([{}]);
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.isUndefined(res, 'result');
    });

    it('should throw if index is not contained', async () => {
      await func([{ foo: 'bar' }]).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'throw');
      });
    });

    it('should throw if index is not number', async () => {
      await func([{ index: 'foo' }]).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should throw if tabId is not contained', async () => {
      await func([{ index: 0 }]).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'throw');
      });
    });

    it('should throw if index is not number', async () => {
      await func([{ index: 0, tabId: 'foo' }]).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should call function', async () => {
      const i = browser.tabs.move.withArgs(1, {
        index: 0,
        windowId: 1
      }).callCount;
      const res = await func([{ index: 0, tabId: 1 }], 1);
      assert.strictEqual(browser.tabs.move.withArgs(1, {
        index: 0,
        windowId: 1
      }).callCount, i + 1, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.withArgs(1, {
        index: 0,
        windowId: browser.windows.WINDOW_ID_CURRENT
      }).callCount;
      const res = await func([{ index: 0, tabId: 1 }]);
      assert.strictEqual(browser.tabs.move.withArgs(1, {
        index: 0,
        windowId: browser.windows.WINDOW_ID_CURRENT
      }).callCount, i + 1, 'called');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const order = [];
      const moveFunc = browser.tabs.move.callsFake((...args) => {
        const [id] = args;
        order.push(id);
      });
      const res =
        await func([{ index: 0, tabId: 1 }, { index: 1, tabId: 2 }], 1);
      assert.strictEqual(moveFunc.callCount, 2, 'called');
      assert.deepEqual(order, [1, 2], 'order');
      assert.isUndefined(res, 'result');
    });

    it('should call function', async () => {
      const order = [];
      const moveFunc = browser.tabs.move.callsFake((...args) => {
        const [id] = args;
        order.push(id);
      });
      const res =
        await func([{ index: 0, tabId: 1 }, { index: 1, tabId: 2 }], 1, true);
      assert.strictEqual(moveFunc.callCount, 2, 'called');
      assert.deepEqual(order, [2, 1], 'order');
      assert.isUndefined(res, 'result');
    });
  });

  describe('move tabs to end', () => {
    const func = mjs.moveTabsToEnd;

    it('should throw if argument not given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if 1st argument is not array', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should throw if 2nd argument not number', async () => {
      await func([]).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'throw');
      });
    });

    it('should throw if 2nd argument is not number', async () => {
      await func([], 'foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should not call function if empty array', async () => {
      const i = browser.tabs.move.callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      elm.classList.add(TAB);
      container.appendChild(elm);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      const res = await func([], 1);
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if element is not contained', async () => {
      const i = browser.tabs.move.callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      elm.classList.add(TAB);
      container.appendChild(elm);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      const res = await func(['foo'], 1);
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if element is not tab', async () => {
      const i = browser.tabs.move.callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      elm.classList.add(TAB);
      container.appendChild(elm);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(elm2);
      const res = await func([elm2], 1);
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).resolves({});
      const i = browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container2.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(container2);
      body.appendChild(newTabContainer);
      const res = await func([elm], 1, 1);
      assert.strictEqual(browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).callCount, i + 1, 'called');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).resolves({});
      const j = browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container2.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(container2);
      body.appendChild(newTabContainer);
      const res = await func([elm3], 1, 1);
      assert.strictEqual(browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).resolves({});
      browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).resolves({});
      const i = browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).callCount;
      const j = browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container2.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(container2);
      body.appendChild(newTabContainer);
      const res = await func([elm, elm3], 1, 1);
      assert.strictEqual(browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, [[{}], [{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([1], {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        index: 1
      }).resolves({});
      browser.tabs.move.withArgs([3], {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        index: -1
      }).resolves({});
      const i = browser.tabs.move.withArgs([1], {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        index: 1
      }).callCount;
      const j = browser.tabs.move.withArgs([3], {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        index: -1
      }).callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container2.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(container2);
      body.appendChild(newTabContainer);
      const res = await func([elm, elm3], 1);
      assert.strictEqual(browser.tabs.move.withArgs([1], {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        index: 1
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.withArgs([3], {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        index: -1
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, [[{}], [{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).resolves({});
      browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).resolves({});
      const i = browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).callCount;
      const j = browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute('hidden', 'hidden');
      tmpl.content.appendChild(cnt);
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      container.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm3.dataset.group = 'foo';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(tmpl);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(newTabContainer);
      const res = await func([elm, elm3], 1, 1);
      assert.strictEqual(browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, [[{}], [{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).resolves({});
      browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).resolves({});
      const i = browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).callCount;
      const j = browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute('hidden', 'hidden');
      tmpl.content.appendChild(cnt);
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      container.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(tmpl);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(newTabContainer);
      const res = await func([elm, elm3], 1, 1);
      assert.strictEqual(browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, [[{}], [{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 1
      }).resolves({});
      browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).resolves({});
      const i = browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 1
      }).callCount;
      const j = browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container2.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(container2);
      body.appendChild(newTabContainer);
      const res = await func([elm2, elm3], 1, 1);
      assert.strictEqual(browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 1
      }).callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: -1
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).resolves({});
      browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: -1
      }).resolves({});
      const i = browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).callCount;
      const j = browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: -1
      }).callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container2.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(container2);
      body.appendChild(newTabContainer);
      const res = await func([elm, elm4], 1, 1);
      assert.strictEqual(browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 1
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: -1
      }).callCount, j, 'not called');
      assert.deepEqual(res, [[{}]], 'result');
    });
  });

  describe('move tabs to start', () => {
    const func = mjs.moveTabsToStart;

    it('should throw if argument not given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if 1st argument is not array', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should throw if 2nd argument not number', async () => {
      await func([]).catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got Undefined.',
          'throw');
      });
    });

    it('should throw if 2nd argument is not number', async () => {
      await func([], 'foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Number but got String.',
          'throw');
      });
    });

    it('should not call function if empty array', async () => {
      const i = browser.tabs.move.callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      elm.classList.add(TAB);
      container.appendChild(elm);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      const res = await func([], 1);
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if element is not contained', async () => {
      const i = browser.tabs.move.callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      elm.classList.add(TAB);
      container.appendChild(elm);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      const res = await func(['foo'], 1);
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if element is not tab', async () => {
      const i = browser.tabs.move.callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      elm.classList.add(TAB);
      container.appendChild(elm);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(elm2);
      const res = await func([elm2], 2);
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).resolves({});
      const i = browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container2.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(container2);
      body.appendChild(newTabContainer);
      const res = await func([elm2], 2, 1);
      assert.strictEqual(browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).callCount, i + 1, 'called');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).resolves({});
      const j = browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container2.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(container2);
      body.appendChild(newTabContainer);
      const res = await func([elm4], 4, 1);
      assert.strictEqual(browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).resolves({});
      browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).resolves({});
      const i = browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).callCount;
      const j = browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container2.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(container2);
      body.appendChild(newTabContainer);
      const res = await func([elm2, elm4], 2, 1);
      assert.strictEqual(browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, [[{}], [{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([2], {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        index: 0
      }).resolves({});
      browser.tabs.move.withArgs([4], {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        index: 2
      }).resolves({});
      const i = browser.tabs.move.withArgs([2], {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        index: 0
      }).callCount;
      const j = browser.tabs.move.withArgs([4], {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        index: 2
      }).callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container2.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(container2);
      body.appendChild(newTabContainer);
      const res = await func([elm2, elm4], 2);
      assert.strictEqual(browser.tabs.move.withArgs([2], {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        index: 0
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.withArgs([4], {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        index: 2
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, [[{}], [{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).resolves({});
      browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).resolves({});
      const i = browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).callCount;
      const j = browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute('hidden', 'hidden');
      tmpl.content.appendChild(cnt);
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      container.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.group = 'foo';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(tmpl);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(newTabContainer);
      const res = await func([elm2, elm4], 2, 1);
      assert.strictEqual(browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, [[{}], [{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).resolves({});
      browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).resolves({});
      const i = browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).callCount;
      const j = browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      cnt.setAttribute('hidden', 'hidden');
      tmpl.content.appendChild(cnt);
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      container.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(tmpl);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(newTabContainer);
      const res = await func([elm2, elm4], 2, 1);
      assert.strictEqual(browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, [[{}], [{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 0
      }).resolves({});
      browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).resolves({});
      const i = browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 0
      }).callCount;
      const j = browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container2.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(container2);
      body.appendChild(newTabContainer);
      const res = await func([elm, elm4], 1, 1);
      assert.strictEqual(browser.tabs.move.withArgs([1], {
        windowId: 1,
        index: 0
      }).callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.withArgs([4], {
        windowId: 1,
        index: 2
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, [[{}]], 'result');
    });

    it('should call function', async () => {
      browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).resolves({});
      browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: 2
      }).resolves({});
      const i = browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).callCount;
      const j = browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: 2
      }).callCount;
      const pinnedContainer = document.createElement('div');
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const newTabContainer = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const newTab = document.createElement('p');
      const body = document.querySelector('body');
      pinnedContainer.id = PINNED;
      pinnedContainer.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      newTab.id = NEW_TAB;
      pinnedContainer.appendChild(elm);
      pinnedContainer.appendChild(elm2);
      container.appendChild(elm3);
      container2.appendChild(elm4);
      newTabContainer.appendChild(newTab);
      body.appendChild(pinnedContainer);
      body.appendChild(container);
      body.appendChild(container2);
      body.appendChild(newTabContainer);
      const res = await func([elm2, elm3], 2, 1);
      assert.strictEqual(browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: 0
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.withArgs([3], {
        windowId: 1,
        index: 2
      }).callCount, j, 'not called');
      assert.deepEqual(res, [[{}]], 'result');
    });
  });

  describe('move tabs to new window', () => {
    const func = mjs.moveTabsToNewWindow;

    it('should throw if argument not given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if argument is not array', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should not call function if empty array', async () => {
      const i = browser.tabs.move.callCount;
      const res = await func([]);
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function if element is not contained', async () => {
      const i = browser.tabs.move.callCount;
      const res = await func(['foo']);
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function if element is not tab', async () => {
      const i = browser.tabs.move.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func([elm]);
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.isNull(res, 'result');
    });

    it('should create window but not call move if only 1 tab', async () => {
      browser.windows.create.withArgs({
        tabId: 1,
        type: 'normal'
      }).resolves({
        id: 1
      });
      const i = browser.windows.create.withArgs({
        tabId: 1,
        type: 'normal'
      }).callCount;
      const j = browser.tabs.move.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      const res = await func([elm]);
      assert.strictEqual(browser.windows.create.withArgs({
        tabId: 1,
        type: 'normal'
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.isNull(res, 'result');
    });

    it('should create window and call move', async () => {
      browser.windows.create.withArgs({
        tabId: 1,
        type: 'normal'
      }).resolves({
        id: 1
      });
      browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: -1
      }).resolves([{}]);
      const i = browser.windows.create.withArgs({
        tabId: 1,
        type: 'normal'
      }).callCount;
      const j = browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: -1
      }).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func([elm, elm2]);
      assert.strictEqual(browser.windows.create.withArgs({
        tabId: 1,
        type: 'normal'
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: -1
      }).callCount, j + 1, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should create window but not call move', async () => {
      browser.windows.create.withArgs({
        tabId: 1,
        type: 'normal'
      }).resolves({
        id: 1
      });
      browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: -1
      }).resolves([{}]);
      const i = browser.windows.create.withArgs({
        tabId: 1,
        type: 'normal'
      }).callCount;
      const j = browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: -1
      }).callCount;
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      body.appendChild(elm2);
      const res = await func([elm, elm2]);
      assert.strictEqual(browser.windows.create.withArgs({
        tabId: 1,
        type: 'normal'
      }).callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.withArgs([2], {
        windowId: 1,
        index: -1
      }).callCount, j, 'not called');
      assert.isNull(res, 'result');
    });
  });

  describe('mute tabs', () => {
    const func = mjs.muteTabs;

    it('should throw if argument not given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if argument is not array', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should not call function if empty array', async () => {
      const i = browser.tabs.update.callCount;
      const res = await func([]);
      assert.strictEqual(browser.tabs.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if element is not contained', async () => {
      const i = browser.tabs.update.callCount;
      const res = await func(['foo']);
      assert.strictEqual(browser.tabs.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if element is not tab', async () => {
      const i = browser.tabs.update.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func([elm]);
      assert.strictEqual(browser.tabs.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      browser.tabs.update.withArgs(1, {
        muted: false
      }).resolves({});
      const i = browser.tabs.update.withArgs(1, {
        muted: false
      }).callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      const res = await func([elm]);
      assert.strictEqual(browser.tabs.update.withArgs(1, {
        muted: false
      }).callCount, i + 1, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.tabs.update.withArgs(1, {
        muted: true
      }).resolves({});
      const i = browser.tabs.update.withArgs(1, {
        muted: true
      }).callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      const res = await func([elm], true);
      assert.strictEqual(browser.tabs.update.withArgs(1, {
        muted: true
      }).callCount, i + 1, 'called');
      assert.deepEqual(res, [{}], 'result');
    });
  });

  describe('create new tab', () => {
    const func = mjs.createNewTab;

    it('should call function', async () => {
      const create = browser.tabs.create.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func();
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const create = browser.tabs.create.withArgs({
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func(1);
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const create = browser.tabs.create.withArgs({
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func(1, {
        index: -1
      });
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.tabs.query.withArgs({
        windowId: 1,
        active: true,
        windowType: 'normal'
      }).resolves([{
        id: 1,
        index: 2
      }]);
      const create = browser.tabs.create.withArgs({
        windowId: 1,
        active: true,
        index: 3
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func(1, {
        [AFTER_CURRENT]: true
      });
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.permissions.contains.resolves(false);
      browser.browserSettings.newTabPosition.get.resolves({
        value: AFTER_CURRENT
      });
      const create = browser.tabs.create.withArgs({
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func(1, {
        index: 2
      });
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.permissions.contains.resolves(true);
      browser.browserSettings.newTabPosition.get.resolves({});
      const create = browser.tabs.create.withArgs({
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func(1, {
        index: 2
      });
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.permissions.contains.resolves(true);
      browser.browserSettings.newTabPosition.get.resolves({
        value: 'atEnd'
      });
      const create = browser.tabs.create.withArgs({
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func(1, {
        index: 2
      });
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.permissions.contains.resolves(true);
      browser.browserSettings.newTabPosition.get.resolves({
        value: AFTER_CURRENT
      });
      const create = browser.tabs.create.withArgs({
        index: 2,
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func(1, {
        index: 2
      });
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      browser.permissions.contains.resolves(true);
      browser.browserSettings.newTabPosition.get.resolves({
        value: AFTER_CURRENT_REL
      });
      const create = browser.tabs.create.withArgs({
        index: 2,
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func(1, {
        index: 2
      });
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const create = browser.tabs.create.withArgs({
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func(1, {
        openerTabId: browser.tabs.TAB_ID_NONE
      });
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const create = browser.tabs.create.withArgs({
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func(1, {
        openerTabId: 'foo'
      });
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const create = browser.tabs.create.withArgs({
        openerTabId: 2,
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func(1, {
        openerTabId: 2
      });
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const create = browser.tabs.create.withArgs({
        cookieStoreId: 'foo',
        windowId: 1,
        active: true
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func(1, {
        cookieStoreId: 'foo'
      });
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('create new tab in container', () => {
    const func = mjs.createNewTabInContainer;

    it('should throw', async () => {
      await func().catch(e => {
        assert.instanceOf(e, TypeError);
        assert.strictEqual(e.message, 'Expected String but got Undefined.');
      });
    });

    it('should call function', async () => {
      const create = browser.tabs.create.withArgs({
        windowId: browser.windows.WINDOW_ID_CURRENT,
        active: true,
        cookieStoreId: 'foo'
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func('foo');
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const create = browser.tabs.create.withArgs({
        windowId: 1,
        active: true,
        cookieStoreId: 'foo'
      });
      const i = create.callCount;
      create.resolves({});
      const res = await func('foo', 1);
      assert.strictEqual(create.callCount, i + 1, 'called');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('pin tabs', () => {
    const func = mjs.pinTabs;

    it('should throw if argument not given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if argument is not array', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should not call function if empty array', async () => {
      const i = browser.tabs.update.callCount;
      const res = await func([]);
      assert.strictEqual(browser.tabs.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if element is not contained', async () => {
      const i = browser.tabs.update.callCount;
      const res = await func(['foo']);
      assert.strictEqual(browser.tabs.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if element is not tab', async () => {
      const i = browser.tabs.update.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func([elm]);
      assert.strictEqual(browser.tabs.update.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      browser.tabs.update.withArgs(1, {
        pinned: false
      }).resolves({});
      const i = browser.tabs.update.withArgs(1, {
        pinned: false
      }).callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      const res = await func([elm]);
      assert.strictEqual(browser.tabs.update.withArgs(1, {
        pinned: false
      }).callCount, i + 1, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      browser.tabs.update.withArgs(1, {
        pinned: true
      }).resolves({});
      const i = browser.tabs.update.withArgs(1, {
        pinned: true
      }).callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      const res = await func([elm], true);
      assert.strictEqual(browser.tabs.update.withArgs(1, {
        pinned: true
      }).callCount, i + 1, 'called');
      assert.deepEqual(res, [{}], 'result');
    });
  });

  describe('reload tabs', () => {
    const func = mjs.reloadTabs;

    it('should throw if argument not given', async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got Undefined.',
          'throw');
      });
    });

    it('should throw if argument is not array', async () => {
      await func('foo').catch(e => {
        assert.strictEqual(e.message, 'Expected Array but got String.',
          'throw');
      });
    });

    it('should not call function if empty array', async () => {
      const i = browser.tabs.reload.callCount;
      const res = await func([]);
      assert.strictEqual(browser.tabs.reload.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if element is not contained', async () => {
      const i = browser.tabs.reload.callCount;
      const res = await func(['foo']);
      assert.strictEqual(browser.tabs.reload.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if element is not tab', async () => {
      const i = browser.tabs.reload.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func([elm]);
      assert.strictEqual(browser.tabs.reload.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      browser.tabs.reload.withArgs(1).resolves(undefined);
      const i = browser.tabs.reload.withArgs(1).callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      body.appendChild(elm);
      const res = await func([elm]);
      assert.strictEqual(browser.tabs.reload.withArgs(1).callCount, i + 1,
        'called');
      assert.deepEqual(res, [undefined], 'result');
    });
  });
});
