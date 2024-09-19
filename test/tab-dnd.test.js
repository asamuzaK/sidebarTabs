/**
 * tab-dnd.test.js
 */
/* eslint-disable import/order */

/* api */
import sinon from 'sinon';
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom, mockPort } from './mocha/setup.js';

/* test */
import * as mjs from '../src/mjs/tab-dnd.js';
import {
  CLASS_HEADING, CLASS_TAB_CONTAINER, CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_GROUP,
  DROP_TARGET, DROP_TARGET_AFTER, DROP_TARGET_BEFORE, HIGHLIGHTED,
  MIME_JSON, MIME_PLAIN, MIME_URI, PINNED, SIDEBAR, SIDEBAR_MAIN, TAB
} from '../src/mjs/constant.js';

describe('dnd', () => {
  const globalKeys = ['Node', 'XMLSerializer'];
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

  describe('move dropped tabs', () => {
    const func = mjs.moveDroppedTabs;

    it('should not call function', async () => {
      const i = browser.tabs.move.callCount;
      const res = await func();
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.move.callCount;
      const res = await func('foo');
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.move.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.move.callCount;
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const res = await func(elm, [], {});
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm, { foo: 'bar' });
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(tmpl);
      body.appendChild(parent);
      const res = await func(elm, {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabIds: 2
      });
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    // ungrouped tab
    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const parent4 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      const res = await func(elm3, {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabIds: [1, 4]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm, elm4, elm3], 'move');
      assert.isFalse(elm.parentNode === elm3.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm4.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const parent4 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      const res = await func(elm2, {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabIds: [1, 4]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm, elm4, elm2, elm3], 'move');
      assert.isFalse(elm.parentNode === elm2.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm4.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const parent4 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      const res = await func(elm2, {
        dropAfter: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabIds: [1, 4]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm, elm4, elm3], 'move');
      assert.isFalse(elm.parentNode === elm2.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm4.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const parent4 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      const res = await func(elm3, {
        dropAfter: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabIds: [1, 4]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm3, elm, elm4], 'move');
      assert.isFalse(elm.parentNode === elm3.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm4.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });

    // tab group
    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent3 = document.createElement('div');
      const parent4 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent3);
      body.appendChild(parent4);
      const res = await func(elm3, {
        dropAfter: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: true,
        tabIds: [1, 2]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm3, elm, elm2, elm4], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm3.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm4.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent3 = document.createElement('div');
      const parent4 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent3);
      body.appendChild(parent4);
      const res = await func(elm4, {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: true,
        tabIds: [1, 2]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm3, elm, elm2, elm4], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm3.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm4.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });

    // tab group but to be included in drop target group
    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent3 = document.createElement('div');
      const parent4 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent3);
      body.appendChild(parent4);
      const res = await func(elm3, {
        dropAfter: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        beGrouped: true,
        tabGroup: true,
        tabIds: [1, 2]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm3, elm, elm2, elm4], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'parent');
      assert.isTrue(elm.parentNode === elm3.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm4.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent3 = document.createElement('div');
      const parent4 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent3);
      body.appendChild(parent4);
      const res = await func(elm4, {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        beGrouped: true,
        tabGroup: true,
        tabIds: [1, 2]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm3, elm, elm2, elm4], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm3.parentNode, 'parent');
      assert.isTrue(elm.parentNode === elm4.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });

    // be grouped
    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const parent4 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      const res = await func(elm3, {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        beGrouped: true,
        tabIds: [1, 4]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm, elm4, elm3], 'move');
      assert.isTrue(elm.parentNode === elm3.parentNode, 'parent');
      assert.isTrue(elm4.parentNode === elm3.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const parent4 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent3.appendChild(elm3);
      parent4.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      body.appendChild(parent4);
      const res = await func(elm3, {
        dropAfter: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        beGrouped: true,
        tabIds: [1, 4]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm3, elm, elm4], 'move');
      assert.isTrue(elm.parentNode === elm3.parentNode, 'parent');
      assert.isTrue(elm4.parentNode === elm3.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });

    // pinned
    it('should not call function', async () => {
      const i = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB, PINNED);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB, PINNED);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      parent.appendChild(elm4);
      body.appendChild(parent);
      const res = await func(elm3, {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinned: true,
        tabIds: [1, 4]
      });
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      parent.appendChild(elm4);
      body.appendChild(parent);
      const res = await func(elm3, {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinned: true,
        tabIds: [1, 4]
      });
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB, PINNED);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB, PINNED);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      parent.appendChild(elm4);
      body.appendChild(parent);
      const res = await func(elm3, {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinned: true,
        tabIds: [1, 4]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm, elm4, elm3], 'move');
      assert.isTrue(elm.parentNode === elm3.parentNode, 'parent');
      assert.isTrue(elm4.parentNode === elm3.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB, PINNED);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB, PINNED);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      parent.appendChild(elm4);
      body.appendChild(parent);
      const res = await func(elm3, {
        dropAfter: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinned: true,
        tabIds: [1, 4]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm3, elm, elm4], 'move');
      assert.isTrue(elm.parentNode === elm3.parentNode, 'parent');
      assert.isTrue(elm4.parentNode === elm3.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });
  });

  describe('get target for dragged tabs', () => {
    const func = mjs.getTargetForDraggedTabs;

    it('should get null', async () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = func(elm);
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = func(elm);
      assert.isNull(res, 'result');
    });

    it('should get null', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = func(elm, {});
      assert.isNull(res, 'result');
    });

    it('should get result', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm2, {
        isPinnedTabIds: false
      });
      assert.deepEqual(res, elm2, 'result');
    });

    it('should get result', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm2, {
        isPinnedTabIds: true
      });
      assert.deepEqual(res, elm, 'result');
    });

    it('should get result', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm3, {
        isPinnedTabIds: false
      });
      assert.deepEqual(res, elm3, 'result');
    });

    it('should get result', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB, DROP_TARGET, DROP_TARGET_BEFORE);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm3, {
        isPinnedTabIds: false
      });
      assert.deepEqual(res, elm3, 'result');
    });

    it('should get result', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED, DROP_TARGET, DROP_TARGET_AFTER);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm, {
        isPinnedTabIds: false
      });
      assert.deepEqual(res, elm2, 'result');
    });

    it('should get result', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED, DROP_TARGET, DROP_TARGET_AFTER);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm, {
        isPinnedTabIds: true
      });
      assert.deepEqual(res, elm, 'result');
    });

    it('should get result', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED, DROP_TARGET, DROP_TARGET_BEFORE);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm, {
        isPinnedTabIds: true
      });
      assert.deepEqual(res, elm, 'result');
    });
  });

  describe('get drop target index for dragged tabs', () => {
    const func = mjs.getDropIndexForDraggedTabs;

    it('should get undefined', async () => {
      const res = func();
      assert.isUndefined(res, 'result');
    });

    it('should not call function if 1st arg is not drop target', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = func(elm);
      assert.isUndefined(res, 'result');
    });

    it('should not call function if 2nd arg is not object', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = func(elm);
      assert.isUndefined(res, 'result');
    });

    it('should not call function if 2nd arg is empty object', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = func(elm, {});
      assert.isUndefined(res, 'result');
    });

    it('should get result', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm2, {
        isPinnedTabIds: false
      });
      assert.strictEqual(res, 2, 'result');
    });

    it('should call function', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm2, {
        isPinnedTabIds: true
      });
      assert.strictEqual(res, 1, 'result');
    });

    it('should call function', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm3, {
        isPinnedTabIds: false
      });
      assert.strictEqual(res, -1, 'result');
    });

    it('should call function', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB, DROP_TARGET, DROP_TARGET_BEFORE);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm3, {
        isPinnedTabIds: false
      });
      assert.strictEqual(res, 2, 'result');
    });

    it('should call function', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED, DROP_TARGET, DROP_TARGET_AFTER);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm, {
        isPinnedTabIds: false
      });
      assert.strictEqual(res, 1, 'result');
    });

    it('should call function', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED, DROP_TARGET, DROP_TARGET_AFTER);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm, {
        isPinnedTabIds: true
      });
      assert.strictEqual(res, 1, 'result');
    });

    it('should get result', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED, DROP_TARGET, DROP_TARGET_BEFORE);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm, {
        isPinnedTabIds: true
      });
      assert.strictEqual(res, 0, 'result');
    });

    it('should call function', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = func(elm3, {
        copy: true,
        isPinnedTabIds: false
      });
      assert.strictEqual(res, 3, 'result');
    });
  });

  describe('extract dropped tabs data', () => {
    const func = mjs.extractDroppedTabs;

    it('should not call function if no arguemnt given', async () => {
      const i = browser.tabs.move.callCount;
      const res = await func();
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if 1st arg is not drop target', async () => {
      const i = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if 2nd arg is not object', async () => {
      const i = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if 2nd arg is empty object', async () => {
      const i = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm, {});
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function if window ID is WINDOW_ID_NONE', async () => {
      const i = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm, {
        dragWindowId: browser.windows.WINDOW_ID_NONE,
        dropEffect: 'move'
      });
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      elm2.classList.add(TAB, DROP_TARGET);
      elm2.dataset.tabId = '2';
      parent2.appendChild(elm2);
      body.appendChild(parent);
      body.appendChild(parent2);
      let dragWindowId = browser.windows.WINDOW_ID_CURRENT + 1;
      if (dragWindowId === browser.windows.WINDOW_ID_NONE) {
        dragWindowId++;
      }
      const res = await func(elm2, {
        dragWindowId,
        dropEffect: 'move',
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [],
        tabIds: []
      });
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      let dragWindowId = browser.windows.WINDOW_ID_CURRENT + 1;
      if (dragWindowId === browser.windows.WINDOW_ID_NONE) {
        dragWindowId++;
      }
      const res = await func(elm2, {
        dragWindowId,
        dropEffect: 'none',
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [],
        tabIds: [10]
      });
      assert.strictEqual(browser.tabs.move.callCount, i, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      let dragWindowId = browser.windows.WINDOW_ID_CURRENT + 1;
      if (dragWindowId === browser.windows.WINDOW_ID_NONE) {
        dragWindowId++;
      }
      const res = await func(elm2, {
        dragWindowId,
        dropEffect: 'move',
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [],
        tabIds: [10]
      });
      const { args } = browser.tabs.move;
      assert.strictEqual(browser.tabs.move.callCount, i + 1, 'called');
      assert.deepEqual(args[0][0], [10], 'args');
      assert.deepEqual(args[0][1], {
        index: 2,
        windowId: browser.windows.WINDOW_ID_CURRENT
      }, 'args');
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      let dragWindowId = browser.windows.WINDOW_ID_CURRENT + 1;
      if (dragWindowId === browser.windows.WINDOW_ID_NONE) {
        dragWindowId++;
      }
      const res = await func(elm2, {
        dragWindowId,
        dropEffect: 'move',
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [10],
        tabIds: []
      });
      const { args } = browser.tabs.move;
      assert.strictEqual(browser.tabs.move.callCount, i + 1, 'called');
      assert.deepEqual(args[0][0], [10], 'args');
      assert.deepEqual(args[0][1], {
        index: 1,
        windowId: browser.windows.WINDOW_ID_CURRENT
      }, 'args');
      assert.deepEqual(res, [null], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, PINNED, DROP_TARGET, DROP_TARGET_AFTER);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent3.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      const res = await func(elm2, {
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        dropEffect: 'move',
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [1],
        tabIds: []
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 1, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm, elm3, elm4], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'parent');
      assert.deepEqual(res, [[null]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED, DROP_TARGET, DROP_TARGET_BEFORE);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent3.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      const res = await func(elm, {
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        dropEffect: 'move',
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [2],
        tabIds: []
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 1, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm, elm3, elm4], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'parent');
      assert.deepEqual(res, [[null]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, PINNED, DROP_TARGET, DROP_TARGET_AFTER);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent3.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      const res = await func(elm2, {
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        dropEffect: 'move',
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [1],
        tabIds: [4]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm, elm4, elm3], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm4.parentNode, 'parent');
      assert.isFalse(elm4.parentNode === elm3.parentNode, 'parent');
      assert.deepEqual(res, [[null], [null]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB, DROP_TARGET, DROP_TARGET_BEFORE);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent3.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      const res = await func(elm3, {
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        dropEffect: 'move',
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [],
        tabIds: [4]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 1, 'called');
      assert.deepEqual(Array.from(items), [elm, elm2, elm4, elm3], 'move');
      assert.isFalse(elm4.parentNode === elm3.parentNode, 'parent');
      assert.deepEqual(res, [[null]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent3.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      const res = await func(elm4, {
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        dropEffect: 'move',
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [],
        tabIds: [3]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 1, 'called');
      assert.deepEqual(Array.from(items), [elm, elm2, elm4, elm3], 'move');
      assert.isFalse(elm4.parentNode === elm3.parentNode, 'parent');
      assert.deepEqual(res, [[null]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB, DROP_TARGET, DROP_TARGET_BEFORE);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent3.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      const res = await func(elm3, {
        beGrouped: true,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        dropEffect: 'move',
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [1],
        tabIds: [4]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm, elm4, elm3], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm4.parentNode, 'parent');
      assert.isTrue(elm4.parentNode === elm3.parentNode, 'parent');
      assert.deepEqual(res, [[null], [null]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.move.callCount;
      const tmpl = document.createElement('template');
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const parent3 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent3.appendChild(elm4);
      body.appendChild(tmpl);
      body.appendChild(parent);
      body.appendChild(parent2);
      body.appendChild(parent3);
      const res = await func(elm4, {
        beGrouped: true,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        dropEffect: 'move',
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [1],
        tabIds: [3]
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm, elm4, elm3], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm4.parentNode, 'parent');
      assert.isTrue(elm4.parentNode === elm3.parentNode, 'parent');
      assert.deepEqual(res, [[null], [null]], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.duplicate.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = await func(elm2, {
        dragTabId: 1,
        dropEffect: 'copy',
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [1],
        tabIds: []
      });
      assert.strictEqual(browser.tabs.duplicate.callCount, i + 1, 'called');
      assert.isTrue(browser.tabs.duplicate.withArgs(1, {
        index: 2,
        active: false
      }).calledOnce, 'called');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.duplicate.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, DROP_TARGET, DROP_TARGET_BEFORE);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = await func(elm2, {
        dragTabId: 3,
        dropEffect: 'copy',
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [],
        tabIds: [3]
      });
      assert.strictEqual(browser.tabs.duplicate.callCount, i + 1, 'called');
      assert.isTrue(browser.tabs.duplicate.withArgs(3, {
        index: 1,
        active: false
      }).calledOnce, 'called');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.duplicate.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED, DROP_TARGET, DROP_TARGET_AFTER);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = await func(elm, {
        dragTabId: 2,
        dropEffect: 'copy',
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [],
        tabIds: [2, 3]
      });
      assert.strictEqual(browser.tabs.duplicate.callCount, i + 2, 'called');
      assert.isTrue(browser.tabs.duplicate.withArgs(2, {
        index: 1,
        active: false
      }).calledOnce, 'called');
      assert.isTrue(browser.tabs.duplicate.withArgs(3, {
        index: 1,
        active: false
      }).calledOnce, 'called');
      assert.deepEqual(res, [undefined, undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.duplicate.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const res = await func(elm2, {
        dragTabId: 3,
        dropEffect: 'copy',
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [1],
        tabIds: [3]
      });
      assert.strictEqual(browser.tabs.duplicate.callCount, i + 2, 'called');
      assert.isTrue(browser.tabs.duplicate.withArgs(1, {
        index: 2,
        active: false
      }).calledOnce, 'called');
      assert.isTrue(browser.tabs.duplicate.withArgs(3, {
        index: 2,
        active: false
      }).calledOnce, 'called');
      assert.deepEqual(res, [undefined, undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.duplicate.callCount;
      const j = browser.tabs.move.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.id = PINNED;
      parent.classList.add(PINNED);
      elm.classList.add(TAB, PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent2.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.duplicate.withArgs(4, {
        active: false
      }).resolves({
        id: 7
      });
      browser.tabs.duplicate.withArgs(5, {
        active: false
      }).resolves({
        id: 8
      });
      browser.tabs.duplicate.withArgs(6, {
        active: false
      }).resolves({
        id: 9
      });
      const res = await func(elm2, {
        dragTabId: 4,
        dropEffect: 'copy',
        dragWindowId: browser.windows.WINDOW_ID_CURRENT + 2,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [4, 5],
        tabIds: [6]
      });
      assert.strictEqual(browser.tabs.duplicate.callCount, i + 3, 'called');
      assert.strictEqual(browser.tabs.move.callCount, j + 1, 'called');
      assert.isTrue(browser.tabs.move.withArgs([7, 8, 9], {
        index: 2,
        windowId: browser.windows.WINDOW_ID_CURRENT
      }).calledOnce, 'called');
      assert.deepEqual(res, [null], 'result');
    });
  });

  describe('open dropped URI list', () => {
    const func = mjs.openUriList;
    beforeEach(() => {
      mjs.ports.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
    });

    it('should get empty array', async () => {
      const res = await func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
      browser.tabs.update.resolves({});
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should throw', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
      browser.tabs.update.rejects(new Error('error'));
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      await func(elm, ['https://example.com']).catch(e => {
        assert.instanceOf(e, Error, 'error');
        assert.strictEqual(e.message, 'error', 'message');
        assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
        assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
        assert.strictEqual(browser.tabs.update.callCount, k + 1, 'called');
        assert.isFalse(stubCurrentWin.called, 'not called');
        assert.isFalse(port.postMessage.called, 'not called');
      });
    });

    it('should not call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
      browser.tabs.update.resolves({});
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm, ['foo:bar']);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
      browser.tabs.update.resolves({});
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm, ['https://example.com']);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k + 1, 'called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_BEFORE);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm, [
        'https://example.com',
        'foo:bar',
        'https://www.example.com'
      ]);
      assert.strictEqual(browser.tabs.create.callCount, i + 2, 'called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm, [
        'https://example.com',
        'foo:bar',
        'https://www.example.com'
      ]);
      assert.strictEqual(browser.tabs.create.callCount, i + 2, 'called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      const res = await func(elm, [
        'https://example.com',
        'foo:bar',
        'https://www.example.com'
      ]);
      assert.strictEqual(browser.tabs.create.callCount, i + 2, 'called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const main = document.createElement('div');
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      main.id = SIDEBAR_MAIN;
      main.appendChild(parent);
      body.appendChild(main);
      const res = await func(main, [
        'https://example.com',
        'foo:bar',
        'https://www.example.com'
      ]);
      assert.strictEqual(browser.tabs.create.callCount, i + 2, 'called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [{}], 'result');
    });
  });

  describe('search dropped query', () => {
    const func = mjs.searchQuery;
    beforeEach(() => {
      mjs.ports.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
    });

    it('should get empty array', async () => {
      const res = await func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.search.search.callCount;
      const k = browser.tabs.update.callCount;
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.search.search.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.search.search.withArgs({
        query: 'foo',
        tabId: 1
      }).callCount;
      const k = browser.tabs.update.withArgs(1, {
        active: true
      }).callCount;
      browser.search.search.withArgs({
        query: 'foo',
        tabId: 1
      }).resolves(undefined);
      browser.tabs.update.withArgs(1, {
        active: true
      }).resolves({});
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm, 'foo');
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.search.search.withArgs({
        query: 'foo',
        tabId: 1
      }).callCount, j + 1, 'called');
      assert.strictEqual(browser.tabs.update.withArgs(1, {
        active: true
      }).callCount, k + 1, 'called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.search.search.withArgs({
        query: 'foo',
        tabId: 1
      }).callCount;
      const k = browser.tabs.update.callCount;
      browser.tabs.create.resolves({
        id: 2
      });
      browser.search.search.withArgs({
        query: 'foo',
        tabId: 2
      }).resolves(undefined);
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_BEFORE);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const res = await func(elm, 'foo');
      assert.strictEqual(browser.tabs.create.callCount, i + 1, 'called');
      assert.strictEqual(browser.search.search.withArgs({
        query: 'foo',
        tabId: 2
      }).callCount, j + 1, 'called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.search.search.withArgs({
        query: 'foo',
        tabId: 3
      }).callCount;
      const k = browser.tabs.update.callCount;
      browser.tabs.create.resolves({
        id: 3
      });
      browser.search.search.withArgs({
        query: 'foo',
        tabId: 3
      }).resolves(undefined);
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      body.appendChild(parent);
      const res = await func(elm, 'foo');
      assert.strictEqual(browser.tabs.create.callCount, i + 1, 'called');
      assert.strictEqual(browser.search.search.withArgs({
        query: 'foo',
        tabId: 3
      }).callCount, j + 1, 'called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.search.search.withArgs({
        query: 'foo',
        tabId: 3
      }).callCount;
      const k = browser.tabs.update.callCount;
      browser.tabs.create.resolves({
        id: 3
      });
      browser.search.search.withArgs({
        query: 'foo',
        tabId: 3
      }).resolves(undefined);
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
      const main = document.createElement('div');
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_AFTER);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      main.id = SIDEBAR_MAIN;
      main.appendChild(parent);
      body.appendChild(main);
      const res = await func(main, 'foo');
      assert.strictEqual(browser.tabs.create.callCount, i + 1, 'called');
      assert.strictEqual(browser.search.search.withArgs({
        query: 'foo',
        tabId: 3
      }).callCount, j + 1, 'called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [{}], 'result');
    });
  });

  describe('handle drop', () => {
    const func = mjs.handleDrop;
    beforeEach(() => {
      mjs.ports.clear();
    });
    afterEach(() => {
      mjs.ports.clear();
    });

    it('should throw', () => {
      assert.throws(() => func());
    });

    it('should get undefined', () => {
      const evt = {
        type: 'foo'
      };
      const res = func(evt);
      assert.isUndefined(res, 'result');
    });

    it('should throw', () => {
      const evt = {
        type: 'drop'
      };
      assert.throws(() => func(evt));
    });

    it('should not call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const getData = sinon.stub();
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: []
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: []
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_BEFORE);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: '1'
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: []
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
      browser.tabs.update.resolves({});
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('https://example.com');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'none',
          types: [MIME_URI]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.notCalled, 'not called');
      assert.isTrue(stubCurrentWin.notCalled, 'not called');
      assert.isTrue(port.postMessage.notCalled, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
      browser.tabs.update.resolves({});
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('https://example.com');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'link',
          types: [MIME_URI]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.notCalled, 'not called');
      assert.isTrue(stubCurrentWin.notCalled, 'not called');
      assert.isTrue(port.postMessage.notCalled, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
      browser.tabs.update.resolves({});
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('https://example.com');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_URI]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k + 1, 'called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
      browser.tabs.update.resolves({});
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('https://example.com');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_PLAIN]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k + 1, 'called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
      browser.tabs.update.resolves({});
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI)
        .returns('https://example.com\n# comment\nhttps://www.example.com');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_URI]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i + 2, 'called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.called, 'called');
      assert.isTrue(port.postMessage.called, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_BEFORE);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({}));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_BEFORE);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        foo: 'bar'
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'copy',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_BEFORE);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        foo: 'bar'
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.search.search.withArgs({
        query: 'foo',
        tabId: 1
      }).callCount;
      browser.search.search.withArgs({
        query: 'foo',
        tabId: 1
      }).resolves(undefined);
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('foo');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_PLAIN]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.search.search.withArgs({
        query: 'foo',
        tabId: 1
      }).callCount, j + 1, 'called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(port.postMessage.called, 'not called');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.search.search.withArgs({
        query: 'foo',
        tabId: 1
      }).callCount;
      browser.tabs.create.resolves({
        id: 2
      });
      browser.search.search.withArgs({
        query: 'foo',
        tabId: 2
      }).resolves(undefined);
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
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB, DROP_TARGET, DROP_TARGET_BEFORE);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('foo');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_PLAIN]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i + 1, 'called');
      assert.strictEqual(browser.search.search.withArgs({
        query: 'foo',
        tabId: 2
      }).callCount, j + 1, 'called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const main = document.createElement('div');
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      main.id = SIDEBAR_MAIN;
      main.appendChild(parent);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI)
        .returns('https://example.com\n# comment\nhttps://www.example.com');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: main,
        dataTransfer: {
          getData,
          dropEffect: 'none',
          types: [MIME_URI]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.notCalled, 'not called');
      assert.isTrue(stopPropagation.notCalled, 'not called');
      assert.isTrue(stubCurrentWin.notCalled, 'not called');
      assert.isTrue(port.postMessage.notCalled, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const main = document.createElement('div');
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      main.id = SIDEBAR_MAIN;
      main.appendChild(parent);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI)
        .returns('https://example.com\n# comment\nhttps://www.example.com');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: main,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_URI]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i + 2, 'called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stopPropagation.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const main = document.createElement('div');
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: '1'
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      main.id = SIDEBAR_MAIN;
      main.appendChild(parent);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('https://example.com');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: main,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_PLAIN]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stopPropagation.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.search.search.withArgs({
        query: 'foo',
        tabId: 1
      }).callCount;
      browser.tabs.create.resolves({
        id: 2
      });
      browser.search.search.withArgs({
        query: 'foo',
        tabId: 2
      }).resolves(undefined);
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
      const main = document.createElement('div');
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.appendChild(elm);
      main.id = SIDEBAR_MAIN;
      main.appendChild(parent);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('foo');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        currentTarget: main,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_PLAIN]
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i + 1, 'called');
      assert.strictEqual(browser.search.search.withArgs({
        query: 'foo',
        tabId: 2
      }).callCount, j + 1, 'called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.deepEqual(res, [{}], 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const head = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      head.classList.add(CLASS_HEADING);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(head);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        foo: 'bar'
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      // test params
      const target = elm;
      target.dataset.tab = JSON.stringify({
        pinned: true,
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      target.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
      evt.target = target;
      evt.currentTarget = target;
      evt.shiftKey = false;
      head.hidden = true;
      const spyClass = sinon.spy(target.classList, 'contains');
      const res = await func(evt);
      const { callCount: classCallCount } = spyClass;
      spyClass.restore();
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.strictEqual(classCallCount, 2, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const head = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      head.classList.add(CLASS_HEADING);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(head);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        foo: 'bar'
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      // test params
      const target = elm;
      target.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      target.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
      evt.target = target;
      evt.currentTarget = target;
      evt.shiftKey = true;
      head.hidden = true;
      const spyClass = sinon.spy(target.classList, 'contains');
      const res = await func(evt);
      const { callCount: classCallCount } = spyClass;
      spyClass.restore();
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.strictEqual(classCallCount, 2, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const head = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      head.classList.add(CLASS_HEADING);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(head);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        foo: 'bar'
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      // test params
      const target = elm;
      target.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      target.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
      evt.target = target;
      evt.currentTarget = target;
      evt.shiftKey = false;
      head.hidden = true;
      const spyClass = sinon.spy(target.classList, 'contains');
      const res = await func(evt);
      const { callCount: classCallCount } = spyClass;
      spyClass.restore();
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.strictEqual(classCallCount, 3, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const head = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      head.classList.add(CLASS_HEADING);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(head);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        foo: 'bar'
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      // test params
      const target = elm;
      target.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      target.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
      evt.target = target;
      evt.currentTarget = target;
      evt.shiftKey = false;
      head.hidden = false;
      const spyClass = sinon.spy(target.classList, 'contains');
      const res = await func(evt);
      const { callCount: classCallCount } = spyClass;
      spyClass.restore();
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.strictEqual(classCallCount, 2, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const head = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      head.classList.add(CLASS_HEADING);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(head);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        foo: 'bar'
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      // test params
      const target = elm3;
      target.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      target.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
      evt.target = target;
      evt.currentTarget = target;
      evt.shiftKey = false;
      head.hidden = true;
      const spyClass = sinon.spy(target.classList, 'contains');
      const res = await func(evt);
      const { callCount: classCallCount } = spyClass;
      spyClass.restore();
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.strictEqual(classCallCount, 3, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const k = browser.tabs.update.callCount;
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
      const cnt = document.createElement('div');
      const parent = document.createElement('div');
      const head = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      tmpl.id = CLASS_TAB_CONTAINER_TMPL;
      tmpl.content.appendChild(cnt);
      head.classList.add(CLASS_HEADING);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.appendChild(head);
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent.appendChild(elm3);
      body.appendChild(tmpl);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        foo: 'bar'
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const evt = {
        preventDefault,
        stopPropagation,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'drop'
      };
      // test params
      const target = elm2;
      target.dataset.tab = JSON.stringify({
        pinned: false,
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      target.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
      evt.target = target;
      evt.currentTarget = target;
      evt.shiftKey = false;
      head.hidden = true;
      const spyClass = sinon.spy(target.classList, 'contains');
      const res = await func(evt);
      const { callCount: classCallCount } = spyClass;
      spyClass.restore();
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.strictEqual(browser.tabs.update.callCount, k, 'not called');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(port.postMessage.calledOnce, 'called');
      assert.strictEqual(classCallCount, 2, 'called');
      assert.deepEqual(res, {}, 'result');
    });
  });

  describe('handle dragend', () => {
    const func = mjs.handleDragEnd;

    it('should not remove class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(DROP_TARGET);
      parent.appendChild(elm);
      body.appendChild(parent);
      const evt = {
        target: elm,
        type: 'foo'
      };
      await func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'class');
    });

    it('should remove class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(DROP_TARGET);
      parent.appendChild(elm);
      body.appendChild(parent);
      const evt = {
        target: elm,
        type: 'dragend'
      };
      await func(evt);
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
    });
  });

  describe('handle dragleave', () => {
    const func = mjs.handleDragLeave;

    it('should not remove class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(DROP_TARGET);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const evt = {
        currentTarget: elm,
        type: 'foo'
      };
      await func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'class');
    });

    it('should remove class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(DROP_TARGET);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const evt = {
        currentTarget: elm,
        type: 'dragleave'
      };
      await func(evt);
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
    });

    it('should not remove class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(DROP_TARGET);
      parent.appendChild(elm);
      body.appendChild(parent);
      const evt = {
        currentTarget: elm,
        type: 'dragleave'
      };
      await func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'class');
    });
  });

  describe('handle dragover', () => {
    const func = mjs.handleDragOver;

    it('should not set drop effect', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        pinned: true
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        preventDefault,
        stopPropagation,
        clientY: 40,
        currentTarget: elm,
        dataTransfer: {
          getData,
          types: [MIME_JSON]
        },
        type: 'foo'
      };
      await func(evt);
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.isUndefined(evt.dataTransfer.dropEffect, 'drop effect');
      assert.strictEqual(preventDefault.callCount, i, 'not called');
      assert.strictEqual(stopPropagation.callCount, j, 'not called');
    });

    it('should set drop effect and class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        pinned: true
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        preventDefault,
        stopPropagation,
        clientY: 40,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'none',
          types: [MIME_JSON]
        },
        type: 'dragover'
      };
      await func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'move', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect and class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        pinned: true
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        preventDefault,
        stopPropagation,
        clientY: 20,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'none',
          types: [MIME_JSON]
        },
        type: 'dragover'
      };
      await func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isTrue(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'move', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect and class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        pinned: false
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        preventDefault,
        stopPropagation,
        clientY: 20,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'none',
          types: [MIME_JSON]
        },
        type: 'dragover'
      };
      await func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isTrue(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'move', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect and class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        pinned: true
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        preventDefault,
        stopPropagation,
        clientY: 40,
        ctrlKey: true,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'none',
          types: [MIME_JSON]
        },
        type: 'dragover'
      };
      await func(evt, {
        isMac: false
      });
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'copy', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect and class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        pinned: true
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        preventDefault,
        stopPropagation,
        altKey: true,
        clientY: 40,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'none',
          types: [MIME_JSON]
        },
        type: 'dragover'
      };
      await func(evt, {
        isMac: true
      });
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'copy', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect and class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        pinned: true
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        preventDefault,
        stopPropagation,
        clientY: 20,
        ctrlKey: true,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'none',
          types: [MIME_JSON]
        },
        type: 'dragover'
      };
      await func(evt, {
        isMac: false
      });
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isTrue(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'copy', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect and class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        pinned: true
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        preventDefault,
        stopPropagation,
        altKey: true,
        clientY: 20,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'none',
          types: [MIME_JSON]
        },
        type: 'dragover'
      };
      await func(evt, {
        isMac: true
      });
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isTrue(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'copy', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set drop effect none', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        pinned: false
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        preventDefault,
        stopPropagation,
        clientY: 40,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_JSON]
        },
        type: 'dragover'
      };
      await func(evt);
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'none', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should not set additional class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('foo');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        preventDefault,
        stopPropagation,
        clientY: 30,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_PLAIN]
        },
        type: 'dragover'
      };
      await func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set additional class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('foo');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        preventDefault,
        stopPropagation,
        clientY: 40,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_PLAIN]
        },
        type: 'dragover'
      };
      await func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should set additional class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('foo');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        preventDefault,
        stopPropagation,
        clientY: 20,
        currentTarget: elm,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_PLAIN]
        },
        type: 'dragover'
      };
      await func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isTrue(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });

    it('should prevent default', async () => {
      const main = document.createElement('div');
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      main.id = SIDEBAR_MAIN;
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 10, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      main.appendChild(parent);
      body.appendChild(main);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('foo');
      const preventDefault = sinon.stub();
      const stopPropagation = sinon.stub();
      const i = preventDefault.callCount;
      const j = stopPropagation.callCount;
      const evt = {
        preventDefault,
        stopPropagation,
        clientY: 60,
        currentTarget: main,
        dataTransfer: {
          getData,
          dropEffect: 'move',
          types: [MIME_PLAIN]
        },
        type: 'dragover'
      };
      await func(evt);
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
      assert.strictEqual(stopPropagation.callCount, j + 1, 'called');
    });
  });

  describe('handle dragenter', () => {
    const func = mjs.handleDragEnter;

    it('should not set class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('foo');
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData,
          types: [MIME_PLAIN]
        },
        type: 'foo'
      };
      await func(evt);
      assert.isFalse(getData.called, 'data');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
    });

    it('should set class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('foo');
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData,
          types: [MIME_PLAIN]
        },
        type: 'dragenter'
      };
      await func(evt);
      assert.isTrue(getData.calledThrice, 'data');
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'class');
    });

    it('should set class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns('');
      getData.withArgs(MIME_URI).returns('https://example.com');
      getData.withArgs(MIME_PLAIN).returns('');
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData,
          types: [MIME_URI]
        },
        type: 'dragenter'
      };
      await func(evt);
      assert.isTrue(getData.calledTwice, 'data');
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'class');
    });

    it('should set class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        pinned: true
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData,
          types: [MIME_JSON]
        },
        type: 'dragenter'
      };
      await func(evt);
      assert.isTrue(getData.calledOnce, 'data');
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'class');
    });

    it('should not set class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        pinned: false
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData,
          types: [MIME_JSON]
        },
        type: 'dragenter'
      };
      await func(evt);
      assert.isTrue(getData.calledOnce, 'data');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
    });

    it('should set class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        pinned: false
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData,
          types: [MIME_JSON]
        },
        type: 'dragenter'
      };
      await func(evt);
      assert.isTrue(getData.calledOnce, 'data');
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'class');
    });

    it('should not set class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub();
      getData.withArgs(MIME_JSON).returns(JSON.stringify({
        pinned: true
      }));
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData,
          types: [MIME_JSON]
        },
        type: 'dragenter'
      };
      await func(evt);
      assert.isTrue(getData.calledOnce, 'data');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
    });
  });

  describe('handle dragstart', () => {
    const func = mjs.handleDragStart;

    it('should throw', async () => {
      assert.throws(() => func());
    });

    it('should get undefined', async () => {
      const res = await func({
        type: 'foo'
      });
      assert.isUndefined(res, 'result');
    });

    it('should get empty array', async () => {
      const res = await func({
        type: 'dragstart'
      });
      assert.deepEqual(res, [], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        isMac: false
      };
      let parsedData;
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.highlight.callCount, j, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 1,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: true,
        pinnedTabIds: [1],
        tabIds: []
      }, 'data');
      assert.deepEqual(res, [], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: false
      };
      let parsedData;
      const evt = {
        currentTarget: elm2,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        shiftKey: true,
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 2,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: true,
        pinnedTabIds: [2],
        tabIds: []
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: false
      };
      let parsedData;
      const evt = {
        currentTarget: elm3,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        shiftKey: true,
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.highlight.callCount, j, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 3,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3]
      }, 'data');
      assert.deepEqual(res, [], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: false
      };
      let parsedData;
      const evt = {
        currentTarget: elm4,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i + 1, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 4,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [4]
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.query.resolves([{
        index: 0
      }]);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: false
      };
      let parsedData;
      const evt = {
        ctrlKey: true,
        currentTarget: elm2,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 2,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: true,
        pinnedTabIds: [1, 2],
        tabIds: []
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.query.resolves([{
        index: 2
      }]);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: false
      };
      let parsedData;
      const evt = {
        ctrlKey: true,
        currentTarget: elm4,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 4,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.query.resolves([{
        index: 1
      }]);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: false
      };
      let parsedData;
      const evt = {
        ctrlKey: true,
        currentTarget: elm4,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 4,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [2],
        tabIds: [4]
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.query.resolves([{
        index: 0
      }]);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: true
      };
      let parsedData;
      const evt = {
        altKey: true,
        currentTarget: elm2,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 2,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: true,
        pinnedTabIds: [1, 2],
        tabIds: []
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.query.resolves([{
        index: 2
      }]);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: true
      };
      let parsedData;
      const evt = {
        altKey: true,
        currentTarget: elm4,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 4,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.query.resolves([{
        index: 1
      }]);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: true
      };
      let parsedData;
      const evt = {
        altKey: true,
        currentTarget: elm4,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 4,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: false,
        pinned: false,
        pinnedTabIds: [2],
        tabIds: [4]
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.query.resolves([{
        index: 0
      }]);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: false
      };
      let parsedData;
      const evt = {
        ctrlKey: true,
        shiftKey: true,
        currentTarget: elm2,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 2,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: true,
        pinned: true,
        pinnedTabIds: [1, 2],
        tabIds: []
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.query.resolves([{
        index: 2
      }]);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: false
      };
      let parsedData;
      const evt = {
        ctrlKey: true,
        shiftKey: true,
        currentTarget: elm4,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 4,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: true,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.query.resolves([{
        index: 1
      }]);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: false
      };
      let parsedData;
      const evt = {
        ctrlKey: true,
        shiftKey: true,
        currentTarget: elm4,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 4,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: true,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm2.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.query.resolves([{
        index: 0
      }]);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: true
      };
      let parsedData;
      const evt = {
        metaKey: true,
        shiftKey: true,
        currentTarget: elm2,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 2,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: true,
        pinned: true,
        pinnedTabIds: [1, 2],
        tabIds: []
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.query.resolves([{
        index: 2
      }]);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: true
      };
      let parsedData;
      const evt = {
        metaKey: true,
        shiftKey: true,
        currentTarget: elm4,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 4,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: true,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });

    it('should set value', async () => {
      const i = browser.tabs.update.callCount;
      const j = browser.tabs.highlight.callCount;
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const elm4 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      parent2.classList.add(CLASS_TAB_GROUP);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.classList.add(HIGHLIGHTED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      elm4.classList.add(TAB);
      elm4.dataset.tabId = '4';
      elm4.dataset.tab = JSON.stringify({ url: 'https://example.com' });
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      parent2.appendChild(elm4);
      body.appendChild(parent);
      body.appendChild(parent2);
      browser.tabs.query.resolves([{
        index: 1
      }]);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: true
      };
      let parsedData;
      const evt = {
        metaKey: true,
        shiftKey: true,
        currentTarget: elm4,
        dataTransfer: {
          setData: (type, data) => {
            if (type === MIME_JSON) {
              parsedData = JSON.parse(data);
            }
          },
          effectAllowed: 'uninitialized'
        },
        type: 'dragstart'
      };
      const res = await func(evt, opt);
      assert.strictEqual(browser.tabs.update.callCount, i, 'called');
      assert.strictEqual(browser.tabs.highlight.callCount, j + 1, 'not called');
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'copyMove', 'effect');
      assert.deepEqual(parsedData, {
        beGrouped: false,
        dragTabId: 4,
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        tabGroup: true,
        pinned: false,
        pinnedTabIds: [],
        tabIds: [3, 4]
      }, 'data');
      assert.deepEqual(res, [undefined], 'result');
    });
  });
});
