/**
 * tab-dnd.test.js
 */

import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser, createJsdom } from './mocha/setup.js';
import sinon from 'sinon';
import * as mjs from '../src/mjs/tab-dnd.js';
import {
  CLASS_TAB_CONTAINER, CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_GROUP,
  DROP_TARGET, DROP_TARGET_AFTER, DROP_TARGET_BEFORE,
  HIGHLIGHTED, MIME_PLAIN, MIME_URI, PINNED, TAB
} from '../src/mjs/constant.js';

describe('dnd', () => {
  const globalKeys = ['Node', 'XMLSerializer'];
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
      const res = await func(elm, []);
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
      const res = await func(elm, [], { foo: 'bar' });
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
      const res = await func(elm, [2], {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT
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
      const res = await func(elm3, [1, 4], {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT
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
      const res = await func(elm2, [1, 4], {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT
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
      const res = await func(elm2, [1, 4], {
        dropAfter: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT
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
      const res = await func(elm3, [1, 4], {
        dropAfter: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm3, elm, elm4], 'move');
      assert.isFalse(elm.parentNode === elm3.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm4.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });

    // grouped tab
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
      const res = await func(elm3, [1, 4], {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        isGrouped: true
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
      const res = await func(elm3, [1, 4], {
        dropAfter: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        isGrouped: true
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm3, elm, elm4], 'move');
      assert.isTrue(elm.parentNode === elm3.parentNode, 'parent');
      assert.isTrue(elm4.parentNode === elm3.parentNode, 'parent');
      assert.deepEqual(res, [null], 'result');
    });

    // pinned tab
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
      const res = await func(elm3, [1, 4], {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        isPinned: true
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
      const res = await func(elm3, [1, 4], {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        isPinned: true
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
      const res = await func(elm3, [1, 4], {
        dropBefore: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        isPinned: true
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
      const res = await func(elm3, [1, 4], {
        dropAfter: true,
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        isPinned: true
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
        dragWindowId: browser.windows.WINDOW_ID_NONE
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
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [],
        tabIds: []
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
        dropWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinnedTabIds: [1],
        tabIds: [4]
      }, {
        shiftKey: true
      });
      const items = document.querySelectorAll(`.${TAB}`);
      assert.strictEqual(browser.tabs.move.callCount, i + 2, 'called');
      assert.deepEqual(Array.from(items), [elm2, elm, elm4, elm3], 'move');
      assert.isTrue(elm.parentNode === elm2.parentNode, 'parent');
      assert.isFalse(elm.parentNode === elm4.parentNode, 'parent');
      assert.isTrue(elm4.parentNode === elm3.parentNode, 'parent');
      assert.deepEqual(res, [[null], [null]], 'result');
    });
  });

  describe('handle drop', () => {
    const func = mjs.handleDrop;

    it('should throw', () => {
      assert.throws(() => func());
    });

    it('should get null', () => {
      const evt = {
        type: 'click'
      };
      const res = func(evt);
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubMsg = browser.runtime.sendMessage.resolves({});
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const evt = {
        currentTarget: elm,
        type: 'foo'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(stubMsg.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubMsg = browser.runtime.sendMessage.resolves({});
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      body.appendChild(elm);
      const evt = {
        currentTarget: elm,
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(stubMsg.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubMsg = browser.runtime.sendMessage.resolves({});
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const evt = {
        currentTarget: elm,
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(stubMsg.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubMsg = browser.runtime.sendMessage.resolves({});
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
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('');
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
        },
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(stubMsg.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubMsg = browser.runtime.sendMessage.resolves({});
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
      const getData = sinon.stub();
      getData.withArgs(MIME_URI)
        .returns('https://example.com\n# comment\nhttps://www.example.com');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
        },
        preventDefault,
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i + 2, 'called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(stubMsg.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubMsg = browser.runtime.sendMessage.resolves({});
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
      const getData = sinon.stub();
      getData.withArgs(MIME_URI)
        .returns('https://example.com\n# comment\nhttps://www.example.com');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
        },
        preventDefault,
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i + 2, 'called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(stubMsg.called, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should call function', async () => {
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubMsg = browser.runtime.sendMessage.resolves({});
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
      const getData = sinon.stub();
      getData.withArgs(MIME_URI)
        .returns('https://example.com\n# comment\nhttps://www.example.com');
      getData.withArgs(MIME_PLAIN).returns('');
      const preventDefault = sinon.stub();
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
        },
        preventDefault,
        type: 'drop'
      };
      const res = await func(evt);
      assert.strictEqual(browser.tabs.create.callCount, i + 2, 'called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(stubMsg.calledOnce, 'called');
      assert.deepEqual(res, {}, 'result');
    });

    it('should log error', async () => {
      const stubErr = sinon.stub(console, 'error');
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubMsg = browser.runtime.sendMessage.resolves({});
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
      const getData = sinon.stub();
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns('foo');
      const preventDefault = sinon.stub();
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
        },
        preventDefault,
        type: 'drop'
      };
      const res = await func(evt);
      const { calledOnce: errCalledOnce } = stubErr;
      stubErr.restore();
      assert.isTrue(errCalledOnce, 'error');
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
      assert.isFalse(preventDefault.called, 'not called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(stubMsg.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should not call function', async () => {
      const stubErr = sinon.stub(console, 'error');
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubMsg = browser.runtime.sendMessage.resolves({});
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
      const getData = sinon.stub();
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns(JSON.stringify({}));
      const preventDefault = sinon.stub();
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
        },
        preventDefault,
        type: 'drop'
      };
      const res = await func(evt);
      const { called: errCalled } = stubErr;
      stubErr.restore();
      assert.isFalse(errCalled, 'error not called');
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
      assert.isFalse(preventDefault.called, 'not called');
      assert.isFalse(stubCurrentWin.called, 'not called');
      assert.isFalse(stubMsg.called, 'not called');
      assert.isNull(res, 'result');
    });

    it('should call function', async () => {
      const stubErr = sinon.stub(console, 'error');
      const i = browser.tabs.create.callCount;
      const j = browser.tabs.move.callCount;
      const stubCurrentWin = browser.windows.getCurrent.resolves({
        id: 1,
        incognito: false
      });
      const stubMsg = browser.runtime.sendMessage.resolves({});
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
      const getData = sinon.stub();
      getData.withArgs(MIME_URI).returns('');
      getData.withArgs(MIME_PLAIN).returns(JSON.stringify({
        foo: 'bar'
      }));
      const preventDefault = sinon.stub();
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
        },
        preventDefault,
        shiftKey: true,
        type: 'drop'
      };
      const res = await func(evt);
      const { called: errCalled } = stubErr;
      stubErr.restore();
      assert.isFalse(errCalled, 'error not called');
      assert.strictEqual(browser.tabs.create.callCount, i, 'not called');
      assert.strictEqual(browser.tabs.move.callCount, j, 'not called');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
      assert.isTrue(preventDefault.calledOnce, 'called');
      assert.isTrue(stubCurrentWin.calledOnce, 'called');
      assert.isTrue(stubMsg.calledOnce, 'called');
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
        top: 0, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const preventDefault = sinon.stub();
      const i = preventDefault.callCount;
      const evt = {
        preventDefault,
        clientY: 40,
        currentTarget: elm,
        dataTransfer: {
          getData: sinon.stub().returns(JSON.stringify({
            pinned: true
          })),
          dropEffect: 'uninitialized'
        },
        type: 'foo'
      };
      await func(evt);
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'uninitialized',
        'drop effect');
      assert.strictEqual(preventDefault.callCount, i, 'not called');
    });

    it('should set drop effect', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 0, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const preventDefault = sinon.stub();
      const i = preventDefault.callCount;
      const evt = {
        preventDefault,
        clientY: 40,
        currentTarget: elm,
        dataTransfer: {
          getData: sinon.stub().returns(JSON.stringify({
            pinned: true
          })),
          dropEffect: 'uninitialized'
        },
        type: 'dragover'
      };
      await func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'move', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
    });

    it('should set drop effect', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(PINNED);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 0, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const preventDefault = sinon.stub();
      const i = preventDefault.callCount;
      const evt = {
        preventDefault,
        clientY: 10,
        currentTarget: elm,
        dataTransfer: {
          getData: sinon.stub().returns(JSON.stringify({
            pinned: true
          })),
          dropEffect: 'uninitialized'
        },
        type: 'dragover'
      };
      await func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isTrue(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'move', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
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
      parent.appendChild(elm);
      body.appendChild(parent);
      const preventDefault = sinon.stub();
      const i = preventDefault.callCount;
      const evt = {
        preventDefault,
        currentTarget: elm,
        dataTransfer: {
          getData: sinon.stub().returns(JSON.stringify({
            pinned: false
          })),
          dropEffect: 'uninitialized'
        },
        type: 'dragover'
      };
      await func(evt);
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'none', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
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
      parent.appendChild(elm);
      body.appendChild(parent);
      const preventDefault = sinon.stub();
      const i = preventDefault.callCount;
      const evt = {
        preventDefault,
        currentTarget: elm,
        dataTransfer: {
          getData: sinon.stub().returns('pinned'),
          dropEffect: 'uninitialized'
        },
        type: 'dragover'
      };
      await func(evt);
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'none', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
    });

    it('should set drop effect', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 0, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const preventDefault = sinon.stub();
      const i = preventDefault.callCount;
      const evt = {
        preventDefault,
        clientY: 40,
        currentTarget: elm,
        dataTransfer: {
          getData: sinon.stub().returns('pinned'),
          dropEffect: 'uninitialized'
        },
        type: 'dragover'
      };
      await func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isTrue(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isFalse(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'move', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
    });

    it('should set drop effect', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      elm.getBoundingClientRect = sinon.stub().returns({
        top: 0, left: 0, right: 100, bottom: 50
      });
      parent.appendChild(elm);
      body.appendChild(parent);
      const preventDefault = sinon.stub();
      const i = preventDefault.callCount;
      const evt = {
        preventDefault,
        clientY: 10,
        currentTarget: elm,
        dataTransfer: {
          getData: sinon.stub().returns('pinned'),
          dropEffect: 'uninitialized'
        },
        type: 'dragover'
      };
      await func(evt);
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'target');
      assert.isFalse(elm.classList.contains(DROP_TARGET_AFTER), 'after');
      assert.isTrue(elm.classList.contains(DROP_TARGET_BEFORE), 'before');
      assert.strictEqual(evt.dataTransfer.dropEffect, 'move', 'drop effect');
      assert.strictEqual(preventDefault.callCount, i + 1, 'called');
    });

    it('should not set drop effect', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const preventDefault = sinon.stub();
      const i = preventDefault.callCount;
      const evt = {
        preventDefault,
        currentTarget: elm,
        dataTransfer: {
          getData: sinon.stub().returns(''),
          dropEffect: 'uninitialized'
        },
        type: 'dragover'
      };
      await func(evt);
      assert.strictEqual(evt.dataTransfer.dropEffect, 'uninitialized',
        'drop effect');
      assert.strictEqual(preventDefault.callCount, i, 'not called');
    });

    it('should not set drop effect', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      parent.appendChild(elm);
      body.appendChild(parent);
      const preventDefault = sinon.stub();
      const i = preventDefault.callCount;
      const evt = {
        preventDefault,
        currentTarget: elm,
        dataTransfer: {
          getData: sinon.stub().returns(''),
          dropEffect: 'uninitialized'
        },
        type: 'dragover'
      };
      await func(evt);
      assert.strictEqual(evt.dataTransfer.dropEffect, 'uninitialized',
        'drop effect');
      assert.strictEqual(preventDefault.callCount, i, 'not called');
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
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
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
      const getData = sinon.stub().returns(JSON.stringify({
        pinned: true
      }));
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
        },
        type: 'dragenter'
      };
      await func(evt);
      assert.isTrue(getData.calledOnce, 'data');
      assert.isTrue(elm.classList.contains(DROP_TARGET), 'class');
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
      const getData = sinon.stub().returns(JSON.stringify({
        pinned: false
      }));
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
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
      const getData = sinon.stub().returns(JSON.stringify({
        pinned: false
      }));
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
        },
        type: 'dragenter'
      };
      await func(evt);
      assert.isTrue(getData.calledOnce, 'data');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
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
      const getData = sinon.stub().returns(JSON.stringify({
        pinned: true
      }));
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
        },
        type: 'dragenter'
      };
      await func(evt);
      assert.isTrue(getData.calledOnce, 'data');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
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
      const getData = sinon.stub().returns('pinned');
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
        },
        type: 'dragenter'
      };
      await func(evt);
      assert.isTrue(getData.calledOnce, 'data');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
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
      const getData = sinon.stub().returns('pinned');
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
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
      const getData = sinon.stub().returns('');
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
        },
        type: 'dragenter'
      };
      await func(evt);
      assert.isTrue(getData.calledOnce, 'data');
      assert.isFalse(elm.classList.contains(DROP_TARGET), 'class');
    });

    it('should not set class', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      parent.appendChild(elm);
      body.appendChild(parent);
      const getData = sinon.stub().returns('foo');
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          getData
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

    it('should not set value', async () => {
      const parent = document.createElement('div');
      const elm = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.dataset.tabId = '1';
      parent.appendChild(elm);
      body.appendChild(parent);
      const setData = sinon.stub();
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          setData,
          effectAllowed: 'uninitialized'
        },
        type: 'foo'
      };
      await func(evt);
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'uninitialized',
        'effect');
      assert.isFalse(setData.called, 'data');
    });

    it('should set value', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: false
      };
      let parsedData;
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          setData: (type, data) => {
            parsedData = JSON.parse(data);
          },
          effectAllowed: 'uninitialized'
        },
        ctrlKey: true,
        type: 'dragstart'
      };
      await func(evt, opt);
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'move', 'effect');
      assert.deepEqual(parsedData, {
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinned: true,
        pinnedTabIds: [1],
        tabIds: [3]
      }, 'data');
    });

    it('should set value', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
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
            parsedData = JSON.parse(data);
          },
          effectAllowed: 'uninitialized'
        },
        ctrlKey: true,
        type: 'dragstart'
      };
      await func(evt, opt);
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'move', 'effect');
      assert.deepEqual(parsedData, {
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinned: true,
        pinnedTabIds: [1, 2],
        tabIds: []
      }, 'data');
      assert.isTrue(elm.classList.contains(HIGHLIGHTED), 'class');
      assert.isTrue(elm2.classList.contains(HIGHLIGHTED), 'class');
    });

    it('should set value', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: true
      };
      let parsedData;
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          setData: (type, data) => {
            parsedData = JSON.parse(data);
          },
          effectAllowed: 'uninitialized'
        },
        metaKey: true,
        type: 'dragstart'
      };
      await func(evt, opt);
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'move', 'effect');
      assert.deepEqual(parsedData, {
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinned: true,
        pinnedTabIds: [1, 2],
        tabIds: []
      }, 'data');
      assert.isTrue(elm.classList.contains(HIGHLIGHTED), 'class');
      assert.isTrue(elm2.classList.contains(HIGHLIGHTED), 'class');
    });

    it('should set value', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
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
            parsedData = JSON.parse(data);
          },
          effectAllowed: 'uninitialized'
        },
        ctrlKey: false,
        type: 'dragstart'
      };
      await func(evt, opt);
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'move', 'effect');
      assert.deepEqual(parsedData, {
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinned: true,
        pinnedTabIds: [2]
      }, 'data');
    });

    it('should set value', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.classList.add(HIGHLIGHTED);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
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
            parsedData = JSON.parse(data);
          },
          effectAllowed: 'uninitialized'
        },
        ctrlKey: false,
        type: 'dragstart'
      };
      await func(evt, opt);
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'move', 'effect');
      assert.deepEqual(parsedData, {
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinned: false,
        pinnedTabIds: [1],
        tabIds: [3]
      }, 'data');
    });

    it('should set value', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.classList.add(PINNED);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
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
            parsedData = JSON.parse(data);
          },
          effectAllowed: 'uninitialized'
        },
        ctrlKey: false,
        type: 'dragstart'
      };
      await func(evt, opt);
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'move', 'effect');
      assert.deepEqual(parsedData, {
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinned: true,
        pinnedTabIds: [2]
      }, 'data');
    });

    it('should set value', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
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
            parsedData = JSON.parse(data);
          },
          effectAllowed: 'uninitialized'
        },
        ctrlKey: false,
        type: 'dragstart'
      };
      await func(evt, opt);
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'move', 'effect');
      assert.deepEqual(parsedData, {
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinned: false,
        tabIds: [3]
      }, 'data');
    });

    it('should set value', async () => {
      const parent = document.createElement('div');
      const parent2 = document.createElement('div');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const elm3 = document.createElement('p');
      const body = document.querySelector('body');
      parent.classList.add(CLASS_TAB_CONTAINER);
      parent.classList.add(CLASS_TAB_GROUP);
      parent.classList.add(PINNED);
      parent2.classList.add(CLASS_TAB_CONTAINER);
      elm.classList.add(TAB);
      elm.classList.add(PINNED);
      elm.classList.add(HIGHLIGHTED);
      elm.dataset.tabId = '1';
      elm2.classList.add(TAB);
      elm2.dataset.tabId = '2';
      elm3.classList.add(TAB);
      elm3.dataset.tabId = '3';
      parent.appendChild(elm);
      parent.appendChild(elm2);
      parent2.appendChild(elm3);
      body.appendChild(parent);
      body.appendChild(parent2);
      const opt = {
        windowId: browser.windows.WINDOW_ID_CURRENT,
        isMac: false
      };
      let parsedData;
      const evt = {
        currentTarget: elm,
        dataTransfer: {
          setData: (type, data) => {
            parsedData = JSON.parse(data);
          },
          effectAllowed: 'uninitialized'
        },
        ctrlKey: false,
        type: 'dragstart'
      };
      await func(evt, opt);
      assert.strictEqual(evt.dataTransfer.effectAllowed, 'move', 'effect');
      assert.deepEqual(parsedData, {
        dragWindowId: browser.windows.WINDOW_ID_CURRENT,
        pinned: true,
        pinnedTabIds: [1],
        tabIds: []
      }, 'data');
    });
  });
});
